"use client";

import { Crud } from "@/components/admin/Crud";
import { mealPlanFields } from "@/lib/adminFields";
import { goalLabels } from "@/lib/labels";

export default function Cardapios() {
  return (
    <Crud
      table="meal_plans"
      title="Cardápios"
      singular="cardápio"
      fields={mealPlanFields}
      select="*, meal_plan_items(count)"
      defaults={{ published: false }}
      orderBy={{ column: "created_at" }}
      searchColumn="title"
      detailHref={(r) => `/admin/cardapios/${r.id}`}
      columns={[
        { label: "Título", render: (r) => String(r.title) },
        { label: "Objetivo", render: (r) => goalLabels[String(r.goal)] ?? "–" },
        { label: "kcal/dia", render: (r) => String(r.daily_calories ?? "–") },
        { label: "Refeições", render: (r) => String((r.meal_plan_items as { count: number }[])?.[0]?.count ?? 0) },
        { label: "Status", render: (r) => (r.published ? <span className="badge green">publicado</span> : <span className="badge">rascunho</span>) },
      ]}
    />
  );
}
