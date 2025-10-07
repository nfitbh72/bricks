/**
 * Level class - manages level state and bricks
 */

import { LevelConfig, BrickConfig } from './types';
import { Brick } from './Brick';
import { BRICK_WIDTH, BRICK_SPACING } from '../config/constants';

export class Level {
  private readonly config: LevelConfig;
  private bricks: Brick[];

  constructor(config: LevelConfig, canvasWidth?: number) {
    this.config = config;
    this.bricks = this.createBricksFromConfig(canvasWidth);
  }

  /**
   * Create Brick instances from level configuration
   * Optionally centers bricks horizontally based on canvas width
   */
  private createBricksFromConfig(canvasWidth?: number): Brick[] {
    let brickConfigs = this.config.bricks;
    
    // If canvas width provided, center the bricks
    if (canvasWidth !== undefined && brickConfigs.length > 0) {
      // Find the width of the brick layout
      const maxCol = Math.max(...brickConfigs.map(b => b.col));
      const minCol = Math.min(...brickConfigs.map(b => b.col));
      const layoutWidth = maxCol - minCol + 1;
      
      // Calculate canvas width in columns
      const canvasWidthCols = Math.floor(canvasWidth / (BRICK_WIDTH + BRICK_SPACING));
      
      // Calculate offset to center
      const offsetCol = Math.max(0, Math.floor((canvasWidthCols - layoutWidth) / 2)) - minCol;
      
      // Apply offset to all bricks
      brickConfigs = brickConfigs.map(bc => ({
        ...bc,
        col: bc.col + offsetCol,
      }));
    }
    
    return brickConfigs.map((brickConfig) => new Brick(brickConfig));
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
   * Check if level is complete (all bricks destroyed)
   */
  isComplete(): boolean {
    return this.bricks.every((brick) => brick.isDestroyed());
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
   */
  getPlayerHealth(): number {
    return this.config.playerHealth;
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
