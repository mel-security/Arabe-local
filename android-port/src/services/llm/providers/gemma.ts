/**
 * Provider LLM basé sur Gemma 2B Q4 pour Android.
 *
 * Implémente la même interface BaseLLMProvider que OllamaProvider,
 * ce qui permet une utilisation transparente depuis llmService.
 *
 * Sur Android : utilise le plugin natif GemmaLLM (MediaPipe)
 * Sur desktop : utilise Ollama (voir providers/ollama.ts)
 *
 * Intégration dans le service LLM existant :
 * ```ts
 * // Dans src/services/llm/index.ts, détecter la plateforme :
 * import { isAndroidWithGemma } from '@android/src/plugins/gemmaLLM';
 *
 * const provider = isAndroidWithGemma()
 *   ? new GemmaProvider({ modelPath, temperature, maxTokens })
 *   : new OllamaProvider({ baseUrl, model, temperature, maxTokens });
 * ```
 */

import { GemmaLLM, GEMMA_MODEL_FILENAMES } from "@android/src/plugins/gemmaLLM";
import type { GemmaPlugin, GemmaTokenEvent } from "@android/src/plugins/gemmaLLM";
import type { ModelStatus, StreamChunk } from "@/types";
import type { LLMProviderConfig, GenerateOptions } from "@/services/llm/providers/base";
import { BaseLLMProvider } from "@/services/llm/providers/base";

export interface GemmaProviderConfig {
  modelPath?: string;        // Chemin vers le fichier modèle
  temperature?: number;      // 0.0 - 1.0
  maxTokens?: number;        // Tokens max par réponse
  useGpu?: boolean;          // Utiliser le GPU (recommandé)
}

export class GemmaProvider extends BaseLLMProvider {
  private gemma: GemmaPlugin;
  private modelPath: string | null = null;
  private isReady = false;
  private tokenListener: { remove: () => void } | null = null;

  constructor(config: LLMProviderConfig & GemmaProviderConfig) {
    super(config);
    this.gemma = GemmaLLM;
  }

  // ============================================================
  // IMPLÉMENTATION BaseLLMProvider
  // ============================================================

  async checkStatus(): Promise<ModelStatus> {
    try {
      const fileCheck = await this.gemma.checkModelFile();
      const status = await this.gemma.getStatus();

      if (!fileCheck.found) {
        return {
          provider: "ollama", // provider type générique
          model: "gemma-2b-q4",
          available: false,
          base_url: "local",
          error: `Modèle Gemma non trouvé. Taille requise : ~1.5 Go. Répertoire : ${fileCheck.storageDir}`,
        };
      }

      return {
        provider: "ollama",
        model: "gemma-2b-q4",
        available: fileCheck.found,
        base_url: "local",
        error: status.initialized ? undefined : "Modèle non initialisé",
      };
    } catch (err) {
      return {
        provider: "ollama",
        model: "gemma-2b-q4",
        available: false,
        base_url: "local",
        error: `Plugin Gemma non disponible : ${err}`,
      };
    }
  }

  async listModels(): Promise<string[]> {
    const check = await this.gemma.checkModelFile();
    return check.found ? ["gemma-2b-q4"] : [];
  }

  async generate(options: GenerateOptions): Promise<string> {
    // Initialiser si nécessaire
    if (!this.isReady) {
      await this.ensureInitialized();
    }

    // Construire le prompt complet depuis l'historique des messages
    const prompt = this.buildPromptFromMessages(options.messages, options.system);

    if (options.onChunk) {
      return this.generateWithStreaming(prompt, options);
    } else {
      const result = await this.gemma.generateSync({ prompt });
      return result.content;
    }
  }

  // ============================================================
  // MÉTHODES PRIVÉES
  // ============================================================

  private async ensureInitialized(): Promise<void> {
    const fileCheck = await this.gemma.checkModelFile();

    if (!fileCheck.found || !fileCheck.path) {
      throw new Error(
        "Modèle Gemma non trouvé. Veuillez télécharger le modèle depuis les paramètres IA."
      );
    }

    this.modelPath = fileCheck.path;

    const result = await this.gemma.initialize({
      modelPath: this.modelPath,
      temperature: this.config.temperature ?? 0.7,
      maxTokens: this.config.maxTokens ?? 2048,
      useGpu: true,
    });

    if (!result.success) {
      throw new Error("Échec de l'initialisation du modèle Gemma");
    }

    this.isReady = true;
  }

