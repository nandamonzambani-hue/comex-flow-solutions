"use client";

import Link from "next/link";
import { useState } from "react";
import { AuthForm } from "@/components/AuthForm";
import { SiteShell } from "@/components/SiteShell";
import { callFunction } from "@/lib/supabase";
import { useAuth } from "@/lib/useAuth";

const plans = [
  { id: process.env.NEXT_PUBLIC_PRICE_MENSAL_ID, name: "Mensal", label: process.env.NEXT_PUBLIC_PRICE_MENSAL_LABEL },
  { id: process.env.NEXT_PUBLIC_PRICE_ANUAL_ID, name: "Anual", label: process.env.NEXT_PUBLIC_PRICE_ANUAL_LABEL },
].filter((p): p is { id: string; name: string; label: string | undefined } => Boolean(p.id));

export default function Assinar() {
  const { session, loading } = useAuth();
  const [selected, setSelected] = useState(plans[plans.length - 1]?.id);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function checkout() {
    setBusy(true);
    setError("");
    try {
      const { url } = await callFunction<{ url: string }>("create-checkout", { priceId: selected });
      window.location.href = url;
    } catch (e) {
      setError(e instanceof Error ? e.message : "Erro ao iniciar pagamento");
      setBusy(false);
    }
  }

  return (
    <SiteShell>
      <div className="container" style={{ maxWidth: 720, padding: "24px 16px" }}>
        <h1>Assine e libere tudo</h1>
        <p className="muted">Todos os treinos com vídeo, cardápios semanais, receitas completas e desafios. Cancele quando quiser.</p>
        {loading ? (
          <p>Carregando...</p>
        ) : !session ? (
          <>
            <p><strong>1.</strong> Entre ou crie sua conta (use o mesmo e-mail do app).</p>
            <AuthForm />
          </>
        ) : (
          <div className="stack">
            <p className="muted small">Conectada como {session.user.email}</p>
            {plans.length === 0 && <p className="error">Nenhum plano configurado (NEXT_PUBLIC_PRICE_*).</p>}
            <div className="plans">
              {plans.map((p) => (
                <button
                  key={p.id}
                  type="button"
                  className={`card plan ${selected === p.id ? "selected" : ""}`}
                  style={{ textAlign: "left", cursor: "pointer", font: "inherit" }}
                  onClick={() => setSelected(p.id)}
                >
                  <h3>{p.name}</h3>
                  <p className="muted">{p.label}</p>
                </button>
              ))}
            </div>
            {error && <p className="error">{error}</p>}
            <button className="btn block" disabled={busy || !selected} onClick={checkout}>
              {busy ? "Abrindo pagamento..." : "Continuar para o pagamento"}
            </button>
            <p className="small muted center">
              Pagamento seguro via Stripe (cartão). Ao assinar você concorda com os <Link href="/privacidade">termos</Link>.
            </p>
          </div>
        )}
      </div>
    </SiteShell>
  );
}
