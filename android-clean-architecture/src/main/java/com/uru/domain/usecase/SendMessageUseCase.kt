package com.uru.domain.usecase

import com.uru.domain.entity.MessageEntity
import com.uru.domain.repository.ChatRepository
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.flow
import javax.inject.Inject

class SendMessageUseCase @Inject constructor(
    private val chatRepository: ChatRepository
) {
    operator fun invoke(message: String): Flow<MessageEntity> = flow {
        try {
            val userMessage = MessageEntity(
                id = System.currentTimeMillis().toString(),
                sender = "user",
                content = message,
                timestamp = System.currentTimeMillis()
            )

            chatRepository.saveMessage(userMessage)
            emit(userMessage)

            val aiResponse = chatRepository.getAIResponse(message)
            chatRepository.saveMessage(aiResponse)
            emit(aiResponse)

        } catch (e: Exception) {
            throw MessageSendException("Error al enviar mensaje: ${e.message}", e)
        }
    }
}

class MessageSendException(message: String, cause: Throwable) : Exception(message, cause)
