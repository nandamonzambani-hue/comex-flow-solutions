import { useEffect, useState } from "react";
import { FlatList, Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import { supabase } from "@/lib/supabase";
import { useParishId } from "@/hooks/useParish";
import { Badge, Card, EmptyState, ScreenContainer } from "@/components/ui";
import { colors } from "@/theme/colors";
import type { MemberRole, Profile } from "@/types/database";

const ROLE_LABEL: Record<MemberRole, string> = {
  member: "Membro",
  group_leader: "Líder de grupo",
  staff: "Equipe",
  admin: "Administrador",
  pastor: "Pároco",
};

const ROLE_CYCLE: MemberRole[] = ["member", "group_leader", "staff", "admin"];

export default function AdminMembersScreen() {
  const parishId = useParishId();
  const [members, setMembers] = useState<Profile[]>([]);
  const [search, setSearch] = useState("");

  useEffect(() => {
    if (!parishId) return;
    supabase
      .from("profiles")
      .select("*")
      .eq("parish_id", parishId)
      .order("full_name")
      .then(({ data }) => setMembers((data as Profile[]) ?? []));
  }, [parishId]);

  async function cycleRole(member: Profile) {
    const currentIndex = ROLE_CYCLE.indexOf(member.role);
    const nextRole = ROLE_CYCLE[(currentIndex + 1) % ROLE_CYCLE.length];
    await supabase.from("profiles").update({ role: nextRole }).eq("id", member.id);
    setMembers((prev) => prev.map((m) => (m.id === member.id ? { ...m, role: nextRole } : m)));
  }

  const filtered = members.filter((m) => m.full_name.toLowerCase().includes(search.toLowerCase()));

  return (
    <ScreenContainer>
      <TextInput
        style={styles.search}
        placeholder="Buscar por nome..."
        value={search}
        onChangeText={setSearch}
      />
      <FlatList
        data={filtered}
        keyExtractor={(item) => item.id}
        ListEmptyComponent={<EmptyState message="Nenhum membro encontrado." />}
        renderItem={({ item }) => (
          <Card>
            <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
              <View style={{ flex: 1 }}>
                <Text style={styles.name}>{item.full_name}</Text>
                {item.email && <Text style={styles.email}>{item.email}</Text>}
              </View>
              <Pressable onPress={() => cycleRole(item)}>
                <Badge label={ROLE_LABEL[item.role]} tone={item.role === "member" ? "default" : "success"} />
              </Pressable>
            </View>
          </Card>
        )}
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
});
