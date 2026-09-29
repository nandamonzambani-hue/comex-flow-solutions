"use client";

import { Crud } from "@/components/admin/Crud";
import { challengeFields } from "@/lib/adminFields";

export default function Desafios() {
  return (
    <Crud
      table="challenges"
      title="Desafios"
      singular="desafio"
      fields={challengeFields}
      select="*, challenge_participants(count)"
      defaults={{ duration_days: 21, published: false }}
      orderBy={{ column: "created_at" }}
      searchColumn="title"
      imageFolder="desafios"
      detailHref={(r) => `/admin/desafios/${r.id}`}
      columns={[
        { label: "", render: (r) => (r.cover_url ? <img src={String(r.cover_url)} alt="" className="thumb" /> : <div className="thumb" />) },
        { label: "Título", render: (r) => String(r.title) },
        { label: "Dias", render: (r) => String(r.duration_days) },
        { label: "Participantes", render: (r) => String((r.challenge_participants as { count: number }[])?.[0]?.count ?? 0) },
        { label: "Status", render: (r) => (r.published ? <span className="badge green">publicado</span> : <span className="badge">rascunho</span>) },
      ]}
    />
  );
}
