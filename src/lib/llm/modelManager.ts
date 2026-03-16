import type { LLMSettings, ModelStatus, ModelConfig } from "@/types";
import { OllamaProvider } from "./providers/ollama";
import { NoopProvider } from "./providers/noop";
import { LlamaCppProvider } from "./providers/llamacpp";
import type { BaseLLMProvider } from "./types";

export class ModelManager {
  private provider: BaseLLMProvider | null = null;
  private settings: LLMSettings | null = null;

  init(settings: LLMSettings) {
    this.settings = settings;
    switch (settings.provider) {
      case "ollama":
        this.provider = new OllamaProvider({
          baseUrl: settings.base_url,
          model: settings.model_name,
          temperature: settings.temperature,
          maxTokens: settings.max_tokens,
        });
        break;
      case "llamacpp":
        this.provider = new LlamaCppProvider({
          baseUrl: settings.base_url,
          model: settings.model_name,
          temperature: settings.temperature,
          maxTokens: settings.max_tokens,
        });
        break;
      case "none":
      default:
        this.provider = new NoopProvider();
        break;
    }
  }

  getProvider(): BaseLLMProvider | null {
    return this.provider;
  }

  async checkStatus(): Promise<ModelStatus> {
    if (!this.provider || !this.settings) {
      return {
        provider: "none",
        model: "",
        available: false,
        base_url: "",
        error: "LLM non configuré",
      };
    }
    return this.provider.checkStatus();
  }

  async listAvailableModels(): Promise<string[]> {
    if (!this.provider) return [];
    return this.provider.listModels();
  }

  updateSettings(settings: LLMSettings) {
    this.init(settings);
  }

  getSettings(): LLMSettings | null {
    return this.settings;
  }
}

// Singleton
export const modelManager = new ModelManager();

// Modèles recommandés
export const KNOWN_MODELS: ModelConfig[] = [
  {
    name: "qwen2.5:7b",
    display_name: "Qwen 2.5 7B",
    provider: "ollama",
    language_focus: "multilingual",
    context_size: 32768,
    is_recommended: true,
    description_fr: "Modèle polyvalent, excellent pour l'arabe et le français",
  },
  {
    name: "qwen2.5:3b",
    display_name: "Qwen 2.5 3B",
    provider: "ollama",
    language_focus: "multilingual",
    context_size: 32768,
    is_recommended: false,
    description_fr: "Version légère de Qwen 2.5, idéale pour PC moins puissants",
  },
  {
    name: "command-r:35b",
    display_name: "Command R 35B",
    provider: "ollama",
    language_focus: "arabic",
    context_size: 128000,
    is_recommended: false,
    description_fr: "Excellent pour l'arabe, nécessite 20+ Go de RAM",
  },
  {
    name: "aya:8b",
    display_name: "Aya 8B (Cohere)",
    provider: "ollama",
    language_focus: "arabic",
    context_size: 8192,
    is_recommended: false,
    description_fr: "Spécialisé multilingue avec bon support arabe",
  },
];
