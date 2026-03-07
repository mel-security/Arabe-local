#!/usr/bin/env bash
# =============================================================================
# SETUP ANDROID — Arabe Local
# =============================================================================
# Ce script prépare l'environnement de build Android pour Arabe Local.
# À exécuter UNE SEULE FOIS depuis la racine du projet.
#
# Pré-requis :
#   - Node.js 18+
#   - Java 17+ (JDK)
#   - Android Studio installé (ou SDK Android en ligne de commande)
#   - ANDROID_HOME défini dans l'environnement
#
# Usage :
#   chmod +x android-port/scripts/setup-android.sh
#   ./android-port/scripts/setup-android.sh
# =============================================================================

set -euo pipefail

# Couleurs pour les messages
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

info()    { echo -e "${BLUE}[INFO]${NC} $1"; }
success() { echo -e "${GREEN}[OK]${NC} $1"; }
warn()    { echo -e "${YELLOW}[WARN]${NC} $1"; }
error()   { echo -e "${RED}[ERR]${NC} $1"; exit 1; }

echo ""
echo "╔══════════════════════════════════════════════╗"
echo "║     Arabe Local — Setup Android Build        ║"
echo "╚══════════════════════════════════════════════╝"
echo ""

# =============================================================================
# 1. VÉRIFICATION DES OUTILS REQUIS
# =============================================================================

info "Vérification des outils requis..."

# Node.js
command -v node >/dev/null 2>&1 || error "Node.js requis. Installez via https://nodejs.org"
NODE_VERSION=$(node --version | tr -d 'v' | cut -d'.' -f1)
[ "$NODE_VERSION" -ge 18 ] || error "Node.js 18+ requis (actuel: $(node --version))"
success "Node.js $(node --version) ✓"

# Java JDK
command -v java >/dev/null 2>&1 || error "Java JDK 17+ requis. Installez via https://adoptium.net"
JAVA_VERSION=$(java -version 2>&1 | awk -F '"' '/version/ {print $2}' | cut -d'.' -f1)
[ "$JAVA_VERSION" -ge 17 ] || error "Java 17+ requis (actuel: $(java -version 2>&1 | head -1))"
success "Java $(java -version 2>&1 | head -1 | awk -F '"' '{print $2}') ✓"

# Android SDK
if [ -z "${ANDROID_HOME:-}" ]; then
    # Chercher des emplacements communs
    for path in "$HOME/Android/Sdk" "$HOME/Library/Android/sdk" "/opt/android-sdk"; do
        if [ -d "$path" ]; then
            export ANDROID_HOME="$path"
            break
        fi
    done
fi

if [ -z "${ANDROID_HOME:-}" ]; then
    warn "ANDROID_HOME non défini. Définissez-le dans ~/.bashrc ou ~/.zshrc :"
    echo "    export ANDROID_HOME=\$HOME/Android/Sdk"
    echo "    export PATH=\$PATH:\$ANDROID_HOME/tools:\$ANDROID_HOME/platform-tools"
    echo ""
    warn "Si Android Studio est installé, le SDK se trouve généralement dans :"
    echo "    Linux   : ~/Android/Sdk"
    echo "    macOS   : ~/Library/Android/sdk"
    error "ANDROID_HOME requis pour la suite"
fi
success "Android SDK : $ANDROID_HOME ✓"

# ADB
command -v adb >/dev/null 2>&1 || warn "adb non trouvé dans PATH. Ajoutez \$ANDROID_HOME/platform-tools au PATH."

# =============================================================================
# 2. INSTALLATION DES DÉPENDANCES NPM
# =============================================================================

info "Installation des dépendances Capacitor..."

# Se positionner à la racine du projet
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/../.." && pwd)"
cd "$PROJECT_ROOT"

# Installer les packages Capacitor
npm install --save \
    @capacitor/core@^6.1.0 \
    @capacitor/android@^6.1.0 \
    @capacitor/app@^6.0.0 \
    @capacitor/filesystem@^6.0.0 \
    @capacitor/network@^6.0.0 \
    @capacitor/toast@^6.0.0 \
    @capacitor-community/sqlite@^6.0.1

npm install --save-dev \
    @capacitor/cli@^6.1.0

success "Dépendances Capacitor installées ✓"

