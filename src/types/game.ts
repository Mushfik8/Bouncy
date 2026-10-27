/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type WorldId = 
  | 'green_hills'
  | 'crystal_caves'
  | 'frostbound_ruins'
  | 'gearwork_factory'
  | 'ember_depths'
  | 'skybound_frontier';

export interface WorldInfo {
  id: WorldId;
  name: string;
  subtitle: string;
  themeColor: string;
  accentColor: string;
  skyGradient: [string, string];
  levelCount: number;
  levelOffset: number;
  mechanicsDescription: string;
}

export const WORLDS: WorldInfo[] = [
  {
    id: 'green_hills',
    name: 'World 1: Green Hills',
    subtitle: 'Gentle slopes, sunny meadows & bouncy springs',
    themeColor: '#22c55e',
    accentColor: '#4ade80',
    skyGradient: ['#38bdf8', '#86efac'],
    levelCount: 15,
    levelOffset: 1,
    mechanicsDescription: 'Basic movement, jumping, collecting gems, springs & checkpoints',
  },
  {
    id: 'crystal_caves',
    name: 'World 2: Crystal Caves',
    subtitle: 'Underground tunnels, glowing geodes & secret keys',
    themeColor: '#a855f7',
    accentColor: '#c084fc',
    skyGradient: ['#1e1b4b', '#4c1d95'],
    levelCount: 15,
    levelOffset: 16,
    mechanicsDescription: 'Keys, locked gates, breakable crystal blocks & dark passages',
  },
  {
    id: 'frostbound_ruins',
    name: 'World 3: Frostbound Ruins',
    subtitle: 'Slippery ice sheets, falling icicles & moving floes',
    themeColor: '#38bdf8',
    accentColor: '#7dd3fc',
    skyGradient: ['#0f172a', '#0284c7'],
    levelCount: 15,
    levelOffset: 31,
    mechanicsDescription: 'Reduced friction ice surfaces, moving ice platforms & spike drops',
  },
  {
    id: 'gearwork_factory',
    name: 'World 4: Gearwork Factory',
    subtitle: 'Conveyors, piston springs & rotating hazards',
    themeColor: '#f59e0b',
    accentColor: '#fbbf24',
    skyGradient: ['#18181b', '#78350f'],
    levelCount: 15,
    levelOffset: 46,
    mechanicsDescription: 'Conveyor belts, crushing stompers, rapid springs & electric traps',
  },
  {
    id: 'ember_depths',
    name: 'World 5: Ember Depths',
    subtitle: 'Magma chambers, crumbling bridges & fiery geysers',
    themeColor: '#ef4444',
    accentColor: '#f87171',
    skyGradient: ['#270707', '#7f1d1d'],
    levelCount: 15,
    levelOffset: 61,
    mechanicsDescription: 'Lava hazards, collapsing bridges, precise bounce sequences',
  },
  {
    id: 'skybound_frontier',
    name: 'World 6: Skybound Frontier',
    subtitle: 'Floating citadels, high-altitude updrafts & apex trials',
    themeColor: '#6366f1',
    accentColor: '#818cf8',
    skyGradient: ['#1e1b4b', '#312e81'],
    levelCount: 25,
    levelOffset: 76,
    mechanicsDescription: 'Floating platforms, updrafts, wind currents & grand finale trials',
  },
];

export enum TileType {
  AIR = 0,
  SOLID = 1,
  PLATFORM = 2, // One-way jump-through platform
  ICE = 3,      // Low friction
  BREAKABLE = 4,// Breaks after 0.5s of contact
  SPIKE_UP = 5,
  SPIKE_DOWN = 6,
  CONVEYOR_LEFT = 7,
  CONVEYOR_RIGHT = 8,
}

export type EntityType = 
  | 'gem'
  | 'spring'
  | 'key'
  | 'door'
  | 'checkpoint'
  | 'goal'
  | 'enemy_patrol'
  | 'enemy_hopper'
  | 'moving_platform';

export interface BaseEntity {
  id: string;
  type: EntityType;
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface GemEntity extends BaseEntity {
  type: 'gem';
  gemIndex: number; // 0, 1, 2
  collected?: boolean;
}

export interface SpringEntity extends BaseEntity {
  type: 'spring';
  impulse: number;
  compressed?: number; // 0 to 1 for visual animation
}

export interface KeyEntity extends BaseEntity {
  type: 'key';
  doorId: string;
  collected?: boolean;
}

export interface DoorEntity extends BaseEntity {
  type: 'door';
  doorId: string;
  isOpen?: boolean;
}

export interface CheckpointEntity extends BaseEntity {
  type: 'checkpoint';
  active?: boolean;
}

export interface GoalEntity extends BaseEntity {
  type: 'goal';
}

export interface EnemyPatrolEntity extends BaseEntity {
  type: 'enemy_patrol';
  rangeLeft: number;
  rangeRight: number;
  speed: number;
  direction: number; // -1 or 1
  animTimer: number;
}

export interface EnemyHopperEntity extends BaseEntity {
  type: 'enemy_hopper';
  jumpCooldown: number;
  jumpTimer: number;
  vy: number;
  animTimer: number;
}

export interface MovingPlatformEntity extends BaseEntity {
  type: 'moving_platform';
  startX: number;
  startY: number;
  endX: number;
  endY: number;
  speed: number;
  progress: number; // 0 to 1
  direction: number; // 1 or -1
}

export type GameEntity = 
  | GemEntity 
  | SpringEntity 
  | KeyEntity 
  | DoorEntity 
  | CheckpointEntity 
  | GoalEntity 
  | EnemyPatrolEntity 
  | EnemyHopperEntity 
  | MovingPlatformEntity;

export interface LevelDefinition {
  id: number;
  worldId: WorldId;
  name: string;
  widthInTiles: number;
  heightInTiles: number;
  tileSize: number;
  spawnX: number;
  spawnY: number;
  tiles: number[][]; // row by row, tile[y][x]
  entities: GameEntity[];
  targetTimeSeconds: number;
}

export interface BallPhysicsState {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  isGrounded: boolean;
  isOnIce: boolean;
  coyoteTimer: number;
  jumpBufferTimer: number;
  squashX: number; // 1.0 = normal, >1.0 = wide/squished, <1.0 = tall/stretched
  squashY: number;
  eyeLookX: number;
  eyeLookY: number;
  rotation: number; // in radians
  hasKey: boolean;
  collectedGems: Set<number>;
  lastCheckpointX: number;
  lastCheckpointY: number;
  isDead: boolean;
  deathTimer: number;
}

export interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  life: number;
  maxLife: number;
  color: string;
  alpha: number;
}

export interface LevelProgress {
  completed: boolean;
  stars: number; // 0 to 3
  bestTime: number; // in seconds
  gemsCollected: number; // 0 to 3
}

export interface GameSettings {
  musicVolume: number; // 0 to 1
  sfxVolume: number;   // 0 to 1
  vibration: boolean;
  leftHandedControls: boolean;
  touchControlSize: 'normal' | 'large';
  screenShake: boolean;
  reducedMotion: boolean;
}
