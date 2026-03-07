#!/usr/bin/env bash
# =============================================================================
# TÉLÉCHARGEMENT DU MODÈLE GEMMA 2B Q4 — Arabe Local Android
# =============================================================================
# Télécharge le modèle Gemma 2B quantifié (Q4) depuis HuggingFace.
#
# Le modèle sera placé dans :
#   android/app/src/main/assets/models/gemma-2b-q4.bin
#
# Taille approximative : 1.5 - 1.7 Go selon la variante
# Temps de téléchargement : 5-20 min selon la connexion
#
# Usage :
#   ./android-port/scripts/download-model.sh [--variant cpu|gpu] [--dest /chemin]
#
# Variantes disponibles :
#   cpu  → gemma-2b-it-cpu-int4.bin (MediaPipe CPU, universelle)
#   gpu  → gemma-2b-it-gpu-int4.bin (MediaPipe GPU, 2x plus rapide)
#   gguf → gemma-2b-it-Q4_K_M.gguf (format GGUF, nécessite llama.cpp)
# =============================================================================

set -euo pipefail

RED='\033[0;31m'; GREEN='\033[0;32m'; YELLOW='\033[1;33m'; BLUE='\033[0;34m'; NC='\033[0m'
info()    { echo -e "${BLUE}[INFO]${NC} $1"; }
success() { echo -e "${GREEN}[OK]${NC} $1"; }
warn()    { echo -e "${YELLOW}[WARN]${NC} $1"; }
error()   { echo -e "${RED}[ERR]${NC} $1"; exit 1; }

# =============================================================================
# ARGUMENTS
# =============================================================================
VARIANT="gpu"     # cpu | gpu | gguf
DEST_DIR=""       # Chemin de destination (optionnel)
FORCE=false       # Forcer le re-téléchargement

while [[ $# -gt 0 ]]; do
    case $1 in
        --variant)  VARIANT="$2"; shift 2 ;;
        --dest)     DEST_DIR="$2"; shift 2 ;;
        --force)    FORCE=true; shift ;;
        -h|--help)
            echo "Usage: $0 [--variant cpu|gpu|gguf] [--dest /chemin] [--force]"
            exit 0 ;;
        *) error "Argument inconnu : $1" ;;
    esac
done

# =============================================================================
# CONFIGURATION DES SOURCES
# =============================================================================

# Répertoire du projet
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/../.." && pwd)"

# Destination par défaut : assets Android
if [ -z "$DEST_DIR" ]; then
    DEST_DIR="$PROJECT_ROOT/android/app/src/main/assets/models"
fi
mkdir -p "$DEST_DIR"

# =============================================================================
# SOURCES DES MODÈLES
# =============================================================================
# IMPORTANT : Gemma est sous licence Google.
# Pour les modèles officiels MediaPipe, vous devez :
# 1. Accepter les CGU sur https://ai.google.dev/gemma/terms
# 2. Créer un compte Kaggle et générer un token API
# 3. Utiliser le token pour le téléchargement authentifié
#
# Alternative LIBRE : Gemma 2B GGUF sur HuggingFace (modèle communautaire)
# Aucune inscription requise.
# =============================================================================

case "$VARIANT" in
    gpu)
        # Modèle officiel Google — GPU (MediaPipe) — ~1.3 Go
        # NÉCESSITE : KAGGLE_USERNAME + KAGGLE_KEY (voir README)
        MODEL_NAME="gemma-2b-it-gpu-int4.bin"
        MODEL_URL_KAGGLE="https://www.kaggle.com/api/v1/models/google/gemma/tfLite/gemma-2b-it-gpu-int4/1/download"
        # Miroir HuggingFace (format compatible MediaPipe converti par la communauté)
        MODEL_URL_HF="https://huggingface.co/litert-community/Gemma2-2B-IT/resolve/main/gemma2-2b-it-gpu-int4.bin"
        MODEL_SIZE_GB="1.3"
        ;;
    cpu)
        # Modèle officiel Google — CPU (MediaPipe) — ~1.3 Go
        MODEL_NAME="gemma-2b-it-cpu-int4.bin"
        MODEL_URL_KAGGLE="https://www.kaggle.com/api/v1/models/google/gemma/tfLite/gemma-2b-it-cpu-int4/1/download"
        MODEL_URL_HF="https://huggingface.co/litert-community/Gemma2-2B-IT/resolve/main/gemma2-2b-it-cpu-int4.bin"
        MODEL_SIZE_GB="1.3"
        ;;
    gguf)
        # Format GGUF (communautaire, HuggingFace) — ~1.7 Go
        # Compatible llama.cpp mais PAS directement avec MediaPipe
        # (nécessite une conversion ou llama.cpp Android)
        MODEL_NAME="gemma-2b-it-Q4_K_M.gguf"
        MODEL_URL_HF="https://huggingface.co/google/gemma-2b-it-GGUF/resolve/main/gemma-2b-it-q4_k_m.gguf"
        MODEL_URL_KAGGLE=""
        MODEL_SIZE_GB="1.7"
        warn "Le format GGUF nécessite une compilation de llama.cpp pour Android."
        warn "Recommandé pour les utilisateurs avancés uniquement."
        ;;
    *)
        error "Variante inconnue : $VARIANT (utilisez cpu, gpu, ou gguf)"
        ;;
esac

DEST_FILE="$DEST_DIR/$MODEL_NAME"

