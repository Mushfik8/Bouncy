/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { BallPhysicsState, GameEntity, LevelDefinition, MovingPlatformEntity, SpringEntity, TileType } from '../types/game';

export interface PhysicsInput {
  left: boolean;
  right: boolean;
  jumpHeld: boolean;
  jumpPressed: boolean;
}

export const PHYSICS_CONFIG = {
  GRAVITY: 1200,             // px / s^2
  MAX_FALL_SPEED: 850,       // px / s
  ACCELERATION: 1600,        // px / s^2
  GROUND_FRICTION: 1200,     // px / s^2
  AIR_FRICTION: 300,         // px / s^2
  ICE_FRICTION: 150,         // px / s^2
  MAX_SPEED: 260,            // px / s
  JUMP_IMPULSE: -480,        // px / s (instant upward velocity)
  JUMP_CUT_MULTIPLIER: 0.5,  // When jump released while ascending
  COYOTE_TIME: 0.12,         // seconds
  JUMP_BUFFER_TIME: 0.12,    // seconds
  BALL_RADIUS: 14,           // pixels
  RESTITUTION: 0.15,         // Small bounce on hard impact
};

export function createInitialBallState(spawnX: number, spawnY: number): BallPhysicsState {
  return {
    x: spawnX,
    y: spawnY,
    vx: 0,
    vy: 0,
    radius: PHYSICS_CONFIG.BALL_RADIUS,
    isGrounded: false,
    isOnIce: false,
    coyoteTimer: 0,
    jumpBufferTimer: 0,
    squashX: 1,
    squashY: 1,
    eyeLookX: 1,
    eyeLookY: 0,
    rotation: 0,
    hasKey: false,
    collectedGems: new Set<number>(),
    lastCheckpointX: spawnX,
    lastCheckpointY: spawnY,
    isDead: false,
    deathTimer: 0,
  };
}

export interface StepEvents {
  jumped: boolean;
  landed: boolean;
  bouncedOnSpring: boolean;
  died: boolean;
  hitWall: boolean;
}

/**
 * Pure physics step function. Can be called in tests or in the game loop.
 */
