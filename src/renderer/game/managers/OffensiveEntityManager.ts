/**
 * OffensiveEntityManager - manages all offensive entities spawned by bricks
 * (falling bricks, debris, brick lasers)
 */

import { FallingBrick } from '../entities/offensive/FallingBrick';
import { Debris } from '../entities/offensive/Debris';
import { BrickLaser } from '../entities/offensive/BrickLaser';
import { HomingMissile } from '../entities/offensive/HomingMissile';
import { SplittingFragment } from '../entities/offensive/SplittingFragment';
import { DynamiteStick } from '../entities/offensive/DynamiteStick';
import { Brick } from '../entities/Brick';
import { BrickType } from '../core/types';
import { 
  EXPLODING_BRICK_DEBRIS_COUNT,
  EXPLODING_BRICK_DEBRIS_SPEED,
  SPLITTING_FRAGMENT_SPEED,
  BOMB_BRICK_EXPLOSION_RADIUS_X_MULTIPLIER,
  BOMB_BRICK_EXPLOSION_RADIUS_Y_MULTIPLIER,
  BRICK_WIDTH,
  BRICK_HEIGHT
} from '../../config/constants';

export class OffensiveEntityManager {
  private fallingBricks: FallingBrick[] = [];
  private debris: Debris[] = [];
  private brickLasers: BrickLaser[] = [];
  private homingMissiles: HomingMissile[] = [];
  private splittingFragments: SplittingFragment[] = [];
  private dynamiteSticks: DynamiteStick[] = [];

  /**
   * Spawn offensive entity when an offensive brick is destroyed
   * Returns bricks to damage for OFFENSIVE_BOMB type, null otherwise
   */
  spawnOffensiveEntity(brick: Brick, x: number, y: number, batCenterX: number, allBricks?: Brick[]): Brick[] | null {
    const brickType = brick.getType();
    const color = brick.getColor();
    const brickBounds = brick.getBounds();

    switch (brickType) {
      case BrickType.OFFENSIVE_FALLING:
        // Create falling brick at destroyed brick position
        this.fallingBricks.push(new FallingBrick(brickBounds.x, brickBounds.y, color));
        return null;

      case BrickType.OFFENSIVE_EXPLODING:
        // Create debris in 8 directions
        const angleStep = (Math.PI * 2) / EXPLODING_BRICK_DEBRIS_COUNT;
        for (let i = 0; i < EXPLODING_BRICK_DEBRIS_COUNT; i++) {
          const angle = angleStep * i;
          const velocityX = Math.cos(angle) * EXPLODING_BRICK_DEBRIS_SPEED;
          const velocityY = Math.sin(angle) * EXPLODING_BRICK_DEBRIS_SPEED;
          this.debris.push(new Debris(x, y, velocityX, velocityY, color));
        }
        return null;

      case BrickType.OFFENSIVE_LASER:
        // Create laser targeting bat's current position
        this.brickLasers.push(new BrickLaser(x, y, batCenterX, color));
        return null;

      case BrickType.OFFENSIVE_HOMING:
        // Create homing missile at destroyed brick position
        this.homingMissiles.push(new HomingMissile(x, y, color));
        return null;

      case BrickType.OFFENSIVE_SPLITTING:
        // Create 4 diagonal fragments
        const angles = [Math.PI / 4, 3 * Math.PI / 4, 5 * Math.PI / 4, 7 * Math.PI / 4]; // 45°, 135°, 225°, 315°
        for (const angle of angles) {
          const velocityX = Math.cos(angle) * SPLITTING_FRAGMENT_SPEED;
          const velocityY = Math.sin(angle) * SPLITTING_FRAGMENT_SPEED;
          this.splittingFragments.push(new SplittingFragment(x, y, velocityX, velocityY, color));
        }
        return null;

      case BrickType.OFFENSIVE_BOMB:
        // Damage all bricks within elliptical area (wider horizontally, narrower vertically)
        if (!allBricks) return null;
        
        const bombCenter = {
          x: brickBounds.x + brickBounds.width / 2,
          y: brickBounds.y + brickBounds.height / 2
        };
        
        const bricksToDamage: Brick[] = [];
        // Ellipse radii - wider horizontally to hit adjacent bricks, narrower vertically to limit chain reactions
        const radiusX = BRICK_WIDTH * BOMB_BRICK_EXPLOSION_RADIUS_X_MULTIPLIER;
        const radiusY = BRICK_HEIGHT * BOMB_BRICK_EXPLOSION_RADIUS_Y_MULTIPLIER;
        
        for (const otherBrick of allBricks) {
          if (otherBrick === brick || otherBrick.isDestroyed() || otherBrick.isIndestructible()) {
            continue;
          }
          
          const otherBounds = otherBrick.getBounds();
          const otherCenter = {
            x: otherBounds.x + otherBounds.width / 2,
            y: otherBounds.y + otherBounds.height / 2
          };
          
          // Ellipse equation: (dx/rx)^2 + (dy/ry)^2 <= 1
          const dx = otherCenter.x - bombCenter.x;
          const dy = otherCenter.y - bombCenter.y;
          const ellipseValue = (dx / radiusX) ** 2 + (dy / radiusY) ** 2;
          
          if (ellipseValue <= 1) {
            bricksToDamage.push(otherBrick);
          }
        }
        
        return bricksToDamage;

      case BrickType.OFFENSIVE_DYNAMITE:
        // Create falling dynamite stick at destroyed brick position
        this.dynamiteSticks.push(new DynamiteStick(brickBounds.x, brickBounds.y, color));
        return null;

      default:
        return null;
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

    // Update splitting fragments
    for (const fragment of this.splittingFragments) {
      fragment.update(deltaTime);
    }

    // Update dynamite sticks
    for (const dynamite of this.dynamiteSticks) {
      dynamite.update(deltaTime);
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
    this.splittingFragments = this.splittingFragments.filter(
      (sf) => sf.isActive() && !sf.isOffScreen(canvasWidth, canvasHeight)
    );
    this.dynamiteSticks = this.dynamiteSticks.filter(
      (ds) => ds.isActive() && !ds.isOffScreen(canvasHeight)
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

    // Render splitting fragments
    for (const fragment of this.splittingFragments) {
      fragment.render(ctx);
    }

    // Render dynamite sticks
    for (const dynamite of this.dynamiteSticks) {
      dynamite.render(ctx);
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
   * Get all splitting fragments (for collision detection)
   */
  getSplittingFragments(): SplittingFragment[] {
    return this.splittingFragments;
  }

  /**
   * Get all dynamite sticks (for collision detection)
   */
  getDynamiteSticks(): DynamiteStick[] {
    return this.dynamiteSticks;
  }

  /**
   * Clear all offensive entities
   */
  clear(): void {
    this.fallingBricks = [];
    this.debris = [];
    this.brickLasers = [];
    this.homingMissiles = [];
    this.splittingFragments = [];
    this.dynamiteSticks = [];
  }
}
