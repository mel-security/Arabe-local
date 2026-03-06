import { useEffect, useRef, useState, useCallback } from "react";
import { X, Bot, Plus, ChevronDown, Loader2 } from "lucide-react";
import { clsx } from "clsx";
import { motion, AnimatePresence } from "framer-motion";
import { useLLMStore, CHAT_MODES } from "@/store/llmStore";
import { useAppStore } from "@/store";
import { chatService } from "@/services/chat/chatService";
import { llmService } from "@/services/llm";
import ChatMessage from "./ChatMessage";
import ChatInput from "./ChatInput";
import ModelStatus from "./ModelStatus";
import type { ChatMode } from "@/types";

export default function ChatDrawer() {
  const chatOpen = useLLMStore((s) => s.chatOpen);
  const setChatOpen = useLLMStore((s) => s.setChatOpen);
  const chatContext = useLLMStore((s) => s.chatContext);
  const messages = useLLMStore((s) => s.messages);
  const currentSession = useLLMStore((s) => s.currentSession);
  const isStreaming = useLLMStore((s) => s.isStreaming);
  const modelStatus = useLLMStore((s) => s.modelStatus);
  const settings = useLLMStore((s) => s.settings);

  const user = useAppStore((s) => s.user);
  const level = user?.level ?? "beginner";

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const abortRef = useRef<AbortController | null>(null);
  const [isInit, setIsInit] = useState(false);
  const [selectedMode, setSelectedMode] = useState<ChatMode>("general");

  // Initialisation
  useEffect(() => {
    if (!isInit) {
      llmService.init().then(() => setIsInit(true));
    }
  }, [isInit]);

  // Scroll to bottom quand nouveaux messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Créer une session quand le drawer s'ouvre
  useEffect(() => {
    if (chatOpen && !currentSession && isInit) {
      const ctx = chatContext ?? { mode: selectedMode };
      chatService.startSession(ctx).catch(console.error);
    }
  }, [chatOpen, currentSession, isInit, chatContext, selectedMode]);

  const handleSend = useCallback(async (content: string) => {
    if (!currentSession) {
      const ctx = chatContext ?? { mode: selectedMode };
      await chatService.startSession(ctx);
    }
    await chatService.sendMessage(content, level);
  }, [currentSession, chatContext, selectedMode, level]);

  const handleStop = () => {
    abortRef.current?.abort();
    useLLMStore.getState().setIsStreaming(false);
    useLLMStore.getState().updateLastMessage(
      useLLMStore.getState().messages[useLLMStore.getState().messages.length - 1]?.content ?? "",
      true
    );
  };

  const handleNewChat = async () => {
    useLLMStore.getState().clearChat();
    const ctx = { mode: selectedMode };
    await chatService.startSession(ctx);
  };

  const handleModeChange = async (mode: ChatMode) => {
    setSelectedMode(mode);
    useLLMStore.getState().clearChat();
    await chatService.startSession({ mode });
  };

  return (
    <AnimatePresence>
      {chatOpen && (
        <>
          {/* Overlay mobile */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/30 backdrop-blur-sm z-40 lg:hidden"
            onClick={() => setChatOpen(false)}
          />

          {/* Drawer */}
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className={clsx(
              "fixed right-0 top-0 h-full z-50",
              "w-full sm:w-[420px]",
              "bg-white dark:bg-gray-900",
              "border-l border-sand-100 dark:border-gray-800",
              "flex flex-col shadow-2xl"
            )}
          >
            {/* En-tête */}
            <div className="flex items-center gap-3 px-4 py-3 border-b border-sand-100 dark:border-gray-800">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-accent-500 to-accent-600 flex items-center justify-center">
                <Bot className="w-5 h-5 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <h2 className="font-semibold text-gray-900 dark:text-white text-sm">Assistant IA</h2>
                <p className="text-xs text-gray-400 truncate">
                  {settings?.model_name ?? "Configuration requise"}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={handleNewChat}
                  title="Nouvelle conversation"
                  className="btn-icon text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
                >
                  <Plus className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setChatOpen(false)}
                  className="btn-icon text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Sélecteur de mode */}
            <div className="flex gap-1 px-3 py-2 border-b border-sand-100 dark:border-gray-800 overflow-x-auto no-scrollbar">
              {CHAT_MODES.map((mode) => (
                <button
                  key={mode.id}
                  onClick={() => handleModeChange(mode.id)}
                  title={mode.description}
                  className={clsx(
                    "flex-shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all",
                    (chatContext?.mode ?? selectedMode) === mode.id
                      ? "bg-primary-500 text-white shadow-sm"
                      : "bg-sand-50 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-sand-100"
                  )}
                >
                  <span>{mode.icon}</span>
                  <span>{mode.label}</span>
                </button>
              ))}
            </div>

            {/* Contenu principal */}
            <div className="flex-1 overflow-y-auto">
              {!modelStatus?.available ? (
                /* Statut modèle indisponible */
                <div className="p-4">
                  <ModelStatus />
                </div>
              ) : messages.length === 0 ? (
                /* État vide */
                <div className="flex flex-col items-center justify-center h-full p-8 text-center">
                  <div className="w-16 h-16 rounded-2xl bg-accent-100 dark:bg-accent-950 flex items-center justify-center mb-4">
                    <Bot className="w-8 h-8 text-accent-600 dark:text-accent-400" />
                  </div>
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                    {chatContext?.subject
                      ? `Discuter de : ${chatContext.subject}`
                      : "Comment puis-je vous aider ?"}
                  </h3>
                  <p className="text-sm text-gray-400 dark:text-gray-500 max-w-xs">
                    Posez une question sur l'arabe, demandez une explication ou entraînez-vous.
                  </p>
                  <div className="mt-6 flex flex-col gap-2 w-full max-w-xs">
                    {QUICK_PROMPTS.map((prompt, i) => (
                      <button
                        key={i}
                        onClick={() => handleSend(prompt)}
                        className="text-left px-4 py-3 rounded-xl bg-sand-50 dark:bg-gray-800 hover:bg-sand-100 dark:hover:bg-gray-750 text-sm text-gray-700 dark:text-gray-300 transition-colors border border-sand-100 dark:border-gray-700"
                      >
                        {prompt}
                      </button>
                    ))}
                  </div>
                </div>
              ) : (
                /* Liste des messages */
                <div className="flex flex-col gap-4 p-4">
                  {messages.map((msg, i) => (
                    <ChatMessage key={i} message={msg} />
                  ))}
                  <div ref={messagesEndRef} />
                </div>
              )}
            </div>

            {/* Saisie */}
            {modelStatus?.available && (
              <ChatInput
                onSend={handleSend}
                onStop={handleStop}
                isStreaming={isStreaming}
                disabled={!currentSession}
                placeholder={getPlaceholder(chatContext?.mode ?? selectedMode)}
              />
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

const QUICK_PROMPTS = [
  "Explique-moi comment fonctionne la racine arabe",
  "Donne-moi 5 mots arabes courants avec leur sens",
  "Comment prononcer la lettre ع (Ain) ?",
  "Quel est le sens de بِسْمِ اللّٰهِ ?",
];

function getPlaceholder(mode: ChatMode): string {
  const placeholders: Record<ChatMode, string> = {
    general: "Posez votre question sur l'arabe...",
    tutor: "Demandez votre leçon du jour...",
    explanation: "Quel élément voulez-vous expliquer ?",
    quiz: "Demandez un exercice ou un quiz...",
    correction: "Écrivez votre texte arabe à corriger...",
    quran: "Posez une question sur le Coran...",
  };
  return placeholders[mode] ?? "Posez votre question...";
}
