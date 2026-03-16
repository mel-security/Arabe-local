#!/usr/bin/env node
// index.js — Arabe Local Data Fetcher CLI
// Usage: node index.js [--all | --letters | --quran | --words] [options]

import { parseArgs } from 'util';
import { existsSync, mkdirSync } from 'fs';
import { resolve } from 'path';
import * as db from './lib/db.js';
import { SqlWriter } from './lib/sql-writer.js';
import { printHeader, printSummary } from './lib/progress.js';
import { AUDIO_DIRS, IMAGE_DIRS, LETTERS, SURAHS } from './lib/config.js';

// ── Argument Parsing ───────────────────────────────────────────────────────

const { values: flags } = parseArgs({
  options: {
    all:         { type: 'boolean', default: false },
    letters:     { type: 'boolean', default: false },
    quran:       { type: 'boolean', default: false },
    words:       { type: 'boolean', default: false },
    db:          { type: 'string'  },
    'dry-run':   { type: 'boolean', default: false },
    concurrency: { type: 'string',  default: '3' },
    verify:      { type: 'boolean', default: false },
    help:        { type: 'boolean', default: false },
  },
  strict: false,
});

const dryRun      = flags['dry-run'];
const concurrency = Math.max(1, parseInt(flags.concurrency, 10) || 3);
const dbPath      = flags.db ? resolve(flags.db) : null;

// ── Help ───────────────────────────────────────────────────────────────────

if (flags.help) {
  console.log(`
Arabe Local — Data Fetcher
Récupère automatiquement les assets audio, images et texte Coran.

Usage:
  node index.js [modules] [options]

Modules (au moins un requis):
  --all        Exécuter tous les modules
  --letters    Audio + images des 28 lettres arabes
  --quran      Texte coranique + audio (6236 versets, ~1.8 Go)
  --words      Audio + images du vocabulaire

Options:
  --db <path>        Chemin vers la DB SQLite Tauri (optionnel)
                     Linux:   ~/.local/share/arabe-local/arabe_local.db
                     Windows: %APPDATA%\\arabe-local\\arabe_local.db
                     macOS:   ~/Library/Application Support/arabe-local/arabe_local.db
  --dry-run          Afficher les actions sans télécharger
  --concurrency <n>  Téléchargements parallèles (défaut: 3, max recommandé: 3)
  --verify           Vérifier l'état des assets sans télécharger
  --help             Afficher cette aide

Exemples:
  node index.js --letters
  node index.js --quran --db ~/.local/share/arabe-local/arabe_local.db
  node index.js --all --dry-run
  node index.js --verify --db ~/.local/share/arabe-local/arabe_local.db
  npm run fetch:letters
  npm run fetch:all

Sources utilisées:
  • Audio lettres/mots: Google TTS (gratuit, sans clé API)
  • Images lettres: Génération SVG locale
  • Texte Coran: api.alquran.cloud (gratuit, sans clé API)
  • Audio Coran: everyayah.com/Alafasy (gratuit, sans clé API)
  • Images mots: Wikimedia Commons (gratuit, sans clé API)
`);
  process.exit(0);
}

// ── Determine which modules to run ────────────────────────────────────────

const run = {
  letters: flags.all || flags.letters,
  quran:   flags.all || flags.quran,
  words:   flags.all || flags.words,
};

if (!flags.verify && !Object.values(run).some(Boolean)) {
  console.error('❌ Aucun module sélectionné. Utilisez --all, --letters, --quran, --words ou --verify.');
  console.error('   Essayez: node index.js --help');
  process.exit(1);
}

// ── Verify Mode ────────────────────────────────────────────────────────────

async function runVerify() {
  printHeader('🔍 Vérification de l\'état des assets');

  if (dbPath) {
    await db.initDb(dbPath);
  }

  const { statSync, readdirSync, existsSync: fExists } = await import('fs');

  function countFiles(dir) {
    if (!fExists(dir)) return 0;
    return readdirSync(dir).filter(f => !f.startsWith('.')).length;
  }

  function fileSize(dir) {
    if (!fExists(dir)) return 0;
    return readdirSync(dir)
      .filter(f => !f.startsWith('.'))
      .reduce((sum, f) => {
        try { return sum + statSync(`${dir}/${f}`).size; } catch { return sum; }
      }, 0);
  }

  const rows = [];

  // Letters
  const letterAudioCount = countFiles(AUDIO_DIRS.letters);
  const letterImageCount = countFiles(IMAGE_DIRS.letters);
  const letterDbAudio = db.isConnected()
    ? db.readLetterAssetStatus().filter(l => l.audio_file).length : '?';
  const letterDbImage = db.isConnected()
    ? db.readLetterAssetStatus().filter(l => l.image_file).length : '?';
  rows.push({
    module: 'Lettres audio', total: 28,
    onDisk: letterAudioCount, inDb: letterDbAudio,
  });
  rows.push({
    module: 'Lettres images', total: 28,
    onDisk: letterImageCount, inDb: letterDbImage,
  });

  // Quran
  const quranAudioCount = countFiles(AUDIO_DIRS.quran);
  const totalVerses = SURAHS.reduce((sum, s) => sum + s.verses_count, 0);
  const quranDbStatus = db.isConnected() ? db.readVerseAudioCount() : null;
  rows.push({
    module: 'Coran audio', total: totalVerses,
    onDisk: quranAudioCount, inDb: quranDbStatus?.withAudio ?? '?',
  });
  rows.push({
    module: 'Coran texte', total: totalVerses,
    onDisk: 'n/a', inDb: quranDbStatus?.total ?? '?',
  });

  // Words
  const wordAudioCount = countFiles(AUDIO_DIRS.words);
  const wordImageCount = countFiles(IMAGE_DIRS.words);
  const wordDbStatus = db.isConnected() ? db.readWordAssetStatus() : [];
  rows.push({
    module: 'Mots audio', total: wordDbStatus.length || '?',
    onDisk: wordAudioCount, inDb: wordDbStatus.filter(w => w.audio_file).length || '?',
  });
  rows.push({
    module: 'Mots images', total: wordDbStatus.length || '?',
    onDisk: wordImageCount, inDb: wordDbStatus.filter(w => w.image_file).length || '?',
  });

  console.log('\n  Module             Total   Sur disque   En DB');
  console.log('  ' + '─'.repeat(48));
  for (const row of rows) {
    const pct = typeof row.total === 'number' && typeof row.onDisk === 'number'
      ? ` (${Math.round((row.onDisk / row.total) * 100)}%)`
      : '';
    console.log(
      `  ${row.module.padEnd(20)}` +
      `${String(row.total).padStart(6)}` +
      `${String(row.onDisk).padStart(12)}${pct.padEnd(6)}` +
      `${String(row.inDb).padStart(7)}`
    );
  }

  // Disk usage
  const totalSize = Object.values(AUDIO_DIRS).reduce((sum, d) => sum + fileSize(d), 0)
    + Object.values(IMAGE_DIRS).reduce((sum, d) => sum + fileSize(d), 0);
  console.log(`\n  Espace disque utilisé: ${(totalSize / 1e6).toFixed(1)} Mo`);

  if (!db.isConnected()) {
    console.log('\n  ℹ Ajoutez --db <path> pour voir l\'état de la DB');
  }
}

