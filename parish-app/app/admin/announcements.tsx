import { useCallback, useEffect, useState } from "react";
import { Alert, FlatList, Pressable, StyleSheet, Switch, Text, TextInput, View } from "react-native";
import { useTranslation } from "react-i18next";
import { supabase } from "@/lib/supabase";
import { useParishId } from "@/hooks/useParish";
import { Button, Card, EmptyState, ScreenContainer } from "@/components/ui";
import { colors } from "@/theme/colors";
import type { Announcement } from "@/types/database";

function emptyForm() {
  return {
    id: null as string | null,
    title: "",
    body: "",
    isPinned: false,
    isActive: true,
  };
}

export default function AdminAnnouncementsScreen() {
  const { t } = useTranslation();
  const parishId = useParishId();
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [form, setForm] = useState(emptyForm());
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    if (!parishId) return;
    const { data } = await supabase
      .from("announcements")
      .select("*")
      .eq("parish_id", parishId)
      .order("is_pinned", { ascending: false })
      .order("created_at", { ascending: false });
    setAnnouncements((data as Announcement[]) ?? []);
  }, [parishId]);

  useEffect(() => {
    load();
  }, [load]);

  function editAnnouncement(item: Announcement) {
    setForm({
      id: item.id,
      title: item.title,
      body: item.body,
      isPinned: item.is_pinned,
      isActive: item.is_active,
    });
  }

  async function handleDelete(item: Announcement) {
    Alert.alert(t("admin.announcements.deleteTitle"), t("admin.announcements.deleteConfirm"), [
      { text: t("common.cancel"), style: "cancel" },
      {
        text: t("common.delete"),
        style: "destructive",
        onPress: async () => {
          await supabase.from("announcements").delete().eq("id", item.id);
          if (form.id === item.id) setForm(emptyForm());
          load();
        },
      },
    ]);
  }

  async function handleSave() {
    if (!parishId || !form.title.trim() || !form.body.trim()) return;
    setSaving(true);
    const payload = {
      parish_id: parishId,
      title: form.title.trim(),
      body: form.body.trim(),
      is_pinned: form.isPinned,
      is_active: form.isActive,
      updated_at: new Date().toISOString(),
    };

    const { error } = form.id
      ? await supabase.from("announcements").update(payload).eq("id", form.id)
      : await supabase.from("announcements").insert(payload);

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
        data={announcements}
        keyExtractor={(item) => item.id}
        ListEmptyComponent={<EmptyState message={t("admin.announcements.empty")} />}
        ListHeaderComponent={
          <Card style={styles.formCard}>
            <Text style={styles.formTitle}>{t("admin.announcements.hint")}</Text>

            <TextInput
              style={styles.input}
              placeholder={t("admin.announcements.titlePlaceholder")}
              value={form.title}
              onChangeText={(v) => setForm((f) => ({ ...f, title: v }))}
            />
            <TextInput
              style={[styles.input, styles.bodyInput]}
              placeholder={t("admin.announcements.bodyPlaceholder")}
              value={form.body}
              onChangeText={(v) => setForm((f) => ({ ...f, body: v }))}
              multiline
            />

            <View style={styles.switchRow}>
              <Text style={styles.switchLabel}>{t("admin.announcements.pinned")}</Text>
              <Switch value={form.isPinned} onValueChange={(v) => setForm((f) => ({ ...f, isPinned: v }))} />
            </View>
            <View style={styles.switchRow}>
              <Text style={styles.switchLabel}>{t("admin.announcements.active")}</Text>
              <Switch value={form.isActive} onValueChange={(v) => setForm((f) => ({ ...f, isActive: v }))} />
            </View>

            <View style={styles.actionsRow}>
              <Button
                title={form.id ? t("admin.announcements.save") : t("admin.announcements.create")}
                onPress={handleSave}
                loading={saving}
                disabled={!form.title.trim() || !form.body.trim()}
              />
              {form.id && (
                <Button title={t("common.cancel")} variant="outline" onPress={() => setForm(emptyForm())} />
              )}
            </View>

            <Text style={styles.listHeading}>{t("admin.announcements.current")}</Text>
          </Card>
        }
        renderItem={({ item }) => (
          <Card style={styles.itemCard}>
            <Pressable style={{ flex: 1 }} onPress={() => editAnnouncement(item)}>
              <View style={styles.itemHeader}>
                {item.is_pinned && <Text style={styles.pinTag}>📌</Text>}
                <Text style={styles.itemTitle}>{item.title}</Text>
              </View>
              <Text style={styles.itemBody} numberOfLines={2}>
                {item.body}
              </Text>
              {!item.is_active && <Text style={styles.inactiveTag}>{t("admin.announcements.inactive")}</Text>}
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
  formTitle: { fontSize: 13, color: colors.textSecondary, marginBottom: 10, lineHeight: 18 },
  input: {
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    paddingVertical: 10,
    fontSize: 15,
    marginBottom: 10,
    color: colors.textPrimary,
  },
  bodyInput: { minHeight: 80, textAlignVertical: "top" },
  switchRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginTop: 4, marginBottom: 4 },
  switchLabel: { color: colors.textPrimary, fontWeight: "600" },
  actionsRow: { flexDirection: "row", gap: 10, marginTop: 12 },
  listHeading: { fontSize: 13, fontWeight: "700", color: colors.textSecondary, textTransform: "uppercase", marginTop: 20 },
  itemCard: { flexDirection: "row", alignItems: "flex-start", gap: 10 },
  itemHeader: { flexDirection: "row", alignItems: "center", gap: 6 },
  pinTag: { fontSize: 13 },
  itemTitle: { fontWeight: "700", color: colors.textPrimary },
  itemBody: { color: colors.textSecondary, marginTop: 4 },
  inactiveTag: { color: colors.textSecondary, fontSize: 12, marginTop: 4 },
  deleteLink: { color: colors.danger, fontWeight: "600", fontSize: 13 },
});
