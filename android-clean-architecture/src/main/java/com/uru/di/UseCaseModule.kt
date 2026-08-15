package com.uru.di

import com.uru.domain.repository.ChatRepository
import com.uru.domain.usecase.GetChatMessagesUseCase
import com.uru.domain.usecase.SendMessageUseCase
import dagger.Module
import dagger.Provides
import dagger.hilt.InstallIn
import dagger.hilt.components.SingletonComponent
import javax.inject.Singleton

@Module
@InstallIn(SingletonComponent::class)
object UseCaseModule {

    @Provides
    @Singleton
    fun provideGetChatMessagesUseCase(
        repository: ChatRepository
    ): GetChatMessagesUseCase {
        return GetChatMessagesUseCase(repository)
    }

    @Provides
    @Singleton
    fun provideSendMessageUseCase(
        repository: ChatRepository
    ): SendMessageUseCase {
        return SendMessageUseCase(repository)
    }
}
