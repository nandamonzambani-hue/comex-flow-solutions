import { useEffect, useState } from "react";
import { Alert, Pressable, ScrollView, StyleSheet, Switch, Text, TextInput, View } from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { useTranslation } from "react-i18next";
import { supabase } from "@/lib/supabase";
import { useTheme } from "@/context/ParishContext";
import { uuidv4 } from "@/lib/uuid";
import { ShareWithCommunitiesSwitch } from "@/components/ShareWithCommunitiesSwitch";
import { Button, Card, SectionTitle } from "@/components/ui";
import { colors } from "@/theme/colors";
import type { FormOption, FormQuestion, FormQuestionType, FormSection, ParishForm } from "@/types/database";

const QUESTION_TYPES: FormQuestionType[] = [
  "short_text",
  "long_text",
  "single_choice",
  "multiple_choice",
  "dropdown",
  "date",
  "number",
  "phone",
  "email",
  "image_upload",
];
const CHOICE_TYPES = new Set<FormQuestionType>(["single_choice", "multiple_choice", "dropdown"]);
const BRANCHING_TYPES = new Set<FormQuestionType>(["single_choice", "dropdown"]);

type DraftOption = Omit<FormOption, "question_id">;
type DraftQuestion = Omit<FormQuestion, "form_id" | "section_id" | "sort_order"> & { options: DraftOption[] };
type DraftSection = Omit<FormSection, "form_id" | "sort_order"> & { questions: DraftQuestion[] };

function newOption(label = ""): DraftOption {
  return { id: uuidv4(), label, image_url: null, sort_order: 0, is_correct: false, go_to_section_id: null, submit_form: false };
}

function newQuestion(): DraftQuestion {
  return {
    id: uuidv4(),
    question_type: "short_text",
    label: "",
    help_text: null,
    image_url: null,
    is_required: false,
    points: 0,
    options: [],
  };
}

function newSection(title: string): DraftSection {
  return { id: uuidv4(), title, description: null, image_url: null, next_section_id: null, submit_after: false, questions: [] };
}

/**
 * Construtor de formulários (Secretaria de Evangelização): seções com
 * imagem, perguntas de vários tipos, lista suspensa longa (colar em lote),
 * desvio "se responder X, ir para a seção Y", e modo quiz com gabarito e
 * pontos. Edita tudo localmente e grava de uma vez em "Salvar".
 */
