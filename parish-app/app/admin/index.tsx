import { useCallback, useEffect, useMemo, useState } from "react";
import { Pressable, RefreshControl, ScrollView, StyleSheet, Text, useWindowDimensions, View } from "react-native";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useTranslation } from "react-i18next";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/context/AuthContext";
import { useParishContext, useTheme } from "@/context/ParishContext";
import { useAdminParish } from "@/hooks/useParish";
import { ADMIN_NAV } from "@/lib/adminNav";
import { MOODS } from "@/components/MoodCheckin";
import { Card, SectionTitle } from "@/components/ui";
import { colors } from "@/theme/colors";
import type { Mood } from "@/types/database";

interface ParishStats {
  parishId: string;
  members: number;
  newMembers: number;
  openPrayers: number;
  donationsMonth: number;
}

interface DashboardData {
  perParish: ParishStats[];
  upcomingEvents: number;
  formResponses30d: number;
  pendingTestimonies: number;
  moods: Record<string, number>;
  ageBands: Record<string, number>;
}

const AGE_BANDS = ["0-17", "18-29", "30-44", "45-59", "60+"] as const;

function ageBand(birthDate: string | null): (typeof AGE_BANDS)[number] | null {
  if (!birthDate) return null;
  const age = (Date.now() - new Date(birthDate).getTime()) / (365.25 * 24 * 3600 * 1000);
  if (age < 18) return "0-17";
  if (age < 30) return "18-29";
  if (age < 45) return "30-44";
  if (age < 60) return "45-59";
  return "60+";
}

function formatBRL(value: number) {
  return value.toLocaleString("pt-BR", { style: "currency", currency: "BRL", maximumFractionDigits: 0 });
}

