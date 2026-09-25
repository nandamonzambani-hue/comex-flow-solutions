import { Pressable, StyleSheet, Text, View } from "react-native";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useTranslation } from "react-i18next";
import { useAuth } from "@/context/AuthContext";
import { ScreenContainer } from "@/components/ui";
import { colors } from "@/theme/colors";

const MENU_ITEMS = [
  { icon: "play-circle", key: "media.title", href: "/(tabs)/more/media" },
  { icon: "download", key: "downloads.title", href: "/(tabs)/more/downloads" },
  { icon: "newspaper", key: "news.title", href: "/(tabs)/more/news" },
  { icon: "book", key: "bible.title", href: "/(tabs)/more/bible" },
  { icon: "sunny", key: "liturgy.title", href: "/(tabs)/more/liturgy" },
  { icon: "help-circle", key: "quiz.title", href: "/(tabs)/more/quiz" },
  { icon: "person-circle", key: "profile.title", href: "/(tabs)/more/profile" },
] as const;

export default function MoreScreen() {
  const { t } = useTranslation();
  const { isStaff, isPlatformAdmin, signOut } = useAuth();

  return (
    <ScreenContainer>
      <View style={styles.grid}>
        {MENU_ITEMS.map((item) => (
          <Pressable key={item.key} style={styles.item} onPress={() => router.push(item.href as never)}>
            <Ionicons name={item.icon as never} size={30} color={colors.primary} />
            <Text style={styles.itemLabel}>{t(item.key)}</Text>
          </Pressable>
        ))}
        {isStaff && (
          <Pressable style={styles.item} onPress={() => router.push("/admin")}>
            <Ionicons name="settings" size={30} color={colors.primary} />
            <Text style={styles.itemLabel}>{t("admin.title")}</Text>
          </Pressable>
        )}
        {isPlatformAdmin && (
          <Pressable style={styles.item} onPress={() => router.push("/platform-admin")}>
            <Ionicons name="server" size={30} color={colors.primary} />
            <Text style={styles.itemLabel}>{t("platformAdmin.title")}</Text>
          </Pressable>
        )}
      </View>

      <Text style={styles.logout} onPress={signOut}>
        {t("profile.signOut")}
      </Text>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  grid: { flexDirection: "row", flexWrap: "wrap", gap: 12, marginTop: 8 },
  item: {
    width: "47%",
    backgroundColor: colors.surface,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.border,
    paddingVertical: 24,
    alignItems: "center",
    gap: 10,
  },
  itemLabel: { fontWeight: "600", color: colors.textPrimary, textAlign: "center" },
  logout: { textAlign: "center", color: colors.danger, marginTop: 32, fontWeight: "600" },
});
