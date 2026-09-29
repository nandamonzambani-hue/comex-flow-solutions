import { createClient, type SupabaseClient, type User } from "npm:@supabase/supabase-js@2";
import { env, HttpError } from "./http.ts";

/** Cliente com a service role: ignora RLS. Use só no servidor. */
export function adminClient(): SupabaseClient {
  return createClient(env("SUPABASE_URL"), env("SUPABASE_SERVICE_ROLE_KEY"), {
    auth: { persistSession: false },
  });
}

/** Identifica a usuária pelo token JWT enviado pelo app ou pelo site. */
export async function requireUser(req: Request): Promise<User> {
  const token = req.headers.get("Authorization")?.replace(/^Bearer\s+/i, "");
  if (!token) throw new HttpError("Não autenticada", 401);
  const { data, error } = await adminClient().auth.getUser(token);
  if (error || !data.user) throw new HttpError("Sessão inválida", 401);
  return data.user;
}

export async function requireAdmin(req: Request): Promise<User> {
  const user = await requireUser(req);
  const { data } = await adminClient().from("profiles").select("role").eq("id", user.id).single();
  if (data?.role !== "admin") throw new HttpError("Acesso restrito à administração", 403);
  return user;
}

export async function hasActiveSubscription(userId: string): Promise<boolean> {
  const { data, error } = await adminClient().rpc("has_active_subscription", { uid: userId });
  if (error) throw error;
  return data === true;
}
