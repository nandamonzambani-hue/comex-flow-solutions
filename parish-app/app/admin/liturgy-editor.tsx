import { useEffect, useState } from "react";
import { Alert, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import { useTranslation } from "react-i18next";
import { supabase } from "@/lib/supabase";
import { SUPPORTED_LOCALES } from "@/i18n";
import { Button, Card } from "@/components/ui";
import { colors } from "@/theme/colors";
import type { DailyLiturgy } from "@/types/database";

const todayISO = new Date().toISOString().slice(0, 10);

export default function AdminLiturgyEditorScreen() {
  const { t } = useTranslation();
  const [locale, setLocale] = useState(SUPPORTED_LOCALES[0].code);
  const [form, setForm] = useState<Partial<DailyLiturgy>>({ date: todayISO, locale });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    supabase
      .from("daily_liturgy")
      .select("*")
      .eq("date", todayISO)
      .eq("locale", locale)
      .maybeSingle()
      .then(({ data }) => {
        setForm((data as DailyLiturgy | null) ?? { date: todayISO, locale });
      });
  }, [locale]);

  function set<K extends keyof DailyLiturgy>(key: K, value: DailyLiturgy[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  async function handleSave() {
    setSaving(true);
    const { error } = await supabase
      .from("daily_liturgy")
      .upsert({ ...form, date: todayISO, locale }, { onConflict: "date,locale" });
    setSaving(false);
    if (error) {
      Alert.alert(t("common.error"), error.message);
      return;
    }
    Alert.alert(t("admin.liturgyEditor.savedTitle"), t("admin.liturgyEditor.savedBody"));
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.hint}>{t("admin.liturgyEditor.hint", { date: todayISO })}</Text>

      <View style={styles.localeRow}>
        {SUPPORTED_LOCALES.map((l) => (
          <Text
            key={l.code}
            style={[styles.localeChip, locale === l.code && styles.localeChipActive]}
            onPress={() => setLocale(l.code)}
          >
            {l.flag} {l.label}
          </Text>
        ))}
      </View>

      <Card>
        <TextInput
          style={styles.input}
          placeholder={t("admin.liturgyEditor.celebration")}
          value={form.celebration ?? ""}
          onChangeText={(v) => set("celebration", v)}
        />
        <TextInput
          style={styles.input}
          placeholder={t("admin.liturgyEditor.color")}
          value={form.liturgical_color ?? ""}
          onChangeText={(v) => set("liturgical_color", v)}
        />
        <TextInput
          style={styles.input}
          placeholder={t("admin.liturgyEditor.saint")}
          value={form.saint_of_day ?? ""}
          onChangeText={(v) => set("saint_of_day", v)}
        />
      </Card>

      <Card>
        <TextInput style={styles.input} placeholder={t("admin.liturgyEditor.firstReadingRef")} value={form.first_reading_ref ?? ""} onChangeText={(v) => set("first_reading_ref", v)} />
        <TextInput style={[styles.input, styles.textarea]} placeholder={t("admin.liturgyEditor.firstReadingText")} value={form.first_reading_text ?? ""} onChangeText={(v) => set("first_reading_text", v)} multiline />
      </Card>

      <Card>
        <TextInput style={styles.input} placeholder={t("admin.liturgyEditor.psalmRef")} value={form.psalm_ref ?? ""} onChangeText={(v) => set("psalm_ref", v)} />
        <TextInput style={[styles.input, styles.textarea]} placeholder={t("admin.liturgyEditor.psalmText")} value={form.psalm_text ?? ""} onChangeText={(v) => set("psalm_text", v)} multiline />
      </Card>

      <Card>
        <TextInput style={styles.input} placeholder={t("admin.liturgyEditor.gospelRef")} value={form.gospel_ref ?? ""} onChangeText={(v) => set("gospel_ref", v)} />
        <TextInput style={[styles.input, styles.textarea]} placeholder={t("admin.liturgyEditor.gospelText")} value={form.gospel_text ?? ""} onChangeText={(v) => set("gospel_text", v)} multiline />
      </Card>

      <Card>
        <TextInput
          style={[styles.input, styles.textarea]}
          placeholder={t("admin.liturgyEditor.reflection")}
          value={form.reflection ?? ""}
          onChangeText={(v) => set("reflection", v)}
          multiline
        />
      </Card>

      <Button title={t("admin.liturgyEditor.save")} onPress={handleSave} loading={saving} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 20, backgroundColor: colors.background, flexGrow: 1, gap: 12 },
  hint: { color: colors.textSecondary, fontSize: 13, marginBottom: 4, lineHeight: 18 },
  localeRow: { flexDirection: "row", flexWrap: "wrap", gap: 8, marginBottom: 4 },
  localeChip: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 6,
    fontSize: 13,
    color: colors.textSecondary,
    fontWeight: "600",
  },
  localeChipActive: { backgroundColor: colors.primary, color: "#fff", borderColor: colors.primary },
  input: {
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    paddingVertical: 10,
    fontSize: 15,
    marginBottom: 10,
    color: colors.textPrimary,
  },
  textarea: { minHeight: 80, textAlignVertical: "top" },
});
