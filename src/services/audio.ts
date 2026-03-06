/**
 * Service audio - gestion de la lecture des fichiers audio.
 * Supporte les fichiers locaux (Tauri) et les URLs web.
 */

type AudioEventCallback = () => void;

class AudioService {
  private audio: HTMLAudioElement | null = null;
  private currentSrc: string | null = null;
  private onEndCallbacks: AudioEventCallback[] = [];
  private onPlayCallbacks: AudioEventCallback[] = [];
  private onPauseCallbacks: AudioEventCallback[] = [];
  private volume: number = 0.8;

  constructor() {
    this.audio = new Audio();
    this.audio.volume = this.volume;

    this.audio.addEventListener("ended", () => {
      this.onEndCallbacks.forEach((cb) => cb());
    });

    this.audio.addEventListener("play", () => {
      this.onPlayCallbacks.forEach((cb) => cb());
    });

    this.audio.addEventListener("pause", () => {
      this.onPauseCallbacks.forEach((cb) => cb());
    });
  }

  /**
   * Jouer un fichier audio local ou une URL
   */
  async play(src: string): Promise<void> {
    if (!this.audio) return;

    // Résoudre le chemin pour Tauri
    const resolvedSrc = await this.resolveSrc(src);

    if (this.currentSrc !== resolvedSrc) {
      this.audio.src = resolvedSrc;
      this.currentSrc = resolvedSrc;
      this.audio.load();
    }

    try {
      await this.audio.play();
    } catch (e) {
      console.warn("Erreur lecture audio:", e);
    }
  }

  pause(): void {
    this.audio?.pause();
  }

  stop(): void {
    if (this.audio) {
      this.audio.pause();
      this.audio.currentTime = 0;
    }
  }

  resume(): void {
    this.audio?.play().catch(console.warn);
  }

  toggle(): void {
    if (this.audio?.paused) {
      this.resume();
    } else {
      this.pause();
    }
  }

  setVolume(volume: number): void {
    this.volume = Math.max(0, Math.min(1, volume));
    if (this.audio) {
      this.audio.volume = this.volume;
    }
  }

  seek(time: number): void {
    if (this.audio) {
      this.audio.currentTime = time;
    }
  }

  get isPlaying(): boolean {
    return this.audio ? !this.audio.paused : false;
  }

  get duration(): number {
    return this.audio?.duration ?? 0;
  }

  get currentTime(): number {
    return this.audio?.currentTime ?? 0;
  }

  onEnd(cb: AudioEventCallback): () => void {
    this.onEndCallbacks.push(cb);
    return () => {
      this.onEndCallbacks = this.onEndCallbacks.filter((c) => c !== cb);
    };
  }

  onPlay(cb: AudioEventCallback): () => void {
    this.onPlayCallbacks.push(cb);
    return () => {
      this.onPlayCallbacks = this.onPlayCallbacks.filter((c) => c !== cb);
    };
  }

  onPause(cb: AudioEventCallback): () => void {
    this.onPauseCallbacks.push(cb);
    return () => {
      this.onPauseCallbacks = this.onPauseCallbacks.filter((c) => c !== cb);
    };
  }

  private async resolveSrc(src: string): Promise<string> {
    // URL complète : on la retourne telle quelle
    if (src.startsWith("http://") || src.startsWith("https://")) {
      return src;
    }

    // Chemin Tauri : convertir en URL asset
    if (typeof window !== "undefined" && "__TAURI__" in window) {
      try {
        const { convertFileSrc } = await import("@tauri-apps/api/tauri");
        return convertFileSrc(src);
      } catch {
        return src;
      }
    }

    // Mode web : chemin relatif au public/
    return `/${src}`;
  }

  destroy(): void {
    this.stop();
    this.audio = null;
    this.onEndCallbacks = [];
    this.onPlayCallbacks = [];
    this.onPauseCallbacks = [];
  }
}

// Singleton global
export const audioService = new AudioService();

/**
 * Texte-vers-parole de secours si pas d'audio disponible
 * Utilise l'API Web Speech si disponible
 */
export function speakArabic(text: string): void {
  if ("speechSynthesis" in window) {
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = "ar-SA";
    utterance.rate = 0.8;

    // Chercher une voix arabe
    const voices = window.speechSynthesis.getVoices();
    const arabicVoice = voices.find((v) => v.lang.startsWith("ar"));
    if (arabicVoice) {
      utterance.voice = arabicVoice;
    }

    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(utterance);
  }
}
