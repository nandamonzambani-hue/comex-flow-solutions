import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Localization from "expo-localization";
import i18n from "i18next";
import { initReactI18next } from "react-i18next";

import pt from "./locales/pt-BR.json";
import en from "./locales/en.json";
import es from "./locales/es.json";
import it from "./locales/it.json";
import fr from "./locales/fr.json";

export const SUPPORTED_LOCALES = [
  { code: "pt-BR", label: "Português", flag: "🇧🇷" },
  { code: "en", label: "English", flag: "🇺🇸" },
  { code: "es", label: "Español", flag: "🇪🇸" },
  { code: "it", label: "Italiano", flag: "🇮🇹" },
  { code: "fr", label: "Français", flag: "🇫🇷" },
] as const;

export type LocaleCode = (typeof SUPPORTED_LOCALES)[number]["code"];

const STORAGE_KEY = "@parish_app/locale";
const USER_SET_KEY = "@parish_app/locale_user_set";

const resources = {
  "pt-BR": { translation: pt },
  en: { translation: en },
  es: { translation: es },
  it: { translation: it },
  fr: { translation: fr },
};

function resolveDeviceLocale(): LocaleCode {
  const deviceTags = Localization.getLocales().map((l) => l.languageTag);
  for (const tag of deviceTags) {
    const exact = SUPPORTED_LOCALES.find((l) => l.code.toLowerCase() === tag.toLowerCase());
    if (exact) return exact.code;
    const languageOnly = tag.split("-")[0];
    const partial = SUPPORTED_LOCALES.find((l) => l.code.split("-")[0] === languageOnly);
    if (partial) return partial.code;
  }
  return "pt-BR";
}

/** Chama uma vez na inicialização do app (ver app/_layout.tsx). */
export async function setupI18n() {
  const saved = await AsyncStorage.getItem(STORAGE_KEY);
  const initialLocale = (saved as LocaleCode | null) ?? resolveDeviceLocale();

  await i18n.use(initReactI18next).init({
    resources,
    lng: initialLocale,
    fallbackLng: "pt-BR",
    interpolation: { escapeValue: false },
    compatibilityJSON: "v4",
  });

  return i18n;
}

/** Troca o idioma manualmente (ex: tela de configurações) e fixa a escolha. */
export async function changeLocale(locale: LocaleCode) {
  await AsyncStorage.setItem(STORAGE_KEY, locale);
  await AsyncStorage.setItem(USER_SET_KEY, "true");
  await i18n.changeLanguage(locale);
}

/**
 * Sincroniza o idioma a partir do perfil salvo no servidor (ex: ao logar
 * num novo aparelho). Só aplica se o usuário nunca escolheu manualmente
 * neste aparelho — assim uma troca manual local nunca é sobrescrita.
 */
export async function syncLocaleFromProfile(locale: LocaleCode | null | undefined) {
  if (!locale) return;
  const userSet = await AsyncStorage.getItem(USER_SET_KEY);
  if (userSet === "true") return;
  if (!SUPPORTED_LOCALES.some((l) => l.code === locale)) return;
  await AsyncStorage.setItem(STORAGE_KEY, locale);
  await i18n.changeLanguage(locale);
}

export default i18n;
