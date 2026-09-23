// Edge Function: bible-sync
//
// Popula bible_books/bible_verses a partir de uma API bíblica configurável
// (BIBLE_API_URL + BIBLE_API_KEY, se exigida). Rode uma vez para importar
// o texto completo (ou sob demanda, por livro, para manter o banco leve).
//
// ATENÇÃO SOBRE LICENCIAMENTO (ver docs/CONTENT_GUIDE.md):
// Traduções católicas oficiais (Bíblia Ave Maria, Edição Pastoral, CNBB)
// são protegidas por direitos autorais e normalmente exigem licença paga
// da editora (Paulinas, Paulus, Loyola, Ave Maria). Para lançar em produção
// você precisa negociar essa licença OU usar uma tradução em domínio
// público / licença aberta (ex: João Ferreira de Almeida - domínio público
// no Brasil). Este código é agnóstico à fonte: aponte BIBLE_API_URL para o
// provedor que você tiver licenciado.
//
// Invoke: POST /functions/v1/bible-sync  { "book_id": "jo", "version_id": "ave-maria" }
// Espera que BIBLE_API_URL + book_id devolvam um JSON:
// { "chapters": [ { "chapter": 1, "verses": [ { "verse": 1, "text": "..." }, ... ] } ] }

import { createClient } from "npm:@supabase/supabase-js@2";

Deno.serve(async (req) => {
  if (req.method !== "POST") {
    return new Response("Method not allowed", { status: 405 });
  }

  const bibleApiUrl = Deno.env.get("BIBLE_API_URL");
  const bibleApiKey = Deno.env.get("BIBLE_API_KEY");
  if (!bibleApiUrl) {
    return new Response(
      JSON.stringify({ error: "BIBLE_API_URL não configurada. Veja docs/CONTENT_GUIDE.md." }),
      { status: 500 },
    );
  }

  const { book_id, version_id = "ave-maria" } = await req.json();
  if (!book_id) {
    return new Response(JSON.stringify({ error: "book_id é obrigatório" }), { status: 400 });
  }

  const admin = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
  );

  try {
    const resp = await fetch(`${bibleApiUrl}/${book_id}`, {
      headers: bibleApiKey ? { Authorization: `Bearer ${bibleApiKey}` } : {},
    });
    if (!resp.ok) throw new Error(`Fonte externa retornou ${resp.status}`);
    const source = await resp.json();

    const rows: { book_id: string; version_id: string; chapter: number; verse: number; text: string }[] = [];
    for (const chapter of source.chapters ?? []) {
      for (const verse of chapter.verses ?? []) {
        rows.push({
          book_id,
          version_id,
          chapter: chapter.chapter,
          verse: verse.verse,
          text: verse.text,
        });
      }
    }

    // Remove versão anterior do livro antes de reinserir (idempotente)
    await admin.from("bible_verses").delete().eq("book_id", book_id).eq("version_id", version_id);

    const chunkSize = 500;
    for (let i = 0; i < rows.length; i += chunkSize) {
      const { error } = await admin.from("bible_verses").insert(rows.slice(i, i + chunkSize));
      if (error) throw error;
    }

    return new Response(JSON.stringify({ ok: true, book_id, verses_imported: rows.length }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (err) {
    return new Response(JSON.stringify({ ok: false, error: String(err) }), { status: 500 });
  }
});
