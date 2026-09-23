import { useEffect, useState } from "react";
import { ScrollView, StyleSheet, Text } from "react-native";
import { Image } from "expo-image";
import { useLocalSearchParams } from "expo-router";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { supabase } from "@/lib/supabase";
import { colors } from "@/theme/colors";
import type { NewsPost } from "@/types/database";

export default function NewsDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [post, setPost] = useState<NewsPost | null>(null);

  useEffect(() => {
    supabase
      .from("news_posts")
      .select("*")
      .eq("id", id)
      .single()
      .then(({ data }) => setPost(data as NewsPost));
  }, [id]);

  if (!post) return null;

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {post.cover_image_url && (
        <Image source={{ uri: post.cover_image_url }} style={styles.cover} contentFit="cover" />
      )}
      {post.published_at && (
        <Text style={styles.date}>{format(new Date(post.published_at), "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}</Text>
      )}
      <Text style={styles.title}>{post.title}</Text>
      {post.subtitle && <Text style={styles.subtitle}>{post.subtitle}</Text>}
      <Text style={styles.body}>{post.body}</Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 20, backgroundColor: colors.background, flexGrow: 1 },
  cover: { width: "100%", height: 200, borderRadius: 12, marginBottom: 16 },
  date: { color: colors.secondary, fontWeight: "600", fontSize: 12, textTransform: "uppercase" },
  title: { fontSize: 24, fontWeight: "700", color: colors.textPrimary, marginTop: 8 },
  subtitle: { color: colors.textSecondary, marginTop: 8, fontSize: 16 },
  body: { color: colors.textPrimary, marginTop: 16, lineHeight: 23, fontSize: 15 },
});
