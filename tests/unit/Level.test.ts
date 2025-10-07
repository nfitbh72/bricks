/**
 * Unit tests for Level class and level configuration
 */

import { Level } from '../../src/renderer/game/Level';
import { LevelConfig } from '../../src/renderer/game/types';
import {
  createTextLayout,
  createLetterBricks,
  createWordBricks,
  LEVEL_1,
  getLevel,
} from '../../src/renderer/config/levels';

describe('Level Configuration Helpers', () => {
  describe('createTextLayout', () => {
    it('should create bricks for simple text', () => {
      const bricks = createTextLayout('AB', 0, 0, 10, 5, 1, 2);
      expect(bricks.length).toBe(2);
      expect(bricks[0].x).toBe(0);
      expect(bricks[1].x).toBe(12); // 10 + 2 spacing
    });

    it('should skip spaces in text', () => {
      const bricks = createTextLayout('A B', 0, 0, 10, 5, 1, 2);
      expect(bricks.length).toBe(2);
      expect(bricks[0].x).toBe(0);
      expect(bricks[1].x).toBe(24); // 0 + 10 + 2 + 10 + 2
    });

    it('should handle multi-line text', () => {
      const bricks = createTextLayout('A\nB', 0, 0, 10, 5, 1, 2);
      expect(bricks.length).toBe(2);
      expect(bricks[0].y).toBe(0);
      expect(bricks[1].y).toBe(7); // 5 + 2 spacing
    });

    it('should use correct brick dimensions', () => {
      const bricks = createTextLayout('A', 0, 0, 15, 8, 1, 2);
      expect(bricks[0].width).toBe(15);
      expect(bricks[0].height).toBe(8);
    });

    it('should use correct brick health', () => {
      const bricks = createTextLayout('A', 0, 0, 10, 5, 3, 2);
      expect(bricks[0].health).toBe(3);
    });

    it('should apply startX and startY offsets', () => {
      const bricks = createTextLayout('A', 100, 200, 10, 5, 1, 2);
      expect(bricks[0].x).toBe(100);
      expect(bricks[0].y).toBe(200);
    });
  });

  describe('createLetterBricks', () => {
    it('should create bricks for letter B', () => {
      const bricks = createLetterBricks('B', 0, 0, 10, 5, 1, 2);
      expect(bricks.length).toBeGreaterThan(0);
    });

    it('should create bricks for letter R', () => {
      const bricks = createLetterBricks('R', 0, 0, 10, 5, 1, 2);
      expect(bricks.length).toBeGreaterThan(0);
    });

    it('should create bricks for letter I', () => {
      const bricks = createLetterBricks('I', 0, 0, 10, 5, 1, 2);
      expect(bricks.length).toBeGreaterThan(0);
    });

    it('should create bricks for letter C', () => {
      const bricks = createLetterBricks('C', 0, 0, 10, 5, 1, 2);
      expect(bricks.length).toBeGreaterThan(0);
    });

    it('should create bricks for letter K', () => {
      const bricks = createLetterBricks('K', 0, 0, 10, 5, 1, 2);
      expect(bricks.length).toBeGreaterThan(0);
    });

    it('should create bricks for letter S', () => {
      const bricks = createLetterBricks('S', 0, 0, 10, 5, 1, 2);
      expect(bricks.length).toBeGreaterThan(0);
    });

    it('should handle lowercase letters', () => {
      const bricks = createLetterBricks('b', 0, 0, 10, 5, 1, 2);
      expect(bricks.length).toBeGreaterThan(0);
    });

    it('should return empty array for unknown letter', () => {
      const bricks = createLetterBricks('Z', 0, 0, 10, 5, 1, 2);
      expect(bricks.length).toBe(0);
    });

    it('should apply correct brick dimensions', () => {
      const bricks = createLetterBricks('B', 0, 0, 15, 8, 1, 2);
      expect(bricks[0].width).toBe(15);
      expect(bricks[0].height).toBe(8);
    });

    it('should apply correct brick health', () => {
      const bricks = createLetterBricks('B', 0, 0, 10, 5, 3, 2);
      expect(bricks[0].health).toBe(3);
    });

    it('should apply startX and startY offsets', () => {
      const bricks = createLetterBricks('B', 100, 200, 10, 5, 1, 2);
      expect(bricks[0].x).toBeGreaterThanOrEqual(100);
      expect(bricks[0].y).toBeGreaterThanOrEqual(200);
    });
  });

  describe('createWordBricks', () => {
    it('should create bricks for word BRICKS', () => {
      const bricks = createWordBricks('BRICKS', 0, 0, 10, 5, 1, 10, 2);
      expect(bricks.length).toBeGreaterThan(0);
    });

    it('should handle lowercase words', () => {
      const bricks = createWordBricks('bricks', 0, 0, 10, 5, 1, 10, 2);
      expect(bricks.length).toBeGreaterThan(0);
    });

    it('should handle words with spaces', () => {
      const bricks = createWordBricks('B R', 0, 0, 10, 5, 1, 10, 2);
      expect(bricks.length).toBeGreaterThan(0);
    });

    it('should apply correct brick health', () => {
      const bricks = createWordBricks('B', 0, 0, 10, 5, 3, 10, 2);
      expect(bricks[0].health).toBe(3);
    });
  });

  describe('LEVEL_1', () => {
    it('should have correct id', () => {
      expect(LEVEL_1.id).toBe(1);
    });

    it('should have a name', () => {
      expect(LEVEL_1.name).toBeTruthy();
      expect(typeof LEVEL_1.name).toBe('string');
    });

    it('should have bricks', () => {
      expect(LEVEL_1.bricks).toBeDefined();
      expect(LEVEL_1.bricks.length).toBeGreaterThan(0);
    });

    it('should have ball speed of 300', () => {
      expect(LEVEL_1.ballSpeed).toBe(300);
    });

    it('should have bat width of 100', () => {
      expect(LEVEL_1.batWidth).toBe(100);
    });

    it('should have bat height of 10', () => {
      expect(LEVEL_1.batHeight).toBe(10);
    });

    it('should have player health of 3', () => {
      expect(LEVEL_1.playerHealth).toBe(3);
    });
  });

  describe('getLevel', () => {
    it('should return level 1', () => {
      const level = getLevel(1);
      expect(level).toBeDefined();
      expect(level?.id).toBe(1);
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
      { x: 0, y: 0, width: 50, height: 20, health: 1 },
      { x: 60, y: 0, width: 50, height: 20, health: 2 },
      { x: 120, y: 0, width: 50, height: 20, health: 1 },
    ],
    ballSpeed: 300,
    batWidth: 100,
    batHeight: 10,
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

  describe('getBallSpeed', () => {
    it('should return ball speed', () => {
      const level = new Level(testConfig);
      expect(level.getBallSpeed()).toBe(300);
    });
  });

  describe('getBatWidth', () => {
    it('should return bat width', () => {
      const level = new Level(testConfig);
      expect(level.getBatWidth()).toBe(100);
    });
  });

  describe('getBatHeight', () => {
    it('should return bat height', () => {
      const level = new Level(testConfig);
      expect(level.getBatHeight()).toBe(10);
    });
  });

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
      const mockCtx = {
        save: jest.fn(),
        restore: jest.fn(),
        fillRect: jest.fn(),
        strokeRect: jest.fn(),
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
      const mockCtx = {
        save: jest.fn(),
        restore: jest.fn(),
        fillRect: jest.fn(),
        strokeRect: jest.fn(),
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

  describe('integration with LEVEL_1', () => {
    it('should create level from LEVEL_1 config', () => {
      const level = new Level(LEVEL_1);
      expect(level.getId()).toBe(1);
      expect(level.getBricks().length).toBeGreaterThan(0);
    });

    it('should have correct game parameters', () => {
      const level = new Level(LEVEL_1);
      expect(level.getBallSpeed()).toBe(300);
      expect(level.getBatWidth()).toBe(100);
      expect(level.getBatHeight()).toBe(10);
      expect(level.getPlayerHealth()).toBe(3);
    });
  });
});
