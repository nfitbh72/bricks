/**
 * BossManager - Handles boss spawning, updates, and lifecycle management
 * Extracts boss-related logic from Game.ts
 */

import { BaseBoss } from '../entities/offensive/BaseBoss';
import { Boss1 } from '../entities/offensive/Boss1';
import { Boss2 } from '../entities/offensive/Boss2';
import { Boss3 } from '../entities/offensive/Boss3';
import { Brick } from '../entities/Brick';
import { Level } from '../entities/Level';
import { Ball } from '../entities/Ball';
import { Bat } from '../entities/Bat';
import { EffectsManager } from './EffectsManager';
import { CollisionManager } from './CollisionManager';
import { AchievementTracker } from './AchievementTracker';
import { BrickType } from '../core/types';
import {
  BOSS1_HEALTH_MULTIPLIER,
  BOSS1_SPAWN_OFFSET_Y,
  BOSS2_HEALTH_MULTIPLIER,
  BOSS2_SPAWN_OFFSET_Y,
  BOSS3_HEALTH_MULTIPLIER,
  BOSS3_SPAWN_OFFSET_Y,
  SCREEN_SHAKE_BOMB_BRICK_INTENSITY,
  SCREEN_SHAKE_BOMB_BRICK_DURATION,
} from '../../config/constants';

export class BossManager {
  private boss: BaseBoss | null = null;
  private bossCopies: BaseBoss[] = [];
  private canvasWidth: number;
  private canvasHeight: number;

  constructor(canvasWidth: number, canvasHeight: number) {
    this.canvasWidth = canvasWidth;
    this.canvasHeight = canvasHeight;
  }

  /**
   * Activate a boss when a boss brick is hit
   */
  activateBoss(
    brick: Brick,
    info: { centerX: number; centerY: number },
    level: Level,
    effectsManager: EffectsManager
  ): void {
    // Restore brick health (prevent destruction)
    brick.restore();

    // Determine which boss type to spawn based on brick type
    const brickType = brick.getType();
    const baseHealth = level.getConfig().baseHealth || 1;

    // Calculate boss health and spawn offset based on boss type
    let bossHealth: number;
    let spawnOffsetY: number;

    if (brickType === BrickType.BOSS_2) {
      bossHealth = baseHealth * BOSS2_HEALTH_MULTIPLIER;
      spawnOffsetY = brick.getHeight() * BOSS2_SPAWN_OFFSET_Y;
    } else if (brickType === BrickType.BOSS_3) {
      bossHealth = baseHealth * BOSS3_HEALTH_MULTIPLIER;
      spawnOffsetY = brick.getHeight() * BOSS3_SPAWN_OFFSET_Y;
    } else {
      bossHealth = baseHealth * BOSS1_HEALTH_MULTIPLIER;
      spawnOffsetY = brick.getHeight() * BOSS1_SPAWN_OFFSET_Y;
    }

    // Spawn boss slightly above the brick position to avoid immediate ball collision
    const bossX = info.centerX - brick.getWidth() / 2;
    const bossY = info.centerY - brick.getHeight() / 2 + spawnOffsetY;

    // Create boss at safe position
    if (brickType === BrickType.BOSS_2) {
      this.boss = new Boss2(
        bossX,
        bossY,
        bossHealth,
        brick.getColor(),
        this.canvasWidth,
        this.canvasHeight
      );
    } else if (brickType === BrickType.BOSS_3) {
      this.boss = new Boss3(
        bossX,
        bossY,
        bossHealth,
        brick.getColor(),
        this.canvasWidth,
        this.canvasHeight
      );
    } else {
      // Default to Boss1
      this.boss = new Boss1(
        bossX,
        bossY,
        bossHealth,
        brick.getColor(),
        this.canvasWidth,
        this.canvasHeight
      );
    }

    // Give boss access to remaining bricks (excluding indestructible and the boss brick itself)
    const availableBricks = level.getBricks().filter(b =>
      b !== brick && !b.isIndestructible() && !b.isDestroyed()
    );
    this.boss.setAvailableBricks(availableBricks);

    // Create particles for boss activation
    effectsManager.createParticles(info.centerX, info.centerY, 50, brick.getColor(), 300);
  }

  /**
   * Update boss and boss copies
   */
  update(deltaTime: number, bat: Bat, effectsManager: EffectsManager): void {
    const batCenterX = bat.getCenterX();
    const batCenterY = bat.getCenterY();

    // Update boss if active
    if (this.boss && this.boss.isActive()) {
      this.boss.updateBoss(deltaTime, batCenterX, batCenterY);

      // Check if Boss3 should split
      if (this.boss instanceof Boss3 && this.boss.shouldSplit()) {
        const copies = this.boss.createSplitCopies();
        this.bossCopies = copies;
        this.boss.markAsSplit();

        // Create split effect
        const bounds = this.boss.getBounds();
        if (bounds) {
          effectsManager.createParticles(
            bounds.x + bounds.width / 2,
            bounds.y + bounds.height / 2,
            60,
            '#cc00ff',
            400
          );
        }
      }
    }

    // Update boss copies
    if (this.bossCopies.length > 0) {
      this.bossCopies = this.bossCopies.filter(copy => copy.isActive());
      for (const copy of this.bossCopies) {
        if (copy.isActive()) {
          copy.updateBoss(deltaTime, batCenterX, batCenterY);
        }
      }
    }
  }

