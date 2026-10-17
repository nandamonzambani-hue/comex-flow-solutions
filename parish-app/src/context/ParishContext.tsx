import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/context/AuthContext";
import { colors as baseColors } from "@/theme/colors";
import type { Parish } from "@/types/database";

interface ParishContextValue {
  parish: Parish | null;
  /** Matriz da comunidade do usuário (null quando o usuário já é da Matriz). */
  parentParish: Parish | null;
  /**
   * Paróquias cujo conteúdo o fiel enxerga: a própria e, se for de uma
   * comunidade, a Matriz. Use em `.in("parish_id", visibleParishIds)` — a
   * RLS ainda filtra o que a Matriz marcou como "não compartilhar".
   */
  visibleParishIds: string[];
  /** Para a equipe: a própria paróquia e, se for Matriz, as comunidades dela. */
  managedParishes: Parish[];
  /** Paróquia/comunidade selecionada no painel ("Publicar em"). */
  adminParishId: string | null;
  setAdminParishId: (id: string) => void;
  loading: boolean;
  /** Cores da paróquia do usuário, com fallback pra paleta padrão quando ainda não carregou. */
  primaryColor: string;
  secondaryColor: string;
  refreshParish: () => Promise<void>;
}

const ParishContext = createContext<ParishContextValue | undefined>(undefined);

/**
 * Cada paróquia tem sua própria identidade visual (parishes.primary_color/
 * secondary_color/logo_url). Este provider carrega a paróquia do usuário
 * logado uma vez e disponibiliza as cores pro app inteiro via useTheme().
 * Também resolve a hierarquia Matriz → comunidades (ver migration 0013).
 */
export function ParishProvider({ children }: { children: ReactNode }) {
  const { profile, isStaff } = useAuth();
  const [parish, setParish] = useState<Parish | null>(null);
  const [parentParish, setParentParish] = useState<Parish | null>(null);
  const [communities, setCommunities] = useState<Parish[]>([]);
  const [adminParishId, setAdminParishId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const load = useCallback(async () => {
    if (!profile?.parish_id) {
      setParish(null);
      setParentParish(null);
      setCommunities([]);
      return;
    }
    setLoading(true);
    const { data } = await supabase.from("parishes").select("*").eq("id", profile.parish_id).single();
    const current = data as Parish | null;
    setParish(current);

    if (current?.parent_parish_id) {
      const { data: parent } = await supabase.from("parishes").select("*").eq("id", current.parent_parish_id).single();
      setParentParish(parent as Parish | null);
    } else {
      setParentParish(null);
    }

    if (current?.kind === "matriz") {
      const { data: children } = await supabase
        .from("parishes")
        .select("*")
        .eq("parent_parish_id", current.id)
        .order("name");
      setCommunities((children as Parish[]) ?? []);
    } else {
      setCommunities([]);
    }
    setLoading(false);
  }, [profile?.parish_id]);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    setAdminParishId(profile?.parish_id ?? null);
  }, [profile?.parish_id]);

  const value = useMemo<ParishContextValue>(() => {
    const visibleParishIds = [parish?.id, parish?.parent_parish_id].filter((id): id is string => !!id);
    const managedParishes = isStaff && parish ? [parish, ...communities] : [];
    return {
      parish,
      parentParish,
      visibleParishIds,
      managedParishes,
      adminParishId: adminParishId ?? parish?.id ?? null,
      setAdminParishId,
      loading,
      primaryColor: parish?.primary_color || baseColors.primary,
      secondaryColor: parish?.secondary_color || baseColors.secondary,
      refreshParish: load,
    };
  }, [parish, parentParish, communities, isStaff, adminParishId, loading, load]);

  return <ParishContext.Provider value={value}>{children}</ParishContext.Provider>;
}

export function useParishContext() {
  const ctx = useContext(ParishContext);
  if (!ctx) throw new Error("useParishContext deve ser usado dentro de <ParishProvider>");
  return ctx;
}

/** Paleta com as cores da paróquia aplicadas por cima da paleta padrão. */
export function useTheme() {
  const { primaryColor, secondaryColor } = useParishContext();
  return { ...baseColors, primary: primaryColor, secondary: secondaryColor };
}
