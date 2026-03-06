import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Star, CheckCircle, Circle, BookOpen, Languages } from "lucide-react";
import { clsx } from "clsx";
import toast from "react-hot-toast";
import { wordsApi } from "@/services/database";
import { useDatabase, useMutation } from "@/hooks/useDatabase";
import ArabicText from "@/components/common/ArabicText";
import AudioPlayer, { PlayButton } from "@/components/common/AudioPlayer";
import { LevelBadge } from "@/components/common/Badge";
import ExplainButton from "@/components/common/ExplainButton";

export default function WordDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const wordId = Number(id);

  const { data: word, refetch } = useDatabase(() => wordsApi.getById(wordId), [wordId]);
  const { execute: markLearned } = useMutation(wordsApi.markLearned);
  const { execute: toggleFavorite } = useMutation(wordsApi.toggleFavorite);

  if (!word) {
    return <div className="flex items-center justify-center h-64"><div className="spinner" /></div>;
  }

  const handleMarkLearned = async () => {
    await markLearned(wordId, !word.is_learned);
    await refetch();
    toast.success(word.is_learned ? "Marqué à revoir" : "Mot appris !");
  };

  const handleFavorite = async () => {
    await toggleFavorite(wordId);
    await refetch();
    toast.success(word.is_favorite ? "Retiré des favoris" : "Ajouté aux favoris");
  };

  const genderLabel = { m: "Masculin", f: "Féminin", n: "Neutre" }[word.gender ?? ""] ?? "";

  return (
    <div className="max-w-2xl mx-auto space-y-5 animate-slide-up">
      {/* Carte principale */}
      <motion.div
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white dark:bg-gray-900 rounded-3xl border border-sand-100 dark:border-gray-800 overflow-hidden shadow-warm"
      >
        {/* Zone principale */}
        <div className="relative bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950 dark:to-emerald-950 p-8 text-center">
          <div className="absolute inset-0 bg-islamic-pattern opacity-20" />
          <div className="relative z-10">
            {/* Mot arabe */}
            <motion.div
              animate={{ scale: [1, 1.02, 1] }}
              transition={{ duration: 4, repeat: Infinity }}
              className="mb-3"
            >
              <ArabicText
                text={word.arabic}
                size="display"
                className="text-green-700 dark:text-green-300"
                bold
              />
            </motion.div>

            {/* Translittération */}
            <p className="text-green-500 font-mono text-xl mb-1">{word.transliteration}</p>

            {/* Genre */}
            {genderLabel && (
              <span className="text-xs text-gray-400">{genderLabel}</span>
            )}

            {/* Pluriel */}
            {word.plural_ar && (
              <div className="mt-2">
                <span className="text-xs text-gray-400">Pluriel : </span>
                <ArabicText text={word.plural_ar} size="sm" className="text-gray-500" />
              </div>
            )}

            {/* Audio */}
            <div className="flex justify-center mt-4">
              <PlayButton
                src={word.audio_file}
                arabicText={word.arabic}
                size="lg"
              />
            </div>
          </div>
        </div>

        {/* Corps */}
        <div className="p-5 space-y-4">
          {/* Expliquer avec IA */}
          <div className="flex justify-end">
            <ExplainButton
              subject={`${word.arabic} (${word.transliteration}) = ${word.translation_fr}`}
              type="word"
              variant="inline"
              label="Expliquer avec l'IA"
              context={{ mode: "explanation", subject: word.arabic, contextRef: "word", contextId: word.id }}
            />
          </div>

          {/* Traductions */}
          <div className="grid grid-cols-2 gap-3">
            <div className="p-3 rounded-xl bg-blue-50 dark:bg-blue-950 border border-blue-100 dark:border-blue-900">
              <div className="flex items-center gap-1 mb-1">
                <span className="text-lg">🇫🇷</span>
                <span className="text-xs text-blue-500 font-medium">Français</span>
              </div>
              <p className="font-semibold text-gray-900 dark:text-white">{word.translation_fr}</p>
            </div>
            <div className="p-3 rounded-xl bg-purple-50 dark:bg-purple-950 border border-purple-100 dark:border-purple-900">
              <div className="flex items-center gap-1 mb-1">
                <span className="text-lg">🇬🇧</span>
                <span className="text-xs text-purple-500 font-medium">English</span>
              </div>
              <p className="font-semibold text-gray-900 dark:text-white">{word.translation_en}</p>
            </div>
          </div>

          {/* Métadonnées */}
          <div className="flex flex-wrap gap-2">
            <LevelBadge level={word.level} />
            {word.category_slug && (
              <span className="text-xs px-2.5 py-1 rounded-full bg-sand-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300">
                {word.category_slug}
              </span>
            )}
            {word.root_ar && (
              <span className="text-xs px-2.5 py-1 rounded-full bg-primary-50 dark:bg-primary-950 text-primary-600 dark:text-primary-400">
                Racine : <ArabicText text={word.root_ar} size="sm" />
              </span>
            )}
          </div>

          {/* Exemple */}
          {word.example_ar && (
            <div className="p-4 rounded-xl bg-sand-50 dark:bg-gray-800 border border-sand-100 dark:border-gray-700">
              <p className="text-xs text-gray-400 mb-2 flex items-center gap-1">
                <BookOpen className="w-3 h-3" />
                Exemple d'utilisation
              </p>
              <div className="text-right mb-2">
                <ArabicText text={word.example_ar} size="md" className="text-gray-800 dark:text-gray-200" />
              </div>
              {word.example_fr && (
                <p className="text-sm text-gray-600 dark:text-gray-400 italic">
                  « {word.example_fr} »
                </p>
              )}
              <div className="flex justify-end mt-2">
                <PlayButton arabicText={word.example_ar} size="sm" />
              </div>
            </div>
          )}
        </div>
      </motion.div>

      {/* Actions */}
      <div className="flex gap-3">
        <button
          onClick={handleMarkLearned}
          className={clsx(
            "flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl font-medium transition-all",
            word.is_learned
              ? "bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-300"
              : "btn-primary"
          )}
        >
          {word.is_learned ? (
            <><CheckCircle className="w-4 h-4" /> Appris</>
          ) : (
            <><Circle className="w-4 h-4" /> Marquer appris</>
          )}
        </button>

        <button
          onClick={handleFavorite}
          className={clsx(
            "btn-icon w-12 h-12 rounded-xl border-2 transition-all",
            word.is_favorite
              ? "bg-yellow-100 border-yellow-300 text-yellow-500 dark:bg-yellow-950 dark:border-yellow-700"
              : "bg-white dark:bg-gray-900 border-sand-200 dark:border-gray-700 text-gray-400 hover:border-yellow-300 hover:text-yellow-400"
          )}
          title={word.is_favorite ? "Retirer des favoris" : "Ajouter aux favoris"}
        >
          <Star className={clsx("w-5 h-5", word.is_favorite && "fill-yellow-400")} />
        </button>
      </div>
    </div>
  );
}
