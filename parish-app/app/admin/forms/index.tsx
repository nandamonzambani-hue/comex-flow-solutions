import { useCallback, useState } from "react";
import { Alert, FlatList, Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import { router, useFocusEffect } from "expo-router";
import { useTranslation } from "react-i18next";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/context/AuthContext";
import { useTheme } from "@/context/ParishContext";
import { useAdminParish } from "@/hooks/useParish";
import { uuidv4 } from "@/lib/uuid";
import { Badge, Button, Card, EmptyState, ScreenContainer } from "@/components/ui";
import { colors } from "@/theme/colors";
import type { ParishForm } from "@/types/database";

/** Formulários → lista: fichas de inscrição, pesquisas e quizzes da paróquia/comunidade selecionada. */
export default function AdminFormsScreen() {
  const { t } = useTranslation();
  const theme = useTheme();
  const { profile } = useAuth();
  const { parishId } = useAdminParish();
  const [forms, setForms] = useState<ParishForm[]>([]);
  const [counts, setCounts] = useState<Record<string, number>>({});
  const [newTitle, setNewTitle] = useState("");
  const [creating, setCreating] = useState(false);

  const load = useCallback(async () => {
    if (!parishId) return;
    const { data } = await supabase.from("forms").select("*").eq("parish_id", parishId).order("created_at", { ascending: false });
    const list = (data as ParishForm[]) ?? [];
    setForms(list);
    if (list.length > 0) {
      const { data: responses } = await supabase
        .from("form_responses")
        .select("form_id")
        .in(
          "form_id",
          list.map((f) => f.id),
        )
        .limit(10000);
      const c: Record<string, number> = {};
      for (const r of (responses as { form_id: string }[]) ?? []) c[r.form_id] = (c[r.form_id] ?? 0) + 1;
      setCounts(c);
    }
  }, [parishId]);

  // Recarrega ao voltar do editor (contagem de respostas, status publicado).
  useFocusEffect(
    useCallback(() => {
      load();
    }, [load]),
  );

  async function create(isQuiz: boolean) {
    if (!parishId || !newTitle.trim()) return;
    setCreating(true);
    const formId = uuidv4();
    const { error } = await supabase.from("forms").insert({
      id: formId,
      parish_id: parishId,
      title: newTitle.trim(),
      is_quiz: isQuiz,
      category: isQuiz ? "quiz" : "inscricao",
      created_by: profile?.id,
    });
    if (!error) {
      await supabase.from("form_sections").insert({ form_id: formId, title: t("admin.forms.defaultSection"), sort_order: 1 });
    }
    setCreating(false);
    if (error) {
      Alert.alert(t("common.error"), error.message);
      return;
    }
    setNewTitle("");
    router.push(`/admin/forms/${formId}` as never);
  }

  return (
    <ScreenContainer>
      <FlatList
        data={forms}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        ListHeaderComponent={
          <Card>
            <Text style={styles.hint}>{t("admin.forms.hint")}</Text>
            <TextInput style={styles.input} placeholder={t("admin.forms.newTitlePlaceholder")} value={newTitle} onChangeText={setNewTitle} />
            <View style={styles.row}>
              <View style={{ flex: 1 }}>
                <Button title={t("admin.forms.createForm")} onPress={() => create(false)} loading={creating} disabled={!newTitle.trim()} />
              </View>
              <View style={{ flex: 1 }}>
                <Button title={t("admin.forms.createQuiz")} variant="outline" onPress={() => create(true)} disabled={!newTitle.trim() || creating} />
              </View>
            </View>
          </Card>
        }
        ListEmptyComponent={<EmptyState message={t("admin.forms.empty")} />}
        renderItem={({ item }) => (
          <Card>
            <View style={styles.badges}>
              <Badge label={item.is_published ? t("admin.forms.published") : t("admin.forms.draft")} tone={item.is_published ? "success" : "warning"} />
              {item.is_quiz && <Badge label={t("forms.quizBadge")} />}
              {!item.share_with_communities && <Badge label={t("hierarchy.notShared")} tone="warning" />}
            </View>
            <Text style={styles.title}>{item.title}</Text>
            <Text style={styles.meta}>{t("admin.forms.responsesCount", { count: counts[item.id] ?? 0 })}</Text>
            <View style={styles.actions}>
              <Pressable onPress={() => router.push(`/admin/forms/${item.id}` as never)}>
                <Text style={[styles.action, { color: theme.primary }]}>{t("admin.forms.edit")}</Text>
              </Pressable>
              <Pressable onPress={() => router.push(`/admin/forms/${item.id}/responses` as never)}>
                <Text style={[styles.action, { color: theme.primary }]}>{t("admin.forms.viewResponses")}</Text>
              </Pressable>
            </View>
          </Card>
        )}
      />
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  list: { maxWidth: 900, width: "100%", alignSelf: "center" },
  hint: { color: colors.textSecondary, marginBottom: 8, lineHeight: 19 },
  input: { borderBottomWidth: 1, borderBottomColor: colors.border, paddingVertical: 10, fontSize: 15, marginBottom: 12, color: colors.textPrimary },
  row: { flexDirection: "row", gap: 10 },
  badges: { flexDirection: "row", gap: 6, flexWrap: "wrap", marginBottom: 6 },
  title: { fontSize: 16, fontWeight: "700", color: colors.textPrimary },
  meta: { color: colors.textSecondary, marginTop: 4 },
  actions: { flexDirection: "row", gap: 18, marginTop: 10 },
  action: { fontWeight: "700" },
});
