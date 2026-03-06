import { useState } from "react";
import { motion } from "framer-motion";
import {
  User, Palette, Bell, Volume2, Languages,
  BookOpen, Target, ChevronRight, Check, Info
} from "lucide-react";
import { clsx } from "clsx";
import toast from "react-hot-toast";
import { useAppStore } from "@/store";
import { userApi } from "@/services/database";
import type { Level, Theme, Language } from "@/types";

// ============================================================
// SECTION SETTINGS
// ============================================================

function Section({ title, icon: Icon, children }: {
  title: string;
  icon: React.ElementType;
  children: React.ReactNode;
}) {
  return (
    <section className="bg-white dark:bg-gray-900 rounded-2xl border border-sand-100 dark:border-gray-800 overflow-hidden">
      <div className="flex items-center gap-2 px-5 py-4 border-b border-sand-100 dark:border-gray-800">
        <Icon className="w-4 h-4 text-primary-500" />
        <h2 className="font-semibold text-gray-900 dark:text-white text-sm">{title}</h2>
      </div>
      <div className="divide-y divide-sand-50 dark:divide-gray-800">
        {children}
      </div>
    </section>
  );
}

function Row({ label, description, children }: {
  label: string;
  description?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-center justify-between gap-4 px-5 py-4">
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-gray-900 dark:text-white">{label}</p>
        {description && (
          <p className="text-xs text-gray-400 mt-0.5">{description}</p>
        )}
      </div>
      <div className="flex-shrink-0">{children}</div>
    </div>
  );
}

// ============================================================
// COMPOSANT PRINCIPAL
// ============================================================

export default function Settings() {
  const user = useAppStore((s) => s.user);
  const setUser = useAppStore((s) => s.setUser);
  const [saving, setSaving] = useState(false);
  const [editName, setEditName] = useState(false);
  const [nameInput, setNameInput] = useState(user?.name ?? "");

  const save = async (updates: Partial<typeof user>) => {
    if (!user) return;
    setSaving(true);
    try {
      const updated = await userApi.updateProfile(updates as Parameters<typeof userApi.updateProfile>[0]);
      setUser(updated);
      toast.success("Paramètre enregistré");
    } catch {
      toast.error("Erreur lors de la sauvegarde");
    } finally {
      setSaving(false);
    }
  };

  const saveName = async () => {
    if (!nameInput.trim()) return;
    await save({ name: nameInput.trim() });
    setEditName(false);
  };

  if (!user) return null;

  return (
    <div className="space-y-4 max-w-2xl animate-slide-up">
      <h1 className="text-xl font-bold text-gray-900 dark:text-white">Paramètres</h1>

      {/* ============================
          PROFIL
          ============================ */}
      <Section title="Profil" icon={User}>
        <Row label="Prénom" description="Affiché sur l'écran d'accueil">
          {editName ? (
            <div className="flex items-center gap-2">
              <input
                value={nameInput}
                onChange={(e) => setNameInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && saveName()}
                className="border border-sand-200 dark:border-gray-600 rounded-lg px-3 py-1.5 text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white w-32"
                autoFocus
                maxLength={32}
              />
              <button onClick={saveName} className="btn-icon bg-green-100 text-green-700 w-8 h-8">
                <Check className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <button
              onClick={() => { setEditName(true); setNameInput(user.name); }}
              className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300 hover:text-primary-600"
            >
              {user.name}
              <ChevronRight className="w-4 h-4" />
            </button>
          )}
        </Row>

        <Row label="Niveau" description="Influence le contenu proposé">
          <LevelSelector value={user.level} onChange={(l) => save({ level: l })} />
        </Row>
      </Section>

      {/* ============================
          LANGUE DE L'INTERFACE
          ============================ */}
      <Section title="Langue d'interface" icon={Languages}>
        <Row label="Langue" description="Traductions et interface">
          <div className="flex gap-2">
            {(["fr", "en"] as Language[]).map((lang) => (
              <button
                key={lang}
                onClick={() => save({ language: lang })}
                className={clsx(
                  "px-3 py-1.5 rounded-lg text-sm font-medium transition-all",
                  user.language === lang
                    ? "bg-primary-500 text-white"
                    : "bg-sand-100 text-gray-600 hover:bg-sand-200 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
                )}
              >
                {lang === "fr" ? "🇫🇷 Français" : "🇬🇧 English"}
              </button>
            ))}
          </div>
        </Row>
      </Section>

      {/* ============================
          APPARENCE
          ============================ */}
      <Section title="Apparence" icon={Palette}>
        <Row label="Thème" description="Couleur de l'interface">
          <ThemeSelector value={user.theme} onChange={(t) => save({ theme: t })} />
        </Row>

        <Row
          label="Taille de la police arabe"
          description={`Niveau actuel : ${user.font_size}/5`}
        >
          <div className="flex items-center gap-3">
            <button
              onClick={() => save({ font_size: Math.max(1, user.font_size - 1) })}
              disabled={user.font_size <= 1}
              className="btn-icon w-8 h-8 bg-sand-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 disabled:opacity-40"
            >
              A
            </button>
            <div className="flex gap-1">
              {[1, 2, 3, 4, 5].map((v) => (
                <button
                  key={v}
                  onClick={() => save({ font_size: v })}
                  className={clsx(
                    "w-2 h-2 rounded-full transition-all",
                    user.font_size >= v ? "bg-primary-500" : "bg-sand-200 dark:bg-gray-700"
                  )}
                />
              ))}
            </div>
            <button
              onClick={() => save({ font_size: Math.min(5, user.font_size + 1) })}
              disabled={user.font_size >= 5}
              className="btn-icon w-8 h-8 bg-sand-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 text-lg disabled:opacity-40"
            >
              A
            </button>
          </div>
        </Row>
      </Section>

      {/* ============================
          INFOS
          ============================ */}
      <Section title="À propos" icon={Info}>
        <Row label="Version" description="عربي — Arabe Local">
          <span className="text-sm text-gray-400">v1.0.0</span>
        </Row>
        <Row label="Base de données" description="SQLite locale">
          <span className="text-sm text-green-500">● Actif</span>
        </Row>
        <Row label="Mode hors-ligne" description="Toutes fonctionnalités disponibles">
          <span className="text-sm text-green-500">● Activé</span>
        </Row>
      </Section>
    </div>
  );
}

