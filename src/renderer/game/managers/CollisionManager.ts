/**
 * CollisionManager - Handles all collision detection and resolution
 */

import { Ball } from '../entities/Ball';
import { Bat } from '../entities/Bat';
import { Brick } from '../entities/Brick';
import { Laser } from '../weapons/Laser';
import { Level } from '../entities/Level';
import { GameUpgrades } from '../systems/GameUpgrades';
import { FallingBrick } from '../entities/offensive/FallingBrick';
import { Debris } from '../entities/offensive/Debris';
import { BrickLaser } from '../entities/offensive/BrickLaser';
import { HomingMissile } from '../entities/offensive/HomingMissile';
import { SplittingFragment } from '../entities/offensive/SplittingFragment';
import { checkCircleRectCollision } from '../core/utils';
import {
  BRICK_WIDTH,
  EXPLOSION_RADIUS_MULTIPLIER,
  CRITICAL_HIT_DAMAGE_MULTIPLIER,
  FALLING_BRICK_DAMAGE_PERCENT,
  EXPLODING_BRICK_DEBRIS_DAMAGE_PERCENT,
  LASER_BRICK_LASER_DAMAGE_PERCENT,
  HOMING_MISSILE_DAMAGE_PERCENT,
  SPLITTING_FRAGMENT_DAMAGE_PERCENT,
} from '../../config/constants';

export interface CollisionCallbacks {
  onBrickHit?: (brick: Brick, damage: number, isCritical: boolean) => void;
  onBrickDestroyed?: (brick: Brick, x: number, y: number, isCritical: boolean) => void;
  onExplosionDamage?: (brick: Brick, damage: number, x: number, y: number) => void;
  onBatDamaged?: (damagePercent: number) => void;
}

export class CollisionManager {
  private callbacks: CollisionCallbacks = {};
  private piercingTimeRemaining: number = 0;

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
   * Set collision callbacks
   */
  setCallbacks(callbacks: CollisionCallbacks): void {
    this.callbacks = { ...this.callbacks, ...callbacks };
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
        let pierced = false;
        if (!isIndestructible) {
          if (this.piercingTimeRemaining > 0) {
            // Piercing is active from duration
            pierced = true;
          } else if (piercingChance > 0 && Math.random() < piercingChance) {
            // Piercing activated by chance
            pierced = true;
            // If duration upgrade is active, start the timer
            if (piercingDuration > 0) {
              this.piercingTimeRemaining = piercingDuration;
            }
          }
        }
        
        // Bounce ball (unless piercing and brick is destructible)
        if ((!pierced || isIndestructible) && collision.normal) {
          ball.bounce(collision.normal);
        }
        
        // Skip damage, explosions, and notifications for indestructible bricks
        if (!isIndestructible) {
          // Calculate damage (with critical hit check)
          let damage = ball.getDamage();
          let isCritical = false;
          
          if (gameUpgrades.hasCriticalHits()) {
            const critChance = gameUpgrades.getCriticalHitChance();
            if (Math.random() < critChance) {
              damage *= CRITICAL_HIT_DAMAGE_MULTIPLIER;
              isCritical = true;
            }
          }
          
          // Damage brick
          brick.takeDamage(damage);
          
          // Notify hit (show damage numbers)
          if (this.callbacks.onBrickHit) {
            this.callbacks.onBrickHit(brick, damage, isCritical);
          }
          
          // Apply explosion damage to nearby bricks if upgrade is active
          if (gameUpgrades.hasBallExplosions()) {
            this.applyExplosionDamage(brick, brickBounds, bricks, ball.getDamage(), gameUpgrades);
          }
          
          // Track destroyed bricks and create particles
          if (!wasDestroyed && brick.isDestroyed()) {
            const brickPos = brick.getPosition();
            const centerX = brickPos.x + brickBounds.width / 2;
            const centerY = brickPos.y + brickBounds.height / 2;
            
            if (this.callbacks.onBrickDestroyed) {
              this.callbacks.onBrickDestroyed(brick, centerX, centerY, isCritical);
            }
          }
        }
        
        // Restore ball to normal if it was grey
        if (ball.getIsGrey()) {
          ball.restoreToNormal();
        }
        
        // If not piercing, stop checking more bricks
        if (!pierced) {
          break;
        }
        // If piercing, continue to next brick (even after hitting indestructible)
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
            // Damage brick
            const wasDestroyed = brick.isDestroyed();
            const laserDamage = laser.getDamage();
            brick.takeDamage(laserDamage);

            // Notify hit (show damage numbers)
            if (this.callbacks.onBrickHit) {
              this.callbacks.onBrickHit(brick, laserDamage, false);
            }

            // Track destroyed bricks
            if (!wasDestroyed && brick.isDestroyed()) {
              const brickPos = brick.getPosition();
              const centerX = brickPos.x + brickBounds.width / 2;
              const centerY = brickPos.y + brickBounds.height / 2;
              
              if (this.callbacks.onBrickDestroyed) {
                this.callbacks.onBrickDestroyed(brick, centerX, centerY, false);
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
        if (this.callbacks.onBatDamaged) {
          this.callbacks.onBatDamaged(FALLING_BRICK_DAMAGE_PERCENT);
        }

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
        if (this.callbacks.onBatDamaged) {
          this.callbacks.onBatDamaged(EXPLODING_BRICK_DEBRIS_DAMAGE_PERCENT);
        }

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
        if (this.callbacks.onBatDamaged) {
          this.callbacks.onBatDamaged(LASER_BRICK_LASER_DAMAGE_PERCENT);
        }

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
        if (this.callbacks.onBatDamaged) {
          this.callbacks.onBatDamaged(HOMING_MISSILE_DAMAGE_PERCENT);
        }

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
        if (this.callbacks.onBatDamaged) {
          this.callbacks.onBatDamaged(SPLITTING_FRAGMENT_DAMAGE_PERCENT);
        }

        // Deactivate fragment
        fragment.deactivate();
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
    const explosionRadius = BRICK_WIDTH * EXPLOSION_RADIUS_MULTIPLIER;
    
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
        const wasOtherDestroyed = otherBrick.isDestroyed();
        otherBrick.takeDamage(explosionDamage);
        
        // Notify explosion damage
        if (this.callbacks.onExplosionDamage) {
          this.callbacks.onExplosionDamage(otherBrick, explosionDamage, otherCenterX, otherCenterY);
        }
        
        // Track if explosion destroyed this brick
        if (!wasOtherDestroyed && otherBrick.isDestroyed()) {
          if (this.callbacks.onBrickDestroyed) {
            this.callbacks.onBrickDestroyed(otherBrick, otherCenterX, otherCenterY, false);
          }
        }
      }
    }
  }
}
