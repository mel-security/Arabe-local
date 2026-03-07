import type { CapacitorConfig } from "@capacitor/cli";

/**
 * Configuration Capacitor pour Arabe Local — Android
 *
 * Utilisée pour wrapper l'application React existante en APK Android natif.
 * Le LLM est géré par un plugin natif Kotlin via MediaPipe (Gemma 2B Q4).
 */
const config: CapacitorConfig = {
  appId: "com.arablocal.app",
  appName: "Arabe Local",
  webDir: "../dist", // Build React depuis la racine du projet
  bundledWebRuntime: false,

  android: {
    buildOptions: {
      keystorePath: "release-keystore.jks",
      keystoreAlias: "arablocal",
    },
  },

  plugins: {
    // SQLite local (remplace rusqlite de Tauri)
    CapacitorSQLite: {
      iosDatabaseLocation: "Library/CapacitorDatabase",
      iosIsEncryption: false,
      androidIsEncryption: false,
    },

    // Paramètres de l'application
    App: {
      launchShowDuration: 500,
    },

    // Permissions réseau (pour éventuelles mises à jour)
    Network: {},
  },

  server: {
    // En développement uniquement, pointer vers le serveur Vite
    // url: "http://10.0.2.2:1420",
    cleartext: false,
    androidScheme: "https",
  },
};

export default config;
