import { useTranslation } from "react-i18next";
import type { Translations } from "@/types/database";

/**
 * Lê um campo com possível tradução guardada em `translations` (jsonb):
 *   { "en": { "title": "...", "body": "..." }, "es": { ... } }
 * Cai para o valor original (idioma principal cadastrado pela paróquia)
 * quando não existe tradução para o idioma ativo.
 */
export function useLocalizedField() {
  const { i18n } = useTranslation();

  return function localize<T extends { translations?: Translations | null }>(
    item: T | null | undefined,
    field: Exclude<keyof T, "translations">,
  ): string {
    if (!item) return "";
    const translated = item.translations?.[i18n.language]?.[field as string];
    return (translated ?? (item[field] as unknown as string) ?? "") as string;
  };
}
