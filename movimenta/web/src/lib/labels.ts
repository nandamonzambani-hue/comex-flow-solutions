export const levelLabels: Record<string, string> = {
  iniciante: "Iniciante",
  intermediario: "Intermediário",
  avancado: "Avançado",
};

export const goalLabels: Record<string, string> = {
  emagrecer: "Emagrecer",
  ganhar_massa: "Ganhar massa muscular",
  condicionamento: "Condicionamento",
  saude: "Saúde e bem-estar",
  flexibilidade: "Flexibilidade",
};

export const mealLabels: Record<string, string> = {
  cafe_da_manha: "Café da manhã",
  lanche_manha: "Lanche da manhã",
  almoco: "Almoço",
  lanche_tarde: "Lanche da tarde",
  jantar: "Jantar",
  ceia: "Ceia",
};

export const videoStatusLabels: Record<string, string> = {
  aguardando_upload: "Aguardando envio",
  processando: "Processando",
  pronto: "Pronto",
  erro: "Erro",
};

export const audienceLabels: Record<string, string> = {
  todas: "Todas",
  assinantes: "Só assinantes",
  nao_assinantes: "Só quem não assina",
};

export const weekDays = ["Segunda", "Terça", "Quarta", "Quinta", "Sexta", "Sábado", "Domingo"];

export const appName = process.env.NEXT_PUBLIC_APP_NAME || "Movimenta";

export function formatDate(value?: string | null, withTime = false): string {
  if (!value) return "–";
  const d = new Date(value);
  return withTime ? d.toLocaleString("pt-BR") : d.toLocaleDateString("pt-BR");
}
