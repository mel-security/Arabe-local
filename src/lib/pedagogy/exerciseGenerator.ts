/**
 * Générateur d'exercices déterministe (sans LLM).
 *
 * Génère des quiz et exercices à partir des données locales
 * (lettres, mots, règles grammaticales) selon le niveau de l'utilisateur.
 */

import type { Level } from "@/types";

export type ExerciseType =
  | "identify_letter"
  | "match_form"
  | "identify_vowel"
  | "translate_word"
  | "fill_blank"
  | "match_pair"
  | "order_letters"
  | "identify_gender"
  | "grammar_rule";

export interface GeneratedExercise {
  type: ExerciseType;
  question: string;
  arabic?: string;
  options: string[];
  correct_answer: string;
  hint?: string;
  difficulty: Level;
}

interface LetterData {
  id: number;
  arabic: string;
  name_fr: string;
  name_en: string;
  transliteration: string;
  isolated_form: string;
  initial_form: string;
  medial_form: string;
  final_form: string;
}

interface WordData {
  id: number;
  arabic: string;
  transliteration: string;
  translation_fr: string;
  translation_en: string;
  gender?: string | null;
  plural_ar?: string | null;
}

/**
 * Génère un exercice d'identification de lettre.
 */
export function generateLetterIdentifyExercise(
  targetLetter: LetterData,
  allLetters: LetterData[],
  lang: "fr" | "en" = "fr"
): GeneratedExercise {
  const distractors = pickRandom(
    allLetters.filter((l) => l.id !== targetLetter.id),
    3
  );

  const options = shuffle([
    lang === "fr" ? targetLetter.name_fr : targetLetter.name_en,
    ...distractors.map((l) => (lang === "fr" ? l.name_fr : l.name_en)),
  ]);

  return {
    type: "identify_letter",
    question: lang === "fr"
      ? "Quelle est cette lettre arabe ?"
      : "What is this Arabic letter?",
    arabic: targetLetter.arabic,
    options,
    correct_answer: lang === "fr" ? targetLetter.name_fr : targetLetter.name_en,
    difficulty: "beginner",
  };
}

/**
 * Génère un exercice d'association forme/lettre.
 */
export function generateFormMatchExercise(
  targetLetter: LetterData,
  allLetters: LetterData[],
  formType: "initial" | "medial" | "final" = "initial",
  lang: "fr" | "en" = "fr"
): GeneratedExercise {
  const formMap = {
    initial: "initial_form",
    medial: "medial_form",
    final: "final_form",
  } as const;

  const formLabels = {
    initial: lang === "fr" ? "initiale" : "initial",
    medial: lang === "fr" ? "médiane" : "medial",
    final: lang === "fr" ? "finale" : "final",
  };

  const targetForm = targetLetter[formMap[formType]];
  const distractors = pickRandom(
    allLetters.filter((l) => l.id !== targetLetter.id),
    3
  );

  const options = shuffle([
    targetForm,
    ...distractors.map((l) => l[formMap[formType]]),
  ]);

  return {
    type: "match_form",
    question: lang === "fr"
      ? `Quelle est la forme ${formLabels[formType]} de « ${targetLetter.name_fr} » ?`
      : `What is the ${formLabels[formType]} form of "${targetLetter.name_en}"?`,
    arabic: targetLetter.arabic,
    options,
    correct_answer: targetForm,
    difficulty: "intermediate",
  };
}

/**
 * Génère un exercice de traduction mot arabe → français.
 */
