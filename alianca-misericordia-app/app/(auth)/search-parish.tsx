import { useState } from "react";
import { Alert, FlatList, StyleSheet, Text, TextInput, View } from "react-native";
import { router } from "expo-router";
import { useTranslation } from "react-i18next";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/context/AuthContext";
import { Badge, Button, Card, EmptyState, ScreenContainer } from "@/components/ui";
import { colors } from "@/theme/colors";
import type { Parish } from "@/types/database";

const JOINABLE_STATUSES = ["active", "trial"];

export default function SearchParishScreen() {
  const { t } = useTranslation();
  const { profile, refreshProfile } = useAuth();
  const [query, setQuery] = useState("");
  const [joinCode, setJoinCode] = useState("");
  const [results, setResults] = useState<Parish[]>([]);
  const [searching, setSearching] = useState(false);
  const [joiningId, setJoiningId] = useState<string | null>(null);
  const [searched, setSearched] = useState(false);

  async function handleSearch() {
    if (!query.trim()) return;
    setSearching(true);
    setSearched(true);
    const { data } = await supabase
      .from("parishes")
      .select("*")
      .or(`name.ilike.%${query.trim()}%,city.ilike.%${query.trim()}%`)
      .in("status", JOINABLE_STATUSES)
      .limit(20);
    setResults((data as Parish[]) ?? []);
    setSearching(false);
  }

  async function handleJoinByCode() {
    if (!joinCode.trim()) return;
    setSearching(true);
    const { data } = await supabase
      .from("parishes")
      .select("*")
      .eq("join_code", joinCode.trim().toUpperCase())
      .maybeSingle();
    setSearching(false);
    if (!data) {
      Alert.alert(t("onboarding.codeNotFoundTitle"), t("onboarding.codeNotFoundBody"));
      return;
    }
    await joinParish(data as Parish);
  }

  async function joinParish(parish: Parish) {
    if (!profile) return;
    if (!JOINABLE_STATUSES.includes(parish.status)) {
      Alert.alert(t("onboarding.notJoinableTitle"), t("onboarding.notJoinableBody"));
      return;
    }
    setJoiningId(parish.id);
    const { error } = await supabase.from("profiles").update({ parish_id: parish.id }).eq("id", profile.id);
    setJoiningId(null);
    if (error) {
      Alert.alert(t("common.error"), error.message);
      return;
    }
    await refreshProfile();
    router.replace("/(tabs)");
  }

  return (
    <ScreenContainer>
      <Text style={styles.label}>{t("onboarding.joinByCode")}</Text>
      <View style={styles.row}>
        <TextInput
          style={[styles.input, { flex: 1 }]}
          placeholder={t("onboarding.joinCodePlaceholder")}
          autoCapitalize="characters"
          value={joinCode}
          onChangeText={setJoinCode}
        />
        <Button title={t("onboarding.join")} onPress={handleJoinByCode} loading={searching} disabled={!joinCode.trim()} />
      </View>

      <Text style={[styles.label, { marginTop: 20 }]}>{t("onboarding.searchByNameCity")}</Text>
      <View style={styles.row}>
        <TextInput
          style={[styles.input, { flex: 1 }]}
          placeholder={t("onboarding.searchPlaceholder")}
          value={query}
          onChangeText={setQuery}
          onSubmitEditing={handleSearch}
        />
        <Button title={t("onboarding.search")} onPress={handleSearch} loading={searching} disabled={!query.trim()} />
      </View>

      <FlatList
        style={{ marginTop: 16 }}
        data={results}
        keyExtractor={(item) => item.id}
        ListEmptyComponent={searched ? <EmptyState message={t("onboarding.noResults")} /> : null}
        renderItem={({ item }) => (
          <Card>
            <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start" }}>
              <View style={{ flex: 1 }}>
                <Text style={styles.parishName}>{item.name}</Text>
                {item.city && (
                  <Text style={styles.parishCity}>
                    {item.city}
                    {item.state ? ` - ${item.state}` : ""}
                  </Text>
                )}
                {item.status === "trial" && <Badge label={t("onboarding.trialBadge")} tone="warning" />}
              </View>
              <Button
                title={t("onboarding.join")}
                onPress={() => joinParish(item)}
                loading={joiningId === item.id}
              />
            </View>
          </Card>
        )}
      />
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  label: { fontSize: 13, fontWeight: "700", color: colors.textSecondary, textTransform: "uppercase", marginBottom: 8 },
  row: { flexDirection: "row", gap: 10, alignItems: "center" },
  input: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
  },
  parishName: { fontSize: 16, fontWeight: "700", color: colors.textPrimary },
  parishCity: { color: colors.textSecondary, marginTop: 2, marginBottom: 4 },
});
