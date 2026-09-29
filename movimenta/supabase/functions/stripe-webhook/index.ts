// Recebe os eventos do Stripe e mantém a tabela "subscriptions" atualizada.
// É a ÚNICA fonte de verdade sobre quem é assinante.
import { env, error, json } from "../_shared/http.ts";
import { adminClient } from "../_shared/supabase.ts";
import { cryptoProvider, type Stripe, stripeClient } from "../_shared/stripe.ts";

const stripe = stripeClient();

async function syncSubscription(sub: Stripe.Subscription) {
  const db = adminClient();
  const customerId = typeof sub.customer === "string" ? sub.customer : sub.customer.id;
  let userId = sub.metadata?.user_id as string | undefined;
  if (!userId) {
    const { data } = await db.from("subscriptions").select("user_id").eq("stripe_customer_id", customerId).maybeSingle();
    userId = data?.user_id;
  }
  if (!userId) {
    console.warn("Assinatura sem usuária associada", sub.id);
    return;
  }
  const item = sub.items.data[0];
  // Em versões recentes da API, o fim do período fica no item da assinatura.
  // deno-lint-ignore no-explicit-any
  const periodEnd = (sub as any).current_period_end ?? (item as any)?.current_period_end;
  const { error: dbError } = await db.from("subscriptions").upsert({
    user_id: userId,
    stripe_customer_id: customerId,
    stripe_subscription_id: sub.id,
    status: sub.status,
    price_id: item?.price.id ?? null,
    current_period_end: periodEnd ? new Date(periodEnd * 1000).toISOString() : null,
    cancel_at_period_end: sub.cancel_at_period_end,
  });
  if (dbError) throw dbError;
}

Deno.serve(async (req) => {
  const signature = req.headers.get("Stripe-Signature");
  const body = await req.text();
  let event: Stripe.Event;
  try {
    event = await stripe.webhooks.constructEventAsync(
      body, signature ?? "", env("STRIPE_WEBHOOK_SECRET"), undefined, cryptoProvider,
    );
  } catch (e) {
    console.error("Assinatura do webhook inválida", e);
    return error("Assinatura inválida", 400);
  }

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        if (session.mode === "subscription" && session.subscription) {
          const sub = await stripe.subscriptions.retrieve(session.subscription as string);
          if (!sub.metadata?.user_id && session.client_reference_id) {
            sub.metadata = { ...sub.metadata, user_id: session.client_reference_id };
          }
          await syncSubscription(sub);
        }
        break;
      }
      case "customer.subscription.created":
      case "customer.subscription.updated":
      case "customer.subscription.deleted":
      case "customer.subscription.paused":
      case "customer.subscription.resumed":
        await syncSubscription(event.data.object as Stripe.Subscription);
        break;
      default:
        break;
    }
  } catch (e) {
    console.error("Falha ao processar", event.type, e);
    return error("Falha ao processar", 500); // o Stripe tenta de novo
  }
  return json({ received: true });
});
