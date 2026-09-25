import { useEffect } from "react";
import { StyleSheet, Text, View } from "react-native";
import { Link, router, useRootNavigationState } from "expo-router";
import { useTranslation } from "react-i18next";
import { colors } from "@/theme/colors";

// No web, hospedagens estáticas sem regra de rewrite (ex: um preview
// publicado como Artifact) podem entregar o app numa URL inicial que o
// roteador não reconhece (caminho diferente de "/"), o que faria o
// expo-router cair aqui direto na primeira carga, antes mesmo do usuário
// ver a tela de login. Assim que o JS do app está rodando, a navegação
// interna funciona normalmente — então redirecionamos automaticamente
// para "/" (que decide login vs. app) em vez de deixar a pessoa presa
// numa tela de "não encontrado" sem saber o que fazer.
export default function NotFoundScreen() {
  const { t } = useTranslation();
  const navigationState = useRootNavigationState();

  useEffect(() => {
    if (!navigationState?.key) return; // navegador ainda não montou; espera o próximo render
    router.replace("/");
  }, [navigationState?.key]);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{t("common.notFound")}</Text>
      <Link href="/" style={styles.link}>
        {t("common.backHome")}
      </Link>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: colors.background, gap: 12 },
  title: { fontSize: 18, fontWeight: "700", color: colors.textPrimary },
  link: { color: colors.primary, textDecorationLine: "underline" },
});
