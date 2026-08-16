package com.uru.presentation.ui

import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontFamily
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.uru.domain.autonomy.*
import com.uru.domain.entity.MessageEntity
import com.uru.domain.entity.MessageSender
import com.uru.presentation.viewmodel.AutonomyViewModel
import com.uru.presentation.viewmodel.ChatViewModel

/**
 * Modern Jetpack Compose UI for URU Personal AI Middleware.
 */

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun UruApp(
    chatViewModel: ChatViewModel,
    autonomyViewModel: AutonomyViewModel
) {
    var currentTab by remember { mutableStateOf(0) }
    val tabs = listOf("URU Chat", "10-Step Pipeline", "AEGIS Shield", "Time-Travel")

    val autonomousState by autonomyViewModel.state.collectAsState()
    val emotionState by chatViewModel.emotionalState.collectAsState()

    Scaffold(
        topBar = {
            TopAppBar(
                title = {
                    Row(verticalAlignment = Alignment.CenterVertically, horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                        Box(
                            modifier = Modifier
                                .size(10.dp)
                                .clip(CircleShape)
                                .background(if (autonomousState == AutonomousState.IDLE) Color(0xFF10B981) else Color(0xFF6366F1))
                        )
                        Text("URU Personal AI OS", style = MaterialTheme.typography.titleMedium.copy(fontWeight = FontWeight.Bold))
                        Text(
                            text = "[$autonomousState]",
                            fontSize = 11.sp,
                            fontFamily = FontFamily.Monospace,
                            color = Color(0xFF38BDF8)
                        )
                    }
                },
                actions = {
                    Badge(containerColor = Color(0xFF1E293B)) {
                        Text(
                            text = emotionState.name,
                            color = Color(0xFFFCD34D),
                            fontSize = 10.sp,
                            modifier = Modifier.padding(horizontal = 6.dp, vertical = 2.dp)
                        )
                    }
                },
                colors = TopAppBarDefaults.topAppBarColors(containerColor = Color(0xFF0F172A), titleContentColor = Color.White)
            )
        },
        bottomBar = {
            NavigationBar(containerColor = Color(0xFF0F172A)) {
                tabs.forEachIndexed { index, title ->
                    NavigationBarItem(
                        selected = currentTab == index,
                        onClick = { currentTab = index },
                        icon = {
                            when (index) {
                                0 -> Icon(Icons.Default.Chat, contentDescription = null)
                                1 -> Icon(Icons.Default.Bolt, contentDescription = null)
                                2 -> Icon(Icons.Default.Security, contentDescription = null)
                                else -> Icon(Icons.Default.History, contentDescription = null)
                            }
                        },
                        label = { Text(title, fontSize = 10.sp) }
                    )
                }
            }
        },
        containerColor = Color(0xFF0B0F19)
    ) { padding ->
        Box(modifier = Modifier.fillMaxSize().padding(padding)) {
            when (currentTab) {
                0 -> UruChatScreen(chatViewModel = chatViewModel)
                1 -> UruPipelineScreen(autonomyViewModel = autonomyViewModel)
                2 -> AegisShieldScreen()
                3 -> TimeTravelScreen(autonomyViewModel = autonomyViewModel)
            }
        }
    }
}

@Composable
fun UruChatScreen(chatViewModel: ChatViewModel) {
    val messages by chatViewModel.messages.collectAsState()
    val isProcessing by chatViewModel.isProcessing.collectAsState()
    var inputText by remember { mutableStateOf("") }

    Column(modifier = Modifier.fillMaxSize().padding(16.dp)) {
        LazyColumn(
            modifier = Modifier.weight(1f),
            verticalArrangement = Arrangement.spacedBy(10.dp)
        ) {
            items(messages) { msg ->
                ChatBubble(message = msg)
            }
        }

        Spacer(Modifier.height(8.dp))

        Row(
            modifier = Modifier.fillMaxWidth(),
            verticalAlignment = Alignment.CenterVertically,
            horizontalArrangement = Arrangement.spacedBy(8.dp)
        ) {
            TextField(
                value = inputText,
                onValueChange = { inputText = it },
                placeholder = { Text("Escribe a URU o simula una orden...", fontSize = 12.sp) },
                modifier = Modifier.weight(1f),
                colors = TextFieldDefaults.colors(
                    focusedContainerColor = Color(0xFF1E293B),
                    unfocusedContainerColor = Color(0xFF1E293B),
                    focusedTextColor = Color.White,
                    unfocusedTextColor = Color.White
                )
            )

            Button(
                onClick = {
                    chatViewModel.sendMessage(inputText)
                    inputText = ""
                },
                enabled = inputText.isNotBlank() && !isProcessing,
                colors = ButtonDefaults.buttonColors(containerColor = Color(0xFF6366F1))
            ) {
                Icon(Icons.Default.Send, contentDescription = null, modifier = Modifier.size(16.dp))
            }
        }
    }
}

