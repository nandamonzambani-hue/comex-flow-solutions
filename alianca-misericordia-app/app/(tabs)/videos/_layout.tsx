import { Stack } from "expo-router";
import { useTranslation } from "react-i18next";

export default function VideosLayout() {
  const { t } = useTranslation();
  return (
    <Stack screenOptions={{ headerShown: true }}>
      <Stack.Screen name="index" options={{ title: t("tabs.videos") }} />
      <Stack.Screen name="[id]" options={{ title: t("videos.detailTitle") }} />
      <Stack.Screen name="[id]/quiz" options={{ title: t("quiz.title") }} />
    </Stack>
  );
}
