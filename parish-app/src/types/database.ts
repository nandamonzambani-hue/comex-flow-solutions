// Tipos TypeScript espelhando o schema em supabase/migrations/0001_init.sql.
// Se preferir tipos gerados automaticamente, rode:
//   supabase gen types typescript --project-id <id> > src/types/database.generated.ts

export type MemberRole = "member" | "group_leader" | "staff" | "admin" | "pastor";
export type MemberStatus = "active" | "inactive" | "pending";
export type GroupType = "pastoral" | "movement" | "ministry" | "choir" | "catechesis" | "news" | "other";
export type ContentType = "video" | "article" | "audio" | "live";
export type PaymentMethod = "pix" | "credit_card" | "debit_card" | "boleto" | "cash" | "bank_transfer" | "other";
export type PaymentStatus = "pending" | "processing" | "completed" | "failed" | "refunded" | "cancelled";
export type FinancialCategoryType = "dizimo" | "oferta" | "campanha" | "festa" | "missa_intencao" | "outro";
export type ParishStatus = "pending_approval" | "trial" | "active" | "past_due" | "suspended" | "cancelled";
export type SubscriptionStatus = "none" | "trialing" | "authorized" | "paused" | "cancelled";
/** Matriz = quem assina a plataforma; comunidade = capela que responde à Matriz (ver 0013). */
export type ParishKind = "matriz" | "comunidade";

export interface Parish {
  id: string;
  name: string;
  slug: string;
  address: string | null;
  city: string | null;
  state: string | null;
  phone: string | null;
  email: string | null;
  logo_url: string | null;
  primary_color: string;
  secondary_color: string;
  timezone: string;
  status: ParishStatus;
  plan_id: string | null;
  subscription_status: SubscriptionStatus;
  trial_ends_at: string | null;
  join_code: string | null;
  contact_name: string | null;
  contact_phone: string | null;
  kind: ParishKind;
  parent_parish_id: string | null;
  patron_saint: string | null;
  mass_schedule: string | null;
}

export interface SubscriptionPlan {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  price_amount: number;
  currency: string;
  billing_interval: "once" | "weekly" | "monthly" | "yearly";
  max_members: number | null;
  trial_days: number;
  is_active: boolean;
}

export interface Profile {
  id: string;
  parish_id: string | null;
  full_name: string;
  email: string | null;
  phone: string | null;
  avatar_url: string | null;
  birth_date: string | null;
  role: MemberRole;
  status: MemberStatus;
  baptized: boolean;
  confirmed: boolean;
  preferred_locale: string | null;
  joined_at: string;
}

/** Traduções opcionais por idioma: { "en": { "title": "...", "body": "..." } } */
export type Translations = Record<string, Record<string, string>>;

export interface Group {
  id: string;
  parish_id: string;
  /** Só vale para conteúdo da Matriz: false = não aparece nas comunidades. */
  share_with_communities?: boolean;
  name: string;
  slug: string;
  type: GroupType;
  description: string | null;
  cover_image_url: string | null;
  leader_id: string | null;
  meeting_schedule: string | null;
  is_active: boolean;
  translations: Translations | null;
}

export interface ParishEvent {
  id: string;
  parish_id: string;
  /** Só vale para conteúdo da Matriz: false = não aparece nas comunidades. */
  share_with_communities?: boolean;
  group_id: string | null;
  title: string;
  description: string | null;
  location: string | null;
  category: string;
  cover_image_url: string | null;
  start_at: string;
  end_at: string | null;
  is_recurring: boolean;
  capacity: number | null;
  requires_registration: boolean;
  translations: Translations | null;
}

export interface Campaign {
  id: string;
  parish_id: string;
  /** Só vale para conteúdo da Matriz: false = não aparece nas comunidades. */
  share_with_communities?: boolean;
  name: string;
  slug: string;
  description: string | null;
  goal_amount: number | null;
  current_amount: number;
  cover_image_url: string | null;
  start_date: string | null;
  end_date: string | null;
  status: "draft" | "active" | "completed" | "cancelled";
  translations: Translations | null;
}

export interface Donation {
  id: string;
  parish_id: string;
  profile_id: string | null;
  campaign_id: string | null;
  category_id: string | null;
  amount: number;
  currency: string;
  payment_method: PaymentMethod;
  payment_status: PaymentStatus;
  is_recurring: boolean;
  paid_at: string | null;
  created_at: string;
}

export interface MediaContent {
  id: string;
  parish_id: string;
  /** Só vale para conteúdo da Matriz: false = não aparece nas comunidades. */
  share_with_communities?: boolean;
  group_id: string | null;
  title: string;
  slug: string;
  description: string | null;
  content_type: ContentType;
  body: string | null;
  video_url: string | null;
  audio_url: string | null;
  thumbnail_url: string | null;
  duration_seconds: number | null;
  category: string | null;
  tags: string[];
  is_featured: boolean;
  views_count: number;
  published_at: string | null;
  translations: Translations | null;
}

