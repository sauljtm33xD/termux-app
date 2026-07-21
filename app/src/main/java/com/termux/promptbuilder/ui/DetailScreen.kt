package com.termux.promptbuilder.ui

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.ArrowBack
import androidx.compose.material.icons.filled.ContentCopy
import androidx.compose.material.icons.filled.Edit
import androidx.compose.material.icons.filled.Favorite
import androidx.compose.material.icons.filled.FavoriteBorder
import androidx.compose.material.icons.filled.Share
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.platform.LocalClipboardManager
import androidx.compose.ui.text.AnnotatedString
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.termux.promptbuilder.models.Prompt
import com.termux.promptbuilder.viewmodel.PromptViewModel

@Composable
fun DetailScreen(
    viewModel: PromptViewModel,
    prompt: Prompt,
    onNavigateBack: () -> Unit,
    onNavigateToEdit: (Prompt) -> Unit
) {
    var isFavorite by remember { mutableStateOf(prompt.isFavorite) }
    val clipboardManager = LocalClipboardManager.current
    var showCopySnackbar by remember { mutableStateOf(false) }

    Scaffold(
        topBar = {
            TopAppBar(
                title = { Text("Detalles del Prompt") },
                navigationIcon = {
                    IconButton(onClick = onNavigateBack) {
                        Icon(Icons.AutoMirrored.Filled.ArrowBack, contentDescription = "Atrás")
                    }
                },
                actions = {
                    IconButton(
                        onClick = {
                            isFavorite = !isFavorite
                            viewModel.toggleFavorite(prompt.id, prompt.isFavorite)
                        }
                    ) {
                        Icon(
                            if (isFavorite) Icons.Default.Favorite else Icons.Default.FavoriteBorder,
                            contentDescription = "Favorito",
                            tint = if (isFavorite) MaterialTheme.colorScheme.error else MaterialTheme.colorScheme.onSurfaceVariant
                        )
                    }
                    IconButton(onClick = { onNavigateToEdit(prompt) }) {
                        Icon(Icons.Default.Edit, contentDescription = "Editar")
                    }
                },
                colors = TopAppBarDefaults.topAppBarColors(
                    containerColor = MaterialTheme.colorScheme.primary,
                    titleContentColor = MaterialTheme.colorScheme.onPrimary
                )
            )
        }
    ) { padding ->
        LazyColumn(
            modifier = Modifier
                .fillMaxSize()
                .padding(padding)
                .padding(16.dp),
            verticalArrangement = Arrangement.spacedBy(16.dp)
        ) {
            item {
                Column(verticalArrangement = Arrangement.spacedBy(8.dp)) {
                    Text(
                        prompt.title,
                        fontSize = 24.sp,
                        fontWeight = FontWeight.Bold
                    )
                    Text(
                        prompt.description,
                        fontSize = 16.sp,
                        color = MaterialTheme.colorScheme.onSurfaceVariant
                    )
                }
            }

            item {
                Row(
                    modifier = Modifier
                        .fillMaxWidth()
                        .background(
                            MaterialTheme.colorScheme.surfaceContainer,
                            RoundedCornerShape(8.dp)
                        )
                        .padding(12.dp),
                    horizontalArrangement = Arrangement.spacedBy(16.dp)
                ) {
                    InfoBadge(label = "ID", value = prompt.id.toString())
                    InfoBadge(label = "Categoría", value = prompt.categoryId.toString())
                    InfoBadge(label = "Nivel", value = prompt.levelId.toString())
                }
            }

            item {
                Card(
                    shape = RoundedCornerShape(12.dp),
                    colors = CardDefaults.cardColors(
                        containerColor = MaterialTheme.colorScheme.primaryContainer
                    )
                ) {
                    Column(
                        modifier = Modifier
                            .fillMaxWidth()
                            .padding(16.dp),
                        verticalArrangement = Arrangement.spacedBy(8.dp)
                    ) {
                        Row(
                            modifier = Modifier.fillMaxWidth(),
                            horizontalArrangement = Arrangement.SpaceBetween,
                            verticalAlignment = Alignment.CenterVertically
                        ) {
                            Text(
                                "Contenido del Prompt",
                                fontSize = 14.sp,
                                fontWeight = FontWeight.Bold
                            )
                            IconButton(
                                onClick = {
                                    clipboardManager.setText(AnnotatedString(prompt.content))
                                    showCopySnackbar = true
                                },
                                modifier = Modifier.size(24.dp)
                            ) {
                                Icon(
                                    Icons.Default.ContentCopy,
                                    contentDescription = "Copiar",
                                    modifier = Modifier.size(18.dp)
                                )
                            }
                        }
                        SelectableText(prompt.content)
                    }
                }
            }

            if (prompt.tags.isNotEmpty()) {
                item {
                    Column(verticalArrangement = Arrangement.spacedBy(8.dp)) {
                        Text(
                            "Tags",
                            fontSize = 14.sp,
                            fontWeight = FontWeight.Bold
                        )
                        Row(
                            modifier = Modifier.fillMaxWidth(),
                            horizontalArrangement = Arrangement.spacedBy(4.dp)
                        ) {
                            prompt.tags.split(",").forEach { tag ->
                                Surface(
                                    color = MaterialTheme.colorScheme.secondaryContainer,
                                    shape = RoundedCornerShape(16.dp),
                                    modifier = Modifier.padding(2.dp)
                                ) {
                                    Text(
                                        tag.trim(),
                                        fontSize = 12.sp,
                                        modifier = Modifier.padding(horizontal = 8.dp, vertical = 4.dp)
                                    )
                                }
                            }
                        }
                    }
                }
            }

            item {
                Column(verticalArrangement = Arrangement.spacedBy(4.dp)) {
                    Text(
                        "Información",
                        fontSize = 14.sp,
                        fontWeight = FontWeight.Bold
                    )
                    InfoRow(label = "Creado", value = formatDate(prompt.createdAt))
                    InfoRow(label = "Actualizado", value = formatDate(prompt.updatedAt))
                }
            }

            item { Spacer(modifier = Modifier.height(16.dp)) }
        }
    }
}

@Composable
fun SelectableText(text: String) {
    Text(
        text = text,
        fontSize = 14.sp,
        modifier = Modifier
            .fillMaxWidth()
            .background(
                MaterialTheme.colorScheme.surface,
                RoundedCornerShape(8.dp)
            )
            .padding(12.dp)
    )
}

@Composable
fun InfoBadge(label: String, value: String) {
    Column(
        horizontalAlignment = Alignment.CenterHorizontally,
        modifier = Modifier.weight(1f)
    ) {
        Text(
            label,
            fontSize = 10.sp,
            color = MaterialTheme.colorScheme.onSurfaceVariant
        )
        Text(
            value,
            fontSize = 13.sp,
            fontWeight = FontWeight.SemiBold
        )
    }
}

@Composable
fun InfoRow(label: String, value: String) {
    Row(
        modifier = Modifier.fillMaxWidth(),
        horizontalArrangement = Arrangement.SpaceBetween
    ) {
        Text(
            label,
            fontSize = 12.sp,
            color = MaterialTheme.colorScheme.onSurfaceVariant
        )
        Text(
            value,
            fontSize = 12.sp,
            fontWeight = FontWeight.Medium
        )
    }
}

fun formatDate(timestamp: Long): String {
    val java8Date = java.time.Instant.ofEpochMilli(timestamp)
        .atZone(java.time.ZoneId.systemDefault())
        .toLocalDate()
    return java8Date.toString()
}
