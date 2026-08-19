package com.uru.presentation.viewmodel

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.uru.domain.autonomy.*
import com.uru.domain.entity.MessageEntity
import com.uru.domain.usecase.GetChatMessagesUseCase
import com.uru.domain.usecase.ProcessEventUseCase
import com.uru.domain.usecase.SendMessageUseCase
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.flow.*
import kotlinx.coroutines.launch
import javax.inject.Inject

/**
 * URU Presentation Layer - Hilt ViewModels (StateFlow + Coroutines).
 */

@HiltViewModel
class ChatViewModel @Inject constructor(
    private val getChatMessagesUseCase: GetChatMessagesUseCase,
    private val sendMessageUseCase: SendMessageUseCase,
    private val autonomousCore: IAutonomousCore
) : ViewModel() {

    val messages: StateFlow<List<MessageEntity>> = getChatMessagesUseCase()
        .stateIn(viewModelScope, SharingStarted.WhileSubscribed(5000), emptyList())

    val emotionalState: StateFlow<UruEmotionState> = autonomousCore.emotionFlow
    val autonomousState: StateFlow<AutonomousState> = autonomousCore.stateFlow

    private val _isProcessing = MutableStateFlow(false)
    val isProcessing: StateFlow<Boolean> = _isProcessing.asStateFlow()

    fun sendMessage(content: String) {
        if (content.isBlank()) return
        viewModelScope.launch {
            _isProcessing.value = true
            try {
                sendMessageUseCase(content)
            } finally {
                _isProcessing.value = false
            }
        }
    }
}

@HiltViewModel
class AutonomyViewModel @Inject constructor(
    private val autonomousCore: IAutonomousCore,
    private val processEventUseCase: ProcessEventUseCase,
    private val eventEngine: IEventEngine,
    private val replayEngine: IReplayEngine
) : ViewModel() {

    val state: StateFlow<AutonomousState> = autonomousCore.stateFlow
    val metrics: StateFlow<EngineMetrics> = eventEngine.metricsFlow

    fun triggerSimulatedEvent(topic: String, payload: Map<String, Any?>) {
        viewModelScope.launch {
            processEventUseCase(topic, payload, EventPriority.HIGH)
        }
    }

    fun stepReplayBackward() {
        viewModelScope.launch {
            replayEngine.stepBackward()
        }
    }

    fun stepReplayForward() {
        viewModelScope.launch {
            replayEngine.stepForward()
        }
    }
}

@HiltViewModel
class AegisSecurityViewModel @Inject constructor(
    private val aegisSecurity: IAegisSecurityEngine
) : ViewModel() {

    private val _auditLogs = MutableStateFlow<List<AuditRecord>>(emptyList())
    val auditLogs: StateFlow<List<AuditRecord>> = _auditLogs.asStateFlow()

    init {
        refreshAuditLogs()
    }

    fun refreshAuditLogs() {
        _auditLogs.value = aegisSecurity.getAuditLog()
    }
}
