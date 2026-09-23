import { useEffect, useState } from "react";
import { FlatList, StyleSheet, Text } from "react-native";
import { router } from "expo-router";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { supabase } from "@/lib/supabase";
import { useParishId } from "@/hooks/useParish";
import { Card, EmptyState, ScreenContainer } from "@/components/ui";
import { colors } from "@/theme/colors";
import type { ParishEvent } from "@/types/database";

export default function EventsListScreen() {
  const parishId = useParishId();
  const [events, setEvents] = useState<ParishEvent[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!parishId) return;
    supabase
      .from("events")
      .select("*")
      .eq("parish_id", parishId)
      .gte("start_at", new Date(Date.now() - 86400000).toISOString())
      .order("start_at", { ascending: true })
      .then(({ data }) => {
        setEvents((data as ParishEvent[]) ?? []);
        setLoading(false);
      });
  }, [parishId]);

  return (
    <ScreenContainer>
      <FlatList
        data={events}
        keyExtractor={(item) => item.id}
        ListEmptyComponent={!loading ? <EmptyState message="Nenhum evento futuro cadastrado." /> : null}
        renderItem={({ item }) => (
          <Card onPress={() => router.push(`/(tabs)/events/${item.id}`)}>
            <Text style={styles.date}>
              {format(new Date(item.start_at), "EEEE, dd 'de' MMMM · HH:mm", { locale: ptBR })}
            </Text>
            <Text style={styles.title}>{item.title}</Text>
            {item.location && <Text style={styles.location}>{item.location}</Text>}
            {item.requires_registration && <Text style={styles.tag}>Inscrição necessária</Text>}
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
