import { Redirect } from "expo-router";
import { useAuth } from "@/context/AuthContext";

export default function Index() {
  const { session, profile, loading } = useAuth();

  if (!session) return <Redirect href="/(auth)/login" />;
  if (loading || !profile) return null;

  return <Redirect href="/(tabs)" />;
}
