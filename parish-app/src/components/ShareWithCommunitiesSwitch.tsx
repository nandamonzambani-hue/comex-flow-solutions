import { StyleSheet, Switch, Text, View } from "react-native";
import { useTranslation } from "react-i18next";
import { useAdminParish } from "@/hooks/useParish";
import { colors } from "@/theme/colors";

/**
 * "Mostrar também nas comunidades" — só aparece quando o painel está
 * publicando na Matriz (conteúdo de comunidade nunca sobe para a Matriz).
 */
export function ShareWithCommunitiesSwitch({ value, onChange }: { value: boolean; onChange: (v: boolean) => void }) {
  const { t } = useTranslation();
  const { isMatrizTarget } = useAdminParish();
  if (!isMatrizTarget) return null;
  return (
    <View style={styles.row}>
      <View style={{ flex: 1 }}>
        <Text style={styles.label}>{t("hierarchy.shareSwitch")}</Text>
        <Text style={styles.hint}>{t("hierarchy.shareHint")}</Text>
      </View>
      <Switch value={value} onValueChange={onChange} />
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: "row", alignItems: "center", gap: 12, marginVertical: 6 },
  label: { color: colors.textPrimary, fontWeight: "600" },
  hint: { color: colors.textSecondary, fontSize: 12, marginTop: 2 },
});
