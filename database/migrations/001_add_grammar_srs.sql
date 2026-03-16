-- ============================================================
-- Migration 001: Ajout des tables grammaire et SRS
-- ============================================================

-- Table de versionnement des migrations
CREATE TABLE IF NOT EXISTS schema_migrations (
    version     INTEGER PRIMARY KEY,
    name        TEXT NOT NULL,
    applied_at  TEXT NOT NULL DEFAULT (datetime('now'))
);

-- ============================================================
-- TABLE: grammar_categories (catégories de règles grammaticales)
-- ============================================================
CREATE TABLE IF NOT EXISTS grammar_categories (
    id          INTEGER PRIMARY KEY AUTOINCREMENT,
    slug        TEXT NOT NULL UNIQUE,
    name_fr     TEXT NOT NULL,
    name_en     TEXT NOT NULL,
    icon        TEXT NOT NULL DEFAULT '📖',
    order_num   INTEGER NOT NULL DEFAULT 0,
    description_fr TEXT,
    description_en TEXT
);

-- ============================================================
-- TABLE: grammar_rules (règles grammaticales)
-- ============================================================
CREATE TABLE IF NOT EXISTS grammar_rules (
    id              INTEGER PRIMARY KEY AUTOINCREMENT,
    category_id     INTEGER NOT NULL REFERENCES grammar_categories(id) ON DELETE CASCADE,
    order_num       INTEGER NOT NULL DEFAULT 0,
    title_fr        TEXT NOT NULL,
    title_en        TEXT NOT NULL,
    level           TEXT NOT NULL DEFAULT 'beginner'
                    CHECK(level IN ('beginner','intermediate','advanced','expert')),
    -- JSON: { explanation_fr, explanation_en, examples: [{arabic, transliteration, translation_fr, translation_en}] }
    content_json    TEXT NOT NULL DEFAULT '{}',
    -- JSON: Exercise[] pour cette règle
    exercises_json  TEXT NOT NULL DEFAULT '[]',
    created_at      TEXT NOT NULL DEFAULT (datetime('now'))
);

-- ============================================================
-- TABLE: grammar_progress (progression utilisateur par règle)
-- ============================================================
CREATE TABLE IF NOT EXISTS grammar_progress (
    id              INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id         INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    rule_id         INTEGER NOT NULL REFERENCES grammar_rules(id) ON DELETE CASCADE,
    is_learned      INTEGER NOT NULL DEFAULT 0,
    quiz_score      REAL DEFAULT NULL,
    attempts        INTEGER NOT NULL DEFAULT 0,
    last_seen       TEXT,
    UNIQUE(user_id, rule_id)
);

-- ============================================================
-- TABLE: srs_cards (cartes de répétition espacée)
-- ============================================================
CREATE TABLE IF NOT EXISTS srs_cards (
    id              INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id         INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    -- Type de contenu: letter, word, grammar_rule
    card_type       TEXT NOT NULL CHECK(card_type IN ('letter','word','grammar_rule')),
    -- ID de l'élément dans la table source
    item_id         INTEGER NOT NULL,
    -- Contenu de la carte (face avant / arrière)
    front           TEXT NOT NULL,
    back            TEXT NOT NULL,
    -- Paramètres SM-2
    easiness_factor REAL NOT NULL DEFAULT 2.5,
    interval_days   INTEGER NOT NULL DEFAULT 1,
    repetitions     INTEGER NOT NULL DEFAULT 0,
    -- Date de la prochaine révision
    next_review     TEXT NOT NULL DEFAULT (date('now')),
    last_review     TEXT,
    created_at      TEXT NOT NULL DEFAULT (datetime('now')),
    UNIQUE(user_id, card_type, item_id)
);

-- ============================================================
-- TABLE: srs_reviews (historique des révisions)
-- ============================================================
CREATE TABLE IF NOT EXISTS srs_reviews (
    id              INTEGER PRIMARY KEY AUTOINCREMENT,
    card_id         INTEGER NOT NULL REFERENCES srs_cards(id) ON DELETE CASCADE,
    quality         INTEGER NOT NULL CHECK(quality BETWEEN 0 AND 5),
    -- Copie des paramètres au moment de la révision
    easiness_factor REAL NOT NULL,
    interval_days   INTEGER NOT NULL,
    reviewed_at     TEXT NOT NULL DEFAULT (datetime('now'))
);

-- ============================================================
-- INDEX
-- ============================================================
CREATE INDEX IF NOT EXISTS idx_grammar_rules_category ON grammar_rules(category_id);
CREATE INDEX IF NOT EXISTS idx_grammar_rules_level ON grammar_rules(level);
CREATE INDEX IF NOT EXISTS idx_grammar_progress_user ON grammar_progress(user_id);
CREATE INDEX IF NOT EXISTS idx_srs_cards_user ON srs_cards(user_id);
CREATE INDEX IF NOT EXISTS idx_srs_cards_next_review ON srs_cards(user_id, next_review);
CREATE INDEX IF NOT EXISTS idx_srs_reviews_card ON srs_reviews(card_id);