export default function FormEditorScreen() {
  const { t } = useTranslation();
  const theme = useTheme();
  const { formId } = useLocalSearchParams<{ formId: string }>();
  const [form, setForm] = useState<ParishForm | null>(null);
  const [sections, setSections] = useState<DraftSection[]>([]);
  const [original, setOriginal] = useState<{ sections: string[]; questions: string[]; options: string[] }>({
    sections: [],
    questions: [],
    options: [],
  });
  const [bulkFor, setBulkFor] = useState<string | null>(null);
  const [bulkText, setBulkText] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    async function load() {
      const { data: formData } = await supabase.from("forms").select("*").eq("id", formId).single();
      setForm(formData as ParishForm);
      const [{ data: sectionData }, { data: questionData }] = await Promise.all([
        supabase.from("form_sections").select("*").eq("form_id", formId).order("sort_order"),
        supabase.from("form_questions").select("*").eq("form_id", formId).order("sort_order"),
      ]);
      const qs = (questionData as FormQuestion[]) ?? [];
      const { data: optionData } = qs.length
        ? await supabase
            .from("form_question_options")
            .select("*")
            .in(
              "question_id",
              qs.map((q) => q.id),
            )
            .order("sort_order")
        : { data: [] };
      const opts = (optionData as FormOption[]) ?? [];
      const draft: DraftSection[] = ((sectionData as FormSection[]) ?? []).map((s) => ({
        id: s.id,
        title: s.title,
        description: s.description,
        image_url: s.image_url,
        next_section_id: s.next_section_id,
        submit_after: s.submit_after,
        questions: qs
          .filter((q) => q.section_id === s.id)
          .map((q) => ({
            id: q.id,
            question_type: q.question_type,
            label: q.label,
            help_text: q.help_text,
            image_url: q.image_url,
            is_required: q.is_required,
            points: q.points,
            options: opts.filter((o) => o.question_id === q.id).map(({ question_id: _q, ...o }) => o),
          })),
      }));
      setSections(draft.length ? draft : [newSection(t("admin.forms.defaultSection"))]);
      setOriginal({ sections: draft.map((s) => s.id), questions: qs.map((q) => q.id), options: opts.map((o) => o.id) });
    }
    load();
  }, [formId, t]);

  // --- helpers de edição imutável -------------------------------------
  function patchSection(sectionId: string, patch: Partial<DraftSection>) {
    setSections((prev) => prev.map((s) => (s.id === sectionId ? { ...s, ...patch } : s)));
  }
  function patchQuestion(sectionId: string, questionId: string, patch: Partial<DraftQuestion>) {
    setSections((prev) =>
      prev.map((s) =>
        s.id !== sectionId ? s : { ...s, questions: s.questions.map((q) => (q.id === questionId ? { ...q, ...patch } : q)) },
      ),
    );
  }
  function patchOption(sectionId: string, questionId: string, optionId: string, patch: Partial<DraftOption>) {
    setSections((prev) =>
      prev.map((s) =>
        s.id !== sectionId
          ? s
          : {
              ...s,
              questions: s.questions.map((q) =>
                q.id !== questionId ? q : { ...q, options: q.options.map((o) => (o.id === optionId ? { ...o, ...patch } : o)) },
              ),
            },
      ),
    );
  }
  function moveSection(index: number, dir: -1 | 1) {
    setSections((prev) => {
      const next = [...prev];
      const target = index + dir;
      if (target < 0 || target >= next.length) return prev;
      [next[index], next[target]] = [next[target], next[index]];
      return next;
    });
  }
  function moveQuestion(sectionId: string, index: number, dir: -1 | 1) {
    setSections((prev) =>
      prev.map((s) => {
        if (s.id !== sectionId) return s;
        const qs = [...s.questions];
        const target = index + dir;
        if (target < 0 || target >= qs.length) return s;
        [qs[index], qs[target]] = [qs[target], qs[index]];
        return { ...s, questions: qs };
      }),
    );
  }
  function applyBulk(sectionId: string, questionId: string) {
    const labels = bulkText
      .split("\n")
      .map((l) => l.trim())
      .filter(Boolean);
    setSections((prev) =>
      prev.map((s) =>
        s.id !== sectionId
          ? s
          : {
              ...s,
              questions: s.questions.map((q) =>
                q.id !== questionId ? q : { ...q, options: [...q.options, ...labels.map((l) => newOption(l))] },
              ),
            },
      ),
    );
    setBulkFor(null);
    setBulkText("");
  }

  async function save() {
    if (!form) return;
    setSaving(true);
    try {
      const { error: formErr } = await supabase
        .from("forms")
        .update({
          title: form.title,
          description: form.description,
          cover_image_url: form.cover_image_url,
          is_quiz: form.is_quiz,
          is_published: form.is_published,
          show_score_to_respondent: form.show_score_to_respondent,
          allow_multiple_responses: form.allow_multiple_responses,
          share_with_communities: form.share_with_communities,
          confirmation_message: form.confirmation_message,
        })
        .eq("id", form.id);
      if (formErr) throw formErr;

      const sectionIds = sections.map((s) => s.id);
      const questionRows = sections.flatMap((s) =>
        s.questions.map((q, qi) => ({
          id: q.id,
          form_id: form.id,
          section_id: s.id,
          question_type: q.question_type,
          label: q.label.trim() || t("admin.forms.untitledQuestion"),
          help_text: q.help_text || null,
          image_url: q.image_url || null,
          is_required: q.is_required,
          sort_order: qi + 1,
          points: form.is_quiz ? q.points : 0,
        })),
      );
      const optionRows = sections.flatMap((s) =>
        s.questions
          .filter((q) => CHOICE_TYPES.has(q.question_type))
          .flatMap((q) =>
            q.options
              .filter((o) => o.label.trim())
              .map((o, oi) => ({
                id: o.id,
                question_id: q.id,
                label: o.label.trim(),
                image_url: o.image_url || null,
                sort_order: oi + 1,
                is_correct: form.is_quiz ? o.is_correct : false,
                go_to_section_id: BRANCHING_TYPES.has(q.question_type) && sectionIds.includes(o.go_to_section_id ?? "") ? o.go_to_section_id : null,
                submit_form: BRANCHING_TYPES.has(q.question_type) ? o.submit_form : false,
              })),
          ),
      );

      // 1) seções sem os desvios (as referências entre seções vêm no passo 2)
      const { error: secErr } = await supabase.from("form_sections").upsert(
        sections.map((s, si) => ({
          id: s.id,
          form_id: form.id,
          title: s.title.trim() || t("admin.forms.defaultSection"),
          description: s.description || null,
          image_url: s.image_url || null,
          sort_order: si + 1,
          next_section_id: null,
          submit_after: s.submit_after,
        })),
      );
      if (secErr) throw secErr;
      for (const s of sections.filter((x) => x.next_section_id && sectionIds.includes(x.next_section_id))) {
        const { error } = await supabase.from("form_sections").update({ next_section_id: s.next_section_id }).eq("id", s.id);
        if (error) throw error;
      }

      if (questionRows.length) {
        const { error } = await supabase.from("form_questions").upsert(questionRows);
        if (error) throw error;
      }
      if (optionRows.length) {
        const { error } = await supabase.from("form_question_options").upsert(optionRows);
        if (error) throw error;
      }

      // 2) remove o que foi apagado no editor
      const keptOptions = new Set(optionRows.map((o) => o.id));
      const keptQuestions = new Set(questionRows.map((q) => q.id));
      const removedOptions = original.options.filter((id) => !keptOptions.has(id));
      const removedQuestions = original.questions.filter((id) => !keptQuestions.has(id));
      const removedSections = original.sections.filter((id) => !sectionIds.includes(id));
      if (removedOptions.length) await supabase.from("form_question_options").delete().in("id", removedOptions);
      if (removedQuestions.length) await supabase.from("form_questions").delete().in("id", removedQuestions);
      if (removedSections.length) await supabase.from("form_sections").delete().in("id", removedSections);

      setOriginal({ sections: sectionIds, questions: [...keptQuestions], options: [...keptOptions] });
      Alert.alert(t("admin.forms.savedTitle"), t("admin.forms.savedBody"));
    } catch (err) {
      Alert.alert(t("common.error"), err instanceof Error ? err.message : String(err));
    } finally {
      setSaving(false);
    }
  }

  if (!form) return null;

  const sectionChoices = (excludeId: string) => sections.filter((s) => s.id !== excludeId);

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
      <Card>
        <Text style={styles.label}>{t("admin.forms.formTitle")}</Text>
        <TextInput style={styles.input} value={form.title} onChangeText={(v) => setForm({ ...form, title: v })} />
        <Text style={styles.label}>{t("admin.forms.description")}</Text>
        <TextInput
          style={[styles.input, styles.multiline]}
          value={form.description ?? ""}
          onChangeText={(v) => setForm({ ...form, description: v })}
          multiline
        />
        <Text style={styles.label}>{t("admin.forms.coverImage")}</Text>
        <TextInput
          style={styles.input}
          value={form.cover_image_url ?? ""}
          onChangeText={(v) => setForm({ ...form, cover_image_url: v || null })}
          placeholder="https://..."
          autoCapitalize="none"
        />
        <Text style={styles.label}>{t("admin.forms.confirmation")}</Text>
        <TextInput
          style={styles.input}
          value={form.confirmation_message ?? ""}
          onChangeText={(v) => setForm({ ...form, confirmation_message: v || null })}
        />
        <Toggle label={t("admin.forms.publishedToggle")} value={form.is_published} onChange={(v) => setForm({ ...form, is_published: v })} />
        <Toggle label={t("admin.forms.quizToggle")} value={form.is_quiz} onChange={(v) => setForm({ ...form, is_quiz: v })} />
        {form.is_quiz && (
          <Toggle
            label={t("admin.forms.showScoreToggle")}
            value={form.show_score_to_respondent}
            onChange={(v) => setForm({ ...form, show_score_to_respondent: v })}
          />
        )}
        <Toggle
          label={t("admin.forms.multipleToggle")}
          value={form.allow_multiple_responses}
          onChange={(v) => setForm({ ...form, allow_multiple_responses: v })}
        />
        <ShareWithCommunitiesSwitch value={form.share_with_communities} onChange={(v) => setForm({ ...form, share_with_communities: v })} />
      </Card>

      {sections.map((section, si) => (
        <View key={section.id}>
          <SectionTitle>{t("admin.forms.sectionN", { n: si + 1 })}</SectionTitle>
          <Card style={{ borderColor: `${theme.primary}55` }}>
            <View style={styles.rowBetween}>
              <TextInput
                style={[styles.input, styles.sectionTitleInput]}
                value={section.title}
                onChangeText={(v) => patchSection(section.id, { title: v })}
                placeholder={t("admin.forms.sectionTitle")}
              />
              <View style={styles.inlineActions}>
                <IconBtn label="↑" onPress={() => moveSection(si, -1)} />
                <IconBtn label="↓" onPress={() => moveSection(si, 1)} />
                {sections.length > 1 && (
                  <IconBtn label="✕" danger onPress={() => setSections((prev) => prev.filter((s) => s.id !== section.id))} />
                )}
              </View>
            </View>
            <TextInput
              style={styles.input}
              value={section.description ?? ""}
              onChangeText={(v) => patchSection(section.id, { description: v || null })}
              placeholder={t("admin.forms.sectionDescription")}
              multiline
            />
            <TextInput
              style={styles.input}
              value={section.image_url ?? ""}
              onChangeText={(v) => patchSection(section.id, { image_url: v || null })}
              placeholder={t("admin.forms.imageUrl")}
              autoCapitalize="none"
            />

            {section.questions.map((q, qi) => (
              <View key={q.id} style={styles.question}>
                <View style={styles.rowBetween}>
                  <Text style={styles.questionNumber}>{t("admin.forms.questionN", { n: qi + 1 })}</Text>
                  <View style={styles.inlineActions}>
                    <IconBtn label="↑" onPress={() => moveQuestion(section.id, qi, -1)} />
                    <IconBtn label="↓" onPress={() => moveQuestion(section.id, qi, 1)} />
                    <IconBtn
                      label="✕"
                      danger
                      onPress={() => patchSection(section.id, { questions: section.questions.filter((x) => x.id !== q.id) })}
                    />
                  </View>
                </View>
                <TextInput
                  style={styles.input}
                  value={q.label}
                  onChangeText={(v) => patchQuestion(section.id, q.id, { label: v })}
                  placeholder={t("admin.forms.questionLabel")}
                />
                <View style={styles.chips}>
                  {QUESTION_TYPES.map((type) => (
                    <Pressable
                      key={type}
                      onPress={() =>
                        patchQuestion(section.id, q.id, {
                          question_type: type,
                          options: CHOICE_TYPES.has(type) && q.options.length === 0 ? [newOption(), newOption()] : q.options,
                        })
                      }
                      style={[styles.chip, q.question_type === type && { backgroundColor: theme.primary, borderColor: theme.primary }]}
                    >
                      <Text style={[styles.chipText, q.question_type === type && { color: "#fff" }]}>
                        {t(`admin.forms.types.${type}`)}
                      </Text>
                    </Pressable>
                  ))}
                </View>
                <TextInput
                  style={styles.input}
                  value={q.help_text ?? ""}
                  onChangeText={(v) => patchQuestion(section.id, q.id, { help_text: v || null })}
                  placeholder={t("admin.forms.helpText")}
                />
                <TextInput
                  style={styles.input}
                  value={q.image_url ?? ""}
                  onChangeText={(v) => patchQuestion(section.id, q.id, { image_url: v || null })}
                  placeholder={t("admin.forms.imageUrl")}
                  autoCapitalize="none"
                />
                <Toggle label={t("admin.forms.required")} value={q.is_required} onChange={(v) => patchQuestion(section.id, q.id, { is_required: v })} />
                {form.is_quiz && CHOICE_TYPES.has(q.question_type) && (
                  <View style={styles.pointsRow}>
                    <Text style={styles.toggleLabel}>{t("admin.forms.points")}</Text>
                    <TextInput
                      style={[styles.input, styles.pointsInput]}
                      keyboardType="number-pad"
                      value={String(q.points)}
                      onChangeText={(v) => patchQuestion(section.id, q.id, { points: Number(v.replace(/\D/g, "")) || 0 })}
                    />
                  </View>
                )}

                {CHOICE_TYPES.has(q.question_type) && (
                  <View style={styles.options}>
                    <Text style={styles.label}>
                      {t("admin.forms.options", { count: q.options.length })}
                      {q.question_type === "dropdown" ? ` · ${t("admin.forms.dropdownHint")}` : ""}
                    </Text>
                    {q.options.map((o) => (
                      <View key={o.id} style={styles.option}>
                        <View style={styles.optionRow}>
                          {form.is_quiz && (
                            <Pressable onPress={() => patchOption(section.id, q.id, o.id, { is_correct: !o.is_correct })}>
                              <Text style={[styles.correct, o.is_correct && { color: colors.success }]}>{o.is_correct ? "✔" : "○"}</Text>
                            </Pressable>
                          )}
                          <TextInput
                            style={[styles.input, { flex: 1, marginBottom: 0 }]}
                            value={o.label}
                            onChangeText={(v) => patchOption(section.id, q.id, o.id, { label: v })}
                            placeholder={t("admin.forms.optionLabel")}
                          />
                          <IconBtn
                            label="✕"
                            danger
                            onPress={() => patchQuestion(section.id, q.id, { options: q.options.filter((x) => x.id !== o.id) })}
                          />
                        </View>
                        {BRANCHING_TYPES.has(q.question_type) && (
                          <View style={styles.branchRow}>
                            <Text style={styles.branchLabel}>{t("admin.forms.ifChosen")}</Text>
                            <BranchChip
                              label={t("admin.forms.goNext")}
                              active={!o.go_to_section_id && !o.submit_form}
                              onPress={() => patchOption(section.id, q.id, o.id, { go_to_section_id: null, submit_form: false })}
                            />
                            {sectionChoices(section.id).map((target) => (
                              <BranchChip
                                key={target.id}
                                label={`→ ${sections.indexOf(target) + 1}. ${target.title}`}
                                active={o.go_to_section_id === target.id}
                                onPress={() => patchOption(section.id, q.id, o.id, { go_to_section_id: target.id, submit_form: false })}
                              />
                            ))}
                            <BranchChip
                              label={t("admin.forms.goSubmit")}
                              active={o.submit_form}
                              onPress={() => patchOption(section.id, q.id, o.id, { go_to_section_id: null, submit_form: true })}
                            />
                          </View>
                        )}
                      </View>
                    ))}
                    <View style={styles.inlineActions}>
                      <Pressable onPress={() => patchQuestion(section.id, q.id, { options: [...q.options, newOption()] })}>
                        <Text style={[styles.link, { color: theme.primary }]}>+ {t("admin.forms.addOption")}</Text>
                      </Pressable>
                      <Pressable onPress={() => setBulkFor(bulkFor === q.id ? null : q.id)}>
                        <Text style={[styles.link, { color: theme.primary }]}>{t("admin.forms.bulkPaste")}</Text>
                      </Pressable>
                    </View>
                    {bulkFor === q.id && (
                      <View>
                        <TextInput
                          style={[styles.input, styles.multiline]}
                          value={bulkText}
                          onChangeText={setBulkText}
                          multiline
                          placeholder={t("admin.forms.bulkPlaceholder")}
                        />
                        <Button title={t("admin.forms.bulkApply")} variant="outline" onPress={() => applyBulk(section.id, q.id)} />
                      </View>
                    )}
                  </View>
                )}
              </View>
            ))}

            <Pressable onPress={() => patchSection(section.id, { questions: [...section.questions, newQuestion()] })}>
              <Text style={[styles.link, { color: theme.primary, marginTop: 8 }]}>+ {t("admin.forms.addQuestion")}</Text>
            </Pressable>

            <View style={styles.afterSection}>
              <Text style={styles.label}>{t("admin.forms.afterSection")}</Text>
              <View style={styles.branchRow}>
                <BranchChip
                  label={t("admin.forms.goNext")}
                  active={!section.next_section_id && !section.submit_after}
                  onPress={() => patchSection(section.id, { next_section_id: null, submit_after: false })}
                />
                {sectionChoices(section.id).map((target) => (
                  <BranchChip
                    key={target.id}
                    label={`→ ${sections.indexOf(target) + 1}. ${target.title}`}
                    active={section.next_section_id === target.id}
                    onPress={() => patchSection(section.id, { next_section_id: target.id, submit_after: false })}
                  />
                ))}
                <BranchChip
                  label={t("admin.forms.goSubmit")}
                  active={section.submit_after}
                  onPress={() => patchSection(section.id, { next_section_id: null, submit_after: true })}
                />
              </View>
            </View>
          </Card>
        </View>
      ))}

      <Pressable
        style={[styles.addSection, { borderColor: theme.primary }]}
        onPress={() => setSections((prev) => [...prev, newSection(t("admin.forms.newSectionTitle", { n: prev.length + 1 }))])}
      >
        <Text style={[styles.link, { color: theme.primary }]}>+ {t("admin.forms.addSection")}</Text>
      </Pressable>

      <View style={styles.footer}>
        <View style={{ flex: 1 }}>
          <Button title={t("common.save")} onPress={save} loading={saving} />
        </View>
        <View style={{ flex: 1 }}>
          <Button title={t("admin.forms.viewResponses")} variant="outline" onPress={() => router.push(`/admin/forms/${form.id}/responses` as never)} />
        </View>
      </View>
    </ScrollView>
  );
}

