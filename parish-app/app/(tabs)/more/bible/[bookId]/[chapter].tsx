import { useEffect, useState } from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { useLocalSearchParams } from "expo-router";
import { supabase } from "@/lib/supabase";
import { EmptyState } from "@/components/ui";
import { colors } from "@/theme/colors";
import type { BibleBook, BibleVerse } from "@/types/database";

export default function BibleReadingScreen() {
  const { bookId, chapter } = useLocalSearchParams<{ bookId: string; chapter: string }>();
  const [book, setBook] = useState<BibleBook | null>(null);
  const [verses, setVerses] = useState<BibleVerse[]>([]);

  useEffect(() => {
    supabase
      .from("bible_books")
      .select("*")
      .eq("id", bookId)
      .single()
      .then(({ data }) => setBook(data as BibleBook));

    supabase
      .from("bible_verses")
      .select("*")
      .eq("book_id", bookId)
      .eq("chapter", Number(chapter))
      .order("verse")
      .then(({ data }) => setVerses((data as BibleVerse[]) ?? []));
  }, [bookId, chapter]);

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.heading}>
        {book?.name} {chapter}
      </Text>
      {verses.length === 0 && (
        <EmptyState message="Texto ainda não sincronizado para este capítulo. Veja docs/CONTENT_GUIDE.md sobre a sincronização da Bíblia." />
      )}
      {verses.map((v) => (
        <Text key={v.id} style={styles.verse}>
          <Text style={styles.verseNumber}>{v.verse} </Text>
          {v.text}
        </Text>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 20, backgroundColor: colors.background, flexGrow: 1 },
  heading: { fontSize: 22, fontWeight: "700", color: colors.textPrimary, marginBottom: 16 },
  verse: { color: colors.textPrimary, fontSize: 16, lineHeight: 26, marginBottom: 6 },
  verseNumber: { color: colors.secondary, fontWeight: "700", fontSize: 13 },
});
