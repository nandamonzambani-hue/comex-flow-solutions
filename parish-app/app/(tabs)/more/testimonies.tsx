import { useCallback, useEffect, useState } from "react";
import { Alert, Pressable, ScrollView, StyleSheet, Switch, Text, TextInput, View } from "react-native";
import { useTranslation } from "react-i18next";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/context/AuthContext";
import { useTheme } from "@/context/ParishContext";
import { CARE_AREAS, type CareArea } from "@/lib/care";
import { Badge, Button, Card, EmptyState, SectionTitle } from "@/components/ui";
import { colors } from "@/theme/colors";
import type { Testimony } from "@/types/database";

export default function TestimoniesScreen() {
  const { t } = useTranslation();
  const theme = useTheme();
  const { profile } = useAuth();
  const [published, setPublished] = useState<Testimony[]>([]);
  const [writing, setWriting] = useState(false);
  const [category, setCategory] = useState<CareArea>("vida_espiritual");
  const [body, setBody] = useState("");
  const [allowPublish, setAllowPublish] = useState(true);
  const [allowWhatsapp, setAllowWhatsapp] = useState(false);
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    if (!profile?.parish_id) return;
    const { data } = await supabase
      .from("testimonies")
      .select("*")
      .eq("parish_id", profile.parish_id)
      .eq("status", "approved")
      .eq("allow_publish", true)
      .order("created_at", { ascending: false });
    setPublished((data as Testimony[]) ?? []);
  }, [profile?.parish_id]);

  useEffect(() => {
    load();
  }, [load]);

  async function send() {
    if (!profile?.parish_id || !body.trim()) return;
    setSaving(true);
    const { error } = await supabase.from("testimonies").insert({
      parish_id: profile.parish_id,
      profile_id: profile.id,
      author_name: profile.full_name,
      category,
      body: body.trim(),
      allow_publish: allowPublish,
      allow_whatsapp_contact: allowWhatsapp,
    });
    setSaving(false);
    if (error) {
      Alert.alert(t("common.error"), error.message);
      return;
    }
    setBody("");
    setWriting(false);
    Alert.alert(t("testimonies.sentTitle"), t("testimonies.sentBody"));
  }

  return (
    <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
      {!writing ? (
        <Button title={t("testimonies.write")} onPress={() => setWriting(true)} />
      ) : (
        <Card>
          <Text style={styles.intro}>{t("testimonies.intro")}</Text>
          <View style={styles.chips}>
            {CARE_AREAS.map((a) => (
              <Pressable
                key={a}
                onPress={() => setCategory(a)}
                style={[styles.chip, category === a && { backgroundColor: theme.primary, borderColor: theme.primary }]}
              >
                <Text style={[styles.chipText, category === a && { color: "#fff" }]}>{t(`care.areas.${a}`)}</Text>
              </Pressable>
            ))}
          </View>
          <TextInput
            style={styles.input}
            value={body}
            onChangeText={setBody}
            multiline
            placeholder={t("testimonies.placeholder")}
          />
          <View style={styles.switchRow}>
            <Text style={styles.switchLabel}>{t("testimonies.allowPublish")}</Text>
            <Switch value={allowPublish} onValueChange={setAllowPublish} />
          </View>
          <View style={styles.switchRow}>
            <Text style={styles.switchLabel}>{t("prayer.allowWhatsapp")}</Text>
            <Switch value={allowWhatsapp} onValueChange={setAllowWhatsapp} />
          </View>
          <Button title={t("testimonies.send")} onPress={send} loading={saving} disabled={!body.trim()} />
        </Card>
      )}

      <SectionTitle>{t("testimonies.title")}</SectionTitle>
      {published.length === 0 && <EmptyState message={t("testimonies.empty")} />}
      {published.map((item) => (
        <Card key={item.id}>
          <Badge label={t(`care.areas.${item.category}`, { defaultValue: item.category })} />
          <Text style={styles.body}>“{item.body}”</Text>
          <Text style={styles.author}>— {item.author_name}</Text>
        </Card>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 16, backgroundColor: colors.background, flexGrow: 1, gap: 4 },
  intro: { color: colors.textSecondary, marginBottom: 10 },
  chips: { flexDirection: "row", flexWrap: "wrap", gap: 6, marginBottom: 10 },
  chip: { borderWidth: 1, borderColor: colors.border, borderRadius: 16, paddingHorizontal: 10, paddingVertical: 6 },
  chipText: { fontSize: 13, color: colors.textPrimary },
  input: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 10,
    padding: 12,
    minHeight: 110,
    textAlignVertical: "top",
    fontSize: 15,
    color: colors.textPrimary,
  },
  switchRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginVertical: 8, gap: 12 },
  switchLabel: { flex: 1, color: colors.textPrimary },
  body: { color: colors.textPrimary, marginTop: 8, fontStyle: "italic", lineHeight: 21 },
  author: { color: colors.textSecondary, marginTop: 6 },
});
