// Webhook do RevenueCat: compra, renovação, cancelamento, expiração, reembolso,
// problema de cobrança, troca de plano, transferência etc.
import { env, error, json } from "../_shared/http.ts";
import { isSupabaseUserId, syncSubscriber } from "../_shared/revenuecat.ts";

function safeEqual(a: string, b: string): boolean {
  const x = new TextEncoder().encode(a);
  const y = new TextEncoder().encode(b);
  if (x.length !== y.length) return false;
  let diff = 0;
  for (let i = 0; i < x.length; i++) diff |= x[i] ^ y[i];
  return diff === 0;
}

Deno.serve(async (req) => {
  // O valor do cabeçalho Authorization é definido por você no painel do RevenueCat.
  const auth = req.headers.get("Authorization") ?? "";
  if (!safeEqual(auth, env("REVENUECAT_WEBHOOK_AUTH"))) return error("Não autorizado", 401);

  const body = await req.json().catch(() => null);
  const event = body?.event;
  if (!event) return error("Evento inválido");
  if (event.type === "TEST") return json({ ok: true, test: true });

  const ids = new Set<string>(
    [
      event.app_user_id,
      event.original_app_user_id,
      ...(event.aliases ?? []),
      ...(event.transferred_from ?? []),
      ...(event.transferred_to ?? []),
    ].filter(isSupabaseUserId),
  );

  try {
    for (const id of ids) await syncSubscriber(id);
  } catch (e) {
    console.error("Falha ao sincronizar", event.type, e);
    return error("Falha ao sincronizar", 500); // o RevenueCat tenta de novo
  }
  return json({ ok: true, synced: ids.size });
});
