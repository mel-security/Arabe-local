/**
 * Service de bootstrap pour le premier lancement.
 *
 * Vérifie l'état de la base de données et lance les initialisations
 * nécessaires (schéma, seed, migrations).
 */

const isTauri = typeof window !== "undefined" && "__TAURI__" in window;

export interface BootstrapStatus {
  is_first_launch: boolean;
  schema_version: number;
  has_user: boolean;
  letters_count: number;
  words_count: number;
  grammar_ready: boolean;
}

/**
 * Vérifie l'état du bootstrap.
 */
export async function checkBootstrapStatus(): Promise<BootstrapStatus> {
  if (!isTauri) {
    // Mode web : toujours prêt
    return {
      is_first_launch: false,
      schema_version: 1,
      has_user: true,
      letters_count: 28,
      words_count: 50,
      grammar_ready: true,
    };
  }

  const { invoke } = await import("@tauri-apps/api/tauri");
  return invoke<BootstrapStatus>("check_bootstrap_status");
}

/**
 * Vérifie si le premier onboarding a été complété.
 */
export function isOnboardingComplete(): boolean {
  if (!isTauri) return true;
  return localStorage.getItem("onboarding_complete") === "true";
}

/**
 * Marque l'onboarding comme complété.
 */
export function markOnboardingComplete(): void {
  localStorage.setItem("onboarding_complete", "true");
}
