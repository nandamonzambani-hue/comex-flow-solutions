import 'package:flutter/material.dart';
import 'package:intl/date_symbol_data_local.dart';
import 'package:supabase_flutter/supabase_flutter.dart';

import 'app_state.dart';
import 'demo/demo_api.dart';
import 'main.dart' show MovimentaApp;
import 'services/api.dart';
import 'services/purchases_service.dart';

/// Modo demonstração (dados fictícios, sem backend):
///   flutter run -d chrome -t lib/main_demo.dart
///   flutter build web -t lib/main_demo.dart
/// Parâmetros na URL: ?assinante=0 (plano gratuito), ?logado=0 (tela de login),
/// ?onboarding=1 (primeiro acesso).
Future<void> main() async {
  WidgetsFlutterBinding.ensureInitialized();
  await initializeDateFormatting('pt_BR');
  // Cliente sem servidor real: só para as telas que leem Supabase.instance não quebrarem.
  await Supabase.initialize(url: 'https://demo.invalid', publishableKey: 'demo');

  final params = Uri.base.queryParameters;
  final subscriber = params['assinante'] != '0';
  Api.instance = DemoApi(subscriber: subscriber);
  PurchasesService.demoPackages = demoPackages();
  AppState.instance = DemoAppState(
    demoLoggedIn: params['logado'] != '0',
    onboardingDone: params['onboarding'] != '1',
    subscriber: subscriber,
  );
  runApp(MovimentaApp(state: AppState.instance));
}
