import { useCallback, useEffect, useState } from "react";
import { RefreshControl, ScrollView, StyleSheet, Text, View } from "react-native";
import { Image } from "expo-image";
import { router } from "expo-router";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/context/AuthContext";
import { useParishId } from "@/hooks/useParish";
import { Card, SectionTitle, Badge } from "@/components/ui";
import { colors } from "@/theme/colors";
import type { DailyLiturgy, NewsPost, ParishEvent } from "@/types/database";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

export default function HomeScreen() {
  const { profile } = useAuth();
  const parishId = useParishId();
  const [liturgy, setLiturgy] = useState<DailyLiturgy | null>(null);
  const [nextEvents, setNextEvents] = useState<ParishEvent[]>([]);
  const [news, setNews] = useState<NewsPost[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    const today = new Date().toISOString().slice(0, 10);

    const [{ data: liturgyData }, { data: eventsData }, { data: newsData }] = await Promise.all([
      supabase.from("daily_liturgy").select("*").eq("date", today).maybeSingle(),
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
  }, [parishId]);

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
      <Text style={styles.greeting}>Olá, {profile?.full_name?.split(" ")[0] ?? "irmão(ã)"} 👋</Text>
      <Text style={styles.subGreeting}>Que a paz esteja com você hoje.</Text>

      <Card style={styles.liturgyCard} onPress={() => router.push("/(tabs)/more/liturgy")}>
        <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
          <Text style={styles.liturgyLabel}>Liturgia de hoje</Text>
          {liturgy?.liturgical_color && <Badge label={liturgy.liturgical_color} />}
        </View>
        <Text style={styles.liturgyCelebration}>{liturgy?.celebration ?? "Toque para ver a liturgia diária"}</Text>
        {liturgy?.gospel_ref && <Text style={styles.liturgyRef}>Evangelho: {liturgy.gospel_ref}</Text>}
      </Card>

      <SectionTitle>Próximos eventos</SectionTitle>
      {nextEvents.length === 0 && <Text style={styles.emptyText}>Nenhum evento agendado no momento.</Text>}
      {nextEvents.map((event) => (
        <Card key={event.id} onPress={() => router.push(`/(tabs)/events/${event.id}`)}>
          <Text style={styles.eventDate}>
            {format(new Date(event.start_at), "EEEE, dd 'de' MMMM · HH:mm", { locale: ptBR })}
          </Text>
          <Text style={styles.eventTitle}>{event.title}</Text>
          {event.location && <Text style={styles.eventLocation}>{event.location}</Text>}
        </Card>
      ))}

      <SectionTitle>Notícias da paróquia</SectionTitle>
      {news.length === 0 && <Text style={styles.emptyText}>Nenhuma notícia publicada ainda.</Text>}
      {news.map((item) => (
        <Card key={item.id} onPress={() => router.push(`/(tabs)/more/news/${item.id}`)}>
          {item.cover_image_url && (
            <Image source={{ uri: item.cover_image_url }} style={styles.newsImage} contentFit="cover" />
          )}
          <Text style={styles.newsTitle}>{item.title}</Text>
          {item.subtitle && <Text style={styles.newsSubtitle}>{item.subtitle}</Text>}
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