  /**
   * Check collisions for boss and boss copies
   */
  checkCollisions(
    balls: Ball[],
    bat: Bat,
    collisionManager: CollisionManager,
    effectsManager: EffectsManager,
    achievementTracker: AchievementTracker
  ): void {
    // Boss collisions
    if (this.boss && this.boss.isActive()) {
      // Ball-Boss collision for all balls
      for (const ball of balls) {
        collisionManager.checkBossBallCollisions(
          this.boss,
          ball,
          (damage, x, y) => {
            // Create particles and damage number
            effectsManager.createParticles(x, y, 8, '#ff0000', 100);
            effectsManager.addDamageNumber(x, y - 5, damage, false);
          },
          (x, y) => {
            // Boss destroyed - create big explosion
            effectsManager.createParticles(x, y, 50, '#ff0000', 300);

            // Track boss defeat for achievements
            if (this.boss) {
              let bossType: string;
              if (this.boss instanceof Boss1) {
                bossType = 'BOSS_1';
              } else if (this.boss instanceof Boss2) {
                bossType = 'BOSS_2';
              } else if (this.boss instanceof Boss3) {
                bossType = 'BOSS_3';
              } else {
                bossType = 'UNKNOWN';
              }
              achievementTracker.onBossDefeated(bossType).catch(error => {
                console.warn('Achievement tracker error:', error);
              });
            }
          },
          (x, y) => {
            // Shield blocked - create cyan particles
            effectsManager.createParticles(x, y, 5, '#00ccff', 80);
          }
        );
      }

      // Thrown brick-Bat collision
      collisionManager.checkBossThrownBrickCollisions(
        this.boss,
        bat,
        (x, y) => {
          // Screen shake and particles
          effectsManager.triggerScreenShake(SCREEN_SHAKE_BOMB_BRICK_INTENSITY, SCREEN_SHAKE_BOMB_BRICK_DURATION);
          effectsManager.createParticles(x, y, 15, '#ff0000', 150);
        }
      );
    }

    // Boss copy collisions (for Boss3 split copies)
    for (const copy of this.bossCopies) {
      if (copy.isActive()) {
        // Check collisions with all balls
        for (const ball of balls) {
          collisionManager.checkBossBallCollisions(
            copy,
            ball,
            (damage, x, y) => {
              effectsManager.createParticles(x, y, 8, '#cc00ff', 100);
              effectsManager.addDamageNumber(x, y - 5, damage, false);
            },
            (x, y) => {
              effectsManager.createParticles(x, y, 30, '#cc00ff', 200);

              // Track boss copy defeat for achievements
              let bossType: string;
              if (copy instanceof Boss1) {
                bossType = 'BOSS_1';
              } else if (copy instanceof Boss2) {
                bossType = 'BOSS_2';
              } else if (copy instanceof Boss3) {
                bossType = 'BOSS_3';
              } else {
                bossType = 'UNKNOWN';
              }
              achievementTracker.onBossDefeated(bossType).catch(error => {
                console.warn('Achievement tracker error:', error);
              });
            }
          );
        }

        collisionManager.checkBossThrownBrickCollisions(
          copy,
          bat,
          (x, y) => {
            effectsManager.triggerScreenShake(SCREEN_SHAKE_BOMB_BRICK_INTENSITY, SCREEN_SHAKE_BOMB_BRICK_DURATION);
            effectsManager.createParticles(x, y, 15, '#cc00ff', 150);
          }
        );
      }
    }
  }

  /**
   * Register boss and boss copies for generic collision detection
   */
  registerForCollisions(collisionManager: CollisionManager): void {
    // Register Boss3 splitting fragments
    if (this.boss && this.boss.isActive() && this.boss instanceof Boss3) {
      for (const fragment of this.boss.getSplittingFragments()) {
        collisionManager.register(fragment);
      }
    }
    for (const copy of this.bossCopies) {
      if (copy.isActive() && copy instanceof Boss3) {
        for (const fragment of copy.getSplittingFragments()) {
          collisionManager.register(fragment);
        }
      }
    }
  }

  /**
   * Check if boss is defeated
   */
  isBossDefeated(): boolean {
    return !this.boss || this.boss.isDestroyed();
  }

  /**
   * Check if all boss copies are defeated
   */
  areAllCopiesDefeated(): boolean {
    return this.bossCopies.length === 0 || this.bossCopies.every(c => c.isDestroyed());
  }

  /**
   * Check if level is complete (boss and all copies defeated)
   */
  isComplete(): boolean {
    return this.isBossDefeated() && this.areAllCopiesDefeated();
  }

  /**
   * Get active boss
   */
  getBoss(): BaseBoss | null {
    return this.boss;
  }

  /**
   * Get boss copies
   */
  getBossCopies(): BaseBoss[] {
    return this.bossCopies;
  }

  /**
   * Check if a boss is currently active
   */
  hasBoss(): boolean {
    return this.boss !== null && this.boss.isActive();
  }

  /**
   * Clear boss and copies
   */
  clear(): void {
    this.boss = null;
    this.bossCopies = [];
  }
}
