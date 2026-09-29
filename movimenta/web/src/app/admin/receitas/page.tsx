"use client";

import { Crud } from "@/components/admin/Crud";
import { recipeFields } from "@/lib/adminFields";
import { mealLabels } from "@/lib/labels";

export default function Receitas() {
  return (
    <Crud
      table="recipes"
      title="Receitas"
      singular="receita"
      fields={recipeFields}
      defaults={{ ingredients: [], steps: [], tags: [], servings: 1, is_free: false, published: false }}
      orderBy={{ column: "created_at" }}
      searchColumn="title"
      imageFolder="receitas"
      columns={[
        { label: "", render: (r) => (r.image_url ? <img src={String(r.image_url)} alt="" className="thumb" /> : <div className="thumb" />) },
        { label: "Título", render: (r) => String(r.title) },
        { label: "Refeição", render: (r) => mealLabels[String(r.meal_type)] ?? "–" },
        { label: "kcal", render: (r) => String(r.calories ?? "–") },
        {
          label: "Status",
          render: (r) => (
            <div className="row" style={{ gap: 4 }}>
              {r.published ? <span className="badge green">publicada</span> : <span className="badge">rascunho</span>}
              {Boolean(r.is_free) && <span className="badge pink">grátis</span>}
            </div>
          ),
        },
      ]}
    />
  );
}
