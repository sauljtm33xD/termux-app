package com.fastdl.app.ui

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.text.KeyboardActions
import androidx.compose.foundation.text.KeyboardOptions
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.text.input.ImeAction
import androidx.compose.ui.unit.dp
import com.fastdl.app.data.DownloadViewModel
import com.fastdl.app.model.DownloadItem
import com.fastdl.app.model.DownloadStatus
import kotlin.math.roundToInt

@Composable
fun DownloadListScreen(viewModel: DownloadViewModel) {
    var urlInput by remember { mutableStateOf("") }
    val downloads by viewModel.downloads.collectAsState()
    val currentDownload by viewModel.currentDownload.collectAsState()

    Scaffold(
        topBar = {
            TopAppBar(
                title = { Text("FastDL - Descargador Ultrarrápido") },
                colors = TopAppBarDefaults.topAppBarColors(
                    containerColor = MaterialTheme.colorScheme.primary
                )
            )
        }
    ) { paddingValues ->
        Column(
            modifier = Modifier
                .fillMaxSize()
                .padding(paddingValues)
                .padding(16.dp)
        ) {
            // URL Input Section
            Card(
                modifier = Modifier.fillMaxWidth(),
                colors = CardDefaults.cardColors(
                    containerColor = MaterialTheme.colorScheme.surfaceVariant
                )
            ) {
                Column(modifier = Modifier.padding(16.dp)) {
                    Text("Agregar Descarga", style = MaterialTheme.typography.titleMedium)
                    Spacer(modifier = Modifier.height(8.dp))

                    Row(modifier = Modifier.fillMaxWidth()) {
                        TextField(
                            value = urlInput,
                            onValueChange = { urlInput = it },
                            modifier = Modifier
                                .weight(1f)
                                .padding(end = 8.dp),
                            placeholder = { Text("Pega la URL aquí") },
                            keyboardOptions = KeyboardOptions(imeAction = ImeAction.Done),
                            keyboardActions = KeyboardActions(
                                onDone = {
                                    if (urlInput.isNotBlank()) {
                                        val fileName = urlInput.substringAfterLast("/")
                                            .substringBefore("?")
                                            .ifBlank { "download" }
                                        viewModel.addDownload(urlInput, fileName)
                                        urlInput = ""
                                    }
                                }
                            ),
                            singleLine = true,
                            colors = TextFieldDefaults.colors(
                                focusedContainerColor = MaterialTheme.colorScheme.surface,
                                unfocusedContainerColor = MaterialTheme.colorScheme.surface
                            )
                        )
                        Button(
                            onClick = {
                                if (urlInput.isNotBlank()) {
                                    val fileName = urlInput.substringAfterLast("/")
                                        .substringBefore("?")
                                        .ifBlank { "download" }
                                    viewModel.addDownload(urlInput, fileName)
                                    urlInput = ""
                                }
                            }
                        ) {
                            Icon(Icons.Filled.Add, contentDescription = "Agregar")
                        }
                    }
                }
            }

            Spacer(modifier = Modifier.height(16.dp))

            // Stats
            if (downloads.isNotEmpty()) {
                Card(
                    modifier = Modifier.fillMaxWidth(),
                    colors = CardDefaults.cardColors(
                        containerColor = MaterialTheme.colorScheme.tertiaryContainer
                    )
                ) {
                    Row(
                        modifier = Modifier
                            .fillMaxWidth()
                            .padding(16.dp),
                        horizontalArrangement = Arrangement.SpaceBetween
                    ) {
                        Column {
                            Text("Descargas Activas", style = MaterialTheme.typography.labelSmall)
                            Text(
                                downloads.count { it.status == DownloadStatus.DOWNLOADING }.toString(),
                                style = MaterialTheme.typography.headlineSmall
                            )
                        }
                        Column {
                            Text("Velocidad Total", style = MaterialTheme.typography.labelSmall)
                            Text(
                                formatSpeed(viewModel.getTotalSpeed()),
                                style = MaterialTheme.typography.headlineSmall
                            )
                        }
                        Column {
                            Text("Completadas", style = MaterialTheme.typography.labelSmall)
                            Text(
                                downloads.count { it.status == DownloadStatus.COMPLETED }.toString(),
                                style = MaterialTheme.typography.headlineSmall
                            )
                        }
                    }
                }
                Spacer(modifier = Modifier.height(16.dp))
            }

            // Download List
            if (downloads.isEmpty()) {
                Box(
                    modifier = Modifier
                        .fillMaxSize()
                        .fillMaxWidth(),
                    contentAlignment = Alignment.Center
                ) {
                    Column(horizontalAlignment = Alignment.CenterHorizontally) {
                        Icon(
                            Icons.Filled.CloudDownload,
                            contentDescription = "Sin descargas",
                            modifier = Modifier.size(64.dp),
                            tint = MaterialTheme.colorScheme.outline
                        )
                        Spacer(modifier = Modifier.height(16.dp))
                        Text("No hay descargas", style = MaterialTheme.typography.bodyLarge)
                        Text("Agrega una URL para comenzar", style = MaterialTheme.typography.bodySmall)
                    }
                }
            } else {
                LazyColumn(modifier = Modifier.fillMaxSize()) {
                    items(downloads) { download ->
                        DownloadItemCard(download, viewModel)
                        Spacer(modifier = Modifier.height(8.dp))
                    }
                }
            }
        }
    }
}

