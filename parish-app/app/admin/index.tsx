import { Pressable, StyleSheet, Text, View } from "react-native";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { ScreenContainer } from "@/components/ui";
import { colors } from "@/theme/colors";

const ITEMS = [
  { icon: "people", label: "Membros", href: "/admin/members" },
  { icon: "cash", label: "Financeiro", href: "/admin/finance" },
  { icon: "newspaper", label: "Conteúdo e Notícias", href: "/admin/content" },
  { icon: "notifications", label: "Notificações Push", href: "/admin/notifications" },
  { icon: "sunny", label: "Liturgia Diária", href: "/admin/liturgy-editor" },
] as const;

export default function AdminHomeScreen() {
  return (
    <ScreenContainer>
      <View style={styles.grid}>
        {ITEMS.map((item) => (
          <Pressable key={item.label} style={styles.item} onPress={() => router.push(item.href)}>
            <Ionicons name={item.icon as never} size={28} color={colors.primary} />
            <Text style={styles.itemLabel}>{item.label}</Text>
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
