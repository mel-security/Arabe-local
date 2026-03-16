import { describe, it, expect } from "vitest";
import {
  generateLetterIdentifyExercise,
  generateTranslationExercise,
  generateGenderExercise,
  generateMixedExercises,
} from "./exerciseGenerator";

const LETTERS = [
  { id: 1, arabic: "ا", name_fr: "Alif", name_en: "Alif", transliteration: "a", isolated_form: "ا", initial_form: "ا", medial_form: "ا", final_form: "ا" },
  { id: 2, arabic: "ب", name_fr: "Ba", name_en: "Ba", transliteration: "b", isolated_form: "ب", initial_form: "بـ", medial_form: "ـبـ", final_form: "ـب" },
  { id: 3, arabic: "ت", name_fr: "Ta", name_en: "Ta", transliteration: "t", isolated_form: "ت", initial_form: "تـ", medial_form: "ـتـ", final_form: "ـت" },
  { id: 4, arabic: "ث", name_fr: "Tha", name_en: "Tha", transliteration: "th", isolated_form: "ث", initial_form: "ثـ", medial_form: "ـثـ", final_form: "ـث" },
  { id: 5, arabic: "ج", name_fr: "Jim", name_en: "Jim", transliteration: "j", isolated_form: "ج", initial_form: "جـ", medial_form: "ـجـ", final_form: "ـج" },
];

const WORDS = [
  { id: 1, arabic: "مَرْحَبًا", transliteration: "marhaban", translation_fr: "Bonjour", translation_en: "Hello", gender: null, plural_ar: null },
  { id: 2, arabic: "أَب", transliteration: "ab", translation_fr: "père", translation_en: "father", gender: "m", plural_ar: "آبَاء" },
  { id: 3, arabic: "أُمّ", transliteration: "umm", translation_fr: "mère", translation_en: "mother", gender: "f", plural_ar: "أُمَّهَات" },
  { id: 4, arabic: "بَيْت", transliteration: "bayt", translation_fr: "maison", translation_en: "house", gender: "m", plural_ar: "بُيُوت" },
  { id: 5, arabic: "كِتَاب", transliteration: "kitab", translation_fr: "livre", translation_en: "book", gender: "m", plural_ar: "كُتُب" },
];

describe("Exercise Generator", () => {
  describe("generateLetterIdentifyExercise", () => {
    it("should generate a valid exercise", () => {
      const ex = generateLetterIdentifyExercise(LETTERS[0], LETTERS, "fr");

      expect(ex.type).toBe("identify_letter");
      expect(ex.arabic).toBe("ا");
      expect(ex.options).toHaveLength(4);
      expect(ex.options).toContain("Alif");
      expect(ex.correct_answer).toBe("Alif");
    });

    it("should work in English", () => {
      const ex = generateLetterIdentifyExercise(LETTERS[1], LETTERS, "en");

      expect(ex.correct_answer).toBe("Ba");
      expect(ex.question).toContain("Arabic letter");
    });
  });

  describe("generateTranslationExercise", () => {
    it("should generate ar_to_fr exercise", () => {
      const ex = generateTranslationExercise(WORDS[1], WORDS, "ar_to_fr", "fr");

      expect(ex.type).toBe("translate_word");
      expect(ex.arabic).toBe("أَب");
      expect(ex.options).toHaveLength(4);
      expect(ex.correct_answer).toBe("père");
    });

    it("should generate fr_to_ar exercise", () => {
      const ex = generateTranslationExercise(WORDS[1], WORDS, "fr_to_ar", "fr");

      expect(ex.type).toBe("translate_word");
      expect(ex.options).toContain("أَب");
      expect(ex.correct_answer).toBe("أَب");
    });
  });

  describe("generateGenderExercise", () => {
    it("should identify masculine", () => {
      const ex = generateGenderExercise(WORDS[1], "fr");
      expect(ex).not.toBeNull();
      expect(ex!.correct_answer).toBe("Masculin");
    });

    it("should identify feminine", () => {
      const ex = generateGenderExercise(WORDS[2], "fr");
      expect(ex).not.toBeNull();
      expect(ex!.correct_answer).toBe("Féminin");
    });

    it("should return null for genderless words", () => {
      const ex = generateGenderExercise(WORDS[0], "fr");
      expect(ex).toBeNull();
    });
  });

  describe("generateMixedExercises", () => {
    it("should generate the requested number of exercises", () => {
      const exercises = generateMixedExercises(LETTERS, WORDS, 8, "beginner", "fr");
      expect(exercises.length).toBeLessThanOrEqual(8);
      expect(exercises.length).toBeGreaterThan(0);
    });

    it("should handle empty arrays", () => {
      const exercises = generateMixedExercises([], [], 5, "beginner", "fr");
      expect(exercises).toHaveLength(0);
    });

    it("should include both letter and word exercises", () => {
      const exercises = generateMixedExercises(LETTERS, WORDS, 10, "beginner", "fr");
      const types = new Set(exercises.map((e) => e.type));

      expect(types.has("identify_letter")).toBe(true);
      expect(types.has("translate_word")).toBe(true);
    });
  });
});
