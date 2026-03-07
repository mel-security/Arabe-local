#!/usr/bin/env bash
# =============================================================================
# BUILD APK — Arabe Local Android
# =============================================================================
# Génère un APK debug ou release de l'application Arabe Local pour Android.
#
# Usage :
#   ./android-port/scripts/build-apk.sh [--release] [--sign] [--install]
#
# Options :
#   --release   Build de release (optimisé, signé)
#   --debug     Build de debug (par défaut)
#   --sign      Signer avec un keystore (release uniquement)
#   --install   Installer directement sur un appareil connecté
#   --bundle    Générer un AAB (Android App Bundle) au lieu d'un APK
# =============================================================================

set -euo pipefail

RED='\033[0;31m'; GREEN='\033[0;32m'; YELLOW='\033[1;33m'; BLUE='\033[0;34m'; BOLD='\033[1m'; NC='\033[0m'
info()    { echo -e "${BLUE}[INFO]${NC} $1"; }
success() { echo -e "${GREEN}[OK]${NC} $1"; }
warn()    { echo -e "${YELLOW}[WARN]${NC} $1"; }
error()   { echo -e "${RED}[ERR]${NC} $1"; exit 1; }
step()    { echo -e "\n${BOLD}→ $1${NC}"; }

# =============================================================================
# ARGUMENTS
# =============================================================================
BUILD_TYPE="debug"
SIGN_APK=false
INSTALL_APK=false
BUILD_BUNDLE=false
SKIP_REACT_BUILD=false

while [[ $# -gt 0 ]]; do
    case $1 in
        --release)  BUILD_TYPE="release"; shift ;;
        --debug)    BUILD_TYPE="debug"; shift ;;
        --sign)     SIGN_APK=true; BUILD_TYPE="release"; shift ;;
        --install)  INSTALL_APK=true; shift ;;
        --bundle)   BUILD_BUNDLE=true; shift ;;
        --skip-react) SKIP_REACT_BUILD=true; shift ;;
        -h|--help)
            echo "Usage: $0 [--release] [--debug] [--sign] [--install] [--bundle]"
            exit 0 ;;
        *) error "Argument inconnu : $1" ;;
    esac
done

# =============================================================================
# CONFIGURATION
# =============================================================================
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/../.." && pwd)"
ANDROID_DIR="$PROJECT_ROOT/android"
OUTPUT_DIR="$PROJECT_ROOT/android-port/output"

mkdir -p "$OUTPUT_DIR"

echo ""
echo "╔══════════════════════════════════════════════════════════╗"
echo "║            Build APK — Arabe Local Android               ║"
echo "╚══════════════════════════════════════════════════════════╝"
echo ""
echo "  Type de build : $BUILD_TYPE"
echo "  Projet        : $PROJECT_ROOT"
echo "  Sortie        : $OUTPUT_DIR"
echo ""

# =============================================================================
# VÉRIFICATIONS PRÉ-BUILD
# =============================================================================
step "Vérifications de l'environnement"

[ -d "$ANDROID_DIR" ] || error "Projet Android non trouvé. Lancez d'abord : ./android-port/scripts/setup-android.sh"

# Vérifier Java
command -v java >/dev/null 2>&1 || error "Java JDK 17+ requis"
success "Java : $(java -version 2>&1 | head -1) ✓"

# Vérifier ANDROID_HOME
[ -n "${ANDROID_HOME:-}" ] || error "ANDROID_HOME non défini"
success "Android SDK : $ANDROID_HOME ✓"

# Vérifier le modèle Gemma
ASSETS_DIR="$ANDROID_DIR/app/src/main/assets/models"
if [ ! -d "$ASSETS_DIR" ] || [ -z "$(ls "$ASSETS_DIR" 2>/dev/null)" ]; then
    warn "Aucun modèle Gemma trouvé dans $ASSETS_DIR"
    warn "Le modèle sera téléchargé par l'application au premier lancement."
    warn "Pour le bundler dans l'APK, lancez : ./android-port/scripts/download-model.sh"
    echo ""
    read -r -p "Continuer sans modèle bundlé ? [o/N] " CONTINUE
    [[ "$CONTINUE" =~ ^[oO]$ ]] || exit 0
else
    MODEL_FILE=$(ls "$ASSETS_DIR" | head -1)
    MODEL_SIZE=$(du -sh "$ASSETS_DIR/$MODEL_FILE" | cut -f1)
    success "Modèle trouvé : $MODEL_FILE ($MODEL_SIZE) ✓"
    warn "ATTENTION : Le modèle ($MODEL_SIZE) sera inclus dans l'APK."
    warn "L'APK sera très volumineux. Considérez l'alternative : téléchargement au premier lancement."
fi

# =============================================================================
# ÉTAPE 1 : BUILD REACT
# =============================================================================
step "Build de l'application React"

if [ "$SKIP_REACT_BUILD" = false ]; then
    cd "$PROJECT_ROOT"
    info "npm run build..."
    npm run build
    success "Build React terminé ✓"
else
    info "Build React ignoré (--skip-react)"
fi

# =============================================================================
# ÉTAPE 2 : SYNC CAPACITOR
# =============================================================================
step "Synchronisation Capacitor"

