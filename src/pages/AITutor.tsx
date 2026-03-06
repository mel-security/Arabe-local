import { useState, useEffect } from "react";
import { Bot, BookOpen, Zap, RefreshCw, Sparkles, ChevronRight, Play, Loader2 } from "lucide-react";
import { clsx } from "clsx";
import { motion, AnimatePresence } from "framer-motion";
import toast from "react-hot-toast";
import { useLLMStore, CHAT_MODES } from "@/store/llmStore";
import { useAppStore } from "@/store";
import { llmService } from "@/services/llm";
import { chatService } from "@/services/chat/chatService";
import ModelStatus from "@/components/chat/ModelStatus";
import type { ChatMode } from "@/types";

export default function AITutor() {
  const modelStatus = useLLMStore((s) => s.modelStatus);
  const openChatWith = useLLMStore((s) => s.openChatWith);
  const user = useAppStore((s) => s.user);
  const progress = useAppStore((s) => s.progress);

  const [dailyLesson, setDailyLesson] = useState<string | null>(null);
  const [isGeneratingLesson, setIsGeneratingLesson] = useState(false);

  const level = user?.level ?? "beginner";

  const handleGenerateDailyLesson = async () => {
    if (!modelStatus?.available) {
      toast.error("L'IA n'est pas disponible");
      return;
    }
    setIsGeneratingLesson(true);
    try {
      const lesson = await llmService.generateDailyLesson(level);
      setDailyLesson(lesson);
    } catch (err) {
      toast.error("Erreur lors de la génération");
    } finally {
      setIsGeneratingLesson(false);
    }
  };

  const startChat = async (mode: ChatMode, subject?: string) => {
    const ctx = { mode, subject };
    openChatWith(ctx);
    try {
      await chatService.startSession(ctx, subject ? `${mode} : ${subject}` : undefined);
    } catch (err) {
      console.error(err);
    }
  };

  const SUGGESTED_TOPICS = [
    { label: "Les lettres solaires et lunaires", mode: "explanation" as ChatMode },
    { label: "La prononciation du ع et du غ", mode: "tutor" as ChatMode },
    { label: "Les racines arabes trilittères", mode: "explanation" as ChatMode },
    { label: "Le pluriel en arabe", mode: "tutor" as ChatMode },
    { label: "Quiz sur les lettres apprises", mode: "quiz" as ChatMode },
    { label: "Corriger mon écriture arabe", mode: "correction" as ChatMode },
  ];

  return (
    <div className="max-w-2xl mx-auto p-4 md:p-6 space-y-6">
      {/* En-tête */}
      <div className="flex items-center gap-3">
        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-accent-500 to-accent-600 flex items-center justify-center shadow-lg">
          <Bot className="w-6 h-6 text-white" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-gray-900 dark:text-white">Tuteur IA</h1>
          <p className="text-sm text-gray-400">
            Apprentissage adapté à votre niveau {level === "beginner" ? "débutant" : level}
          </p>
        </div>
      </div>

      {/* Statut modèle */}
      {!modelStatus?.available && <ModelStatus />}

      {/* Leçon du jour */}
      <section className="card">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-primary-500" />
            Leçon du jour
          </h2>
          <button
            onClick={handleGenerateDailyLesson}
            disabled={isGeneratingLesson || !modelStatus?.available}
            className={clsx(
              "flex items-center gap-2 text-sm font-medium px-3 py-1.5 rounded-lg transition-colors",
              modelStatus?.available
                ? "text-primary-600 dark:text-primary-400 hover:bg-primary-50 dark:hover:bg-primary-950"
                : "text-gray-400 cursor-not-allowed"
            )}
          >
            {isGeneratingLesson
              ? <Loader2 className="w-4 h-4 animate-spin" />
              : <Sparkles className="w-4 h-4" />
            }
            {isGeneratingLesson ? "Génération..." : "Générer"}
          </button>
        </div>

        {dailyLesson ? (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-sand-50 dark:bg-gray-800 rounded-xl p-4 text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap"
          >
            {formatLessonContent(dailyLesson)}
          </motion.div>
        ) : (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <div className="w-12 h-12 rounded-xl bg-sand-100 dark:bg-gray-800 flex items-center justify-center mb-3">
              <BookOpen className="w-6 h-6 text-gray-300 dark:text-gray-600" />
            </div>
            <p className="text-sm text-gray-400 dark:text-gray-500 max-w-xs">
              {modelStatus?.available
                ? "Cliquez sur \"Générer\" pour obtenir une leçon personnalisée"
                : "Activez l'IA pour obtenir des leçons personnalisées"
              }
            </p>
          </div>
        )}
      </section>

      {/* Modes de chat */}
      <section>
        <h2 className="font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
          <Zap className="w-4 h-4 text-primary-500" />
          Démarrer une session
        </h2>
        <div className="grid grid-cols-2 gap-3">
          {CHAT_MODES.map((mode) => (
            <button
              key={mode.id}
              onClick={() => startChat(mode.id)}
              disabled={!modelStatus?.available}
              className={clsx(
                "text-left p-4 rounded-xl border-2 transition-all group",
                modelStatus?.available
                  ? "border-sand-200 dark:border-gray-700 hover:border-primary-400 dark:hover:border-primary-600 hover:shadow-sm cursor-pointer"
                  : "border-sand-100 dark:border-gray-800 opacity-60 cursor-not-allowed"
              )}
            >
              <div className="text-2xl mb-2">{mode.icon}</div>
              <div className="font-medium text-sm text-gray-900 dark:text-white group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">
                {mode.label}
              </div>
              <div className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">{mode.description}</div>
            </button>
          ))}
        </div>
      </section>

      {/* Sujets suggérés */}
      <section>
        <h2 className="font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-primary-500" />
          Sujets suggérés
        </h2>
        <div className="space-y-2">
          {SUGGESTED_TOPICS.map((topic, i) => (
            <button
              key={i}
              onClick={() => startChat(topic.mode, topic.label)}
              disabled={!modelStatus?.available}
              className={clsx(
                "w-full flex items-center justify-between px-4 py-3 rounded-xl border text-sm text-left transition-all",
                modelStatus?.available
                  ? "border-sand-200 dark:border-gray-700 hover:border-primary-300 dark:hover:border-primary-700 hover:bg-primary-50 dark:hover:bg-primary-950 text-gray-700 dark:text-gray-300"
                  : "border-sand-100 dark:border-gray-800 text-gray-400 cursor-not-allowed"
              )}
            >
              <span>{topic.label}</span>
              <div className="flex items-center gap-2 flex-shrink-0">
                <span className="text-xs text-gray-400">
                  {CHAT_MODES.find((m) => m.id === topic.mode)?.icon}
                </span>
                <ChevronRight className="w-4 h-4 text-gray-300" />
              </div>
            </button>
          ))}
        </div>
      </section>

      {/* Progression */}
      {progress && (
        <section className="card">
          <h2 className="font-semibold text-gray-900 dark:text-white mb-3">📊 Votre progression</h2>
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div className="bg-sand-50 dark:bg-gray-800 rounded-xl p-3">
              <div className="text-2xl font-bold text-primary-600 dark:text-primary-400">
                {progress.letters_learned}
                <span className="text-gray-400 text-base font-normal">/{progress.letters_total}</span>
              </div>
              <div className="text-xs text-gray-500 mt-0.5">Lettres apprises</div>
            </div>
            <div className="bg-sand-50 dark:bg-gray-800 rounded-xl p-3">
              <div className="text-2xl font-bold text-accent-600 dark:text-accent-400">
                {progress.words_learned}
                <span className="text-gray-400 text-base font-normal">/{progress.words_total}</span>
              </div>
              <div className="text-xs text-gray-500 mt-0.5">Mots appris</div>
            </div>
          </div>
        </section>
      )}
    </div>
  );
}

function formatLessonContent(content: string) {
  try {
    const parsed = JSON.parse(content);
    if (parsed.title) {
      return (
        <div className="space-y-3">
          <h3 className="font-semibold text-gray-900 dark:text-white">{parsed.title}</h3>
          {parsed.objective && (
            <p className="text-sm text-gray-500 dark:text-gray-400 italic">{parsed.objective}</p>
          )}
          {parsed.vocabulary && Array.isArray(parsed.vocabulary) && parsed.vocabulary.length > 0 && (
            <div>
              <p className="text-xs font-medium text-gray-500 mb-1">Vocabulaire :</p>
              <div className="flex flex-wrap gap-2">
                {parsed.vocabulary.map((v: { arabic?: string; translation?: string }, i: number) => (
                  <span key={i} className="px-2 py-1 bg-primary-100 dark:bg-primary-900 rounded-lg text-xs">
                    <span className="arabic-text">{v.arabic}</span>
                    {v.translation && ` = ${v.translation}`}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      );
    }
  } catch {
    // Pas du JSON, afficher le texte brut
  }
  return <span>{content}</span>;
}
