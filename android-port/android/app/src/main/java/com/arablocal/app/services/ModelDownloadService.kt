package com.arablocal.app.services

import android.app.NotificationChannel
import android.app.NotificationManager
import android.app.Service
import android.content.Intent
import android.os.IBinder
import android.util.Log
import androidx.core.app.NotificationCompat
import kotlinx.coroutines.*
import java.io.File
import java.net.HttpURLConnection
import java.net.URL

private const val TAG = "ModelDownloadService"
private const val CHANNEL_ID = "model_download"
private const val NOTIF_ID = 1001

/**
 * Service de téléchargement du modèle Gemma 2B en arrière-plan.
 *
 * Télécharge le modèle quantifié Q4 depuis les serveurs Google/HuggingFace
 * et le stocke dans le répertoire interne de l'application.
 *
 * Le téléchargement est résumable : si interrompu, il reprend où il s'est arrêté.
 *
 * Sources supportées :
 * - MediaPipe official: gemma-2b-it-gpu-int4.bin (~1.5 Go)
 * - HuggingFace GGUF: gemma-2-2b-it-Q4_K_M.gguf (~1.7 Go)
 */
class ModelDownloadService : Service() {

    private val serviceScope = CoroutineScope(SupervisorJob() + Dispatchers.IO)
    private var downloadJob: Job? = null

    companion object {
        const val ACTION_START = "com.arablocal.app.DOWNLOAD_MODEL"
        const val ACTION_CANCEL = "com.arablocal.app.CANCEL_DOWNLOAD"
        const val EXTRA_URL = "model_url"
        const val EXTRA_FILENAME = "model_filename"

        // URL par défaut (modèle GPU optimisé pour MediaPipe)
        // IMPORTANT: Nécessite un compte Kaggle + token d'API pour télécharger Gemma officiel
        // Alternative publique : utiliser le miroir HuggingFace
        const val DEFAULT_MODEL_URL =
            "https://huggingface.co/google/gemma-2b-it-GGUF/resolve/main/gemma-2b-it-q4_k_m.gguf"
        const val DEFAULT_MODEL_FILENAME = "gemma-2b-q4.gguf"

        // Broadcast pour notifier l'état du téléchargement
        const val BROADCAST_PROGRESS = "com.arablocal.app.DOWNLOAD_PROGRESS"
        const val BROADCAST_COMPLETE = "com.arablocal.app.DOWNLOAD_COMPLETE"
        const val BROADCAST_ERROR = "com.arablocal.app.DOWNLOAD_ERROR"
    }

    override fun onCreate() {
        super.onCreate()
        createNotificationChannel()
    }

    override fun onStartCommand(intent: Intent?, flags: Int, startId: Int): Int {
        when (intent?.action) {
            ACTION_START -> {
                val url = intent.getStringExtra(EXTRA_URL) ?: DEFAULT_MODEL_URL
                val filename = intent.getStringExtra(EXTRA_FILENAME) ?: DEFAULT_MODEL_FILENAME
                startDownload(url, filename)
            }
            ACTION_CANCEL -> {
                cancelDownload()
            }
        }
        return START_NOT_STICKY
    }

    private fun startDownload(url: String, filename: String) {
        val destFile = File(filesDir, filename)

        if (destFile.exists() && destFile.length() > 100_000_000) {
            Log.i(TAG, "Modèle déjà présent : ${destFile.absolutePath}")
            broadcastComplete(destFile.absolutePath)
            stopSelf()
            return
        }

        startForeground(NOTIF_ID, buildNotification("Téléchargement du modèle IA...", 0))

        downloadJob = serviceScope.launch {
            try {
                Log.i(TAG, "Début du téléchargement : $url -> ${destFile.absolutePath}")
                downloadFile(url, destFile)
                Log.i(TAG, "Téléchargement terminé : ${destFile.length() / 1_000_000} Mo")
                broadcastComplete(destFile.absolutePath)
            } catch (e: CancellationException) {
                Log.i(TAG, "Téléchargement annulé")
                broadcastError("Annulé")
            } catch (e: Exception) {
                Log.e(TAG, "Erreur de téléchargement", e)
                broadcastError(e.message ?: "Erreur inconnue")
            } finally {
                stopForeground(STOP_FOREGROUND_REMOVE)
                stopSelf()
            }
        }
    }

