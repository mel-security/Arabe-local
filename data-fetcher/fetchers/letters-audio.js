// letters-audio.js — Downloads Arabic letter pronunciation audio via Google TTS
import { existsSync, statSync } from 'fs';
import { join } from 'path';
import { LETTERS, AUDIO_DIRS, DB_PATH_PREFIX, API, RATE_LIMITS, MIN_VALID_SIZE } from '../lib/config.js';
import { downloadFile } from '../lib/http.js';
import { Progress, printHeader } from '../lib/progress.js';
import * as db from '../lib/db.js';

/**
 * Build Google TTS URL for Arabic text.
 * Uses the letter's full Arabic name (e.g., أَلِف) for clearer pronunciation.
 */
function buildTTSUrl(arabicText, speed = 0.5) {
  const params = new URLSearchParams({
    ie: 'UTF-8',
    q: arabicText,
    tl: 'ar',
    client: 'gtx',
    ttsspeed: String(speed),
  });
  return `${API.GOOGLE_TTS_BASE}?${params.toString()}`;
}

export async function fetchLettersAudio({ sqlWriter, dryRun = false, concurrency = 1 }) {
  printHeader('🔊 Téléchargement des fichiers audio des lettres (Google TTS)');

  // Force concurrency=1 for Google TTS (strict rate limit)
  if (concurrency > 2) {
    console.log('  ⚠ Concurrence limitée à 2 pour Google TTS (rate limit)');
    concurrency = 2;
  }

  const progress = new Progress('Lettres audio', LETTERS.length);
  const results = { label: 'Audio lettres', total: LETTERS.length, downloaded: 0, skipped: 0, failed: 0 };

  for (const letter of LETTERS) {
    const filename = `${letter.slug}.mp3`;
    const destPath = join(AUDIO_DIRS.letters, filename);
    const dbPath = `${DB_PATH_PREFIX.audio.letters}/${filename}`;

    // Skip if already exists and is valid
    if (!dryRun && existsSync(destPath) && statSync(destPath).size >= MIN_VALID_SIZE.MP3) {
      results.skipped++;
      progress.tick({ skip: true, label: letter.nameFr });
      // Ensure SQL is still recorded (in case DB wasn't updated)
      sqlWriter.addLetterUpdate(letter.id, dbPath, undefined);
      db.updateLetterAudio(letter.id, dbPath);
      continue;
    }

    progress.tick({ label: letter.nameFr });

    try {
      const url = buildTTSUrl(letter.ttsText);

      await downloadFile(url, destPath, {
        rateLimit: RATE_LIMITS.GOOGLE_TTS,
        minSize: MIN_VALID_SIZE.MP3,
        dryRun,
        headers: {
          'Referer': 'https://translate.google.com/',
        },
      });

      sqlWriter.addLetterUpdate(letter.id, dbPath, undefined);
      db.updateLetterAudio(letter.id, dbPath);

      results.downloaded++;
      progress.tick({ success: true, label: letter.nameFr });
    } catch (err) {
      results.failed++;
      progress.tick({ fail: true, label: letter.nameFr });
      console.error(`\n  ✗ Erreur audio ${letter.nameFr}: ${err.message}`);
    }
  }

  progress.finish();
  return results;
}
