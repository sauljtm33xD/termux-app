package com.uru.domain.usecase

import com.uru.domain.entity.MessageEntity
import com.uru.domain.repository.ChatRepository
import kotlinx.coroutines.flow.Flow
import javax.inject.Inject

class GetChatMessagesUseCase @Inject constructor(
    private val chatRepository: ChatRepository
) {
    operator fun invoke(): Flow<List<MessageEntity>> {
        return chatRepository.getMessages()
    }
}
