package com.autonomy.engine.presentation.ui

import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
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
import com.autonomy.engine.data.*
import com.autonomy.engine.domain.*

/**
 * Modern Jetpack Compose UI Dashboard for Android Autonomy Engine.
 */
@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun AutonomyEngineDashboard(
    eventEngine: EventEngine,
    contextEngine: ContextEngine,
    ruleEngine: RuleEngine,
    replayEngine: ReplayEngine,
    onPublishSampleEvent: () -> Unit
) {
    val metrics by eventEngine.metricsFlow.collectAsState()
    val isTimeTraveling by replayEngine.isTimeTraveling.collectAsState()
    val currentFrameIndex by replayEngine.currentFrameIndex.collectAsState()
    val frames = remember(currentFrameIndex, isTimeTraveling) { replayEngine.getFrames() }

    var selectedTab by remember { mutableStateOf(0) }
    val tabTitles = listOf("Event Stream", "Context Scopes", "Rule Pipeline", "Time-Travel")

    Scaffold(
        topBar = {
            TopAppBar(
                title = {
                    Row(verticalAlignment = Alignment.CenterVertically, horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                        Icon(Icons.Default.Bolt, contentDescription = null, tint = Color(0xFF6366F1))
                        Text(
                            text = "Android Autonomy Engine",
                            style = MaterialTheme.typography.titleMedium.copy(fontWeight = FontWeight.Bold)
                        )
                    }
                },
                actions = {
                    if (isTimeTraveling) {
                        Badge(containerColor = Color(0xFFEF4444)) {
                            Text("TIME TRAVEL (F$currentFrameIndex)", color = Color.White, modifier = Modifier.padding(4.dp))
                        }
                        IconButton(onClick = { replayEngine.exitTimeTravel() }) {
                            Icon(Icons.Default.ExitToApp, contentDescription = "Exit Time Travel", tint = Color(0xFFEF4444))
                        }
                    } else {
                        Button(
                            onClick = onPublishSampleEvent,
                            colors = ButtonDefaults.buttonColors(containerColor = Color(0xFF4F46E5))
                        ) {
                            Icon(Icons.Default.PlayArrow, contentDescription = null, modifier = Modifier.size(16.dp))
                            Spacer(Modifier.width(4.dp))
                            Text("Publish Event", fontSize = 12.sp)
                        }
                    }
                },
                colors = TopAppBarDefaults.topAppBarColors(containerColor = Color(0xFF0F172A), titleContentColor = Color.White)
            )
        },
        containerColor = Color(0xFF0B0F19)
    ) { padding ->
        Column(
            modifier = Modifier
                .fillMaxSize()
                .padding(padding)
                .padding(16.dp),
            verticalArrangement = Arrangement.spacedBy(16.dp)
        ) {
            // Metrics Header Bar
            MetricsRow(metrics = metrics)

            // Tabs Selector
            TabRow(
                selectedTabIndex = selectedTab,
                containerColor = Color(0xFF1E293B),
                contentColor = Color.White
            ) {
                tabTitles.forEachIndexed { index, title ->
                    Tab(
                        selected = selectedTab == index,
                        onClick = { selectedTab = index },
                        text = { Text(title, fontSize = 13.sp, fontWeight = if (selectedTab == index) FontWeight.Bold else FontWeight.Normal) }
                    )
                }
            }

            // Tab Content
            when (selectedTab) {
                0 -> EventStreamView(eventEngine = eventEngine)
                1 -> ContextScopesView(contextEngine = contextEngine)
                2 -> RulePipelineView(ruleEngine = ruleEngine)
                3 -> TimeTravelTimelineView(
                    frames = frames,
                    currentFrame = currentFrameIndex,
                    isTraveling = isTimeTraveling,
                    onStepBack = { replayEngine.stepBack() },
                    onStepForward = { replayEngine.stepForward() },
                    onJump = { replayEngine.enterTimeTravel(it) }
                )
            }
        }
    }
}

