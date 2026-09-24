import { Redirect, Stack } from "expo-router";
import { useTranslation } from "react-i18next";
import { useAuth } from "@/context/AuthContext";

export default function PlatformAdminLayout() {
  const { t } = useTranslation();
  const { isPlatformAdmin, loading } = useAuth();

  if (loading) return null;
  if (!isPlatformAdmin) return <Redirect href="/(tabs)" />;

  return (
    <Stack screenOptions={{ headerShown: true }}>
      <Stack.Screen name="index" options={{ title: t("platformAdmin.title") }} />
      <Stack.Screen name="parishes" options={{ title: t("platformAdmin.parishes.title") }} />
      <Stack.Screen name="parish/[id]" options={{ title: t("platformAdmin.parishDetail.title") }} />
      <Stack.Screen name="plans" options={{ title: t("platformAdmin.plans.title") }} />
    </Stack>
  );
}
