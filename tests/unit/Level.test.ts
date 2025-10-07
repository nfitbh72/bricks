/**
 * Unit tests for Level class and level configuration
 */

import { Level } from '../../src/renderer/game/Level';
import { LevelConfig } from '../../src/renderer/game/types';
import {
  createTextLayout,
  createLetterBricks,
  createWordBricks,
  getLevel,
  createLevel1,
} from '../../src/renderer/config/levels';
import { BRICK_WIDTH, BRICK_HEIGHT, BRICK_SPACING } from '../../src/renderer/config/constants';

describe('Level Configuration Helpers', () => {
  describe('createTextLayout', () => {
    it('should create bricks for simple text', () => {
      const bricks = createTextLayout('AB', 0, 0, 1);
      expect(bricks.length).toBe(2);
      expect(bricks[0].col).toBe(0);
      expect(bricks[1].col).toBe(1);
    });

    it('should skip spaces in text', () => {
      const bricks = createTextLayout('A B', 0, 0, 1);
      expect(bricks.length).toBe(2);
      expect(bricks[0].col).toBe(0);
      expect(bricks[1].col).toBe(2); // Space skipped
    });

    it('should handle multi-line text', () => {
      const bricks = createTextLayout('A\nB', 0, 0, 1);
      expect(bricks.length).toBe(2);
      expect(bricks[0].row).toBe(0);
      expect(bricks[1].row).toBe(1);
    });

    it('should return grid coordinates', () => {
      const bricks = createTextLayout('A', 0, 0, 1);
      expect(bricks[0].col).toBeDefined();
      expect(bricks[0].row).toBeDefined();
      expect(bricks[0].health).toBe(1);
    });

    it('should use correct brick health', () => {
      const bricks = createTextLayout('A', 0, 0, 3);
      expect(bricks[0].health).toBe(3);
    });

    it('should apply start col and row offsets', () => {
      const bricks = createTextLayout('A', 5, 10, 1);
      expect(bricks[0].col).toBe(5);
      expect(bricks[0].row).toBe(10);
    });
  });

  describe('createLetterBricks', () => {
    it('should create bricks for letter B', () => {
      const bricks = createLetterBricks('B', 0, 0, 1);
      expect(bricks.length).toBeGreaterThan(0);
    });

    it('should create bricks for letter R', () => {
      const bricks = createLetterBricks('R', 0, 0, 1);
      expect(bricks.length).toBeGreaterThan(0);
    });

    it('should create bricks for letter I', () => {
      const bricks = createLetterBricks('I', 0, 0, 1);
      expect(bricks.length).toBeGreaterThan(0);
    });

    it('should create bricks for letter C', () => {
      const bricks = createLetterBricks('C', 0, 0, 1);
      expect(bricks.length).toBeGreaterThan(0);
    });

    it('should create bricks for letter K', () => {
      const bricks = createLetterBricks('K', 0, 0, 1);
      expect(bricks.length).toBeGreaterThan(0);
    });

    it('should create bricks for letter S', () => {
      const bricks = createLetterBricks('S', 0, 0, 1);
      expect(bricks.length).toBeGreaterThan(0);
    });

    it('should handle lowercase letters', () => {
      const bricks = createLetterBricks('b', 0, 0, 1);
      expect(bricks.length).toBeGreaterThan(0);
    });

    it('should return empty array for unknown letter', () => {
      const bricks = createLetterBricks('Z', 0, 0, 1);
      expect(bricks.length).toBe(0);
    });

    it('should return grid coordinates', () => {
      const bricks = createLetterBricks('B', 0, 0, 1);
      expect(bricks[0].col).toBeDefined();
      expect(bricks[0].row).toBeDefined();
    });

    it('should apply correct brick health', () => {
      const bricks = createLetterBricks('B', 0, 0, 3);
      expect(bricks[0].health).toBe(3);
    });

    it('should apply start col and row offsets', () => {
      const bricks = createLetterBricks('B', 5, 10, 1);
      expect(bricks[0].col).toBeGreaterThanOrEqual(5);
      expect(bricks[0].row).toBeGreaterThanOrEqual(10);
    });
  });

  describe('createWordBricks', () => {
    it('should create bricks for word BRICKS', () => {
      const bricks = createWordBricks('BRICKS', 0, 0, 1);
      expect(bricks.length).toBeGreaterThan(0);
    });

    it('should handle lowercase words', () => {
      const bricks = createWordBricks('bricks', 0, 0, 1);
      expect(bricks.length).toBeGreaterThan(0);
    });

    it('should handle words with spaces', () => {
      const bricks = createWordBricks('B R', 0, 0, 1);
      expect(bricks.length).toBeGreaterThan(0);
    });

    it('should apply correct brick health', () => {
      const bricks = createWordBricks('B', 0, 0, 3);
      expect(bricks[0].health).toBe(3);
    });
  });

  describe('createLevel1', () => {
    it('should have correct id', () => {
      const level1 = createLevel1(800);
      expect(level1.id).toBe(1);
    });

    it('should have a name', () => {
      const level1 = createLevel1(800);
      expect(level1.name).toBeTruthy();
      expect(typeof level1.name).toBe('string');
    });

    it('should have bricks', () => {
      const level1 = createLevel1(800);
      expect(level1.bricks).toBeDefined();
      expect(level1.bricks.length).toBeGreaterThan(0);
    });

    it('should have player health of 3', () => {
      const level1 = createLevel1(800);
      expect(level1.playerHealth).toBe(3);
    });

    it('should center bricks based on canvas width', () => {
      const level1 = createLevel1(1920); // Use wider canvas
      const firstBrick = level1.bricks[0];
      
      // First brick should not be at col=0 (it's centered)
      expect(firstBrick.col).toBeGreaterThan(0);
      
      // All bricks should have grid coordinates
      level1.bricks.forEach(brick => {
        expect(brick.col).toBeDefined();
        expect(brick.row).toBeDefined();
      });
    });
  });

  describe('getLevel', () => {
    it('should return level 1', () => {
      const level = getLevel(1, 800);
      expect(level).toBeDefined();
      expect(level?.id).toBe(1);
    });

    it('should return undefined for non-existent level', () => {
      const level = getLevel(999, 800);
      expect(level).toBeUndefined();
    });

    it('should create level with correct canvas width', () => {
      const level = getLevel(1, 1024);
      expect(level).toBeDefined();
      expect(level?.bricks.length).toBeGreaterThan(0);
    });
  });
});

