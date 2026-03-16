// quran-audio.js — Downloads Quran verse audio from EveryAyah.com (Alafasy 128kbps)
// URL pattern: https://everyayah.com/data/Alafasy_128kbps/{SSS}{VVV}.mp3
import { existsSync, statSync } from 'fs';
import { join } from 'path';
import { SURAHS, AUDIO_DIRS, DB_PATH_PREFIX, API, RATE_LIMITS, MIN_VALID_SIZE } from '../lib/config.js';
import { downloadFile, processInBatches } from '../lib/http.js';
import { Progress, printHeader } from '../lib/progress.js';
import * as db from '../lib/db.js';

function pad(n, width) {
  return String(n).padStart(width, '0');
}

function buildEveryAyahUrl(surahNum, verseNum) {
  return `${API.EVERYAYAH_BASE}/${pad(surahNum, 3)}${pad(verseNum, 3)}.mp3`;
}

function getVerseFilename(surahNum, verseNum) {
  return `${pad(surahNum, 3)}${pad(verseNum, 3)}.mp3`;
}

export async function fetchQuranAudio({ sqlWriter, dryRun = false, concurrency = 3 }) {
  printHeader('🎵 Téléchargement de l\'audio coranique (EveryAyah.com — Alafasy 128kbps)');

  // Count total verses to process
  const totalVerses = SURAHS.reduce((sum, s) => sum + s.verses_count, 0);
  console.log(`  ${totalVerses} versets × ${SURAHS.length} sourates — ~1.8 Go au total`);
  console.log(`  Concurrence: ${concurrency} | Rate limit: ${RATE_LIMITS.EVERYAYAH}ms\n`);

  const progress = new Progress('Audio Coran', totalVerses);
  const results = { label: 'Audio Coran', total: totalVerses, downloaded: 0, skipped: 0, failed: 0 };

  for (const surah of SURAHS) {
    const surahLabel = `${pad(surah.number, 3)} ${surah.name_fr}`;

    // Build list of verses to process for this surah
    const verseItems = Array.from({ length: surah.verses_count }, (_, i) => i + 1);

    await processInBatches(verseItems, concurrency, async (verseNum) => {
      const filename = getVerseFilename(surah.number, verseNum);
      const destPath = join(AUDIO_DIRS.quran, filename);
      const dbPath = `${DB_PATH_PREFIX.audio.quran}/${filename}`;

      // Skip if already downloaded and valid
      if (!dryRun && existsSync(destPath) && statSync(destPath).size >= MIN_VALID_SIZE.MP3) {
        results.skipped++;
        progress.tick({ skip: true, label: `${surahLabel}:${verseNum}` });
        // Still update DB path if not set
        sqlWriter.addVerseAudioUpdate(surah.number, verseNum, dbPath);
        db.updateVerseAudio(surah.number, verseNum, dbPath);
        return;
      }

      progress.tick({ label: `${surahLabel}:${verseNum}` });

      try {
        const url = buildEveryAyahUrl(surah.number, verseNum);

        await downloadFile(url, destPath, {
          rateLimit: RATE_LIMITS.EVERYAYAH,
          minSize: MIN_VALID_SIZE.MP3,
          dryRun,
          maxRetries: 4,
          baseDelay: 1000,
        });

        sqlWriter.addVerseAudioUpdate(surah.number, verseNum, dbPath);
        db.updateVerseAudio(surah.number, verseNum, dbPath);

        results.downloaded++;
        progress.tick({ success: true, label: `${surahLabel}:${verseNum}` });
      } catch (err) {
        results.failed++;
        progress.tick({ fail: true, label: `${surahLabel}:${verseNum}` });
        // Don't abort — log and continue
        if (results.failed <= 10) {
          console.error(`\n  ✗ Erreur ${filename}: ${err.message}`);
        } else if (results.failed === 11) {
          console.error('\n  ✗ (erreurs supplémentaires masquées...)');
        }
      }
    });
  }

  progress.finish();
  return results;
}