@Composable
fun DownloadItemCard(item: DownloadItem, viewModel: DownloadViewModel) {
    Card(
        modifier = Modifier.fillMaxWidth(),
        colors = CardDefaults.cardColors(
            containerColor = MaterialTheme.colorScheme.surface
        )
    ) {
        Column(modifier = Modifier.padding(12.dp)) {
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Column(modifier = Modifier.weight(1f)) {
                    Text(item.fileName, style = MaterialTheme.typography.labelLarge)
                    Spacer(modifier = Modifier.height(4.dp))
                    Text(
                        "${formatSize(item.downloadedSize)} / ${formatSize(item.totalSize)}",
                        style = MaterialTheme.typography.labelSmall
                    )
                }
                StatusBadge(item.status)
            }

            Spacer(modifier = Modifier.height(8.dp))

            LinearProgressIndicator(
                progress = item.progress / 100f,
                modifier = Modifier.fillMaxWidth()
            )

            Spacer(modifier = Modifier.height(8.dp))

            Row(
                modifier = Modifier
                    .fillMaxWidth()
                    .height(20.dp),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Text(
                    "⚡ ${formatSpeed(item.speed)} | ⏱ ${formatTime(item.timeRemaining)}",
                    style = MaterialTheme.typography.labelSmall
                )

                Row(horizontalArrangement = Arrangement.spacedBy(4.dp)) {
                    if (item.status == DownloadStatus.DOWNLOADING) {
                        IconButton(
                            onClick = { viewModel.pauseDownload(item.id) },
                            modifier = Modifier.size(24.dp)
                        ) {
                            Icon(Icons.Filled.Pause, contentDescription = "Pausar", modifier = Modifier.size(16.dp))
                        }
                    }
                    if (item.status == DownloadStatus.PAUSED) {
                        IconButton(
                            onClick = { viewModel.startDownload(item) },
                            modifier = Modifier.size(24.dp)
                        ) {
                            Icon(Icons.Filled.PlayArrow, contentDescription = "Reanudar", modifier = Modifier.size(16.dp))
                        }
                    }
                    IconButton(
                        onClick = { viewModel.cancelDownload(item.id) },
                        modifier = Modifier.size(24.dp)
                    ) {
                        Icon(Icons.Filled.Close, contentDescription = "Cancelar", modifier = Modifier.size(16.dp))
                    }
                }
            }
        }
    }
}

@Composable
fun StatusBadge(status: DownloadStatus) {
    val containerColor = when (status) {
        DownloadStatus.DOWNLOADING -> MaterialTheme.colorScheme.primary
        DownloadStatus.COMPLETED -> MaterialTheme.colorScheme.tertiary
        DownloadStatus.FAILED -> MaterialTheme.colorScheme.error
        DownloadStatus.PAUSED -> MaterialTheme.colorScheme.secondary
        else -> MaterialTheme.colorScheme.outline
    }

    AssistChip(
        onClick = {},
        label = { Text(status.name) },
        colors = AssistChipDefaults.assistChipColors(
            containerColor = containerColor.copy(alpha = 0.3f)
        )
    )
}

fun formatSize(bytes: Long): String {
    return when {
        bytes <= 0 -> "0 B"
        bytes < 1024 -> "$bytes B"
        bytes < 1024 * 1024 -> "${String.format("%.1f", bytes / 1024f)} KB"
        bytes < 1024 * 1024 * 1024 -> "${String.format("%.1f", bytes / (1024f * 1024f))} MB"
        else -> "${String.format("%.1f", bytes / (1024f * 1024f * 1024f))} GB"
    }
}

fun formatSpeed(bytesPerSec: Float): String {
    return when {
        bytesPerSec <= 0 -> "0 B/s"
        bytesPerSec < 1024 -> "${bytesPerSec.roundToInt()} B/s"
        bytesPerSec < 1024 * 1024 -> "${String.format("%.1f", bytesPerSec / 1024f)} KB/s"
        else -> "${String.format("%.2f", bytesPerSec / (1024f * 1024f))} MB/s"
    }
}

fun formatTime(seconds: Long): String {
    return when {
        seconds <= 0 -> "-"
        seconds < 60 -> "${seconds}s"
        seconds < 3600 -> "${seconds / 60}m"
        else -> "${seconds / 3600}h"
    }
}
