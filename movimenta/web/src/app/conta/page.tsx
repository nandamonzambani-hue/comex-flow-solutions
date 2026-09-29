"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { AuthForm } from "@/components/AuthForm";
import { SiteShell } from "@/components/SiteShell";
import { formatDate } from "@/lib/labels";
import { callFunction, supabase } from "@/lib/supabase";
import { useAuth } from "@/lib/useAuth";

type Sub = { status: string; current_period_end: string | null; cancel_at_period_end: boolean };
type StoreSub = { store: string; status: string; current_period_end: string | null; will_renew: boolean };

const storeNames: Record<string, string> = { app_store: "App Store (iPhone)", play_store: "Google Play (Android)" };

export default function Conta() {
  const { session, profile, loading } = useAuth();
  const [sub, setSub] = useState<Sub | null>(null);
  const [storeSub, setStoreSub] = useState<StoreSub | null>(null);
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
    supabase()
      .from("store_subscriptions")
      .select("store, status, current_period_end, will_renew")
      .eq("user_id", session.user.id)
      .maybeSingle()
      .then(({ data }) => setStoreSub(data as StoreSub | null));
  }, [session]);

  const storeActive =
    storeSub && ["active", "trialing"].includes(storeSub.status) &&
    (!storeSub.current_period_end || new Date(storeSub.current_period_end) > new Date());

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
                ) : storeActive ? null : (
                  <span className="badge">Sem assinatura ativa</span>
                )}
              </div>
              {error && <p className="error">{error}</p>}
              {sub ? (
                <button className="btn secondary block" disabled={busy} onClick={portal}>
                  Gerenciar pagamento, faturas e cancelamento
                </button>
              ) : null}
              {storeActive && (
                <div>
                  <span className="badge green">Assinatura ativa pela {storeNames[storeSub!.store] ?? storeSub!.store}</span>
                  <p className="small muted">
                    {storeSub!.will_renew ? "Renova em " : "Acesso até "}{formatDate(storeSub!.current_period_end)}.
                    Para gerenciar ou cancelar, use as configurações de assinaturas da loja no seu celular.
                  </p>
                </div>
              )}
              {!active && !storeActive && <Link href="/assinar" className="btn block">Assinar</Link>}
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
