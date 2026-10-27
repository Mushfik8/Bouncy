/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import test from 'node:test';
import assert from 'node:assert/strict';
import { createInitialBallState, updateBallPhysics, PHYSICS_CONFIG } from './physics';
import { buildLevel, validateLevel } from './levels';

test('Initial ball state initializes at spawn with correct default values', () => {
  const ball = createInitialBallState(64, 128);
  assert.equal(ball.x, 64);
  assert.equal(ball.y, 128);
  assert.equal(ball.vx, 0);
  assert.equal(ball.vy, 0);
  assert.equal(ball.isGrounded, false);
  assert.equal(ball.isDead, false);
  assert.equal(ball.radius, PHYSICS_CONFIG.BALL_RADIUS);
});

test('Ball accelerates horizontally with right input and stops with friction when released', () => {
  const level = buildLevel(1);
  const ball = createInitialBallState(level.spawnX, level.spawnY);
  ball.isGrounded = true;

  // Step with right input
  updateBallPhysics(ball, { left: false, right: true, jumpHeld: false, jumpPressed: false }, level, 0.05);
  assert.ok(ball.vx > 0, 'Ball should accelerate to the right');
  assert.ok(ball.vx <= PHYSICS_CONFIG.MAX_SPEED, 'Speed should not exceed MAX_SPEED');

  // Step with no input -> friction decelerates
  const prevVx = ball.vx;
  updateBallPhysics(ball, { left: false, right: false, jumpHeld: false, jumpPressed: false }, level, 0.05);
  assert.ok(ball.vx < prevVx, 'Friction should slow down horizontal velocity');
});

test('Jump impulse triggers when jump is pressed on ground', () => {
  const level = buildLevel(1);
  const ball = createInitialBallState(level.spawnX, level.spawnY);
  ball.isGrounded = true;

  const events = { jumped: false, landed: false, bouncedOnSpring: false, died: false, hitWall: false };
  updateBallPhysics(ball, { left: false, right: false, jumpHeld: true, jumpPressed: true }, level, 0.02, events);

  assert.equal(events.jumped, true);
  assert.ok(ball.vy < 0, 'Vertical velocity should be negative (upward)');
  assert.ok(ball.squashY > 1.0, 'Ball should stretch tall on jump');
});

test('Jump buffering allows jumping when input is registered slightly before landing', () => {
  const level = buildLevel(1);
  const ball = createInitialBallState(level.spawnX, level.spawnY - 5);
  ball.isGrounded = false;
  ball.vy = 100;

  // Jump pressed in air
  updateBallPhysics(ball, { left: false, right: false, jumpHeld: true, jumpPressed: true }, level, 0.02);
  assert.ok(ball.jumpBufferTimer > 0, 'Jump buffer timer should be active');
});

test('Spike contact triggers death and respawn timer', () => {
  const level = buildLevel(1);
  // Level 1 spike or create test level with spike
  const ball = createInitialBallState(100, 100);
  level.tiles[3][3] = 5; // SPIKE_UP
  ball.x = 3 * level.tileSize + 16;
  ball.y = 3 * level.tileSize + 16;

  const events = { jumped: false, landed: false, bouncedOnSpring: false, died: false, hitWall: false };
  updateBallPhysics(ball, { left: false, right: false, jumpHeld: false, jumpPressed: false }, level, 0.02, events);

  assert.equal(ball.isDead, true);
  assert.equal(events.died, true);
  assert.ok(ball.deathTimer > 0);
});
