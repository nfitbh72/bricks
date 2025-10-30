/**
 * Wall entity tests
 */

import { Wall } from '../../src/renderer/game/entities/Wall';

describe('Wall', () => {
  let wall: Wall;
  let mockCtx: CanvasRenderingContext2D;

  beforeEach(() => {
    wall = new Wall(0, 0, 100, 800);
    
    // Mock canvas context
    mockCtx = {
      save: jest.fn(),
      restore: jest.fn(),
      fillRect: jest.fn(),
      strokeRect: jest.fn(),
      fillStyle: '',
      strokeStyle: '',
      shadowBlur: 0,
      shadowColor: '',
      globalAlpha: 1,
      lineWidth: 0,
    } as unknown as CanvasRenderingContext2D;
  });

  describe('constructor', () => {
    it('should create a wall with correct dimensions', () => {
      const bounds = wall.getBounds();
      expect(bounds.x).toBe(0);
      expect(bounds.y).toBe(0);
      expect(bounds.width).toBe(100);
      expect(bounds.height).toBe(800);
    });
  });

  describe('getBounds', () => {
    it('should return correct bounds', () => {
      const bounds = wall.getBounds();
      expect(bounds).toEqual({
        x: 0,
        y: 0,
        width: 100,
        height: 800,
      });
    });
  });

  describe('getRightEdge', () => {
    it('should return the right edge position', () => {
      expect(wall.getRightEdge()).toBe(100);
    });

    it('should calculate right edge correctly for different positions', () => {
      const rightWall = new Wall(1700, 0, 100, 800);
      expect(rightWall.getRightEdge()).toBe(1800);
    });
  });

  describe('getLeftEdge', () => {
    it('should return the left edge position', () => {
      expect(wall.getLeftEdge()).toBe(0);
    });

    it('should return correct left edge for different positions', () => {
      const rightWall = new Wall(1700, 0, 100, 800);
      expect(rightWall.getLeftEdge()).toBe(1700);
    });
  });

  describe('render', () => {
    it('should call canvas context methods', () => {
      wall.render(mockCtx);
      
      expect(mockCtx.save).toHaveBeenCalled();
      expect(mockCtx.fillRect).toHaveBeenCalled();
      expect(mockCtx.strokeRect).toHaveBeenCalled();
      expect(mockCtx.restore).toHaveBeenCalled();
    });

    it('should render with correct dimensions', () => {
      wall.render(mockCtx);
      
      // Check fillRect was called with correct dimensions
      expect(mockCtx.fillRect).toHaveBeenCalledWith(0, 0, 100, 800);
      expect(mockCtx.strokeRect).toHaveBeenCalledWith(0, 0, 100, 800);
    });
  });
});
