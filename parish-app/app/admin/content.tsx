import { useState } from "react";
import { Alert, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/context/AuthContext";
import { useParishId } from "@/hooks/useParish";
import { Button, Card } from "@/components/ui";
import { colors } from "@/theme/colors";

type Kind = "news" | "article" | "video";

function slugify(title: string) {
  return title
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

export default function AdminContentScreen() {
  const parishId = useParishId();
  const { profile } = useAuth();
  const [kind, setKind] = useState<Kind>("news");
  const [title, setTitle] = useState("");
  const [subtitle, setSubtitle] = useState("");
  const [body, setBody] = useState("");
  const [videoUrl, setVideoUrl] = useState("");
  const [saving, setSaving] = useState(false);

  async function handlePublish() {
    if (!parishId || !title.trim()) return;
    setSaving(true);
    const slug = `${slugify(title)}-${Date.now().toString(36)}`;

    if (kind === "news") {
      await supabase.from("news_posts").insert({
        parish_id: parishId,
        title,
        slug,
        subtitle,
        body,
        author_id: profile?.id,
        published_at: new Date().toISOString(),
      });
    } else {
      await supabase.from("media_content").insert({
        parish_id: parishId,
        title,
        slug,
        description: subtitle,
        content_type: kind === "video" ? "video" : "article",
        body: kind === "article" ? body : null,
        video_url: kind === "video" ? videoUrl : null,
        author_id: profile?.id,
        published_at: new Date().toISOString(),
      });
    }

    setSaving(false);
    setTitle("");
    setSubtitle("");
    setBody("");
    setVideoUrl("");
    Alert.alert("Publicado", "Conteúdo publicado com sucesso.");
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.label}>Tipo de conteúdo</Text>
      <View style={styles.kindRow}>
        {(["news", "article", "video"] as Kind[]).map((k) => (
          <Text
            key={k}
            style={[styles.kindOption, kind === k && styles.kindOptionActive]}
            onPress={() => setKind(k)}
          >
            {k === "news" ? "Notícia" : k === "article" ? "Texto" : "Vídeo"}
          </Text>
        ))}
      </View>

      <Card>
        <TextInput style={styles.input} placeholder="Título" value={title} onChangeText={setTitle} />
        <TextInput
          style={styles.input}
          placeholder={kind === "news" ? "Subtítulo (opcional)" : "Descrição curta"}
          value={subtitle}
          onChangeText={setSubtitle}
        />
        {kind === "video" ? (
          <TextInput
            style={styles.input}
            placeholder="URL do vídeo (mp4, HLS, YouTube incorporável)"
            value={videoUrl}
            onChangeText={setVideoUrl}
            autoCapitalize="none"
          />
        ) : (
          <TextInput
            style={[styles.input, styles.textarea]}
            placeholder="Corpo do texto..."
            value={body}
            onChangeText={setBody}
            multiline
          />
        )}
      </Card>

      <Button title="Publicar" onPress={handlePublish} loading={saving} disabled={!title.trim()} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 20, backgroundColor: colors.background, flexGrow: 1, gap: 12 },
  label: { fontSize: 12, color: colors.textSecondary, fontWeight: "600", textTransform: "uppercase" },
  kindRow: { flexDirection: "row", gap: 10, marginTop: 8, marginBottom: 4 },
  kindOption: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 8,
    color: colors.textSecondary,
    fontWeight: "600",
  },
  kindOptionActive: { backgroundColor: colors.primary, color: "#fff", borderColor: colors.primary },
  input: {
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    paddingVertical: 10,
    fontSize: 15,
    marginBottom: 10,
    color: colors.textPrimary,
  },
  textarea: { minHeight: 120, textAlignVertical: "top" },
});