cd "$PROJECT_ROOT"
info "npx cap sync android..."
npx cap sync android
success "Sync Capacitor terminé ✓"

# =============================================================================
# ÉTAPE 3 : SIGNATURE (release uniquement)
# =============================================================================

GRADLE_TASK=""
KEYSTORE_ARGS=""

if [ "$BUILD_TYPE" = "release" ]; then
    if [ "$SIGN_APK" = true ]; then
        step "Configuration de la signature"

        KEYSTORE_PATH="${KEYSTORE_PATH:-$PROJECT_ROOT/android-port/release-keystore.jks}"
        KEYSTORE_ALIAS="${KEYSTORE_ALIAS:-arablocal}"
        KEYSTORE_PASSWORD="${KEYSTORE_PASSWORD:-}"

        if [ ! -f "$KEYSTORE_PATH" ]; then
            info "Création d'un nouveau keystore de release..."
            keytool -genkey -v \
                -keystore "$KEYSTORE_PATH" \
                -alias "$KEYSTORE_ALIAS" \
                -keyalg RSA \
                -keysize 2048 \
                -validity 10000 \
                -dname "CN=Arabe Local, OU=Dev, O=ArabeLocal, L=Paris, ST=Ile-de-France, C=FR"
        fi

        success "Keystore : $KEYSTORE_PATH ✓"
        warn "Conservez ce fichier keystore en lieu sûr ! Il est nécessaire pour les mises à jour."
    fi
fi

# =============================================================================
# ÉTAPE 4 : BUILD GRADLE
# =============================================================================
step "Build Gradle ($BUILD_TYPE)"

cd "$ANDROID_DIR"

if [ "$BUILD_BUNDLE" = true ]; then
    # Android App Bundle (pour Play Store)
    GRADLE_TASK="bundle${BUILD_TYPE^}"
    ARTIFACT_EXT="aab"
else
    # APK standard
    GRADLE_TASK="assemble${BUILD_TYPE^}"
    ARTIFACT_EXT="apk"
fi

info "Tâche Gradle : $GRADLE_TASK"

# Exécuter Gradle
if [ -f "./gradlew" ]; then
    chmod +x ./gradlew
    ./gradlew "$GRADLE_TASK" \
        -Pandroid.useAndroidX=true \
        --no-daemon \
        --build-cache \
        2>&1 | tail -30
else
    error "gradlew non trouvé dans $ANDROID_DIR"
fi

# =============================================================================
# ÉTAPE 5 : LOCALISATION DE L'ARTEFACT
# =============================================================================
step "Localisation de l'artefact"

ARTIFACT_FIND="$ANDROID_DIR/app/build/outputs"

if [ "$BUILD_BUNDLE" = true ]; then
    ARTIFACT=$(find "$ARTIFACT_FIND" -name "*.aab" | head -1)
else
    ARTIFACT=$(find "$ARTIFACT_FIND" -name "*.apk" -not -name "*unsigned*" | head -1)
fi

[ -n "$ARTIFACT" ] || error "Artefact non trouvé dans $ARTIFACT_FIND"

# Copier dans le répertoire de sortie
ARTIFACT_DEST="$OUTPUT_DIR/arabe-local-${BUILD_TYPE}-$(date +%Y%m%d).${ARTIFACT_EXT}"
cp "$ARTIFACT" "$ARTIFACT_DEST"

ARTIFACT_SIZE=$(du -sh "$ARTIFACT_DEST" | cut -f1)
success "Artefact : $ARTIFACT_DEST ($ARTIFACT_SIZE) ✓"

# =============================================================================
# ÉTAPE 6 : INSTALLATION (optionnel)
# =============================================================================
if [ "$INSTALL_APK" = true ] && [ "$BUILD_BUNDLE" = false ]; then
    step "Installation sur l'appareil"

    command -v adb >/dev/null 2>&1 || error "adb requis pour l'installation"

    DEVICE=$(adb devices | grep -v "List" | grep "device$" | head -1 | cut -f1)
    [ -n "$DEVICE" ] || error "Aucun appareil Android connecté"

    info "Installation sur $DEVICE..."
    adb -s "$DEVICE" install -r "$ARTIFACT_DEST"
    success "Application installée sur $DEVICE ✓"

    # Lancer l'application
    info "Lancement de l'application..."
    adb -s "$DEVICE" shell am start -n "com.arablocal.app/.MainActivity"
fi

# =============================================================================
# RÉCAPITULATIF
# =============================================================================
echo ""
echo "═══════════════════════════════════════════════════"
success "Build terminé avec succès !"
echo "═══════════════════════════════════════════════════"
echo ""
echo "  Artefact : $ARTIFACT_DEST"
echo "  Taille   : $ARTIFACT_SIZE"
echo "  Type     : ${BUILD_TYPE} ${ARTIFACT_EXT^^}"
echo ""

if [ "$BUILD_TYPE" = "debug" ]; then
    echo "  Pour un build de release :"
    echo "    ./android-port/scripts/build-apk.sh --release --sign"
    echo ""
fi

if [ "$BUILD_BUNDLE" = false ]; then
    echo "  Pour installer sur un appareil connecté :"
    echo "    adb install -r $ARTIFACT_DEST"
    echo ""
fi

echo "  Pour ouvrir dans Android Studio :"
echo "    npx cap open android"
echo ""
