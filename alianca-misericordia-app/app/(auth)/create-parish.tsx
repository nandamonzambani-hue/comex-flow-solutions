import { useState } from "react";
import { ScrollView, StyleSheet, Text, TextInput } from "react-native";
import { router } from "expo-router";
import { useTranslation } from "react-i18next";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/context/AuthContext";
import { Button, Card } from "@/components/ui";
import { colors } from "@/theme/colors";

function slugify(name: string) {
  return name
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

export default function CreateParishScreen() {
  const { t } = useTranslation();
  const { profile, refreshProfile } = useAuth();
  const [name, setName] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [contactPhone, setContactPhone] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit() {
    if (!profile || !name.trim()) return;
    setError(null);
    setSaving(true);

    const slug = `${slugify(name)}-${Date.now().toString(36)}`;
    const { data: parish, error: insertError } = await supabase
      .from("parishes")
      .insert({
        name: name.trim(),
        slug,
        city: city.trim() || null,
        state: state.trim() || null,
        contact_name: profile.full_name,
        contact_phone: contactPhone.trim() || null,
        email: profile.email,
      })
      .select()
      .single();

    if (insertError || !parish) {
      setSaving(false);
      setError(insertError?.message ?? t("onboarding.createError"));
      return;
    }

    const { error: claimError } = await supabase.rpc("claim_parish_admin", { target_parish_id: parish.id });
    setSaving(false);
    if (claimError) {
      setError(claimError.message);
      return;
    }

    await refreshProfile();
    router.replace("/(tabs)");
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>{t("onboarding.createParishTitle")}</Text>
      <Text style={styles.subtitle}>{t("onboarding.createParishSubtitle")}</Text>

      <Card>
        <TextInput style={styles.input} placeholder={t("onboarding.parishNamePlaceholder")} value={name} onChangeText={setName} />
        <TextInput style={styles.input} placeholder={t("onboarding.parishCityPlaceholder")} value={city} onChangeText={setCity} />
        <TextInput style={styles.input} placeholder={t("onboarding.parishStatePlaceholder")} value={state} onChangeText={setState} />
        <TextInput
          style={styles.input}
          placeholder={t("onboarding.parishPhonePlaceholder")}
          value={contactPhone}
          onChangeText={setContactPhone}
          keyboardType="phone-pad"
        />
      </Card>

      <Text style={styles.hint}>{t("onboarding.createParishHint")}</Text>

      {error && <Text style={styles.error}>{error}</Text>}

      <Button title={t("onboarding.submitParish")} onPress={handleSubmit} loading={saving} disabled={!name.trim()} />
      <Button title={t("common.back")} variant="outline" onPress={() => router.back()} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 20, backgroundColor: colors.background, flexGrow: 1, gap: 12 },
  title: { fontSize: 24, fontWeight: "700", color: colors.textPrimary },
  subtitle: { color: colors.textSecondary, marginTop: 4, marginBottom: 4, lineHeight: 20 },
  input: {
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    paddingVertical: 10,
    fontSize: 15,
    marginBottom: 10,
    color: colors.textPrimary,
  },
  hint: { color: colors.textSecondary, fontSize: 13, fontStyle: "italic", lineHeight: 18 },
  error: { color: colors.danger, textAlign: "center" },
});
