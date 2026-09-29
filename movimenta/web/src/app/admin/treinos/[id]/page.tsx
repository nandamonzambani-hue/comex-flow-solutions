"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { RecordForm } from "@/components/admin/Crud";
import { levelLabels } from "@/lib/labels";
import { supabase } from "@/lib/supabase";
import { workoutFields } from "@/lib/adminFields";

type Step = {
  id?: string;
  exercise_id: string;
  position: number;
  sets: number;
  reps: string | null;
  duration_seconds: number | null;
  rest_seconds: number;
  notes: string | null;
};
type Exercise = { id: string; name: string; muscle_group: string | null; video_id: string | null };

/** Montagem do treino: exercícios em ordem, com séries, repetições/tempo e descanso. */
export default function TreinoDetalhe() {
  const { id } = useParams<{ id: string }>();
  const [workout, setWorkout] = useState<Record<string, unknown> | null>(null);
  const [steps, setSteps] = useState<Step[]>([]);
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [editing, setEditing] = useState(false);
  const [dirty, setDirty] = useState(false);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");

  const load = useCallback(async () => {
    const db = supabase();
    const [w, s, e] = await Promise.all([
      db.from("workouts").select("*").eq("id", id).single(),
      db.from("workout_exercises").select("*").eq("workout_id", id).order("position"),
      db.from("exercises").select("id, name, muscle_group, video_id").order("name"),
    ]);
    setWorkout(w.data);
    setSteps((s.data ?? []) as Step[]);
    setExercises((e.data ?? []) as Exercise[]);
    setDirty(false);
  }, [id]);

  useEffect(() => {
    load();
  }, [load]);

  const update = (i: number, patch: Partial<Step>) => {
    setSteps((all) => all.map((s, j) => (j === i ? { ...s, ...patch } : s)));
    setDirty(true);
  };
  const move = (i: number, dir: -1 | 1) => {
    const j = i + dir;
    if (j < 0 || j >= steps.length) return;
    const next = [...steps];
    [next[i], next[j]] = [next[j], next[i]];
    setSteps(next);
    setDirty(true);
  };
  const add = () => {
    if (!exercises.length) return alert("Cadastre exercícios primeiro.");
    setSteps([...steps, { exercise_id: exercises[0].id, position: steps.length + 1, sets: 3, reps: "12", duration_seconds: null, rest_seconds: 45, notes: null }]);
    setDirty(true);
  };

  async function save() {
    setBusy(true);
    setMessage("");
    const db = supabase();
    // Regrava a lista inteira: simples e sem conflito com a restrição (workout_id, position).
    const del = await db.from("workout_exercises").delete().eq("workout_id", id);
    if (del.error) {
      setMessage(del.error.message);
      setBusy(false);
      return;
    }
    if (steps.length) {
      const { error } = await db.from("workout_exercises").insert(
        steps.map((s, i) => ({
          workout_id: id,
          exercise_id: s.exercise_id,
          position: i + 1,
          sets: Number(s.sets) || 1,
          reps: s.duration_seconds ? null : s.reps || null,
          duration_seconds: s.duration_seconds ? Number(s.duration_seconds) : null,
          rest_seconds: Number(s.rest_seconds) || 0,
          notes: s.notes || null,
        })),
      );
      if (error) {
        setMessage(error.message);
        setBusy(false);
        return;
      }
    }
    setBusy(false);
    setMessage("Treino salvo!");
    load();
  }

  if (!workout) return <p>Carregando...</p>;
  const estimate = Math.round(
    steps.reduce((t, s) => t + s.sets * ((s.duration_seconds ? Number(s.duration_seconds) : 40) + Number(s.rest_seconds || 0)), 0) / 60,
  );

  return (
    <>
      <div className="page-head">
        <Link href="/admin/treinos" className="btn ghost sm">← Treinos</Link>
        <h1>{String(workout.title)}</h1>
        {workout.published ? <span className="badge green">publicado</span> : <span className="badge">rascunho</span>}
        <span className="spacer" />
        <button className="btn secondary sm" onClick={() => setEditing(true)}>Editar dados</button>
      </div>
      <p className="muted">
        {levelLabels[String(workout.level)]} · {steps.length} exercícios · duração estimada ~{estimate} min
        {workout.duration_minutes ? ` (informada: ${workout.duration_minutes} min)` : ""}
      </p>

      <div className="table-wrap">
        <table>
          <thead>
            <tr><th>#</th><th>Exercício</th><th>Séries</th><th>Repetições</th><th>ou Tempo (s)</th><th>Descanso (s)</th><th>Dica</th><th /></tr>
          </thead>
          <tbody>
            {steps.map((s, i) => {
              const ex = exercises.find((e) => e.id === s.exercise_id);
              return (
                <tr key={i}>
                  <td>{i + 1}</td>
                  <td style={{ minWidth: 200 }}>
                    <select value={s.exercise_id} onChange={(e) => update(i, { exercise_id: e.target.value })}>
                      {exercises.map((e) => <option key={e.id} value={e.id}>{e.name}{e.muscle_group ? ` (${e.muscle_group})` : ""}</option>)}
                    </select>
                    {ex && !ex.video_id && <div className="small error">sem vídeo</div>}
                  </td>
                  <td><input type="number" min={1} style={{ width: 70 }} value={s.sets} onChange={(e) => update(i, { sets: Number(e.target.value) })} /></td>
                  <td><input style={{ width: 90 }} value={s.reps ?? ""} placeholder="12" disabled={Boolean(s.duration_seconds)} onChange={(e) => update(i, { reps: e.target.value })} /></td>
                  <td><input type="number" min={0} style={{ width: 80 }} value={s.duration_seconds ?? ""} onChange={(e) => update(i, { duration_seconds: e.target.value ? Number(e.target.value) : null })} /></td>
                  <td><input type="number" min={0} style={{ width: 80 }} value={s.rest_seconds} onChange={(e) => update(i, { rest_seconds: Number(e.target.value) })} /></td>
                  <td><input value={s.notes ?? ""} onChange={(e) => update(i, { notes: e.target.value })} /></td>
                  <td>
                    <div className="row" style={{ gap: 2, flexWrap: "nowrap" }}>
                      <button className="btn sm ghost" onClick={() => move(i, -1)} title="Subir">↑</button>
                      <button className="btn sm ghost" onClick={() => move(i, 1)} title="Descer">↓</button>
                      <button className="btn sm ghost" onClick={() => { setSteps(steps.filter((_, j) => j !== i)); setDirty(true); }} title="Remover">✕</button>
                    </div>
                  </td>
                </tr>
              );
            })}
            {steps.length === 0 && <tr><td colSpan={8} className="muted center">Adicione o primeiro exercício.</td></tr>}
          </tbody>
        </table>
      </div>
      <div className="row" style={{ marginTop: 14 }}>
        <button className="btn secondary" onClick={add}>+ Adicionar exercício</button>
        <span className="spacer" />
        {message && <span className={message.endsWith("!") ? "ok" : "error"}>{message}</span>}
        <button className="btn" disabled={busy || !dirty} onClick={save}>{busy ? "Salvando..." : "Salvar treino"}</button>
      </div>

      {editing && (
        <RecordForm
          table="workouts"
          fields={workoutFields}
          title="Editar treino"
          initial={workout}
          imageFolder="treinos"
          onClose={(saved) => { setEditing(false); if (saved) load(); }}
        />
      )}
    </>
  );
}
