// words-images.js — Fetches word images from Wikimedia Commons
// Falls back gracefully for abstract words (verbs, greetings, etc.)
import { existsSync, statSync, writeFileSync, appendFileSync } from 'fs';
import { join, resolve, dirname } from 'path';
import { fileURLToPath } from 'url';
import { IMAGE_DIRS, DB_PATH_PREFIX, API, RATE_LIMITS, MIN_VALID_SIZE } from '../lib/config.js';
import { fetchJSON, downloadFile } from '../lib/http.js';
import { Progress, printHeader } from '../lib/progress.js';
import * as db from '../lib/db.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const NO_IMAGE_LOG = resolve(__dirname, '../output/words-no-image.txt');

function slugify(str) {
  if (!str) return 'word';
  return str.toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_|_$/g, '').slice(0, 30);
}

/**
 * Query Wikimedia Commons for a thumbnail image of a concept.
 * Returns { url, ext } or null if not found.
 */
async function findWikimediaImage(searchTerm, dryRun) {
  const params = new URLSearchParams({
    action: 'query',
    titles: searchTerm,
    prop: 'pageimages',
    pithumbsize: '400',
    format: 'json',
    origin: '*',
  });

  const url = `${API.WIKIMEDIA_API}?${params.toString()}`;
  const data = await fetchJSON(url, {
    rateLimit: RATE_LIMITS.WIKIMEDIA,
    dryRun,
  });

  if (!data || dryRun) return null;

  const pages = data?.query?.pages;
  if (!pages) return null;

  for (const page of Object.values(pages)) {
    if (page.missing !== undefined) continue;
    if (!page.thumbnail?.source) continue;

    const src = page.thumbnail.source;
    const extMatch = src.match(/\.(\w+)(?:\?|$)/);
    const ext = extMatch ? extMatch[1].toLowerCase() : 'jpg';

    return { url: src, ext };
  }

  return null;
}

export async function fetchWordsImages({ sqlWriter, dryRun = false }) {
  printHeader('🖼  Téléchargement des images de mots (Wikimedia Commons)');

  const words = db.readWords();

  if (words.length === 0) {
    console.log('  ℹ Aucun mot trouvé dans la DB. Ignoré.');
    return { label: 'Images mots', total: 0, downloaded: 0, skipped: 0, failed: 0 };
  }

  console.log(`  ${words.length} mots | Taux de succès attendu: ~60-70% (mots concrets)`);
  console.log(`  Les mots sans image sont loggés dans output/words-no-image.txt\n`);

  const progress = new Progress('Mots images', words.length);
  const results = { label: 'Images mots', total: words.length, downloaded: 0, skipped: 0, failed: 0 };
  const noImageWords = [];

  for (const word of words) {
    const searchTerm = word.translation_en || word.translation_fr;
    const translitSlug = slugify(word.transliteration || word.translation_fr);

    progress.tick({ label: word.translation_fr });

    // Check if any existing image file matches this word's ID
    const existingFiles = ['jpg', 'jpeg', 'png', 'webp'].map(ext =>
      join(IMAGE_DIRS.words, `${word.id}_${translitSlug}.${ext}`)
    );
    const existing = existingFiles.find(f => existsSync(f) && statSync(f).size >= MIN_VALID_SIZE.IMAGE);

    if (existing) {
      const dbPath = `${DB_PATH_PREFIX.images.words}/${existing.split('/').pop()}`;
      results.skipped++;
      progress.tick({ skip: true, label: word.translation_fr });
      sqlWriter.addWordUpdate(word.id, undefined, dbPath);
      db.updateWordImage(word.id, dbPath);
      continue;
    }

    try {
      const imageInfo = await findWikimediaImage(searchTerm, dryRun);

      if (!imageInfo) {
        noImageWords.push(`${word.id}\t${word.arabic}\t${word.translation_fr}\t${word.translation_en}`);
        results.failed++;
        progress.tick({ fail: true, label: word.translation_fr });
        continue;
      }

      const filename = `${word.id}_${translitSlug}.${imageInfo.ext}`;
      const destPath = join(IMAGE_DIRS.words, filename);
      const dbPath = `${DB_PATH_PREFIX.images.words}/${filename}`;

      await downloadFile(imageInfo.url, destPath, {
        minSize: MIN_VALID_SIZE.IMAGE,
        dryRun,
      });

      sqlWriter.addWordUpdate(word.id, undefined, dbPath);
      db.updateWordImage(word.id, dbPath);

      results.downloaded++;
      progress.tick({ success: true, label: word.translation_fr });
    } catch (err) {
      noImageWords.push(`${word.id}\t${word.arabic}\t${word.translation_fr}\t(erreur: ${err.message})`);
      results.failed++;
      progress.tick({ fail: true, label: word.translation_fr });
    }
  }

  progress.finish();

  // Write no-image log
  if (noImageWords.length > 0 && !dryRun) {
    const header = `# Mots sans image — ${new Date().toISOString()}\n# id\tarabic\tfr\ten\n`;
    try {
      appendFileSync(NO_IMAGE_LOG, header + noImageWords.join('\n') + '\n');
      console.log(`  ℹ ${noImageWords.length} mots sans image → output/words-no-image.txt`);
    } catch { /* ignore */ }
  }

  return results;
}
