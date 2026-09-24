import { StyleSheet, Text, View } from "react-native";
import { router } from "expo-router";
import { useTranslation } from "react-i18next";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui";
import { colors } from "@/theme/colors";

export default function OnboardingScreen() {
  const { t } = useTranslation();
  const { profile, isPlatformAdmin, signOut } = useAuth();

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{t("onboarding.greeting", { name: profile?.full_name?.split(" ")[0] ?? "" })}</Text>
      <Text style={styles.subtitle}>{t("onboarding.subtitle")}</Text>

      <View style={{ gap: 12, marginTop: 24 }}>
        <Button title={t("onboarding.findParish")} onPress={() => router.push("/(auth)/search-parish")} />
        <Button
          title={t("onboarding.registerParish")}
          variant="secondary"
          onPress={() => router.push("/(auth)/create-parish")}
        />
        {isPlatformAdmin && (
          <Button
            title={t("onboarding.goToPlatformAdmin")}
            variant="outline"
            onPress={() => router.push("/platform-admin")}
          />
        )}
      </View>

      <Text style={styles.logout} onPress={signOut}>
        {t("profile.signOut")}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background, padding: 24, justifyContent: "center" },
  title: { fontSize: 24, fontWeight: "700", color: colors.textPrimary },
  subtitle: { fontSize: 14, color: colors.textSecondary, marginTop: 8, lineHeight: 20 },
  logout: { textAlign: "center", color: colors.danger, marginTop: 32, fontWeight: "600" },
});
