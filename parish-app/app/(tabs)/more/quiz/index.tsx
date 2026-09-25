import { useEffect, useState } from "react";
import { FlatList, StyleSheet, Text } from "react-native";
import { router } from "expo-router";
import { useTranslation } from "react-i18next";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/context/AuthContext";
import { useParishId } from "@/hooks/useParish";
import { Badge, Card, EmptyState, ScreenContainer } from "@/components/ui";
import { colors } from "@/theme/colors";
import type { Quiz, QuizAttempt } from "@/types/database";

export default function QuizListScreen() {
  const { t } = useTranslation();
  const parishId = useParishId();
  const { profile } = useAuth();
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [bestAttempts, setBestAttempts] = useState<Record<string, QuizAttempt>>({});

  useEffect(() => {
    if (!parishId || !profile) return;
    supabase
      .from("quizzes")
      .select("*")
      .eq("parish_id", parishId)
      .eq("is_published", true)
      .then(async ({ data }) => {
        const list = (data as Quiz[]) ?? [];
        setQuizzes(list);
        if (list.length === 0) return;
        const { data: attempts } = await supabase
          .from("quiz_attempts")
          .select("*")
          .eq("profile_id", profile.id)
          .in("quiz_id", list.map((q) => q.id))
          .not("completed_at", "is", null)
          .order("score_percent", { ascending: false });
        const best: Record<string, QuizAttempt> = {};
        for (const a of (attempts as QuizAttempt[]) ?? []) {
          if (!best[a.quiz_id]) best[a.quiz_id] = a;
        }
        setBestAttempts(best);
      });
  }, [parishId, profile]);

  return (
    <ScreenContainer>
      <FlatList
        data={quizzes}
        keyExtractor={(item) => item.id}
        ListEmptyComponent={<EmptyState message={t("quiz.listEmpty")} />}
        renderItem={({ item }) => {
          const attempt = bestAttempts[item.id];
          return (
            <Card onPress={() => router.push(`/(tabs)/more/quiz/${item.id}`)}>
              <Text style={styles.title}>{item.title}</Text>
              {item.description && <Text style={styles.description}>{item.description}</Text>}
              {attempt ? (
                <Badge
                  label={t("quiz.bestScore", { percent: attempt.score_percent })}
                  tone={attempt.passed ? "success" : "default"}
                />
              ) : (
                <Text style={styles.notTaken}>{t("quiz.notTaken")}</Text>
              )}
            </Card>
          );
        }}
      />
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  title: { fontWeight: "700", color: colors.textPrimary, fontSize: 16 },
  description: { color: colors.textSecondary, marginTop: 4, marginBottom: 8, fontSize: 13 },
  notTaken: { color: colors.textSecondary, fontSize: 12, marginTop: 6 },
});
