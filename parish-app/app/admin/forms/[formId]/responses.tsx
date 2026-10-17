import { useEffect, useMemo, useState } from "react";
import { Alert, Linking, Platform, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { useLocalSearchParams } from "expo-router";
import * as FileSystem from "expo-file-system";
import * as Sharing from "expo-sharing";
import { useTranslation } from "react-i18next";
import { format } from "date-fns";
import { supabase } from "@/lib/supabase";
import { useParishContext, useTheme } from "@/context/ParishContext";
import { whatsappLink } from "@/lib/care";
import { Badge, Button, Card, EmptyState } from "@/components/ui";
import { colors } from "@/theme/colors";
import type { FormAnswer, FormOption, FormQuestion, FormResponse, ParishForm } from "@/types/database";

function csvEscape(value: string) {
  return /[",\n;]/.test(value) ? `"${value.replace(/"/g, '""')}"` : value;
}

/** Formulários → respostas: lista por pessoa, filtro por comunidade e exportação em planilha (CSV). */
export default function FormResponsesScreen() {
  const { t } = useTranslation();
  const theme = useTheme();
  const { formId } = useLocalSearchParams<{ formId: string }>();
  const { managedParishes } = useParishContext();
  const [form, setForm] = useState<ParishForm | null>(null);
  const [questions, setQuestions] = useState<FormQuestion[]>([]);
  const [options, setOptions] = useState<Record<string, FormOption>>({});
  const [responses, setResponses] = useState<FormResponse[]>([]);
  const [answers, setAnswers] = useState<Record<string, FormAnswer[]>>({});
  const [parishFilter, setParishFilter] = useState<string | null>(null);
  const [expanded, setExpanded] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      const { data: formData } = await supabase.from("forms").select("*").eq("id", formId).single();
      setForm(formData as ParishForm);
      const { data: questionData } = await supabase
        .from("form_questions")
        .select("*, form_sections!inner(sort_order)")
        .eq("form_id", formId);
      const qs = ((questionData as (FormQuestion & { form_sections: { sort_order: number } })[]) ?? []).sort(
        (a, b) => a.form_sections.sort_order - b.form_sections.sort_order || a.sort_order - b.sort_order,
      );
      setQuestions(qs);
      if (qs.length) {
        const { data: optionData } = await supabase
          .from("form_question_options")
          .select("*")
          .in(
            "question_id",
            qs.map((q) => q.id),
          );
        setOptions(Object.fromEntries(((optionData as FormOption[]) ?? []).map((o) => [o.id, o])));
      }
      const { data: responseData } = await supabase
        .from("form_responses")
        .select("*")
        .eq("form_id", formId)
        .order("submitted_at", { ascending: false })
        .limit(2000);
      const rs = (responseData as FormResponse[]) ?? [];
      setResponses(rs);
      if (rs.length) {
        const { data: answerData } = await supabase
          .from("form_answers")
          .select("*")
          .in(
            "response_id",
            rs.map((r) => r.id),
          )
          .limit(20000);
        const grouped: Record<string, FormAnswer[]> = {};
        for (const a of (answerData as FormAnswer[]) ?? []) (grouped[a.response_id] ??= []).push(a);
        setAnswers(grouped);
      }
    }
    load();
  }, [formId]);

  const visible = useMemo(
    () => (parishFilter ? responses.filter((r) => r.parish_id === parishFilter) : responses),
    [responses, parishFilter],
  );
  const parishName = (id: string | null) => managedParishes.find((p) => p.id === id)?.name ?? "—";

  function answerText(a: FormAnswer | undefined): string {
    if (!a) return "";
    if (a.option_ids.length) return a.option_ids.map((id) => options[id]?.label ?? "?").join(", ");
    if (a.file_url) return t("admin.forms.attachment");
    return a.text_value ?? "";
  }

  async function openAttachment(path: string) {
    const { data, error } = await supabase.storage.from("form-uploads").createSignedUrl(path, 3600);
    if (error || !data) {
      Alert.alert(t("common.error"), error?.message ?? "");
      return;
    }
    Linking.openURL(data.signedUrl);
  }

  async function exportCsv() {
    const header = [
      t("admin.forms.csv.date"),
      t("admin.forms.csv.name"),
      t("admin.forms.csv.phone"),
      t("admin.forms.csv.email"),
      t("admin.forms.csv.community"),
      ...(form?.is_quiz ? [t("admin.forms.csv.score")] : []),
      ...questions.map((q) => q.label),
    ];
    const rows = visible.map((r) => {
      const byQuestion = Object.fromEntries((answers[r.id] ?? []).map((a) => [a.question_id, a]));
      return [
        format(new Date(r.submitted_at), "dd/MM/yyyy HH:mm"),
        r.respondent_name ?? "",
        r.respondent_phone ?? "",
        r.respondent_email ?? "",
        parishName(r.parish_id),
        ...(form?.is_quiz ? [`${r.score ?? 0}/${r.max_score ?? 0}`] : []),
        ...questions.map((q) => {
          const a = byQuestion[q.id];
          return a?.file_url ? a.file_url : answerText(a);
        }),
      ];
    });
    // ";" abre direto em colunas no Excel em português
    const csv = "﻿" + [header, ...rows].map((row) => row.map((v) => csvEscape(String(v))).join(";")).join("\n");
    const fileName = `${(form?.title ?? "respostas").replace(/[^\w]+/g, "-").toLowerCase()}.csv`;

    if (Platform.OS === "web") {
      const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = fileName;
      link.click();
      URL.revokeObjectURL(url);
      return;
    }
    const uri = `${FileSystem.cacheDirectory}${fileName}`;
    await FileSystem.writeAsStringAsync(uri, csv, { encoding: FileSystem.EncodingType.UTF8 });
    await Sharing.shareAsync(uri, { mimeType: "text/csv", dialogTitle: form?.title });
  }

  if (!form) return null;

  const respondentParishes = [...new Set(responses.map((r) => r.parish_id).filter((id): id is string => !!id))];

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.container}>
      <Text style={styles.title}>{form.title}</Text>
      <Text style={styles.meta}>{t("admin.forms.responsesCount", { count: visible.length })}</Text>

      {respondentParishes.length > 1 && (
        <View style={styles.filters}>
          <Pressable onPress={() => setParishFilter(null)} style={[styles.chip, !parishFilter && { borderColor: theme.primary }]}>
            <Text style={styles.chipText}>{t("admin.forms.allCommunities")}</Text>
          </Pressable>
          {respondentParishes.map((id) => (
            <Pressable key={id} onPress={() => setParishFilter(id)} style={[styles.chip, parishFilter === id && { borderColor: theme.primary }]}>
              <Text style={styles.chipText}>{parishName(id)}</Text>
            </Pressable>
          ))}
        </View>
      )}

      <Button title={t("admin.forms.exportCsv")} variant="outline" onPress={exportCsv} disabled={visible.length === 0} />

      <View style={{ height: 12 }} />
      {visible.length === 0 && <EmptyState message={t("admin.forms.noResponses")} />}
      {visible.map((r) => {
        const isOpen = expanded === r.id;
        const byQuestion = Object.fromEntries((answers[r.id] ?? []).map((a) => [a.question_id, a]));
        const wa = whatsappLink(r.respondent_phone, t("admin.forms.whatsappMessage", { name: (r.respondent_name ?? "").split(" ")[0], form: form.title }));
        return (
          <Card key={r.id} onPress={() => setExpanded(isOpen ? null : r.id)}>
            <View style={styles.rowBetween}>
              <Text style={styles.name}>{r.respondent_name ?? t("admin.forms.anonymous")}</Text>
              <Text style={styles.date}>{format(new Date(r.submitted_at), "dd/MM/yy HH:mm")}</Text>
            </View>
            <View style={styles.badges}>
              {managedParishes.length > 1 && <Badge label={parishName(r.parish_id)} />}
              {form.is_quiz && <Badge label={`${r.score ?? 0}/${r.max_score ?? 0}`} tone="success" />}
            </View>
            {isOpen && (
              <View style={styles.answers}>
                {r.respondent_phone && <Text style={styles.meta}>📱 {r.respondent_phone}</Text>}
                {r.respondent_email && <Text style={styles.meta}>✉️ {r.respondent_email}</Text>}
                {questions.map((q) => {
                  const a = byQuestion[q.id];
                  if (!a) return null;
                  return (
                    <View key={q.id} style={styles.answer}>
                      <Text style={styles.question}>{q.label}</Text>
                      {a.file_url ? (
                        <Pressable onPress={() => openAttachment(a.file_url!)}>
                          <Text style={[styles.link, { color: theme.primary }]}>{t("admin.forms.openAttachment")}</Text>
                        </Pressable>
                      ) : (
                        <Text style={styles.answerText}>
                          {answerText(a)}
                          {a.is_correct === true ? "  ✔" : a.is_correct === false ? "  ✘" : ""}
                        </Text>
                      )}
                    </View>
                  );
                })}
                {wa && (
                  <Pressable onPress={() => Linking.openURL(wa)}>
                    <Text style={[styles.link, { color: colors.success }]}>{t("admin.forms.contactWhatsapp")}</Text>
                  </Pressable>
                )}
              </View>
            )}
          </Card>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background },
  container: { padding: 16, paddingBottom: 40, maxWidth: 900, width: "100%", alignSelf: "center" },
  title: { fontSize: 20, fontWeight: "700", color: colors.textPrimary },
  meta: { color: colors.textSecondary, marginVertical: 4 },
  filters: { flexDirection: "row", flexWrap: "wrap", gap: 6, marginVertical: 8 },
  chip: { borderWidth: 1, borderColor: colors.border, borderRadius: 14, paddingHorizontal: 10, paddingVertical: 5, backgroundColor: colors.surface },
  chipText: { fontSize: 12, color: colors.textPrimary },
  rowBetween: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  name: { fontWeight: "700", color: colors.textPrimary },
  date: { color: colors.textSecondary, fontSize: 12 },
  badges: { flexDirection: "row", gap: 6, marginTop: 6, flexWrap: "wrap" },
  answers: { marginTop: 10, borderTopWidth: 1, borderTopColor: colors.border, paddingTop: 8 },
  answer: { marginBottom: 8 },
  question: { fontSize: 12, color: colors.textSecondary, fontWeight: "700" },
  answerText: { color: colors.textPrimary, marginTop: 2 },
  link: { fontWeight: "700", marginTop: 4 },
});
