"use client";

import { Crud, type Field } from "@/components/admin/Crud";
import { levelLabels } from "@/lib/labels";

const fields: Field[] = [
  { name: "name", label: "Nome", type: "text", required: true },
  { name: "video_id", label: "Vídeo", type: "video", help: "Envie o vídeo antes em Vídeos." },
  { name: "muscle_group", label: "Grupo muscular", type: "text" },
  { name: "equipment", label: "Equipamento", type: "text", help: "ex.: Halteres, elástico, peso do corpo" },
  { name: "level", label: "Nível", type: "select", options: levelLabels, required: true },
  { name: "description", label: "Descrição", type: "textarea" },
  { name: "instructions", label: "Instruções (passo a passo)", type: "list" },
];

export default function Exercicios() {
  return (
    <Crud
      table="exercises"
      title="Exercícios"
      singular="exercício"
      fields={fields}
      select="*, videos(title, status)"
      defaults={{ level: "iniciante", instructions: [] }}
      orderBy={{ column: "name", ascending: true }}
      searchColumn="name"
      columns={[
        { label: "Nome", render: (r) => String(r.name) },
        { label: "Músculo", render: (r) => String(r.muscle_group ?? "–") },
        { label: "Nível", render: (r) => levelLabels[String(r.level)] },
        {
          label: "Vídeo",
          render: (r) => {
            const v = r.videos as { title: string; status: string } | null;
            return v ? <span className={`badge ${v.status === "pronto" ? "green" : ""}`}>{v.title}</span> : <span className="badge red">sem vídeo</span>;
          },
        },
      ]}
    />
  );
}
