// Edge Function: payment-webhook
//
// Recebe notificações do Mercado Pago e atualiza o status da compra de
// vídeo correspondente em video_purchases, liberando o acesso quando o
// pagamento é aprovado.
//
// Configure no Mercado Pago: Webhooks > URL = <SUPABASE_URL>/functions/v1/payment-webhook
// Env vars necessárias: MERCADOPAGO_ACCESS_TOKEN, SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY

import { createClient } from "npm:@supabase/supabase-js@2";

Deno.serve(async (req) => {
  if (req.method !== "POST") {
    return new Response("Method not allowed", { status: 405 });
  }

  const accessToken = Deno.env.get("MERCADOPAGO_ACCESS_TOKEN");
  if (!accessToken) {
    return new Response(JSON.stringify({ error: "MERCADOPAGO_ACCESS_TOKEN não configurado" }), { status: 500 });
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

  const paymentResp = await fetch(`https://api.mercadopago.com/v1/payments/${paymentId}`, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  if (!paymentResp.ok) {
    return new Response(JSON.stringify({ ok: false, error: "Falha ao consultar pagamento" }), { status: 502 });
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
  const externalId = String(payment.id);

  const { data: purchase, error: findErr } = await admin
    .from("video_purchases")
    .select("id, payment_status")
    .eq("external_payment_id", externalId)
    .maybeSingle();

  if (findErr || !purchase) {
    return new Response(JSON.stringify({ ok: true, note: "Compra não encontrada para este pagamento" }), {
      status: 200,
    });
  }

  await admin
    .from("video_purchases")
    .update({
      payment_status: mappedStatus,
      paid_at: mappedStatus === "completed" ? new Date().toISOString() : null,
    })
    .eq("id", purchase.id);

  return new Response(JSON.stringify({ ok: true, status: mappedStatus }), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
});
