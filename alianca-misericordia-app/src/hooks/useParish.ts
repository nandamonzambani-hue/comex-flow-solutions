import { useAuth } from "@/context/AuthContext";

/** Atalho para o parish_id do usuário logado (app é multi-tenant no schema, single-tenant no app). */
export function useParishId(): string | null {
  const { profile } = useAuth();
  return profile?.parish_id ?? null;
}
