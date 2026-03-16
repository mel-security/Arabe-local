import { useState } from "react";
import { Link } from "react-router-dom";
import { BookOpen, ChevronRight, GraduationCap } from "lucide-react";
import { motion } from "framer-motion";
import { useTranslation } from "@/i18n/useTranslation";
import { useAppStore } from "@/store";
import { ARABIC_PRONOUNS, VERB_CONJUGATION_PAST, VERB_CONJUGATION_PRESENT, SUN_LETTERS, MOON_LETTERS } from "@/lib/pedagogy/grammarRules";

interface GrammarCategory {
  slug: string;
  title_fr: string;
  title_en: string;
  icon: string;
  description_fr: string;
  description_en: string;
  level: string;
  itemCount: number;
}

const GRAMMAR_CATEGORIES: GrammarCategory[] = [
  {
    slug: "pronouns",
    title_fr: "Pronoms personnels",
    title_en: "Personal Pronouns",
    icon: "👤",
    description_fr: "Les pronoms personnels selon le genre et le nombre",
    description_en: "Personal pronouns by gender and number",
    level: "beginner",
    itemCount: ARABIC_PRONOUNS.length,
  },
  {
    slug: "articles",
    title_fr: "Article défini ال",
    title_en: "Definite Article ال",
    icon: "📝",
    description_fr: `Lettres solaires (${SUN_LETTERS.length}) et lunaires (${MOON_LETTERS.length})`,
    description_en: `Sun (${SUN_LETTERS.length}) and moon (${MOON_LETTERS.length}) letters`,
    level: "beginner",
    itemCount: SUN_LETTERS.length + MOON_LETTERS.length,
  },
  {
    slug: "gender",
    title_fr: "Genre et nombre",
    title_en: "Gender and Number",
    icon: "🔤",
    description_fr: "Masculin, féminin, singulier, duel et pluriel",
    description_en: "Masculine, feminine, singular, dual and plural",
    level: "beginner",
    itemCount: 6,
  },
  {
    slug: "conjugation_past",
    title_fr: "Conjugaison — passé",
    title_en: "Conjugation — past",
    icon: "📚",
    description_fr: "Le verbe arabe au passé (māḍī)",
    description_en: "Arabic verb in past tense (māḍī)",
    level: "intermediate",
    itemCount: VERB_CONJUGATION_PAST.length,
  },
  {
    slug: "conjugation_present",
    title_fr: "Conjugaison — présent",
    title_en: "Conjugation — present",
    icon: "📚",
    description_fr: "Le verbe arabe au présent (muḍāriʿ)",
    description_en: "Arabic verb in present tense (muḍāriʿ)",
    level: "intermediate",
    itemCount: VERB_CONJUGATION_PRESENT.length,
  },
  {
    slug: "sentences",
    title_fr: "Structure de phrase",
    title_en: "Sentence Structure",
    icon: "🏗️",
    description_fr: "Phrase nominale et phrase verbale",
    description_en: "Nominal and verbal sentences",
    level: "intermediate",
    itemCount: 5,
  },
];

export default function GrammarModule() {
  const { t, language } = useTranslation();
  const userLevel = useAppStore((s) => s.user?.level ?? "beginner");
  const [filter, setFilter] = useState<string>("all");

  const filteredCategories = filter === "all"
    ? GRAMMAR_CATEGORIES
    : GRAMMAR_CATEGORIES.filter((c) => c.level === filter);

  return (
    <div className="space-y-6">
      {/* En-tête */}
      <div className="flex items-center gap-3">
        <div className="p-3 bg-accent-100 dark:bg-accent-900 rounded-xl">
          <GraduationCap className="w-8 h-8 text-accent-600" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            {t("grammar.title")}
          </h1>
          <p className="text-gray-500 dark:text-gray-400">
            {t("grammar.subtitle")}
          </p>
        </div>
      </div>

      {/* Filtres */}
      <div className="flex gap-2">
        {["all", "beginner", "intermediate"].map((level) => (
          <button
            key={level}
            onClick={() => setFilter(level)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              filter === level
                ? "bg-accent-500 text-white"
                : "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700"
            }`}
          >
            {level === "all"
              ? (language === "fr" ? "Tous" : "All")
              : level === "beginner"
                ? t("letters.beginner")
                : t("letters.intermediate")}
          </button>
        ))}
      </div>

      {/* Grille des catégories */}
      <div className="grid gap-4">
        {filteredCategories.map((category, index) => (
          <motion.div
            key={category.slug}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
          >
            <Link
              to={`/grammar/${category.slug}`}
              className="card p-5 flex items-center gap-4 hover:shadow-md transition-shadow group"
            >
              <span className="text-3xl">{category.icon}</span>
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-gray-900 dark:text-white">
                  {language === "fr" ? category.title_fr : category.title_en}
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                  {language === "fr" ? category.description_fr : category.description_en}
                </p>
                <div className="flex items-center gap-3 mt-2">
                  <span className="text-xs px-2 py-0.5 rounded-full bg-accent-100 dark:bg-accent-900 text-accent-700 dark:text-accent-300">
                    {category.level === "beginner"
                      ? t("letters.beginner")
                      : t("letters.intermediate")}
                  </span>
                  <span className="text-xs text-gray-400">
                    {category.itemCount} {language === "fr" ? "éléments" : "items"}
                  </span>
                </div>
              </div>
              <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-accent-500 transition-colors" />
            </Link>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
