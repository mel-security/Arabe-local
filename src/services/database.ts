/**
 * Re-export depuis src/lib/database/api.ts
 * Ce fichier existe pour la compatibilité des imports existants.
 * Les nouveaux fichiers doivent importer depuis @/lib/database/api.
 */
export {
  userApi,
  lettersApi,
  wordsApi,
  readingApi,
  quranApi,
  progressApi,
  llmApi,
} from "@/lib/database/api";
