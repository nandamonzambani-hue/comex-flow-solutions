// Edge Function: create-parish-subscription
//
// Cria (ou retoma) a assinatura recorrente da paróquia no Mercado Pago
// (API de "Preapproval" — cobrança automática mensal/anual). Chamada pelo
// admin da própria paróquia a partir da tela Admin > Assinatura.
//
// Fluxo:
// 1. Valida que quem chama é admin/pastor da paróquia informada.
// 2. Cria um "preapproval" no Mercado Pago com o valor/frequência do
//    plano escolhido.
// 3. Grava o id da preapproval em parishes.external_subscription_id
//    (status continua o que já era até o webhook confirmar autorização).
// 4. Devolve a URL de checkout (init_point) pro app abrir no navegador —
//    é lá que a pessoa cadastra o cartão e autoriza a cobrança recorrente.
//
// Invoke: POST /functions/v1/create-parish-subscription  { "plan_id": "..." }

import { createClient } from "npm:@supabase/supabase-js@2";

Deno.serve(async (req) => {
  if (req.method !== "POST") {
    return new Response("Method not allowed", { status: 405 });
  }

  const authHeader = req.headers.get("Authorization");
  if (!authHeader) {
    return new Response(JSON.stringify({ error: "Missing Authorization header" }), { status: 401 });
  }

  const accessToken = Deno.env.get("MERCADOPAGO_ACCESS_TOKEN");
  const backUrl = Deno.env.get("SUBSCRIPTION_BACK_URL") ?? "https://example.com";
  if (!accessToken) {
    return new Response(JSON.stringify({ error: "MERCADOPAGO_ACCESS_TOKEN não configurado" }), { status: 500 });
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

  const admin = createClient(supabaseUrl, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);
  const { data: profile } = await admin
    .from("profiles")
    .select("id, parish_id, role, email, full_name")
    .eq("id", user.id)
    .single();

  if (!profile || !profile.parish_id || !["admin", "pastor"].includes(profile.role)) {
    return new Response(JSON.stringify({ error: "Somente o admin da paróquia pode gerenciar a assinatura" }), {
      status: 403,
    });
  }

  const { plan_id } = await req.json();
  const { data: plan } = await admin.from("subscription_plans").select("*").eq("id", plan_id).single();
  if (!plan) {
    return new Response(JSON.stringify({ error: "Plano não encontrado" }), { status: 404 });
  }

  const frequencyType = plan.billing_interval === "yearly" ? "years" : "months";
  const frequency = 1; // cobra a cada 1 mês ou 1 ano, conforme frequencyType

  const mpResp = await fetch("https://api.mercadopago.com/preapproval", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${accessToken}`,
      "X-Idempotency-Key": `${profile.parish_id}-${plan_id}-${Date.now()}`,
    },
    body: JSON.stringify({
      reason: `Assinatura — ${plan.name}`,
      external_reference: profile.parish_id,
      payer_email: profile.email ?? undefined,
      back_url: backUrl,
      auto_recurring: {
        frequency,
        frequency_type: frequencyType,
        transaction_amount: Number(plan.price_amount),
        currency_id: plan.currency ?? "BRL",
      },
    }),
  });

  if (!mpResp.ok) {
    const detail = await mpResp.text();
    return new Response(JSON.stringify({ error: "Falha ao criar assinatura no Mercado Pago", detail }), { status: 502 });
  }

  const preapproval = await mpResp.json();

  await admin
    .from("parishes")
    .update({ external_subscription_id: String(preapproval.id), plan_id })
    .eq("id", profile.parish_id);

  await admin.from("parish_subscription_events").insert({
    parish_id: profile.parish_id,
    event_type: "checkout_created",
    raw_payload: preapproval,
  });

  return new Response(JSON.stringify({ checkout_url: preapproval.init_point, preapproval_id: preapproval.id }), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
});
