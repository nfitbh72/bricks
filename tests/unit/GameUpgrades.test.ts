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
