package com.uru.data.datasource

import com.uru.domain.entity.MessageEntity
import javax.inject.Inject

class ChatRemoteDataSourceImpl @Inject constructor() : ChatRemoteDataSource {

    override suspend fun getAIResponse(userMessage: String): MessageEntity {
        return try {
            val response = callAIAPI(userMessage)
            MessageEntity(
                id = System.currentTimeMillis().toString(),
                sender = "uru",
                content = response,
                timestamp = System.currentTimeMillis()
            )
        } catch (e: Exception) {
            throw AIServiceException("Error al obtener respuesta de IA: ${e.message}", e)
        }
    }

    private suspend fun callAIAPI(prompt: String): String {
        return "Respuesta simulada de IA para: $prompt"
    }
}

class AIServiceException(message: String, cause: Throwable) : Exception(message, cause)
