package com.fastdl.app.data

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.fastdl.app.model.DownloadItem
import com.fastdl.app.model.DownloadStatus
import com.fastdl.app.repository.DownloadRepository
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch

class DownloadViewModel(private val repository: DownloadRepository) : ViewModel() {

    private val _downloads = MutableStateFlow<List<DownloadItem>>(emptyList())
    val downloads: StateFlow<List<DownloadItem>> = _downloads.asStateFlow()

    private val _currentDownload = MutableStateFlow<DownloadItem?>(null)
    val currentDownload: StateFlow<DownloadItem?> = _currentDownload.asStateFlow()

    fun addDownload(url: String, fileName: String) {
        val newDownload = DownloadItem(url = url, fileName = fileName)
        _downloads.value = _downloads.value + newDownload
    }

    fun startDownload(item: DownloadItem) {
        viewModelScope.launch {
            _currentDownload.value = item.copy(status = DownloadStatus.DOWNLOADING)

            val result = repository.downloadFile(item) { updatedItem ->
                _downloads.value = _downloads.value.map {
                    if (it.id == updatedItem.id) updatedItem else it
                }
                _currentDownload.value = updatedItem
            }

            result.onSuccess { filePath ->
                val completed = item.copy(
                    status = DownloadStatus.COMPLETED,
                    progress = 100,
                    filePath = filePath
                )
                _downloads.value = _downloads.value.map {
                    if (it.id == item.id) completed else it
                }
                _currentDownload.value = completed
            }

            result.onFailure { error ->
                val failed = item.copy(status = DownloadStatus.FAILED)
                _downloads.value = _downloads.value.map {
                    if (it.id == item.id) failed else it
                }
                _currentDownload.value = null
            }
        }
    }

    fun pauseDownload(id: String) {
        repository.pauseDownload(id)
        _downloads.value = _downloads.value.map {
            if (it.id == id) it.copy(status = DownloadStatus.PAUSED) else it
        }
    }

    fun cancelDownload(id: String) {
        val item = _downloads.value.find { it.id == id } ?: return
        repository.deleteDownload(id, item.filePath)
        _downloads.value = _downloads.value.filter { it.id != id }
    }

    fun getTotalSpeed(): Float {
        return _downloads.value.sumOf { it.speed.toDouble() }.toFloat()
    }

    override fun onCleared() {
        repository.shutdown()
        super.onCleared()
    }
}
