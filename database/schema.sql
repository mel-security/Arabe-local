-- ============================================================
-- ARABE LOCAL — Schéma complet de la base de données SQLite
-- Version: 1.0.0
-- ============================================================

PRAGMA foreign_keys = ON;
PRAGMA journal_mode = WAL;
PRAGMA synchronous = NORMAL;

-- ============================================================
-- TABLE: users (profil utilisateur local)
-- ============================================================
-- Un seul profil en local (id = 1), extensible en multi-utilisateurs
CREATE TABLE IF NOT EXISTS users (
    id          INTEGER PRIMARY KEY AUTOINCREMENT,
    name        TEXT NOT NULL DEFAULT 'Étudiant',
    level       TEXT NOT NULL DEFAULT 'beginner'
                CHECK(level IN ('beginner','intermediate','advanced','expert')),
    language    TEXT NOT NULL DEFAULT 'fr'
                CHECK(language IN ('fr','en')),
    theme       TEXT NOT NULL DEFAULT 'light'
                CHECK(theme IN ('light','dark','auto')),
    font_size   INTEGER NOT NULL DEFAULT 3
                CHECK(font_size BETWEEN 1 AND 5),
    created_at  TEXT NOT NULL DEFAULT (datetime('now')),
    updated_at  TEXT NOT NULL DEFAULT (datetime('now'))
);

-- ============================================================
-- TABLE: settings (paires clé-valeur de configuration)
-- ============================================================
CREATE TABLE IF NOT EXISTS settings (
    key         TEXT PRIMARY KEY,
    value       TEXT NOT NULL,
    updated_at  TEXT NOT NULL DEFAULT (datetime('now'))
);

