import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle, XCircle, ChevronRight, Trophy, RotateCcw } from "lucide-react";
import { clsx } from "clsx";
import ArabicText from "@/components/common/ArabicText";
import ProgressBar, { CircleProgress } from "@/components/common/ProgressBar";

export interface GenericQuestion {
  id: string;
  arabic?: string;
  question: string;
  options: string[];
  correct_answer: string;
}

interface QuizEngineProps {
  questions: GenericQuestion[];
  title?: string;
  onComplete?: (score: number, total: number) => void;
  onExit?: () => void;
}

type AnswerState = "idle" | "correct" | "wrong";

export default function QuizEngine({ questions, title, onComplete, onExit }: QuizEngineProps) {
  const [currentIdx, setCurrentIdx] = useState(0);
  const [selected, setSelected] = useState<string | null>(null);
  const [answerState, setAnswerState] = useState<AnswerState>("idle");
  const [score, setScore] = useState(0);
  const [finished, setFinished] = useState(false);
  const [answers, setAnswers] = useState<Record<string, boolean>>({});

  const current = questions[currentIdx];
  const total = questions.length;
  const progress = ((currentIdx + (answerState !== "idle" ? 1 : 0)) / total) * 100;

  const handleSelect = useCallback((option: string) => {
    if (answerState !== "idle") return;

    const isCorrect = option === current.correct_answer;
    setSelected(option);
    setAnswerState(isCorrect ? "correct" : "wrong");
    if (isCorrect) setScore((s) => s + 1);
    setAnswers((prev) => ({ ...prev, [current.id]: isCorrect }));
  }, [answerState, current]);

  const handleNext = useCallback(() => {
    if (currentIdx < total - 1) {
      setCurrentIdx((i) => i + 1);
      setSelected(null);
      setAnswerState("idle");
    } else {
      setFinished(true);
      onComplete?.(score + (answerState === "correct" ? 1 : 0), total);
    }
  }, [currentIdx, total, score, answerState, onComplete]);

  const handleRestart = () => {
    setCurrentIdx(0);
    setSelected(null);
    setAnswerState("idle");
    setScore(0);
    setFinished(false);
    setAnswers({});
  };

  if (finished) {
    const finalScore = Object.values(answers).filter(Boolean).length;
    const pct = Math.round((finalScore / total) * 100);
    return <QuizResult score={finalScore} total={total} percent={pct} onRestart={handleRestart} onExit={onExit} />;
  }

  return (
    <div className="max-w-2xl mx-auto">
      {/* En-tête */}
      <div className="mb-6">
        {title && (
          <h2 className="font-bold text-gray-900 dark:text-white text-lg mb-3">{title}</h2>
        )}
        <div className="flex items-center gap-3">
          <ProgressBar value={progress} size="sm" className="flex-1" />
          <span className="text-sm text-gray-500 flex-shrink-0 tabular-nums">
            {currentIdx + 1}/{total}
          </span>
        </div>
      </div>

      {/* Question */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentIdx}
          initial={{ opacity: 0, x: 40 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -40 }}
          transition={{ duration: 0.25 }}
        >
          {/* Zone question */}
          <div className="bg-white dark:bg-gray-900 rounded-2xl p-6 md:p-8 mb-4 border border-sand-100 dark:border-gray-800 text-center">
            {current.arabic && (
              <div className="mb-4">
                <ArabicText
                  text={current.arabic}
                  size="2xl"
                  className="text-gray-900 dark:text-white"
                />
              </div>
            )}
            <p className="text-gray-700 dark:text-gray-300 font-medium text-base md:text-lg">
              {current.question}
            </p>
          </div>

          {/* Options */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">
            {current.options.map((option) => {
              const isSelected = selected === option;
              const isCorrect = option === current.correct_answer;
              const showResult = answerState !== "idle";

              return (
                <button
                  key={option}
                  onClick={() => handleSelect(option)}
                  disabled={showResult}
                  className={clsx(
                    "quiz-option text-left",
                    showResult && isCorrect && "show-correct",
                    showResult && isSelected && !isCorrect && "selected-wrong",
                    showResult && isSelected && isCorrect && "selected-correct",
                    !showResult && "hover:scale-[1.02]"
                  )}
                >
                  <span className={clsx(
                    "w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0 text-xs font-bold",
                    showResult && isCorrect ? "border-green-500 bg-green-500 text-white" : "border-gray-300 dark:border-gray-600",
                    showResult && isSelected && !isCorrect && "border-red-500 bg-red-500 text-white"
                  )}>
                    {showResult && isCorrect ? "✓" :
                     showResult && isSelected && !isCorrect ? "✗" : ""}
                  </span>
                  <span className="flex-1">{option}</span>
                  {showResult && isCorrect && (
                    <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                  )}
                  {showResult && isSelected && !isCorrect && (
                    <XCircle className="w-4 h-4 text-red-500 flex-shrink-0" />
                  )}
                </button>
              );
            })}
          </div>

          {/* Feedback + bouton suivant */}
          {answerState !== "idle" && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex flex-col sm:flex-row items-center gap-3"
            >
              <div className={clsx(
                "flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium flex-1",
                answerState === "correct"
                  ? "bg-green-50 text-green-800 dark:bg-green-950 dark:text-green-300"
                  : "bg-red-50 text-red-800 dark:bg-red-950 dark:text-red-300"
              )}>
                {answerState === "correct" ? (
                  <><CheckCircle className="w-4 h-4" /> Bonne réponse !</>
                ) : (
                  <><XCircle className="w-4 h-4" /> Réponse : {current.correct_answer}</>
                )}
              </div>

              <button
                onClick={handleNext}
                className="btn-primary flex-shrink-0"
              >
                {currentIdx < total - 1 ? (
                  <><span>Suivant</span><ChevronRight className="w-4 h-4" /></>
                ) : (
                  <><span>Terminer</span><Trophy className="w-4 h-4" /></>
                )}
              </button>
            </motion.div>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

// ============================================================
// Résultat du Quiz
// ============================================================

interface QuizResultProps {
  score: number;
  total: number;
  percent: number;
  onRestart?: () => void;
  onExit?: () => void;
}

function QuizResult({ score, total, percent, onRestart, onExit }: QuizResultProps) {
  const color = percent >= 80 ? "#22c55e" : percent >= 60 ? "#e09415" : "#ef4444";
  const label = percent >= 80 ? "Excellent !" : percent >= 60 ? "Bien joué !" : "Continuez !";

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="max-w-md mx-auto text-center py-8"
    >
      <div className="mb-6">
        <CircleProgress value={percent} size={120} color={color}>
          <div>
            <p className="text-2xl font-bold" style={{ color }}>{percent}%</p>
          </div>
        </CircleProgress>
      </div>

      <Trophy className="w-12 h-12 mx-auto mb-3 text-primary-400" />
      <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">{label}</h2>
      <p className="text-gray-500 dark:text-gray-400 mb-8">
        Vous avez obtenu <strong className="text-gray-900 dark:text-white">{score}/{total}</strong> bonnes réponses.
      </p>

      <div className="flex flex-col sm:flex-row gap-3 justify-center">
        {onRestart && (
          <button onClick={onRestart} className="btn-secondary gap-2">
            <RotateCcw className="w-4 h-4" />
            Recommencer
          </button>
        )}
        {onExit && (
          <button onClick={onExit} className="btn-primary">
            Continuer
          </button>
        )}
      </div>
    </motion.div>
  );
}
