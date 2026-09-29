"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

type Dashboard = {
  total_users: number;
  active_subscribers: number;
  new_users_30d: number;
  workouts_done_7d: number;
  published_workouts: number;
  videos_ready: number;
};

export default function AdminHome() {
  const [d, setD] = useState<Dashboard | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    supabase().rpc("admin_dashboard").then(({ data, error }) => {
      if (error) setError(error.message);
      else setD((data as Dashboard[])[0]);
    });
  }, []);

  const conversion = d && d.total_users > 0 ? ((d.active_subscribers / d.total_users) * 100).toFixed(1) : "0";
  const cards: [string, string | number | undefined, string][] = [
    ["Alunas", d?.total_users, "/admin/alunas"],
    ["Assinantes ativas", d?.active_subscribers, "/admin/alunas"],
    ["Conversão", `${conversion}%`, "/admin/alunas"],
    ["Novas (30 dias)", d?.new_users_30d, "/admin/alunas"],
    ["Treinos feitos (7 dias)", d?.workouts_done_7d, "/admin/treinos"],
    ["Treinos publicados", d?.published_workouts, "/admin/treinos"],
    ["Vídeos prontos", d?.videos_ready, "/admin/videos"],
  ];

  return (
    <>
      <div className="page-head"><h1>Painel</h1></div>
      {error && <p className="error">{error}</p>}
      <div className="grid">
        {cards.map(([label, value, href]) => (
          <Link key={label} href={href} className="card" style={{ color: "inherit", textDecoration: "none" }}>
            <div className="muted small">{label}</div>
            <div className="stat">{value ?? "…"}</div>
          </Link>
        ))}
      </div>
      <div className="card" style={{ marginTop: 20 }}>
        <h3>Primeiros passos</h3>
        <ol className="muted">
          <li>Envie os vídeos dos exercícios em <Link href="/admin/videos">Vídeos</Link>.</li>
          <li>Cadastre os <Link href="/admin/exercicios">Exercícios</Link> e ligue cada um ao seu vídeo.</li>
          <li>Monte os <Link href="/admin/treinos">Treinos</Link> (séries, repetições e descanso) e publique.</li>
          <li>Adicione <Link href="/admin/receitas">Receitas</Link>, <Link href="/admin/cardapios">Cardápios</Link> e <Link href="/admin/desafios">Desafios</Link>.</li>
        </ol>
      </div>
    </>
  );
}
