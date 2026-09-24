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
  /** parishId opcional: sem ele, o perfil nasce sem paróquia (fluxo de onboarding decide depois). */
  signUp: (params: { email: string; password: string; fullName: string; parishId?: string }) => Promise<{
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
      async signUp({ email, password, fullName, parishId }) {
        const { data, error } = await supabase.auth.signUp({ email, password });
        if (error) return { error: error.message };
        if (data.user) {
          const { error: profileError } = await supabase.from("profiles").insert({
            id: data.user.id,
            parish_id: parishId ?? null,
            full_name: fullName,
            email,
          });
          if (profileError) return { error: profileError.message };
        }
        return { error: null };
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
