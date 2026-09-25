import { useEffect, useState } from "react";
import { FlatList, Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import { useTranslation } from "react-i18next";
import { supabase } from "@/lib/supabase";
import { Badge, Card, EmptyState, ScreenContainer } from "@/components/ui";
import { colors } from "@/theme/colors";
import { EVANGELIZATION_COLORS, type MemberRole, type Profile } from "@/types/database";

const ROLE_CYCLE: MemberRole[] = ["member", "leader", "staff", "admin"];

export default function AdminMembersScreen() {
  const { t } = useTranslation();
  const [members, setMembers] = useState<Profile[]>([]);
  const [search, setSearch] = useState("");

  const ROLE_LABEL: Record<MemberRole, string> = {
    member: t("admin.members.roles.member"),
    leader: t("admin.members.roles.leader"),
    staff: t("admin.members.roles.staff"),
    admin: t("admin.members.roles.admin"),
  };

  useEffect(() => {
    supabase
      .from("profiles")
      .select("*")
      .order("full_name")
      .then(({ data }) => setMembers((data as Profile[]) ?? []));
  }, []);

  async function cycleRole(member: Profile) {
    const currentIndex = ROLE_CYCLE.indexOf(member.role);
    const nextRole = ROLE_CYCLE[(currentIndex + 1) % ROLE_CYCLE.length];
    await supabase.from("profiles").update({ role: nextRole }).eq("id", member.id);
    setMembers((prev) => prev.map((m) => (m.id === member.id ? { ...m, role: nextRole } : m)));
  }

  const filtered = members.filter(
    (m) =>
      m.full_name.toLowerCase().includes(search.toLowerCase()) ||
      (m.city ?? "").toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <ScreenContainer>
      <TextInput
        style={styles.search}
        placeholder={t("admin.members.searchPlaceholder")}
        value={search}
        onChangeText={setSearch}
      />
      <FlatList
        data={filtered}
        keyExtractor={(item) => item.id}
        ListEmptyComponent={<EmptyState message={t("admin.members.empty")} />}
        renderItem={({ item }) => {
          const colorInfo = EVANGELIZATION_COLORS.find((c) => c.value === item.evangelization_color);
          return (
            <Card>
              <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.name}>{item.full_name}</Text>
                  {item.email && <Text style={styles.email}>{item.email}</Text>}
                  <View style={{ flexDirection: "row", gap: 6, marginTop: 6, flexWrap: "wrap" }}>
                    {item.city && <Text style={styles.tag}>📍 {item.city}</Text>}
                    {colorInfo && (
                      <Text style={[styles.tag, { color: colorInfo.hex }]}>
                        ● {colorInfo.label} ({colorInfo.group})
                      </Text>
                    )}
                  </View>
                </View>
                <Pressable onPress={() => cycleRole(item)}>
                  <Badge label={ROLE_LABEL[item.role]} tone={item.role === "member" ? "default" : "success"} />
                </Pressable>
              </View>
            </Card>
          );
        }}
      />
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  search: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 10,
    marginBottom: 12,
  },
  name: { fontWeight: "700", color: colors.textPrimary },
  email: { color: colors.textSecondary, fontSize: 13, marginTop: 2 },
  tag: { color: colors.textSecondary, fontSize: 12, fontWeight: "600" },
});
