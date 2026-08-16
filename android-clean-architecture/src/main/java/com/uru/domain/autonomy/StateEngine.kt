package com.uru.domain.autonomy

import kotlinx.coroutines.flow.Flow

interface StateEngine {
    fun observeState(): Flow<AutonomousState>
    suspend fun setState(state: AutonomousState)
    suspend fun getState(): AutonomousState
    suspend fun transitionTo(newState: AutonomousState): Boolean
}

enum class AutonomousState {
    IDLE,           // Esperando eventos
    LISTENING,      // Escuchando entrada del usuario
    PROCESSING,     // Procesando comando/evento
    DECIDING,       // Evaluando AEGIS policies
    EXECUTING,      // Ejecutando acción autorizada
    AWAITING,       // Esperando confirmación del usuario
    ERROR,          // Error en el procesamiento
    LEARNING        // Aprendiendo de la interacción
}

data class StateTransition(
    val fromState: AutonomousState,
    val toState: AutonomousState,
    val trigger: String,
    val reason: String,
    val timestamp: Long = System.currentTimeMillis()
)