@Composable
fun MetricsRow(metrics: EngineMetrics) {
    Row(
        modifier = Modifier.fillMaxWidth(),
        horizontalArrangement = Arrangement.spacedBy(8.dp)
    ) {
        MetricCard(title = "Published", value = metrics.eventsPublished.toString(), color = Color(0xFF6366F1), modifier = Modifier.weight(1f))
        MetricCard(title = "Processed", value = metrics.eventsProcessed.toString(), color = Color(0xFF10B981), modifier = Modifier.weight(1f))
        MetricCard(title = "DLQ", value = metrics.eventsInDLQ.toString(), color = Color(0xFFF59E0B), modifier = Modifier.weight(1f))
        MetricCard(title = "Latency", value = "${metrics.avgDispatchLatencyMs}ms", color = Color(0xFF06B6D4), modifier = Modifier.weight(1f))
    }
}

@Composable
fun MetricCard(title: String, value: String, color: Color, modifier: Modifier = Modifier) {
    Surface(
        modifier = modifier,
        shape = RoundedCornerShape(8.dp),
        color = Color(0xFF1E293B),
        border = androidx.compose.foundation.BorderStroke(1.dp, Color(0xFF334155))
    ) {
        Column(modifier = Modifier.padding(10.dp)) {
            Text(title.uppercase(), fontSize = 9.sp, color = Color(0xFF94A3B8), fontFamily = FontFamily.Monospace)
            Text(value, fontSize = 16.sp, fontWeight = FontWeight.Bold, color = color, fontFamily = FontFamily.Monospace)
        }
    }
}

@Composable
fun EventStreamView(eventEngine: EventEngine) {
    val history = remember { eventEngine.getHistory(50) }
    LazyColumn(
        modifier = Modifier.fillMaxSize(),
        verticalArrangement = Arrangement.spacedBy(8.dp)
    ) {
        items(history.reversed()) { event ->
            EventRowItem(event = event)
        }
    }
}

@Composable
fun EventRowItem(event: EngineEvent<*>) {
    Surface(
        shape = RoundedCornerShape(8.dp),
        color = Color(0xFF1E293B),
        border = androidx.compose.foundation.BorderStroke(1.dp, Color(0xFF334155)),
        modifier = Modifier.fillMaxWidth()
    ) {
        Row(
            modifier = Modifier.padding(12.dp),
            verticalAlignment = Alignment.CenterVertically,
            horizontalArrangement = Arrangement.spacedBy(12.dp)
        ) {
            val badgeColor = when (event.metadata.priority) {
                EventPriority.CRITICAL -> Color(0xFFEF4444)
                EventPriority.HIGH -> Color(0xFFF59E0B)
                EventPriority.NORMAL -> Color(0xFF3B82F6)
                EventPriority.LOW -> Color(0xFF64748B)
            }
            Box(
                modifier = Modifier
                    .clip(RoundedCornerShape(4.dp))
                    .background(badgeColor.copy(alpha = 0.2f))
                    .padding(horizontal = 6.dp, vertical = 2.dp)
            ) {
                Text(event.metadata.priority.name, color = badgeColor, fontSize = 10.sp, fontWeight = FontWeight.Bold)
            }

            Column(modifier = Modifier.weight(1f)) {
                Text(event.topic, color = Color.White, fontWeight = FontWeight.Bold, fontSize = 13.sp, fontFamily = FontFamily.Monospace)
                Text(event.payload.toString(), color = Color(0xFF94A3B8), fontSize = 11.sp, fontFamily = FontFamily.Monospace, maxLines = 1)
            }

            Text(
                text = "${event.executionTimeMs ?: 0}ms",
                color = Color(0xFF64748B),
                fontSize = 11.sp,
                fontFamily = FontFamily.Monospace
            )
        }
    }
}

@Composable
fun ContextScopesView(contextEngine: ContextEngine) {
    val scopes = remember { contextEngine.getAllScopes() }
    LazyColumn(
        modifier = Modifier.fillMaxSize(),
        verticalArrangement = Arrangement.spacedBy(8.dp)
    ) {
        items(scopes) { scope ->
            Surface(
                shape = RoundedCornerShape(8.dp),
                color = Color(0xFF1E293B),
                border = androidx.compose.foundation.BorderStroke(1.dp, Color(0xFF334155)),
                modifier = Modifier.fillMaxWidth()
            ) {
                Column(modifier = Modifier.padding(12.dp)) {
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.SpaceBetween
                    ) {
                        Text(scope.name, color = Color(0xFF38BDF8), fontWeight = FontWeight.Bold, fontSize = 13.sp)
                        Text("Parent: ${scope.parentScopeId ?: "ROOT"}", color = Color(0xFF64748B), fontSize = 10.sp)
                    }
                    Spacer(Modifier.height(6.dp))
                    Text(
                        text = scope.variables.toString(),
                        color = Color(0xFFCBD5E1),
                        fontFamily = FontFamily.Monospace,
                        fontSize = 11.sp
                    )
                }
            }
        }
    }
}