export function updateBallPhysics(
  ball: BallPhysicsState,
  input: PhysicsInput,
  level: LevelDefinition,
  dt: number,
  events: StepEvents = { jumped: false, landed: false, bouncedOnSpring: false, died: false, hitWall: false }
): void {
  if (ball.isDead) {
    ball.deathTimer -= dt;
    if (ball.deathTimer <= 0) {
      // Respawn at last checkpoint
      ball.x = ball.lastCheckpointX;
      ball.y = ball.lastCheckpointY;
      ball.vx = 0;
      ball.vy = 0;
      ball.isDead = false;
      ball.squashX = 1.3;
      ball.squashY = 0.7;
    }
    return;
  }

  // Update timers
  if (ball.isGrounded) {
    ball.coyoteTimer = PHYSICS_CONFIG.COYOTE_TIME;
  } else {
    ball.coyoteTimer = Math.max(0, ball.coyoteTimer - dt);
  }

  if (input.jumpPressed) {
    ball.jumpBufferTimer = PHYSICS_CONFIG.JUMP_BUFFER_TIME;
  } else {
    ball.jumpBufferTimer = Math.max(0, ball.jumpBufferTimer - dt);
  }

  // 1. Horizontal Input & Acceleration
  let moveDir = 0;
  if (input.left && !input.right) moveDir = -1;
  else if (input.right && !input.left) moveDir = 1;

  if (moveDir !== 0) {
    ball.vx += moveDir * PHYSICS_CONFIG.ACCELERATION * dt;
    // Eye look direction
    ball.eyeLookX = moveDir;
  } else {
    // Apply friction
    let friction = ball.isGrounded
      ? (ball.isOnIce ? PHYSICS_CONFIG.ICE_FRICTION : PHYSICS_CONFIG.GROUND_FRICTION)
      : PHYSICS_CONFIG.AIR_FRICTION;
    
    if (ball.vx > 0) {
      ball.vx = Math.max(0, ball.vx - friction * dt);
    } else if (ball.vx < 0) {
      ball.vx = Math.min(0, ball.vx + friction * dt);
    }
  }

  // Clamp horizontal speed
  ball.vx = Math.max(-PHYSICS_CONFIG.MAX_SPEED, Math.min(PHYSICS_CONFIG.MAX_SPEED, ball.vx));

  // 2. Jump Handling (buffered + coyote)
  const canJump = ball.isGrounded || ball.coyoteTimer > 0;
  if (ball.jumpBufferTimer > 0 && canJump) {
    ball.vy = PHYSICS_CONFIG.JUMP_IMPULSE;
    ball.isGrounded = false;
    ball.coyoteTimer = 0;
    ball.jumpBufferTimer = 0;
    // Squash & stretch: stretch tall on jump
    ball.squashX = 0.75;
    ball.squashY = 1.35;
    events.jumped = true;
  }

  // Variable Jump Cut (release jump key while still ascending)
  if (!input.jumpHeld && ball.vy < 0) {
    ball.vy *= PHYSICS_CONFIG.JUMP_CUT_MULTIPLIER;
  }

  // 3. Gravity
  ball.vy += PHYSICS_CONFIG.GRAVITY * dt;
  if (ball.vy > PHYSICS_CONFIG.MAX_FALL_SPEED) {
    ball.vy = PHYSICS_CONFIG.MAX_FALL_SPEED;
  }

  // 4. Sub-stepped Collision to prevent tunneling
  const substeps = 3;
  const subDt = dt / substeps;
  const wasGrounded = ball.isGrounded;
  ball.isGrounded = false;
  ball.isOnIce = false;

  for (let s = 0; s < substeps; s++) {
    // Move X
    ball.x += ball.vx * subDt;
    resolveTileCollisionX(ball, level, events);

    // Move Y
    ball.y += ball.vy * subDt;
    resolveTileCollisionY(ball, level, events);

    // Moving platforms collision
    resolveMovingPlatformCollisions(ball, level.entities, subDt);
  }

  // Check if just landed
  if (!wasGrounded && ball.isGrounded) {
    events.landed = true;
    // Squash flat on impact
    ball.squashX = 1.35;
    ball.squashY = 0.7;
  }

  // 5. Spring / Bounce Pad Interactions
  for (const entity of level.entities) {
    if (entity.type === 'spring') {
      const spring = entity as SpringEntity;
      if (
        ball.x + ball.radius > spring.x &&
        ball.x - ball.radius < spring.x + spring.width &&
        ball.y + ball.radius >= spring.y &&
        ball.y + ball.radius <= spring.y + spring.height + 8 &&
        ball.vy >= 0
      ) {
        ball.vy = spring.impulse || -650;
        ball.isGrounded = false;
        ball.coyoteTimer = 0;
        ball.squashX = 0.65;
        ball.squashY = 1.45;
        spring.compressed = 1.0;
        events.bouncedOnSpring = true;
      }
    }
  }

  // 6. Death checks: falling below world or touching spikes
  const worldBottomPx = level.heightInTiles * level.tileSize + 60;
  if (ball.y > worldBottomPx) {
    ball.isDead = true;
    ball.deathTimer = 0.6;
    events.died = true;
  }

  // 7. Ball rolling rotation & squash damping
  ball.rotation += (ball.vx * dt) / ball.radius;
  // Damped spring back to 1.0
  ball.squashX += (1.0 - ball.squashX) * 12 * dt;
  ball.squashY += (1.0 - ball.squashY) * 12 * dt;

  // Eye look Y reflects vertical motion
  if (ball.vy < -50) ball.eyeLookY = -1;
  else if (ball.vy > 100) ball.eyeLookY = 1;
  else ball.eyeLookY = 0;
}

function resolveTileCollisionX(
  ball: BallPhysicsState,
  level: LevelDefinition,
  events: StepEvents
): void {
  const ts = level.tileSize;
  const leftTile = Math.floor((ball.x - ball.radius) / ts);
  const rightTile = Math.floor((ball.x + ball.radius) / ts);
  const topTile = Math.floor((ball.y - ball.radius + 3) / ts);
  const bottomTile = Math.floor((ball.y + ball.radius - 3) / ts);

  for (let ty = topTile; ty <= bottomTile; ty++) {
    for (let tx = leftTile; tx <= rightTile; tx++) {
      const tile = getTile(level, tx, ty);
      if (tile === TileType.SOLID || tile === TileType.ICE || tile === TileType.BREAKABLE) {
        if (ball.vx > 0) {
          ball.x = tx * ts - ball.radius;
          ball.vx = 0;
          events.hitWall = true;
        } else if (ball.vx < 0) {
          ball.x = (tx + 1) * ts + ball.radius;
          ball.vx = 0;
          events.hitWall = true;
        }
      } else if (tile === TileType.SPIKE_UP || tile === TileType.SPIKE_DOWN) {
        // Lethal spike touch
        if (checkSpikeOverlap(ball, tx, ty, ts, tile)) {
          ball.isDead = true;
          ball.deathTimer = 0.6;
          events.died = true;
        }
      }
    }
  }
}

