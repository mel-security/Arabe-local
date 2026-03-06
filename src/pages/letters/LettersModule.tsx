import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Search, Filter, CheckCircle, BookOpen, BrainCircuit } from "lucide-react";
import { clsx } from "clsx";
import { lettersApi } from "@/services/database";
import { useDatabase } from "@/hooks/useDatabase";
import { useAppStore } from "@/store";
import ArabicText from "@/components/common/ArabicText";
import ProgressBar from "@/components/common/ProgressBar";
import { LevelBadge } from "@/components/common/Badge";
import type { Letter, Level } from "@/types";

export default function LettersModule() {
  const navigate = useNavigate();
  const user = useAppStore((s) => s.user);
  const [search, setSearch] = useState("");
  const [filterLevel, setFilterLevel] = useState<Level | "all">("all");
  const [filterLearned, setFilterLearned] = useState<"all" | "learned" | "not_learned">("all");

  const { data: letters, loading } = useDatabase(() => lettersApi.getAll());

  const filtered = (letters ?? []).filter((l) => {
    const matchSearch =
      !search ||
      l.name_fr.toLowerCase().includes(search.toLowerCase()) ||
      l.transliteration.toLowerCase().includes(search.toLowerCase()) ||
      l.arabic.includes(search);
    const matchLevel = filterLevel === "all" || l.level === filterLevel;
    const matchLearned =
      filterLearned === "all" ||
      (filterLearned === "learned" && l.is_learned) ||
      (filterLearned === "not_learned" && !l.is_learned);
    return matchSearch && matchLevel && matchLearned;
  });

  const totalLearned = (letters ?? []).filter((l) => l.is_learned).length;
  const total = (letters ?? []).length;

  return (
    <div className="space-y-6 animate-slide-up">
      {/* En-tête */}
      <div className="flex flex-col md:flex-row md:items-center gap-4">
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
            Lettres arabes
          </h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm">
            Les 28 lettres de l'alphabet arabe
          </p>
        </div>

        {/* Bouton Quiz */}
        <button
          onClick={() => navigate("/letters/quiz")}
          className="btn-primary gap-2"
          disabled={totalLearned < 2}
        >
          <BrainCircuit className="w-4 h-4" />
          Quiz ({totalLearned} lettres)
        </button>
      </div>

      {/* Progression */}
      <div className="bg-white dark:bg-gray-900 rounded-2xl p-4 border border-sand-100 dark:border-gray-800">
        <ProgressBar
          current={totalLearned}
          max={total}
          label={`${totalLearned}/${total} lettres apprises`}
          showPercent
          size="md"
        />
      </div>

      {/* Filtres */}
      <div className="flex flex-col sm:flex-row gap-3">
        {/* Recherche */}
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Rechercher une lettre..."
            className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-sand-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-sm text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-300"
          />
        </div>

        {/* Filtre niveau */}
        <select
          value={filterLevel}
          onChange={(e) => setFilterLevel(e.target.value as Level | "all")}
          className="px-3 py-2.5 rounded-xl border border-sand-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-sm text-gray-700 dark:text-gray-300 focus:outline-none focus:ring-2 focus:ring-primary-300"
        >
          <option value="all">Tous les niveaux</option>
          <option value="beginner">Débutant</option>
          <option value="intermediate">Intermédiaire</option>
          <option value="advanced">Avancé</option>
          <option value="expert">Expert</option>
        </select>

        {/* Filtre appris */}
        <select
          value={filterLearned}
          onChange={(e) => setFilterLearned(e.target.value as typeof filterLearned)}
          className="px-3 py-2.5 rounded-xl border border-sand-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-sm text-gray-700 dark:text-gray-300 focus:outline-none focus:ring-2 focus:ring-primary-300"
        >
          <option value="all">Toutes</option>
          <option value="learned">Apprises</option>
          <option value="not_learned">À apprendre</option>
        </select>
      </div>

      {/* Grille de lettres */}
      {loading ? (
        <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-7 gap-3">
          {Array.from({ length: 28 }).map((_, i) => (
            <div key={i} className="h-20 rounded-2xl bg-sand-100 dark:bg-gray-800 animate-pulse" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-7 gap-3 stagger-children">
          {filtered.map((letter) => (
            <LetterCard
              key={letter.id}
              letter={letter}
              onClick={() => navigate(`/letters/${letter.id}`)}
            />
          ))}
          {filtered.length === 0 && (
            <div className="col-span-full text-center py-12 text-gray-400">
              Aucune lettre ne correspond à votre recherche.
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ============================================================
// Carte lettre
// ============================================================

function LetterCard({ letter, onClick }: { letter: Letter; onClick: () => void }) {
  return (
    <motion.button
      onClick={onClick}
      className={clsx(
        "letter-card group",
        letter.is_learned
          ? "border-green-300 bg-green-50 dark:border-green-700 dark:bg-green-950"
          : "border-sand-200 bg-white dark:border-gray-700 dark:bg-gray-900 hover:border-primary-300 hover:bg-primary-50 dark:hover:border-primary-600 dark:hover:bg-primary-950"
      )}
      whileHover={{ scale: 1.05, y: -2 }}
      whileTap={{ scale: 0.95 }}
    >
      {/* Badge appris */}
      {letter.is_learned && (
        <div className="absolute top-1.5 right-1.5">
          <CheckCircle className="w-3.5 h-3.5 text-green-500" />
        </div>
      )}

      {/* Numéro */}
      <span className="text-xs text-gray-400 dark:text-gray-500 mb-1 font-mono">
        {letter.order_num}
      </span>

      {/* Lettre */}
      <ArabicText
        text={letter.isolated_form}
        size="lg"
        className={clsx(
          "font-bold",
          letter.is_learned ? "text-green-700 dark:text-green-300" : "text-gray-900 dark:text-white"
        )}
      />

      {/* Nom */}
      <span className={clsx(
        "text-xs mt-1 text-center leading-tight",
        letter.is_learned ? "text-green-600 dark:text-green-400" : "text-gray-500 dark:text-gray-400"
      )}>
        {letter.name_fr}
      </span>

      {/* Score quiz */}
      {letter.quiz_score !== null && (
        <span className="text-xs font-bold text-primary-500 mt-0.5">
          {Math.round(letter.quiz_score)}%
        </span>
      )}
    </motion.button>
  );
}
