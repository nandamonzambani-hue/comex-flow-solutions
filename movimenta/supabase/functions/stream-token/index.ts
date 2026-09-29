// App: devolve a URL de reprodução assinada de um vídeo, se a aluna puder assisti-lo.
// Vídeos de treinos gratuitos liberam para todas; os demais exigem assinatura ativa
// (a administração pode assistir a todos para conferir o conteúdo).
import { HttpError, json, serve } from "../_shared/http.ts";
import { adminClient, hasActiveSubscription, isAdmin, requireUser } from "../_shared/supabase.ts";
import { playbackUrls, signStreamToken } from "../_shared/cloudflare.ts";

serve(async (req) => {
  const user = await requireUser(req);
  const { videoId } = await req.json();
  if (!videoId) throw new HttpError("videoId obrigatório");

  const db = adminClient();
  const { data: video } = await db.from("videos")
    .select("id, cloudflare_uid, status").eq("id", videoId).maybeSingle();
  if (!video || video.status !== "pronto" || !video.cloudflare_uid) {
    throw new HttpError("Vídeo indisponível", 404);
  }

  // O vídeo é livre se pertencer a algum exercício de um treino gratuito publicado.
  const { data: free } = await db.from("workout_exercises")
    .select("workout_id, workouts!inner(is_free, published), exercises!inner(video_id)")
    .eq("exercises.video_id", videoId)
    .eq("workouts.is_free", true)
    .eq("workouts.published", true)
    .limit(1);

  const isFree = (free?.length ?? 0) > 0;
  if (!isFree && !(await hasActiveSubscription(user.id)) && !(await isAdmin(user.id))) {
    throw new HttpError("Conteúdo exclusivo para assinantes", 402);
  }

  const token = await signStreamToken(video.cloudflare_uid);
  return json(playbackUrls(token));
});
