import { useEffect, useState } from "react";
import { FlatList, StyleSheet, Text } from "react-native";
import { router } from "expo-router";
import { format } from "date-fns";
import { useTranslation } from "react-i18next";
import { supabase } from "@/lib/supabase";
import { useDateLocale } from "@/lib/dateLocale";
import { Card, EmptyState, ScreenContainer } from "@/components/ui";
import { colors } from "@/theme/colors";
import type { CommunityEvent } from "@/types/database";

export default function EventsListScreen() {
  const { t } = useTranslation();
  const dateLocale = useDateLocale();
  const [events, setEvents] = useState<CommunityEvent[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase
      .from("events")
      .select("*")
      .gte("start_at", new Date(Date.now() - 86400000).toISOString())
      .order("start_at", { ascending: true })
      .then(({ data }) => {
        setEvents((data as CommunityEvent[]) ?? []);
        setLoading(false);
      });
  }, []);

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
            <Text style={styles.title}>{item.title}</Text>
            {item.city && <Text style={styles.location}>{item.location ? `${item.location} — ` : ""}{item.city}</Text>}
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
