import type { ChatMessage, ChatContext, ChatMode, Level, LLMSettings, ModelStatus } from "@/types";
import { modelManager } from "./modelManager";
import { PromptBuilder } from "./promptBuilder";
import { retrievalService } from "../retrieval";
import { llmApi } from "../database";
import { useLLMStore } from "@/store/llmStore";

const promptBuilder = new PromptBuilder("fr");

export const llmService = {
  /**
   * Initialise le service LLM avec les paramètres de la DB
   */
  async init() {
    try {
      const settings = await llmApi.getSettings();
      modelManager.init(settings);
      useLLMStore.getState().setSettings(settings);
      await llmService.checkStatus();
    } catch (err) {
      console.warn("LLM service init failed:", err);
    }
  },

  /**
   * Vérifie si le modèle est disponible
   */
  async checkStatus(): Promise<ModelStatus> {
    const store = useLLMStore.getState();
    store.setIsCheckingModel(true);
    const status = await modelManager.checkStatus();
    store.setModelStatus(status);
    store.setIsCheckingModel(false);
    return status;
  },

  /**
   * Envoie un message et obtient une réponse (avec ou sans streaming)
   */
  async sendMessage(
    userMessage: string,
    context: ChatContext,
    conversationHistory: ChatMessage[],
    level: Level,
    onChunk?: (fullContent: string) => void
  ): Promise<string> {
    const provider = modelManager.getProvider();
    if (!provider) throw new Error("LLM non configuré ou non disponible");

    const settings = modelManager.getSettings();

    // Construire le contexte RAG
    const ctxData = await retrievalService.getContextForChat(level, {
      includeLetters: true,
      includeWords: true,
      includeProgress: true,
      lessonContext: context.subject,
    });

    // Override avec les données de contexte passées directement
    if (context.additionalData?.verses) {
      ctxData.verses = context.additionalData.verses as typeof ctxData.verses;
    }

    const lang = (settings?.system_language ?? "fr") as "fr" | "en";
    promptBuilder["language"] = lang;

    const systemPrompt = promptBuilder.buildSystemPrompt(context.mode, level, ctxData);

    // Construire les messages pour le LLM
    const messages: ChatMessage[] = [
      ...conversationHistory.filter((m) => m.role !== "system"),
      { role: "user", content: userMessage },
    ];

    let response = "";

    if (onChunk && settings?.streaming !== false) {
      response = await provider.generate({
        messages,
        system: systemPrompt,
        onChunk: (chunk) => {
          onChunk(chunk.content);
        },
      });
    } else {
      response = await provider.generate({ messages, system: systemPrompt });
    }

    return response;
  },

  /**
   * Explique un élément (lettre, mot, verset)
   */
  async explain(
    subject: string,
    type: "letter" | "word" | "verse",
    level: Level,
    extraContext?: Record<string, unknown>
  ): Promise<string> {
    const provider = modelManager.getProvider();
    if (!provider) throw new Error("LLM non disponible");

    const settings = modelManager.getSettings();
    const lang = (settings?.system_language ?? "fr") as "fr" | "en";
    promptBuilder["language"] = lang;

    const question = promptBuilder.buildExplainPrompt(subject, type, lang);
    const systemPrompt = promptBuilder.buildSystemPrompt("explanation", level);

    return provider.generate({
      messages: [{ role: "user", content: question }],
      system: systemPrompt,
    });
  },

  /**
   * Génère une leçon quotidienne
   */
  async generateDailyLesson(level: Level): Promise<string> {
    const provider = modelManager.getProvider();
    if (!provider) throw new Error("LLM non disponible");

    const progress = await retrievalService.getContextForChat(level, { includeProgress: true });
    const prompt = promptBuilder.buildDailyLessonPrompt(level, progress.progress);
    const systemPrompt = promptBuilder.buildSystemPrompt("tutor", level);

    return provider.generate({
      messages: [{ role: "user", content: prompt }],
      system: systemPrompt,
    });
  },

  /**
   * Liste les modèles Ollama disponibles localement
   */
  async listAvailableModels(): Promise<string[]> {
    return modelManager.listAvailableModels();
  },

  /**
   * Met à jour les paramètres LLM
   */
  async updateSettings(settings: LLMSettings): Promise<void> {
    await llmApi.updateSettings(settings);
    modelManager.updateSettings(settings);
    useLLMStore.getState().setSettings(settings);
    await llmService.checkStatus();
  },
};
