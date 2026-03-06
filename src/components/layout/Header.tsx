import { useLocation, useNavigate } from "react-router-dom";
import { Menu, ArrowLeft, Flame, Sun, Moon, Bot } from "lucide-react";
import { clsx } from "clsx";
import { useAppStore } from "@/store";
import { useLLMStore } from "@/store/llmStore";
import { userApi } from "@/services/database";
import toast from "react-hot-toast";

const routeTitles: Record<string, string> = {
  "":           "Accueil",
  "letters":    "Lettres arabes",
  "reading":    "Lecture",
  "words":      "Vocabulaire",
  "quran":      "Coran",
  "settings":   "Paramètres",
  "ai-tutor":   "Tuteur IA",
  "llm-settings": "Paramètres IA",
};

export default function Header() {
  const setSidebarOpen = useAppStore((s) => s.setSidebarOpen);
  const sidebarOpen    = useAppStore((s) => s.sidebarOpen);
  const user           = useAppStore((s) => s.user);
  const streak         = useAppStore((s) => s.streak);
  const setUser        = useAppStore((s) => s.setUser);
  const setChatOpen    = useLLMStore((s) => s.setChatOpen);
  const modelStatus    = useLLMStore((s) => s.modelStatus);
  const location = useLocation();
  const navigate = useNavigate();

  const pathParts = location.pathname.split("/").filter(Boolean);
  const module = pathParts[0] ?? "";
  const isDetail = pathParts.length > 1;
  const title = routeTitles[module] ?? module;

  const toggleTheme = async () => {
    if (!user) return;
    const newTheme = user.theme === "dark" ? "light" : "dark";
    try {
      const updated = await userApi.updateProfile({ theme: newTheme });
      setUser(updated);
    } catch {
      toast.error("Impossible de changer le thème");
    }
  };

  return (
    <header className={clsx(
      "flex items-center gap-3 px-4 py-3",
      "bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm",
      "border-b border-sand-100 dark:border-gray-800",
      "sticky top-0 z-10"
    )}>
      {/* Bouton menu (mobile) ou retour */}
      {isDetail ? (
        <button
          onClick={() => navigate(-1)}
          className="btn-icon text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
          aria-label="Retour"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
      ) : (
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="btn-icon text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white lg:hidden"
          aria-label="Menu"
        >
          <Menu className="w-5 h-5" />
        </button>
      )}

      {/* Titre de la page */}
      <div className="flex-1">
        <h2 className="font-semibold text-gray-900 dark:text-white text-sm md:text-base">
          {title}
        </h2>
      </div>

      {/* Actions droite */}
      <div className="flex items-center gap-2">
        {/* Streak */}
        {streak && streak.current_streak > 0 && (
          <div className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-orange-100 dark:bg-orange-950">
            <Flame className="w-3.5 h-3.5 text-orange-500" />
            <span className="text-xs font-bold text-orange-700 dark:text-orange-300">
              {streak.current_streak}j
            </span>
          </div>
        )}

        {/* Bouton IA */}
        <button
          onClick={() => setChatOpen(true)}
          title="Ouvrir l'assistant IA"
          className={clsx(
            "btn-icon relative transition-colors",
            modelStatus?.available
              ? "text-accent-500 hover:text-accent-600 dark:text-accent-400"
              : "text-gray-400 hover:text-gray-500 dark:text-gray-500"
          )}
          aria-label="Assistant IA"
        >
          <Bot className="w-5 h-5" />
          {/* Indicateur disponibilité */}
          <span className={clsx(
            "absolute top-0.5 right-0.5 w-2 h-2 rounded-full border-2 border-white dark:border-gray-900",
            modelStatus?.available ? "bg-green-400" : "bg-gray-300 dark:bg-gray-600"
          )} />
        </button>

        {/* Bouton thème */}
        <button
          onClick={toggleTheme}
          className="btn-icon text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
          aria-label="Changer le thème"
        >
          {user?.theme === "dark" ? (
            <Sun className="w-4 h-4" />
          ) : (
            <Moon className="w-4 h-4" />
          )}
        </button>
      </div>
    </header>
  );
}
