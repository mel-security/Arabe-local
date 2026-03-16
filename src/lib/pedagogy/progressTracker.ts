/**
 * Suivi de progression et recommandations pédagogiques.
 *
 * Analyse la progression de l'utilisateur et recommande
 * les prochaines étapes d'apprentissage.
 */

import type { Level, OverallProgress, Module } from "@/types";

export interface LearningRecommendation {
  module: Module;
  action: "learn" | "review" | "quiz" | "advance";
  priority: number; // 1 = le plus urgent
  reason_fr: string;
  reason_en: string;
}

/**
 * Calcule le niveau effectif basé sur la progression.
 */
export function calculateEffectiveLevel(progress: OverallProgress): Level {
  const letterPercent = progress.letters_total > 0
    ? (progress.letters_learned / progress.letters_total) * 100
    : 0;
  const wordPercent = progress.words_total > 0
    ? (progress.words_learned / progress.words_total) * 100
    : 0;
  const readingPercent = progress.reading_total > 0
    ? (progress.reading_completed / progress.reading_total) * 100
    : 0;

  const avg = (letterPercent + wordPercent + readingPercent) / 3;

  if (avg >= 80) return "advanced";
  if (avg >= 40) return "intermediate";
  return "beginner";
}

/**
 * Génère des recommandations d'apprentissage basées sur la progression.
 */
export function getRecommendations(progress: OverallProgress): LearningRecommendation[] {
  const recs: LearningRecommendation[] = [];

  // Priorité 1 : Lettres non apprises
  if (progress.letters_learned < progress.letters_total) {
    const remaining = progress.letters_total - progress.letters_learned;
    recs.push({
      module: "letters",
      action: remaining > progress.letters_total * 0.5 ? "learn" : "review",
      priority: progress.letters_learned < 10 ? 1 : 3,
      reason_fr: `${remaining} lettres à apprendre`,
      reason_en: `${remaining} letters to learn`,
    });
  }

  // Priorité 2 : Vocabulaire
  if (progress.words_learned < progress.words_total) {
    const remaining = progress.words_total - progress.words_learned;
    recs.push({
      module: "words",
      action: "learn",
      priority: progress.letters_learned >= 14 ? 2 : 4,
      reason_fr: `${remaining} mots à apprendre`,
      reason_en: `${remaining} words to learn`,
    });
  }

  // Priorité 3 : Lecture
  if (progress.reading_completed < progress.reading_total) {
    recs.push({
      module: "reading",
      action: "learn",
      priority: progress.letters_learned >= 20 ? 2 : 5,
      reason_fr: `${progress.reading_total - progress.reading_completed} leçons de lecture disponibles`,
      reason_en: `${progress.reading_total - progress.reading_completed} reading lessons available`,
    });
  }

  // Quiz si assez de contenu appris
  if (progress.letters_learned >= 5) {
    recs.push({
      module: "letters",
      action: "quiz",
      priority: 3,
      reason_fr: "Testez vos connaissances des lettres",
      reason_en: "Test your letter knowledge",
    });
  }

  if (progress.words_learned >= 5) {
    recs.push({
      module: "words",
      action: "quiz",
      priority: 3,
      reason_fr: "Testez votre vocabulaire",
      reason_en: "Test your vocabulary",
    });
  }

  return recs.sort((a, b) => a.priority - b.priority);
}

/**
 * Calcule un score de progression global (0-100).
 */
export function calculateOverallScore(progress: OverallProgress): number {
  const weights = { letters: 0.3, words: 0.3, reading: 0.25, quran: 0.15 };

  const letterScore = progress.letters_total > 0
    ? (progress.letters_learned / progress.letters_total) * 100
    : 0;
  const wordScore = progress.words_total > 0
    ? (progress.words_learned / progress.words_total) * 100
    : 0;
  const readingScore = progress.reading_total > 0
    ? (progress.reading_completed / progress.reading_total) * 100
    : 0;
  const quranScore = progress.quran_surahs_completed > 0
    ? Math.min(100, (progress.quran_surahs_completed / 10) * 100)
    : 0;

  return Math.round(
    letterScore * weights.letters +
    wordScore * weights.words +
    readingScore * weights.reading +
    quranScore * weights.quran
  );
}
