/**
 * Interface TypeScript pour le plugin natif GemmaLLM (Android).
 *
 * Ce plugin est uniquement disponible sur Android.
 * Sur desktop (Tauri), le service Ollama est utilisé à la place.
 *
 * Usage :
 * ```ts
 * import { GemmaLLM } from '@/plugins/gemmaLLM';
 *
 * // Vérifier si le modèle est disponible
 * const { found, path } = await GemmaLLM.checkModelFile();
 *
 * // Initialiser le modèle
 * await GemmaLLM.initialize({ modelPath: path, useGpu: true });
 *
 * // Streaming
 * GemmaLLM.addListener('onToken', ({ token, fullContent, done }) => {
 *   updateUI(fullContent);
 * });
 * await GemmaLLM.generate({ prompt: "Explique la lettre ب" });
 * ```
 */

import { registerPlugin } from "@capacitor/core";

// ============================================================
// TYPES
// ============================================================

export interface GemmaInitOptions {
  modelPath: string;
  maxTokens?: number;      // défaut: 2048
  temperature?: number;    // défaut: 0.7
  useGpu?: boolean;        // défaut: true
}

export interface GemmaInitResult {
  success: boolean;
  modelPath: string;
  backend: "gpu" | "cpu";
}

export interface GemmaGenerateOptions {
  prompt: string;
  systemPrompt?: string;
}

export interface GemmaGenerateResult {
  content: string;
  tokensGenerated: number;
}

export interface GemmaTokenEvent {
  token: string;
  fullContent: string;
  done: boolean;
}

export interface GemmaStatusResult {
  initialized: boolean;
  modelPath: string | null;
  modelExists: boolean;
  modelSizeMb: number;
  provider: string;
}

export interface GemmaModelFileResult {
  found: boolean;
  path: string | null;
  sizeMb: number;
  storageDir: string;
}

export interface GemmaPlugin {
  initialize(options: GemmaInitOptions): Promise<GemmaInitResult>;
  generate(options: GemmaGenerateOptions): Promise<GemmaGenerateResult>;
  generateSync(options: GemmaGenerateOptions): Promise<GemmaGenerateResult>;
  getStatus(): Promise<GemmaStatusResult>;
  checkModelFile(): Promise<GemmaModelFileResult>;
  unload(): Promise<void>;
  addListener(
    event: "onToken",
    listener: (data: GemmaTokenEvent) => void
  ): Promise<{ remove: () => void }>;
  removeAllListeners(): Promise<void>;
}

// ============================================================
// ENREGISTREMENT DU PLUGIN
// ============================================================

export const GemmaLLM = registerPlugin<GemmaPlugin>("GemmaLLM", {
  // Implémentation web (fallback pour le développement sans Android)
  web: () => import("./gemmaLLMWeb").then((m) => new m.GemmaLLMWeb()),
});

// ============================================================
// UTILITAIRES
// ============================================================

/**
 * Vérifie si l'application tourne sur Android avec le plugin disponible.
 */
export function isAndroidWithGemma(): boolean {
  return (
    typeof window !== "undefined" &&
    /Android/i.test(navigator.userAgent) &&
    "GemmaLLM" in window
  );
}

/**
 * Chemin par défaut du modèle dans le stockage interne Android.
 * Ce chemin est résolu dynamiquement, les valeurs ci-dessous sont des exemples.
 */
export const GEMMA_MODEL_FILENAMES = [
  "gemma-2b-it-gpu-int4.bin",  // MediaPipe format (GPU)
  "gemma-2b-it-cpu-int4.bin",  // MediaPipe format (CPU)
  "gemma-2b-q4.gguf",          // GGUF format
];

export const GEMMA_MODEL_URLS = {
  // Modèle officiel Google via Kaggle (nécessite un compte)
  kaggle_gpu: "https://www.kaggle.com/models/google/gemma/tfLite/gemma-2b-it-gpu-int4/1/download",
  kaggle_cpu: "https://www.kaggle.com/models/google/gemma/tfLite/gemma-2b-it-cpu-int4/1/download",
  // Miroir HuggingFace (GGUF, plus facile d'accès)
  huggingface: "https://huggingface.co/google/gemma-2b-it-GGUF/resolve/main/gemma-2b-it-q4_k_m.gguf",
};
