import { useState } from "react";
import { StyleSheet, Text, TextInput, View } from "react-native";
import { Link, router } from "expo-router";
import { useTranslation } from "react-i18next";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui";
import { LanguagePicker } from "@/components/LanguagePicker";
import { colors } from "@/theme/colors";

export default function LoginScreen() {
  const { t } = useTranslation();
  const { signIn } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit() {
    setError(null);
    setLoading(true);
    const { error } = await signIn(email.trim(), password);
    setLoading(false);
    if (error) {
      setError(error);
      return;
    }
    // "/" decide pra onde ir: tabs, onboarding (sem paróquia) ou platform-admin
    router.replace("/");
  }

  return (
    <View style={styles.container}>
      <View style={styles.languageWrap}>
        <LanguagePicker variant="compact" />
      </View>

      <View style={styles.logoWrap}>
        <Text style={styles.appName}>{t("app.name")}</Text>
        <Text style={styles.tagline}>{t("app.tagline")}</Text>
      </View>

      <TextInput
        style={styles.input}
        placeholder={t("auth.email")}
        autoCapitalize="none"
        keyboardType="email-address"
        value={email}
        onChangeText={setEmail}
      />
      <TextInput
        style={styles.input}
        placeholder={t("auth.password")}
        secureTextEntry
        value={password}
        onChangeText={setPassword}
      />

      {error && <Text style={styles.error}>{error}</Text>}

      <Button title={t("auth.signIn")} onPress={handleSubmit} loading={loading} disabled={!email || !password} />

      <Link href="/(auth)/register" style={styles.link}>
        <Text style={styles.linkText}>{t("auth.noAccount")}</Text>
      </Link>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.primary,
    padding: 24,
    justifyContent: "center",
  },
  languageWrap: { position: "absolute", top: 56, right: 20 },
  logoWrap: { alignItems: "center", marginBottom: 40 },
  appName: { fontSize: 28, fontWeight: "700", color: "#fff" },
  tagline: { fontSize: 14, color: "#fff", opacity: 0.85, marginTop: 6, textAlign: "center" },
  input: {
    backgroundColor: "#fff",
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    marginBottom: 12,
    fontSize: 15,
  },
  error: { color: "#FFD6D6", marginBottom: 12, textAlign: "center" },
  link: { marginTop: 20, alignSelf: "center" },
  linkText: { color: "#fff", textDecorationLine: "underline" },
});
