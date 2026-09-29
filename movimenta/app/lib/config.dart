/// Configuração lida em tempo de build:
/// flutter run --dart-define-from-file=env.json
class AppConfig {
  static const appName = 'Movimenta';
  static const supabaseUrl = String.fromEnvironment('SUPABASE_URL');
  static const supabaseAnonKey = String.fromEnvironment('SUPABASE_ANON_KEY');
  static const siteUrl = String.fromEnvironment('SITE_URL', defaultValue: 'https://movimenta.com.br');

  /// Chaves PÚBLICAS do RevenueCat (Project settings → API keys): appl_... e goog_...
  static const revenueCatAppleKey = String.fromEnvironment('REVENUECAT_APPLE_KEY');
  static const revenueCatGoogleKey = String.fromEnvironment('REVENUECAT_GOOGLE_KEY');
  static const revenueCatEntitlement = String.fromEnvironment('REVENUECAT_ENTITLEMENT', defaultValue: 'premium');

  /// Identificador do app no Google Play (usado no link "gerenciar assinatura").
  static const androidPackage = 'br.com.movimenta.movimenta';

  static String get privacyUrl => '$siteUrl/privacidade';

  /// Termos de uso exigidos pela Apple para assinaturas: por padrão, o EULA padrão da Apple.
  static const termsUrl = String.fromEnvironment(
    'TERMS_URL',
    defaultValue: 'https://www.apple.com/legal/internet-services/itunes/dev/stdeula/',
  );

  static bool get isConfigured => supabaseUrl.isNotEmpty && supabaseAnonKey.isNotEmpty;
}
