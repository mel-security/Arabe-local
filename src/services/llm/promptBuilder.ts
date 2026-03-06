import type { ChatMode, Level, LLMContextData } from "@/types";

const LEVEL_LABELS: Record<Level, string> = {
  beginner: "débutant",
  intermediate: "intermédiaire",
  advanced: "avancé",
  expert: "expert",
};

export class PromptBuilder {
  private language: "fr" | "en";

  constructor(language: "fr" | "en" = "fr") {
    this.language = language;
  }

  buildSystemPrompt(mode: ChatMode, level: Level, context?: LLMContextData): string {
    const levelLabel = LEVEL_LABELS[level];
    const base = this.getBasePrompt(mode, levelLabel);
    const contextBlock = this.buildContextBlock(context);
    return contextBlock ? `${base}\n\n${contextBlock}` : base;
  }

  private getBasePrompt(mode: ChatMode, levelLabel: string): string {
    const lang = this.language === "fr" ? "français" : "English";
    const arabicNote = "Utilise des caractères arabes quand tu mentionnes des mots arabes, accompagnés de leur translittération.";

    const prompts: Record<ChatMode, string> = {
      general: `Tu es un assistant pédagogique spécialisé dans l'enseignement de l'arabe.
L'utilisateur est de niveau ${levelLabel}.
Réponds en ${lang}. ${arabicNote}
Sois encourageant, clair et adapté au niveau de l'apprenant.`,

      tutor: `Tu es un tuteur expert en arabe, spécialisé pour les apprenants de niveau ${levelLabel}.
Réponds en ${lang}. ${arabicNote}
Propose des explications progressives, des exemples concrets et des exercices pratiques.
Adapte toujours ton vocabulaire et la complexité à un niveau ${levelLabel}.`,

      explanation: `Tu es un professeur d'arabe qui explique de manière détaillée et claire.
L'apprenant est de niveau ${levelLabel}. Réponds en ${lang}.
${arabicNote}
Donne des explications étymologiques, des règles grammaticales et des exemples d'usage.`,

      quiz: `Tu es un professeur qui crée des exercices et quiz pour apprendre l'arabe.
L'apprenant est de niveau ${levelLabel}. Réponds en ${lang}.
${arabicNote}
Propose des questions progressives, donne le feedback et explique les bonnes réponses.`,

      correction: `Tu es un correcteur bienveillant pour les apprenants d'arabe de niveau ${levelLabel}.
Réponds en ${lang}. ${arabicNote}
Identifie les erreurs, explique pourquoi c'est incorrect et donne la forme correcte.
Encourage toujours l'apprenant même en cas d'erreur.`,

      quran: `Tu es un guide pour la compréhension du Coran, spécialisé pour les apprenants de niveau ${levelLabel}.
Réponds en ${lang}. ${arabicNote}
Aide à comprendre les versets, leur sens, leur contexte et leur prononciation.
Reste respectueux et pédagogique dans tes explications.`,
    };

    return prompts[mode] ?? prompts.general;
  }

  private buildContextBlock(context?: LLMContextData): string {
    if (!context) return "";
    const parts: string[] = [];

    if (context.letters && context.letters.length > 0) {
      const letterList = context.letters
        .map((l) => `${l.arabic} (${l.transliteration}) = ${l.name_fr}`)
        .join(", ");
      parts.push(`Lettres arabes connues de l'utilisateur : ${letterList}`);
    }

    if (context.words && context.words.length > 0) {
      const wordList = context.words
        .slice(0, 10)
        .map((w) => `${w.arabic} (${w.transliteration}) = ${w.translation_fr}`)
        .join(", ");
      parts.push(`Vocabulaire récent de l'utilisateur : ${wordList}`);
    }

    if (context.verses && context.verses.length > 0) {
      const verseList = context.verses
        .map((v) => `Verset ${v.verse_number}: ${v.arabic_text} — ${v.translation_fr}`)
        .join("\n");
      parts.push(`Versets en contexte :\n${verseList}`);
    }

    if (context.lesson_context) {
      parts.push(`Contexte de la leçon : ${context.lesson_context}`);
    }

    if (context.progress) {
      const p = context.progress;
      parts.push(
        `Progression de l'utilisateur : ${p.letters_learned}/${p.letters_total} lettres, ` +
        `${p.words_learned}/${p.words_total} mots, ${p.total_percent}% global`
      );
    }

    return parts.length > 0
      ? `=== CONTEXTE PÉDAGOGIQUE ===\n${parts.join("\n")}\n===========================`
      : "";
  }

  buildExplainPrompt(subject: string, type: "letter" | "word" | "verse", lang: "fr" | "en" = "fr"): string {
    const prompts: Record<string, string> = {
      letter: `Explique en détail la lettre arabe "${subject}" : sa prononciation, ses formes (isolée, initiale, médiane, finale), son usage en mots et des exemples pratiques.`,
      word:   `Explique en détail le mot arabe "${subject}" : son sens, son étymologie si connue, sa racine, son usage dans des phrases, et des mots de la même famille.`,
      verse:  `Explique ce verset coranique "${subject}" : son sens littéral, son contexte, les mots-clés arabes importants et leur signification.`,
    };
    return prompts[type] ?? `Explique "${subject}" en arabe.`;
  }

  buildDailyLessonPrompt(level: Level, progress: LLMContextData["progress"]): string {
    const levelLabel = LEVEL_LABELS[level];
    const progressInfo = progress
      ? `L'utilisateur a appris ${progress.letters_learned} lettres et ${progress.words_learned} mots.`
      : "";
    return `Propose une leçon quotidienne courte (5-10 minutes) adaptée à un apprenant de niveau ${levelLabel}. ${progressInfo}
La leçon doit inclure : un point grammatical ou phonétique, 3-5 mots de vocabulaire nouveaux, et un mini exercice.
Réponds en JSON avec la structure : {"title": "...", "objective": "...", "content": [...], "vocabulary": [...], "exercise": {...}}`;
  }
}
