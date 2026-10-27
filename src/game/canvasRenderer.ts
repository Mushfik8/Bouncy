/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { BallPhysicsState, GameEntity, LevelDefinition, MovingPlatformEntity, Particle, SpringEntity, TileType, WORLDS, WorldId } from '../types/game';

export class GameCanvasRenderer {
  private ctx: CanvasRenderingContext2D;
  private cameraX: number = 0;
  private cameraY: number = 0;
  private particles: Particle[] = [];
  private readonly maxParticles: number = 160;

  constructor(ctx: CanvasRenderingContext2D) {
    this.ctx = ctx;
  }

  public resize(width: number, height: number): void {
    this.ctx.canvas.width = width;
    this.ctx.canvas.height = height;
  }

  public updateCamera(ball: BallPhysicsState, level: LevelDefinition, viewW: number, viewH: number, dt: number): void {
    // Lead the camera slightly in the ball's movement direction
    const targetCamX = ball.x - viewW * 0.4 + ball.vx * 0.3;
    const targetCamY = ball.y - viewH * 0.55 + ball.vy * 0.15;

    // Smooth camera lerp
    this.cameraX += (targetCamX - this.cameraX) * 7.5 * dt;
    this.cameraY += (targetCamY - this.cameraY) * 6.0 * dt;

    // Clamp camera within level bounds
    const maxCamX = Math.max(0, level.widthInTiles * level.tileSize - viewW);
    const maxCamY = Math.max(0, level.heightInTiles * level.tileSize - viewH + 60);

    this.cameraX = Math.max(0, Math.min(maxCamX, this.cameraX));
    this.cameraY = Math.max(-100, Math.min(maxCamY, this.cameraY));
  }

  public addParticleBurst(x: number, y: number, color: string, count: number = 10, speed: number = 120): void {
    for (let i = 0; i < count; i++) {
      if (this.particles.length >= this.maxParticles) {
        this.particles.shift(); // Reuse ring
      }
      const angle = (Math.PI * 2 * i) / count + (Math.random() - 0.5) * 0.5;
      const spd = speed * (0.6 + Math.random() * 0.8);
      this.particles.push({
        x,
        y,
        vx: Math.cos(angle) * spd,
        vy: Math.sin(angle) * spd,
        size: 3 + Math.random() * 3,
        life: 0.4 + Math.random() * 0.3,
        maxLife: 0.7,
        color,
        alpha: 1.0,
      });
    }
  }