# =============================================================================
# VÉRIFICATION SI DÉJÀ TÉLÉCHARGÉ
# =============================================================================

if [ -f "$DEST_FILE" ] && [ "$FORCE" = false ]; then
    SIZE_MB=$(du -m "$DEST_FILE" | cut -f1)
    if [ "$SIZE_MB" -gt 500 ]; then
        success "Modèle déjà présent : $DEST_FILE ($SIZE_MB Mo)"
        info "Utilisez --force pour re-télécharger"
        exit 0
    fi
fi

echo ""
echo "╔══════════════════════════════════════════════════════════╗"
echo "║         Téléchargement du modèle Gemma 2B Q4             ║"
echo "╚══════════════════════════════════════════════════════════╝"
echo ""
echo "  Variante  : $VARIANT"
echo "  Fichier   : $MODEL_NAME"
echo "  Taille    : ~$MODEL_SIZE_GB Go"
echo "  Destination: $DEST_FILE"
echo ""

# =============================================================================
# CHOIX DE LA SOURCE ET TÉLÉCHARGEMENT
# =============================================================================

download_with_progress() {
    local url="$1"
    local dest="$2"
    local temp="${dest}.tmp"

    # Taille déjà téléchargée (pour reprise)
    local existing=0
    [ -f "$temp" ] && existing=$(stat -c%s "$temp" 2>/dev/null || stat -f%z "$temp" 2>/dev/null || echo 0)

    info "Téléchargement depuis : $url"
    [ "$existing" -gt 0 ] && info "Reprise à partir de $existing octets..."

    if command -v wget >/dev/null 2>&1; then
        wget \
            --continue \
            --progress=bar:force \
            --output-document="$temp" \
            "$url" || return 1
    elif command -v curl >/dev/null 2>&1; then
        curl \
            --location \
            --continue-at - \
            --progress-bar \
            --output "$temp" \
            "$url" || return 1
    else
        error "wget ou curl requis pour le téléchargement"
    fi

    mv "$temp" "$dest"
    return 0
}

# Essayer Kaggle en premier si les credentials sont disponibles
DOWNLOADED=false

if [ -n "${KAGGLE_USERNAME:-}" ] && [ -n "${KAGGLE_KEY:-}" ] && [ -n "$MODEL_URL_KAGGLE" ]; then
    info "Utilisation des credentials Kaggle..."

    # Kaggle requiert une authentification Basic
    AUTH=$(echo -n "$KAGGLE_USERNAME:$KAGGLE_KEY" | base64)

    if command -v curl >/dev/null 2>&1; then
        info "Téléchargement depuis Kaggle..."
        if curl \
            --location \
            --header "Authorization: Basic $AUTH" \
            --progress-bar \
            --output "$DEST_FILE" \
            "$MODEL_URL_KAGGLE"; then
            DOWNLOADED=true
            success "Téléchargement Kaggle réussi"
        else
            warn "Échec Kaggle, essai HuggingFace..."
        fi
    fi
fi

# Fallback HuggingFace
if [ "$DOWNLOADED" = false ]; then
    info "Téléchargement depuis HuggingFace (aucun compte requis)..."

    if download_with_progress "$MODEL_URL_HF" "$DEST_FILE"; then
        DOWNLOADED=true
    else
        error "Échec du téléchargement. Vérifiez votre connexion internet."
    fi
fi

# =============================================================================
# VÉRIFICATION DE L'INTÉGRITÉ
# =============================================================================

if [ -f "$DEST_FILE" ]; then
    FINAL_SIZE_MB=$(du -m "$DEST_FILE" | cut -f1)
    FINAL_SIZE_GB=$(echo "scale=1; $FINAL_SIZE_MB / 1024" | bc 2>/dev/null || echo "$FINAL_SIZE_MB Mo")

    if [ "$FINAL_SIZE_MB" -lt 100 ]; then
        error "Fichier trop petit ($FINAL_SIZE_MB Mo). Téléchargement incomplet."
    fi

    echo ""
    success "Modèle téléchargé avec succès !"
    echo "  Fichier : $DEST_FILE"
    echo "  Taille  : ${FINAL_SIZE_GB} Go"
    echo ""
else
    error "Fichier de destination introuvable après téléchargement"
fi

# =============================================================================
# COPIE DANS LE STOCKAGE INTERNE (pour push sur appareil de test)
# =============================================================================

if command -v adb >/dev/null 2>&1; then
    # Vérifier si un appareil est connecté
    DEVICE=$(adb devices | grep -v "List" | grep "device$" | head -1 | cut -f1)
    if [ -n "$DEVICE" ]; then
        echo ""
        read -r -p "Appareil Android détecté ($DEVICE). Copier le modèle sur l'appareil ? [o/N] " PUSH_TO_DEVICE
        if [[ "$PUSH_TO_DEVICE" =~ ^[oO]$ ]]; then
            info "Copie sur l'appareil Android..."
            DEVICE_PATH="/data/data/com.arablocal.app/files/$MODEL_NAME"
            adb -s "$DEVICE" push "$DEST_FILE" "$DEVICE_PATH"
            success "Modèle copié sur l'appareil : $DEVICE_PATH"
        fi
    fi
fi

echo ""
info "Prochaine étape : construire l'APK"
echo "  ./android-port/scripts/build-apk.sh"
echo ""
echo "  Ou ouvrir dans Android Studio :"
echo "  npx cap open android"
echo ""