// ============================================================
// COMPOSANTS INTERNES
// ============================================================

function LevelSelector({ value, onChange }: { value: Level; onChange: (l: Level) => void }) {
  const levels: { value: Level; label: string; color: string }[] = [
    { value: "beginner",     label: "Débutant",     color: "bg-green-500" },
    { value: "intermediate", label: "Intermédiaire", color: "bg-blue-500" },
    { value: "advanced",     label: "Avancé",       color: "bg-purple-500" },
    { value: "expert",       label: "Expert",       color: "bg-orange-500" },
  ];

  return (
    <div className="flex flex-wrap gap-2">
      {levels.map((l) => (
        <button
          key={l.value}
          onClick={() => onChange(l.value)}
          className={clsx(
            "px-3 py-1.5 rounded-lg text-xs font-medium transition-all",
            value === l.value
              ? `${l.color} text-white`
              : "bg-sand-100 text-gray-600 hover:bg-sand-200 dark:bg-gray-800 dark:text-gray-300"
          )}
        >
          {l.label}
        </button>
      ))}
    </div>
  );
}

function ThemeSelector({ value, onChange }: { value: Theme; onChange: (t: Theme) => void }) {
  const themes: { value: Theme; label: string; emoji: string }[] = [
    { value: "light", label: "Clair",     emoji: "☀️" },
    { value: "dark",  label: "Sombre",    emoji: "🌙" },
    { value: "auto",  label: "Auto",      emoji: "🔄" },
  ];

  return (
    <div className="flex gap-2">
      {themes.map((t) => (
        <button
          key={t.value}
          onClick={() => onChange(t.value)}
          className={clsx(
            "flex flex-col items-center gap-1 px-3 py-2 rounded-xl text-xs font-medium transition-all border-2",
            value === t.value
              ? "border-primary-400 bg-primary-50 text-primary-700 dark:bg-primary-950 dark:text-primary-300"
              : "border-transparent bg-sand-100 text-gray-600 hover:bg-sand-200 dark:bg-gray-800 dark:text-gray-300"
          )}
        >
          <span className="text-base">{t.emoji}</span>
          {t.label}
        </button>
      ))}
    </div>
  );
}
