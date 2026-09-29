// Integração com o RevenueCat, que valida as compras da App Store e do Google Play.
// Nunca confiamos no conteúdo do webhook: sempre buscamos o estado atual da aluna
// na API do RevenueCat (resolve eventos fora de ordem e repetidos).
import { env } from "./http.ts";
import { adminClient } from "./supabase.ts";

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/** O app identifica a aluna no RevenueCat pelo id do Supabase; ids anônimos são ignorados. */
export function isSupabaseUserId(id: unknown): id is string {
  return typeof id === "string" && UUID.test(id);
}

type RcEntitlement = {
  expires_date: string | null;
  product_identifier: string;
  grace_period_expires_date?: string | null;
};
type RcSubscription = {
  expires_date: string | null;
  grace_period_expires_date?: string | null;
  store: string;
  period_type: string;
  unsubscribe_detected_at: string | null;
  billing_issues_detected_at: string | null;
  is_sandbox: boolean;
};
type RcSubscriber = {
  entitlements: Record<string, RcEntitlement>;
  subscriptions: Record<string, RcSubscription>;
};

async function rcFetch(path: string, init: RequestInit = {}): Promise<Response> {
  return await fetch(`https://api.revenuecat.com/v1${path}`, {
    ...init,
    headers: {
      Authorization: `Bearer ${env("REVENUECAT_SECRET_API_KEY")}`,
      "Content-Type": "application/json",
      ...(init.headers ?? {}),
    },
  });
}

function latest(...dates: (string | null | undefined)[]): string | null {
  const valid = dates.filter((d): d is string => Boolean(d));
  if (valid.length === 0) return null;
  return valid.reduce((a, b) => (new Date(a) > new Date(b) ? a : b));
}

/** Busca a aluna no RevenueCat e grava o resultado em store_subscriptions. */
export async function syncSubscriber(userId: string) {
  const res = await rcFetch(`/subscribers/${encodeURIComponent(userId)}`);
  if (!res.ok) throw new Error(`RevenueCat respondeu ${res.status}`);
  const { subscriber } = (await res.json()) as { subscriber: RcSubscriber };

  const db = adminClient();
  const entitlementId = Deno.env.get("REVENUECAT_ENTITLEMENT") || "premium";
  const ent = subscriber.entitlements?.[entitlementId];

  if (!ent) {
    // Nunca comprou pela loja: se havia registro, marca como expirado.
    const { data } = await db.from("store_subscriptions")
      .update({ status: "expired", will_renew: false, updated_at: new Date().toISOString() })
      .eq("user_id", userId).select().maybeSingle();
    return data;
  }

  const sub = subscriber.subscriptions?.[ent.product_identifier];
  // Considera o período de carência (cobrança falhou, mas a loja ainda tenta cobrar).
  const end = ent.expires_date === null
    ? null
    : latest(ent.expires_date, ent.grace_period_expires_date, sub?.grace_period_expires_date);
  const active = end === null || new Date(end) > new Date();

  const row = {
    user_id: userId,
    store: sub?.store ?? "promotional",
    product_id: ent.product_identifier,
    status: !active ? "expired" : sub?.period_type === "trial" ? "trialing" : "active",
    current_period_end: end,
    will_renew: Boolean(sub && !sub.unsubscribe_detected_at && active),
    billing_issue: Boolean(sub?.billing_issues_detected_at),
    is_sandbox: Boolean(sub?.is_sandbox),
    updated_at: new Date().toISOString(),
  };
  const { data, error } = await db.from("store_subscriptions").upsert(row).select().single();
  if (error) throw error;
  return data;
}

/** Apaga a aluna no RevenueCat (exclusão de conta / LGPD). Não cancela a cobrança na loja. */
export async function deleteSubscriber(userId: string) {
  if (!Deno.env.get("REVENUECAT_SECRET_API_KEY")) return;
  const res = await rcFetch(`/subscribers/${encodeURIComponent(userId)}`, { method: "DELETE" });
  if (!res.ok && res.status !== 404) console.error("RevenueCat: falha ao apagar", res.status);
}
