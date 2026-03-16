/**
 * Règles grammaticales structurées pour le moteur pédagogique.
 *
 * Ce fichier contient les données de référence pour les règles
 * qui ne sont pas encore en base de données (fallback statique).
 */

export interface GrammarExample {
  arabic: string;
  transliteration: string;
  translation_fr: string;
  translation_en: string;
}

export interface GrammarRule {
  id: string;
  category: string;
  title_fr: string;
  title_en: string;
  level: "beginner" | "intermediate" | "advanced" | "expert";
  explanation_fr: string;
  explanation_en: string;
  examples: GrammarExample[];
}

/**
 * Pronoms personnels arabes — données de référence.
 */
export const ARABIC_PRONOUNS: GrammarExample[] = [
  { arabic: "أَنَا", transliteration: "anā", translation_fr: "je / moi", translation_en: "I / me" },
  { arabic: "أَنْتَ", transliteration: "anta", translation_fr: "tu (masculin)", translation_en: "you (m.)" },
  { arabic: "أَنْتِ", transliteration: "anti", translation_fr: "tu (féminin)", translation_en: "you (f.)" },
  { arabic: "هُوَ", transliteration: "huwa", translation_fr: "il / lui", translation_en: "he / him" },
  { arabic: "هِيَ", transliteration: "hiya", translation_fr: "elle", translation_en: "she / her" },
  { arabic: "نَحْنُ", transliteration: "naḥnu", translation_fr: "nous", translation_en: "we" },
  { arabic: "أَنْتُمْ", transliteration: "antum", translation_fr: "vous (masculin)", translation_en: "you (m. pl.)" },
  { arabic: "أَنْتُنَّ", transliteration: "antunna", translation_fr: "vous (féminin)", translation_en: "you (f. pl.)" },
  { arabic: "هُمْ", transliteration: "hum", translation_fr: "ils / eux", translation_en: "they (m.)" },
  { arabic: "هُنَّ", transliteration: "hunna", translation_fr: "elles", translation_en: "they (f.)" },
];

/**
 * Lettres solaires et lunaires — pour l'article défini.
 */
export const SUN_LETTERS = ["ت", "ث", "د", "ذ", "ر", "ز", "س", "ش", "ص", "ض", "ط", "ظ", "ل", "ن"];
export const MOON_LETTERS = ["ا", "ب", "ج", "ح", "خ", "ع", "غ", "ف", "ق", "ك", "م", "ه", "و", "ي"];

/**
 * Templates de phrases simples pour la génération d'exercices.
 * Pattern: [sujet] [verbe/adjectif] — pour construire des phrases de base.
 */
export const SENTENCE_TEMPLATES = {
  nominal: [
    { pattern_fr: "[sujet] [adjectif]", pattern_ar: "[subject] [adjective]", example_ar: "البَيْتُ كَبِيرٌ", example_fr: "La maison est grande" },
    { pattern_fr: "[sujet] [nom]", pattern_ar: "[subject] [noun]", example_ar: "أَبِي مُعَلِّمٌ", example_fr: "Mon père est enseignant" },
    { pattern_fr: "هَذَا/هَذِهِ [nom]", pattern_ar: "this is [noun]", example_ar: "هَذَا كِتَابٌ", example_fr: "Ceci est un livre" },
  ],
  verbal: [
    { pattern_fr: "[verbe] [sujet] [complément]", pattern_ar: "[verb] [subject] [object]", example_ar: "يَقْرَأُ الوَلَدُ الكِتَابَ", example_fr: "Le garçon lit le livre" },
    { pattern_fr: "[verbe] [sujet]", pattern_ar: "[verb] [subject]", example_ar: "ذَهَبَ الرَّجُلُ", example_fr: "L'homme est parti" },
  ],
} as const;

/**
 * Conjugaison basique du verbe "كَتَبَ" (kataba — écrire) au passé.
 * Sert de modèle pour les verbes trilitères réguliers.
 */
export const VERB_CONJUGATION_PAST = [
  { pronoun: "أَنَا", verb: "كَتَبْتُ", transliteration: "katabtu", translation_fr: "j'ai écrit" },
  { pronoun: "أَنْتَ", verb: "كَتَبْتَ", transliteration: "katabta", translation_fr: "tu as écrit (m.)" },
  { pronoun: "أَنْتِ", verb: "كَتَبْتِ", transliteration: "katabti", translation_fr: "tu as écrit (f.)" },
  { pronoun: "هُوَ", verb: "كَتَبَ", transliteration: "kataba", translation_fr: "il a écrit" },
  { pronoun: "هِيَ", verb: "كَتَبَتْ", transliteration: "katabat", translation_fr: "elle a écrit" },
  { pronoun: "نَحْنُ", verb: "كَتَبْنَا", transliteration: "katabnā", translation_fr: "nous avons écrit" },
  { pronoun: "هُمْ", verb: "كَتَبُوا", transliteration: "katabū", translation_fr: "ils ont écrit" },
];

/**
 * Conjugaison basique du verbe "يَكْتُبُ" (yaktubu — écrire) au présent.
 */
export const VERB_CONJUGATION_PRESENT = [
  { pronoun: "أَنَا", verb: "أَكْتُبُ", transliteration: "aktubu", translation_fr: "j'écris" },
  { pronoun: "أَنْتَ", verb: "تَكْتُبُ", transliteration: "taktubu", translation_fr: "tu écris (m.)" },
  { pronoun: "أَنْتِ", verb: "تَكْتُبِينَ", transliteration: "taktubīna", translation_fr: "tu écris (f.)" },
  { pronoun: "هُوَ", verb: "يَكْتُبُ", transliteration: "yaktubu", translation_fr: "il écrit" },
  { pronoun: "هِيَ", verb: "تَكْتُبُ", transliteration: "taktubu", translation_fr: "elle écrit" },
  { pronoun: "نَحْنُ", verb: "نَكْتُبُ", transliteration: "naktubu", translation_fr: "nous écrivons" },
  { pronoun: "هُمْ", verb: "يَكْتُبُونَ", transliteration: "yaktubūna", translation_fr: "ils écrivent" },
];
