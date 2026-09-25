import { useCallback, useEffect, useState } from "react";
import { FlatList, StyleSheet, Text, View } from "react-native";
import { router, useFocusEffect } from "expo-router";
import { useTranslation } from "react-i18next";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/context/AuthContext";
import { Badge, Card, EmptyState, ScreenContainer } from "@/components/ui";
import { colors } from "@/theme/colors";
import type { Course, Video, VideoProgress } from "@/types/database";

export default function VideosListScreen() {
  const { t } = useTranslation();
  const { profile } = useAuth();
  const [videos, setVideos] = useState<Video[]>([]);
  const [courses, setCourses] = useState<Record<string, Course>>({});
  const [progressByVideo, setProgressByVideo] = useState<Record<string, VideoProgress>>({});
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    // RLS já filtra pra só devolver os vídeos que este usuário pode ver
    // (públicos, da sua cor/nível/grupo, ou já comprados) — não precisa
    // repetir a lógica de acesso aqui no cliente.
    const { data: videoData } = await supabase.from("videos").select("*").order("sort_order");
    setVideos((videoData as Video[]) ?? []);

    const { data: courseData } = await supabase.from("courses").select("*");
    const courseMap: Record<string, Course> = {};
    for (const c of (courseData as Course[]) ?? []) courseMap[c.id] = c;
    setCourses(courseMap);

    if (profile) {
      const { data: progressData } = await supabase.from("video_progress").select("*").eq("profile_id", profile.id);
      const progressMap: Record<string, VideoProgress> = {};
      for (const p of (progressData as VideoProgress[]) ?? []) progressMap[p.video_id] = p;
      setProgressByVideo(progressMap);
    }
    setLoading(false);
  }, [profile]);

  useEffect(() => {
    load();
  }, [load]);

  // Recarrega ao voltar pra esta tela (ex: depois de assistir um vídeo,
  // ou de completar uma compra), pra refletir progresso/acesso atualizado.
  useFocusEffect(
    useCallback(() => {
      load();
    }, [load]),
  );

  function formatDuration(seconds: number | null) {
    if (!seconds) return "";
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, "0")}`;
  }

  return (
    <ScreenContainer style={{ padding: 0 }}>
      <FlatList
        contentContainerStyle={{ padding: 16 }}
        data={videos}
        keyExtractor={(item) => item.id}
        ListEmptyComponent={!loading ? <EmptyState message={t("videos.empty")} /> : null}
        renderItem={({ item }) => {
          const progress = progressByVideo[item.id];
          const completed = !!progress?.completed_at;
          const course = item.course_id ? courses[item.course_id] : null;
          return (
            <Card onPress={() => router.push(`/(tabs)/videos/${item.id}`)}>
              <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start" }}>
                <View style={{ flex: 1 }}>
                  {course && <Text style={styles.course}>{course.title}</Text>}
                  <Text style={styles.title}>{item.title}</Text>
                  {item.duration_seconds != null && (
                    <Text style={styles.meta}>{formatDuration(item.duration_seconds)}</Text>
                  )}
                </View>
                {item.access_type === "paid" && <Badge label={t("videos.paid")} tone="warning" />}
                {completed && <Badge label={t("videos.completed")} tone="success" />}
              </View>
            </Card>
          );
        }}
      />
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  course: { color: colors.secondary, fontSize: 11, fontWeight: "700", textTransform: "uppercase" },
  title: { fontSize: 16, fontWeight: "700", color: colors.textPrimary, marginTop: 2 },
  meta: { color: colors.textSecondary, marginTop: 4, fontSize: 12 },
});