# =============================================================================
# 3. COPIE DE LA CONFIGURATION CAPACITOR
# =============================================================================

info "Configuration de Capacitor..."

# Copier la config Capacitor à la racine
cp android-port/capacitor.config.ts ./ 2>/dev/null || true

success "Configuration Capacitor copiée ✓"

# =============================================================================
# 4. BUILD DE L'APPLICATION REACT
# =============================================================================

info "Build de l'application React..."
npm run build
success "Build React terminé ✓"

# =============================================================================
# 5. INITIALISATION DU PROJET ANDROID
# =============================================================================

info "Initialisation du projet Android avec Capacitor..."

# Vérifier si le projet Android existe déjà
if [ -d "android" ] && [ -f "android/build.gradle" ]; then
    warn "Projet Android déjà initialisé. Synchronisation en cours..."
    npx cap sync android
else
    # Initialiser Capacitor (crée le dossier android/)
    npx cap add android
    info "Synchronisation du projet..."
    npx cap sync android
fi

success "Projet Android initialisé ✓"

# =============================================================================
# 6. COPIE DES FICHIERS PERSONNALISÉS
# =============================================================================

info "Copie des fichiers natifs Kotlin..."

ANDROID_MAIN="android/app/src/main"
ANDROID_JAVA="$ANDROID_MAIN/java/com/arablocal/app"

# Créer les répertoires nécessaires
mkdir -p "$ANDROID_JAVA/plugins"
mkdir -p "$ANDROID_JAVA/services"

# Copier les fichiers Kotlin
cp android-port/android/app/src/main/java/com/arablocal/app/MainActivity.kt \
    "$ANDROID_JAVA/MainActivity.kt"

cp android-port/android/app/src/main/java/com/arablocal/app/plugins/GemmaLLMPlugin.kt \
    "$ANDROID_JAVA/plugins/GemmaLLMPlugin.kt"

cp android-port/android/app/src/main/java/com/arablocal/app/services/ModelDownloadService.kt \
    "$ANDROID_JAVA/services/ModelDownloadService.kt"

success "Fichiers Kotlin copiés ✓"

# =============================================================================
# 7. MISE À JOUR DU BUILD.GRADLE
# =============================================================================

info "Mise à jour des dépendances Gradle..."

# Ajouter la dépendance MediaPipe au build.gradle de l'app
GRADLE_FILE="android/app/build.gradle"

if ! grep -q "mediapipe" "$GRADLE_FILE" 2>/dev/null; then
    # Injecter la dépendance MediaPipe avant la dernière accolade
    MEDIAPIPE_DEP="    // MediaPipe LLM Inference (Gemma 2B)\n    implementation 'com.google.mediapipe:tasks-genai:0.10.14'"
    sed -i "/^dependencies {/a\\$MEDIAPIPE_DEP" "$GRADLE_FILE"
    success "Dépendance MediaPipe ajoutée au build.gradle ✓"
else
    info "Dépendance MediaPipe déjà présente"
fi

# Définir minSdkVersion à 26 (requis pour MediaPipe LLM)
sed -i 's/minSdkVersion [0-9]*/minSdkVersion 26/' "$GRADLE_FILE" 2>/dev/null || true

# Augmenter la taille du heap pour charger le modèle
if ! grep -q "largeHeap" android/app/src/main/AndroidManifest.xml 2>/dev/null; then
    sed -i 's|android:hardwareAccelerated="true"|android:hardwareAccelerated="true"\n        android:largeHeap="true"|' \
        android/app/src/main/AndroidManifest.xml 2>/dev/null || true
fi

# =============================================================================
# 8. RÉCAPITULATIF
# =============================================================================

echo ""
echo "═══════════════════════════════════════════"
success "Setup Android terminé avec succès !"
echo "═══════════════════════════════════════════"
echo ""
echo "Prochaines étapes :"
echo ""
echo "  1. Télécharger le modèle Gemma 2B Q4 :"
echo "     ./android-port/scripts/download-model.sh"
echo ""
echo "  2. Ouvrir dans Android Studio :"
echo "     npx cap open android"
echo ""
echo "  3. Ou builder directement l'APK :"
echo "     ./android-port/scripts/build-apk.sh"
echo ""
echo "  Documentation complète :"
echo "     android-port/ANDROID_BUILD.md"
echo ""
