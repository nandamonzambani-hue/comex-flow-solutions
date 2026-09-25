// Paleta provisória, inspirada na imagem da Divina Misericórdia (raios
// vermelho e azul-claro). Troque pelos valores da identidade visual real
// da Aliança quando definidos.
export const colors = {
  primary: "#8C1F28", // vermelho profundo
  primaryDark: "#631620",
  secondary: "#5B8FB0", // azul-claro (raio pálido)
  background: "#FAF8F5",
  surface: "#FFFFFF",
  textPrimary: "#1E1B16",
  textSecondary: "#6B6459",
  border: "#E8E2D8",
  success: "#2E7D32",
  warning: "#B8860B",
  danger: "#B3261E",
};

export type ThemeColors = typeof colors;

/** Cores fixas da marca — este app não tem tema dinâmico por organização
 * (é um produto exclusivo, ao contrário do app de paróquias multi-tenant). */
export function useTheme() {
  return { primary: colors.primary, secondary: colors.secondary };
}
