// Edge Function: create-video-payment
//
// Cria uma cobrança Pix no Mercado Pago para um vídeo avulso pago, grava
// a compra como "pending" em video_purchases e devolve o código Pix
// copia-e-cola + QR code. A confirmação chega depois via
// `payment-webhook`, que libera o acesso ao vídeo.
//
// Invoke: POST /functions/v1/create-video-payment
//   { "video_id": "..." }
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
    .select("id, full_name, email")
    .eq("id", user.id)
    .single();
  if (!profile) {
    return new Response(JSON.stringify({ error: "Perfil não encontrado" }), { status: 404 });
  }

  const body = await req.json();
  const { video_id } = body;
  if (!video_id) {
    return new Response(JSON.stringify({ error: "video_id é obrigatório" }), { status: 400 });
  }

  const { data: video } = await admin
    .from("videos")
    .select("id, title, price_amount, access_type")
    .eq("id", video_id)
    .single();
  if (!video || video.access_type !== "paid" || !video.price_amount) {
    return new Response(JSON.stringify({ error: "Vídeo não encontrado ou não é pago" }), { status: 404 });
  }

  // Já comprou (mesmo que ainda pendente)? Reaproveita em vez de duplicar.
  const { data: existing } = await admin
    .from("video_purchases")
    .select("id, payment_status, external_payment_id")
    .eq("video_id", video_id)
    .eq("profile_id", profile.id)
    .maybeSingle();
  if (existing?.payment_status === "completed") {
    return new Response(JSON.stringify({ error: "Você já comprou este vídeo" }), { status: 409 });
  }

  const purchaseId =
    existing?.id ??
    (
      await admin
        .from("video_purchases")
        .insert({
          video_id,
          profile_id: profile.id,
          amount: video.price_amount,
          payment_method: "pix",
          payment_status: "pending",
          external_payment_provider: "mercadopago",
        })
        .select("id")
        .single()
    ).data?.id;

  const mpResp = await fetch("https://api.mercadopago.com/v1/payments", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${accessToken}`,
      "X-Idempotency-Key": purchaseId,
    },
    body: JSON.stringify({
      transaction_amount: Number(video.price_amount),
      description: `Vídeo: ${video.title}`,
      payment_method_id: "pix",
      payer: { email: profile.email ?? "aluno@aliancadamisericordia.app", first_name: profile.full_name },
    }),
  });

  if (!mpResp.ok) {
    await admin.from("video_purchases").update({ payment_status: "failed" }).eq("id", purchaseId);
    const errBody = await mpResp.text();
    return new Response(JSON.stringify({ error: "Falha ao criar cobrança Pix", detail: errBody }), { status: 502 });
  }

  const mpPayment = await mpResp.json();
  await admin
    .from("video_purchases")
    .update({ external_payment_id: String(mpPayment.id) })
    .eq("id", purchaseId);

  const pix = mpPayment.point_of_interaction?.transaction_data;

  return new Response(
    JSON.stringify({
      purchase_id: purchaseId,
      payment_id: mpPayment.id,
      pix_qr_code: pix?.qr_code,
      pix_qr_code_base64: pix?.qr_code_base64,
      status: mpPayment.status,
    }),
    { status: 200, headers: { "Content-Type": "application/json" } },
  );
});
