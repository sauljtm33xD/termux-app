package com.uru.presentation.ui

import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.lazy.rememberLazyListState
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.hilt.navigation.compose.hiltViewModel
import androidx.lifecycle.compose.collectAsStateWithLifecycle
import com.uru.presentation.ui.theme.UruTheme
import com.uru.presentation.ui.theme.UruThemeMode
import com.uru.presentation.ui.theme.getUruColors
import com.uru.presentation.viewmodel.AutonomyViewModel
import dagger.hilt.android.AndroidEntryPoint
import kotlinx.coroutines.launch

data class ChatMessage(
    val id: String,
    val text: String,
    val isUser: Boolean,
    val timestamp: Long = System.currentTimeMillis(),
    val metadata: String = "",
    val latencyMs: Float = 0f,
    val signature: String = ""
)

@AndroidEntryPoint
class MainActivity : ComponentActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContent {
            UruApp()
        }
    }
}

@Composable
fun UruApp(
    viewModel: AutonomyViewModel = hiltViewModel()
) {
    val autonomyState by viewModel.autonomyState.collectAsStateWithLifecycle()
    val metrics by viewModel.metrics.collectAsStateWithLifecycle()
    val currentTheme by viewModel.currentTheme.collectAsStateWithLifecycle()
    val cautionLevel by viewModel.cautionLevel.collectAsStateWithLifecycle()
    val showKeywordDialog by viewModel.showKeywordDialog.collectAsStateWithLifecycle()
    val chatMessages = remember { mutableStateOf<List<ChatMessage>>(emptyList()) }
    var inputText by remember { mutableStateOf("") }
    var keywordInput by remember { mutableStateOf("") }
    val scope = rememberCoroutineScope()
    val listState = rememberLazyListState()
    var showThemeMenu by remember { mutableStateOf(false) }
    var showSettings by remember { mutableStateOf(false) }

    UruTheme(theme = currentTheme) {
        val colors = getUruColors(currentTheme)

        Surface(
            modifier = Modifier
                .fillMaxSize()
                .background(colors.background),
            color = colors.background
        ) {
            Column(modifier = Modifier.fillMaxSize()) {
                // Header with Theme & Settings
                UruHeader(
                    autonomyState = autonomyState,
                    metrics = metrics,
                    cautionLevel = cautionLevel,
                    colors = colors,
                    onThemeClick = { showThemeMenu = !showThemeMenu },
                    onSettingsClick = { showSettings = !showSettings }
                )

                // Theme Selector
                if (showThemeMenu) {
                    ThemeSelector(
                        currentTheme = currentTheme,
                        colors = colors,
                        onThemeSelected = { theme ->
                            viewModel.setTheme(theme)
                            showThemeMenu = false
                        }
                    )
                }

                // Chat Messages
                LazyColumn(
                    modifier = Modifier
                        .weight(1f)
                        .fillMaxWidth()
                        .padding(16.dp),
                    state = listState,
                    verticalArrangement = Arrangement.spacedBy(12.dp)
                ) {
                    items(chatMessages.value) { message ->
                        ChatBubble(message = message, colors = colors)
                    }
                }

                // Input Area
                Surface(
                    modifier = Modifier
                        .fillMaxWidth()
                        .background(colors.background),
                    color = colors.background
                ) {
                    Row(
                        modifier = Modifier
                            .fillMaxWidth()
                            .padding(12.dp),
                        horizontalArrangement = Arrangement.spacedBy(8.dp),
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        TextField(
                            value = inputText,
                            onValueChange = { inputText = it },
                            modifier = Modifier
                                .weight(1f)
                                .heightIn(min = 48.dp),
                            placeholder = {
                                Text(
                                    "Escribe un comando o pregunta...",
                                    color = colors.onSurface.copy(alpha = 0.5f),
                                    fontSize = 13.sp
                                )
                            },
                            singleLine = false,
                            maxLines = 3,
                            colors = TextFieldDefaults.colors(
                                focusedContainerColor = colors.surface,
                                unfocusedContainerColor = colors.surface,
                                focusedTextColor = colors.onSurface,
                                unfocusedTextColor = colors.onSurface,
                                focusedIndicatorColor = colors.primary,
                                unfocusedIndicatorColor = colors.surface
                            ),
                            shape = RoundedCornerShape(8.dp)
                        )
                        Button(
                            onClick = {
                                if (inputText.isNotBlank()) {
                                    val userMessage = ChatMessage(
                                        id = System.nanoTime().toString(),
                                        text = inputText,
                                        isUser = true
                                    )
                                    chatMessages.value = chatMessages.value + userMessage

                                    scope.launch {
                                        listState.scrollToItem(chatMessages.value.size - 1)
                                    }

                                    viewModel.publishEvent(
                                        topic = "user.input",
                                        payload = mapOf("message" to inputText)
                                    )

                                    val latency = (Math.random() * 50).toFloat() + 10f
                                    val cautiousness = if (cautionLevel > 70) "⚠️" else "✓"

                                    val uruResponse = ChatMessage(
                                        id = System.nanoTime().toString(),
                                        text = "$cautiousness URU - Analicé tu input: \"$inputText\".\nEjecutada en sandbox local, validada con firma SHA-256 en ${String.format("%.2f", latency)}ms.",
                                        isUser = false,
                                        latencyMs = latency,
                                        signature = "sha256_${System.nanoTime().toString().take(16)}"
                                    )
                                    chatMessages.value = chatMessages.value + uruResponse

                                    scope.launch {
                                        listState.scrollToItem(chatMessages.value.size - 1)
                                    }

                                    inputText = ""
                                }
                            },
                            modifier = Modifier
                                .height(48.dp)
                                .width(48.dp),
                            colors = ButtonDefaults.buttonColors(containerColor = colors.primary),
                            shape = RoundedCornerShape(8.dp)
                        ) {
                            Icon(
                                imageVector = Icons.Filled.Send,
                                contentDescription = "Send",
                                tint = Color.White,
                                modifier = Modifier.size(20.dp)
                            )
                        }
                    }
                }
            }
        }

        // Keyword Verification Dialog
        if (showKeywordDialog) {
            KeywordDialog(
                onSubmit = { keyword ->
                    viewModel.verifyKeyword(keyword) { isValid ->
                        if (isValid) {
                            viewModel.onKeywordVerified()
                        } else {
                            viewModel.onKeywordFailed()
                        }
                    }
                    if (keywordInput.isEmpty()) {
                        viewModel.setKeywordHash(keyword)
                    }
                    keywordInput = ""
                },
                colors = colors,
                keywordInput = keywordInput,
                onKeywordChange = { keywordInput = it }
            )
        }
    }
}

