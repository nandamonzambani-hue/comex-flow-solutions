import 'package:flutter/material.dart';
import 'package:flutter_localizations/flutter_localizations.dart';
import 'package:go_router/go_router.dart';
import 'package:intl/date_symbol_data_local.dart';
import 'package:supabase_flutter/supabase_flutter.dart';

import 'app_state.dart';
import 'config.dart';
import 'router.dart';
import 'services/firebase_services.dart';
import 'theme.dart';

Future<void> main() async {
  WidgetsFlutterBinding.ensureInitialized();
  await initializeDateFormatting('pt_BR');

  if (!AppConfig.isConfigured) {
    runApp(const _NotConfiguredApp());
    return;
  }

  await FirebaseServices.init();
  await Supabase.initialize(url: AppConfig.supabaseUrl, publishableKey: AppConfig.supabaseAnonKey);

  AppState.instance = AppState();
  runApp(MovimentaApp(state: AppState.instance));
}

class MovimentaApp extends StatefulWidget {
  const MovimentaApp({super.key, required this.state});
  final AppState state;

  @override
  State<MovimentaApp> createState() => _MovimentaAppState();
}

class _MovimentaAppState extends State<MovimentaApp> {
  late final GoRouter _router = buildRouter(widget.state);
  bool _pushRegistered = false;

  @override
  void initState() {
    super.initState();
    widget.state.addListener(_onStateChange);
  }

  void _onStateChange() {
    // Pede permissão de notificação só depois do onboarding, quando faz sentido para a aluna.
    final profile = widget.state.profile;
    if (!_pushRegistered && profile != null && profile.onboardingDone) {
      _pushRegistered = true;
      FirebaseServices.registerForPush(onOpenLink: _router.push);
    }
    if (!widget.state.loggedIn) _pushRegistered = false;
  }

  @override
  void dispose() {
    widget.state.removeListener(_onStateChange);
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return MaterialApp.router(
      title: AppConfig.appName,
      debugShowCheckedModeBanner: false,
      theme: buildTheme(),
      routerConfig: _router,
      locale: const Locale('pt', 'BR'),
      supportedLocales: const [Locale('pt', 'BR')],
      localizationsDelegates: GlobalMaterialLocalizations.delegates,
    );
  }
}

class _NotConfiguredApp extends StatelessWidget {
  const _NotConfiguredApp();

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      theme: buildTheme(),
      home: const Scaffold(
        body: Center(
          child: Padding(
            padding: EdgeInsets.all(32),
            child: Text(
              'Configure SUPABASE_URL e SUPABASE_ANON_KEY:\n\n'
              'flutter run --dart-define-from-file=env.json',
              textAlign: TextAlign.center,
            ),
          ),
        ),
      ),
    );
  }
}
