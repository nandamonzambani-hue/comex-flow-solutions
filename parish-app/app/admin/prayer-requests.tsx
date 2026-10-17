import { useCallback, useEffect, useMemo, useState } from "react";
import { FlatList, Linking, Pressable, StyleSheet, Text, View } from "react-native";
import { useTranslation } from "react-i18next";
import { format } from "date-fns";
import { supabase } from "@/lib/supabase";
import { useParishContext, useTheme } from "@/context/ParishContext";
import { useAdminParish } from "@/hooks/useParish";
import { useDateLocale } from "@/lib/dateLocale";
import { CARE_AREAS, whatsappLink } from "@/lib/care";
import { Badge, Card, EmptyState, ScreenContainer } from "@/components/ui";
import { colors } from "@/theme/colors";
import type { PrayerRequest, PrayerRequestStatus } from "@/types/database";

const STATUSES: PrayerRequestStatus[] = ["open", "praying", "answered", "archived"];

/** Cuidado → Pedidos de oração (Matriz vê também os das comunidades). */
export default function AdminPrayerRequestsScreen() {
  const { t } = useTranslation();
  const theme = useTheme();
  const dateLocale = useDateLocale();
  const { managedParishes } = useParishContext();
  const { parish: target } = useAdminParish();
  const [items, setItems] = useState<PrayerRequest[]>([]);
  const [status, setStatus] = useState<PrayerRequestStatus>("open");
  const [area, setArea] = useState<string | null>(null);

  const scopeIds = useMemo(
    () => (target?.kind === "matriz" ? managedParishes.map((p) => p.id) : target ? [target.id] : []),
    [target, managedParishes],
  );

  const load = useCallback(async () => {
    if (scopeIds.length === 0) return;
    let query = supabase
      .from("prayer_requests")
      .select("*")
      .in("parish_id", scopeIds)
      .eq("status", status)
      .order("created_at", { ascending: false })
      .limit(200);
    if (area) query = query.eq("area", area);
    const { data } = await query;
    setItems((data as PrayerRequest[]) ?? []);
  }, [scopeIds, status, area]);

  useEffect(() => {
    load();
  }, [load]);

  async function setItemStatus(item: PrayerRequest, next: PrayerRequestStatus) {
    await supabase.from("prayer_requests").update({ status: next }).eq("id", item.id);
    load();
  }

  const parishName = (id: string) => managedParishes.find((p) => p.id === id)?.name ?? "";

  return (
    <ScreenContainer>
      <View style={styles.filters}>
        {STATUSES.map((s) => (
          <Pressable key={s} onPress={() => setStatus(s)} style={[styles.chip, status === s && { backgroundColor: theme.primary, borderColor: theme.primary }]}>
            <Text style={[styles.chipText, status === s && { color: "#fff" }]}>{t(`prayer.status.${s}`)}</Text>
          </Pressable>
        ))}
      </View>
      <View style={styles.filters}>
        <Pressable onPress={() => setArea(null)} style={[styles.chipSmall, !area && { borderColor: theme.primary }]}>
          <Text style={styles.chipText}>{t("admin.prayerRequests.allAreas")}</Text>
        </Pressable>
        {CARE_AREAS.map((a) => (
          <Pressable key={a} onPress={() => setArea(a)} style={[styles.chipSmall, area === a && { borderColor: theme.primary }]}>
            <Text style={styles.chipText}>{t(`care.areas.${a}`)}</Text>
          </Pressable>
        ))}
      </View>

      <FlatList
        data={items}
        keyExtractor={(item) => item.id}
        ListEmptyComponent={<EmptyState message={t("admin.prayerRequests.empty")} />}
        renderItem={({ item }) => {
          const wa = item.allow_whatsapp_contact
            ? whatsappLink(item.requester_phone, t("admin.prayerRequests.whatsappMessage", { name: item.requester_name.split(" ")[0] }))
            : null;
          return (
            <Card>
              <View style={styles.rowBetween}>
                <Text style={styles.name}>{item.requester_name}</Text>
                <Text style={styles.date}>{format(new Date(item.created_at), "dd/MM/yy HH:mm", { locale: dateLocale })}</Text>
              </View>
              <View style={styles.badges}>
                <Badge label={t(`care.areas.${item.area}`, { defaultValue: item.area })} />
                {scopeIds.length > 1 && <Badge label={parishName(item.parish_id)} tone="warning" />}
                {!item.is_private && <Badge label={t("admin.prayerRequests.canShare")} tone="success" />}
              </View>
              <Text style={styles.body}>{item.body}</Text>
              <View style={styles.actions}>
                {wa && (
                  <Pressable onPress={() => Linking.openURL(wa)}>
                    <Text style={[styles.action, { color: colors.success }]}>WhatsApp</Text>
                  </Pressable>
                )}
                {STATUSES.filter((s) => s !== item.status).map((s) => (
                  <Pressable key={s} onPress={() => setItemStatus(item, s)}>
                    <Text style={[styles.action, { color: theme.primary }]}>→ {t(`prayer.status.${s}`)}</Text>
                  </Pressable>
                ))}
              </View>
            </Card>
          );
        }}
      />
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  filters: { flexDirection: "row", flexWrap: "wrap", gap: 6, marginBottom: 8 },
  chip: { borderWidth: 1, borderColor: colors.border, borderRadius: 16, paddingHorizontal: 12, paddingVertical: 6, backgroundColor: colors.surface },
  chipSmall: { borderWidth: 1, borderColor: colors.border, borderRadius: 14, paddingHorizontal: 8, paddingVertical: 4 },
  chipText: { fontSize: 12, color: colors.textPrimary },
  rowBetween: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  name: { fontWeight: "700", color: colors.textPrimary },
  date: { color: colors.textSecondary, fontSize: 12 },
  badges: { flexDirection: "row", gap: 6, flexWrap: "wrap", marginTop: 6 },
  body: { color: colors.textPrimary, marginTop: 8, lineHeight: 20 },
  actions: { flexDirection: "row", gap: 14, marginTop: 10, flexWrap: "wrap" },
  action: { fontWeight: "700", fontSize: 13 },
});
