// Painel admin: cria uma URL de upload direto no Cloudflare Stream.
// O navegador envia o arquivo direto para a Cloudflare, sem passar pelo nosso servidor.
import { HttpError, json, serve } from "../_shared/http.ts";
import { adminClient, requireAdmin } from "../_shared/supabase.ts";
import { cfFetch } from "../_shared/cloudflare.ts";

serve(async (req) => {
  await requireAdmin(req);
  const { title, category, muscleGroup, level, maxDurationSeconds } = await req.json();
  if (!title || typeof title !== "string") throw new HttpError("Informe o título do vídeo");

  const upload = await cfFetch<{ uploadURL: string; uid: string }>("/stream/direct_upload", {
    method: "POST",
    body: JSON.stringify({
      maxDurationSeconds: Math.min(Number(maxDurationSeconds) || 1800, 21600),
      requireSignedURLs: true,
      meta: { name: title },
    }),
  });

  const { data, error } = await adminClient().from("videos").insert({
    title,
    category: category ?? null,
    muscle_group: muscleGroup ?? null,
    level: level ?? null,
    cloudflare_uid: upload.uid,
    status: "aguardando_upload",
  }).select().single();
  if (error) throw error;

  return json({ uploadURL: upload.uploadURL, video: data });
});