function resolveTileCollisionY(
  ball: BallPhysicsState,
  level: LevelDefinition,
  events: StepEvents
): void {
  const ts = level.tileSize;
  const leftTile = Math.floor((ball.x - ball.radius + 3) / ts);
  const rightTile = Math.floor((ball.x + ball.radius - 3) / ts);
  const topTile = Math.floor((ball.y - ball.radius) / ts);
  const bottomTile = Math.floor((ball.y + ball.radius) / ts);

  for (let ty = topTile; ty <= bottomTile; ty++) {
    for (let tx = leftTile; tx <= rightTile; tx++) {
      const tile = getTile(level, tx, ty);

      if (tile === TileType.SOLID || tile === TileType.ICE || tile === TileType.BREAKABLE) {
        if (ball.vy > 0) {
          // Landing on floor
          ball.y = ty * ts - ball.radius;
          ball.vy = 0;
          ball.isGrounded = true;
          if (tile === TileType.ICE) ball.isOnIce = true;
        } else if (ball.vy < 0) {
          // Head bumped ceiling
          ball.y = (ty + 1) * ts + ball.radius;
          ball.vy = 0;
          ball.squashX = 1.25;
          ball.squashY = 0.8;
        }
      } else if (tile === TileType.PLATFORM) {
        // One-way jump-through platform: only collide if falling through top
        const platformTop = ty * ts;
        const prevBottom = ball.y + ball.radius - ball.vy * 0.02;
        if (ball.vy >= 0 && ball.y + ball.radius >= platformTop && prevBottom <= platformTop + 6) {
          ball.y = platformTop - ball.radius;
          ball.vy = 0;
          ball.isGrounded = true;
        }
      } else if (tile === TileType.SPIKE_UP || tile === TileType.SPIKE_DOWN) {
        if (checkSpikeOverlap(ball, tx, ty, ts, tile)) {
          ball.isDead = true;
          ball.deathTimer = 0.6;
          events.died = true;
        }
      }
    }
  }
}

function checkSpikeOverlap(
  ball: BallPhysicsState,
  tx: number,
  ty: number,
  ts: number,
  type: TileType
): boolean {
  const spikeX = tx * ts + ts * 0.2;
  const spikeW = ts * 0.6;
  const spikeY = type === TileType.SPIKE_UP ? ty * ts + ts * 0.3 : ty * ts;
  const spikeH = ts * 0.7;

  return (
    ball.x + ball.radius * 0.7 > spikeX &&
    ball.x - ball.radius * 0.7 < spikeX + spikeW &&
    ball.y + ball.radius * 0.7 > spikeY &&
    ball.y - ball.radius * 0.7 < spikeY + spikeH
  );
}

function resolveMovingPlatformCollisions(
  ball: BallPhysicsState,
  entities: GameEntity[],
  dt: number
): void {
  for (const entity of entities) {
    if (entity.type === 'moving_platform') {
      const plat = entity as MovingPlatformEntity;
      // Check if ball is on top of moving platform
      const platTop = plat.y;
      if (
        ball.vy >= 0 &&
        ball.x + ball.radius > plat.x &&
        ball.x - ball.radius < plat.x + plat.width &&
        ball.y + ball.radius >= platTop - 4 &&
        ball.y + ball.radius <= platTop + 8
      ) {
        ball.y = platTop - ball.radius;
        ball.vy = 0;
        ball.isGrounded = true;
        // Carry ball horizontally with platform
        const platDeltaX = (plat.endX - plat.startX) * plat.speed * plat.direction * dt;
        ball.x += platDeltaX;
      }
    }
  }
}

export function getTile(level: LevelDefinition, tx: number, ty: number): TileType {
  if (tx < 0 || tx >= level.widthInTiles || ty < 0 || ty >= level.heightInTiles) {
    return TileType.AIR;
  }
  return (level.tiles[ty] && level.tiles[ty][tx]) || TileType.AIR;
}
