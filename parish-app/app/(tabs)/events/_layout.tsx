import { Stack } from "expo-router";

export default function EventsLayout() {
  return (
    <Stack screenOptions={{ headerShown: true }}>
      <Stack.Screen name="index" options={{ title: "Eventos" }} />
      <Stack.Screen name="[id]" options={{ title: "Detalhes do evento" }} />
    </Stack>
  );
}
