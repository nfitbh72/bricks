/**
 * CollisionManager - Handles all collision detection and resolution
 */

import { Ball } from '../entities/Ball';
import { Bat } from '../entities/Bat';
import { Brick } from '../entities/Brick';
import { Level } from '../entities/Level';
import { Bounds } from '../core/IEntity';
import { GameUpgrades } from '../systems/GameUpgrades';
import { DynamiteStick } from '../entities/offensive/DynamiteStick';
import { BaseBoss } from '../entities/offensive/BaseBoss';
import { Boss2 } from '../entities/offensive/Boss2';
import { GameContext } from '../core/GameContext';
import { EventManager, GameEvents } from '../core/EventManager';
import { checkCircleRectCollision } from '../core/utils';
import { CollisionGroup } from '../core/CollisionTypes';
import { ICollidable } from '../core/ICollidable';
import {
  BRICK_WIDTH,
  EXPLOSION_RADIUS_MULTIPLIER,
  DYNAMITE_BAT_DAMAGE_PERCENT,
  BAT_DAMAGE_FROM_BOMB_BRICK_PERCENT,
  DYNAMITE_BRICK_DAMAGE_MULTIPLIER,
} from '../../config/constants';

export interface CollisionCallbacks {
  onBrickHit?: (brick: Brick, damage: number, isCritical: boolean, hitX?: number, hitY?: number) => void;
  onBrickDestroyed?: (brick: Brick, x: number, y: number, isCritical: boolean, ball?: Ball) => void;
  onExplosionDamage?: (brick: Brick, damage: number, x: number, y: number) => void;
  onBatDamaged?: (damagePercent: number) => void;
}

function isCollidable(entity: unknown): entity is ICollidable {
  return entity !== null && entity !== undefined && typeof (entity as ICollidable).getCollisionGroup === 'function';
}

export class CollisionManager {
  private eventManager: EventManager;
  private spatialHash;
  private piercingTimeRemaining: number = 0;
  private collidables: ICollidable[] = [];
  private handlers: Map<string, (a: ICollidable, b: ICollidable) => void> = new Map();

  constructor(context: GameContext) {
    this.eventManager = context.eventManager;
    this.spatialHash = context.spatialHash;
  }

  /**
   * Update piercing timer and ball visual state
   */
  update(deltaTime: number, ball: Ball): void {
    if (this.piercingTimeRemaining > 0) {
      this.piercingTimeRemaining -= deltaTime;
      if (this.piercingTimeRemaining < 0) {
        this.piercingTimeRemaining = 0;
      }
    }

    // Update ball's piercing visual state with time remaining for flash effect
    ball.setPiercing(this.piercingTimeRemaining > 0, this.piercingTimeRemaining);
  }

  /**
   * Register generic collision handler for a pair of groups
   */
  registerHandler(groupA: CollisionGroup, groupB: CollisionGroup, handler: (a: ICollidable, b: ICollidable) => void): void {
    const key = this.getHandlerKey(groupA, groupB);
    this.handlers.set(key, handler);
  }

  private getHandlerKey(a: CollisionGroup, b: CollisionGroup): string {
    return [a, b].sort().join(':');
  }

  /**
   * Register an entity for generic collision processing
   */
  register(entity: ICollidable): void {
    this.collidables.push(entity);
  }

  /**
   * Clear all registered collidables – called each frame before registration
   */
  clearCollidables(): void {
    this.collidables = [];
  }

  /**
   * Get all registered collidables (for area-of-effect calculations)
   */
  getCollidables(): ICollidable[] {
    return this.collidables;
  }

  /**
   * Populate spatial hash with all active bricks
   * Call this once per frame before collision detection
   */
  populateSpatialHash(level: Level): void {
    this.spatialHash.clear();
    const bricks = level.getActiveBricks();
    for (const brick of bricks) {
      this.spatialHash.insert(brick);
    }
  }

