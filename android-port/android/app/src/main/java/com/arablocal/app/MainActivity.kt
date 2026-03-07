package com.arablocal.app

import android.os.Bundle
import com.getcapacitor.BridgeActivity
import com.arablocal.app.plugins.GemmaLLMPlugin

/**
 * Point d'entrée principal de l'application.
 *
 * Hérite de BridgeActivity (Capacitor) qui gère le WebView
 * et la communication JS ↔ Native.
 *
 * Les plugins natifs sont enregistrés ici pour être accessibles
 * depuis le code TypeScript/React de l'application.
 */
class MainActivity : BridgeActivity() {

    override fun onCreate(savedInstanceState: Bundle?) {
        // Enregistrer les plugins AVANT super.onCreate()
        registerPlugin(GemmaLLMPlugin::class.java)

        super.onCreate(savedInstanceState)
    }
}
