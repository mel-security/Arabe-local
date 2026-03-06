import { create } from "zustand";
import type {
  ChatMessage, ChatSession, ChatContext, LLMSettings, ModelStatus, ChatMode
} from "@/types";

interface LLMState {
  // Statut du modèle
  modelStatus: ModelStatus | null;
  isCheckingModel: boolean;

  // Chat
  chatOpen: boolean;
  chatContext: ChatContext | null;
  currentSession: ChatSession | null;
  sessions: ChatSession[];
  messages: ChatMessage[];
  isStreaming: boolean;
  streamingContent: string;

  // Paramètres
  settings: LLMSettings | null;

  // Actions
  setModelStatus: (status: ModelStatus | null) => void;
  setIsCheckingModel: (v: boolean) => void;
  setChatOpen: (open: boolean) => void;
  setChatContext: (ctx: ChatContext | null) => void;
  openChatWith: (ctx: ChatContext) => void;
  setCurrentSession: (s: ChatSession | null) => void;
  setSessions: (sessions: ChatSession[]) => void;
  setMessages: (msgs: ChatMessage[]) => void;
  addMessage: (msg: ChatMessage) => void;
  updateLastMessage: (content: string, done?: boolean) => void;
  setIsStreaming: (v: boolean) => void;
  setStreamingContent: (s: string) => void;
  setSettings: (s: LLMSettings) => void;
  clearChat: () => void;
}

export const useLLMStore = create<LLMState>((set) => ({
  modelStatus: null,
  isCheckingModel: false,
  chatOpen: false,
  chatContext: null,
  currentSession: null,
  sessions: [],
  messages: [],
  isStreaming: false,
  streamingContent: "",
  settings: null,

  setModelStatus: (status) => set({ modelStatus: status }),
  setIsCheckingModel: (v) => set({ isCheckingModel: v }),
  setChatOpen: (open) => set({ chatOpen: open }),
  setChatContext: (ctx) => set({ chatContext: ctx }),
  openChatWith: (ctx) => set({ chatOpen: true, chatContext: ctx }),
  setCurrentSession: (s) => set({ currentSession: s }),
  setSessions: (sessions) => set({ sessions }),
  setMessages: (msgs) => set({ messages: msgs }),
  addMessage: (msg) => set((s) => ({ messages: [...s.messages, msg] })),
  updateLastMessage: (content, done = false) =>
    set((s) => {
      const msgs = [...s.messages];
      if (msgs.length === 0) return s;
      const last = { ...msgs[msgs.length - 1], content, isStreaming: !done };
      msgs[msgs.length - 1] = last;
      return { messages: msgs };
    }),
  setIsStreaming: (v) => set({ isStreaming: v }),
  setStreamingContent: (content) => set({ streamingContent: content }),
  setSettings: (settings) => set({ settings }),
  clearChat: () =>
    set({ messages: [], currentSession: null, chatContext: null, streamingContent: "" }),
}));

// Modes de chat disponibles
export const CHAT_MODES: Array<{ id: ChatMode; label: string; icon: string; description: string }> = [
  { id: "general",     label: "Conversation",  icon: "💬", description: "Discussion libre sur l'arabe" },
  { id: "tutor",       label: "Tuteur",         icon: "🎓", description: "Cours adapté à votre niveau" },
  { id: "explanation", label: "Explication",    icon: "📖", description: "Explication détaillée" },
  { id: "quiz",        label: "Quiz",           icon: "🧠", description: "Questions et exercices" },
  { id: "correction",  label: "Correction",     icon: "✏️", description: "Corriger votre arabe" },
  { id: "quran",       label: "Coran",          icon: "📿", description: "Aide à la compréhension coranique" },
];