  public updateParticles(dt: number): void {
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      p.life -= dt;
      if (p.life <= 0) {
        this.particles.splice(i, 1);
        continue;
      }
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      p.vy += 400 * dt; // gravity on particles
      p.alpha = Math.max(0, p.life / p.maxLife);
    }
  }

  public render(
    ball: BallPhysicsState,
    level: LevelDefinition,
    gameTime: number,
    screenShakeAmount: number = 0
  ): void {
    const ctx = this.ctx;
    const w = ctx.canvas.width;
    const h = ctx.canvas.height;

    ctx.save();
    ctx.clearRect(0, 0, w, h);

    // Apply screen shake if active
    if (screenShakeAmount > 0) {
      const shakeX = (Math.random() - 0.5) * screenShakeAmount * 8;
      const shakeY = (Math.random() - 0.5) * screenShakeAmount * 8;
      ctx.translate(shakeX, shakeY);
    }

    // 1. Draw Parallax Background
    this.drawParallaxBackground(level.worldId, w, h);

    // 2. Camera Transform for World Objects
    ctx.save();
    ctx.translate(-Math.round(this.cameraX), -Math.round(this.cameraY));

    // Draw Tiles
    this.drawTiles(level, w, h);

    // Draw Entities (Gems, Springs, Doors, Keys, Checkpoints, Hazards, Exit)
    this.drawEntities(level.entities, gameTime, ball);

    // Draw Particles
    this.drawParticles();

    // Draw Ball Character
    if (!ball.isDead) {
      this.drawBall(ball);
    }

    ctx.restore();
    ctx.restore();
  }

  private drawParallaxBackground(worldId: WorldId, w: number, h: number): void {
    const ctx = this.ctx;
    const worldInfo = WORLDS.find((wo) => wo.id === worldId) || WORLDS[0];

    // Sky Gradient
    const sky = ctx.createLinearGradient(0, 0, 0, h);
    sky.addColorStop(0, worldInfo.skyGradient[0]);
    sky.addColorStop(1, worldInfo.skyGradient[1]);
    ctx.fillStyle = sky;
    ctx.fillRect(0, 0, w, h);

    // Parallax Layer 1: Distant Mountains / Hills
    ctx.save();
    const p1Offset = (this.cameraX * 0.15) % w;
    ctx.fillStyle = worldId === 'crystal_caves' ? 'rgba(30, 27, 75, 0.6)'
      : worldId === 'frostbound_ruins' ? 'rgba(186, 230, 253, 0.4)'
      : worldId === 'gearwork_factory' ? 'rgba(67, 56, 202, 0.3)'
      : worldId === 'ember_depths' ? 'rgba(127, 29, 29, 0.4)'
      : 'rgba(74, 222, 128, 0.35)';

    ctx.beginPath();
    ctx.moveTo(0, h);
    for (let x = -w; x <= w * 2; x += 120) {
      const hillHeight = 180 + Math.sin(x * 0.015) * 60;
      ctx.lineTo(x - p1Offset, h - hillHeight);
    }
    ctx.lineTo(w * 2, h);
    ctx.fill();
    ctx.restore();

    // Parallax Layer 2: Midground Hills
    ctx.save();
    const p2Offset = (this.cameraX * 0.35) % w;
    ctx.fillStyle = worldId === 'crystal_caves' ? 'rgba(76, 29, 149, 0.5)'
      : worldId === 'frostbound_ruins' ? 'rgba(125, 211, 252, 0.5)'
      : worldId === 'gearwork_factory' ? 'rgba(120, 53, 15, 0.4)'
      : worldId === 'ember_depths' ? 'rgba(153, 27, 27, 0.5)'
      : 'rgba(34, 197, 94, 0.5)';

    ctx.beginPath();
    ctx.moveTo(0, h);
    for (let x = -w; x <= w * 2; x += 90) {
      const hillHeight = 110 + Math.cos(x * 0.02) * 45;
      ctx.lineTo(x - p2Offset, h - hillHeight);
    }
    ctx.lineTo(w * 2, h);
    ctx.fill();
    ctx.restore();
  }

  private drawTiles(level: LevelDefinition, viewW: number, viewH: number): void {
    const ctx = this.ctx;
    const ts = level.tileSize;

    // Viewport tile range
    const startX = Math.max(0, Math.floor(this.cameraX / ts) - 1);
    const endX = Math.min(level.widthInTiles, Math.ceil((this.cameraX + viewW) / ts) + 1);
    const startY = Math.max(0, Math.floor(this.cameraY / ts) - 1);
    const endY = Math.min(level.heightInTiles, Math.ceil((this.cameraY + viewH) / ts) + 1);

    for (let ty = startY; ty < endY; ty++) {
      for (let tx = startX; tx < endX; tx++) {
        const tile = level.tiles[ty] && level.tiles[ty][tx];
        if (!tile || tile === TileType.AIR) continue;

        const px = tx * ts;
        const py = ty * ts;

        switch (tile) {
          case TileType.SOLID: {
            this.drawSolidTile(ctx, px, py, ts, level.worldId);
            break;
          }
          case TileType.PLATFORM: {
            this.drawPlatformTile(ctx, px, py, ts);
            break;
          }
          case TileType.ICE: {
            this.drawIceTile(ctx, px, py, ts);
            break;
          }
          case TileType.BREAKABLE: {
            this.drawBreakableTile(ctx, px, py, ts);
            break;
          }
          case TileType.SPIKE_UP: {
            this.drawSpike(ctx, px, py, ts, true);
            break;
          }
          case TileType.SPIKE_DOWN: {
            this.drawSpike(ctx, px, py, ts, false);
            break;
          }
        }
      }
    }
  }

  private drawSolidTile(ctx: CanvasRenderingContext2D, px: number, py: number, ts: number, worldId: WorldId): void {
    // Base block
    const colors: Record<WorldId, { base: string; top: string; outline: string }> = {
      green_hills: { base: '#854d0e', top: '#22c55e', outline: '#15803d' },
      crystal_caves: { base: '#3b0764', top: '#a855f7', outline: '#7e22ce' },
      frostbound_ruins: { base: '#0369a1', top: '#e0f2fe', outline: '#38bdf8' },
      gearwork_factory: { base: '#3f3f46', top: '#f59e0b', outline: '#71717a' },
      ember_depths: { base: '#450a0a', top: '#dc2626', outline: '#b91c1c' },
      skybound_frontier: { base: '#312e81', top: '#818cf8', outline: '#4f46e5' },
    };

    const c = colors[worldId] || colors.green_hills;

    ctx.fillStyle = c.base;
    ctx.fillRect(px, py, ts, ts);

    // Top cap grass/crust
    ctx.fillStyle = c.top;
    ctx.fillRect(px, py, ts, 6);

    // Outline / Bevel
    ctx.strokeStyle = c.outline;
    ctx.lineWidth = 1.5;
    ctx.strokeRect(px + 0.5, py + 0.5, ts - 1, ts - 1);
  }

  private drawPlatformTile(ctx: CanvasRenderingContext2D, px: number, py: number, ts: number): void {
    ctx.fillStyle = '#b45309';
    ctx.fillRect(px, py, ts, 10);
    ctx.fillStyle = '#fde68a';
    ctx.fillRect(px, py, ts, 3);
    ctx.strokeStyle = '#78350f';
    ctx.lineWidth = 1;
    ctx.strokeRect(px, py, ts, 10);
  }

  private drawIceTile(ctx: CanvasRenderingContext2D, px: number, py: number, ts: number): void {
    ctx.fillStyle = '#38bdf8';
    ctx.fillRect(px, py, ts, ts);
    ctx.fillStyle = '#e0f2fe';
    ctx.fillRect(px, py, ts, 8);
    // Specular diagonal reflection
    ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
    ctx.beginPath();
    ctx.moveTo(px + 4, py + 2);
    ctx.lineTo(px + 12, py + 2);
    ctx.lineTo(px + 4, py + 18);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = '#0284c7';
    ctx.strokeRect(px + 0.5, py + 0.5, ts - 1, ts - 1);
  }

  private drawBreakableTile(ctx: CanvasRenderingContext2D, px: number, py: number, ts: number): void {
    ctx.fillStyle = '#78716c';
    ctx.fillRect(px, py, ts, ts);
    ctx.strokeStyle = '#d6d3d1';
    ctx.beginPath();
    ctx.moveTo(px + 4, py + 4);
    ctx.lineTo(px + 16, py + 14);
    ctx.lineTo(px + 28, py + 8);
    ctx.stroke();
  }

  private drawSpike(ctx: CanvasRenderingContext2D, px: number, py: number, ts: number, up: boolean): void {
    ctx.save();
    ctx.fillStyle = '#ef4444';
    ctx.strokeStyle = '#991b1b';
    ctx.lineWidth = 2;

    const count = 2;
    const spikeW = ts / count;

    for (let i = 0; i < count; i++) {
      const sx = px + i * spikeW;
      ctx.beginPath();
      if (up) {
        ctx.moveTo(sx, py + ts);
        ctx.lineTo(sx + spikeW / 2, py + 4);
        ctx.lineTo(sx + spikeW, py + ts);
      } else {
        ctx.moveTo(sx, py);
        ctx.lineTo(sx + spikeW / 2, py + ts - 4);
        ctx.lineTo(sx + spikeW, py);
      }
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
    }
    ctx.restore();
  }

  private drawEntities(entities: GameEntity[], time: number, ball: BallPhysicsState): void {
    const ctx = this.ctx;

    for (const entity of entities) {
      switch (entity.type) {
        case 'gem': {
          if (entity.collected || ball.collectedGems.has(entity.gemIndex)) continue;
          const bob = Math.sin(time * 4 + entity.gemIndex) * 4;
          const gx = entity.x + entity.width / 2;
          const gy = entity.y + entity.height / 2 + bob;

          ctx.save();
          ctx.translate(gx, gy);
          // Gem Diamond
          ctx.fillStyle = '#fbbf24';
          ctx.strokeStyle = '#b45309';
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.moveTo(0, -10);
          ctx.lineTo(8, 0);
          ctx.lineTo(0, 10);
          ctx.lineTo(-8, 0);
          ctx.closePath();
          ctx.fill();
          ctx.stroke();

          // Highlight facet
          ctx.fillStyle = '#fffbeb';
          ctx.beginPath();
          ctx.moveTo(0, -8);
          ctx.lineTo(5, 0);
          ctx.lineTo(0, 0);
          ctx.lineTo(-5, 0);
          ctx.closePath();
          ctx.fill();

          ctx.restore();
          break;
        }

        case 'spring': {
          const spring = entity as SpringEntity;
          const comp = spring.compressed || 0;
          if (spring.compressed && spring.compressed > 0) {
            spring.compressed = Math.max(0, spring.compressed - 0.08);
          }

          ctx.save();
          // Base
          ctx.fillStyle = '#475569';
          ctx.fillRect(spring.x, spring.y + spring.height - 4, spring.width, 4);

          // Top Pad
          const padY = spring.y + comp * 8;
          ctx.fillStyle = '#ef4444';
          ctx.fillRect(spring.x + 2, padY, spring.width - 4, 6);

          // Coils
          ctx.strokeStyle = '#cbd5e1';
          ctx.lineWidth = 2.5;
          ctx.beginPath();
          ctx.moveTo(spring.x + 6, spring.y + spring.height - 4);
          ctx.lineTo(spring.x + spring.width - 6, padY + 3);
          ctx.stroke();
          ctx.restore();
          break;
        }

        case 'checkpoint': {
          ctx.save();
          ctx.fillStyle = '#64748b';
          ctx.fillRect(entity.x + 2, entity.y, 4, entity.height);

          // Flag
          ctx.fillStyle = entity.active ? '#22c55e' : '#94a3b8';
          ctx.beginPath();
          ctx.moveTo(entity.x + 6, entity.y + 4);
          ctx.lineTo(entity.x + 22, entity.y + 11);
          ctx.lineTo(entity.x + 6, entity.y + 18);
          ctx.closePath();
          ctx.fill();
          ctx.restore();
          break;
        }

        case 'key': {
          if (entity.collected || ball.hasKey) continue;
          ctx.save();
          ctx.translate(entity.x + entity.width / 2, entity.y + entity.height / 2 + Math.sin(time * 3) * 3);
          ctx.fillStyle = '#facc15';
          ctx.strokeStyle = '#ca8a04';
          ctx.lineWidth = 1.5;
          ctx.beginPath();
          ctx.arc(0, -4, 5, 0, Math.PI * 2);
          ctx.rect(-1.5, 0, 3, 10);
          ctx.rect(1.5, 4, 3, 2);
          ctx.fill();
          ctx.stroke();
          ctx.restore();
          break;
        }

        case 'door': {
          if (entity.isOpen) continue;
          ctx.save();
          ctx.fillStyle = '#78350f';
          ctx.fillRect(entity.x, entity.y, entity.width, entity.height);
          ctx.strokeStyle = '#facc15';
          ctx.lineWidth = 2;
          ctx.strokeRect(entity.x, entity.y, entity.width, entity.height);
          // Keyhole
          ctx.fillStyle = '#000000';
          ctx.beginPath();
          ctx.arc(entity.x + entity.width / 2, entity.y + entity.height / 2, 3, 0, Math.PI * 2);
          ctx.fill();
          ctx.restore();
          break;
        }

        case 'goal': {
          ctx.save();
          // Golden Portal Arch
          const gx = entity.x + entity.width / 2;
          const gy = entity.y + entity.height / 2;

          // Glowing portal aura
          const aura = ctx.createRadialGradient(gx, gy, 4, gx, gy, 28);
          aura.addColorStop(0, 'rgba(250, 204, 21, 0.8)');
          aura.addColorStop(0.6, 'rgba(245, 158, 11, 0.4)');
          aura.addColorStop(1, 'rgba(217, 119, 6, 0)');
          ctx.fillStyle = aura;
          ctx.beginPath();
          ctx.arc(gx, gy, 28, 0, Math.PI * 2);
          ctx.fill();

          // Portal Pillars
          ctx.fillStyle = '#f59e0b';
          ctx.fillRect(entity.x, entity.y, 6, entity.height);
          ctx.fillRect(entity.x + entity.width - 6, entity.y, 6, entity.height);

          // Top Arch Star
          ctx.fillStyle = '#fef08a';
          ctx.beginPath();
          ctx.arc(gx, entity.y - 2, 7, 0, Math.PI * 2);
          ctx.fill();
          ctx.restore();
          break;
        }

        case 'moving_platform': {
          const plat = entity as MovingPlatformEntity;
          ctx.save();
          ctx.fillStyle = '#475569';
          ctx.fillRect(plat.x, plat.y, plat.width, plat.height);
          ctx.fillStyle = '#38bdf8';
          ctx.fillRect(plat.x + 2, plat.y + 2, plat.width - 4, 3);
          ctx.strokeStyle = '#0284c7';
          ctx.strokeRect(plat.x, plat.y, plat.width, plat.height);
          ctx.restore();
          break;
        }

        case 'enemy_patrol': {
          ctx.save();
          ctx.translate(entity.x + entity.width / 2, entity.y + entity.height / 2);
          // Spiky patrol beetle
          ctx.fillStyle = '#e11d48';
          ctx.beginPath();
          ctx.arc(0, 0, 11, Math.PI, 0, false);
          ctx.lineTo(11, 8);
          ctx.lineTo(-11, 8);
          ctx.closePath();
          ctx.fill();

          // Spikes on back
          ctx.fillStyle = '#fff1f2';
          ctx.beginPath();
          ctx.moveTo(-6, -8);
          ctx.lineTo(-4, -14);
          ctx.lineTo(-2, -8);
          ctx.moveTo(2, -8);
          ctx.lineTo(4, -14);
          ctx.lineTo(6, -8);
          ctx.fill();

          // Eyes
          ctx.fillStyle = '#ffffff';
          ctx.beginPath();
          ctx.arc(4 * (entity.direction || 1), -1, 3, 0, Math.PI * 2);
          ctx.fill();
          ctx.fillStyle = '#000000';
          ctx.beginPath();
          ctx.arc(5 * (entity.direction || 1), -1, 1.5, 0, Math.PI * 2);
          ctx.fill();

          ctx.restore();
          break;
        }

        case 'enemy_hopper': {
          ctx.save();
          ctx.translate(entity.x + entity.width / 2, entity.y + entity.height / 2);
          ctx.fillStyle = '#8b5cf6';
          ctx.beginPath();
          ctx.arc(0, 0, 10, 0, Math.PI * 2);
          ctx.fill();
          ctx.strokeStyle = '#4c1d95';
          ctx.stroke();

          // Angry horn
          ctx.fillStyle = '#facc15';
          ctx.beginPath();
          ctx.moveTo(-3, -9);
          ctx.lineTo(0, -16);
          ctx.lineTo(3, -9);
          ctx.closePath();
          ctx.fill();
          ctx.restore();
          break;
        }
      }
    }
  }

  private drawBall(ball: BallPhysicsState): void {
    const ctx = this.ctx;
    ctx.save();
    ctx.translate(ball.x, ball.y);

    // Squash & Stretch scale transform around center
    ctx.scale(ball.squashX, ball.squashY);

    // Ball Base Sphere (Vibrant Cherry Red / Orange gradient)
    const grad = ctx.createRadialGradient(-3, -3, 2, 0, 0, ball.radius);
    grad.addColorStop(0, '#f87171');
    grad.addColorStop(0.6, '#dc2626');
    grad.addColorStop(1, '#991b1b');

    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.arc(0, 0, ball.radius, 0, Math.PI * 2);
    ctx.fill();

    // Subtle rolling stripe that rotates with ball.rotation
    ctx.save();
    ctx.rotate(ball.rotation);
    ctx.strokeStyle = 'rgba(254, 202, 202, 0.45)';
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.arc(0, 0, ball.radius - 2, 0.3, Math.PI - 0.3);
    ctx.stroke();
    ctx.restore();

    // Top Glossy Specular Highlight
    ctx.fillStyle = 'rgba(255, 255, 255, 0.75)';
    ctx.beginPath();
    ctx.arc(-4, -5, 4, 0, Math.PI * 2);
    ctx.fill();

    // Expressive Eyes
    const eyeOffsetX = ball.eyeLookX * 3.5;
    const eyeOffsetY = ball.eyeLookY * 2;

    // Sclera
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.ellipse(eyeOffsetX, eyeOffsetY - 1, 3.5, 4.5, 0, 0, Math.PI * 2);
    ctx.fill();

    // Pupil
    ctx.fillStyle = '#1e1b4b';
    ctx.beginPath();
    ctx.arc(eyeOffsetX + ball.eyeLookX * 1.5, eyeOffsetY - 1 + ball.eyeLookY * 1.5, 2, 0, Math.PI * 2);
    ctx.fill();

    // Eye catchlight
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(eyeOffsetX + ball.eyeLookX * 1.2 - 0.7, eyeOffsetY - 2.2, 0.8, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
  }

  private drawParticles(): void {
    const ctx = this.ctx;
    for (const p of this.particles) {
      ctx.save();
      ctx.globalAlpha = p.alpha;
      ctx.fillStyle = p.color;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }
  }
}
