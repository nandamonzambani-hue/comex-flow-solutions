import { useCallback, useEffect, useState } from "react";
import { Alert, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import * as Clipboard from "expo-clipboard";
import { useTranslation } from "react-i18next";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/context/AuthContext";
import { useParishContext, useTheme } from "@/context/ParishContext";
import { Badge, Button, Card, SectionTitle } from "@/components/ui";
import { colors } from "@/theme/colors";
import type { Parish, Profile } from "@/types/database";

function emptyForm() {
  return { id: null as string | null, name: "", address: "", city: "", patronSaint: "", massSchedule: "" };
}

/**
 * Igreja → Matriz e comunidades. A Matriz cria e edita suas comunidades e
 * define quem coordena cada uma (vira "admin" só daquela comunidade).
 */
export default function AdminCommunitiesScreen() {
  const { t } = useTranslation();
  const theme = useTheme();
  const { profile } = useAuth();
  const { parish, parentParish, managedParishes, refreshParish } = useParishContext();
  const [form, setForm] = useState(emptyForm());
  const [saving, setSaving] = useState(false);
  const [coordinators, setCoordinators] = useState<Record<string, Profile[]>>({});
  const [memberCounts, setMemberCounts] = useState<Record<string, number>>({});
  const [pickingFor, setPickingFor] = useState<string | null>(null);
  const [candidates, setCandidates] = useState<Profile[]>([]);
  const [search, setSearch] = useState("");

  const isMatrizAdmin = parish?.kind === "matriz" && (profile?.role === "admin" || profile?.role === "pastor");
  const communities = managedParishes.filter((p) => p.kind === "comunidade");

  const loadPeople = useCallback(async () => {
    const ids = managedParishes.map((p) => p.id);
    if (ids.length === 0) return;
    const { data } = await supabase.from("profiles").select("*").in("parish_id", ids).limit(5000);
    const people = (data as Profile[]) ?? [];
    const counts: Record<string, number> = {};
    const coords: Record<string, Profile[]> = {};
    for (const person of people) {
      if (!person.parish_id) continue;
      counts[person.parish_id] = (counts[person.parish_id] ?? 0) + 1;
      if (["admin", "pastor", "staff"].includes(person.role)) (coords[person.parish_id] ??= []).push(person);
    }
    setMemberCounts(counts);
    setCoordinators(coords);
  }, [managedParishes]);

  useEffect(() => {
    loadPeople();
  }, [loadPeople]);

  async function save() {
    if (!form.name.trim()) return;
    setSaving(true);
    const { error } = form.id
      ? await supabase
          .from("parishes")
          .update({
            name: form.name.trim(),
            address: form.address.trim() || null,
            city: form.city.trim() || null,
            patron_saint: form.patronSaint.trim() || null,
            mass_schedule: form.massSchedule.trim() || null,
          })
          .eq("id", form.id)
      : await supabase.rpc("create_community", {
          p_name: form.name.trim(),
          p_address: form.address.trim() || null,
          p_city: form.city.trim() || null,
          p_patron_saint: form.patronSaint.trim() || null,
          p_mass_schedule: form.massSchedule.trim() || null,
        });
    setSaving(false);
    if (error) {
      Alert.alert(t("common.error"), error.message);
      return;
    }
    setForm(emptyForm());
    await refreshParish();
  }

  function edit(c: Parish) {
    setForm({
      id: c.id,
      name: c.name,
      address: c.address ?? "",
      city: c.city ?? "",
      patronSaint: c.patron_saint ?? "",
      massSchedule: c.mass_schedule ?? "",
    });
  }

  async function openPicker(communityId: string) {
    setPickingFor(communityId);
    setSearch("");
    const { data } = await supabase.from("profiles").select("*").eq("parish_id", communityId).order("full_name").limit(500);
    setCandidates((data as Profile[]) ?? []);
  }

  async function makeCoordinator(person: Profile) {
    const { error } = await supabase.from("profiles").update({ role: "admin" }).eq("id", person.id);
    if (error) {
      Alert.alert(t("common.error"), error.message);
      return;
    }
    setPickingFor(null);
    loadPeople();
  }

  if (parish?.kind === "comunidade") {
    return (
      <ScrollView contentContainerStyle={styles.container}>
        <Card>
          <Badge label={t("hierarchy.kind.comunidade")} />
          <Text style={styles.title}>{parish.name}</Text>
          <Text style={styles.text}>{t("admin.communities.belongsTo", { name: parentParish?.name ?? "" })}</Text>
          <Text style={styles.text}>{t("admin.communities.communityRules")}</Text>
        </Card>
      </ScrollView>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
      <Card style={{ backgroundColor: `${theme.primary}0d`, borderColor: `${theme.primary}33` }}>
        <Text style={styles.title}>⛪ {parish?.name}</Text>
        <Text style={styles.text}>{t("admin.communities.matrizRules")}</Text>
        <Text style={styles.meta}>
          {t("admin.communities.members", { count: parish ? memberCounts[parish.id] ?? 0 : 0 })}
          {parish?.join_code ? ` · ${t("admin.communities.joinCode")}: ${parish.join_code}` : ""}
        </Text>
      </Card>

      <SectionTitle>{t("admin.communities.listTitle", { count: communities.length })}</SectionTitle>
      {communities.length === 0 && <Text style={styles.text}>{t("admin.communities.empty")}</Text>}
      {communities.map((c) => (
        <Card key={c.id}>
          <View style={styles.rowBetween}>
            <Text style={styles.cardTitle}>🏠 {c.name}</Text>
            {isMatrizAdmin && (
              <Pressable onPress={() => edit(c)}>
                <Text style={[styles.link, { color: theme.primary }]}>{t("common.edit")}</Text>
              </Pressable>
            )}
          </View>
          {c.patron_saint && <Text style={styles.text}>{t("admin.communities.patron")}: {c.patron_saint}</Text>}
          {c.address && <Text style={styles.text}>📍 {c.address}</Text>}
          {c.mass_schedule && <Text style={styles.text}>🕯 {c.mass_schedule}</Text>}
          <Text style={styles.meta}>
            {t("admin.communities.members", { count: memberCounts[c.id] ?? 0 })}
            {c.join_code ? ` · ${t("admin.communities.joinCode")}: ` : ""}
          </Text>
          {c.join_code && (
            <Pressable onPress={() => Clipboard.setStringAsync(c.join_code ?? "")}>
              <Text style={[styles.code, { color: theme.primary }]}>{c.join_code} ⧉</Text>
            </Pressable>
          )}
          <Text style={styles.label}>{t("admin.communities.coordinators")}</Text>
          {(coordinators[c.id] ?? []).length === 0 && <Text style={styles.muted}>{t("admin.communities.noCoordinator")}</Text>}
          {(coordinators[c.id] ?? []).map((person) => (
            <Text key={person.id} style={styles.text}>
              • {person.full_name} ({t(`admin.members.roles.${person.role === "group_leader" ? "groupLeader" : person.role}`)})
            </Text>
          ))}
          {isMatrizAdmin && (
            <Pressable onPress={() => openPicker(c.id)}>
              <Text style={[styles.link, { color: theme.primary, marginTop: 6 }]}>+ {t("admin.communities.addCoordinator")}</Text>
            </Pressable>
          )}

          {pickingFor === c.id && (
            <View style={styles.picker}>
              <TextInput style={styles.input} placeholder={t("admin.members.searchPlaceholder")} value={search} onChangeText={setSearch} />
              {candidates
                .filter((p) => p.full_name.toLowerCase().includes(search.toLowerCase()))
                .slice(0, 20)
                .map((person) => (
                  <Pressable key={person.id} style={styles.candidate} onPress={() => makeCoordinator(person)}>
                    <Text style={styles.text}>{person.full_name}</Text>
                  </Pressable>
                ))}
              {candidates.length === 0 && <Text style={styles.muted}>{t("admin.communities.noMembersYet")}</Text>}
              <Pressable onPress={() => setPickingFor(null)}>
                <Text style={[styles.link, { color: colors.danger }]}>{t("common.cancel")}</Text>
              </Pressable>
            </View>
          )}
        </Card>
      ))}

      {isMatrizAdmin && (
        <Card>
          <Text style={styles.cardTitle}>{form.id ? t("admin.communities.editTitle") : t("admin.communities.newTitle")}</Text>
          <TextInput style={styles.input} placeholder={t("admin.communities.namePlaceholder")} value={form.name} onChangeText={(v) => setForm((f) => ({ ...f, name: v }))} />
          <TextInput style={styles.input} placeholder={t("admin.communities.patronPlaceholder")} value={form.patronSaint} onChangeText={(v) => setForm((f) => ({ ...f, patronSaint: v }))} />
          <TextInput style={styles.input} placeholder={t("admin.communities.addressPlaceholder")} value={form.address} onChangeText={(v) => setForm((f) => ({ ...f, address: v }))} />
          <TextInput style={styles.input} placeholder={t("admin.communities.cityPlaceholder")} value={form.city} onChangeText={(v) => setForm((f) => ({ ...f, city: v }))} />
          <TextInput style={styles.input} placeholder={t("admin.communities.massPlaceholder")} value={form.massSchedule} onChangeText={(v) => setForm((f) => ({ ...f, massSchedule: v }))} />
          <View style={styles.actions}>
            <View style={{ flex: 1 }}>
              <Button title={form.id ? t("common.save") : t("admin.communities.create")} onPress={save} loading={saving} disabled={!form.name.trim()} />
            </View>
            {form.id && (
              <View style={{ flex: 1 }}>
                <Button title={t("common.cancel")} variant="outline" onPress={() => setForm(emptyForm())} />
              </View>
            )}
          </View>
        </Card>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 16, backgroundColor: colors.background, flexGrow: 1, maxWidth: 900, width: "100%", alignSelf: "center" },
  title: { fontSize: 18, fontWeight: "700", color: colors.textPrimary, marginVertical: 6 },
  cardTitle: { fontSize: 16, fontWeight: "700", color: colors.textPrimary, marginBottom: 4 },
  text: { color: colors.textPrimary, marginTop: 2, lineHeight: 20 },
  meta: { color: colors.textSecondary, marginTop: 8, fontSize: 13 },
  muted: { color: colors.textSecondary, fontSize: 13 },
  label: { fontWeight: "700", color: colors.textSecondary, fontSize: 12, textTransform: "uppercase", marginTop: 12 },
  code: { fontWeight: "700", fontSize: 15, marginTop: 2 },
  link: { fontWeight: "700" },
  rowBetween: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  input: {
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    paddingVertical: 10,
    fontSize: 15,
    marginBottom: 8,
    color: colors.textPrimary,
  },
  actions: { flexDirection: "row", gap: 10, marginTop: 8 },
  picker: { marginTop: 10, borderTopWidth: 1, borderTopColor: colors.border, paddingTop: 8 },
  candidate: { paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: colors.border },
});
