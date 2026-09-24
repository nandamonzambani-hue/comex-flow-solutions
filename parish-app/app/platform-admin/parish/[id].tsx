import { useCallback, useEffect, useState } from "react";
import { Alert, ScrollView, StyleSheet, Text, View } from "react-native";
import { useLocalSearchParams } from "expo-router";
import { useTranslation } from "react-i18next";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/context/AuthContext";
import { Badge, Button, Card, SectionTitle } from "@/components/ui";
import { colors } from "@/theme/colors";
import type { Parish, ParishStatus, SubscriptionPlan } from "@/types/database";

export default function PlatformAdminParishDetailScreen() {
  const { t } = useTranslation();
  const { profile } = useAuth();
  const { id } = useLocalSearchParams<{ id: string }>();
  const [parish, setParish] = useState<Parish | null>(null);
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [creatorEmail, setCreatorEmail] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const load = useCallback(async () => {
    const { data: parishData } = await supabase.from("parishes").select("*").eq("id", id).single();
    setParish(parishData as Parish);

    if (parishData?.created_by) {
      const { data: creator } = await supabase.from("profiles").select("email").eq("id", parishData.created_by).maybeSingle();
      setCreatorEmail(creator?.email ?? null);
    }

    const { data: planData } = await supabase.from("subscription_plans").select("*").eq("is_active", true);
    setPlans((planData as SubscriptionPlan[]) ?? []);
  }, [id]);

  useEffect(() => {
    load();
  }, [load]);

  async function updateStatus(status: ParishStatus, extra: Record<string, unknown> = {}) {
    if (!parish || !profile) return;
    setBusy(true);
    const { error } = await supabase
      .from("parishes")
      .update({ status, approved_by: profile.id, approved_at: new Date().toISOString(), ...extra })
      .eq("id", parish.id);
    setBusy(false);
    if (error) {
      Alert.alert(t("common.error"), error.message);
      return;
    }
    await load();
  }

  async function approve(plan: SubscriptionPlan) {
    const trialEndsAt = new Date(Date.now() + plan.trial_days * 86400000).toISOString();
    await updateStatus("trial", { plan_id: plan.id, subscription_status: "trialing", trial_ends_at: trialEndsAt });
  }

  if (!parish) return null;

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>{parish.name}</Text>
      <Badge label={t(`parishStatusLabel.${parish.status}`)} tone={parish.status === "active" ? "success" : "warning"} />

      <Card style={{ marginTop: 16 }}>
        <Text style={styles.label}>{t("platformAdmin.parishDetail.location")}</Text>
        <Text style={styles.value}>
          {parish.city ?? "—"} {parish.state ?? ""}
        </Text>
        <Text style={styles.label}>{t("platformAdmin.parishDetail.contact")}</Text>
        <Text style={styles.value}>{parish.contact_name ?? "—"}</Text>
        <Text style={styles.value}>{parish.contact_phone ?? parish.email ?? "—"}</Text>
        {creatorEmail && (
          <>
            <Text style={styles.label}>{t("platformAdmin.parishDetail.createdBy")}</Text>
            <Text style={styles.value}>{creatorEmail}</Text>
          </>
        )}
        <Text style={styles.label}>{t("platformAdmin.parishDetail.joinCode")}</Text>
        <Text style={styles.value}>{parish.join_code}</Text>
      </Card>

      {parish.status === "pending_approval" && (
        <>
          <SectionTitle>{t("platformAdmin.parishDetail.approveWithPlan")}</SectionTitle>
          {plans.map((plan) => (
            <Card key={plan.id}>
              <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
                <View>
                  <Text style={styles.planName}>{plan.name}</Text>
                  <Text style={styles.planPrice}>
                    R$ {plan.price_amount.toFixed(2)}/{t(`billingInterval.${plan.billing_interval}`)} ·{" "}
                    {t("platformAdmin.parishDetail.trialDays", { count: plan.trial_days })}
                  </Text>
                </View>
                <Button title={t("platformAdmin.parishDetail.approve")} onPress={() => approve(plan)} loading={busy} />
              </View>
            </Card>
          ))}
        </>
      )}

      {parish.status !== "pending_approval" && (
        <View style={{ gap: 10, marginTop: 16 }}>
          {parish.status !== "suspended" && (
            <Button title={t("platformAdmin.parishDetail.suspend")} variant="outline" onPress={() => updateStatus("suspended")} loading={busy} />
          )}
          {parish.status === "suspended" && (
            <Button title={t("platformAdmin.parishDetail.reactivate")} onPress={() => updateStatus("active")} loading={busy} />
          )}
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 20, backgroundColor: colors.background, flexGrow: 1 },
  title: { fontSize: 22, fontWeight: "700", color: colors.textPrimary, marginBottom: 8 },
  label: { fontSize: 11, color: colors.textSecondary, textTransform: "uppercase", fontWeight: "700", marginTop: 10 },
  value: { fontSize: 15, color: colors.textPrimary, marginTop: 2 },
  planName: { fontWeight: "700", color: colors.textPrimary },
  planPrice: { color: colors.textSecondary, marginTop: 2, fontSize: 13 },
});
