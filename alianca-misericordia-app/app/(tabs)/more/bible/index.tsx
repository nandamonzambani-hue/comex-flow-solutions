import { useEffect, useMemo, useState } from "react";
import { SectionList, StyleSheet, Text, View } from "react-native";
import { router } from "expo-router";
import { useTranslation } from "react-i18next";
import { supabase } from "@/lib/supabase";
import { Card, ScreenContainer } from "@/components/ui";
import { colors } from "@/theme/colors";
import type { BibleBook, BibleVersion } from "@/types/database";

export default function BibleBooksScreen() {
  const { t, i18n } = useTranslation();
  const [versions, setVersions] = useState<BibleVersion[]>([]);
  const [versionId, setVersionId] = useState<string | null>(null);
  const [books, setBooks] = useState<BibleBook[]>([]);

  useEffect(() => {
    supabase
      .from("bible_versions")
      .select("*")
      .then(({ data }) => {
        const list = (data as BibleVersion[]) ?? [];
        setVersions(list);
        const langPrefix = i18n.language.split("-")[0];
        const match = list.find((v) => v.language.toLowerCase().startsWith(langPrefix)) ?? list[0];
        setVersionId(match?.id ?? null);
      });
  }, [i18n.language]);

  useEffect(() => {
    if (!versionId) return;
    supabase
      .from("bible_books")
      .select("*")
      .eq("version_id", versionId)
      .order("order_index")
      .then(({ data }) => setBooks((data as BibleBook[]) ?? []));
  }, [versionId]);

  const sections = useMemo(
    () => [
      { title: t("bible.oldTestament"), data: books.filter((b) => b.testament === "AT") },
      { title: t("bible.newTestament"), data: books.filter((b) => b.testament === "NT") },
    ],
    [books, t],
  );

  return (
    <ScreenContainer style={{ padding: 0 }}>
      {versions.length > 1 && (
        <View style={styles.versionRow}>
          {versions.map((v) => (
            <Text
              key={v.id}
              style={[styles.versionChip, versionId === v.id && styles.versionChipActive]}
              onPress={() => setVersionId(v.id)}
            >
              {v.name}
            </Text>
          ))}
        </View>
      )}
      <SectionList
        contentContainerStyle={{ padding: 16 }}
        sections={sections}
        keyExtractor={(item) => item.id}
        renderSectionHeader={({ section }) => <Text style={styles.sectionHeader}>{section.title}</Text>}
        renderItem={({ item }) => (
          <Card onPress={() => router.push(`/(tabs)/more/bible/${item.id}`)}>
            <Text style={styles.bookName}>{item.name}</Text>
            <Text style={styles.chapters}>{t("bible.chapterCount", { count: item.chapters_count })}</Text>
          </Card>
        )}
      />
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  versionRow: { flexDirection: "row", flexWrap: "wrap", gap: 8, padding: 16, paddingBottom: 0 },
  versionChip: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 6,
    fontSize: 12,
    color: colors.textSecondary,
    fontWeight: "600",
  },
  versionChipActive: { backgroundColor: colors.primary, color: "#fff", borderColor: colors.primary },
  sectionHeader: {
    fontSize: 13,
    fontWeight: "700",
    color: colors.textSecondary,
    textTransform: "uppercase",
    marginTop: 16,
    marginBottom: 8,
  },
  bookName: { fontWeight: "700", color: colors.textPrimary, fontSize: 15 },
  chapters: { color: colors.textSecondary, marginTop: 2, fontSize: 13 },
});
