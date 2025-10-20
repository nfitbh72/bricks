/**
 * WeaponManager - Manages all weapon systems (lasers, projectiles, etc.)
 */

import { Laser } from '../weapons/Laser';
import { Bat } from '../entities/Bat';
import { Ball } from '../entities/Ball';
import { GameUpgrades } from '../systems/GameUpgrades';
import { LASER_SPEED_MULTIPLIER, LASER_DAMAGE_MULTIPLIER } from '../../config/constants';

export class WeaponManager {
  private lasers: Laser[] = [];

  /**
   * Shoot a laser from the bat (if shooter upgrade is unlocked)
   */
  shootLaser(bat: Bat, ball: Ball, gameUpgrades: GameUpgrades): void {
    // Check if shooter upgrade is unlocked
    if (!gameUpgrades.hasBatShooter()) {
      return;
    }

    // Get bat center position
    const batPos = bat.getPosition();
    const batWidth = bat.getWidth();
    const centerX = batPos.x + batWidth / 2;
    const centerY = batPos.y;

    // Calculate laser properties
    const ballSpeed = ball.getSpeed();
    const laserSpeed = ballSpeed * LASER_SPEED_MULTIPLIER;
    const ballDamage = ball.getDamage();
    const laserDamage = ballDamage * LASER_DAMAGE_MULTIPLIER;

    // Create and add laser
    const laser = new Laser(centerX, centerY, laserSpeed, laserDamage);
    this.lasers.push(laser);
  }

  /**
   * Update all lasers
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

    // Remove inactive lasers
    this.lasers = this.lasers.filter(laser => laser.isActive());
  }

  /**
   * Render all lasers
   */
  render(ctx: CanvasRenderingContext2D): void {
    ctx.save();
    for (const laser of this.lasers) {
      if (laser.isActive()) {
        laser.render(ctx);
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
   * Clear all lasers (e.g., when loading a new level)
   */
  clear(): void {
    this.lasers = [];
  }

  /**
   * Get count of active lasers
   */
  getActiveCount(): number {
    return this.lasers.filter(laser => laser.isActive()).length;
  }
}
