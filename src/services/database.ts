/**
 * Service d'accès à la base de données via les commandes Tauri.
 * En mode développement web (sans Tauri), utilise des données mock.
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
} from "@/types";

// Détection de l'environnement Tauri
const isTauri = typeof window !== "undefined" && "__TAURI__" in window;

async function invoke<T>(command: string, args?: Record<string, unknown>): Promise<T> {
  if (isTauri) {
    const { invoke: tauriInvoke } = await import("@tauri-apps/api/tauri");
    return tauriInvoke<T>(command, args);
  }
  // Mode web : retourner des données mock
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
// DONNÉES MOCK POUR LE MODE WEB (développement sans Tauri)
// ============================================================

function getMockData<T>(command: string, _args?: Record<string, unknown>): T {
  const mocks: Record<string, unknown> = {
    get_user_profile: {
      id: 1,
      name: "Étudiant",
      level: "beginner",
      language: "fr",
      theme: "light",
      font_size: 3,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    } as UserProfile,

    update_user_profile: {
      id: 1, name: "Étudiant", level: "beginner", language: "fr",
      theme: "light", font_size: 3,
      created_at: new Date().toISOString(), updated_at: new Date().toISOString(),
    },

    get_settings: {
      notifications: true,
      auto_play_audio: false,
      show_transliteration: true,
      show_translation: true,
      quiz_questions_count: 10,
      daily_goal: 15,
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
// DONNÉES MOCK : LETTRES ARABES (28 lettres)
// ============================================================

export const MOCK_LETTERS: Letter[] = [
  {
    id: 1, order_num: 1,
    arabic: "ا", name_ar: "أَلِف", name_fr: "Alif", name_en: "Alif",
    transliteration: "a / ā", pronunciation_fr: "comme 'a' dans 'ami'",
    isolated_form: "ا", initial_form: "ا", medial_form: "ا", final_form: "ا",
    connects_left: false,
    audio_file: null, image_file: null, level: "beginner",
    description_fr: "L'Alif est la première lettre de l'alphabet arabe. C'est une lettre qui ne se connecte qu'à droite.",
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
    description_fr: "Le Ba est la deuxième lettre. Il se connecte des deux côtés.",
    description_en: "Ba is the second letter of the Arabic alphabet.",
    examples: [
      { arabic: "بَيْت", transliteration: "bayt", translation_fr: "maison", translation_en: "house", position: "initial" },
      { arabic: "كِتَاب", transliteration: "kitāb", translation_fr: "livre", translation_en: "book", position: "final" },
    ],
    vowels: [
      { name: "fatha", arabic: "َ", combined: "بَ", pronunciation: "ba" },
      { name: "kasra", arabic: "ِ", combined: "بِ", pronunciation: "bi" },
      { name: "damma", arabic: "ُ", combined: "بُ", pronunciation: "bu" },
      { name: "soukoun", arabic: "ْ", combined: "بْ", pronunciation: "b (consonne seule)" },
    ],
    youtube_query: "apprendre ba arabe",
    is_learned: false, quiz_score: null,
  },
  {
    id: 3, order_num: 3,
    arabic: "ت", name_ar: "تَاء", name_fr: "Ta", name_en: "Ta",
    transliteration: "t", pronunciation_fr: "comme 't' dans 'table'",
    isolated_form: "ت", initial_form: "تـ", medial_form: "ـتـ", final_form: "ـت",
    connects_left: true,
    audio_file: null, image_file: null, level: "beginner",
    description_fr: "Le Ta est la troisième lettre, similaire au Ba mais avec deux points au-dessus.",
    description_en: "Ta is the third letter of the Arabic alphabet.",
    examples: [
      { arabic: "تُفَّاح", transliteration: "tuffāḥ", translation_fr: "pomme", translation_en: "apple", position: "initial" },
    ],
    vowels: [
      { name: "fatha", arabic: "َ", combined: "تَ", pronunciation: "ta" },
      { name: "kasra", arabic: "ِ", combined: "تِ", pronunciation: "ti" },
      { name: "damma", arabic: "ُ", combined: "تُ", pronunciation: "tu" },
    ],
    youtube_query: "apprendre ta arabe",
    is_learned: false, quiz_score: null,
  },
  {
    id: 4, order_num: 4,
    arabic: "ث", name_ar: "ثَاء", name_fr: "Tha", name_en: "Tha",
    transliteration: "th", pronunciation_fr: "comme 'th' anglais dans 'think'",
    isolated_form: "ث", initial_form: "ثـ", medial_form: "ـثـ", final_form: "ـث",
    connects_left: true,
    audio_file: null, image_file: null, level: "beginner",
    description_fr: "Le Tha a trois points au-dessus, se prononce comme le 'th' anglais sourd.",
    description_en: "Tha has three dots above and is pronounced like the English 'th' in 'think'.",
    examples: [
      { arabic: "ثَلَاثَة", transliteration: "thalātha", translation_fr: "trois", translation_en: "three", position: "initial" },
    ],
    vowels: [
      { name: "fatha", arabic: "َ", combined: "ثَ", pronunciation: "tha" },
      { name: "kasra", arabic: "ِ", combined: "ثِ", pronunciation: "thi" },
    ],
    youtube_query: "apprendre tha arabe",
    is_learned: false, quiz_score: null,
  },
  {
    id: 5, order_num: 5,
    arabic: "ج", name_ar: "جِيم", name_fr: "Jim", name_en: "Jim",
    transliteration: "j", pronunciation_fr: "comme 'j' dans 'jardin'",
    isolated_form: "ج", initial_form: "جـ", medial_form: "ـجـ", final_form: "ـج",
    connects_left: true,
    audio_file: null, image_file: null, level: "beginner",
    description_fr: "Le Jim se prononce 'dj' (comme Djinn). En Égypte, il se prononce 'g'.",
    description_en: "Jim is pronounced like 'j' in English 'jar'.",
    examples: [
      { arabic: "جَمِيل", transliteration: "jamīl", translation_fr: "beau", translation_en: "beautiful", position: "initial" },
    ],
    vowels: [
      { name: "fatha", arabic: "َ", combined: "جَ", pronunciation: "ja" },
    ],
    youtube_query: "apprendre jim arabe",
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
  {
    id: "q_1_2", letter_id: 2,
    question_type: "identify_letter",
    question: "Quelle est cette lettre arabe ?",
    arabic: "ب",
    options: ["Ba", "Ta", "Alif", "Jim"],
    correct_answer: "Ba",
  },
];

// ============================================================
// DONNÉES MOCK : MOTS
// ============================================================

export const MOCK_WORDS: VocabularyWord[] = [
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
    id: 2, arabic: "السَّلَامُ عَلَيْكُم", transliteration: "as-salāmu ʿalaykum",
    translation_fr: "La paix soit sur vous", translation_en: "Peace be upon you",
    category_id: 1, category_slug: "greetings", level: "beginner",
    audio_file: null, image_file: null,
    example_ar: null, example_fr: "Formule de salutation islamique",
    example_en: "Islamic greeting formula",
    gender: null, plural_ar: null, root_ar: "س ل م",
    is_learned: false, is_favorite: false, quiz_score: null,
  },
  {
    id: 3, arabic: "أَب", transliteration: "ab",
    translation_fr: "père", translation_en: "father",
    category_id: 2, category_slug: "family", level: "beginner",
    audio_file: null, image_file: null,
    example_ar: "أَبِي طَبِيب", example_fr: "Mon père est médecin",
    example_en: "My father is a doctor",
    gender: "m", plural_ar: "آبَاء", root_ar: "أ ب و",
    is_learned: false, is_favorite: false, quiz_score: null,
  },
  {
    id: 4, arabic: "أُمّ", transliteration: "umm",
    translation_fr: "mère", translation_en: "mother",
    category_id: 2, category_slug: "family", level: "beginner",
    audio_file: null, image_file: null,
    example_ar: "أُمِّي طَيِّبَة", example_fr: "Ma mère est gentille",
    example_en: "My mother is kind",
    gender: "f", plural_ar: "أُمَّهَات", root_ar: "أ م م",
    is_learned: false, is_favorite: false, quiz_score: null,
  },
  {
    id: 5, arabic: "بَيْت", transliteration: "bayt",
    translation_fr: "maison", translation_en: "house",
    category_id: 3, category_slug: "home", level: "beginner",
    audio_file: null, image_file: null,
    example_ar: "بَيْتِي كَبِير", example_fr: "Ma maison est grande",
    example_en: "My house is big",
    gender: "m", plural_ar: "بُيُوت", root_ar: "ب ي ت",
    is_learned: false, is_favorite: false, quiz_score: null,
  },
];

// ============================================================
// DONNÉES MOCK : LEÇONS DE LECTURE
// ============================================================

export const MOCK_READING_LESSONS: ReadingLesson[] = [
  {
    id: 1, order_num: 1,
    title_fr: "Les voyelles courtes - Fatha",
    title_en: "Short vowels - Fatha",
    level: "beginner", lesson_type: "syllables",
    description_fr: "Apprenez à prononcer les syllabes avec la voyelle fatha (a court).",
    content: [
      { arabic: "بَ", transliteration: "ba", translation_fr: "ba", audio_file: null, item_type: "syllable" },
      { arabic: "تَ", transliteration: "ta", translation_fr: "ta", audio_file: null, item_type: "syllable" },
      { arabic: "جَ", transliteration: "ja", translation_fr: "ja", audio_file: null, item_type: "syllable" },
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

// ============================================================
// DONNÉES MOCK : SOURATES
// ============================================================

export const MOCK_SURAHS: Surah[] = [
  {
    id: 1, number: 1,
    name_ar: "الفاتحة", name_fr: "L'Ouverture (Al-Fatiha)",
    name_en: "The Opening", transliteration: "Al-Fātiḥa",
    revelation_type: "meccan", verses_count: 7,
    order_revealed: 5, audio_file: null,
    description_fr: "La première sourate du Coran, récitée dans chaque unité de prière.",
    last_read_verse: null, is_completed: false,
  },
  {
    id: 2, number: 2,
    name_ar: "البقرة", name_fr: "La Vache (Al-Baqara)",
    name_en: "The Cow", transliteration: "Al-Baqara",
    revelation_type: "medinan", verses_count: 286,
    order_revealed: 87, audio_file: null,
    description_fr: "La plus longue sourate du Coran.",
    last_read_verse: null, is_completed: false,
  },
  {
    id: 114, number: 114,
    name_ar: "النَّاس", name_fr: "Les Hommes (An-Nas)",
    name_en: "The Mankind", transliteration: "An-Nās",
    revelation_type: "meccan", verses_count: 6,
    order_revealed: 21, audio_file: null,
    description_fr: "La dernière sourate du Coran, une supplication contre le mal.",
    last_read_verse: null, is_completed: false,
  },
];

export const MOCK_VERSES: Verse[] = [
  {
    id: 1, surah_id: 1, verse_number: 1,
    arabic_text: "بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ",
    translation_fr: "Au nom d'Allah, le Tout Miséricordieux, le Très Miséricordieux",
    translation_en: "In the name of Allah, the Entirely Merciful, the Especially Merciful",
    transliteration: "Bismi llāhi r-raḥmāni r-raḥīm",
    audio_file: null, juz: 1, page: 1, is_favorite: false,
  },
  {
    id: 2, surah_id: 1, verse_number: 2,
    arabic_text: "الْحَمْدُ لِلَّهِ رَبِّ الْعَالَمِينَ",
    translation_fr: "Louange à Allah, Seigneur de l'univers",
    translation_en: "All praise is due to Allah, Lord of the worlds",
    transliteration: "Al-ḥamdu li-llāhi rabbi l-ʿālamīn",
    audio_file: null, juz: 1, page: 1, is_favorite: false,
  },
  {
    id: 3, surah_id: 1, verse_number: 3,
    arabic_text: "الرَّحْمَٰنِ الرَّحِيمِ",
    translation_fr: "le Tout Miséricordieux, le Très Miséricordieux",
    translation_en: "The Entirely Merciful, the Especially Merciful",
    transliteration: "Ar-raḥmāni r-raḥīm",
    audio_file: null, juz: 1, page: 1, is_favorite: false,
  },
  {
    id: 4, surah_id: 1, verse_number: 4,
    arabic_text: "مَالِكِ يَوْمِ الدِّينِ",
    translation_fr: "Maître du Jour de la rétribution",
    translation_en: "Sovereign of the Day of Recompense",
    transliteration: "Māliki yawmi d-dīn",
    audio_file: null, juz: 1, page: 1, is_favorite: false,
  },
  {
    id: 5, surah_id: 1, verse_number: 5,
    arabic_text: "إِيَّاكَ نَعْبُدُ وَإِيَّاكَ نَسْتَعِينُ",
    translation_fr: "C'est Toi [Seul] que nous adorons, et c'est Toi [Seul] dont nous implorons le secours",
    translation_en: "It is You we worship and You we ask for help",
    transliteration: "Iyyāka naʿbudu wa-iyyāka nastaʿīn",
    audio_file: null, juz: 1, page: 1, is_favorite: false,
  },
  {
    id: 6, surah_id: 1, verse_number: 6,
    arabic_text: "اهْدِنَا الصِّرَاطَ الْمُسْتَقِيمَ",
    translation_fr: "Guide-nous dans le droit chemin",
    translation_en: "Guide us to the straight path",
    transliteration: "Ihdinā ṣ-ṣirāṭa l-mustaqīm",
    audio_file: null, juz: 1, page: 1, is_favorite: false,
  },
  {
    id: 7, surah_id: 1, verse_number: 7,
    arabic_text: "صِرَاطَ الَّذِينَ أَنْعَمْتَ عَلَيْهِمْ غَيْرِ الْمَغْضُوبِ عَلَيْهِمْ وَلَا الضَّالِّينَ",
    translation_fr: "le chemin de ceux que Tu as comblés de bienfaits, non pas de ceux qui ont encouru Ta colère, ni des égarés",
    translation_en: "The path of those upon whom You have bestowed favor, not of those who have evoked Your anger or of those who are astray",
    transliteration: "Ṣirāṭa lladhīna anʿamta ʿalayhim ghayri l-maghḍūbi ʿalayhim wa-lā ḍ-ḍāllīn",
    audio_file: null, juz: 1, page: 1, is_favorite: false,
  },
];
