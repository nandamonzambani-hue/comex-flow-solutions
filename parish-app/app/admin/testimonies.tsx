import { useCallback, useEffect, useMemo, useState } from "react";
import { FlatList, Pressable, StyleSheet, Text, View } from "react-native";
import { useTranslation } from "react-i18next";
import { format } from "date-fns";
import { supabase } from "@/lib/supabase";
import { useParishContext, useTheme } from "@/context/ParishContext";
import { useAdminParish } from "@/hooks/useParish";
import { useDateLocale } from "@/lib/dateLocale";
import { Badge, Card, EmptyState, ScreenContainer } from "@/components/ui";
import { colors } from "@/theme/colors";
import type { Testimony, TestimonyStatus } from "@/types/database";

const STATUSES: TestimonyStatus[] = ["pending", "approved", "rejected"];

/** Cuidado → Testemunhos: a equipe aprova o que vai aparecer no app. */
export default function AdminTestimoniesScreen() {
  const { t } = useTranslation();
  const theme = useTheme();
  const dateLocale = useDateLocale();
  const { managedParishes } = useParishContext();
  const { parish: target } = useAdminParish();
  const [items, setItems] = useState<Testimony[]>([]);
  const [status, setStatus] = useState<TestimonyStatus>("pending");

  const scopeIds = useMemo(
    () => (target?.kind === "matriz" ? managedParishes.map((p) => p.id) : target ? [target.id] : []),
    [target, managedParishes],
  );

  const load = useCallback(async () => {
    if (scopeIds.length === 0) return;
    const { data } = await supabase
      .from("testimonies")
      .select("*")
      .in("parish_id", scopeIds)
      .eq("status", status)
      .order("created_at", { ascending: false })
      .limit(200);
    setItems((data as Testimony[]) ?? []);
  }, [scopeIds, status]);

  useEffect(() => {
    load();
  }, [load]);

  async function decide(item: Testimony, next: TestimonyStatus) {
    await supabase.from("testimonies").update({ status: next }).eq("id", item.id);
    load();
  }

  return (
    <ScreenContainer>
      <View style={styles.filters}>
        {STATUSES.map((s) => (
          <Pressable key={s} onPress={() => setStatus(s)} style={[styles.chip, status === s && { backgroundColor: theme.primary, borderColor: theme.primary }]}>
            <Text style={[styles.chipText, status === s && { color: "#fff" }]}>{t(`admin.testimonies.status.${s}`)}</Text>
          </Pressable>
        ))}
      </View>
      <FlatList
        data={items}
        keyExtractor={(item) => item.id}
        ListEmptyComponent={<EmptyState message={t("admin.testimonies.empty")} />}
        renderItem={({ item }) => (
          <Card>
            <View style={styles.rowBetween}>
              <Text style={styles.name}>{item.author_name}</Text>
              <Text style={styles.date}>{format(new Date(item.created_at), "dd/MM/yy", { locale: dateLocale })}</Text>
            </View>
            <View style={styles.badges}>
              <Badge label={t(`care.areas.${item.category}`, { defaultValue: item.category })} />
              <Badge label={item.allow_publish ? t("admin.testimonies.canPublish") : t("admin.testimonies.private")} tone={item.allow_publish ? "success" : "warning"} />
              {item.allow_whatsapp_contact && <Badge label={t("admin.testimonies.contactAllowed")} />}
            </View>
            <Text style={styles.body}>{item.body}</Text>
            <View style={styles.actions}>
              {item.status !== "approved" && item.allow_publish && (
                <Pressable onPress={() => decide(item, "approved")}>
                  <Text style={[styles.action, { color: colors.success }]}>{t("admin.testimonies.approve")}</Text>
                </Pressable>
              )}
              {item.status !== "rejected" && (
                <Pressable onPress={() => decide(item, "rejected")}>
                  <Text style={[styles.action, { color: colors.danger }]}>{t("admin.testimonies.reject")}</Text>
                </Pressable>
              )}
            </View>
          </Card>
        )}
      />
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  filters: { flexDirection: "row", flexWrap: "wrap", gap: 6, marginBottom: 10 },
  chip: { borderWidth: 1, borderColor: colors.border, borderRadius: 16, paddingHorizontal: 12, paddingVertical: 6, backgroundColor: colors.surface },
  chipText: { fontSize: 12, color: colors.textPrimary },
  rowBetween: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  name: { fontWeight: "700", color: colors.textPrimary },
  date: { color: colors.textSecondary, fontSize: 12 },
  badges: { flexDirection: "row", gap: 6, flexWrap: "wrap", marginTop: 6 },
  body: { color: colors.textPrimary, marginTop: 8, lineHeight: 20 },
  actions: { flexDirection: "row", gap: 16, marginTop: 10, flexWrap: "wrap" },
  action: { fontWeight: "700", fontSize: 13 },
});
