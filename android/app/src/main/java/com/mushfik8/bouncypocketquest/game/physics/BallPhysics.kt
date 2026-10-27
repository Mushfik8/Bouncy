package com.mushfik8.bouncypocketquest.game.physics

import com.mushfik8.bouncypocketquest.game.model.*
import kotlin.math.*

data class BallState(
    var x: Float,
    var y: Float,
    var vx: Float = 0f,
    var vy: Float = 0f,
    val radius: Float = 14f,
    var isGrounded: Boolean = false,
    var isOnIce: Boolean = false,
    var coyoteTimer: Float = 0f,
    var jumpBufferTimer: Float = 0f,
    var squashX: Float = 1f,
    var squashY: Float = 1f,
    var eyeLookX: Float = 1f,
    var eyeLookY: Float = 0f,
    var rotation: Float = 0f,
    var hasKey: Boolean = false,
    val collectedGems: MutableSet<Int> = mutableSetOf(),
    var lastCheckpointX: Float = x,
    var lastCheckpointY: Float = y,
    var isDead: Boolean = false,
    var deathTimer: Float = 0f
)

data class PhysicsInput(
    val left: Boolean,
    val right: Boolean,
    val jumpHeld: Boolean,
    val jumpPressed: Boolean
)

data class PhysicsEvents(
    var jumped: Boolean = false,
    var landed: Boolean = false,
    var springBounced: Boolean = false,
    var died: Boolean = false
)

object BallPhysics {
    const val GRAVITY = 1200f
    const val MAX_FALL_SPEED = 850f
    const val ACCELERATION = 1600f
    const val GROUND_FRICTION = 1200f
    const val AIR_FRICTION = 300f
    const val ICE_FRICTION = 150f
    const val MAX_SPEED = 260f
    const val JUMP_IMPULSE = -480f
    const val COYOTE_TIME = 0.12f
    const val JUMP_BUFFER_TIME = 0.12f

    fun update(
        ball: BallState,
        input: PhysicsInput,
        level: LevelData,
        dt: Float,
        events: PhysicsEvents
    ) {
        if (ball.isDead) {
            ball.deathTimer -= dt
            if (ball.deathTimer <= 0f) {
                ball.x = ball.lastCheckpointX
                ball.y = ball.lastCheckpointY
                ball.vx = 0f
                ball.vy = 0f
                ball.isDead = false
                ball.squashX = 1.3f
                ball.squashY = 0.7f
            }
            return
        }

        // Coyote and buffer timers
        if (ball.isGrounded) {
            ball.coyoteTimer = COYOTE_TIME
        } else {
            ball.coyoteTimer = max(0f, ball.coyoteTimer - dt)
        }

        if (input.jumpPressed) {
            ball.jumpBufferTimer = JUMP_BUFFER_TIME
        } else {
            ball.jumpBufferTimer = max(0f, ball.jumpBufferTimer - dt)
        }

        // Horizontal input
        var moveDir = 0f
        if (input.left && !input.right) moveDir = -1f
        else if (input.right && !input.left) moveDir = 1f

        if (moveDir != 0f) {
            ball.vx += moveDir * ACCELERATION * dt
            ball.eyeLookX = moveDir
        } else {
            val friction = if (ball.isGrounded) {
                if (ball.isOnIce) ICE_FRICTION else GROUND_FRICTION
            } else AIR_FRICTION

            if (ball.vx > 0) {
                ball.vx = max(0f, ball.vx - friction * dt)
            } else if (ball.vx < 0) {
                ball.vx = min(0f, ball.vx + friction * dt)
            }
        }

        ball.vx = max(-MAX_SPEED, min(MAX_SPEED, ball.vx))

        // Jump execution
        val canJump = ball.isGrounded || ball.coyoteTimer > 0f
        if (ball.jumpBufferTimer > 0f && canJump) {
            ball.vy = JUMP_IMPULSE
            ball.isGrounded = false
            ball.coyoteTimer = 0f
            ball.jumpBufferTimer = 0f
            ball.squashX = 0.75f
            ball.squashY = 1.35f
            events.jumped = true
        }

        // Variable jump cut
        if (!input.jumpHeld && ball.vy < 0f) {
            ball.vy *= 0.5f
        }

        // Gravity
        ball.vy += GRAVITY * dt
        if (ball.vy > MAX_FALL_SPEED) ball.vy = MAX_FALL_SPEED

        // Substeps for collision resolution
        val substeps = 3
        val subDt = dt / substeps
        val wasGrounded = ball.isGrounded
        ball.isGrounded = false
        ball.isOnIce = false

        for (s in 0 until substeps) {
            ball.x += ball.vx * subDt
            resolveCollisionX(ball, level, events)

            ball.y += ball.vy * subDt
            resolveCollisionY(ball, level, events)
        }

        if (!wasGrounded && ball.isGrounded) {
            events.landed = true
            ball.squashX = 1.35f
            ball.squashY = 0.7f
        }

        // Spring check
        for (entity in level.entities) {
            if (entity is SpringEntity) {
                if (
                    ball.x + ball.radius > entity.x &&
                    ball.x - ball.radius < entity.x + entity.width &&
                    ball.y + ball.radius >= entity.y &&
                    ball.y + ball.radius <= entity.y + entity.height + 8f &&
                    ball.vy >= 0
                ) {
                    ball.vy = entity.impulse
                    ball.isGrounded = false
                    ball.coyoteTimer = 0f
                    ball.squashX = 0.65f
                    ball.squashY = 1.45f
                    entity.compressed = 1.0f
                    events.springBounced = true
                }
            }
        }

        // Pit death
        val worldBottom = level.heightInTiles * level.tileSize + 60f
        if (ball.y > worldBottom) {
            ball.isDead = true
            ball.deathTimer = 0.6f
            events.died = true
        }

        // Rotation & squash damping
        ball.rotation += (ball.vx * dt) / ball.radius
        ball.squashX += (1.0f - ball.squashX) * 12f * dt
        ball.squashY += (1.0f - ball.squashY) * 12f * dt

        if (ball.vy < -50f) ball.eyeLookY = -1f
        else if (ball.vy > 100f) ball.eyeLookY = 1f
        else ball.eyeLookY = 0f
    }

