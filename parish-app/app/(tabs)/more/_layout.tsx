import { Stack } from "expo-router";

export default function MoreLayout() {
  return (
    <Stack screenOptions={{ headerShown: true }}>
      <Stack.Screen name="index" options={{ title: "Mais" }} />
      <Stack.Screen name="media/index" options={{ title: "Vídeos e Textos" }} />
      <Stack.Screen name="media/[id]" options={{ title: "Conteúdo" }} />
      <Stack.Screen name="downloads" options={{ title: "Downloads" }} />
      <Stack.Screen name="news/index" options={{ title: "Notícias" }} />
      <Stack.Screen name="news/[id]" options={{ title: "Notícia" }} />
      <Stack.Screen name="bible/index" options={{ title: "Bíblia" }} />
      <Stack.Screen name="bible/[bookId]/index" options={{ title: "Capítulos" }} />
      <Stack.Screen name="bible/[bookId]/[chapter]" options={{ title: "Leitura" }} />
      <Stack.Screen name="liturgy" options={{ title: "Liturgia Diária" }} />
      <Stack.Screen name="profile" options={{ title: "Meu Perfil" }} />
    </Stack>
  );
}