export function generateTranslationExercise(
  targetWord: WordData,
  allWords: WordData[],
  direction: "ar_to_fr" | "fr_to_ar" = "ar_to_fr",
  lang: "fr" | "en" = "fr"
): GeneratedExercise {
  const distractors = pickRandom(
    allWords.filter((w) => w.id !== targetWord.id),
    3
  );

  if (direction === "ar_to_fr") {
    const options = shuffle([
      lang === "fr" ? targetWord.translation_fr : targetWord.translation_en,
      ...distractors.map((w) => (lang === "fr" ? w.translation_fr : w.translation_en)),
    ]);

    return {
      type: "translate_word",
      question: lang === "fr"
        ? "Que signifie ce mot ?"
        : "What does this word mean?",
      arabic: targetWord.arabic,
      options,
      correct_answer: lang === "fr" ? targetWord.translation_fr : targetWord.translation_en,
      hint: targetWord.transliteration,
      difficulty: "beginner",
    };
  } else {
    const options = shuffle([
      targetWord.arabic,
      ...distractors.map((w) => w.arabic),
    ]);

    return {
      type: "translate_word",
      question: lang === "fr"
        ? `Comment dit-on « ${targetWord.translation_fr} » en arabe ?`
        : `How do you say "${targetWord.translation_en}" in Arabic?`,
      options,
      correct_answer: targetWord.arabic,
      difficulty: "beginner",
    };
  }
}

/**
 * Génère un exercice d'identification du genre.
 */
export function generateGenderExercise(
  targetWord: WordData,
  lang: "fr" | "en" = "fr"
): GeneratedExercise | null {
  if (!targetWord.gender || targetWord.gender === "n") return null;

  const masLabel = lang === "fr" ? "Masculin" : "Masculine";
  const femLabel = lang === "fr" ? "Féminin" : "Feminine";

  return {
    type: "identify_gender",
    question: lang === "fr"
      ? "Quel est le genre de ce mot ?"
      : "What is the gender of this word?",
    arabic: targetWord.arabic,
    options: [masLabel, femLabel],
    correct_answer: targetWord.gender === "m" ? masLabel : femLabel,
    hint: targetWord.transliteration,
    difficulty: "beginner",
  };
}

/**
 * Génère un lot d'exercices mixtes pour une session.
 */
export function generateMixedExercises(
  letters: LetterData[],
  words: WordData[],
  count: number = 10,
  level: Level = "beginner",
  lang: "fr" | "en" = "fr"
): GeneratedExercise[] {
  const exercises: GeneratedExercise[] = [];

  if (letters.length >= 4) {
    // 40% exercices de lettres
    const letterCount = Math.ceil(count * 0.4);
    for (let i = 0; i < letterCount && exercises.length < count; i++) {
      const target = pickRandom(letters, 1)[0];
      if (i % 2 === 0) {
        exercises.push(generateLetterIdentifyExercise(target, letters, lang));
      } else if (level !== "beginner") {
        const forms: Array<"initial" | "medial" | "final"> = ["initial", "medial", "final"];
        exercises.push(generateFormMatchExercise(target, letters, forms[i % 3], lang));
      } else {
        exercises.push(generateLetterIdentifyExercise(target, letters, lang));
      }
    }
  }

  if (words.length >= 4) {
    // 40% exercices de vocabulaire
    const wordCount = Math.ceil(count * 0.4);
    for (let i = 0; i < wordCount && exercises.length < count; i++) {
      const target = pickRandom(words, 1)[0];
      if (i % 3 === 0) {
        exercises.push(generateTranslationExercise(target, words, "ar_to_fr", lang));
      } else if (i % 3 === 1) {
        exercises.push(generateTranslationExercise(target, words, "fr_to_ar", lang));
      } else {
        const genderEx = generateGenderExercise(target, lang);
        if (genderEx) {
          exercises.push(genderEx);
        } else {
          exercises.push(generateTranslationExercise(target, words, "ar_to_fr", lang));
        }
      }
    }
  }

  return shuffle(exercises).slice(0, count);
}

// ============================================================
// Utilitaires
// ============================================================

function pickRandom<T>(arr: T[], count: number): T[] {
  const shuffled = [...arr].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count);
}

function shuffle<T>(arr: T[]): T[] {
  const result = [...arr];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}
