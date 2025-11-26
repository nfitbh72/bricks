/**
 * Unit tests for Level class and level configuration
 */

import { Level } from '../../src/renderer/game/entities/Level';
import { LevelFactory } from '../../src/renderer/game/factories/LevelFactory';
import {
  getLevel,
  createLevel1,
} from '../../src/renderer/config/levels';
import { createBricksFromPattern, createBricksFromWord } from '../../src/renderer/config/brickLayout';
import { BrickType, LevelConfig } from '../../src/renderer/game/core/types';
import { BRICK_WIDTH, BRICK_HEIGHT, BRICK_SPACING } from '../../src/renderer/config/constants';

describe('Level Configuration Helpers', () => {
  describe('createBricksFromPattern', () => {
    it('should create bricks from pattern with N (NORMAL)', () => {
      const pattern = ["NNN"];
      const bricks = createBricksFromPattern(pattern);
      expect(bricks.length).toBe(3);
      expect(bricks[0].type).toBe(BrickType.NORMAL);
      expect(bricks[0].col).toBe(0);
      expect(bricks[0].row).toBe(0);
    });

    it('should create bricks from pattern with H (HEALTHY)', () => {
      const pattern = ["HHH"];
      const bricks = createBricksFromPattern(pattern);
      expect(bricks.length).toBe(3);
      expect(bricks[0].type).toBe(BrickType.HEALTHY);
    });

    it('should skip spaces in pattern', () => {
      const pattern = ["N N"];
      const bricks = createBricksFromPattern(pattern);
      expect(bricks.length).toBe(2);
      expect(bricks[0].col).toBe(0);
      expect(bricks[1].col).toBe(2);
    });

    it('should handle multi-row patterns', () => {
      const pattern = [
        "NN",
        "NN"
      ];
      const bricks = createBricksFromPattern(pattern);
      expect(bricks.length).toBe(4);
      expect(bricks[0].row).toBe(0);
      expect(bricks[2].row).toBe(1);
    });

    it('should handle mixed brick types', () => {
      const pattern = ["NHN"];
      const bricks = createBricksFromPattern(pattern);
      expect(bricks.length).toBe(3);
      expect(bricks[0].type).toBe(BrickType.NORMAL);
      expect(bricks[1].type).toBe(BrickType.HEALTHY);
      expect(bricks[2].type).toBe(BrickType.NORMAL);
    });

    it('should handle complex patterns', () => {
      const pattern = [
        "NN   ",
        "NNNNN",
        "NNNNN",
        "NN   "
      ];
      const bricks = createBricksFromPattern(pattern);
      expect(bricks.length).toBe(14); // 2+5+5+2
    });
  });

  describe('createBricksFromWord', () => {
    it('should create bricks for word BRICKS', () => {
      const bricks = createBricksFromWord('BRICKS');
      expect(bricks.length).toBeGreaterThan(0);
    });

    it('should handle lowercase words', () => {
      const bricks = createBricksFromWord('bricks');
      expect(bricks.length).toBeGreaterThan(0);
    });

    it('should handle words with spaces', () => {
      const bricks = createBricksFromWord('B R');
      expect(bricks.length).toBeGreaterThan(0);
    });

    it('should apply correct brick type', () => {
      const bricks = createBricksFromWord('B', BrickType.HEALTHY);
      expect(bricks[0].type).toBe(BrickType.HEALTHY);
    });

    it('should skip unknown letters', () => {
      const bricks = createBricksFromWord('BZR'); // Z is not defined
      // Should have bricks for B and R only
      expect(bricks.length).toBeGreaterThan(0);
    });

    it('should start at column 0, row 0', () => {
      const bricks = createBricksFromWord('B');
      expect(bricks[0].col).toBe(0);
      expect(bricks[0].row).toBe(0);
    });
  });

  describe('createLevel1', () => {
    it('should have correct id', () => {
      const level1 = createLevel1();
      expect(level1.id).toBe(1);
    });

    it('should have a name', () => {
      const level1 = createLevel1();
      expect(level1.name).toBeTruthy();
      expect(typeof level1.name).toBe('string');
    });

    it('should have bricks', () => {
      const level1 = createLevel1();
      expect(level1.bricks).toBeDefined();
      expect(level1.bricks.length).toBeGreaterThan(0);
    });

    it('should have level configuration', () => {
      const level1 = createLevel1();
      expect(level1.id).toBe(1);
      expect(level1.name).toBeDefined();
    });

    it('should have grid coordinates', () => {
      const level1 = createLevel1();
      const firstBrick = level1.bricks[0];
      
      // All bricks should have grid coordinates
      level1.bricks.forEach(brick => {
        expect(brick.col).toBeDefined();
        expect(brick.row).toBeDefined();
      });
    });
  });

  describe('getLevel', () => {
    it('should return level 1', () => {
      const level = getLevel(1);
      expect(level).toBeDefined();
      expect(level?.id).toBe(1);
    });

    it('should return level 2', () => {
      const level = getLevel(2);
      expect(level).toBeDefined();
      expect(level?.id).toBe(2);
    });

    it('should return undefined for non-existent level', () => {
      const level = getLevel(999);
      expect(level).toBeUndefined();
    });
  });
});

