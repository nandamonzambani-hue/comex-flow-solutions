import { useCallback, useEffect, useState } from "react";
import { FlatList, RefreshControl, StyleSheet, Text, View } from "react-native";
import { router } from "expo-router";
import { useTranslation } from "react-i18next";
import { supabase } from "@/lib/supabase";
import { useVisibleParishIds } from "@/hooks/useParish";
import { Badge, Card, EmptyState, ScreenContainer } from "@/components/ui";
import { ParishOriginBadge } from "@/components/ParishOriginBadge";
import { colors } from "@/theme/colors";
import type { ParishForm } from "@/types/database";

export default function FormsListScreen() {
  const { t } = useTranslation();
  const parishIds = useVisibleParishIds();
  const [forms, setForms] = useState<ParishForm[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    if (parishIds.length === 0) return;
    const { data } = await supabase
      .from("forms")
      .select("*")
      .in("parish_id", parishIds)
      .eq("is_published", true)
      .order("created_at", { ascending: false });
    setForms((data as ParishForm[]) ?? []);
  }, [parishIds]);

  useEffect(() => {
    load();
  }, [load]);

  const now = Date.now();

  return (
    <ScreenContainer>
      <FlatList
        data={forms}
        keyExtractor={(item) => item.id}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={async () => {
              setRefreshing(true);
              await load();
              setRefreshing(false);
            }}
          />
        }
        ListEmptyComponent={<EmptyState message={t("forms.empty")} />}
        renderItem={({ item }) => {
          const closed =
            (item.closes_at && new Date(item.closes_at).getTime() < now) ||
            (item.opens_at && new Date(item.opens_at).getTime() > now);
          return (
            <Card onPress={closed ? undefined : () => router.push(`/(tabs)/more/forms/${item.id}` as never)}>
              <View style={styles.badges}>
                {item.is_quiz && <Badge label={t("forms.quizBadge")} />}
                <ParishOriginBadge parishId={item.parish_id} />
                {closed && <Badge label={t("forms.closed")} tone="warning" />}
              </View>
              <Text style={styles.title}>{item.title}</Text>
              {item.description && <Text style={styles.description}>{item.description}</Text>}
            </Card>
          );
        }}
      />
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  badges: { flexDirection: "row", gap: 6, flexWrap: "wrap", marginBottom: 6 },
  title: { fontSize: 16, fontWeight: "700", color: colors.textPrimary },
  description: { color: colors.textSecondary, marginTop: 4 },
});
