import { useEffect, useState } from "react";
import { Alert, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import { useTranslation } from "react-i18next";
import { supabase } from "@/lib/supabase";
import { Button, Card, SectionTitle } from "@/components/ui";
import { colors } from "@/theme/colors";
import type { Video } from "@/types/database";

interface DraftOption {
  text: string;
  isCorrect: boolean;
}

interface DraftQuestion {
  text: string;
  options: DraftOption[];
}

function emptyQuestion(): DraftQuestion {
  return { text: "", options: [{ text: "", isCorrect: true }, { text: "", isCorrect: false }] };
}

export default function AdminQuizzesScreen() {
  const { t } = useTranslation();
  const [videos, setVideos] = useState<Video[]>([]);
  const [videoId, setVideoId] = useState<string | null>(null);
  const [quizTitle, setQuizTitle] = useState("");
  const [passingScore, setPassingScore] = useState("70");
  const [questions, setQuestions] = useState<DraftQuestion[]>([emptyQuestion()]);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    supabase
      .from("videos")
      .select("*")
      .order("title")
      .then(({ data }) => setVideos((data as Video[]) ?? []));
  }, []);

  function updateQuestionText(qIdx: number, text: string) {
    setQuestions((prev) => prev.map((q, i) => (i === qIdx ? { ...q, text } : q)));
  }

  function updateOptionText(qIdx: number, oIdx: number, text: string) {
    setQuestions((prev) =>
      prev.map((q, i) => (i !== qIdx ? q : { ...q, options: q.options.map((o, j) => (j === oIdx ? { ...o, text } : o)) })),
    );
  }

  function setCorrectOption(qIdx: number, oIdx: number) {
    setQuestions((prev) =>
      prev.map((q, i) =>
        i !== qIdx ? q : { ...q, options: q.options.map((o, j) => ({ ...o, isCorrect: j === oIdx })) },
      ),
    );
  }

  function addOption(qIdx: number) {
    setQuestions((prev) => prev.map((q, i) => (i !== qIdx ? q : { ...q, options: [...q.options, { text: "", isCorrect: false }] })));
  }

  function addQuestion() {
    setQuestions((prev) => [...prev, emptyQuestion()]);
  }

  function removeQuestion(qIdx: number) {
    setQuestions((prev) => prev.filter((_, i) => i !== qIdx));
  }

  const canSave =
    videoId &&
    quizTitle.trim() &&
    questions.length > 0 &&
    questions.every((q) => q.text.trim() && q.options.filter((o) => o.text.trim()).length >= 2 && q.options.some((o) => o.isCorrect));

  async function handleSave() {
    if (!canSave || !videoId) return;
    setSaving(true);
    try {
      const { data: quiz, error: quizErr } = await supabase
        .from("quizzes")
        .insert({ video_id: videoId, title: quizTitle, passing_score_percent: Number(passingScore) || 70, is_published: true })
        .select()
        .single();
      if (quizErr) throw quizErr;

      for (let qIdx = 0; qIdx < questions.length; qIdx++) {
        const q = questions[qIdx];
        const { data: question, error: qErr } = await supabase
          .from("quiz_questions")
          .insert({ quiz_id: quiz.id, question_text: q.text, sort_order: qIdx })
          .select()
          .single();
        if (qErr) throw qErr;

        const optionRows = q.options
          .filter((o) => o.text.trim())
          .map((o, oIdx) => ({ question_id: question.id, option_text: o.text, is_correct: o.isCorrect, sort_order: oIdx }));
        const { error: optErr } = await supabase.from("quiz_options").insert(optionRows);
        if (optErr) throw optErr;
      }

      Alert.alert(t("admin.quizzes.savedTitle"), t("admin.quizzes.savedBody"));
      setQuizTitle("");
      setPassingScore("70");
      setQuestions([emptyQuestion()]);
      setVideoId(null);
    } catch (err) {
      Alert.alert(t("common.error"), err instanceof Error ? err.message : t("admin.quizzes.saveError"));
    } finally {
      setSaving(false);
    }
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.label}>{t("admin.quizzes.video")}</Text>
      <View style={styles.chipsRow}>
        {videos.map((v) => (
          <Pressable key={v.id} style={[styles.chip, videoId === v.id && styles.chipActive]} onPress={() => setVideoId(v.id)}>
            <Text style={[styles.chipText, videoId === v.id && styles.chipTextActive]}>{v.title}</Text>
          </Pressable>
        ))}
      </View>

      <Card>
        <TextInput style={styles.input} placeholder={t("admin.quizzes.titlePlaceholder")} value={quizTitle} onChangeText={setQuizTitle} />
        <TextInput
          style={styles.input}
          placeholder={t("admin.quizzes.passingScorePlaceholder")}
          value={passingScore}
          onChangeText={setPassingScore}
          keyboardType="number-pad"
        />
      </Card>

      <SectionTitle>{t("admin.quizzes.questions")}</SectionTitle>
      {questions.map((q, qIdx) => (
        <Card key={qIdx}>
          <TextInput
            style={styles.input}
            placeholder={t("admin.quizzes.questionPlaceholder")}
            value={q.text}
            onChangeText={(v) => updateQuestionText(qIdx, v)}
          />
          {q.options.map((o, oIdx) => (
            <View key={oIdx} style={styles.optionRow}>
              <Pressable style={[styles.radio, o.isCorrect && styles.radioActive]} onPress={() => setCorrectOption(qIdx, oIdx)} />
              <TextInput
                style={[styles.input, { flex: 1, marginBottom: 0 }]}
                placeholder={t("admin.quizzes.optionPlaceholder")}
                value={o.text}
                onChangeText={(v) => updateOptionText(qIdx, oIdx, v)}
              />
            </View>
          ))}
          <Text style={styles.addOption} onPress={() => addOption(qIdx)}>
            + {t("admin.quizzes.addOption")}
          </Text>
          {questions.length > 1 && (
            <Text style={styles.removeQuestion} onPress={() => removeQuestion(qIdx)}>
              {t("admin.quizzes.removeQuestion")}
            </Text>
          )}
        </Card>
      ))}
      <Text style={styles.addQuestion} onPress={addQuestion}>
        + {t("admin.quizzes.addQuestion")}
      </Text>

      <Button title={t("admin.quizzes.save")} onPress={handleSave} loading={saving} disabled={!canSave} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 20, backgroundColor: colors.background, flexGrow: 1, gap: 12 },
  label: { fontSize: 12, color: colors.textSecondary, fontWeight: "600", textTransform: "uppercase" },
  chipsRow: { flexDirection: "row", flexWrap: "wrap", gap: 8, marginTop: 8, marginBottom: 4 },
  chip: { borderWidth: 1, borderColor: colors.border, borderRadius: 20, paddingHorizontal: 14, paddingVertical: 8 },
  chipActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  chipText: { color: colors.textSecondary, fontWeight: "600", fontSize: 13 },
  chipTextActive: { color: "#fff" },
  input: {
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    paddingVertical: 10,
    fontSize: 15,
    marginBottom: 10,
    color: colors.textPrimary,
  },
  optionRow: { flexDirection: "row", alignItems: "center", gap: 10, marginBottom: 6 },
  radio: { width: 18, height: 18, borderRadius: 9, borderWidth: 2, borderColor: colors.border },
  radioActive: { backgroundColor: colors.success, borderColor: colors.success },
  addOption: { color: colors.secondary, fontWeight: "600", marginTop: 4 },
  removeQuestion: { color: colors.danger, fontWeight: "600", marginTop: 8, fontSize: 12 },
  addQuestion: { color: colors.primary, fontWeight: "700", textAlign: "center", marginVertical: 8 },
});
