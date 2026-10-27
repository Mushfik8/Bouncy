package com.mushfik8.bouncypocketquest.game.data

import com.mushfik8.bouncypocketquest.game.model.*

object LevelRepository {
    fun getLevel(levelId: Int): LevelData {
        val width = minOf(60, 36 + (levelId % 15) * 2)
        val height = 16
        val groundY = 13
        val tiles = Array(height) { IntArray(width) { 0 } }
        val entities = mutableListOf<GameEntity>()

        // Floor
        for (x in 0 until width) {
            val isPit = levelId > 2 && ((x in 12..14 && levelId % 2 == 1) || (x in 24..26 && levelId >= 4))
            if (!isPit) {
                tiles[groundY][x] = if (levelId in 31..45) TileType.ICE.id else TileType.SOLID.id
                tiles[groundY + 1][x] = TileType.SOLID.id
            }
        }
        // Walls
        for (y in 0 until height) {
            tiles[y][0] = TileType.SOLID.id
            tiles[y][width - 1] = TileType.SOLID.id
        }

        // Stepping platforms
        for (step in 0..3) {
            val sx = 8 + step * 7
            val sy = 11 - (step % 3) * 2
            tiles[sy][sx] = TileType.PLATFORM.id
            tiles[sy][sx + 1] = TileType.PLATFORM.id
            if (step == 2 && levelId >= 3) {
                tiles[groundY][sx + 1] = TileType.SPIKE_UP.id
            }
        }

        // Spring
        entities.add(SpringEntity("spring-$levelId", 18f * 32f, (groundY - 1) * 32f + 16f, -620f))

        // Checkpoint
        val midX = width / 2
        entities.add(CheckpointEntity("checkpoint-$levelId", midX * 32f, (groundY - 1) * 32f))

        // Gems
        entities.add(GemEntity("gem-$levelId-0", (midX - 6) * 32f, (groundY - 3) * 32f, 0))
        entities.add(GemEntity("gem-$levelId-1", midX * 32f, (groundY - 4) * 32f, 1))
        entities.add(GemEntity("gem-$levelId-2", (width - 6) * 32f, (groundY - 2) * 32f, 2))

        // Goal
        entities.add(GoalEntity("goal-$levelId", (width - 4) * 32f, (groundY - 1) * 32f))

        val worldIdx = (levelId - 1) / 15

        return LevelData(
            id = levelId,
            worldIndex = worldIdx,
            name = "Level $levelId",
            widthInTiles = width,
            heightInTiles = height,
            tileSize = 32f,
            spawnX = 2f * 32f,
            spawnY = (groundY - 1) * 32f,
            tiles = tiles,
            entities = entities
        )
    }
}
