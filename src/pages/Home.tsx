import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  AlignLeft, BookOpen, MessageSquare, BookMarked,
  Flame, Clock, Star, ChevronRight, TrendingUp,
  GraduationCap
} from "lucide-react";
import { clsx } from "clsx";
import { useAppStore } from "@/store";
import ProgressBar, { CircleProgress } from "@/components/common/ProgressBar";
import ArabicText from "@/components/common/ArabicText";

// ============================================================
// Configuration des modules
// ============================================================

const modules = [
  {
    id: "letters",
    path: "/letters",
    icon: AlignLeft,
    labelFr: "Lettres arabes",
    descFr: "Apprenez les 28 lettres de l'alphabet",
    labelAr: "الحروف",
    gradient: "from-amber-400 to-orange-500",
    bg: "bg-amber-50 dark:bg-amber-950",
    border: "border-amber-200 dark:border-amber-900",
    iconBg: "bg-amber-100 dark:bg-amber-900",
    iconColor: "text-amber-700 dark:text-amber-300",
  },
  {
    id: "reading",
    path: "/reading",
    icon: BookOpen,
    labelFr: "Lecture",
    descFr: "Des syllabes aux phrases complètes",
    labelAr: "القراءة",
    gradient: "from-blue-400 to-cyan-500",
    bg: "bg-blue-50 dark:bg-blue-950",
    border: "border-blue-200 dark:border-blue-900",
    iconBg: "bg-blue-100 dark:bg-blue-900",
    iconColor: "text-blue-700 dark:text-blue-300",
  },
  {
    id: "words",
    path: "/words",
    icon: MessageSquare,
    labelFr: "Vocabulaire",
    descFr: "Mots courants par catégories",
    labelAr: "المفردات",
    gradient: "from-green-400 to-emerald-500",
    bg: "bg-green-50 dark:bg-green-950",
    border: "border-green-200 dark:border-green-900",
    iconBg: "bg-green-100 dark:bg-green-900",
    iconColor: "text-green-700 dark:text-green-300",
  },
  {
    id: "quran",
    path: "/quran",
    icon: BookMarked,
    labelFr: "Coran",
    descFr: "Texte, audio et traductions",
    labelAr: "القرآن",
    gradient: "from-purple-400 to-violet-500",
    bg: "bg-purple-50 dark:bg-purple-950",
    border: "border-purple-200 dark:border-purple-900",
    iconBg: "bg-purple-100 dark:bg-purple-900",
    iconColor: "text-purple-700 dark:text-purple-300",
  },
];

