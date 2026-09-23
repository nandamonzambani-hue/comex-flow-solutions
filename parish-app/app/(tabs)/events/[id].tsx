import { useCallback, useEffect, useState } from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { useLocalSearchParams } from "expo-router";
import { format } from "date-fns";
import { useTranslation } from "react-i18next";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/context/AuthContext";
import { useDateLocale } from "@/lib/dateLocale";
import { useLocalizedField } from "@/lib/localized";
import { Button, Card } from "@/components/ui";
import { colors } from "@/theme/colors";
import type { ParishEvent } from "@/types/database";

export default function EventDetailScreen() {
  const { t } = useTranslation();
  const dateLocale = useDateLocale();
  const localize = useLocalizedField();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { profile } = useAuth();
  const [event, setEvent] = useState<ParishEvent | null>(null);
  const [registered, setRegistered] = useState(false);
  const [registeredCount, setRegisteredCount] = useState(0);
  const [busy, setBusy] = useState(false);

  const load = useCallback(async () => {
    const { data: eventData } = await supabase.from("events").select("*").eq("id", id).single();
    setEvent(eventData as ParishEvent);

    const { count } = await supabase
      .from("event_registrations")
      .select("*", { count: "exact", head: true })
      .eq("event_id", id)
      .eq("status", "confirmed");
    setRegisteredCount(count ?? 0);

    if (profile) {
      const { data: myReg } = await supabase
        .from("event_registrations")
        .select("id")
        .eq("event_id", id)
        .eq("profile_id", profile.id)
        .eq("status", "confirmed")
        .maybeSingle();
      setRegistered(!!myReg);
    }
  }, [id, profile]);

  useEffect(() => {
    load();
  }, [load]);

  async function toggleRegistration() {
    if (!profile || !event) return;
    setBusy(true);
    if (registered) {
      await supabase.from("event_registrations").delete().eq("event_id", event.id).eq("profile_id", profile.id);
    } else {
      await supabase.from("event_registrations").insert({ event_id: event.id, profile_id: profile.id });
    }
    await load();
    setBusy(false);
  }

  if (!event) return null;

  const full = event.capacity != null && registeredCount >= event.capacity && !registered;

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.date}>
        {format(new Date(event.start_at), "EEEE, dd MMMM yyyy · HH:mm", { locale: dateLocale })}
      </Text>
      <Text style={styles.title}>{localize(event, "title")}</Text>
      {event.location && <Text style={styles.location}>📍 {event.location}</Text>}
      {event.description && <Text style={styles.description}>{localize(event, "description")}</Text>}

      {event.capacity != null && (
        <Card>
          <Text style={styles.capacityText}>
            {t("events.spotsFilled", { count: registeredCount, total: event.capacity })}
          </Text>
        </Card>
      )}

      {event.requires_registration && (
        <View style={{ marginTop: 16 }}>
          <Button
            title={registered ? t("events.cancelRegistration") : full ? t("events.full") : t("events.register")}
            onPress={toggleRegistration}
            loading={busy}
            disabled={full && !registered}
            variant={registered ? "outline" : "primary"}
          />
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 20, backgroundColor: colors.background, flexGrow: 1 },
  date: { color: colors.secondary, fontWeight: "600", textTransform: "uppercase", fontSize: 12 },
  title: { fontSize: 24, fontWeight: "700", color: colors.textPrimary, marginTop: 6 },
  location: { color: colors.textSecondary, marginTop: 8, fontSize: 15 },
  description: { color: colors.textPrimary, marginTop: 16, fontSize: 15, lineHeight: 22 },
  capacityText: { color: colors.textPrimary, fontWeight: "600" },
});
