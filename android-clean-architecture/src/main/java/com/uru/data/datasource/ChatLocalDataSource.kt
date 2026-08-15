package com.uru.data.datasource

import com.uru.domain.entity.MessageEntity
import kotlinx.coroutines.flow.Flow

interface ChatLocalDataSource {
    fun getAllMessages(): Flow<List<MessageEntity>>
    suspend fun saveMessage(message: MessageEntity)
    suspend fun getOfflineResponse(userMessage: String): MessageEntity
    suspend fun clearAllMessages()
}
