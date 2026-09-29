import 'dart:io' show Platform;

import 'package:firebase_analytics/firebase_analytics.dart';
import 'package:firebase_core/firebase_core.dart';
import 'package:firebase_crashlytics/firebase_crashlytics.dart';
import 'package:firebase_messaging/firebase_messaging.dart';
import 'package:flutter/foundation.dart';
import 'package:supabase_flutter/supabase_flutter.dart';

import '../firebase_options.dart';

/// Firebase é opcional: se ainda não foi configurado (flutterfire configure),
/// o app funciona normalmente, apenas sem push, analytics e crashlytics.
class FirebaseServices {
  static bool enabled = false;

  static Future<void> init() async {
    try {
      await Firebase.initializeApp(options: DefaultFirebaseOptions.currentPlatform);
      enabled = true;
    } catch (e) {
      debugPrint('Firebase desativado: $e');
      return;
    }
    FlutterError.onError = FirebaseCrashlytics.instance.recordFlutterFatalError;
    PlatformDispatcher.instance.onError = (error, stack) {
      FirebaseCrashlytics.instance.recordError(error, stack, fatal: true);
      return true;
    };
  }

  static Future<void> logEvent(String name, [Map<String, Object>? params]) async {
    if (!enabled) return;
    await FirebaseAnalytics.instance.logEvent(name: name, parameters: params);
  }

  static Future<void> setUser(String? userId) async {
    if (!enabled) return;
    await FirebaseAnalytics.instance.setUserId(id: userId);
    await FirebaseCrashlytics.instance.setUserIdentifier(userId ?? '');
  }

  /// Pede permissão, registra o token no Supabase e inscreve no tópico "todas".
  static Future<void> registerForPush({required void Function(String link) onOpenLink}) async {
    if (!enabled) return;
    final messaging = FirebaseMessaging.instance;
    final settings = await messaging.requestPermission();
    if (settings.authorizationStatus == AuthorizationStatus.denied) return;

    Future<void> save(String? token) async {
      final uid = Supabase.instance.client.auth.currentUser?.id;
      if (token == null || uid == null) return;
      await Supabase.instance.client.from('devices').upsert({
        'token': token,
        'user_id': uid,
        'platform': Platform.isIOS ? 'ios' : 'android',
        'updated_at': DateTime.now().toIso8601String(),
      });
    }

    await save(await messaging.getToken());
    messaging.onTokenRefresh.listen(save);
    await messaging.subscribeToTopic('todas');

    void handle(RemoteMessage m) {
      final link = m.data['link'] as String?;
      if (link != null && link.startsWith('/')) onOpenLink(link);
    }

    FirebaseMessaging.onMessageOpenedApp.listen(handle);
    final initial = await messaging.getInitialMessage();
    if (initial != null) handle(initial);
  }

  static Future<void> unregisterPush() async {
    if (!enabled) return;
    final messaging = FirebaseMessaging.instance;
    final token = await messaging.getToken();
    await messaging.unsubscribeFromTopic('todas');
    if (token != null) {
      await Supabase.instance.client.from('devices').delete().eq('token', token);
    }
  }
}
