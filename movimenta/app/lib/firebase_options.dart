// ARQUIVO PROVISÓRIO.
// Gere o definitivo com:  dart pub global activate flutterfire_cli && flutterfire configure
// Enquanto isso, o app roda sem Firebase (push, analytics e crashlytics desligados).
import 'package:firebase_core/firebase_core.dart' show FirebaseOptions;

class DefaultFirebaseOptions {
  static FirebaseOptions get currentPlatform =>
      throw UnsupportedError('Firebase ainda não configurado. Rode "flutterfire configure".');
}
