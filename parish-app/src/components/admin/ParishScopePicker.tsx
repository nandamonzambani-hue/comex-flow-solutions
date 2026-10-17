import { useState } from "react";
import { Modal, Pressable, StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTranslation } from "react-i18next";
import { useParishContext, useTheme } from "@/context/ParishContext";
import { useAdminParish } from "@/hooks/useParish";
import { colors } from "@/theme/colors";

/**
 * Seletor "Publicar em": a equipe da Matriz escolhe se está gerenciando a
 * Matriz ou uma das comunidades. Para equipe de comunidade, só mostra o
 * nome (não há escolha).
 */
export function ParishScopePicker({ compact = false }: { compact?: boolean }) {
  const { t } = useTranslation();
  const theme = useTheme();
  const { managedParishes, setAdminParishId } = useParishContext();
  const { parish } = useAdminParish();
  const [open, setOpen] = useState(false);
  const canSwitch = managedParishes.length > 1;

  if (!parish) return null;

  return (
    <>
      <Pressable
        disabled={!canSwitch}
        onPress={() => setOpen(true)}
        style={[styles.trigger, compact && styles.triggerCompact, { borderColor: `${theme.primary}55` }]}
      >
        <Ionicons name={parish.kind === "matriz" ? "business" : "home"} size={14} color={theme.primary} />
        <View style={{ flexShrink: 1 }}>
          {!compact && <Text style={styles.caption}>{t("hierarchy.publishingIn")}</Text>}
          <Text style={[styles.name, compact && { maxWidth: 140 }]} numberOfLines={1}>
            {parish.name}
          </Text>
        </View>
        {canSwitch && <Ionicons name="chevron-down" size={14} color={colors.textSecondary} />}
      </Pressable>

      <Modal visible={open} transparent animationType="fade" onRequestClose={() => setOpen(false)}>
        <Pressable style={styles.backdrop} onPress={() => setOpen(false)}>
          <View style={styles.sheet}>
            <Text style={styles.sheetTitle}>{t("hierarchy.publishingIn")}</Text>
            {managedParishes.map((p) => (
              <Pressable
                key={p.id}
                style={[styles.row, p.id === parish.id && { backgroundColor: `${theme.primary}12` }]}
                onPress={() => {
                  setAdminParishId(p.id);
                  setOpen(false);
                }}
              >
                <Ionicons name={p.kind === "matriz" ? "business" : "home"} size={18} color={theme.primary} />
                <View style={{ flex: 1 }}>
                  <Text style={styles.rowName}>{p.name}</Text>
                  <Text style={styles.rowKind}>{t(`hierarchy.kind.${p.kind}`)}</Text>
                </View>
                {p.id === parish.id && <Ionicons name="checkmark" size={18} color={theme.primary} />}
              </Pressable>
            ))}
            <Text style={styles.hint}>{t("hierarchy.pickerHint")}</Text>
          </View>
        </Pressable>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  trigger: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 8,
    backgroundColor: colors.surface,
  },
  triggerCompact: { paddingVertical: 5, paddingHorizontal: 8, marginRight: 8 },
  caption: { fontSize: 10, color: colors.textSecondary, textTransform: "uppercase", fontWeight: "700" },
  name: { fontSize: 13, color: colors.textPrimary, fontWeight: "600" },
  backdrop: { flex: 1, backgroundColor: "#0006", justifyContent: "center", padding: 24 },
  sheet: { backgroundColor: colors.surface, borderRadius: 16, padding: 16, maxWidth: 420, width: "100%", alignSelf: "center" },
  sheetTitle: { fontSize: 16, fontWeight: "700", color: colors.textPrimary, marginBottom: 8 },
  row: { flexDirection: "row", alignItems: "center", gap: 12, padding: 12, borderRadius: 10 },
  rowName: { color: colors.textPrimary, fontWeight: "600" },
  rowKind: { color: colors.textSecondary, fontSize: 12 },
  hint: { color: colors.textSecondary, fontSize: 12, marginTop: 10 },
});
