package com.uru.data.repository

import com.uru.data.datasource.ChatLocalDataSource
import com.uru.data.datasource.ChatRemoteDataSource
import com.uru.domain.entity.MessageEntity
import com.uru.domain.repository.ChatRepository
import kotlinx.coroutines.flow.Flow
import javax.inject.Inject

class ChatRepositoryImpl @Inject constructor(
    private val localDataSource: ChatLocalDataSource,
    private val remoteDataSource: ChatRemoteDataSource
) : ChatRepository {

    override fun getMessages(): Flow<List<MessageEntity>> {
        return localDataSource.getAllMessages()
    }

    override suspend fun saveMessage(message: MessageEntity) {
        localDataSource.saveMessage(message)
    }

    override suspend fun getAIResponse(userMessage: String): MessageEntity {
        return try {
            remoteDataSource.getAIResponse(userMessage)
        } catch (e: Exception) {
            localDataSource.getOfflineResponse(userMessage)
        }
    }

    override suspend fun clearMessages() {
        localDataSource.clearAllMessages()
    }
}
