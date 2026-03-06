import { NavLink, useLocation } from "react-router-dom";
import {
  BookOpen, AlignLeft, MessageSquare, BookMarked,
  Home, Settings, X, GraduationCap, Bot
} from "lucide-react";
import { clsx } from "clsx";
import { useAppStore } from "@/store";
import { useLLMStore } from "@/store/llmStore";
import ProgressBar from "@/components/common/ProgressBar";

const navItems = [
  { to: "/",        icon: Home,          label: "Accueil",   exact: true },
  { to: "/letters", icon: AlignLeft,     label: "Lettres" },
  { to: "/reading", icon: BookOpen,      label: "Lecture" },
  { to: "/words",   icon: MessageSquare, label: "Mots" },
  { to: "/quran",   icon: BookMarked,    label: "Coran" },
];

export default function Sidebar() {
  const sidebarOpen = useAppStore((s) => s.sidebarOpen);
  const setSidebarOpen = useAppStore((s) => s.setSidebarOpen);
  const user = useAppStore((s) => s.user);
  const progress = useAppStore((s) => s.progress);
  const location = useLocation();
  const modelStatus = useLLMStore((s) => s.modelStatus);

  const isActive = (to: string, exact = false) => {
    if (exact) return location.pathname === to;
    return location.pathname.startsWith(to);
  };

  return (
    <>
      {/* Sidebar desktop : toujours visible */}
      {/* Sidebar mobile : glisse */}
      <aside
        className={clsx(
          "flex flex-col flex-shrink-0 w-64 bg-white dark:bg-gray-900",
          "border-r border-sand-100 dark:border-gray-800",
          "transition-transform duration-300 ease-in-out",
          // Desktop : toujours visible
          "lg:translate-x-0 lg:relative lg:z-auto",
          // Mobile : controllé par l'état
          "fixed inset-y-0 left-0 z-30",
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        {/* En-tête sidebar */}
        <div className="flex items-center justify-between p-4 border-b border-sand-100 dark:border-gray-800">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-primary-500 flex items-center justify-center">
              <span className="arabic-text text-white text-xl font-bold">ع</span>
            </div>
            <div>
              <h1 className="font-bold text-gray-900 dark:text-white text-sm leading-tight">
                عربي
              </h1>
              <p className="text-xs text-gray-400">Apprendre l'Arabe</p>
            </div>
          </div>
          {/* Bouton fermer (mobile) */}
          <button
            onClick={() => setSidebarOpen(false)}
            className="btn-icon text-gray-400 hover:text-gray-600 lg:hidden"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
          {navItems.map(({ to, icon: Icon, label, exact }) => (
            <NavLink
              key={to}
              to={to}
              onClick={() => setSidebarOpen(false)}
              className={clsx(
                "nav-item",
                isActive(to, exact) && "active"
              )}
            >
              <Icon className="w-4 h-4 flex-shrink-0" />
              <span>{label}</span>
            </NavLink>
          ))}
        </nav>

        {/* Progression utilisateur */}
        {user && (
          <div className="p-4 border-t border-sand-100 dark:border-gray-800">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-8 h-8 rounded-full bg-primary-100 dark:bg-primary-950 flex items-center justify-center">
                <GraduationCap className="w-4 h-4 text-primary-600 dark:text-primary-400" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                  {user.name}
                </p>
                <p className="text-xs text-gray-400 capitalize">
                  {levelLabel(user.level)}
                </p>
              </div>
            </div>

            {progress && (
              <ProgressBar
                value={progress.total_percent}
                label="Progression globale"
                showPercent
                size="sm"
              />
            )}
          </div>
        )}

        {/* IA & Paramètres */}
        <div className="p-3 border-t border-sand-100 dark:border-gray-800 space-y-1">
          <NavLink
            to="/ai-tutor"
            onClick={() => setSidebarOpen(false)}
            className={clsx("nav-item", isActive("/ai-tutor") && "active")}
          >
            <Bot className="w-4 h-4 flex-shrink-0" />
            <span className="flex-1">Assistant IA</span>
            {/* Indicateur de statut du modèle */}
            <span className={clsx(
              "w-2 h-2 rounded-full flex-shrink-0",
              modelStatus?.available
                ? "bg-green-400"
                : modelStatus === null
                  ? "bg-gray-300 dark:bg-gray-600"
                  : "bg-orange-400"
            )} />
          </NavLink>
          <NavLink
            to="/settings"
            onClick={() => setSidebarOpen(false)}
            className={clsx("nav-item", isActive("/settings") && "active")}
          >
            <Settings className="w-4 h-4" />
            <span>Paramètres</span>
          </NavLink>
        </div>
      </aside>
    </>
  );
}

function levelLabel(level: string): string {
  const labels: Record<string, string> = {
    beginner: "Débutant",
    intermediate: "Intermédiaire",
    advanced: "Avancé",
    expert: "Expert",
  };
  return labels[level] ?? level;
}
