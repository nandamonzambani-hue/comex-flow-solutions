// Cria uma sessão de Checkout do Stripe para a assinatura.
// Chamada pelo SITE (não pelo app iOS — ver README sobre regras das lojas).
import { env, HttpError, json, serve } from "../_shared/http.ts";
import { adminClient, requireUser } from "../_shared/supabase.ts";
import { stripeClient } from "../_shared/stripe.ts";

serve(async (req) => {
  const user = await requireUser(req);
  const { priceId } = await req.json().catch(() => ({}));
  const allowed = env("STRIPE_PRICE_IDS").split(",").map((s) => s.trim());
  const price = priceId ?? allowed[0];
  if (!allowed.includes(price)) throw new HttpError("Plano inválido");

  const stripe = stripeClient();
  const db = adminClient();
  const { data: sub } = await db.from("subscriptions").select("*").eq("user_id", user.id).maybeSingle();

  if (sub && ["active", "trialing"].includes(sub.status)) {
    throw new HttpError("Você já tem uma assinatura ativa", 409);
  }

  let customerId = sub?.stripe_customer_id as string | undefined;
  if (!customerId) {
    const customer = await stripe.customers.create({
      email: user.email,
      metadata: { user_id: user.id },
    });
    customerId = customer.id;
    await db.from("subscriptions").upsert({ user_id: user.id, stripe_customer_id: customerId, status: "inactive" });
  }

  const site = env("SITE_URL");
  const session = await stripe.checkout.sessions.create({
    mode: "subscription",
    customer: customerId,
    client_reference_id: user.id,
    line_items: [{ price, quantity: 1 }],
    allow_promotion_codes: true,
    locale: "pt-BR",
    subscription_data: {
      metadata: { user_id: user.id },
      ...(Number(Deno.env.get("STRIPE_TRIAL_DAYS") ?? 0) > 0
        ? { trial_period_days: Number(Deno.env.get("STRIPE_TRIAL_DAYS")) }
        : {}),
    },
    success_url: `${site}/assinatura/sucesso?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${site}/assinar`,
  });

  return json({ url: session.url });
});
