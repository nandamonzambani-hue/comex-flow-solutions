import { useEffect, useState } from "react";
import { FlatList, Pressable, StyleSheet, Text } from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { supabase } from "@/lib/supabase";
import { ScreenContainer } from "@/components/ui";
import { colors } from "@/theme/colors";
import type { BibleBook } from "@/types/database";

export default function BibleChaptersScreen() {
  const { bookId } = useLocalSearchParams<{ bookId: string }>();
  const [book, setBook] = useState<BibleBook | null>(null);

  useEffect(() => {
    supabase
      .from("bible_books")
      .select("*")
      .eq("id", bookId)
      .single()
      .then(({ data }) => setBook(data as BibleBook));
  }, [bookId]);

  if (!book) return null;

  const chapters = Array.from({ length: book.chapters_count }, (_, i) => i + 1);

  return (
    <ScreenContainer>
      <FlatList
        data={chapters}
        keyExtractor={(n) => String(n)}
        numColumns={5}
        columnWrapperStyle={{ gap: 10 }}
        contentContainerStyle={{ gap: 10 }}
        renderItem={({ item }) => (
          <Pressable style={styles.chapterButton} onPress={() => router.push(`/(tabs)/more/bible/${bookId}/${item}`)}>
            <Text style={styles.chapterNumber}>{item}</Text>
          </Pressable>
        )}
      />
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  chapterButton: {
    width: 56,
    height: 56,
    borderRadius: 10,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: "center",
    justifyContent: "center",
  },
  chapterNumber: { fontWeight: "700", color: colors.textPrimary },
});
