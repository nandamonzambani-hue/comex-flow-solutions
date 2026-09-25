import { Redirect, Stack } from "expo-router";
import { useTranslation } from "react-i18next";
import { useAuth } from "@/context/AuthContext";

export default function AdminLayout() {
  const { t } = useTranslation();
  const { isStaff, loading } = useAuth();

  if (loading) return null;
  if (!isStaff) return <Redirect href="/(tabs)" />;

  return (
    <Stack screenOptions={{ headerShown: true }}>
      <Stack.Screen name="index" options={{ title: t("admin.title") }} />
      <Stack.Screen name="members" options={{ title: t("admin.members.title") }} />
      <Stack.Screen name="finance" options={{ title: t("admin.finance.title") }} />
      <Stack.Screen name="content" options={{ title: t("admin.content.title") }} />
      <Stack.Screen name="events" options={{ title: t("admin.events.title") }} />
      <Stack.Screen name="banners" options={{ title: t("admin.banners.title") }} />
      <Stack.Screen name="quizzes" options={{ title: t("admin.quizzes.title") }} />
      <Stack.Screen name="notifications" options={{ title: t("admin.notifications.title") }} />
      <Stack.Screen name="liturgy-editor" options={{ title: t("admin.liturgyEditor.title") }} />
      <Stack.Screen name="subscription" options={{ title: t("admin.subscription.title") }} />
    </Stack>
  );
}
