/**
 * Core type definitions for the Bricks game
 */

/**
 * 2D vector representing position or velocity
 */
export interface Vector2D {
  x: number;
  y: number;
}

/**
 * Rectangle shape for collision detection
 */
export interface Rectangle {
  x: number;
  y: number;
  width: number;
  height: number;
}

/**
 * Circle shape for ball collision detection
 */
export interface Circle {
  x: number;
  y: number;
  radius: number;
}

/**
 * Game state enumeration
 */
export enum GameState {
  INTRO = 'INTRO',
  TUTORIAL = 'TUTORIAL',
  PLAYING = 'PLAYING',
  PAUSED = 'PAUSED',
  LEVEL_COMPLETE = 'LEVEL_COMPLETE',
  UPGRADE = 'UPGRADE',
  GAME_OVER = 'GAME_OVER',
  OPTIONS = 'OPTIONS',
  ACHIEVEMENTS = 'ACHIEVEMENTS',
}

/**
 * Brick types available in the game
 */
export enum BrickType {
  NORMAL = 'NORMAL',
  HEALTHY = 'HEALTHY',
  INDESTRUCTIBLE = 'INDESTRUCTIBLE',
  OFFENSIVE_FALLING = 'OFFENSIVE_FALLING',
  OFFENSIVE_EXPLODING = 'OFFENSIVE_EXPLODING',
  OFFENSIVE_LASER = 'OFFENSIVE_LASER',
  OFFENSIVE_HOMING = 'OFFENSIVE_HOMING',
  OFFENSIVE_SPLITTING = 'OFFENSIVE_SPLITTING',
  OFFENSIVE_BOMB = 'OFFENSIVE_BOMB',
  OFFENSIVE_DYNAMITE = 'OFFENSIVE_DYNAMITE',
  OFFENSIVE_MULTIBALL = 'OFFENSIVE_MULTIBALL',
  BOSS_1 = 'BOSS_1',
  BOSS_2 = 'BOSS_2',
  BOSS_3 = 'BOSS_3',
}

/**
 * Configuration for a single brick
 * Uses grid coordinates (row/col) instead of pixel coordinates
 */
export interface BrickConfig {
  row: number;      // Grid row position
  col: number;      // Grid column position
  type: BrickType;  // Type of brick (determines health and behavior)
  color?: string;   // Optional custom color override
}

/**
 * Configuration for a complete level
 */
export interface LevelConfig {
  id: number;
  name: string;
  bricks: BrickConfig[];
  baseHealth?: number; // Base health for normal bricks (default: 1). Healthy bricks = 3x base.
}

/**
 * Upgrade type
 */
export enum UpgradeType {
    BAT_WIDTH_INCREASE_10_PERCENT = 'BAT_WIDTH_INCREASE_10_PERCENT',
    BAT_ADD_SHOOTER = 'BAT_ADD_SHOOTER',
    BAT_SHOOTER_INCREASE_10_PERCENT = 'BAT_SHOOTER_INCREASE_10_PERCENT',
    BAT_ADDITIONAL_SHOOTER = 'BAT_ADDITIONAL_SHOOTER',
    BAT_ADD_STICKY = 'BAT_ADD_STICKY',
    BALL_DAMAGE_INCREASE_INCREMENT_1 = 'BALL_DAMAGE_INCREASE_INCREMENT_1',
    BALL_ADD_PIERCING = 'BALL_ADD_PIERCING',
    BALL_CHANCE_PIERCING_10_PERCENT = 'BALL_CHANCE_PIERCING_10_PERCENT',
    BALL_PIERCING_DURATION = 'BALL_PIERCING_DURATION',
    HEALTH_INCREASE_1 = 'HEALTH_INCREASE_1',
    BAT_ADD_BOMBS = 'BAT_ADD_BOMBS',
    BALL_EXPLOSIONS = 'BALL_EXPLOSIONS',
    BALL_EXPLOSIONS_INCREASE_10_PERCENT = 'BALL_EXPLOSIONS_INCREASE_10_PERCENT',
    BALL_EXPLOSION_RADIUS_INCREASE_20_PERCENT = 'BALL_EXPLOSION_RADIUS_INCREASE_20_PERCENT',
    BALL_ADD_CRITICAL_HITS = 'BALL_ADD_CRITICAL_HITS',
    BALL_CHANCE_CRITICAL_HITS_10_PERCENT = 'BALL_CHANCE_CRITICAL_HITS_10_PERCENT',
    BALL_SUPER_STATS = 'BALL_SUPER_STATS',
    BALL_ADD_MULTIBALL = 'BALL_ADD_MULTIBALL',
}

/**
 * Prerequisite requirement for an upgrade
 */
export interface UpgradePrerequisite {
  type: UpgradeType;
  level: number; // Required level (e.g., 3 means must be at level 3 or higher)
}

/**
 * Upgrade definition (flat structure)
 */
export interface Upgrade {
  name: string;
  description: string;
  times: number;
  type: UpgradeType;
  prerequisites?: UpgradePrerequisite[]; // Optional: requires ALL listed upgrades to be at specified levels
  
  // Legacy tree structure fields (deprecated, kept for backward compatibility)
  previewNextUpgrades?: number;
  unlockNextUpgradesAfterTimes?: number;
  nextUpgrades?: Upgrade[];
}

/**
 * Collision result with details
 */
export interface CollisionResult {
  collided: boolean;
  normal?: Vector2D;
  penetration?: number;
}

