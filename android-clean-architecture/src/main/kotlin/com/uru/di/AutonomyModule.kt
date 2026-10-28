package com.autonomy.engine.di

import android.content.Context
import com.autonomy.engine.data.*
import com.autonomy.engine.domain.*
import dagger.Module
import dagger.Provides
import dagger.hilt.InstallIn
import dagger.hilt.android.qualifiers.ApplicationContext
import dagger.hilt.components.SingletonComponent
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.SupervisorJob
import javax.inject.Singleton

/**
 * Dagger / Hilt Dependency Injection Module for Android Autonomy Engine.
 */
@Module
@InstallIn(SingletonComponent::class)
object AutonomyModule {

    @Provides
    @Singleton
    fun provideCoroutineScope(): CoroutineScope {
        return CoroutineScope(Dispatchers.Default + SupervisorJob())
    }

    @Provides
    @Singleton
    fun provideEventEngine(scope: CoroutineScope): EventEngine {
        return EventEngineImpl(scope)
    }

    @Provides
    @Singleton
    fun provideContextEngine(): ContextEngine {
        return ContextEngineImpl()
    }

    @Provides
    @Singleton
    fun provideRuleEngine(
        eventEngine: EventEngine,
        contextEngine: ContextEngine
    ): RuleEngine {
        return RuleEngineImpl(eventEngine, contextEngine)
    }

    @Provides
    @Singleton
    fun provideActionEngine(
        eventEngine: EventEngine,
        contextEngine: ContextEngine
    ): ActionEngineImpl {
        return ActionEngineImpl(eventEngine, contextEngine)
    }

    @Provides
    @Singleton
    fun provideReplayEngine(
        eventEngine: EventEngine,
        contextEngine: ContextEngine,
        ruleEngine: RuleEngine
    ): ReplayEngine {
        return ReplayEngine(eventEngine, contextEngine, ruleEngine)
    }

    @Provides
    @Singleton
    fun provideSensorEventBridge(
        @ApplicationContext context: Context,
        eventEngine: EventEngine,
        contextEngine: ContextEngine,
        scope: CoroutineScope
    ): AndroidSensorEventBridge {
        return AndroidSensorEventBridge(context, eventEngine, contextEngine, scope)
    }
}
