// Exclusão de conta pelo próprio app (exigência da Apple e da LGPD).
// Cancela a assinatura no Stripe e apaga a usuária; os dados saem em cascata.
// Assinaturas da App Store / Google Play NÃO podem ser canceladas por nós: o app
// avisa a aluna para cancelar na loja antes de excluir.
import { json, serve } from "../_shared/http.ts";
import { adminClient, requireUser } from "../_shared/supabase.ts";
import { stripeClient } from "../_shared/stripe.ts";
import { deleteSubscriber } from "../_shared/revenuecat.ts";

serve(async (req) => {
  const user = await requireUser(req);
  const db = adminClient();
  const { data: sub } = await db.from("subscriptions")
    .select("stripe_subscription_id, status").eq("user_id", user.id).maybeSingle();

  if (sub?.stripe_subscription_id && ["active", "trialing", "past_due"].includes(sub.status)) {
    await stripeClient().subscriptions.cancel(sub.stripe_subscription_id);
  }
  await deleteSubscriber(user.id);
  const { error } = await db.auth.admin.deleteUser(user.id);
  if (error) throw error;
  return json({ ok: true });
});