  /**
   * Process all registered collidables and emit events
   * Uses spatial hash for brick collisions, direct iteration for others
   */
  processCollisions(): void {
    for (let i = 0; i < this.collidables.length; i++) {
      const source = this.collidables[i];
      if (!source.isActive()) continue;
      
      // Ensure source is ICollidable
      if (!isCollidable(source)) continue;

      const sourceBounds = source.getBounds();
      if (!sourceBounds) continue;

      const sourceGroup = source.getCollisionGroup();

      // For brick-related collisions, use spatial hash optimization
      if (sourceGroup === CollisionGroup.LASER || sourceGroup === CollisionGroup.BOMB) {
        const nearbyEntities = this.spatialHash.query(sourceBounds);
        for (const entity of nearbyEntities) {
          // Filter to only ICollidable entities
          if (isCollidable(entity)) {
            this.checkCollisionPair(source, entity, sourceBounds);
          }
        }
      } else {
        // For other collisions (BAT vs OFFENSIVE), check against all collidables
        for (let j = i + 1; j < this.collidables.length; j++) {
          const target = this.collidables[j];
          this.checkCollisionPair(source, target, sourceBounds);
        }
      }
    }
  }

  /**
   * Check collision between a pair of entities
   */
  private checkCollisionPair(source: ICollidable, target: ICollidable, sourceBounds: Bounds): void {
    if (target === source) return;
    if (!target.isActive()) return;

    const targetBounds = target.getBounds();
    if (!targetBounds) return;

    // Simple AABB overlap test
    if (
      sourceBounds.x < targetBounds.x + targetBounds.width &&
      sourceBounds.x + sourceBounds.width > targetBounds.x &&
      sourceBounds.y < targetBounds.y + targetBounds.height &&
      sourceBounds.y + sourceBounds.height > targetBounds.y
    ) {
      // Use registered handler if available
      const key = this.getHandlerKey(source.getCollisionGroup(), target.getCollisionGroup());
      const handler = this.handlers.get(key);
      
      if (handler) {
        handler(source, target);
      }

      // Call onCollision methods on entities
      source.onCollision(target, sourceBounds, targetBounds);
      target.onCollision(source, targetBounds, sourceBounds);

      // Emit generic collision event
      this.eventManager.emit(GameEvents.GENERIC_COLLISION, {
        entity1: source,
        entity2: target,
        bounds1: sourceBounds,
        bounds2: targetBounds
      });
    }
  }

  /**
   * Check ball-bat collision
   */
  checkBallBatCollision(ball: Ball, bat: Bat): void {
    if (ball.getIsGrey()) {
      return; // Skip collision if ball is grey
    }

    const ballBounds = ball.getCircleBounds();
    const batBounds = bat.getBounds();
    const batCollision = checkCircleRectCollision(ballBounds, batBounds);

    if (batCollision.collided) {
      ball.bounceOffBat(bat);
    }
  }

