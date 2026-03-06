import { useNavigate, useSearchParams } from "react-router-dom";
import { wordsApi } from "@/services/database";
import { useDatabase } from "@/hooks/useDatabase";
import QuizEngine, { GenericQuestion } from "@/components/quiz/QuizEngine";

export default function WordQuiz() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const category = searchParams.get("category") ?? undefined;

  const { data: words, loading } = useDatabase(() =>
    category ? wordsApi.getByCategory(category) : wordsApi.getAll()
  );

  if (loading) {
    return <div className="flex items-center justify-center h-64"><div className="spinner" /></div>;
  }

  const allTranslations = (words ?? []).map((w) => w.translation_fr);

  const questions: GenericQuestion[] = (words ?? [])
    .sort(() => Math.random() - 0.5)
    .slice(0, 10)
    .map((word, idx) => {
      const wrongs = allTranslations
        .filter((t) => t !== word.translation_fr)
        .sort(() => Math.random() - 0.5)
        .slice(0, 3);

      const options = [...wrongs, word.translation_fr].sort(() => Math.random() - 0.5);

      return {
        id: `wq_${idx}_${word.id}`,
        arabic: word.arabic,
        question: "Quelle est la traduction de ce mot ?",
        options,
        correct_answer: word.translation_fr,
      };
    });

  return (
    <div className="animate-slide-up">
      <div className="mb-6">
        <h1 className="text-xl font-bold text-gray-900 dark:text-white mb-1">
          Quiz — Vocabulaire
        </h1>
        <p className="text-gray-500 dark:text-gray-400 text-sm">
          Testez votre connaissance des mots.
          {category && ` Catégorie : ${category}`}
        </p>
      </div>

      {questions.length < 2 ? (
        <div className="text-center py-12 text-gray-400">
          <p>Pas assez de mots pour générer un quiz.</p>
          <button onClick={() => navigate("/words")} className="btn-primary mt-4">
            Apprendre des mots
          </button>
        </div>
      ) : (
        <QuizEngine
          questions={questions}
          title="Traduisez les mots arabes"
          onComplete={async (score, total) => {
            const pct = total > 0 ? (score / total) * 100 : 0;
            await Promise.allSettled(
              (words ?? []).slice(0, total).map((w) =>
                wordsApi.markLearned(w.id, pct >= 70)
              )
            );
          }}
          onExit={() => navigate("/words")}
        />
      )}
    </div>
  );
}
