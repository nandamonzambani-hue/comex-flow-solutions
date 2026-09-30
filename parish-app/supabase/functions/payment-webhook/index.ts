// Edge Function: payment-webhook
//
// Recebe notificações do Mercado Pago (gateway comum no Brasil para Pix,
// cartão e boleto) e atualiza o status da doação correspondente. Troque
// facilmente por Stripe/PagSeguro adaptando apenas a seção "Provedor".
//
// Configure no Mercado Pago: Webhooks > URL = <SUPABASE_URL>/functions/v1/payment-webhook
// Env vars necessárias: SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY
//
// Fluxo:
// 1. `create-payment` cria a doação (status "pending") usando o access_token
//    DA PRÓPRIA PARÓQUIA (parish_payment_accounts — ver migration 0011) e
//    grava `external_payment_id` na doação.
// 2. Mercado Pago notifica este webhook quando o pagamento muda de status.
// 3. Re-consultamos o pagamento na API do Mercado Pago (nunca confiamos só
//    no payload do webhook) — mas isso só pode ser feito com o token DA
//    MESMA paróquia que gerou a cobrança (o pagamento não existe na conta
//    da plataforma). Por isso buscamos a doação PRIMEIRO (para descobrir de
//    qual paróquia é) e só então re-consultamos com o token certo.

import { createClient } from "npm:@supabase/supabase-js@2";

Deno.serve(async (req) => {
  if (req.method !== "POST") {
    return new Response("Method not allowed", { status: 405 });
  }

  const admin = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
  );

  const payload = await req.json().catch(() => ({}));

  // Mercado Pago envia { type: "payment", data: { id: "..." } }
  const paymentId = payload?.data?.id ?? payload?.resource;
  if (!paymentId) {
    return new Response(JSON.stringify({ ok: true, ignored: true }), { status: 200 });
  }

  const externalId = String(paymentId);
  const { data: donation, error: findErr } = await admin
    .from("donations")
    .select("id, parish_id, campaign_id, amount, payment_status")
    .eq("external_payment_id", externalId)
    .maybeSingle();

  if (findErr || !donation) {
    return new Response(JSON.stringify({ ok: true, note: "Doação não encontrada para este pagamento" }), {
      status: 200,
    });
  }

  const { data: paymentAccount } = await admin
    .from("parish_payment_accounts")
    .select("access_token")
    .eq("parish_id", donation.parish_id)
    .maybeSingle();
  if (!paymentAccount) {
    return new Response(
      JSON.stringify({ ok: false, error: "Paróquia da doação não tem mais conta Mercado Pago conectada" }),
      { status: 200 },
    );
  }

  // --- Provedor: Mercado Pago -----------------------------------------
  const paymentResp = await fetch(`https://api.mercadopago.com/v1/payments/${paymentId}`, {
    headers: { Authorization: `Bearer ${paymentAccount.access_token}` },
  });
  if (!paymentResp.ok) {
    return new Response(JSON.stringify({ ok: false, error: "Falha ao consultar pagamento" }), {
      status: 502,
    });
  }
  const payment = await paymentResp.json();

  const statusMap: Record<string, string> = {
    approved: "completed",
    pending: "pending",
    in_process: "processing",
    rejected: "failed",
    refunded: "refunded",
    cancelled: "cancelled",
  };
  const mappedStatus = statusMap[payment.status] ?? "pending";
  // ----------------------------------------------------------------------

  await admin
    .from("donations")
    .update({
      payment_status: mappedStatus,
      paid_at: mappedStatus === "completed" ? new Date().toISOString() : null,
    })
    .eq("id", donation.id);

  // Ao confirmar pagamento de uma doação de campanha, incrementa o total arrecadado
  if (mappedStatus === "completed" && donation.payment_status !== "completed" && donation.campaign_id) {
    await admin.rpc("increment_campaign_amount", {
      p_campaign_id: donation.campaign_id,
      p_amount: donation.amount,
    });
  }

  return new Response(JSON.stringify({ ok: true, status: mappedStatus }), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
});