  /**
   * Check ball-brick collisions
   */
  checkBallBrickCollisions(
    ball: Ball,
    level: Level,
    gameUpgrades: GameUpgrades
  ): void {
    const ballBounds = ball.getBounds(); // AABB
    const ballCircle = ball.getCircleBounds(); // Circle for collision check

    // Query nearby bricks using spatial hash
    const nearbyEntities = this.spatialHash.query(ballBounds);
    const bricks = nearbyEntities.filter((e): e is Brick => e instanceof Brick);

    for (const brick of bricks) {
      const brickBounds = brick.getBounds();
      const collision = checkCircleRectCollision(ballCircle, brickBounds);

      if (collision.collided) {
        // Indestructible bricks always cause bounce and never trigger piercing
        const isIndestructible = brick.isIndestructible();

        // Check for piercing (only on destructible bricks)
        const piercingChance = gameUpgrades.getBallPiercingChance();
        const piercingDuration = gameUpgrades.getPiercingDuration();

        // Check if piercing is active (either from chance or from duration)
        let piercingAttempted = false;
        if (!isIndestructible) {
          if (this.piercingTimeRemaining > 0) {
            // Piercing is active from duration
            piercingAttempted = true;
          } else if (piercingChance > 0 && Math.random() < piercingChance) {
            // Piercing activated by chance
            piercingAttempted = true;
            // If duration upgrade is active, start the timer
            if (piercingDuration > 0) {
              this.piercingTimeRemaining = piercingDuration;
            }
          }
        }

        // For indestructible bricks, always bounce immediately
        if (isIndestructible && collision.normal) {
          ball.bounce(collision.normal);
          // Notify hit for sound/effects (no damage for indestructible)
          this.eventManager.emit(GameEvents.BRICK_HIT, {
            brick,
            damage: 0,
            isCritical: false,
            x: collision.point?.x,
            y: collision.point?.y
          });
        }

        // Track if brick was destroyed (for piercing logic)
        let brickDestroyed = false;

        // Skip damage, explosions, and notifications for indestructible bricks
        if (!isIndestructible) {
          // Calculate damage (with critical hit check)
          let damage = ball.getDamage();
          let isCritical = false;

          if (gameUpgrades.hasCriticalHits()) {
            const critChance = gameUpgrades.getTotalCriticalHitChance();
            if (Math.random() < critChance) {
              damage *= gameUpgrades.getCriticalHitDamageMultiplier();
              isCritical = true;
            }
          }

          // Damage brick and get destruction info
          const destructionInfo = brick.takeDamage(damage);
          brickDestroyed = destructionInfo.justDestroyed;

          // Notify hit (show damage numbers)
          this.eventManager.emit(GameEvents.BRICK_HIT, {
            brick,
            damage,
            isCritical,
            x: collision.point?.x,
            y: collision.point?.y
          });

          // Apply explosion damage to nearby bricks if upgrade is active
          if (gameUpgrades.hasBallExplosions()) {
            this.applyExplosionDamage(brick, brickBounds, ball.getDamage(), gameUpgrades);
          }

          // Track destroyed bricks and create particles
          if (destructionInfo.justDestroyed) {
            this.eventManager.emit(GameEvents.BRICK_DESTROYED, {
              brick,
              x: destructionInfo.centerX,
              y: destructionInfo.centerY,
              isCritical,
              ball
            });
          }

          // Bounce ball if piercing didn't destroy the brick
          // (Only skip bounce if piercing was attempted AND brick was destroyed)
          if ((!piercingAttempted || !brickDestroyed) && collision.normal) {
            ball.bounce(collision.normal);
          }
        }

        // Restore ball to normal if it was grey
        if (ball.getIsGrey()) {
          ball.restoreToNormal();
        }

        // Continue piercing only if piercing was attempted AND brick was destroyed
        const shouldContinuePiercing = piercingAttempted && brickDestroyed;
        if (!shouldContinuePiercing) {
          break;
        }
        // If piercing and brick was destroyed, continue to next brick
      }
    }
  }

