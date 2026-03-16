import type { ModelStatus } from "@/types";
import { BaseLLMProvider, type GenerateOptions } from "../types";

/**
 * Provider llama.cpp — stub pour implémentation future.
 * Prêt à être connecté à un serveur llama.cpp local.
 */
export class LlamaCppProvider extends BaseLLMProvider {
  async checkStatus(): Promise<ModelStatus> {
    // TODO: implémenter la vérification via /health
    return {
      provider: "llamacpp",
      model: this.config.model,
      available: false,
      base_url: this.config.baseUrl,
      error: "llama.cpp provider pas encore implémenté",
    };
  }

  async generate(_options: GenerateOptions): Promise<string> {
    throw new Error("llama.cpp provider pas encore implémenté");
  }

  async listModels(): Promise<string[]> {
    return [];
  }
}
