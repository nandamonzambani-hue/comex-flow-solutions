// Edge Function: create-payment
//
// Cria uma cobrança Pix (ou cartão) no Mercado Pago para dízimo, oferta,
// campanha ou festa, grava a doação como "pending" e devolve o código
// Pix copia-e-cola + QR code para o app exibir. A confirmação do
// pagamento chega depois via `payment-webhook`.
//
// Invoke: POST /functions/v1/create-payment
//   { "amount": 50.00, "category_id"?: "...", "campaign_id"?: "...",
//     "payment_method": "pix", "is_recurring"?: false }
// Requer o header Authorization com o JWT do usuário logado.

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
    .select("id, parish_id, full_name, email")
    .eq("id", user.id)
    .single();
  if (!profile) {
    return new Response(JSON.stringify({ error: "Perfil não encontrado" }), { status: 404 });
  }

  const body = await req.json();
  const { amount, category_id, campaign_id, payment_method = "pix", is_recurring = false } = body;

  if (!amount || amount <= 0) {
    return new Response(JSON.stringify({ error: "amount inválido" }), { status: 400 });
  }

  // 1) Cria o registro da doação como "pending"
  const { data: donation, error: donationErr } = await admin
    .from("donations")
    .insert({
      parish_id: profile.parish_id,
      profile_id: profile.id,
      campaign_id: campaign_id ?? null,
      category_id: category_id ?? null,
      amount,
      payment_method,
      payment_status: "pending",
      is_recurring,
      external_payment_provider: "mercadopago",
    })
    .select()
    .single();
  if (donationErr) {
    return new Response(JSON.stringify({ error: donationErr.message }), { status: 500 });
  }

  // 2) Cria a cobrança no Mercado Pago (Pix)
  const mpResp = await fetch("https://api.mercadopago.com/v1/payments", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${accessToken}`,
      "X-Idempotency-Key": donation.id,
    },
    body: JSON.stringify({
      transaction_amount: Number(amount),
      description: campaign_id ? "Doação para campanha" : "Dízimo/Oferta",
      payment_method_id: "pix",
      payer: { email: profile.email ?? "doador@paroquia.app", first_name: profile.full_name },
    }),
  });

  if (!mpResp.ok) {
    await admin.from("donations").update({ payment_status: "failed" }).eq("id", donation.id);
    const errBody = await mpResp.text();
    return new Response(JSON.stringify({ error: "Falha ao criar cobrança Pix", detail: errBody }), { status: 502 });
  }

  const mpPayment = await mpResp.json();
  await admin
    .from("donations")
    .update({ external_payment_id: String(mpPayment.id) })
    .eq("id", donation.id);

  const pix = mpPayment.point_of_interaction?.transaction_data;

  return new Response(
    JSON.stringify({
      donation_id: donation.id,
      payment_id: mpPayment.id,
      pix_qr_code: pix?.qr_code,
      pix_qr_code_base64: pix?.qr_code_base64,
      status: mpPayment.status,
    }),
    { status: 200, headers: { "Content-Type": "application/json" } },
  );
});
