"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";

/** Login / cadastro por e-mail e senha — a mesma conta vale para o app e o site. */
export function AuthForm({ onDone, allowSignup = true }: { onDone?: () => void; allowSignup?: boolean }) {
  const [mode, setMode] = useState<"entrar" | "cadastrar" | "recuperar">("entrar");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<{ text: string; ok?: boolean } | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setMessage(null);
    const auth = supabase().auth;
    try {
      if (mode === "entrar") {
        const { error } = await auth.signInWithPassword({ email, password });
        if (error) throw error;
        onDone?.();
      } else if (mode === "cadastrar") {
        const { data, error } = await auth.signUp({ email, password, options: { data: { full_name: name } } });
        if (error) throw error;
        if (!data.session) setMessage({ text: "Enviamos um link de confirmação para o seu e-mail.", ok: true });
        else onDone?.();
      } else {
        const { error } = await auth.resetPasswordForEmail(email, {
          redirectTo: `${window.location.origin}/redefinir-senha`,
        });
        if (error) throw error;
        setMessage({ text: "Se o e-mail tiver cadastro, você receberá um link para criar nova senha.", ok: true });
      }
    } catch (err) {
      const text = err instanceof Error ? err.message : String(err);
      setMessage({
        text: /invalid login/i.test(text) ? "E-mail ou senha incorretos." : text,
      });
    } finally {
      setBusy(false);
    }
  }

  return (
    <form onSubmit={submit} className="card">
      <h2>{mode === "entrar" ? "Entrar" : mode === "cadastrar" ? "Criar conta" : "Recuperar senha"}</h2>
      {mode === "cadastrar" && (
        <div className="field">
          <label htmlFor="name">Nome</label>
          <input id="name" required value={name} onChange={(e) => setName(e.target.value)} autoComplete="name" />
        </div>
      )}
      <div className="field">
        <label htmlFor="email">E-mail</label>
        <input id="email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="email" />
      </div>
      {mode !== "recuperar" && (
        <div className="field">
          <label htmlFor="password">Senha</label>
          <input
            id="password"
            type="password"
            required
            minLength={mode === "cadastrar" ? 8 : undefined}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete={mode === "cadastrar" ? "new-password" : "current-password"}
          />
        </div>
      )}
      {message && <p className={message.ok ? "ok" : "error"}>{message.text}</p>}
      <button className="btn block" disabled={busy}>
        {busy ? "Aguarde..." : mode === "entrar" ? "Entrar" : mode === "cadastrar" ? "Criar conta" : "Enviar link"}
      </button>
      <div className="row small" style={{ marginTop: 12 }}>
        {mode !== "entrar" && <button type="button" className="btn ghost sm" onClick={() => setMode("entrar")}>Já tenho conta</button>}
        {mode === "entrar" && allowSignup && (
          <button type="button" className="btn ghost sm" onClick={() => setMode("cadastrar")}>Criar conta</button>
        )}
        {mode === "entrar" && (
          <button type="button" className="btn ghost sm" onClick={() => setMode("recuperar")}>Esqueci a senha</button>
        )}
      </div>
    </form>
  );
}
