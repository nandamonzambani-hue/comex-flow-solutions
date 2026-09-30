import { useCallback, useEffect, useMemo, useState } from "react";
import { Alert, ScrollView, StyleSheet, Text, View } from "react-native";
import * as WebBrowser from "expo-web-browser";
import { useTranslation } from "react-i18next";
import { format } from "date-fns";
import { supabase } from "@/lib/supabase";
import { useParishId } from "@/hooks/useParish";
import { useAuth } from "@/context/AuthContext";
import { useDateLocale } from "@/lib/dateLocale";
import { Badge, Button, Card, SectionTitle } from "@/components/ui";
import { colors } from "@/theme/colors";
import type { Donation } from "@/types/database";

interface ParishPaymentStatus {
  parish_id: string;
  provider: string;
  connected_at: string;
  updated_at: string;
  is_active: boolean;
}

// O app abre a autorização OAuth do Mercado Pago com openAuthSessionAsync
// (não openBrowserAsync, usado no fluxo de assinatura): esta função detecta
// sozinha quando o navegador é redirecionado de volta para
// parishapp://admin/finance (feito por mercadopago-oauth-callback) e fecha
// o navegador automaticamente, sem precisar de deep link handler manual.
const MP_APP_REDIRECT = "parishapp://admin/finance";

export default function AdminFinanceScreen() {
  const { t } = useTranslation();
  const dateLocale = useDateLocale();
  const parishId = useParishId();
  const { profile } = useAuth();
  const [donations, setDonations] = useState<Donation[]>([]);
  const [paymentStatus, setPaymentStatus] = useState<ParishPaymentStatus | null>(null);
  const [connecting, setConnecting] = useState(false);

  const canConnect = profile?.role === "admin" || profile?.role === "pastor";

  const loadPaymentStatus = useCallback(() => {
    if (!parishId) return;
    supabase
      .from("parish_payment_status")
      .select("*")
      .maybeSingle()
      .then(({ data }) => setPaymentStatus(data as ParishPaymentStatus | null));
  }, [parishId]);

  useEffect(() => {
    loadPaymentStatus();
  }, [loadPaymentStatus]);

  async function connectMercadoPago() {
    setConnecting(true);
    const { data, error } = await supabase.functions.invoke("mercadopago-oauth-start");
    if (error || !data?.authorize_url) {
      setConnecting(false);
      Alert.alert(t("common.error"), error?.message ?? t("admin.finance.mercadoPago.startError"));
      return;
    }
    const result = await WebBrowser.openAuthSessionAsync(data.authorize_url, MP_APP_REDIRECT);
    setConnecting(false);
    if (result.type === "success") {
      const ok = new URL(result.url).searchParams.get("mp_connected") === "1";
      if (!ok) {
        Alert.alert(t("common.error"), t("admin.finance.mercadoPago.connectError"));
      }
      loadPaymentStatus();
    }
  }

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
      <SectionTitle>{t("admin.finance.mercadoPago.title")}</SectionTitle>
      <Card>
        <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
          <Text style={styles.statusLabel}>{t("admin.finance.mercadoPago.status")}</Text>
          <Badge
            label={t(paymentStatus?.is_active ? "admin.finance.mercadoPago.connected" : "admin.finance.mercadoPago.notConnected")}
            tone={paymentStatus?.is_active ? "success" : "warning"}
          />
        </View>
        {paymentStatus?.is_active && (
          <Text style={styles.trialText}>
            {t("admin.finance.mercadoPago.connectedSince", {
              date: format(new Date(paymentStatus.connected_at), "dd/MM/yyyy", { locale: dateLocale }),
            })}
          </Text>
        )}
        {!paymentStatus?.is_active && (
          <Text style={styles.trialText}>{t("admin.finance.mercadoPago.explanation")}</Text>
        )}
        {canConnect ? (
          <Button
            title={t(paymentStatus?.is_active ? "admin.finance.mercadoPago.reconnect" : "admin.finance.mercadoPago.connect")}
            onPress={connectMercadoPago}
            loading={connecting}
          />
        ) : (
          !paymentStatus?.is_active && <Text style={styles.trialText}>{t("admin.finance.mercadoPago.onlyAdmin")}</Text>
        )}
      </Card>

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
  statusLabel: { fontWeight: "700", color: colors.textPrimary },
  trialText: { color: colors.textSecondary, marginTop: 8, marginBottom: 8, fontSize: 13 },
  periodLabel: { color: colors.textSecondary, marginBottom: 12, fontWeight: "600" },
  metricLabel: { color: colors.textSecondary, fontSize: 12, textTransform: "uppercase", fontWeight: "600" },
  metricValue: { fontSize: 22, fontWeight: "700", color: colors.success, marginTop: 6 },
  metricValuePending: { fontSize: 22, fontWeight: "700", color: colors.warning, marginTop: 6 },
  methodName: { fontWeight: "700", color: colors.textPrimary },
  methodValue: { color: colors.textPrimary, fontWeight: "600" },
  statusText: { color: colors.textSecondary, textTransform: "capitalize" },
});
