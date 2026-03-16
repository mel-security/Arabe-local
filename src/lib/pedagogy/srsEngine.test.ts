import { describe, it, expect } from "vitest";
import { calculateSRS, getDueCards, createCard, type SRSCard } from "./srsEngine";

describe("SRS Engine (SM-2)", () => {
  const makeCard = (overrides?: Partial<SRSCard>): SRSCard => ({
    id: 1,
    card_type: "letter",
    item_id: 1,
    front: "ب",
    back: "Ba",
    easiness_factor: 2.5,
    interval_days: 1,
    repetitions: 0,
    next_review: new Date().toISOString().split("T")[0],
    last_review: null,
    ...overrides,
  });

  describe("calculateSRS", () => {
    it("should reset on quality < 3", () => {
      const card = makeCard({ repetitions: 3, interval_days: 10, easiness_factor: 2.5 });
      const result = calculateSRS(card, 2);

      expect(result.repetitions).toBe(0);
      expect(result.interval_days).toBe(1);
    });

    it("should progress on quality >= 3", () => {
      const card = makeCard({ repetitions: 0, interval_days: 1 });
      const result = calculateSRS(card, 4);

      expect(result.repetitions).toBe(1);
      expect(result.interval_days).toBe(1);
    });

    it("should set interval to 6 on second correct", () => {
      const card = makeCard({ repetitions: 1, interval_days: 1 });
      const result = calculateSRS(card, 4);

      expect(result.repetitions).toBe(2);
      expect(result.interval_days).toBe(6);
    });

    it("should increase interval by EF on subsequent corrects", () => {
      const card = makeCard({ repetitions: 2, interval_days: 6, easiness_factor: 2.5 });
      const result = calculateSRS(card, 4);

      expect(result.repetitions).toBe(3);
      expect(result.interval_days).toBe(15); // 6 * 2.5 = 15
    });

    it("should decrease EF on low quality", () => {
      const card = makeCard({ easiness_factor: 2.5 });
      const result = calculateSRS(card, 3);

      expect(result.easiness_factor).toBeLessThan(2.5);
    });

    it("should increase EF on high quality", () => {
      const card = makeCard({ easiness_factor: 2.5 });
      const result = calculateSRS(card, 5);

      expect(result.easiness_factor).toBeGreaterThanOrEqual(2.5);
    });

    it("should never let EF go below 1.3", () => {
      const card = makeCard({ easiness_factor: 1.3 });
      const result = calculateSRS(card, 0);

      expect(result.easiness_factor).toBeGreaterThanOrEqual(1.3);
    });

    it("should set next_review to a future date", () => {
      const card = makeCard();
      const result = calculateSRS(card, 4);
      const today = new Date().toISOString().split("T")[0];

      expect(result.next_review >= today).toBe(true);
    });

    it("should clamp quality to 0-5", () => {
      const card = makeCard();
      const result1 = calculateSRS(card, -1);
      const result2 = calculateSRS(card, 10);

      expect(result1.repetitions).toBe(0); // quality 0 → reset
      expect(result2.easiness_factor).toBeGreaterThan(2.5); // quality 5 → increase
    });
  });

  describe("getDueCards", () => {
    it("should return cards due today or earlier", () => {
      const today = new Date().toISOString().split("T")[0];
      const yesterday = new Date(Date.now() - 86400000).toISOString().split("T")[0];
      const tomorrow = new Date(Date.now() + 86400000).toISOString().split("T")[0];

      const cards = [
        makeCard({ id: 1, next_review: yesterday }),
        makeCard({ id: 2, next_review: today }),
        makeCard({ id: 3, next_review: tomorrow }),
      ];

      const due = getDueCards(cards);
      expect(due).toHaveLength(2);
      expect(due.map((c) => c.id)).toEqual([1, 2]);
    });
  });

  describe("createCard", () => {
    it("should create a card with default SM-2 values", () => {
      const card = createCard("word", 42, "مَرْحَبًا", "Bonjour");

      expect(card.card_type).toBe("word");
      expect(card.item_id).toBe(42);
      expect(card.front).toBe("مَرْحَبًا");
      expect(card.back).toBe("Bonjour");
      expect(card.easiness_factor).toBe(2.5);
      expect(card.interval_days).toBe(1);
      expect(card.repetitions).toBe(0);
    });
  });
});
