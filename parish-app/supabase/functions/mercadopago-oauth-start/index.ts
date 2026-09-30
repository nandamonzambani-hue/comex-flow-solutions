// Edge Function: mercadopago-oauth-start
//
// Primeiro passo do "Mercado Pago Connect": gera a URL de autorização
// OAuth para que a PRÓPRIA paróquia conecte sua conta Mercado Pago (o
// dízimo/doação cai direto na conta dela, não na da plataforma). Só o
// admin/pastor da paróquia pode iniciar essa conexão.
//
// Fluxo completo (ver também mercadopago-oauth-callback):
// 1. App chama esta function (autenticado) -> recebe { authorize_url }.
// 2. App abre authorize_url com WebBrowser.openAuthSessionAsync(url, 'parishapp://admin/finance').
// 3. Paróquia faz login na própria conta Mercado Pago e autoriza.
// 4. Mercado Pago redireciona para mercadopago-oauth-callback (HTTPS,
//    registrada como redirect_uri na aplicação Mercado Pago).
// 5. O callback troca o code por tokens, grava em parish_payment_accounts
//    e redireciona de volta para parishapp://admin/finance — o
//    openAuthSessionAsync detecta e fecha o navegador automaticamente.
//
// O "state" carrega parish_id + connected_by assinados com HMAC (chave =
// SUPABASE_SERVICE_ROLE_KEY, já configurada) para o callback confiar nele
// sem precisar de tabela de sessão própria — expira em 10 minutos.
//
// Invoke: POST /functions/v1/mercadopago-oauth-start
// Requer o header Authorization com o JWT do admin/pastor logado.

import { createClient } from "npm:@supabase/supabase-js@2";

const STATE_TTL_SECONDS = 600;

function base64url(bytes: Uint8Array): string {
  return btoa(String.fromCharCode(...bytes)).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

async function hmacSign(secret: string, payload: string): Promise<string> {
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const sig = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(payload));
  return base64url(new Uint8Array(sig));
}

Deno.serve(async (req) => {
  if (req.method !== "POST") {
    return new Response("Method not allowed", { status: 405 });
  }

  const authHeader = req.headers.get("Authorization");
  if (!authHeader) {
    return new Response(JSON.stringify({ error: "Missing Authorization header" }), { status: 401 });
  }

  const clientId = Deno.env.get("MERCADOPAGO_CLIENT_ID");
  const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
  if (!clientId) {
    return new Response(JSON.stringify({ error: "MERCADOPAGO_CLIENT_ID não configurado" }), { status: 500 });
  }

  const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
  const userClient = createClient(supabaseUrl, Deno.env.get("SUPABASE_ANON_KEY")!, {
    global: { headers: { Authorization: authHeader } },
  });
  const {
    data: { user },
  } = await userClient.auth.getUser();
  if (!user) {
    return new Response(JSON.stringify({ error: "Invalid session" }), { status: 401 });
  }

  const admin = createClient(supabaseUrl, serviceRoleKey);
  const { data: profile } = await admin
    .from("profiles")
    .select("id, parish_id, role")
    .eq("id", user.id)
    .single();

  if (!profile || !profile.parish_id || !["admin", "pastor"].includes(profile.role)) {
    return new Response(JSON.stringify({ error: "Somente o admin da paróquia pode conectar o Mercado Pago" }), {
      status: 403,
    });
  }

  const payload = JSON.stringify({
    parish_id: profile.parish_id,
    connected_by: profile.id,
    exp: Math.floor(Date.now() / 1000) + STATE_TTL_SECONDS,
  });
  const payloadB64 = base64url(new TextEncoder().encode(payload));
  const signature = await hmacSign(serviceRoleKey, payloadB64);
  const state = `${payloadB64}.${signature}`;

  const redirectUri = `${supabaseUrl}/functions/v1/mercadopago-oauth-callback`;
  const authorizeUrl = new URL("https://auth.mercadopago.com.br/authorization");
  authorizeUrl.searchParams.set("client_id", clientId);
  authorizeUrl.searchParams.set("response_type", "code");
  authorizeUrl.searchParams.set("platform_id", "mp");
  authorizeUrl.searchParams.set("state", state);
  authorizeUrl.searchParams.set("redirect_uri", redirectUri);

  return new Response(JSON.stringify({ authorize_url: authorizeUrl.toString() }), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
});
