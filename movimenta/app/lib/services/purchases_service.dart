import 'dart:async';
import 'dart:io' show Platform;

import 'package:flutter/foundation.dart';
import 'package:flutter/services.dart';
import 'package:purchases_flutter/purchases_flutter.dart';
import 'package:supabase_flutter/supabase_flutter.dart';

import '../config.dart';

enum PurchaseOutcome { success, cancelled, pending, notEntitled }

/// Compras dentro do app (App Store e Google Play) via RevenueCat.
/// A aluna é identificada no RevenueCat pelo mesmo id do Supabase; depois de cada
/// compra a Edge Function `revenuecat-sync` grava a assinatura no banco, que é
/// quem libera o conteúdo (RLS e vídeos).
class PurchasesService {
  static bool enabled = false;
  static void Function()? onChanged;
  static Timer? _debounce;

  /// Planos fictícios para o modo demonstração (sem loja).
  static List<Package>? demoPackages;

  static String get _apiKey {
    if (kIsWeb) return '';
    if (Platform.isIOS) return AppConfig.revenueCatAppleKey;
    if (Platform.isAndroid) return AppConfig.revenueCatGoogleKey;
    return '';
  }

  static Future<void> init({String? userId}) async {
    final key = _apiKey;
    if (key.isEmpty) {
      debugPrint('RevenueCat desativado: configure REVENUECAT_APPLE_KEY / REVENUECAT_GOOGLE_KEY');
      return;
    }
    try {
      if (kDebugMode) await Purchases.setLogLevel(LogLevel.debug);
      await Purchases.configure(PurchasesConfiguration(key)..appUserID = userId);
      enabled = true;
      // Renovações, reembolsos e compras feitas em outro aparelho chegam por aqui.
      Purchases.addCustomerInfoUpdateListener((_) {
        _debounce?.cancel();
        _debounce = Timer(const Duration(seconds: 2), () async {
          await syncWithServer();
          onChanged?.call();
        });
      });
    } catch (e) {
      debugPrint('Falha ao iniciar RevenueCat: $e');
    }
  }

  static Future<void> identify(String userId) async {
    if (!enabled) return;
    try {
      final current = await Purchases.appUserID;
      if (current != userId) await Purchases.logIn(userId);
    } catch (e) {
      debugPrint('RevenueCat logIn: $e');
    }
  }

  static Future<void> reset() async {
    if (!enabled) return;
    try {
      if (!await Purchases.isAnonymous) await Purchases.logOut();
    } catch (e) {
      debugPrint('RevenueCat logOut: $e');
    }
  }

  /// Planos configurados na oferta "atual" do RevenueCat (mensal, anual...).
  static Future<List<Package>> packages() async {
    if (demoPackages != null) return demoPackages!;
    if (!enabled) return const [];
    final offerings = await Purchases.getOfferings();
    final list = [...?offerings.current?.availablePackages];
    const order = [
      PackageType.annual,
      PackageType.sixMonth,
      PackageType.threeMonth,
      PackageType.monthly,
      PackageType.weekly,
    ];
    list.sort((a, b) {
      int rank(Package p) {
        final i = order.indexOf(p.packageType);
        return i < 0 ? order.length : i;
      }

      return rank(a).compareTo(rank(b));
    });
    return list;
  }

  static Future<PurchaseOutcome> buy(Package package) async {
    try {
      final result = await Purchases.purchase(PurchaseParams.package(package));
      await syncWithServer();
      return _hasEntitlement(result.customerInfo) ? PurchaseOutcome.success : PurchaseOutcome.pending;
    } on PlatformException catch (e) {
      final code = PurchasesErrorHelper.getErrorCode(e);
      if (code == PurchasesErrorCode.purchaseCancelledError) return PurchaseOutcome.cancelled;
      if (code == PurchasesErrorCode.paymentPendingError) return PurchaseOutcome.pending;
      rethrow;
    }
  }

  static Future<PurchaseOutcome> restore() async {
    final info = await Purchases.restorePurchases();
    await syncWithServer();
    return _hasEntitlement(info) ? PurchaseOutcome.success : PurchaseOutcome.notEntitled;
  }

  static bool _hasEntitlement(CustomerInfo info) =>
      info.entitlements.active.containsKey(AppConfig.revenueCatEntitlement);

  /// Pede ao servidor para buscar o estado da assinatura no RevenueCat e gravar no banco.
  static Future<void> syncWithServer() async {
    if (Supabase.instance.client.auth.currentUser == null) return;
    try {
      await Supabase.instance.client.functions.invoke('revenuecat-sync');
    } catch (e) {
      // O webhook do RevenueCat também atualiza o banco; isto só acelera.
      debugPrint('revenuecat-sync falhou: $e');
    }
  }

  static String errorMessage(Object e) {
    if (e is PlatformException) {
      switch (PurchasesErrorHelper.getErrorCode(e)) {
        case PurchasesErrorCode.purchaseNotAllowedError:
          return 'Compras não estão permitidas neste aparelho.';
        case PurchasesErrorCode.productAlreadyPurchasedError:
          return 'Você já tem esta assinatura. Toque em "Restaurar compras".';
        case PurchasesErrorCode.networkError:
          return 'Sem conexão. Tente novamente.';
        case PurchasesErrorCode.storeProblemError:
          return 'A loja está com instabilidade. Tente em alguns minutos.';
        default:
          return e.message ?? 'Não foi possível concluir a compra.';
      }
    }
    return 'Não foi possível concluir a compra.';
  }
}
