import { Redirect, Stack } from "expo-router";
import { useWindowDimensions, View } from "react-native";
import { useTranslation } from "react-i18next";
import { useAuth } from "@/context/AuthContext";
import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { ParishScopePicker } from "@/components/admin/ParishScopePicker";

/** A partir desta largura (tablet deitado / navegador) o painel ganha barra lateral fixa. */
const WIDE_BREAKPOINT = 900;

export default function AdminLayout() {
  const { t } = useTranslation();
  const { isStaff, loading } = useAuth();
  const { width } = useWindowDimensions();
  const wide = width >= WIDE_BREAKPOINT;

  if (loading) return null;
  if (!isStaff) return <Redirect href="/(tabs)" />;

  const stack = (
    <Stack
      screenOptions={{
        headerShown: true,
        // No celular o seletor "Publicar em" fica no cabeçalho; no layout
        // largo ele já está na barra lateral.
        headerRight: wide ? undefined : () => <ParishScopePicker compact />,
      }}
    >
      <Stack.Screen name="index" options={{ title: t("admin.dashboard.title") }} />
      <Stack.Screen name="communities" options={{ title: t("admin.communities.title") }} />
      <Stack.Screen name="members" options={{ title: t("admin.members.title") }} />
      <Stack.Screen name="prayer-requests" options={{ title: t("admin.prayerRequests.title") }} />
      <Stack.Screen name="testimonies" options={{ title: t("admin.testimonies.title") }} />
      <Stack.Screen name="finance" options={{ title: t("admin.finance.title") }} />
      <Stack.Screen name="content" options={{ title: t("admin.content.title") }} />
      <Stack.Screen name="events" options={{ title: t("admin.events.title") }} />
      <Stack.Screen name="banners" options={{ title: t("admin.banners.title") }} />
      <Stack.Screen name="announcements" options={{ title: t("admin.announcements.title") }} />
      <Stack.Screen name="forms/index" options={{ title: t("admin.forms.title") }} />
      <Stack.Screen name="forms/[formId]/index" options={{ title: t("admin.forms.editTitle") }} />
      <Stack.Screen name="forms/[formId]/responses" options={{ title: t("admin.forms.responsesTitle") }} />
      <Stack.Screen name="quizzes" options={{ title: t("admin.quizzes.title") }} />
      <Stack.Screen name="notifications" options={{ title: t("admin.notifications.title") }} />
      <Stack.Screen name="liturgy-editor" options={{ title: t("admin.liturgyEditor.title") }} />
      <Stack.Screen name="subscription" options={{ title: t("admin.subscription.title") }} />
    </Stack>
  );

  if (!wide) return stack;

  return (
    <View style={{ flex: 1, flexDirection: "row" }}>
      <AdminSidebar />
      <View style={{ flex: 1 }}>{stack}</View>
    </View>
  );
}
