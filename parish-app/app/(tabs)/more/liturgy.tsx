import { useEffect, useState } from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { format } from "date-fns";
import { useTranslation } from "react-i18next";
import { supabase } from "@/lib/supabase";
import { useDateLocale } from "@/lib/dateLocale";
import { Badge, Card, EmptyState } from "@/components/ui";
import { colors } from "@/theme/colors";
import type { DailyLiturgy } from "@/types/database";

function ReadingBlock({ label, ref, text }: { label: string; ref: string | null; text: string | null }) {
  if (!ref) return null;
  return (
    <Card>
      <Text style={styles.readingLabel}>{label}</Text>
      <Text style={styles.readingRef}>{ref}</Text>
      {text && <Text style={styles.readingText}>{text}</Text>}
    </Card>
  );
}

export default function DailyLiturgyScreen() {
  const { t, i18n } = useTranslation();
  const dateLocale = useDateLocale();
  const [liturgy, setLiturgy] = useState<DailyLiturgy | null>(null);
  const today = new Date();
  const todayISO = today.toISOString().slice(0, 10);

  useEffect(() => {
    supabase
      .from("daily_liturgy")
      .select("*")
      .eq("date", todayISO)
      .eq("locale", i18n.language)
      .maybeSingle()
      .then(({ data }) => {
        if (data) {
          setLiturgy(data as DailyLiturgy);
        } else {
          // sem tradução para o idioma ativo: cai para o texto principal (pt-BR)
          supabase
            .from("daily_liturgy")
            .select("*")
            .eq("date", todayISO)
            .eq("locale", "pt-BR")
            .maybeSingle()
            .then(({ data: fallback }) => setLiturgy(fallback as DailyLiturgy | null));
        }
      });
  }, [todayISO, i18n.language]);

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.date}>{format(today, "EEEE, dd MMMM yyyy", { locale: dateLocale })}</Text>

      {!liturgy ? (
        <EmptyState message={t("liturgy.empty")} />
      ) : (
        <>
          <View style={styles.headerRow}>
            <Text style={styles.celebration}>{liturgy.celebration}</Text>
            {liturgy.liturgical_color && <Badge label={liturgy.liturgical_color} />}
          </View>
          {liturgy.saint_of_day && <Text style={styles.saint}>{liturgy.saint_of_day}</Text>}

          <ReadingBlock label={t("liturgy.firstReading")} ref={liturgy.first_reading_ref} text={liturgy.first_reading_text} />
          <ReadingBlock label={t("liturgy.psalm")} ref={liturgy.psalm_ref} text={liturgy.psalm_text} />
          <ReadingBlock label={t("liturgy.secondReading")} ref={liturgy.second_reading_ref} text={liturgy.second_reading_text} />
          <ReadingBlock label={t("liturgy.gospel")} ref={liturgy.gospel_ref} text={liturgy.gospel_text} />

          {liturgy.reflection && (
            <Card>
              <Text style={styles.readingLabel}>{t("liturgy.reflection")}</Text>
              <Text style={styles.readingText}>{liturgy.reflection}</Text>
            </Card>
          )}
        </>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 20, backgroundColor: colors.background, flexGrow: 1 },
  date: { color: colors.secondary, fontWeight: "600", textTransform: "capitalize", marginBottom: 8 },
  headerRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 4 },
  celebration: { fontSize: 20, fontWeight: "700", color: colors.textPrimary, flex: 1, marginRight: 8 },
  saint: { color: colors.textSecondary, marginBottom: 16, fontStyle: "italic" },
  readingLabel: { color: colors.primary, fontWeight: "700", fontSize: 13, textTransform: "uppercase" },
  readingRef: { color: colors.textSecondary, marginTop: 2, marginBottom: 8, fontSize: 13 },
  readingText: { color: colors.textPrimary, lineHeight: 22, fontSize: 15 },
});
