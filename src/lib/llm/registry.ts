/**
 * Registre des providers LLM avec détection automatique et fallback.
 *
 * Le registry essaie le provider configuré par l'utilisateur.
 * Si indisponible, il fallback vers NoopProvider (mode sans LLM).
 */

import type { LLMSettings, ModelStatus, Level } from "@/types";
import type { BaseLLMProvider, PedagogyLLMProvider } from "./types";
import { OllamaProvider } from "./providers/ollama";
import { LlamaCppProvider } from "./providers/llamacpp";
import { NoopProvider } from "./providers/noop";
import { PromptBuilder } from "./promptBuilder";

export class LLMRegistry {
  private activeProvider: BaseLLMProvider;
  private settings: LLMSettings | null = null;
  private promptBuilder = new PromptBuilder("fr");

  constructor() {
    this.activeProvider = new NoopProvider();
  }

  /**
   * Configure le registry avec les paramètres utilisateur.
   * Crée le provider approprié.
   */
  configure(settings: LLMSettings): void {
    this.settings = settings;
    this.activeProvider = this.createProvider(settings);
    this.promptBuilder.setLanguage(settings.system_language as "fr" | "en");
  }

  /**
   * Vérifie la disponibilité du provider actuel.
   * Si indisponible, ne change pas automatiquement (l'UI peut proposer le fallback).
   */
  async checkStatus(): Promise<ModelStatus> {
    return this.activeProvider.checkStatus();
  }

  /**
   * Retourne le provider actif (pour les appels directs chat/streaming).
   */
  getProvider(): BaseLLMProvider {
    return this.activeProvider;
  }

  /**
   * Retourne true si un LLM est disponible et fonctionnel.
   */
  async isLLMAvailable(): Promise<boolean> {
    if (this.settings?.provider === "none") return false;
    const status = await this.checkStatus();
    return status.available;
  }

  /**
   * Retourne un PedagogyLLMProvider qui utilise le LLM actif
   * ou fallback vers des réponses vides (le contentProvider statique prend le relais).
   */
  getPedagogyProvider(): PedagogyLLMProvider {
    const provider = this.activeProvider;
    const promptBuilder = this.promptBuilder;

    return {
      async isAvailable(): Promise<boolean> {
        const status = await provider.checkStatus();
        return status.available;
      },

      async generateExample(topic: string, level: Level): Promise<string> {
        const system = promptBuilder.buildSystemPrompt("tutor", level);
        return provider.generate({
          messages: [{ role: "user", content: `Donne un exemple de phrase utilisant "${topic}" adapté à un niveau ${level}.` }],
          system,
        });
      },

      async generateDialogue(topic: string, level: Level): Promise<string> {
        const system = promptBuilder.buildSystemPrompt("tutor", level);
        return provider.generate({
          messages: [{ role: "user", content: `Crée un court dialogue (4-6 répliques) sur le thème "${topic}" pour un apprenant de niveau ${level}.` }],
          system,
        });
      },

      async explainGrammar(rule: string, level: Level): Promise<string> {
        const system = promptBuilder.buildSystemPrompt("explanation", level);
        return provider.generate({
          messages: [{ role: "user", content: `Explique cette règle grammaticale arabe : "${rule}". Donne des exemples concrets.` }],
          system,
        });
      },

      async correctAnswer(userAnswer: string, expected: string, level: Level): Promise<string> {
        const system = promptBuilder.buildSystemPrompt("correction", level);
        return provider.generate({
          messages: [{ role: "user", content: `L'utilisateur a répondu "${userAnswer}" alors que la réponse attendue était "${expected}". Explique l'erreur et la bonne réponse.` }],
          system,
        });
      },

      async createExercise(topic: string, exerciseType: string, level: Level): Promise<string> {
        const system = promptBuilder.buildSystemPrompt("quiz", level);
        return provider.generate({
          messages: [{ role: "user", content: `Crée un exercice de type "${exerciseType}" sur le thème "${topic}" pour un niveau ${level}. Réponds en JSON: {"question": "...", "options": [...], "correct_answer": "...", "explanation": "..."}` }],
          system,
        });
      },
    };
  }

  /**
   * Liste les modèles disponibles via le provider actuel.
   */
  async listModels(): Promise<string[]> {
    return this.activeProvider.listModels();
  }

  private createProvider(settings: LLMSettings): BaseLLMProvider {
    const config = {
      baseUrl: settings.base_url,
      model: settings.model_name,
      temperature: settings.temperature,
      maxTokens: settings.max_tokens,
    };

    switch (settings.provider) {
      case "ollama":
        return new OllamaProvider(config);
      case "llamacpp":
        return new LlamaCppProvider(config);
      case "none":
      default:
        return new NoopProvider();
    }
  }
}

/** Singleton du registry */
export const llmRegistry = new LLMRegistry();
