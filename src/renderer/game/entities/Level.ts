/**
 * Level class - manages level state and bricks
 */

import { LevelConfig, BrickType } from '../core/types';
import { Brick } from './Brick';
import { createBricksFromPattern, createBricksFromWord } from '../../config/brickLayout';
import { BRICK_WIDTH, BRICK_SPACING } from '../../config/constants';

export class Level {
  private readonly config: LevelConfig;
  private bricks: Brick[];
  private static readonly TOP_MARGIN_ROWS = 3; // 3 brick heights gap at top

  constructor(config: LevelConfig, canvasWidth?: number) {
    this.config = config;
    this.bricks = this.createBricksFromConfig(canvasWidth);
  }

  /**
   * Create a Level from a visual pattern
   * Convenience factory method for pattern-based levels
   */
  static createFromPattern(
    id: number,
    name: string,
    pattern: string[],
    canvasWidth?: number
  ): Level {
    const config: LevelConfig = {
      id,
      name,
      bricks: createBricksFromPattern(pattern),
    };
    return new Level(config, canvasWidth);
  }

  /**
   * Create a Level from a word
   * Uses letter patterns to spell out the word in bricks
   */
  static createFromWord(
    id: number,
    name: string,
    word: string,
    brickType: BrickType = BrickType.NORMAL,
    canvasWidth?: number
  ): Level {
    const config: LevelConfig = {
      id,
      name,
      bricks: createBricksFromWord(word, brickType),
    };
    return new Level(config, canvasWidth);
  }

  /**
   * Optionally centers bricks horizontally based on canvas width
   * Always adds top margin of 3 brick heights
   */
  private createBricksFromConfig(canvasWidth?: number): Brick[] {
    let brickConfigs = this.config.bricks;
    
    // Apply top margin (3 brick heights)
    brickConfigs = brickConfigs.map(bc => ({
      ...bc,
      row: bc.row + Level.TOP_MARGIN_ROWS,
    }));
    
    // If canvas width provided, center the bricks horizontally
    if (canvasWidth !== undefined && brickConfigs.length > 0) {
      // Find the width of the brick layout
      const maxCol = Math.max(...brickConfigs.map(b => b.col));
      const minCol = Math.min(...brickConfigs.map(b => b.col));
      const layoutWidth = maxCol - minCol + 1;
      
      // Calculate canvas width in columns
      const canvasWidthCols = Math.floor(canvasWidth / (BRICK_WIDTH + BRICK_SPACING));
      
      // Calculate offset to center
      const offsetCol = Math.max(0, Math.floor((canvasWidthCols - layoutWidth) / 2)) - minCol;
      
      // Apply horizontal offset to all bricks
      brickConfigs = brickConfigs.map(bc => ({
        ...bc,
        col: bc.col + offsetCol,
      }));
    }
    
    // Get baseHealth from config (default: 1)
    const baseHealth = this.config.baseHealth ?? 1;
    
    return brickConfigs.map((brickConfig) => new Brick(brickConfig, baseHealth));
  }

  /**
   * Get all bricks (including destroyed ones)
   */
  getBricks(): Brick[] {
    return this.bricks;
  }

  /**
   * Get only active (non-destroyed) bricks
   */
  getActiveBricks(): Brick[] {
    return this.bricks.filter((brick) => !brick.isDestroyed());
  }

  /**
   * Check if level is complete (all destructible bricks destroyed)
   * Indestructible bricks are ignored
   */
  isComplete(): boolean {
    return this.bricks
      .filter((brick) => !brick.isIndestructible())
      .every((brick) => brick.isDestroyed());
  }

  /**
   * Get number of remaining (non-destroyed) bricks
   */
  getRemainingBricks(): number {
    return this.getActiveBricks().length;
  }

  /**
   * Get total number of bricks in level
   */
  getTotalBricks(): number {
    return this.bricks.length;
  }

  /**
   * Get level configuration
   */
  getConfig(): LevelConfig {
    return { ...this.config };
  }

  /**
   * Get level ID
   */
  getId(): number {
    return this.config.id;
  }

  /**
   * Get level name
   */
  getName(): string {
    return this.config.name;
  }

  /**
   * Get player health for this level
   * @deprecated Health is now managed centrally in Game class
   */
  getPlayerHealth(): number {
    return 1; // Base health, actual health managed by Game
  }

  /**
   * Reset all bricks to full health
   */
  reset(): void {
    this.bricks = this.createBricksFromConfig();
  }

  /**
   * Render all active bricks
   */
  render(ctx: CanvasRenderingContext2D): void {
    for (const brick of this.bricks) {
      brick.render(ctx);
    }
  }
}
