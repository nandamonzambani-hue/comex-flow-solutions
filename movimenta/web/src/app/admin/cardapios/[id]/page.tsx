"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { RecordForm } from "@/components/admin/Crud";
import { mealPlanFields } from "@/lib/adminFields";
import { mealLabels, weekDays } from "@/lib/labels";
import { supabase } from "@/lib/supabase";

type Item = { id: string; day_of_week: number; meal_type: string; recipe_id: string | null; description: string | null };
type Recipe = { id: string; title: string; meal_type: string | null; calories: number | null };

/** Grade semanal: 7 dias × refeições. Cada célula aponta para uma receita ou um texto livre. */
export default function CardapioDetalhe() {
  const { id } = useParams<{ id: string }>();
  const [plan, setPlan] = useState<Record<string, unknown> | null>(null);
  const [items, setItems] = useState<Item[]>([]);
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [editing, setEditing] = useState(false);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    const db = supabase();
    const [p, i, r] = await Promise.all([
      db.from("meal_plans").select("*").eq("id", id).single(),
      db.from("meal_plan_items").select("*").eq("meal_plan_id", id),
      db.from("recipes").select("id, title, meal_type, calories").order("title"),
    ]);
    setPlan(p.data);
    setItems((i.data ?? []) as Item[]);
    setRecipes((r.data ?? []) as Recipe[]);
  }, [id]);

  useEffect(() => {
    load();
  }, [load]);

  const cell = (day: number, meal: string) => items.find((i) => i.day_of_week === day && i.meal_type === meal);

  async function setCell(day: number, meal: string, value: { recipe_id?: string | null; description?: string | null }) {
    setError("");
    const db = supabase();
    const existing = cell(day, meal);
    const recipe_id = value.recipe_id !== undefined ? value.recipe_id : existing?.recipe_id ?? null;
    const description = value.description !== undefined ? value.description : existing?.description ?? null;
    const res = !recipe_id && !description
      ? existing ? await db.from("meal_plan_items").delete().eq("id", existing.id) : { error: null }
      : existing
      ? await db.from("meal_plan_items").update({ recipe_id, description }).eq("id", existing.id)
      : await db.from("meal_plan_items").insert({ meal_plan_id: id, day_of_week: day, meal_type: meal, recipe_id, description });
    if (res.error) setError(res.error.message);
    load();
  }

  async function copyDay(from: number) {
    if (!confirm(`Copiar ${weekDays[from - 1]} para todos os outros dias? As refeições existentes serão substituídas.`)) return;
    const db = supabase();
    const source = items.filter((i) => i.day_of_week === from);
    await db.from("meal_plan_items").delete().eq("meal_plan_id", id).neq("day_of_week", from);
    const rows = [1, 2, 3, 4, 5, 6, 7].filter((d) => d !== from).flatMap((d) =>
      source.map((s) => ({ meal_plan_id: id, day_of_week: d, meal_type: s.meal_type, recipe_id: s.recipe_id, description: s.description })),
    );
    if (rows.length) {
      const { error } = await db.from("meal_plan_items").insert(rows);
      if (error) setError(error.message);
    }
    load();
  }

  if (!plan) return <p>Carregando...</p>;
  const dayCalories = (day: number) =>
    items.filter((i) => i.day_of_week === day).reduce((t, i) => t + (recipes.find((r) => r.id === i.recipe_id)?.calories ?? 0), 0);

  return (
    <>
      <div className="page-head">
        <Link href="/admin/cardapios" className="btn ghost sm">← Cardápios</Link>
        <h1>{String(plan.title)}</h1>
        {plan.published ? <span className="badge green">publicado</span> : <span className="badge">rascunho</span>}
        <span className="spacer" />
        <button className="btn secondary sm" onClick={() => setEditing(true)}>Editar dados</button>
      </div>
      {error && <p className="error">{error}</p>}
      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Refeição</th>
              {weekDays.map((d, i) => (
                <th key={d}>
                  {d}
                  <div className="small muted">{dayCalories(i + 1) || ""}{dayCalories(i + 1) ? " kcal" : ""}</div>
                  <button className="btn sm ghost" onClick={() => copyDay(i + 1)} title="Copiar para os outros dias">copiar ▸</button>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {Object.entries(mealLabels).map(([meal, label]) => (
              <tr key={meal}>
                <td><strong>{label}</strong></td>
                {weekDays.map((_, i) => {
                  const c = cell(i + 1, meal);
                  return (
                    <td key={i} style={{ minWidth: 160 }}>
                      <select value={c?.recipe_id ?? ""} onChange={(e) => setCell(i + 1, meal, { recipe_id: e.target.value || null })}>
                        <option value="">—</option>
                        {recipes.map((r) => <option key={r.id} value={r.id}>{r.title}</option>)}
                      </select>
                      <input
                        placeholder="ou texto livre"
                        style={{ marginTop: 4 }}
                        defaultValue={c?.description ?? ""}
                        key={`${c?.id}-${c?.description}`}
                        onBlur={(e) => e.target.value !== (c?.description ?? "") && setCell(i + 1, meal, { description: e.target.value || null })}
                      />
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {editing && (
        <RecordForm
          table="meal_plans"
          fields={mealPlanFields}
          title="Editar cardápio"
          initial={plan}
          imageFolder="cardapios"
          onClose={(saved) => { setEditing(false); if (saved) load(); }}
        />
      )}
    </>
  );
}
