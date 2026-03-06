import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Search, Filter, Star, BrainCircuit, BookOpen } from "lucide-react";
import { clsx } from "clsx";
import { wordsApi } from "@/services/database";
import { useDatabase } from "@/hooks/useDatabase";
import ArabicText from "@/components/common/ArabicText";
import { PlayButton } from "@/components/common/AudioPlayer";
import { LevelBadge } from "@/components/common/Badge";
import ProgressBar from "@/components/common/ProgressBar";
import type { VocabularyWord } from "@/types";
import { speakArabic } from "@/services/audio";

const CATEGORIES = [
  { slug: "all",       name: "Tous",         icon: "📚" },
  { slug: "greetings", name: "Salutations",  icon: "👋" },
  { slug: "family",    name: "Famille",      icon: "👨‍👩‍👧‍👦" },
  { slug: "home",      name: "Maison",       icon: "🏠" },
  { slug: "school",    name: "École",        icon: "🎓" },
  { slug: "food",      name: "Nourriture",   icon: "🍽️" },
  { slug: "numbers",   name: "Chiffres",     icon: "🔢" },
  { slug: "verbs",     name: "Verbes",       icon: "✍️" },
  { slug: "religion",  name: "Religion",     icon: "☪️" },
];

export default function WordsModule() {
  const navigate = useNavigate();
  const [activeCategory, setActiveCategory] = useState("all");
  const [search, setSearch] = useState("");
  const [showFavorites, setShowFavorites] = useState(false);

  const { data: words, loading } = useDatabase(() => wordsApi.getAll());

  const filtered = (words ?? []).filter((w) => {
    const matchCat = activeCategory === "all" || w.category_slug === activeCategory;
    const matchSearch =
      !search ||
      w.arabic.includes(search) ||
      w.translation_fr.toLowerCase().includes(search.toLowerCase()) ||
      w.transliteration.toLowerCase().includes(search.toLowerCase());
    const matchFav = !showFavorites || w.is_favorite;
    return matchCat && matchSearch && matchFav;
  });

  const learned = (words ?? []).filter((w) => w.is_learned).length;
  const total = (words ?? []).length;

  return (
    <div className="space-y-5 animate-slide-up">
      {/* En-tête */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">Vocabulaire</h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm">
            {total} mots par catégories
          </p>
        </div>
        <button
          onClick={() => navigate("/words/quiz")}
          className="btn-primary gap-2 flex-shrink-0"
          disabled={total < 2}
        >
          <BrainCircuit className="w-4 h-4" />
          Quiz
        </button>
      </div>

      {/* Progression */}
      <ProgressBar current={learned} max={total} label={`${learned}/${total} mots appris`} showPercent size="sm" />

      {/* Catégories */}
      <div className="flex gap-2 overflow-x-auto pb-1 -mx-1 px-1">
        {CATEGORIES.map(({ slug, name, icon }) => (
          <button
            key={slug}
            onClick={() => setActiveCategory(slug)}
            className={clsx(
              "flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-medium flex-shrink-0 transition-all",
              activeCategory === slug
                ? "bg-primary-500 text-white shadow-md"
                : "bg-white dark:bg-gray-900 text-gray-600 dark:text-gray-300 border border-sand-200 dark:border-gray-700 hover:border-primary-300"
            )}
          >
            <span>{icon}</span>
            {name}
          </button>
        ))}
      </div>

      {/* Barre de recherche et filtres */}
      <div className="flex gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Rechercher un mot..."
            className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-sand-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-sm text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-300"
          />
        </div>
        <button
          onClick={() => setShowFavorites(!showFavorites)}
          className={clsx(
            "btn-icon w-10 h-10",
            showFavorites
              ? "bg-yellow-100 text-yellow-600 dark:bg-yellow-950 dark:text-yellow-400"
              : "bg-sand-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400"
          )}
          title="Favoris"
        >
          <Star className="w-4 h-4" />
        </button>
      </div>

      {/* Grille de mots */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
          {Array.from({ length: 9 }).map((_, i) => (
            <div key={i} className="h-28 rounded-2xl bg-sand-100 dark:bg-gray-800 animate-pulse" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-12 text-gray-400">
          <BookOpen className="w-12 h-12 mx-auto mb-3 opacity-30" />
          <p>Aucun mot trouvé.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 stagger-children">
          {filtered.map((word) => (
            <WordCard
              key={word.id}
              word={word}
              onClick={() => navigate(`/words/${word.id}`)}
            />
          ))}
        </div>
      )}
    </div>
  );
}

// ============================================================
// Carte mot
// ============================================================

function WordCard({ word, onClick }: { word: VocabularyWord; onClick: () => void }) {
  return (
    <motion.div
      className={clsx(
        "relative flex flex-col p-4 rounded-2xl border-2 cursor-pointer",
        "transition-all duration-200",
        word.is_learned
          ? "border-green-300 bg-green-50 dark:border-green-700 dark:bg-green-950"
          : "border-sand-200 bg-white dark:border-gray-700 dark:bg-gray-900",
        "hover:shadow-lg hover:-translate-y-0.5"
      )}
      onClick={onClick}
      whileHover={{ scale: 1.01 }}
      whileTap={{ scale: 0.98 }}
    >
      {/* Favori */}
      {word.is_favorite && (
        <Star className="absolute top-3 right-3 w-3.5 h-3.5 text-yellow-400 fill-yellow-400" />
      )}

      {/* Mot arabe */}
      <div className="flex items-center justify-between mb-2">
        <ArabicText
          text={word.arabic}
          size="xl"
          className="text-primary-700 dark:text-primary-300 font-bold"
        />
        <PlayButton
          src={word.audio_file}
          arabicText={word.arabic}
          size="sm"
          className="flex-shrink-0 ml-2"
        />
      </div>

      {/* Translittération */}
      <p className="text-xs text-primary-400 font-mono mb-1">{word.transliteration}</p>

      {/* Traduction */}
      <p className="text-sm font-medium text-gray-800 dark:text-gray-200 flex-1">
        {word.translation_fr}
      </p>

      {/* Pied de carte */}
      <div className="flex items-center justify-between mt-2 pt-2 border-t border-sand-100 dark:border-gray-700">
        <LevelBadge level={word.level} />
        {word.is_learned && (
          <span className="text-xs text-green-600 dark:text-green-400 font-medium">✓ Appris</span>
        )}
      </div>
    </motion.div>
  );
}
