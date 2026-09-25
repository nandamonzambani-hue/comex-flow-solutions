import { useCallback, useEffect, useRef, useState } from "react";
import { Alert, Image, ScrollView, StyleSheet, Text, View } from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { useVideoPlayer, VideoView } from "expo-video";
import { useTranslation } from "react-i18next";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/context/AuthContext";
import { Badge, Button, Card } from "@/components/ui";
import { colors } from "@/theme/colors";
import type { Quiz, Video } from "@/types/database";

export default function VideoDetailScreen() {
  const { t } = useTranslation();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { profile } = useAuth();
  const [video, setVideo] = useState<Video | null>(null);
  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [notFound, setNotFound] = useState(false);
  const [buying, setBuying] = useState(false);
  const [pix, setPix] = useState<{ qr: string; qrBase64?: string } | null>(null);
  const watchedSecondsRef = useRef(0);

  const player = useVideoPlayer(video?.video_url ?? null, (p) => {
    p.loop = false;
  });

  const load = useCallback(async () => {
    // Se a RLS não deixar ver a linha (sem acesso), a query volta vazia —
    // tratamos como "não encontrado" em vez de erro.
    const { data } = await supabase.from("videos").select("*").eq("id", id).maybeSingle();
    if (!data) {
      setNotFound(true);
      return;
    }
    setVideo(data as Video);
    await supabase.from("videos").update({ views_count: (data as Video).views_count + 1 }).eq("id", id);

    const { data: quizData } = await supabase.from("quizzes").select("*").eq("video_id", id).eq("is_published", true).maybeSingle();
    setQuiz((quizData as Quiz) ?? null);
  }, [id]);

  useEffect(() => {
    load();
  }, [load]);

  // Salva o progresso periodicamente enquanto assiste, e marca como
  // concluído quando chega perto do fim.
  useEffect(() => {
    if (!video || !profile) return;
    const interval = setInterval(async () => {
      const current = Math.floor(player.currentTime ?? 0);
      if (current <= watchedSecondsRef.current) return;
      watchedSecondsRef.current = current;
      const duration = video.duration_seconds ?? player.duration ?? 0;
      const isComplete = duration > 0 && current >= duration - 5;
      await supabase.from("video_progress").upsert(
        {
          video_id: video.id,
          profile_id: profile.id,
          watched_seconds: current,
          last_watched_at: new Date().toISOString(),
          completed_at: isComplete ? new Date().toISOString() : null,
        },
        { onConflict: "video_id,profile_id" },
      );
    }, 5000);
    return () => clearInterval(interval);
  }, [video, profile, player]);

  async function handleBuy() {
    if (!video) return;
    setBuying(true);
    try {
      const { data, error } = await supabase.functions.invoke("create-video-payment", {
        body: { video_id: video.id },
      });
      if (error) throw error;
      setPix({ qr: data.pix_qr_code, qrBase64: data.pix_qr_code_base64 });
    } catch (err) {
      Alert.alert(t("common.error"), err instanceof Error ? err.message : t("videos.buyError"));
    } finally {
      setBuying(false);
    }
  }

  if (notFound) {
    return (
      <View style={styles.lockedContainer}>
        <Text style={styles.lockedTitle}>{t("videos.locked")}</Text>
        <Text style={styles.lockedText}>{t("videos.lockedBody")}</Text>
        <Button title={t("common.back")} variant="outline" onPress={() => router.back()} />
      </View>
    );
  }

  if (!video) return null;

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <VideoView player={player} style={styles.player} allowsFullscreen allowsPictureInPicture nativeControls />

      <Text style={styles.title}>{video.title}</Text>
      {video.description && <Text style={styles.description}>{video.description}</Text>}

      <View style={styles.body}>
        {quiz && (
          <Card onPress={() => router.push(`/(tabs)/videos/${video.id}/quiz`)}>
            <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
              <Text style={styles.quizTitle}>📝 {quiz.title}</Text>
              <Badge label={t("quiz.take")} />
            </View>
          </Card>
        )}

        {video.access_type === "paid" && (
          <Card>
            {pix ? (
              <View style={{ alignItems: "center", gap: 10 }}>
                {pix.qrBase64 && (
                  <Image source={{ uri: `data:image/png;base64,${pix.qrBase64}` }} style={{ width: 200, height: 200 }} />
                )}
                <Text style={styles.pixCode} selectable numberOfLines={3}>
                  {pix.qr}
                </Text>
                <Text style={styles.pixHint}>{t("videos.pixHint")}</Text>
              </View>
            ) : (
              <>
                <Text style={styles.price}>
                  {t("videos.price", { amount: video.price_amount?.toFixed(2).replace(".", ",") })}
                </Text>
                <Button title={t("videos.buy")} onPress={handleBuy} loading={buying} />
              </>
            )}
          </Card>
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { backgroundColor: colors.background, flexGrow: 1, paddingBottom: 24 },
  player: { width: "100%", aspectRatio: 16 / 9, backgroundColor: "#000" },
  title: { fontSize: 20, fontWeight: "700", color: colors.textPrimary, marginTop: 16, marginHorizontal: 20 },
  description: { color: colors.textSecondary, marginTop: 8, marginHorizontal: 20, lineHeight: 21 },
  body: { paddingHorizontal: 20, marginTop: 16, gap: 4 },
  quizTitle: { fontWeight: "700", color: colors.textPrimary },
  price: { fontSize: 18, fontWeight: "700", color: colors.primary, marginBottom: 10, textAlign: "center" },
  pixCode: { color: colors.textSecondary, fontSize: 11, textAlign: "center", paddingHorizontal: 10 },
  pixHint: { color: colors.textSecondary, fontSize: 12, textAlign: "center" },
  lockedContainer: { flex: 1, backgroundColor: colors.background, alignItems: "center", justifyContent: "center", padding: 24, gap: 12 },
  lockedTitle: { fontSize: 20, fontWeight: "700", color: colors.textPrimary },
  lockedText: { color: colors.textSecondary, textAlign: "center" },
});
