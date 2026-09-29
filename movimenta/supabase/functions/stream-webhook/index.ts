// Cloudflare avisa quando o vídeo termina de processar.
import { env, error, json } from "../_shared/http.ts";
import { adminClient } from "../_shared/supabase.ts";
import { verifyStreamWebhook } from "../_shared/cloudflare.ts";

Deno.serve(async (req) => {
  const body = await req.text();
  const ok = await verifyStreamWebhook(body, req.headers.get("Webhook-Signature"), env("CF_STREAM_WEBHOOK_SECRET"));
  if (!ok) return error("Assinatura inválida", 401);

  const payload = JSON.parse(body);
  const state = payload?.status?.state as string | undefined;
  const status = payload.readyToStream ? "pronto" : state === "error" ? "erro" : "processando";

  const { error: dbError } = await adminClient().from("videos").update({
    status,
    duration_seconds: payload.duration > 0 ? Math.round(payload.duration) : null,
    thumbnail_url: payload.thumbnail ?? null,
  }).eq("cloudflare_uid", payload.uid);
  if (dbError) {
    console.error(dbError);
    return error("Falha ao atualizar", 500);
  }
  return json({ ok: true });
});
