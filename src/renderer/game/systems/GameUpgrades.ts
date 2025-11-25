/**
 * GameUpgrades - Manages upgrade state and application
 * Handles all upgrade logic separately from the main Game class
 */

import { UpgradeType } from '../core/types';
import { 
  BALL_BASE_DAMAGE, 
  BRICK_WIDTH, 
  EXPLOSION_RADIUS_MULTIPLIER,
  LASER_DAMAGE_MULTIPLIER
} from '../../config/constants';

/**
 * Display stat for the UI
 */
export interface DisplayStat {
  label: string;
  value: string;
  active: boolean;
}

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
    const superStatsLevel = this.getUpgradeLevel(UpgradeType.BALL_SUPER_STATS);
    const damage = BALL_BASE_DAMAGE + damageLevel + superStatsLevel; // +1 per Super Stats level
    
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
   * BALL_SUPER_STATS adds 10% per level
   */
  getBallPiercingChance(): number {
    if (!this.hasBallPiercing()) return 0;
    
    const piercingLevel = this.getUpgradeLevel(UpgradeType.BALL_CHANCE_PIERCING_10_PERCENT);
    const superStatsLevel = this.getUpgradeLevel(UpgradeType.BALL_SUPER_STATS);
    const baseChance = 0.1; // 10% base chance
    const bonusChance = piercingLevel * 0.1; // +10% per level
    const superStatsBonus = superStatsLevel * 0.1; // +10% per level
    
    return Math.min(baseChance + bonusChance + superStatsBonus, 1.0); // Cap at 100%
  }

  /**
   * Check if piercing duration upgrade is unlocked
   */
  hasPiercingDuration(): boolean {
    return this.getUpgradeLevel(UpgradeType.BALL_PIERCING_DURATION) > 0;
  }

  /**
   * Get piercing duration in seconds
   * BALL_SUPER_STATS adds 1 second per level
   */
  getPiercingDuration(): number {
    const level = this.getUpgradeLevel(UpgradeType.BALL_PIERCING_DURATION);
    const superStatsLevel = this.getUpgradeLevel(UpgradeType.BALL_SUPER_STATS);
    return level + superStatsLevel; // 1 second per level + super stats bonus
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
   * BALL_SUPER_STATS adds 10% per level
   */
  getBallExplosionDamageMultiplier(): number {
    if (!this.hasBallExplosions()) return 0;
    
    const explosionLevel = this.getUpgradeLevel(UpgradeType.BALL_EXPLOSIONS_INCREASE_10_PERCENT);
    const superStatsLevel = this.getUpgradeLevel(UpgradeType.BALL_SUPER_STATS);
    const baseMultiplier = 0.1; // 10% base explosion damage
    const bonusMultiplier = explosionLevel * 0.1; // +10% per level
    const superStatsBonus = superStatsLevel * 0.1; // +10% per level
    
    return baseMultiplier + bonusMultiplier + superStatsBonus;
  }

  /**
   * Get ball explosion radius multiplier
   * Base multiplier is 1.0 (100%)
   * Each upgrade level increases this by 20%
   * BALL_SUPER_STATS adds 10% per level
   */
  getBallExplosionRadiusMultiplier(): number {
    if (!this.hasBallExplosions()) return 1.0;
    
    const radiusLevel = this.getUpgradeLevel(UpgradeType.BALL_EXPLOSION_RADIUS_INCREASE_20_PERCENT);
    const superStatsLevel = this.getUpgradeLevel(UpgradeType.BALL_SUPER_STATS);
    const radiusBonus = radiusLevel * 0.2; // +20% per level
    const superStatsBonus = superStatsLevel * 0.1; // +10% per level
    
    return 1.0 + radiusBonus + superStatsBonus;
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
   * Base multiplier is 2.0x (double damage)
   * BALL_SUPER_STATS increases by 10% per level
   */
  getCriticalHitDamageMultiplier(): number {
    if (!this.hasCriticalHits()) return 2.0;
    
    const superStatsLevel = this.getUpgradeLevel(UpgradeType.BALL_SUPER_STATS);
    const baseDamage = 2.0; // 2x damage base
    const bonusDamage = superStatsLevel * 0.1; // +10% per level
    
    return baseDamage + bonusDamage;
  }

  /**
   * Get total critical hit chance including super stats bonus
   * BALL_SUPER_STATS increases crit chance by 10% per level
   */
  getTotalCriticalHitChance(): number {
    if (!this.hasCriticalHits()) return 0;
    
    const baseChance = this.getCriticalHitChance();
    const superStatsLevel = this.getUpgradeLevel(UpgradeType.BALL_SUPER_STATS);
    const bonusChance = superStatsLevel * 0.1; // +10% chance per level
    
    return Math.min(baseChance + bonusChance, 1.0); // Cap at 100%
  }

  /**
   * Check if multi-ball is unlocked
   */
  hasMultiBall(): boolean {
    return this.getUpgradeLevel(UpgradeType.BALL_ADD_MULTIBALL) > 0;
  }

  /**
   * Get multi-ball trigger chance (0 to 1)
   * Base chance is 10%, increases by 10% per level
   * Level 1 = 10%, Level 10 = 100%
   */
  getMultiBallChance(): number {
    const level = this.getUpgradeLevel(UpgradeType.BALL_ADD_MULTIBALL);
    if (level === 0) return 0;
    
    const chance = level * 0.1; // 10% per level
    return Math.min(chance, 1.0); // Cap at 100%
  }

  /**
   * Get number of balls to spawn when multi-ball triggers
   * Starts at 2 balls, increases by 1 per level
   * Level 1 = 2 balls, Level 10 = 11 balls
   */
  getMultiBallCount(): number {
    const level = this.getUpgradeLevel(UpgradeType.BALL_ADD_MULTIBALL);
    if (level === 0) return 0;
    
    return 2 + (level - 1); // Level 1 = 2, Level 2 = 3, ..., Level 10 = 11
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
   * Get all stats formatted for display in the UI
   * Returns an array of stats with labels, values, and active state
   */
  getDisplayStats(): DisplayStat[] {
    const stats: DisplayStat[] = [];
    
    // Ball Damage - starts at 1, increments by 1 per level, +1 per Super Stats level
    const damageLevel = this.getUpgradeLevel(UpgradeType.BALL_DAMAGE_INCREASE_INCREMENT_1);
    const superStatsLevel = this.getUpgradeLevel(UpgradeType.BALL_SUPER_STATS);
    const ballDamage = BALL_BASE_DAMAGE + damageLevel + superStatsLevel;
    stats.push({ 
      label: 'Ball Damage', 
      value: `${ballDamage}`, 
      active: damageLevel > 0 || superStatsLevel > 0
    });
    
    // Bat Width - show in pixels
    const batWidthLevel = this.getUpgradeLevel(UpgradeType.BAT_WIDTH_INCREASE_10_PERCENT);
    const batWidth = this.baseBatWidth * (1 + batWidthLevel * 0.1);
    stats.push({ 
      label: 'Bat Width', 
      value: `${Math.round(batWidth)}px`, 
      active: batWidthLevel > 0 
    });
    
    // Critical Hits
    const hasCrits = this.hasCriticalHits();
    const critChance = hasCrits ? (this.getTotalCriticalHitChance() * 100).toFixed(0) : '0';
    const critDamage = hasCrits ? (this.getCriticalHitDamageMultiplier() * 100).toFixed(0) : '0';
    stats.push({ label: 'Crit Chance', value: `${critChance}%`, active: hasCrits });
    stats.push({ label: 'Crit Damage', value: `${critDamage}%`, active: hasCrits });
    
    // Piercing
    const hasPiercing = this.hasBallPiercing();
    const piercingChance = hasPiercing ? (this.getBallPiercingChance() * 100).toFixed(0) : '0';
    const piercingDuration = hasPiercing ? this.getPiercingDuration() : 0;
    stats.push({ label: 'Piercing Chance', value: `${piercingChance}%`, active: hasPiercing });
    stats.push({ label: 'Piercing Duration', value: `${piercingDuration}s`, active: hasPiercing && piercingDuration > 0 });
    
    // Explosions
    const hasExplosions = this.hasBallExplosions();
    const explosionDamage = hasExplosions ? (this.getBallExplosionDamageMultiplier() * 100).toFixed(0) : '0';
    const explosionRadiusMultiplier = hasExplosions ? this.getBallExplosionRadiusMultiplier() : 1.0;
    const explosionRadius = Math.round(BRICK_WIDTH * EXPLOSION_RADIUS_MULTIPLIER * explosionRadiusMultiplier);
    stats.push({ label: 'Explosion Damage', value: `${explosionDamage}%`, active: hasExplosions });
    stats.push({ label: 'Explosion Radius', value: `${explosionRadius}px`, active: hasExplosions });
    
    // Bat Shooter - show actual damage values
    const hasShooter = this.hasBatShooter();
    const shooterDamageMultiplier = hasShooter ? this.getBatShooterDamage() : 0;
    const laserDamage = hasShooter ? Math.round(ballDamage * LASER_DAMAGE_MULTIPLIER * shooterDamageMultiplier * 10) / 10 : 0;
    const shooterCount = hasShooter ? this.getTotalShooterCount() : 0;
    stats.push({ label: 'Laser Damage', value: `${laserDamage}`, active: hasShooter });
    stats.push({ label: 'Laser Count', value: `${shooterCount}`, active: hasShooter });
    
    // Sticky Bat - show tick when enabled
    const hasSticky = this.hasStickyBat();
    stats.push({ label: 'Sticky Bat', value: hasSticky ? '✓' : '—', active: hasSticky });
    
    // Bombs - show tick when enabled
    const hasBombs = this.hasBombs();
    stats.push({ label: 'Bombs', value: hasBombs ? '✓' : '—', active: hasBombs });
    
    // Multi Ball - show chance and count
    const hasMultiBall = this.hasMultiBall();
    const multiBallChance = hasMultiBall ? (this.getMultiBallChance() * 100).toFixed(0) : '0';
    const multiBallCount = hasMultiBall ? this.getMultiBallCount() : 0;
    stats.push({ label: 'Multi Ball Chance', value: `${multiBallChance}%`, active: hasMultiBall });
    stats.push({ label: 'Multi Ball Count', value: `${multiBallCount}`, active: hasMultiBall });
    
    // Lives - show total lives (base 1 + bonus)
    const healthBonus = this.getHealthBonus();
    const totalLives = 1 + healthBonus; // Player starts with 1 life
    stats.push({ 
      label: 'Lives', 
      value: `${totalLives}`, 
      active: healthBonus > 0 
    });
    
    return stats;
  }

  /**
   * Reset all upgrades (for new game)
   */
  reset(): void {
    this.upgradeLevels.clear();
  }
}
