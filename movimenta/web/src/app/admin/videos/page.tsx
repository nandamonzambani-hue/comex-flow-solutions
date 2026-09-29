"use client";

import { useCallback, useEffect, useState } from "react";
import { formatDate, levelLabels, videoStatusLabels } from "@/lib/labels";
import { callFunction, supabase } from "@/lib/supabase";

type Video = {
  id: string;
  title: string;
  status: string;
  category: string | null;
  muscle_group: string | null;
  level: string | null;
  duration_seconds: number | null;
  created_at: string;
};

const statusBadge: Record<string, string> = { pronto: "green", erro: "red", processando: "pink" };
const MAX_BASIC_UPLOAD = 200 * 1024 * 1024; // limite do upload direto simples da Cloudflare

export default function Videos() {
  const [videos, setVideos] = useState<Video[]>([]);
  const [search, setSearch] = useState("");
  const [showUpload, setShowUpload] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    let q = supabase().from("videos").select("*").order("created_at", { ascending: false }).limit(200);
    if (search) q = q.ilike("title", `%${search}%`);
    const { data, error } = await q;
    if (error) setError(error.message);
    else setVideos((data ?? []) as Video[]);
  }, [search]);

  useEffect(() => {
    load();
  }, [load]);

  // Enquanto houver vídeo processando, atualiza a lista a cada 10 s.
  useEffect(() => {
    if (!videos.some((v) => v.status === "processando" || v.status === "aguardando_upload")) return;
    const t = setInterval(load, 10000);
    return () => clearInterval(t);
  }, [videos, load]);

  async function sync(v: Video) {
    try {
      await callFunction("stream-sync", { videoId: v.id });
      load();
    } catch (e) {
      alert(e instanceof Error ? e.message : "Erro");
    }
  }

  async function remove(v: Video) {
    if (!confirm(`Excluir o vídeo "${v.title}"? Ele será apagado da Cloudflare e sairá dos exercícios.`)) return;
    try {
      await callFunction("stream-delete", { videoId: v.id });
      load();
    } catch (e) {
      alert(e instanceof Error ? e.message : "Erro");
    }
  }

  async function watch(v: Video) {
    try {
      const { hls } = await callFunction<{ hls: string }>("stream-token", { videoId: v.id });
      // O iframe do player da Cloudflare aceita o token no lugar do UID.
      const token = hls.split("/").at(-3);
      const host = new URL(hls).host;
      setPreview(`https://${host}/${token}/iframe`);
    } catch (e) {
      alert(e instanceof Error ? e.message : "Erro");
    }
  }

  async function saveMeta(v: Video, field: keyof Video, value: string) {
    const { error } = await supabase().from("videos").update({ [field]: value || null }).eq("id", v.id);
    if (error) alert(error.message);
    else load();
  }

  return (
    <>
      <div className="page-head">
        <h1>Vídeos</h1>
        <span className="badge">{videos.length}</span>
        <span className="spacer" />
        <button className="btn" onClick={() => setShowUpload(true)}>+ Enviar vídeo</button>
      </div>
      <p className="muted small">
        Os vídeos vão direto do seu navegador para o Cloudflare Stream — não passam pelo servidor do app. A reprodução
        exige link assinado, gerado só para quem tem acesso.
      </p>
      <div className="field" style={{ maxWidth: 360 }}>
        <input placeholder="Buscar por título" value={search} onChange={(e) => setSearch(e.target.value)} />
      </div>
      {error && <p className="error">{error}</p>}
      <div className="table-wrap">
        <table>
          <thead>
            <tr><th>Título</th><th>Status</th><th>Categoria</th><th>Músculo</th><th>Nível</th><th>Duração</th><th>Enviado</th><th /></tr>
          </thead>
          <tbody>
            {videos.map((v) => (
              <tr key={v.id}>
                <td>{v.title}</td>
                <td><span className={`badge ${statusBadge[v.status] ?? ""}`}>{videoStatusLabels[v.status] ?? v.status}</span></td>
                <td>
                  <input defaultValue={v.category ?? ""} onBlur={(e) => e.target.value !== (v.category ?? "") && saveMeta(v, "category", e.target.value)} />
                </td>
                <td>
                  <input defaultValue={v.muscle_group ?? ""} onBlur={(e) => e.target.value !== (v.muscle_group ?? "") && saveMeta(v, "muscle_group", e.target.value)} />
                </td>
                <td>
                  <select value={v.level ?? ""} onChange={(e) => saveMeta(v, "level", e.target.value)}>
                    <option value="">—</option>
                    {Object.entries(levelLabels).map(([k, l]) => <option key={k} value={k}>{l}</option>)}
                  </select>
                </td>
                <td>{v.duration_seconds ? `${Math.floor(v.duration_seconds / 60)}:${String(v.duration_seconds % 60).padStart(2, "0")}` : "–"}</td>
                <td>{formatDate(v.created_at)}</td>
                <td>
                  <div className="row" style={{ gap: 4, flexWrap: "nowrap" }}>
                    {v.status === "pronto" && <button className="btn sm secondary" onClick={() => watch(v)}>Assistir</button>}
                    {v.status !== "pronto" && <button className="btn sm secondary" onClick={() => sync(v)}>Verificar</button>}
                    <button className="btn sm ghost" onClick={() => remove(v)} title="Excluir">✕</button>
                  </div>
                </td>
              </tr>
            ))}
            {videos.length === 0 && <tr><td colSpan={8} className="muted center">Nenhum vídeo enviado.</td></tr>}
          </tbody>
        </table>
      </div>
      {showUpload && <UploadModal onClose={() => { setShowUpload(false); load(); }} />}
      {preview && (
        <div className="modal-bg" onClick={() => setPreview(null)}>
          <div className="modal" style={{ maxWidth: 820 }}>
            <div style={{ position: "relative", paddingTop: "56.25%" }}>
              <iframe src={preview} allow="autoplay; fullscreen" style={{ position: "absolute", inset: 0, width: "100%", height: "100%", border: 0 }} />
            </div>
          </div>
        </div>
      )}
    </>
  );
}

