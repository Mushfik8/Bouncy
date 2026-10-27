package com.mushfik8.bouncypocketquest

import android.content.Context
import android.os.Bundle
import android.view.View
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Surface
import androidx.compose.runtime.*
import androidx.compose.ui.Modifier
import com.mushfik8.bouncypocketquest.game.audio.AudioSynthesizer
import com.mushfik8.bouncypocketquest.game.data.SaveRepository
import com.mushfik8.bouncypocketquest.ui.screens.*

enum class AppScreen {
    MAIN_MENU,
    WORLD_SELECT,
    LEVEL_SELECT,
    GAMEPLAY,
    SETTINGS,
    HOW_TO_PLAY
}

class MainActivity : ComponentActivity() {
    private lateinit var audioSynthesizer: AudioSynthesizer
    private lateinit var saveRepository: SaveRepository

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        
        // Fullscreen immersive sticky mode for gaming
        window.decorView.systemUiVisibility = (
            View.SYSTEM_UI_FLAG_IMMERSIVE_STICKY
            or View.SYSTEM_UI_FLAG_FULLSCREEN
            or View.SYSTEM_UI_FLAG_HIDE_NAVIGATION
            or View.SYSTEM_UI_FLAG_LAYOUT_STABLE
            or View.SYSTEM_UI_FLAG_LAYOUT_HIDE_NAVIGATION
            or View.SYSTEM_UI_FLAG_LAYOUT_FULLSCREEN
        )

        audioSynthesizer = AudioSynthesizer(this)
        saveRepository = SaveRepository(this)

        setContent {
            MaterialTheme {
                Surface(modifier = Modifier.fillMaxSize()) {
                    var currentScreen by remember { mutableStateOf(AppScreen.MAIN_MENU) }
                    var selectedWorldIndex by remember { mutableStateOf(0) }
                    var activeLevelId by remember { mutableStateOf(1) }

                    when (currentScreen) {
                        AppScreen.MAIN_MENU -> MainMenuScreen(
                            onPlay = {
                                activeLevelId = saveRepository.getLastUnlockedLevel()
                                currentScreen = AppScreen.GAMEPLAY
                            },
                            onWorldSelect = { currentScreen = AppScreen.WORLD_SELECT },
                            onSettings = { currentScreen = AppScreen.SETTINGS },
                            onHowToPlay = { currentScreen = AppScreen.HOW_TO_PLAY },
                            audio = audioSynthesizer,
                            saveRepo = saveRepository
                        )

                        AppScreen.WORLD_SELECT -> WorldSelectScreen(
                            onSelectWorld = { worldIdx ->
                                selectedWorldIndex = worldIdx
                                currentScreen = AppScreen.LEVEL_SELECT
                            },
                            onBack = { currentScreen = AppScreen.MAIN_MENU },
                            saveRepo = saveRepository
                        )

                        AppScreen.LEVEL_SELECT -> LevelSelectScreen(
                            worldIndex = selectedWorldIndex,
                            onPlayLevel = { levelId ->
                                activeLevelId = levelId
                                currentScreen = AppScreen.GAMEPLAY
                            },
                            onBack = { currentScreen = AppScreen.WORLD_SELECT },
                            saveRepo = saveRepository
                        )

                        AppScreen.GAMEPLAY -> GameScreen(
                            levelId = activeLevelId,
                            onExitToMenu = { currentScreen = AppScreen.MAIN_MENU },
                            onNextLevel = { nextId ->
                                activeLevelId = nextId
                            },
                            audio = audioSynthesizer,
                            saveRepo = saveRepository
                        )

                        AppScreen.SETTINGS -> SettingsScreen(
                            onBack = { currentScreen = AppScreen.MAIN_MENU },
                            saveRepo = saveRepository,
                            audio = audioSynthesizer
                        )

                        AppScreen.HOW_TO_PLAY -> HowToPlayScreen(
                            onBack = { currentScreen = AppScreen.MAIN_MENU }
                        )
                    }
                }
            }
        }
    }

    override fun onDestroy() {
        super.onDestroy()
        audioSynthesizer.release()
    }
}
