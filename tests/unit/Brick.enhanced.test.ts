/**
 * Enhanced tests for Brick class - covering offensive bricks and rendering
 */

import { Brick } from '../../src/renderer/game/entities/Brick';
import { BrickConfig, BrickType } from '../../src/renderer/game/core/types';

function createBrickConfig(col: number, row: number, type: BrickType, color?: string): BrickConfig {
  return { col, row, type, color };
}

describe('Brick - Enhanced Coverage', () => {
  let mockCtx: any;

  beforeEach(() => {
    mockCtx = {
      save: jest.fn(),
      restore: jest.fn(),
      fillRect: jest.fn(),
      strokeRect: jest.fn(),
      fillText: jest.fn(),
      beginPath: jest.fn(),
      moveTo: jest.fn(),
      lineTo: jest.fn(),
      arcTo: jest.fn(),
      closePath: jest.fn(),
      fill: jest.fn(),
      stroke: jest.fn(),
      createLinearGradient: jest.fn(() => ({
        addColorStop: jest.fn(),
      })),
      drawImage: jest.fn(),
      shadowBlur: 0,
      shadowColor: '',
      fillStyle: '',
      strokeStyle: '',
      lineWidth: 0,
      font: '',
      textAlign: '',
      textBaseline: '',
    };
  });

  describe('offensive brick types', () => {
    it('should identify falling brick as offensive', () => {
      const brick = new Brick(createBrickConfig(0, 0, BrickType.OFFENSIVE_FALLING));
      expect(brick.isOffensive()).toBe(true);
    });

    it('should identify exploding brick as offensive', () => {
      const brick = new Brick(createBrickConfig(0, 0, BrickType.OFFENSIVE_EXPLODING));
      expect(brick.isOffensive()).toBe(true);
    });

    it('should identify laser brick as offensive', () => {
      const brick = new Brick(createBrickConfig(0, 0, BrickType.OFFENSIVE_LASER));
      expect(brick.isOffensive()).toBe(true);
    });

    it('should identify homing brick as offensive', () => {
      const brick = new Brick(createBrickConfig(0, 0, BrickType.OFFENSIVE_HOMING));
      expect(brick.isOffensive()).toBe(true);
    });

    it('should identify splitting brick as offensive', () => {
      const brick = new Brick(createBrickConfig(0, 0, BrickType.OFFENSIVE_SPLITTING));
      expect(brick.isOffensive()).toBe(true);
    });

    it('should identify bomb brick as offensive', () => {
      const brick = new Brick(createBrickConfig(0, 0, BrickType.OFFENSIVE_BOMB));
      expect(brick.isOffensive()).toBe(true);
    });

    it('should identify dynamite brick as offensive', () => {
      const brick = new Brick(createBrickConfig(0, 0, BrickType.OFFENSIVE_DYNAMITE));
      expect(brick.isOffensive()).toBe(true);
    });

    it('should not identify normal brick as offensive', () => {
      const brick = new Brick(createBrickConfig(0, 0, BrickType.NORMAL));
      expect(brick.isOffensive()).toBe(false);
    });

    it('should not identify healthy brick as offensive', () => {
      const brick = new Brick(createBrickConfig(0, 0, BrickType.HEALTHY));
      expect(brick.isOffensive()).toBe(false);
    });

    it('should not identify boss brick as offensive', () => {
      const brick = new Brick(createBrickConfig(0, 0, BrickType.BOSS_1));
      expect(brick.isOffensive()).toBe(false);
    });
  });

  describe('offensive brick colors', () => {
    it('should use falling brick color', () => {
      const brick = new Brick(createBrickConfig(0, 0, BrickType.OFFENSIVE_FALLING));
      const color = brick.getColor();
      expect(color).toBeTruthy();
      expect(color.startsWith('#')).toBe(true);
    });

    it('should use exploding brick color', () => {
      const brick = new Brick(createBrickConfig(0, 0, BrickType.OFFENSIVE_EXPLODING));
      const color = brick.getColor();
      expect(color).toBeTruthy();
    });

    it('should use laser brick color', () => {
      const brick = new Brick(createBrickConfig(0, 0, BrickType.OFFENSIVE_LASER));
      const color = brick.getColor();
      expect(color).toBeTruthy();
    });

    it('should use homing brick color', () => {
      const brick = new Brick(createBrickConfig(0, 0, BrickType.OFFENSIVE_HOMING));
      const color = brick.getColor();
      expect(color).toBeTruthy();
    });

    it('should use splitting brick color', () => {
      const brick = new Brick(createBrickConfig(0, 0, BrickType.OFFENSIVE_SPLITTING));
      const color = brick.getColor();
      expect(color).toBeTruthy();
    });

    it('should use bomb brick color', () => {
      const brick = new Brick(createBrickConfig(0, 0, BrickType.OFFENSIVE_BOMB));
      const color = brick.getColor();
      expect(color).toBeTruthy();
    });

    it('should use dynamite brick color', () => {
      const brick = new Brick(createBrickConfig(0, 0, BrickType.OFFENSIVE_DYNAMITE));
      const color = brick.getColor();
      expect(color).toBeTruthy();
    });
  });

  describe('boss brick types', () => {
    it('should use boss color for boss 1', () => {
      const brick = new Brick(createBrickConfig(0, 0, BrickType.BOSS_1));
      const color = brick.getColor();
      expect(color).toBeTruthy();
    });

    it('should use boss color for boss 2', () => {
      const brick = new Brick(createBrickConfig(0, 0, BrickType.BOSS_2));
      const color = brick.getColor();
      expect(color).toBeTruthy();
    });

    it('should use boss color for boss 3', () => {
      const brick = new Brick(createBrickConfig(0, 0, BrickType.BOSS_3));
      const color = brick.getColor();
      expect(color).toBeTruthy();
    });

    it('should render BOSS text for boss bricks', () => {
      const brick = new Brick(createBrickConfig(0, 0, BrickType.BOSS_1));
      
      brick.render(mockCtx);
      
      expect(mockCtx.fillText).toHaveBeenCalledWith('BOSS', expect.any(Number), expect.any(Number));
    });
  });

  describe('rendering', () => {
    it('should render normal brick', () => {
      const brick = new Brick(createBrickConfig(0, 0, BrickType.NORMAL));
      
      brick.render(mockCtx);
      
      expect(mockCtx.save).toHaveBeenCalled();
      expect(mockCtx.restore).toHaveBeenCalled();
    });

    it('should render healthy brick with health text', () => {
      const brick = new Brick(createBrickConfig(0, 0, BrickType.HEALTHY));
      
      brick.render(mockCtx);
      
      expect(mockCtx.fillText).toHaveBeenCalledWith('3', expect.any(Number), expect.any(Number));
    });

    it('should render indestructible brick', () => {
      const brick = new Brick(createBrickConfig(0, 0, BrickType.INDESTRUCTIBLE));
      
      brick.render(mockCtx);
      
      // Indestructible bricks render (may use cache)
      expect(mockCtx.save).toHaveBeenCalled();
      expect(mockCtx.restore).toHaveBeenCalled();
    });

    it('should render offensive falling brick', () => {
      const brick = new Brick(createBrickConfig(0, 0, BrickType.OFFENSIVE_FALLING));
      
      brick.render(mockCtx);
      
      expect(mockCtx.save).toHaveBeenCalled();
      expect(mockCtx.restore).toHaveBeenCalled();
    });

    it('should render offensive exploding brick', () => {
      const brick = new Brick(createBrickConfig(0, 0, BrickType.OFFENSIVE_EXPLODING));
      
      brick.render(mockCtx);
      
      expect(mockCtx.save).toHaveBeenCalled();
    });

    it('should render offensive laser brick', () => {
      const brick = new Brick(createBrickConfig(0, 0, BrickType.OFFENSIVE_LASER));
      
      brick.render(mockCtx);
      
      expect(mockCtx.save).toHaveBeenCalled();
    });

    it('should render offensive homing brick', () => {
      const brick = new Brick(createBrickConfig(0, 0, BrickType.OFFENSIVE_HOMING));
      
      brick.render(mockCtx);
      
      expect(mockCtx.save).toHaveBeenCalled();
    });

    it('should render offensive splitting brick', () => {
      const brick = new Brick(createBrickConfig(0, 0, BrickType.OFFENSIVE_SPLITTING));
      
      brick.render(mockCtx);
      
      expect(mockCtx.save).toHaveBeenCalled();
    });

    it('should render offensive bomb brick', () => {
      const brick = new Brick(createBrickConfig(0, 0, BrickType.OFFENSIVE_BOMB));
      
      brick.render(mockCtx);
      
      expect(mockCtx.save).toHaveBeenCalled();
    });

    it('should render offensive dynamite brick', () => {
      const brick = new Brick(createBrickConfig(0, 0, BrickType.OFFENSIVE_DYNAMITE));
      
      brick.render(mockCtx);
      
      expect(mockCtx.save).toHaveBeenCalled();
    });

    it('should use gradient for rendering', () => {
      const brick = new Brick(createBrickConfig(0, 0, BrickType.NORMAL));
      
      brick.render(mockCtx);
      
      expect(mockCtx.createLinearGradient).toHaveBeenCalled();
    });

    it('should render with effects', () => {
      const brick = new Brick(createBrickConfig(0, 0, BrickType.NORMAL));
      
      brick.render(mockCtx);
      
      // Rendering happens (may use cache)
      expect(mockCtx.save).toHaveBeenCalled();
      expect(mockCtx.restore).toHaveBeenCalled();
    });

    it('should render with rounded corners', () => {
      const brick = new Brick(createBrickConfig(0, 0, BrickType.NORMAL));
      
      brick.render(mockCtx);
      
      expect(mockCtx.arcTo).toHaveBeenCalled();
    });

    it('should render fractional health', () => {
      const brick = new Brick(createBrickConfig(0, 0, BrickType.HEALTHY));
      brick.takeDamage(0.5);
      
      brick.render(mockCtx);
      
      expect(mockCtx.fillText).toHaveBeenCalledWith('2.5', expect.any(Number), expect.any(Number));
    });
  });

  describe('destruction callback', () => {
    it('should call callback when destroyed', () => {
      const callback = jest.fn();
      const brick = new Brick(createBrickConfig(0, 0, BrickType.NORMAL));
      brick.setOnDestroyCallback(callback);
      
      brick.takeDamage(1);
      
      expect(callback).toHaveBeenCalled();
    });

    it('should provide destruction info in callback', () => {
      const callback = jest.fn();
      const brick = new Brick(createBrickConfig(0, 0, BrickType.NORMAL));
      brick.setOnDestroyCallback(callback);
      
      brick.takeDamage(1);
      
      expect(callback).toHaveBeenCalledWith(
        brick,
        expect.objectContaining({
          wasDestroyed: false,
          justDestroyed: true,
          centerX: expect.any(Number),
          centerY: expect.any(Number),
        })
      );
    });

    it('should not call callback for partial damage', () => {
      const callback = jest.fn();
      const brick = new Brick(createBrickConfig(0, 0, BrickType.HEALTHY));
      brick.setOnDestroyCallback(callback);
      
      brick.takeDamage(1);
      
      expect(callback).not.toHaveBeenCalled();
    });

    it('should call callback only once', () => {
      const callback = jest.fn();
      const brick = new Brick(createBrickConfig(0, 0, BrickType.NORMAL));
      brick.setOnDestroyCallback(callback);
      
      brick.takeDamage(1);
      brick.takeDamage(1); // Already destroyed
      
      expect(callback).toHaveBeenCalledTimes(1);
    });
  });

  describe('custom colors', () => {
    it('should use custom color when provided', () => {
      const brick = new Brick(createBrickConfig(0, 0, BrickType.NORMAL, '#ff00ff'));
      expect(brick.getColor()).toBe('#ff00ff');
    });

    it('should override default color with custom', () => {
      const brick = new Brick(createBrickConfig(0, 0, BrickType.HEALTHY, '#00ff00'));
      expect(brick.getColor()).toBe('#00ff00');
    });

    it('should use custom color', () => {
      const brick = new Brick(createBrickConfig(0, 0, BrickType.NORMAL, '#ff0000'));
      
      // Verify custom color is set
      expect(brick.getColor()).toBe('#ff0000');
    });
  });

  describe('health with base health parameter', () => {
    it('should use base health multiplier', () => {
      const brick = new Brick(createBrickConfig(0, 0, BrickType.NORMAL), 2);
      expect(brick.getHealth()).toBe(2);
      expect(brick.getMaxHealth()).toBe(2);
    });

    it('should multiply healthy brick health', () => {
      const brick = new Brick(createBrickConfig(0, 0, BrickType.HEALTHY), 2);
      expect(brick.getHealth()).toBe(6); // 3 * 2
      expect(brick.getMaxHealth()).toBe(6);
    });

    it('should handle fractional base health', () => {
      const brick = new Brick(createBrickConfig(0, 0, BrickType.NORMAL), 1.5);
      expect(brick.getHealth()).toBe(1.5);
    });

    it('should not affect indestructible bricks', () => {
      const brick = new Brick(createBrickConfig(0, 0, BrickType.INDESTRUCTIBLE), 10);
      expect(brick.getHealth()).toBe(Infinity);
    });
  });

  describe('edge cases', () => {
    it('should handle zero damage', () => {
      const brick = new Brick(createBrickConfig(0, 0, BrickType.NORMAL));
      brick.takeDamage(0);
      expect(brick.getHealth()).toBe(1);
      expect(brick.isDestroyed()).toBe(false);
    });

    it('should ignore negative damage', () => {
      const brick = new Brick(createBrickConfig(0, 0, BrickType.HEALTHY));
      brick.takeDamage(-1);
      // Negative damage should be ignored
      expect(brick.getHealth()).toBe(3);
    });

    it('should handle excessive damage', () => {
      const brick = new Brick(createBrickConfig(0, 0, BrickType.NORMAL));
      brick.takeDamage(100);
      expect(brick.getHealth()).toBe(0);
      expect(brick.isDestroyed()).toBe(true);
    });

    it('should handle damage to already destroyed brick', () => {
      const brick = new Brick(createBrickConfig(0, 0, BrickType.NORMAL));
      brick.takeDamage(1);
      brick.takeDamage(1);
      expect(brick.getHealth()).toBe(0);
    });

    it('should not render destroyed brick', () => {
      const brick = new Brick(createBrickConfig(0, 0, BrickType.NORMAL));
      brick.takeDamage(1);
      mockCtx.save.mockClear();
      
      brick.render(mockCtx);
      
      expect(mockCtx.save).not.toHaveBeenCalled();
    });
  });

  describe('bounds', () => {
    it('should return correct bounds', () => {
      const brick = new Brick(createBrickConfig(2, 3, BrickType.NORMAL));
      const bounds = brick.getBounds();
      
      expect(bounds).toHaveProperty('x');
      expect(bounds).toHaveProperty('y');
      expect(bounds).toHaveProperty('width');
      expect(bounds).toHaveProperty('height');
    });

    it('should have consistent bounds', () => {
      const brick = new Brick(createBrickConfig(0, 0, BrickType.NORMAL));
      const bounds1 = brick.getBounds();
      const bounds2 = brick.getBounds();
      
      expect(bounds1).toEqual(bounds2);
    });
  });

  describe('type checking', () => {
    it('should return correct type', () => {
      const brick = new Brick(createBrickConfig(0, 0, BrickType.OFFENSIVE_FALLING));
      expect(brick.getType()).toBe(BrickType.OFFENSIVE_FALLING);
    });

    it('should identify boss brick types', () => {
      const boss1 = new Brick(createBrickConfig(0, 0, BrickType.BOSS_1));
      const boss2 = new Brick(createBrickConfig(0, 0, BrickType.BOSS_2));
      const boss3 = new Brick(createBrickConfig(0, 0, BrickType.BOSS_3));
      
      expect(boss1.getType()).toBe(BrickType.BOSS_1);
      expect(boss2.getType()).toBe(BrickType.BOSS_2);
      expect(boss3.getType()).toBe(BrickType.BOSS_3);
    });

    it('should identify indestructible bricks', () => {
      const brick = new Brick(createBrickConfig(0, 0, BrickType.INDESTRUCTIBLE));
      expect(brick.isIndestructible()).toBe(true);
    });

    it('should not identify normal brick as indestructible', () => {
      const brick = new Brick(createBrickConfig(0, 0, BrickType.NORMAL));
      expect(brick.isIndestructible()).toBe(false);
    });
  });
});
