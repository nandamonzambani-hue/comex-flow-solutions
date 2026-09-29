"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { supabase, uploadImage } from "@/lib/supabase";

export type Row = Record<string, unknown> & { id: string };

export type Field = {
  name: string;
  label: string;
  type: "text" | "textarea" | "number" | "select" | "bool" | "list" | "image" | "video";
  options?: Record<string, string>;
  required?: boolean;
  help?: string;
};

export type Column = { label: string; render: (row: Row) => React.ReactNode };

type Props = {
  table: string;
  title: string;
  singular: string;
  fields: Field[];
  columns: Column[];
  orderBy?: { column: string; ascending?: boolean };
  select?: string;
  defaults?: Record<string, unknown>;
  searchColumn?: string;
  detailHref?: (row: Row) => string;
  imageFolder?: string;
  pageSize?: number;
  headerExtra?: React.ReactNode;
};

/** Listagem paginada + formulário de criar/editar/excluir para uma tabela. */
export function Crud(props: Props) {
  const { table, fields, columns, orderBy, select = "*", searchColumn, pageSize = 25 } = props;
  const [rows, setRows] = useState<Row[]>([]);
  const [count, setCount] = useState(0);
  const [page, setPage] = useState(0);
  const [search, setSearch] = useState("");
  const [editing, setEditing] = useState<Row | "new" | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    let q = supabase().from(table).select(select, { count: "exact" });
    if (search && searchColumn) q = q.ilike(searchColumn, `%${search}%`);
    if (orderBy) q = q.order(orderBy.column, { ascending: orderBy.ascending ?? false });
    const { data, error, count } = await q.range(page * pageSize, page * pageSize + pageSize - 1);
    if (error) setError(error.message);
    else {
      setRows((data ?? []) as unknown as Row[]);
      setCount(count ?? 0);
      setError("");
    }
    setLoading(false);
  }, [table, select, search, searchColumn, orderBy, page, pageSize]);

  useEffect(() => {
    load();
  }, [load]);

  async function remove(row: Row) {
    if (!confirm(`Excluir "${String(row.title ?? row.name ?? row.id)}"? Essa ação não pode ser desfeita.`)) return;
    const { error } = await supabase().from(table).delete().eq("id", row.id);
    if (error) alert(error.message.includes("foreign key") ? "Não é possível excluir: o item está em uso." : error.message);
    else load();
  }

  const pages = Math.max(1, Math.ceil(count / pageSize));

  return (
    <>
      <div className="page-head">
        <h1>{props.title}</h1>
        <span className="badge">{count}</span>
        <span className="spacer" />
        {props.headerExtra}
        <button className="btn" onClick={() => setEditing("new")}>+ Novo {props.singular}</button>
      </div>
      {searchColumn && (
        <div className="field" style={{ maxWidth: 360 }}>
          <input
            placeholder="Buscar..."
            value={search}
            onChange={(e) => {
              setPage(0);
              setSearch(e.target.value);
            }}
          />
        </div>
      )}
      {error && <p className="error">{error}</p>}
      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              {columns.map((c) => <th key={c.label}>{c.label}</th>)}
              <th style={{ width: 170 }} />
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.id}>
                {columns.map((c) => <td key={c.label}>{c.render(row)}</td>)}
                <td>
                  <div className="row" style={{ gap: 4, flexWrap: "nowrap" }}>
                    {props.detailHref && <Link className="btn sm secondary" href={props.detailHref(row)}>Abrir</Link>}
                    <button className="btn sm secondary" onClick={() => setEditing(row)}>Editar</button>
                    <button className="btn sm ghost" onClick={() => remove(row)} title="Excluir">✕</button>
                  </div>
                </td>
              </tr>
            ))}
            {!loading && rows.length === 0 && (
              <tr><td colSpan={columns.length + 1} className="muted center">Nada por aqui ainda.</td></tr>
            )}
          </tbody>
        </table>
      </div>
      {pages > 1 && (
        <div className="row" style={{ marginTop: 12 }}>
          <button className="btn sm secondary" disabled={page === 0} onClick={() => setPage(page - 1)}>Anterior</button>
          <span className="small muted">Página {page + 1} de {pages}</span>
          <button className="btn sm secondary" disabled={page + 1 >= pages} onClick={() => setPage(page + 1)}>Próxima</button>
        </div>
      )}
      {editing && (
        <RecordForm
          table={table}
          fields={fields}
          title={editing === "new" ? `Novo ${props.singular}` : `Editar ${props.singular}`}
          initial={editing === "new" ? { ...(props.defaults ?? {}) } : editing}
          imageFolder={props.imageFolder ?? table}
          onClose={(saved) => {
            setEditing(null);
            if (saved) load();
          }}
        />
      )}
    </>
  );
}

