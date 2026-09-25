import { Pressable, StyleSheet, Text, View } from "react-native";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useTranslation } from "react-i18next";
import { ScreenContainer } from "@/components/ui";
import { colors } from "@/theme/colors";

const ITEMS = [
  { icon: "people", key: "admin.members.title", href: "/admin/members" },
  { icon: "play-circle", key: "admin.content.title", href: "/admin/content" },
  { icon: "help-circle", key: "admin.quizzes.title", href: "/admin/quizzes" },
  { icon: "notifications", key: "admin.notifications.title", href: "/admin/notifications" },
] as const;

export default function AdminHomeScreen() {
  const { t } = useTranslation();
  return (
    <ScreenContainer>
      <View style={styles.grid}>
        {ITEMS.map((item) => (
          <Pressable key={item.key} style={styles.item} onPress={() => router.push(item.href)}>
            <Ionicons name={item.icon as never} size={28} color={colors.primary} />
            <Text style={styles.itemLabel}>{t(item.key)}</Text>
          </Pressable>
        ))}
      </View>
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
});
