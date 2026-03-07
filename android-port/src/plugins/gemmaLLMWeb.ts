/**
 * Implémentation web (fallback) du plugin GemmaLLM.
 * Utilisée en mode développement sans Android.
 * Simule le comportement du plugin natif.
 */

import type {
  GemmaPlugin,
  GemmaInitOptions,
  GemmaInitResult,
  GemmaGenerateOptions,
  GemmaGenerateResult,
  GemmaStatusResult,
  GemmaModelFileResult,
  GemmaTokenEvent,
} from "./gemmaLLM";

export class GemmaLLMWeb implements GemmaPlugin {
  private listeners: Array<(data: GemmaTokenEvent) => void> = [];

  async initialize(_options: GemmaInitOptions): Promise<GemmaInitResult> {
    console.warn("[GemmaLLMWeb] Plugin natif non disponible (mode web)");
    return {
      success: false,
      modelPath: "",
      backend: "cpu",
    };
  }

  async generate(options: GemmaGenerateOptions): Promise<GemmaGenerateResult> {
    // En mode web, simuler une réponse factice
    const mockResponse = `[Mode développement — Plugin Android non disponible]\n\nVotre prompt : "${options.prompt.slice(0, 50)}..."`;

    // Simuler le streaming
    for (const char of mockResponse) {
      this.listeners.forEach((cb) =>
        cb({ token: char, fullContent: mockResponse, done: false })
      );
      await new Promise((r) => setTimeout(r, 10));
    }

    this.listeners.forEach((cb) =>
      cb({ token: "", fullContent: mockResponse, done: true })
    );

    return { content: mockResponse, tokensGenerated: mockResponse.split(" ").length };
  }

  async generateSync(options: GemmaGenerateOptions): Promise<GemmaGenerateResult> {
    return this.generate(options);
  }

  async getStatus(): Promise<GemmaStatusResult> {
    return {
      initialized: false,
      modelPath: null,
      modelExists: false,
      modelSizeMb: 0,
      provider: "web-mock",
    };
  }

  async checkModelFile(): Promise<GemmaModelFileResult> {
    return {
      found: false,
      path: null,
      sizeMb: 0,
      storageDir: "/mock/storage",
    };
  }

  async unload(): Promise<void> {
    this.listeners = [];
  }

  async addListener(
    _event: "onToken",
    listener: (data: GemmaTokenEvent) => void
  ): Promise<{ remove: () => void }> {
    this.listeners.push(listener);
    return {
      remove: () => {
        this.listeners = this.listeners.filter((l) => l !== listener);
      },
    };
  }

  async removeAllListeners(): Promise<void> {
    this.listeners = [];
  }
}
