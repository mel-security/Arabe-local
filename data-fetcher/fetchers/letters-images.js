// letters-images.js — Generates SVG files for each Arabic letter (no HTTP)
import { writeFileSync, existsSync, statSync } from 'fs';
import { join } from 'path';
import { LETTERS, IMAGE_DIRS, DB_PATH_PREFIX, MIN_VALID_SIZE } from '../lib/config.js';
import { Progress, printHeader } from '../lib/progress.js';
import * as db from '../lib/db.js';

/**
 * Generate a styled SVG for a single Arabic letter.
 * The letter is centered with a decorative circular background.
 */
function generateLetterSVG(letter) {
  const { arabic, nameFr, slug } = letter;
  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200" width="200" height="200">
  <!-- Background circle -->
  <circle cx="100" cy="100" r="95" fill="#f0f4f8" stroke="#c4d1e0" stroke-width="2"/>
  <!-- Decorative inner ring -->
  <circle cx="100" cy="100" r="85" fill="none" stroke="#d4a843" stroke-width="1.5" opacity="0.6"/>
  <!-- Arabic letter -->
  <text
    x="100"
    y="118"
    text-anchor="middle"
    dominant-baseline="middle"
    font-family="'Noto Naskh Arabic', 'Amiri', 'Traditional Arabic', serif"
    font-size="88"
    fill="#1a3a5c"
    direction="rtl"
  >${arabic}</text>
  <!-- Letter name (Latin) -->
  <text
    x="100"
    y="175"
    text-anchor="middle"
    font-family="'Segoe UI', Arial, sans-serif"
    font-size="13"
    fill="#4a6a8a"
    letter-spacing="1"
  >${nameFr.toUpperCase()}</text>
  <!-- Decorative dots -->
  <circle cx="30" cy="100" r="3" fill="#d4a843" opacity="0.5"/>
  <circle cx="170" cy="100" r="3" fill="#d4a843" opacity="0.5"/>
</svg>`;
}

export async function fetchLettersImages({ sqlWriter, dryRun = false }) {
  printHeader('🖼  Génération des images SVG des lettres');

  const progress = new Progress('Lettres SVG', LETTERS.length);
  const results = { label: 'Images lettres', total: LETTERS.length, downloaded: 0, skipped: 0, failed: 0 };

  for (const letter of LETTERS) {
    const filename = `${letter.slug}.svg`;
    const destPath = join(IMAGE_DIRS.letters, filename);
    const dbPath = `${DB_PATH_PREFIX.images.letters}/${filename}`;

    progress.tick({ label: letter.nameFr });

    // Skip if already exists and is valid
    if (existsSync(destPath) && statSync(destPath).size > MIN_VALID_SIZE.IMAGE) {
      results.skipped++;
      progress.tick({ skip: true, label: letter.nameFr });
      continue;
    }

    try {
      if (!dryRun) {
        const svg = generateLetterSVG(letter);
        writeFileSync(destPath, svg, 'utf8');

        // Update DB directly if connected
        db.updateLetterImage(letter.id, dbPath);
      } else {
        console.log(`[DRY-RUN] GENERATE ${destPath}`);
      }

      // Record SQL update
      sqlWriter.addLetterUpdate(letter.id, undefined, dbPath);

      results.downloaded++;
      progress.tick({ success: true, label: letter.nameFr });
    } catch (err) {
      results.failed++;
      progress.tick({ fail: true, label: letter.nameFr });
      console.error(`\n  ✗ Erreur SVG ${letter.nameFr}: ${err.message}`);
    }
  }

  progress.finish();
  return results;
}
