import { useEffect, useState } from "react";
import { Alert, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import { useTranslation } from "react-i18next";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/context/AuthContext";
import { Button, Card } from "@/components/ui";
import { colors } from "@/theme/colors";
import { EVANGELIZATION_COLORS, type EvangelizationColor, type MembershipLevel, type VideoAccessType } from "@/types/database";

type Kind = "news" | "video";

function slugify(title: string) {
  return title
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

const ACCESS_TYPES: VideoAccessType[] = ["public", "color", "level", "paid"];

export default function AdminContentScreen() {
  const { t } = useTranslation();
  const { profile } = useAuth();
  const [kind, setKind] = useState<Kind>("video");
  const [title, setTitle] = useState("");
  const [subtitle, setSubtitle] = useState("");
  const [body, setBody] = useState("");
  const [videoUrl, setVideoUrl] = useState("");
  const [accessType, setAccessType] = useState<VideoAccessType>("public");
  const [requiredColor, setRequiredColor] = useState<EvangelizationColor | null>(null);
  const [requiredLevelId, setRequiredLevelId] = useState<string | null>(null);
  const [priceAmount, setPriceAmount] = useState("");
  const [levels, setLevels] = useState<MembershipLevel[]>([]);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    supabase
      .from("membership_levels")
      .select("*")
      .order("sort_order")
      .then(({ data }) => setLevels((data as MembershipLevel[]) ?? []));
  }, []);

  async function handlePublish() {
    if (!title.trim()) return;
    setSaving(true);
    const slug = `${slugify(title)}-${Date.now().toString(36)}`;

    if (kind === "news") {
      await supabase.from("news_posts").insert({
        title,
        slug,
        subtitle,
        body,
        author_id: profile?.id,
        published_at: new Date().toISOString(),
      });
    } else {
      await supabase.from("videos").insert({
        title,
        slug,
        description: subtitle,
        video_url: videoUrl,
        access_type: accessType,
        required_color: accessType === "color" ? requiredColor : null,
        required_level_id: accessType === "level" ? requiredLevelId : null,
        price_amount: accessType === "paid" ? Number(priceAmount.replace(",", ".")) || null : null,
        author_id: profile?.id,
        is_published: true,
        published_at: new Date().toISOString(),
      });
    }

    setSaving(false);
    setTitle("");
    setSubtitle("");
    setBody("");
    setVideoUrl("");
    setAccessType("public");
    setRequiredColor(null);
    setRequiredLevelId(null);
    setPriceAmount("");
    Alert.alert(t("admin.content.publishedTitle"), t("admin.content.publishedBody"));
  }

  const canPublish =
    title.trim().length > 0 &&
    (kind === "news" ? body.trim().length > 0 : videoUrl.trim().length > 0) &&
    (kind !== "video" ||
      accessType === "public" ||
      (accessType === "color" && requiredColor) ||
      (accessType === "level" && requiredLevelId) ||
      (accessType === "paid" && Number(priceAmount.replace(",", ".")) > 0));

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.label}>{t("admin.content.type")}</Text>
      <View style={styles.kindRow}>
        {(["video", "news"] as Kind[]).map((k) => (
          <Text key={k} style={[styles.kindOption, kind === k && styles.kindOptionActive]} onPress={() => setKind(k)}>
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

      {kind === "video" && (
        <Card>
          <Text style={styles.label}>{t("admin.content.accessType")}</Text>
          <View style={styles.kindRow}>
            {ACCESS_TYPES.map((a) => (
              <Text key={a} style={[styles.kindOption, accessType === a && styles.kindOptionActive]} onPress={() => setAccessType(a)}>
                {t(`admin.content.access.${a}`)}
              </Text>
            ))}
          </View>

          {accessType === "color" && (
            <View style={styles.kindRow}>
              {EVANGELIZATION_COLORS.map((c) => (
                <Text
                  key={c.value}
                  style={[styles.kindOption, requiredColor === c.value && styles.kindOptionActive]}
                  onPress={() => setRequiredColor(c.value)}
                >
                  {c.label}
                </Text>
              ))}
            </View>
          )}

          {accessType === "level" && (
            <View style={styles.kindRow}>
              {levels.map((l) => (
                <Text
                  key={l.id}
                  style={[styles.kindOption, requiredLevelId === l.id && styles.kindOptionActive]}
                  onPress={() => setRequiredLevelId(l.id)}
                >
                  {l.name}
                </Text>
              ))}
            </View>
          )}

          {accessType === "paid" && (
            <TextInput
              style={styles.input}
              placeholder={t("admin.content.pricePlaceholder")}
              value={priceAmount}
              onChangeText={setPriceAmount}
              keyboardType="decimal-pad"
            />
          )}
        </Card>
      )}

      <Button title={t("admin.content.publish")} onPress={handlePublish} loading={saving} disabled={!canPublish} />
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
});
