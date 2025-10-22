/**
 * OffensiveEntityManager - manages all offensive entities spawned by bricks
 * (falling bricks, debris, brick lasers)
 */

import { FallingBrick } from '../entities/offensive/FallingBrick';
import { Debris } from '../entities/offensive/Debris';
import { BrickLaser } from '../entities/offensive/BrickLaser';
import { HomingMissile } from '../entities/offensive/HomingMissile';
import { Brick } from '../entities/Brick';
import { BrickType } from '../core/types';
import { 
  EXPLODING_BRICK_DEBRIS_COUNT,
  EXPLODING_BRICK_DEBRIS_SPEED
} from '../../config/constants';

export class OffensiveEntityManager {
  private fallingBricks: FallingBrick[] = [];
  private debris: Debris[] = [];
  private brickLasers: BrickLaser[] = [];
  private homingMissiles: HomingMissile[] = [];

  /**
   * Spawn offensive entity when an offensive brick is destroyed
   */
  spawnOffensiveEntity(brick: Brick, x: number, y: number, batCenterX: number): void {
    const brickType = brick.getType();
    const color = brick.getColor();
    const brickBounds = brick.getBounds();

    switch (brickType) {
      case BrickType.OFFENSIVE_FALLING:
        // Create falling brick at destroyed brick position
        this.fallingBricks.push(new FallingBrick(brickBounds.x, brickBounds.y, color));
        break;

      case BrickType.OFFENSIVE_EXPLODING:
        // Create debris in 8 directions
        const angleStep = (Math.PI * 2) / EXPLODING_BRICK_DEBRIS_COUNT;
        for (let i = 0; i < EXPLODING_BRICK_DEBRIS_COUNT; i++) {
          const angle = angleStep * i;
          const velocityX = Math.cos(angle) * EXPLODING_BRICK_DEBRIS_SPEED;
          const velocityY = Math.sin(angle) * EXPLODING_BRICK_DEBRIS_SPEED;
          this.debris.push(new Debris(x, y, velocityX, velocityY, color));
        }
        break;

      case BrickType.OFFENSIVE_LASER:
        // Create laser targeting bat's current position
        this.brickLasers.push(new BrickLaser(x, y, batCenterX, color));
        break;

      case BrickType.OFFENSIVE_HOMING:
        // Create homing missile at destroyed brick position
        this.homingMissiles.push(new HomingMissile(x, y, color));
        break;
    }
  }

  /**
   * Update all offensive entities
   */
  update(deltaTime: number, canvasWidth: number, canvasHeight: number, batCenterX: number, batCenterY: number): void {
    // Update falling bricks
    for (const fallingBrick of this.fallingBricks) {
      fallingBrick.update(deltaTime);
    }

    // Update debris
    for (const debrisParticle of this.debris) {
      debrisParticle.update(deltaTime);
    }

    // Update brick lasers
    for (const laser of this.brickLasers) {
      laser.update(deltaTime);
    }

    // Update homing missiles (need bat position for tracking)
    for (const missile of this.homingMissiles) {
      missile.update(deltaTime, batCenterX, batCenterY);
    }

    // Remove inactive or off-screen entities
    this.fallingBricks = this.fallingBricks.filter(
      (fb) => fb.isActive() && !fb.isOffScreen(canvasHeight)
    );
    this.debris = this.debris.filter(
      (d) => d.isActive() && !d.isOffScreen(canvasWidth, canvasHeight)
    );
    this.brickLasers = this.brickLasers.filter(
      (bl) => bl.isActive() && !bl.isOffScreen(canvasHeight)
    );
    this.homingMissiles = this.homingMissiles.filter(
      (hm) => hm.isActive() && !hm.isOffScreen(canvasWidth, canvasHeight)
    );
  }

  /**
   * Render all offensive entities
   */
  render(ctx: CanvasRenderingContext2D): void {
    // Render falling bricks
    for (const fallingBrick of this.fallingBricks) {
      fallingBrick.render(ctx);
    }

    // Render debris
    for (const debrisParticle of this.debris) {
      debrisParticle.render(ctx);
    }

    // Render brick lasers
    for (const laser of this.brickLasers) {
      laser.render(ctx);
    }

    // Render homing missiles
    for (const missile of this.homingMissiles) {
      missile.render(ctx);
    }
  }

  /**
   * Get all falling bricks (for collision detection)
   */
  getFallingBricks(): FallingBrick[] {
    return this.fallingBricks;
  }

  /**
   * Get all debris (for collision detection)
   */
  getDebris(): Debris[] {
    return this.debris;
  }

  /**
   * Get all brick lasers (for collision detection)
   */
  getBrickLasers(): BrickLaser[] {
    return this.brickLasers;
  }

  /**
   * Get all homing missiles (for collision detection)
   */
  getHomingMissiles(): HomingMissile[] {
    return this.homingMissiles;
  }

  /**
   * Clear all offensive entities
   */
  clear(): void {
    this.fallingBricks = [];
    this.debris = [];
    this.brickLasers = [];
    this.homingMissiles = [];
  }
}
