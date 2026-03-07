package com.arablocal.app.plugins

import android.content.Context
import android.util.Log
import com.getcapacitor.JSObject
import com.getcapacitor.Plugin
import com.getcapacitor.PluginCall
import com.getcapacitor.PluginMethod
import com.getcapacitor.annotation.CapacitorPlugin
import com.google.mediapipe.tasks.genai.llminference.LlmInference
import com.google.mediapipe.tasks.genai.llminference.LlmInference.LlmInferenceOptions
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.SupervisorJob
import kotlinx.coroutines.launch
import kotlinx.coroutines.withContext
import java.io.File

private const val TAG = "GemmaLLMPlugin"

/**
 * Plugin Capacitor pour l'inférence LLM locale avec Gemma 2B Q4.
 *
 * Utilise MediaPipe Tasks GenAI pour exécuter Gemma 2B (quantifié INT4)
 * entièrement sur l'appareil, sans connexion réseau requise.
 *
 * Architecture :
 * - Le modèle est téléchargé au premier lancement (~1.5 Go)
 * - Stocké dans le répertoire interne de l'app (non accessible à l'utilisateur)
 * - Chargé en mémoire à la demande (lazy loading)
 * - Streaming token-par-token via les événements Capacitor
 *
 * Modèles supportés :
 * - gemma-2b-it-gpu-int4.bin  → GPU (recommandé, ~2x plus rapide)
 * - gemma-2b-it-cpu-int4.bin  → CPU (fallback universel)
 * - gemma-2-2b-it-Q4_K_M.gguf → via llama.cpp (non supporté ici, voir alternatives)
 */
@CapacitorPlugin(name = "GemmaLLM")
class GemmaLLMPlugin : Plugin() {

    private var llmInference: LlmInference? = null
    private val pluginScope = CoroutineScope(SupervisorJob() + Dispatchers.IO)

    // Configuration par défaut
    private var currentModelPath: String? = null
    private var isInitialized = false
    private var activeCall: PluginCall? = null

    // ============================================================
    // INITIALISATION DU MODÈLE
    // ============================================================

    /**
     * Initialise l'inférence LLM avec le modèle Gemma.
     *
     * Appelé depuis JS :
     * ```ts
     * await GemmaLLM.initialize({
     *   modelPath: "/data/user/0/com.arablocal.app/files/gemma-2b-it-gpu-int4.bin",
     *   maxTokens: 2048,
     *   temperature: 0.7,
     *   useGpu: true
     * });
     * ```
     */
    @PluginMethod
    fun initialize(call: PluginCall) {
        val modelPath = call.getString("modelPath") ?: run {
            call.reject("modelPath requis")
            return
        }
        val maxTokens = call.getInt("maxTokens") ?: 2048
        val temperature = call.getFloat("temperature") ?: 0.7f
        val useGpu = call.getBoolean("useGpu") ?: true

        pluginScope.launch {
            try {
                // Vérifier que le fichier modèle existe
                val modelFile = File(modelPath)
                if (!modelFile.exists()) {
                    withContext(Dispatchers.Main) {
                        call.reject("Fichier modèle introuvable : $modelPath")
                    }
                    return@launch
                }

                Log.i(TAG, "Chargement du modèle : $modelPath (${modelFile.length() / 1_000_000} Mo)")

                // Libérer le modèle précédent si présent
                llmInference?.close()
                llmInference = null
                isInitialized = false

                // Construire les options MediaPipe
                val optionsBuilder = LlmInferenceOptions.builder()
                    .setModelPath(modelPath)
                    .setMaxTokens(maxTokens)
                    .setTemperature(temperature)
                    .setTopK(40)
                    .setTopP(0.95f)
                    .setRandomSeed(System.currentTimeMillis().toInt())

                // Activer GPU si disponible
                if (useGpu) {
                    try {
                        optionsBuilder.setPreferredBackend(
                            LlmInferenceOptions.Backend.GPU
                        )
                        Log.i(TAG, "Backend GPU activé")
                    } catch (e: Exception) {
                        Log.w(TAG, "GPU non disponible, basculement sur CPU : ${e.message}")
                        optionsBuilder.setPreferredBackend(
                            LlmInferenceOptions.Backend.CPU
                        )
                    }
                } else {
                    optionsBuilder.setPreferredBackend(LlmInferenceOptions.Backend.CPU)
                    Log.i(TAG, "Backend CPU activé")
                }

                // Créer l'instance LLM (peut prendre 5-30s selon l'appareil)
                llmInference = LlmInference.createFromOptions(context, optionsBuilder.build())
                currentModelPath = modelPath
                isInitialized = true

                Log.i(TAG, "Modèle Gemma chargé avec succès")

                withContext(Dispatchers.Main) {
                    val result = JSObject()
                    result.put("success", true)
                    result.put("modelPath", modelPath)
                    result.put("backend", if (useGpu) "gpu" else "cpu")
                    call.resolve(result)
                }
            } catch (e: Exception) {
                Log.e(TAG, "Erreur lors du chargement du modèle", e)
                withContext(Dispatchers.Main) {
                    call.reject("Erreur d'initialisation : ${e.message}")
                }
            }
        }
    }

    // ============================================================
    // GÉNÉRATION DE TEXTE (STREAMING)
    // ============================================================

