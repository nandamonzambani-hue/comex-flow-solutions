import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import type { Session } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabase";
import type { MemberRole, Profile } from "@/types/database";
import { registerPushToken } from "@/lib/notifications";
import { syncLocaleFromProfile, type LocaleCode } from "@/i18n";

interface AuthContextValue {
  session: Session | null;
  profile: Profile | null;
  loading: boolean;
  isStaff: boolean;
  isPlatformAdmin: boolean;
  signIn: (email: string, password: string) => Promise<{ error: string | null }>;
  signUp: (params: { email: string; password: string; fullName: string }) => Promise<{
    error: string | null;
  }>;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

const STAFF_ROLES: MemberRole[] = ["staff", "admin", "pastor"];

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [isPlatformAdmin, setIsPlatformAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  async function loadProfile(userId: string) {
    const { data } = await supabase.from("profiles").select("*").eq("id", userId).single();
    setProfile(data as Profile | null);
    await syncLocaleFromProfile((data as Profile | null)?.preferred_locale as LocaleCode | undefined);

    const { data: platformAdminRow } = await supabase
      .from("platform_admins")
      .select("profile_id")
      .eq("profile_id", userId)
      .maybeSingle();
    setIsPlatformAdmin(!!platformAdminRow);
  }

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      if (data.session?.user) loadProfile(data.session.user.id);
      setLoading(false);
    });

    const { data: listener } = supabase.auth.onAuthStateChange((_event, newSession) => {
      setSession(newSession);
      if (newSession?.user) {
        loadProfile(newSession.user.id);
        registerPushToken(newSession.user.id).catch(() => {
          // notificações são opcionais; falha de permissão não deve travar o login
        });
      } else {
        setProfile(null);
        setIsPlatformAdmin(false);
      }
    });

    return () => listener.subscription.unsubscribe();
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      session,
      profile,
      loading,
      isStaff: profile ? STAFF_ROLES.includes(profile.role) : false,
      isPlatformAdmin,
      async signIn(email, password) {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        return { error: error?.message ?? null };
      },
      async signUp({ email, password, fullName }) {
        // O perfil é criado automaticamente por um trigger em auth.users
        // (ver migrations/0007_auto_create_profile.sql) — não pelo
        // cliente, porque logo após signUp() ainda não existe sessão
        // válida (Supabase exige confirmação de e-mail antes disso), e
        // qualquer insert feito pelo app nesse intervalo bate na RLS.
        // full_name vai nos metadados do usuário pra o trigger usar.
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: { data: { full_name: fullName } },
        });
        return { error: error?.message ?? null };
      },
      async signOut() {
        await supabase.auth.signOut();
      },
      async refreshProfile() {
        if (session?.user) await loadProfile(session.user.id);
      },
    }),
    [session, profile, loading, isPlatformAdmin],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth deve ser usado dentro de <AuthProvider>");
  return ctx;
}