/** Formulário em modal. Também usado pelas telas de detalhe. */
export function RecordForm(props: {
  table: string;
  fields: Field[];
  title: string;
  initial: Record<string, unknown>;
  imageFolder: string;
  onClose: (saved: boolean) => void;
}) {
  const [values, setValues] = useState<Record<string, unknown>>(props.initial);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const set = (name: string, value: unknown) => setValues((v) => ({ ...v, [name]: value }));

  async function save(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError("");
    const payload: Record<string, unknown> = {};
    for (const f of props.fields) {
      let v = values[f.name];
      if (f.type === "number") v = v === "" || v === undefined || v === null ? null : Number(v);
      if ((f.type === "select" || f.type === "video" || f.type === "image") && v === "") v = null;
      if (f.type === "list") v = Array.isArray(v) ? v.map((s) => String(s).trim()).filter(Boolean) : [];
      if (f.type === "bool") v = Boolean(v);
      payload[f.name] = v ?? null;
    }
    const db = supabase().from(props.table);
    const id = props.initial.id as string | undefined;
    const { error } = id ? await db.update(payload).eq("id", id) : await db.insert(payload);
    setBusy(false);
    if (error) setError(error.message);
    else props.onClose(true);
  }

  return (
    <div className="modal-bg" onClick={(e) => e.target === e.currentTarget && props.onClose(false)}>
      <form className="modal" onSubmit={save}>
        <h2>{props.title}</h2>
        {props.fields.map((f) => (
          <FieldInput key={f.name} field={f} value={values[f.name]} onChange={(v) => set(f.name, v)} imageFolder={props.imageFolder} />
        ))}
        {error && <p className="error">{error}</p>}
        <div className="row">
          <button className="btn" disabled={busy}>{busy ? "Salvando..." : "Salvar"}</button>
          <button type="button" className="btn ghost" onClick={() => props.onClose(false)}>Cancelar</button>
        </div>
      </form>
    </div>
  );
}

let videoCache: { id: string; title: string }[] | null = null;

function FieldInput({ field, value, onChange, imageFolder }: {
  field: Field;
  value: unknown;
  onChange: (v: unknown) => void;
  imageFolder: string;
}) {
  const [uploading, setUploading] = useState(false);
  const [videos, setVideos] = useState(videoCache);

  useEffect(() => {
    if (field.type !== "video" || videoCache) return;
    supabase().from("videos").select("id, title").order("title").then(({ data }) => {
      videoCache = data ?? [];
      setVideos(videoCache);
    });
  }, [field.type]);

  const id = `f_${field.name}`;
  const str = value === null || value === undefined ? "" : String(value);

  if (field.type === "bool") {
    return (
      <div className="field">
        <label className="check"><input type="checkbox" checked={Boolean(value)} onChange={(e) => onChange(e.target.checked)} />{field.label}</label>
        {field.help && <div className="small muted">{field.help}</div>}
      </div>
    );
  }

  let input: React.ReactNode;
  switch (field.type) {
    case "textarea":
      input = <textarea id={id} value={str} required={field.required} onChange={(e) => onChange(e.target.value)} />;
      break;
    case "number":
      input = <input id={id} type="number" step="any" value={str} required={field.required} onChange={(e) => onChange(e.target.value)} />;
      break;
    case "select":
      input = (
        <select id={id} value={str} required={field.required} onChange={(e) => onChange(e.target.value)}>
          <option value="">—</option>
          {Object.entries(field.options ?? {}).map(([k, label]) => <option key={k} value={k}>{label}</option>)}
        </select>
      );
      break;
    case "video":
      input = (
        <select id={id} value={str} onChange={(e) => onChange(e.target.value)}>
          <option value="">Sem vídeo</option>
          {(videos ?? []).map((v) => <option key={v.id} value={v.id}>{v.title}</option>)}
        </select>
      );
      break;
    case "list":
      input = (
        <textarea
          id={id}
          value={Array.isArray(value) ? value.join("\n") : ""}
          placeholder="Um item por linha"
          onChange={(e) => onChange(e.target.value.split("\n"))}
        />
      );
      break;
    case "image":
      input = (
        <div className="row">
          {str && <img src={str} alt="" className="thumb" />}
          <input
            id={id}
            type="file"
            accept="image/*"
            style={{ flex: 1 }}
            onChange={async (e) => {
              const file = e.target.files?.[0];
              if (!file) return;
              setUploading(true);
              try {
                onChange(await uploadImage(file, imageFolder));
              } catch (err) {
                alert(err instanceof Error ? err.message : "Falha no envio");
              } finally {
                setUploading(false);
              }
            }}
          />
          {str && <button type="button" className="btn sm ghost" onClick={() => onChange(null)}>Remover</button>}
          {uploading && <span className="small muted">Enviando...</span>}
        </div>
      );
      break;
    default:
      input = <input id={id} value={str} required={field.required} onChange={(e) => onChange(e.target.value)} />;
  }

  return (
    <div className="field">
      <label htmlFor={id}>{field.label}</label>
      {input}
      {field.help && <div className="small muted">{field.help}</div>}
    </div>
  );
}
