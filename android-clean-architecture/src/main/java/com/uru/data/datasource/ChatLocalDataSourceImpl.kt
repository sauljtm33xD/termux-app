package com.uru.data.datasource

import com.uru.domain.entity.MessageEntity
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.asStateFlow
import javax.inject.Inject
import javax.inject.Singleton

@Singleton
class ChatLocalDataSourceImpl @Inject constructor() : ChatLocalDataSource {

    private val messagesStateFlow = MutableStateFlow<List<MessageEntity>>(emptyList())

    override fun getAllMessages(): Flow<List<MessageEntity>> {
        return messagesStateFlow.asStateFlow()
    }

    override suspend fun saveMessage(message: MessageEntity) {
        val currentMessages = messagesStateFlow.value.toMutableList()
        currentMessages.add(message)
        messagesStateFlow.emit(currentMessages)
    }

    override suspend fun getOfflineResponse(userMessage: String): MessageEntity {
        val offlineResponses = mapOf(
            "hola" to "Hola! Soy URU, tu asistente de IA personal. ¿Cómo puedo ayudarte?",
            "luz" to "Controlando luces del hogar...",
            "temperatura" to "La temperatura actual es de 22°C",
            "batería" to "La batería del dispositivo está al 85%",
            "reunión" to "Tienes una reunión en 30 minutos",
            "clima" to "Clima: Parcialmente nublado, 24°C"
        )

        val response = offlineResponses[userMessage.lowercase()]
            ?: "Lo siento, no estoy conectado. Intenta de nuevo cuando tengas conexión."

        return MessageEntity(
            id = System.currentTimeMillis().toString(),
            sender = "uru",
            content = response,
            timestamp = System.currentTimeMillis()
        )
    }

    override suspend fun clearAllMessages() {
        messagesStateFlow.emit(emptyList())
    }
}
