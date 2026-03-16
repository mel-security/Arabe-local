/**
 * Service d'accès à la base de données via les commandes Tauri.
 * En mode développement web (sans Tauri), utilise des données mock
 * importées depuis __mocks__/database.ts.
 */

import type {
  UserProfile,
  AppSettings,
  Letter,
  QuizQuestion,
  VocabularyWord,
  WordQuizQuestion,
  ReadingLesson,
  Surah,
  Verse,
  FavoriteVerse,
  ReadingPosition,
  SearchResult,
  OverallProgress,
  ModuleProgress,
  ActivityItem,
  StreakInfo,
  LLMSettings,
  ChatSession,
  ChatMessage as ChatMsg,
} from "@/types";

// Détection de l'environnement Tauri
const isTauri = typeof window !== "undefined" && "__TAURI__" in window;

async function invoke<T>(command: string, args?: Record<string, unknown>): Promise<T> {
  if (isTauri) {
    const { invoke: tauriInvoke } = await import("@tauri-apps/api/tauri");
    return tauriInvoke<T>(command, args);
  }
  // Mode web : retourner des données mock
  const { getMockData } = await import("../../../__mocks__/database");
  return getMockData<T>(command, args);
}

// ============================================================
// API UTILISATEUR
// ============================================================

export const userApi = {
  getProfile: () => invoke<UserProfile>("get_user_profile"),

  updateProfile: (input: Partial<UserProfile>) =>
    invoke<UserProfile>("update_user_profile", { input }),

  getSettings: () => invoke<AppSettings>("get_settings"),

  updateSetting: (key: string, value: string) =>
    invoke<void>("update_settings", { key, value }),
};

// ============================================================
// API LETTRES
// ============================================================

export const lettersApi = {
  getAll: () => invoke<Letter[]>("get_all_letters"),

  getByLevel: (level: string) =>
    invoke<Letter[]>("get_letters_by_level", { level }),

  getById: (letterId: number) =>
    invoke<Letter>("get_letter_by_id", { letterId }),

  markLearned: (letterId: number, isLearned: boolean) =>
    invoke<void>("mark_letter_learned", { letterId, isLearned }),

  getQuizQuestions: (letterIds: number[], count?: number) =>
    invoke<QuizQuestion[]>("get_letter_quiz_questions", { letterIds, count }),

  submitQuizAnswer: (letterId: number, isCorrect: boolean, score: number) =>
    invoke<void>("submit_quiz_answer", { letterId, isCorrect, score }),
};

// ============================================================
// API MOTS
// ============================================================

export const wordsApi = {
  getAll: () => invoke<VocabularyWord[]>("get_all_words"),

  getByCategory: (categorySlug: string) =>
    invoke<VocabularyWord[]>("get_words_by_category", { categorySlug }),

  getByLevel: (level: string) =>
    invoke<VocabularyWord[]>("get_words_by_level", { level }),

  getById: (wordId: number) =>
    invoke<VocabularyWord>("get_word_by_id", { wordId }),

  markLearned: (wordId: number, isLearned: boolean) =>
    invoke<void>("mark_word_learned", { wordId, isLearned }),

  toggleFavorite: (wordId: number) =>
    invoke<boolean>("toggle_word_favorite", { wordId }),

  getQuizQuestions: (categorySlug?: string, level?: string, count?: number) =>
    invoke<WordQuizQuestion[]>("get_word_quiz_questions", { categorySlug, level, count }),
};

// ============================================================
// API LECTURE
// ============================================================

export const readingApi = {
  getLessons: () => invoke<ReadingLesson[]>("get_reading_lessons"),

  getLessonById: (lessonId: number) =>
    invoke<ReadingLesson>("get_lesson_by_id", { lessonId }),

  completeLesson: (lessonId: number, score?: number) =>
    invoke<void>("complete_lesson", { lessonId, score }),

  getQuiz: (lessonId: number) =>
    invoke<{ exercise_type: string; question: string; arabic: string | null; options: string[]; correct_answer: string }[]>(
      "get_reading_quiz", { lessonId }
    ),
};

// ============================================================
// API CORAN
// ============================================================

export const quranApi = {
  getAllSurahs: () => invoke<Surah[]>("get_all_surahs"),

  getSurahById: (surahId: number) =>
    invoke<Surah>("get_surah_by_id", { surahId }),

  getVerses: (surahId: number, fromVerse?: number, toVerse?: number) =>
    invoke<Verse[]>("get_verses", { surahId, fromVerse, toVerse }),

  toggleFavorite: (verseId: number, note?: string) =>
    invoke<boolean>("toggle_verse_favorite", { verseId, note }),

  getFavorites: () => invoke<FavoriteVerse[]>("get_favorite_verses"),

  savePosition: (surahId: number, verseNumber: number) =>
    invoke<void>("save_reading_position", { surahId, verseNumber }),

  getPosition: () => invoke<ReadingPosition | null>("get_reading_position"),

  search: (query: string, language: string) =>
    invoke<SearchResult[]>("search_quran", { query, language }),
};

// ============================================================
// API PROGRESSION
// ============================================================

export const progressApi = {
  getOverall: () => invoke<OverallProgress>("get_overall_progress"),

  getModule: (module: string) =>
    invoke<ModuleProgress>("get_module_progress", { module }),

  getRecentActivity: (limit?: number) =>
    invoke<ActivityItem[]>("get_recent_activity", { limit }),

  getStreak: () => invoke<StreakInfo>("get_streak"),
};

// ============================================================
// API LLM
// ============================================================

export const llmApi = {
  getSettings: () =>
    invoke<LLMSettings>("get_llm_settings"),

  updateSettings: (input: Partial<LLMSettings>) =>
    invoke<LLMSettings>("update_llm_settings", { input }),

  getSessions: (limit?: number) =>
    invoke<ChatSession[]>("get_chat_sessions", { limit }),

  createSession: (title: string, mode: string) =>
    invoke<ChatSession>("create_chat_session", { title, mode }),

  deleteSession: (sessionId: number) =>
    invoke<void>("delete_chat_session", { sessionId }),

  getMessages: (sessionId: number) =>
    invoke<ChatMsg[]>("get_chat_messages", { sessionId }),

  saveMessage: (sessionId: number, role: string, content: string, modelUsed?: string) =>
    invoke<ChatMsg>("save_chat_message", { sessionId, role, content, modelUsed }),

  clearHistory: () =>
    invoke<void>("clear_chat_history"),
};
