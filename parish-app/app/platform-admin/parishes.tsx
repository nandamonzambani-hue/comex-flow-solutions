import { useCallback, useState } from "react";
import { FlatList, StyleSheet, Text, View } from "react-native";
import { router, useFocusEffect } from "expo-router";
import { useTranslation } from "react-i18next";
import { supabase } from "@/lib/supabase";
import { Badge, Card, EmptyState, ScreenContainer } from "@/components/ui";
import { colors } from "@/theme/colors";
import type { Parish, ParishStatus } from "@/types/database";

const STATUS_TONE: Record<ParishStatus, "default" | "success" | "warning"> = {
  pending_approval: "warning",
  trial: "warning",
  active: "success",
  past_due: "warning",
  suspended: "default",
  cancelled: "default",
};

const FILTERS: (ParishStatus | "all")[] = ["all", "pending_approval", "trial", "active", "past_due", "suspended", "cancelled"];

export default function PlatformAdminParishesScreen() {
  const { t } = useTranslation();
  const [filter, setFilter] = useState<ParishStatus | "all">("pending_approval");
  const [parishes, setParishes] = useState<Parish[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    let query = supabase.from("parishes").select("*").order("created_by", { ascending: false });
    if (filter !== "all") query = query.eq("status", filter);
    const { data } = await query;
    setParishes((data as Parish[]) ?? []);
    setLoading(false);
  }, [filter]);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load]),
  );

  return (
    <ScreenContainer style={{ padding: 0 }}>
      <View style={styles.filterRow}>
        <FlatList
          horizontal
          showsHorizontalScrollIndicator={false}
          data={FILTERS}
          keyExtractor={(item) => item}
          contentContainerStyle={{ paddingHorizontal: 16, gap: 8 }}
          renderItem={({ item }) => (
            <Text
              style={[styles.filterChip, filter === item && styles.filterChipActive]}
              onPress={() => setFilter(item)}
            >
              {t(item === "all" ? "platformAdmin.parishes.filterAll" : `parishStatusLabel.${item}`)}
            </Text>
          )}
        />
      </View>

      <FlatList
        contentContainerStyle={{ padding: 16 }}
        data={parishes}
        keyExtractor={(item) => item.id}
        ListEmptyComponent={!loading ? <EmptyState message={t("platformAdmin.parishes.empty")} /> : null}
        renderItem={({ item }) => (
          <Card onPress={() => router.push(`/platform-admin/parish/${item.id}`)}>
            <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start" }}>
              <View style={{ flex: 1 }}>
                <Text style={styles.name}>{item.name}</Text>
                {item.city && (
                  <Text style={styles.city}>
                    {item.city}
                    {item.state ? ` - ${item.state}` : ""}
                  </Text>
                )}
              </View>
              <Badge label={t(`parishStatusLabel.${item.status}`)} tone={STATUS_TONE[item.status]} />
            </View>
          </Card>
        )}
      />
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  filterRow: { paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: colors.border },
  filterChip: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 8,
    color: colors.textSecondary,
    fontWeight: "600",
    fontSize: 13,
  },
  filterChipActive: { backgroundColor: colors.primary, color: "#fff", borderColor: colors.primary },
  name: { fontSize: 16, fontWeight: "700", color: colors.textPrimary },
  city: { color: colors.textSecondary, marginTop: 2 },
});
