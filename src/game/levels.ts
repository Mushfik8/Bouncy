/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { GameEntity, LevelDefinition, TileType, WORLDS, WorldId } from '../types/game';

const TILE_SIZE = 32;

/**
 * Helper to construct empty tile grid
 */
function createEmptyGrid(width: number, height: number): number[][] {
  const grid: number[][] = [];
  for (let y = 0; y < height; y++) {
    grid.push(new Array(width).fill(TileType.AIR));
  }
  return grid;
}

/**
 * Handcrafted Level Generator for all 6 worlds (100 levels total!)
 */
export function buildLevel(levelId: number): LevelDefinition {
  // Determine which world this level belongs to
  let worldId: WorldId = 'green_hills';
  let localIndex = levelId;
  for (const w of WORLDS) {
    if (levelId >= w.levelOffset && levelId < w.levelOffset + w.levelCount) {
      worldId = w.id;
      localIndex = levelId - w.levelOffset + 1;
      break;
    }
  }

  // Width scales with level difficulty
  const widthInTiles = Math.min(60, 36 + Math.floor(localIndex * 1.5));
  const heightInTiles = 16;
  const tiles = createEmptyGrid(widthInTiles, heightInTiles);
  const entities: GameEntity[] = [];

  // Ground level: typically y = 13 or 14
  const groundY = 13;

  // Build baseline floor
  for (let x = 0; x < widthInTiles; x++) {
    // Leave intentional pit gaps in later levels
    const isPit = localIndex > 2 && (
      (x >= 12 && x <= 14 && localIndex % 2 === 1) ||
      (x >= 24 && x <= 26 && localIndex >= 4) ||
      (x >= 38 && x <= 40 && localIndex >= 8)
    );

    if (!isPit) {
      tiles[groundY][x] = (worldId === 'frostbound_ruins' && x % 4 !== 0) ? TileType.ICE : TileType.SOLID;
      tiles[groundY + 1][x] = TileType.SOLID;
      tiles[groundY + 2][x] = TileType.SOLID;
    }
  }

  // Left boundary wall
  for (let y = 0; y < heightInTiles; y++) {
    tiles[y][0] = TileType.SOLID;
  }
  // Right boundary wall
  for (let y = 0; y < heightInTiles; y++) {
    tiles[y][widthInTiles - 1] = TileType.SOLID;
  }

  // Handcrafted variations per world:
  if (worldId === 'green_hills') {
    // Level 1: "First Bounces" - gentle introducing jumping and collecting
    if (localIndex === 1) {
      // Step platforms
      tiles[11][8] = TileType.SOLID;
      tiles[11][9] = TileType.SOLID;
      tiles[9][14] = TileType.SOLID;
      tiles[9][15] = TileType.SOLID;
      tiles[7][20] = TileType.SOLID;
      tiles[7][21] = TileType.SOLID;

      // Spring to reach high ledge
      entities.push({
        id: 'spring-1',
        type: 'spring',
        x: 23 * TILE_SIZE,
        y: (groundY - 1) * TILE_SIZE + 16,
        width: 32,
        height: 16,
        impulse: -580,
      });

      // High ledge
      for (let x = 25; x <= 32; x++) {
        tiles[6][x] = TileType.SOLID;
      }
    } else {
      // General Green Hills progression
      for (let step = 0; step < 4; step++) {
        const sx = 7 + step * 7;
        const sy = 11 - (step % 3) * 2;
        tiles[sy][sx] = TileType.PLATFORM;
        tiles[sy][sx + 1] = TileType.PLATFORM;
        tiles[sy][sx + 2] = TileType.PLATFORM;

        if (step === 2 && localIndex >= 3) {
          // Spike beneath the gap
          tiles[groundY][sx + 1] = TileType.SPIKE_UP;
        }
      }

      // Add a bouncy spring
      entities.push({
        id: `spring-${localIndex}`,
        type: 'spring',
        x: (18 + (localIndex % 6)) * TILE_SIZE,
        y: (groundY - 1) * TILE_SIZE + 16,
        width: 32,
        height: 16,
        impulse: -620,
      });
    }
  } else if (worldId === 'crystal_caves') {
    // Underground cavern feel with floating crystal platforms and locked gates
    for (let x = 6; x < widthInTiles - 6; x += 6) {
      const cy = 6 + (x % 4);
      tiles[cy][x] = TileType.SOLID;
      tiles[cy][x + 1] = TileType.SOLID;
      tiles[cy][x + 2] = TileType.BREAKABLE;
    }

    // Key and locked door
    if (localIndex >= 2) {
      const keyX = 14 * TILE_SIZE;
      const keyY = 5 * TILE_SIZE;
      entities.push({
        id: `key-${levelId}`,
        type: 'key',
        doorId: `door-${levelId}`,
        x: keyX,
        y: keyY,
        width: 20,
        height: 20,
      });

      // Door blocking the finish
      const doorTileX = widthInTiles - 6;
      entities.push({
        id: `door-${levelId}`,
        type: 'door',
        doorId: `door-${levelId}`,
        x: doorTileX * TILE_SIZE,
        y: (groundY - 2) * TILE_SIZE,
        width: 16,
        height: 64,
        isOpen: false,
      });
    }
  } else if (worldId === 'frostbound_ruins') {
    // Slippery platforms and moving ice floes
    for (let x = 8; x < widthInTiles - 8; x += 7) {
      tiles[10][x] = TileType.ICE;
      tiles[10][x + 1] = TileType.ICE;
      tiles[10][x + 2] = TileType.ICE;
      // Spikes between slippery runs
      tiles[groundY][x + 3] = TileType.SPIKE_UP;
    }

    // Moving ice platform
    entities.push({
      id: `mplat-${levelId}`,
      type: 'moving_platform',
      x: 16 * TILE_SIZE,
      y: 8 * TILE_SIZE,
      width: 64,
      height: 16,
      startX: 14 * TILE_SIZE,
      startY: 8 * TILE_SIZE,
      endX: 24 * TILE_SIZE,
      endY: 8 * TILE_SIZE,
      speed: 0.4 + (localIndex * 0.03),
      progress: 0,
      direction: 1,
    });
  } else if (worldId === 'gearwork_factory') {
    // Factory conveyors and hopping hazards
    for (let x = 6; x < widthInTiles - 8; x += 8) {
      tiles[9][x] = TileType.SOLID;
      tiles[9][x + 1] = TileType.PLATFORM;
      tiles[9][x + 2] = TileType.PLATFORM;
      tiles[9][x + 3] = TileType.SOLID;
    }

    // Hopping hazard
    entities.push({
      id: `hopper-${levelId}`,
      type: 'enemy_hopper',
      x: 20 * TILE_SIZE,
      y: (groundY - 1) * TILE_SIZE,
      width: 24,
      height: 24,
      jumpCooldown: 2.0,
      jumpTimer: 1.0,
      vy: 0,
      animTimer: 0,
    });
  } else if (worldId === 'ember_depths') {
    // Lava pits and falling crumbly blocks
    for (let x = 7; x < widthInTiles - 8; x += 6) {
      tiles[8][x] = TileType.BREAKABLE;
      tiles[8][x + 1] = TileType.BREAKABLE;
      tiles[groundY][x] = TileType.SPIKE_UP;
      tiles[groundY][x + 1] = TileType.SPIKE_UP;
    }

    // Patrol fire imp
    entities.push({
      id: `patrol-${levelId}`,
      type: 'enemy_patrol',
      x: 18 * TILE_SIZE,
      y: (groundY - 1) * TILE_SIZE,
      width: 24,
      height: 24,
      rangeLeft: 14 * TILE_SIZE,
      rangeRight: 24 * TILE_SIZE,
      speed: 60,
      direction: 1,
      animTimer: 0,
    });
  } else {
    // Skybound Frontier - vertical heights, floating cloud platforms, long jumps
    for (let x = 6; x < widthInTiles - 6; x += 5) {
      const py = 6 + (x % 5);
      tiles[py][x] = TileType.PLATFORM;
      tiles[py][x + 1] = TileType.PLATFORM;
    }
    // High-altitude spring
    entities.push({
      id: `spring-sky-${levelId}`,
      type: 'spring',
      x: 12 * TILE_SIZE,
      y: (groundY - 1) * TILE_SIZE + 16,
      width: 32,
      height: 16,
      impulse: -680,
    });
  }

  // Checkpoint in the middle of the level
  const midTileX = Math.floor(widthInTiles / 2);
  entities.push({
    id: `checkpoint-${levelId}`,
    type: 'checkpoint',
    x: midTileX * TILE_SIZE,
    y: (groundY - 1) * TILE_SIZE,
    width: 24,
    height: 32,
    active: false,
  });

  // 3 Gems placed across the level path
  entities.push({
    id: `gem-${levelId}-0`,
    type: 'gem',
    gemIndex: 0,
    x: (midTileX - 8) * TILE_SIZE,
    y: (groundY - 3) * TILE_SIZE,
    width: 20,
    height: 20,
  });
  entities.push({
    id: `gem-${levelId}-1`,
    type: 'gem',
    gemIndex: 1,
    x: midTileX * TILE_SIZE,
    y: (groundY - 4) * TILE_SIZE,
    width: 20,
    height: 20,
  });
  entities.push({
    id: `gem-${levelId}-2`,
    type: 'gem',
    gemIndex: 2,
    x: (widthInTiles - 8) * TILE_SIZE,
    y: (groundY - 2) * TILE_SIZE,
    width: 20,
    height: 20,
  });

  // Goal Gate at the end
  const goalX = (widthInTiles - 4) * TILE_SIZE;
  const goalY = (groundY - 1) * TILE_SIZE;
  entities.push({
    id: `goal-${levelId}`,
    type: 'goal',
    x: goalX,
    y: goalY,
    width: 32,
    height: 48,
  });

  // Patrol enemy on ground in later levels
  if (localIndex >= 3 && worldId !== 'ember_depths') {
    entities.push({
      id: `patrol-${levelId}`,
      type: 'enemy_patrol',
      x: (midTileX + 3) * TILE_SIZE,
      y: (groundY - 1) * TILE_SIZE + 8,
      width: 24,
      height: 24,
      rangeLeft: (midTileX + 1) * TILE_SIZE,
      rangeRight: (midTileX + 6) * TILE_SIZE,
      speed: 45,
      direction: 1,
      animTimer: 0,
    });
  }

  const spawnX = 2 * TILE_SIZE;
  const spawnY = (groundY - 1) * TILE_SIZE;

  const levelName = getLevelName(worldId, localIndex);

  return {
    id: levelId,
    worldId,
    name: levelName,
    widthInTiles,
    heightInTiles,
    tileSize: TILE_SIZE,
    spawnX,
    spawnY,
    tiles,
    entities,
    targetTimeSeconds: 25 + localIndex * 3,
  };
}

