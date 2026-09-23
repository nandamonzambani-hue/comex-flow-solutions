import { ptBR, enUS, es, it, fr } from "date-fns/locale";
import { useTranslation } from "react-i18next";

const DATE_FNS_LOCALES = { "pt-BR": ptBR, en: enUS, es, it, fr };

/** Locale do date-fns correspondente ao idioma ativo do app (para format()). */
export function useDateLocale() {
  const { i18n } = useTranslation();
  return DATE_FNS_LOCALES[i18n.language as keyof typeof DATE_FNS_LOCALES] ?? ptBR;
}
