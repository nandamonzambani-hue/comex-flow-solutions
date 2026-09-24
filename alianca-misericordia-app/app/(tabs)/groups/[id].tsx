import { useCallback, useEffect, useState } from "react";
import { ScrollView, StyleSheet, Text } from "react-native";
import { useLocalSearchParams } from "expo-router";
import { useTranslation } from "react-i18next";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/context/AuthContext";
import { useLocalizedField } from "@/lib/localized";
import { Button, Card } from "@/components/ui";
import { colors } from "@/theme/colors";
import type { Group } from "@/types/database";

export default function GroupDetailScreen() {
  const { t } = useTranslation();
  const localize = useLocalizedField();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { profile } = useAuth();
  const [group, setGroup] = useState<Group | null>(null);
  const [memberCount, setMemberCount] = useState(0);
  const [isMember, setIsMember] = useState(false);
  const [busy, setBusy] = useState(false);

  const load = useCallback(async () => {
    const { data: groupData } = await supabase.from("groups").select("*").eq("id", id).single();
    setGroup(groupData as Group);

    const { count } = await supabase
      .from("group_members")
      .select("*", { count: "exact", head: true })
      .eq("group_id", id);
    setMemberCount(count ?? 0);

    if (profile) {
      const { data: membership } = await supabase
        .from("group_members")
        .select("group_id")
        .eq("group_id", id)
        .eq("profile_id", profile.id)
        .maybeSingle();
      setIsMember(!!membership);
    }
  }, [id, profile]);

  useEffect(() => {
    load();
  }, [load]);

  async function toggleMembership() {
    if (!profile || !group) return;
    setBusy(true);
    if (isMember) {
      await supabase.from("group_members").delete().eq("group_id", group.id).eq("profile_id", profile.id);
    } else {
      await supabase.from("group_members").insert({ group_id: group.id, profile_id: profile.id });
    }
    await load();
    setBusy(false);
  }

  if (!group) return null;

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>{localize(group, "name")}</Text>
      {group.description && <Text style={styles.description}>{localize(group, "description")}</Text>}
      {group.meeting_schedule && (
        <Card>
          <Text style={styles.label}>{t("groups.meetings")}</Text>
          <Text style={styles.value}>{group.meeting_schedule}</Text>
        </Card>
      )}
      <Card>
        <Text style={styles.label}>{t("groups.participants")}</Text>
        <Text style={styles.value}>{t("groups.peopleCount", { count: memberCount })}</Text>
      </Card>

      <Button
        title={isMember ? t("groups.leave") : t("groups.join")}
        onPress={toggleMembership}
        loading={busy}
        variant={isMember ? "outline" : "primary"}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 20, backgroundColor: colors.background, flexGrow: 1, gap: 4 },
  title: { fontSize: 24, fontWeight: "700", color: colors.textPrimary },
  description: { color: colors.textSecondary, marginTop: 8, marginBottom: 12, fontSize: 15, lineHeight: 21 },
  label: { fontSize: 12, color: colors.textSecondary, textTransform: "uppercase", fontWeight: "600" },
  value: { fontSize: 16, color: colors.textPrimary, marginTop: 4 },
});
