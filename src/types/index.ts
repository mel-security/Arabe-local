// ============================================================
// TYPES GLOBAUX DE L'APPLICATION
// ============================================================

export type Level = "beginner" | "intermediate" | "advanced" | "expert";
export type Language = "fr" | "en";
export type Theme = "light" | "dark" | "auto";
export type Module = "letters" | "reading" | "words" | "quran";

// ============================================================
// UTILISATEUR & PARAMÈTRES
// ============================================================

export interface UserProfile {
  id: number;
  name: string;
  level: Level;
  language: Language;
  theme: Theme;
  font_size: number; // 1-5
  created_at: string;
  updated_at: string;
}

export interface AppSettings {
  notifications: boolean;
  auto_play_audio: boolean;
  show_transliteration: boolean;
  show_translation: boolean;
  quiz_questions_count: number;
  daily_goal: number; // minutes
}

// ============================================================
// LETTRES ARABES
// ============================================================

export interface LetterExample {
  arabic: string;
  transliteration: string;
  translation_fr: string;
  translation_en: string;
  position: "initial" | "medial" | "final" | "isolated";
}

export interface LetterVowel {
  name: string;       // "fatha", "kasra", "damma", etc.
  arabic: string;     // le signe diacritique seul
  combined: string;   // lettre + voyelle
  pronunciation: string;
}

export interface Letter {
  id: number;
  order_num: number;
  arabic: string;
  name_ar: string;
  name_fr: string;
  name_en: string;
  transliteration: string;
  pronunciation_fr: string;
  isolated_form: string;
  initial_form: string;
  medial_form: string;
  final_form: string;
  connects_left: boolean;
  audio_file: string | null;
  image_file: string | null;
  level: Level;
  description_fr: string | null;
  description_en: string | null;
  examples: LetterExample[];
  vowels: LetterVowel[];
  youtube_query: string | null;
  is_learned: boolean;
  quiz_score: number | null;
}

export interface QuizQuestion {
  id: string;
  letter_id: number;
  question_type: string;
  question: string;
  arabic: string;
  options: string[];
  correct_answer: string;
}

// ============================================================
// VOCABULAIRE
// ============================================================

export interface VocabularyCategory {
  id: number;
  slug: string;
  name_fr: string;
  name_en: string;
  icon: string;
  color: string;
  order_num: number;
  word_count: number;
}

export interface VocabularyWord {
  id: number;
  arabic: string;
  transliteration: string;
  translation_fr: string;
  translation_en: string;
  category_id: number | null;
  category_slug: string | null;
  level: Level;
  audio_file: string | null;
  image_file: string | null;
  example_ar: string | null;
  example_fr: string | null;
  example_en: string | null;
  gender: "m" | "f" | "n" | null;
  plural_ar: string | null;
  root_ar: string | null;
  is_learned: boolean;
  is_favorite: boolean;
  quiz_score: number | null;
}

export interface WordQuizQuestion {
  id: string;
  word_id: number;
  question_type: string;
  question_fr: string;
  arabic: string;
  options: string[];
  correct_answer: string;
}

// ============================================================
// LECTURE
// ============================================================

export type ContentItemType = "letter" | "syllable" | "word" | "sentence";
export type LessonType = "letters" | "syllables" | "words" | "sentences" | "paragraph";

export interface ContentItem {
  arabic: string;
  transliteration: string | null;
  translation_fr: string | null;
  audio_file: string | null;
  item_type: ContentItemType;
}

export interface Exercise {
  exercise_type: string;
  question: string;
  arabic: string | null;
  options: string[];
  correct_answer: string;
}

export interface ReadingLesson {
  id: number;
  order_num: number;
  title_fr: string;
  title_en: string;
  level: Level;
  lesson_type: LessonType;
  content: ContentItem[];
  exercises: Exercise[];
  audio_file: string | null;
  description_fr: string | null;
  is_completed: boolean;
  quiz_score: number | null;
}

// ============================================================
// CORAN
// ============================================================

export type RevelationType = "meccan" | "medinan";

export interface Surah {
  id: number;
  number: number;
  name_ar: string;
  name_fr: string;
  name_en: string;
  transliteration: string;
  revelation_type: RevelationType;
  verses_count: number;
  order_revealed: number | null;
  audio_file: string | null;
  description_fr: string | null;
  last_read_verse: number | null;
  is_completed: boolean;
}

export interface Verse {
  id: number;
  surah_id: number;
  verse_number: number;
  arabic_text: string;
  translation_fr: string;
  translation_en: string;
  transliteration: string | null;
  audio_file: string | null;
  juz: number | null;
  page: number | null;
  is_favorite: boolean;
}

export interface FavoriteVerse {
  verse: Verse;
  surah_name_fr: string;
  surah_number: number;
  note: string | null;
  saved_at: string;
}

export interface ReadingPosition {
  surah_id: number;
  verse_number: number;
}

export interface SearchResult {
  verse: Verse;
  surah_name_fr: string;
  surah_number: number;
}

// ============================================================
// PROGRESSION
// ============================================================

export interface OverallProgress {
  letters_total: number;
  letters_learned: number;
  words_total: number;
  words_learned: number;
  reading_total: number;
  reading_completed: number;
  quran_surahs_started: number;
  quran_surahs_completed: number;
  total_percent: number;
}

export interface ModuleProgress {
  module: Module;
  total: number;
  completed: number;
  percent: number;
  last_activity: string | null;
}

export interface ActivityItem {
  module: string;
  action: string;
  item_id: number | null;
  created_at: string;
  label: string;
}

export interface StreakInfo {
  current_streak: number;
  longest_streak: number;
  last_activity_date: string | null;
  today_done: boolean;
}

// ============================================================
// UI
// ============================================================

export interface NavItem {
  id: Module;
  label_fr: string;
  label_en: string;
  icon: string;
  path: string;
  color: string;
}

export interface AudioState {
  isPlaying: boolean;
  currentSrc: string | null;
  duration: number;
  currentTime: number;
  volume: number;
}
