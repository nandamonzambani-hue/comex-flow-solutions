import 'dart:io' show Platform;

import 'package:flutter/foundation.dart';

/// Configuração lida em tempo de build:
/// flutter run --dart-define-from-file=env.json
class AppConfig {
  static const appName = 'Movimenta';
  static const supabaseUrl = String.fromEnvironment('SUPABASE_URL');
  static const supabaseAnonKey = String.fromEnvironment('SUPABASE_ANON_KEY');
  static const siteUrl = String.fromEnvironment('SITE_URL', defaultValue: 'https://movimenta.com.br');

  static bool get isConfigured => supabaseUrl.isNotEmpty && supabaseAnonKey.isNotEmpty;

  /// As regras da App Store (3.1.1) exigem compra dentro do app para conteúdo digital,
  /// salvo exceções. Por isso, no iOS o app NÃO mostra link de compra: a assinatura é
  /// feita no site e o app apenas libera o acesso (modelo "multiplataforma", 3.1.3(b)).
  /// No Android, confira as regras vigentes do Google Play antes de ativar.
  static bool get showExternalPurchaseLink {
    if (kIsWeb) return true;
    if (Platform.isIOS) return false;
    return const bool.fromEnvironment('ANDROID_EXTERNAL_PURCHASE', defaultValue: false);
  }
}
