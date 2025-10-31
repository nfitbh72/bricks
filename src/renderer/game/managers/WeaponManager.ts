/**
 * WeaponManager - Manages all weapon systems (lasers, bombs, projectiles, etc.)
 */

import { Laser } from '../weapons/Laser';
import { Bomb } from '../weapons/Bomb';
import { Bat } from '../entities/Bat';
import { Ball } from '../entities/Ball';
import { GameUpgrades } from '../systems/GameUpgrades';
import { 
  LASER_SPEED_MULTIPLIER, 
  LASER_DAMAGE_MULTIPLIER,
  BOMB_SPEED_MULTIPLIER,
  BOMB_DAMAGE_MULTIPLIER,
  BOMB_EXPLOSION_RADIUS
} from '../../config/constants';

export class WeaponManager {
  private lasers: Laser[] = [];
  private bombs: Bomb[] = [];
  private lastBombTime: number = 0;
  private bombCooldown: number = 1000; // 1 second cooldown in milliseconds

  /**
   * Shoot lasers from all bat turrets (if shooter upgrade is unlocked)
   */
  shootLaser(bat: Bat, ball: Ball, gameUpgrades: GameUpgrades): void {
    // Check if shooter upgrade is unlocked
    if (!gameUpgrades.hasBatShooter()) {
      return;
    }

    // Get turret positions from bat
    const turretPositions = bat.getTurretPositions();
    const batPos = bat.getPosition();
    const centerY = batPos.y;

    // Calculate laser properties
    const ballSpeed = ball.getSpeed();
    const laserSpeed = ballSpeed * LASER_SPEED_MULTIPLIER;
    const ballDamage = ball.getDamage();
    const laserDamage = ballDamage * LASER_DAMAGE_MULTIPLIER;

    // Create a laser from each turret position
    for (const turretX of turretPositions) {
      const laser = new Laser(turretX, centerY, laserSpeed, laserDamage);
      this.lasers.push(laser);
    }
  }

  /**
   * Shoot bomb from bat center (if bombs upgrade is unlocked)
   */
  shootBomb(bat: Bat, ball: Ball, gameUpgrades: GameUpgrades): void {
    // Check if bombs upgrade is unlocked
    if (!gameUpgrades.hasBombs()) {
      return;
    }

    // Check cooldown - only allow one bomb per second
    const currentTime = Date.now();
    if (currentTime - this.lastBombTime < this.bombCooldown) {
      return; // Still on cooldown
    }

    // Get bat center position
    const batPos = bat.getPosition();
    const centerX = bat.getCenterX();
    const centerY = batPos.y;

    // Calculate bomb properties
    const ballSpeed = ball.getSpeed();
    const bombSpeed = ballSpeed * BOMB_SPEED_MULTIPLIER;
    const ballDamage = ball.getDamage();
    const bombDamage = ballDamage * BOMB_DAMAGE_MULTIPLIER;

    // Create bomb
    const bomb = new Bomb(centerX, centerY, bombSpeed, bombDamage, BOMB_EXPLOSION_RADIUS);
    this.bombs.push(bomb);

    // Update last bomb time
    this.lastBombTime = currentTime;
  }

  /**
   * Update all lasers and bombs
   */
  update(deltaTime: number): void {
    // Update laser positions
    for (const laser of this.lasers) {
      if (laser.isActive()) {
        laser.update(deltaTime);

        // Deactivate if off-screen
        if (laser.isOffScreen(0)) {
          laser.deactivate();
        }
      }
    }

    // Update bomb positions
    for (const bomb of this.bombs) {
      if (bomb.isActive() && !bomb.hasExploded()) {
        bomb.update(deltaTime);

        // Deactivate if off-screen
        if (bomb.isOffScreen(0)) {
          bomb.deactivate();
        }
      }
    }

    // Remove inactive lasers and bombs
    this.lasers = this.lasers.filter(laser => laser.isActive());
    this.bombs = this.bombs.filter(bomb => bomb.isActive());
  }

  /**
   * Render all lasers and bombs
   */
  render(ctx: CanvasRenderingContext2D): void {
    ctx.save();
    for (const laser of this.lasers) {
      if (laser.isActive()) {
        laser.render(ctx);
      }
    }
    for (const bomb of this.bombs) {
      if (bomb.isActive()) {
        bomb.render(ctx);
      }
    }
    ctx.restore();
  }

  /**
   * Get all active lasers (for collision detection)
   */
  getLasers(): Laser[] {
    return this.lasers;
  }

  /**
   * Get all active bombs (for collision detection)
   */
  getBombs(): Bomb[] {
    return this.bombs;
  }

  /**
   * Clear all lasers and bombs (e.g., when loading a new level)
   */
  clear(): void {
    this.lasers = [];
    this.bombs = [];
  }

  /**
   * Get count of active lasers
   */
  getActiveCount(): number {
    return this.lasers.filter(laser => laser.isActive()).length;
  }

  /**
   * Get count of active bombs
   */
  getActiveBombCount(): number {
    return this.bombs.filter(bomb => bomb.isActive()).length;
  }
}
