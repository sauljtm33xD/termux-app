package com.fastdl.app.model

import java.io.Serializable

data class DownloadItem(
    val id: String = System.currentTimeMillis().toString(),
    val url: String,
    val fileName: String,
    val totalSize: Long = 0L,
    val downloadedSize: Long = 0L,
    val speed: Float = 0f,
    val status: DownloadStatus = DownloadStatus.PENDING,
    val progress: Int = 0,
    val timeRemaining: Long = 0L,
    val filePath: String = ""
) : Serializable

enum class DownloadStatus {
    PENDING, DOWNLOADING, PAUSED, COMPLETED, FAILED, CANCELLED
}
