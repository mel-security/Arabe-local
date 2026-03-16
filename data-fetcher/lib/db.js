// db.js — SQLite access via better-sqlite3 (synchronous)
// Falls back to config-only mode if --db not provided

let Database = null;
let db = null;

/**
 * Initialize the DB connection. Call once with the path, or omit for read-only config mode.
 */
export async function initDb(dbPath) {
  if (!dbPath) return; // config-only mode
  const mod = await import('better-sqlite3');
  Database = mod.default;
  db = new Database(dbPath, { verbose: null });
  db.pragma('journal_mode = WAL');
  db.pragma('foreign_keys = ON');
}

export function isConnected() {
  return db !== null;
}

// ── READ ──────────────────────────────────────────────────────────────────

export function readLetters() {
  if (!db) return [];
  return db.prepare(
    'SELECT id, arabic, name_fr, transliteration, audio_file, image_file FROM letters ORDER BY order_num'
  ).all();
}

export function readWords() {
  if (!db) return [];
  return db.prepare(
    'SELECT id, arabic, transliteration, translation_fr, translation_en, audio_file, image_file FROM vocabulary_words ORDER BY id'
  ).all();
}

export function readSurahs() {
  if (!db) return [];
  return db.prepare('SELECT id, number, verses_count FROM surahs ORDER BY number').all();
}

export function readVerseCount(surahId) {
  if (!db) return 0;
  const row = db.prepare('SELECT COUNT(*) as cnt FROM verses WHERE surah_id = ?').get(surahId);
  return row?.cnt ?? 0;
}

export function readVerseAudioCount() {
  if (!db) return { total: 0, withAudio: 0 };
  const total = db.prepare('SELECT COUNT(*) as cnt FROM verses').get().cnt;
  const withAudio = db.prepare('SELECT COUNT(*) as cnt FROM verses WHERE audio_file IS NOT NULL').get().cnt;
  return { total, withAudio };
}

export function readLetterAssetStatus() {
  if (!db) return [];
  return db.prepare(
    'SELECT id, name_fr, audio_file, image_file FROM letters ORDER BY order_num'
  ).all();
}

export function readWordAssetStatus() {
  if (!db) return [];
  return db.prepare(
    'SELECT id, arabic, translation_fr, audio_file, image_file FROM vocabulary_words ORDER BY id'
  ).all();
}

// ── WRITE ─────────────────────────────────────────────────────────────────

export function updateLetterAssets(id, audioPath, imagePath) {
  if (!db) return;
  db.prepare(
    'UPDATE letters SET audio_file = ?, image_file = ? WHERE id = ?'
  ).run(audioPath, imagePath, id);
}

export function updateLetterAudio(id, audioPath) {
  if (!db) return;
  db.prepare('UPDATE letters SET audio_file = ? WHERE id = ?').run(audioPath, id);
}

export function updateLetterImage(id, imagePath) {
  if (!db) return;
  db.prepare('UPDATE letters SET image_file = ? WHERE id = ?').run(imagePath, id);
}

export function updateWordAudio(id, audioPath) {
  if (!db) return;
  db.prepare('UPDATE vocabulary_words SET audio_file = ? WHERE id = ?').run(audioPath, id);
}

export function updateWordImage(id, imagePath) {
  if (!db) return;
  db.prepare('UPDATE vocabulary_words SET image_file = ? WHERE id = ?').run(imagePath, id);
}

export function upsertSurah(surah) {
  if (!db) return;
  db.prepare(`
    INSERT OR IGNORE INTO surahs
      (id, number, name_ar, name_fr, name_en, transliteration, revelation_type, verses_count, order_revealed)
    VALUES
      (@number, @number, @name_ar, @name_fr, @name_en, @transliteration, @revelation_type, @verses_count, @order_revealed)
  `).run(surah);
}

export function upsertVerse(verse) {
  if (!db) return;
  db.prepare(`
    INSERT OR IGNORE INTO verses
      (surah_id, verse_number, arabic_text, translation_fr, translation_en, transliteration, audio_file, juz, page)
    VALUES
      (@surah_id, @verse_number, @arabic_text, @translation_fr, @translation_en, @transliteration, @audio_file, @juz, @page)
  `).run(verse);
}

export function updateVerseAudio(surahId, verseNumber, audioPath) {
  if (!db) return;
  db.prepare(
    'UPDATE verses SET audio_file = ? WHERE surah_id = ? AND verse_number = ?'
  ).run(audioPath, surahId, verseNumber);
}

/**
 * Execute a raw SQL string (used to apply the generated updates.sql).
 */
export function applySQL(sql) {
  if (!db) throw new Error('No DB connection. Provide --db path.');
  db.exec(sql);
}

export function closeDb() {
  if (db) {
    db.close();
    db = null;
  }
}
