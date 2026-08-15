package com.uru.domain.repository

import com.uru.domain.entity.MessageEntity
import kotlinx.coroutines.flow.Flow

interface ChatRepository {
    fun getMessages(): Flow<List<MessageEntity>>
    suspend fun saveMessage(message: MessageEntity)
    suspend fun getAIResponse(userMessage: String): MessageEntity
    suspend fun clearMessages()
}
