import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  ChevronLeft, ChevronRight, CheckCircle, Circle,
  Youtube, Volume2, BookOpen, Layers
} from "lucide-react";
import { clsx } from "clsx";
import { lettersApi } from "@/services/database";
import { useDatabase, useMutation } from "@/hooks/useDatabase";
import ArabicText from "@/components/common/ArabicText";
import { PlayButton } from "@/components/common/AudioPlayer";
import { LevelBadge } from "@/components/common/Badge";
import { speakArabic } from "@/services/audio";
import toast from "react-hot-toast";

type TabId = "forms" | "vowels" | "examples";

export default function LetterDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const letterId = Number(id);
  const [activeTab, setActiveTab] = useState<TabId>("forms");

  const { data: letters } = useDatabase(() => lettersApi.getAll());
  const { data: letter, refetch } = useDatabase(
    () => lettersApi.getById(letterId),
    [letterId]
  );

  const { execute: markLearned, loading: saving } = useMutation(lettersApi.markLearned);

  if (!letter) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="spinner" />
      </div>
    );
  }

  const sortedLetters = [...(letters ?? [])].sort((a, b) => a.order_num - b.order_num);
  const currentIndex = sortedLetters.findIndex((l) => l.id === letterId);
  const prevLetter = sortedLetters[currentIndex - 1];
  const nextLetter = sortedLetters[currentIndex + 1];

  const handleMarkLearned = async () => {
    await markLearned(letterId, !letter.is_learned);
    await refetch();
    toast.success(letter.is_learned ? "Marqué à revoir" : "Marqué comme appris !");
  };

  const openYouTube = () => {
    const query = encodeURIComponent(letter.youtube_query ?? `apprendre lettre arabe ${letter.name_fr}`);
    const url = `https://www.youtube.com/results?search_query=${query}`;
    window.open(url, "_blank", "noopener,noreferrer");
  };

  const tabs: { id: TabId; label: string; icon: React.ElementType }[] = [
    { id: "forms", label: "Formes", icon: Layers },
    { id: "vowels", label: "Voyelles", icon: Volume2 },
    { id: "examples", label: "Exemples", icon: BookOpen },
  ];

  return (
    <div className="max-w-3xl mx-auto space-y-6 animate-slide-up">
      {/* Navigation haut */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => prevLetter && navigate(`/letters/${prevLetter.id}`)}
          disabled={!prevLetter}
          className="btn-secondary gap-1 text-sm disabled:opacity-40"
        >
          <ChevronLeft className="w-4 h-4" />
          {prevLetter?.name_fr ?? "—"}
        </button>

        <span className="text-sm text-gray-400">
          {currentIndex + 1} / {sortedLetters.length}
        </span>

        <button
          onClick={() => nextLetter && navigate(`/letters/${nextLetter.id}`)}
          disabled={!nextLetter}
          className="btn-secondary gap-1 text-sm disabled:opacity-40"
        >
          {nextLetter?.name_fr ?? "—"}
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>

      {/* Carte principale */}
      <motion.div
        key={letterId}
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white dark:bg-gray-900 rounded-3xl border border-sand-100 dark:border-gray-800 overflow-hidden shadow-warm"
      >
        {/* Zone lettre */}
        <div className="relative bg-gradient-to-br from-sand-50 to-primary-50 dark:from-gray-800 dark:to-primary-950 p-8 md:p-12 text-center">
          {/* Décoration */}
          <div className="absolute inset-0 bg-islamic-pattern opacity-30" />

          <div className="relative z-10">
            {/* Lettre principale */}
            <motion.div
              className="mb-4"
              animate={{ scale: [1, 1.03, 1] }}
              transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
            >
              <ArabicText
                text={letter.isolated_form}
                size="display"
                className="text-primary-700 dark:text-primary-300"
                bold
              />
            </motion.div>

            {/* Nom et translittération */}
            <div className="space-y-1">
              <div className="flex items-center justify-center gap-3">
                <ArabicText text={letter.name_ar} size="md" className="text-gray-600 dark:text-gray-300" />
                <span className="text-gray-400">·</span>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{letter.name_fr}</h1>
              </div>

              <p className="text-primary-600 dark:text-primary-400 font-mono text-lg">
                /{letter.transliteration}/
              </p>
              <p className="text-gray-500 dark:text-gray-400 text-sm">
                {letter.pronunciation_fr}
              </p>
            </div>

            {/* Bouton audio */}
            <div className="flex items-center justify-center gap-3 mt-4">
              <PlayButton
                src={letter.audio_file}
                arabicText={letter.arabic}
                size="lg"
                label="Écouter la prononciation"
              />
              <LevelBadge level={letter.level} />
            </div>
          </div>
        </div>

        {/* Corps de la carte */}
        <div className="p-5 md:p-6">
          {/* Description */}
          {letter.description_fr && (
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-5 bg-sand-50 dark:bg-gray-800 rounded-xl p-4">
              {letter.description_fr}
            </p>
          )}

          {/* Onglets */}
          <div className="flex gap-1 mb-5 bg-sand-50 dark:bg-gray-800 rounded-xl p-1">
            {tabs.map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                onClick={() => setActiveTab(id)}
                className={clsx(
                  "flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg text-sm font-medium transition-all",
                  activeTab === id
                    ? "bg-white dark:bg-gray-900 text-primary-600 dark:text-primary-400 shadow-sm"
                    : "text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                )}
              >
                <Icon className="w-3.5 h-3.5" />
                {label}
              </button>
            ))}
          </div>

          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              {activeTab === "forms" && <FormsTab letter={letter} />}
              {activeTab === "vowels" && <VowelsTab letter={letter} />}
              {activeTab === "examples" && <ExamplesTab letter={letter} />}
            </motion.div>
          </AnimatePresence>
        </div>
      </motion.div>

      {/* Actions */}
      <div className="flex flex-col sm:flex-row gap-3">
        <button
          onClick={handleMarkLearned}
          disabled={saving}
          className={clsx(
            "flex-1 flex items-center justify-center gap-2 px-5 py-3 rounded-xl font-medium transition-all",
            letter.is_learned
              ? "bg-green-100 text-green-700 hover:bg-green-200 dark:bg-green-950 dark:text-green-300"
              : "btn-primary"
          )}
        >
          {letter.is_learned ? (
            <><CheckCircle className="w-4 h-4" /> Appris ✓</>
          ) : (
            <><Circle className="w-4 h-4" /> Marquer comme appris</>
          )}
        </button>

        <button
          onClick={openYouTube}
          className="btn-secondary gap-2 flex-shrink-0"
        >
          <Youtube className="w-4 h-4 text-red-500" />
          YouTube
        </button>
      </div>
    </div>
  );
}

