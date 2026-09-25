import { Stack } from "expo-router";
import { useTranslation } from "react-i18next";

export default function MoreLayout() {
  const { t } = useTranslation();
  return (
    <Stack screenOptions={{ headerShown: true }}>
      <Stack.Screen name="index" options={{ title: t("tabs.more") }} />
      <Stack.Screen name="downloads" options={{ title: t("downloads.title") }} />
      <Stack.Screen name="news/index" options={{ title: t("news.title") }} />
      <Stack.Screen name="news/[id]" options={{ title: t("news.detailTitle") }} />
      <Stack.Screen name="bible/index" options={{ title: t("bible.title") }} />
      <Stack.Screen name="bible/[bookId]/index" options={{ title: t("bible.chapters") }} />
      <Stack.Screen name="bible/[bookId]/[chapter]" options={{ title: t("bible.reading") }} />
      <Stack.Screen name="liturgy" options={{ title: t("liturgy.title") }} />
      <Stack.Screen name="profile" options={{ title: t("profile.title") }} />
    </Stack>
  );
}
