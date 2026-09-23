import { useState } from "react";
import { ScrollView, StyleSheet, Text, TextInput } from "react-native";
import { useTranslation } from "react-i18next";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/context/AuthContext";
import { Button, Card } from "@/components/ui";
import { LanguagePicker } from "@/components/LanguagePicker";
import { colors } from "@/theme/colors";

export default function ProfileScreen() {
  const { t } = useTranslation();
  const { profile, refreshProfile } = useAuth();
  const [fullName, setFullName] = useState(profile?.full_name ?? "");
  const [phone, setPhone] = useState(profile?.phone ?? "");
  const [saving, setSaving] = useState(false);

  async function handleSave() {
    if (!profile) return;
    setSaving(true);
    await supabase.from("profiles").update({ full_name: fullName, phone }).eq("id", profile.id);
    await refreshProfile();
    setSaving(false);
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Card>
        <Text style={styles.label}>{t("profile.fullName")}</Text>
        <TextInput style={styles.input} value={fullName} onChangeText={setFullName} />

        <Text style={styles.label}>{t("profile.phone")}</Text>
        <TextInput style={styles.input} value={phone} onChangeText={setPhone} keyboardType="phone-pad" />

        <Text style={styles.label}>{t("auth.email")}</Text>
        <Text style={styles.readOnly}>{profile?.email}</Text>
      </Card>

      <Button title={t("profile.save")} onPress={handleSave} loading={saving} />

      <Card style={{ marginTop: 4 }}>
        <Text style={styles.label}>{t("profile.language")}</Text>
        <LanguagePicker />
      </Card>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 20, backgroundColor: colors.background, flexGrow: 1, gap: 16 },
  label: { fontSize: 12, color: colors.textSecondary, fontWeight: "600", textTransform: "uppercase", marginTop: 10 },
  input: {
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    paddingVertical: 8,
    fontSize: 16,
    color: colors.textPrimary,
  },
  readOnly: { paddingVertical: 8, fontSize: 16, color: colors.textSecondary },
});