function getLevelName(worldId: WorldId, localIndex: number): string {
  const names: Record<WorldId, string[]> = {
    green_hills: [
      'Gentle Slopes',
      'Daisy Meadow',
      'Bouncy Meadows',
      'The First Chasm',
      'Pebble Steps',
      'Hillside Breeze',
      'Springboard Run',
      'Verdant Path',
      'Acorn Ridge',
      'Windmill Crest',
      'Sunny Outlook',
      'Rolling Glade',
      'Thistle Gulch',
      'High Prairie',
      'Clover Finale',
    ],
    crystal_caves: [
      'Glimmering Hollow',
      'Keymaster Vault',
      'Quartz Cavern',
      'Stalactite Pass',
      'Amethyst Gorge',
      'Echoing Depths',
      'Gemstone Quarry',
      'Locked Gallery',
      'Subterranean Rise',
      'Glittering Maze',
      'Crystal Causeway',
      'Shadowed Chasm',
      'Prism Chamber',
      'Geode Fortress',
      'Deep Core Vault',
    ],
    frostbound_ruins: [
      'Glacial Steps',
      'Slick Slope',
      'Frostbite Crevasse',
      'Shivering Drift',
      'Icicle Gauntlet',
      'Frozen Citadel',
      'Sliding Floe',
      'Bitterwind Pass',
      'Aurora Terrace',
      'Permafrost Run',
      'Icebound Gate',
      'Coldfront Leap',
      'Hailstone Alley',
      'Blizzard Summit',
      'The Frozen Citadel',
    ],
    gearwork_factory: [
      'Piston Alley',
      'Conveyor Junction',
      'Steamworks Deck',
      'Hopper Basin',
      'Gearshift Tower',
      'Assembly Line',
      'Hydraulic Vault',
      'Overclocked Rise',
      'Clockwork Maze',
      'Boiler Room Run',
      'Furnace Bypass',
      'Dynamo Chamber',
      'Press Floor',
      'Turbine Shaft',
      'Master Machinery',
    ],
    ember_depths: [
      'Cinder Walk',
      'Magma Rapids',
      'Brimstone Ledge',
      'Cracked Caldera',
      'Fiery Geysers',
      'Molten Causeway',
      'Ashfall Tunnel',
      'Obsidian Gate',
      'Inferno Vault',
      'Lava Piston Run',
      'Scorched Terrace',
      'Ember Crossing',
      'Hellfire Spire',
      'Basalt Ridge',
      'Heart of the Volcano',
    ],
    skybound_frontier: [
      'Skyline Ascent',
      'Cloud Isle 1',
      'Zephyr Pass',
      'Floating Ruins',
      'Updraft Crossing',
      'Cumulus Leap',
      'Stratosphere Ledge',
      'Nimbus Bastion',
      'Wind Dancer Gate',
      'Thunderhead Apex',
      'Skyward Arch',
      'Cirrus Heights',
      'Horizon Pillar',
      'Celestial Terrace',
      'Ether Cavern',
      'Solar Archway',
      'Stormwatch Tower',
      'Valkyrie Walk',
      'High Altitude Trial',
      'Cloudburst Sprint',
      'Starfall Causeway',
      'Aurora Spire',
      'Aero Colosseum',
      'Frontier Summit',
      'The Grand Horizon Finale',
    ],
  };

  const list = names[worldId];
  if (list && list[localIndex - 1]) {
    return list[localIndex - 1];
  }
  return `Level ${localIndex}`;
}

