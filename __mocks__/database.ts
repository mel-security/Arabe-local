/**
 * Données mock pour le mode développement web (sans Tauri).
 * Isolées du code de production.
 */

import type {
  UserProfile,
  AppSettings,
  Letter,
  QuizQuestion,
  VocabularyWord,
  ReadingLesson,
  Surah,
  Verse,
  OverallProgress,
  ModuleProgress,
  ActivityItem,
  StreakInfo,
  LLMSettings,
  ChatSession,
  ChatMessage as ChatMsg,
} from "@/types";

export function getMockData<T>(command: string, _args?: Record<string, unknown>): T {
  const mocks: Record<string, unknown> = {
    get_user_profile: {
      id: 1, name: "Étudiant", level: "beginner", language: "fr",
      theme: "light", font_size: 3,
      created_at: new Date().toISOString(), updated_at: new Date().toISOString(),
    } as UserProfile,

    update_user_profile: {
      id: 1, name: "Étudiant", level: "beginner", language: "fr",
      theme: "light", font_size: 3,
      created_at: new Date().toISOString(), updated_at: new Date().toISOString(),
    },

    get_settings: {
      notifications: true, auto_play_audio: false,
      show_transliteration: true, show_translation: true,
      quiz_questions_count: 10, daily_goal: 15,
    } as AppSettings,

    update_settings: null,

    get_all_letters: MOCK_LETTERS,
    get_letters_by_level: MOCK_LETTERS,
    get_letter_by_id: MOCK_LETTERS[0],
    mark_letter_learned: null,
    get_letter_quiz_questions: MOCK_QUIZ_QUESTIONS,
    submit_quiz_answer: null,

    get_all_words: MOCK_WORDS,
    get_words_by_category: MOCK_WORDS,
    get_words_by_level: MOCK_WORDS,
    get_word_by_id: MOCK_WORDS[0],
    mark_word_learned: null,
    toggle_word_favorite: true,
    get_word_quiz_questions: [],

    get_reading_lessons: MOCK_READING_LESSONS,
    get_lesson_by_id: MOCK_READING_LESSONS[0],
    complete_lesson: null,
    get_reading_quiz: [],

    get_all_surahs: MOCK_SURAHS,
    get_surah_by_id: MOCK_SURAHS[0],
    get_verses: MOCK_VERSES,
    toggle_verse_favorite: true,
    get_favorite_verses: [],
    save_reading_position: null,
    get_reading_position: null,
    search_quran: [],

    get_llm_settings: {
      id: 1, provider: "ollama", model_name: "qwen2.5:7b",
      base_url: "http://localhost:11434", temperature: 0.7,
      max_tokens: 2048, context_size: 4096, system_language: "fr",
      tutor_mode: true, streaming: true,
      updated_at: new Date().toISOString(),
    } as LLMSettings,
    update_llm_settings: null,
    get_chat_sessions: [] as ChatSession[],
    create_chat_session: {
      id: 1, user_id: 1, title: "Test", mode: "general",
      context_ref: null, context_id: null, message_count: 0,
      created_at: new Date().toISOString(), updated_at: new Date().toISOString(),
    } as ChatSession,
    delete_chat_session: null,
    get_chat_messages: [] as ChatMsg[],
    save_chat_message: null,
    clear_chat_history: null,

    get_overall_progress: {
      letters_total: 28, letters_learned: 0,
      words_total: 50, words_learned: 0,
      reading_total: 10, reading_completed: 0,
      quran_surahs_started: 0, quran_surahs_completed: 0,
      total_percent: 0,
    } as OverallProgress,

    get_module_progress: {
      module: "letters", total: 28, completed: 0, percent: 0, last_activity: null,
    } as ModuleProgress,

    get_recent_activity: [] as ActivityItem[],

    get_streak: {
      current_streak: 0, longest_streak: 0,
      last_activity_date: null, today_done: false,
    } as StreakInfo,
  };

  return (mocks[command] ?? null) as T;
}

// ============================================================
// DONNÉES MOCK
// ============================================================