@Composable
fun ChatBubble(message: MessageEntity) {
    val isUser = message.sender == MessageSender.USER
    val bg = if (isUser) Color(0xFF4F46E5) else Color(0xFF1E293B)

    Row(
        modifier = Modifier.fillMaxWidth(),
        horizontalArrangement = if (isUser) Arrangement.End else Arrangement.Start
    ) {
        Surface(
            shape = RoundedCornerShape(12.dp),
            color = bg,
            border = if (!isUser) androidx.compose.foundation.BorderStroke(1.dp, Color(0xFF334155)) else null,
            modifier = Modifier.widthIn(max = 300.dp)
        ) {
            Column(modifier = Modifier.padding(10.dp)) {
                Text(
                    text = if (isUser) "TÚ" else "URU (AI Personal Middleware)",
                    fontSize = 9.sp,
                    fontFamily = FontFamily.Monospace,
                    color = if (isUser) Color(0xFFCBD5E1) else Color(0xFF38BDF8),
                    fontWeight = FontWeight.Bold
                )
                Spacer(Modifier.height(4.dp))
                Text(
                    text = message.content,
                    fontSize = 12.sp,
                    color = Color.White
                )
            }
        }
    }
}

@Composable
fun UruPipelineScreen(autonomyViewModel: AutonomyViewModel) {
    val metrics by autonomyViewModel.metrics.collectAsState()
    val pipelineSteps = listOf(
        "1. Event Ingestion", "2. Context Load", "3. Memory Recall (7L)",
        "4. State Transition", "5. Priority Schedule", "6. Policy Verify",
        "7. Capability Gate", "8. Risk Assess (AEGIS)", "9. Audit Hash (SHA256)", "10. Execution"
    )

    Column(modifier = Modifier.fillMaxSize().padding(16.dp), verticalArrangement = Arrangement.spacedBy(12.dp)) {
        Text("Pipeline Autónomo 10-Pasos URU", style = MaterialTheme.typography.titleSmall, color = Color.White, fontWeight = FontWeight.Bold)

        LazyColumn(verticalArrangement = Arrangement.spacedBy(6.dp)) {
            items(pipelineSteps) { step ->
                Surface(
                    shape = RoundedCornerShape(8.dp),
                    color = Color(0xFF1E293B),
                    border = androidx.compose.foundation.BorderStroke(1.dp, Color(0xFF334155)),
                    modifier = Modifier.fillMaxWidth()
                ) {
                    Row(
                        modifier = Modifier.padding(10.dp),
                        verticalAlignment = Alignment.CenterVertically,
                        horizontalArrangement = Arrangement.SpaceBetween
                    ) {
                        Text(step, color = Color(0xFFE2E8F0), fontSize = 12.sp, fontFamily = FontFamily.Monospace)
                        Icon(Icons.Default.CheckCircle, contentDescription = null, tint = Color(0xFF10B981), modifier = Modifier.size(16.dp))
                    }
                }
            }
        }

        Button(
            onClick = {
                autonomyViewModel.triggerSimulatedEvent("sms.received.suspicious", mapOf("body" to "Gana dinero facil bit.ly/34x"))
            },
            colors = ButtonDefaults.buttonColors(containerColor = Color(0xFFEF4444)),
            modifier = Modifier.fillMaxWidth()
        ) {
            Text("Simular Intrusión SMS (Test AEGIS Gate)")
        }
    }
}

@Composable
fun AegisShieldScreen() {
    Column(modifier = Modifier.fillMaxSize().padding(16.dp), verticalArrangement = Arrangement.spacedBy(12.dp)) {
        Text("AEGIS 5-Layer Security Engine", style = MaterialTheme.typography.titleSmall, color = Color(0xFF38BDF8), fontWeight = FontWeight.Bold)

        val layers = listOf(
            "Capa 1: Policy Engine" to "Restricciones estrictas del usuario offline-first",
            "Capa 2: Capability Gate" to "Aislamiento total de APIs críticas y sandbox",
            "Capa 3: Risk Assessment" to "Scoring heurístico 0-100 en 5 niveles",
            "Capa 4: Audit Log" to "Registro inmutable con hashes encadenados",
            "Capa 5: Cryptographic Signature" to "Firmas SHA-256 por cada transición de estado"
        )

        layers.forEach { (name, desc) ->
            Surface(
                shape = RoundedCornerShape(8.dp),
                color = Color(0xFF1E293B),
                border = androidx.compose.foundation.BorderStroke(1.dp, Color(0xFF334155)),
                modifier = Modifier.fillMaxWidth()
            ) {
                Column(modifier = Modifier.padding(12.dp)) {
                    Text(name, color = Color(0xFFFCD34D), fontWeight = FontWeight.Bold, fontSize = 12.sp)
                    Text(desc, color = Color(0xFF94A3B8), fontSize = 11.sp)
                }
            }
        }
    }
}

@Composable
fun TimeTravelScreen(autonomyViewModel: AutonomyViewModel) {
    Column(modifier = Modifier.fillMaxSize().padding(16.dp), verticalArrangement = Arrangement.spacedBy(12.dp)) {
        Text("Replay Engine (Time-Travel Debugging)", style = MaterialTheme.typography.titleSmall, color = Color.White, fontWeight = FontWeight.Bold)
        Text("Auditoría forense frame a frame de cada mutación en el dispositivo Android.", fontSize = 11.sp, color = Color(0xFF94A3B8))

        Row(modifier = Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.SpaceBetween) {
            Button(onClick = { autonomyViewModel.stepReplayBackward() }) {
                Icon(Icons.Default.ArrowBack, contentDescription = null)
                Spacer(Modifier.width(4.dp))
                Text("Step Back")
            }

            Button(onClick = { autonomyViewModel.stepReplayForward() }) {
                Text("Step Forward")
                Spacer(Modifier.width(4.dp))
                Icon(Icons.Default.ArrowForward, contentDescription = null)
            }
        }
    }
}
