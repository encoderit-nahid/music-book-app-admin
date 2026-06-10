export interface Paginated<T> {
  data: T[];
  meta: {
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
  };
}

export interface Single<T> {
  data: T;
  message?: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  icon: string | null;
  image: string | null;
  sort_order: number;
  is_active: boolean;
  books_count?: number;
  created_at?: string;
  updated_at?: string;
}

export interface Book {
  id: string;
  categories?: Category[];
  category_ids?: string[];
  title: string;
  slug: string;
  subtitle: string | null;
  author: string | null;
  description: string | null;
  cover_image: string | null;
  age_group: string | null;
  language: string;
  total_chapters: number;
  duration_minutes: number | null;
  is_active: boolean;
  published_at: string | null;
  chapters?: Chapter[];
  created_at?: string;
  updated_at?: string;
}

export interface Chapter {
  id: string;
  book_id: string;
  title: string;
  chapter_number: number;
  sort_order: number;
  content?: string | null;
  trigger_word_mappings?: TriggerWord[];
  triggers_count?: number;
  created_at?: string;
  updated_at?: string;
}

export interface SoundEffect {
  id: string;
  name: string;
  file_path: string | null;
  file_url: string | null;
  duration_seconds: number | null;
  category_id: string | null;
  category?: Category | null;
  status?: "processing" | "ready" | "failed";
  is_active: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface TriggerWord {
  id: string;
  chapter_id: string;
  trigger_word: string;
  variants: string[];
  match_type: "exact" | "contains" | "phonetic";
  sound_effect_id: string | null;
  sound_effect?: SoundEffect | null;
  volume: number;
  delay_ms: number;
  cooldown_ms: number;
  repeat_allowed: boolean;
  is_active: boolean;
}

export interface AppUser {
  id: string;
  name: string;
  email: string;
  avatar: string | null;
  language: string;
  is_active: boolean;
  role: string | null;
  progress_count?: number;
  favorites_count?: number;
  created_at?: string;
}

export interface Setting {
  id: string;
  key: string;
  value: unknown;
  type: "string" | "text" | "json" | "boolean";
  updated_at?: string;
}

export interface StatsOverview {
  total_users: number;
  active_users: number;
  total_books: number;
  total_chapters: number;
  total_categories: number;
  total_sound_effects: number;
  completed_chapters: number;
  total_sessions: number;
  total_reading_minutes: number;
  new_users_this_month: number;
}

export interface PopularBook {
  book_id: string;
  title: string;
  favorites_count: number;
  completions_count: number;
}

export interface DailyPoint {
  date: string;
  count?: number;
  sessions?: number;
  total_seconds?: number;
}
