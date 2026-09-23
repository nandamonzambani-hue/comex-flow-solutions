import { useEffect, useMemo, useState } from "react";
import { SectionList, StyleSheet, Text } from "react-native";
import { router } from "expo-router";
import { supabase } from "@/lib/supabase";
import { Card, ScreenContainer } from "@/components/ui";
import { colors } from "@/theme/colors";
import type { BibleBook } from "@/types/database";

const DEFAULT_VERSION = "ave-maria";

export default function BibleBooksScreen() {
  const [books, setBooks] = useState<BibleBook[]>([]);

  useEffect(() => {
    supabase
      .from("bible_books")
      .select("*")
      .eq("version_id", DEFAULT_VERSION)
      .order("order_index")
      .then(({ data }) => setBooks((data as BibleBook[]) ?? []));
  }, []);

  const sections = useMemo(
    () => [
      { title: "Antigo Testamento", data: books.filter((b) => b.testament === "AT") },
      { title: "Novo Testamento", data: books.filter((b) => b.testament === "NT") },
    ],
    [books],
  );

  return (
    <ScreenContainer style={{ padding: 0 }}>
      <SectionList
        contentContainerStyle={{ padding: 16 }}
        sections={sections}
        keyExtractor={(item) => item.id}
        renderSectionHeader={({ section }) => <Text style={styles.sectionHeader}>{section.title}</Text>}
        renderItem={({ item }) => (
          <Card onPress={() => router.push(`/(tabs)/more/bible/${item.id}`)}>
            <Text style={styles.bookName}>{item.name}</Text>
            <Text style={styles.chapters}>{item.chapters_count} capítulos</Text>
          </Card>
        )}
      />
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
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