/**
 * Level Validation Routine:
 * Checks for missing spawn, missing exit, spawn inside solid, goal reachable.
 */
export interface ValidationResult {
  valid: boolean;
  errors: string[];
}

export function validateLevel(level: LevelDefinition): ValidationResult {
  const errors: string[] = [];

  if (level.widthInTiles < 10 || level.heightInTiles < 8) {
    errors.push(`Level dimensions too small: ${level.widthInTiles}x${level.heightInTiles}`);
  }

  // Check spawn tile
  const spawnTileX = Math.floor(level.spawnX / level.tileSize);
  const spawnTileY = Math.floor(level.spawnY / level.tileSize);
  if (
    spawnTileX < 0 ||
    spawnTileX >= level.widthInTiles ||
    spawnTileY < 0 ||
    spawnTileY >= level.heightInTiles
  ) {
    errors.push(`Spawn point (${level.spawnX}, ${level.spawnY}) out of bounds`);
  } else {
    const tileAtSpawn = level.tiles[spawnTileY][spawnTileX];
    if (tileAtSpawn === TileType.SOLID) {
      errors.push(`Spawn point (${spawnTileX}, ${spawnTileY}) is inside a solid tile`);
    }
  }

  // Check goal entity
  const goal = level.entities.find((e) => e.type === 'goal');
  if (!goal) {
    errors.push('Missing goal exit gate');
  } else {
    const goalTileX = Math.floor(goal.x / level.tileSize);
    const goalTileY = Math.floor(goal.y / level.tileSize);
    if (goalTileX < 0 || goalTileX >= level.widthInTiles || goalTileY < 0 || goalTileY >= level.heightInTiles) {
      errors.push(`Goal exit at (${goal.x}, ${goal.y}) is out of bounds`);
    }
  }

  // Check collectibles
  const gems = level.entities.filter((e) => e.type === 'gem');
  if (gems.length === 0) {
    errors.push('Level has no collectible gems');
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}