    private suspend fun downloadFile(url: String, destFile: File) {
        val tempFile = File(filesDir, "${destFile.name}.tmp")
        val existingBytes = if (tempFile.exists()) tempFile.length() else 0

        val connection = URL(url).openConnection() as HttpURLConnection
        connection.setRequestProperty("User-Agent", "ArabeLocal/1.0 Android")

        // Support du téléchargement résumable (Range header)
        if (existingBytes > 0) {
            connection.setRequestProperty("Range", "bytes=$existingBytes-")
            Log.i(TAG, "Reprise du téléchargement à $existingBytes octets")
        }

        connection.connect()

        val responseCode = connection.responseCode
        if (responseCode !in listOf(200, 206)) {
            throw Exception("HTTP $responseCode : ${connection.responseMessage}")
        }

        val totalSize = connection.contentLengthLong + existingBytes
        Log.i(TAG, "Taille totale : ${totalSize / 1_000_000} Mo")

        connection.inputStream.use { input ->
            tempFile.outputStream().let { out ->
                // En mode reprise, ouvrir en append
                if (existingBytes > 0 && responseCode == 206) {
                    tempFile.outputStream()
                } else {
                    tempFile.outputStream()
                }
            }

            val outputStream = java.io.FileOutputStream(tempFile, existingBytes > 0 && responseCode == 206)

            val buffer = ByteArray(8192)
            var downloadedBytes = existingBytes
            var lastProgressUpdate = 0L

            outputStream.use {
                while (true) {
                    val bytesRead = input.read(buffer)
                    if (bytesRead == -1) break
                    outputStream.write(buffer, 0, bytesRead)
                    downloadedBytes += bytesRead

                    // Mettre à jour la progression toutes les 500ms
                    val now = System.currentTimeMillis()
                    if (now - lastProgressUpdate > 500) {
                        val progress = if (totalSize > 0) {
                            ((downloadedBytes.toFloat() / totalSize) * 100).toInt()
                        } else 0
                        updateNotification(downloadedBytes, totalSize)
                        broadcastProgress(progress, downloadedBytes, totalSize)
                        lastProgressUpdate = now
                    }
                }
            }
        }

        // Renommer le fichier temporaire en fichier final
        tempFile.renameTo(destFile)
        updateNotification(destFile.length(), destFile.length(), complete = true)
    }

    private fun cancelDownload() {
        downloadJob?.cancel()
    }

    private fun broadcastProgress(percent: Int, downloaded: Long, total: Long) {
        val intent = Intent(BROADCAST_PROGRESS).apply {
            putExtra("percent", percent)
            putExtra("downloaded_mb", downloaded / 1_000_000)
            putExtra("total_mb", total / 1_000_000)
        }
        sendBroadcast(intent)
    }

    private fun broadcastComplete(path: String) {
        val intent = Intent(BROADCAST_COMPLETE).apply {
            putExtra("model_path", path)
        }
        sendBroadcast(intent)
    }

    private fun broadcastError(message: String) {
        val intent = Intent(BROADCAST_ERROR).apply {
            putExtra("error", message)
        }
        sendBroadcast(intent)
    }

    private fun createNotificationChannel() {
        val channel = NotificationChannel(
            CHANNEL_ID,
            "Téléchargement modèle IA",
            NotificationManager.IMPORTANCE_LOW
        ).apply {
            description = "Progression du téléchargement du modèle Gemma"
        }
        val nm = getSystemService(NOTIFICATION_SERVICE) as NotificationManager
        nm.createNotificationChannel(channel)
    }

    private fun buildNotification(text: String, progress: Int) =
        NotificationCompat.Builder(this, CHANNEL_ID)
            .setContentTitle("Arabe Local — IA")
            .setContentText(text)
            .setSmallIcon(android.R.drawable.stat_sys_download)
            .setOngoing(true)
            .setProgress(100, progress, progress == 0)
            .build()

    private fun updateNotification(downloaded: Long, total: Long, complete: Boolean = false) {
        val nm = getSystemService(NOTIFICATION_SERVICE) as NotificationManager
        val percent = if (total > 0) ((downloaded.toFloat() / total) * 100).toInt() else 0
        val text = if (complete) {
            "Modèle téléchargé (${total / 1_000_000} Mo)"
        } else {
            "${downloaded / 1_000_000} Mo / ${total / 1_000_000} Mo — $percent%"
        }
        nm.notify(NOTIF_ID, buildNotification(text, percent))
    }

    override fun onBind(intent: Intent?): IBinder? = null

    override fun onDestroy() {
        super.onDestroy()
        downloadJob?.cancel()
        serviceScope.cancel()
    }
}
