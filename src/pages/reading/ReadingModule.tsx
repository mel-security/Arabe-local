import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { CheckCircle, Lock, BookOpen, ChevronRight, Layers } from "lucide-react";
import { clsx } from "clsx";
import { readingApi } from "@/services/database";
import { useDatabase } from "@/hooks/useDatabase";
import ProgressBar from "@/components/common/ProgressBar";
import { LevelBadge } from "@/components/common/Badge";
import type { ReadingLesson } from "@/types";

const lessonTypeLabels: Record<string, string> = {
  letters:   "Lettres",
  syllables: "Syllabes",
  words:     "Mots",
  sentences: "Phrases",
  paragraph: "Paragraphe",
};

const lessonTypeIcons: Record<string, string> = {
  letters:   "🔤",
  syllables: "🔡",
  words:     "📝",
  sentences: "📖",
  paragraph: "📄",
};

export default function ReadingModule() {
  const navigate = useNavigate();
  const { data: lessons, loading } = useDatabase(() => readingApi.getLessons());

  const completed = (lessons ?? []).filter((l) => l.is_completed).length;
  const total = (lessons ?? []).length;

  // Un module est débloqué si le précédent est terminé
  const isUnlocked = (index: number) => {
    if (index === 0) return true;
    return (lessons ?? [])[index - 1]?.is_completed ?? false;
  };

  return (
    <div className="space-y-6 animate-slide-up">
      {/* En-tête */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">Lecture</h1>
        <p className="text-gray-500 dark:text-gray-400 text-sm">
          Des lettres aux phrases complètes, progression guidée
        </p>
      </div>

      {/* Progression */}
      <div className="bg-white dark:bg-gray-900 rounded-2xl p-4 border border-sand-100 dark:border-gray-800">
        <ProgressBar
          current={completed}
          max={total}
          label={`${completed}/${total} leçons terminées`}
          showPercent
        />
      </div>

      {/* Liste des leçons */}
      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-20 rounded-2xl bg-sand-100 dark:bg-gray-800 animate-pulse" />
          ))}
        </div>
      ) : (
        <div className="space-y-3 stagger-children">
          {(lessons ?? []).map((lesson, index) => {
            const unlocked = isUnlocked(index);
            return (
              <LessonCard
                key={lesson.id}
                lesson={lesson}
                unlocked={unlocked}
                index={index}
                onClick={() => unlocked && navigate(`/reading/${lesson.id}`)}
              />
            );
          })}

          {(lessons ?? []).length === 0 && (
            <div className="text-center py-12 text-gray-400">
              <BookOpen className="w-12 h-12 mx-auto mb-3 opacity-30" />
              <p>Aucune leçon disponible pour le moment.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function LessonCard({
  lesson, unlocked, index, onClick
}: {
  lesson: ReadingLesson;
  unlocked: boolean;
  index: number;
  onClick: () => void;
}) {
  return (
    <motion.button
      onClick={onClick}
      disabled={!unlocked}
      className={clsx(
        "w-full flex items-center gap-4 p-4 rounded-2xl border-2 text-left",
        "transition-all duration-200",
        lesson.is_completed
          ? "border-green-300 bg-green-50 dark:border-green-700 dark:bg-green-950"
          : unlocked
          ? "border-sand-200 bg-white dark:border-gray-700 dark:bg-gray-900 hover:border-primary-300 hover:shadow-md"
          : "border-sand-100 bg-sand-50 dark:border-gray-800 dark:bg-gray-900 opacity-60 cursor-not-allowed"
      )}
      whileHover={unlocked ? { scale: 1.01 } : {}}
      whileTap={unlocked ? { scale: 0.99 } : {}}
    >
      {/* Icône statut */}
      <div className={clsx(
        "w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0 text-2xl",
        lesson.is_completed
          ? "bg-green-100 dark:bg-green-900"
          : unlocked
          ? "bg-blue-100 dark:bg-blue-900"
          : "bg-gray-100 dark:bg-gray-800"
      )}>
        {lesson.is_completed ? (
          <CheckCircle className="w-6 h-6 text-green-600 dark:text-green-400" />
        ) : unlocked ? (
          <span>{lessonTypeIcons[lesson.lesson_type] ?? "📖"}</span>
        ) : (
          <Lock className="w-5 h-5 text-gray-400" />
        )}
      </div>

      {/* Contenu */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-xs text-gray-400 font-mono">#{index + 1}</span>
          <span className="text-xs text-blue-500 font-medium">
            {lessonTypeLabels[lesson.lesson_type] ?? lesson.lesson_type}
          </span>
          <LevelBadge level={lesson.level} />
        </div>
        <h3 className="font-semibold text-gray-900 dark:text-white text-sm md:text-base truncate">
          {lesson.title_fr}
        </h3>
        {lesson.description_fr && (
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 line-clamp-1">
            {lesson.description_fr}
          </p>
        )}
        {lesson.quiz_score !== null && (
          <p className="text-xs text-green-600 dark:text-green-400 font-medium mt-1">
            Score : {Math.round(lesson.quiz_score)}%
          </p>
        )}
      </div>

      {/* Flèche */}
      {unlocked && <ChevronRight className="w-4 h-4 text-gray-400 flex-shrink-0" />}
    </motion.button>
  );
}
