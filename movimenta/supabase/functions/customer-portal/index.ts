// Abre o portal do cliente do Stripe (trocar cartão, cancelar, ver faturas).
import { env, HttpError, json, serve } from "../_shared/http.ts";
import { adminClient, requireUser } from "../_shared/supabase.ts";
import { stripeClient } from "../_shared/stripe.ts";

serve(async (req) => {
  const user = await requireUser(req);
  const { data: sub } = await adminClient()
    .from("subscriptions").select("stripe_customer_id").eq("user_id", user.id).maybeSingle();
  if (!sub?.stripe_customer_id) throw new HttpError("Nenhuma assinatura encontrada", 404);

  const session = await stripeClient().billingPortal.sessions.create({
    customer: sub.stripe_customer_id,
    return_url: `${env("SITE_URL")}/conta`,
  });
  return json({ url: session.url });
});
