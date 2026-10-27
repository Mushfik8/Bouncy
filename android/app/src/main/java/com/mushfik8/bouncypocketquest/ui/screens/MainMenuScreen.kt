package com.mushfik8.bouncypocketquest.ui.screens

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.*
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.mushfik8.bouncypocketquest.game.audio.AudioSynthesizer
import com.mushfik8.bouncypocketquest.game.data.SaveRepository

@Composable
fun MainMenuScreen(
    onPlay: () -> Unit,
    onWorldSelect: () -> Unit,
    onSettings: () -> Unit,
    onHowToPlay: () -> Unit,
    audio: AudioSynthesizer,
    saveRepo: SaveRepository
) {
    Box(
        modifier = Modifier
            .fillMaxSize()
            .background(
                Brush.verticalGradient(
                    listOf(Color(0xFF0F172A), Color(0xFF1E293B), Color(0xFF0284C7))
                )
            ),
        contentAlignment = Alignment.Center
    ) {
        Column(
            horizontalAlignment = Alignment.CenterHorizontally,
            verticalArrangement = Arrangement.Center,
            modifier = Modifier.padding(24.dp)
        ) {
            Text(
                text = "BOUNCY",
                color = Color(0xFFDC2626),
                fontSize = 44.sp,
                fontWeight = FontWeight.ExtraBold,
                letterSpacing = 2.sp
            )
            Text(
                text = "POCKET QUEST",
                color = Color(0xFFFBBF24),
                fontSize = 18.sp,
                fontWeight = FontWeight.Bold,
                letterSpacing = 4.sp,
                modifier = Modifier.padding(bottom = 24.dp)
            )

            Button(
                onClick = {
                    audio.playJump()
                    onPlay()
                },
                colors = ButtonDefaults.buttonColors(containerColor = Color(0xFF22C55E)),
                shape = RoundedCornerShape(12.dp),
                modifier = Modifier
                    .width(220.dp)
                    .height(48.dp)
            ) {
                Text(
                    text = "PLAY NOW",
                    fontWeight = FontWeight.Bold,
                    fontSize = 16.sp,
                    color = Color.White
                )
            }

            Spacer(modifier = Modifier.height(12.dp))

            Button(
                onClick = onWorldSelect,
                colors = ButtonDefaults.buttonColors(containerColor = Color(0xFF334155)),
                shape = RoundedCornerShape(12.dp),
                modifier = Modifier
                    .width(220.dp)
                    .height(44.dp)
            ) {
                Text(text = "WORLDS & LEVELS", color = Color.White)
            }

            Spacer(modifier = Modifier.height(10.dp))

            Row(horizontalArrangement = Arrangement.spacedBy(10.dp)) {
                Button(
                    onClick = onSettings,
                    colors = ButtonDefaults.buttonColors(containerColor = Color(0xFF1E293B)),
                    shape = RoundedCornerShape(12.dp),
                    modifier = Modifier.width(105.dp)
                ) {
                    Text(text = "SETTINGS", fontSize = 12.sp, color = Color(0xFF94A3B8))
                }

                Button(
                    onClick = onHowToPlay,
                    colors = ButtonDefaults.buttonColors(containerColor = Color(0xFF1E293B)),
                    shape = RoundedCornerShape(12.dp),
                    modifier = Modifier.width(105.dp)
                ) {
                    Text(text = "HOW TO PLAY", fontSize = 11.sp, color = Color(0xFF94A3B8))
                }
            }

            Spacer(modifier = Modifier.height(16.dp))

            Text(
                text = "Unlocked: Level ${saveRepo.getLastUnlockedLevel()} / 100",
                color = Color(0xFFCBD5E1),
                fontSize = 12.sp
            )
        }
    }
}

