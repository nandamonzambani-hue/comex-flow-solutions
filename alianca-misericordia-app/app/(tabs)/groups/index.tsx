import { useEffect, useMemo, useState } from "react";
import { SectionList, StyleSheet, Text } from "react-native";
import { router } from "expo-router";
import { useTranslation } from "react-i18next";
import { supabase } from "@/lib/supabase";
import { Card, EmptyState, ScreenContainer } from "@/components/ui";
import { colors } from "@/theme/colors";
import type { Group, GroupType } from "@/types/database";

export default function GroupsListScreen() {
  const { t } = useTranslation();
  const [groups, setGroups] = useState<Group[]>([]);
  const [loading, setLoading] = useState(true);

  const TYPE_LABELS: Record<GroupType, string> = {
    celula: t("groups.types.celula"),
    coordenacao: t("groups.types.coordenacao"),
    evento_local: t("groups.types.evento_local"),
    other: t("groups.types.other"),
  };

  useEffect(() => {
    supabase
      .from("groups")
      .select("*")
      .eq("is_active", true)
      .order("name")
      .then(({ data }) => {
        setGroups((data as Group[]) ?? []);
        setLoading(false);
      });
  }, []);

  const sections = useMemo(() => {
    const byType = new Map<GroupType, Group[]>();
    for (const group of groups) {
      if (!byType.has(group.type)) byType.set(group.type, []);
      byType.get(group.type)!.push(group);
    }
    return Array.from(byType.entries()).map(([type, data]) => ({ title: TYPE_LABELS[type], data }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [groups]);

  return (
    <ScreenContainer style={{ padding: 0 }}>
      <SectionList
        contentContainerStyle={{ padding: 16 }}
        sections={sections}
        keyExtractor={(item) => item.id}
        ListEmptyComponent={!loading ? <EmptyState message={t("groups.empty")} /> : null}
        renderSectionHeader={({ section }) => <Text style={styles.sectionHeader}>{section.title}</Text>}
        renderItem={({ item }) => (
          <Card onPress={() => router.push(`/(tabs)/groups/${item.id}`)}>
            <Text style={styles.name}>{item.name}</Text>
            {item.city && <Text style={styles.city}>{item.city}</Text>}
            {item.description && (
              <Text style={styles.description} numberOfLines={2}>
                {item.description}
              </Text>
            )}
            {item.meeting_schedule && <Text style={styles.schedule}>🗓 {item.meeting_schedule}</Text>}
          </Card>
        )}
      />
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  sectionHeader: {
    fontSize: 13,
    fontWeight: "700",
    color: colors.textSecondary,
    textTransform: "uppercase",
    marginTop: 16,
    marginBottom: 8,
  },
  name: { fontSize: 16, fontWeight: "700", color: colors.textPrimary },
  city: { color: colors.textSecondary, fontSize: 13, marginTop: 2 },
  description: { color: colors.textSecondary, marginTop: 4 },
  schedule: { color: colors.primary, marginTop: 6, fontSize: 13, fontWeight: "600" },
});
