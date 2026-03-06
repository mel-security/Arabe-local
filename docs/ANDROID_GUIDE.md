# Guide de portage Android

## Stratégie recommandée : Capacitor

Pour le portage Android, la stratégie recommandée est **Capacitor** (Ionic),
qui offre une excellente compatibilité avec les projets React/Vite existants.

## Étapes de migration

### 1. Ajouter Capacitor

```bash
npm install @capacitor/core @capacitor/cli
npm install @capacitor/android
npx cap init "Arabe Local" "com.arablocal.app" --web-dir dist
npx cap add android
```

### 2. Remplacer le plugin SQLite

```bash
npm install @capacitor-community/sqlite
```

Modifier `src/services/database.ts` :
```typescript
// Détecter l'environnement
const isCapacitor = typeof (window as unknown).Capacitor !== 'undefined';
const isTauri = typeof window !== 'undefined' && '__TAURI__' in window;

async function invoke<T>(command: string, args?: Record<string, unknown>): Promise<T> {
  if (isTauri) {
    // Tauri (desktop)
    const { invoke: tauriInvoke } = await import("@tauri-apps/api/tauri");
    return tauriInvoke<T>(command, args);
  } else if (isCapacitor) {
    // Capacitor (Android/iOS)
    return capacitorSqliteInvoke<T>(command, args);
  }
  // Web mock
  return getMockData<T>(command, args);
}
```

### 3. Adapter le stockage des fichiers médias

```typescript
import { Filesystem, Directory } from '@capacitor/filesystem';

// Lire un fichier audio local (Android)
const readAudioFile = async (path: string) => {
  const result = await Filesystem.readFile({
    path: `audio/${path}`,
    directory: Directory.Data,
  });
  return `data:audio/mp3;base64,${result.data}`;
};
```

### 4. Build Android

```bash
npm run build
npx cap sync android
npx cap open android  # Ouvre Android Studio
```

Dans Android Studio :
1. Build > Generate Signed Bundle/APK
2. Sélectionner APK
3. Configurer la clé de signature
4. Build Release

### 5. Configuration AndroidManifest.xml

```xml
<uses-permission android:name="android.permission.READ_EXTERNAL_STORAGE" />
<uses-permission android:name="android.permission.WRITE_EXTERNAL_STORAGE" />
<uses-permission android:name="android.permission.INTERNET" />  <!-- Pour YouTube -->

<!-- Support des caractères arabes -->
<application
    android:supportsRtl="true"
    ...>
```

### 6. Polices arabes sur Android

Copier les polices dans `android/app/src/main/assets/fonts/` :
- `AmiriRegular.ttf`
- `ScheherazadeNew-Regular.ttf`

```css
/* Dans index.css — fallback Android */
.arabic-text {
  font-family: "Scheherazade New", "Amiri", "Scheherazade",
               "Arabic Typesetting", serif;
}
```

## Structure cible Android

```
android/
├── app/
│   ├── src/main/
│   │   ├── assets/
│   │   │   ├── public/          ← build React
│   │   │   └── fonts/           ← polices arabes
│   │   └── res/
│   │       └── raw/
│   │           └── quran_audio/ ← audio optionnel embarqué
│   └── build.gradle
└── capacitor.settings.gradle
```

## Alternatives

### Option 2 : Tauri Mobile (alpha)
```bash
rustup target add aarch64-linux-android
cargo tauri android init
cargo tauri android dev
```
> ⚠️ Encore en alpha (2024). À surveiller pour 2025.

### Option 3 : PWA (Progressive Web App)
Le plus simple — ajouter dans `vite.config.ts` :
```typescript
import { VitePWA } from 'vite-plugin-pwa';
```
Limitations : pas d'accès aux fichiers système locaux.

## Checklist avant portage

- [ ] Tester l'UI sur écran 360dp (mobile)
- [ ] Vérifier le scroll RTL sur Android WebView
- [ ] Optimiser les images (WebP, max 500KB)
- [ ] Tester la lecture audio `.mp3` natif Android
- [ ] Vérifier les polices arabes sur Android 8+
- [ ] Gérer la rotation d'écran (portrait forcé recommandé)
- [ ] Tester sur Android 9, 11, 13
