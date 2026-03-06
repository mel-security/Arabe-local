# Schéma de Base de Données — Arabe Local

## Vue d'ensemble

```
users ──────────────┬── letter_progress ──→ letters
                    ├── word_progress ────→ vocabulary_words ──→ vocabulary_categories
                    ├── reading_progress ─→ reading_lessons
                    ├── quran_progress ───→ surahs ──────────→ verses
                    ├── verse_favorites ──→ verses
                    ├── quiz_sessions
                    └── activity_log

settings (clé-valeur indépendant)
```

## Diagramme ERD simplifié

```
┌───────────┐      ┌──────────────────┐
│  users    │      │  letters         │
│  id PK    │      │  id PK           │
│  name     │      │  order_num UNIQ  │
│  level    │      │  arabic          │
│  language │      │  name_ar/fr/en   │
│  theme    │      │  isolated_form   │
│  font_size│      │  initial_form    │
└─────┬─────┘      │  medial_form     │
      │            │  final_form      │
      │            │  vowels_json     │
      │            │  examples_json   │
      │            └──────┬───────────┘
      │                   │
      │   ┌───────────────┴──────────┐
      │   │  letter_progress         │
      ├───┤  user_id FK              │
      │   │  letter_id FK            │
      │   │  is_learned              │
      │   │  quiz_score              │
      │   └──────────────────────────┘
      │
      │            ┌──────────────────────┐
      │            │  vocabulary_words    │
      │            │  id PK               │
      │            │  arabic              │
      │            │  transliteration     │
      │            │  translation_fr/en   │
      │            │  category_id FK      │
      │            │  level               │
      │            │  example_ar/fr/en    │
      │            │  gender/plural/root  │
      │            └─────────────┬────────┘
      │                          │
      │   ┌──────────────────────┴───────┐
      ├───┤  word_progress               │
      │   │  user_id FK                  │
      │   │  word_id FK                  │
      │   │  is_learned, is_favorite     │
      │   └──────────────────────────────┘
      │
      │            ┌─────────────────┐    ┌───────────────────┐
      │            │  surahs         │    │  verses           │
      │            │  id = number    │    │  id PK            │
      │            │  name_ar/fr/en  │    │  surah_id FK      │
      │            │  verses_count   │    │  verse_number     │
      │            │  revelation_type│    │  arabic_text      │
      │            └───────┬─────────┘    │  translation_fr   │
      │                    │──────────────│  translation_en   │
      │                    │              │  transliteration  │
      │   ┌────────────────┴──────────┐   │  juz, page        │
      ├───┤  quran_progress           │   └───────────────────┘
      │   │  user_id FK               │
      │   │  surah_id FK              │
      │   │  last_verse               │
      │   └───────────────────────────┘
      │
      │   ┌──────────────────────────────┐
      └───┤  activity_log                │
          │  user_id FK                  │
          │  module (letters/words/...)  │
          │  action                      │
          │  item_id                     │
          │  created_at → calcul streak  │
          └──────────────────────────────┘
```

## Détail des colonnes importantes

### `letters.examples_json`
```json
[
  {
    "arabic": "بَيْت",
    "transliteration": "bayt",
    "translation_fr": "maison",
    "translation_en": "house",
    "position": "initial"  // "initial" | "medial" | "final" | "isolated"
  }
]
```

### `letters.vowels_json`
```json
[
  {
    "name": "fatha",           // identifiant
    "arabic": "َ",              // diacritique seul
    "combined": "بَ",           // lettre + diacritique
    "pronunciation": "ba"      // description
  }
]
```

### `reading_lessons.content_json`
```json
[
  {
    "arabic": "بَا",
    "transliteration": "bā",
    "translation_fr": "bā long",
    "audio_file": "audio/lessons/l1_01.mp3",  // null si absent
    "item_type": "syllable"  // "letter" | "syllable" | "word" | "sentence"
  }
]
```

### `reading_lessons.exercises_json`
```json
[
  {
    "exercise_type": "identify",
    "question": "Comment se prononce ce signe ?",
    "arabic": "بَ",
    "options": ["ba", "bi", "bu", "b"],
    "correct_answer": "ba"
  }
]
```

## Requêtes fréquentes

### Progression lettres
```sql
SELECT
  COUNT(*) FILTER (WHERE lp.is_learned = 1) as learned,
  COUNT(*) as total,
  ROUND(COUNT(*) FILTER (WHERE lp.is_learned = 1) * 100.0 / COUNT(*), 1) as pct
FROM letters l
LEFT JOIN letter_progress lp ON lp.letter_id = l.id AND lp.user_id = 1;
```

### Streak de jours consécutifs
```sql
WITH dates AS (
  SELECT DISTINCT DATE(created_at) as d
  FROM activity_log WHERE user_id = 1
  ORDER BY d DESC
),
streaks AS (
  SELECT d,
    julianday(LAG(d) OVER (ORDER BY d)) - julianday(d) as diff
  FROM dates
)
-- ... calcul du streak consécutif
```

### Mots favoris avec catégorie
```sql
SELECT w.*, c.name_fr as category_name, c.icon
FROM vocabulary_words w
JOIN vocabulary_categories c ON c.id = w.category_id
JOIN word_progress wp ON wp.word_id = w.id AND wp.user_id = 1
WHERE wp.is_favorite = 1
ORDER BY wp.id DESC;
```

### Reprise de lecture Coran
```sql
SELECT qp.surah_id, qp.last_verse, s.name_fr, s.verses_count
FROM quran_progress qp
JOIN surahs s ON s.id = qp.surah_id
WHERE qp.user_id = 1
ORDER BY qp.updated_at DESC
LIMIT 1;
```

## Migrations

Les migrations futures seront dans `database/migrations/` :
```
001_initial.sql        ← schéma v1.0
002_add_bookmarks.sql  ← ajout signets
003_multi_user.sql     ← multi-profils
```
