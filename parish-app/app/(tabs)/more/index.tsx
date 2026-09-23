import { Pressable, StyleSheet, Text, View } from "react-native";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useAuth } from "@/context/AuthContext";
import { ScreenContainer } from "@/components/ui";
import { colors } from "@/theme/colors";

const MENU_ITEMS = [
  { icon: "play-circle", label: "Vídeos e Textos", href: "/(tabs)/more/media" },
  { icon: "download", label: "Downloads", href: "/(tabs)/more/downloads" },
  { icon: "newspaper", label: "Notícias", href: "/(tabs)/more/news" },
  { icon: "book", label: "Bíblia", href: "/(tabs)/more/bible" },
  { icon: "sunny", label: "Liturgia Diária", href: "/(tabs)/more/liturgy" },
  { icon: "person-circle", label: "Meu Perfil", href: "/(tabs)/more/profile" },
] as const;

export default function MoreScreen() {
  const { isStaff, signOut } = useAuth();

  return (
    <ScreenContainer>
      <View style={styles.grid}>
        {MENU_ITEMS.map((item) => (
          <Pressable key={item.label} style={styles.item} onPress={() => router.push(item.href as never)}>
            <Ionicons name={item.icon as never} size={30} color={colors.primary} />
            <Text style={styles.itemLabel}>{item.label}</Text>
          </Pressable>
        ))}
        {isStaff && (
          <Pressable style={styles.item} onPress={() => router.push("/admin")}>
            <Ionicons name="settings" size={30} color={colors.primary} />
            <Text style={styles.itemLabel}>Administração</Text>
          </Pressable>
        )}
      </View>

      <Text style={styles.logout} onPress={signOut}>
        Sair da conta
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
