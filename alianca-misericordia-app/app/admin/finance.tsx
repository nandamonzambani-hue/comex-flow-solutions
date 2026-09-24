import { useEffect, useMemo, useState } from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { useTranslation } from "react-i18next";
import { supabase } from "@/lib/supabase";
import { useParishId } from "@/hooks/useParish";
import { Card, SectionTitle } from "@/components/ui";
import { colors } from "@/theme/colors";
import type { Donation } from "@/types/database";

export default function AdminFinanceScreen() {
  const { t } = useTranslation();
  const parishId = useParishId();
  const [donations, setDonations] = useState<Donation[]>([]);

  useEffect(() => {
    if (!parishId) return;
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    supabase
      .from("donations")
      .select("*")
      .eq("parish_id", parishId)
      .gte("created_at", startOfMonth.toISOString())
      .order("created_at", { ascending: false })
      .then(({ data }) => setDonations((data as Donation[]) ?? []));
  }, [parishId]);

  const { totalCompleted, totalPending, byMethod } = useMemo(() => {
    let totalCompleted = 0;
    let totalPending = 0;
    const byMethod: Record<string, number> = {};

    for (const d of donations) {
      if (d.payment_status === "completed") {
        totalCompleted += d.amount;
        byMethod[d.payment_method] = (byMethod[d.payment_method] ?? 0) + d.amount;
      } else if (d.payment_status === "pending" || d.payment_status === "processing") {
        totalPending += d.amount;
      }
    }
    return { totalCompleted, totalPending, byMethod };
  }, [donations]);

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.periodLabel}>{t("admin.finance.currentMonth")}</Text>

      <View style={{ flexDirection: "row", gap: 12 }}>
        <Card style={{ flex: 1 }}>
          <Text style={styles.metricLabel}>{t("admin.finance.confirmed")}</Text>
          <Text style={styles.metricValue}>R$ {totalCompleted.toFixed(2)}</Text>
        </Card>
        <Card style={{ flex: 1 }}>
          <Text style={styles.metricLabel}>{t("admin.finance.pending")}</Text>
          <Text style={styles.metricValuePending}>R$ {totalPending.toFixed(2)}</Text>
        </Card>
      </View>

      <SectionTitle>{t("admin.finance.byMethod")}</SectionTitle>
      {Object.entries(byMethod).map(([method, total]) => (
        <Card key={method}>
          <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
            <Text style={styles.methodName}>{method.toUpperCase()}</Text>
            <Text style={styles.methodValue}>R$ {total.toFixed(2)}</Text>
          </View>
        </Card>
      ))}

      <SectionTitle>{t("admin.finance.recentTransactions")}</SectionTitle>
      {donations.slice(0, 20).map((d) => (
        <Card key={d.id}>
          <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
            <Text style={styles.methodName}>R$ {d.amount.toFixed(2)}</Text>
            <Text style={styles.statusText}>{t(`giving.status.${d.payment_status}`)}</Text>
          </View>
        </Card>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 20, backgroundColor: colors.background, flexGrow: 1 },
  periodLabel: { color: colors.textSecondary, marginBottom: 12, fontWeight: "600" },
  metricLabel: { color: colors.textSecondary, fontSize: 12, textTransform: "uppercase", fontWeight: "600" },
  metricValue: { fontSize: 22, fontWeight: "700", color: colors.success, marginTop: 6 },
  metricValuePending: { fontSize: 22, fontWeight: "700", color: colors.warning, marginTop: 6 },
  methodName: { fontWeight: "700", color: colors.textPrimary },
  methodValue: { color: colors.textPrimary, fontWeight: "600" },
  statusText: { color: colors.textSecondary, textTransform: "capitalize" },
});
