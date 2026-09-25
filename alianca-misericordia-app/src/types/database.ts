// Tipos TypeScript espelhando o schema em supabase/migrations/*.sql.
// Se preferir tipos gerados automaticamente, rode:
//   supabase gen types typescript --project-id <id> > src/types/database.generated.ts

export type MemberRole = "member" | "leader" | "staff" | "admin";
export type MemberStatus = "active" | "inactive" | "pending";
export type GroupType = "celula" | "coordenacao" | "evento_local" | "other";
export type EvangelizationColor =
  | "vermelho"
  | "laranja"
  | "amarelo"
  | "verde"
  | "azul"
  | "rosa"
  | "violeta";
export type VideoAccessType = "public" | "color" | "level" | "group" | "paid";
export type PaymentMethod = "pix" | "credit_card" | "debit_card" | "boleto" | "other";
export type PaymentStatus = "pending" | "processing" | "completed" | "failed" | "refunded" | "cancelled";

export const EVANGELIZATION_COLORS: { value: EvangelizationColor; label: string; group: string; hex: string }[] = [
  { value: "vermelho", label: "Vermelho", group: "Servos", hex: "#C0392B" },
  { value: "laranja", label: "Laranja", group: "Artistas", hex: "#E67E22" },
  { value: "amarelo", label: "Amarelo", group: "Adoradores", hex: "#F1C40F" },
  { value: "verde", label: "Verde", group: "Pastores", hex: "#27AE60" },
  { value: "azul", label: "Azul", group: "Anunciadores", hex: "#2980B9" },
  { value: "rosa", label: "Rosa", group: "Construtores de Paz", hex: "#E84393" },
  { value: "violeta", label: "Violeta", group: "Vítimas", hex: "#8E44AD" },
];

export interface MembershipLevel {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  sort_order: number;
  is_active: boolean;
}

export interface Profile {
  id: string;
  full_name: string;
  email: string | null;
  phone: string | null;
  avatar_url: string | null;
  birth_date: string | null;
  city: string | null;
  state: string | null;
  evangelization_color: EvangelizationColor | null;
  membership_level_id: string | null;
  role: MemberRole;
  status: MemberStatus;
  preferred_locale: string | null;
  joined_at: string;
}

export interface Group {
  id: string;
  name: string;
  slug: string;
  type: GroupType;
  city: string | null;
  description: string | null;
  cover_image_url: string | null;
  leader_id: string | null;
  meeting_schedule: string | null;
  is_active: boolean;
}

export interface CommunityEvent {
  id: string;
  group_id: string | null;
  title: string;
  description: string | null;
  location: string | null;
  city: string | null;
  category: string;
  cover_image_url: string | null;
  start_at: string;
  end_at: string | null;
  capacity: number | null;
  requires_registration: boolean;
}

export interface NewsPost {
  id: string;
  title: string;
  slug: string;
  subtitle: string | null;
  body: string;
  cover_image_url: string | null;
  category: string;
  is_pinned: boolean;
  published_at: string | null;
}

export interface DownloadItem {
  id: string;
  course_id: string | null;
  title: string;
  description: string | null;
  file_url: string;
  file_type: string | null;
  file_size_bytes: number | null;
  category: string;
  download_count: number;
}

export interface Course {
  id: string;
  title: string;
  slug: string;
  description: string | null;
  cover_image_url: string | null;
  is_published: boolean;
  sort_order: number;
}

export interface Video {
  id: string;
  course_id: string | null;
  title: string;
  slug: string;
  description: string | null;
  video_url: string;
  thumbnail_url: string | null;
  duration_seconds: number | null;
  access_type: VideoAccessType;
  required_color: EvangelizationColor | null;
  required_level_id: string | null;
  required_group_id: string | null;
  price_amount: number | null;
  currency: string;
  is_published: boolean;
  sort_order: number;
  views_count: number;
  published_at: string | null;
}

export interface VideoPurchase {
  id: string;
  video_id: string;
  profile_id: string;
  amount: number;
  currency: string;
  payment_method: PaymentMethod;
  payment_status: PaymentStatus;
  external_payment_id: string | null;
  paid_at: string | null;
}

export interface VideoProgress {
  id: string;
  video_id: string;
  profile_id: string;
  watched_seconds: number;
  completed_at: string | null;
  last_watched_at: string;
}

export interface Quiz {
  id: string;
  video_id: string | null;
  title: string;
  passing_score_percent: number;
  is_published: boolean;
}

export interface QuizQuestion {
  id: string;
  quiz_id: string;
  question_text: string;
  sort_order: number;
}

/** Vem da view quiz_options_public — nunca inclui is_correct. */
export interface QuizOptionPublic {
  id: string;
  question_id: string;
  option_text: string;
  sort_order: number;
}

export interface QuizAttempt {
  id: string;
  quiz_id: string;
  profile_id: string;
  score_percent: number;
  correct_count: number;
  total_questions: number;
  passed: boolean;
  started_at: string;
  completed_at: string | null;
}

export interface DailyLiturgy {
  id: string;
  date: string;
  locale: string;
  liturgical_color: string | null;
  liturgical_season: string | null;
  celebration: string | null;
  saint_of_day: string | null;
  first_reading_ref: string | null;
  first_reading_text: string | null;
  psalm_ref: string | null;
  psalm_text: string | null;
  second_reading_ref: string | null;
  second_reading_text: string | null;
  gospel_ref: string | null;
  gospel_text: string | null;
  reflection: string | null;
}

export interface BibleVersion {
  id: string;
  name: string;
  language: string;
}

export interface BibleBook {
  id: string;
  version_id: string;
  testament: "AT" | "NT";
  name: string;
  abbreviation: string;
  order_index: number;
  chapters_count: number;
}

export interface BibleVerse {
  id: number;
  book_id: string;
  version_id: string;
  chapter: number;
  verse: number;
  text: string;
}
