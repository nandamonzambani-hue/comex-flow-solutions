"use client";

import { useEffect, useState } from "react";
import { SiteShell } from "@/components/SiteShell";
import { supabase } from "@/lib/supabase";

/** Página aberta pelo link de "esqueci a senha" (do app ou do site). */
export default function RedefinirSenha() {
  const [ready, setReady] = useState(false);
  const [password, setPassword] = useState("");
  const [done, setDone] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const db = supabase();
    db.auth.getSession().then(({ data }) => setReady(Boolean(data.session)));
    const { data } = db.auth.onAuthStateChange((event, session) => {
      if (event === "PASSWORD_RECOVERY" || session) setReady(true);
    });
    return () => data.subscription.unsubscribe();
  }, []);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    const { error } = await supabase().auth.updateUser({ password });
    if (error) setError(error.message);
    else setDone(true);
  }

  return (
    <SiteShell>
      <div className="narrow">
        {done ? (
          <div className="card center"><h2>Senha alterada!</h2><p className="muted">Agora é só entrar no app com a nova senha.</p></div>
        ) : !ready ? (
          <div className="card"><p>Abra esta página pelo link enviado ao seu e-mail.</p></div>
        ) : (
          <form className="card" onSubmit={submit}>
            <h2>Nova senha</h2>
            <div className="field">
              <label htmlFor="pw">Nova senha (mínimo 8 caracteres)</label>
              <input id="pw" type="password" minLength={8} required value={password} onChange={(e) => setPassword(e.target.value)} autoComplete="new-password" />
            </div>
            {error && <p className="error">{error}</p>}
            <button className="btn block">Salvar</button>
          </form>
        )}
      </div>
    </SiteShell>
  );
}