@Composable
fun RulePipelineView(ruleEngine: RuleEngine) {
    val rules = remember { ruleEngine.getRules() }
    LazyColumn(
        modifier = Modifier.fillMaxSize(),
        verticalArrangement = Arrangement.spacedBy(8.dp)
    ) {
        items(rules) { rule ->
            Surface(
                shape = RoundedCornerShape(8.dp),
                color = Color(0xFF1E293B),
                border = androidx.compose.foundation.BorderStroke(1.dp, Color(0xFF334155)),
                modifier = Modifier.fillMaxWidth()
            ) {
                Column(modifier = Modifier.padding(12.dp)) {
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.SpaceBetween
                    ) {
                        Text(rule.name, color = Color(0xFFFCD34D), fontWeight = FontWeight.Bold, fontSize = 13.sp)
                        Text("Pattern: ${rule.triggerTopicPattern}", color = Color(0xFF64748B), fontSize = 11.sp, fontFamily = FontFamily.Monospace)
                    }
                    Spacer(Modifier.height(4.dp))
                    Text(
                        text = "Conditions: ${rule.conditions.size} | Actions: ${rule.actions.size} | Executed: ${rule.stats.executions}",
                        color = Color(0xFF94A3B8),
                        fontSize = 11.sp
                    )
                }
            }
        }
    }
}

@Composable
fun TimeTravelTimelineView(
    frames: List<TimeTravelFrame>,
    currentFrame: Int,
    isTraveling: Boolean,
    onStepBack: () -> Unit,
    onStepForward: () -> Unit,
    onJump: (Int) -> Unit
) {
    Column(
        modifier = Modifier.fillMaxSize(),
        verticalArrangement = Arrangement.spacedBy(12.dp)
    ) {
        Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.SpaceBetween,
            verticalAlignment = Alignment.CenterVertically
        ) {
            Button(onClick = onStepBack, enabled = currentFrame > 0) {
                Icon(Icons.Default.ArrowBack, contentDescription = null)
                Spacer(Modifier.width(4.dp))
                Text("Step Back")
            }

            Text("Frame: ${currentFrame + 1} / ${frames.size}", color = Color.White, fontWeight = FontWeight.Bold)

            Button(onClick = onStepForward, enabled = isTraveling) {
                Text("Step Forward")
                Spacer(Modifier.width(4.dp))
                Icon(Icons.Default.ArrowForward, contentDescription = null)
            }
        }

        LazyColumn(
            modifier = Modifier.weight(1f),
            verticalArrangement = Arrangement.spacedBy(6.dp)
        ) {
            items(frames) { frame ->
                val isSelected = frame.stepIndex == currentFrame
                Surface(
                    shape = RoundedCornerShape(6.dp),
                    color = if (isSelected) Color(0xFF3730A3) else Color(0xFF1E293B),
                    border = androidx.compose.foundation.BorderStroke(1.dp, if (isSelected) Color(0xFF818CF8) else Color(0xFF334155)),
                    modifier = Modifier
                        .fillMaxWidth()
                        .clickable { onJump(frame.stepIndex) }
                ) {
                    Row(
                        modifier = Modifier.padding(10.dp),
                        horizontalArrangement = Arrangement.SpaceBetween,
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Text(
                            text = "#${frame.stepIndex} ${frame.triggerEvent.topic}",
                            color = Color.White,
                            fontSize = 12.sp,
                            fontFamily = FontFamily.Monospace
                        )
                        Text(
                            text = "${frame.diffsGenerated.size} diffs",
                            color = Color(0xFF94A3B8),
                            fontSize = 10.sp
                        )
                    }
                }
            }
        }
    }
}
