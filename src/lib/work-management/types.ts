export const SEGMENTS = ["Agro", "Indústria", "Mineração", "Petróleo & Gás"] as const;
export type Segment = (typeof SEGMENTS)[number];

export const BRANDS = [
  "ZEC",
  "Next Powertech",
  "Uniflex",
  "Transfluid",
  "Held",
  "Marzocchi",
] as const;
export type Brand = (typeof BRANDS)[number];

export const TASK_STATUSES = ["A Fazer", "Em Andamento", "Concluído"] as const;
export type TaskStatus = (typeof TASK_STATUSES)[number];

export const TASK_PRIORITIES = ["Baixa", "Média", "Alta"] as const;
export type TaskPriority = (typeof TASK_PRIORITIES)[number];

export interface Task {
  id: string;
  title: string;
  segment: Segment;
  priority: TaskPriority;
  status: TaskStatus;
  dueDate: string;
  notes: string;
}

export const QUOTE_STATUSES = ["Em Aberto", "Enviado", "Aprovado", "Perdido"] as const;
export type QuoteStatus = (typeof QUOTE_STATUSES)[number];

export interface Quote {
  id: string;
  client: string;
  company: string;
  brand: Brand;
  segment: Segment;
  value: number;
  status: QuoteStatus;
  date: string;
}

export interface Client {
  id: string;
  name: string;
  company: string;
  segment: Segment;
  phone: string;
  lastContact: string;
}

export const TRAINING_STATUSES = ["Agendado", "Confirmado", "Concluído"] as const;
export type TrainingStatus = (typeof TRAINING_STATUSES)[number];

export interface Training {
  id: string;
  title: string;
  brand: Brand;
  client: string;
  date: string;
  location: string;
  status: TrainingStatus;
}

export function createId(): string {
  return Math.random().toString(36).slice(2, 10);
}