// ============================================================
// ONGLETS
// ============================================================

function FormsTab({ letter }: { letter: ReturnType<typeof useDatabase<typeof lettersApi.getById extends (...a: unknown[]) => Promise<infer R> ? R : never>>["data"] }) {
  if (!letter) return null;

  const forms = [
    { label: "Isolée", arabic: letter.isolated_form },
    { label: "Initiale (début)", arabic: letter.initial_form },
    { label: "Médiane (milieu)", arabic: letter.medial_form },
    { label: "Finale (fin)", arabic: letter.final_form },
  ];

  return (
    <div className="space-y-3">
      <p className="text-xs text-gray-400 mb-3">
        Se connecte à gauche : <strong>{letter.connects_left ? "Oui" : "Non"}</strong>
      </p>
      <div className="grid grid-cols-2 gap-3">
        {forms.map(({ label, arabic }) => (
          <div
            key={label}
            className="flex flex-col items-center gap-2 p-4 rounded-2xl bg-sand-50 dark:bg-gray-800 border border-sand-100 dark:border-gray-700"
          >
            <ArabicText text={arabic} size="xl" className="text-primary-700 dark:text-primary-300 font-bold" />
            <span className="text-xs text-gray-500 dark:text-gray-400 text-center">{label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function VowelsTab({ letter }: { letter: ReturnType<typeof useDatabase<typeof lettersApi.getById extends (...a: unknown[]) => Promise<infer R> ? R : never>>["data"] }) {
  if (!letter) return null;

  if (!letter.vowels || letter.vowels.length === 0) {
    return (
      <p className="text-gray-400 text-sm text-center py-6">
        Aucune voyelle définie pour cette lettre.
      </p>
    );
  }

  const vowelNames: Record<string, string> = {
    fatha: "Fatha (a court)",
    kasra: "Kasra (i court)",
    damma: "Damma (ou court)",
    soukoun: "Soukoun (consonne seule)",
    shadda: "Shadda (consonne doublée)",
    tanwin_fath: "Tanwīn fath (-an)",
    tanwin_kasr: "Tanwīn kasr (-in)",
    tanwin_damm: "Tanwīn damm (-un)",
    madd: "Madd (allongement)",
  };

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
      {letter.vowels.map((vowel, i) => (
        <button
          key={i}
          onClick={() => speakArabic(vowel.combined)}
          className="vowel-chip text-center"
        >
          <ArabicText text={vowel.combined} size="xl" className="text-primary-700 dark:text-primary-300" />
          <span className="text-xs text-primary-500 dark:text-primary-400 font-mono">{vowel.pronunciation}</span>
          <span className="text-xs text-gray-400 text-center">
            {vowelNames[vowel.name] ?? vowel.name}
          </span>
        </button>
      ))}
    </div>
  );
}

function ExamplesTab({ letter }: { letter: ReturnType<typeof useDatabase<typeof lettersApi.getById extends (...a: unknown[]) => Promise<infer R> ? R : never>>["data"] }) {
  if (!letter) return null;

  if (!letter.examples || letter.examples.length === 0) {
    return (
      <p className="text-gray-400 text-sm text-center py-6">
        Aucun exemple disponible pour cette lettre.
      </p>
    );
  }

  const positionLabels: Record<string, string> = {
    initial:  "Position initiale",
    medial:   "Position médiane",
    final:    "Position finale",
    isolated: "Position isolée",
  };

  return (
    <div className="space-y-3">
      {letter.examples.map((ex, i) => (
        <div
          key={i}
          className="flex items-center gap-4 p-3 rounded-xl bg-sand-50 dark:bg-gray-800 border border-sand-100 dark:border-gray-700"
        >
          <div className="flex-1 text-right">
            <ArabicText text={ex.arabic} size="lg" className="text-gray-900 dark:text-white font-bold" />
          </div>
          <div className="flex-1">
            <p className="text-sm font-medium text-gray-700 dark:text-gray-300">{ex.translation_fr}</p>
            <p className="text-xs text-primary-500 font-mono">{ex.transliteration}</p>
            <p className="text-xs text-gray-400">{positionLabels[ex.position] ?? ex.position}</p>
          </div>
          <PlayButton arabicText={ex.arabic} size="sm" />
        </div>
      ))}
    </div>
  );
}