describe('Level Class', () => {
  const testConfig: LevelConfig = {
    id: 1,
    name: 'Test Level',
    bricks: [
      { col: 0, row: 0, type: BrickType.NORMAL },
      { col: 1, row: 0, type: BrickType.HEALTHY },
      { col: 2, row: 0, type: BrickType.NORMAL },
    ],
  };

  describe('constructor', () => {
    it('should create level from config', () => {
      const level = LevelFactory.createLevel(testConfig);
      expect(level).toBeDefined();
    });

    it('should create correct number of bricks', () => {
      const level = LevelFactory.createLevel(testConfig);
      expect(level.getBricks().length).toBe(3);
    });
  });

  describe('getBricks', () => {
    it('should return all bricks', () => {
      const level = LevelFactory.createLevel(testConfig);
      const bricks = level.getBricks();
      expect(bricks.length).toBe(3);
    });

    it('should return bricks with correct health', () => {
      const level = LevelFactory.createLevel(testConfig);
      const bricks = level.getBricks();
      expect(bricks[0].getHealth()).toBe(1); // NORMAL
      expect(bricks[1].getHealth()).toBe(3); // HEALTHY
      expect(bricks[2].getHealth()).toBe(1); // NORMAL
    });
  });

  describe('getActiveBricks', () => {
    it('should return all bricks when none destroyed', () => {
      const level = LevelFactory.createLevel(testConfig);
      expect(level.getActiveBricks().length).toBe(3);
    });

    it('should exclude destroyed bricks', () => {
      const level = LevelFactory.createLevel(testConfig);
      const bricks = level.getBricks();
      bricks[0].takeDamage(1);
      expect(level.getActiveBricks().length).toBe(2);
    });

    it('should return empty array when all destroyed', () => {
      const level = LevelFactory.createLevel(testConfig);
      const bricks = level.getBricks();
      bricks.forEach((brick) => brick.takeDamage(10));
      expect(level.getActiveBricks().length).toBe(0);
    });
  });

  describe('isComplete', () => {
    it('should return false when bricks remain', () => {
      const level = LevelFactory.createLevel(testConfig);
      expect(level.isComplete()).toBe(false);
    });

    it('should return true when all bricks destroyed', () => {
      const level = LevelFactory.createLevel(testConfig);
      const bricks = level.getBricks();
      bricks.forEach((brick) => brick.takeDamage(10));
      expect(level.isComplete()).toBe(true);
    });

    it('should return false when some bricks destroyed', () => {
      const level = LevelFactory.createLevel(testConfig);
      const bricks = level.getBricks();
      bricks[0].takeDamage(10);
      expect(level.isComplete()).toBe(false);
    });
  });

  describe('getRemainingBricks', () => {
    it('should return total count when none destroyed', () => {
      const level = LevelFactory.createLevel(testConfig);
      expect(level.getRemainingBricks()).toBe(3);
    });

    it('should return correct count after destruction', () => {
      const level = LevelFactory.createLevel(testConfig);
      const bricks = level.getBricks();
      bricks[0].takeDamage(10);
      expect(level.getRemainingBricks()).toBe(2);
    });

    it('should return 0 when all destroyed', () => {
      const level = LevelFactory.createLevel(testConfig);
      const bricks = level.getBricks();
      bricks.forEach((brick) => brick.takeDamage(10));
      expect(level.getRemainingBricks()).toBe(0);
    });
  });

  describe('getTotalBricks', () => {
    it('should return total brick count', () => {
      const level = LevelFactory.createLevel(testConfig);
      expect(level.getTotalBricks()).toBe(3);
    });

    it('should not change after bricks destroyed', () => {
      const level = LevelFactory.createLevel(testConfig);
      const bricks = level.getBricks();
      bricks[0].takeDamage(10);
      expect(level.getTotalBricks()).toBe(3);
    });
  });

  describe('getConfig', () => {
    it('should return level config', () => {
      const level = LevelFactory.createLevel(testConfig);
      const config = level.getConfig();
      expect(config.id).toBe(1);
      expect(config.name).toBe('Test Level');
    });

    it('should return a copy of config', () => {
      const level = LevelFactory.createLevel(testConfig);
      const config = level.getConfig();
      config.id = 999;
      expect(level.getId()).toBe(1);
    });
  });

  describe('getId', () => {
    it('should return level id', () => {
      const level = LevelFactory.createLevel(testConfig);
      expect(level.getId()).toBe(1);
    });
  });

  describe('getName', () => {
    it('should return level name', () => {
      const level = LevelFactory.createLevel(testConfig);
      expect(level.getName()).toBe('Test Level');
    });
  });

  // Ball speed, bat width, and bat height are now global constants
  // No longer part of level config

  // getPlayerHealth is deprecated - health is now managed centrally in Game class

  describe('reset', () => {
    it('should restore all bricks via brick.restore()', () => {
      const level = LevelFactory.createLevel(testConfig);
      const bricks = level.getBricks();
      bricks.forEach((brick) => brick.takeDamage(10));
      expect(level.isComplete()).toBe(true);
      
      // Reset is now done by restoring individual bricks
      bricks.forEach((brick) => brick.restore());
      expect(level.isComplete()).toBe(false);
      expect(level.getRemainingBricks()).toBe(3);
    });

    it('should restore brick health via brick.restore()', () => {
      const level = LevelFactory.createLevel(testConfig);
      const bricks = level.getBricks();
      bricks[1].takeDamage(1); // HEALTHY brick: 3 -> 2
      expect(bricks[1].getHealth()).toBe(2);
      
      // Reset is now done by restoring individual bricks
      bricks[1].restore();
      expect(bricks[1].getHealth()).toBe(3); // Restored to HEALTHY max
    });
  });

  describe('integration with createLevel1', () => {
    it('should create level from createLevel1 config', () => {
      const level1Config = createLevel1();
      const level = LevelFactory.createLevel(level1Config);
      expect(level.getId()).toBe(1);
      expect(level.getBricks().length).toBeGreaterThan(0);
    });

    it('should have correct level configuration', () => {
      const level1Config = createLevel1();
      const level = LevelFactory.createLevel(level1Config);
      expect(level.getId()).toBe(1);
      expect(level.getName()).toBeDefined();
    });
    
    it('should center bricks when canvas width provided', () => {
      const level1Config = createLevel1();
      const level = LevelFactory.createLevel(level1Config, 1920);
      const bricks = level.getBricks();
      const firstBrick = bricks[0];
      
      // Bricks should be centered (not at pixel x=0)
      expect(firstBrick.getPosition().x).toBeGreaterThan(0);
    });
  });

  describe('LevelFactory.createFromPattern factory method', () => {
    it('should create level from pattern', () => {
      const pattern = ["NNN", "NNN"];
      const level = LevelFactory.createFromPattern(1, "Test Level", pattern);
      
      expect(level.getId()).toBe(1);
      expect(level.getName()).toBe("Test Level");
      expect(level.getBricks().length).toBe(6);
    });


    it('should center bricks when canvas width provided', () => {
      const pattern = ["N"];
      const level = LevelFactory.createFromPattern(1, "Test", pattern, 1920);
      const brick = level.getBricks()[0];
      expect(brick.getPosition().x).toBeGreaterThan(0);
    });

    it('should handle mixed brick types', () => {
      const pattern = ["NHN"];
      const level = LevelFactory.createFromPattern(1, "Test", pattern);
      const bricks = level.getBricks();
      
      expect(bricks[0].getHealth()).toBe(1); // NORMAL
      expect(bricks[1].getHealth()).toBe(3); // HEALTHY
      expect(bricks[2].getHealth()).toBe(1); // NORMAL
    });
  });

  describe('LevelFactory.createFromWord factory method', () => {
    it('should create level from word', () => {
      const level = LevelFactory.createFromWord(1, "Test Level", "HI");
      
      expect(level.getId()).toBe(1);
      expect(level.getName()).toBe("Test Level");
      expect(level.getBricks().length).toBeGreaterThan(0);
    });

    it('should use default brick type (NORMAL)', () => {
      const level = LevelFactory.createFromWord(1, "Test", "B");
      const bricks = level.getBricks();
      expect(bricks[0].getHealth()).toBe(1); // NORMAL
    });

    it('should accept custom brick type', () => {
      const level = LevelFactory.createFromWord(1, "Test", "B", BrickType.HEALTHY);
      const bricks = level.getBricks();
      expect(bricks[0].getHealth()).toBe(3); // HEALTHY
    });


    it('should center bricks when canvas width provided', () => {
      const level = LevelFactory.createFromWord(1, "Test", "B", BrickType.NORMAL, 1920);
      const brick = level.getBricks()[0];
      expect(brick.getPosition().x).toBeGreaterThan(0);
    });

    it('should handle multi-letter words', () => {
      const level = LevelFactory.createFromWord(1, "Test", "BRICKS");
      expect(level.getBricks().length).toBeGreaterThan(20); // Multiple letters worth of bricks
    });
  });
});
