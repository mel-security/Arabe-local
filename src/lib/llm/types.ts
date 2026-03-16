/**
 * Types et interfaces pour l'abstraction LLM.
 * Tous les providers doivent implémenter BaseLLMProvider.
 */

import type { ChatMessage, ModelStatus, StreamChunk, Level } from "@/types";

export interface LLMProviderConfig {
  baseUrl: string;
  model: string;
  temperature: number;
  maxTokens: number;
}

export interface GenerateOptions {
  messages: ChatMessage[];
  system?: string;
  onChunk?: (chunk: StreamChunk) => void;
  signal?: AbortSignal;
}

export abstract class BaseLLMProvider {
  protected config: LLMProviderConfig;

  constructor(config: LLMProviderConfig) {
    this.config = config;
  }

  abstract checkStatus(): Promise<ModelStatus>;
  abstract generate(options: GenerateOptions): Promise<string>;
  abstract listModels(): Promise<string[]>;

  updateConfig(config: Partial<LLMProviderConfig>) {
    this.config = { ...this.config, ...config };
  }
}

/**
 * Interface haut niveau pour le contenu pédagogique généré par LLM.
 * Chaque provider (Ollama, LlamaCpp, Noop) implémente cette interface.
 */
export interface PedagogyLLMProvider {
  generateExample(topic: string, level: Level): Promise<string>;
  generateDialogue(topic: string, level: Level): Promise<string>;
  explainGrammar(rule: string, level: Level): Promise<string>;
  correctAnswer(userAnswer: string, expected: string, level: Level): Promise<string>;
  createExercise(topic: string, exerciseType: string, level: Level): Promise<string>;
  isAvailable(): Promise<boolean>;
}
