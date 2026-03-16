import type { ChatMessage, ChatContext, Level, LLMSettings, ModelStatus } from "@/types";
import { modelManager } from "./modelManager";
import { PromptBuilder } from "./promptBuilder";
import { retrievalService } from "../content/retrieval";
import { llmApi } from "../database/api";
import { useLLMStore } from "@/store/llmStore";

const promptBuilder = new PromptBuilder("fr");

export const llmService = {
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

  async checkStatus(): Promise<ModelStatus> {
    const store = useLLMStore.getState();
    store.setIsCheckingModel(true);
    const status = await modelManager.checkStatus();
    store.setModelStatus(status);
    store.setIsCheckingModel(false);
    return status;
  },

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

    const ctxData = await retrievalService.getContextForChat(level, {
      includeLetters: true,
      includeWords: true,
      includeProgress: true,
      lessonContext: context.subject,
    });

    if (context.additionalData?.verses) {
      ctxData.verses = context.additionalData.verses as typeof ctxData.verses;
    }

    const lang = (settings?.system_language ?? "fr") as "fr" | "en";
    promptBuilder.setLanguage(lang);

    const systemPrompt = promptBuilder.buildSystemPrompt(context.mode, level, ctxData);

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

  async explain(
    subject: string,
    type: "letter" | "word" | "verse",
    level: Level,
  ): Promise<string> {
    const provider = modelManager.getProvider();
    if (!provider) throw new Error("LLM non disponible");

    const settings = modelManager.getSettings();
    const lang = (settings?.system_language ?? "fr") as "fr" | "en";
    promptBuilder.setLanguage(lang);

    const question = promptBuilder.buildExplainPrompt(subject, type);
    const systemPrompt = promptBuilder.buildSystemPrompt("explanation", level);

    return provider.generate({
      messages: [{ role: "user", content: question }],
      system: systemPrompt,
    });
  },

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

  async listAvailableModels(): Promise<string[]> {
    return modelManager.listAvailableModels();
  },

  async updateSettings(settings: LLMSettings): Promise<void> {
    await llmApi.updateSettings(settings);
    modelManager.updateSettings(settings);
    useLLMStore.getState().setSettings(settings);
    await llmService.checkStatus();
  },
};
