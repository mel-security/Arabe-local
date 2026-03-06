import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Search, BookOpen, Star, Clock, Filter } from "lucide-react";
import { clsx } from "clsx";
import { quranApi } from "@/services/database";
import { useDatabase } from "@/hooks/useDatabase";
import ArabicText from "@/components/common/ArabicText";
import ProgressBar from "@/components/common/ProgressBar";
import type { Surah } from "@/types";

type FilterType = "all" | "meccan" | "medinan" | "recent" | "favorites";

export default function QuranModule() {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<FilterType>("all");

  const { data: surahs, loading } = useDatabase(() => quranApi.getAllSurahs());
  const { data: position } = useDatabase(() => quranApi.getPosition());

  const filtered = (surahs ?? []).filter((s) => {
    const matchSearch =
      !search ||
      s.name_fr.toLowerCase().includes(search.toLowerCase()) ||
      s.name_ar.includes(search) ||
      s.transliteration.toLowerCase().includes(search.toLowerCase()) ||
      String(s.number).includes(search);

    const matchFilter =
      filter === "all" ? true :
      filter === "meccan" ? s.revelation_type === "meccan" :
      filter === "medinan" ? s.revelation_type === "medinan" :
      filter === "recent" ? s.last_read_verse !== null :
      filter === "favorites" ? s.is_completed :
      true;

    return matchSearch && matchFilter;
  });

  const started = (surahs ?? []).filter((s) => s.last_read_verse !== null).length;
  const completed = (surahs ?? []).filter((s) => s.is_completed).length;

  return (
    <div className="space-y-5 animate-slide-up">
      {/* En-tête */}
      <div className="text-center py-4">
        <ArabicText
          text="بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ"
          size="lg"
          className="text-primary-600 dark:text-primary-400 block mb-2"
        />
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">القرآن الكريم</h1>
        <p className="text-gray-500 dark:text-gray-400 text-sm">Le Noble Coran — 114 sourates</p>
      </div>

      {/* Reprendre lecture */}
      {position && (
        <button
          onClick={() => navigate(`/quran/${position.surah_id}`)}
          className="w-full flex items-center gap-3 p-4 rounded-2xl bg-primary-50 dark:bg-primary-950 border border-primary-200 dark:border-primary-800 hover:bg-primary-100 dark:hover:bg-primary-900 transition-all"
        >
          <div className="w-10 h-10 rounded-xl bg-primary-500 flex items-center justify-center">
            <Clock className="w-5 h-5 text-white" />
          </div>
          <div className="flex-1 text-left">
            <p className="text-sm font-semibold text-primary-700 dark:text-primary-300">
              Reprendre la lecture
            </p>
            <p className="text-xs text-primary-500">
              Sourate {position.surah_id} — Verset {position.verse_number}
            </p>
          </div>
          <span className="text-primary-400">→</span>
        </button>
      )}

      {/* Progression */}
      <div className="bg-white dark:bg-gray-900 rounded-2xl p-4 border border-sand-100 dark:border-gray-800">
        <div className="grid grid-cols-2 gap-4 mb-3">
          <div className="text-center">
            <p className="text-2xl font-bold text-primary-600 dark:text-primary-400">{started}</p>
            <p className="text-xs text-gray-400">Sourates lues</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-green-600 dark:text-green-400">{completed}</p>
            <p className="text-xs text-gray-400">Terminées</p>
          </div>
        </div>
        <ProgressBar current={started} max={114} label="Progression" showPercent size="sm" />
      </div>

      {/* Filtres */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Rechercher une sourate..."
            className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-sand-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-sm text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-300"
          />
        </div>
        <div className="flex gap-1 bg-sand-100 dark:bg-gray-800 rounded-xl p-1">
          {([
            { id: "all", label: "Tout" },
            { id: "meccan", label: "Mecque" },
            { id: "medinan", label: "Médine" },
            { id: "recent", label: "Récents" },
          ] as { id: FilterType; label: string }[]).map(({ id, label }) => (
            <button
              key={id}
              onClick={() => setFilter(id)}
              className={clsx(
                "px-3 py-1.5 rounded-lg text-xs font-medium transition-all",
                filter === id
                  ? "bg-white dark:bg-gray-900 text-primary-600 shadow-sm"
                  : "text-gray-500"
              )}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Liste des sourates */}
      {loading ? (
        <div className="space-y-2">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="h-16 rounded-2xl bg-sand-100 dark:bg-gray-800 animate-pulse" />
          ))}
        </div>
      ) : (
        <div className="space-y-2 stagger-children">
          {filtered.map((surah) => (
            <SurahRow
              key={surah.id}
              surah={surah}
              onClick={() => navigate(`/quran/${surah.id}`)}
            />
          ))}
          {filtered.length === 0 && (
            <div className="text-center py-12 text-gray-400">
              <BookOpen className="w-12 h-12 mx-auto mb-3 opacity-30" />
              <p>Aucune sourate trouvée.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ============================================================
// Ligne sourate
// ============================================================

function SurahRow({ surah, onClick }: { surah: Surah; onClick: () => void }) {
  return (
    <motion.button
      onClick={onClick}
      className="w-full flex items-center gap-3 p-3 rounded-2xl bg-white dark:bg-gray-900 border border-sand-100 dark:border-gray-800 hover:border-primary-300 hover:shadow-md transition-all text-left"
      whileHover={{ scale: 1.005 }}
      whileTap={{ scale: 0.995 }}
    >
      {/* Numéro */}
      <div className={clsx(
        "w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 text-sm font-bold",
        surah.is_completed
          ? "bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-300"
          : surah.last_read_verse
          ? "bg-primary-100 text-primary-700 dark:bg-primary-950 dark:text-primary-300"
          : "bg-sand-100 text-gray-600 dark:bg-gray-800 dark:text-gray-300"
      )}>
        {surah.number}
      </div>

      {/* Infos */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-0.5">
          <span className="font-semibold text-gray-900 dark:text-white text-sm truncate">
            {surah.name_fr}
          </span>
          <span className={clsx(
            "text-xs px-1.5 py-0.5 rounded-full",
            surah.revelation_type === "meccan"
              ? "bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300"
              : "bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300"
          )}>
            {surah.revelation_type === "meccan" ? "Meccoise" : "Médinoise"}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-primary-400 font-mono">{surah.transliteration}</span>
          <span className="text-xs text-gray-400">· {surah.verses_count} versets</span>
          {surah.last_read_verse && (
            <span className="text-xs text-blue-400">· verset {surah.last_read_verse}</span>
          )}
        </div>
      </div>

      {/* Nom arabe */}
      <div className="text-right flex-shrink-0">
        <ArabicText
          text={surah.name_ar}
          size="md"
          className="text-primary-600 dark:text-primary-400 font-bold"
        />
      </div>
    </motion.button>
  );
}
