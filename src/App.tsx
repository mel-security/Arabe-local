import { useEffect, Suspense, lazy } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import { useAppStore } from "@/store";
import { userApi, progressApi } from "@/services/database";
import Layout from "@/components/layout/Layout";
import LoadingScreen from "@/components/common/LoadingScreen";

// Lazy loading des pages pour optimiser le chargement initial
const Home       = lazy(() => import("@/pages/Home"));
const Settings   = lazy(() => import("@/pages/Settings"));

// Modules
const LettersModule  = lazy(() => import("@/pages/letters/LettersModule"));
const LetterDetail   = lazy(() => import("@/pages/letters/LetterDetail"));
const LetterQuiz     = lazy(() => import("@/pages/letters/LetterQuiz"));

const ReadingModule  = lazy(() => import("@/pages/reading/ReadingModule"));
const ReadingLesson  = lazy(() => import("@/pages/reading/ReadingLesson"));

const WordsModule    = lazy(() => import("@/pages/words/WordsModule"));
const WordDetail     = lazy(() => import("@/pages/words/WordDetail"));
const WordQuiz       = lazy(() => import("@/pages/words/WordQuiz"));

const QuranModule    = lazy(() => import("@/pages/quran/QuranModule"));
const SurahReader    = lazy(() => import("@/pages/quran/SurahReader"));

export default function App() {
  const { setUser, setSettings, setProgress, setStreak } = useAppStore();

  // Chargement initial du profil utilisateur
  useEffect(() => {
    const init = async () => {
      try {
        const [user, settings, progress, streak] = await Promise.all([
          userApi.getProfile(),
          userApi.getSettings(),
          progressApi.getOverall(),
          progressApi.getStreak(),
        ]);
        setUser(user);
        setSettings(settings);
        setProgress(progress);
        setStreak(streak);

        // Appliquer le thème
        applyTheme(user.theme, user.font_size);
      } catch (e) {
        console.error("Erreur lors du chargement du profil:", e);
      }
    };
    init();
  }, [setUser, setSettings, setProgress, setStreak]);

  // Synchroniser le thème quand l'utilisateur change
  const theme = useAppStore((s) => s.user?.theme ?? "light");
  const fontSize = useAppStore((s) => s.user?.font_size ?? 3);

  useEffect(() => {
    applyTheme(theme, fontSize);
  }, [theme, fontSize]);

  return (
    <BrowserRouter>
      <Suspense fallback={<LoadingScreen />}>
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={<Home />} />
            <Route path="settings" element={<Settings />} />

            {/* Module Lettres */}
            <Route path="letters" element={<LettersModule />} />
            <Route path="letters/:id" element={<LetterDetail />} />
            <Route path="letters/quiz" element={<LetterQuiz />} />

            {/* Module Lecture */}
            <Route path="reading" element={<ReadingModule />} />
            <Route path="reading/:id" element={<ReadingLesson />} />

            {/* Module Mots */}
            <Route path="words" element={<WordsModule />} />
            <Route path="words/:id" element={<WordDetail />} />
            <Route path="words/quiz" element={<WordQuiz />} />

            {/* Module Coran */}
            <Route path="quran" element={<QuranModule />} />
            <Route path="quran/:surahId" element={<SurahReader />} />

            {/* Redirection par défaut */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Route>
        </Routes>
      </Suspense>

      <Toaster
        position="top-right"
        toastOptions={{
          duration: 3000,
          style: {
            background: "var(--toast-bg, #fff)",
            color: "var(--toast-color, #1a1a1a)",
            borderRadius: "12px",
            boxShadow: "0 4px 24px rgba(0,0,0,0.12)",
            border: "1px solid rgba(0,0,0,0.06)",
          },
          success: {
            iconTheme: { primary: "#22c55e", secondary: "#fff" },
          },
          error: {
            iconTheme: { primary: "#ef4444", secondary: "#fff" },
          },
        }}
      />
    </BrowserRouter>
  );
}

function applyTheme(theme: string, fontSize: number) {
  const root = document.documentElement;
  const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;

  if (theme === "dark" || (theme === "auto" && prefersDark)) {
    root.classList.add("dark");
  } else {
    root.classList.remove("dark");
  }

  root.setAttribute("data-font-size", String(fontSize));
}
