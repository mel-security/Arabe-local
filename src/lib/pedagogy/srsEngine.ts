/**
 * Moteur de répétition espacée (SRS) — algorithme SM-2 simplifié.
 *
 * SM-2 utilise un facteur de facilité (EF) et un intervalle croissant.
 * Qualité de réponse: 0 (échec total) → 5 (parfait sans hésitation)
 */

export interface SRSCard {
  id: number;
  card_type: "letter" | "word" | "grammar_rule";
  item_id: number;
  front: string;
  back: string;
  easiness_factor: number;
  interval_days: number;
  repetitions: number;
  next_review: string;
  last_review: string | null;
}

export interface SRSReviewResult {
  easiness_factor: number;
  interval_days: number;
  repetitions: number;
  next_review: string;
}

/**
 * Calcule les nouveaux paramètres SM-2 après une révision.
 *
 * @param card - Carte actuelle
 * @param quality - Qualité de la réponse (0-5)
 *   0 = pas de souvenir
 *   1 = mauvaise réponse, reconnu après
 *   2 = mauvaise réponse, semble facile après
 *   3 = bonne réponse avec difficulté
 *   4 = bonne réponse
 *   5 = parfait
 * @returns Nouveaux paramètres de la carte
 */
export function calculateSRS(card: SRSCard, quality: number): SRSReviewResult {
  const q = Math.max(0, Math.min(5, Math.round(quality)));

  // Calculer le nouveau facteur de facilité
  let newEF = card.easiness_factor + (0.1 - (5 - q) * (0.08 + (5 - q) * 0.02));
  newEF = Math.max(1.3, newEF); // EF minimum de 1.3

  let newInterval: number;
  let newReps: number;

  if (q < 3) {
    // Réponse incorrecte → reset
    newReps = 0;
    newInterval = 1;
  } else {
    // Réponse correcte → progression
    newReps = card.repetitions + 1;
    if (newReps === 1) {
      newInterval = 1;
    } else if (newReps === 2) {
      newInterval = 6;
    } else {
      newInterval = Math.round(card.interval_days * newEF);
    }
  }

  // Calculer la prochaine date de révision
  const now = new Date();
  const nextDate = new Date(now);
  nextDate.setDate(nextDate.getDate() + newInterval);

  return {
    easiness_factor: Math.round(newEF * 100) / 100,
    interval_days: newInterval,
    repetitions: newReps,
    next_review: nextDate.toISOString().split("T")[0],
  };
}

/**
 * Retourne les cartes dues pour révision aujourd'hui.
 */
export function getDueCards(cards: SRSCard[]): SRSCard[] {
  const today = new Date().toISOString().split("T")[0];
  return cards.filter((c) => c.next_review <= today);
}

/**
 * Crée une nouvelle carte SRS à partir d'un élément d'apprentissage.
 */
export function createCard(
  cardType: SRSCard["card_type"],
  itemId: number,
  front: string,
  back: string
): Omit<SRSCard, "id"> {
  return {
    card_type: cardType,
    item_id: itemId,
    front,
    back,
    easiness_factor: 2.5,
    interval_days: 1,
    repetitions: 0,
    next_review: new Date().toISOString().split("T")[0],
    last_review: null,
  };
}