@Composable
fun WorldSelectScreen(
    onSelectWorld: (Int) -> Unit,
    onBack: () -> Unit,
    saveRepo: SaveRepository
) {
    val worlds = listOf(
        "Green Hills", "Crystal Caves", "Frostbound Ruins",
        "Gearwork Factory", "Ember Depths", "Skybound Frontier"
    )

    Column(
        modifier = Modifier
            .fillMaxSize()
            .background(Color(0xFF090D16))
            .padding(16.dp),
        horizontalAlignment = Alignment.CenterHorizontally
    ) {
        Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.SpaceBetween,
            verticalAlignment = Alignment.CenterVertically
        ) {
            Button(onClick = onBack) { Text("Back") }
            Text("SELECT WORLD", color = Color.White, fontWeight = FontWeight.Bold, fontSize = 20.sp)
            Spacer(modifier = Modifier.width(48.dp))
        }

        Spacer(modifier = Modifier.height(16.dp))

        Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.SpaceEvenly
        ) {
            worlds.forEachIndexed { index, name ->
                val isUnlocked = saveRepo.getLastUnlockedLevel() >= (index * 15 + 1)
                Button(
                    onClick = { if (isUnlocked) onSelectWorld(index) },
                    enabled = isUnlocked,
                    modifier = Modifier.padding(4.dp)
                ) {
                    Text(name, fontSize = 12.sp)
                }
            }
        }
    }
}

@Composable
fun LevelSelectScreen(
    worldIndex: Int,
    onPlayLevel: (Int) -> Unit,
    onBack: () -> Unit,
    saveRepo: SaveRepository
) {
    val startLevel = worldIndex * 15 + 1
    val endLevel = startLevel + 14

    Column(
        modifier = Modifier
            .fillMaxSize()
            .background(Color(0xFF090D16))
            .padding(16.dp)
    ) {
        Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.SpaceBetween,
            verticalAlignment = Alignment.CenterVertically
        ) {
            Button(onClick = onBack) { Text("Back") }
            Text("WORLD ${worldIndex + 1} LEVELS", color = Color.White, fontWeight = FontWeight.Bold, fontSize = 18.sp)
            Spacer(modifier = Modifier.width(48.dp))
        }

        Spacer(modifier = Modifier.height(16.dp))

        Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.spacedBy(8.dp)
        ) {
            for (levelId in startLevel..endLevel) {
                val isUnlocked = saveRepo.getLastUnlockedLevel() >= levelId
                val stars = saveRepo.getLevelStars(levelId)

                Button(
                    onClick = { if (isUnlocked) onPlayLevel(levelId) },
                    enabled = isUnlocked,
                    modifier = Modifier.padding(2.dp)
                ) {
                    Text("$levelId (${stars}★)", fontSize = 11.sp)
                }
            }
        }
    }
}

@Composable
fun SettingsScreen(
    onBack: () -> Unit,
    saveRepo: SaveRepository,
    audio: AudioSynthesizer
) {
    Column(
        modifier = Modifier
            .fillMaxSize()
            .background(Color(0xFF090D16))
            .padding(24.dp),
        horizontalAlignment = Alignment.CenterHorizontally
    ) {
        Text("SETTINGS", color = Color.White, fontWeight = FontWeight.Bold, fontSize = 22.sp)
        Spacer(modifier = Modifier.height(24.dp))
        Button(onClick = onBack) { Text("Save & Back") }
    }
}

@Composable
fun HowToPlayScreen(onBack: () -> Unit) {
    Column(
        modifier = Modifier
            .fillMaxSize()
            .background(Color(0xFF090D16))
            .padding(24.dp),
        horizontalAlignment = Alignment.CenterHorizontally
    ) {
        Text("HOW TO PLAY", color = Color.White, fontWeight = FontWeight.Bold, fontSize = 22.sp)
        Spacer(modifier = Modifier.height(16.dp))
        Text(
            "Use Left and Right buttons to roll Bouncy.\nTap Jump to leap across gaps.\nHold Jump for a higher bounce!\nBounce on red spring pads to launch high.\nCollect all 3 gems and reach the Golden Portal!",
            color = Color(0xFFCBD5E1),
            fontSize = 15.sp
        )
        Spacer(modifier = Modifier.height(24.dp))
        Button(onClick = onBack) { Text("Understood") }
    }
}

@Composable
fun GameScreen(
    levelId: Int,
    onExitToMenu: () -> Unit,
    onNextLevel: (Int) -> Unit,
    audio: AudioSynthesizer,
    saveRepo: SaveRepository
) {
    // In Jetpack Compose, this hosts the Custom Canvas game view with Choreographer loop
    Box(modifier = Modifier.fillMaxSize().background(Color.Black)) {
        Text("Playing Level $levelId", color = Color.White, modifier = Modifier.padding(16.dp))
    }
}