@Composable
fun UruHeader(
    autonomyState: Any,
    metrics: Any,
    cautionLevel: Int,
    colors: com.uru.presentation.ui.theme.UruColors,
    onThemeClick: () -> Unit,
    onSettingsClick: () -> Unit
) {
    Surface(
        modifier = Modifier
            .fillMaxWidth()
            .height(80.dp),
        color = colors.surface
    ) {
        Column(
            modifier = Modifier
                .fillMaxSize()
                .padding(12.dp)
        ) {
            Row(
                modifier = Modifier
                    .fillMaxWidth()
                    .weight(1f),
                verticalAlignment = Alignment.CenterVertically,
                horizontalArrangement = Arrangement.SpaceBetween
            ) {
                Row(
                    verticalAlignment = Alignment.CenterVertically,
                    modifier = Modifier.weight(1f)
                ) {
                    Icon(
                        imageVector = Icons.Filled.SmartToy,
                        contentDescription = "URU",
                        modifier = Modifier
                            .size(32.dp)
                            .padding(end = 8.dp),
                        tint = colors.primary
                    )
                    Column {
                        Text(
                            text = "URU",
                            fontSize = 16.sp,
                            fontWeight = FontWeight.Bold,
                            color = colors.primary
                        )
                        Text(
                            text = autonomyState.toString(),
                            fontSize = 10.sp,
                            color = colors.secondary
                        )
                    }
                }
                Row(
                    modifier = Modifier.wrapContentWidth(),
                    horizontalArrangement = Arrangement.spacedBy(4.dp),
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    IconButton(onClick = onThemeClick, modifier = Modifier.size(32.dp)) {
                        Icon(
                            imageVector = Icons.Filled.Palette,
                            contentDescription = "Theme",
                            tint = colors.primary,
                            modifier = Modifier.size(18.dp)
                        )
                    }
                    IconButton(onClick = onSettingsClick, modifier = Modifier.size(32.dp)) {
                        Icon(
                            imageVector = Icons.Filled.Settings,
                            contentDescription = "Settings",
                            tint = colors.primary,
                            modifier = Modifier.size(18.dp)
                        )
                    }
                }
            }

            // Metrics & Caution Level
            Row(
                modifier = Modifier
                    .fillMaxWidth()
                    .height(24.dp),
                verticalAlignment = Alignment.CenterVertically,
                horizontalArrangement = Arrangement.spacedBy(8.dp)
            ) {
                Text(
                    text = "⚠️ Precaución: $cautionLevel%",
                    fontSize = 11.sp,
                    color = if (cautionLevel > 70) colors.error else colors.secondary
                )
                LinearProgressIndicator(
                    progress = { cautionLevel / 100f },
                    modifier = Modifier
                        .weight(1f)
                        .height(4.dp),
                    color = if (cautionLevel > 70) colors.error else colors.secondary,
                    trackColor = colors.surface
                )
            }
        }
    }
}

