"use client";

import { useState } from "react";
import { AuthForm } from "@/components/AuthForm";
import { SiteShell } from "@/components/SiteShell";
import { callFunction, supabase } from "@/lib/supabase";
import { useAuth } from "@/lib/useAuth";

/** Exigência do Google Play e da LGPD: excluir a conta também pela web. */
export default function ExcluirConta() {
  const { session, loading } = useAuth();
  const [confirm, setConfirm] = useState("");
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState("");

  async function remove() {
    setBusy(true);
    setError("");
    try {
      await callFunction("delete-account");
      await supabase().auth.signOut();
      setDone(true);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Erro");
    } finally {
      setBusy(false);
    }
  }

  return (
    <SiteShell>
      <div className="narrow stack">
        <h1>Excluir conta</h1>
        <p className="muted">
          A exclusão apaga permanentemente seu perfil, medidas, histórico de treinos e favoritos, e cancela a
          assinatura feita pelo site. <strong>Assinaturas feitas pelo app (App Store ou Google Play) precisam ser
          canceladas na própria loja</strong>, antes de excluir a conta. Registros de pagamento podem ser mantidos
          pelo prazo exigido em lei.
        </p>
        {done ? (
          <div className="card"><p className="ok">Sua conta foi excluída.</p></div>
        ) : loading ? (
          <p>Carregando...</p>
        ) : !session ? (
          <AuthForm allowSignup={false} />
        ) : (
          <div className="card stack">
            <p>Conectada como <strong>{session.user.email}</strong>. Digite <strong>EXCLUIR</strong> para confirmar.</p>
            <input value={confirm} onChange={(e) => setConfirm(e.target.value)} />
            {error && <p className="error">{error}</p>}
            <button className="btn danger block" disabled={busy || confirm !== "EXCLUIR"} onClick={remove}>
              Excluir minha conta definitivamente
            </button>
          </div>
        )}
      </div>
    </SiteShell>
  );
}
