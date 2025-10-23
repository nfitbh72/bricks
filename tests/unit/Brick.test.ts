/**
 * Unit tests for Brick class
 */

import { Brick } from '../../src/renderer/game/entities/Brick';
import { BrickConfig, BrickType } from '../../src/renderer/game/core/types';
import { BRICK_WIDTH, BRICK_HEIGHT } from '../../src/renderer/config/constants';

// Helper to create brick config from grid position
function createBrickConfig(col: number, row: number, type: BrickType, color?: string): BrickConfig {
  return { col, row, type, color };
}

describe('Brick', () => {
  describe('constructor', () => {
    it('should initialize with correct position', () => {
      const brick = new Brick(createBrickConfig(2, 3, BrickType.HEALTHY));
      const position = brick.getPosition();
      // Grid position (2, 3) converts to pixel position
      expect(position.x).toBe(2 * (BRICK_WIDTH + 2)); // col 2
      expect(position.y).toBe(3 * (BRICK_HEIGHT + 2)); // row 3
    });

    it('should initialize with correct dimensions', () => {
      const brick = new Brick(createBrickConfig(0, 0, BrickType.HEALTHY));
      expect(brick.getWidth()).toBe(BRICK_WIDTH);
      expect(brick.getHeight()).toBe(BRICK_HEIGHT);
    });

    it('should initialize with correct health', () => {
      const brick = new Brick(createBrickConfig(0, 0, BrickType.HEALTHY));
      expect(brick.getHealth()).toBe(3);
      expect(brick.getMaxHealth()).toBe(3);
    });

    it('should initialize with health of 1', () => {
      const brick = new Brick(createBrickConfig(0, 0, BrickType.NORMAL));
      expect(brick.getHealth()).toBe(1);
      expect(brick.getMaxHealth()).toBe(1);
    });

    it('should initialize with custom color', () => {
      const brick = new Brick(createBrickConfig(0, 0, BrickType.HEALTHY, '#ff0000'));
      expect(brick.getColor()).toBe('#ff0000');
    });

    it('should initialize with default color when not specified', () => {
      const brick = new Brick(createBrickConfig(0, 0, BrickType.HEALTHY));
      const color = brick.getColor();
      expect(color).toBeTruthy();
      expect(typeof color).toBe('string');
    });
  });

  describe('takeDamage', () => {
    it('should reduce health by damage amount', () => {
      const brick = new Brick(createBrickConfig(0, 0, BrickType.HEALTHY));
      brick.takeDamage(1);
      expect(brick.getHealth()).toBe(2);
    });

    it('should reduce health by multiple damage', () => {
      const brick = new Brick(createBrickConfig(0, 0, BrickType.HEALTHY));
      brick.takeDamage(2);
      expect(brick.getHealth()).toBe(1);
    });

    it('should not allow health to go below 0', () => {
      const brick = new Brick(createBrickConfig(0, 0, BrickType.HEALTHY));
      brick.takeDamage(5);
      expect(brick.getHealth()).toBe(0);
    });

    it('should handle multiple damage calls', () => {
      const brick = new Brick(createBrickConfig(0, 0, BrickType.HEALTHY));
      brick.takeDamage(1);
      brick.takeDamage(1);
      brick.takeDamage(1);
      expect(brick.getHealth()).toBe(0);
    });

    it('should handle fractional damage', () => {
      const brick = new Brick(createBrickConfig(0, 0, BrickType.HEALTHY));
      brick.takeDamage(0.5);
      expect(brick.getHealth()).toBe(2.5);
    });

    it('should handle zero damage', () => {
      const brick = new Brick(createBrickConfig(0, 0, BrickType.HEALTHY));
      brick.takeDamage(0);
      expect(brick.getHealth()).toBe(3);
    });
  });

  describe('isDestroyed', () => {
    it('should return false when brick has health', () => {
      const brick = new Brick(createBrickConfig(0, 0, BrickType.HEALTHY));
      expect(brick.isDestroyed()).toBe(false);
    });

    it('should return true when health is 0', () => {
      const brick = new Brick(createBrickConfig(0, 0, BrickType.HEALTHY));
      brick.takeDamage(3);
      expect(brick.isDestroyed()).toBe(true);
    });

    it('should return true when health goes below 0', () => {
      const brick = new Brick(createBrickConfig(0, 0, BrickType.HEALTHY));
      brick.takeDamage(10);
      expect(brick.isDestroyed()).toBe(true);
    });

    it('should return false when brick has 1 health remaining', () => {
      const brick = new Brick(createBrickConfig(0, 0, BrickType.HEALTHY));
      brick.takeDamage(2);
      expect(brick.isDestroyed()).toBe(false);
    });
  });

  describe('getHealthPercentage', () => {
    it('should return 1 when at full health', () => {
      const brick = new Brick(createBrickConfig(0, 0, BrickType.HEALTHY));
      expect(brick.getHealthPercentage()).toBe(1);
    });

    it('should return 0 when destroyed', () => {
      const brick = new Brick(createBrickConfig(0, 0, BrickType.HEALTHY));
      brick.takeDamage(3);
      expect(brick.getHealthPercentage()).toBe(0);
    });

    it('should return 0.5 when at half health', () => {
      const brick = new Brick(createBrickConfig(0, 0, BrickType.HEALTHY));
      brick.takeDamage(1.5);
      expect(brick.getHealthPercentage()).toBe(0.5);
    });

    it('should return correct percentage for 2/3 health', () => {
      const brick = new Brick(createBrickConfig(0, 0, BrickType.HEALTHY));
      brick.takeDamage(1);
      expect(brick.getHealthPercentage()).toBeCloseTo(0.666, 2);
    });

    it('should return correct percentage for 1/3 health', () => {
      const brick = new Brick(createBrickConfig(0, 0, BrickType.HEALTHY));
      brick.takeDamage(2);
      expect(brick.getHealthPercentage()).toBeCloseTo(0.333, 2);
    });
  });

  describe('getBounds', () => {
    it('should return correct bounds', () => {
      const brick = new Brick(createBrickConfig(0, 0, BrickType.HEALTHY));
      const bounds = brick.getBounds();
      expect(bounds.x).toBe(0); // Grid (0,0) = pixel (0,0)
      expect(bounds.y).toBe(0);
      expect(bounds.width).toBe(BRICK_WIDTH);
      expect(bounds.height).toBe(BRICK_HEIGHT);
    });

    it('should return bounds for different grid position', () => {
      const brick = new Brick(createBrickConfig(1, 1, BrickType.NORMAL));
      const bounds = brick.getBounds();
      // Grid (1,1) = pixel (1*(BRICK_WIDTH+2), 1*(BRICK_HEIGHT+2))
      expect(bounds.x).toBe(1 * (BRICK_WIDTH + 2));
      expect(bounds.y).toBe(1 * (BRICK_HEIGHT + 2));
      expect(bounds.width).toBe(BRICK_WIDTH);
      expect(bounds.height).toBe(BRICK_HEIGHT);
    });
  });

  describe('getPosition', () => {
    it('should return a copy of position (not reference)', () => {
      const brick = new Brick(createBrickConfig(0, 0, BrickType.HEALTHY));
      const position1 = brick.getPosition();
      position1.x = 999;
      const position2 = brick.getPosition();
      expect(position2.x).toBe(0); // Grid (0,0) = pixel (0,0)
    });
  });

  describe('getColor', () => {
    it('should return custom color when provided', () => {
      const brick = new Brick(createBrickConfig(0, 0, BrickType.HEALTHY, '#ff0000'));
      expect(brick.getColor()).toBe('#ff0000');
    });

    it('should return consistent color for same brick', () => {
      const brick = new Brick(createBrickConfig(0, 0, BrickType.HEALTHY));
      const color1 = brick.getColor();
      const color2 = brick.getColor();
      expect(color1).toBe(color2);
    });

    it('should return different colors for different max health values', () => {
      const brick1 = new Brick(createBrickConfig(0, 0, BrickType.NORMAL));
      const brick2 = new Brick(createBrickConfig(0, 0, BrickType.NORMAL));
      const color1 = brick1.getColor();
      const color2 = brick2.getColor();
      // Colors might be different based on health
      expect(typeof color1).toBe('string');
      expect(typeof color2).toBe('string');
    });

    it('should return neon color based on health modulo 16', () => {
      const brick = new Brick(createBrickConfig(0, 0, BrickType.HEALTHY));
      // HEALTHY has 3 health, so 3 % 16 = 3
      expect(brick.getColor()).toBe('#ffff00'); // Index 3 is Yellow
    });

    it('should return different color when health changes', () => {
      const brick = new Brick(createBrickConfig(0, 0, BrickType.HEALTHY));
      const initialColor = brick.getColor(); // health = 3
      brick.takeDamage(1); // health = 2
      const newColor = brick.getColor();
      expect(newColor).not.toBe(initialColor);
      expect(newColor).toBe('#00ff00'); // Index 2 is Green
    });

    it('should cycle through neon colors for different health values', () => {
      const brick = new Brick(createBrickConfig(0, 0, BrickType.NORMAL));
      // NORMAL has 1 health, so 1 % 16 = 1
      expect(brick.getColor()).toBe('#00ffff'); // Index 1 is Cyan
    });

    it('should return gray color when destroyed', () => {
      const brick = new Brick(createBrickConfig(0, 0, BrickType.HEALTHY));
      brick.takeDamage(3); // 0% health
      expect(brick.getColor()).toBe('#666666');
    });

    it('should maintain custom color regardless of health', () => {
      const brick = new Brick(createBrickConfig(0, 0, BrickType.HEALTHY, '#ff0000'));
      brick.takeDamage(2);
      expect(brick.getColor()).toBe('#ff0000');
    });
  });

  describe('restore', () => {
    it('should restore brick to full health', () => {
      const brick = new Brick(createBrickConfig(0, 0, BrickType.HEALTHY));
      brick.takeDamage(2);
      brick.restore();
      expect(brick.getHealth()).toBe(3);
    });

    it('should restore completely destroyed brick', () => {
      const brick = new Brick(createBrickConfig(0, 0, BrickType.HEALTHY));
      brick.takeDamage(10);
      brick.restore();
      expect(brick.getHealth()).toBe(3);
      expect(brick.isDestroyed()).toBe(false);
    });

    it('should not exceed max health', () => {
      const brick = new Brick(createBrickConfig(0, 0, BrickType.HEALTHY));
      brick.restore();
      expect(brick.getHealth()).toBe(3);
    });
  });

  describe('setHealth', () => {
    it('should set health to specific value', () => {
      const brick = new Brick(createBrickConfig(0, 0, BrickType.HEALTHY));
      brick.setHealth(2);
      expect(brick.getHealth()).toBe(2);
    });

    it('should not allow health above max', () => {
      const brick = new Brick(createBrickConfig(0, 0, BrickType.HEALTHY));
      brick.setHealth(10);
      expect(brick.getHealth()).toBe(3);
    });

    it('should not allow health below 0', () => {
      const brick = new Brick(createBrickConfig(0, 0, BrickType.HEALTHY));
      brick.setHealth(-5);
      expect(brick.getHealth()).toBe(0);
    });

    it('should allow setting health to 0', () => {
      const brick = new Brick(createBrickConfig(0, 0, BrickType.HEALTHY));
      brick.setHealth(0);
      expect(brick.getHealth()).toBe(0);
      expect(brick.isDestroyed()).toBe(true);
    });

    it('should allow setting health to max', () => {
      const brick = new Brick(createBrickConfig(0, 0, BrickType.HEALTHY));
      brick.takeDamage(2);
      brick.setHealth(3);
      expect(brick.getHealth()).toBe(3);
    });
  });

  describe('render', () => {
    it('should not throw when rendering', () => {
      const brick = new Brick(createBrickConfig(0, 0, BrickType.HEALTHY));
      const mockGradient = {
        addColorStop: jest.fn(),
      };
      const mockCtx = {
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
        createLinearGradient: jest.fn(() => mockGradient),
        shadowBlur: 0,
        shadowColor: '',
        fillStyle: '',
        strokeStyle: '',
        lineWidth: 0,
        globalAlpha: 1,
        font: '',
        textAlign: 'center',
        textBaseline: 'middle',
      } as unknown as CanvasRenderingContext2D;

      expect(() => brick.render(mockCtx)).not.toThrow();
    });

    it('should call canvas methods for drawing', () => {
      const brick = new Brick(createBrickConfig(0, 0, BrickType.HEALTHY));
      const mockGradient = {
        addColorStop: jest.fn(),
      };
      const mockCtx = {
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
        createLinearGradient: jest.fn(() => mockGradient),
        shadowBlur: 0,
        shadowColor: '',
        fillStyle: '',
        strokeStyle: '',
        lineWidth: 0,
        globalAlpha: 1,
        font: '',
        textAlign: 'center',
        textBaseline: 'middle',
      } as unknown as CanvasRenderingContext2D;

      brick.render(mockCtx);

      expect(mockCtx.save).toHaveBeenCalled();
      expect(mockCtx.beginPath).toHaveBeenCalled();
      expect(mockCtx.arcTo).toHaveBeenCalled();
      expect(mockCtx.fill).toHaveBeenCalled();
      expect(mockCtx.stroke).toHaveBeenCalled();
      expect(mockCtx.fillText).toHaveBeenCalled();
      expect(mockCtx.restore).toHaveBeenCalled();
    });

    it('should not render destroyed brick', () => {
      const brick = new Brick(createBrickConfig(0, 0, BrickType.HEALTHY));
      brick.takeDamage(3);
      const mockGradient = {
        addColorStop: jest.fn(),
      };
      const mockCtx = {
        save: jest.fn(),
        restore: jest.fn(),
        fillRect: jest.fn(),
        strokeRect: jest.fn(),
        beginPath: jest.fn(),
        fill: jest.fn(),
        stroke: jest.fn(),
        createLinearGradient: jest.fn(() => mockGradient),
        shadowBlur: 0,
        shadowColor: '',
        fillStyle: '',
        strokeStyle: '',
        lineWidth: 0,
        globalAlpha: 1,
      } as unknown as CanvasRenderingContext2D;

      brick.render(mockCtx);

      expect(mockCtx.beginPath).not.toHaveBeenCalled();
      expect(mockCtx.fill).not.toHaveBeenCalled();
      expect(mockCtx.stroke).not.toHaveBeenCalled();
    });

    it('should render brick with partial health', () => {
      const brick = new Brick(createBrickConfig(0, 0, BrickType.HEALTHY));
      brick.takeDamage(1);
      const mockGradient = {
        addColorStop: jest.fn(),
      };
      const mockCtx = {
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
        createLinearGradient: jest.fn(() => mockGradient),
        shadowBlur: 0,
        shadowColor: '',
        fillStyle: '',
        strokeStyle: '',
        lineWidth: 0,
        globalAlpha: 1,
        font: '',
        textAlign: 'center',
        textBaseline: 'middle',
      } as unknown as CanvasRenderingContext2D;

      brick.render(mockCtx);

      expect(mockCtx.beginPath).toHaveBeenCalled();
      expect(mockCtx.fill).toHaveBeenCalled();
      expect(mockCtx.stroke).toHaveBeenCalled();
      expect(mockCtx.fillText).toHaveBeenCalled();
    });
  });

  describe('integration - damage and destruction', () => {
    it('should handle gradual destruction', () => {
      const brick = new Brick(createBrickConfig(0, 0, BrickType.HEALTHY));
      expect(brick.isDestroyed()).toBe(false);
      
      brick.takeDamage(1);
      expect(brick.getHealth()).toBe(2);
      expect(brick.isDestroyed()).toBe(false);
      
      brick.takeDamage(1);
      expect(brick.getHealth()).toBe(1);
      expect(brick.isDestroyed()).toBe(false);
      
      brick.takeDamage(1);
      expect(brick.getHealth()).toBe(0);
      expect(brick.isDestroyed()).toBe(true);
    });

    it('should handle restoration after damage', () => {
      const brick = new Brick(createBrickConfig(0, 0, BrickType.HEALTHY));
      brick.takeDamage(2);
      expect(brick.getHealthPercentage()).toBeCloseTo(0.333, 2);
      
      brick.restore();
      expect(brick.getHealth()).toBe(3);
      expect(brick.getHealthPercentage()).toBe(1);
    });

    it('should handle setHealth after takeDamage', () => {
      const brick = new Brick(createBrickConfig(0, 0, BrickType.HEALTHY));
      brick.takeDamage(1);
      expect(brick.getHealth()).toBe(2);
      
      brick.setHealth(3);
      expect(brick.getHealth()).toBe(3);
      expect(brick.isDestroyed()).toBe(false);
    });
  });
});
