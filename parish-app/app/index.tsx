import { Redirect } from "expo-router";
import { useAuth } from "@/context/AuthContext";

export default function Index() {
  const { session, profile, loading, isPlatformAdmin } = useAuth();

  if (!session) return <Redirect href="/(auth)/login" />;
  if (loading || !profile) return null;

  // Sem paróquia: platform admin puro vai direto pro painel dele; membro
  // comum cai no hub de onboarding (buscar ou cadastrar uma paróquia).
  if (!profile.parish_id) {
    return <Redirect href={isPlatformAdmin ? "/platform-admin" : "/(auth)/onboarding"} />;
  }

  return <Redirect href="/(tabs)" />;
}
