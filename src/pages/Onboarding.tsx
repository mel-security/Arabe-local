import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Globe, GraduationCap, Target, Sparkles, Check } from "lucide-react";
import { useAppStore } from "@/store";
import { userApi } from "@/lib/database/api";
import { markOnboardingComplete } from "@/lib/database/bootstrap";
import type { Level, Language } from "@/types";

type Step = "language" | "level" | "goals" | "ai" | "ready";

const STEPS: Step[] = ["language", "level", "goals", "ai", "ready"];

export default function Onboarding() {
  const navigate = useNavigate();
  const setUser = useAppStore((s) => s.setUser);

  const [currentStep, setCurrentStep] = useState(0);
  const [language, setLanguage] = useState<Language>("fr");
  const [level, setLevel] = useState<Level>("beginner");
  const [goals, setGoals] = useState<string[]>(["letters"]);
  const [aiEnabled, setAiEnabled] = useState(false);

  const step = STEPS[currentStep];

  const next = () => {
    if (currentStep < STEPS.length - 1) {
      setCurrentStep((s) => s + 1);
    }
  };

  const back = () => {
    if (currentStep > 0) {
      setCurrentStep((s) => s - 1);
    }
  };

  const finish = async () => {
    try {
      const user = await userApi.updateProfile({
        language,
        level,
        name: "Étudiant",
      });
      setUser(user);
      markOnboardingComplete();
      navigate("/", { replace: true });
    } catch (e) {
      console.error("Erreur onboarding:", e);
      markOnboardingComplete();
      navigate("/", { replace: true });
    }
  };

  const toggleGoal = (g: string) => {
    setGoals((prev) =>
      prev.includes(g) ? prev.filter((x) => x !== g) : [...prev, g]
    );
  };

  const labels = language === "fr"
    ? {
        welcome: "Bienvenue dans Arabe Local",
        subtitle: "Apprenez l'arabe, hors ligne, à votre rythme",
        chooseLanguage: "Choisissez la langue de l'interface",
        chooseLevel: "Quel est votre niveau en arabe ?",
        chooseGoals: "Que souhaitez-vous apprendre ?",
        enableAI: "Activer le tuteur IA local ?",
        aiDesc: "Utilisez un modèle local (Ollama) pour des explications personnalisées. Peut être activé plus tard dans les paramètres.",
        ready: "Tout est prêt !",
        readyDesc: "Votre espace d'apprentissage est configuré. Commençons !",
        next: "Suivant",
        back: "Retour",
        start: "Commencer",
        beginner: "Débutant",
        beginnerDesc: "Je ne connais pas l'alphabet arabe",
        intermediate: "Intermédiaire",
        intermediateDesc: "Je connais l'alphabet et quelques mots",
        advanced: "Avancé",
        advancedDesc: "Je peux lire et comprendre des textes simples",
        letters: "L'alphabet arabe",
        vocabulary: "Vocabulaire du quotidien",
        grammar: "Grammaire de base",
        reading: "Lecture et compréhension",
        quran: "Lecture coranique",
        yes: "Oui, activer",
        no: "Non, plus tard",
      }
    : {
        welcome: "Welcome to Arabe Local",
        subtitle: "Learn Arabic, offline, at your own pace",
        chooseLanguage: "Choose your interface language",
        chooseLevel: "What is your Arabic level?",
        chooseGoals: "What do you want to learn?",
        enableAI: "Enable local AI tutor?",
        aiDesc: "Use a local model (Ollama) for personalized explanations. Can be enabled later in settings.",
        ready: "All set!",
        readyDesc: "Your learning space is ready. Let's begin!",
        next: "Next",
        back: "Back",
        start: "Start",
        beginner: "Beginner",
        beginnerDesc: "I don't know the Arabic alphabet",
        intermediate: "Intermediate",
        intermediateDesc: "I know the alphabet and some words",
        advanced: "Advanced",
        advancedDesc: "I can read and understand simple texts",
        letters: "Arabic alphabet",
        vocabulary: "Everyday vocabulary",
        grammar: "Basic grammar",
        reading: "Reading & comprehension",
        quran: "Quranic reading",
        yes: "Yes, enable",
        no: "No, later",
      };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-accent-50 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950 flex items-center justify-center p-4">
      <div className="w-full max-w-lg">
        {/* Progress */}
        <div className="flex gap-2 mb-8 justify-center">
          {STEPS.map((_, i) => (
            <div
              key={i}
              className={`h-2 w-10 rounded-full transition-colors ${
                i <= currentStep
                  ? "bg-primary-500"
                  : "bg-gray-200 dark:bg-gray-700"
              }`}
            />
          ))}
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -30 }}
            className="card p-8 space-y-6"
          >
            {step === "language" && (
              <>
                <div className="text-center space-y-2">
                  <Globe className="w-12 h-12 text-primary-500 mx-auto" />
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                    {labels.welcome}
                  </h2>
                  <p className="text-gray-500">{labels.subtitle}</p>
                </div>
                <p className="text-center text-gray-600 dark:text-gray-400">
                  {labels.chooseLanguage}
                </p>
                <div className="grid grid-cols-2 gap-4">
                  {(["fr", "en"] as const).map((lang) => (
                    <button
                      key={lang}
                      onClick={() => setLanguage(lang)}
                      className={`p-4 rounded-xl border-2 text-center transition-all ${
                        language === lang
                          ? "border-primary-500 bg-primary-50 dark:bg-primary-950"
                          : "border-gray-200 dark:border-gray-700 hover:border-primary-300"
                      }`}
                    >
                      <span className="text-2xl">{lang === "fr" ? "🇫🇷" : "🇬🇧"}</span>
                      <p className="font-medium mt-2">{lang === "fr" ? "Français" : "English"}</p>
                    </button>
                  ))}
                </div>
              </>
            )}

            {step === "level" && (
              <>
                <div className="text-center space-y-2">
                  <GraduationCap className="w-12 h-12 text-accent-500 mx-auto" />
                  <h2 className="text-xl font-bold">{labels.chooseLevel}</h2>
                </div>
                <div className="space-y-3">
                  {([
                    { value: "beginner" as Level, label: labels.beginner, desc: labels.beginnerDesc },
                    { value: "intermediate" as Level, label: labels.intermediate, desc: labels.intermediateDesc },
                    { value: "advanced" as Level, label: labels.advanced, desc: labels.advancedDesc },
                  ]).map((opt) => (
                    <button
                      key={opt.value}
                      onClick={() => setLevel(opt.value)}
                      className={`w-full p-4 rounded-xl border-2 text-left transition-all ${
                        level === opt.value
                          ? "border-accent-500 bg-accent-50 dark:bg-accent-950"
                          : "border-gray-200 dark:border-gray-700 hover:border-accent-300"
                      }`}
                    >
                      <p className="font-medium">{opt.label}</p>
                      <p className="text-sm text-gray-500 mt-1">{opt.desc}</p>
                    </button>
                  ))}
                </div>
              </>
            )}

            {step === "goals" && (
              <>
                <div className="text-center space-y-2">
                  <Target className="w-12 h-12 text-primary-500 mx-auto" />
                  <h2 className="text-xl font-bold">{labels.chooseGoals}</h2>
                </div>
                <div className="space-y-3">
                  {([
                    { key: "letters", label: labels.letters },
                    { key: "vocabulary", label: labels.vocabulary },
                    { key: "grammar", label: labels.grammar },
                    { key: "reading", label: labels.reading },
                    { key: "quran", label: labels.quran },
                  ]).map((g) => (
                    <button
                      key={g.key}
                      onClick={() => toggleGoal(g.key)}
                      className={`w-full p-4 rounded-xl border-2 text-left flex items-center gap-3 transition-all ${
                        goals.includes(g.key)
                          ? "border-primary-500 bg-primary-50 dark:bg-primary-950"
                          : "border-gray-200 dark:border-gray-700 hover:border-primary-300"
                      }`}
                    >
                      <div className={`w-6 h-6 rounded-full flex items-center justify-center ${
                        goals.includes(g.key) ? "bg-primary-500 text-white" : "bg-gray-200 dark:bg-gray-700"
                      }`}>
                        {goals.includes(g.key) && <Check className="w-4 h-4" />}
                      </div>
                      <span className="font-medium">{g.label}</span>
                    </button>
                  ))}
                </div>
              </>
            )}

            {step === "ai" && (
              <>
                <div className="text-center space-y-2">
                  <Sparkles className="w-12 h-12 text-accent-500 mx-auto" />
                  <h2 className="text-xl font-bold">{labels.enableAI}</h2>
                  <p className="text-sm text-gray-500">{labels.aiDesc}</p>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <button
                    onClick={() => { setAiEnabled(true); next(); }}
                    className="p-4 rounded-xl border-2 border-accent-500 bg-accent-50 dark:bg-accent-950 text-center"
                  >
                    <Sparkles className="w-8 h-8 text-accent-500 mx-auto mb-2" />
                    <p className="font-medium">{labels.yes}</p>
                  </button>
                  <button
                    onClick={() => { setAiEnabled(false); next(); }}
                    className="p-4 rounded-xl border-2 border-gray-200 dark:border-gray-700 hover:border-gray-300 text-center"
                  >
                    <p className="font-medium">{labels.no}</p>
                  </button>
                </div>
              </>
            )}

            {step === "ready" && (
              <>
                <div className="text-center space-y-4">
                  <div className="w-20 h-20 bg-accent-100 dark:bg-accent-900 rounded-full flex items-center justify-center mx-auto">
                    <Check className="w-10 h-10 text-accent-600" />
                  </div>
                  <h2 className="text-2xl font-bold">{labels.ready}</h2>
                  <p className="text-gray-500">{labels.readyDesc}</p>
                </div>
              </>
            )}

            {/* Navigation */}
            {step !== "ai" && (
              <div className="flex justify-between pt-4">
                {currentStep > 0 ? (
                  <button
                    onClick={back}
                    className="px-6 py-2 rounded-lg text-gray-600 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                  >
                    {labels.back}
                  </button>
                ) : (
                  <div />
                )}
                {step === "ready" ? (
                  <button
                    onClick={finish}
                    className="btn-primary px-8 py-3"
                  >
                    {labels.start}
                  </button>
                ) : (
                  <button
                    onClick={next}
                    className="btn-primary px-6 py-2"
                  >
                    {labels.next}
                  </button>
                )}
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
