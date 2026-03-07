# Arabe Local — Portage Android

Ce dossier contient tout le nécessaire pour packager **Arabe Local** en application Android native avec un **LLM local Gemma 2B Q4** intégré.

## Démarrage rapide

```bash
# 1. Configurer l'environnement Android
./scripts/setup-android.sh

# 2. Télécharger le modèle Gemma 2B Q4 (~1.5 Go)
./scripts/download-model.sh --variant gpu

# 3. Construire l'APK
./scripts/build-apk.sh

# 4. Installer sur un appareil connecté
adb install -r output/arabe-local-debug-$(date +%Y%m%d).apk
```

## Contenu du dossier

```
android-port/
├── README.md                          ← Ce fichier
├── ANDROID_BUILD.md                   ← Guide complet (étapes détaillées)
├── capacitor.config.ts                ← Configuration Capacitor
├── android-package-additions.json     ← Dépendances npm à ajouter
│
├── android/app/src/main/
│   ├── AndroidManifest.xml
│   ├── java/com/arablocal/app/
│   │   ├── MainActivity.kt            ← Point d'entrée Capacitor
│   │   ├── plugins/GemmaLLMPlugin.kt  ← Plugin natif Gemma 2B (MediaPipe)
│   │   └── services/ModelDownloadService.kt ← Téléchargement en arrière-plan
│   └── app/build.gradle               ← Config Gradle + dépendances
│
├── src/
│   ├── plugins/
│   │   ├── gemmaLLM.ts                ← Interface TypeScript du plugin
│   │   └── gemmaLLMWeb.ts             ← Fallback web (développement)
│   └── services/llm/providers/
│       └── gemma.ts                   ← Provider LLM Android
│
└── scripts/
    ├── setup-android.sh               ← Setup initial (à lancer une fois)
    ├── download-model.sh              ← Téléchargement du modèle
    └── build-apk.sh                   ← Construction APK/AAB
```

## Documentation complète

→ **[ANDROID_BUILD.md](ANDROID_BUILD.md)** — Guide détaillé incluant :
- Architecture technique
- Installation des outils (Java, Android SDK, NDK)
- Options de distribution du modèle Gemma
- Procédure de signature et publication Play Store
- Résolution des problèmes courants
