import { useCallback, useEffect, useState } from "react";
import { RefreshControl, ScrollView, StyleSheet, Text, View } from "react-native";
import { Image } from "expo-image";
import { router } from "expo-router";
import { useTranslation } from "react-i18next";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/context/AuthContext";
import { useParishId } from "@/hooks/useParish";
import { useDateLocale } from "@/lib/dateLocale";
import { useLocalizedField } from "@/lib/localized";
import { Card, SectionTitle, Badge } from "@/components/ui";
import { colors } from "@/theme/colors";
import type { DailyLiturgy, NewsPost, ParishEvent } from "@/types/database";
import { format } from "date-fns";

export default function HomeScreen() {
  const { t, i18n } = useTranslation();
  const dateLocale = useDateLocale();
  const localize = useLocalizedField();
  const { profile } = useAuth();
  const parishId = useParishId();
  const [liturgy, setLiturgy] = useState<DailyLiturgy | null>(null);
  const [nextEvents, setNextEvents] = useState<ParishEvent[]>([]);
  const [news, setNews] = useState<NewsPost[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    const today = new Date().toISOString().slice(0, 10);

    const [{ data: liturgyData }, { data: eventsData }, { data: newsData }] = await Promise.all([
      supabase
        .from("daily_liturgy")
        .select("*")
        .eq("date", today)
        .eq("locale", i18n.language)
        .maybeSingle()
        .then((res) =>
          res.data
            ? res
            : supabase.from("daily_liturgy").select("*").eq("date", today).eq("locale", "pt-BR").maybeSingle(),
        ),
      parishId
        ? supabase
            .from("events")
            .select("*")
            .eq("parish_id", parishId)
            .gte("start_at", new Date().toISOString())
            .order("start_at", { ascending: true })
            .limit(3)
        : Promise.resolve({ data: [] as ParishEvent[] }),
      parishId
        ? supabase
            .from("news_posts")
            .select("*")
            .eq("parish_id", parishId)
            .not("published_at", "is", null)
            .order("published_at", { ascending: false })
            .limit(5)
        : Promise.resolve({ data: [] as NewsPost[] }),
    ]);

    setLiturgy(liturgyData as DailyLiturgy | null);
    setNextEvents((eventsData as ParishEvent[]) ?? []);
    setNews((newsData as NewsPost[]) ?? []);
  }, [parishId, i18n.language]);

  useEffect(() => {
    load();
  }, [load]);

  async function onRefresh() {
    setRefreshing(true);
    await load();
    setRefreshing(false);
  }

  return (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={{ padding: 16, paddingTop: 56 }}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
    >
      <Text style={styles.greeting}>{t("home.greeting", { name: profile?.full_name?.split(" ")[0] ?? t("home.defaultName") })}</Text>
      <Text style={styles.subGreeting}>{t("home.peaceMessage")}</Text>

      <Card style={styles.liturgyCard} onPress={() => router.push("/(tabs)/more/liturgy")}>
        <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
          <Text style={styles.liturgyLabel}>{t("home.todayLiturgy")}</Text>
          {liturgy?.liturgical_color && <Badge label={liturgy.liturgical_color} />}
        </View>
        <Text style={styles.liturgyCelebration}>{liturgy?.celebration ?? t("home.tapForLiturgy")}</Text>
        {liturgy?.gospel_ref && <Text style={styles.liturgyRef}>{t("liturgy.gospel")}: {liturgy.gospel_ref}</Text>}
      </Card>

      <SectionTitle>{t("home.upcomingEvents")}</SectionTitle>
      {nextEvents.length === 0 && <Text style={styles.emptyText}>{t("home.noEvents")}</Text>}
      {nextEvents.map((event) => (
        <Card key={event.id} onPress={() => router.push(`/(tabs)/events/${event.id}`)}>
          <Text style={styles.eventDate}>
            {format(new Date(event.start_at), "EEEE, dd MMMM · HH:mm", { locale: dateLocale })}
          </Text>
          <Text style={styles.eventTitle}>{localize(event, "title")}</Text>
          {event.location && <Text style={styles.eventLocation}>{event.location}</Text>}
        </Card>
      ))}

      <SectionTitle>{t("home.parishNews")}</SectionTitle>
      {news.length === 0 && <Text style={styles.emptyText}>{t("home.noNews")}</Text>}
      {news.map((item) => (
        <Card key={item.id} onPress={() => router.push(`/(tabs)/more/news/${item.id}`)}>
          {item.cover_image_url && (
            <Image source={{ uri: item.cover_image_url }} style={styles.newsImage} contentFit="cover" />
          )}
          <Text style={styles.newsTitle}>{localize(item, "title")}</Text>
          {item.subtitle && <Text style={styles.newsSubtitle}>{localize(item, "subtitle")}</Text>}
        </Card>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background },
  greeting: { fontSize: 24, fontWeight: "700", color: colors.textPrimary },
  subGreeting: { fontSize: 14, color: colors.textSecondary, marginBottom: 20 },
  liturgyCard: { backgroundColor: colors.primary, borderWidth: 0 },
  liturgyLabel: { color: "#fff", fontWeight: "600", opacity: 0.9 },
  liturgyCelebration: { color: "#fff", fontSize: 17, fontWeight: "700", marginTop: 8 },
  liturgyRef: { color: "#fff", opacity: 0.85, marginTop: 4 },
  eventDate: { color: colors.secondary, fontSize: 12, fontWeight: "600", textTransform: "uppercase" },
  eventTitle: { fontSize: 16, fontWeight: "700", color: colors.textPrimary, marginTop: 4 },
  eventLocation: { color: colors.textSecondary, marginTop: 2 },
  newsImage: { width: "100%", height: 140, borderRadius: 10, marginBottom: 10 },
  newsTitle: { fontSize: 16, fontWeight: "700", color: colors.textPrimary },
  newsSubtitle: { color: colors.textSecondary, marginTop: 4 },
  emptyText: { color: colors.textSecondary, marginBottom: 8 },
});
