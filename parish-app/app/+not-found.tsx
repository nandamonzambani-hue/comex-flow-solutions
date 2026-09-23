import { StyleSheet, Text, View } from "react-native";
import { Link } from "expo-router";
import { useTranslation } from "react-i18next";
import { colors } from "@/theme/colors";

export default function NotFoundScreen() {
  const { t } = useTranslation();
  return (
    <View style={styles.container}>
      <Text style={styles.title}>{t("common.notFound")}</Text>
      <Link href="/(tabs)" style={styles.link}>
        {t("common.backHome")}
      </Link>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: colors.background, gap: 12 },
  title: { fontSize: 18, fontWeight: "700", color: colors.textPrimary },
  link: { color: colors.primary, textDecorationLine: "underline" },
});
