/** Áreas de pedido de oração / categorias de testemunho (chaves de i18n em care.areas.*). */
export const CARE_AREAS = [
  "familia",
  "saude",
  "trabalho",
  "vida_espiritual",
  "casamento",
  "vida_financeira",
  "falecidos",
  "outros",
] as const;

export type CareArea = (typeof CARE_AREAS)[number];

/** Link de WhatsApp para a equipe retornar o contato (só quando a pessoa autorizou). */
export function whatsappLink(phone: string | null | undefined, message: string): string | null {
  const digits = (phone ?? "").replace(/\D/g, "");
  if (digits.length < 10) return null;
  const withCountry = digits.length <= 11 ? `55${digits}` : digits;
  return `https://wa.me/${withCountry}?text=${encodeURIComponent(message)}`;
}
