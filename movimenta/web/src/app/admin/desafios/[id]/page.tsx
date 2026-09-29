"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { RecordForm } from "@/components/admin/Crud";
import { challengeFields } from "@/lib/adminFields";
import { supabase } from "@/lib/supabase";

type Day = { day_number: number; title: string; task: string | null; workout_id: string | null };

export default function DesafioDetalhe() {
  const { id } = useParams<{ id: string }>();
  const [challenge, setChallenge] = useState<Record<string, unknown> | null>(null);
  const [days, setDays] = useState<Day[]>([]);
  const [workouts, setWorkouts] = useState<{ id: string; title: string }[]>([]);
  const [editing, setEditing] = useState(false);
  const [dirty, setDirty] = useState(false);
  const [message, setMessage] = useState("");

  const load = useCallback(async () => {
    const db = supabase();
    const [c, d, w] = await Promise.all([
      db.from("challenges").select("*").eq("id", id).single(),
      db.from("challenge_days").select("day_number, title, task, workout_id").eq("challenge_id", id).order("day_number"),
      db.from("workouts").select("id, title").order("title"),
    ]);
    const total = Number(c.data?.duration_days ?? 0);
    const existing = (d.data ?? []) as Day[];
    // Mostra uma linha por dia do desafio, preenchendo os que ainda não existem.
    setDays(Array.from({ length: total }, (_, i) =>
      existing.find((x) => x.day_number === i + 1) ?? { day_number: i + 1, title: "", task: null, workout_id: null }));
    setChallenge(c.data);
    setWorkouts(w.data ?? []);
    setDirty(false);
  }, [id]);

  useEffect(() => {
    load();
  }, [load]);

  const update = (i: number, patch: Partial<Day>) => {
    setDays((all) => all.map((d, j) => (j === i ? { ...d, ...patch } : d)));
    setDirty(true);
  };

  async function save() {
    setMessage("");
    const db = supabase();
    const filled = days.filter((d) => d.title.trim());
    const del = await db.from("challenge_days").delete().eq("challenge_id", id);
    if (del.error) return setMessage(del.error.message);
    if (filled.length) {
      const { error } = await db.from("challenge_days").insert(filled.map((d) => ({
        challenge_id: id, day_number: d.day_number, title: d.title.trim(), task: d.task || null, workout_id: d.workout_id || null,
      })));
      if (error) return setMessage(error.message);
    }
    setMessage("Desafio salvo!");
    load();
  }

  if (!challenge) return <p>Carregando...</p>;
  return (
    <>
      <div className="page-head">
        <Link href="/admin/desafios" className="btn ghost sm">← Desafios</Link>
        <h1>{String(challenge.title)}</h1>
        <span className="spacer" />
        <button className="btn secondary sm" onClick={() => setEditing(true)}>Editar dados</button>
      </div>
      <p className="muted small">Dias sem título não aparecem no app. Para mudar a quantidade de dias, edite os dados do desafio.</p>
      <div className="table-wrap">
        <table>
          <thead><tr><th>Dia</th><th>Título</th><th>Tarefa</th><th>Treino do dia</th></tr></thead>
          <tbody>
            {days.map((d, i) => (
              <tr key={d.day_number}>
                <td>{d.day_number}</td>
                <td><input value={d.title} onChange={(e) => update(i, { title: e.target.value })} placeholder="ex.: Pernas em casa" /></td>
                <td><input value={d.task ?? ""} onChange={(e) => update(i, { task: e.target.value })} placeholder="ex.: Beber 2 L de água" /></td>
                <td>
                  <select value={d.workout_id ?? ""} onChange={(e) => update(i, { workout_id: e.target.value || null })}>
                    <option value="">—</option>
                    {workouts.map((w) => <option key={w.id} value={w.id}>{w.title}</option>)}
                  </select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="row" style={{ marginTop: 14 }}>
        <span className="spacer" />
        {message && <span className={message.endsWith("!") ? "ok" : "error"}>{message}</span>}
        <button className="btn" disabled={!dirty} onClick={save}>Salvar dias</button>
      </div>
      {editing && (
        <RecordForm
          table="challenges"
          fields={challengeFields}
          title="Editar desafio"
          initial={challenge}
          imageFolder="desafios"
          onClose={(saved) => { setEditing(false); if (saved) load(); }}
        />
      )}
    </>
  );
}
