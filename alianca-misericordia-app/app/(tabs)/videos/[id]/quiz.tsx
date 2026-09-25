import { useEffect, useState } from "react";
import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { useTranslation } from "react-i18next";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/context/AuthContext";
import { Button, Card } from "@/components/ui";
import { colors } from "@/theme/colors";
import type { Quiz, QuizAttempt, QuizOptionPublic, QuizQuestion } from "@/types/database";

export default function QuizScreen() {
  const { t } = useTranslation();
  const { id: videoId } = useLocalSearchParams<{ id: string }>();
  const { profile } = useAuth();
  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [optionsByQuestion, setOptionsByQuestion] = useState<Record<string, QuizOptionPublic[]>>({});
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<QuizAttempt | null>(null);

  useEffect(() => {
    async function load() {
      const { data: quizData } = await supabase.from("quizzes").select("*").eq("video_id", videoId).eq("is_published", true).maybeSingle();
      if (!quizData) return;
      setQuiz(quizData as Quiz);

      const { data: questionData } = await supabase
        .from("quiz_questions")
        .select("*")
        .eq("quiz_id", quizData.id)
        .order("sort_order");
      setQuestions((questionData as QuizQuestion[]) ?? []);

      const { data: optionData } = await supabase
        .from("quiz_options_public")
        .select("*")
        .in("question_id", ((questionData as QuizQuestion[]) ?? []).map((q) => q.id));
      const grouped: Record<string, QuizOptionPublic[]> = {};
      for (const o of (optionData as QuizOptionPublic[]) ?? []) {
        if (!grouped[o.question_id]) grouped[o.question_id] = [];
        grouped[o.question_id].push(o);
      }
      setOptionsByQuestion(grouped);
    }
    load();
  }, [videoId]);

  function selectAnswer(questionId: string, optionId: string) {
    setAnswers((prev) => ({ ...prev, [questionId]: optionId }));
  }

  async function handleSubmit() {
    if (!quiz || !profile) return;
    setSubmitting(true);
    try {
      const { data: attempt, error: attemptErr } = await supabase
        .from("quiz_attempts")
        .insert({ quiz_id: quiz.id, profile_id: profile.id, total_questions: questions.length })
        .select()
        .single();
      if (attemptErr) throw attemptErr;

      const rows = questions.map((q) => ({
        attempt_id: attempt.id,
        question_id: q.id,
        selected_option_id: answers[q.id] ?? null,
        is_correct: false, // placeholder — o servidor recalcula em finalize_quiz_attempt()
      }));
      const { error: answersErr } = await supabase.from("quiz_answers").insert(rows);
      if (answersErr) throw answersErr;

      const { error: finalizeErr } = await supabase.rpc("finalize_quiz_attempt", { p_attempt_id: attempt.id });
      if (finalizeErr) throw finalizeErr;

      const { data: finalAttempt } = await supabase.from("quiz_attempts").select("*").eq("id", attempt.id).single();
      setResult(finalAttempt as QuizAttempt);
    } catch (err) {
      Alert.alert(t("common.error"), err instanceof Error ? err.message : t("quiz.submitError"));
    } finally {
      setSubmitting(false);
    }
  }

  if (result) {
    return (
      <View style={styles.resultContainer}>
        <Text style={styles.resultEmoji}>{result.passed ? "🎉" : "📖"}</Text>
        <Text style={styles.resultTitle}>{result.passed ? t("quiz.passed") : t("quiz.notPassed")}</Text>
        <Text style={styles.resultScore}>
          {t("quiz.scoreLine", { correct: result.correct_count, total: result.total_questions, percent: result.score_percent })}
        </Text>
        <Button title={t("common.back")} onPress={() => router.back()} />
      </View>
    );
  }

  if (!quiz) return null;

  const allAnswered = questions.length > 0 && questions.every((q) => answers[q.id]);

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>{quiz.title}</Text>
      {questions.map((q, idx) => (
        <Card key={q.id}>
          <Text style={styles.question}>
            {idx + 1}. {q.question_text}
          </Text>
          {(optionsByQuestion[q.id] ?? []).map((opt) => (
            <Pressable
              key={opt.id}
              style={[styles.option, answers[q.id] === opt.id && styles.optionSelected]}
              onPress={() => selectAnswer(q.id, opt.id)}
            >
              <Text style={[styles.optionText, answers[q.id] === opt.id && styles.optionTextSelected]}>{opt.option_text}</Text>
            </Pressable>
          ))}
        </Card>
      ))}
      <Button title={t("quiz.submit")} onPress={handleSubmit} loading={submitting} disabled={!allAnswered} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 20, backgroundColor: colors.background, flexGrow: 1, gap: 12 },
  title: { fontSize: 22, fontWeight: "700", color: colors.textPrimary, marginBottom: 4 },
  question: { fontWeight: "700", color: colors.textPrimary, marginBottom: 10, fontSize: 15 },
  option: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    marginBottom: 8,
  },
  optionSelected: { backgroundColor: colors.primary, borderColor: colors.primary },
  optionText: { color: colors.textPrimary },
  optionTextSelected: { color: "#fff", fontWeight: "600" },
  resultContainer: { flex: 1, backgroundColor: colors.background, alignItems: "center", justifyContent: "center", padding: 24, gap: 12 },
  resultEmoji: { fontSize: 48 },
  resultTitle: { fontSize: 22, fontWeight: "700", color: colors.textPrimary },
  resultScore: { color: colors.textSecondary, fontSize: 16, marginBottom: 12 },
});
