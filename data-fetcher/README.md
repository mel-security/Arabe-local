# Arabe Local — Data Fetcher

Script Node.js autonome qui récupère automatiquement tous les assets manquants de l'app :
- **Audio des 28 lettres** (Google TTS, qualité AR native)
- **Images SVG des 28 lettres** (générées localement, aucune API)
- **Texte complet du Coran** — 6236 versets avec traductions FR + EN (alquran.cloud)
- **Audio de chaque verset** — récitation Alafasy 128kbps (everyayah.com, ~1.8 Go)
- **Audio du vocabulaire** (Google TTS)
- **Images du vocabulaire** (Wikimedia Commons, ~60-70% de taux de succès)

Toutes les sources sont **gratuites et sans clé API**.

---

## Prérequis

- Node.js 18+ (`node -v`)
- Connexion internet

```bash
cd data-fetcher
npm install
```

---

## Utilisation rapide

```bash
# Lettres uniquement (rapide, ~5 minutes)
npm run fetch:letters

# Texte du Coran uniquement (sans audio)
node index.js --quran --skip-audio  # (non implémenté — voir note ci-dessous)
node index.js --quran

# Tout (long — ~2-3 heures pour l'audio Coran)
npm run fetch:all

# Avec mise à jour directe de la DB Tauri
npm run fetch:letters -- --db ~/.local/share/arabe-local/arabe_local.db

# Vérifier l'état actuel
npm run verify
npm run verify -- --db ~/.local/share/arabe-local/arabe_local.db

# Voir ce qui serait téléchargé sans rien faire
npm run dry-run
```

---

## Options complètes

```
node index.js [modules] [options]

Modules:
  --all        Tout exécuter
  --letters    Audio + images des 28 lettres
  --quran      Texte + audio du Coran complet (6236 versets)
  --words      Audio + images du vocabulaire

Options:
  --db <path>        Chemin SQLite de l'app Tauri (voir chemins ci-dessous)
  --dry-run          Afficher les actions sans télécharger
  --concurrency <n>  Parallélisme (défaut: 3)
  --verify           Vérifier l'état sans télécharger
  --help             Aide
```

### Chemin de la DB Tauri

| OS      | Chemin par défaut |
|---------|-------------------|
| Linux   | `~/.local/share/arabe-local/arabe_local.db` |
| Windows | `%APPDATA%\arabe-local\arabe_local.db` |
| macOS   | `~/Library/Application Support/arabe-local/arabe_local.db` |

> La DB est créée lors du **premier lancement** de l'app Tauri. Lancez l'app une fois avant d'utiliser `--db`.

---

## Architecture

```
data-fetcher/
├── index.js              ← CLI principal
├── lib/
│   ├── config.js         ← Manifests: 28 lettres + 114 sourates
│   ├── http.js           ← fetch avec rate-limit + retry exponentiel
│   ├── db.js             ← Accès SQLite (better-sqlite3)
│   ├── sql-writer.js     ← Génère le fichier SQL de mise à jour
│   └── progress.js       ← Affichage terminal
└── fetchers/
    ├── letters-images.js ← Génération SVG (hors-ligne)
    ├── letters-audio.js  ← Google TTS
    ├── quran-text.js     ← alquran.cloud API
    ├── quran-audio.js    ← everyayah.com
    ├── words-audio.js    ← Google TTS
    └── words-images.js   ← Wikimedia Commons
```

---

## Sources de données

| Asset | Source | Licence | Clé API |
|-------|--------|---------|---------|
| Audio lettres | Google TTS (non-officiel) | Gratuit | Non |
| Images lettres | Génération SVG | N/A | Non |
| Texte Coran | [alquran.cloud](https://api.alquran.cloud) | Open | Non |
| Audio Coran | [EveryAyah](https://everyayah.com) — Alafasy | Gratuit | Non |
| Audio mots | Google TTS (non-officiel) | Gratuit | Non |
| Images mots | [Wikimedia Commons](https://commons.wikimedia.org) | CC-BY-SA/CC0 | Non |

### Détails audio Coran

- Récitateur: **Sheikh Mishary Rashid Alafasy**
- Qualité: **128 kbps MP3**
- Fichiers: `001001.mp3` → `114006.mp3` (format `{sourate:3}{verset:3}`)
- Taille totale: ~1.8 Go pour les 6236 versets

---

## Output SQL

Après chaque exécution, un fichier SQL est généré dans `output/` :

```
output/updates-2026-03-16T10-30-00.sql
```

Ce fichier contient toutes les instructions `INSERT OR IGNORE` (versets) et `UPDATE` (chemins audio/images) au sein d'une transaction.

### Appliquer manuellement

```bash
# Via sqlite3
sqlite3 ~/.local/share/arabe-local/arabe_local.db < output/updates-*.sql

# Via --db (applique automatiquement après téléchargement)
node index.js --letters --db ~/.local/share/arabe-local/arabe_local.db
```

---

## Conventions de chemin

Les chemins stockés en DB sont **relatifs** (sans `/` ni préfixe `public/`) :

```
assets/audio/letters/alif.mp3
assets/audio/quran/001001.mp3
assets/images/letters/alif.svg
```

L'app Tauri les résout via `convertFileSrc()` (Tauri) ou `/${path}` (web).

---

## Résume (idempotence)

Le script vérifie l'existence et la taille de chaque fichier avant de télécharger. Il peut être interrompu et relancé sans re-télécharger les fichiers déjà présents.

Condition de skip : `fs.statSync(dest).size > taille_minimale`

---

## Dépannage

**Google TTS retourne des fichiers trop petits :**
> Rate limit atteint. Attendez quelques minutes et relancez. Le script reprend où il s'est arrêté.

**alquran.cloud timeout :**
> L'API a des limites non documentées. Relancez avec `--quran` — les sourates déjà insérées seront ignorées.

**Erreur `better-sqlite3` à l'installation :**
```bash
npm install --build-from-source
# ou
npm rebuild better-sqlite3
```

**La DB n'existe pas :**
> Lancez l'app Tauri une fois (`npm run tauri:dev` ou exécutez le `.exe`) pour créer la DB, puis relancez ce script.

**Vérifier l'état après téléchargement :**
```bash
npm run verify -- --db ~/.local/share/arabe-local/arabe_local.db
```

```sql
-- Vérification directe
SELECT name_fr, audio_file, image_file FROM letters WHERE audio_file IS NOT NULL;
SELECT COUNT(*) FROM verses WHERE arabic_text IS NOT NULL;  -- doit être 6236
SELECT COUNT(*) FROM verses WHERE audio_file IS NOT NULL;   -- doit être 6236
```
