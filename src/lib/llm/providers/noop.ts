import type { ModelStatus } from "@/types";
import { BaseLLMProvider, type GenerateOptions } from "../types";

/**
 * Provider "sans LLM" — fallback silencieux.
 * Retourne toujours "non disponible" et ne génère rien.
 * Le moteur pédagogique statique prend le relais.
 */
export class NoopProvider extends BaseLLMProvider {
  constructor() {
    super({ baseUrl: "", model: "none", temperature: 0, maxTokens: 0 });
  }

  async checkStatus(): Promise<ModelStatus> {
    return {
      provider: "none",
      model: "none",
      available: false,
      base_url: "",
    };
  }

  async generate(_options: GenerateOptions): Promise<string> {
    return "";
  }

  async listModels(): Promise<string[]> {
    return [];
  }
}
