import type { ChatMessage, ModelStatus, StreamChunk } from "@/types";

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