function UploadModal({ onClose }: { onClose: () => void }) {
  const [files, setFiles] = useState<File[]>([]);
  const [category, setCategory] = useState("");
  const [muscle, setMuscle] = useState("");
  const [level, setLevel] = useState("");
  const [progress, setProgress] = useState<Record<string, number>>({});
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  function send(url: string, file: File) {
    return new Promise<void>((resolve, reject) => {
      const form = new FormData();
      form.append("file", file);
      const xhr = new XMLHttpRequest();
      xhr.open("POST", url);
      xhr.upload.onprogress = (e) => e.lengthComputable && setProgress((p) => ({ ...p, [file.name]: e.loaded / e.total }));
      xhr.onload = () => (xhr.status < 300 ? resolve() : reject(new Error(`Falha no envio (${xhr.status})`)));
      xhr.onerror = () => reject(new Error("Falha de rede no envio"));
      xhr.send(form);
    });
  }

  async function start() {
    setBusy(true);
    setError("");
    try {
      for (const file of files) {
        const title = file.name.replace(/\.[^.]+$/, "").replace(/[_-]+/g, " ");
        const { uploadURL } = await callFunction<{ uploadURL: string }>("stream-upload", {
          title,
          category: category || null,
          muscleGroup: muscle || null,
          level: level || null,
        });
        await send(uploadURL, file);
        setProgress((p) => ({ ...p, [file.name]: 1 }));
      }
      onClose();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Erro");
      setBusy(false);
    }
  }

  const tooBig = files.filter((f) => f.size > MAX_BASIC_UPLOAD);

  return (
    <div className="modal-bg">
      <div className="modal">
        <h2>Enviar vídeos</h2>
        <div className="field">
          <label>Arquivos (MP4/MOV, até 200 MB cada — o título vem do nome do arquivo)</label>
          <input type="file" accept="video/*" multiple onChange={(e) => setFiles(Array.from(e.target.files ?? []))} />
        </div>
        <div className="row">
          <div className="field" style={{ flex: 1 }}><label>Categoria</label><input value={category} onChange={(e) => setCategory(e.target.value)} placeholder="ex.: Glúteos" /></div>
          <div className="field" style={{ flex: 1 }}><label>Músculo</label><input value={muscle} onChange={(e) => setMuscle(e.target.value)} placeholder="ex.: Quadríceps" /></div>
          <div className="field" style={{ flex: 1 }}>
            <label>Nível</label>
            <select value={level} onChange={(e) => setLevel(e.target.value)}>
              <option value="">—</option>
              {Object.entries(levelLabels).map(([k, l]) => <option key={k} value={k}>{l}</option>)}
            </select>
          </div>
        </div>
        {files.map((f) => (
          <div key={f.name} style={{ marginBottom: 8 }}>
            <div className="small">{f.name} · {(f.size / 1024 / 1024).toFixed(1)} MB</div>
            <div className="progress"><div style={{ width: `${(progress[f.name] ?? 0) * 100}%` }} /></div>
          </div>
        ))}
        {tooBig.length > 0 && <p className="error">Arquivos acima de 200 MB: comprima antes de enviar (vídeos de exercício costumam ter menos de 50 MB em 1080p).</p>}
        {error && <p className="error">{error}</p>}
        <div className="row">
          <button className="btn" disabled={busy || files.length === 0 || tooBig.length > 0} onClick={start}>
            {busy ? "Enviando..." : `Enviar ${files.length || ""}`}
          </button>
          <button className="btn ghost" disabled={busy} onClick={onClose}>Fechar</button>
        </div>
      </div>
    </div>
  );
}
