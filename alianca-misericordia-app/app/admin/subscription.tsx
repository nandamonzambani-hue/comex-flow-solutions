import { useEffect, useState } from "react";
import { Alert, ScrollView, StyleSheet, Text, View } from "react-native";
import * as WebBrowser from "expo-web-browser";
import { useTranslation } from "react-i18next";
import { format } from "date-fns";
import { supabase } from "@/lib/supabase";
import { useParishContext } from "@/context/ParishContext";
import { useDateLocale } from "@/lib/dateLocale";
import { Badge, Button, Card, SectionTitle } from "@/components/ui";
import { colors } from "@/theme/colors";
import type { SubscriptionPlan } from "@/types/database";

export default function AdminSubscriptionScreen() {
  const { t } = useTranslation();
  const dateLocale = useDateLocale();
  const { parish, refreshParish } = useParishContext();
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [currentPlan, setCurrentPlan] = useState<SubscriptionPlan | null>(null);
  const [subscribingId, setSubscribingId] = useState<string | null>(null);

  useEffect(() => {
    supabase
      .from("subscription_plans")
      .select("*")
      .eq("is_active", true)
      .order("sort_order")
      .then(({ data }) => setPlans((data as SubscriptionPlan[]) ?? []));
  }, []);

  useEffect(() => {
    if (!parish?.plan_id) {
      setCurrentPlan(null);
      return;
    }
    supabase
      .from("subscription_plans")
      .select("*")
      .eq("id", parish.plan_id)
      .maybeSingle()
      .then(({ data }) => setCurrentPlan(data as SubscriptionPlan | null));
  }, [parish?.plan_id]);

  async function subscribe(plan: SubscriptionPlan) {
    setSubscribingId(plan.id);
    const { data, error } = await supabase.functions.invoke("create-parish-subscription", {
      body: { plan_id: plan.id },
    });
    setSubscribingId(null);
    if (error) {
      Alert.alert(t("common.error"), error.message);
      return;
    }
    if (data?.checkout_url) {
      await WebBrowser.openBrowserAsync(data.checkout_url);
      await refreshParish();
    }
  }

  const isAuthorized = parish?.subscription_status === "authorized";

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Card>
        <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
          <Text style={styles.statusLabel}>{t("admin.subscription.status")}</Text>
          <Badge label={t(`parishStatusLabel.${parish?.status ?? "pending_approval"}`)} tone={isAuthorized ? "success" : "warning"} />
        </View>
        {currentPlan && (
          <Text style={styles.currentPlan}>
            {currentPlan.name} — R$ {currentPlan.price_amount.toFixed(2)}/{t(`billingInterval.${currentPlan.billing_interval}`)}
          </Text>
        )}
        {parish?.trial_ends_at && !isAuthorized && (
          <Text style={styles.trialText}>
            {t("admin.subscription.trialUntil", { date: format(new Date(parish.trial_ends_at), "dd/MM/yyyy", { locale: dateLocale }) })}
          </Text>
        )}
      </Card>

      {!isAuthorized && (
        <>
          <SectionTitle>{t("admin.subscription.choosePlan")}</SectionTitle>
          {plans.map((plan) => (
            <Card key={plan.id}>
              <Text style={styles.planName}>{plan.name}</Text>
              {plan.description && <Text style={styles.planDescription}>{plan.description}</Text>}
              <Text style={styles.planPrice}>
                R$ {plan.price_amount.toFixed(2)}/{t(`billingInterval.${plan.billing_interval}`)}
              </Text>
              <Button
                title={t("admin.subscription.subscribe")}
                onPress={() => subscribe(plan)}
                loading={subscribingId === plan.id}
              />
            </Card>
          ))}
        </>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 20, backgroundColor: colors.background, flexGrow: 1, gap: 8 },
  statusLabel: { fontWeight: "700", color: colors.textPrimary },
  currentPlan: { color: colors.textPrimary, marginTop: 10, fontWeight: "600" },
  trialText: { color: colors.warning, marginTop: 8, fontSize: 13 },
  planName: { fontSize: 16, fontWeight: "700", color: colors.textPrimary },
  planDescription: { color: colors.textSecondary, marginTop: 4, marginBottom: 8 },
  planPrice: { color: colors.primary, fontWeight: "700", marginBottom: 10 },
});
