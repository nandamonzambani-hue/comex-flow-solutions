// Painel admin: envia uma notificação push para um público.
import { HttpError, json, serve } from "../_shared/http.ts";
import { adminClient, requireAdmin } from "../_shared/supabase.ts";
import { sendPush } from "../_shared/fcm.ts";

const AUDIENCES = ["todas", "assinantes", "nao_assinantes"] as const;

serve(async (req) => {
  const admin = await requireAdmin(req);
  const { title, body, audience = "todas", link } = await req.json();
  if (!title || !body) throw new HttpError("Título e mensagem são obrigatórios");
  if (!AUDIENCES.includes(audience)) throw new HttpError("Público inválido");

  const db = adminClient();
  let recipients = 0;

  if (audience === "todas") {
    // O app inscreve todas as usuárias no tópico "todas" ao fazer login.
    const r = await sendPush({ topic: "todas" }, { title, body, link });
    if (r !== "ok") throw new HttpError("Falha ao enviar pelo Firebase", 502);
    recipients = -1; // desconhecido em envio por tópico
  } else {
    const { data: devices, error } = await db.from("devices").select("token, user_id");
    if (error) throw error;
    const { data: subs } = await db.from("subscriptions").select("user_id, status, current_period_end");
    const active = new Set(
      (subs ?? [])
        .filter((s) => ["active", "trialing"].includes(s.status) &&
          (!s.current_period_end || new Date(s.current_period_end) > new Date()))
        .map((s) => s.user_id),
    );
    const targets = (devices ?? []).filter((d) =>
      audience === "assinantes" ? active.has(d.user_id) : !active.has(d.user_id)
    );
    const invalid: string[] = [];
    for (let i = 0; i < targets.length; i += 20) {
      const batch = targets.slice(i, i + 20);
      const results = await Promise.all(batch.map((d) => sendPush({ token: d.token }, { title, body, link })));
      results.forEach((r, j) => {
        if (r === "ok") recipients++;
        if (r === "invalid") invalid.push(batch[j].token);
      });
    }
    if (invalid.length) await db.from("devices").delete().in("token", invalid);
  }

  await db.from("notifications").insert({
    title, body, audience, deep_link: link ?? null,
    sent_by: admin.id, sent_at: new Date().toISOString(), recipients,
  });
  return json({ ok: true, recipients });
});
