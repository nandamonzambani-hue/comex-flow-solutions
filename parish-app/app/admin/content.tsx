import { useState } from "react";
import { Alert, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import { useTranslation } from "react-i18next";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/context/AuthContext";
import { useParishId } from "@/hooks/useParish";
import { SUPPORTED_LOCALES } from "@/i18n";
import { Button, Card } from "@/components/ui";
import { colors } from "@/theme/colors";
import type { Translations } from "@/types/database";

type Kind = "news" | "article" | "video";

const TRANSLATABLE_LOCALES = SUPPORTED_LOCALES.filter((l) => l.code !== "pt-BR");

function slugify(title: string) {
  return title
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

export default function AdminContentScreen() {
  const { t } = useTranslation();
  const parishId = useParishId();
  const { profile } = useAuth();
  const [kind, setKind] = useState<Kind>("news");
  const [title, setTitle] = useState("");
  const [subtitle, setSubtitle] = useState("");
  const [body, setBody] = useState("");
  const [videoUrl, setVideoUrl] = useState("");
  const [showTranslations, setShowTranslations] = useState(false);
  const [activeLocale, setActiveLocale] = useState(TRANSLATABLE_LOCALES[0].code);
  const [translations, setTranslations] = useState<Translations>({});
  const [saving, setSaving] = useState(false);

  function setTranslationField(locale: string, field: string, value: string) {
    setTranslations((prev) => ({ ...prev, [locale]: { ...prev[locale], [field]: value } }));
  }

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
        translations,
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
        translations,
        author_id: profile?.id,
        published_at: new Date().toISOString(),
      });
    }

    setSaving(false);
    setTitle("");
    setSubtitle("");
    setBody("");
    setVideoUrl("");
    setTranslations({});
    Alert.alert(t("admin.content.publishedTitle"), t("admin.content.publishedBody"));
  }

  const titleField = "title";
  const subtitleField = kind === "news" ? "subtitle" : "description";
  const bodyField = "body";

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.label}>{t("admin.content.type")}</Text>
      <View style={styles.kindRow}>
        {(["news", "article", "video"] as Kind[]).map((k) => (
          <Text
            key={k}
            style={[styles.kindOption, kind === k && styles.kindOptionActive]}
            onPress={() => setKind(k)}
          >
            {t(`admin.content.kinds.${k}`)}
          </Text>
        ))}
      </View>

      <Card>
        <TextInput style={styles.input} placeholder={t("admin.content.titlePlaceholder")} value={title} onChangeText={setTitle} />
        <TextInput
          style={styles.input}
          placeholder={kind === "news" ? t("admin.content.subtitlePlaceholder") : t("admin.content.shortDescriptionPlaceholder")}
          value={subtitle}
          onChangeText={setSubtitle}
        />
        {kind === "video" ? (
          <TextInput
            style={styles.input}
            placeholder={t("admin.content.videoUrlPlaceholder")}
            value={videoUrl}
            onChangeText={setVideoUrl}
            autoCapitalize="none"
          />
        ) : (
          <TextInput
            style={[styles.input, styles.textarea]}
            placeholder={t("admin.content.bodyPlaceholder")}
            value={body}
            onChangeText={setBody}
            multiline
          />
        )}
      </Card>

      <Text style={styles.translationsToggle} onPress={() => setShowTranslations((v) => !v)}>
        {showTranslations ? "▾ " : "▸ "}
        {t("admin.content.translationsOptional")}
      </Text>

      {showTranslations && (
        <Card>
          <View style={styles.kindRow}>
            {TRANSLATABLE_LOCALES.map((l) => (
              <Text
                key={l.code}
                style={[styles.kindOption, activeLocale === l.code && styles.kindOptionActive]}
                onPress={() => setActiveLocale(l.code)}
              >
                {l.flag} {l.label}
              </Text>
            ))}
          </View>
          <TextInput
            style={styles.input}
            placeholder={t("admin.content.translatedTitlePlaceholder")}
            value={translations[activeLocale]?.[titleField] ?? ""}
            onChangeText={(v) => setTranslationField(activeLocale, titleField, v)}
          />
          <TextInput
            style={styles.input}
            placeholder={t("admin.content.translatedSubtitlePlaceholder")}
            value={translations[activeLocale]?.[subtitleField] ?? ""}
            onChangeText={(v) => setTranslationField(activeLocale, subtitleField, v)}
          />
          {kind !== "video" && (
            <TextInput
              style={[styles.input, styles.textarea]}
              placeholder={t("admin.content.translatedBodyPlaceholder")}
              value={translations[activeLocale]?.[bodyField] ?? ""}
              onChangeText={(v) => setTranslationField(activeLocale, bodyField, v)}
              multiline
            />
          )}
        </Card>
      )}

      <Button title={t("admin.content.publish")} onPress={handlePublish} loading={saving} disabled={!title.trim()} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 20, backgroundColor: colors.background, flexGrow: 1, gap: 12 },
  label: { fontSize: 12, color: colors.textSecondary, fontWeight: "600", textTransform: "uppercase" },
  kindRow: { flexDirection: "row", flexWrap: "wrap", gap: 10, marginTop: 8, marginBottom: 4 },
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
  translationsToggle: { color: colors.primary, fontWeight: "700", marginTop: 4 },
});
