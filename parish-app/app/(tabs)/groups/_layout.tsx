import { Stack } from "expo-router";

export default function GroupsLayout() {
  return (
    <Stack screenOptions={{ headerShown: true }}>
      <Stack.Screen name="index" options={{ title: "Pastorais e Grupos" }} />
      <Stack.Screen name="[id]" options={{ title: "Grupo" }} />
    </Stack>
  );
}
