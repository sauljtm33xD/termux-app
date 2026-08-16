package com.uru.di

import com.uru.data.autonomy.AutonomousCoreImpl
import com.uru.domain.autonomy.*
import dagger.Binds
import dagger.Module
import dagger.Provides
import dagger.hilt.InstallIn
import dagger.hilt.components.SingletonComponent
import javax.inject.Singleton

@Module
@InstallIn(SingletonComponent::class)
abstract class AutonomyModule {

    @Binds
    @Singleton
    abstract fun bindAutonomousCore(impl: AutonomousCoreImpl): AutonomousCore

    // Data sources will be bound here when implementations are created
    // @Binds
    // @Singleton
    // abstract fun bindEventEngine(impl: EventEngineImpl): EventEngine
}

@Module
@InstallIn(SingletonComponent::class)
object AutonomyProvidersModule {

    @Provides
    @Singleton
    fun provideAutonomousCoreConfig(): AutonomousCoreConfig {
        return AutonomousCoreConfig(
            enableAutoExecution = true,
            requireUserConfirmationLevel = RiskLevel.HIGH,
            auditingEnabled = true,
            cryptoSigningEnabled = true,
            maxExecutionTimeMillis = 30000
        )
    }
}
