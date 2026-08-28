package com.nova.android.ui.theme

import androidx.compose.foundation.isSystemInDarkTheme
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Typography
import androidx.compose.material3.darkColorScheme
import androidx.compose.material3.lightColorScheme
import androidx.compose.runtime.Composable
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.TextStyle
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.sp

/** Mirrors the four web themes so the product feels consistent across platforms. */
enum class NovaThemeVariant { LIGHT, DARK, RED, BLUE }

private val WindowsBlue = Color(0xFF0078D4)
private val WindowsBlueDark = Color(0xFF60CDFF)
private val WindowsRed = Color(0xFFC42B1C)
private val DeepBlue = Color(0xFF004E8C)

private val LightScheme = lightColorScheme(
    primary = WindowsBlue,
    onPrimary = Color.White,
    background = Color(0xFFF3F3F3),
    surface = Color.White,
    onSurface = Color(0xFF1B1B1B)
)

private val DarkScheme = darkColorScheme(
    primary = WindowsBlueDark,
    onPrimary = Color(0xFF15202B),
    background = Color(0xFF202020),
    surface = Color(0xFF2B2B2B),
    onSurface = Color.White
)

private val RedScheme = lightColorScheme(
    primary = WindowsRed,
    onPrimary = Color.White,
    background = Color(0xFFFFF5F4),
    surface = Color.White,
    onSurface = Color(0xFF1B1B1B)
)

private val BlueScheme = lightColorScheme(
    primary = DeepBlue,
    onPrimary = Color.White,
    background = Color(0xFFF0F6FC),
    surface = Color.White,
    onSurface = Color(0xFF1B1B1B)
)

val NovaTypography = Typography(
    titleLarge = TextStyle(fontWeight = FontWeight.SemiBold, fontSize = 22.sp),
    bodyMedium = TextStyle(fontWeight = FontWeight.Normal, fontSize = 14.sp)
)

@Composable
fun NovaTheme(
    variant: NovaThemeVariant = if (isSystemInDarkTheme()) NovaThemeVariant.DARK else NovaThemeVariant.LIGHT,
    content: @Composable () -> Unit
) {
    val colorScheme = when (variant) {
        NovaThemeVariant.LIGHT -> LightScheme
        NovaThemeVariant.DARK -> DarkScheme
        NovaThemeVariant.RED -> RedScheme
        NovaThemeVariant.BLUE -> BlueScheme
    }
    MaterialTheme(colorScheme = colorScheme, typography = NovaTypography, content = content)
}
