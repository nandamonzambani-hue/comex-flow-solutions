// Painel admin: apaga o vídeo na Cloudflare (para de cobrar armazenamento) e no banco.
// Exercícios que usavam o vídeo ficam sem vídeo (on delete set null).
import { env, HttpError, json, serve } from "../_shared/http.ts";
import { adminClient, requireAdmin } from "../_shared/supabase.ts";

serve(async (req) => {
  await requireAdmin(req);
  const { videoId } = await req.json();
  if (!videoId) throw new HttpError("videoId obrigatório");

  const db = adminClient();
  const { data: video } = await db.from("videos").select("cloudflare_uid").eq("id", videoId).maybeSingle();
  if (!video) throw new HttpError("Vídeo não encontrado", 404);

  if (video.cloudflare_uid) {
    const res = await fetch(
      `https://api.cloudflare.com/client/v4/accounts/${env("CF_ACCOUNT_ID")}/stream/${video.cloudflare_uid}`,
      { method: "DELETE", headers: { Authorization: `Bearer ${env("CF_STREAM_API_TOKEN")}` } },
    );
    // 404 = já não existe na Cloudflare; seguimos apagando do banco.
    if (!res.ok && res.status !== 404) throw new HttpError(`Cloudflare recusou a exclusão (${res.status})`, 502);
  }

  const { error } = await db.from("videos").delete().eq("id", videoId);
  if (error) throw error;
  return json({ ok: true });
});
