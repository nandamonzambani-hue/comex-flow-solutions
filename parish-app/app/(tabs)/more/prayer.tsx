import { useCallback, useEffect, useState } from "react";
import { Alert, Pressable, ScrollView, StyleSheet, Switch, Text, TextInput, View } from "react-native";
import { useTranslation } from "react-i18next";
import { format } from "date-fns";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/context/AuthContext";
import { useTheme } from "@/context/ParishContext";
import { useDateLocale } from "@/lib/dateLocale";
import { CARE_AREAS, type CareArea } from "@/lib/care";
import { Badge, Button, Card, SectionTitle } from "@/components/ui";
import { colors } from "@/theme/colors";
import type { PrayerRequest } from "@/types/database";

export default function PrayerRequestScreen() {
  const { t } = useTranslation();
  const theme = useTheme();
  const dateLocale = useDateLocale();
  const { profile } = useAuth();
  const [area, setArea] = useState<CareArea>("familia");
  const [body, setBody] = useState("");
  const [phone, setPhone] = useState(profile?.phone ?? "");
  const [allowWhatsapp, setAllowWhatsapp] = useState(false);
  const [allowShare, setAllowShare] = useState(false);
  const [saving, setSaving] = useState(false);
  const [mine, setMine] = useState<PrayerRequest[]>([]);

  const load = useCallback(async () => {
    if (!profile) return;
    const { data } = await supabase
      .from("prayer_requests")
      .select("*")
      .eq("profile_id", profile.id)
      .order("created_at", { ascending: false })
      .limit(10);
    setMine((data as PrayerRequest[]) ?? []);
  }, [profile]);

  useEffect(() => {
    load();
  }, [load]);

  async function send() {
    if (!profile || !profile.parish_id || !body.trim()) return;
    setSaving(true);
    const { error } = await supabase.from("prayer_requests").insert({
      parish_id: profile.parish_id,
      profile_id: profile.id,
      requester_name: profile.full_name,
      requester_email: profile.email,
      requester_phone: phone.trim() || null,
      area,
      body: body.trim(),
      allow_whatsapp_contact: allowWhatsapp,
      is_private: !allowShare,
    });
    setSaving(false);
    if (error) {
      Alert.alert(t("common.error"), error.message);
      return;
    }
    setBody("");
    Alert.alert(t("prayer.sentTitle"), t("prayer.sentBody"));
    load();
  }

  return (
    <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
      <Text style={styles.intro}>{t("prayer.intro")}</Text>
      <Card>
        <Text style={styles.label}>{t("prayer.area")}</Text>
        <View style={styles.chips}>
          {CARE_AREAS.map((a) => (
            <Pressable
              key={a}
              onPress={() => setArea(a)}
              style={[styles.chip, area === a && { backgroundColor: theme.primary, borderColor: theme.primary }]}
            >
              <Text style={[styles.chipText, area === a && { color: "#fff" }]}>{t(`care.areas.${a}`)}</Text>
            </Pressable>
          ))}
        </View>

        <Text style={styles.label}>{t("prayer.reason")}</Text>
        <TextInput style={[styles.input, styles.multiline]} value={body} onChangeText={setBody} multiline placeholder={t("prayer.reasonPlaceholder")} />

        <Text style={styles.label}>{t("prayer.phone")}</Text>
        <TextInput style={styles.input} value={phone} onChangeText={setPhone} keyboardType="phone-pad" placeholder="(11) 90000-0000" />

        <View style={styles.switchRow}>
          <Text style={styles.switchLabel}>{t("prayer.allowWhatsapp")}</Text>
          <Switch value={allowWhatsapp} onValueChange={setAllowWhatsapp} />
        </View>
        <View style={styles.switchRow}>
          <Text style={styles.switchLabel}>{t("prayer.allowShare")}</Text>
          <Switch value={allowShare} onValueChange={setAllowShare} />
        </View>

        <Button title={t("prayer.send")} onPress={send} loading={saving} disabled={!body.trim()} />
      </Card>

      {mine.length > 0 && (
        <>
          <SectionTitle>{t("prayer.mine")}</SectionTitle>
          {mine.map((item) => (
            <Card key={item.id}>
              <View style={styles.rowBetween}>
                <Badge label={t(`care.areas.${item.area}`, { defaultValue: item.area })} />
                <Badge label={t(`prayer.status.${item.status}`)} tone={item.status === "answered" ? "success" : "default"} />
              </View>
              <Text style={styles.body}>{item.body}</Text>
              <Text style={styles.date}>{format(new Date(item.created_at), "dd MMM yyyy", { locale: dateLocale })}</Text>
            </Card>
          ))}
        </>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 16, backgroundColor: colors.background, flexGrow: 1 },
  intro: { color: colors.textSecondary, marginBottom: 12, lineHeight: 20 },
  label: { fontWeight: "700", color: colors.textPrimary, marginTop: 8, marginBottom: 6 },
  chips: { flexDirection: "row", flexWrap: "wrap", gap: 6 },
  chip: { borderWidth: 1, borderColor: colors.border, borderRadius: 16, paddingHorizontal: 10, paddingVertical: 6 },
  chipText: { fontSize: 13, color: colors.textPrimary },
  input: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 10,
    padding: 12,
    fontSize: 15,
    color: colors.textPrimary,
  },
  multiline: { minHeight: 100, textAlignVertical: "top" },
  switchRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginVertical: 8, gap: 12 },
  switchLabel: { flex: 1, color: colors.textPrimary },
  rowBetween: { flexDirection: "row", justifyContent: "space-between" },
  body: { color: colors.textPrimary, marginTop: 8 },
  date: { color: colors.textSecondary, fontSize: 12, marginTop: 6 },
});
