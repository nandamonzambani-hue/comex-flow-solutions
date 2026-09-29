import { importPKCS8, SignJWT } from "npm:jose@5";
import { env } from "./http.ts";

interface ServiceAccount {
  project_id: string;
  client_email: string;
  private_key: string;
}

let cached: { token: string; exp: number } | null = null;

function serviceAccount(): ServiceAccount {
  return JSON.parse(atob(env("FIREBASE_SERVICE_ACCOUNT_BASE64")));
}

/** Troca a conta de serviço do Firebase por um access token OAuth2 (válido por 1h). */
async function accessToken(): Promise<string> {
  if (cached && cached.exp > Date.now() / 1000 + 60) return cached.token;
  const sa = serviceAccount();
  const key = await importPKCS8(sa.private_key, "RS256");
  const now = Math.floor(Date.now() / 1000);
  const assertion = await new SignJWT({ scope: "https://www.googleapis.com/auth/firebase.messaging" })
    .setProtectedHeader({ alg: "RS256", typ: "JWT" })
    .setIssuer(sa.client_email)
    .setAudience("https://oauth2.googleapis.com/token")
    .setIssuedAt(now)
    .setExpirationTime(now + 3600)
    .sign(key);
  const res = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({ grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer", assertion }),
  });
  const body = await res.json();
  if (!res.ok) throw new Error(`OAuth Google: ${JSON.stringify(body)}`);
  cached = { token: body.access_token, exp: now + body.expires_in };
  return cached.token;
}

export interface PushMessage {
  title: string;
  body: string;
  link?: string | null;
}

export type PushTarget = { token: string } | { topic: string };

/** Envia uma mensagem. Retorna "invalid" quando o token não existe mais. */
export async function sendPush(target: PushTarget, msg: PushMessage): Promise<"ok" | "invalid" | "error"> {
  const sa = serviceAccount();
  const res = await fetch(`https://fcm.googleapis.com/v1/projects/${sa.project_id}/messages:send`, {
    method: "POST",
    headers: { Authorization: `Bearer ${await accessToken()}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      message: {
        ...target,
        notification: { title: msg.title, body: msg.body },
        data: msg.link ? { link: msg.link } : {},
        android: { priority: "high" },
        apns: { payload: { aps: { sound: "default" } } },
      },
    }),
  });
  if (res.ok) return "ok";
  const text = await res.text();
  if (res.status === 404 || text.includes("UNREGISTERED") || text.includes("INVALID_ARGUMENT")) return "invalid";
  console.error("FCM", res.status, text);
  return "error";
}
