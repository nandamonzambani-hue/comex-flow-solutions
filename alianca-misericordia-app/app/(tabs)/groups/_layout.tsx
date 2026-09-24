import { Stack } from "expo-router";
import { useTranslation } from "react-i18next";

export default function GroupsLayout() {
  const { t } = useTranslation();
  return (
    <Stack screenOptions={{ headerShown: true }}>
      <Stack.Screen name="index" options={{ title: t("groups.title") }} />
      <Stack.Screen name="[id]" options={{ title: t("groups.detailTitle") }} />
    </Stack>
  );
}
