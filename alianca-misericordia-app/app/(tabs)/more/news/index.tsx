import { useEffect, useState } from "react";
import { FlatList, StyleSheet, Text, View } from "react-native";
import { Image } from "expo-image";
import { router } from "expo-router";
import { format } from "date-fns";
import { useTranslation } from "react-i18next";
import { supabase } from "@/lib/supabase";
import { useDateLocale } from "@/lib/dateLocale";
import { Badge, Card, EmptyState, ScreenContainer } from "@/components/ui";
import { colors } from "@/theme/colors";
import type { NewsPost } from "@/types/database";

export default function NewsListScreen() {
  const { t } = useTranslation();
  const dateLocale = useDateLocale();
  const [items, setItems] = useState<NewsPost[]>([]);

  useEffect(() => {
    supabase
      .from("news_posts")
      .select("*")
      .not("published_at", "is", null)
      .order("is_pinned", { ascending: false })
      .order("published_at", { ascending: false })
      .then(({ data }) => setItems((data as NewsPost[]) ?? []));
  }, []);

  return (
    <ScreenContainer>
      <FlatList
        data={items}
        keyExtractor={(item) => item.id}
        ListEmptyComponent={<EmptyState message={t("news.empty")} />}
        renderItem={({ item }) => (
          <Card onPress={() => router.push(`/(tabs)/more/news/${item.id}`)}>
            {item.cover_image_url && (
              <Image source={{ uri: item.cover_image_url }} style={styles.cover} contentFit="cover" />
            )}
            <View style={{ flexDirection: "row", gap: 8, alignItems: "center" }}>
              {item.is_pinned && <Badge label={t("news.pinned")} tone="warning" />}
              <Text style={styles.category}>{item.category}</Text>
            </View>
            <Text style={styles.title}>{item.title}</Text>
            {item.subtitle && <Text style={styles.subtitle}>{item.subtitle}</Text>}
            {item.published_at && (
              <Text style={styles.date}>{format(new Date(item.published_at), "dd/MM/yyyy", { locale: dateLocale })}</Text>
            )}
          </Card>
        )}
      />
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  cover: { width: "100%", height: 140, borderRadius: 10, marginBottom: 10 },
  category: { color: colors.textSecondary, fontSize: 12, textTransform: "uppercase", fontWeight: "600" },
  title: { fontSize: 17, fontWeight: "700", color: colors.textPrimary, marginTop: 6 },
  subtitle: { color: colors.textSecondary, marginTop: 4 },
  date: { color: colors.textSecondary, marginTop: 8, fontSize: 12 },
});
