import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Heart, ChevronUp, ChevronDown, Search, Globe,
  AlignLeft, AlignRight, Type
} from "lucide-react";
import { clsx } from "clsx";
import toast from "react-hot-toast";
import { quranApi } from "@/services/database";
import { useDatabase, useMutation } from "@/hooks/useDatabase";
import ArabicText from "@/components/common/ArabicText";
import { PlayButton } from "@/components/common/AudioPlayer";
import { speakArabic } from "@/services/audio";
import { useAppStore } from "@/store";
import type { Verse } from "@/types";

type DisplayMode = "arabic_only" | "with_translation" | "with_transliteration";
type TranslationLang = "fr" | "en";

export default function SurahReader() {
  const { surahId } = useParams<{ surahId: string }>();
  const navigate = useNavigate();
  const id = Number(surahId);
  const fontSize = useAppStore((s) => s.user?.font_size ?? 3);
  const language = useAppStore((s) => s.user?.language ?? "fr");

  const [displayMode, setDisplayMode] = useState<DisplayMode>("with_translation");
  const [translationLang, setTranslationLang] = useState<TranslationLang>(language as TranslationLang);
  const [currentVerse, setCurrentVerse] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");

  const { data: surah } = useDatabase(() => quranApi.getSurahById(id), [id]);
  const { data: verses, loading } = useDatabase(() => quranApi.getVerses(id), [id]);
  const { execute: toggleFav } = useMutation(quranApi.toggleFavorite);
  const { execute: savePos } = useMutation(quranApi.savePosition);

  const verseRefs = useRef<Record<number, HTMLDivElement>>({});

  // Reprendre la position
  useEffect(() => {
    if (surah?.last_read_verse && surah.last_read_verse > 1) {
      setCurrentVerse(surah.last_read_verse);
      // Scroll vers le verset
      setTimeout(() => {
        verseRefs.current[surah.last_read_verse!]?.scrollIntoView({
          behavior: "smooth", block: "center"
        });
      }, 500);
    }
  }, [surah]);

  // Sauvegarder la position
  useEffect(() => {
    if (currentVerse > 1) {
      const timer = setTimeout(() => {
        savePos(id, currentVerse);
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [currentVerse, id, savePos]);

  const handleFavorite = async (verse: Verse) => {
    const result = await toggleFav(verse.id);
    toast.success(result ? "Ajouté aux favoris" : "Retiré des favoris");
  };

  const displayedVerses = searchQuery
    ? (verses ?? []).filter((v) =>
        v.arabic_text.includes(searchQuery) ||
        v.translation_fr.toLowerCase().includes(searchQuery.toLowerCase()) ||
        String(v.verse_number).includes(searchQuery)
      )
    : (verses ?? []);

  if (!surah || loading) {
    return <div className="flex items-center justify-center h-64"><div className="spinner" /></div>;
  }

  return (
    <div className="max-w-3xl mx-auto space-y-4 animate-slide-up">
      {/* En-tête */}
      <div className="bg-white dark:bg-gray-900 rounded-2xl border border-sand-100 dark:border-gray-800 overflow-hidden">
        <div className="bg-gradient-to-br from-purple-500 to-violet-600 p-6 text-white text-center relative">
          <div className="absolute inset-0 bg-islamic-pattern opacity-20" />
          <div className="relative z-10">
            <p className="text-purple-200 text-sm mb-1">Sourate {surah.number}</p>
            <ArabicText text={surah.name_ar} size="xl" className="text-white font-bold block mb-1" />
            <h1 className="text-lg font-bold">{surah.name_fr}</h1>
            <p className="text-purple-200 text-sm">{surah.transliteration}</p>

            <div className="flex items-center justify-center gap-4 mt-3 text-sm text-purple-100">
              <span>{surah.verses_count} versets</span>
              <span>·</span>
              <span>{surah.revelation_type === "meccan" ? "Mecquoise" : "Médinoise"}</span>
            </div>
          </div>
        </div>

        {/* Barre d'outils */}
        <div className="flex items-center justify-between gap-2 px-4 py-3 bg-sand-50 dark:bg-gray-800">
          {/* Mode d'affichage */}
          <div className="flex gap-1">
            {([
              { id: "arabic_only", label: "AR", title: "Arabe seulement" },
              { id: "with_translation", label: "TR", title: "Avec traduction" },
              { id: "with_transliteration", label: "PH", title: "Avec phonétique" },
            ] as { id: DisplayMode; label: string; title: string }[]).map(({ id, label, title }) => (
              <button
                key={id}
                onClick={() => setDisplayMode(id)}
                title={title}
                className={clsx(
                  "px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all",
                  displayMode === id
                    ? "bg-primary-500 text-white"
                    : "bg-white dark:bg-gray-700 text-gray-500 dark:text-gray-400"
                )}
              >
                {label}
              </button>
            ))}
          </div>

          {/* Langue de traduction */}
          {displayMode === "with_translation" && (
            <div className="flex gap-1">
              {(["fr", "en"] as TranslationLang[]).map((lang) => (
                <button
                  key={lang}
                  onClick={() => setTranslationLang(lang)}
                  className={clsx(
                    "px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all",
                    translationLang === lang
                      ? "bg-purple-500 text-white"
                      : "bg-white dark:bg-gray-700 text-gray-500"
                  )}
                >
                  {lang === "fr" ? "🇫🇷" : "🇬🇧"}
                </button>
              ))}
            </div>
          )}

          {/* Recherche */}
          <div className="relative">
            <Search className="absolute left-2 top-1/2 -translate-y-1/2 w-3 h-3 text-gray-400" />
            <input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Chercher..."
              className="pl-7 pr-3 py-1.5 rounded-lg text-xs border border-sand-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white w-32 focus:outline-none focus:ring-1 focus:ring-primary-300"
            />
          </div>
        </div>
      </div>

      {/* Basmala (sauf Sourate 9) */}
      {surah.number !== 9 && (
        <div className="text-center py-3">
          <ArabicText
            text="بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ"
            size="lg"
            className="text-primary-600 dark:text-primary-400"
            onClick={() => speakArabic("بسم الله الرحمن الرحيم")}
          />
          <p className="text-xs text-gray-400 mt-1">
            Au nom d'Allah, le Tout Miséricordieux, le Très Miséricordieux
          </p>
        </div>
      )}

      {/* Versets */}
      <div className="space-y-2">
        {displayedVerses.map((verse) => (
          <div
            key={verse.id}
            ref={(el) => { if (el) verseRefs.current[verse.verse_number] = el; }}
            onMouseEnter={() => setCurrentVerse(verse.verse_number)}
          >
            <VerseCard
              verse={verse}
              displayMode={displayMode}
              translationLang={translationLang}
              onFavorite={() => handleFavorite(verse)}
              onPlay={() => speakArabic(verse.arabic_text)}
            />
          </div>
        ))}

        {displayedVerses.length === 0 && searchQuery && (
          <div className="text-center py-8 text-gray-400">
            Aucun verset trouvé pour « {searchQuery} »
          </div>
        )}
      </div>

      {/* Navigation rapide */}
      <div className="fixed bottom-6 right-6 flex flex-col gap-2">
        <button
          onClick={() => {
            window.scrollTo({ top: 0, behavior: "smooth" });
          }}
          className="btn-icon bg-white dark:bg-gray-900 border border-sand-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 shadow-lg w-10 h-10"
          title="Haut de page"
        >
          <ChevronUp className="w-4 h-4" />
        </button>
        <button
          onClick={() => {
            window.scrollTo({ top: document.body.scrollHeight, behavior: "smooth" });
          }}
          className="btn-icon bg-white dark:bg-gray-900 border border-sand-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 shadow-lg w-10 h-10"
          title="Bas de page"
        >
          <ChevronDown className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}

// ============================================================
// Carte verset
// ============================================================

interface VerseCardProps {
  verse: Verse;
  displayMode: DisplayMode;
  translationLang: TranslationLang;
  onFavorite: () => void;
  onPlay: () => void;
}

function VerseCard({ verse, displayMode, translationLang, onFavorite, onPlay }: VerseCardProps) {
  return (
    <motion.div
      className="verse-container group"
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
    >
      {/* Numéro du verset */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-full bg-primary-100 dark:bg-primary-950 flex items-center justify-center">
            <span className="text-xs font-bold text-primary-600 dark:text-primary-400">
              {verse.verse_number}
            </span>
          </div>
          {verse.juz && (
            <span className="text-xs text-gray-400">Juz {verse.juz}</span>
          )}
        </div>

        {/* Actions */}
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <PlayButton
            src={verse.audio_file}
            arabicText={verse.arabic_text}
            size="sm"
          />
          <button
            onClick={onFavorite}
            className={clsx(
              "btn-icon w-7 h-7",
              verse.is_favorite
                ? "text-red-500"
                : "text-gray-300 hover:text-red-400"
            )}
          >
            <Heart className={clsx("w-4 h-4", verse.is_favorite && "fill-red-500")} />
          </button>
        </div>
      </div>

      {/* Texte arabe */}
      <div className="text-right mb-3">
        <ArabicText
          text={verse.arabic_text}
          size="lg"
          className="text-gray-900 dark:text-white leading-loose arabic-verse"
          onClick={onPlay}
        />
      </div>

      {/* Translittération */}
      {displayMode === "with_transliteration" && verse.transliteration && (
        <p className="text-sm text-primary-500 font-mono mb-2 leading-relaxed">
          {verse.transliteration}
        </p>
      )}

      {/* Traduction */}
      {displayMode === "with_translation" && (
        <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed border-t border-sand-50 dark:border-gray-800 pt-3">
          {translationLang === "fr" ? verse.translation_fr : verse.translation_en}
        </p>
      )}
    </motion.div>
  );
}
