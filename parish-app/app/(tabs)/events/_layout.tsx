import { Stack } from "expo-router";
import { useTranslation } from "react-i18next";

export default function EventsLayout() {
  const { t } = useTranslation();
  return (
    <Stack screenOptions={{ headerShown: true }}>
      <Stack.Screen name="index" options={{ title: t("events.title") }} />
      <Stack.Screen name="[id]" options={{ title: t("events.detailTitle") }} />
    </Stack>
  );
}
