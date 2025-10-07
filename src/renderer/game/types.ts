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
  GAME_OVER = 'GAME_OVER',
}

/**
 * Configuration for a single brick
 */
export interface BrickConfig {
  x: number;
  y: number;
  width: number;
  height: number;
  health: number;
  color?: string;
}

/**
 * Configuration for a complete level
 */
export interface LevelConfig {
  id: number;
  name: string;
  bricks: BrickConfig[];
  ballSpeed: number;
  batWidth: number;
  batHeight: number;
  playerHealth: number;
}

/**
 * Upgrade types available between levels
 */
export enum UpgradeType {
  BAT_WIDTH_INCREASE = 'BAT_WIDTH_INCREASE',
  BALL_SPEED_DECREASE = 'BALL_SPEED_DECREASE',
  EXTRA_HEALTH = 'EXTRA_HEALTH',
  MULTI_BALL = 'MULTI_BALL',
}

/**
 * Upgrade definition
 */
export interface Upgrade {
  type: UpgradeType;
  name: string;
  description: string;
  value: number;
}

/**
 * Collision result with details
 */
export interface CollisionResult {
  collided: boolean;
  normal?: Vector2D;
  penetration?: number;
}
