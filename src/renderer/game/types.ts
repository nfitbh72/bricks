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
  PLAYING = 'PLAYING',
  PAUSED = 'PAUSED',
  LEVEL_COMPLETE = 'LEVEL_COMPLETE',
  UPGRADE = 'UPGRADE',
  GAME_OVER = 'GAME_OVER',
  OPTIONS = 'OPTIONS',
}

/**
 * Brick types available in the game
 */
export enum BrickType {
  NORMAL = 'NORMAL',
  HEALTHY = 'HEALTHY',
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
}

/**
 * Upgrade type
 */
export enum UpgradeType {
    BAT_WIDTH_INCREASE_10_PERCENT = 'BAT_WIDTH_INCREASE_10_PERCENT',
    BAT_ADD_SHOOTER = 'BAT_ADD_SHOOTER',
    BAT_SHOOTER_INCREASE_10_PERCENT = 'BAT_WIDTH_INCREASE_10_PERCENT',    
    BALL_DAMAGE_INCREASE_INCREMENT_1 = 'BALL_DAMAGE_INCREASE_INCREMENT_1',
    BALL_ADD_PIERCING = 'BALL_ADD_PIERCING',
    BALL_CHANCE_PIERCING_10_PERCENT = 'BALL_CHANCE_PIERCING_10_PERCENT',
    HEALTH_INCREASE_1 = 'HEALTH_INCREASE_1',
    BALL_EXPLOSIONS = 'BALL_EXPLOSIONS',
    BALL_EXPLOSIONS_INCREASE_10_PERCENT = 'BALL_EXPLOSIONS_INCREASE_10_PERCENT',
    BALL_ADD_CRITICAL_HITS = 'BALL_ADD_CRITICAL_HITS',
    BALL_CHANCE_CRITICAL_HITS_10_PERCENT = 'BALL_CHANCE_CRITICAL_HITS_10_PERCENT',
}

/**
 * Upgrade definition
 */
export interface Upgrade {
  name: string;
  description: string;
  times: number;
  previewNextUpgrades: number;
  unlockNextUpgradesAfterTimes: number;
  nextUpgrades: Upgrade[];
  type: UpgradeType;
}

/**
 * Collision result with details
 */
export interface CollisionResult {
  collided: boolean;
  normal?: Vector2D;
  penetration?: number;
}

