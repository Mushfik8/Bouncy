package com.mushfik8.bouncypocketquest.game.model

enum class TileType(val id: Int) {
    AIR(0),
    SOLID(1),
    PLATFORM(2),
    ICE(3),
    BREAKABLE(4),
    SPIKE_UP(5),
    SPIKE_DOWN(6);

    companion object {
        fun fromId(id: Int): TileType = entries.find { it.id == id } ?: AIR
    }
}

sealed class GameEntity(val id: String, var x: Float, var y: Float, val width: Float, val height: Float)

class GemEntity(id: String, x: Float, y: Float, val gemIndex: Int, var collected: Boolean = false) :
    GameEntity(id, x, y, 20f, 20f)

class SpringEntity(id: String, x: Float, y: Float, val impulse: Float = -650f, var compressed: Float = 0f) :
    GameEntity(id, x, y, 32f, 16f)

class KeyEntity(id: String, x: Float, y: Float, val doorId: String, var collected: Boolean = false) :
    GameEntity(id, x, y, 20f, 20f)

class DoorEntity(id: String, x: Float, y: Float, val doorId: String, var isOpen: Boolean = false) :
    GameEntity(id, x, y, 16f, 64f)

class CheckpointEntity(id: String, x: Float, y: Float, var active: Boolean = false) :
    GameEntity(id, x, y, 24f, 32f)

class GoalEntity(id: String, x: Float, y: Float) :
    GameEntity(id, x, y, 32f, 48f)

class EnemyPatrolEntity(
    id: String,
    x: Float,
    y: Float,
    val rangeLeft: Float,
    val rangeRight: Float,
    val speed: Float = 45f,
    var direction: Int = 1
) : GameEntity(id, x, y, 24f, 24f)

class MovingPlatformEntity(
    id: String,
    x: Float,
    y: Float,
    val startX: Float,
    val endX: Float,
    val speed: Float = 0.5f,
    var progress: Float = 0f,
    var direction: Int = 1
) : GameEntity(id, x, y, 64f, 16f)

data class LevelData(
    val id: Int,
    val worldIndex: Int,
    val name: String,
    val widthInTiles: Int,
    val heightInTiles: Int,
    val tileSize: Float = 32f,
    val spawnX: Float,
    val spawnY: Float,
    val tiles: Array<IntArray>,
    val entities: List<GameEntity>,
    val targetTimeSeconds: Float = 45f
)
