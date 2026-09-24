import { useEffect, useState } from "react";
import { FlatList, StyleSheet, Text, View } from "react-native";
import { Image } from "expo-image";
import { router } from "expo-router";
import { useTranslation } from "react-i18next";
import { supabase } from "@/lib/supabase";
import { useParishId } from "@/hooks/useParish";
import { useLocalizedField } from "@/lib/localized";
import { Badge, Card, EmptyState, ScreenContainer } from "@/components/ui";
import { colors } from "@/theme/colors";
import type { MediaContent } from "@/types/database";

export default function MediaListScreen() {
  const { t } = useTranslation();
  const localize = useLocalizedField();
  const parishId = useParishId();
  const [items, setItems] = useState<MediaContent[]>([]);

  const CONTENT_TYPE_LABEL: Record<MediaContent["content_type"], string> = {
    video: t("media.types.video"),
    article: t("media.types.article"),
    audio: t("media.types.audio"),
    live: t("media.types.live"),
  };

  useEffect(() => {
    if (!parishId) return;
    supabase
      .from("media_content")
      .select("*")
      .eq("parish_id", parishId)
      .not("published_at", "is", null)
      .order("published_at", { ascending: false })
      .then(({ data }) => setItems((data as MediaContent[]) ?? []));
  }, [parishId]);

  return (
    <ScreenContainer>
      <FlatList
        data={items}
        keyExtractor={(item) => item.id}
        ListEmptyComponent={<EmptyState message={t("media.empty")} />}
        renderItem={({ item }) => (
          <Card onPress={() => router.push(`/(tabs)/more/media/${item.id}`)}>
            <View style={{ flexDirection: "row", gap: 12 }}>
              {item.thumbnail_url && (
                <Image source={{ uri: item.thumbnail_url }} style={styles.thumb} contentFit="cover" />
              )}
              <View style={{ flex: 1 }}>
                <Badge label={CONTENT_TYPE_LABEL[item.content_type]} />
                <Text style={styles.title} numberOfLines={2}>
                  {localize(item, "title")}
                </Text>
                {item.category && <Text style={styles.category}>{item.category}</Text>}
              </View>
            </View>
          </Card>
        )}
      />
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  thumb: { width: 80, height: 80, borderRadius: 10 },
  title: { fontWeight: "700", color: colors.textPrimary, marginTop: 6, fontSize: 15 },
  category: { color: colors.textSecondary, marginTop: 4, fontSize: 12 },
});
