// Edge Function: send-push-notification
//
// Envia notificações push via Expo Push API para membros segmentados por
// "todos", grupo, cor de evangelização ou nível de vínculo. Chamada pelo
// app (tela admin) com o token JWT do usuário logado — a função valida
// que ele é staff.
//
// Deploy: supabase functions deploy send-push-notification
// Invoke:  POST /functions/v1/send-push-notification
//   { "title": "...", "body": "...", "target_type": "all"|"group"|"color"|"level", "target_id"?: "..." }

import { createClient } from "npm:@supabase/supabase-js@2";

const EXPO_PUSH_URL = "https://exp.host/--/api/v2/push/send";

Deno.serve(async (req) => {
  if (req.method !== "POST") {
    return new Response("Method not allowed", { status: 405 });
  }

  const authHeader = req.headers.get("Authorization");
  if (!authHeader) {
    return new Response(JSON.stringify({ error: "Missing Authorization header" }), { status: 401 });
  }

  const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
  const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

  // Cliente com o token do usuário, só para validar identidade/role
  const userClient = createClient(supabaseUrl, Deno.env.get("SUPABASE_ANON_KEY")!, {
    global: { headers: { Authorization: authHeader } },
  });
  const {
    data: { user },
    error: userErr,
  } = await userClient.auth.getUser();
  if (userErr || !user) {
    return new Response(JSON.stringify({ error: "Invalid session" }), { status: 401 });
  }

  // Cliente admin (service role) para consultas e escrita sem restrição de RLS
  const admin = createClient(supabaseUrl, serviceRoleKey);

  const { data: profile } = await admin
    .from("profiles")
    .select("id, role")
    .eq("id", user.id)
    .single();

  if (!profile || !["staff", "admin"].includes(profile.role)) {
    return new Response(JSON.stringify({ error: "Forbidden: staff only" }), { status: 403 });
  }

  const body = await req.json();
  const { title, message, target_type = "all", target_id, data = {} } = body;

  if (!title || !message) {
    return new Response(JSON.stringify({ error: "title and message are required" }), { status: 400 });
  }

  // Monta a query de destinatários conforme o alvo
  let profilesQuery = admin.from("profiles").select("id");

  if (target_type === "color" && target_id) {
    profilesQuery = profilesQuery.eq("evangelization_color", target_id);
  } else if (target_type === "level" && target_id) {
    profilesQuery = profilesQuery.eq("membership_level_id", target_id);
  } else if (target_type === "group" && target_id) {
    const { data: members } = await admin
      .from("group_members")
      .select("profile_id")
      .eq("group_id", target_id);
    const ids = (members ?? []).map((m) => m.profile_id);
    if (ids.length === 0) {
      return new Response(JSON.stringify({ sent: 0 }), { status: 200 });
    }
    profilesQuery = profilesQuery.in("id", ids);
  }

  const { data: targetProfiles, error: profilesErr } = await profilesQuery;
  if (profilesErr) {
    return new Response(JSON.stringify({ error: profilesErr.message }), { status: 500 });
  }

  const profileIds = (targetProfiles ?? []).map((p) => p.id);
  if (profileIds.length === 0) {
    return new Response(JSON.stringify({ sent: 0 }), { status: 200 });
  }

  const { data: tokens } = await admin
    .from("push_tokens")
    .select("token")
    .in("profile_id", profileIds);

  const messages = (tokens ?? [])
    .filter((t) => t.token?.startsWith("ExponentPushToken"))
    .map((t) => ({
      to: t.token,
      sound: "default",
      title,
      body: message,
      data,
    }));

  // Expo aceita lotes de até 100 mensagens por request
  const chunkSize = 100;
  let sentCount = 0;
  for (let i = 0; i < messages.length; i += chunkSize) {
    const chunk = messages.slice(i, i + chunkSize);
    const resp = await fetch(EXPO_PUSH_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        "Accept-Encoding": "gzip, deflate",
      },
      body: JSON.stringify(chunk),
    });
    if (resp.ok) sentCount += chunk.length;
  }

  await admin.from("notifications_log").insert({
    title,
    body: message,
    target_type,
    target_id: target_id ?? null,
    data,
    sent_by: profile.id,
    recipients_count: sentCount,
  });

  return new Response(JSON.stringify({ sent: sentCount }), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
});
