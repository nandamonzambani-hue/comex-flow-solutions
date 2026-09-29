import { importJWK, SignJWT } from "npm:jose@5";
import { env } from "./http.ts";

const API = "https://api.cloudflare.com/client/v4";

export async function cfFetch<T>(path: string, init: RequestInit = {}): Promise<T> {
  const res = await fetch(`${API}/accounts/${env("CF_ACCOUNT_ID")}${path}`, {
    ...init,
    headers: {
      Authorization: `Bearer ${env("CF_STREAM_API_TOKEN")}`,
      "Content-Type": "application/json",
      ...(init.headers ?? {}),
    },
  });
  const body = await res.json();
  if (!res.ok || body.success === false) {
    throw new Error(`Cloudflare: ${JSON.stringify(body.errors ?? body)}`);
  }
  return body.result as T;
}

/**
 * Gera um token assinado para reproduzir um vídeo com "requireSignedURLs".
 * Usa uma chave de assinatura criada uma vez em POST /stream/keys
 * (guardamos o id e o JWK em base64, como a Cloudflare devolve).
 */
export async function signStreamToken(videoUid: string, ttlSeconds = 60 * 60 * 4): Promise<string> {
  const keyId = env("CF_STREAM_KEY_ID");
  const jwk = JSON.parse(atob(env("CF_STREAM_KEY_JWK")));
  const key = await importJWK(jwk, "RS256");
  const now = Math.floor(Date.now() / 1000);
  return await new SignJWT({ kid: keyId })
    .setProtectedHeader({ alg: "RS256", kid: keyId })
    .setSubject(videoUid)
    .setNotBefore(now - 60)
    .setExpirationTime(now + ttlSeconds)
    .sign(key);
}

export function playbackUrls(token: string) {
  const base = `https://customer-${env("CF_STREAM_CUSTOMER_CODE")}.cloudflarestream.com/${token}`;
  return {
    hls: `${base}/manifest/video.m3u8`,
    dash: `${base}/manifest/video.mpd`,
    thumbnail: `${base}/thumbnails/thumbnail.jpg`,
  };
}

/** Confere a assinatura HMAC dos webhooks do Stream ("time=...,sig1=..."). */
export async function verifyStreamWebhook(body: string, header: string | null, secret: string): Promise<boolean> {
  if (!header) return false;
  const parts = Object.fromEntries(header.split(",").map((p) => p.split("=") as [string, string]));
  const time = Number(parts.time);
  if (!time || Math.abs(Date.now() / 1000 - time) > 60 * 5) return false;
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const mac = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(`${parts.time}.${body}`));
  const hex = [...new Uint8Array(mac)].map((b) => b.toString(16).padStart(2, "0")).join("");
  return timingSafeEqual(hex, parts.sig1 ?? "");
}

function timingSafeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}
