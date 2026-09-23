// Edge Function: daily-liturgy-sync
//
// Busca a liturgia diária católica numa API externa configurável e grava
// (upsert) na tabela `daily_liturgy`. Pensada para rodar num cron diário
// (ex: 04:00 America/Sao_Paulo) via `supabase functions schedule` ou um
// cron job externo chamando este endpoint com o header de service role.
//
// IMPORTANTE (ver docs/CONTENT_GUIDE.md): não existe uma API oficial e
// gratuita mantida pela CNBB/Vaticano. Configure LITURGY_API_URL com um
// provedor de sua escolha (ex: um projeto comunitário de liturgia diária,
// ou uma API própria que você mantenha) que devolva JSON no formato
// abaixo. Se preferir, edite este arquivo para fazer parsing de HTML de
// uma fonte específica, ou preencha a tabela manualmente pelo Supabase
// Studio / painel admin do app (tela Admin > Liturgia).
//
// Suporte a múltiplos idiomas: chame esta função uma vez por idioma
// (?date=YYYY-MM-DD&locale=en, por exemplo) apontando LITURGY_API_URL para
// uma fonte que sirva aquele idioma. A maioria das fontes gratuitas só tem
// português — nesse caso, preencha as demais traduções manualmente pela
// tela Admin > Liturgia Diária (que já tem seletor de idioma).
//
// Formato esperado da API configurada em LITURGY_API_URL (chamada com
// ?date=YYYY-MM-DD):
// {
//   "liturgical_color": "Verde",
//   "liturgical_season": "Tempo Comum",
//   "celebration": "Domingo XXV do Tempo Comum",
//   "saint_of_day": "",
//   "first_reading": { "ref": "Am 8, 4-7", "text": "..." },
//   "psalm": { "ref": "Sl 112", "text": "..." },
//   "second_reading": { "ref": "1Tm 2, 1-8", "text": "..." },
//   "gospel": { "ref": "Lc 16, 1-13", "text": "..." }
// }

import { createClient } from "npm:@supabase/supabase-js@2";

Deno.serve(async (req) => {
  const url = new URL(req.url);
  const dateParam = url.searchParams.get("date");
  const targetDate = dateParam ?? new Date().toISOString().slice(0, 10);
  const locale = url.searchParams.get("locale") ?? "pt-BR";

  const liturgyApiUrl = Deno.env.get("LITURGY_API_URL");
  if (!liturgyApiUrl) {
    return new Response(
      JSON.stringify({
        error:
          "LITURGY_API_URL não configurada. Veja docs/CONTENT_GUIDE.md para opções de fonte de dados.",
      }),
      { status: 500 },
    );
  }

  const admin = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
  );

  try {
    const resp = await fetch(`${liturgyApiUrl}?date=${targetDate}&locale=${locale}`);
    if (!resp.ok) {
      throw new Error(`Fonte externa retornou ${resp.status}`);
    }
    const source = await resp.json();

    const row = {
      date: targetDate,
      locale,
      liturgical_color: source.liturgical_color ?? null,
      liturgical_season: source.liturgical_season ?? null,
      celebration: source.celebration ?? null,
      saint_of_day: source.saint_of_day ?? null,
      first_reading_ref: source.first_reading?.ref ?? null,
      first_reading_text: source.first_reading?.text ?? null,
      psalm_ref: source.psalm?.ref ?? null,
      psalm_text: source.psalm?.text ?? null,
      second_reading_ref: source.second_reading?.ref ?? null,
      second_reading_text: source.second_reading?.text ?? null,
      gospel_ref: source.gospel?.ref ?? null,
      gospel_text: source.gospel?.text ?? null,
      source: liturgyApiUrl,
      synced_at: new Date().toISOString(),
    };

    const { error } = await admin.from("daily_liturgy").upsert(row, { onConflict: "date,locale" });
    if (error) throw error;

    return new Response(JSON.stringify({ ok: true, date: targetDate, locale }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (err) {
    return new Response(JSON.stringify({ ok: false, error: String(err) }), { status: 500 });
  }
});
