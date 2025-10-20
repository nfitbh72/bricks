/**
 * OffensiveEntityManager - manages all offensive entities spawned by bricks
 * (falling bricks, debris, brick lasers)
 */

import { FallingBrick } from './FallingBrick';
import { Debris } from './Debris';
import { BrickLaser } from './BrickLaser';
import { Brick } from './Brick';
import { BrickType } from './types';
import { 
  EXPLODING_BRICK_DEBRIS_COUNT,
  EXPLODING_BRICK_DEBRIS_SPEED
} from '../config/constants';

export class OffensiveEntityManager {
  private fallingBricks: FallingBrick[] = [];
  private debris: Debris[] = [];
  private brickLasers: BrickLaser[] = [];

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
    }
  }

  /**
   * Update all offensive entities
   */
  update(deltaTime: number, canvasWidth: number, canvasHeight: number): void {
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
   * Clear all offensive entities
   */
  clear(): void {
    this.fallingBricks = [];
    this.debris = [];
    this.brickLasers = [];
  }
}
