# Architecture Technique — Arabe Local

## Vue d'ensemble

```
┌─────────────────────────────────────────────────────────────┐
│                     APPLICATION TAURI                        │
│  ┌─────────────────────────────┐  ┌──────────────────────┐  │
│  │   Frontend React (WebView)   │  │   Backend Rust        │  │
│  │                             │  │                      │  │
│  │  ┌─────────┐  ┌──────────┐  │  │  ┌───────────────┐  │  │
│  │  │  Pages   │  │ Services │  │  │  │   Commands    │  │  │
│  │  │  React   │←→│  API     │←→│  │←→│   (Tauri)     │  │  │
│  │  └─────────┘  └──────────┘  │  │  └───────────────┘  │  │
│  │  ┌─────────┐  ┌──────────┐  │  │  ┌───────────────┐  │  │
│  │  │  Store  │  │  Hooks   │  │  │  │   SQLite DB   │  │  │
│  │  │ Zustand │  │          │  │  │  │   (rusqlite)  │  │  │
│  │  └─────────┘  └──────────┘  │  │  └───────────────┘  │  │
│  └─────────────────────────────┘  └──────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
         ↑                                    ↑
    HTTP/WebSocket                       File System
    (dev mode)                           (production)
```

## Flux de données

```
Utilisateur → React Component → Service API → tauri.invoke()
                                    ↓
                               Rust Command
                                    ↓
                            SQLite (rusqlite)
                                    ↓
                          Réponse sérialisée JSON
                                    ↓
                         React State (Zustand)
                                    ↓
                             Rendu UI
```

## Modules

### 1. Frontend (React + TypeScript)

**Pages** : composants de haut niveau par module
- `Home` : tableau de bord, progression, accès rapide
- `Settings` : profil, thème, langue, taille police
- `letters/LettersModule` : grille des 28 lettres avec filtres
- `letters/LetterDetail` : détail avec formes, voyelles, exemples, quiz
- `letters/LetterQuiz` : quiz générique sur les lettres
- `reading/ReadingModule` : liste leçons avec progression débloquée
- `reading/ReadingLesson` : contenu + exercices interactifs
- `words/WordsModule` : grille vocabulaire par catégories
- `words/WordDetail` : fiche mot avec traductions, exemple, favoris
- `words/WordQuiz` : quiz de traduction
- `quran/QuranModule` : liste 114 sourates + reprise lecture
- `quran/SurahReader` : lecteur versets avec modes d'affichage

**Services** (abstraction Tauri/Web) :
- `database.ts` : toutes les calls API, avec fallback mock pour dev web
- `audio.ts` : gestion lecture audio, fallback TTS Web Speech API

**Store** (Zustand) :
- `useAppStore` : profil, settings, progression globale, streak, thème
- `useQuizStore` : état temporaire d'une session quiz

### 2. Backend Rust (Tauri)

**Commands** par domaine :
- `user.rs` : profil et paramètres
- `letters.rs` : CRUD lettres, progression, quiz
- `words.rs` : vocabulaire, catégories, favoris
- `reading.rs` : leçons, progression
- `quran.rs` : sourates, versets, favoris, position lecture
- `progress.rs` : statistiques globales, streak, historique

**Database** (`database.rs`) :
- Initialisation SQLite au démarrage
- Création schéma (DDL) si absent
- Seed données de base si tables vides
- Chemin : `~/.local/share/arabe-local/arabe_local.db`

### 3. Base de données SQLite

Tables principales :
```
users           → profil utilisateur (1 entrée locale)
settings        → paires clé-valeur config
letters         → 28 lettres avec JSON (exemples, voyelles)
vocabulary_words → mots avec catégories
reading_lessons → leçons avec JSON (contenu, exercices)
surahs          → 114 sourates
verses          → versets avec traductions

Tables de progression :
letter_progress  → is_learned, quiz_score par user×lettre
word_progress    → is_learned, is_favorite par user×mot
reading_progress → is_completed par user×leçon
quran_progress   → last_verse, is_completed par user×sourate
verse_favorites  → versets favoris avec note
activity_log     → journal pour calcul streak
quiz_sessions    → historique des quiz
```

## Gestion du mode hors ligne

- **Données** : entièrement en SQLite local
- **Audio** : fichiers locaux dans `public/assets/audio/`
- **Polices** : chargées via Google Fonts avec fallback système
- **YouTube** : lien externe optionnel, géré silencieusement si hors ligne
- **TTS** : `window.speechSynthesis` comme fallback audio si pas de fichier

## Sécurité Tauri

- CSP stricte définie dans `tauri.conf.json`
- Allowlist minimale (fs, dialog, shell.open uniquement)
- Pas d'accès réseau direct depuis Rust
- Données utilisateur isolées dans `$APPDATA`

## Performance

- Lazy loading de toutes les pages React
- Index SQLite sur les clés de recherche fréquentes
- WAL mode pour SQLite (écriture concurrente)
- Images optimisées WebP recommandées
- Audio format OGG/MP3 pour compatibilité

## Évolutivité

- Architecture multi-utilisateurs prévue (user_id dans toutes les tables)
- Types TypeScript stricts pour refactoring sûr
- Service layer abstrait → changement de backend transparent
- Données externalisables (fichiers JSON, import/export)
