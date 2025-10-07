/**
 * Level class - manages level state and bricks
 */

import { LevelConfig } from './types';
import { Brick } from './Brick';

export class Level {
  private readonly config: LevelConfig;
  private bricks: Brick[];

  constructor(config: LevelConfig) {
    this.config = config;
    this.bricks = this.createBricksFromConfig();
  }

  /**
   * Create Brick instances from level configuration
   */
  private createBricksFromConfig(): Brick[] {
    return this.config.bricks.map(
      (brickConfig) =>
        new Brick(
          brickConfig.x,
          brickConfig.y,
          brickConfig.width,
          brickConfig.height,
          brickConfig.health,
          brickConfig.color
        )
    );
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
   * Get ball speed for this level
   */
  getBallSpeed(): number {
    return this.config.ballSpeed;
  }

  /**
   * Get bat width for this level
   */
  getBatWidth(): number {
    return this.config.batWidth;
  }

  /**
   * Get bat height for this level
   */
  getBatHeight(): number {
    return this.config.batHeight;
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
