import { Redirect, Stack } from "expo-router";
import { useAuth } from "@/context/AuthContext";

export default function AdminLayout() {
  const { isStaff, loading } = useAuth();

  if (loading) return null;
  if (!isStaff) return <Redirect href="/(tabs)" />;

  return (
    <Stack screenOptions={{ headerShown: true }}>
      <Stack.Screen name="index" options={{ title: "Administração" }} />
      <Stack.Screen name="members" options={{ title: "Membros" }} />
      <Stack.Screen name="finance" options={{ title: "Financeiro" }} />
      <Stack.Screen name="content" options={{ title: "Conteúdo" }} />
      <Stack.Screen name="notifications" options={{ title: "Notificações" }} />
      <Stack.Screen name="liturgy-editor" options={{ title: "Editar Liturgia" }} />
    </Stack>
  );
}