  /**
   * Check dynamite stick-bat collisions and handle explosions
   */
  checkDynamiteStickCollisions(
    dynamiteSticks: DynamiteStick[],
    bat: Bat,
    allBricks: Brick[],
    currentBallDamage: number
  ): void {
    const batBounds = bat.getBounds();

    for (const dynamite of dynamiteSticks) {
      if (!dynamite.isActive()) continue;

      // Check if dynamite has exploded
      if (dynamite.hasExploded()) {
        const explosionResult = dynamite.getExplosionResult(allBricks);

        // Apply damage if explosion result is available (only happens once)
        if (explosionResult) {
          // Damage all bricks in explosion radius
          const brickDamage = currentBallDamage * DYNAMITE_BRICK_DAMAGE_MULTIPLIER;

          for (const brick of explosionResult.bricksToDamage) {
            const destructionInfo = brick.takeDamage(brickDamage);

            const brickBounds = brick.getBounds();
            // Notify explosion damage
            this.eventManager.emit('explosion_damage', {
              brick,
              damage: brickDamage,
              x: brickBounds.x + brickBounds.width / 2,
              y: brickBounds.y + brickBounds.height / 2
            });

            // Track if explosion destroyed this brick
            if (destructionInfo.justDestroyed) {
              this.eventManager.emit(GameEvents.BRICK_DESTROYED, {
                brick,
                x: destructionInfo.centerX,
                y: destructionInfo.centerY,
                isCritical: false
              });
            }
          }

          // Check if bat is in explosion radius
          const batCenterX = batBounds.x + batBounds.width / 2;
          const batCenterY = batBounds.y + batBounds.height / 2;
          const dx = batCenterX - explosionResult.centerX;
          const dy = batCenterY - explosionResult.centerY;
          const distanceToBat = Math.sqrt(dx * dx + dy * dy);

          if (distanceToBat <= explosionResult.radius) {
            // Damage bat
            bat.takeDamage(DYNAMITE_BAT_DAMAGE_PERCENT);

            // Notify bat damaged
            this.eventManager.emit('bat_damaged', { damagePercent: DYNAMITE_BAT_DAMAGE_PERCENT });
          }
        }

        // Deactivate dynamite only after explosion animation completes
        if (dynamite.isExplosionComplete()) {
          dynamite.deactivate();
        }
        continue;
      }
    }
  }

  /**
   * Apply explosion damage to nearby bricks
   */
  private applyExplosionDamage(
    hitBrick: Brick,
    hitBrickBounds: { x: number; y: number; width: number; height: number },
    baseDamage: number,
    gameUpgrades: GameUpgrades
  ): void {
    const explosionDamageMultiplier = gameUpgrades.getBallExplosionDamageMultiplier();
    const explosionDamage = baseDamage * explosionDamageMultiplier;
    const explosionRadiusMultiplier = gameUpgrades.getBallExplosionRadiusMultiplier();
    const explosionRadius = BRICK_WIDTH * EXPLOSION_RADIUS_MULTIPLIER * explosionRadiusMultiplier;

    // Get impact point (center of the brick that was hit)
    const impactX = hitBrickBounds.x + hitBrickBounds.width / 2;
    const impactY = hitBrickBounds.y + hitBrickBounds.height / 2;

    // Query spatial hash for bricks within explosion radius
    const explosionBounds = {
      x: impactX - explosionRadius,
      y: impactY - explosionRadius,
      width: explosionRadius * 2,
      height: explosionRadius * 2
    };
    const nearbyEntities = this.spatialHash.query(explosionBounds);
    const allBricks = nearbyEntities.filter((e): e is Brick => e instanceof Brick);

    // Check all other bricks for explosion damage
    for (const otherBrick of allBricks) {
      if (otherBrick === hitBrick || otherBrick.isDestroyed()) continue;

      // Skip indestructible bricks - explosions don't damage them
      if (otherBrick.isIndestructible()) continue;

      const otherBounds = otherBrick.getBounds();
      const otherCenterX = otherBounds.x + otherBounds.width / 2;
      const otherCenterY = otherBounds.y + otherBounds.height / 2;

      // Calculate distance from impact point to brick center
      const dx = otherCenterX - impactX;
      const dy = otherCenterY - impactY;
      const distance = Math.sqrt(dx * dx + dy * dy);

      // Apply explosion damage if within radius
      if (distance <= explosionRadius) {
        const destructionInfo = otherBrick.takeDamage(explosionDamage);

        // Notify explosion damage
        this.eventManager.emit('explosion_damage', {
          brick: otherBrick,
          damage: explosionDamage,
          x: otherCenterX,
          y: otherCenterY
        });

        // Track if explosion destroyed this brick
        if (destructionInfo.justDestroyed) {
          this.eventManager.emit(GameEvents.BRICK_DESTROYED, {
            brick: otherBrick,
            x: destructionInfo.centerX,
            y: destructionInfo.centerY,
            isCritical: false
          });
        }
      }
    }
  }

