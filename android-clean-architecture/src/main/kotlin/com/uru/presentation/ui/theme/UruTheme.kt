package com.uru.presentation.ui.theme

import androidx.compose.material3.ColorScheme
import androidx.compose.material3.darkColorScheme
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Typography
import androidx.compose.runtime.Composable
import androidx.compose.runtime.Immutable
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.TextStyle
import androidx.compose.ui.text.font.FontFamily
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.sp

// Color Palettes for 3 Themes

// FUEGO Theme - Fire Natural Real
object FuegoTheme {
    val primary = Color(0xFFFF6B35)
    val primaryVariant = Color(0xFFFF8C42)
    val secondary = Color(0xFFFFA630)
    val background = Color(0xFF0F0F0F)
    val surface = Color(0xFF1A1A1A)
    val onSurface = Color(0xFFF5F5F5)
    val error = Color(0xFFDD2C00)
}

// AZUL FRÍO Theme - Cold Blue
object AzulFrioTheme {
    val primary = Color(0xFF00B4D8)
    val primaryVariant = Color(0xFF0096C7)
    val secondary = Color(0xFF00D9FF)
    val background = Color(0xFF0A0E27)
    val surface = Color(0xFF1A2F4A)
    val onSurface = Color(0xFFE0F2FF)
    val error = Color(0xFFFF6B6B)
}

// AZUL ELÉCTRICO Theme - Electric Blue
object AzulElectricoTheme {
    val primary = Color(0xFF6366F1)
    val primaryVariant = Color(0xFF4F46E5)
    val secondary = Color(0xFF10B981)
    val background = Color(0xFF0F172A)
    val surface = Color(0xFF1E293B)
    val onSurface = Color(0xFFF1F5F9)
    val error = Color(0xFFEF4444)
}

enum class UruThemeMode {
    FUEGO, AZUL_FRIO, AZUL_ELECTRICO
}

@Immutable
data class UruColors(
    val primary: Color,
    val primaryVariant: Color,
    val secondary: Color,
    val background: Color,
    val surface: Color,
    val onSurface: Color,
    val error: Color,
    val themeName: String
)

fun getUruColors(theme: UruThemeMode): UruColors {
    return when (theme) {
        UruThemeMode.FUEGO -> UruColors(
            primary = FuegoTheme.primary,
            primaryVariant = FuegoTheme.primaryVariant,
            secondary = FuegoTheme.secondary,
            background = FuegoTheme.background,
            surface = FuegoTheme.surface,
            onSurface = FuegoTheme.onSurface,
            error = FuegoTheme.error,
            themeName = "FUEGO"
        )
        UruThemeMode.AZUL_FRIO -> UruColors(
            primary = AzulFrioTheme.primary,
            primaryVariant = AzulFrioTheme.primaryVariant,
            secondary = AzulFrioTheme.secondary,
            background = AzulFrioTheme.background,
            surface = AzulFrioTheme.surface,
            onSurface = AzulFrioTheme.onSurface,
            error = AzulFrioTheme.error,
            themeName = "AZUL FRÍO"
        )
        UruThemeMode.AZUL_ELECTRICO -> UruColors(
            primary = AzulElectricoTheme.primary,
            primaryVariant = AzulElectricoTheme.primaryVariant,
            secondary = AzulElectricoTheme.secondary,
            background = AzulElectricoTheme.background,
            surface = AzulElectricoTheme.surface,
            onSurface = AzulElectricoTheme.onSurface,
            error = AzulElectricoTheme.error,
            themeName = "AZUL ELÉCTRICO"
        )
    }
}

fun getColorScheme(colors: UruColors): ColorScheme {
    return darkColorScheme(
        primary = colors.primary,
        secondary = colors.secondary,
        background = colors.background,
        surface = colors.surface,
        onSurface = colors.onSurface,
        error = colors.error
    )
}

val UruTypography = Typography(
    headlineSmall = TextStyle(
        fontFamily = FontFamily.Default,
        fontWeight = FontWeight.Bold,
        fontSize = 20.sp
    ),
    titleMedium = TextStyle(
        fontFamily = FontFamily.Default,
        fontWeight = FontWeight.SemiBold,
        fontSize = 16.sp
    ),
    bodyMedium = TextStyle(
        fontFamily = FontFamily.Default,
        fontWeight = FontWeight.Normal,
        fontSize = 14.sp
    ),
    bodySmall = TextStyle(
        fontFamily = FontFamily.Default,
        fontWeight = FontWeight.Normal,
        fontSize = 12.sp
    ),
    labelSmall = TextStyle(
        fontFamily = FontFamily.Default,
        fontWeight = FontWeight.Medium,
        fontSize = 11.sp
    )
)

@Composable
fun UruTheme(
    theme: UruThemeMode = UruThemeMode.AZUL_ELECTRICO,
    content: @Composable () -> Unit
) {
    val colors = getUruColors(theme)
    val colorScheme = getColorScheme(colors)

    MaterialTheme(
        colorScheme = colorScheme,
        typography = UruTypography,
        content = content
    )
}
