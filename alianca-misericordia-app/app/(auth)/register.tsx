import { useEffect, useState } from "react";
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import { router } from "expo-router";
import { useTranslation } from "react-i18next";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui";
import { colors } from "@/theme/colors";
import { EVANGELIZATION_COLORS, type EvangelizationColor, type MembershipLevel } from "@/types/database";

export default function RegisterScreen() {
  const { t } = useTranslation();
  const { signUp } = useAuth();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [color, setColor] = useState<EvangelizationColor | null>(null);
  const [levelId, setLevelId] = useState<string | null>(null);
  const [levels, setLevels] = useState<MembershipLevel[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    supabase
      .from("membership_levels")
      .select("*")
      .eq("is_active", true)
      .order("sort_order")
      .then(({ data }) => setLevels((data as MembershipLevel[]) ?? []));
  }, []);

  async function handleSubmit() {
    if (!color || !levelId) return;
    setError(null);
    setLoading(true);
    const { error } = await signUp({
      email: email.trim(),
      password,
      fullName: fullName.trim(),
      city: city.trim(),
      state: state.trim() || undefined,
      evangelizationColor: color,
      membershipLevelId: levelId,
    });
    setLoading(false);
    if (error) {
      setError(error);
      return;
    }
    router.replace("/(tabs)");
  }

  const canSubmit = !!fullName && !!email && password.length >= 6 && !!city.trim() && !!color && !!levelId;

  return (
    <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === "ios" ? "padding" : undefined}>
      <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
        <Text style={styles.title}>{t("auth.registerTitle")}</Text>
        <Text style={styles.subtitle}>{t("auth.registerSubtitle")}</Text>

        <TextInput style={styles.input} placeholder={t("auth.fullName")} value={fullName} onChangeText={setFullName} />
        <TextInput
          style={styles.input}
          placeholder={t("auth.email")}
          autoCapitalize="none"
          keyboardType="email-address"
          value={email}
          onChangeText={setEmail}
        />
        <TextInput
          style={styles.input}
          placeholder={t("auth.passwordMin")}
          secureTextEntry
          value={password}
          onChangeText={setPassword}
        />

        <View style={styles.row}>
          <TextInput
            style={[styles.input, { flex: 1 }]}
            placeholder={t("auth.city")}
            value={city}
            onChangeText={setCity}
          />
          <TextInput
            style={[styles.input, { width: 70 }]}
            placeholder={t("auth.state")}
            value={state}
            onChangeText={setState}
            autoCapitalize="characters"
            maxLength={2}
          />
        </View>

        <Text style={styles.label}>{t("auth.membershipLevel")}</Text>
        <View style={styles.chipsRow}>
          {levels.map((l) => (
            <Pressable
              key={l.id}
              style={[styles.chip, levelId === l.id && styles.chipActive]}
              onPress={() => setLevelId(l.id)}
            >
              <Text style={[styles.chipText, levelId === l.id && styles.chipTextActive]}>{l.name}</Text>
            </Pressable>
          ))}
        </View>

        <Text style={styles.label}>{t("auth.evangelizationColor")}</Text>
        <View style={styles.chipsRow}>
          {EVANGELIZATION_COLORS.map((c) => (
            <Pressable
              key={c.value}
              style={[styles.colorChip, { borderColor: c.hex }, color === c.value && { backgroundColor: c.hex }]}
              onPress={() => setColor(c.value)}
            >
              <View style={[styles.colorDot, { backgroundColor: c.hex }]} />
              <Text style={[styles.chipText, color === c.value && styles.chipTextActive]}>
                {c.label} · {c.group}
              </Text>
            </Pressable>
          ))}
        </View>

        {error && <Text style={styles.error}>{error}</Text>}

        <Button title={t("auth.register")} onPress={handleSubmit} loading={loading} disabled={!canSubmit} />
        <Button title={t("common.back")} variant="outline" onPress={() => router.back()} />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: colors.background },
  container: { flexGrow: 1, backgroundColor: colors.background, padding: 24, paddingVertical: 40, gap: 4 },
  title: { fontSize: 26, fontWeight: "700", color: colors.textPrimary },
  subtitle: { fontSize: 14, color: colors.textSecondary, marginBottom: 16 },
  row: { flexDirection: "row", gap: 10 },
  input: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    marginBottom: 12,
    fontSize: 15,
  },
  label: { fontSize: 12, fontWeight: "700", color: colors.textSecondary, textTransform: "uppercase", marginTop: 8, marginBottom: 8 },
  chipsRow: { flexDirection: "row", flexWrap: "wrap", gap: 8, marginBottom: 8 },
  chip: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  chipActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  chipText: { color: colors.textSecondary, fontWeight: "600", fontSize: 13 },
  chipTextActive: { color: "#fff" },
  colorChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    borderWidth: 1.5,
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 7,
  },
  colorDot: { width: 10, height: 10, borderRadius: 5 },
  error: { color: colors.danger, marginTop: 8, marginBottom: 4, textAlign: "center" },
});
