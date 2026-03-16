import { useCallback } from "react";
import { useAppStore } from "@/store";
import frTranslations from "./fr.json";
import enTranslations from "./en.json";

type TranslationData = typeof frTranslations;

const translations: Record<string, TranslationData> = {
  fr: frTranslations,
  en: enTranslations,
};

/**
 * Hook i18n simple pour 2 langues (fr/en).
 * Usage: const { t } = useTranslation();
 *        t("nav.home") => "Accueil" ou "Home"
 */
export function useTranslation() {
  const language = useAppStore((s) => s.user?.language ?? "fr");
  const data = translations[language] ?? frTranslations;

  const t = useCallback(
    (key: string, fallback?: string): string => {
      const parts = key.split(".");
      let current: unknown = data;
      for (const part of parts) {
        if (current && typeof current === "object" && part in current) {
          current = (current as Record<string, unknown>)[part];
        } else {
          return fallback ?? key;
        }
      }
      return typeof current === "string" ? current : (fallback ?? key);
    },
    [data]
  );

  return { t, language };
}
