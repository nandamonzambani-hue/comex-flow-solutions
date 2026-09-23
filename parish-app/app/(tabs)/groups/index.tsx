import { useEffect, useMemo, useState } from "react";
import { SectionList, StyleSheet, Text } from "react-native";
import { router } from "expo-router";
import { useTranslation } from "react-i18next";
import { supabase } from "@/lib/supabase";
import { useParishId } from "@/hooks/useParish";
import { useLocalizedField } from "@/lib/localized";
import { Card, EmptyState, ScreenContainer } from "@/components/ui";
import { colors } from "@/theme/colors";
import type { Group, GroupType } from "@/types/database";

export default function GroupsListScreen() {
  const { t } = useTranslation();
  const localize = useLocalizedField();
  const parishId = useParishId();
  const [groups, setGroups] = useState<Group[]>([]);
  const [loading, setLoading] = useState(true);

  const TYPE_LABELS: Record<GroupType, string> = {
    pastoral: t("groups.types.pastoral"),
    movement: t("groups.types.movement"),
    ministry: t("groups.types.ministry"),
    choir: t("groups.types.choir"),
    catechesis: t("groups.types.catechesis"),
    news: t("groups.types.news"),
    other: t("groups.types.other"),
  };

  useEffect(() => {
    if (!parishId) return;
    supabase
      .from("groups")
      .select("*")
      .eq("parish_id", parishId)
      .eq("is_active", true)
      .order("name")
      .then(({ data }) => {
        setGroups((data as Group[]) ?? []);
        setLoading(false);
      });
  }, [parishId]);

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
            <Text style={styles.name}>{localize(item, "name")}</Text>
            {item.description && (
              <Text style={styles.description} numberOfLines={2}>
                {localize(item, "description")}
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
  description: { color: colors.textSecondary, marginTop: 4 },
  schedule: { color: colors.primary, marginTop: 6, fontSize: 13, fontWeight: "600" },
});
