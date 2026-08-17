package com.uru.presentation.ui.theme

import android.content.Context
import androidx.datastore.core.DataStore
import androidx.datastore.preferences.core.Preferences
import androidx.datastore.preferences.core.edit
import androidx.datastore.preferences.core.stringPreferencesKey
import androidx.datastore.preferences.preferencesDataStore
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.map

val Context.themeDataStore: DataStore<Preferences> by preferencesDataStore(name = "uru_theme_prefs")

class ThemeManager(private val context: Context) {

    companion object {
        private val THEME_KEY = stringPreferencesKey("uru_theme")
        private val KEYWORD_KEY = stringPreferencesKey("uru_keyword_hash")
        private val CAUTION_LEVEL_KEY = stringPreferencesKey("uru_caution_level")
    }

    val currentTheme: Flow<UruThemeMode> = context.themeDataStore.data.map { preferences ->
        val themeName = preferences[THEME_KEY] ?: "AZUL_ELECTRICO"
        UruThemeMode.valueOf(themeName)
    }

    suspend fun setTheme(theme: UruThemeMode) {
        context.themeDataStore.edit { preferences ->
            preferences[THEME_KEY] = theme.name
        }
    }

    val keywordHash: Flow<String> = context.themeDataStore.data.map { preferences ->
        preferences[KEYWORD_KEY] ?: ""
    }

    suspend fun setKeywordHash(hash: String) {
        context.themeDataStore.edit { preferences ->
            preferences[KEYWORD_KEY] = hash
        }
    }

    val cautionLevel: Flow<Int> = context.themeDataStore.data.map { preferences ->
        preferences[CAUTION_LEVEL_KEY]?.toIntOrNull() ?: 100
    }

    suspend fun setCautionLevel(level: Int) {
        context.themeDataStore.edit { preferences ->
            preferences[CAUTION_LEVEL_KEY] = level.toString()
        }
    }
}
