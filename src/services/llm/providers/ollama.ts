import type { ChatMessage, ModelStatus, StreamChunk } from "@/types";
import { BaseLLMProvider, type GenerateOptions } from "./base";

interface OllamaMessage {
  role: "user" | "assistant" | "system";
  content: string;
}

interface OllamaStreamChunk {
  model: string;
  created_at: string;
  message?: { role: string; content: string };
  response?: string;
  done: boolean;
  prompt_eval_count?: number;
  eval_count?: number;
}

export class OllamaProvider extends BaseLLMProvider {
  async checkStatus(): Promise<ModelStatus> {
    try {
      const res = await fetch(`${this.config.baseUrl}/api/tags`, {
        signal: AbortSignal.timeout(3000),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      const models: string[] = (data.models ?? []).map((m: { name: string }) => m.name);
      const available = models.some((m) => m.startsWith(this.config.model));
      return {
        provider: "ollama",
        model: this.config.model,
        available,
        base_url: this.config.baseUrl,
        error: available ? undefined : `Modèle ${this.config.model} non trouvé. Lancez: ollama pull ${this.config.model}`,
      };
    } catch (err) {
      return {
        provider: "ollama",
        model: this.config.model,
        available: false,
        base_url: this.config.baseUrl,
        error: "Ollama non accessible. Lancez: ollama serve",
      };
    }
  }

  async listModels(): Promise<string[]> {
    try {
      const res = await fetch(`${this.config.baseUrl}/api/tags`, {
        signal: AbortSignal.timeout(3000),
      });
      if (!res.ok) return [];
      const data = await res.json();
      return (data.models ?? []).map((m: { name: string }) => m.name);
    } catch {
      return [];
    }
  }

  async generate(options: GenerateOptions): Promise<string> {
    const { messages, system, onChunk, signal } = options;

    const ollamaMessages: OllamaMessage[] = [];

    if (system) {
      ollamaMessages.push({ role: "system", content: system });
    }

    for (const msg of messages) {
      if (msg.role === "system") continue;
      ollamaMessages.push({
        role: msg.role as "user" | "assistant",
        content: msg.content,
      });
    }

    const body = JSON.stringify({
      model: this.config.model,
      messages: ollamaMessages,
      stream: !!onChunk,
      options: {
        temperature: this.config.temperature,
        num_predict: this.config.maxTokens,
      },
    });

    const res = await fetch(`${this.config.baseUrl}/api/chat`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body,
      signal,
    });

    if (!res.ok) {
      const err = await res.text();
      throw new Error(`Ollama error ${res.status}: ${err}`);
    }

    if (!onChunk) {
      const data = await res.json();
      return data.message?.content ?? data.response ?? "";
    }

    // Streaming
    const reader = res.body?.getReader();
    if (!reader) throw new Error("Pas de stream disponible");

    const decoder = new TextDecoder();
    let fullContent = "";

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      const text = decoder.decode(value, { stream: true });
      const lines = text.split("\n").filter((l) => l.trim());

      for (const line of lines) {
        try {
          const chunk: OllamaStreamChunk = JSON.parse(line);
          const content = chunk.message?.content ?? chunk.response ?? "";
          fullContent += content;

          const streamChunk: StreamChunk = {
            content: fullContent,
            done: chunk.done,
            model: chunk.model,
            tokens: chunk.done ? chunk.eval_count : undefined,
          };
          onChunk(streamChunk);

          if (chunk.done) break;
        } catch {
          // Ignorer les lignes non-JSON
        }
      }
    }

    return fullContent;
  }
}
