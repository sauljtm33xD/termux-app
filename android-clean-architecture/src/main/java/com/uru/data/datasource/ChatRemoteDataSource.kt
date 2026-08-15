package com.uru.data.datasource

import com.uru.domain.entity.MessageEntity

interface ChatRemoteDataSource {
    suspend fun getAIResponse(userMessage: String): MessageEntity
}
