import { useEffect, useState } from "react";
import { ScrollView, StyleSheet, Text } from "react-native";
import { useLocalSearchParams } from "expo-router";
import { useVideoPlayer, VideoView } from "expo-video";
import { supabase } from "@/lib/supabase";
import { colors } from "@/theme/colors";
import type { MediaContent } from "@/types/database";

export default function MediaDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [item, setItem] = useState<MediaContent | null>(null);

  useEffect(() => {
    supabase
      .from("media_content")
      .select("*")
      .eq("id", id)
      .single()
      .then(({ data }) => {
        setItem(data as MediaContent);
        if (data) {
          // incrementa visualizações (best-effort, não bloqueia a tela)
          supabase
            .from("media_content")
            .update({ views_count: (data as MediaContent).views_count + 1 })
            .eq("id", id);
        }
      });
  }, [id]);

  const player = useVideoPlayer(item?.video_url ?? "", (p) => {
    p.loop = false;
  });

  if (!item) return null;

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {item.content_type === "video" && item.video_url && (
        <VideoView player={player} style={styles.video} allowsFullscreen nativeControls />
      )}
      <Text style={styles.title}>{item.title}</Text>
      {item.description && <Text style={styles.description}>{item.description}</Text>}
      {item.content_type === "article" && item.body && <Text style={styles.body}>{item.body}</Text>}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 20, backgroundColor: colors.background, flexGrow: 1 },
  video: { width: "100%", height: 220, borderRadius: 12, marginBottom: 16, backgroundColor: "#000" },
  title: { fontSize: 22, fontWeight: "700", color: colors.textPrimary },
  description: { color: colors.textSecondary, marginTop: 10, lineHeight: 21 },
  body: { color: colors.textPrimary, marginTop: 16, lineHeight: 23, fontSize: 15 },
});
