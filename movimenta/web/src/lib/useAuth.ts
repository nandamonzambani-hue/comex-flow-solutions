"use client";

import type { Session } from "@supabase/supabase-js";
import { useEffect, useState } from "react";
import { supabase } from "./supabase";

export type Profile = { id: string; full_name: string | null; role: "aluna" | "admin" };

/** Sessão atual + perfil. `loading` fica true até a primeira resposta. */
export function useAuth() {
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const db = supabase();
    let active = true;

    async function load(s: Session | null) {
      setSession(s);
      if (!s) {
        setProfile(null);
        setLoading(false);
        return;
      }
      const { data } = await db.from("profiles").select("id, full_name, role").eq("id", s.user.id).maybeSingle();
      if (active) {
        setProfile(data as Profile | null);
        setLoading(false);
      }
    }

    db.auth.getSession().then(({ data }) => load(data.session));
    const { data: sub } = db.auth.onAuthStateChange((_event, s) => {
      // Evita chamadas ao banco dentro do callback de auth (recomendação do Supabase).
      setTimeout(() => load(s), 0);
    });
    return () => {
      active = false;
      sub.subscription.unsubscribe();
    };
  }, []);

  return { session, profile, loading, isAdmin: profile?.role === "admin" };
}
