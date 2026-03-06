# عربي — Arabe Local

**Application pédagogique locale d'apprentissage de l'arabe**
Linux Desktop (Tauri) · React · SQLite · TypeScript

---

## Présentation

**Arabe Local** est une application éducative open-source permettant d'apprendre la langue arabe de façon progressive et autonome. Elle fonctionne **entièrement hors ligne** sur Linux (avec packaging Tauri), et est conçue pour une évolution future vers Android.

### 4 modules d'apprentissage

| Module | Description |
|--------|-------------|
| 🔤 **Lettres** | Les 28 lettres avec formes, voyelles, exemples et audio |
| 📖 **Lecture** | Progression des syllabes aux phrases complètes |
| 💬 **Vocabulaire** | 50+ mots courants par catégories avec traductions |
| 📗 **Coran** | Navigation, lecture audio, traduction FR/EN |

---

## Fonctionnalités

- ✅ Interface moderne React + Tailwind CSS
- ✅ Thème clair / sombre / automatique
- ✅ Support RTL natif pour l'arabe
- ✅ Police Arabic (Scheherazade New / Amiri)
- ✅ Base SQLite locale (progression, favoris, historique)
- ✅ Quiz interactifs par module
- ✅ Streak de jours consécutifs
- ✅ Taille de police ajustable (5 niveaux)
- ✅ Langue interface FR / EN
- ✅ Lecture audio (fichiers locaux + TTS de secours)
- ✅ Lien YouTube contextuel (optionnel, hors ligne = ignoré)
- ✅ Architecture Tauri → portable Android futur

---

## Prérequis

### Linux — Application desktop

```bash
# Outils de base
sudo apt update
sudo apt install -y build-essential curl wget git pkg-config

# Rust (requis par Tauri)
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh
source ~/.cargo/env
rustup update stable

# Dépendances système pour Tauri (WebKitGTK)
sudo apt install -y \
  libwebkit2gtk-4.0-dev \
  libssl-dev \
  libgtk-3-dev \
  libayatana-appindicator3-dev \
  librsvg2-dev

# Node.js 18+ via nvm
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash
source ~/.bashrc
nvm install 20
nvm use 20
```

---

## Installation et démarrage

### 1. Cloner le projet

```bash
git clone <url-du-repo>
cd Arabe-local
```

### 2. Installer les dépendances JS

```bash
npm install
```

### 3. Mode développement web (sans Tauri)

```bash
npm run dev
# → Ouvre http://localhost:1420
# Fonctionne sans Rust, utilise les données mock
```

### 4. Mode développement Tauri (desktop complet)

```bash
npm run tauri:dev
# → Lance l'application desktop avec SQLite réel
```

### 5. Build de production (AppImage / deb)

```bash
npm run tauri:build
# → Génère dans src-tauri/target/release/bundle/
#   - appimage/arabe-local_1.0.0_amd64.AppImage
#   - deb/arabe-local_1.0.0_amd64.deb
```

---

## Structure du projet

```
Arabe-local/
├── src/                          # Application React
│   ├── main.tsx                  # Point d'entrée
│   ├── App.tsx                   # Routeur principal
│   ├── index.css                 # Styles globaux Tailwind
│   ├── types/index.ts            # Types TypeScript
│   ├── store/index.ts            # État global Zustand
│   ├── services/
│   │   ├── database.ts           # API Tauri + mock web
│   │   └── audio.ts              # Gestion audio
│   ├── hooks/
│   │   ├── useDatabase.ts        # Hook données async
│   │   └── useAudio.ts           # Hook lecteur audio
│   ├── components/
│   │   ├── common/               # AudioPlayer, ArabicText, Badge, etc.
│   │   ├── layout/               # Header, Sidebar, Layout
│   │   └── quiz/                 # QuizEngine générique
│   └── pages/
│       ├── Home.tsx              # Tableau de bord
│       ├── Settings.tsx          # Paramètres
│       ├── letters/              # Module lettres
│       ├── reading/              # Module lecture
│       ├── words/                # Module vocabulaire
│       └── quran/                # Module Coran
│
├── src-tauri/                    # Backend Rust/Tauri
│   ├── Cargo.toml
│   ├── tauri.conf.json
│   └── src/
│       ├── main.rs               # Point d'entrée Tauri
│       ├── database.rs           # Init SQLite + schéma
│       ├── error.rs              # Gestion d'erreurs
│       └── commands/             # API exposée au frontend
│           ├── user.rs
│           ├── letters.rs
│           ├── words.rs
│           ├── reading.rs
│           ├── quran.rs
│           └── progress.rs
│
├── database/
│   ├── schema.sql                # Schéma complet documenté
│   └── seed.sql                  # Données initiales (28 lettres + 50 mots + Coran)
│
├── public/assets/
│   ├── audio/
│   │   ├── letters/              # ba.mp3, ta.mp3, ...
│   │   ├── words/                # bayt.mp3, ...
│   │   └── quran/                # 001.mp3, 001_001.mp3, ...
│   └── images/
│       ├── letters/              # ba.png, ...
│       └── words/                # bayt.png, ...
│
├── docs/                         # Documentation technique
│   ├── ARCHITECTURE.md
│   ├── DATABASE_SCHEMA.md
│   └── ANDROID_GUIDE.md
│
├── package.json
├── vite.config.ts
├── tailwind.config.ts
├── tsconfig.json
└── README.md
```

---

## Ajout de médias (audio et images)

Placez vos fichiers dans `public/assets/` :

```
public/assets/audio/letters/ba.mp3
public/assets/audio/quran/001.mp3        # Al-Fatiha complète
public/assets/audio/quran/001_001.mp3    # Verset 1:1
```

Dans la base de données, référencez-les avec le chemin relatif :

```sql
UPDATE letters SET audio_file = 'audio/letters/ba.mp3' WHERE order_num = 2;
UPDATE verses SET audio_file = 'audio/quran/001_001.mp3' WHERE surah_id = 1 AND verse_number = 1;
```

Les audio libres de droits recommandés :
- **Coran** : [Éversharp Islam](https://www.everyayah.com/) · [Al-Afasy](https://alafasy.com/)
- **Lettres** : à enregistrer ou générer via TTS arabe

---

## Packaging Android (futur)

Voir `docs/ANDROID_GUIDE.md`.
La migration vers Capacitor ou Tauri Mobile est préparée :
- Architecture frontend React pure (pas de dépendance Tauri directe dans la UI)
- Service `database.ts` abstrait Tauri vs Web
- SQLite compatible via `@capacitor-community/sqlite`

---

## Technologies

| Couche | Tech | Version |
|--------|------|---------|
| UI | React | 18 |
| Styles | Tailwind CSS | 3 |
| Routing | React Router | 6 |
| État | Zustand | 4 |
| Animations | Framer Motion | 10 |
| Desktop | Tauri | 1.6 |
| Base de données | SQLite (rusqlite) | - |
| Build | Vite | 5 |
| Langage | TypeScript | 5 |

---

## Licence

MIT — Libre d'utilisation, modification et distribution.

---

## Contribuer

Les contributions sont les bienvenues !

- 🐛 Bugs → Issues GitHub
- 💡 Idées → Discussions
- 📝 Contenu arabe → PRs sur `database/seed.sql`
- 🎵 Audio → Dépôt de médias séparé