-- ============================================================
-- SEED: Catégories grammaticales de base
-- ============================================================
INSERT OR IGNORE INTO grammar_categories (slug, name_fr, name_en, icon, order_num, description_fr, description_en) VALUES
    ('pronouns', 'Pronoms personnels', 'Personal Pronouns', '👤', 1,
     'Les pronoms personnels en arabe selon le genre et le nombre.',
     'Arabic personal pronouns by gender and number.'),
    ('articles', 'Article défini', 'Definite Article', '📝', 2,
     'L''article défini « ال » (al-) et les lettres solaires/lunaires.',
     'The definite article "al-" and sun/moon letters.'),
    ('gender_number', 'Genre et nombre', 'Gender and Number', '🔤', 3,
     'Le masculin, le féminin, le singulier, le duel et le pluriel.',
     'Masculine, feminine, singular, dual and plural.'),
    ('verb_basics', 'Verbes — bases', 'Verbs — basics', '📚', 4,
     'Le verbe arabe au présent (mudari'') et au passé (madi).',
     'Arabic verb in present (mudari'') and past (madi) tenses.'),
    ('sentence_structure', 'Structure de phrase', 'Sentence Structure', '🏗️', 5,
     'La phrase nominale et la phrase verbale en arabe.',
     'Nominal and verbal sentences in Arabic.'),
    ('prepositions', 'Prépositions', 'Prepositions', '📍', 6,
     'Les prépositions courantes et leur usage.',
     'Common prepositions and their usage.');

-- ============================================================
-- SEED: Règles grammaticales de base
-- ============================================================

-- Pronoms personnels
INSERT OR IGNORE INTO grammar_rules (category_id, order_num, title_fr, title_en, level, content_json, exercises_json) VALUES
    ((SELECT id FROM grammar_categories WHERE slug='pronouns'), 1,
     'Pronoms personnels singuliers', 'Singular Personal Pronouns', 'beginner',
     '{"explanation_fr":"En arabe, les pronoms personnels changent selon le genre (masculin/féminin) et le nombre (singulier/duel/pluriel). Voici les pronoms singuliers :",
       "explanation_en":"In Arabic, personal pronouns change by gender and number. Here are the singular pronouns:",
       "examples":[
         {"arabic":"أَنَا","transliteration":"anā","translation_fr":"je / moi","translation_en":"I / me"},
         {"arabic":"أَنْتَ","transliteration":"anta","translation_fr":"tu / toi (masculin)","translation_en":"you (masculine)"},
         {"arabic":"أَنْتِ","transliteration":"anti","translation_fr":"tu / toi (féminin)","translation_en":"you (feminine)"},
         {"arabic":"هُوَ","transliteration":"huwa","translation_fr":"il / lui","translation_en":"he / him"},
         {"arabic":"هِيَ","transliteration":"hiya","translation_fr":"elle","translation_en":"she / her"}
       ]}',
     '[{"exercise_type":"match","question":"Associez le pronom à sa traduction","options":["أَنَا = je","أَنْتَ = tu (m.)","هُوَ = il","هِيَ = elle"],"correct_answer":"all"},
       {"exercise_type":"identify","question":"Quel pronom signifie « tu » au féminin ?","arabic":"","options":["أَنَا","أَنْتَ","أَنْتِ","هُوَ"],"correct_answer":"أَنْتِ"}]');

-- Article défini
INSERT OR IGNORE INTO grammar_rules (category_id, order_num, title_fr, title_en, level, content_json, exercises_json) VALUES
    ((SELECT id FROM grammar_categories WHERE slug='articles'), 1,
     'L''article défini ال', 'The Definite Article ال', 'beginner',
     '{"explanation_fr":"L''article défini en arabe est « ال » (al-). Il se place devant le nom. Avec les lettres solaires (ت ث د ذ ر ز س ش ص ض ط ظ ل ن), le « ل » s''assimile.",
       "explanation_en":"The definite article in Arabic is \"al-\". It precedes the noun. With sun letters, the \"l\" assimilates.",
       "examples":[
         {"arabic":"كِتَاب → الكِتَاب","transliteration":"kitāb → al-kitāb","translation_fr":"livre → le livre","translation_en":"book → the book"},
         {"arabic":"شَمْس → الشَّمْس","transliteration":"shams → ash-shams","translation_fr":"soleil → le soleil (lettre solaire)","translation_en":"sun → the sun (sun letter)"},
         {"arabic":"قَمَر → القَمَر","transliteration":"qamar → al-qamar","translation_fr":"lune → la lune (lettre lunaire)","translation_en":"moon → the moon (moon letter)"}
       ]}',
     '[{"exercise_type":"identify","question":"Quel mot contient l''article défini ?","arabic":"","options":["كِتَاب","الكِتَاب","بَيْت","مَدْرَسَة"],"correct_answer":"الكِتَاب"}]');

-- Genre et nombre
INSERT OR IGNORE INTO grammar_rules (category_id, order_num, title_fr, title_en, level, content_json, exercises_json) VALUES
    ((SELECT id FROM grammar_categories WHERE slug='gender_number'), 1,
     'Le genre en arabe', 'Gender in Arabic', 'beginner',
     '{"explanation_fr":"En arabe, les noms sont soit masculins soit féminins. La plupart des noms féminins se terminent par « ة » (ta marbuta). Exemples :",
       "explanation_en":"In Arabic, nouns are either masculine or feminine. Most feminine nouns end with \"ة\" (ta marbuta).",
       "examples":[
         {"arabic":"مُعَلِّم / مُعَلِّمَة","transliteration":"muʿallim / muʿallima","translation_fr":"enseignant / enseignante","translation_en":"teacher (m.) / teacher (f.)"},
         {"arabic":"طَالِب / طَالِبَة","transliteration":"ṭālib / ṭāliba","translation_fr":"étudiant / étudiante","translation_en":"student (m.) / student (f.)"},
         {"arabic":"كَبِير / كَبِيرَة","transliteration":"kabīr / kabīra","translation_fr":"grand / grande","translation_en":"big (m.) / big (f.)"}
       ]}',
     '[{"exercise_type":"identify","question":"Quel mot est féminin ?","arabic":"","options":["كِتَاب","مُعَلِّمَة","بَيْت","قَلَم"],"correct_answer":"مُعَلِّمَة"}]');

-- Enregistrer la migration
INSERT OR IGNORE INTO schema_migrations (version, name) VALUES (1, 'add_grammar_srs');