function Toggle({ label, value, onChange }: { label: string; value: boolean; onChange: (v: boolean) => void }) {
  return (
    <View style={styles.toggleRow}>
      <Text style={styles.toggleLabel}>{label}</Text>
      <Switch value={value} onValueChange={onChange} />
    </View>
  );
}

function IconBtn({ label, onPress, danger }: { label: string; onPress: () => void; danger?: boolean }) {
  return (
    <Pressable onPress={onPress} hitSlop={8} style={styles.iconBtn}>
      <Text style={{ color: danger ? colors.danger : colors.textSecondary, fontWeight: "700" }}>{label}</Text>
    </Pressable>
  );
}

function BranchChip({ label, active, onPress }: { label: string; active: boolean; onPress: () => void }) {
  const theme = useTheme();
  return (
    <Pressable onPress={onPress} style={[styles.branchChip, active && { backgroundColor: `${theme.primary}18`, borderColor: theme.primary }]}>
      <Text style={[styles.branchChipText, active && { color: theme.primary, fontWeight: "700" }]} numberOfLines={1}>
        {label}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background },
  container: { padding: 16, paddingBottom: 48, maxWidth: 900, width: "100%", alignSelf: "center" },
  label: { fontSize: 12, fontWeight: "700", color: colors.textSecondary, textTransform: "uppercase", marginTop: 8 },
  input: {
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    paddingVertical: 8,
    fontSize: 15,
    marginBottom: 8,
    color: colors.textPrimary,
  },
  multiline: { minHeight: 60, textAlignVertical: "top" },
  sectionTitleInput: { flex: 1, fontSize: 17, fontWeight: "700" },
  rowBetween: { flexDirection: "row", alignItems: "center", gap: 8 },
  inlineActions: { flexDirection: "row", gap: 14, alignItems: "center" },
  iconBtn: { paddingHorizontal: 4 },
  question: { borderTopWidth: 1, borderTopColor: colors.border, marginTop: 12, paddingTop: 10 },
  questionNumber: { flex: 1, fontWeight: "700", color: colors.textPrimary },
  chips: { flexDirection: "row", flexWrap: "wrap", gap: 6, marginBottom: 8 },
  chip: { borderWidth: 1, borderColor: colors.border, borderRadius: 14, paddingHorizontal: 8, paddingVertical: 4 },
  chipText: { fontSize: 12, color: colors.textPrimary },
  toggleRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginVertical: 4, gap: 12 },
  toggleLabel: { flex: 1, color: colors.textPrimary },
  pointsRow: { flexDirection: "row", alignItems: "center", gap: 12 },
  pointsInput: { width: 70, textAlign: "center" },
  options: { backgroundColor: colors.background, borderRadius: 10, padding: 10, marginTop: 6 },
  option: { marginBottom: 6 },
  optionRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  correct: { fontSize: 18, color: colors.textSecondary, width: 22, textAlign: "center" },
  branchRow: { flexDirection: "row", flexWrap: "wrap", gap: 6, alignItems: "center", marginTop: 4 },
  branchLabel: { fontSize: 12, color: colors.textSecondary },
  branchChip: { borderWidth: 1, borderColor: colors.border, borderRadius: 12, paddingHorizontal: 8, paddingVertical: 3, maxWidth: 220 },
  branchChipText: { fontSize: 11, color: colors.textSecondary },
  link: { fontWeight: "700", marginVertical: 6 },
  afterSection: { borderTopWidth: 1, borderTopColor: colors.border, marginTop: 12, paddingTop: 4 },
  addSection: { borderWidth: 1, borderStyle: "dashed", borderRadius: 12, padding: 14, alignItems: "center", marginTop: 8 },
  footer: { flexDirection: "row", gap: 10, marginTop: 16 },
});
