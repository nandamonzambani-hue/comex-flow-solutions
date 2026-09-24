import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/context/AuthContext";
import { colors as baseColors } from "@/theme/colors";
import type { Parish } from "@/types/database";

interface ParishContextValue {
  parish: Parish | null;
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
 */
export function ParishProvider({ children }: { children: ReactNode }) {
  const { profile } = useAuth();
  const [parish, setParish] = useState<Parish | null>(null);
  const [loading, setLoading] = useState(false);

  const load = useCallback(async () => {
    if (!profile?.parish_id) {
      setParish(null);
      return;
    }
    setLoading(true);
    const { data } = await supabase.from("parishes").select("*").eq("id", profile.parish_id).single();
    setParish(data as Parish | null);
    setLoading(false);
  }, [profile?.parish_id]);

  useEffect(() => {
    load();
  }, [load]);

  const value = useMemo<ParishContextValue>(
    () => ({
      parish,
      loading,
      primaryColor: parish?.primary_color || baseColors.primary,
      secondaryColor: parish?.secondary_color || baseColors.secondary,
      refreshParish: load,
    }),
    [parish, loading, load],
  );

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
