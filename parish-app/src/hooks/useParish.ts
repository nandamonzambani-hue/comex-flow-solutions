import { useAuth } from "@/context/AuthContext";
import { useParishContext } from "@/context/ParishContext";

/** Atalho para o parish_id do usuário logado (app é multi-tenant no schema, single-tenant no app). */
export function useParishId(): string | null {
  const { profile } = useAuth();
  return profile?.parish_id ?? null;
}

/**
 * IDs cujo conteúdo o fiel enxerga: a própria paróquia/comunidade e, se for
 * comunidade, a Matriz. Usar nas listagens com `.in("parish_id", ids)`.
 */
export function useVisibleParishIds(): string[] {
  return useParishContext().visibleParishIds;
}

/**
 * Paróquia em que o painel está publicando/gerenciando agora (seletor
 * "Publicar em" do layout de admin). Para equipe de comunidade é sempre a
 * própria comunidade; para a Matriz pode ser a Matriz ou uma comunidade.
 */
export function useAdminParish() {
  const { adminParishId, managedParishes, parish } = useParishContext();
  const target = managedParishes.find((p) => p.id === adminParishId) ?? parish;
  return {
    parishId: target?.id ?? null,
    parish: target ?? null,
    /** true quando o alvo é a Matriz — aí faz sentido o switch "mostrar nas comunidades". */
    isMatrizTarget: target?.kind === "matriz" && managedParishes.length > 1,
  };
}