  private async generateWithStreaming(
    prompt: string,
    options: GenerateOptions
  ): Promise<string> {
    return new Promise(async (resolve, reject) => {
      let fullContent = "";
      let listenerHandle: { remove: () => void } | null = null;

      try {
        // Écouter les tokens streamés
        listenerHandle = await this.gemma.addListener(
          "onToken",
          (data: GemmaTokenEvent) => {
            fullContent = data.fullContent;

            options.onChunk?.({
              content: data.fullContent,
              done: data.done,
            } as StreamChunk);

            if (data.done) {
              listenerHandle?.remove();
              resolve(fullContent);
            }
          }
        );

        // Vérifier si abort a été demandé
        if (options.signal?.aborted) {
          listenerHandle?.remove();
          reject(new Error("Génération annulée"));
          return;
        }

        options.signal?.addEventListener("abort", () => {
          listenerHandle?.remove();
          this.gemma.unload(); // Libérer les ressources
          reject(new Error("Génération annulée"));
        });

        // Lancer la génération (déclenche les événements onToken)
        await this.gemma.generate({ prompt });
      } catch (err) {
        listenerHandle?.remove();
        reject(err);
      }
    });
  }

  /**
   * Construit le prompt au format Gemma IT depuis l'historique des messages.
   * Format : <start_of_turn>user\n...<end_of_turn>\n<start_of_turn>model
   */
  private buildPromptFromMessages(
    messages: Array<{ role: string; content: string }>,
    system?: string
  ): string {
    const parts: string[] = [];

    if (system) {
      parts.push(`<start_of_turn>system\n${system}<end_of_turn>`);
    }

    for (const msg of messages) {
      if (msg.role === "system") continue;
      const role = msg.role === "user" ? "user" : "model";
      parts.push(`<start_of_turn>${role}\n${msg.content}<end_of_turn>`);
    }

    parts.push("<start_of_turn>model");
    return parts.join("\n");
  }
}

// ============================================================
// GESTIONNAIRE DE TÉLÉCHARGEMENT DU MODÈLE
// ============================================================

export class GemmaModelManager {
  /**
   * Vérifie si le modèle est disponible, sinon propose le téléchargement.
   */
  static async ensureModel(): Promise<{
    available: boolean;
    path: string | null;
    needsDownload: boolean;
    downloadSizeGb: number;
  }> {
    const check = await GemmaLLM.checkModelFile();

    return {
      available: check.found,
      path: check.path,
      needsDownload: !check.found,
      downloadSizeGb: 1.5, // Gemma 2B Q4 ~1.5 Go
    };
  }

  /**
   * Lance le téléchargement du modèle via le service Android.
   * Retourne un observable de progression.
   */
  static startDownload(
    onProgress: (percent: number, downloadedMb: number, totalMb: number) => void,
    onComplete: (modelPath: string) => void,
    onError: (error: string) => void
  ): { cancel: () => void } {
    // Sur Android, communiquer via BroadcastReceiver natif
    // Ici on utilise des custom events pour la communication JS ↔ Android
    const progressHandler = (e: CustomEvent) => {
      onProgress(e.detail.percent, e.detail.downloaded_mb, e.detail.total_mb);
    };

    const completeHandler = (e: CustomEvent) => {
      cleanup();
      onComplete(e.detail.model_path);
    };

    const errorHandler = (e: CustomEvent) => {
      cleanup();
      onError(e.detail.error);
    };

    window.addEventListener("gemma_download_progress", progressHandler as EventListener);
    window.addEventListener("gemma_download_complete", completeHandler as EventListener);
    window.addEventListener("gemma_download_error", errorHandler as EventListener);

    const cleanup = () => {
      window.removeEventListener("gemma_download_progress", progressHandler as EventListener);
      window.removeEventListener("gemma_download_complete", completeHandler as EventListener);
      window.removeEventListener("gemma_download_error", errorHandler as EventListener);
    };

    // Déclencher le téléchargement (appel natif via un pont WebView)
    if ("AndroidDownloadBridge" in window) {
      (window as unknown as Record<string, { startDownload: () => void }>)
        .AndroidDownloadBridge.startDownload();
    }

    return { cancel: cleanup };
  }
}
