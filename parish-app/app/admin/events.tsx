import { useCallback, useEffect, useState } from "react";
import { Alert, FlatList, Pressable, StyleSheet, Switch, Text, TextInput, View } from "react-native";
import { useTranslation } from "react-i18next";
import { supabase } from "@/lib/supabase";
import { useParishId } from "@/hooks/useParish";
import { useDateLocale } from "@/lib/dateLocale";
import { Button, Card, EmptyState, ScreenContainer } from "@/components/ui";
import { colors } from "@/theme/colors";
import type { ParishEvent } from "@/types/database";
import { format } from "date-fns";

const CATEGORIES = ["geral", "missa", "encontro", "retiro", "festa", "catequese"] as const;

function emptyForm() {
  return {
    id: null as string | null,
    title: "",
    description: "",
    location: "",
    category: "geral" as (typeof CATEGORIES)[number],
    date: "",
    time: "",
    endTime: "",
    capacity: "",
    requiresRegistration: false,
  };
}

export default function AdminEventsScreen() {
  const { t } = useTranslation();
  const dateLocale = useDateLocale();
  const parishId = useParishId();
  const [events, setEvents] = useState<ParishEvent[]>([]);
  const [form, setForm] = useState(emptyForm());
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    if (!parishId) return;
    const { data } = await supabase
      .from("events")
      .select("*")
      .eq("parish_id", parishId)
      .order("start_at", { ascending: false });
    setEvents((data as ParishEvent[]) ?? []);
  }, [parishId]);

  useEffect(() => {
    load();
  }, [load]);

  function editEvent(event: ParishEvent) {
    const start = new Date(event.start_at);
    const end = event.end_at ? new Date(event.end_at) : null;
    setForm({
      id: event.id,
      title: event.title,
      description: event.description ?? "",
      location: event.location ?? "",
      category: (event.category as (typeof CATEGORIES)[number]) ?? "geral",
      date: format(start, "yyyy-MM-dd"),
      time: format(start, "HH:mm"),
      endTime: end ? format(end, "HH:mm") : "",
      capacity: event.capacity ? String(event.capacity) : "",
      requiresRegistration: event.requires_registration,
    });
  }

  async function handleDelete(event: ParishEvent) {
    Alert.alert(t("admin.events.deleteTitle"), t("admin.events.deleteConfirm", { title: event.title }), [
      { text: t("common.cancel"), style: "cancel" },
      {
        text: t("common.delete"),
        style: "destructive",
        onPress: async () => {
          await supabase.from("events").delete().eq("id", event.id);
          if (form.id === event.id) setForm(emptyForm());
          load();
        },
      },
    ]);
  }

  function parseDateTime(date: string, time: string): string | null {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(date) || !/^\d{2}:\d{2}$/.test(time)) return null;
    const iso = new Date(`${date}T${time}:00`);
    return Number.isNaN(iso.getTime()) ? null : iso.toISOString();
  }

  async function handleSave() {
    if (!parishId || !form.title.trim()) return;
    const startAt = parseDateTime(form.date, form.time);
    if (!startAt) {
      Alert.alert(t("common.error"), t("admin.events.invalidDateTime"));
      return;
    }
    const endAt = form.endTime ? parseDateTime(form.date, form.endTime) : null;

    setSaving(true);
    const payload = {
      parish_id: parishId,
      title: form.title.trim(),
      description: form.description.trim() || null,
      location: form.location.trim() || null,
      category: form.category,
      start_at: startAt,
      end_at: endAt,
      capacity: form.capacity ? Number(form.capacity) : null,
      requires_registration: form.requiresRegistration,
    };

    const { error } = form.id
      ? await supabase.from("events").update(payload).eq("id", form.id)
      : await supabase.from("events").insert(payload);

    setSaving(false);
    if (error) {
      Alert.alert(t("common.error"), error.message);
      return;
    }
    setForm(emptyForm());
    load();
  }

  return (
    <ScreenContainer>
      <FlatList
        data={events}
        keyExtractor={(item) => item.id}
        ListEmptyComponent={<EmptyState message={t("admin.events.empty")} />}
        ListHeaderComponent={
          <Card style={styles.formCard}>
            <Text style={styles.formTitle}>
              {form.id ? t("admin.events.editEvent") : t("admin.events.newEvent")}
            </Text>

            <TextInput
              style={styles.input}
              placeholder={t("admin.events.titlePlaceholder")}
              value={form.title}
              onChangeText={(v) => setForm((f) => ({ ...f, title: v }))}
            />
            <TextInput
              style={[styles.input, styles.textarea]}
              placeholder={t("admin.events.descriptionPlaceholder")}
              value={form.description}
              onChangeText={(v) => setForm((f) => ({ ...f, description: v }))}
              multiline
            />
            <TextInput
              style={styles.input}
              placeholder={t("admin.events.locationPlaceholder")}
              value={form.location}
              onChangeText={(v) => setForm((f) => ({ ...f, location: v }))}
            />

            <Text style={styles.label}>{t("admin.events.category")}</Text>
            <View style={styles.kindRow}>
              {CATEGORIES.map((c) => (
                <Text
                  key={c}
                  style={[styles.kindOption, form.category === c && styles.kindOptionActive]}
                  onPress={() => setForm((f) => ({ ...f, category: c }))}
                >
                  {t(`admin.events.categories.${c}`)}
                </Text>
              ))}
            </View>

            <View style={styles.row}>
              <TextInput
                style={[styles.input, styles.flex1]}
                placeholder={t("admin.events.datePlaceholder")}
                value={form.date}
                onChangeText={(v) => setForm((f) => ({ ...f, date: v }))}
              />
              <TextInput
                style={[styles.input, styles.flex1]}
                placeholder={t("admin.events.timePlaceholder")}
                value={form.time}
                onChangeText={(v) => setForm((f) => ({ ...f, time: v }))}
              />
              <TextInput
                style={[styles.input, styles.flex1]}
                placeholder={t("admin.events.endTimePlaceholder")}
                value={form.endTime}
                onChangeText={(v) => setForm((f) => ({ ...f, endTime: v }))}
              />
            </View>

            <TextInput
              style={styles.input}
              placeholder={t("admin.events.capacityPlaceholder")}
              value={form.capacity}
              onChangeText={(v) => setForm((f) => ({ ...f, capacity: v.replace(/[^0-9]/g, "") }))}
              keyboardType="number-pad"
            />

            <View style={styles.switchRow}>
              <Text style={styles.switchLabel}>{t("admin.events.requiresRegistration")}</Text>
              <Switch
                value={form.requiresRegistration}
                onValueChange={(v) => setForm((f) => ({ ...f, requiresRegistration: v }))}
              />
            </View>

            <View style={styles.actionsRow}>
              <Button
                title={form.id ? t("admin.events.save") : t("admin.events.create")}
                onPress={handleSave}
                loading={saving}
                disabled={!form.title.trim()}
              />
              {form.id && (
                <Button title={t("common.cancel")} variant="outline" onPress={() => setForm(emptyForm())} />
              )}
            </View>

            <Text style={styles.listHeading}>{t("admin.events.upcoming")}</Text>
          </Card>
        }
        renderItem={({ item }) => (
          <Card style={styles.eventCard}>
            <Pressable style={{ flex: 1 }} onPress={() => editEvent(item)}>
              <Text style={styles.eventDate}>
                {format(new Date(item.start_at), "EEEE, dd MMMM yyyy · HH:mm", { locale: dateLocale })}
              </Text>
              <Text style={styles.eventTitle}>{item.title}</Text>
              {item.location && <Text style={styles.eventLocation}>{item.location}</Text>}
            </Pressable>
            <Pressable onPress={() => handleDelete(item)} hitSlop={12}>
              <Text style={styles.deleteLink}>{t("common.delete")}</Text>
            </Pressable>
          </Card>
        )}
      />
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  formCard: { marginBottom: 16, gap: 4 },
  formTitle: { fontSize: 16, fontWeight: "700", color: colors.textPrimary, marginBottom: 8 },
  label: { fontSize: 12, color: colors.textSecondary, fontWeight: "600", textTransform: "uppercase", marginTop: 4 },
  input: {
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    paddingVertical: 10,
    fontSize: 15,
    marginBottom: 10,
    color: colors.textPrimary,
  },
  textarea: { minHeight: 80, textAlignVertical: "top" },
  row: { flexDirection: "row", gap: 10 },
  flex1: { flex: 1 },
  kindRow: { flexDirection: "row", flexWrap: "wrap", gap: 8, marginTop: 8, marginBottom: 4 },
  kindOption: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 6,
    fontSize: 13,
    color: colors.textSecondary,
    fontWeight: "600",
  },
  kindOptionActive: { backgroundColor: colors.primary, color: "#fff", borderColor: colors.primary },
  switchRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginTop: 8, marginBottom: 4 },
  switchLabel: { color: colors.textPrimary, fontWeight: "600" },
  actionsRow: { flexDirection: "row", gap: 10, marginTop: 12 },
  listHeading: { fontSize: 13, fontWeight: "700", color: colors.textSecondary, textTransform: "uppercase", marginTop: 20 },
  eventCard: { flexDirection: "row", alignItems: "flex-start", justifyContent: "space-between", gap: 10 },
  eventDate: { fontSize: 12, fontWeight: "600", color: colors.secondary, textTransform: "uppercase" },
  eventTitle: { fontSize: 16, fontWeight: "700", color: colors.textPrimary, marginTop: 4 },
  eventLocation: { color: colors.textSecondary, marginTop: 2 },
  deleteLink: { color: colors.danger, fontWeight: "600", fontSize: 13, marginTop: 4 },
});
