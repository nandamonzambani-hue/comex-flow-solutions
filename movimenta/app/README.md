# Movimenta — app (Flutter)

```bash
cp env.example.json env.json      # preencha SUPABASE_URL e SUPABASE_ANON_KEY
flutter pub get
flutter run --dart-define-from-file=env.json
```

Firebase (push, analytics, crashlytics) é opcional no desenvolvimento. Para ativar:

```bash
dart pub global activate flutterfire_cli
flutterfire configure   # gera lib/firebase_options.dart e os arquivos nativos
```

Builds de loja:

```bash
flutter build appbundle --dart-define-from-file=env.json   # Google Play
flutter build ipa --dart-define-from-file=env.json         # App Store (em um Mac)
```

Veja o README na pasta `movimenta/` para a configuração completa.
