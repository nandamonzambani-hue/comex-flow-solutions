import { useEffect, useState } from "react";
import { FlatList, StyleSheet, Text } from "react-native";
import { router } from "expo-router";
import { format } from "date-fns";
import { useTranslation } from "react-i18next";
import { supabase } from "@/lib/supabase";
import { useVisibleParishIds } from "@/hooks/useParish";
import { useDateLocale } from "@/lib/dateLocale";
import { useLocalizedField } from "@/lib/localized";
import { Card, EmptyState, ScreenContainer } from "@/components/ui";
import { colors } from "@/theme/colors";
import type { ParishEvent } from "@/types/database";

export default function EventsListScreen() {
  const { t } = useTranslation();
  const dateLocale = useDateLocale();
  const localize = useLocalizedField();
  const parishIds = useVisibleParishIds();
  const [events, setEvents] = useState<ParishEvent[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (parishIds.length === 0) return;
    supabase
      .from("events")
      .select("*")
      .in("parish_id", parishIds)
      .gte("start_at", new Date(Date.now() - 86400000).toISOString())
      .order("start_at", { ascending: true })
      .then(({ data }) => {
        setEvents((data as ParishEvent[]) ?? []);
        setLoading(false);
      });
  }, [parishIds]);

  return (
    <ScreenContainer>
      <FlatList
        data={events}
        keyExtractor={(item) => item.id}
        ListEmptyComponent={!loading ? <EmptyState message={t("events.empty")} /> : null}
        renderItem={({ item }) => (
          <Card onPress={() => router.push(`/(tabs)/events/${item.id}`)}>
            <Text style={styles.date}>
              {format(new Date(item.start_at), "EEEE, dd MMMM · HH:mm", { locale: dateLocale })}
            </Text>
            <Text style={styles.title}>{localize(item, "title")}</Text>
            {item.location && <Text style={styles.location}>{item.location}</Text>}
            {item.requires_registration && <Text style={styles.tag}>{t("events.registrationRequired")}</Text>}
          </Card>
        )}
      />
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  date: { color: colors.secondary, fontSize: 12, fontWeight: "600", textTransform: "uppercase" },
  title: { fontSize: 16, fontWeight: "700", color: colors.textPrimary, marginTop: 4 },
  location: { color: colors.textSecondary, marginTop: 2 },
  tag: { color: colors.primary, marginTop: 6, fontSize: 12, fontWeight: "600" },
});
