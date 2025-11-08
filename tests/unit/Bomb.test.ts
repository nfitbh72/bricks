/**
 * Tests for Bomb weapon
 */

import { Bomb } from '../../src/renderer/game/weapons/Bomb';

describe('Bomb', () => {
  let bomb: Bomb;
  let mockCtx: any;

  beforeEach(() => {
    bomb = new Bomb(400, 500, 300, 50, 100);
    mockCtx = {
      save: jest.fn(),
      restore: jest.fn(),
      beginPath: jest.fn(),
      arc: jest.fn(),
      fill: jest.fn(),
      createRadialGradient: jest.fn(() => ({
        addColorStop: jest.fn(),
      })),
      shadowBlur: 0,
      shadowColor: '',
      fillStyle: '',
    };
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  describe('initialization', () => {
    it('should initialize at given position', () => {
      const position = bomb.getPosition();
      expect(position.x).toBe(400);
      expect(position.y).toBe(500);
    });

    it('should initialize with correct damage', () => {
      expect(bomb.getDamage()).toBe(50);
    });

    it('should initialize with correct explosion radius', () => {
      expect(bomb.getExplosionRadius()).toBe(100);
    });

    it('should initialize as active', () => {
      expect(bomb.isActive()).toBe(true);
    });

    it('should initialize as not exploded', () => {
      expect(bomb.hasExploded()).toBe(false);
    });
  });

  describe('update', () => {
    it('should move upward based on speed', () => {
      const initialY = bomb.getPosition().y;
      
      bomb.update(1); // 1 second
      
      const newY = bomb.getPosition().y;
      expect(newY).toBeLessThan(initialY);
      expect(newY).toBe(initialY - 300); // speed * deltaTime
    });

    it('should move correct distance with deltaTime', () => {
      const initialY = bomb.getPosition().y;
      
      bomb.update(0.5); // 0.5 seconds
      
      const newY = bomb.getPosition().y;
      expect(newY).toBe(initialY - 150); // 300 * 0.5
    });

    it('should not move after explosion', () => {
      bomb.explode();
      const positionAfterExplosion = bomb.getPosition();
      
      bomb.update(1);
      
      const newPosition = bomb.getPosition();
      expect(newPosition.y).toBe(positionAfterExplosion.y);
    });

    it('should handle zero deltaTime', () => {
      const initialPosition = bomb.getPosition();
      
      bomb.update(0);
      
      const newPosition = bomb.getPosition();
      expect(newPosition.y).toBe(initialPosition.y);
    });

    it('should maintain X position', () => {
      const initialX = bomb.getPosition().x;
      
      bomb.update(1);
      
      const newX = bomb.getPosition().x;
      expect(newX).toBe(initialX);
    });
  });

  describe('render', () => {
    it('should not render when inactive', () => {
      bomb.deactivate();
      
      bomb.render(mockCtx);
      
      expect(mockCtx.save).not.toHaveBeenCalled();
    });

    it('should render when active', () => {
      bomb.render(mockCtx);
      
      expect(mockCtx.save).toHaveBeenCalled();
      expect(mockCtx.restore).toHaveBeenCalled();
    });

    it('should render bomb with glow effect', () => {
      bomb.render(mockCtx);
      
      expect(mockCtx.shadowBlur).toBeGreaterThan(0);
      expect(mockCtx.shadowColor).toBe('#ff6600');
    });

    it('should render bomb as circle', () => {
      bomb.render(mockCtx);
      
      expect(mockCtx.beginPath).toHaveBeenCalled();
      expect(mockCtx.arc).toHaveBeenCalled();
      expect(mockCtx.fill).toHaveBeenCalled();
    });

    it('should render fuse spark', () => {
      bomb.render(mockCtx);
      
      // Should draw two circles: bomb body and fuse spark
      expect(mockCtx.arc.mock.calls.length).toBeGreaterThanOrEqual(2);
    });

    it('should render explosion effect when exploded', () => {
      bomb.explode();
      
      bomb.render(mockCtx);
      
      expect(mockCtx.createRadialGradient).toHaveBeenCalled();
    });

    it('should use gradient for explosion', () => {
      bomb.explode();
      const gradient = {
        addColorStop: jest.fn(),
      };
      mockCtx.createRadialGradient.mockReturnValue(gradient);
      
      bomb.render(mockCtx);
      
      expect(gradient.addColorStop).toHaveBeenCalledTimes(3);
    });
  });

  describe('getPosition', () => {
    it('should return current position', () => {
      const position = bomb.getPosition();
      
      expect(position).toHaveProperty('x');
      expect(position).toHaveProperty('y');
      expect(position.x).toBe(400);
      expect(position.y).toBe(500);
    });

    it('should return a copy of position', () => {
      const position1 = bomb.getPosition();
      const position2 = bomb.getPosition();
      
      expect(position1).not.toBe(position2);
      expect(position1).toEqual(position2);
    });

    it('should reflect position changes', () => {
      bomb.update(1);
      
      const position = bomb.getPosition();
      expect(position.y).toBe(200); // 500 - 300
    });
  });

  describe('getBounds', () => {
    it('should return correct bounds', () => {
      const bounds = bomb.getBounds();
      
      expect(bounds.x).toBe(392); // 400 - 8
      expect(bounds.y).toBe(492); // 500 - 8
      expect(bounds.width).toBe(16); // radius * 2
      expect(bounds.height).toBe(16);
    });

    it('should center bounds on position', () => {
      const position = bomb.getPosition();
      const bounds = bomb.getBounds();
      
      const centerX = bounds.x + bounds.width / 2;
      const centerY = bounds.y + bounds.height / 2;
      
      expect(centerX).toBe(position.x);
      expect(centerY).toBe(position.y);
    });

    it('should update bounds after movement', () => {
      const initialBounds = bomb.getBounds();
      
      bomb.update(1);
      
      const newBounds = bomb.getBounds();
      expect(newBounds.y).not.toBe(initialBounds.y);
      expect(newBounds.x).toBe(initialBounds.x);
    });
  });

  describe('getDamage', () => {
    it('should return correct damage', () => {
      expect(bomb.getDamage()).toBe(50);
    });

    it('should handle different damage values', () => {
      const strongBomb = new Bomb(100, 100, 300, 100, 150);
      expect(strongBomb.getDamage()).toBe(100);
    });

    it('should handle zero damage', () => {
      const weakBomb = new Bomb(100, 100, 300, 0, 100);
      expect(weakBomb.getDamage()).toBe(0);
    });
  });

  describe('getExplosionRadius', () => {
    it('should return correct explosion radius', () => {
      expect(bomb.getExplosionRadius()).toBe(100);
    });

    it('should handle different radius values', () => {
      const bigBomb = new Bomb(100, 100, 300, 50, 200);
      expect(bigBomb.getExplosionRadius()).toBe(200);
    });
  });

  describe('isActive', () => {
    it('should return true initially', () => {
      expect(bomb.isActive()).toBe(true);
    });

    it('should return false after deactivation', () => {
      bomb.deactivate();
      expect(bomb.isActive()).toBe(false);
    });

    it('should return false after explosion timeout', () => {
      bomb.explode();
      expect(bomb.isActive()).toBe(true); // Still active during explosion
      
      jest.advanceTimersByTime(200);
      
      expect(bomb.isActive()).toBe(false);
    });
  });

  describe('hasExploded', () => {
    it('should return false initially', () => {
      expect(bomb.hasExploded()).toBe(false);
    });

    it('should return true after explosion', () => {
      bomb.explode();
      expect(bomb.hasExploded()).toBe(true);
    });

    it('should remain true after timeout', () => {
      bomb.explode();
      jest.advanceTimersByTime(200);
      
      expect(bomb.hasExploded()).toBe(true);
    });
  });

  describe('explode', () => {
    it('should set exploded state', () => {
      bomb.explode();
      expect(bomb.hasExploded()).toBe(true);
    });

    it('should remain active briefly', () => {
      bomb.explode();
      expect(bomb.isActive()).toBe(true);
    });

    it('should deactivate after 200ms', () => {
      bomb.explode();
      
      jest.advanceTimersByTime(200);
      
      expect(bomb.isActive()).toBe(false);
    });

    it('should not deactivate before timeout', () => {
      bomb.explode();
      
      jest.advanceTimersByTime(100);
      
      expect(bomb.isActive()).toBe(true);
    });

    it('should stop movement', () => {
      bomb.explode();
      const positionAfterExplosion = bomb.getPosition();
      
      bomb.update(1);
      
      expect(bomb.getPosition()).toEqual(positionAfterExplosion);
    });
  });

  describe('deactivate', () => {
    it('should set active to false', () => {
      bomb.deactivate();
      expect(bomb.isActive()).toBe(false);
    });

    it('should prevent rendering', () => {
      bomb.deactivate();
      
      bomb.render(mockCtx);
      
      expect(mockCtx.save).not.toHaveBeenCalled();
    });

    it('should work immediately', () => {
      bomb.deactivate();
      expect(bomb.isActive()).toBe(false);
    });
  });

  describe('isOffScreen', () => {
    it('should return false when on screen', () => {
      expect(bomb.isOffScreen(0)).toBe(false);
    });

    it('should return true when above minY', () => {
      bomb.update(10); // Move far up
      
      expect(bomb.isOffScreen(0)).toBe(true);
    });

    it('should return false when at minY', () => {
      const testBomb = new Bomb(400, 100, 300, 50, 100);
      
      expect(testBomb.isOffScreen(100)).toBe(false);
    });

    it('should return true when just above minY', () => {
      const testBomb = new Bomb(400, 99, 300, 50, 100);
      
      expect(testBomb.isOffScreen(100)).toBe(true);
    });

    it('should detect off-screen after movement', () => {
      const testBomb = new Bomb(400, 50, 300, 50, 100);
      
      expect(testBomb.isOffScreen(0)).toBe(false);
      
      testBomb.update(1); // Move up 300 pixels
      
      expect(testBomb.isOffScreen(0)).toBe(true);
    });
  });

  describe('movement trajectory', () => {
    it('should move in straight line upward', () => {
      const positions: number[] = [];
      
      for (let i = 0; i < 5; i++) {
        positions.push(bomb.getPosition().y);
        bomb.update(0.1);
      }
      
      // Check consistent upward movement
      for (let i = 1; i < positions.length; i++) {
        const delta = positions[i - 1] - positions[i];
        expect(delta).toBeCloseTo(30, 1); // 300 * 0.1
      }
    });

    it('should handle different speeds', () => {
      const slowBomb = new Bomb(100, 500, 100, 50, 100);
      const fastBomb = new Bomb(100, 500, 500, 50, 100);
      
      slowBomb.update(1);
      fastBomb.update(1);
      
      const slowY = slowBomb.getPosition().y;
      const fastY = fastBomb.getPosition().y;
      
      expect(fastY).toBeLessThan(slowY);
    });
  });

  describe('explosion timing', () => {
    it('should show explosion for exactly 200ms', () => {
      bomb.explode();
      
      jest.advanceTimersByTime(199);
      expect(bomb.isActive()).toBe(true);
      
      jest.advanceTimersByTime(1);
      expect(bomb.isActive()).toBe(false);
    });

    it('should handle multiple explosions', () => {
      bomb.explode();
      bomb.explode(); // Second call should not break anything
      
      jest.advanceTimersByTime(200);
      
      expect(bomb.isActive()).toBe(false);
    });
  });

  describe('edge cases', () => {
    it('should handle very small deltaTime', () => {
      const initialY = bomb.getPosition().y;
      
      bomb.update(0.001);
      
      const newY = bomb.getPosition().y;
      expect(newY).toBeCloseTo(initialY - 0.3, 2);
    });

    it('should handle very large deltaTime', () => {
      bomb.update(100);
      
      const position = bomb.getPosition();
      expect(position.y).toBe(500 - 30000);
    });

    it('should handle negative position', () => {
      bomb.update(10); // Move far up
      
      const position = bomb.getPosition();
      expect(position.y).toBeLessThan(0);
      expect(bomb.isOffScreen(0)).toBe(true);
    });
  });
});
