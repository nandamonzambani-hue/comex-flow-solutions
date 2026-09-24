import { useEffect, useState } from "react";
import { Alert, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import { useTranslation } from "react-i18next";
import { supabase } from "@/lib/supabase";
import { useParishId } from "@/hooks/useParish";
import { useLocalizedField } from "@/lib/localized";
import { sendNotification } from "@/lib/notifications";
import { Button, Card, SectionTitle } from "@/components/ui";
import { colors } from "@/theme/colors";
import type { Group, MemberRole } from "@/types/database";

type TargetType = "all" | "group" | "role";

const ROLES: MemberRole[] = ["member", "group_leader", "staff"];

export default function AdminNotificationsScreen() {
  const { t } = useTranslation();
  const localize = useLocalizedField();
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
      Alert.alert(t("admin.notifications.sentTitle"), t("admin.notifications.sentBody", { count: result.sent }));
      setTitle("");
      setMessage("");
    } catch (err) {
      Alert.alert(t("common.error"), err instanceof Error ? err.message : t("admin.notifications.sendError"));
    } finally {
      setSending(false);
    }
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Card>
        <TextInput style={styles.input} placeholder={t("admin.notifications.titlePlaceholder")} value={title} onChangeText={setTitle} />
        <TextInput
          style={[styles.input, styles.textarea]}
          placeholder={t("admin.notifications.messagePlaceholder")}
          value={message}
          onChangeText={setMessage}
          multiline
        />
      </Card>

      <SectionTitle>{t("admin.notifications.recipients")}</SectionTitle>
      <View style={styles.optionsRow}>
        {(["all", "group", "role"] as TargetType[]).map((target) => (
          <Text
            key={target}
            style={[styles.option, targetType === target && styles.optionActive]}
            onPress={() => {
              setTargetType(target);
              setTargetId(undefined);
            }}
          >
            {t(`admin.notifications.target.${target}`)}
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
              {localize(g, "name")}
            </Text>
          ))}
        </View>
      )}

      {targetType === "role" && (
        <View style={styles.optionsRow}>
          {ROLES.map((r) => (
            <Text key={r} style={[styles.option, targetId === r && styles.optionActive]} onPress={() => setTargetId(r)}>
              {t(`admin.members.roles.${r === "group_leader" ? "groupLeader" : r}`)}
            </Text>
          ))}
        </View>
      )}

      <Button
        title={t("admin.notifications.send")}
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