    private fun resolveCollisionX(ball: BallState, level: LevelData, events: PhysicsEvents) {
        val ts = level.tileSize
        val leftTile = floor((ball.x - ball.radius) / ts).toInt()
        val rightTile = floor((ball.x + ball.radius) / ts).toInt()
        val topTile = floor((ball.y - ball.radius + 3f) / ts).toInt()
        val bottomTile = floor((ball.y + ball.radius - 3f) / ts).toInt()

        for (ty in topTile..bottomTile) {
            for (tx in leftTile..rightTile) {
                val tile = getTile(level, tx, ty)
                if (tile == TileType.SOLID || tile == TileType.ICE || tile == TileType.BREAKABLE) {
                    if (ball.vx > 0) {
                        ball.x = tx * ts - ball.radius
                        ball.vx = 0f
                    } else if (ball.vx < 0) {
                        ball.x = (tx + 1) * ts + ball.radius
                        ball.vx = 0f
                    }
                } else if (tile == TileType.SPIKE_UP || tile == TileType.SPIKE_DOWN) {
                    ball.isDead = true
                    ball.deathTimer = 0.6f
                    events.died = true
                }
            }
        }
    }

    private fun resolveCollisionY(ball: BallState, level: LevelData, events: PhysicsEvents) {
        val ts = level.tileSize
        val leftTile = floor((ball.x - ball.radius + 3f) / ts).toInt()
        val rightTile = floor((ball.x + ball.radius - 3f) / ts).toInt()
        val topTile = floor((ball.y - ball.radius) / ts).toInt()
        val bottomTile = floor((ball.y + ball.radius) / ts).toInt()

        for (ty in topTile..bottomTile) {
            for (tx in leftTile..rightTile) {
                val tile = getTile(level, tx, ty)
                if (tile == TileType.SOLID || tile == TileType.ICE || tile == TileType.BREAKABLE) {
                    if (ball.vy > 0) {
                        ball.y = ty * ts - ball.radius
                        ball.vy = 0f
                        ball.isGrounded = true
                        if (tile == TileType.ICE) ball.isOnIce = true
                    } else if (ball.vy < 0) {
                        ball.y = (ty + 1) * ts + ball.radius
                        ball.vy = 0f
                        ball.squashX = 1.25f
                        ball.squashY = 0.8f
                    }
                } else if (tile == TileType.PLATFORM) {
                    val platformTop = ty * ts
                    if (ball.vy >= 0 && ball.y + ball.radius >= platformTop && ball.y + ball.radius - ball.vy * 0.02f <= platformTop + 6f) {
                        ball.y = platformTop - ball.radius
                        ball.vy = 0f
                        ball.isGrounded = true
                    }
                } else if (tile == TileType.SPIKE_UP || tile == TileType.SPIKE_DOWN) {
                    ball.isDead = true
                    ball.deathTimer = 0.6f
                    events.died = true
                }
            }
        }
    }

    private fun getTile(level: LevelData, tx: Int, ty: Int): TileType {
        if (tx < 0 || tx >= level.widthInTiles || ty < 0 || ty >= level.heightInTiles) return TileType.AIR
        return TileType.fromId(level.tiles[ty][tx])
    }
}