  /**
   * Check boss-ball collisions
   */
  checkBossBallCollisions(
    boss: BaseBoss,
    ball: Ball,
    onBossDamaged: (damage: number, x: number, y: number) => void,
    onBossDestroyed: (x: number, y: number) => void,
    onShieldBlocked?: (x: number, y: number) => void
  ): void {
    const ballBounds = ball.getCircleBounds();
    const bossBounds = boss.getBounds();

    if (!ballBounds || !bossBounds) return;

    // For Boss2, check shield arc collisions first (before body collision)
    if (boss instanceof Boss2 && onShieldBlocked) {
      const shieldAngle = boss.checkShieldCollision(ballBounds.x, ballBounds.y, ballBounds.radius);
      if (shieldAngle !== null) {
        // Shield arc hit - reflect the ball velocity across the radial normal
        const ballVelocity = ball.getVelocity();

        // Calculate radial direction (normal to the shield surface)
        const centerX = bossBounds.x + bossBounds.width / 2;
        const centerY = bossBounds.y + bossBounds.height / 2;
        const dx = ballBounds.x - centerX;
        const dy = ballBounds.y - centerY;
        const distance = Math.sqrt(dx * dx + dy * dy);

        // Normalize the radial vector (surface normal pointing outward)
        const normalX = dx / distance;
        const normalY = dy / distance;

        // Reflect velocity: v' = v - 2(v·n)n
        const dotProduct = ballVelocity.x * normalX + ballVelocity.y * normalY;
        const newVx = ballVelocity.x - 2 * dotProduct * normalX;
        const newVy = ballVelocity.y - 2 * dotProduct * normalY;

        ball.setVelocity(newVx, newVy);

        // Visual effects
        onShieldBlocked(centerX, centerY);
        return;
      }
    }

    // Convert ball circle to rect for collision
    const ballRect = {
      x: ballBounds.x - ballBounds.radius,
      y: ballBounds.y - ballBounds.radius,
      width: ballBounds.radius * 2,
      height: ballBounds.radius * 2
    };

    if (this.checkRectCollision(ballRect, bossBounds)) {
      // Boss body hit - apply damage
      const damage = ball.getDamage();
      boss.takeDamage(damage);
      ball.reverseY();

      // Notify damage
      const centerX = bossBounds.x + bossBounds.width / 2;
      const centerY = bossBounds.y + bossBounds.height / 2;
      onBossDamaged(damage, centerX, centerY);

      // Check if boss is destroyed
      if (boss.isDestroyed()) {
        onBossDestroyed(centerX, centerY);
      }
    }
  }

  /**
   * Check boss thrown brick-bat collisions
   */
  checkBossThrownBrickCollisions(
    boss: BaseBoss,
    bat: Bat,
    onThrownBrickHit: (x: number, y: number) => void
  ): void {
    const thrownBricks = boss.getThrownBricks();
    const batBounds = bat.getBounds();

    for (const thrownBrick of thrownBricks) {
      const brickBounds = thrownBrick.getBounds();
      if (brickBounds && this.checkRectCollision(brickBounds, batBounds)) {
        thrownBrick.deactivate();

        // Damage bat
        bat.takeDamage(BAT_DAMAGE_FROM_BOMB_BRICK_PERCENT);

        // Notify hit for effects
        const centerX = brickBounds.x + brickBounds.width / 2;
        const centerY = brickBounds.y + brickBounds.height / 2;
        onThrownBrickHit(centerX, centerY);
      }
    }
  }

  /**
   * Simple rectangle collision check
   */
  private checkRectCollision(
    a: { x: number; y: number; width: number; height: number },
    b: { x: number; y: number; width: number; height: number }
  ): boolean {
    return (
      a.x < b.x + b.width &&
      a.x + a.width > b.x &&
      a.y < b.y + b.height &&
      a.y + a.height > b.y
    );
  }
}
