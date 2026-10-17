import { useEffect, useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text } from "react-native";
import { router } from "expo-router";
import { useTranslation } from "react-i18next";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/context/AuthContext";
import { useTheme } from "@/context/ParishContext";
import { Card } from "@/components/ui";
import { colors } from "@/theme/colors";
import type { Mood } from "@/types/database";

export const MOODS: { mood: Mood; emoji: string }[] = [
  { mood: "grato", emoji: "🙏" },
  { mood: "feliz", emoji: "😊" },
  { mood: "em_paz", emoji: "🕊️" },
  { mood: "cansado", emoji: "😮‍💨" },
  { mood: "ansioso", emoji: "😟" },
  { mood: "triste", emoji: "😢" },
  { mood: "precisando_de_oracao", emoji: "🤲" },
];

/**
 * "Como você está se sentindo hoje?" — check-in de um toque na Home
 * (inspirado na inChurch). Some depois que a pessoa responde no dia; a
 * equipe vê o termômetro no painel (admin → Início).
 */
export function MoodCheckin() {
  const { t } = useTranslation();
  const theme = useTheme();
  const { profile } = useAuth();
  const [answered, setAnswered] = useState<Mood | null>(null);
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    if (!profile) return;
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);
    supabase
      .from("mood_checkins")
      .select("mood")
      .eq("profile_id", profile.id)
      .gte("created_at", startOfDay.toISOString())
      .limit(1)
      .maybeSingle()
      .then(({ data }) => {
        setAnswered((data?.mood as Mood | undefined) ?? null);
        setChecked(true);
      });
  }, [profile]);

  async function choose(mood: Mood) {
    if (!profile) return;
    setAnswered(mood);
    await supabase.from("mood_checkins").insert({ profile_id: profile.id, parish_id: profile.parish_id, mood });
  }

  if (!checked || !profile) return null;

  if (answered) {
    return (
      <Card style={styles.card}>
        <Text style={styles.thanks}>
          {MOODS.find((m) => m.mood === answered)?.emoji} {t("mood.thanks")}
        </Text>
        {(answered === "precisando_de_oracao" || answered === "triste" || answered === "ansioso") && (
          <Pressable onPress={() => router.push("/(tabs)/more/prayer" as never)}>
            <Text style={[styles.link, { color: theme.primary }]}>{t("mood.askPrayer")}</Text>
          </Pressable>
        )}
      </Card>
    );
  }

  return (
    <Card style={styles.card}>
      <Text style={styles.question}>{t("mood.question")}</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.row}>
        {MOODS.map((item) => (
          <Pressable key={item.mood} style={styles.chip} onPress={() => choose(item.mood)}>
            <Text style={styles.emoji}>{item.emoji}</Text>
            <Text style={styles.chipLabel}>{t(`mood.options.${item.mood}`)}</Text>
          </Pressable>
        ))}
      </ScrollView>
    </Card>
  );
}

const styles = StyleSheet.create({
  card: { paddingVertical: 12 },
  question: { fontWeight: "700", color: colors.textPrimary, marginBottom: 8 },
  row: { gap: 8 },
  chip: {
    alignItems: "center",
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    minWidth: 72,
  },
  emoji: { fontSize: 22 },
  chipLabel: { fontSize: 11, color: colors.textSecondary, marginTop: 4 },
  thanks: { color: colors.textPrimary, fontWeight: "600" },
  link: { fontWeight: "700", marginTop: 8 },
});
