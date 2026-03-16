// words-audio.js — Downloads Arabic vocabulary word pronunciation via Google TTS
import { existsSync, statSync } from 'fs';
import { join } from 'path';
import { AUDIO_DIRS, DB_PATH_PREFIX, API, RATE_LIMITS, MIN_VALID_SIZE } from '../lib/config.js';
import { downloadFile } from '../lib/http.js';
import { Progress, printHeader } from '../lib/progress.js';
import * as db from '../lib/db.js';

function slugify(str) {
  if (!str) return 'word';
  return str
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_|_$/g, '')
    .slice(0, 30);
}

function buildTTSUrl(arabicText) {
  const params = new URLSearchParams({
    ie: 'UTF-8',
    q: arabicText,
    tl: 'ar',
    client: 'gtx',
    ttsspeed: '0.7',
  });
  return `${API.GOOGLE_TTS_BASE}?${params.toString()}`;
}

export async function fetchWordsAudio({ sqlWriter, dryRun = false }) {
  printHeader('🔊 Téléchargement de l\'audio des mots (Google TTS)');

  const words = db.readWords();

  if (words.length === 0) {
    console.log('  ℹ Aucun mot trouvé dans la DB (mode sans --db). Ignoré.');
    return { label: 'Audio mots', total: 0, downloaded: 0, skipped: 0, failed: 0 };
  }

  console.log(`  ${words.length} mots à traiter | Rate limit: 1.5s\n`);

  const progress = new Progress('Mots audio', words.length);
  const results = { label: 'Audio mots', total: words.length, downloaded: 0, skipped: 0, failed: 0 };

  for (const word of words) {
    const translitSlug = slugify(word.transliteration || word.translation_fr);
    const filename = `${word.id}_${translitSlug}.mp3`;
    const destPath = join(AUDIO_DIRS.words, filename);
    const dbPath = `${DB_PATH_PREFIX.audio.words}/${filename}`;

    // Skip if already valid
    if (!dryRun && existsSync(destPath) && statSync(destPath).size >= MIN_VALID_SIZE.MP3) {
      results.skipped++;
      progress.tick({ skip: true, label: word.translation_fr });
      sqlWriter.addWordUpdate(word.id, dbPath, undefined);
      db.updateWordAudio(word.id, dbPath);
      continue;
    }

    progress.tick({ label: word.translation_fr });

    try {
      const url = buildTTSUrl(word.arabic);

      await downloadFile(url, destPath, {
        rateLimit: RATE_LIMITS.GOOGLE_TTS,
        minSize: MIN_VALID_SIZE.MP3,
        dryRun,
        headers: { 'Referer': 'https://translate.google.com/' },
      });

      sqlWriter.addWordUpdate(word.id, dbPath, undefined);
      db.updateWordAudio(word.id, dbPath);

      results.downloaded++;
      progress.tick({ success: true, label: word.translation_fr });
    } catch (err) {
      results.failed++;
      progress.tick({ fail: true, label: word.translation_fr });
      console.error(`\n  ✗ Erreur audio "${word.translation_fr}": ${err.message}`);
    }
  }

  progress.finish();
  return results;
}