export default function Home() {
  const navigate = useNavigate();
  const user = useAppStore((s) => s.user);
  const progress = useAppStore((s) => s.progress);
  const streak = useAppStore((s) => s.streak);

  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Bonjour" : hour < 18 ? "Bon après-midi" : "Bonsoir";
  const arabicGreeting = hour < 12 ? "صباح الخير" : "مساء الخير";

  return (
    <div className="space-y-8 animate-slide-up">
      {/* ====================================================
          SECTION HERO
          ==================================================== */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-primary-500 to-primary-700 p-6 md:p-8 text-white">
        {/* Motif décoratif */}
        <div className="absolute inset-0 opacity-10 bg-islamic-pattern" />

        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center gap-6">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <ArabicText
                text={arabicGreeting}
                size="lg"
                className="text-primary-100"
              />
            </div>
            <h1 className="text-2xl md:text-3xl font-bold mb-2">
              {greeting}, {user?.name ?? "Étudiant"} !
            </h1>
            <p className="text-primary-100 text-sm md:text-base">
              Continuez votre apprentissage de l'arabe. Chaque jour compte !
            </p>

            {/* Progression globale */}
            {progress && (
              <div className="mt-4">
                <div className="flex justify-between text-sm text-primary-100 mb-1.5">
                  <span>Progression globale</span>
                  <span className="font-bold">{Math.round(progress.total_percent)}%</span>
                </div>
                <div className="h-2 bg-primary-400/50 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-white/80 rounded-full transition-all duration-700"
                    style={{ width: `${progress.total_percent}%` }}
                  />
                </div>
              </div>
            )}
          </div>

          {/* Stats rapides */}
          <div className="flex gap-3">
            {streak && (
              <div className="flex flex-col items-center gap-1 bg-white/10 backdrop-blur-sm rounded-2xl px-4 py-3 min-w-[80px]">
                <Flame className="w-5 h-5 text-orange-300" />
                <span className="text-2xl font-bold">{streak.current_streak}</span>
                <span className="text-xs text-primary-200">jours</span>
              </div>
            )}
            {progress && (
              <div className="flex flex-col items-center gap-1 bg-white/10 backdrop-blur-sm rounded-2xl px-4 py-3 min-w-[80px]">
                <GraduationCap className="w-5 h-5 text-primary-200" />
                <span className="text-2xl font-bold">{progress.letters_learned}</span>
                <span className="text-xs text-primary-200">lettres</span>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* ====================================================
          MODULES PRINCIPAUX
          ==================================================== */}
      <section>
        <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
          Modules d'apprentissage
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 stagger-children">
          {modules.map((mod) => {
            const Icon = mod.icon;
            const modProgress = getModulePercent(progress, mod.id);

            return (
              <motion.button
                key={mod.id}
                onClick={() => navigate(mod.path)}
                className={clsx(
                  "module-card text-left",
                  mod.bg, mod.border, "border-2"
                )}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className={clsx("w-12 h-12 rounded-2xl flex items-center justify-center", mod.iconBg)}>
                    <Icon className={clsx("w-6 h-6", mod.iconColor)} />
                  </div>
                  <div className="text-right">
                    <ArabicText text={mod.labelAr} size="md" className="text-gray-500 dark:text-gray-400" />
                  </div>
                </div>

                <h3 className="font-bold text-gray-900 dark:text-white text-base mb-1">
                  {mod.labelFr}
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                  {mod.descFr}
                </p>

                <div className="space-y-1.5">
                  <div className="flex justify-between text-xs">
                    <span className="text-gray-500 dark:text-gray-400">Progression</span>
                    <span className="font-semibold text-gray-700 dark:text-gray-300">{modProgress}%</span>
                  </div>
                  <div className="h-1.5 bg-black/10 dark:bg-white/10 rounded-full overflow-hidden">
                    <div
                      className={clsx("h-full rounded-full bg-gradient-to-r", mod.gradient, "transition-all duration-700")}
                      style={{ width: `${modProgress}%` }}
                    />
                  </div>
                </div>

                <div className={clsx("absolute bottom-4 right-4 opacity-50")}>
                  <ChevronRight className={clsx("w-5 h-5", mod.iconColor)} />
                </div>
              </motion.button>
            );
          })}
        </div>
      </section>

      {/* ====================================================
          STATISTIQUES DÉTAILLÉES
          ==================================================== */}
      {progress && (
        <section className="bg-white dark:bg-gray-900 rounded-2xl p-6 border border-sand-100 dark:border-gray-800">
          <div className="flex items-center gap-2 mb-5">
            <TrendingUp className="w-5 h-5 text-primary-500" />
            <h2 className="font-bold text-gray-900 dark:text-white">Statistiques</h2>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <StatCard
              label="Lettres apprises"
              value={progress.letters_learned}
              total={progress.letters_total}
              color="#f59e0b"
            />
            <StatCard
              label="Mots appris"
              value={progress.words_learned}
              total={progress.words_total}
              color="#22c55e"
            />
            <StatCard
              label="Leçons terminées"
              value={progress.reading_completed}
              total={progress.reading_total}
              color="#3b82f6"
            />
            <StatCard
              label="Sourates lues"
              value={progress.quran_surahs_started}
              total={114}
              color="#8b5cf6"
            />
          </div>
        </section>
      )}

      {/* ====================================================
          CITATION DU JOUR
          ==================================================== */}
      <section className="bg-gradient-warm dark:bg-gradient-dark rounded-2xl p-6 border border-sand-200 dark:border-gray-800 text-center">
        <div className="mb-3">
          <ArabicText
            text="اقْرَأْ بِاسْمِ رَبِّكَ"
            size="lg"
            className="text-primary-700 dark:text-primary-300"
          />
        </div>
        <p className="text-gray-600 dark:text-gray-400 text-sm italic">
          « Lis au nom de ton Seigneur » — Coran 96:1
        </p>
        <p className="text-xs text-gray-400 mt-1">Iqra' bi-smi rabbika</p>
      </section>
    </div>
  );
}

function StatCard({
  label, value, total, color
}: {
  label: string; value: number; total: number; color: string;
}) {
  const percent = total > 0 ? Math.round((value / total) * 100) : 0;
  return (
    <div className="text-center">
      <CircleProgress value={percent} size={64} color={color} strokeWidth={5}>
        <span className="text-sm font-bold text-gray-900 dark:text-white">{percent}%</span>
      </CircleProgress>
      <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">{label}</p>
      <p className="text-xs font-medium text-gray-700 dark:text-gray-300">
        {value}/{total}
      </p>
    </div>
  );
}

function getModulePercent(
  progress: ReturnType<typeof useAppStore>["progress"],
  moduleId: string
): number {
  if (!progress) return 0;
  switch (moduleId) {
    case "letters": return progress.letters_total > 0 ? Math.round((progress.letters_learned / progress.letters_total) * 100) : 0;
    case "words":   return progress.words_total > 0 ? Math.round((progress.words_learned / progress.words_total) * 100) : 0;
    case "reading": return progress.reading_total > 0 ? Math.round((progress.reading_completed / progress.reading_total) * 100) : 0;
    case "quran":   return Math.round((progress.quran_surahs_started / 114) * 100);
    default: return 0;
  }
}
