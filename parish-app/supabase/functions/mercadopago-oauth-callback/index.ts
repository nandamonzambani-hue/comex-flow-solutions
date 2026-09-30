// Edge Function: mercadopago-oauth-callback
//
// Segundo passo do "Mercado Pago Connect" (ver mercadopago-oauth-start).
// É esta URL que deve ser cadastrada como "redirect_uri" na aplicação
// Mercado Pago (Developers > Suas integrações > [app] > OAuth). O
// Mercado Pago redireciona o navegador pra cá com ?code=...&state=...
// depois que a paróquia autoriza a conexão na própria conta dela.
//
// 1. Valida a assinatura HMAC do state (gerado por mercadopago-oauth-start)
//    e sua validade (10 min) — evita que alguém forje um parish_id.
// 2. Troca o code por access_token/refresh_token via API do Mercado Pago.
// 3. Grava (upsert) em parish_payment_accounts com service_role — esta é
//    a ÚNICA rota que escreve tokens nessa tabela.
// 4. Redireciona (302) o navegador de volta pro app
//    (parishapp://admin/finance?mp_connected=1|0) — o app abriu o fluxo
//    com WebBrowser.openAuthSessionAsync, que detecta esse redirect e
//    fecha o navegador sozinho.
//
// Chamada diretamente pelo navegador do usuário (sem Authorization
// header) — por isso a confiança vem inteiramente da assinatura do state,
// não de uma sessão logada.

import { createClient } from "npm:@supabase/supabase-js@2";

const APP_REDIRECT = "parishapp://admin/finance";

function base64urlToBytes(b64url: string): Uint8Array {
  const b64 = b64url.replace(/-/g, "+").replace(/_/g, "/").padEnd(Math.ceil(b64url.length / 4) * 4, "=");
  const bin = atob(b64);
  return Uint8Array.from(bin, (c) => c.charCodeAt(0));
}

function base64url(bytes: Uint8Array): string {
  return btoa(String.fromCharCode(...bytes)).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

async function verifyState(
  secret: string,
  state: string,
): Promise<{ parish_id: string; connected_by: string } | null> {
  const [payloadB64, signatureB64] = state.split(".");
  if (!payloadB64 || !signatureB64) return null;

  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["verify"],
  );
  const valid = await crypto.subtle.verify(
    "HMAC",
    key,
    base64urlToBytes(signatureB64),
    new TextEncoder().encode(payloadB64),
  );
  if (!valid) return null;

  const payload = JSON.parse(new TextDecoder().decode(base64urlToBytes(payloadB64)));
  if (typeof payload.exp !== "number" || payload.exp < Math.floor(Date.now() / 1000)) return null;
  if (typeof payload.parish_id !== "string" || typeof payload.connected_by !== "string") return null;
  return { parish_id: payload.parish_id, connected_by: payload.connected_by };
}

function redirectToApp(ok: boolean, extra?: Record<string, string>): Response {
  const url = new URL(APP_REDIRECT);
  url.searchParams.set("mp_connected", ok ? "1" : "0");
  for (const [k, v] of Object.entries(extra ?? {})) url.searchParams.set(k, v);
  return new Response(null, { status: 302, headers: { Location: url.toString() } });
}

Deno.serve(async (req) => {
  const url = new URL(req.url);
  const code = url.searchParams.get("code");
  const state = url.searchParams.get("state");
  const mpError = url.searchParams.get("error");

  if (mpError) {
    return redirectToApp(false, { error: mpError });
  }
  if (!code || !state) {
    return redirectToApp(false, { error: "missing_code_or_state" });
  }

  const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
  const clientId = Deno.env.get("MERCADOPAGO_CLIENT_ID");
  const clientSecret = Deno.env.get("MERCADOPAGO_CLIENT_SECRET");
  const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
  if (!clientId || !clientSecret) {
    return redirectToApp(false, { error: "mp_app_not_configured" });
  }

  const claims = await verifyState(serviceRoleKey, state);
  if (!claims) {
    return redirectToApp(false, { error: "invalid_or_expired_state" });
  }

  const redirectUri = `${supabaseUrl}/functions/v1/mercadopago-oauth-callback`;
  const tokenResp = await fetch("https://api.mercadopago.com/oauth/token", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      client_id: clientId,
      client_secret: clientSecret,
      grant_type: "authorization_code",
      code,
      redirect_uri: redirectUri,
    }),
  });

  if (!tokenResp.ok) {
    return redirectToApp(false, { error: "token_exchange_failed" });
  }

  const token = await tokenResp.json();
  const expiresAt = token.expires_in
    ? new Date(Date.now() + Number(token.expires_in) * 1000).toISOString()
    : null;

  const admin = createClient(supabaseUrl, serviceRoleKey);
  const { error } = await admin.from("parish_payment_accounts").upsert(
    {
      parish_id: claims.parish_id,
      provider: "mercadopago",
      access_token: token.access_token,
      refresh_token: token.refresh_token ?? null,
      public_key: token.public_key ?? null,
      mp_user_id: token.user_id ?? null,
      expires_at: expiresAt,
      connected_by: claims.connected_by,
      connected_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
    { onConflict: "parish_id" },
  );

  if (error) {
    return redirectToApp(false, { error: "db_write_failed" });
  }

  return redirectToApp(true);
});
