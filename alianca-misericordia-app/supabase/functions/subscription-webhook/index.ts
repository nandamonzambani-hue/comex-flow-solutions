// Edge Function: subscription-webhook
//
// Recebe notificações do Mercado Pago quando o status de uma assinatura
// (preapproval) muda — autorizada, pausada, cancelada. Atualiza a
// paróquia correspondente e registra o evento para auditoria.
//
// Configure no Mercado Pago: Webhooks > URL = <SUPABASE_URL>/functions/v1/subscription-webhook
// (evento "subscription_preapproval")

import { createClient } from "npm:@supabase/supabase-js@2";

const STATUS_MAP: Record<string, { subscription_status: string; parish_status?: string }> = {
  authorized: { subscription_status: "authorized", parish_status: "active" },
  paused: { subscription_status: "paused", parish_status: "past_due" },
  cancelled: { subscription_status: "cancelled", parish_status: "cancelled" },
  pending: { subscription_status: "trialing" },
};

Deno.serve(async (req) => {
  if (req.method !== "POST") {
    return new Response("Method not allowed", { status: 405 });
  }

  const accessToken = Deno.env.get("MERCADOPAGO_ACCESS_TOKEN");
  if (!accessToken) {
    return new Response(JSON.stringify({ error: "MERCADOPAGO_ACCESS_TOKEN não configurado" }), { status: 500 });
  }

  const admin = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);

  const payload = await req.json().catch(() => ({}));
  const preapprovalId = payload?.data?.id ?? payload?.id;
  const type = payload?.type ?? payload?.topic;

  if (type !== "preapproval" && type !== "subscription_preapproval") {
    return new Response(JSON.stringify({ ok: true, ignored: true }), { status: 200 });
  }
  if (!preapprovalId) {
    return new Response(JSON.stringify({ ok: true, ignored: true }), { status: 200 });
  }

  const mpResp = await fetch(`https://api.mercadopago.com/preapproval/${preapprovalId}`, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  if (!mpResp.ok) {
    return new Response(JSON.stringify({ ok: false, error: "Falha ao consultar preapproval" }), { status: 502 });
  }
  const preapproval = await mpResp.json();

  const { data: parish } = await admin
    .from("parishes")
    .select("id, status")
    .eq("external_subscription_id", String(preapprovalId))
    .maybeSingle();

  if (!parish) {
    return new Response(JSON.stringify({ ok: true, note: "Paróquia não encontrada para esta assinatura" }), {
      status: 200,
    });
  }

  const mapped = STATUS_MAP[preapproval.status as string];
  if (mapped) {
    await admin
      .from("parishes")
      .update({
        subscription_status: mapped.subscription_status,
        ...(mapped.parish_status ? { status: mapped.parish_status } : {}),
      })
      .eq("id", parish.id);
  }

  await admin.from("parish_subscription_events").insert({
    parish_id: parish.id,
    event_type: preapproval.status ?? "unknown",
    raw_payload: preapproval,
  });

  return new Response(JSON.stringify({ ok: true, status: preapproval.status }), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
});