    /**
     * Génère une réponse en streaming, token par token.
     *
     * Appelé depuis JS :
     * ```ts
     * GemmaLLM.addListener('onToken', (data) => {
     *   console.log(data.token, data.done);
     * });
     * await GemmaLLM.generate({ prompt: "Explique la lettre ع en arabe" });
     * ```
     */
    @PluginMethod
    fun generate(call: PluginCall) {
        if (!isInitialized || llmInference == null) {
            call.reject("Modèle non initialisé. Appelez initialize() d'abord.")
            return
        }

        val prompt = call.getString("prompt") ?: run {
            call.reject("prompt requis")
            return
        }

        val systemPrompt = call.getString("systemPrompt") ?: ""
        val fullPrompt = buildPrompt(systemPrompt, prompt)

        Log.d(TAG, "Génération pour prompt : ${prompt.take(80)}...")

        // Annuler la génération précédente si en cours
        activeCall?.reject("Annulé par nouvelle requête")
        activeCall = call

        pluginScope.launch {
            try {
                var fullResponse = StringBuilder()

                // Streaming via callback MediaPipe
                llmInference!!.generateResponseAsync(
                    fullPrompt,
                    { partialResult: String, done: Boolean ->
                        fullResponse.append(partialResult)

                        // Émettre l'événement vers le JS
                        val tokenData = JSObject()
                        tokenData.put("token", partialResult)
                        tokenData.put("fullContent", fullResponse.toString())
                        tokenData.put("done", done)
                        notifyListeners("onToken", tokenData)

                        if (done) {
                            Log.d(TAG, "Génération terminée (${fullResponse.length} chars)")
                            activeCall = null

                            val result = JSObject()
                            result.put("content", fullResponse.toString())
                            result.put("tokensGenerated", fullResponse.split(" ").size)
                            call.resolve(result)
                        }
                    }
                )
            } catch (e: Exception) {
                Log.e(TAG, "Erreur lors de la génération", e)
                activeCall = null
                withContext(Dispatchers.Main) {
                    call.reject("Erreur de génération : ${e.message}")
                }
            }
        }
    }

    /**
     * Génération sans streaming (attend la réponse complète).
     * Utile pour les cas où le streaming n'est pas nécessaire.
     */
    @PluginMethod
    fun generateSync(call: PluginCall) {
        if (!isInitialized || llmInference == null) {
            call.reject("Modèle non initialisé")
            return
        }

        val prompt = call.getString("prompt") ?: run {
            call.reject("prompt requis")
            return
        }

        val systemPrompt = call.getString("systemPrompt") ?: ""
        val fullPrompt = buildPrompt(systemPrompt, prompt)

        pluginScope.launch {
            try {
                val response = llmInference!!.generateResponse(fullPrompt)
                withContext(Dispatchers.Main) {
                    val result = JSObject()
                    result.put("content", response)
                    call.resolve(result)
                }
            } catch (e: Exception) {
                Log.e(TAG, "Erreur génération sync", e)
                withContext(Dispatchers.Main) {
                    call.reject("Erreur : ${e.message}")
                }
            }
        }
    }

    // ============================================================
    // GESTION DU STATUT
    // ============================================================

    /**
     * Vérifie si le modèle est chargé et prêt.
     */
    @PluginMethod
    fun getStatus(call: PluginCall) {
        val modelFile = currentModelPath?.let { File(it) }
        val result = JSObject()
        result.put("initialized", isInitialized)
        result.put("modelPath", currentModelPath)
        result.put("modelExists", modelFile?.exists() ?: false)
        result.put("modelSizeMb", (modelFile?.length() ?: 0) / 1_000_000)
        result.put("provider", "mediapipe-gemma")
        call.resolve(result)
    }

    /**
     * Vérifie si le fichier modèle est présent dans le stockage interne.
     */
    @PluginMethod
    fun checkModelFile(call: PluginCall) {
        val modelDir = context.filesDir
        val result = JSObject()

        val modelFiles = listOf(
            "gemma-2b-it-gpu-int4.bin",
            "gemma-2b-it-cpu-int4.bin",
            "gemma-2b-q4.bin"
        )

        var foundModel: String? = null
        var foundSize: Long = 0

        for (filename in modelFiles) {
            val file = File(modelDir, filename)
            if (file.exists() && file.length() > 100_000_000) { // > 100 Mo
                foundModel = file.absolutePath
                foundSize = file.length()
                break
            }
        }

        result.put("found", foundModel != null)
        result.put("path", foundModel)
        result.put("sizeMb", foundSize / 1_000_000)
        result.put("storageDir", modelDir.absolutePath)
        call.resolve(result)
    }

    /**
     * Libère les ressources du modèle (pour économiser la RAM).
     */
    @PluginMethod
    fun unload(call: PluginCall) {
        pluginScope.launch {
            try {
                llmInference?.close()
                llmInference = null
                isInitialized = false
                currentModelPath = null
                Log.i(TAG, "Modèle déchargé")
                withContext(Dispatchers.Main) {
                    call.resolve()
                }
            } catch (e: Exception) {
                withContext(Dispatchers.Main) {
                    call.reject("Erreur lors du déchargement : ${e.message}")
                }
            }
        }
    }

    // ============================================================
    // UTILITAIRES
    // ============================================================

    /**
     * Construit le prompt complet au format Gemma Instruction Tuning.
     * Format : <start_of_turn>user\n{prompt}<end_of_turn>\n<start_of_turn>model
     */
    private fun buildPrompt(systemPrompt: String, userMessage: String): String {
        return buildString {
            if (systemPrompt.isNotBlank()) {
                append("<start_of_turn>system\n")
                append(systemPrompt)
                append("<end_of_turn>\n")
            }
            append("<start_of_turn>user\n")
            append(userMessage)
            append("<end_of_turn>\n")
            append("<start_of_turn>model\n")
        }
    }

    override fun handleOnDestroy() {
        super.handleOnDestroy()
        llmInference?.close()
        llmInference = null
    }
}
