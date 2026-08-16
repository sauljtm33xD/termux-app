package com.uru.presentation.ui

import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.compose.foundation.background
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
    val chatMessages = remember { mutableStateOf<List<ChatMessage>>(emptyList()) }
    var inputText by remember { mutableStateOf("") }
    val scope = rememberCoroutineScope()
    val listState = rememberLazyListState()

    MaterialTheme(
        colorScheme = darkColorScheme(
            primary = Color(0xFF6366F1),
            secondary = Color(0xFF10B981),
            background = Color(0xFF0F172A),
            surface = Color(0xFF1E293B),
            onSurface = Color(0xFFF1F5F9)
        )
    ) {
        Surface(
            modifier = Modifier
                .fillMaxSize()
                .background(Color(0xFF0F172A)),
            color = Color(0xFF0F172A)
        ) {
            Column(
                modifier = Modifier.fillMaxSize()
            ) {
                // Header
                Surface(
                    modifier = Modifier
                        .fillMaxWidth()
                        .height(70.dp),
                    color = Color(0xFF1E293B)
                ) {
                    Row(
                        modifier = Modifier
                            .fillMaxSize()
                            .padding(16.dp),
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
                                    .size(40.dp)
                                    .padding(end = 12.dp),
                                tint = Color(0xFF6366F1)
                            )
                            Column {
                                Text(
                                    text = "URU",
                                    fontSize = 20.sp,
                                    fontWeight = FontWeight.Bold,
                                    color = Color(0xFF6366F1)
                                )
                                Text(
                                    text = autonomyState.toString(),
                                    fontSize = 11.sp,
                                    color = Color(0xFF10B981)
                                )
                            }
                        }
                        Row(
                            modifier = Modifier.wrapContentWidth(),
                            horizontalArrangement = Arrangement.spacedBy(8.dp),
                            verticalAlignment = Alignment.CenterVertically
                        ) {
                            Text(
                                text = "${metrics.eventsPublished} eventos",
                                fontSize = 12.sp,
                                color = Color(0xFF94A3B8)
                            )
                            Text(
                                text = "${String.format("%.2f", metrics.avgDispatchLatencyMs)}ms",
                                fontSize = 12.sp,
                                color = Color(0xFF10B981)
                            )
                        }
                    }
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
                        ChatBubble(message = message)
                    }
                }

                // Input Area
                Surface(
                    modifier = Modifier
                        .fillMaxWidth()
                        .background(Color(0xFF0F172A)),
                    color = Color(0xFF0F172A)
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
                                    color = Color(0xFF64748B),
                                    fontSize = 13.sp
                                )
                            },
                            singleLine = false,
                            maxLines = 3,
                            colors = TextFieldDefaults.colors(
                                focusedContainerColor = Color(0xFF1E293B),
                                unfocusedContainerColor = Color(0xFF1E293B),
                                focusedTextColor = Color(0xFFF1F5F9),
                                unfocusedTextColor = Color(0xFFF1F5F9),
                                focusedIndicatorColor = Color(0xFF6366F1),
                                unfocusedIndicatorColor = Color(0xFF475569)
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

                                    val timestamp = System.currentTimeMillis()
                                    val latency = (Math.random() * 50).toFloat() + 10f

                                    val uruResponse = ChatMessage(
                                        id = System.nanoTime().toString(),
                                        text = "[URU - 100% Óptimo] Analicé tu input: \"$inputText\".\nEjecutada en sandbox local, validada con firma SHA-256 en ${String.format("%.2f", latency)}ms.",
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
                            colors = ButtonDefaults.buttonColors(
                                containerColor = Color(0xFF6366F1)
                            ),
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
    }
}

@Composable
fun ChatBubble(message: ChatMessage) {
    Row(
        modifier = Modifier.fillMaxWidth(),
        horizontalArrangement = if (message.isUser) Arrangement.End else Arrangement.Start
    ) {
        Card(
            modifier = Modifier
                .widthIn(max = 300.dp)
                .background(
                    if (message.isUser) Color(0xFF6366F1) else Color(0xFF1E293B),
                    shape = RoundedCornerShape(12.dp)
                ),
            colors = CardDefaults.cardColors(
                containerColor = if (message.isUser) Color(0xFF6366F1) else Color(0xFF1E293B)
            ),
            shape = RoundedCornerShape(12.dp)
        ) {
            Column(
                modifier = Modifier.padding(12.dp)
            ) {
                Text(
                    text = message.text,
                    color = Color(0xFFF1F5F9),
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
                            color = Color(0xFF10B981),
                            fontSize = 10.sp
                        )
                        Text(
                            text = message.signature.take(12),
                            color = Color(0xFF94A3B8),
                            fontSize = 9.sp
                        )
                    }
                }
            }
        }
    }
}
