import { DynamiteStick } from '../../src/renderer/game/entities/offensive/DynamiteStick';
import { Brick } from '../../src/renderer/game/entities/Brick';
import { BrickType } from '../../src/renderer/game/core/types';
import {
  DYNAMITE_STICK_FUSE_TIME,
  DYNAMITE_STICK_WIDTH,
  DYNAMITE_STICK_HEIGHT,
} from '../../src/renderer/config/constants';

describe('DynamiteStick', () => {
  describe('constructor', () => {
    it('should initialize with correct position (centered on brick)', () => {
      const dynamite = new DynamiteStick(100, 200, '#ff0000');
      const position = dynamite.getPosition();
      // Should be centered: 100 + (104 - 12) / 2 = 100 + 46 = 146
      expect(position.x).toBe(146);
      expect(position.y).toBe(200);
    });

    it('should initialize with correct color', () => {
      const dynamite = new DynamiteStick(100, 200, '#ff0000');
      expect(dynamite.getColor()).toBe('#ff0000');
    });

    it('should initialize as active', () => {
      const dynamite = new DynamiteStick(100, 200, '#ff0000');
      expect(dynamite.isActive()).toBe(true);
    });

    it('should initialize as not exploded', () => {
      const dynamite = new DynamiteStick(100, 200, '#ff0000');
      expect(dynamite.hasExploded()).toBe(false);
    });
  });

  describe('update', () => {
    it('should drift slowly in random direction', () => {
      const dynamite = new DynamiteStick(100, 200, '#ff0000');
      const initialPos = dynamite.getPosition();
      
      dynamite.update(1); // 1 second
      
      const finalPos = dynamite.getPosition();
      // Should have moved due to drift
      const distance = Math.sqrt(
        Math.pow(finalPos.x - initialPos.x, 2) + 
        Math.pow(finalPos.y - initialPos.y, 2)
      );
      expect(distance).toBeGreaterThan(0);
    });

    it('should explode after fuse time', () => {
      const dynamite = new DynamiteStick(100, 200, '#ff0000');
      
      expect(dynamite.hasExploded()).toBe(false);
      
      dynamite.update(DYNAMITE_STICK_FUSE_TIME + 0.1);
      
      expect(dynamite.hasExploded()).toBe(true);
    });

    it('should not update when inactive', () => {
      const dynamite = new DynamiteStick(100, 200, '#ff0000');
      dynamite.deactivate();
      
      const initialPos = dynamite.getPosition();
      dynamite.update(1);
      const finalPos = dynamite.getPosition();
      
      expect(finalPos).toEqual(initialPos);
    });
  });

  describe('getBounds', () => {
    it('should return correct bounds when active and not exploded', () => {
      const dynamite = new DynamiteStick(100, 200, '#ff0000');
      const bounds = dynamite.getBounds();
      
      expect(bounds).not.toBeNull();
      expect(bounds?.x).toBe(146); // Centered position
      expect(bounds?.y).toBe(200);
      expect(bounds?.width).toBe(DYNAMITE_STICK_WIDTH);
      expect(bounds?.height).toBe(DYNAMITE_STICK_HEIGHT);
    });

    it('should return null when inactive', () => {
      const dynamite = new DynamiteStick(100, 200, '#ff0000');
      dynamite.deactivate();
      
      expect(dynamite.getBounds()).toBeNull();
    });

    it('should return null when exploded', () => {
      const dynamite = new DynamiteStick(100, 200, '#ff0000');
      dynamite.update(DYNAMITE_STICK_FUSE_TIME + 0.1);
      
      expect(dynamite.getBounds()).toBeNull();
    });
  });

  describe('getExplosionResult', () => {
    it('should return null when not exploded', () => {
      const dynamite = new DynamiteStick(100, 200, '#ff0000');
      const bricks: Brick[] = [];
      
      expect(dynamite.getExplosionResult(bricks)).toBeNull();
    });

    it('should return explosion result with bricks in radius when exploded', () => {
      const dynamite = new DynamiteStick(100, 200, '#ff0000');
      
      // Create bricks at various distances
      const closeBrick = new Brick({ col: 0, row: 0, type: BrickType.NORMAL }, 1);
      const farBrick = new Brick({ col: 10, row: 10, type: BrickType.NORMAL }, 1);
      
      dynamite.update(DYNAMITE_STICK_FUSE_TIME + 0.1);
      
      const result = dynamite.getExplosionResult([closeBrick, farBrick]);
      
      expect(result).not.toBeNull();
      expect(result?.exploded).toBe(true);
      expect(result?.centerX).toBeDefined();
      expect(result?.centerY).toBeDefined();
      expect(result?.radius).toBeDefined();
      expect(Array.isArray(result?.bricksToDamage)).toBe(true);
    });

    it('should not include indestructible bricks in damage list', () => {
      const dynamite = new DynamiteStick(100, 200, '#ff0000');
      
      const indestructibleBrick = new Brick({ col: 0, row: 0, type: BrickType.INDESTRUCTIBLE }, 1);
      
      dynamite.update(DYNAMITE_STICK_FUSE_TIME + 0.1);
      
      const result = dynamite.getExplosionResult([indestructibleBrick]);
      
      expect(result?.bricksToDamage).not.toContain(indestructibleBrick);
    });
  });

  describe('deactivate', () => {
    it('should set active to false', () => {
      const dynamite = new DynamiteStick(100, 200, '#ff0000');
      
      expect(dynamite.isActive()).toBe(true);
      dynamite.deactivate();
      expect(dynamite.isActive()).toBe(false);
    });
  });

  describe('isOffScreen', () => {
    it('should return false when on screen', () => {
      const dynamite = new DynamiteStick(100, 200, '#ff0000');
      expect(dynamite.isOffScreen(600)).toBe(false);
    });

    it('should return true when below screen', () => {
      const dynamite = new DynamiteStick(100, 700, '#ff0000');
      expect(dynamite.isOffScreen(600)).toBe(true);
    });
  });

  describe('render', () => {
    it('should not throw when rendering', () => {
      const dynamite = new DynamiteStick(100, 200, '#ff0000');
      const mockCtx = {
        save: jest.fn(),
        restore: jest.fn(),
        translate: jest.fn(),
        rotate: jest.fn(),
        beginPath: jest.fn(),
        moveTo: jest.fn(),
        lineTo: jest.fn(),
        arcTo: jest.fn(),
        closePath: jest.fn(),
        fill: jest.fn(),
        stroke: jest.fn(),
        arc: jest.fn(),
      } as unknown as CanvasRenderingContext2D;

      expect(() => dynamite.render(mockCtx)).not.toThrow();
    });

    it('should not render when inactive', () => {
      const dynamite = new DynamiteStick(100, 200, '#ff0000');
      dynamite.deactivate();
      
      const mockCtx = {
        save: jest.fn(),
        restore: jest.fn(),
      } as unknown as CanvasRenderingContext2D;

      dynamite.render(mockCtx);
      
      expect(mockCtx.save).not.toHaveBeenCalled();
    });
  });
});
