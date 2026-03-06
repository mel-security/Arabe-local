use rusqlite::{Connection, Result, params};
use std::path::PathBuf;
use log::info;

pub struct DbPath(pub PathBuf);

/// Initialise la base de données SQLite avec le schéma complet
pub fn init_database(db_path: &PathBuf) -> Result<()> {
    let conn = Connection::open(db_path)?;

    // Activer les clés étrangères
    conn.execute_batch("PRAGMA foreign_keys = ON;")?;
    conn.execute_batch("PRAGMA journal_mode = WAL;")?;
    conn.execute_batch("PRAGMA synchronous = NORMAL;")?;

    info!("Initialisation du schéma de la base de données");
    create_schema(&conn)?;
    seed_if_empty(&conn)?;

    info!("Base de données initialisée avec succès");
    Ok(())
}

fn create_schema(conn: &Connection) -> Result<()> {
    conn.execute_batch("
        -- ============================================================
        -- TABLE: users (profil utilisateur)
        -- ============================================================
        CREATE TABLE IF NOT EXISTS users (
            id          INTEGER PRIMARY KEY AUTOINCREMENT,
            name        TEXT NOT NULL DEFAULT 'Étudiant',
            level       TEXT NOT NULL DEFAULT 'beginner' CHECK(level IN ('beginner','intermediate','advanced','expert')),
            language    TEXT NOT NULL DEFAULT 'fr' CHECK(language IN ('fr','en')),
            theme       TEXT NOT NULL DEFAULT 'light' CHECK(theme IN ('light','dark','auto')),
            font_size   INTEGER NOT NULL DEFAULT 3 CHECK(font_size BETWEEN 1 AND 5),
            created_at  TEXT NOT NULL DEFAULT (datetime('now')),
            updated_at  TEXT NOT NULL DEFAULT (datetime('now'))
        );

        -- ============================================================
        -- TABLE: settings (paramètres de l'application)
        -- ============================================================
        CREATE TABLE IF NOT EXISTS settings (
            key         TEXT PRIMARY KEY,
            value       TEXT NOT NULL,
            updated_at  TEXT NOT NULL DEFAULT (datetime('now'))
        );

        -- ============================================================
        -- TABLE: letters (lettres arabes)
        -- ============================================================
        CREATE TABLE IF NOT EXISTS letters (
            id                  INTEGER PRIMARY KEY AUTOINCREMENT,
            order_num           INTEGER NOT NULL UNIQUE,
            arabic              TEXT NOT NULL,
            name_ar             TEXT NOT NULL,
            name_fr             TEXT NOT NULL,
            name_en             TEXT NOT NULL,
            transliteration     TEXT NOT NULL,
            pronunciation_fr    TEXT NOT NULL,
            isolated_form       TEXT NOT NULL,
            initial_form        TEXT NOT NULL,
            medial_form         TEXT NOT NULL,
            final_form          TEXT NOT NULL,
            connects_left       INTEGER NOT NULL DEFAULT 1,
            audio_file          TEXT,
            image_file          TEXT,
            level               TEXT NOT NULL DEFAULT 'beginner',
            description_fr      TEXT,
            description_en      TEXT,
            examples_json       TEXT DEFAULT '[]',
            vowels_json         TEXT DEFAULT '[]',
            youtube_query       TEXT,
            created_at          TEXT NOT NULL DEFAULT (datetime('now'))
        );

        -- ============================================================
        -- TABLE: letter_progress (progression par lettre et utilisateur)
        -- ============================================================
        CREATE TABLE IF NOT EXISTS letter_progress (
            id          INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id     INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
            letter_id   INTEGER NOT NULL REFERENCES letters(id) ON DELETE CASCADE,
            is_learned  INTEGER NOT NULL DEFAULT 0,
            quiz_score  REAL DEFAULT NULL,
            attempts    INTEGER NOT NULL DEFAULT 0,
            last_seen   TEXT,
            UNIQUE(user_id, letter_id)
        );

        -- ============================================================
        -- TABLE: vocabulary_categories (catégories de vocabulaire)
        -- ============================================================
        CREATE TABLE IF NOT EXISTS vocabulary_categories (
            id          INTEGER PRIMARY KEY AUTOINCREMENT,
            slug        TEXT NOT NULL UNIQUE,
            name_fr     TEXT NOT NULL,
            name_en     TEXT NOT NULL,
            icon        TEXT NOT NULL DEFAULT '📚',
            color       TEXT NOT NULL DEFAULT '#22c55e',
            order_num   INTEGER NOT NULL DEFAULT 0
        );

        -- ============================================================
        -- TABLE: vocabulary_words (mots arabes)
        -- ============================================================
        CREATE TABLE IF NOT EXISTS vocabulary_words (
            id                  INTEGER PRIMARY KEY AUTOINCREMENT,
            arabic              TEXT NOT NULL,
            transliteration     TEXT NOT NULL,
            translation_fr      TEXT NOT NULL,
            translation_en      TEXT NOT NULL,
            category_id         INTEGER REFERENCES vocabulary_categories(id),
            level               TEXT NOT NULL DEFAULT 'beginner' CHECK(level IN ('beginner','intermediate','advanced','expert')),
            audio_file          TEXT,
            image_file          TEXT,
            example_ar          TEXT,
            example_fr          TEXT,
            example_en          TEXT,
            gender              TEXT CHECK(gender IN ('m','f','n',NULL)),
            plural_ar           TEXT,
            root_ar             TEXT,
            tags_json           TEXT DEFAULT '[]',
            created_at          TEXT NOT NULL DEFAULT (datetime('now'))
        );

        -- ============================================================
        -- TABLE: word_progress (progression vocabulaire)
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
        -- TABLE: reading_lessons (leçons de lecture)
        -- ============================================================
        CREATE TABLE IF NOT EXISTS reading_lessons (
            id              INTEGER PRIMARY KEY AUTOINCREMENT,
            order_num       INTEGER NOT NULL,
            title_fr        TEXT NOT NULL,
            title_en        TEXT NOT NULL,
            level           TEXT NOT NULL DEFAULT 'beginner',
            type            TEXT NOT NULL DEFAULT 'syllables' CHECK(type IN ('letters','syllables','words','sentences','paragraph')),
            content_json    TEXT NOT NULL DEFAULT '[]',
            exercises_json  TEXT NOT NULL DEFAULT '[]',
            audio_file      TEXT,
            description_fr  TEXT,
            description_en  TEXT,
            created_at      TEXT NOT NULL DEFAULT (datetime('now'))
        );

        -- ============================================================
        -- TABLE: reading_progress (progression lecture)
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
        -- TABLE: surahs (sourates du Coran)
        -- ============================================================
        CREATE TABLE IF NOT EXISTS surahs (
            id              INTEGER PRIMARY KEY,
            number          INTEGER NOT NULL UNIQUE,
            name_ar         TEXT NOT NULL,
            name_fr         TEXT NOT NULL,
            name_en         TEXT NOT NULL,
            transliteration TEXT NOT NULL,
            revelation_type TEXT NOT NULL CHECK(revelation_type IN ('meccan','medinan')),
            verses_count    INTEGER NOT NULL,
            order_revealed  INTEGER,
            audio_file      TEXT,
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
            arabic_text     TEXT NOT NULL,
            translation_fr  TEXT NOT NULL,
            translation_en  TEXT NOT NULL,
            transliteration TEXT,
            audio_file      TEXT,
            juz             INTEGER,
            page            INTEGER,
            UNIQUE(surah_id, verse_number)
        );

        -- ============================================================
        -- TABLE: quran_progress (progression Coran)
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
        -- TABLE: verse_favorites (favoris versets)
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
        -- TABLE: quiz_sessions (sessions de quiz)
        -- ============================================================
        CREATE TABLE IF NOT EXISTS quiz_sessions (
            id          INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id     INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
            module      TEXT NOT NULL CHECK(module IN ('letters','words','reading','quran')),
            score       INTEGER NOT NULL DEFAULT 0,
            total       INTEGER NOT NULL DEFAULT 0,
            duration_s  INTEGER,
            completed   INTEGER NOT NULL DEFAULT 0,
            started_at  TEXT NOT NULL DEFAULT (datetime('now')),
            ended_at    TEXT
        );

        -- ============================================================
        -- TABLE: activity_log (journal d'activité)
        -- ============================================================
        CREATE TABLE IF NOT EXISTS activity_log (
            id          INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id     INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
            module      TEXT NOT NULL,
            action      TEXT NOT NULL,
            item_id     INTEGER,
            metadata    TEXT DEFAULT '{}',
            created_at  TEXT NOT NULL DEFAULT (datetime('now'))
        );

        -- ============================================================
        -- INDEX pour améliorer les performances
        -- ============================================================
        CREATE INDEX IF NOT EXISTS idx_letter_progress_user ON letter_progress(user_id);
        CREATE INDEX IF NOT EXISTS idx_word_progress_user ON word_progress(user_id);
        CREATE INDEX IF NOT EXISTS idx_reading_progress_user ON reading_progress(user_id);
        CREATE INDEX IF NOT EXISTS idx_quran_progress_user ON quran_progress(user_id);
        CREATE INDEX IF NOT EXISTS idx_verses_surah ON verses(surah_id);
        CREATE INDEX IF NOT EXISTS idx_activity_user_date ON activity_log(user_id, created_at);
        CREATE INDEX IF NOT EXISTS idx_words_category ON vocabulary_words(category_id);
        CREATE INDEX IF NOT EXISTS idx_words_level ON vocabulary_words(level);
    ")?;

    Ok(())
}

fn seed_if_empty(conn: &Connection) -> Result<()> {
    // Créer le profil utilisateur par défaut s'il n'existe pas
    let user_count: i64 = conn.query_row(
        "SELECT COUNT(*) FROM users",
        [],
        |row| row.get(0),
    )?;

    if user_count == 0 {
        info!("Création du profil utilisateur par défaut");
        conn.execute(
            "INSERT INTO users (name, level, language, theme, font_size) VALUES (?1, ?2, ?3, ?4, ?5)",
            params!["Étudiant", "beginner", "fr", "light", 3],
        )?;
    }

    // Insérer les catégories de vocabulaire si vides
    let cat_count: i64 = conn.query_row(
        "SELECT COUNT(*) FROM vocabulary_categories",
        [],
        |row| row.get(0),
    )?;

    if cat_count == 0 {
        info!("Insertion des catégories de vocabulaire");
        let categories = vec![
            (1, "greetings",  "Salutations",     "Greetings",     "👋", "#22c55e"),
            (2, "family",     "Famille",          "Family",        "👨‍👩‍👧‍👦", "#3b82f6"),
            (3, "home",       "Maison",           "Home",          "🏠", "#f59e0b"),
            (4, "school",     "École",            "School",        "🎓", "#8b5cf6"),
            (5, "food",       "Nourriture",       "Food",          "🍽️", "#ef4444"),
            (6, "numbers",    "Chiffres",         "Numbers",       "🔢", "#06b6d4"),
            (7, "verbs",      "Verbes fréquents", "Common Verbs",  "✍️", "#ec4899"),
            (8, "religion",   "Religion",         "Religion",      "☪️", "#78716c"),
            (9, "nature",     "Nature",           "Nature",        "🌿", "#10b981"),
            (10, "travel",    "Voyage",           "Travel",        "✈️", "#6366f1"),
        ];

        for (order, slug, name_fr, name_en, icon, color) in categories {
            conn.execute(
                "INSERT INTO vocabulary_categories (order_num, slug, name_fr, name_en, icon, color) VALUES (?1,?2,?3,?4,?5,?6)",
                params![order, slug, name_fr, name_en, icon, color],
            )?;
        }
    }

    Ok(())
}
