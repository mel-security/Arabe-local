import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle, BrainCircuit, ChevronRight } from "lucide-react";
import { clsx } from "clsx";
import toast from "react-hot-toast";
import { readingApi } from "@/services/database";
import { useDatabase, useMutation } from "@/hooks/useDatabase";
import ArabicText from "@/components/common/ArabicText";
import { PlayButton } from "@/components/common/AudioPlayer";
import QuizEngine, { GenericQuestion } from "@/components/quiz/QuizEngine";
import { speakArabic } from "@/services/audio";

type ViewMode = "lesson" | "quiz";

export default function ReadingLesson() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const lessonId = Number(id);
  const [viewMode, setViewMode] = useState<ViewMode>("lesson");
  const [activeItem, setActiveItem] = useState(0);

  const { data: lesson, refetch } = useDatabase(
    () => readingApi.getLessonById(lessonId),
    [lessonId]
  );

  const { execute: complete } = useMutation(readingApi.completeLesson);

  if (!lesson) {
    return <div className="flex items-center justify-center h-64"><div className="spinner" /></div>;
  }

  const quizQuestions: GenericQuestion[] = lesson.exercises.map((ex, i) => ({
    id: `rq_${i}`,
    arabic: ex.arabic ?? undefined,
    question: ex.question,
    options: ex.options,
    correct_answer: ex.correct_answer,
  }));

  const handleCompleteLesson = async (score: number, total: number) => {
    const pct = total > 0 ? (score / total) * 100 : 100;
    await complete(lessonId, pct);
    await refetch();
    toast.success("Leçon terminée ! Bravo 🎉");
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6 animate-slide-up">
      {/* En-tête */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs text-blue-500 font-medium mb-1 uppercase tracking-wide">
            Leçon {lesson.order_num}
          </p>
          <h1 className="text-xl font-bold text-gray-900 dark:text-white">{lesson.title_fr}</h1>
          {lesson.description_fr && (
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{lesson.description_fr}</p>
          )}
        </div>

        {lesson.is_completed && (
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-green-100 dark:bg-green-950 text-green-700 dark:text-green-300 text-xs font-medium flex-shrink-0">
            <CheckCircle className="w-3.5 h-3.5" />
            Terminé
          </div>
        )}
      </div>

      {/* Onglets Leçon / Quiz */}
      <div className="flex gap-1 bg-sand-100 dark:bg-gray-800 rounded-xl p-1">
        <button
          onClick={() => setViewMode("lesson")}
          className={clsx(
            "flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-all",
            viewMode === "lesson"
              ? "bg-white dark:bg-gray-900 text-primary-600 shadow-sm"
              : "text-gray-500 hover:text-gray-700 dark:text-gray-400"
          )}
        >
          📖 Contenu
        </button>
        <button
          onClick={() => setViewMode("quiz")}
          disabled={quizQuestions.length === 0}
          className={clsx(
            "flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-all disabled:opacity-50",
            viewMode === "quiz"
              ? "bg-white dark:bg-gray-900 text-primary-600 shadow-sm"
              : "text-gray-500 hover:text-gray-700 dark:text-gray-400"
          )}
        >
          🧠 Exercices ({quizQuestions.length})
        </button>
      </div>

      <AnimatePresence mode="wait">
        {viewMode === "lesson" ? (
          <motion.div
            key="lesson"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="space-y-4"
          >
            {/* Contenu de la leçon */}
            <div className="bg-white dark:bg-gray-900 rounded-2xl border border-sand-100 dark:border-gray-800 overflow-hidden">
              {/* Navigation du contenu */}
              {lesson.content.length > 1 && (
                <div className="flex gap-1 p-3 border-b border-sand-50 dark:border-gray-800 overflow-x-auto">
                  {lesson.content.map((_, i) => (
                    <button
                      key={i}
                      onClick={() => setActiveItem(i)}
                      className={clsx(
                        "w-6 h-6 rounded-full flex-shrink-0 text-xs font-medium transition-all",
                        activeItem === i
                          ? "bg-primary-500 text-white"
                          : "bg-sand-100 dark:bg-gray-800 text-gray-400"
                      )}
                    >
                      {i + 1}
                    </button>
                  ))}
                </div>
              )}

              {/* Élément actif */}
              {lesson.content[activeItem] && (
                <AnimatePresence mode="wait">
                  <motion.div
                    key={activeItem}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0 }}
                    className="p-6 md:p-8 text-center"
                  >
                    <div className="mb-4">
                      <ArabicText
                        text={lesson.content[activeItem].arabic}
                        size="display"
                        className="text-primary-700 dark:text-primary-300"
                        bold
                      />
                    </div>

                    {lesson.content[activeItem].transliteration && (
                      <p className="text-primary-500 font-mono text-lg mb-2">
                        {lesson.content[activeItem].transliteration}
                      </p>
                    )}

                    {lesson.content[activeItem].translation_fr && (
                      <p className="text-gray-600 dark:text-gray-300">
                        {lesson.content[activeItem].translation_fr}
                      </p>
                    )}

                    <div className="flex justify-center mt-4">
                      <PlayButton
                        src={lesson.content[activeItem].audio_file}
                        arabicText={lesson.content[activeItem].arabic}
                        size="lg"
                      />
                    </div>
                  </motion.div>
                </AnimatePresence>
              )}

              {/* Navigation prev/next */}
              {lesson.content.length > 1 && (
                <div className="flex justify-between p-4 border-t border-sand-50 dark:border-gray-800">
                  <button
                    onClick={() => setActiveItem((i) => Math.max(0, i - 1))}
                    disabled={activeItem === 0}
                    className="btn-secondary text-sm disabled:opacity-40"
                  >
                    ← Précédent
                  </button>
                  <span className="text-sm text-gray-400 self-center">
                    {activeItem + 1}/{lesson.content.length}
                  </span>
                  <button
                    onClick={() => setActiveItem((i) => Math.min(lesson.content.length - 1, i + 1))}
                    disabled={activeItem === lesson.content.length - 1}
                    className="btn-primary text-sm disabled:opacity-40"
                  >
                    Suivant →
                  </button>
                </div>
              )}
            </div>

            {/* Tous les éléments en grille */}
            {lesson.content.length > 1 && (
              <div>
                <h2 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                  Tous les éléments
                </h2>
                <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2">
                  {lesson.content.map((item, i) => (
                    <button
                      key={i}
                      onClick={() => { setActiveItem(i); speakArabic(item.arabic); }}
                      className={clsx(
                        "flex flex-col items-center gap-1 p-3 rounded-xl border-2 transition-all",
                        activeItem === i
                          ? "border-primary-400 bg-primary-50 dark:bg-primary-950"
                          : "border-sand-200 dark:border-gray-700 bg-white dark:bg-gray-900 hover:border-primary-300"
                      )}
                    >
                      <ArabicText
                        text={item.arabic}
                        size="lg"
                        className="text-primary-700 dark:text-primary-300"
                      />
                      {item.transliteration && (
                        <span className="text-xs text-primary-400 font-mono">
                          {item.transliteration}
                        </span>
                      )}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Bouton commencer les exercices */}
            {quizQuestions.length > 0 && (
              <button
                onClick={() => setViewMode("quiz")}
                className="btn-primary w-full gap-2"
              >
                <BrainCircuit className="w-4 h-4" />
                Commencer les exercices
                <ChevronRight className="w-4 h-4" />
              </button>
            )}
          </motion.div>
        ) : (
          <motion.div key="quiz" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <QuizEngine
              questions={quizQuestions}
              title="Exercices de la leçon"
              onComplete={handleCompleteLesson}
              onExit={() => navigate("/reading")}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
