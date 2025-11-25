/**
 * OffensiveEntityManager - manages all offensive entities spawned by bricks
 * (falling bricks, debris, brick lasers)
 */

import { IEntity } from '../core/IEntity';
import { FallingBrick } from '../entities/offensive/FallingBrick';
import { Debris } from '../entities/offensive/Debris';
import { BrickLaser } from '../entities/offensive/BrickLaser';
import { HomingMissile } from '../entities/offensive/HomingMissile';
import { HomingMissileWrapper } from '../entities/offensive/HomingMissileWrapper';
import { SplittingFragment } from '../entities/offensive/SplittingFragment';
import { DynamiteStick } from '../entities/offensive/DynamiteStick';
import { Brick } from '../entities/Brick';
import { OffensiveEntityFactory } from '../factories/OffensiveEntityFactory';

export class OffensiveEntityManager {
  private entities: IEntity[] = [];
  private homingMissileWrappers: HomingMissileWrapper[] = [];

  /**
   * Spawn offensive entity when an offensive brick is destroyed
   * Returns bricks to damage for OFFENSIVE_BOMB type, null otherwise
   */
  spawnOffensiveEntity(brick: Brick, x: number, y: number, batCenterX: number, allBricks?: Brick[]): Brick[] | null {
    const result = OffensiveEntityFactory.createEntities(brick, x, y, batCenterX, allBricks);

    // Add standard IEntity entities
    this.entities.push(...result.fallingBricks);
    this.entities.push(...result.debris);
    this.entities.push(...result.brickLasers);
    this.entities.push(...result.splittingFragments);
    this.entities.push(...result.dynamiteSticks);

    // Wrap homing missiles (they have special update signature)
    for (const missile of result.homingMissiles) {
      const wrapper = new HomingMissileWrapper(missile);
      this.homingMissileWrappers.push(wrapper);
      this.entities.push(wrapper);
    }

    return result.bricksToDamage.length > 0 ? result.bricksToDamage : null;
  }

  /**
   * Update all offensive entities
   */
  update(deltaTime: number, canvasWidth: number, canvasHeight: number, batCenterX: number, batCenterY: number): void {
    // Update homing missile wrappers with target position
    for (const wrapper of this.homingMissileWrappers) {
      wrapper.setTarget(batCenterX, batCenterY);
    }

    // Update all entities
    for (const entity of this.entities) {
      entity.update(deltaTime);
    }

    // Remove inactive or off-screen entities
    this.entities = this.entities.filter((entity) => {
      if (!entity.isActive()) return false;

      // Check if entity is off-screen based on its type
      if (entity instanceof FallingBrick) {
        return !entity.isOffScreen(canvasHeight);
      } else if (entity instanceof Debris) {
        return !entity.isOffScreen(canvasWidth, canvasHeight);
      } else if (entity instanceof BrickLaser) {
        return !entity.isOffScreen(canvasHeight);
      } else if (entity instanceof HomingMissileWrapper) {
        return !entity.isOffScreen(canvasWidth, canvasHeight);
      } else if (entity instanceof SplittingFragment) {
        return !entity.isOffScreen(canvasWidth, canvasHeight);
      } else if (entity instanceof DynamiteStick) {
        return !entity.isOffScreen(canvasHeight);
      }

      return true;
    });

    // Clean up homing missile wrapper references
    this.homingMissileWrappers = this.homingMissileWrappers.filter(w => w.isActive());
  }

  /**
   * Render all offensive entities
   */
  render(ctx: CanvasRenderingContext2D): void {
    for (const entity of this.entities) {
      entity.render(ctx);
    }
  }

  /**
   * Get all falling bricks (for collision detection)
   */
  getFallingBricks(): FallingBrick[] {
    return this.entities.filter((e): e is FallingBrick => e instanceof FallingBrick);
  }

  /**
   * Get all debris (for collision detection)
   */
  getDebris(): Debris[] {
    return this.entities.filter((e): e is Debris => e instanceof Debris);
  }

  /**
   * Get all brick lasers (for collision detection)
   */
  getBrickLasers(): BrickLaser[] {
    return this.entities.filter((e): e is BrickLaser => e instanceof BrickLaser);
  }

  /**
   * Get all homing missiles (for collision detection)
   */
  getHomingMissiles(): HomingMissile[] {
    return this.homingMissileWrappers.map(w => w.getHomingMissile());
  }

  /**
   * Get all splitting fragments (for collision detection)
   */
  getSplittingFragments(): SplittingFragment[] {
    return this.entities.filter((e): e is SplittingFragment => e instanceof SplittingFragment);
  }

  /**
   * Get all dynamite sticks (for collision detection)
   */
  getDynamiteSticks(): DynamiteStick[] {
    return this.entities.filter((e): e is DynamiteStick => e instanceof DynamiteStick);
  }

  /**
   * Clear all offensive entities
   */
  clear(): void {
    this.entities = [];
    this.homingMissileWrappers = [];
  }
}
