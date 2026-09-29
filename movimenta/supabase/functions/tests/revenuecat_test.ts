// deno test --allow-env --allow-net tests/  (a rede é simulada; nada sai da máquina)
import { assertEquals } from "jsr:@std/assert@1";

Deno.env.set("SUPABASE_URL", "https://teste.supabase.co");
Deno.env.set("SUPABASE_SERVICE_ROLE_KEY", "service");
Deno.env.set("REVENUECAT_SECRET_API_KEY", "sk_test");

const { syncSubscriber, isSupabaseUserId } = await import("../_shared/revenuecat.ts");

const USER = "00000000-0000-0000-0000-00000000000d";
const future = new Date(Date.now() + 30 * 864e5).toISOString();
const past = new Date(Date.now() - 864e5).toISOString();

/** Simula a API do RevenueCat e captura o que seria gravado no Supabase. */
function stub(subscriber: unknown) {
  const writes: Record<string, unknown>[] = [];
  globalThis.fetch = (async (input: RequestInfo | URL, init?: RequestInit) => {
    const url = String(input instanceof Request ? input.url : input);
    if (url.startsWith("https://api.revenuecat.com")) {
      return new Response(JSON.stringify({ subscriber }), { status: 200 });
    }
    const body = init?.body ? JSON.parse(String(init.body)) : null;
    writes.push({ method: init?.method, url, body });
    return new Response(JSON.stringify(Array.isArray(body) ? body[0] : body ?? {}), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  }) as typeof fetch;
  return writes;
}

Deno.test("reconhece apenas ids do Supabase", () => {
  assertEquals(isSupabaseUserId(USER), true);
  assertEquals(isSupabaseUserId("$RCAnonymousID:abc"), false);
  assertEquals(isSupabaseUserId(null), false);
});

Deno.test("assinatura ativa da App Store", async () => {
  const writes = stub({
    entitlements: { premium: { expires_date: future, product_identifier: "movimenta_mensal" } },
    subscriptions: {
      movimenta_mensal: {
        expires_date: future, store: "app_store", period_type: "normal",
        unsubscribe_detected_at: null, billing_issues_detected_at: null, is_sandbox: false,
      },
    },
  });
  await syncSubscriber(USER);
  const row = writes[0].body as Record<string, unknown>;
  assertEquals(writes[0].method, "POST");
  assertEquals(row.store, "app_store");
  assertEquals(row.status, "active");
  assertEquals(row.will_renew, true);
  assertEquals(row.current_period_end, future);
});

Deno.test("teste grátis no Google Play marcado como trialing", async () => {
  const writes = stub({
    entitlements: { premium: { expires_date: future, product_identifier: "movimenta_anual:anual" } },
    subscriptions: {
      "movimenta_anual:anual": {
        expires_date: future, store: "play_store", period_type: "trial",
        unsubscribe_detected_at: null, billing_issues_detected_at: null, is_sandbox: true,
      },
    },
  });
  await syncSubscriber(USER);
  const row = writes[0].body as Record<string, unknown>;
  assertEquals(row.store, "play_store");
  assertEquals(row.status, "trialing");
  assertEquals(row.is_sandbox, true);
});

Deno.test("cancelada continua ativa até o fim do período, sem renovar", async () => {
  const writes = stub({
    entitlements: { premium: { expires_date: future, product_identifier: "p" } },
    subscriptions: {
      p: { expires_date: future, store: "app_store", period_type: "normal", unsubscribe_detected_at: past, billing_issues_detected_at: null, is_sandbox: false },
    },
  });
  await syncSubscriber(USER);
  const row = writes[0].body as Record<string, unknown>;
  assertEquals(row.status, "active");
  assertEquals(row.will_renew, false);
});

Deno.test("expirada, mas em período de carência, mantém acesso", async () => {
  const writes = stub({
    entitlements: { premium: { expires_date: past, grace_period_expires_date: future, product_identifier: "p" } },
    subscriptions: {
      p: { expires_date: past, grace_period_expires_date: future, store: "play_store", period_type: "normal", unsubscribe_detected_at: null, billing_issues_detected_at: past, is_sandbox: false },
    },
  });
  await syncSubscriber(USER);
  const row = writes[0].body as Record<string, unknown>;
  assertEquals(row.status, "active");
  assertEquals(row.billing_issue, true);
});

Deno.test("expirada perde o acesso", async () => {
  const writes = stub({
    entitlements: { premium: { expires_date: past, product_identifier: "p" } },
    subscriptions: {
      p: { expires_date: past, store: "app_store", period_type: "normal", unsubscribe_detected_at: past, billing_issues_detected_at: null, is_sandbox: false },
    },
  });
  await syncSubscriber(USER);
  assertEquals((writes[0].body as Record<string, unknown>).status, "expired");
});

Deno.test("sem entitlement: marca registro existente como expirado", async () => {
  const writes = stub({ entitlements: {}, subscriptions: {} });
  await syncSubscriber(USER);
  assertEquals(writes[0].method, "PATCH");
  assertEquals((writes[0].body as Record<string, unknown>).status, "expired");
});
