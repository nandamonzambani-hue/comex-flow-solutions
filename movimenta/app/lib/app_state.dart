import 'dart:async';

import 'package:flutter/foundation.dart';
import 'package:supabase_flutter/supabase_flutter.dart';

import 'models/models.dart';
import 'services/api.dart';
import 'services/firebase_services.dart';
import 'services/purchases_service.dart';

/// Estado global mínimo: sessão, perfil e assinatura da aluna.
/// O roteador escuta este objeto para decidir entre login, onboarding e app.
class AppState extends ChangeNotifier {
  AppState() {
    _sub = Supabase.instance.client.auth.onAuthStateChange.listen((event) {
      if (event.event == AuthChangeEvent.signedOut) {
        profile = null;
        subscription = Subscription.none;
        notifyListeners();
        FirebaseServices.setUser(null);
        PurchasesService.reset();
      } else if (event.event == AuthChangeEvent.signedIn || event.event == AuthChangeEvent.initialSession) {
        final uid = event.session?.user.id;
        if (uid != null) PurchasesService.identify(uid);
        refresh();
      }
    });
    PurchasesService.onChanged = refresh;
  }

  static late AppState instance;

  late final StreamSubscription<AuthState> _sub;
  Profile? profile;
  Subscription subscription = Subscription.none;
  bool loadingProfile = false;

  bool get loggedIn => Supabase.instance.client.auth.currentSession != null;
  bool get isSubscriber => subscription.isActive;

  Future<void> refresh() async {
    if (!loggedIn) return;
    loadingProfile = true;
    notifyListeners();
    try {
      final results = await Future.wait([Api.instance.myProfile(), Api.instance.mySubscription()]);
      profile = results[0] as Profile?;
      subscription = results[1] as Subscription;
      FirebaseServices.setUser(profile?.id);
    } catch (e) {
      debugPrint('Falha ao carregar perfil: $e');
    } finally {
      loadingProfile = false;
      notifyListeners();
    }
  }

  @override
  void dispose() {
    _sub.cancel();
    super.dispose();
  }
}
