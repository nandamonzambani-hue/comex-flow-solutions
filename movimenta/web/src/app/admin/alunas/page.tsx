"use client";

import { useCallback, useEffect, useState } from "react";
import { formatDate, goalLabels, levelLabels } from "@/lib/labels";
import { supabase } from "@/lib/supabase";

type Student = {
  id: string;
  full_name: string | null;
  email: string;
  goal: string | null;
  level: string;
  created_at: string;
  subscription_status: string;
  current_period_end: string | null;
  workouts_done: number;
  last_workout_at: string | null;
  total_count: number;
  subscription_source: string | null;
};

const sourceLabels: Record<string, string> = { app_store: "App Store", play_store: "Google Play", site: "Site", promotional: "Cortesia" };

const PAGE = 50;

export default function Alunas() {
  const [rows, setRows] = useState<Student[]>([]);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(0);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    const { data, error } = await supabase().rpc("admin_list_students", {
      search: search || null,
      page_size: PAGE,
      page_offset: page * PAGE,
    });
    if (error) setError(error.message);
    else setRows((data ?? []) as Student[]);
  }, [search, page]);

  useEffect(() => {
    const t = setTimeout(load, 250);
    return () => clearTimeout(t);
  }, [load]);

  const total = rows[0]?.total_count ?? 0;
  const pages = Math.max(1, Math.ceil(total / PAGE));

  function isActive(s: Student) {
    return ["active", "trialing"].includes(s.subscription_status) &&
      (!s.current_period_end || new Date(s.current_period_end) > new Date());
  }

  function exportCsv() {
    const header = ["nome", "email", "objetivo", "nivel", "cadastro", "assinatura", "origem", "treinos", "ultimo_treino"];
    const lines = rows.map((s) => [
      s.full_name ?? "", s.email, goalLabels[s.goal ?? ""] ?? "", levelLabels[s.level] ?? "",
      formatDate(s.created_at), isActive(s) ? "ativa" : s.subscription_status, sourceLabels[s.subscription_source ?? ""] ?? "", s.workouts_done, formatDate(s.last_workout_at),
    ].map((v) => `"${String(v).replaceAll('"', '""')}"`).join(","));
    const blob = new Blob([[header.join(","), ...lines].join("\n")], { type: "text/csv;charset=utf-8" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "alunas.csv";
    a.click();
  }

  return (
    <>
      <div className="page-head">
        <h1>Alunas</h1>
        <span className="badge">{total}</span>
        <span className="spacer" />
        <button className="btn secondary sm" onClick={exportCsv}>Exportar página (CSV)</button>
      </div>
      <div className="field" style={{ maxWidth: 360 }}>
        <input placeholder="Buscar por nome ou e-mail" value={search} onChange={(e) => { setPage(0); setSearch(e.target.value); }} />
      </div>
      {error && <p className="error">{error}</p>}
      <div className="table-wrap">
        <table>
          <thead>
            <tr><th>Nome</th><th>E-mail</th><th>Objetivo</th><th>Nível</th><th>Cadastro</th><th>Assinatura</th><th>Treinos</th><th>Último treino</th></tr>
          </thead>
          <tbody>
            {rows.map((s) => (
              <tr key={s.id}>
                <td>{s.full_name || "—"}</td>
                <td>{s.email}</td>
                <td>{goalLabels[s.goal ?? ""] ?? "—"}</td>
                <td>{levelLabels[s.level] ?? s.level}</td>
                <td>{formatDate(s.created_at)}</td>
                <td>
                  {isActive(s)
                    ? <span className="badge green">{s.subscription_status === "trialing" ? "teste" : "ativa"} · {sourceLabels[s.subscription_source ?? ""] ?? s.subscription_source}</span>
                    : <span className="badge">{s.subscription_status === "inactive" ? "grátis" : s.subscription_status}</span>}
                </td>
                <td>{s.workouts_done}</td>
                <td>{formatDate(s.last_workout_at)}</td>
              </tr>
            ))}
            {rows.length === 0 && <tr><td colSpan={8} className="muted center">Nenhuma aluna encontrada.</td></tr>}
          </tbody>
        </table>
      </div>
      {pages > 1 && (
        <div className="row" style={{ marginTop: 12 }}>
          <button className="btn sm secondary" disabled={page === 0} onClick={() => setPage(page - 1)}>Anterior</button>
          <span className="small muted">Página {page + 1} de {pages}</span>
          <button className="btn sm secondary" disabled={page + 1 >= pages} onClick={() => setPage(page + 1)}>Próxima</button>
        </div>
      )}
    </>
  );
}
