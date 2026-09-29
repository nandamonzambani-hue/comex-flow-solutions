# Movimenta — app (Flutter)

```bash
cp env.example.json env.json      # Supabase + chaves públicas do RevenueCat
flutter pub get
flutter run --dart-define-from-file=env.json
```

Firebase (push, analytics, crashlytics) é opcional no desenvolvimento. Para ativar:

```bash
dart pub global activate flutterfire_cli
flutterfire configure   # gera lib/firebase_options.dart e os arquivos nativos
```

Compras (App Store / Google Play) usam o RevenueCat: sem `REVENUECAT_APPLE_KEY` /
`REVENUECAT_GOOGLE_KEY` o app funciona, mas a tela de assinatura avisa que as compras
estão indisponíveis. Para testar compras no Android, instale pelo teste interno do Play
Console; no iPhone, use uma conta sandbox. Veja o README principal.

Builds de loja:

```bash
flutter build appbundle --dart-define-from-file=env.json   # Google Play
flutter build ipa --dart-define-from-file=env.json         # App Store (em um Mac)
```

Veja o README na pasta `movimenta/` para a configuração completa.
