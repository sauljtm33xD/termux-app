package com.fastdl.app.repository

import android.content.Context
import android.os.Environment
import com.fastdl.app.model.DownloadItem
import com.fastdl.app.model.DownloadStatus
import kotlinx.coroutines.*
import okhttp3.OkHttpClient
import okhttp3.Request
import java.io.File
import java.io.RandomAccessFile

class DownloadRepository(private val context: Context) {

    private val downloadDir = File(
        Environment.getExternalStoragePublicDirectory(Environment.DIRECTORY_DOWNLOADS),
        "FastDL"
    )

    private val httpClient = OkHttpClient.Builder()
        .connectTimeout(30, java.util.concurrent.TimeUnit.SECONDS)
        .readTimeout(30, java.util.concurrent.TimeUnit.SECONDS)
        .build()

    private val scope = CoroutineScope(Dispatchers.IO + Job())
    private val downloadJobs = mutableMapOf<String, Job>()

    init {
        downloadDir.mkdirs()
    }

    suspend fun downloadFile(
        item: DownloadItem,
        onProgress: suspend (DownloadItem) -> Unit
    ): Result<String> = withContext(Dispatchers.IO) {
        return@withContext try {
            val file = File(downloadDir, item.fileName)
            val tempFile = File(downloadDir, "${item.fileName}.tmp")

            val request = Request.Builder()
                .url(item.url)
                .build()

            httpClient.newCall(request).execute().use { response ->
                if (!response.isSuccessful) {
                    throw Exception("HTTP ${response.code}")
                }

                val contentLength = response.body?.contentLength() ?: -1L
                val body = response.body ?: throw Exception("Empty response body")

                val buffer = ByteArray(8192)
                var downloaded = 0L
                var lastUpdateTime = System.currentTimeMillis()
                var lastDownloadedSize = 0L

                RandomAccessFile(tempFile, "rw").use { randomFile ->
                    var bytesRead: Int

                    while (body.source().read(buffer, 8192).also { bytesRead = it } != -1) {
                        if (downloadJobs[item.id]?.isCancelled == true) {
                            tempFile.delete()
                            return@withContext Result.failure(Exception("Cancelled"))
                        }

                        randomFile.write(buffer, 0, bytesRead)
                        downloaded += bytesRead

                        val currentTime = System.currentTimeMillis()
                        if (currentTime - lastUpdateTime > 500) {
                            val speed = (downloaded - lastDownloadedSize) /
                                       ((currentTime - lastUpdateTime) / 1000f)
                            val timeRemaining = if (speed > 0) {
                                ((contentLength - downloaded) / speed).toLong()
                            } else {
                                0L
                            }

                            val progress = if (contentLength > 0) {
                                ((downloaded * 100) / contentLength).toInt()
                            } else {
                                0
                            }

                            onProgress(item.copy(
                                downloadedSize = downloaded,
                                totalSize = contentLength,
                                speed = speed,
                                progress = progress,
                                timeRemaining = timeRemaining,
                                status = DownloadStatus.DOWNLOADING,
                                filePath = file.absolutePath
                            ))

                            lastUpdateTime = currentTime
                            lastDownloadedSize = downloaded
                        }
                    }
                }

                tempFile.renameTo(file)
                Result.success(file.absolutePath)
            }
        } catch (e: Exception) {
            Result.failure(e)
        }
    }

    fun pauseDownload(id: String) {
        downloadJobs[id]?.cancel()
    }

    fun cancelDownload(id: String) {
        downloadJobs[id]?.cancel()
        downloadJobs.remove(id)
    }

    fun deleteDownload(id: String, filePath: String) {
        cancelDownload(id)
        try {
            File(filePath).delete()
            File("$filePath.tmp").delete()
        } catch (e: Exception) {
            e.printStackTrace()
        }
    }

    fun getDownloadDir(): File = downloadDir

    fun shutdown() {
        scope.cancel()
        httpClient.dispatcher.executorService.shutdown()
    }
}
