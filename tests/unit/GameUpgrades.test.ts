/**
 * Tests for GameUpgrades class
 */

import { GameUpgrades } from '../../src/renderer/game/GameUpgrades';
import { UpgradeType } from '../../src/renderer/game/types';

describe('GameUpgrades', () => {
  let gameUpgrades: GameUpgrades;

  beforeEach(() => {
    gameUpgrades = new GameUpgrades();
    gameUpgrades.setBaseValues(150, 15, 600, 10); // bat width, bat height, ball speed, ball radius
  });

  describe('initialization', () => {
    it('should create instance', () => {
      expect(gameUpgrades).toBeDefined();
    });

    it('should start with no upgrades', () => {
      expect(gameUpgrades.getUpgradeLevel(UpgradeType.BAT_WIDTH_INCREASE_10_PERCENT)).toBe(0);
      expect(gameUpgrades.getUpgradeLevel(UpgradeType.BALL_DAMAGE_INCREASE_INCREMENT_1)).toBe(0);
    });
  });

  describe('setUpgradeLevels', () => {
    it('should set upgrade levels from map', () => {
      const upgrades = new Map<string, number>();
      upgrades.set(UpgradeType.BAT_WIDTH_INCREASE_10_PERCENT, 2);
      upgrades.set(UpgradeType.BALL_DAMAGE_INCREASE_INCREMENT_1, 3);

      gameUpgrades.setUpgradeLevels(upgrades);

      expect(gameUpgrades.getUpgradeLevel(UpgradeType.BAT_WIDTH_INCREASE_10_PERCENT)).toBe(2);
      expect(gameUpgrades.getUpgradeLevel(UpgradeType.BALL_DAMAGE_INCREASE_INCREMENT_1)).toBe(3);
    });
  });

  describe('bat width upgrade', () => {
    it('should return base width with no upgrade', () => {
      const width = gameUpgrades.applyBatWidthUpgrade();
      expect(width).toBe(150);
    });

    it('should increase width by 10% per level', () => {
      const upgrades = new Map<string, number>();
      upgrades.set(UpgradeType.BAT_WIDTH_INCREASE_10_PERCENT, 1);
      gameUpgrades.setUpgradeLevels(upgrades);

      const width = gameUpgrades.applyBatWidthUpgrade();
      expect(width).toBe(165); // 150 * 1.1
    });

    it('should increase width by 20% at level 2', () => {
      const upgrades = new Map<string, number>();
      upgrades.set(UpgradeType.BAT_WIDTH_INCREASE_10_PERCENT, 2);
      gameUpgrades.setUpgradeLevels(upgrades);

      const width = gameUpgrades.applyBatWidthUpgrade();
      expect(width).toBe(180); // 150 * 1.2
    });

    it('should increase width by 30% at level 3', () => {
      const upgrades = new Map<string, number>();
      upgrades.set(UpgradeType.BAT_WIDTH_INCREASE_10_PERCENT, 3);
      gameUpgrades.setUpgradeLevels(upgrades);

      const width = gameUpgrades.applyBatWidthUpgrade();
      expect(width).toBe(195); // 150 * 1.3
    });
  });

  describe('applyBatUpgrades', () => {
    it('should return base dimensions with no upgrades', () => {
      const dimensions = gameUpgrades.applyBatUpgrades();
      expect(dimensions.width).toBe(150);
      expect(dimensions.height).toBe(15);
    });

    it('should return upgraded width', () => {
      const upgrades = new Map<string, number>();
      upgrades.set(UpgradeType.BAT_WIDTH_INCREASE_10_PERCENT, 2);
      gameUpgrades.setUpgradeLevels(upgrades);

      const dimensions = gameUpgrades.applyBatUpgrades();
      expect(dimensions.width).toBe(180);
      expect(dimensions.height).toBe(15);
    });
  });

  describe('ball damage upgrade', () => {
    it('should return base damage (1) with no upgrade', () => {
      const ballProps = gameUpgrades.applyBallUpgrades();
      expect(ballProps.damage).toBe(1);
    });

    it('should increase damage by 1 per level', () => {
      const upgrades = new Map<string, number>();
      upgrades.set(UpgradeType.BALL_DAMAGE_INCREASE_INCREMENT_1, 1);
      gameUpgrades.setUpgradeLevels(upgrades);

      const ballProps = gameUpgrades.applyBallUpgrades();
      expect(ballProps.damage).toBe(2); // 1 + 1
    });

    it('should increase damage to 3 at level 2', () => {
      const upgrades = new Map<string, number>();
      upgrades.set(UpgradeType.BALL_DAMAGE_INCREASE_INCREMENT_1, 2);
      gameUpgrades.setUpgradeLevels(upgrades);

      const ballProps = gameUpgrades.applyBallUpgrades();
      expect(ballProps.damage).toBe(3); // 1 + 2
    });

    it('should increase damage to 4 at level 3', () => {
      const upgrades = new Map<string, number>();
      upgrades.set(UpgradeType.BALL_DAMAGE_INCREASE_INCREMENT_1, 3);
      gameUpgrades.setUpgradeLevels(upgrades);

      const ballProps = gameUpgrades.applyBallUpgrades();
      expect(ballProps.damage).toBe(4); // 1 + 3
    });
  });

  describe('ball piercing', () => {
    it('should return false for hasBallPiercing with no upgrade', () => {
      expect(gameUpgrades.hasBallPiercing()).toBe(false);
    });

    it('should return true for hasBallPiercing when unlocked', () => {
      const upgrades = new Map<string, number>();
      upgrades.set(UpgradeType.BALL_ADD_PIERCING, 1);
      gameUpgrades.setUpgradeLevels(upgrades);

      expect(gameUpgrades.hasBallPiercing()).toBe(true);
    });

    it('should return 0% piercing chance with no upgrade', () => {
      expect(gameUpgrades.getBallPiercingChance()).toBe(0);
    });

    it('should return 10% base piercing chance when unlocked', () => {
      const upgrades = new Map<string, number>();
      upgrades.set(UpgradeType.BALL_ADD_PIERCING, 1);
      gameUpgrades.setUpgradeLevels(upgrades);

      expect(gameUpgrades.getBallPiercingChance()).toBe(0.1);
    });

    it('should increase piercing chance by 10% per Piercing+ level', () => {
      const upgrades = new Map<string, number>();
      upgrades.set(UpgradeType.BALL_ADD_PIERCING, 1);
      upgrades.set(UpgradeType.BALL_CHANCE_PIERCING_10_PERCENT, 1);
      gameUpgrades.setUpgradeLevels(upgrades);

      expect(gameUpgrades.getBallPiercingChance()).toBe(0.2); // 10% + 10%
    });

    it('should cap piercing chance at 100%', () => {
      const upgrades = new Map<string, number>();
      upgrades.set(UpgradeType.BALL_ADD_PIERCING, 1);
      upgrades.set(UpgradeType.BALL_CHANCE_PIERCING_10_PERCENT, 10); // Would be 110%
      gameUpgrades.setUpgradeLevels(upgrades);

      expect(gameUpgrades.getBallPiercingChance()).toBe(1.0); // Capped at 100%
    });
  });

  describe('health bonus', () => {
    it('should return 0 health bonus with no upgrade', () => {
      expect(gameUpgrades.getHealthBonus()).toBe(0);
    });

    it('should return +1 health per level', () => {
      const upgrades = new Map<string, number>();
      upgrades.set(UpgradeType.HEALTH_INCREASE_1, 1);
      gameUpgrades.setUpgradeLevels(upgrades);

      expect(gameUpgrades.getHealthBonus()).toBe(1);
    });

    it('should return +3 health at max level', () => {
      const upgrades = new Map<string, number>();
      upgrades.set(UpgradeType.HEALTH_INCREASE_1, 3);
      gameUpgrades.setUpgradeLevels(upgrades);

      expect(gameUpgrades.getHealthBonus()).toBe(3);
    });
  });

  describe('ball acceleration reduction', () => {
    it('should return 1.0 multiplier with no upgrade', () => {
      expect(gameUpgrades.getBallAccelerationMultiplier()).toBe(1.0);
    });

    it('should reduce acceleration by 25% at level 1', () => {
      const upgrades = new Map<string, number>();
      upgrades.set(UpgradeType.BALL_ACCELERATION_REDUCE_25_PERCENT, 1);
      gameUpgrades.setUpgradeLevels(upgrades);

      expect(gameUpgrades.getBallAccelerationMultiplier()).toBe(0.75);
    });

    it('should reduce acceleration by 50% at level 2', () => {
      const upgrades = new Map<string, number>();
      upgrades.set(UpgradeType.BALL_ACCELERATION_REDUCE_25_PERCENT, 2);
      gameUpgrades.setUpgradeLevels(upgrades);

      expect(gameUpgrades.getBallAccelerationMultiplier()).toBe(0.5);
    });

    it('should reduce acceleration by 75% at level 3', () => {
      const upgrades = new Map<string, number>();
      upgrades.set(UpgradeType.BALL_ACCELERATION_REDUCE_25_PERCENT, 3);
      gameUpgrades.setUpgradeLevels(upgrades);

      expect(gameUpgrades.getBallAccelerationMultiplier()).toBe(0.25);
    });
  });

  describe('bat shooter', () => {
    it('should return false for hasBatShooter with no upgrade', () => {
      expect(gameUpgrades.hasBatShooter()).toBe(false);
    });

    it('should return true for hasBatShooter when unlocked', () => {
      const upgrades = new Map<string, number>();
      upgrades.set(UpgradeType.BAT_ADD_SHOOTER, 1);
      gameUpgrades.setUpgradeLevels(upgrades);

      expect(gameUpgrades.hasBatShooter()).toBe(true);
    });

    it('should return 0 shooter damage with no upgrade', () => {
      expect(gameUpgrades.getBatShooterDamage()).toBe(0);
    });

    it('should return base damage (1) when shooter unlocked', () => {
      const upgrades = new Map<string, number>();
      upgrades.set(UpgradeType.BAT_ADD_SHOOTER, 1);
      gameUpgrades.setUpgradeLevels(upgrades);

      expect(gameUpgrades.getBatShooterDamage()).toBe(1);
    });
  });

  describe('reset', () => {
    it('should clear all upgrades', () => {
      const upgrades = new Map<string, number>();
      upgrades.set(UpgradeType.BAT_WIDTH_INCREASE_10_PERCENT, 3);
      upgrades.set(UpgradeType.BALL_DAMAGE_INCREASE_INCREMENT_1, 2);
      gameUpgrades.setUpgradeLevels(upgrades);

      gameUpgrades.reset();

      expect(gameUpgrades.getUpgradeLevel(UpgradeType.BAT_WIDTH_INCREASE_10_PERCENT)).toBe(0);
      expect(gameUpgrades.getUpgradeLevel(UpgradeType.BALL_DAMAGE_INCREASE_INCREMENT_1)).toBe(0);
    });

    it('should reset bat width to base', () => {
      const upgrades = new Map<string, number>();
      upgrades.set(UpgradeType.BAT_WIDTH_INCREASE_10_PERCENT, 3);
      gameUpgrades.setUpgradeLevels(upgrades);

      gameUpgrades.reset();

      const width = gameUpgrades.applyBatWidthUpgrade();
      expect(width).toBe(150);
    });
  });

  describe('ball explosions', () => {
    it('should return false for hasBallExplosions with no upgrade', () => {
      expect(gameUpgrades.hasBallExplosions()).toBe(false);
    });

    it('should return true for hasBallExplosions when unlocked', () => {
      const upgrades = new Map<string, number>();
      upgrades.set(UpgradeType.BALL_EXPLOSIONS, 1);
      gameUpgrades.setUpgradeLevels(upgrades);

      expect(gameUpgrades.hasBallExplosions()).toBe(true);
    });

    it('should return 0 explosion damage multiplier with no upgrade', () => {
      expect(gameUpgrades.getBallExplosionDamageMultiplier()).toBe(0);
    });

    it('should return 10% base explosion damage multiplier when unlocked', () => {
      const upgrades = new Map<string, number>();
      upgrades.set(UpgradeType.BALL_EXPLOSIONS, 1);
      gameUpgrades.setUpgradeLevels(upgrades);

      expect(gameUpgrades.getBallExplosionDamageMultiplier()).toBe(0.1);
    });

    it('should increase explosion damage by 10% per Explosions+ level', () => {
      const upgrades = new Map<string, number>();
      upgrades.set(UpgradeType.BALL_EXPLOSIONS, 1);
      upgrades.set(UpgradeType.BALL_EXPLOSIONS_INCREASE_10_PERCENT, 1);
      gameUpgrades.setUpgradeLevels(upgrades);

      expect(gameUpgrades.getBallExplosionDamageMultiplier()).toBe(0.2); // 10% base + 10% bonus
    });

    it('should stack explosion damage bonuses', () => {
      const upgrades = new Map<string, number>();
      upgrades.set(UpgradeType.BALL_EXPLOSIONS, 1);
      upgrades.set(UpgradeType.BALL_EXPLOSIONS_INCREASE_10_PERCENT, 3);
      gameUpgrades.setUpgradeLevels(upgrades);

      expect(gameUpgrades.getBallExplosionDamageMultiplier()).toBe(0.4); // 10% base + 30% bonus
    });
  });

  describe('critical hits', () => {
    it('should return false for hasCriticalHits with no upgrade', () => {
      expect(gameUpgrades.hasCriticalHits()).toBe(false);
    });

    it('should return true for hasCriticalHits when unlocked', () => {
      const upgrades = new Map<string, number>();
      upgrades.set(UpgradeType.BALL_ADD_CRITICAL_HITS, 1);
      gameUpgrades.setUpgradeLevels(upgrades);

      expect(gameUpgrades.hasCriticalHits()).toBe(true);
    });

    it('should return 0 critical hit chance with no upgrade', () => {
      expect(gameUpgrades.getCriticalHitChance()).toBe(0);
    });

    it('should return 10% base critical hit chance when unlocked', () => {
      const upgrades = new Map<string, number>();
      upgrades.set(UpgradeType.BALL_ADD_CRITICAL_HITS, 1);
      gameUpgrades.setUpgradeLevels(upgrades);

      expect(gameUpgrades.getCriticalHitChance()).toBe(0.1);
    });

    it('should increase critical hit chance by 10% per level', () => {
      const upgrades = new Map<string, number>();
      upgrades.set(UpgradeType.BALL_ADD_CRITICAL_HITS, 1);
      upgrades.set(UpgradeType.BALL_CHANCE_CRITICAL_HITS_10_PERCENT, 1);
      gameUpgrades.setUpgradeLevels(upgrades);

      expect(gameUpgrades.getCriticalHitChance()).toBe(0.2); // 10% base + 10% bonus
    });

    it('should stack critical hit chance bonuses', () => {
      const upgrades = new Map<string, number>();
      upgrades.set(UpgradeType.BALL_ADD_CRITICAL_HITS, 1);
      upgrades.set(UpgradeType.BALL_CHANCE_CRITICAL_HITS_10_PERCENT, 3);
      gameUpgrades.setUpgradeLevels(upgrades);

      expect(gameUpgrades.getCriticalHitChance()).toBe(0.4); // 10% base + 30% bonus
    });

    it('should cap critical hit chance at 100%', () => {
      const upgrades = new Map<string, number>();
      upgrades.set(UpgradeType.BALL_ADD_CRITICAL_HITS, 1);
      upgrades.set(UpgradeType.BALL_CHANCE_CRITICAL_HITS_10_PERCENT, 20);
      gameUpgrades.setUpgradeLevels(upgrades);

      expect(gameUpgrades.getCriticalHitChance()).toBe(1.0); // Capped at 100%
    });
  });

  describe('getSummary', () => {
    it('should return empty array with no upgrades', () => {
      const summary = gameUpgrades.getSummary();
      expect(summary).toEqual([]);
    });

    it('should return summary of active upgrades', () => {
      const upgrades = new Map<string, number>();
      upgrades.set(UpgradeType.BAT_WIDTH_INCREASE_10_PERCENT, 2);
      upgrades.set(UpgradeType.BALL_DAMAGE_INCREASE_INCREMENT_1, 1);
      gameUpgrades.setUpgradeLevels(upgrades);

      const summary = gameUpgrades.getSummary();
      expect(summary.length).toBe(2);
      expect(summary).toContain('BAT_WIDTH_INCREASE_10_PERCENT: Level 2');
      expect(summary).toContain('BALL_DAMAGE_INCREASE_INCREMENT_1: Level 1');
    });
  });
});
