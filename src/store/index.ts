import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import type {
  UserProfile,
  AppSettings,
  Theme,
  Language,
  Level,
  OverallProgress,
  StreakInfo,
  AudioState,
} from "@/types";

// ============================================================
// APP STORE (état global persisté)
// ============================================================

interface AppState {
  // Profil utilisateur
  user: UserProfile | null;
  settings: AppSettings | null;

  // Progression globale
  progress: OverallProgress | null;
  streak: StreakInfo | null;

  // UI State
  sidebarOpen: boolean;
  currentModule: string | null;

  // Audio global
  audio: AudioState;

  // Actions
  setUser: (user: UserProfile) => void;
  setSettings: (settings: AppSettings) => void;
  setProgress: (progress: OverallProgress) => void;
  setStreak: (streak: StreakInfo) => void;
  setSidebarOpen: (open: boolean) => void;
  setCurrentModule: (module: string | null) => void;
  setAudio: (audio: Partial<AudioState>) => void;

  // Derived
  theme: Theme;
  language: Language;
  level: Level;
  fontSize: number;
}

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      user: null,
      settings: null,
      progress: null,
      streak: null,
      sidebarOpen: false,
      currentModule: null,
      audio: {
        isPlaying: false,
        currentSrc: null,
        duration: 0,
        currentTime: 0,
        volume: 0.8,
      },

      setUser: (user) => set({ user }),
      setSettings: (settings) => set({ settings }),
      setProgress: (progress) => set({ progress }),
      setStreak: (streak) => set({ streak }),
      setSidebarOpen: (open) => set({ sidebarOpen: open }),
      setCurrentModule: (module) => set({ currentModule: module }),
      setAudio: (audio) =>
        set((state) => ({ audio: { ...state.audio, ...audio } })),

      get theme() {
        return get().user?.theme ?? "light";
      },
      get language() {
        return get().user?.language ?? "fr";
      },
      get level() {
        return get().user?.level ?? "beginner";
      },
      get fontSize() {
        return get().user?.font_size ?? 3;
      },
    }),
    {
      name: "arabe-local-app-store",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        // Ne persister que ce qui est utile localement
        sidebarOpen: state.sidebarOpen,
        audio: { volume: state.audio.volume },
      }),
    }
  )
);

// ============================================================
// QUIZ STORE (état temporaire de quiz)
// ============================================================

interface QuizState {
  isActive: boolean;
  module: string | null;
  currentIndex: number;
  answers: Record<string, { selected: string; correct: boolean }>;
  startTime: number | null;

  startQuiz: (module: string) => void;
  answerQuestion: (questionId: string, selected: string, correct: boolean) => void;
  nextQuestion: () => void;
  endQuiz: () => void;

  // Computed
  score: number;
  totalAnswered: number;
}

export const useQuizStore = create<QuizState>()((set, get) => ({
  isActive: false,
  module: null,
  currentIndex: 0,
  answers: {},
  startTime: null,

  startQuiz: (module) =>
    set({ isActive: true, module, currentIndex: 0, answers: {}, startTime: Date.now() }),

  answerQuestion: (questionId, selected, correct) =>
    set((state) => ({
      answers: { ...state.answers, [questionId]: { selected, correct } },
    })),

  nextQuestion: () =>
    set((state) => ({ currentIndex: state.currentIndex + 1 })),

  endQuiz: () =>
    set({ isActive: false, module: null, currentIndex: 0, answers: {}, startTime: null }),

  get score() {
    const answers = get().answers;
    return Object.values(answers).filter((a) => a.correct).length;
  },
  get totalAnswered() {
    return Object.keys(get().answers).length;
  },
}));
