import { useState } from "react";
import { Modal, Pressable, StyleSheet, Text, View } from "react-native";
import { useTranslation } from "react-i18next";
import { Ionicons } from "@expo/vector-icons";
import { SUPPORTED_LOCALES, changeLocale, type LocaleCode } from "@/i18n";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/lib/supabase";
import { colors } from "@/theme/colors";

/**
 * Seletor de idioma do app. `variant="compact"` mostra só a bandeira/código
 * (usado na tela de login, sobre fundo escuro); o padrão mostra um botão
 * completo com o nome do idioma (usado no Perfil/Configurações).
 */
export function LanguagePicker({ variant = "full" }: { variant?: "full" | "compact" }) {
  const { i18n, t } = useTranslation();
  const { profile } = useAuth();
  const [open, setOpen] = useState(false);

  const current = SUPPORTED_LOCALES.find((l) => l.code === i18n.language) ?? SUPPORTED_LOCALES[0];

  async function handleSelect(code: LocaleCode) {
    await changeLocale(code);
    if (profile) {
      // best-effort: guarda a preferência no perfil para sincronizar em outros aparelhos
      supabase.from("profiles").update({ preferred_locale: code }).eq("id", profile.id);
    }
    setOpen(false);
  }

  return (
    <>
      <Pressable
        onPress={() => setOpen(true)}
        style={variant === "compact" ? styles.compactButton : styles.fullButton}
      >
        <Text style={variant === "compact" ? styles.compactText : styles.fullText}>
          {current.flag} {variant === "compact" ? current.code.split("-")[0].toUpperCase() : current.label}
        </Text>
        <Ionicons name="chevron-down" size={14} color={variant === "compact" ? "#fff" : colors.textSecondary} />
      </Pressable>

      <Modal visible={open} transparent animationType="fade" onRequestClose={() => setOpen(false)}>
        <Pressable style={styles.backdrop} onPress={() => setOpen(false)}>
          <View style={styles.sheet}>
            <Text style={styles.sheetTitle}>{t("profile.language")}</Text>
            {SUPPORTED_LOCALES.map((locale) => (
              <Pressable
                key={locale.code}
                style={[styles.option, locale.code === i18n.language && styles.optionActive]}
                onPress={() => handleSelect(locale.code)}
              >
                <Text style={styles.optionFlag}>{locale.flag}</Text>
                <Text style={styles.optionLabel}>{locale.label}</Text>
                {locale.code === i18n.language && <Ionicons name="checkmark" size={18} color={colors.primary} />}
              </Pressable>
            ))}
          </View>
        </Pressable>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  compactButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "rgba(255,255,255,0.15)",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
  },
  compactText: { color: "#fff", fontWeight: "700", fontSize: 13 },
  fullButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 8,
    paddingVertical: 12,
  },
  fullText: { color: colors.textPrimary, fontWeight: "600", fontSize: 15 },
  backdrop: { flex: 1, backgroundColor: "rgba(0,0,0,0.4)", justifyContent: "flex-end" },
  sheet: { backgroundColor: colors.surface, borderTopLeftRadius: 20, borderTopRightRadius: 20, padding: 20, paddingBottom: 36 },
  sheetTitle: { fontSize: 16, fontWeight: "700", color: colors.textPrimary, marginBottom: 12 },
  option: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingVertical: 12,
    borderRadius: 10,
    paddingHorizontal: 10,
  },
  optionActive: { backgroundColor: `${colors.primary}14` },
  optionFlag: { fontSize: 20 },
  optionLabel: { flex: 1, fontSize: 15, color: colors.textPrimary, fontWeight: "500" },
});
