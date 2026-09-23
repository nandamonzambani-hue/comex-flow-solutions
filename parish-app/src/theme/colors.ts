// Paleta padrão da paróquia demo. Em produção, sobrescreva com
// parish.primary_color / parish.secondary_color vindos do banco
// (permite "vender" o app com identidade visual de cada paróquia).
export const colors = {
  primary: "#7A1F2B", // bordô litúrgico
  primaryDark: "#5C1620",
  secondary: "#C9A24B", // dourado
  background: "#FAF8F5",
  surface: "#FFFFFF",
  textPrimary: "#1E1B16",
  textSecondary: "#6B6459",
  border: "#E8E2D8",
  success: "#2E7D32",
  warning: "#B8860B",
  danger: "#B3261E",
  liturgicalGreen: "#2E7D32",
  liturgicalPurple: "#6A1B9A",
  liturgicalRed: "#B3261E",
  liturgicalWhite: "#F5F5F0",
  liturgicalRose: "#E8A0BF",
};

export type ThemeColors = typeof colors;
