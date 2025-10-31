/**
 * GameUpgrades - Manages upgrade state and application
 * Handles all upgrade logic separately from the main Game class
 */

import { UpgradeType } from '../core/types';
import { BALL_BASE_DAMAGE } from '../../config/constants';

export class GameUpgrades {
  private upgradeLevels: Map<string, number> = new Map();
  
  // Base values for upgrade calculations
  private baseBatWidth: number = 0;
  private baseBatHeight: number = 0;
  private baseBallSpeed: number = 0;
  private baseBallRadius: number = 0;

  /**
   * Set base values for upgrade calculations
   */
  setBaseValues(batWidth: number, batHeight: number, ballSpeed: number, ballRadius: number): void {
    this.baseBatWidth = batWidth;
    this.baseBatHeight = batHeight;
    this.baseBallSpeed = ballSpeed;
    this.baseBallRadius = ballRadius;
  }

  /**
   * Update upgrade levels from the upgrade tree
   */
  setUpgradeLevels(upgrades: Map<string, number>): void {
    this.upgradeLevels = upgrades;
  }

  /**
   * Get current upgrade level for a specific upgrade type
   */
  getUpgradeLevel(type: UpgradeType): number {
    return this.upgradeLevels.get(type) || 0;
  }

  /**
   * Apply bat width upgrade
   * Returns the new bat width
   */
  applyBatWidthUpgrade(): number {
    const level = this.getUpgradeLevel(UpgradeType.BAT_WIDTH_INCREASE_10_PERCENT);
    if (level === 0) return this.baseBatWidth;
    
    const multiplier = 1 + (level * 0.1); // 10% per level
    const newWidth = this.baseBatWidth * multiplier;
    
    console.log(`Applied bat width upgrade: Level ${level} (${newWidth.toFixed(1)}px, ${(multiplier * 100).toFixed(0)}%)`);
    return newWidth;
  }

  /**
   * Apply all upgrades to the bat
   * Returns updated bat dimensions
   */
  applyBatUpgrades(): { width: number; height: number } {
    return {
      width: this.applyBatWidthUpgrade(),
      height: this.baseBatHeight, // No height upgrades yet
    };
  }

  /**
   * Apply all upgrades to the ball
   * Returns updated ball properties
   */
  applyBallUpgrades(): { speed: number; radius: number; damage: number } {
    // Ball damage upgrade
    const damageLevel = this.getUpgradeLevel(UpgradeType.BALL_DAMAGE_INCREASE_INCREMENT_1);
    const damage = BALL_BASE_DAMAGE + damageLevel;
    
    return {
      speed: this.baseBallSpeed, // No speed upgrades yet
      radius: this.baseBallRadius, // No radius upgrades yet
      damage,
    };
  }

  /**
   * Check if bat shooter is unlocked
   */
  hasBatShooter(): boolean {
    return this.getUpgradeLevel(UpgradeType.BAT_ADD_SHOOTER) > 0;
  }

  /**
   * Check if sticky bat is unlocked
   */
  hasStickyBat(): boolean {
    return this.getUpgradeLevel(UpgradeType.BAT_ADD_STICKY) > 0;
  }

  /**
   * Check if bombs are unlocked
   */
  hasBombs(): boolean {
    return this.getUpgradeLevel(UpgradeType.BAT_ADD_BOMBS) > 0;
  }

  /**
   * Check if ball piercing is unlocked
   */
  hasBallPiercing(): boolean {
    return this.getUpgradeLevel(UpgradeType.BALL_ADD_PIERCING) > 0;
  }

  /**
   * Get ball piercing chance (0 to 1)
   */
  getBallPiercingChance(): number {
    if (!this.hasBallPiercing()) return 0;
    
    const piercingLevel = this.getUpgradeLevel(UpgradeType.BALL_CHANCE_PIERCING_10_PERCENT);
    const baseChance = 0.1; // 10% base chance
    const bonusChance = piercingLevel * 0.1; // +10% per level
    
    return Math.min(baseChance + bonusChance, 1.0); // Cap at 100%
  }

  /**
   * Check if piercing duration upgrade is unlocked
   */
  hasPiercingDuration(): boolean {
    return this.getUpgradeLevel(UpgradeType.BALL_PIERCING_DURATION) > 0;
  }

  /**
   * Get piercing duration in seconds
   */
  getPiercingDuration(): number {
    const level = this.getUpgradeLevel(UpgradeType.BALL_PIERCING_DURATION);
    return level; // 1 second per level (0, 1, 2, or 3 seconds)
  }

  /**
   * Get bat shooter damage multiplier
   */
  getBatShooterDamage(): number {
    if (!this.hasBatShooter()) return 0;
    
    const shooterLevel = this.getUpgradeLevel(UpgradeType.BAT_SHOOTER_INCREASE_10_PERCENT);
    return 1 + (shooterLevel * 0.1); // Base 1, +10% per level
  }

