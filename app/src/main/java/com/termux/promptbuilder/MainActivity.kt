package com.termux.promptbuilder

import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Surface
import androidx.compose.runtime.*
import androidx.lifecycle.viewmodel.compose.viewModel
import com.termux.promptbuilder.models.Prompt
import com.termux.promptbuilder.ui.CreatePromptScreen
import com.termux.promptbuilder.ui.DetailScreen
import com.termux.promptbuilder.ui.HomeScreen
import com.termux.promptbuilder.ui.ManageScreen
import com.termux.promptbuilder.ui.theme.PromptBuilderTheme
import com.termux.promptbuilder.viewmodel.PromptViewModel
import com.termux.promptbuilder.viewmodel.PromptViewModelFactory

class MainActivity : ComponentActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContent {
            PromptBuilderTheme {
                Surface(color = MaterialTheme.colorScheme.background) {
                    PromptBuilderApp(application)
                }
            }
        }
    }
}

sealed class Screen {
    object Home : Screen()
    object Create : Screen()
    data class Detail(val prompt: Prompt) : Screen()
    data class Edit(val prompt: Prompt) : Screen()
    object Manage : Screen()
}

@Composable
fun PromptBuilderApp(application: android.app.Application) {
    val viewModel: PromptViewModel = viewModel(
        factory = PromptViewModelFactory(application)
    )
    var currentScreen by remember { mutableStateOf<Screen>(Screen.Home) }

    when (val screen = currentScreen) {
        is Screen.Home -> {
            HomeScreen(
                viewModel = viewModel,
                onNavigateToCreate = { currentScreen = Screen.Create },
                onNavigateToDetail = { prompt -> currentScreen = Screen.Detail(prompt) },
                onNavigateToManage = { currentScreen = Screen.Manage }
            )
        }
        is Screen.Create -> {
            CreatePromptScreen(
                viewModel = viewModel,
                onNavigateBack = { currentScreen = Screen.Home }
            )
        }
        is Screen.Detail -> {
            DetailScreen(
                viewModel = viewModel,
                prompt = screen.prompt,
                onNavigateBack = { currentScreen = Screen.Home },
                onNavigateToEdit = { prompt -> currentScreen = Screen.Edit(prompt) }
            )
        }
        is Screen.Edit -> {
            CreatePromptScreen(
                viewModel = viewModel,
                prompt = screen.prompt,
                onNavigateBack = { currentScreen = Screen.Home }
            )
        }
        is Screen.Manage -> {
            ManageScreen(
                viewModel = viewModel,
                onNavigateBack = { currentScreen = Screen.Home }
            )
        }
    }
}