const MOCK_LETTERS: Letter[] = [
  {
    id: 1, order_num: 1,
    arabic: "ا", name_ar: "أَلِف", name_fr: "Alif", name_en: "Alif",
    transliteration: "a / ā", pronunciation_fr: "comme 'a' dans 'ami'",
    isolated_form: "ا", initial_form: "ا", medial_form: "ا", final_form: "ا",
    connects_left: false,
    audio_file: null, image_file: null, level: "beginner",
    description_fr: "L'Alif est la première lettre de l'alphabet arabe.",
    description_en: "Alif is the first letter of the Arabic alphabet.",
    examples: [
      { arabic: "أَب", transliteration: "ab", translation_fr: "père", translation_en: "father", position: "initial" },
      { arabic: "كِتَاب", transliteration: "kitāb", translation_fr: "livre", translation_en: "book", position: "medial" },
    ],
    vowels: [
      { name: "fatha", arabic: "َ", combined: "اَ", pronunciation: "a court" },
      { name: "kasra", arabic: "ِ", combined: "اِ", pronunciation: "i court" },
      { name: "damma", arabic: "ُ", combined: "اُ", pronunciation: "ou court" },
    ],
    youtube_query: "apprendre alif arabe",
    is_learned: false, quiz_score: null,
  },
  {
    id: 2, order_num: 2,
    arabic: "ب", name_ar: "بَاء", name_fr: "Ba", name_en: "Ba",
    transliteration: "b", pronunciation_fr: "comme 'b' dans 'beau'",
    isolated_form: "ب", initial_form: "بـ", medial_form: "ـبـ", final_form: "ـب",
    connects_left: true,
    audio_file: null, image_file: null, level: "beginner",
    description_fr: "Le Ba est la deuxième lettre.",
    description_en: "Ba is the second letter.",
    examples: [
      { arabic: "بَيْت", transliteration: "bayt", translation_fr: "maison", translation_en: "house", position: "initial" },
    ],
    vowels: [
      { name: "fatha", arabic: "َ", combined: "بَ", pronunciation: "ba" },
      { name: "kasra", arabic: "ِ", combined: "بِ", pronunciation: "bi" },
      { name: "damma", arabic: "ُ", combined: "بُ", pronunciation: "bu" },
    ],
    youtube_query: "apprendre ba arabe",
    is_learned: false, quiz_score: null,
  },
];

const MOCK_QUIZ_QUESTIONS: QuizQuestion[] = [
  {
    id: "q_0_1", letter_id: 1,
    question_type: "identify_letter",
    question: "Quelle est cette lettre arabe ?",
    arabic: "ا",
    options: ["Ba", "Ta", "Alif", "Jim"],
    correct_answer: "Alif",
  },
];

const MOCK_WORDS: VocabularyWord[] = [
  {
    id: 1, arabic: "مَرْحَبًا", transliteration: "marḥaban",
    translation_fr: "Bonjour / Bienvenue", translation_en: "Hello / Welcome",
    category_id: 1, category_slug: "greetings", level: "beginner",
    audio_file: null, image_file: null,
    example_ar: "مَرْحَبًا بِكَ", example_fr: "Bienvenue chez toi",
    example_en: "Welcome to you",
    gender: null, plural_ar: null, root_ar: "ر ح ب",
    is_learned: false, is_favorite: false, quiz_score: null,
  },
  {
    id: 2, arabic: "أَب", transliteration: "ab",
    translation_fr: "père", translation_en: "father",
    category_id: 2, category_slug: "family", level: "beginner",
    audio_file: null, image_file: null,
    example_ar: "أَبِي طَبِيب", example_fr: "Mon père est médecin",
    example_en: "My father is a doctor",
    gender: "m", plural_ar: "آبَاء", root_ar: "أ ب و",
    is_learned: false, is_favorite: false, quiz_score: null,
  },
];

const MOCK_READING_LESSONS: ReadingLesson[] = [
  {
    id: 1, order_num: 1,
    title_fr: "Les voyelles courtes - Fatha",
    title_en: "Short vowels - Fatha",
    level: "beginner", lesson_type: "syllables",
    description_fr: "Apprenez à prononcer les syllabes avec la voyelle fatha.",
    content: [
      { arabic: "بَ", transliteration: "ba", translation_fr: "ba", audio_file: null, item_type: "syllable" },
      { arabic: "تَ", transliteration: "ta", translation_fr: "ta", audio_file: null, item_type: "syllable" },
    ],
    exercises: [
      {
        exercise_type: "identify",
        question: "Comment se prononce ce signe ?",
        arabic: "بَ",
        options: ["ba", "bi", "bu", "b"],
        correct_answer: "ba",
      },
    ],
    audio_file: null,
    is_completed: false, quiz_score: null,
  },
];

const MOCK_SURAHS: Surah[] = [
  {
    id: 1, number: 1,
    name_ar: "الفاتحة", name_fr: "L'Ouverture (Al-Fatiha)",
    name_en: "The Opening", transliteration: "Al-Fātiḥa",
    revelation_type: "meccan", verses_count: 7,
    order_revealed: 5, audio_file: null,
    description_fr: "La première sourate du Coran.",
    last_read_verse: null, is_completed: false,
  },
];

const MOCK_VERSES: Verse[] = [
  {
    id: 1, surah_id: 1, verse_number: 1,
    arabic_text: "بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ",
    translation_fr: "Au nom d'Allah, le Tout Miséricordieux, le Très Miséricordieux",
    translation_en: "In the name of Allah, the Entirely Merciful, the Especially Merciful",
    transliteration: "Bismi llāhi r-raḥmāni r-raḥīm",
    audio_file: null, juz: 1, page: 1, is_favorite: false,
  },
];
