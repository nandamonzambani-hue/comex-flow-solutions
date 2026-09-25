// Edge Function: daily-liturgy-sync
//
// Sincroniza a liturgia diária (cor, tempo litúrgico, leituras completas)
// a partir da API pública https://liturgia.up.railway.app (mantida pela
// comunidade, usada por vários apps católicos brasileiros). Roda um
// intervalo de dias de uma vez (não só "hoje"), pra a tela de liturgia
// do app já ter conteúdo disponível para datas futuras.
//
// Uso:
//   GET /daily-liturgy-sync                       -> sincroniza hoje + 29 dias seguintes (30 no total)
//   GET /daily-liturgy-sync?start=2026-10-01       -> a partir de uma data específica
//   GET /daily-liturgy-sync?days=200               -> quantos dias sincronizar (máx. 250 por chamada;
//                                                      as buscas rodam em paralelo em lotes, então mesmo
//                                                      250 dias termina em poucos segundos)
//
// Para cobrir um horizonte grande de uma vez (ex: até o fim do ano que
// vem), chame esta function 2-3 vezes mudando `start` a cada vez (ver
// docs/CONTENT_GUIDE.md para os links prontos).
//
// Para manter o calendário sempre alimentado depois disso (sem precisar
// lembrar de rodar de novo), agende esta function para rodar 1x por
// semana (Supabase Dashboard > Edge Functions > Schedules, ou um cron
// externo) com os parâmetros padrão — assim o horizonte nunca se esgota.
//
// A API não tem outros idiomas além de pt-BR; por isso este sync sempre
// grava locale='pt-BR'. Traduções para outros idiomas continuam sendo
// preenchidas manualmente pela tela Admin > Liturgia.

import { createClient } from "npm:@supabase/supabase-js@2";

const SOURCE_BASE = "https://liturgia.up.railway.app/v2";
const MAX_DAYS_PER_CALL = 250;
const CONCURRENCY = 12;

interface LiturgiaApiReading {
  referencia?: string;
  titulo?: string;
  texto?: string;
}

interface LiturgiaApiResponse {
  erro?: string;
  data?: string;
  liturgia?: string;
  cor?: string;
  leituras?: {
    primeiraLeitura?: LiturgiaApiReading[];
    salmo?: (LiturgiaApiReading & { refrao?: string })[];
    segundaLeitura?: LiturgiaApiReading[];
    evangelho?: LiturgiaApiReading[];
  };
}

function toIsoDate(d: Date): string {
  return d.toISOString().slice(0, 10);
}

function mapSeason(celebration: string | undefined): string | null {
  if (!celebration) return null;
  const c = celebration.toLowerCase();
  if (c.includes("advento")) return "Advento";
  if (c.includes("natal") || c.includes("epifania") || c.includes("batismo do senhor")) return "Natal";
  if (c.includes("quaresma") || c.includes("cinzas") || c.includes("ramos") || c.includes("santo(a)")) return "Quaresma";
  if (c.includes("páscoa") || c.includes("pascal") || c.includes("pentecostes")) return "Tempo Pascal";
  return "Tempo Comum";
}

Deno.serve(async (req) => {
  const url = new URL(req.url);
  const startParam = url.searchParams.get("start");
  const startDate = startParam ? new Date(`${startParam}T00:00:00Z`) : new Date();
  if (Number.isNaN(startDate.getTime())) {
    return new Response(JSON.stringify({ error: "Parâmetro 'start' inválido, use YYYY-MM-DD." }), { status: 400 });
  }
  const days = Math.min(Math.max(Number(url.searchParams.get("days") ?? "30"), 1), MAX_DAYS_PER_CALL);

  const admin = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
  );

  const isoDates: string[] = [];
  for (let i = 0; i < days; i++) {
    const d = new Date(startDate);
    d.setUTCDate(d.getUTCDate() + i);
    isoDates.push(toIsoDate(d));
  }

  const synced: string[] = [];
  const failed: { date: string; reason: string }[] = [];

  async function syncOneDate(isoDate: string) {
    try {
      const resp = await fetch(`${SOURCE_BASE}/${isoDate}`);
      if (!resp.ok) {
        failed.push({ date: isoDate, reason: `HTTP ${resp.status}` });
        return;
      }
      const source = (await resp.json()) as LiturgiaApiResponse;
      if (source.erro) {
        failed.push({ date: isoDate, reason: source.erro });
        return;
      }

      const firstReading = source.leituras?.primeiraLeitura?.[0];
      const psalm = source.leituras?.salmo?.[0];
      const secondReading = source.leituras?.segundaLeitura?.[0];
      const gospel = source.leituras?.evangelho?.[0];

      const row = {
        date: isoDate,
        locale: "pt-BR",
        liturgical_color: source.cor ?? null,
        liturgical_season: mapSeason(source.liturgia),
        celebration: source.liturgia ?? null,
        first_reading_ref: firstReading?.referencia ?? null,
        first_reading_text: firstReading?.texto ?? null,
        psalm_ref: psalm?.referencia ?? null,
        psalm_text: psalm?.refrao ? `${psalm.refrao}\n\n${psalm.texto ?? ""}` : (psalm?.texto ?? null),
        second_reading_ref: secondReading?.referencia ?? null,
        second_reading_text: secondReading?.texto ?? null,
        gospel_ref: gospel?.referencia ?? null,
        gospel_text: gospel?.texto ?? null,
        source: SOURCE_BASE,
        synced_at: new Date().toISOString(),
      };

      const { error } = await admin.from("daily_liturgy").upsert(row, { onConflict: "date,locale" });
      if (error) {
        failed.push({ date: isoDate, reason: error.message });
        return;
      }
      synced.push(isoDate);
    } catch (err) {
      failed.push({ date: isoDate, reason: String(err) });
    }
  }

  // Processa em lotes paralelos (CONCURRENCY por vez) em vez de um dia por
  // vez sequencialmente — pra sincronizar centenas de dias sem estourar o
  // tempo máximo de execução da Edge Function.
  for (let i = 0; i < isoDates.length; i += CONCURRENCY) {
    const batch = isoDates.slice(i, i + CONCURRENCY);
    await Promise.all(batch.map(syncOneDate));
  }

  return new Response(
    JSON.stringify({ ok: failed.length === 0, synced_count: synced.length, failed_count: failed.length, synced, failed }),
    { status: 200, headers: { "Content-Type": "application/json" } },
  );
});
