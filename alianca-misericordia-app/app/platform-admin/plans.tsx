import { useEffect, useState } from "react";
import { Alert, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import { useTranslation } from "react-i18next";
import { supabase } from "@/lib/supabase";
import { Badge, Button, Card, SectionTitle } from "@/components/ui";
import { colors } from "@/theme/colors";
import type { SubscriptionPlan } from "@/types/database";

function slugify(name: string) {
  return name
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

export default function PlatformAdminPlansScreen() {
  const { t } = useTranslation();
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [maxMembers, setMaxMembers] = useState("");
  const [trialDays, setTrialDays] = useState("14");
  const [saving, setSaving] = useState(false);

  async function load() {
    const { data } = await supabase.from("subscription_plans").select("*").order("sort_order");
    setPlans((data as SubscriptionPlan[]) ?? []);
  }

  useEffect(() => {
    load();
  }, []);

  async function handleCreate() {
    const priceValue = Number(price.replace(",", "."));
    if (!name.trim() || !priceValue) return;
    setSaving(true);
    const { error } = await supabase.from("subscription_plans").insert({
      name: name.trim(),
      slug: `${slugify(name)}-${Date.now().toString(36)}`,
      price_amount: priceValue,
      max_members: maxMembers ? Number(maxMembers) : null,
      trial_days: Number(trialDays) || 14,
      sort_order: plans.length,
    });
    setSaving(false);
    if (error) {
      Alert.alert(t("common.error"), error.message);
      return;
    }
    setName("");
    setPrice("");
    setMaxMembers("");
    await load();
  }

  async function toggleActive(plan: SubscriptionPlan) {
    await supabase.from("subscription_plans").update({ is_active: !plan.is_active }).eq("id", plan.id);
    await load();
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <SectionTitle>{t("platformAdmin.plans.existing")}</SectionTitle>
      {plans.map((plan) => (
        <Card key={plan.id}>
          <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
            <View style={{ flex: 1 }}>
              <Text style={styles.planName}>{plan.name}</Text>
              <Text style={styles.planPrice}>
                R$ {plan.price_amount.toFixed(2)}/{t(`billingInterval.${plan.billing_interval}`)} ·{" "}
                {plan.max_members ? t("platformAdmin.plans.upToMembers", { count: plan.max_members }) : t("platformAdmin.plans.unlimitedMembers")}
              </Text>
            </View>
            <Badge
              label={plan.is_active ? t("platformAdmin.plans.active") : t("platformAdmin.plans.inactive")}
              tone={plan.is_active ? "success" : "default"}
            />
          </View>
          <Button
            title={plan.is_active ? t("platformAdmin.plans.deactivate") : t("platformAdmin.plans.activate")}
            variant="outline"
            onPress={() => toggleActive(plan)}
          />
        </Card>
      ))}

      <SectionTitle>{t("platformAdmin.plans.newPlan")}</SectionTitle>
      <Card>
        <TextInput style={styles.input} placeholder={t("platformAdmin.plans.namePlaceholder")} value={name} onChangeText={setName} />
        <TextInput
          style={styles.input}
          placeholder={t("platformAdmin.plans.pricePlaceholder")}
          value={price}
          onChangeText={setPrice}
          keyboardType="decimal-pad"
        />
        <TextInput
          style={styles.input}
          placeholder={t("platformAdmin.plans.maxMembersPlaceholder")}
          value={maxMembers}
          onChangeText={setMaxMembers}
          keyboardType="number-pad"
        />
        <TextInput
          style={styles.input}
          placeholder={t("platformAdmin.plans.trialDaysPlaceholder")}
          value={trialDays}
          onChangeText={setTrialDays}
          keyboardType="number-pad"
        />
      </Card>
      <Button title={t("platformAdmin.plans.create")} onPress={handleCreate} loading={saving} disabled={!name.trim() || !price} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 20, backgroundColor: colors.background, flexGrow: 1, gap: 8 },
  planName: { fontWeight: "700", color: colors.textPrimary },
  planPrice: { color: colors.textSecondary, marginTop: 2, fontSize: 13 },
  input: {
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    paddingVertical: 10,
    fontSize: 15,
    marginBottom: 10,
    color: colors.textPrimary,
  },
});