export default function AdminDashboardScreen() {
  const { t } = useTranslation();
  const theme = useTheme();
  const { width } = useWindowDimensions();
  const { profile } = useAuth();
  const { managedParishes } = useParishContext();
  const { parish: target } = useAdminParish();
  const [data, setData] = useState<DashboardData | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  // Na Matriz, o painel consolida Matriz + comunidades; numa comunidade, só ela.
  const scope = useMemo(
    () => (target?.kind === "matriz" ? managedParishes : target ? [target] : []),
    [target, managedParishes],
  );
  const scopeIds = useMemo(() => scope.map((p) => p.id), [scope]);

  const load = useCallback(async () => {
    if (scopeIds.length === 0) return;
    const now = new Date();
    const since30 = new Date(now.getTime() - 30 * 86400000).toISOString();
    const since7 = new Date(now.getTime() - 7 * 86400000).toISOString();
    const in7 = new Date(now.getTime() + 7 * 86400000).toISOString();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();

    const [members, prayers, donations, events, responses, testimonies, moods] = await Promise.all([
      supabase.from("profiles").select("parish_id, joined_at, birth_date").in("parish_id", scopeIds).limit(5000),
      supabase.from("prayer_requests").select("parish_id").in("parish_id", scopeIds).eq("status", "open"),
      supabase
        .from("donations")
        .select("parish_id, amount")
        .in("parish_id", scopeIds)
        .eq("payment_status", "completed")
        .gte("created_at", monthStart)
        .limit(5000),
      supabase
        .from("events")
        .select("id", { count: "exact", head: true })
        .in("parish_id", scopeIds)
        .gte("start_at", now.toISOString())
        .lte("start_at", in7),
      supabase
        .from("form_responses")
        .select("id", { count: "exact", head: true })
        .in("parish_id", scopeIds)
        .gte("submitted_at", since30),
      supabase.from("testimonies").select("id", { count: "exact", head: true }).in("parish_id", scopeIds).eq("status", "pending"),
      supabase.from("mood_checkins").select("mood").in("parish_id", scopeIds).gte("created_at", since7).limit(5000),
    ]);

    const perParish: ParishStats[] = scopeIds.map((id) => ({
      parishId: id,
      members: 0,
      newMembers: 0,
      openPrayers: 0,
      donationsMonth: 0,
    }));
    const byId = Object.fromEntries(perParish.map((p) => [p.parishId, p]));
    const ageBands: Record<string, number> = {};
    for (const m of (members.data as { parish_id: string; joined_at: string; birth_date: string | null }[]) ?? []) {
      const stats = byId[m.parish_id];
      if (!stats) continue;
      stats.members += 1;
      if (m.joined_at >= since30) stats.newMembers += 1;
      const band = ageBand(m.birth_date);
      if (band) ageBands[band] = (ageBands[band] ?? 0) + 1;
    }
    for (const p of (prayers.data as { parish_id: string }[]) ?? []) {
      if (byId[p.parish_id]) byId[p.parish_id].openPrayers += 1;
    }
    for (const d of (donations.data as { parish_id: string; amount: number }[]) ?? []) {
      if (byId[d.parish_id]) byId[d.parish_id].donationsMonth += Number(d.amount);
    }
    const moodCounts: Record<string, number> = {};
    for (const m of (moods.data as { mood: Mood }[]) ?? []) moodCounts[m.mood] = (moodCounts[m.mood] ?? 0) + 1;

    setData({
      perParish,
      upcomingEvents: events.count ?? 0,
      formResponses30d: responses.count ?? 0,
      pendingTestimonies: testimonies.count ?? 0,
      moods: moodCounts,
      ageBands,
    });
  }, [scopeIds]);

  useEffect(() => {
    load();
  }, [load]);

  const totals = useMemo(() => {
    const rows = data?.perParish ?? [];
    return {
      members: rows.reduce((s, r) => s + r.members, 0),
      newMembers: rows.reduce((s, r) => s + r.newMembers, 0),
      openPrayers: rows.reduce((s, r) => s + r.openPrayers, 0),
      donationsMonth: rows.reduce((s, r) => s + r.donationsMonth, 0),
    };
  }, [data]);

  const kpis = [
    { icon: "people", label: t("admin.dashboard.members"), value: String(totals.members), href: "/admin/members" },
    { icon: "person-add", label: t("admin.dashboard.newMembers"), value: String(totals.newMembers), href: "/admin/members" },
    { icon: "hand-left", label: t("admin.dashboard.openPrayers"), value: String(totals.openPrayers), href: "/admin/prayer-requests" },
    { icon: "cash", label: t("admin.dashboard.donationsMonth"), value: formatBRL(totals.donationsMonth), href: "/admin/finance" },
    { icon: "calendar", label: t("admin.dashboard.upcomingEvents"), value: String(data?.upcomingEvents ?? 0), href: "/admin/events" },
    { icon: "document-text", label: t("admin.dashboard.formResponses"), value: String(data?.formResponses30d ?? 0), href: "/admin/forms" },
    { icon: "chatbubble-ellipses", label: t("admin.dashboard.pendingTestimonies"), value: String(data?.pendingTestimonies ?? 0), href: "/admin/testimonies" },
  ];

  const kpiWidth = width >= 1200 ? "23.5%" : width >= 600 ? "31.5%" : "48%";
  const isAdmin = profile?.role === "admin" || profile?.role === "pastor";
  const totalMoods = Object.values(data?.moods ?? {}).reduce((a, b) => a + b, 0);
  const totalAges = Object.values(data?.ageBands ?? {}).reduce((a, b) => a + b, 0);

  return (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={styles.container}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={async () => {
            setRefreshing(true);
            await load();
            setRefreshing(false);
          }}
        />
      }
    >
      <Text style={styles.hello}>{t("admin.dashboard.hello", { name: profile?.full_name?.split(" ")[0] ?? "" })}</Text>
      <Text style={styles.subtitle}>
        {target?.kind === "matriz" && scope.length > 1
          ? t("admin.dashboard.scopeMatriz", { count: scope.length - 1 })
          : t("admin.dashboard.scopeSingle", { name: target?.name ?? "" })}
      </Text>

      <View style={styles.kpiGrid}>
        {kpis.map((kpi) => (
          <Pressable key={kpi.label} style={[styles.kpi, { width: kpiWidth }]} onPress={() => router.navigate(kpi.href as never)}>
            <Ionicons name={kpi.icon as never} size={20} color={theme.primary} />
            <Text style={styles.kpiValue}>{kpi.value}</Text>
            <Text style={styles.kpiLabel}>{kpi.label}</Text>
          </Pressable>
        ))}
      </View>

      {scope.length > 1 && data && (
        <>
          <SectionTitle>{t("admin.dashboard.byCommunity")}</SectionTitle>
          <Card style={{ padding: 0 }}>
            <View style={[styles.tableRow, styles.tableHead]}>
              <Text style={[styles.cellName, styles.headText]}>{t("admin.dashboard.colParish")}</Text>
              <Text style={[styles.cell, styles.headText]}>{t("admin.dashboard.colMembers")}</Text>
              <Text style={[styles.cell, styles.headText]}>{t("admin.dashboard.colNew")}</Text>
              <Text style={[styles.cell, styles.headText]}>{t("admin.dashboard.colPrayers")}</Text>
              <Text style={[styles.cellMoney, styles.headText]}>{t("admin.dashboard.colDonations")}</Text>
            </View>
            {data.perParish.map((row) => {
              const p = scope.find((s) => s.id === row.parishId);
              return (
                <View key={row.parishId} style={styles.tableRow}>
                  <Text style={styles.cellName} numberOfLines={2}>
                    {p?.kind === "matriz" ? "⛪ " : "🏠 "}
                    {p?.name}
                  </Text>
                  <Text style={styles.cell}>{row.members}</Text>
                  <Text style={styles.cell}>{row.newMembers}</Text>
                  <Text style={styles.cell}>{row.openPrayers}</Text>
                  <Text style={styles.cellMoney}>{formatBRL(row.donationsMonth)}</Text>
                </View>
              );
            })}
          </Card>
        </>
      )}

      <View style={width >= 900 ? styles.twoCols : undefined}>
        <View style={width >= 900 ? { flex: 1 } : undefined}>
          <SectionTitle>{t("admin.dashboard.moodTitle")}</SectionTitle>
          <Card>
            {totalMoods === 0 && <Text style={styles.muted}>{t("admin.dashboard.noData")}</Text>}
            {MOODS.map(({ mood, emoji }) => {
              const count = data?.moods[mood] ?? 0;
              if (totalMoods === 0) return null;
              return (
                <View key={mood} style={styles.barRow}>
                  <Text style={styles.barLabel}>
                    {emoji} {t(`mood.options.${mood}`)}
                  </Text>
                  <View style={styles.barTrack}>
                    <View style={[styles.barFill, { width: `${(count / totalMoods) * 100}%`, backgroundColor: theme.primary }]} />
                  </View>
                  <Text style={styles.barValue}>{count}</Text>
                </View>
              );
            })}
          </Card>
        </View>
        <View style={width >= 900 ? { flex: 1 } : undefined}>
          <SectionTitle>{t("admin.dashboard.ageTitle")}</SectionTitle>
          <Card>
            {totalAges === 0 && <Text style={styles.muted}>{t("admin.dashboard.noData")}</Text>}
            {totalAges > 0 &&
              AGE_BANDS.map((band) => {
                const count = data?.ageBands[band] ?? 0;
                return (
                  <View key={band} style={styles.barRow}>
                    <Text style={styles.barLabel}>{t("admin.dashboard.ageBand", { band })}</Text>
                    <View style={styles.barTrack}>
                      <View style={[styles.barFill, { width: `${(count / totalAges) * 100}%`, backgroundColor: theme.secondary }]} />
                    </View>
                    <Text style={styles.barValue}>{count}</Text>
                  </View>
                );
              })}
          </Card>
        </View>
      </View>

      {/* No celular não há barra lateral: o menu agrupado fica aqui. */}
      {width < 900 &&
        ADMIN_NAV.map((section) => {
          const items = section.items.filter((i) => i.href !== "/admin" && (!i.adminOnly || isAdmin));
          if (items.length === 0) return null;
          return (
            <View key={section.key}>
              <Text style={styles.navSection}>{t(section.key)}</Text>
              <View style={styles.grid}>
                {items.map((item) => (
                  <Pressable key={item.href} style={styles.item} onPress={() => router.push(item.href as never)}>
                    <Ionicons name={item.icon as never} size={24} color={theme.primary} />
                    <Text style={styles.itemLabel}>{t(item.key)}</Text>
                  </Pressable>
                ))}
              </View>
            </View>
          );
        })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background },
  container: { padding: 16, paddingBottom: 40, maxWidth: 1200, width: "100%", alignSelf: "center" },
  hello: { fontSize: 22, fontWeight: "700", color: colors.textPrimary },
  subtitle: { color: colors.textSecondary, marginBottom: 14 },
  kpiGrid: { flexDirection: "row", flexWrap: "wrap", gap: 10, marginBottom: 8 },
  kpi: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 14,
    padding: 14,
    gap: 4,
  },
  kpiValue: { fontSize: 22, fontWeight: "800", color: colors.textPrimary },
  kpiLabel: { fontSize: 12, color: colors.textSecondary },
  tableRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    gap: 6,
  },
  tableHead: { backgroundColor: colors.background },
  headText: { fontWeight: "700", color: colors.textSecondary, fontSize: 11, textTransform: "uppercase" },
  cellName: { flex: 2.4, color: colors.textPrimary, fontSize: 13 },
  cell: { flex: 1, textAlign: "right", color: colors.textPrimary, fontSize: 13 },
  cellMoney: { flex: 1.6, textAlign: "right", color: colors.textPrimary, fontSize: 13 },
  twoCols: { flexDirection: "row", gap: 16 },
  barRow: { flexDirection: "row", alignItems: "center", gap: 8, marginVertical: 4 },
  barLabel: { width: 150, fontSize: 13, color: colors.textPrimary },
  barTrack: { flex: 1, height: 10, borderRadius: 5, backgroundColor: colors.border, overflow: "hidden" },
  barFill: { height: 10, borderRadius: 5 },
  barValue: { width: 32, textAlign: "right", fontSize: 12, color: colors.textSecondary },
  muted: { color: colors.textSecondary },
  navSection: {
    fontSize: 12,
    fontWeight: "700",
    color: colors.textSecondary,
    textTransform: "uppercase",
    marginTop: 18,
    marginBottom: 8,
  },
  grid: { flexDirection: "row", flexWrap: "wrap", gap: 10 },
  item: {
    width: "31%",
    backgroundColor: colors.surface,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.border,
    paddingVertical: 16,
    paddingHorizontal: 6,
    alignItems: "center",
    gap: 8,
  },
  itemLabel: { fontWeight: "600", color: colors.textPrimary, textAlign: "center", fontSize: 12 },
});
