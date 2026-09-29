"use client";

import { createClient, type SupabaseClient } from "@supabase/supabase-js";

let client: SupabaseClient | null = null;

/** Cliente do navegador. A segurança fica nas regras de RLS do banco. */
export function supabase(): SupabaseClient {
  if (!client) {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    if (!url || !key) throw new Error("Configure NEXT_PUBLIC_SUPABASE_URL e NEXT_PUBLIC_SUPABASE_ANON_KEY");
    client = createClient(url, key, { auth: { persistSession: true, detectSessionInUrl: true } });
  }
  return client;
}

/** Chama uma Edge Function e devolve a mensagem de erro do servidor, se houver. */
export async function callFunction<T>(name: string, body?: unknown): Promise<T> {
  const { data, error } = await supabase().functions.invoke(name, { body: body ?? {} });
  if (error) {
    let message = error.message;
    const ctx = (error as { context?: Response }).context;
    if (ctx && typeof ctx.json === "function") {
      try {
        const payload = await ctx.json();
        if (payload?.error) message = payload.error;
      } catch {
        /* resposta sem JSON */
      }
    }
    throw new Error(message);
  }
  return data as T;
}

/** Envia uma imagem para o bucket público "imagens" e devolve a URL. */
export async function uploadImage(file: File, folder: string): Promise<string> {
  const ext = file.name.split(".").pop()?.toLowerCase() || "jpg";
  const path = `${folder}/${crypto.randomUUID()}.${ext}`;
  const { error } = await supabase().storage.from("imagens").upload(path, file, {
    cacheControl: "31536000",
    contentType: file.type,
  });
  if (error) throw error;
  return supabase().storage.from("imagens").getPublicUrl(path).data.publicUrl;
}
