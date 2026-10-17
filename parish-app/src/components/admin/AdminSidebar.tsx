import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { router, usePathname } from "expo-router";
import { Image } from "expo-image";
import { Ionicons } from "@expo/vector-icons";
import { useTranslation } from "react-i18next";
import { useAuth } from "@/context/AuthContext";
import { useParishContext, useTheme } from "@/context/ParishContext";
import { ADMIN_NAV } from "@/lib/adminNav";
import { ParishScopePicker } from "@/components/admin/ParishScopePicker";
import { colors } from "@/theme/colors";

/** Barra lateral do painel em telas largas (tablet / navegador). */
export function AdminSidebar() {
  const { t } = useTranslation();
  const theme = useTheme();
  const pathname = usePathname();
  const { profile } = useAuth();
  const { parish } = useParishContext();
  const isAdmin = profile?.role === "admin" || profile?.role === "pastor";

  return (
    <View style={styles.sidebar}>
      <View style={[styles.brand, { backgroundColor: theme.primary }]}>
        {parish?.logo_url ? (
          <Image source={{ uri: parish.logo_url }} style={styles.logo} contentFit="contain" />
        ) : (
          <Text style={styles.cross}>✝</Text>
        )}
        <View style={{ flex: 1 }}>
          <Text style={styles.brandTitle} numberOfLines={2}>
            {parish?.name ?? "Minha Paróquia"}
          </Text>
          <Text style={styles.brandSubtitle}>{t("admin.title")}</Text>
        </View>
      </View>

      <View style={styles.scope}>
        <ParishScopePicker />
      </View>

      <ScrollView contentContainerStyle={{ paddingBottom: 24 }}>
        {ADMIN_NAV.map((section) => {
          const items = section.items.filter((i) => !i.adminOnly || isAdmin);
          if (items.length === 0) return null;
          return (
            <View key={section.key} style={styles.section}>
              <Text style={styles.sectionTitle}>{t(section.key)}</Text>
              {items.map((item) => {
                const active = item.href === "/admin" ? pathname === "/admin" : pathname.startsWith(item.href);
                return (
                  <Pressable
                    key={item.href}
                    onPress={() => router.navigate(item.href as never)}
                    style={[styles.item, active && { backgroundColor: `${theme.primary}14` }]}
                  >
                    <Ionicons name={item.icon as never} size={18} color={active ? theme.primary : colors.textSecondary} />
                    <Text style={[styles.itemLabel, active && { color: theme.primary, fontWeight: "700" }]}>{t(item.key)}</Text>
                  </Pressable>
                );
              })}
            </View>
          );
        })}

        <View style={styles.section}>
          <Pressable style={styles.item} onPress={() => router.navigate("/(tabs)" as never)}>
            <Ionicons name="phone-portrait" size={18} color={colors.textSecondary} />
            <Text style={styles.itemLabel}>{t("admin.nav.backToApp")}</Text>
          </Pressable>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  sidebar: { width: 264, backgroundColor: colors.surface, borderRightWidth: 1, borderRightColor: colors.border },
  brand: { flexDirection: "row", alignItems: "center", gap: 10, padding: 16, paddingTop: 20 },
  logo: { width: 36, height: 36 },
  cross: { color: "#fff", fontSize: 26, width: 36, textAlign: "center" },
  brandTitle: { color: "#fff", fontWeight: "700", fontSize: 14 },
  brandSubtitle: { color: "#ffffffcc", fontSize: 12 },
  scope: { padding: 12, borderBottomWidth: 1, borderBottomColor: colors.border },
  section: { paddingHorizontal: 8, paddingTop: 14 },
  sectionTitle: {
    fontSize: 11,
    fontWeight: "700",
    color: colors.textSecondary,
    textTransform: "uppercase",
    letterSpacing: 0.6,
    paddingHorizontal: 10,
    marginBottom: 4,
  },
  item: { flexDirection: "row", alignItems: "center", gap: 10, paddingVertical: 9, paddingHorizontal: 10, borderRadius: 8 },
  itemLabel: { color: colors.textPrimary, fontSize: 14 },
});
