import { StyleSheet, Text, View } from "react-native";
import { Link } from "expo-router";
import { colors } from "@/theme/colors";

export default function NotFoundScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Página não encontrada</Text>
      <Link href="/(tabs)" style={styles.link}>
        Voltar para o início
      </Link>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: colors.background, gap: 12 },
  title: { fontSize: 18, fontWeight: "700", color: colors.textPrimary },
  link: { color: colors.primary, textDecorationLine: "underline" },
});
