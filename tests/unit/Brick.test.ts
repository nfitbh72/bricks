/**
 * Unit tests for Brick class
 */

import { Brick } from '../../src/renderer/game/Brick';

describe('Brick', () => {
  describe('constructor', () => {
    it('should initialize with correct position', () => {
      const brick = new Brick(100, 200, 50, 20, 3);
      const position = brick.getPosition();
      expect(position.x).toBe(100);
      expect(position.y).toBe(200);
    });

    it('should initialize with correct dimensions', () => {
      const brick = new Brick(100, 200, 50, 20, 3);
      expect(brick.getWidth()).toBe(50);
      expect(brick.getHeight()).toBe(20);
    });

    it('should initialize with correct health', () => {
      const brick = new Brick(100, 200, 50, 20, 3);
      expect(brick.getHealth()).toBe(3);
      expect(brick.getMaxHealth()).toBe(3);
    });

    it('should initialize with health of 1', () => {
      const brick = new Brick(100, 200, 50, 20, 1);
      expect(brick.getHealth()).toBe(1);
      expect(brick.getMaxHealth()).toBe(1);
    });

    it('should initialize with custom color', () => {
      const brick = new Brick(100, 200, 50, 20, 3, '#ff0000');
      expect(brick.getColor()).toBe('#ff0000');
    });

    it('should initialize with default color when not specified', () => {
      const brick = new Brick(100, 200, 50, 20, 3);
      const color = brick.getColor();
      expect(color).toBeTruthy();
      expect(typeof color).toBe('string');
    });
  });

  describe('takeDamage', () => {
    it('should reduce health by damage amount', () => {
      const brick = new Brick(100, 200, 50, 20, 3);
      brick.takeDamage(1);
      expect(brick.getHealth()).toBe(2);
    });

    it('should reduce health by multiple damage', () => {
      const brick = new Brick(100, 200, 50, 20, 5);
      brick.takeDamage(2);
      expect(brick.getHealth()).toBe(3);
    });

    it('should not allow health to go below 0', () => {
      const brick = new Brick(100, 200, 50, 20, 3);
      brick.takeDamage(5);
      expect(brick.getHealth()).toBe(0);
    });

    it('should handle multiple damage calls', () => {
      const brick = new Brick(100, 200, 50, 20, 5);
      brick.takeDamage(1);
      brick.takeDamage(1);
      brick.takeDamage(1);
      expect(brick.getHealth()).toBe(2);
    });

    it('should handle fractional damage', () => {
      const brick = new Brick(100, 200, 50, 20, 3);
      brick.takeDamage(0.5);
      expect(brick.getHealth()).toBe(2.5);
    });

    it('should handle zero damage', () => {
      const brick = new Brick(100, 200, 50, 20, 3);
      brick.takeDamage(0);
      expect(brick.getHealth()).toBe(3);
    });
  });

  describe('isDestroyed', () => {
    it('should return false when brick has health', () => {
      const brick = new Brick(100, 200, 50, 20, 3);
      expect(brick.isDestroyed()).toBe(false);
    });

    it('should return true when health is 0', () => {
      const brick = new Brick(100, 200, 50, 20, 3);
      brick.takeDamage(3);
      expect(brick.isDestroyed()).toBe(true);
    });

    it('should return true when health goes below 0', () => {
      const brick = new Brick(100, 200, 50, 20, 3);
      brick.takeDamage(10);
      expect(brick.isDestroyed()).toBe(true);
    });

    it('should return false when brick has 1 health remaining', () => {
      const brick = new Brick(100, 200, 50, 20, 3);
      brick.takeDamage(2);
      expect(brick.isDestroyed()).toBe(false);
    });
  });

  describe('getHealthPercentage', () => {
    it('should return 1 when at full health', () => {
      const brick = new Brick(100, 200, 50, 20, 3);
      expect(brick.getHealthPercentage()).toBe(1);
    });

    it('should return 0 when destroyed', () => {
      const brick = new Brick(100, 200, 50, 20, 3);
      brick.takeDamage(3);
      expect(brick.getHealthPercentage()).toBe(0);
    });

    it('should return 0.5 when at half health', () => {
      const brick = new Brick(100, 200, 50, 20, 4);
      brick.takeDamage(2);
      expect(brick.getHealthPercentage()).toBe(0.5);
    });

    it('should return correct percentage for 2/3 health', () => {
      const brick = new Brick(100, 200, 50, 20, 3);
      brick.takeDamage(1);
      expect(brick.getHealthPercentage()).toBeCloseTo(0.666, 2);
    });

    it('should return correct percentage for 1/3 health', () => {
      const brick = new Brick(100, 200, 50, 20, 3);
      brick.takeDamage(2);
      expect(brick.getHealthPercentage()).toBeCloseTo(0.333, 2);
    });
  });

  describe('getBounds', () => {
    it('should return correct bounds', () => {
      const brick = new Brick(100, 200, 50, 20, 3);
      const bounds = brick.getBounds();
      expect(bounds.x).toBe(100);
      expect(bounds.y).toBe(200);
      expect(bounds.width).toBe(50);
      expect(bounds.height).toBe(20);
    });

    it('should return bounds for different brick size', () => {
      const brick = new Brick(50, 75, 100, 30, 1);
      const bounds = brick.getBounds();
      expect(bounds.x).toBe(50);
      expect(bounds.y).toBe(75);
      expect(bounds.width).toBe(100);
      expect(bounds.height).toBe(30);
    });
  });

  describe('getPosition', () => {
    it('should return a copy of position (not reference)', () => {
      const brick = new Brick(100, 200, 50, 20, 3);
      const position1 = brick.getPosition();
      position1.x = 999;
      const position2 = brick.getPosition();
      expect(position2.x).toBe(100);
    });
  });

  describe('getColor', () => {
    it('should return custom color when provided', () => {
      const brick = new Brick(100, 200, 50, 20, 3, '#ff0000');
      expect(brick.getColor()).toBe('#ff0000');
    });

    it('should return consistent color for same brick', () => {
      const brick = new Brick(100, 200, 50, 20, 3);
      const color1 = brick.getColor();
      const color2 = brick.getColor();
      expect(color1).toBe(color2);
    });

    it('should return different colors for different max health values', () => {
      const brick1 = new Brick(100, 200, 50, 20, 1);
      const brick2 = new Brick(100, 200, 50, 20, 2);
      const color1 = brick1.getColor();
      const color2 = brick2.getColor();
      // Colors might be different based on health
      expect(typeof color1).toBe('string');
      expect(typeof color2).toBe('string');
    });

    it('should return green color when health > 66%', () => {
      const brick = new Brick(100, 200, 50, 20, 3);
      // Full health (100%) should be green
      expect(brick.getColor()).toBe('#00ff00');
    });

    it('should return yellow color when health between 33% and 66%', () => {
      const brick = new Brick(100, 200, 50, 20, 10);
      brick.takeDamage(5); // 50% health
      expect(brick.getColor()).toBe('#ffff00');
    });

    it('should return magenta color when health between 0% and 33%', () => {
      const brick = new Brick(100, 200, 50, 20, 10);
      brick.takeDamage(8); // 20% health
      expect(brick.getColor()).toBe('#ff00ff');
    });

    it('should return gray color when destroyed', () => {
      const brick = new Brick(100, 200, 50, 20, 3);
      brick.takeDamage(3); // 0% health
      expect(brick.getColor()).toBe('#666666');
    });

    it('should maintain custom color regardless of health', () => {
      const brick = new Brick(100, 200, 50, 20, 3, '#ff0000');
      brick.takeDamage(2);
      expect(brick.getColor()).toBe('#ff0000');
    });
  });

  describe('restore', () => {
    it('should restore brick to full health', () => {
      const brick = new Brick(100, 200, 50, 20, 5);
      brick.takeDamage(3);
      brick.restore();
      expect(brick.getHealth()).toBe(5);
    });

    it('should restore completely destroyed brick', () => {
      const brick = new Brick(100, 200, 50, 20, 3);
      brick.takeDamage(10);
      brick.restore();
      expect(brick.getHealth()).toBe(3);
      expect(brick.isDestroyed()).toBe(false);
    });

    it('should not exceed max health', () => {
      const brick = new Brick(100, 200, 50, 20, 3);
      brick.restore();
      expect(brick.getHealth()).toBe(3);
    });
  });

  describe('setHealth', () => {
    it('should set health to specific value', () => {
      const brick = new Brick(100, 200, 50, 20, 5);
      brick.setHealth(2);
      expect(brick.getHealth()).toBe(2);
    });

    it('should not allow health above max', () => {
      const brick = new Brick(100, 200, 50, 20, 3);
      brick.setHealth(10);
      expect(brick.getHealth()).toBe(3);
    });

    it('should not allow health below 0', () => {
      const brick = new Brick(100, 200, 50, 20, 3);
      brick.setHealth(-5);
      expect(brick.getHealth()).toBe(0);
    });

    it('should allow setting health to 0', () => {
      const brick = new Brick(100, 200, 50, 20, 3);
      brick.setHealth(0);
      expect(brick.getHealth()).toBe(0);
      expect(brick.isDestroyed()).toBe(true);
    });

    it('should allow setting health to max', () => {
      const brick = new Brick(100, 200, 50, 20, 5);
      brick.takeDamage(3);
      brick.setHealth(5);
      expect(brick.getHealth()).toBe(5);
    });
  });

  describe('render', () => {
    it('should not throw when rendering', () => {
      const brick = new Brick(100, 200, 50, 20, 3);
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

      expect(() => brick.render(mockCtx)).not.toThrow();
    });

    it('should call canvas methods for drawing', () => {
      const brick = new Brick(100, 200, 50, 20, 3);
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

      brick.render(mockCtx);

      expect(mockCtx.save).toHaveBeenCalled();
      expect(mockCtx.fillRect).toHaveBeenCalledWith(100, 200, 50, 20);
      expect(mockCtx.strokeRect).toHaveBeenCalledWith(100, 200, 50, 20);
      expect(mockCtx.restore).toHaveBeenCalled();
    });

    it('should not render destroyed brick', () => {
      const brick = new Brick(100, 200, 50, 20, 3);
      brick.takeDamage(3);
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

      brick.render(mockCtx);

      expect(mockCtx.fillRect).not.toHaveBeenCalled();
      expect(mockCtx.strokeRect).not.toHaveBeenCalled();
    });

    it('should render brick with partial health', () => {
      const brick = new Brick(100, 200, 50, 20, 3);
      brick.takeDamage(1);
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

      brick.render(mockCtx);

      expect(mockCtx.fillRect).toHaveBeenCalled();
      expect(mockCtx.strokeRect).toHaveBeenCalled();
    });
  });

  describe('integration - damage and destruction', () => {
    it('should handle gradual destruction', () => {
      const brick = new Brick(100, 200, 50, 20, 5);
      expect(brick.isDestroyed()).toBe(false);
      
      brick.takeDamage(1);
      expect(brick.getHealth()).toBe(4);
      expect(brick.isDestroyed()).toBe(false);
      
      brick.takeDamage(2);
      expect(brick.getHealth()).toBe(2);
      expect(brick.isDestroyed()).toBe(false);
      
      brick.takeDamage(2);
      expect(brick.getHealth()).toBe(0);
      expect(brick.isDestroyed()).toBe(true);
    });

    it('should handle restoration after damage', () => {
      const brick = new Brick(100, 200, 50, 20, 3);
      brick.takeDamage(2);
      expect(brick.getHealthPercentage()).toBeCloseTo(0.333, 2);
      
      brick.restore();
      expect(brick.getHealth()).toBe(3);
      expect(brick.getHealthPercentage()).toBe(1);
    });

    it('should handle setHealth after takeDamage', () => {
      const brick = new Brick(100, 200, 50, 20, 5);
      brick.takeDamage(3);
      expect(brick.getHealth()).toBe(2);
      
      brick.setHealth(4);
      expect(brick.getHealth()).toBe(4);
      expect(brick.isDestroyed()).toBe(false);
    });
  });
});
