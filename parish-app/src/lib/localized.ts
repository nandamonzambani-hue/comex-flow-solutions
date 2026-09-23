import { useTranslation } from "react-i18next";

/**
 * Lê um campo com possível tradução guardada em `translations` (jsonb):
 *   { "en": { "title": "...", "body": "..." }, "es": { ... } }
 * Cai para o valor original (idioma principal cadastrado pela paróquia)
 * quando não existe tradução para o idioma ativo.
 */
export function useLocalizedField() {
  const { i18n } = useTranslation();

  return function localize<T extends Record<string, unknown>>(item: T | null | undefined, field: keyof T): string {
    if (!item) return "";
    const translations = item.translations as Record<string, Record<string, string>> | undefined;
    const translated = translations?.[i18n.language]?.[field as string];
    return (translated ?? (item[field] as unknown as string) ?? "") as string;
  };
}
