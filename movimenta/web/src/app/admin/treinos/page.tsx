"use client";

import { Crud } from "@/components/admin/Crud";
import { workoutFields } from "@/lib/adminFields";
import { levelLabels } from "@/lib/labels";

export default function Treinos() {
  return (
    <Crud
      table="workouts"
      title="Treinos"
      singular="treino"
      fields={workoutFields}
      select="*, workout_exercises(count)"
      defaults={{ level: "iniciante", is_free: false, published: false }}
      orderBy={{ column: "created_at" }}
      searchColumn="title"
      imageFolder="treinos"
      detailHref={(r) => `/admin/treinos/${r.id}`}
      columns={[
        { label: "", render: (r) => (r.cover_url ? <img src={String(r.cover_url)} alt="" className="thumb" /> : <div className="thumb" />) },
        { label: "Título", render: (r) => String(r.title) },
        { label: "Nível", render: (r) => levelLabels[String(r.level)] },
        { label: "Exercícios", render: (r) => String((r.workout_exercises as { count: number }[])?.[0]?.count ?? 0) },
        {
          label: "Status",
          render: (r) => (
            <div className="row" style={{ gap: 4 }}>
              {r.published ? <span className="badge green">publicado</span> : <span className="badge">rascunho</span>}
              {Boolean(r.is_free) && <span className="badge pink">grátis</span>}
            </div>
          ),
        },
      ]}
    />
  );
}
