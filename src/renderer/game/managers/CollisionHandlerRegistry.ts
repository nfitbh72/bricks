/**
 * CollisionHandlerRegistry - Centralized registration of collision handlers
 * Separates collision logic from the main Game class
 */

import { CollisionManager } from './CollisionManager';
import { GameContext } from '../core/GameContext';
import { CollisionGroup } from '../core/CollisionTypes';
import { ICollidable } from '../core/ICollidable';
import { GameEvents } from '../core/EventManager';
import { Bomb } from '../weapons/Bomb';
import { Laser } from '../weapons/Laser';
import { Brick } from '../entities/Brick';
import { Bat } from '../entities/Bat';
import { FallingBrick } from '../entities/offensive/FallingBrick';
import { Debris } from '../entities/offensive/Debris';
import { BrickLaser } from '../entities/offensive/BrickLaser';
import { HomingMissile } from '../entities/offensive/HomingMissile';
import { HomingMissileWrapper } from '../entities/offensive/HomingMissileWrapper';
import { SplittingFragment } from '../entities/offensive/SplittingFragment';
import { DynamiteStick } from '../entities/offensive/DynamiteStick';
import {
  FALLING_BRICK_DAMAGE_PERCENT,
  EXPLODING_BRICK_DEBRIS_DAMAGE_PERCENT,
  LASER_BRICK_LASER_DAMAGE_PERCENT,
  HOMING_MISSILE_DAMAGE_PERCENT,
  SPLITTING_FRAGMENT_DAMAGE_PERCENT,
  DYNAMITE_BAT_DAMAGE_PERCENT,
} from '../../config/constants';

export class CollisionHandlerRegistry {
  /**
   * Register all collision handlers with the collision manager
   */
  static registerAllHandlers(
    collisionManager: CollisionManager,
    context: GameContext
  ): void {
    this.registerBombBrickHandler(collisionManager, context);
    this.registerLaserBrickHandler(collisionManager, context);
    this.registerBatOffensiveHandler(collisionManager, context);
  }

  /**
   * BOMB vs BRICK - Area-of-effect damage on explosion
   */
  private static registerBombBrickHandler(
    collisionManager: CollisionManager,
    context: GameContext
  ): void {
    collisionManager.registerHandler(
      CollisionGroup.BOMB,
      CollisionGroup.BRICK,
      (a: ICollidable, b: ICollidable) => {
        // Identify which is the bomb and which is the brick
        const bomb = a instanceof Bomb ? a : (b instanceof Bomb ? b : null);
        const brick = a instanceof Brick ? a : (b instanceof Brick ? b : null);

        if (!bomb || !brick) return;
        if (bomb.hasExploded()) return; // Already exploded

        // Trigger explosion
        bomb.explode();

        // Skip damage for indestructible bricks
        if (brick.isIndestructible()) return;

        // Get explosion parameters
        const bombPos = bomb.getPosition();
        const explosionRadius = bomb.getExplosionRadius();
        const bombDamage = bomb.getDamage();

        // Damage all bricks within explosion radius
        // We need to query all registered bricks, not just the collision partner
        for (const collidable of collisionManager.getCollidables()) {
          if (!(collidable instanceof Brick)) continue;
          if (collidable.isIndestructible()) continue;

          const targetBounds = collidable.getBounds();
          const targetCenter = {
            x: targetBounds.x + targetBounds.width / 2,
            y: targetBounds.y + targetBounds.height / 2
          };

          // Calculate distance from explosion center
          const dx = targetCenter.x - bombPos.x;
          const dy = targetCenter.y - bombPos.y;
          const distance = Math.sqrt(dx * dx + dy * dy);

          if (distance <= explosionRadius) {
            // Damage brick
            const destructionInfo = collidable.takeDamage(bombDamage);

            // Calculate closest point on brick to explosion center
            const closestX = Math.max(targetBounds.x, Math.min(bombPos.x, targetBounds.x + targetBounds.width));
            const closestY = Math.max(targetBounds.y, Math.min(bombPos.y, targetBounds.y + targetBounds.height));

            // Emit hit event
            context.eventManager.emit(GameEvents.BRICK_HIT, {
              brick: collidable,
              damage: bombDamage,
              isCritical: false,
              x: closestX,
              y: closestY
            });

            // Emit destroyed event if brick was destroyed
            if (destructionInfo.justDestroyed) {
              context.eventManager.emit(GameEvents.BRICK_DESTROYED, {
                brick: collidable,
                x: destructionInfo.centerX,
                y: destructionInfo.centerY,
                isCritical: false
              });
            }
          }
        }
      }
    );
  }

