package com.uru.presentation.di

import android.content.Context
import com.uru.presentation.ui.theme.ThemeManager
import dagger.Module
import dagger.Provides
import dagger.hilt.InstallIn
import dagger.hilt.android.qualifiers.ApplicationContext
import dagger.hilt.components.SingletonComponent
import javax.inject.Singleton

@Module
@InstallIn(SingletonComponent::class)
object ThemeModule {

    @Singleton
    @Provides
    fun provideThemeManager(
        @ApplicationContext context: Context
    ): ThemeManager {
        return ThemeManager(context)
    }
}
