import { Stack } from "expo-router";

export default function GivingLayout() {
  return (
    <Stack screenOptions={{ headerShown: true }}>
      <Stack.Screen name="index" options={{ title: "Dízimo e Doações" }} />
      <Stack.Screen name="donate" options={{ title: "Contribuir" }} />
      <Stack.Screen name="campaign/[id]" options={{ title: "Campanha" }} />
      <Stack.Screen name="history" options={{ title: "Meu histórico" }} />
    </Stack>
  );
}