  /**
   * Get number of additional shooter turrets
   * Base shooter has 1 turret, each upgrade adds 1 more
   */
  getAdditionalShooterCount(): number {
    const level = this.getUpgradeLevel(UpgradeType.BAT_ADDITIONAL_SHOOTER);
    return level; // +1 turret per level (0, 1, or 2 additional turrets)
  }

  /**
   * Get total number of shooter turrets (base + additional)
   */
  getTotalShooterCount(): number {
    if (!this.hasBatShooter()) return 0;
    return 1 + this.getAdditionalShooterCount(); // Base 1 + additional
  }

  /**
   * Get health bonus from upgrades
   */
  getHealthBonus(): number {
    const healthLevel = this.getUpgradeLevel(UpgradeType.HEALTH_INCREASE_1);
    return healthLevel; // +1 health per level
  }

  /**
   * Check if ball explosions are unlocked
   */
  hasBallExplosions(): boolean {
    return this.getUpgradeLevel(UpgradeType.BALL_EXPLOSIONS) > 0;
  }

  /**
   * Get ball explosion damage multiplier
   * Base explosion damage is 10% of ball damage
   * Each upgrade level increases this by 10%
   */
  getBallExplosionDamageMultiplier(): number {
    if (!this.hasBallExplosions()) return 0;
    
    const explosionLevel = this.getUpgradeLevel(UpgradeType.BALL_EXPLOSIONS_INCREASE_10_PERCENT);
    const baseMultiplier = 0.1; // 10% base explosion damage
    const bonusMultiplier = explosionLevel * 0.1; // +10% per level
    
    return baseMultiplier + bonusMultiplier;
  }

  /**
   * Get ball explosion radius multiplier
   * Base multiplier is 1.0 (100%)
   * Each upgrade level increases this by 20%
   */
  getBallExplosionRadiusMultiplier(): number {
    if (!this.hasBallExplosions()) return 1.0;
    
    const radiusLevel = this.getUpgradeLevel(UpgradeType.BALL_EXPLOSION_RADIUS_INCREASE_20_PERCENT);
    return 1.0 + (radiusLevel * 0.2); // +20% per level
  }

  /**
   * Check if critical hits are unlocked
   */
  hasCriticalHits(): boolean {
    return this.getUpgradeLevel(UpgradeType.BALL_ADD_CRITICAL_HITS) > 0;
  }

  /**
   * Get critical hit chance (0 to 1)
   * Base chance is 10%, increases by 10% per upgrade level
   */
  getCriticalHitChance(): number {
    if (!this.hasCriticalHits()) return 0;
    
    const bonusLevel = this.getUpgradeLevel(UpgradeType.BALL_CHANCE_CRITICAL_HITS_10_PERCENT);
    const baseChance = 0.1; // 10% base chance
    const bonusChance = bonusLevel * 0.1; // +10% per level
    
    return Math.min(baseChance + bonusChance, 1.0); // Cap at 100%
  }

  /**
   * Get critical hit damage multiplier
   * Base multiplier is 2.0x (double damage), increases by 10% per upgrade level
   * Also increases crit chance by 10% per level
   */
  getCriticalHitDamageMultiplier(): number {
    if (!this.hasCriticalHits()) return 2.0;
    
    const damageLevel = this.getUpgradeLevel(UpgradeType.BALL_CRITICAL_DAMAGE_INCREASE_10_PERCENT);
    const baseDamage = 2.0; // 2x damage base
    const bonusDamage = damageLevel * 0.1; // +10% per level
    
    return baseDamage + bonusDamage;
  }

  /**
   * Get total critical hit chance including damage upgrade bonus
   * Critical Damage upgrade also increases crit chance by 10% per level
   */
  getTotalCriticalHitChance(): number {
    if (!this.hasCriticalHits()) return 0;
    
    const baseChance = this.getCriticalHitChance();
    const damageLevel = this.getUpgradeLevel(UpgradeType.BALL_CRITICAL_DAMAGE_INCREASE_10_PERCENT);
    const bonusChance = damageLevel * 0.1; // +10% chance per level
    
    return Math.min(baseChance + bonusChance, 1.0); // Cap at 100%
  }

  /**
   * Get all active upgrades as a readable summary
   */
  getSummary(): string[] {
    const summary: string[] = [];
    
    this.upgradeLevels.forEach((level, type) => {
      if (level > 0) {
        summary.push(`${type}: Level ${level}`);
      }
    });
    
    return summary;
  }

  /**
   * Reset all upgrades (for new game)
   */
  reset(): void {
    this.upgradeLevels.clear();
  }
}
