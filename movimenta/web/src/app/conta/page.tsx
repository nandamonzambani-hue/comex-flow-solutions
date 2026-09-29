"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { AuthForm } from "@/components/AuthForm";
import { SiteShell } from "@/components/SiteShell";
import { formatDate } from "@/lib/labels";
import { callFunction, supabase } from "@/lib/supabase";
import { useAuth } from "@/lib/useAuth";

type Sub = { status: string; current_period_end: string | null; cancel_at_period_end: boolean };

export default function Conta() {
  const { session, profile, loading } = useAuth();
  const [sub, setSub] = useState<Sub | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!session) return;
    supabase()
      .from("subscriptions")
      .select("status, current_period_end, cancel_at_period_end")
      .eq("user_id", session.user.id)
      .maybeSingle()
      .then(({ data }) => setSub(data as Sub | null));
  }, [session]);

  const active =
    sub && ["active", "trialing"].includes(sub.status) &&
    (!sub.current_period_end || new Date(sub.current_period_end) > new Date());

  async function portal() {
    setBusy(true);
    setError("");
    try {
      const { url } = await callFunction<{ url: string }>("customer-portal");
      window.location.href = url;
    } catch (e) {
      setError(e instanceof Error ? e.message : "Erro");
      setBusy(false);
    }
  }

  return (
    <SiteShell>
      <div className="narrow stack">
        <h1>Minha conta</h1>
        {loading ? (
          <p>Carregando...</p>
        ) : !session ? (
          <AuthForm />
        ) : (
          <>
            <div className="card stack">
              <div><strong>{profile?.full_name}</strong><div className="muted small">{session.user.email}</div></div>
              <div>
                {active ? (
                  <>
                    <span className="badge green">Assinatura ativa</span>
                    <p className="small muted">
                      {sub?.cancel_at_period_end ? "Cancelada — acesso até " : "Renova em "}
                      {formatDate(sub?.current_period_end)}
                    </p>
                  </>
                ) : (
                  <span className="badge">Sem assinatura ativa</span>
                )}
              </div>
              {error && <p className="error">{error}</p>}
              {sub ? (
                <button className="btn secondary block" disabled={busy} onClick={portal}>
                  Gerenciar pagamento, faturas e cancelamento
                </button>
              ) : null}
              {!active && <Link href="/assinar" className="btn block">Assinar</Link>}
            </div>
            <div className="row">
              <button className="btn ghost" onClick={() => supabase().auth.signOut()}>Sair</button>
              <span className="spacer" />
              <Link href="/excluir-conta" className="small">Excluir minha conta</Link>
            </div>
          </>
        )}
      </div>
    </SiteShell>
  );
}
