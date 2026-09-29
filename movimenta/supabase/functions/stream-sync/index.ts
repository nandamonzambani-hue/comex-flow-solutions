// Painel admin: consulta o vídeo na Cloudflare e atualiza o status no banco.
// Útil se o webhook do Stream ainda não estiver configurado ou tiver falhado.
import { HttpError, json, serve } from "../_shared/http.ts";
import { adminClient, requireAdmin } from "../_shared/supabase.ts";
import { cfFetch } from "../_shared/cloudflare.ts";

type StreamVideo = {
  uid: string;
  readyToStream: boolean;
  duration: number;
  status?: { state?: string };
};

serve(async (req) => {
  await requireAdmin(req);
  const { videoId } = await req.json();
  if (!videoId) throw new HttpError("videoId obrigatório");

  const db = adminClient();
  const { data: video } = await db.from("videos").select("cloudflare_uid").eq("id", videoId).maybeSingle();
  if (!video?.cloudflare_uid) throw new HttpError("Vídeo sem arquivo na Cloudflare", 404);

  const cf = await cfFetch<StreamVideo>(`/stream/${video.cloudflare_uid}`);
  const state = cf.status?.state;
  const status = cf.readyToStream
    ? "pronto"
    : state === "error"
    ? "erro"
    : state === "pendingupload"
    ? "aguardando_upload"
    : "processando";

  const { data, error } = await db.from("videos").update({
    status,
    duration_seconds: cf.duration > 0 ? Math.round(cf.duration) : null,
  }).eq("id", videoId).select().single();
  if (error) throw error;
  return json({ video: data });
});
