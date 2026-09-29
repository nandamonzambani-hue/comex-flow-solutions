// App: chamada logo após comprar ou restaurar, para liberar o acesso na hora
// (sem esperar o webhook). A aluna só consegue sincronizar a própria conta.
import { json, serve } from "../_shared/http.ts";
import { requireUser } from "../_shared/supabase.ts";
import { syncSubscriber } from "../_shared/revenuecat.ts";

serve(async (req) => {
  const user = await requireUser(req);
  const subscription = await syncSubscriber(user.id);
  return json({ subscription });
});