  /**
   * LASER vs BRICK - Direct damage on hit
   */
  private static registerLaserBrickHandler(
    collisionManager: CollisionManager,
    context: GameContext
  ): void {
    collisionManager.registerHandler(
      CollisionGroup.LASER,
      CollisionGroup.BRICK,
      (a: ICollidable, b: ICollidable) => {
        // Identify which is the laser and which is the brick
        const laser = a instanceof Laser ? a : (b instanceof Laser ? b : null);
        const brick = a instanceof Brick ? a : (b instanceof Brick ? b : null);

        if (!laser || !brick) return;

        // Deactivate laser after hitting any brick
        laser.deactivate();

        // Skip damage for indestructible bricks
        if (brick.isIndestructible()) return;

        // Damage brick
        const laserDamage = laser.getDamage();
        const destructionInfo = brick.takeDamage(laserDamage);

        // Calculate hit point
        const laserBounds = laser.getBounds();
        const brickBounds = brick.getBounds();
        const hitX = laserBounds.x + laserBounds.width / 2;
        const hitY = brickBounds.y + brickBounds.height;

        // Emit hit event
        context.eventManager.emit(GameEvents.BRICK_HIT, {
          brick,
          damage: laserDamage,
          isCritical: false,
          x: hitX,
          y: hitY
        });

        // Emit destroyed event if brick was destroyed
        if (destructionInfo.justDestroyed) {
          context.eventManager.emit(GameEvents.BRICK_DESTROYED, {
            brick,
            x: destructionInfo.centerX,
            y: destructionInfo.centerY,
            isCritical: false
          });
        }
      }
    );
  }

  /**
   * BAT vs OFFENSIVE - Damage bat when hit by offensive entities
   */
  private static registerBatOffensiveHandler(
    collisionManager: CollisionManager,
    context: GameContext
  ): void {
    collisionManager.registerHandler(
      CollisionGroup.BAT,
      CollisionGroup.OFFENSIVE,
      (a: ICollidable, b: ICollidable) => {
        // Identify which is the bat and which is the offensive entity
        const bat = a instanceof Bat ? a : (b instanceof Bat ? b : null);
        const offensive = a instanceof Bat ? b : a;

        if (!bat || !offensive) return;

        // Apply damage based on entity type
        // Note: In a future refactor, we could add getDamage() to ICollidable
        // or an IDamaging interface
        let damagePercent = 0;

        if (offensive instanceof FallingBrick) {
          damagePercent = FALLING_BRICK_DAMAGE_PERCENT;
        } else if (offensive instanceof Debris) {
          damagePercent = EXPLODING_BRICK_DEBRIS_DAMAGE_PERCENT;
        } else if (offensive instanceof BrickLaser) {
          damagePercent = LASER_BRICK_LASER_DAMAGE_PERCENT;
        } else if (offensive instanceof HomingMissile) {
          damagePercent = HOMING_MISSILE_DAMAGE_PERCENT;
        } else if (offensive instanceof SplittingFragment) {
          damagePercent = SPLITTING_FRAGMENT_DAMAGE_PERCENT;
        } else if (offensive instanceof DynamiteStick) {
          // Dynamite usually explodes rather than hitting directly, but direct hit causes damage
          damagePercent = DYNAMITE_BAT_DAMAGE_PERCENT;
        } else if (offensive instanceof HomingMissileWrapper) {
          damagePercent = HOMING_MISSILE_DAMAGE_PERCENT;
        }

        if (damagePercent > 0) {
          bat.takeDamage(damagePercent);
          context.eventManager.emit('bat_damaged', { damagePercent });
          offensive.deactivate();
        }
      }
    );
  }
}
