import { useEffect, useState } from "react";
import { Alert, ScrollView, StyleSheet, Text, TextInput } from "react-native";
import { supabase } from "@/lib/supabase";
import { Button, Card } from "@/components/ui";
import { colors } from "@/theme/colors";
import type { DailyLiturgy } from "@/types/database";

const todayISO = new Date().toISOString().slice(0, 10);

export default function AdminLiturgyEditorScreen() {
  const [form, setForm] = useState<Partial<DailyLiturgy>>({ date: todayISO });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    supabase
      .from("daily_liturgy")
      .select("*")
      .eq("date", todayISO)
      .maybeSingle()
      .then(({ data }) => {
        if (data) setForm(data as DailyLiturgy);
      });
  }, []);

  function set<K extends keyof DailyLiturgy>(key: K, value: DailyLiturgy[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  async function handleSave() {
    setSaving(true);
    const { error } = await supabase.from("daily_liturgy").upsert({ ...form, date: todayISO }, { onConflict: "date" });
    setSaving(false);
    if (error) {
      Alert.alert("Erro", error.message);
      return;
    }
    Alert.alert("Salvo", "Liturgia de hoje atualizada.");
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.hint}>
        Edite manualmente a liturgia de hoje ({todayISO}). Se você configurar a sincronização automática
        (supabase/functions/daily-liturgy-sync), este formulário passa a ser só um ajuste fino/backup.
      </Text>

      <Card>
        <TextInput
          style={styles.input}
          placeholder="Celebração (ex: Domingo XXV do Tempo Comum)"
          value={form.celebration ?? ""}
          onChangeText={(v) => set("celebration", v)}
        />
        <TextInput
          style={styles.input}
          placeholder="Cor litúrgica (Verde, Roxo, Branco, Vermelho, Rosa)"
          value={form.liturgical_color ?? ""}
          onChangeText={(v) => set("liturgical_color", v)}
        />
        <TextInput
          style={styles.input}
          placeholder="Santo do dia (opcional)"
          value={form.saint_of_day ?? ""}
          onChangeText={(v) => set("saint_of_day", v)}
        />
      </Card>

      <Card>
        <TextInput style={styles.input} placeholder="Referência 1ª Leitura" value={form.first_reading_ref ?? ""} onChangeText={(v) => set("first_reading_ref", v)} />
        <TextInput style={[styles.input, styles.textarea]} placeholder="Texto 1ª Leitura" value={form.first_reading_text ?? ""} onChangeText={(v) => set("first_reading_text", v)} multiline />
      </Card>

      <Card>
        <TextInput style={styles.input} placeholder="Referência Salmo" value={form.psalm_ref ?? ""} onChangeText={(v) => set("psalm_ref", v)} />
        <TextInput style={[styles.input, styles.textarea]} placeholder="Texto do Salmo" value={form.psalm_text ?? ""} onChangeText={(v) => set("psalm_text", v)} multiline />
      </Card>

      <Card>
        <TextInput style={styles.input} placeholder="Referência Evangelho" value={form.gospel_ref ?? ""} onChangeText={(v) => set("gospel_ref", v)} />
        <TextInput style={[styles.input, styles.textarea]} placeholder="Texto do Evangelho" value={form.gospel_text ?? ""} onChangeText={(v) => set("gospel_text", v)} multiline />
      </Card>

      <Card>
        <TextInput
          style={[styles.input, styles.textarea]}
          placeholder="Reflexão do dia"
          value={form.reflection ?? ""}
          onChangeText={(v) => set("reflection", v)}
          multiline
        />
      </Card>

      <Button title="Salvar liturgia de hoje" onPress={handleSave} loading={saving} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 20, backgroundColor: colors.background, flexGrow: 1, gap: 12 },
  hint: { color: colors.textSecondary, fontSize: 13, marginBottom: 4, lineHeight: 18 },
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