export interface Quiz {
  id: string;
  parish_id: string;
  /** Só vale para conteúdo da Matriz: false = não aparece nas comunidades. */
  share_with_communities?: boolean;
  media_content_id: string | null;
  title: string;
  description: string | null;
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

export interface NewsPost {
  id: string;
  parish_id: string;
  /** Só vale para conteúdo da Matriz: false = não aparece nas comunidades. */
  share_with_communities?: boolean;
  title: string;
  slug: string;
  subtitle: string | null;
  body: string;
  cover_image_url: string | null;
  category: string;
  is_pinned: boolean;
  published_at: string | null;
  translations: Translations | null;
}

export interface Banner {
  id: string;
  parish_id: string;
  /** Só vale para conteúdo da Matriz: false = não aparece nas comunidades. */
  share_with_communities?: boolean;
  image_url: string;
  title: string | null;
  link_url: string | null;
  order_index: number;
  is_active: boolean;
  starts_at: string | null;
  ends_at: string | null;
}

export interface Announcement {
  id: string;
  parish_id: string;
  /** Só vale para conteúdo da Matriz: false = não aparece nas comunidades. */
  share_with_communities?: boolean;
  title: string;
  body: string;
  is_pinned: boolean;
  is_active: boolean;
  starts_at: string | null;
  ends_at: string | null;
  created_by: string | null;
  created_at: string;
  updated_at: string;
}

export interface DownloadItem {
  id: string;
  parish_id: string;
  /** Só vale para conteúdo da Matriz: false = não aparece nas comunidades. */
  share_with_communities?: boolean;
  group_id: string | null;
  title: string;
  description: string | null;
  file_url: string;
  file_type: string | null;
  file_size_bytes: number | null;
  category: string;
  download_count: number;
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

// ---------------------------------------------------------------------
// Formulários (0014)
// ---------------------------------------------------------------------
export type FormQuestionType =
  | "short_text"
  | "long_text"
  | "single_choice"
  | "multiple_choice"
  | "dropdown"
  | "date"
  | "number"
  | "phone"
  | "email"
  | "image_upload"
  | "file_upload";

export interface ParishForm {
  id: string;
  parish_id: string;
  event_id: string | null;
  title: string;
  description: string | null;
  cover_image_url: string | null;
  category: string | null;
  is_quiz: boolean;
  show_score_to_respondent: boolean;
  allow_multiple_responses: boolean;
  is_published: boolean;
  share_with_communities: boolean;
  opens_at: string | null;
  closes_at: string | null;
  confirmation_message: string | null;
  created_at: string;
}

export interface FormSection {
  id: string;
  form_id: string;
  title: string;
  description: string | null;
  image_url: string | null;
  sort_order: number;
  next_section_id: string | null;
  submit_after: boolean;
}

export interface FormQuestion {
  id: string;
  form_id: string;
  section_id: string;
  question_type: FormQuestionType;
  label: string;
  help_text: string | null;
  image_url: string | null;
  is_required: boolean;
  sort_order: number;
  points: number;
}

/** Vem da view form_question_options_public — nunca inclui is_correct. */
export interface FormOptionPublic {
  id: string;
  question_id: string;
  label: string;
  image_url: string | null;
  sort_order: number;
  go_to_section_id: string | null;
  submit_form: boolean;
}

export interface FormOption extends FormOptionPublic {
  is_correct: boolean;
}

export interface FormResponse {
  id: string;
  form_id: string;
  parish_id: string | null;
  profile_id: string | null;
  respondent_name: string | null;
  respondent_email: string | null;
  respondent_phone: string | null;
  score: number | null;
  max_score: number | null;
  submitted_at: string;
}

export interface FormAnswer {
  id: string;
  response_id: string;
  question_id: string;
  text_value: string | null;
  option_ids: string[];
  file_url: string | null;
  is_correct: boolean | null;
  points_awarded: number;
}

// ---------------------------------------------------------------------
// Cuidado pastoral (0015)
// ---------------------------------------------------------------------
export type PrayerRequestStatus = "open" | "praying" | "answered" | "archived";
export type TestimonyStatus = "pending" | "approved" | "rejected";
export type Mood = "grato" | "feliz" | "em_paz" | "cansado" | "ansioso" | "triste" | "precisando_de_oracao";

export interface PrayerRequest {
  id: string;
  parish_id: string;
  profile_id: string | null;
  requester_name: string;
  requester_email: string | null;
  requester_phone: string | null;
  area: string;
  body: string;
  allow_whatsapp_contact: boolean;
  is_private: boolean;
  status: PrayerRequestStatus;
  staff_notes: string | null;
  created_at: string;
}

export interface Testimony {
  id: string;
  parish_id: string;
  profile_id: string | null;
  author_name: string;
  category: string;
  body: string;
  allow_publish: boolean;
  allow_whatsapp_contact: boolean;
  status: TestimonyStatus;
  created_at: string;
}

export interface MoodCheckin {
  id: string;
  parish_id: string | null;
  profile_id: string;
  mood: Mood;
  created_at: string;
}
