import { Stack } from "expo-router";
import { useTranslation } from "react-i18next";

export default function GivingLayout() {
  const { t } = useTranslation();
  return (
    <Stack screenOptions={{ headerShown: true }}>
      <Stack.Screen name="index" options={{ title: t("giving.title") }} />
      <Stack.Screen name="donate" options={{ title: t("giving.donateTitle") }} />
      <Stack.Screen name="campaign/[id]" options={{ title: t("giving.campaignTitle") }} />
      <Stack.Screen name="history" options={{ title: t("giving.historyTitle") }} />
    </Stack>
  );
}