// ── Main ──────────────────────────────────────────────────────────────────

async function main() {
  console.log('\n╔═══════════════════════════════════════════════════════╗');
  console.log('║     Arabe Local — Data Fetcher v1.0                   ║');
  console.log('╚═══════════════════════════════════════════════════════╝');

  if (dryRun) console.log('\n  ⚠  MODE DRY-RUN — aucun fichier ne sera écrit\n');

  // Validate DB path
  if (dbPath) {
    if (!existsSync(dbPath)) {
      console.error(`❌ DB introuvable: ${dbPath}`);
      console.error('   Lancez l\'app Tauri une fois pour créer la DB, puis relancez ce script.');
      process.exit(1);
    }
    console.log(`  DB: ${dbPath}`);
    await db.initDb(dbPath);
  } else {
    console.log('  ℹ  Pas de --db fourni: SQL généré uniquement (pas de mise à jour directe de la DB)');
  }

  // Verify mode
  if (flags.verify) {
    await runVerify();
    db.closeDb();
    return;
  }

  // Ensure output directories exist
  const allDirs = [...Object.values(AUDIO_DIRS), ...Object.values(IMAGE_DIRS)];
  for (const dir of allDirs) {
    if (!existsSync(dir)) {
      console.error(`❌ Répertoire manquant: ${dir}`);
      console.error('   Assurez-vous que le projet principal est initialisé (npm install + npm run build).');
      process.exit(1);
    }
  }

  const sqlWriter = new SqlWriter();
  const allResults = [];

  // ── Letters ──
  if (run.letters) {
    const { fetchLettersImages } = await import('./fetchers/letters-images.js');
    const { fetchLettersAudio }  = await import('./fetchers/letters-audio.js');

    const imgResult = await fetchLettersImages({ sqlWriter, dryRun });
    allResults.push(imgResult);

    const audResult = await fetchLettersAudio({ sqlWriter, dryRun, concurrency });
    allResults.push(audResult);
  }

  // ── Quran ──
  if (run.quran) {
    const { fetchQuranText }  = await import('./fetchers/quran-text.js');
    const { fetchQuranAudio } = await import('./fetchers/quran-audio.js');

    const textResult = await fetchQuranText({ sqlWriter, dryRun });
    allResults.push(textResult);

    const audioResult = await fetchQuranAudio({ sqlWriter, dryRun, concurrency });
    allResults.push(audioResult);
  }

  // ── Words ──
  if (run.words) {
    const { fetchWordsAudio }  = await import('./fetchers/words-audio.js');
    const { fetchWordsImages } = await import('./fetchers/words-images.js');

    const audioResult = await fetchWordsAudio({ sqlWriter, dryRun });
    allResults.push(audioResult);

    const imgResult = await fetchWordsImages({ sqlWriter, dryRun });
    allResults.push(imgResult);
  }

  // ── Write SQL output ──
  if (!dryRun && sqlWriter.totalStatements() > 0) {
    const sqlFile = sqlWriter.flush();
    console.log(`\n  📄 SQL généré: ${sqlFile}`);
    console.log(`     ${sqlWriter.totalStatements()} instructions SQL`);
    console.log('\n  Pour appliquer manuellement:');
    console.log(`     sqlite3 <chemin-db> < ${sqlFile}`);
  } else if (dryRun) {
    console.log('\n  [DRY-RUN] SQL non écrit');
  }

  // ── Summary ──
  if (allResults.length > 0) {
    printSummary(allResults);
  }

  db.closeDb();

  console.log('\n  ✅ Terminé!\n');
}

main().catch(err => {
  console.error('\n❌ Erreur fatale:', err.message);
  if (process.env.DEBUG) console.error(err.stack);
  db.closeDb();
  process.exit(1);
});