-- ============================================================
-- TABLE: letters (les 28 lettres de l'alphabet arabe)
-- ============================================================
CREATE TABLE IF NOT EXISTS letters (
    id                  INTEGER PRIMARY KEY AUTOINCREMENT,
    order_num           INTEGER NOT NULL UNIQUE,  -- 1 à 28
    arabic              TEXT NOT NULL,            -- forme de base
    name_ar             TEXT NOT NULL,            -- nom en arabe
    name_fr             TEXT NOT NULL,            -- nom en français
    name_en             TEXT NOT NULL,            -- nom en anglais
    transliteration     TEXT NOT NULL,            -- notation phonétique
    pronunciation_fr    TEXT NOT NULL,            -- description prononciation
    isolated_form       TEXT NOT NULL,            -- ا
    initial_form        TEXT NOT NULL,            -- بـ
    medial_form         TEXT NOT NULL,            -- ـبـ
    final_form          TEXT NOT NULL,            -- ـب
    connects_left       INTEGER NOT NULL DEFAULT 1, -- se connecte à gauche (0/1)
    audio_file          TEXT,                     -- chemin relatif : audio/letters/ba.mp3
    image_file          TEXT,                     -- chemin relatif : images/letters/ba.png
    level               TEXT NOT NULL DEFAULT 'beginner',
    description_fr      TEXT,
    description_en      TEXT,
    examples_json       TEXT DEFAULT '[]',        -- JSON: LetterExample[]
    vowels_json         TEXT DEFAULT '[]',        -- JSON: LetterVowel[]
    youtube_query       TEXT,                     -- terme de recherche YouTube
    created_at          TEXT NOT NULL DEFAULT (datetime('now'))
);

-- ============================================================
-- TABLE: letter_progress (progression de l'utilisateur par lettre)
-- ============================================================
CREATE TABLE IF NOT EXISTS letter_progress (
    id          INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id     INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    letter_id   INTEGER NOT NULL REFERENCES letters(id) ON DELETE CASCADE,
    is_learned  INTEGER NOT NULL DEFAULT 0,  -- 0/1
    quiz_score  REAL DEFAULT NULL,           -- 0.0 à 100.0
    attempts    INTEGER NOT NULL DEFAULT 0,
    last_seen   TEXT,
    UNIQUE(user_id, letter_id)
);

-- ============================================================
-- TABLE: vocabulary_categories (catégories de vocabulaire)
-- ============================================================
CREATE TABLE IF NOT EXISTS vocabulary_categories (
    id          INTEGER PRIMARY KEY AUTOINCREMENT,
    slug        TEXT NOT NULL UNIQUE,   -- "greetings", "family", etc.
    name_fr     TEXT NOT NULL,
    name_en     TEXT NOT NULL,
    icon        TEXT NOT NULL DEFAULT '📚',
    color       TEXT NOT NULL DEFAULT '#22c55e',  -- couleur hex
    order_num   INTEGER NOT NULL DEFAULT 0
);

-- ============================================================
-- TABLE: vocabulary_words (mots arabes par catégories)
-- ============================================================
CREATE TABLE IF NOT EXISTS vocabulary_words (
    id                  INTEGER PRIMARY KEY AUTOINCREMENT,
    arabic              TEXT NOT NULL,
    transliteration     TEXT NOT NULL,
    translation_fr      TEXT NOT NULL,
    translation_en      TEXT NOT NULL,
    category_id         INTEGER REFERENCES vocabulary_categories(id),
    level               TEXT NOT NULL DEFAULT 'beginner'
                        CHECK(level IN ('beginner','intermediate','advanced','expert')),
    audio_file          TEXT,
    image_file          TEXT,
    example_ar          TEXT,       -- phrase exemple en arabe
    example_fr          TEXT,       -- traduction française
    example_en          TEXT,       -- traduction anglaise
    gender              TEXT CHECK(gender IN ('m','f','n',NULL)),
    plural_ar           TEXT,       -- forme plurielle
    root_ar             TEXT,       -- racine trilitère
    tags_json           TEXT DEFAULT '[]',
    created_at          TEXT NOT NULL DEFAULT (datetime('now'))
);

-- ============================================================
-- TABLE: word_progress
-- ============================================================
CREATE TABLE IF NOT EXISTS word_progress (
    id              INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id         INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    word_id         INTEGER NOT NULL REFERENCES vocabulary_words(id) ON DELETE CASCADE,
    is_learned      INTEGER NOT NULL DEFAULT 0,
    is_favorite     INTEGER NOT NULL DEFAULT 0,
    quiz_score      REAL DEFAULT NULL,
    attempts        INTEGER NOT NULL DEFAULT 0,
    last_seen       TEXT,
    UNIQUE(user_id, word_id)
);

-- ============================================================
-- TABLE: reading_lessons (leçons de lecture progressive)
-- ============================================================
CREATE TABLE IF NOT EXISTS reading_lessons (
    id              INTEGER PRIMARY KEY AUTOINCREMENT,
    order_num       INTEGER NOT NULL,
    title_fr        TEXT NOT NULL,
    title_en        TEXT NOT NULL,
    level           TEXT NOT NULL DEFAULT 'beginner',
    type            TEXT NOT NULL DEFAULT 'syllables'
                    CHECK(type IN ('letters','syllables','words','sentences','paragraph')),
    -- JSON: ContentItem[] { arabic, transliteration, translation_fr, audio_file, item_type }
    content_json    TEXT NOT NULL DEFAULT '[]',
    -- JSON: Exercise[] { exercise_type, question, arabic, options[], correct_answer }
    exercises_json  TEXT NOT NULL DEFAULT '[]',
    audio_file      TEXT,
    description_fr  TEXT,
    description_en  TEXT,
    created_at      TEXT NOT NULL DEFAULT (datetime('now'))
);

-- ============================================================
-- TABLE: reading_progress
-- ============================================================
CREATE TABLE IF NOT EXISTS reading_progress (
    id              INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id         INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    lesson_id       INTEGER NOT NULL REFERENCES reading_lessons(id) ON DELETE CASCADE,
    is_completed    INTEGER NOT NULL DEFAULT 0,
    quiz_score      REAL DEFAULT NULL,
    attempts        INTEGER NOT NULL DEFAULT 0,
    completed_at    TEXT,
    UNIQUE(user_id, lesson_id)
);

-- ============================================================
-- TABLE: surahs (sourates du Coran — 114 entrées)
-- ============================================================
CREATE TABLE IF NOT EXISTS surahs (
    id              INTEGER PRIMARY KEY,  -- même que le numéro
    number          INTEGER NOT NULL UNIQUE,  -- 1 à 114
    name_ar         TEXT NOT NULL,        -- nom en arabe avec voyelles
    name_fr         TEXT NOT NULL,        -- nom français (avec translittération)
    name_en         TEXT NOT NULL,
    transliteration TEXT NOT NULL,        -- Al-Fātiḥa, Al-Baqara...
    revelation_type TEXT NOT NULL CHECK(revelation_type IN ('meccan','medinan')),
    verses_count    INTEGER NOT NULL,
    order_revealed  INTEGER,              -- ordre de révélation
    audio_file      TEXT,                 -- chemin local : audio/quran/001.mp3
    description_fr  TEXT,
    description_en  TEXT
);

-- ============================================================
-- TABLE: verses (versets du Coran)
-- ============================================================
CREATE TABLE IF NOT EXISTS verses (
    id              INTEGER PRIMARY KEY AUTOINCREMENT,
    surah_id        INTEGER NOT NULL REFERENCES surahs(id) ON DELETE CASCADE,
    verse_number    INTEGER NOT NULL,
    arabic_text     TEXT NOT NULL,        -- texte avec voyelles (harakāt)
    translation_fr  TEXT NOT NULL,
    translation_en  TEXT NOT NULL,
    transliteration TEXT,                 -- phonétique latine
    audio_file      TEXT,                 -- audio/quran/001_001.mp3
    juz             INTEGER,              -- numéro du juz (1-30)
    page            INTEGER,              -- numéro de page (Médine)
    UNIQUE(surah_id, verse_number)
);

-- ============================================================
-- TABLE: quran_progress (progression par sourate)
-- ============================================================
CREATE TABLE IF NOT EXISTS quran_progress (
    id              INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id         INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    surah_id        INTEGER NOT NULL REFERENCES surahs(id) ON DELETE CASCADE,
    last_verse      INTEGER NOT NULL DEFAULT 1,
    is_completed    INTEGER NOT NULL DEFAULT 0,
    completed_at    TEXT,
    updated_at      TEXT NOT NULL DEFAULT (datetime('now')),
    UNIQUE(user_id, surah_id)
);

-- ============================================================
-- TABLE: verse_favorites
-- ============================================================
CREATE TABLE IF NOT EXISTS verse_favorites (
    id          INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id     INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    verse_id    INTEGER NOT NULL REFERENCES verses(id) ON DELETE CASCADE,
    note        TEXT,
    created_at  TEXT NOT NULL DEFAULT (datetime('now')),
    UNIQUE(user_id, verse_id)
);

-- ============================================================
-- TABLE: quiz_sessions (historique des sessions de quiz)
-- ============================================================
CREATE TABLE IF NOT EXISTS quiz_sessions (
    id          INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id     INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    module      TEXT NOT NULL CHECK(module IN ('letters','words','reading','quran')),
    score       INTEGER NOT NULL DEFAULT 0,
    total       INTEGER NOT NULL DEFAULT 0,
    duration_s  INTEGER,                  -- durée en secondes
    completed   INTEGER NOT NULL DEFAULT 0,
    started_at  TEXT NOT NULL DEFAULT (datetime('now')),
    ended_at    TEXT
);

-- ============================================================
-- TABLE: activity_log (journal d'activité pour les streaks et stats)
-- ============================================================
CREATE TABLE IF NOT EXISTS activity_log (
    id          INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id     INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    module      TEXT NOT NULL,
    action      TEXT NOT NULL,            -- "mark_learned", "quiz_answer", "complete_lesson"...
    item_id     INTEGER,
    metadata    TEXT DEFAULT '{}',        -- JSON avec infos supplémentaires
    created_at  TEXT NOT NULL DEFAULT (datetime('now'))
);

-- ============================================================
-- INDEX pour optimiser les performances
-- ============================================================
CREATE INDEX IF NOT EXISTS idx_letter_progress_user     ON letter_progress(user_id);
CREATE INDEX IF NOT EXISTS idx_letter_progress_letter   ON letter_progress(letter_id);
CREATE INDEX IF NOT EXISTS idx_word_progress_user       ON word_progress(user_id);
CREATE INDEX IF NOT EXISTS idx_word_progress_word       ON word_progress(word_id);
CREATE INDEX IF NOT EXISTS idx_reading_progress_user    ON reading_progress(user_id);
CREATE INDEX IF NOT EXISTS idx_quran_progress_user      ON quran_progress(user_id);
CREATE INDEX IF NOT EXISTS idx_verses_surah             ON verses(surah_id);
CREATE INDEX IF NOT EXISTS idx_verses_surah_number      ON verses(surah_id, verse_number);
CREATE INDEX IF NOT EXISTS idx_activity_user_date       ON activity_log(user_id, created_at);
CREATE INDEX IF NOT EXISTS idx_words_category           ON vocabulary_words(category_id);
CREATE INDEX IF NOT EXISTS idx_words_level              ON vocabulary_words(level);
CREATE INDEX IF NOT EXISTS idx_letters_order            ON letters(order_num);
