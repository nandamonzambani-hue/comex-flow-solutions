import { Stack } from "expo-router";
import { useTranslation } from "react-i18next";

export default function AuthLayout() {
  const { t } = useTranslation();
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="login" />
      <Stack.Screen name="register" />
      <Stack.Screen name="onboarding" />
      <Stack.Screen name="search-parish" options={{ headerShown: true, title: t("onboarding.findParish") }} />
      <Stack.Screen name="create-parish" options={{ headerShown: true, title: t("onboarding.registerParish") }} />
    </Stack>
  );
}
