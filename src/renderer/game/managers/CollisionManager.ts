/**
 * CollisionManager - Handles all collision detection and resolution
 */

import { Ball } from '../entities/Ball';
import { Bat } from '../entities/Bat';
import { Brick } from '../entities/Brick';
import { Laser } from '../weapons/Laser';
import { Bomb } from '../weapons/Bomb';
import { Level } from '../entities/Level';
import { GameUpgrades } from '../systems/GameUpgrades';
import { FallingBrick } from '../entities/offensive/FallingBrick';
import { Debris } from '../entities/offensive/Debris';
import { BrickLaser } from '../entities/offensive/BrickLaser';
import { HomingMissile } from '../entities/offensive/HomingMissile';
import { SplittingFragment } from '../entities/offensive/SplittingFragment';
import { DynamiteStick } from '../entities/offensive/DynamiteStick';
import { BaseBoss } from '../entities/offensive/BaseBoss';
import { Boss2 } from '../entities/offensive/Boss2';
import { GameContext } from '../core/GameContext';
import { EventManager, GameEvents } from '../core/EventManager';
import { checkCircleRectCollision } from '../core/utils';
import {
  BRICK_WIDTH,
  EXPLOSION_RADIUS_MULTIPLIER,
  FALLING_BRICK_DAMAGE_PERCENT,
  EXPLODING_BRICK_DEBRIS_DAMAGE_PERCENT,
  LASER_BRICK_LASER_DAMAGE_PERCENT,
  HOMING_MISSILE_DAMAGE_PERCENT,
  SPLITTING_FRAGMENT_DAMAGE_PERCENT,
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

export class CollisionManager {
  private eventManager: EventManager;
  private spatialHash;
  private piercingTimeRemaining: number = 0;

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
   * Check ball-bat collision
   */
  checkBallBatCollision(ball: Ball, bat: Bat): void {
    if (ball.getIsGrey()) {
      return; // Skip collision if ball is grey
    }

    const ballBounds = ball.getBounds();
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
    const ballBounds = ball.getBounds();
    const bricks = level.getActiveBricks();

    for (const brick of bricks) {
      const brickBounds = brick.getBounds();
      const collision = checkCircleRectCollision(ballBounds, brickBounds);

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
            this.applyExplosionDamage(brick, brickBounds, bricks, ball.getDamage(), gameUpgrades);
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
   * Check laser-brick collisions
   */
  checkLaserBrickCollisions(
    lasers: Laser[],
    level: Level
  ): void {
    const bricks = level.getActiveBricks();
    const lasersToCheck = [...lasers];

    for (const laser of lasersToCheck) {
      if (!laser.isActive()) continue;

      const laserBounds = laser.getBounds();

      for (const brick of bricks) {
        const brickBounds = brick.getBounds();

        // Simple AABB collision
        if (
          laserBounds.x < brickBounds.x + brickBounds.width &&
          laserBounds.x + laserBounds.width > brickBounds.x &&
          laserBounds.y < brickBounds.y + brickBounds.height &&
          laserBounds.y + laserBounds.height > brickBounds.y
        ) {
          // Deactivate laser after hitting any brick
          laser.deactivate();

          // Skip damage and notifications for indestructible bricks
          if (!brick.isIndestructible()) {
            // Damage brick and get destruction info
            const laserDamage = laser.getDamage();
            const destructionInfo = brick.takeDamage(laserDamage);

            // Calculate hit point (approximate)
            const hitX = laserBounds.x + laserBounds.width / 2;
            const hitY = brickBounds.y + brickBounds.height; // Hit from bottom

            // Notify hit (show damage numbers)
            this.eventManager.emit(GameEvents.BRICK_HIT, {
              brick,
              damage: laserDamage,
              isCritical: false,
              x: hitX,
              y: hitY
            });

            // Track destroyed bricks
            if (destructionInfo.justDestroyed) {
              this.eventManager.emit(GameEvents.BRICK_DESTROYED, {
                brick,
                x: destructionInfo.centerX,
                y: destructionInfo.centerY,
                isCritical: false
              });
            }
          }

          break;
        }
      }
    }
  }

  /**
   * Check bomb-brick collisions with area damage
   */
  checkBombBrickCollisions(
    bombs: Bomb[],
    level: Level
  ): void {
    const bricks = level.getActiveBricks();
    const bombsToCheck = [...bombs];

    for (const bomb of bombsToCheck) {
      if (!bomb.isActive() || bomb.hasExploded()) continue;

      const bombBounds = bomb.getBounds();

      for (const brick of bricks) {
        const brickBounds = brick.getBounds();

        // Simple AABB collision
        if (
          bombBounds.x < brickBounds.x + brickBounds.width &&
          bombBounds.x + bombBounds.width > brickBounds.x &&
          bombBounds.y < brickBounds.y + brickBounds.height &&
          bombBounds.y + bombBounds.height > brickBounds.y
        ) {
          // Trigger explosion
          bomb.explode();

          // Skip damage for indestructible bricks
          if (brick.isIndestructible()) {
            break;
          }

          // Get explosion center
          const bombPos = bomb.getPosition();
          const explosionRadius = bomb.getExplosionRadius();

          // Damage all bricks within explosion radius
          for (const targetBrick of bricks) {
            if (targetBrick.isIndestructible()) continue;

            const targetBounds = targetBrick.getBounds();
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
              const bombDamage = bomb.getDamage();
              const destructionInfo = targetBrick.takeDamage(bombDamage);

              // Calculate closest point on brick to explosion center
              const closestX = Math.max(targetBounds.x, Math.min(bombPos.x, targetBounds.x + targetBounds.width));
              const closestY = Math.max(targetBounds.y, Math.min(bombPos.y, targetBounds.y + targetBounds.height));

              // Notify hit (show damage numbers)
              this.eventManager.emit(GameEvents.BRICK_HIT, {
                brick: targetBrick,
                damage: bombDamage,
                isCritical: false,
                x: closestX,
                y: closestY
              });

              // Track destroyed bricks
              if (destructionInfo.justDestroyed) {
                this.eventManager.emit(GameEvents.BRICK_DESTROYED, {
                  brick: targetBrick,
                  x: destructionInfo.centerX,
                  y: destructionInfo.centerY,
                  isCritical: false
                });
              }
            }
          }

          break;
        }
      }
    }
  }

  /**
   * Check falling brick-bat collisions
   */
  checkFallingBrickBatCollisions(
    fallingBricks: FallingBrick[],
    bat: Bat
  ): void {
    const batBounds = bat.getBounds();

    for (const fallingBrick of fallingBricks) {
      if (!fallingBrick.isActive()) continue;

      const brickBounds = fallingBrick.getBounds();
      if (!brickBounds) continue;

      // Simple AABB collision
      if (
        brickBounds.x < batBounds.x + batBounds.width &&
        brickBounds.x + brickBounds.width > batBounds.x &&
        brickBounds.y < batBounds.y + batBounds.height &&
        brickBounds.y + brickBounds.height > batBounds.y
      ) {
        // Damage bat
        bat.takeDamage(FALLING_BRICK_DAMAGE_PERCENT);

        // Notify bat damaged
        this.eventManager.emit('bat_damaged', { damagePercent: FALLING_BRICK_DAMAGE_PERCENT });

        // Deactivate falling brick
        fallingBrick.deactivate();
      }
    }
  }

  /**
   * Check debris-bat collisions
   */
  checkDebrisBatCollisions(
    debris: Debris[],
    bat: Bat
  ): void {
    const batBounds = bat.getBounds();

    for (const debrisParticle of debris) {
      if (!debrisParticle.isActive()) continue;

      const debrisBounds = debrisParticle.getBounds();
      if (!debrisBounds) continue;

      // Simple AABB collision
      if (
        debrisBounds.x < batBounds.x + batBounds.width &&
        debrisBounds.x + debrisBounds.width > batBounds.x &&
        debrisBounds.y < batBounds.y + batBounds.height &&
        debrisBounds.y + debrisBounds.height > batBounds.y
      ) {
        // Damage bat
        bat.takeDamage(EXPLODING_BRICK_DEBRIS_DAMAGE_PERCENT);

        // Notify bat damaged
        this.eventManager.emit('bat_damaged', { damagePercent: EXPLODING_BRICK_DEBRIS_DAMAGE_PERCENT });

        // Deactivate debris
        debrisParticle.deactivate();
      }
    }
  }

  /**
   * Check brick laser-bat collisions
   */
  checkBrickLaserBatCollisions(
    brickLasers: BrickLaser[],
    bat: Bat
  ): void {
    const batBounds = bat.getBounds();

    for (const laser of brickLasers) {
      if (!laser.isActive() || laser.isCharging()) continue;

      const laserBounds = laser.getBounds();
      if (!laserBounds) continue; // Null when charging

      // Simple AABB collision
      if (
        laserBounds.x < batBounds.x + batBounds.width &&
        laserBounds.x + laserBounds.width > batBounds.x &&
        laserBounds.y < batBounds.y + batBounds.height &&
        laserBounds.y + laserBounds.height > batBounds.y
      ) {
        // Damage bat
        bat.takeDamage(LASER_BRICK_LASER_DAMAGE_PERCENT);

        // Notify bat damaged
        this.eventManager.emit('bat_damaged', { damagePercent: LASER_BRICK_LASER_DAMAGE_PERCENT });

        // Deactivate laser
        laser.deactivate();
      }
    }
  }

  /**
   * Check homing missile-bat collisions
   */
  checkHomingMissileBatCollisions(
    homingMissiles: HomingMissile[],
    bat: Bat
  ): void {
    const batBounds = bat.getBounds();

    for (const missile of homingMissiles) {
      if (!missile.isActive()) continue;

      const missileBounds = missile.getBounds();
      if (!missileBounds) continue;

      // Simple AABB collision
      if (
        missileBounds.x < batBounds.x + batBounds.width &&
        missileBounds.x + missileBounds.width > batBounds.x &&
        missileBounds.y < batBounds.y + batBounds.height &&
        missileBounds.y + missileBounds.height > batBounds.y
      ) {
        // Damage bat
        bat.takeDamage(HOMING_MISSILE_DAMAGE_PERCENT);

        // Notify bat damaged
        this.eventManager.emit('bat_damaged', { damagePercent: HOMING_MISSILE_DAMAGE_PERCENT });

        // Deactivate missile
        missile.deactivate();
      }
    }
  }

  /**
   * Check splitting fragment-bat collisions
   */
  checkSplittingFragmentBatCollisions(
    splittingFragments: SplittingFragment[],
    bat: Bat
  ): void {
    const batBounds = bat.getBounds();

    for (const fragment of splittingFragments) {
      if (!fragment.isActive()) continue;

      const fragmentBounds = fragment.getBounds();
      if (!fragmentBounds) continue;

      // Simple AABB collision
      if (
        fragmentBounds.x < batBounds.x + batBounds.width &&
        fragmentBounds.x + fragmentBounds.width > batBounds.x &&
        fragmentBounds.y < batBounds.y + batBounds.height &&
        fragmentBounds.y + fragmentBounds.height > batBounds.y
      ) {
        // Damage bat
        bat.takeDamage(SPLITTING_FRAGMENT_DAMAGE_PERCENT);

        // Notify bat damaged
        this.eventManager.emit('bat_damaged', { damagePercent: SPLITTING_FRAGMENT_DAMAGE_PERCENT });

        // Deactivate fragment
        fragment.deactivate();
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

      // Check collision with bat before explosion
      const dynamiteBounds = dynamite.getBounds();
      if (!dynamiteBounds) continue;

      // Simple AABB collision
      if (
        dynamiteBounds.x < batBounds.x + batBounds.width &&
        dynamiteBounds.x + dynamiteBounds.width > batBounds.x &&
        dynamiteBounds.y < batBounds.y + batBounds.height &&
        dynamiteBounds.y + dynamiteBounds.height > batBounds.y
      ) {
        // Damage bat
        bat.takeDamage(DYNAMITE_BAT_DAMAGE_PERCENT);

        // Notify bat damaged
        this.eventManager.emit('bat_damaged', { damagePercent: DYNAMITE_BAT_DAMAGE_PERCENT });

        // Deactivate dynamite (no explosion on direct hit)
        dynamite.deactivate();
      }
    }
  }

  /**
   * Apply explosion damage to nearby bricks
   */
  private applyExplosionDamage(
    hitBrick: Brick,
    hitBrickBounds: { x: number; y: number; width: number; height: number },
    allBricks: Brick[],
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
    const ballBounds = ball.getBounds();
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
