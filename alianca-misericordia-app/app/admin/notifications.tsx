import { useEffect, useState } from "react";
import { Alert, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import { useTranslation } from "react-i18next";
import { supabase } from "@/lib/supabase";
import { sendNotification } from "@/lib/notifications";
import { Button, Card, SectionTitle } from "@/components/ui";
import { colors } from "@/theme/colors";
import { EVANGELIZATION_COLORS, type EvangelizationColor, type Group, type MembershipLevel } from "@/types/database";

type TargetType = "all" | "group" | "color" | "level";

export default function AdminNotificationsScreen() {
  const { t } = useTranslation();
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [targetType, setTargetType] = useState<TargetType>("all");
  const [targetId, setTargetId] = useState<string | undefined>();
  const [groups, setGroups] = useState<Group[]>([]);
  const [levels, setLevels] = useState<MembershipLevel[]>([]);
  const [sending, setSending] = useState(false);

  useEffect(() => {
    supabase
      .from("groups")
      .select("*")
      .then(({ data }) => setGroups((data as Group[]) ?? []));
    supabase
      .from("membership_levels")
      .select("*")
      .order("sort_order")
      .then(({ data }) => setLevels((data as MembershipLevel[]) ?? []));
  }, []);

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
        {(["all", "group", "color", "level"] as TargetType[]).map((target) => (
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
              {g.name}
            </Text>
          ))}
        </View>
      )}

      {targetType === "color" && (
        <View style={styles.optionsRow}>
          {EVANGELIZATION_COLORS.map((c) => (
            <Text
              key={c.value}
              style={[styles.option, targetId === (c.value as EvangelizationColor) && styles.optionActive]}
              onPress={() => setTargetId(c.value)}
            >
              {c.label} ({c.group})
            </Text>
          ))}
        </View>
      )}

      {targetType === "level" && (
        <View style={styles.optionsRow}>
          {levels.map((l) => (
            <Text key={l.id} style={[styles.option, targetId === l.id && styles.optionActive]} onPress={() => setTargetId(l.id)}>
              {l.name}
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
