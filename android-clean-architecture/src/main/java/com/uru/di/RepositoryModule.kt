package com.uru.di

import com.uru.data.datasource.ChatLocalDataSource
import com.uru.data.datasource.ChatLocalDataSourceImpl
import com.uru.data.datasource.ChatRemoteDataSource
import com.uru.data.datasource.ChatRemoteDataSourceImpl
import com.uru.data.repository.ChatRepositoryImpl
import com.uru.domain.repository.ChatRepository
import dagger.Binds
import dagger.Module
import dagger.hilt.InstallIn
import dagger.hilt.components.SingletonComponent
import javax.inject.Singleton

@Module
@InstallIn(SingletonComponent::class)
abstract class RepositoryModule {

    @Binds
    @Singleton
    abstract fun bindChatRepository(impl: ChatRepositoryImpl): ChatRepository

    @Binds
    @Singleton
    abstract fun bindChatLocalDataSource(impl: ChatLocalDataSourceImpl): ChatLocalDataSource

    @Binds
    @Singleton
    abstract fun bindChatRemoteDataSource(impl: ChatRemoteDataSourceImpl): ChatRemoteDataSource
}
