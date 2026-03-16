import { useParams, Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { motion } from "framer-motion";
import { useTranslation } from "@/i18n/useTranslation";
import { ArabicText } from "@/components/common/ArabicText";
import {
  ARABIC_PRONOUNS,
  VERB_CONJUGATION_PAST,
  VERB_CONJUGATION_PRESENT,
  SUN_LETTERS,
  MOON_LETTERS,
  SENTENCE_TEMPLATES,
} from "@/lib/pedagogy/grammarRules";

interface ContentRow {
  arabic: string;
  transliteration: string;
  translation_fr: string;
  translation_en?: string;
}

function getContent(slug: string): { title_fr: string; title_en: string; explanation_fr: string; explanation_en: string; rows: ContentRow[] } {
  switch (slug) {
    case "pronouns":
      return {
        title_fr: "Pronoms personnels",
        title_en: "Personal Pronouns",
        explanation_fr: "En arabe, les pronoms personnels changent selon le genre (masculin/féminin) et le nombre (singulier/duel/pluriel).",
        explanation_en: "In Arabic, personal pronouns change by gender (masculine/feminine) and number (singular/dual/plural).",
        rows: ARABIC_PRONOUNS,
      };
    case "articles":
      return {
        title_fr: "Article défini ال (al-)",
        title_en: "Definite Article ال (al-)",
        explanation_fr: "L'article défini « ال » se place devant le nom. Avec les lettres solaires, le « ل » s'assimile à la consonne suivante.",
        explanation_en: "The definite article 'al-' precedes the noun. With sun letters, the 'l' assimilates to the following consonant.",
        rows: [
          ...SUN_LETTERS.map((l) => ({ arabic: l, transliteration: "", translation_fr: "Lettre solaire", translation_en: "Sun letter" })),
          ...MOON_LETTERS.map((l) => ({ arabic: l, transliteration: "", translation_fr: "Lettre lunaire", translation_en: "Moon letter" })),
        ],
      };
    case "gender":
      return {
        title_fr: "Genre et nombre",
        title_en: "Gender and Number",
        explanation_fr: "La plupart des noms féminins se terminent par « ة » (ta marbuta). Les adjectifs s'accordent en genre avec le nom.",
        explanation_en: "Most feminine nouns end with 'ة' (ta marbuta). Adjectives agree in gender with the noun.",
        rows: [
          { arabic: "مُعَلِّم", transliteration: "muʿallim", translation_fr: "enseignant (m.)", translation_en: "teacher (m.)" },
          { arabic: "مُعَلِّمَة", transliteration: "muʿallima", translation_fr: "enseignante (f.)", translation_en: "teacher (f.)" },
          { arabic: "طَالِب", transliteration: "ṭālib", translation_fr: "étudiant (m.)", translation_en: "student (m.)" },
          { arabic: "طَالِبَة", transliteration: "ṭāliba", translation_fr: "étudiante (f.)", translation_en: "student (f.)" },
          { arabic: "كَبِير", transliteration: "kabīr", translation_fr: "grand (m.)", translation_en: "big (m.)" },
          { arabic: "كَبِيرَة", transliteration: "kabīra", translation_fr: "grande (f.)", translation_en: "big (f.)" },
        ],
      };
    case "conjugation_past":
      return {
        title_fr: "Conjugaison au passé — كَتَبَ (écrire)",
        title_en: "Past Tense Conjugation — كَتَبَ (to write)",
        explanation_fr: "Le passé (māḍī) est la forme de base du verbe arabe. Les suffixes changent selon la personne.",
        explanation_en: "The past tense (māḍī) is the base form of Arabic verbs. Suffixes change by person.",
        rows: VERB_CONJUGATION_PAST.map((v) => ({
          arabic: `${v.pronoun} ${v.verb}`,
          transliteration: v.transliteration,
          translation_fr: v.translation_fr,
        })),
      };
    case "conjugation_present":
      return {
        title_fr: "Conjugaison au présent — يَكْتُبُ (écrire)",
        title_en: "Present Tense Conjugation — يَكْتُبُ (to write)",
        explanation_fr: "Le présent (muḍāriʿ) se forme avec des préfixes et parfois des suffixes.",
        explanation_en: "The present tense (muḍāriʿ) is formed with prefixes and sometimes suffixes.",
        rows: VERB_CONJUGATION_PRESENT.map((v) => ({
          arabic: `${v.pronoun} ${v.verb}`,
          transliteration: v.transliteration,
          translation_fr: v.translation_fr,
        })),
      };
    case "sentences":
      return {
        title_fr: "Structure de phrase",
        title_en: "Sentence Structure",
        explanation_fr: "L'arabe a deux types de phrases : la phrase nominale (commence par un nom) et la phrase verbale (commence par un verbe).",
        explanation_en: "Arabic has two sentence types: nominal (starts with a noun) and verbal (starts with a verb).",
        rows: [
          ...SENTENCE_TEMPLATES.nominal.map((s) => ({
            arabic: s.example_ar,
            transliteration: "",
            translation_fr: s.example_fr,
            translation_en: "",
          })),
          ...SENTENCE_TEMPLATES.verbal.map((s) => ({
            arabic: s.example_ar,
            transliteration: "",
            translation_fr: s.example_fr,
            translation_en: "",
          })),
        ],
      };
    default:
      return {
        title_fr: "Contenu non trouvé",
        title_en: "Content not found",
        explanation_fr: "",
        explanation_en: "",
        rows: [],
      };
  }
}

export default function GrammarLesson() {
  const { slug } = useParams<{ slug: string }>();
  const { language } = useTranslation();

  const content = getContent(slug ?? "");

  return (
    <div className="space-y-6 max-w-3xl">
      {/* Navigation */}
      <Link
        to="/grammar"
        className="inline-flex items-center gap-2 text-gray-500 hover:text-accent-600 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        {language === "fr" ? "Retour à la grammaire" : "Back to grammar"}
      </Link>

      {/* Titre */}
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
        {language === "fr" ? content.title_fr : content.title_en}
      </h1>

      {/* Explication */}
      <div className="card p-5 bg-accent-50 dark:bg-accent-950 border-accent-200 dark:border-accent-800">
        <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
          {language === "fr" ? content.explanation_fr : content.explanation_en}
        </p>
      </div>

      {/* Tableau de contenu */}
      <div className="space-y-3">
        {content.rows.map((row, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.03 }}
            className="card p-4 flex items-center gap-4"
          >
            <ArabicText size="lg" className="min-w-[120px] text-center">
              {row.arabic}
            </ArabicText>
            <div className="flex-1">
              {row.transliteration && (
                <p className="text-sm text-primary-600 dark:text-primary-400 font-mono">
                  {row.transliteration}
                </p>
              )}
              <p className="text-gray-700 dark:text-gray-300">
                {language === "fr" ? row.translation_fr : (row.translation_en ?? row.translation_fr)}
              </p>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
