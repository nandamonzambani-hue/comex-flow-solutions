import { useEffect, useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useTranslation } from "react-i18next";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/context/AuthContext";
import { Card, ScreenContainer, SectionTitle } from "@/components/ui";
import { colors } from "@/theme/colors";

export default function PlatformAdminHomeScreen() {
  const { t } = useTranslation();
  const { signOut } = useAuth();
  const [counts, setCounts] = useState({ pending: 0, active: 0, trial: 0, total: 0 });

  useEffect(() => {
    supabase
      .from("parishes")
      .select("status")
      .then(({ data }) => {
        const rows = data ?? [];
        setCounts({
          pending: rows.filter((r) => r.status === "pending_approval").length,
          active: rows.filter((r) => r.status === "active").length,
          trial: rows.filter((r) => r.status === "trial").length,
          total: rows.length,
        });
      });
  }, []);

  return (
    <ScreenContainer>
      <SectionTitle>{t("platformAdmin.overview")}</SectionTitle>
      <View style={styles.statsRow}>
        <Card style={styles.statCard}>
          <Text style={styles.statValue}>{counts.pending}</Text>
          <Text style={styles.statLabel}>{t("platformAdmin.stats.pending")}</Text>
        </Card>
        <Card style={styles.statCard}>
          <Text style={styles.statValue}>{counts.trial}</Text>
          <Text style={styles.statLabel}>{t("platformAdmin.stats.trial")}</Text>
        </Card>
        <Card style={styles.statCard}>
          <Text style={styles.statValue}>{counts.active}</Text>
          <Text style={styles.statLabel}>{t("platformAdmin.stats.active")}</Text>
        </Card>
      </View>

      <SectionTitle>{t("platformAdmin.management")}</SectionTitle>
      <Pressable style={styles.menuItem} onPress={() => router.push("/platform-admin/parishes")}>
        <Ionicons name="business" size={22} color={colors.primary} />
        <Text style={styles.menuLabel}>{t("platformAdmin.parishes.title")}</Text>
        <Ionicons name="chevron-forward" size={18} color={colors.textSecondary} />
      </Pressable>
      <Pressable style={styles.menuItem} onPress={() => router.push("/platform-admin/plans")}>
        <Ionicons name="pricetags" size={22} color={colors.primary} />
        <Text style={styles.menuLabel}>{t("platformAdmin.plans.title")}</Text>
        <Ionicons name="chevron-forward" size={18} color={colors.textSecondary} />
      </Pressable>

      <Text style={styles.logout} onPress={signOut}>
        {t("profile.signOut")}
      </Text>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  statsRow: { flexDirection: "row", gap: 10 },
  statCard: { flex: 1, alignItems: "center" },
  statValue: { fontSize: 26, fontWeight: "700", color: colors.primary },
  statLabel: { fontSize: 12, color: colors.textSecondary, marginTop: 4, textTransform: "uppercase", fontWeight: "600" },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    padding: 16,
    marginBottom: 10,
  },
  menuLabel: { flex: 1, fontWeight: "600", color: colors.textPrimary },
  logout: { textAlign: "center", color: colors.danger, marginTop: 24, fontWeight: "600" },
});
