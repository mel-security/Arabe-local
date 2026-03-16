import type { LLMContextData, Level } from "@/types";
import { lettersApi, wordsApi, progressApi } from "../database/api";

/**
 * Service de récupération du contexte local depuis SQLite
 * pour injection dans les prompts LLM (RAG simplifié)
 */
export class RetrievalService {
  async getContextForChat(
    level: Level,
    options: {
      includeLetters?: boolean;
      includeWords?: boolean;
      includeProgress?: boolean;
      surahVerses?: Array<{ arabic_text: string; translation_fr: string; verse_number: number }>;
      lessonContext?: string;
    } = {}
  ): Promise<LLMContextData> {
    const ctx: LLMContextData = { user_level: level };

    const tasks: Promise<void>[] = [];

    if (options.includeLetters !== false) {
      tasks.push(
        lettersApi.getAll().then((letters) => {
          const learned = letters.filter((l) => l.is_learned).slice(0, 10);
          ctx.letters = learned.map((l) => ({
            arabic: l.arabic,
            name_fr: l.name_fr,
            transliteration: l.transliteration,
          }));
        }).catch(() => {})
      );
    }

    if (options.includeWords !== false) {
      tasks.push(
        wordsApi.getAll().then((words) => {
          const learned = words.filter((w) => w.is_learned).slice(0, 15);
          ctx.words = learned.map((w) => ({
            arabic: w.arabic,
            translation_fr: w.translation_fr,
            transliteration: w.transliteration,
          }));
        }).catch(() => {})
      );
    }

    if (options.includeProgress !== false) {
      tasks.push(
        progressApi.getOverall().then((progress) => {
          ctx.progress = progress;
        }).catch(() => {})
      );
    }

    if (options.surahVerses) {
      ctx.verses = options.surahVerses;
    }

    if (options.lessonContext) {
      ctx.lesson_context = options.lessonContext;
    }

    await Promise.all(tasks);
    return ctx;
  }

  async getLetterContext(letterId: number): Promise<LLMContextData> {
    try {
      const letter = await lettersApi.getById(letterId);
      return {
        letters: [{ arabic: letter.arabic, name_fr: letter.name_fr, transliteration: letter.transliteration }],
        lesson_context: `Lettre étudiée : ${letter.name_fr} (${letter.arabic}), formes : ${letter.isolated_form} / ${letter.initial_form} / ${letter.medial_form} / ${letter.final_form}`,
      };
    } catch {
      return {};
    }
  }

  async getWordContext(wordId: number): Promise<LLMContextData> {
    try {
      const word = await wordsApi.getById(wordId);
      return {
        words: [{ arabic: word.arabic, translation_fr: word.translation_fr, transliteration: word.transliteration }],
        lesson_context: `Mot étudié : ${word.arabic} (${word.transliteration}) = ${word.translation_fr}` +
          (word.root_ar ? `. Racine : ${word.root_ar}` : "") +
          (word.example_ar ? `. Exemple : ${word.example_ar}` : ""),
      };
    } catch {
      return {};
    }
  }
}

export const retrievalService = new RetrievalService();
