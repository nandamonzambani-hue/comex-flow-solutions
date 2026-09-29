"use client";

import { useCallback, useEffect, useState } from "react";
import { audienceLabels, formatDate } from "@/lib/labels";
import { callFunction, supabase } from "@/lib/supabase";

type Notification = { id: string; title: string; body: string; audience: string; deep_link: string | null; sent_at: string | null; recipients: number | null };

const links: Record<string, string> = {
  "": "Abrir o app (início)",
  "/treinos": "Lista de treinos",
  "/nutricao": "Nutrição",
  "/desafios": "Desafios",
  "/evolucao": "Evolução",
  "/assinatura": "Tela de assinatura",
};

export default function Notificacoes() {
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [audience, setAudience] = useState("todas");
  const [link, setLink] = useState("");
  const [custom, setCustom] = useState("");
  const [history, setHistory] = useState<Notification[]>([]);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");

  const load = useCallback(async () => {
    const { data } = await supabase().from("notifications").select("*").order("created_at", { ascending: false }).limit(50);
    setHistory((data ?? []) as Notification[]);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  async function send(e: React.FormEvent) {
    e.preventDefault();
    if (!confirm(`Enviar para "${audienceLabels[audience]}"?`)) return;
    setBusy(true);
    setMessage("");
    try {
      const deepLink = link === "custom" ? custom : link;
      const res = await callFunction<{ recipients: number }>("send-push", { title, body, audience, link: deepLink || undefined });
      setMessage(res.recipients >= 0 ? `Enviada para ${res.recipients} aparelhos!` : "Enviada para todas!");
      setTitle("");
      setBody("");
      load();
    } catch (err) {
      setMessage(err instanceof Error ? err.message : "Erro");
    } finally {
      setBusy(false);
    }
  }

  return (
    <>
      <div className="page-head"><h1>Notificações push</h1></div>
      <form className="card" onSubmit={send} style={{ maxWidth: 620 }}>
        <div className="field">
          <label>Título</label>
          <input value={title} maxLength={60} required onChange={(e) => setTitle(e.target.value)} placeholder="ex.: Treino novo no ar! 🔥" />
        </div>
        <div className="field">
          <label>Mensagem</label>
          <textarea value={body} maxLength={180} required onChange={(e) => setBody(e.target.value)} />
          <div className="small muted">{body.length}/180</div>
        </div>
        <div className="row">
          <div className="field" style={{ flex: 1 }}>
            <label>Público</label>
            <select value={audience} onChange={(e) => setAudience(e.target.value)}>
              {Object.entries(audienceLabels).map(([k, l]) => <option key={k} value={k}>{l}</option>)}
            </select>
          </div>
          <div className="field" style={{ flex: 1 }}>
            <label>Ao tocar, abrir</label>
            <select value={link} onChange={(e) => setLink(e.target.value)}>
              {Object.entries(links).map(([k, l]) => <option key={k} value={k}>{l}</option>)}
              <option value="custom">Outro caminho...</option>
            </select>
          </div>
        </div>
        {link === "custom" && (
          <div className="field">
            <input value={custom} onChange={(e) => setCustom(e.target.value)} placeholder="/treinos/ID-DO-TREINO" pattern="/.*" />
          </div>
        )}
        {message && <p className={message.endsWith("!") ? "ok" : "error"}>{message}</p>}
        <button className="btn" disabled={busy}>{busy ? "Enviando..." : "Enviar notificação"}</button>
      </form>

      <h2 style={{ marginTop: 28 }}>Histórico</h2>
      <div className="table-wrap">
        <table>
          <thead><tr><th>Enviada em</th><th>Título</th><th>Mensagem</th><th>Público</th><th>Aparelhos</th></tr></thead>
          <tbody>
            {history.map((n) => (
              <tr key={n.id}>
                <td>{formatDate(n.sent_at, true)}</td>
                <td>{n.title}</td>
                <td className="small">{n.body}</td>
                <td>{audienceLabels[n.audience]}</td>
                <td>{n.recipients === -1 ? "tópico" : n.recipients ?? "–"}</td>
              </tr>
            ))}
            {history.length === 0 && <tr><td colSpan={5} className="muted center">Nenhuma notificação enviada.</td></tr>}
          </tbody>
        </table>
      </div>
    </>
  );
}
