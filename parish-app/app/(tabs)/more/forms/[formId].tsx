import { useEffect, useMemo, useState } from "react";
import { Alert, ScrollView, StyleSheet, Text, View } from "react-native";
import { Image } from "expo-image";
import { router, useLocalSearchParams } from "expo-router";
import { useTranslation } from "react-i18next";
import { supabase } from "@/lib/supabase";
import { Button, Card } from "@/components/ui";
import { FormQuestionInput } from "@/components/FormQuestionInput";
import { useTheme } from "@/context/ParishContext";
import { buildSubmission, missingRequired, nextStep, type DraftAnswer } from "@/lib/formFlow";
import { colors } from "@/theme/colors";
import type { FormOptionPublic, FormQuestion, FormSection, ParishForm } from "@/types/database";

interface SubmitResult {
  score: number | null;
  max_score: number | null;
  message: string | null;
}

export default function FillFormScreen() {
  const { t } = useTranslation();
  const theme = useTheme();
  const { formId } = useLocalSearchParams<{ formId: string }>();
  const [form, setForm] = useState<ParishForm | null>(null);
  const [sections, setSections] = useState<FormSection[]>([]);
  const [questions, setQuestions] = useState<FormQuestion[]>([]);
  const [optionsByQuestion, setOptionsByQuestion] = useState<Record<string, FormOptionPublic[]>>({});
  const [answers, setAnswers] = useState<Record<string, DraftAnswer>>({});
  /** Caminho percorrido (pilha): permite "Voltar" respeitando os desvios. */
  const [path, setPath] = useState<string[]>([]);
  const [showErrors, setShowErrors] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<SubmitResult | null>(null);

  useEffect(() => {
    async function load() {
      const { data: formData } = await supabase.from("forms").select("*").eq("id", formId).maybeSingle();
      if (!formData) return;
      setForm(formData as ParishForm);

      const [{ data: sectionData }, { data: questionData }] = await Promise.all([
        supabase.from("form_sections").select("*").eq("form_id", formId).order("sort_order"),
        supabase.from("form_questions").select("*").eq("form_id", formId).order("sort_order"),
      ]);
      const loadedSections = (sectionData as FormSection[]) ?? [];
      const loadedQuestions = (questionData as FormQuestion[]) ?? [];
      setSections(loadedSections);
      setQuestions(loadedQuestions);
      setPath(loadedSections[0] ? [loadedSections[0].id] : []);

      if (loadedQuestions.length > 0) {
        const { data: optionData } = await supabase
          .from("form_question_options_public")
          .select("*")
          .in(
            "question_id",
            loadedQuestions.map((q) => q.id),
          )
          .order("sort_order");
        const grouped: Record<string, FormOptionPublic[]> = {};
        for (const o of (optionData as FormOptionPublic[]) ?? []) {
          (grouped[o.question_id] ??= []).push(o);
        }
        setOptionsByQuestion(grouped);
      }
    }
    load();
  }, [formId]);

  const currentSectionId = path[path.length - 1];
  const currentSection = sections.find((s) => s.id === currentSectionId);
  const sectionQuestions = useMemo(
    () => questions.filter((q) => q.section_id === currentSectionId).sort((a, b) => a.sort_order - b.sort_order),
    [questions, currentSectionId],
  );
  const missing = currentSectionId ? missingRequired(currentSectionId, questions, answers) : [];
  const step = currentSectionId ? nextStep(sections, currentSectionId, questions, optionsByQuestion, answers) : null;

  async function submit() {
    if (!form) return;
    setSubmitting(true);
    const { data, error } = await supabase.rpc("submit_form_response", {
      p_form_id: form.id,
      p_answers: buildSubmission(path, questions, answers),
    });
    setSubmitting(false);
    if (error) {
      Alert.alert(t("common.error"), error.message);
      return;
    }
    setResult(data as SubmitResult);
  }

  function advance() {
    if (missing.length > 0) {
      setShowErrors(true);
      return;
    }
    setShowErrors(false);
    if (!step || step.kind === "submit") {
      submit();
    } else {
      setPath((p) => [...p, step.sectionId]);
    }
  }

  if (result) {
    return (
      <View style={styles.resultContainer}>
        <Text style={styles.resultEmoji}>✅</Text>
        <Text style={styles.resultTitle}>{t("forms.sent")}</Text>
        {result.score !== null && result.max_score !== null && (
          <Text style={styles.resultScore}>{t("forms.score", { score: result.score, max: result.max_score })}</Text>
        )}
        {result.message && <Text style={styles.resultMessage}>{result.message}</Text>}
        <Button title={t("common.back")} onPress={() => router.back()} />
      </View>
    );
  }

  if (!form || !currentSection) return null;

  const stepIndex = path.length;

  return (
    <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
      {path.length === 1 && (
        <>
          {form.cover_image_url && <Image source={{ uri: form.cover_image_url }} style={styles.cover} contentFit="cover" />}
          <Text style={styles.title}>{form.title}</Text>
          {form.description && <Text style={styles.description}>{form.description}</Text>}
        </>
      )}

      <Card>
        <Text style={[styles.stepLabel, { color: theme.secondary }]}>{t("forms.step", { n: stepIndex })}</Text>
        <Text style={styles.sectionTitle}>{currentSection.title}</Text>
        {currentSection.description && <Text style={styles.sectionDescription}>{currentSection.description}</Text>}
        {currentSection.image_url && (
          <Image source={{ uri: currentSection.image_url }} style={styles.sectionImage} contentFit="cover" />
        )}

        {sectionQuestions.map((q) => (
          <FormQuestionInput
            key={q.id}
            question={q}
            options={optionsByQuestion[q.id] ?? []}
            value={answers[q.id]}
            onChange={(value) => setAnswers((prev) => ({ ...prev, [q.id]: value }))}
            showError={showErrors && missing.some((m) => m.id === q.id)}
          />
        ))}
      </Card>

      <View style={styles.actions}>
        {path.length > 1 && (
          <View style={{ flex: 1 }}>
            <Button title={t("common.back")} variant="outline" onPress={() => setPath((p) => p.slice(0, -1))} />
          </View>
        )}
        <View style={{ flex: 1 }}>
          <Button
            title={step?.kind === "section" ? t("forms.next") : t("forms.submit")}
            onPress={advance}
            loading={submitting}
          />
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 16, backgroundColor: colors.background, flexGrow: 1 },
  cover: { width: "100%", height: 170, borderRadius: 14, marginBottom: 12 },
  title: { fontSize: 22, fontWeight: "700", color: colors.textPrimary },
  description: { color: colors.textSecondary, marginTop: 4, marginBottom: 12 },
  stepLabel: { fontSize: 12, fontWeight: "700", textTransform: "uppercase" },
  sectionTitle: { fontSize: 18, fontWeight: "700", color: colors.textPrimary, marginTop: 2 },
  sectionDescription: { color: colors.textSecondary, marginTop: 4, marginBottom: 8 },
  sectionImage: { width: "100%", height: 170, borderRadius: 10, marginVertical: 10 },
  actions: { flexDirection: "row", gap: 10, marginTop: 4, marginBottom: 32 },
  resultContainer: { flex: 1, backgroundColor: colors.background, alignItems: "center", justifyContent: "center", padding: 24, gap: 12 },
  resultEmoji: { fontSize: 48 },
  resultTitle: { fontSize: 22, fontWeight: "700", color: colors.textPrimary },
  resultScore: { fontSize: 18, fontWeight: "700", color: colors.textPrimary },
  resultMessage: { color: colors.textSecondary, textAlign: "center", marginBottom: 12 },
});
