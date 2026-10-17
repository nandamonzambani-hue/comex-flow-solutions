import { useMemo, useState } from "react";
import { FlatList, Modal, Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import { Image } from "expo-image";
import * as ImagePicker from "expo-image-picker";
import { useTranslation } from "react-i18next";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/context/AuthContext";
import { useTheme } from "@/context/ParishContext";
import { colors } from "@/theme/colors";
import type { DraftAnswer } from "@/lib/formFlow";
import type { FormOptionPublic, FormQuestion } from "@/types/database";

interface Props {
  question: FormQuestion;
  options: FormOptionPublic[];
  value: DraftAnswer | undefined;
  onChange: (value: DraftAnswer) => void;
  showError?: boolean;
}

/** Renderiza uma pergunta de formulário conforme o tipo (texto, escolha, lista longa, data, upload...). */
export function FormQuestionInput({ question, options, value, onChange, showError }: Props) {
  const { t } = useTranslation();
  const theme = useTheme();
  const selected = value?.optionIds ?? [];

  function toggle(optionId: string) {
    if (question.question_type === "multiple_choice") {
      const next = selected.includes(optionId) ? selected.filter((id) => id !== optionId) : [...selected, optionId];
      onChange({ ...value, optionIds: next });
    } else {
      onChange({ ...value, optionIds: [optionId] });
    }
  }

  let input: React.ReactNode;
  switch (question.question_type) {
    case "single_choice":
    case "multiple_choice":
      input = options.map((opt) => {
        const isSelected = selected.includes(opt.id);
        return (
          <Pressable
            key={opt.id}
            onPress={() => toggle(opt.id)}
            style={[styles.option, isSelected && { backgroundColor: theme.primary, borderColor: theme.primary }]}
          >
            {opt.image_url && <Image source={{ uri: opt.image_url }} style={styles.optionImage} contentFit="cover" />}
            <Text style={[styles.optionText, isSelected && styles.optionTextSelected]}>
              {question.question_type === "multiple_choice" ? (isSelected ? "☑ " : "☐ ") : ""}
              {opt.label}
            </Text>
          </Pressable>
        );
      });
      break;
    case "dropdown":
      input = <SearchableSelect options={options} value={selected[0]} onSelect={(id) => onChange({ ...value, optionIds: [id] })} />;
      break;
    case "image_upload":
    case "file_upload":
      input = <UploadField value={value?.fileUrl} onUploaded={(url) => onChange({ ...value, fileUrl: url })} />;
      break;
    default:
      input = (
        <TextInput
          style={[styles.input, question.question_type === "long_text" && styles.multiline]}
          value={value?.text ?? ""}
          onChangeText={(text) => onChange({ ...value, text })}
          multiline={question.question_type === "long_text"}
          placeholder={placeholderFor(question.question_type, t)}
          keyboardType={
            question.question_type === "number"
              ? "numeric"
              : question.question_type === "phone"
                ? "phone-pad"
                : question.question_type === "email"
                  ? "email-address"
                  : "default"
          }
          autoCapitalize={question.question_type === "email" ? "none" : "sentences"}
        />
      );
  }

  return (
    <View style={styles.wrapper}>
      <Text style={styles.label}>
        {question.label}
        {question.is_required && <Text style={{ color: colors.danger }}> *</Text>}
      </Text>
      {question.help_text && <Text style={styles.help}>{question.help_text}</Text>}
      {question.image_url && <Image source={{ uri: question.image_url }} style={styles.questionImage} contentFit="cover" />}
      {input}
      {showError && <Text style={styles.error}>{t("forms.required")}</Text>}
    </View>
  );
}

function placeholderFor(type: FormQuestion["question_type"], t: (key: string) => string) {
  if (type === "date") return t("forms.datePlaceholder");
  if (type === "phone") return "(11) 90000-0000";
  if (type === "email") return "email@exemplo.com";
  return t("forms.answerPlaceholder");
}

/** Lista suspensa longa: abre um modal com campo de busca (ex.: lista de cidades). */
function SearchableSelect({
  options,
  value,
  onSelect,
}: {
  options: FormOptionPublic[];
  value: string | undefined;
  onSelect: (id: string) => void;
}) {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const filtered = useMemo(() => {
    const q = query
      .trim()
      .toLowerCase()
      .normalize("NFD")
      .replace(/[̀-ͯ]/g, "");
    if (!q) return options;
    return options.filter((o) =>
      o.label
        .toLowerCase()
        .normalize("NFD")
        .replace(/[̀-ͯ]/g, "")
        .includes(q),
    );
  }, [options, query]);
  const current = options.find((o) => o.id === value);

  return (
    <>
      <Pressable style={styles.input} onPress={() => setOpen(true)}>
        <Text style={{ color: current ? colors.textPrimary : colors.textSecondary }}>
          {current?.label ?? t("forms.selectPlaceholder", { count: options.length })}
        </Text>
      </Pressable>
      <Modal visible={open} animationType="slide" onRequestClose={() => setOpen(false)}>
        <View style={styles.modal}>
          <TextInput style={styles.search} placeholder={t("forms.search")} value={query} onChangeText={setQuery} autoFocus />
          <FlatList
            data={filtered}
            keyExtractor={(item) => item.id}
            keyboardShouldPersistTaps="handled"
            renderItem={({ item }) => (
              <Pressable
                style={styles.modalItem}
                onPress={() => {
                  onSelect(item.id);
                  setOpen(false);
                  setQuery("");
                }}
              >
                <Text style={[styles.modalItemText, item.id === value && { fontWeight: "700" }]}>{item.label}</Text>
              </Pressable>
            )}
          />
          <Pressable style={styles.modalClose} onPress={() => setOpen(false)}>
            <Text style={styles.modalCloseText}>{t("common.cancel")}</Text>
          </Pressable>
        </View>
      </Modal>
    </>
  );
}

function UploadField({ value, onUploaded }: { value: string | undefined; onUploaded: (path: string) => void }) {
  const { t } = useTranslation();
  const theme = useTheme();
  const { profile } = useAuth();
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function pick() {
    if (!profile) return;
    const result = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ["images"], quality: 0.7 });
    if (result.canceled || !result.assets[0]) return;
    const asset = result.assets[0];
    setUploading(true);
    setError(null);
    try {
      const ext = (asset.fileName?.split(".").pop() ?? "jpg").toLowerCase();
      const path = `${profile.parish_id}/${profile.id}/${Date.now()}.${ext}`;
      const body = await (await fetch(asset.uri)).arrayBuffer();
      const { error: uploadError } = await supabase.storage
        .from("form-uploads")
        .upload(path, body, { contentType: asset.mimeType ?? "image/jpeg" });
      if (uploadError) throw uploadError;
      setPreview(asset.uri);
      onUploaded(path);
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setUploading(false);
    }
  }

  return (
    <View>
      {preview && <Image source={{ uri: preview }} style={styles.questionImage} contentFit="cover" />}
      <Pressable style={[styles.uploadButton, { borderColor: theme.primary }]} onPress={pick} disabled={uploading}>
        <Text style={{ color: theme.primary, fontWeight: "600" }}>
          {uploading ? t("forms.uploading") : value ? t("forms.replaceImage") : t("forms.pickImage")}
        </Text>
      </Pressable>
      {error && <Text style={styles.error}>{error}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: { marginBottom: 18 },
  label: { fontWeight: "700", color: colors.textPrimary, fontSize: 15, marginBottom: 4 },
  help: { color: colors.textSecondary, fontSize: 13, marginBottom: 8 },
  questionImage: { width: "100%", height: 160, borderRadius: 10, marginBottom: 10 },
  input: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 15,
    color: colors.textPrimary,
    backgroundColor: colors.surface,
  },
  multiline: { minHeight: 90, textAlignVertical: "top" },
  option: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    marginBottom: 8,
    backgroundColor: colors.surface,
  },
  optionImage: { width: "100%", height: 110, borderRadius: 8, marginBottom: 8 },
  optionText: { color: colors.textPrimary },
  optionTextSelected: { color: "#fff", fontWeight: "600" },
  error: { color: colors.danger, fontSize: 12, marginTop: 4 },
  modal: { flex: 1, paddingTop: 56, paddingHorizontal: 16, backgroundColor: colors.background },
  search: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 10,
    padding: 12,
    fontSize: 16,
    marginBottom: 8,
    backgroundColor: colors.surface,
  },
  modalItem: { paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: colors.border },
  modalItemText: { fontSize: 16, color: colors.textPrimary },
  modalClose: { paddingVertical: 18, alignItems: "center" },
  modalCloseText: { color: colors.danger, fontWeight: "600" },
  uploadButton: { borderWidth: 1, borderStyle: "dashed", borderRadius: 10, padding: 16, alignItems: "center" },
});
