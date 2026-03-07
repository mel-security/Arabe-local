# Arabe Local — Guide de Build Android

> Application d'apprentissage de l'arabe avec IA locale (Gemma 2B Q4) entièrement hors-ligne.

---

## Table des matières

1. [Architecture Android](#1-architecture-android)
2. [Pré-requis système](#2-pré-requis-système)
3. [Installation de l'environnement](#3-installation-de-lenvironnement)
4. [Modèle LLM — Gemma 2B Q4](#4-modèle-llm--gemma-2b-q4)
5. [Build de l'APK](#5-build-de-lapk)
6. [Tests et déploiement](#6-tests-et-déploiement)
7. [Architecture du code Android](#7-architecture-du-code-android)
8. [Intégration du LLM](#8-intégration-du-llm)
9. [Personnalisation](#9-personnalisation)
10. [Résolution des problèmes](#10-résolution-des-problèmes)
11. [Publication Play Store](#11-publication-play-store)

---

## 1. Architecture Android

```
Arabe Local Android
├── Frontend React (Capacitor WebView)
│   ├── Interface identique à la version desktop
│   ├── Tailwind CSS, Framer Motion, React Router
│   └── Détection Android → utilise GemmaLLM au lieu d'Ollama
│
├── Plugin Natif Kotlin — GemmaLLMPlugin
│   ├── MediaPipe LLM Inference API
│   ├── Gemma 2B IT (quantifié INT4)
│   ├── Streaming token-par-token
│   └── Accélération GPU (Vulkan/OpenCL) ou CPU fallback
│
├── Service Kotlin — ModelDownloadService
│   ├── Téléchargement résumable en arrière-plan
│   ├── Notification de progression
│   └── Stockage dans le répertoire interne (/data/data/com.arablocal.app/files/)
│
└── Base de données SQLite
    ├── @capacitor-community/sqlite (remplace rusqlite de Tauri)
    └── Schéma identique à la version desktop (12 tables + tables LLM)
```

### Flux de données

```
React UI  ←→  Capacitor Bridge  ←→  GemmaLLMPlugin.kt
                                          ↓
                                    MediaPipe LLM
                                          ↓
                                    Gemma 2B Q4 (.bin)
                                    (stockage interne)
```

---

## 2. Pré-requis système

### Machine de développement

| Outil | Version minimale | Notes |
|-------|-----------------|-------|
| **Node.js** | 18.0+ | `node --version` |
| **npm** | 9.0+ | Inclus avec Node.js |
| **Java JDK** | 17.0+ | JDK, pas JRE |
| **Android Studio** | 2023.3+ (Jellyfish) | Ou SDK en CLI |
| **Android SDK** | API Level 26+ | Android 8.0 Oreo |
| **Android NDK** | r25c+ | Pour la compilation native |
| **Git** | 2.x+ | |

### Appareil Android cible

| Critère | Minimum | Recommandé |
|---------|---------|-----------|
| **API Level** | 26 (Android 8.0) | 31+ (Android 12) |
| **RAM** | 4 Go | 6+ Go |
| **Stockage libre** | 3 Go | 5+ Go |
| **GPU** | Adreno 610+ / Mali-G52+ | Adreno 740+ |
| **Architecture** | arm64-v8a | arm64-v8a |

> **Note RAM** : Gemma 2B Q4 utilise ~1.5 Go de RAM au chargement + l'OS + l'application.
> Sur 4 Go de RAM, l'OS Android peut tuer le processus. 6 Go recommandés.

---

## 3. Installation de l'environnement

### 3.1 Java JDK 17

```bash
# Ubuntu / Debian
sudo apt update && sudo apt install -y openjdk-17-jdk
export JAVA_HOME=/usr/lib/jvm/java-17-openjdk-amd64

# macOS (Homebrew)
brew install --cask temurin@17

# Windows
# Télécharger depuis : https://adoptium.net/temurin/releases/?version=17
```

### 3.2 Android Studio et SDK

**Option A — Android Studio (recommandé pour débutants)**

1. Télécharger depuis [developer.android.com/studio](https://developer.android.com/studio)
2. Installer avec les composants par défaut
3. Ouvrir Android Studio → *SDK Manager* → Installer :
   - **Android SDK Platform 34** (API 34, Android 14)
   - **Android SDK Build-Tools 34.0.0**
   - **Android SDK Platform-Tools**
   - **NDK (Side by side)** version 25.x ou 26.x

**Option B — Ligne de commande uniquement**

```bash
# Télécharger les Command Line Tools
mkdir -p ~/android-sdk/cmdline-tools
cd ~/android-sdk/cmdline-tools
wget https://dl.google.com/android/repository/commandlinetools-linux-11076708_latest.zip
unzip commandlinetools-linux-*.zip
mv cmdline-tools latest

# Configurer les variables d'environnement
export ANDROID_HOME="$HOME/android-sdk"
export PATH="$PATH:$ANDROID_HOME/cmdline-tools/latest/bin:$ANDROID_HOME/platform-tools"

# Accepter les licences et installer les packages
yes | sdkmanager --licenses
sdkmanager \
    "platform-tools" \
    "platforms;android-34" \
    "build-tools;34.0.0" \
    "ndk;25.1.8937393"
```

### 3.3 Variables d'environnement

Ajouter à `~/.bashrc` ou `~/.zshrc` :

```bash
export JAVA_HOME=/usr/lib/jvm/java-17-openjdk-amd64  # Adapter selon votre install
export ANDROID_HOME="$HOME/Android/Sdk"               # Ou ~/android-sdk selon 3.2
export PATH="$PATH:$ANDROID_HOME/platform-tools:$ANDROID_HOME/tools"
```

Recharger :
```bash
source ~/.bashrc   # ou source ~/.zshrc
```

### 3.4 Vérification

```bash
java -version      # → openjdk version "17.x.x"
javac -version     # → javac 17.x.x
adb version        # → Android Debug Bridge version x.x.x
```

---

## 4. Modèle LLM — Gemma 2B Q4

### Pourquoi Gemma 2B ?

| Critère | Gemma 2B Q4 | Alternatives |
|---------|-------------|-------------|
| Taille disque | ~1.5 Go | Phi-2: 1.7 Go, Llama 3.2-1B: 0.7 Go |
| RAM requise | ~1.5 Go | Phi-2: ~2 Go |
| Qualité arabe | ⭐⭐⭐ | Phi-2: ⭐⭐, Llama: ⭐⭐⭐ |
| Support MediaPipe | ✅ Officiel | ❌ nécessite conversion |
| Licence | Gemma Terms | MIT / Llama 3 |

### 4.1 Licence Gemma

Gemma est soumis à la [licence Google Gemma](https://ai.google.dev/gemma/terms).
Vous devez accepter les CGU avant de télécharger le modèle.
L'usage personnel et éducatif est autorisé sans frais.

### 4.2 Téléchargement via script

```bash
# Variante GPU (recommandée — 2x plus rapide sur appareils récents)
./android-port/scripts/download-model.sh --variant gpu

# Variante CPU (universelle — fonctionne sur tous les appareils)
./android-port/scripts/download-model.sh --variant cpu

# Force le re-téléchargement
./android-port/scripts/download-model.sh --variant gpu --force
```

### 4.3 Téléchargement manuel

**Source 1 — HuggingFace (aucun compte requis)**

```bash
# Modèle MediaPipe GPU (format .bin)
wget https://huggingface.co/litert-community/Gemma2-2B-IT/resolve/main/gemma2-2b-it-gpu-int4.bin \
    -O android/app/src/main/assets/models/gemma-2b-it-gpu-int4.bin

# Modèle MediaPipe CPU (format .bin)
wget https://huggingface.co/litert-community/Gemma2-2B-IT/resolve/main/gemma2-2b-it-cpu-int4.bin \
    -O android/app/src/main/assets/models/gemma-2b-it-cpu-int4.bin
```

**Source 2 — Kaggle (compte requis, modèle officiel Google)**

1. Créer un compte sur [kaggle.com](https://www.kaggle.com)
2. Accepter les CGU Gemma sur Kaggle
3. Générer un token API : Account → API → Create New Token
4. Configurer les credentials :

```bash
export KAGGLE_USERNAME="votre_username"
export KAGGLE_KEY="votre_api_key"

./android-port/scripts/download-model.sh --variant gpu
```

### 4.4 Stratégie de distribution du modèle

**Option A : Modèle bundlé dans l'APK (simple mais APK énorme)**
```
android/app/src/main/assets/models/gemma-2b-it-gpu-int4.bin
→ APK final : ~1.7 Go
→ Avantage : fonctionne sans connexion dès l'installation
→ Inconvénient : Play Store refuse les APK > 100 Mo
```

**Option B : Téléchargement au premier lancement (recommandé)**
```
→ APK < 50 Mo (facilement distribuable)
→ Téléchargement en arrière-plan au premier lancement
→ ModelDownloadService.kt gère le téléchargement résumable
→ Notification de progression
→ Stockage : /data/data/com.arablocal.app/files/
```

**Option C : Google Play Asset Delivery (pour Play Store)**
```
→ Modèle livré via Play Fast Follow ou On Demand
→ Nécessite une configuration aab + Play Store Console
→ Voir : https://developer.android.com/guide/app-bundle/asset-delivery
```

> **Recommandation** : Utiliser l'Option B pour la distribution. Le modèle est téléchargé
> une seule fois et stocké localement. L'application gère automatiquement le cas
> "modèle non disponible".

---

## 5. Build de l'APK

### 5.1 Setup initial (une seule fois)

```bash
# Depuis la racine du projet
./android-port/scripts/setup-android.sh
```

Ce script effectue automatiquement :
- Vérification de Java, Android SDK
- Installation des packages npm Capacitor
- Copie de la configuration Capacitor
- Build React (`npm run build`)
- Initialisation du projet Android (`npx cap add android`)
- Copie des fichiers Kotlin (MainActivity, GemmaLLMPlugin, ModelDownloadService)
- Mise à jour du `build.gradle` (dépendances MediaPipe)

### 5.2 Build debug (développement)

```bash
# APK de debug (non signé, pour tests)
./android-port/scripts/build-apk.sh

# Avec installation directe sur appareil connecté
./android-port/scripts/build-apk.sh --install
```

L'APK debug se trouve dans :
```
android-port/output/arabe-local-debug-YYYYMMDD.apk
```

### 5.3 Build release (distribution)

```bash
# APK de release signé
./android-port/scripts/build-apk.sh --release --sign
```

La première exécution génère automatiquement un keystore dans :
```
android-port/release-keystore.jks
```

> ⚠️ **IMPORTANT** : Conservez ce fichier `release-keystore.jks` en lieu sûr.
> Il est **indispensable** pour publier des mises à jour de l'application.
> **Ne le commitez jamais dans git.**

### 5.4 Build Android App Bundle (Play Store)

```bash
# AAB pour le Play Store
./android-port/scripts/build-apk.sh --release --sign --bundle
```

### 5.5 Build manuel via Android Studio

```bash
# Synchroniser le projet
npx cap sync android

# Ouvrir dans Android Studio
npx cap open android
```

Puis dans Android Studio :
- `Build` → `Generate Signed Bundle / APK`
- Choisir `APK`
- Configurer le keystore
- Build Variant : `release`
- Cliquer `Finish`

### 5.6 Build manuel en ligne de commande

```bash
# Depuis le dossier android/
cd android

# Debug
./gradlew assembleDebug

# Release (avec keystore configuré dans build.gradle)
./gradlew assembleRelease

# Bundle (AAB)
./gradlew bundleRelease
```

---

## 6. Tests et déploiement

### 6.1 Émulateur Android

Créer un AVD dans Android Studio :
- `Tools` → `Device Manager` → `Create Virtual Device`
- Choisir : **Pixel 7** ou **Pixel 8**
- Image système : **Android 14** (API 34) avec Google APIs

> **Note** : L'inférence Gemma sur émulateur est **très lente** (CPU uniquement, ~50 tokens/min).
> Tester les fonctionnalités IA sur un vrai appareil physique.

```bash
# Lancer sur l'émulateur (via Capacitor)
npx cap run android
```

### 6.2 Appareil physique

```bash
# Activer les options développeur sur l'appareil :
# Paramètres → À propos du téléphone → Numéro de build (taper 7 fois)
# Paramètres → Options développeur → Débogage USB : Activé

# Vérifier la connexion
adb devices

# Installer l'APK
adb install -r android-port/output/arabe-local-debug-YYYYMMDD.apk

# Voir les logs en temps réel
adb logcat -s GemmaLLMPlugin,ModelDownloadService,WebView
```

### 6.3 Copier le modèle sur l'appareil (développement)

```bash
# Si le modèle est dans android/app/src/main/assets/models/
# Il sera inclus dans le build. Sinon, le pousser manuellement :

adb push /chemin/vers/gemma-2b-it-gpu-int4.bin \
    /data/data/com.arablocal.app/files/gemma-2b-it-gpu-int4.bin
```

### 6.4 Debug du LLM

```bash
# Filtrer les logs du plugin Gemma
adb logcat | grep -E "GemmaLLM|MediaPipe|LlmInference"

# Voir toute l'application
adb logcat -s "GemmaLLMPlugin:V" "ModelDownloadService:V" "chromium:V"
```

---

## 7. Architecture du code Android

### Structure des fichiers

```
android-port/
├── capacitor.config.ts           # Configuration Capacitor (racine du projet)
├── android-package-additions.json # Dépendances npm à ajouter
│
├── android/app/src/main/
│   ├── AndroidManifest.xml        # Permissions et déclarations
│   ├── java/com/arablocal/app/
│   │   ├── MainActivity.kt        # Point d'entrée (enregistre les plugins)
│   │   ├── plugins/
│   │   │   └── GemmaLLMPlugin.kt  # ← Pont JS ↔ MediaPipe
│   │   └── services/
│   │       └── ModelDownloadService.kt # Téléchargement en arrière-plan
│   └── assets/
│       └── models/                # Dossier du modèle Gemma (optionnel)
│           └── gemma-2b-it-gpu-int4.bin
│
├── src/
│   ├── plugins/
│   │   ├── gemmaLLM.ts            # Interface TypeScript du plugin
│   │   └── gemmaLLMWeb.ts         # Fallback web (développement)
│   └── services/llm/providers/
│       └── gemma.ts               # Provider LLM Android (implémente BaseLLMProvider)
│
└── scripts/
    ├── setup-android.sh           # Setup initial de l'environnement
    ├── download-model.sh          # Téléchargement du modèle Gemma
    └── build-apk.sh               # Construction de l'APK
```

### Flux d'appel complet

```
1. L'utilisateur tape un message dans ChatInput.tsx

2. chatService.sendMessage() est appelé
   → src/services/chat/chatService.ts

3. llmService.sendMessage() est appelé
   → src/services/llm/index.ts

4. Détection de la plateforme :
   if (isAndroid) → GemmaProvider (android-port/src/services/llm/providers/gemma.ts)
   else           → OllamaProvider (src/services/llm/providers/ollama.ts)

5. GemmaProvider.generate() :
   a. Construit le prompt au format Gemma IT
   b. Appelle GemmaLLM.generate({ prompt })
   c. Écoute l'événement 'onToken'

6. GemmaLLMPlugin.kt (Kotlin) :
   a. Reçoit l'appel via Capacitor Bridge
   b. Appelle llmInference.generateResponseAsync()
   c. MediaPipe exécute Gemma 2B sur GPU/CPU
   d. Chaque token → notifyListeners("onToken", data)

7. Les tokens arrivent en streaming dans le WebView
   → ChatDrawer.tsx met à jour l'UI en temps réel
```

---

## 8. Intégration du LLM

### 8.1 Détection de la plateforme

Pour adapter automatiquement le service LLM à Android, modifier
`src/services/llm/index.ts` :

```typescript
import { Capacitor } from "@capacitor/core";
import { GemmaProvider } from "@android-port/src/services/llm/providers/gemma";
import { OllamaProvider } from "./providers/ollama";

// Dans ModelManager.init() :
const isAndroid = Capacitor.getPlatform() === "android";

if (isAndroid) {
  this.provider = new GemmaProvider({
    baseUrl: "local",
    model: "gemma-2b-q4",
    temperature: settings.temperature,
    maxTokens: settings.max_tokens,
  });
} else {
  this.provider = new OllamaProvider({
    baseUrl: settings.base_url,
    model: settings.model_name,
    temperature: settings.temperature,
    maxTokens: settings.max_tokens,
  });
}
```

### 8.2 Gestion du premier lancement

Créer un hook `useModelSetup.ts` pour gérer le téléchargement du modèle :

```typescript
// src/hooks/useModelSetup.ts
import { useEffect, useState } from "react";
import { GemmaLLM } from "@android-port/src/plugins/gemmaLLM";
import { Capacitor } from "@capacitor/core";

export function useModelSetup() {
  const [modelStatus, setModelStatus] = useState<
    "checking" | "ready" | "downloading" | "missing"
  >("checking");
  const [downloadProgress, setDownloadProgress] = useState(0);

  useEffect(() => {
    if (Capacitor.getPlatform() !== "android") return;

    GemmaLLM.checkModelFile().then(({ found }) => {
      setModelStatus(found ? "ready" : "missing");
    });
  }, []);

  return { modelStatus, downloadProgress };
}
```

### 8.3 Paramètres LLM sur Android

Le panneau `LLMSettings.tsx` peut détecter Android et adapter les options :

```typescript
const isAndroid = Capacitor.getPlatform() === "android";

// Sur Android, afficher :
// - Statut du modèle Gemma (présent/absent)
// - Bouton de téléchargement
// - Choix GPU/CPU
// - Progression du téléchargement

// Au lieu de :
// - URL du serveur Ollama
// - Liste des modèles Ollama
```

### 8.4 Qualité des réponses en arabe

Gemma 2B a un support modéré de l'arabe. Pour de meilleures réponses :

```typescript
// Dans PromptBuilder, adapter le system prompt pour Gemma :
const GEMMA_ARABIC_SYSTEM = `
You are an Arabic language teacher. Always respond in French.
When mentioning Arabic words, use Arabic script (e.g., كتاب) with transliteration.
Keep responses concise and educational. Level: ${levelLabel}.
`;
```

---

## 9. Personnalisation

### 9.1 Changer le modèle LLM

Pour utiliser un autre modèle compatible MediaPipe :

1. Télécharger un modèle `.bin` compatible MediaPipe LiteRT
2. Placer dans `android/app/src/main/assets/models/`
3. Modifier `GemmaLLMPlugin.kt` :

```kotlin
// Dans checkModelFile(), ajouter votre nom de fichier :
val modelFiles = listOf(
    "mon-modele-custom.bin",
    "gemma-2b-it-gpu-int4.bin",
    // ...
)
```

**Modèles alternatifs testés avec MediaPipe :**

| Modèle | Taille | Arabe | Notes |
|--------|--------|-------|-------|
| Gemma 2B Q4 GPU | 1.3 Go | ⭐⭐⭐ | Recommandé |
| Gemma 2B Q4 CPU | 1.3 Go | ⭐⭐⭐ | Universel |
| Phi-2 Q4 | 1.7 Go | ⭐⭐ | Meilleur raisonnement |
| TinyLlama 1.1B Q4 | 0.7 Go | ⭐ | Pour appareils limités |

### 9.2 Icône et splash screen

```bash
# Installer le plugin d'assets
npm install -D @capacitor/assets

# Placer une icône 1024x1024 en :
cp votre-icone.png resources/icon.png
cp votre-splash.png resources/splash.png

# Générer les assets Android
npx @capacitor/assets generate --android
```

### 9.3 Thème natif Android

Modifier `android/app/src/main/res/values/styles.xml` :

```xml
<style name="AppTheme" parent="Theme.AppCompat.DayNight.NoActionBar">
    <item name="android:statusBarColor">@color/colorPrimary</item>
    <item name="android:windowBackground">@color/colorBackground</item>
</style>
```

---

## 10. Résolution des problèmes

### L'application plante au démarrage

```bash
adb logcat | grep -i "fatal\|error\|exception"
```

Causes fréquentes :
- `minSdkVersion` trop bas (doit être ≥ 26)
- RAM insuffisante pour charger le modèle
- Modèle corrompu (vérifier la taille : doit être > 1 Go)

### "Modèle non trouvé" dans l'application

```bash
# Vérifier que le modèle est bien présent
adb shell ls -la /data/data/com.arablocal.app/files/

# Copier manuellement
adb push gemma-2b-it-gpu-int4.bin /data/data/com.arablocal.app/files/
```

### Génération très lente (< 5 tokens/seconde)

- Vérifier que le GPU est bien utilisé dans les logs
- Sur émulateur, c'est normal (CPU uniquement)
- Certains appareils désactivent l'accélération GPU pour les apps tierces
- Essayer la variante CPU si le GPU échoue

### Erreur de build Gradle

```bash
# Nettoyer les caches
cd android && ./gradlew clean
cd .. && npx cap sync android

# Vérifier les versions
./gradlew --version
```

### Problème de mémoire (OOM)

Si l'application se ferme lors du chargement du modèle :

1. Vérifier `android:largeHeap="true"` dans `AndroidManifest.xml`
2. Augmenter la limite de heap dans `build.gradle` :
```gradle
android {
    defaultConfig {
        // ...
    }
    dexOptions {
        javaMaxHeapSize "4g"
    }
}
```

### La WebView ne charge pas l'application

```bash
# Vérifier que le build React est à jour
npm run build
npx cap sync android

# Logs WebView
adb logcat -s chromium
```

---

## 11. Publication Play Store

### 11.1 Préparer un AAB signé

```bash
# Générer le keystore (une seule fois)
keytool -genkey -v \
    -keystore android-port/release-keystore.jks \
    -alias arablocal \
    -keyalg RSA -keysize 2048 -validity 10000

# Build AAB signé
./android-port/scripts/build-apk.sh --release --sign --bundle
```

### 11.2 Configuration Play Store

- **Package** : `com.arablocal.app`
- **Catégorie** : Éducation
- **Contenu** : Tous publics (PEGI 3)
- **Taille APK** : < 50 Mo (sans modèle bundlé)
- **Stockage requis** : ~2.5 Go (application + modèle)

### 11.3 Checklist avant publication

- [ ] Icône 512x512 px
- [ ] Captures d'écran en arabe et en français
- [ ] Description mentionnant "IA locale, données privées"
- [ ] Politique de confidentialité (aucune donnée envoyée sur internet)
- [ ] Test sur au minimum 3 appareils différents
- [ ] Test du téléchargement du modèle depuis Play Store
- [ ] Vérification de la licence Gemma acceptée

### 11.4 Politique de confidentialité

Gemme importante : l'application n'envoie **aucune donnée** sur des serveurs externes.
- Tout le traitement LLM est local
- La base SQLite reste sur l'appareil
- Aucune analytics, aucun tracking
- Compatible RGPD par design

---

## Appendice — Commandes de référence rapide

```bash
# Setup complet
./android-port/scripts/setup-android.sh

# Télécharger le modèle
./android-port/scripts/download-model.sh --variant gpu

# Build debug
./android-port/scripts/build-apk.sh

# Build release signé
./android-port/scripts/build-apk.sh --release --sign

# Installer sur appareil
adb install -r android-port/output/arabe-local-debug-*.apk

# Logs en temps réel
adb logcat -s GemmaLLMPlugin

# Synchroniser après modifications
npm run build && npx cap sync android

# Ouvrir Android Studio
npx cap open android
```

---

*Arabe Local Android — Propulsé par [Capacitor](https://capacitorjs.com) + [MediaPipe](https://mediapipe.dev)*
