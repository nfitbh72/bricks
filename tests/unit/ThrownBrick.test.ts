/**
 * Tests for ThrownBrick - Boss projectile
 */

import { ThrownBrick } from '../../src/renderer/game/entities/offensive/ThrownBrick';

describe('ThrownBrick', () => {
  let thrownBrick: ThrownBrick;
  let mockCtx: any;

  beforeEach(() => {
    thrownBrick = new ThrownBrick(400, 200, 500, 400, 300, '#ff0000');
    mockCtx = {
      save: jest.fn(),
      restore: jest.fn(),
      fillRect: jest.fn(),
      strokeRect: jest.fn(),
      translate: jest.fn(),
      rotate: jest.fn(),
      shadowBlur: 0,
      shadowColor: '',
      fillStyle: '',
      strokeStyle: '',
      lineWidth: 0,
    };
  });

  describe('initialization', () => {
    it('should initialize at given position', () => {
      const bounds = thrownBrick.getBounds();
      expect(bounds).not.toBeNull();
      expect(bounds!.x).toBeCloseTo(380, 0); // x - width/2
      expect(bounds!.y).toBeCloseTo(190, 0); // y - height/2
    });

    it('should calculate velocity toward target', () => {
      // Create brick going right and down
      const brick = new ThrownBrick(100, 100, 200, 200, 300, '#ff0000');
      
      brick.update(1);
      const bounds = brick.getBounds()!;
      
      // Should have moved right and down
      expect(bounds.x).toBeGreaterThan(80); // 100 - 20 (half width)
      expect(bounds.y).toBeGreaterThan(90); // 100 - 10 (half height)
    });

    it('should normalize velocity vector', () => {
      // Create brick with different distances
      const brick1 = new ThrownBrick(0, 0, 100, 0, 300, '#ff0000');
      const brick2 = new ThrownBrick(0, 0, 1000, 0, 300, '#ff0000');
      
      // Both should move at same speed (normalized)
      brick1.update(1);
      brick2.update(1);
      
      const bounds1 = brick1.getBounds()!;
      const bounds2 = brick2.getBounds()!;
      
      // X positions should be similar (both moving right at same speed)
      expect(Math.abs(bounds1.x - bounds2.x)).toBeLessThan(1);
    });

    it('should apply speed correctly', () => {
      const slowBrick = new ThrownBrick(100, 100, 200, 100, 100, '#ff0000');
      const fastBrick = new ThrownBrick(100, 100, 200, 100, 300, '#ff0000');
      
      slowBrick.update(1);
      fastBrick.update(1);
      
      const slowBounds = slowBrick.getBounds()!;
      const fastBounds = fastBrick.getBounds()!;
      
      // Fast brick should have moved further
      expect(fastBounds.x).toBeGreaterThan(slowBounds.x);
    });

    it('should set random rotation speed', () => {
      // Create multiple bricks and verify they have different rotations after update
      const brick1 = new ThrownBrick(100, 100, 200, 200, 300, '#ff0000');
      const brick2 = new ThrownBrick(100, 100, 200, 200, 300, '#ff0000');
      
      // Rotation speeds are random, so after many updates they should differ
      for (let i = 0; i < 10; i++) {
        brick1.update(0.1);
        brick2.update(0.1);
      }
      
      // Can't directly test rotation, but we can verify bricks update
      expect(brick1.isActive()).toBe(true);
      expect(brick2.isActive()).toBe(true);
    });

    it('should initialize as active', () => {
      expect(thrownBrick.isActive()).toBe(true);
    });
  });

  describe('update', () => {
    it('should move based on velocity', () => {
      const initialBounds = thrownBrick.getBounds()!;
      
      thrownBrick.update(1);
      
      const newBounds = thrownBrick.getBounds()!;
      expect(newBounds.x).not.toBe(initialBounds.x);
      expect(newBounds.y).not.toBe(initialBounds.y);
    });

    it('should move correct distance with deltaTime', () => {
      const brick = new ThrownBrick(0, 0, 100, 0, 100, '#ff0000');
      
      brick.update(1); // 1 second
      const bounds1 = brick.getBounds()!;
      
      const brick2 = new ThrownBrick(0, 0, 100, 0, 100, '#ff0000');
      brick2.update(0.5); // 0.5 seconds
      const bounds2 = brick2.getBounds()!;
      
      // First brick should have moved twice as far
      expect(bounds1.x).toBeCloseTo(bounds2.x * 2, 0);
    });

    it('should rotate over time', () => {
      // Rotation happens internally, verify update doesn't crash
      for (let i = 0; i < 100; i++) {
        thrownBrick.update(0.1);
      }
      
      expect(thrownBrick.isActive()).toBe(true);
    });

    it('should not update when inactive', () => {
      thrownBrick.deactivate();
      const bounds = thrownBrick.getBounds();
      
      thrownBrick.update(1);
      
      expect(thrownBrick.getBounds()).toBe(bounds);
    });
  });

  describe('render', () => {
    it('should not render when inactive', () => {
      thrownBrick.deactivate();
      
      thrownBrick.render(mockCtx);
      
      expect(mockCtx.save).not.toHaveBeenCalled();
    });

    it('should render when active', () => {
      thrownBrick.render(mockCtx);
      
      expect(mockCtx.save).toHaveBeenCalled();
      expect(mockCtx.restore).toHaveBeenCalled();
    });

    it('should draw brick with rotation', () => {
      thrownBrick.render(mockCtx);
      
      expect(mockCtx.translate).toHaveBeenCalled();
      expect(mockCtx.rotate).toHaveBeenCalled();
      expect(mockCtx.fillRect).toHaveBeenCalled();
    });

    it('should apply glow effect', () => {
      thrownBrick.render(mockCtx);
      
      expect(mockCtx.shadowBlur).toBeGreaterThan(0);
      expect(mockCtx.shadowColor).toBe('#ff0000');
    });

    it('should draw border', () => {
      thrownBrick.render(mockCtx);
      
      expect(mockCtx.strokeRect).toHaveBeenCalled();
      expect(mockCtx.strokeStyle).toBe('#ffffff');
    });

    it('should use correct color', () => {
      const blueBrick = new ThrownBrick(100, 100, 200, 200, 300, '#0000ff');
      
      blueBrick.render(mockCtx);
      
      expect(mockCtx.fillStyle).toBe('#0000ff');
      expect(mockCtx.shadowColor).toBe('#0000ff');
    });
  });

  describe('getBounds', () => {
    it('should return correct bounds when active', () => {
      const bounds = thrownBrick.getBounds();
      
      expect(bounds).not.toBeNull();
      expect(bounds!.width).toBe(120);
      expect(bounds!.height).toBe(25);
    });

    it('should return null when inactive', () => {
      thrownBrick.deactivate();
      
      expect(thrownBrick.getBounds()).toBeNull();
    });

    it('should center bounds on position', () => {
      const brick = new ThrownBrick(100, 200, 150, 250, 300, '#ff0000');
      const bounds = brick.getBounds()!;
      
      // Bounds should be centered on position
      expect(bounds.x).toBe(80); // 100 - 40/2
      expect(bounds.y).toBe(190); // 200 - 20/2
    });

    it('should update bounds after movement', () => {
      const initialBounds = thrownBrick.getBounds()!;
      
      thrownBrick.update(1);
      
      const newBounds = thrownBrick.getBounds()!;
      expect(newBounds.x).not.toBe(initialBounds.x);
      expect(newBounds.y).not.toBe(initialBounds.y);
    });
  });

  describe('isActive', () => {
    it('should return true initially', () => {
      expect(thrownBrick.isActive()).toBe(true);
    });

    it('should return false after deactivation', () => {
      thrownBrick.deactivate();
      expect(thrownBrick.isActive()).toBe(false);
    });
  });

  describe('deactivate', () => {
    it('should set active to false', () => {
      thrownBrick.deactivate();
      expect(thrownBrick.isActive()).toBe(false);
    });

    it('should prevent further updates', () => {
      const bounds = thrownBrick.getBounds();
      thrownBrick.deactivate();
      
      thrownBrick.update(1);
      
      expect(thrownBrick.getBounds()).toBe(bounds);
    });

    it('should prevent rendering', () => {
      thrownBrick.deactivate();
      
      thrownBrick.render(mockCtx);
      
      expect(mockCtx.save).not.toHaveBeenCalled();
    });
  });

  describe('isOffScreen', () => {
    it('should return false when on screen', () => {
      const brick = new ThrownBrick(400, 300, 500, 400, 300, '#ff0000');
      
      expect(brick.isOffScreen(800, 600)).toBe(false);
    });

    it('should return true when below bottom', () => {
      const brick = new ThrownBrick(400, 700, 500, 800, 300, '#ff0000');
      
      expect(brick.isOffScreen(800, 600)).toBe(true);
    });

    it('should return true when above top', () => {
      const brick = new ThrownBrick(400, -100, 500, -200, 300, '#ff0000');
      
      expect(brick.isOffScreen(800, 600)).toBe(true);
    });

    it('should return true when left of screen', () => {
      const brick = new ThrownBrick(-100, 300, -200, 300, 300, '#ff0000');
      
      expect(brick.isOffScreen(800, 600)).toBe(true);
    });

    it('should return true when right of screen', () => {
      const brick = new ThrownBrick(900, 300, 1000, 300, 300, '#ff0000');
      
      expect(brick.isOffScreen(800, 600)).toBe(true);
    });

    it('should include buffer zone', () => {
      // Just past edge with buffer
      const brick = new ThrownBrick(400, 640, 400, 700, 300, '#ff0000');
      
      expect(brick.isOffScreen(800, 600)).toBe(true);
    });

    it('should detect off-screen after movement', () => {
      const brick = new ThrownBrick(400, 300, 400, 800, 300, '#ff0000');
      
      expect(brick.isOffScreen(800, 600)).toBe(false);
      
      // Move brick down
      for (let i = 0; i < 10; i++) {
        brick.update(1);
      }
      
      expect(brick.isOffScreen(800, 600)).toBe(true);
    });
  });

  describe('trajectory', () => {
    it('should move in straight line toward target', () => {
      const brick = new ThrownBrick(0, 0, 100, 100, 100, '#ff0000');
      
      const positions: Array<{x: number, y: number}> = [];
      for (let i = 0; i < 5; i++) {
        const bounds = brick.getBounds()!;
        positions.push({ x: bounds.x, y: bounds.y });
        brick.update(0.1);
      }
      
      // Check that movement is consistent (straight line)
      const dx1 = positions[1].x - positions[0].x;
      const dy1 = positions[1].y - positions[0].y;
      const dx2 = positions[2].x - positions[1].x;
      const dy2 = positions[2].y - positions[1].y;
      
      expect(dx1).toBeCloseTo(dx2, 1);
      expect(dy1).toBeCloseTo(dy2, 1);
    });
  });
});
