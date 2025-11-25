/**
 * Level class - manages level state and bricks
 */

import { LevelConfig } from '../core/types';
import { Brick } from './Brick';

export class Level {
  private readonly config: LevelConfig;
  private bricks: Brick[];

  constructor(config: LevelConfig, bricks: Brick[]) {
    this.config = config;
    this.bricks = bricks;
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
    // Resetting requires recreating bricks from config, which now lives in Factory
    // However, we can just restore existing bricks
    this.bricks.forEach(brick => brick.restore());
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
