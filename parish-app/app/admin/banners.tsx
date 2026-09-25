import { useCallback, useEffect, useState } from "react";
import { Alert, FlatList, Pressable, StyleSheet, Switch, Text, TextInput, View } from "react-native";
import { Image } from "expo-image";
import { useTranslation } from "react-i18next";
import { supabase } from "@/lib/supabase";
import { useParishId } from "@/hooks/useParish";
import { Button, Card, EmptyState, ScreenContainer } from "@/components/ui";
import { colors } from "@/theme/colors";
import type { Banner } from "@/types/database";

function emptyForm() {
  return {
    id: null as string | null,
    imageUrl: "",
    title: "",
    linkUrl: "",
    isActive: true,
  };
}

export default function AdminBannersScreen() {
  const { t } = useTranslation();
  const parishId = useParishId();
  const [banners, setBanners] = useState<Banner[]>([]);
  const [form, setForm] = useState(emptyForm());
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    if (!parishId) return;
    const { data } = await supabase
      .from("banners")
      .select("*")
      .eq("parish_id", parishId)
      .order("order_index");
    setBanners((data as Banner[]) ?? []);
  }, [parishId]);

  useEffect(() => {
    load();
  }, [load]);

  function editBanner(banner: Banner) {
    setForm({
      id: banner.id,
      imageUrl: banner.image_url,
      title: banner.title ?? "",
      linkUrl: banner.link_url ?? "",
      isActive: banner.is_active,
    });
  }

  async function handleDelete(banner: Banner) {
    Alert.alert(t("admin.banners.deleteTitle"), t("admin.banners.deleteConfirm"), [
      { text: t("common.cancel"), style: "cancel" },
      {
        text: t("common.delete"),
        style: "destructive",
        onPress: async () => {
          await supabase.from("banners").delete().eq("id", banner.id);
          if (form.id === banner.id) setForm(emptyForm());
          load();
        },
      },
    ]);
  }

  async function moveBanner(banner: Banner, direction: -1 | 1) {
    const index = banners.findIndex((b) => b.id === banner.id);
    const swapWith = banners[index + direction];
    if (!swapWith) return;
    await Promise.all([
      supabase.from("banners").update({ order_index: swapWith.order_index }).eq("id", banner.id),
      supabase.from("banners").update({ order_index: banner.order_index }).eq("id", swapWith.id),
    ]);
    load();
  }

  async function handleSave() {
    if (!parishId || !form.imageUrl.trim()) return;
    setSaving(true);
    const payload = {
      parish_id: parishId,
      image_url: form.imageUrl.trim(),
      title: form.title.trim() || null,
      link_url: form.linkUrl.trim() || null,
      is_active: form.isActive,
      order_index: form.id ? undefined : banners.length,
    };

    const { error } = form.id
      ? await supabase.from("banners").update(payload).eq("id", form.id)
      : await supabase.from("banners").insert(payload);

    setSaving(false);
    if (error) {
      Alert.alert(t("common.error"), error.message);
      return;
    }
    setForm(emptyForm());
    load();
  }

  return (
    <ScreenContainer>
      <FlatList
        data={banners}
        keyExtractor={(item) => item.id}
        ListEmptyComponent={<EmptyState message={t("admin.banners.empty")} />}
        ListHeaderComponent={
          <Card style={styles.formCard}>
            <Text style={styles.formTitle}>{t("admin.banners.hint")}</Text>

            {!!form.imageUrl && (
              <Image source={{ uri: form.imageUrl }} style={styles.preview} contentFit="cover" />
            )}

            <TextInput
              style={styles.input}
              placeholder={t("admin.banners.imageUrlPlaceholder")}
              value={form.imageUrl}
              onChangeText={(v) => setForm((f) => ({ ...f, imageUrl: v }))}
              autoCapitalize="none"
            />
            <TextInput
              style={styles.input}
              placeholder={t("admin.banners.titlePlaceholder")}
              value={form.title}
              onChangeText={(v) => setForm((f) => ({ ...f, title: v }))}
            />
            <TextInput
              style={styles.input}
              placeholder={t("admin.banners.linkUrlPlaceholder")}
              value={form.linkUrl}
              onChangeText={(v) => setForm((f) => ({ ...f, linkUrl: v }))}
              autoCapitalize="none"
            />

            <View style={styles.switchRow}>
              <Text style={styles.switchLabel}>{t("admin.banners.active")}</Text>
              <Switch value={form.isActive} onValueChange={(v) => setForm((f) => ({ ...f, isActive: v }))} />
            </View>

            <View style={styles.actionsRow}>
              <Button
                title={form.id ? t("admin.banners.save") : t("admin.banners.create")}
                onPress={handleSave}
                loading={saving}
                disabled={!form.imageUrl.trim()}
              />
              {form.id && (
                <Button title={t("common.cancel")} variant="outline" onPress={() => setForm(emptyForm())} />
              )}
            </View>

            <Text style={styles.listHeading}>{t("admin.banners.current")}</Text>
          </Card>
        }
        renderItem={({ item, index }) => (
          <Card style={styles.bannerCard}>
            <Image source={{ uri: item.image_url }} style={styles.thumb} contentFit="cover" />
            <Pressable style={{ flex: 1 }} onPress={() => editBanner(item)}>
              <Text style={styles.bannerTitle}>{item.title || t("admin.banners.untitled")}</Text>
              {!item.is_active && <Text style={styles.inactiveTag}>{t("admin.banners.inactive")}</Text>}
            </Pressable>
            <View style={styles.orderButtons}>
              <Pressable disabled={index === 0} onPress={() => moveBanner(item, -1)} hitSlop={8}>
                <Text style={[styles.orderButton, index === 0 && styles.orderButtonDisabled]}>▲</Text>
              </Pressable>
              <Pressable disabled={index === banners.length - 1} onPress={() => moveBanner(item, 1)} hitSlop={8}>
                <Text style={[styles.orderButton, index === banners.length - 1 && styles.orderButtonDisabled]}>▼</Text>
              </Pressable>
            </View>
            <Pressable onPress={() => handleDelete(item)} hitSlop={12}>
              <Text style={styles.deleteLink}>{t("common.delete")}</Text>
            </Pressable>
          </Card>
        )}
      />
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  formCard: { marginBottom: 16, gap: 4 },
  formTitle: { fontSize: 13, color: colors.textSecondary, marginBottom: 10, lineHeight: 18 },
  preview: { width: "100%", height: 120, borderRadius: 10, marginBottom: 10, backgroundColor: colors.border },
  input: {
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    paddingVertical: 10,
    fontSize: 15,
    marginBottom: 10,
    color: colors.textPrimary,
  },
  switchRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginTop: 4, marginBottom: 4 },
  switchLabel: { color: colors.textPrimary, fontWeight: "600" },
  actionsRow: { flexDirection: "row", gap: 10, marginTop: 12 },
  listHeading: { fontSize: 13, fontWeight: "700", color: colors.textSecondary, textTransform: "uppercase", marginTop: 20 },
  bannerCard: { flexDirection: "row", alignItems: "center", gap: 10 },
  thumb: { width: 56, height: 56, borderRadius: 8, backgroundColor: colors.border },
  bannerTitle: { fontWeight: "700", color: colors.textPrimary },
  inactiveTag: { color: colors.textSecondary, fontSize: 12, marginTop: 2 },
  orderButtons: { alignItems: "center", gap: 2 },
  orderButton: { fontSize: 14, color: colors.primary, fontWeight: "700" },
  orderButtonDisabled: { color: colors.border },
  deleteLink: { color: colors.danger, fontWeight: "600", fontSize: 13 },
});
