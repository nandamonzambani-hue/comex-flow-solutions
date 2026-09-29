"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { AuthForm } from "@/components/AuthForm";
import { appName } from "@/lib/labels";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/lib/useAuth";

const links = [
  ["/admin", "Painel"],
  ["/admin/alunas", "Alunas"],
  ["/admin/treinos", "Treinos"],
  ["/admin/exercicios", "Exercícios"],
  ["/admin/videos", "Vídeos"],
  ["/admin/receitas", "Receitas"],
  ["/admin/cardapios", "Cardápios"],
  ["/admin/desafios", "Desafios"],
  ["/admin/notificacoes", "Notificações"],
] as const;

/** O painel só aparece para perfis com role = 'admin'. Mesmo que alguém force a
 *  interface, o banco (RLS) e as Edge Functions recusam as operações. */
export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { session, loading, isAdmin } = useAuth();
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  if (loading) return <p className="center" style={{ marginTop: 80 }}>Carregando...</p>;
  if (!session) {
    return (
      <div className="narrow">
        <h1 className="center">{appName} · Painel</h1>
        <AuthForm allowSignup={false} />
      </div>
    );
  }
  if (!isAdmin) {
    return (
      <div className="narrow card center stack">
        <h2>Acesso restrito</h2>
        <p className="muted">A conta {session.user.email} não é administradora.</p>
        <button className="btn secondary" onClick={() => supabase().auth.signOut()}>Sair</button>
      </div>
    );
  }

  return (
    <div className="admin">
      <aside className={`sidebar ${open ? "open" : ""}`}>
        <button className="btn sm ghost menu-toggle" style={{ color: "#fff" }} onClick={() => setOpen(!open)}>☰</button>
        <Link href="/admin" className="logo">{appName}</Link>
        <nav onClick={() => setOpen(false)}>
          {links.map(([href, label]) => {
            const active = href === "/admin" ? pathname === href : pathname.startsWith(href);
            return <Link key={href} href={href} className={active ? "active" : ""}>{label}</Link>;
          })}
          <a href="#" onClick={(e) => { e.preventDefault(); supabase().auth.signOut(); }}>Sair</a>
        </nav>
      </aside>
      <main className="main">{children}</main>
    </div>
  );
}
