/**
 * Content Provider unifié — interface unique pour le contenu pédagogique.
 *
 * Utilise le moteur statique (exerciseGenerator, templates, grammarRules)
 * et peut être enrichi par un LLM optionnel.
 */

import type { Level } from "@/types";
import {
  generateLetterIdentifyExercise,
  generateFormMatchExercise,
  generateTranslationExercise,
  generateMixedExercises,
  type GeneratedExercise,
} from "../pedagogy/exerciseGenerator";
import { DIALOGUE_TEMPLATES, PHRASE_TEMPLATES, type DialogueTemplate, type PhraseTemplate } from "../pedagogy/templates";
import { ARABIC_PRONOUNS, VERB_CONJUGATION_PAST, VERB_CONJUGATION_PRESENT, type GrammarExample } from "../pedagogy/grammarRules";

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

export interface DailyLesson {
  title_fr: string;
  title_en: string;
  sections: DailyLessonSection[];
}

export interface DailyLessonSection {
  type: "grammar" | "vocabulary" | "dialogue" | "exercise";
  title_fr: string;
  title_en: string;
  content: unknown;
}

/**
 * Génère un lot d'exercices pour une session de quiz.
 */
export function getExercises(
  letters: LetterData[],
  words: WordData[],
  count: number = 10,
  level: Level = "beginner",
  lang: "fr" | "en" = "fr"
): GeneratedExercise[] {
  return generateMixedExercises(letters, words, count, level, lang);
}

/**
 * Génère des exercices spécifiques aux lettres.
 */
export function getLetterExercises(
  letters: LetterData[],
  count: number = 5,
  lang: "fr" | "en" = "fr"
): GeneratedExercise[] {
  if (letters.length < 4) return [];

  const exercises: GeneratedExercise[] = [];
  for (let i = 0; i < count; i++) {
    const target = letters[Math.floor(Math.random() * letters.length)];
    if (i % 2 === 0) {
      exercises.push(generateLetterIdentifyExercise(target, letters, lang));
    } else {
      const forms: Array<"initial" | "medial" | "final"> = ["initial", "medial", "final"];
      exercises.push(generateFormMatchExercise(target, letters, forms[i % 3], lang));
    }
  }
  return exercises;
}

/**
 * Génère des exercices de vocabulaire.
 */
export function getWordExercises(
  words: WordData[],
  count: number = 5,
  lang: "fr" | "en" = "fr"
): GeneratedExercise[] {
  if (words.length < 4) return [];

  const exercises: GeneratedExercise[] = [];
  for (let i = 0; i < count; i++) {
    const target = words[Math.floor(Math.random() * words.length)];
    const direction = i % 2 === 0 ? "ar_to_fr" : "fr_to_ar";
    exercises.push(generateTranslationExercise(target, words, direction as "ar_to_fr" | "fr_to_ar", lang));
  }
  return exercises;
}

/**
 * Retourne un dialogue adapté au niveau.
 */
export function getDialogue(level: Level = "beginner"): DialogueTemplate | null {
  const levelMap: Record<Level, string[]> = {
    beginner: ["beginner"],
    intermediate: ["beginner", "intermediate"],
    advanced: ["beginner", "intermediate"],
    expert: ["beginner", "intermediate"],
  };
  const allowed = levelMap[level];
  const available = DIALOGUE_TEMPLATES.filter((d) => allowed.includes(d.level));
  if (available.length === 0) return null;
  return available[Math.floor(Math.random() * available.length)];
}

/**
 * Retourne des phrases d'exemple selon le niveau.
 */
export function getPhraseExamples(level: Level = "beginner", count: number = 3): PhraseTemplate[] {
  const levelMap: Record<Level, string[]> = {
    beginner: ["beginner"],
    intermediate: ["beginner", "intermediate"],
    advanced: ["beginner", "intermediate", "advanced"],
    expert: ["beginner", "intermediate", "advanced"],
  };
  const allowed = levelMap[level];
  const available = PHRASE_TEMPLATES.filter((p) => allowed.includes(p.level));
  const shuffled = [...available].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count);
}

/**
 * Retourne du contenu grammatical selon le sujet.
 */
export function getGrammarContent(topic: "pronouns" | "conjugation_past" | "conjugation_present"): GrammarExample[] {
  switch (topic) {
    case "pronouns":
      return ARABIC_PRONOUNS;
    case "conjugation_past":
      return VERB_CONJUGATION_PAST.map((v) => ({
        arabic: `${v.pronoun} ${v.verb}`,
        transliteration: v.transliteration,
        translation_fr: v.translation_fr,
        translation_en: v.translation_fr, // TODO: ajouter traductions EN
      }));
    case "conjugation_present":
      return VERB_CONJUGATION_PRESENT.map((v) => ({
        arabic: `${v.pronoun} ${v.verb}`,
        transliteration: v.transliteration,
        translation_fr: v.translation_fr,
        translation_en: v.translation_fr,
      }));
  }
}

/**
 * Génère une leçon quotidienne statique (sans LLM).
 */
export function getDailyLesson(
  letters: LetterData[],
  words: WordData[],
  level: Level = "beginner",
  lang: "fr" | "en" = "fr"
): DailyLesson {
  const sections: DailyLessonSection[] = [];

  // Section grammaire
  const grammarTopics = ["pronouns", "conjugation_past", "conjugation_present"] as const;
  const topic = grammarTopics[Math.floor(Math.random() * grammarTopics.length)];
  const grammarContent = getGrammarContent(topic);
  sections.push({
    type: "grammar",
    title_fr: "Point grammatical",
    title_en: "Grammar point",
    content: grammarContent.slice(0, 5),
  });

  // Section vocabulaire
  const phraseExamples = getPhraseExamples(level, 2);
  if (phraseExamples.length > 0) {
    sections.push({
      type: "vocabulary",
      title_fr: "Expressions utiles",
      title_en: "Useful expressions",
      content: phraseExamples,
    });
  }

  // Section dialogue
  const dialogue = getDialogue(level);
  if (dialogue) {
    sections.push({
      type: "dialogue",
      title_fr: dialogue.title_fr,
      title_en: dialogue.title_en,
      content: dialogue,
    });
  }

  // Section exercices
  const exercises = getExercises(letters, words, 5, level, lang);
  if (exercises.length > 0) {
    sections.push({
      type: "exercise",
      title_fr: "Mini-quiz",
      title_en: "Mini-quiz",
      content: exercises,
    });
  }

  return {
    title_fr: "Leçon du jour",
    title_en: "Daily lesson",
    sections,
  };
}