@Composable
fun ThemeSelector(
    currentTheme: UruThemeMode,
    colors: com.uru.presentation.ui.theme.UruColors,
    onThemeSelected: (UruThemeMode) -> Unit
) {
    Surface(
        modifier = Modifier
            .fillMaxWidth()
            .padding(8.dp),
        color = colors.surface,
        shape = RoundedCornerShape(8.dp)
    ) {
        Column(
            modifier = Modifier
                .fillMaxWidth()
                .padding(8.dp),
            verticalArrangement = Arrangement.spacedBy(4.dp)
        ) {
            listOf(UruThemeMode.FUEGO, UruThemeMode.AZUL_FRIO, UruThemeMode.AZUL_ELECTRICO).forEach { theme ->
                val isSelected = theme == currentTheme
                Button(
                    onClick = { onThemeSelected(theme) },
                    modifier = Modifier.fillMaxWidth(),
                    colors = ButtonDefaults.buttonColors(
                        containerColor = if (isSelected) colors.primary else colors.surface
                    )
                ) {
                    Text(
                        text = theme.name.replace("_", " "),
                        color = if (isSelected) Color.White else colors.onSurface
                    )
                }
            }
        }
    }
}

@Composable
fun KeywordDialog(
    onSubmit: (String) -> Unit,
    colors: com.uru.presentation.ui.theme.UruColors,
    keywordInput: String,
    onKeywordChange: (String) -> Unit
) {
    AlertDialog(
        onDismissRequest = {},
        title = {
            Text(
                text = "Palabra Clave de Conexión",
                color = colors.primary,
                fontWeight = FontWeight.Bold
            )
        },
        text = {
            Column(verticalArrangement = Arrangement.spacedBy(8.dp)) {
                Text(
                    text = "Ingresa tu palabra clave personal para iniciar el protocolo",
                    color = colors.onSurface,
                    fontSize = 12.sp
                )
                TextField(
                    value = keywordInput,
                    onValueChange = onKeywordChange,
                    modifier = Modifier.fillMaxWidth(),
                    placeholder = { Text("Palabra clave...", color = colors.onSurface.copy(0.5f)) },
                    colors = TextFieldDefaults.colors(
                        focusedContainerColor = colors.surface,
                        unfocusedContainerColor = colors.surface,
                        focusedTextColor = colors.onSurface,
                        unfocusedTextColor = colors.onSurface,
                        focusedIndicatorColor = colors.primary
                    ),
                    shape = RoundedCornerShape(4.dp)
                )
            }
        },
        confirmButton = {
            Button(
                onClick = { onSubmit(keywordInput) },
                colors = ButtonDefaults.buttonColors(containerColor = colors.primary)
            ) {
                Text("Verificar", color = Color.White)
            }
        },
        containerColor = colors.surface,
        titleContentColor = colors.primary,
        textContentColor = colors.onSurface
    )
}

@Composable
fun ChatBubble(
    message: ChatMessage,
    colors: com.uru.presentation.ui.theme.UruColors
) {
    Row(
        modifier = Modifier.fillMaxWidth(),
        horizontalArrangement = if (message.isUser) Arrangement.End else Arrangement.Start
    ) {
        Card(
            modifier = Modifier.widthIn(max = 300.dp),
            colors = CardDefaults.cardColors(
                containerColor = if (message.isUser) colors.primary else colors.surface
            ),
            shape = RoundedCornerShape(12.dp)
        ) {
            Column(modifier = Modifier.padding(12.dp)) {
                Text(
                    text = message.text,
                    color = colors.onSurface,
                    fontSize = 13.sp,
                    lineHeight = 18.sp
                )

                if (!message.isUser && message.latencyMs > 0) {
                    Spacer(modifier = Modifier.height(8.dp))
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.SpaceBetween
                    ) {
                        Text(
                            text = "⏱ ${String.format("%.2f", message.latencyMs)}ms",
                            color = colors.secondary,
                            fontSize = 10.sp
                        )
                        Text(
                            text = message.signature.take(12),
                            color = colors.onSurface.copy(alpha = 0.6f),
                            fontSize = 9.sp
                        )
                    }
                }
            }
        }
    }
}