describe('Level Class', () => {
  const testConfig: LevelConfig = {
    id: 1,
    name: 'Test Level',
    bricks: [
      { col: 0, row: 0, health: 1 },
      { col: 1, row: 0, health: 2 },
      { col: 2, row: 0, health: 1 },
    ],
    playerHealth: 3,
  };

  describe('constructor', () => {
    it('should create level from config', () => {
      const level = new Level(testConfig);
      expect(level).toBeDefined();
    });

    it('should create correct number of bricks', () => {
      const level = new Level(testConfig);
      expect(level.getBricks().length).toBe(3);
    });
  });

  describe('getBricks', () => {
    it('should return all bricks', () => {
      const level = new Level(testConfig);
      const bricks = level.getBricks();
      expect(bricks.length).toBe(3);
    });

    it('should return bricks with correct health', () => {
      const level = new Level(testConfig);
      const bricks = level.getBricks();
      expect(bricks[0].getHealth()).toBe(1);
      expect(bricks[1].getHealth()).toBe(2);
      expect(bricks[2].getHealth()).toBe(1);
    });
  });

  describe('getActiveBricks', () => {
    it('should return all bricks when none destroyed', () => {
      const level = new Level(testConfig);
      expect(level.getActiveBricks().length).toBe(3);
    });

    it('should exclude destroyed bricks', () => {
      const level = new Level(testConfig);
      const bricks = level.getBricks();
      bricks[0].takeDamage(1);
      expect(level.getActiveBricks().length).toBe(2);
    });

    it('should return empty array when all destroyed', () => {
      const level = new Level(testConfig);
      const bricks = level.getBricks();
      bricks.forEach((brick) => brick.takeDamage(10));
      expect(level.getActiveBricks().length).toBe(0);
    });
  });

  describe('isComplete', () => {
    it('should return false when bricks remain', () => {
      const level = new Level(testConfig);
      expect(level.isComplete()).toBe(false);
    });

    it('should return true when all bricks destroyed', () => {
      const level = new Level(testConfig);
      const bricks = level.getBricks();
      bricks.forEach((brick) => brick.takeDamage(10));
      expect(level.isComplete()).toBe(true);
    });

    it('should return false when some bricks destroyed', () => {
      const level = new Level(testConfig);
      const bricks = level.getBricks();
      bricks[0].takeDamage(10);
      expect(level.isComplete()).toBe(false);
    });
  });

  describe('getRemainingBricks', () => {
    it('should return total count when none destroyed', () => {
      const level = new Level(testConfig);
      expect(level.getRemainingBricks()).toBe(3);
    });

    it('should return correct count after destruction', () => {
      const level = new Level(testConfig);
      const bricks = level.getBricks();
      bricks[0].takeDamage(10);
      expect(level.getRemainingBricks()).toBe(2);
    });

    it('should return 0 when all destroyed', () => {
      const level = new Level(testConfig);
      const bricks = level.getBricks();
      bricks.forEach((brick) => brick.takeDamage(10));
      expect(level.getRemainingBricks()).toBe(0);
    });
  });

  describe('getTotalBricks', () => {
    it('should return total brick count', () => {
      const level = new Level(testConfig);
      expect(level.getTotalBricks()).toBe(3);
    });

    it('should not change after bricks destroyed', () => {
      const level = new Level(testConfig);
      const bricks = level.getBricks();
      bricks[0].takeDamage(10);
      expect(level.getTotalBricks()).toBe(3);
    });
  });

  describe('getConfig', () => {
    it('should return level config', () => {
      const level = new Level(testConfig);
      const config = level.getConfig();
      expect(config.id).toBe(1);
      expect(config.name).toBe('Test Level');
    });

    it('should return a copy of config', () => {
      const level = new Level(testConfig);
      const config = level.getConfig();
      config.id = 999;
      expect(level.getId()).toBe(1);
    });
  });

  describe('getId', () => {
    it('should return level id', () => {
      const level = new Level(testConfig);
      expect(level.getId()).toBe(1);
    });
  });

  describe('getName', () => {
    it('should return level name', () => {
      const level = new Level(testConfig);
      expect(level.getName()).toBe('Test Level');
    });
  });

  // Ball speed, bat width, and bat height are now global constants
  // No longer part of level config

  describe('getPlayerHealth', () => {
    it('should return player health', () => {
      const level = new Level(testConfig);
      expect(level.getPlayerHealth()).toBe(3);
    });
  });

  describe('reset', () => {
    it('should restore all bricks', () => {
      const level = new Level(testConfig);
      const bricks = level.getBricks();
      bricks.forEach((brick) => brick.takeDamage(10));
      expect(level.isComplete()).toBe(true);
      
      level.reset();
      expect(level.isComplete()).toBe(false);
      expect(level.getRemainingBricks()).toBe(3);
    });

    it('should restore brick health', () => {
      const level = new Level(testConfig);
      const bricks = level.getBricks();
      bricks[1].takeDamage(1);
      expect(bricks[1].getHealth()).toBe(1);
      
      level.reset();
      const newBricks = level.getBricks();
      expect(newBricks[1].getHealth()).toBe(2);
    });
  });

  describe('render', () => {
    it('should not throw when rendering', () => {
      const level = new Level(testConfig);
      const mockGradient = {
        addColorStop: jest.fn(),
      };
      const mockCtx = {
        save: jest.fn(),
        restore: jest.fn(),
        fillRect: jest.fn(),
        strokeRect: jest.fn(),
        createLinearGradient: jest.fn(() => mockGradient),
        shadowBlur: 0,
        shadowColor: '',
        fillStyle: '',
        strokeStyle: '',
        lineWidth: 0,
        globalAlpha: 1,
      } as unknown as CanvasRenderingContext2D;

      expect(() => level.render(mockCtx)).not.toThrow();
    });

    it('should call render on all bricks', () => {
      const level = new Level(testConfig);
      const mockGradient = {
        addColorStop: jest.fn(),
      };
      const mockCtx = {
        save: jest.fn(),
        restore: jest.fn(),
        fillRect: jest.fn(),
        strokeRect: jest.fn(),
        createLinearGradient: jest.fn(() => mockGradient),
        shadowBlur: 0,
        shadowColor: '',
        fillStyle: '',
        strokeStyle: '',
        lineWidth: 0,
        globalAlpha: 1,
      } as unknown as CanvasRenderingContext2D;

      level.render(mockCtx);
      
      // Each brick calls fillRect and strokeRect
      expect(mockCtx.fillRect).toHaveBeenCalled();
      expect(mockCtx.strokeRect).toHaveBeenCalled();
    });
  });

  describe('integration with createLevel1', () => {
    it('should create level from createLevel1 config', () => {
      const level1Config = createLevel1(800);
      const level = new Level(level1Config);
      expect(level.getId()).toBe(1);
      expect(level.getBricks().length).toBeGreaterThan(0);
    });

    it('should have correct game parameters', () => {
      const level1Config = createLevel1(800);
      const level = new Level(level1Config);
      expect(level.getPlayerHealth()).toBe(3);
    });
  });
});
