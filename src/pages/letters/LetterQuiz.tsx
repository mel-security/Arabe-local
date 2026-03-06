import { useNavigate } from "react-router-dom";
import { lettersApi } from "@/services/database";
import { useDatabase } from "@/hooks/useDatabase";
import QuizEngine from "@/components/quiz/QuizEngine";
import type { GenericQuestion } from "@/components/quiz/QuizEngine";

export default function LetterQuiz() {
  const navigate = useNavigate();

  const { data: letters, loading } = useDatabase(() => lettersApi.getAll());

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="spinner" />
      </div>
    );
  }

  const learnedLetters = (letters ?? []).filter((l) => l.is_learned);
  const questionsSource = learnedLetters.length >= 2 ? learnedLetters : (letters ?? []).slice(0, 5);

  // Construire les questions
  const allNames = (letters ?? []).map((l) => l.name_fr);

  const questions: GenericQuestion[] = questionsSource.slice(0, 10).map((letter, idx) => {
    // 3 mauvaises réponses
    const wrongs = allNames
      .filter((n) => n !== letter.name_fr)
      .sort(() => Math.random() - 0.5)
      .slice(0, 3);

    const options = [...wrongs, letter.name_fr].sort(() => Math.random() - 0.5);

    return {
      id: `lq_${idx}_${letter.id}`,
      arabic: letter.isolated_form,
      question: "Quel est le nom de cette lettre ?",
      options,
      correct_answer: letter.name_fr,
    };
  });

  return (
    <div className="animate-slide-up">
      <div className="mb-6">
        <h1 className="text-xl font-bold text-gray-900 dark:text-white mb-1">
          Quiz — Lettres arabes
        </h1>
        <p className="text-gray-500 dark:text-gray-400 text-sm">
          Testez votre connaissance des lettres.
        </p>
      </div>

      <QuizEngine
        questions={questions}
        title="Identifiez les lettres"
        onComplete={async (score, total) => {
          // Enregistrer le score
          const pct = Math.round((score / total) * 100);
          await Promise.allSettled(
            questionsSource.slice(0, total).map((l) =>
              lettersApi.submitQuizAnswer(l.id, true, pct)
            )
          );
        }}
        onExit={() => navigate("/letters")}
      />
    </div>
  );
}
