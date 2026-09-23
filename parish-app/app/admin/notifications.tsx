import { useEffect, useState } from "react";
import { Alert, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import { supabase } from "@/lib/supabase";
import { useParishId } from "@/hooks/useParish";
import { sendNotification } from "@/lib/notifications";
import { Button, Card, SectionTitle } from "@/components/ui";
import { colors } from "@/theme/colors";
import type { Group } from "@/types/database";

type TargetType = "all" | "group" | "role";

const ROLES = ["member", "group_leader", "staff"] as const;

export default function AdminNotificationsScreen() {
  const parishId = useParishId();
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [targetType, setTargetType] = useState<TargetType>("all");
  const [targetId, setTargetId] = useState<string | undefined>();
  const [groups, setGroups] = useState<Group[]>([]);
  const [sending, setSending] = useState(false);

  useEffect(() => {
    if (!parishId) return;
    supabase
      .from("groups")
      .select("*")
      .eq("parish_id", parishId)
      .then(({ data }) => setGroups((data as Group[]) ?? []));
  }, [parishId]);

  async function handleSend() {
    setSending(true);
    try {
      const result = await sendNotification({ title, message, target_type: targetType, target_id: targetId });
      Alert.alert("Enviado", `Notificação enviada para ${result.sent} dispositivo(s).`);
      setTitle("");
      setMessage("");
    } catch (err) {
      Alert.alert("Erro", err instanceof Error ? err.message : "Falha ao enviar notificação");
    } finally {
      setSending(false);
    }
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Card>
        <TextInput style={styles.input} placeholder="Título da notificação" value={title} onChangeText={setTitle} />
        <TextInput
          style={[styles.input, styles.textarea]}
          placeholder="Mensagem"
          value={message}
          onChangeText={setMessage}
          multiline
        />
      </Card>

      <SectionTitle>Destinatários</SectionTitle>
      <View style={styles.optionsRow}>
        {(["all", "group", "role"] as TargetType[]).map((t) => (
          <Text
            key={t}
            style={[styles.option, targetType === t && styles.optionActive]}
            onPress={() => {
              setTargetType(t);
              setTargetId(undefined);
            }}
          >
            {t === "all" ? "Todos" : t === "group" ? "Um grupo" : "Um papel"}
          </Text>
        ))}
      </View>

      {targetType === "group" && (
        <View style={styles.optionsRow}>
          {groups.map((g) => (
            <Text
              key={g.id}
              style={[styles.option, targetId === g.id && styles.optionActive]}
              onPress={() => setTargetId(g.id)}
            >
              {g.name}
            </Text>
          ))}
        </View>
      )}

      {targetType === "role" && (
        <View style={styles.optionsRow}>
          {ROLES.map((r) => (
            <Text key={r} style={[styles.option, targetId === r && styles.optionActive]} onPress={() => setTargetId(r)}>
              {r}
            </Text>
          ))}
        </View>
      )}

      <Button
        title="Enviar notificação"
        onPress={handleSend}
        loading={sending}
        disabled={!title.trim() || !message.trim() || (targetType !== "all" && !targetId)}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 20, backgroundColor: colors.background, flexGrow: 1, gap: 12 },
  input: {
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    paddingVertical: 10,
    fontSize: 15,
    marginBottom: 10,
    color: colors.textPrimary,
  },
  textarea: { minHeight: 90, textAlignVertical: "top" },
  optionsRow: { flexDirection: "row", flexWrap: "wrap", gap: 8, marginBottom: 8 },
  option: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 8,
    color: colors.textSecondary,
    fontWeight: "600",
  },
  optionActive: { backgroundColor: colors.primary, color: "#fff", borderColor: colors.primary },
});
