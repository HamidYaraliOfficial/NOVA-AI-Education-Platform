package com.nova.android

import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.navigation.compose.NavHost
import androidx.navigation.compose.composable
import androidx.navigation.compose.rememberNavController
import com.nova.android.ui.screens.HomeScreen
import com.nova.android.ui.screens.LoginScreen
import com.nova.android.ui.theme.NovaTheme
import com.nova.android.ui.theme.NovaThemeVariant
import dagger.hilt.android.AndroidEntryPoint

@AndroidEntryPoint
class MainActivity : ComponentActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContent {
            var themeVariant by remember { mutableStateOf(NovaThemeVariant.LIGHT) }

            NovaTheme(variant = themeVariant) {
                val navController = rememberNavController()
                NavHost(navController = navController, startDestination = "login") {
                    composable("login") {
                        LoginScreen(onLoggedIn = { navController.navigate("home") { popUpTo("login") { inclusive = true } } })
                    }
                    composable("home") {
                        HomeScreen(
                            currentTheme = themeVariant,
                            onThemeChange = { themeVariant = it }
                        )
                    }
                }
            }
        }
    }
}
