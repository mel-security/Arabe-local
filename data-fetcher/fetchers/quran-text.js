// quran-text.js — Fetches Quran text + translations from alquran.cloud
// Inserts missing surahs (8-111) and all 6236 verses into DB
import { SURAHS, API, RATE_LIMITS } from '../lib/config.js';
import { fetchJSON } from '../lib/http.js';
import { Progress, printHeader } from '../lib/progress.js';
import * as db from '../lib/db.js';

// The 10 surahs already seeded in database.rs (1-7, 112-114)
const SEEDED_SURAH_NUMBERS = new Set([1, 2, 3, 4, 5, 6, 7, 112, 113, 114]);

/**
 * Fetch a single surah's verses from alquran.cloud (3 editions in one call).
 * Returns array of verse objects ready for DB insertion.
 */
async function fetchSurahVerses(surahNumber, dryRun) {
  const url = `${API.ALQURAN_CLOUD}/v1/surah/${surahNumber}/editions/quran-uthmani,fr.hamidullah,en.sahih`;

  const response = await fetchJSON(url, {
    rateLimit: RATE_LIMITS.ALQURAN_CLOUD,
    dryRun,
    maxRetries: 4,
    baseDelay: 2000,
  });

  if (dryRun || !response) return [];

  if (response.code !== 200 || !Array.isArray(response.data)) {
    throw new Error(`API error for surah ${surahNumber}: ${JSON.stringify(response)}`);
  }

  // Find each edition by identifier (defensive — don't assume order)
  const editions = response.data;
  const arEdition = editions.find(e => e.edition?.identifier === 'quran-uthmani');
  const frEdition = editions.find(e => e.edition?.identifier === 'fr.hamidullah');
  const enEdition = editions.find(e => e.edition?.identifier === 'en.sahih');

  if (!arEdition || !frEdition || !enEdition) {
    throw new Error(`Missing editions for surah ${surahNumber}`);
  }

  const verses = [];
  for (let i = 0; i < arEdition.ayahs.length; i++) {
    const ar = arEdition.ayahs[i];
    const fr = frEdition.ayahs[i];
    const en = enEdition.ayahs[i];

    verses.push({
      surah_id:       surahNumber,
      verse_number:   ar.numberInSurah,
      arabic_text:    ar.text,
      translation_fr: fr?.text ?? null,
      translation_en: en?.text ?? null,
      transliteration: null,  // Not available in free API
      audio_file:     null,   // Filled later by quran-audio.js
      juz:            ar.juz ?? null,
      page:           ar.page ?? null,
    });
  }

  return verses;
}

export async function fetchQuranText({ sqlWriter, dryRun = false }) {
  printHeader('📖 Récupération du texte coranique (alquran.cloud)');
  console.log('  Éditions: quran-uthmani (arabe) + fr.hamidullah + en.sahih');
  console.log('  Rate limit: 500ms entre requêtes\n');

  const progress = new Progress('Sourates Coran', SURAHS.length);
  const results = {
    label: 'Texte Coran',
    total: SURAHS.length,
    downloaded: 0,
    skipped: 0,
    failed: 0,
    versesInserted: 0,
  };

  for (const surah of SURAHS) {
    const n = surah.number;
    progress.tick({ label: `${n}. ${surah.name_fr}` });

    // Check if verses already exist for this surah
    const existingCount = db.readVerseCount(n);
    if (existingCount >= surah.verses_count) {
      results.skipped++;
      progress.tick({ skip: true, label: surah.name_fr });
      continue;
    }

    try {
      // Insert surah metadata if not already seeded
      if (!SEEDED_SURAH_NUMBERS.has(n)) {
        sqlWriter.addSurahInsert(surah);
        db.upsertSurah(surah);
      }

      // Fetch and insert verses
      const verses = await fetchSurahVerses(n, dryRun);
      for (const verse of verses) {
        sqlWriter.addVerseInsert(verse);
        db.upsertVerse(verse);
      }

      results.downloaded++;
      results.versesInserted += verses.length;
      progress.tick({ success: true, label: surah.name_fr });
    } catch (err) {
      results.failed++;
      progress.tick({ fail: true, label: surah.name_fr });
      console.error(`\n  ✗ Erreur sourate ${n} (${surah.name_fr}): ${err.message}`);
    }
  }

  progress.finish();

  if (results.versesInserted > 0) {
    console.log(`  ✓ ${results.versesInserted} versets insérés au total`);
  }

  return results;
}
