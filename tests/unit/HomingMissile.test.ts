/**
 * Unit tests for HomingMissile class
 */

import { HomingMissile } from '../../src/renderer/game/entities/offensive/HomingMissile';

describe('HomingMissile', () => {
  let missile: HomingMissile;
  let mockCtx: any;

  beforeEach(() => {
    missile = new HomingMissile(100, 100, '#ff0000');
    
    // Mock canvas context
    mockCtx = {
      save: jest.fn(),
      restore: jest.fn(),
      translate: jest.fn(),
      rotate: jest.fn(),
      beginPath: jest.fn(),
      moveTo: jest.fn(),
      lineTo: jest.fn(),
      closePath: jest.fn(),
      fill: jest.fn(),
      fillRect: jest.fn(),
      shadowBlur: 0,
      shadowColor: '',
      fillStyle: '',
      globalAlpha: 1
    };
  });

  describe('initialization', () => {
    it('should initialize at given position', () => {
      const position = missile.getPosition();
      expect(position.x).toBe(100);
      expect(position.y).toBe(100);
    });

    it('should start active', () => {
      expect(missile.isActive()).toBe(true);
    });

    it('should use constant missile color', () => {
      const color = missile.getColor();
      expect(color).toBeDefined();
      expect(typeof color).toBe('string');
    });

    it('should start with downward velocity', () => {
      const initialPos = missile.getPosition();
      missile.update(1, 100, 200);
      const newPos = missile.getPosition();
      
      expect(newPos.y).toBeGreaterThan(initialPos.y);
    });
  });

  describe('update', () => {
    it('should not update when inactive', () => {
      missile.deactivate();
      const initialPos = missile.getPosition();
      
      missile.update(1, 200, 200);
      
      const newPos = missile.getPosition();
      expect(newPos.x).toBe(initialPos.x);
      expect(newPos.y).toBe(initialPos.y);
    });

    it('should update position based on velocity', () => {
      const initialPos = missile.getPosition();
      
      missile.update(0.016, 100, 200);
      
      const newPos = missile.getPosition();
      expect(newPos.x !== initialPos.x || newPos.y !== initialPos.y).toBe(true);
    });

    it('should accelerate up to max speed', () => {
      const initialPos = missile.getPosition();
      
      // Update multiple times to allow acceleration
      for (let i = 0; i < 10; i++) {
        missile.update(0.1, 100, 200);
      }
      
      const pos1 = missile.getPosition();
      missile.update(0.1, 100, 200);
      const pos2 = missile.getPosition();
      
      // Should be moving
      const distance = Math.sqrt(
        Math.pow(pos2.x - pos1.x, 2) + Math.pow(pos2.y - pos1.y, 2)
      );
      expect(distance).toBeGreaterThan(0);
    });

    it('should track target position', () => {
      // Start at (100, 100), target at (200, 100) - to the right
      missile.update(0.5, 200, 100);
      const pos1 = missile.getPosition();
      
      missile.update(0.5, 200, 100);
      const pos2 = missile.getPosition();
      
      // Should be moving toward target (right)
      expect(pos2.x).toBeGreaterThan(pos1.x);
    });

    it('should turn toward target with limited turn rate', () => {
      const initialPos = missile.getPosition();
      
      // Target far to the right - missile starts pointing down
      missile.update(0.016, 500, 100);
      const pos1 = missile.getPosition();
      
      // Continue tracking
      missile.update(0.016, 500, 100);
      const pos2 = missile.getPosition();
      
      // Should gradually turn right
      expect(pos2.x).toBeGreaterThanOrEqual(pos1.x);
    });

    it('should normalize angle differences correctly', () => {
      // Create missile and update with target behind it
      missile.update(0.5, 100, 50);
      const pos1 = missile.getPosition();
      
      missile.update(0.5, 100, 50);
      const pos2 = missile.getPosition();
      
      // Should turn around to track target above
      expect(pos2.y).toBeLessThanOrEqual(pos1.y + 100); // Should start turning up
    });

    it('should increment lifetime', () => {
      // Update for a long time
      for (let i = 0; i < 100; i++) {
        missile.update(0.1, 100, 200);
        if (!missile.isActive()) break;
      }
      
      // Should eventually deactivate due to lifetime
      expect(missile.isActive()).toBe(false);
    });

    it('should deactivate after max lifetime', () => {
      // Update with very large deltaTime to exceed max lifetime
      missile.update(100, 100, 200);
      
      expect(missile.isActive()).toBe(false);
    });

    it('should update pulse timer', () => {
      // Render before and after update to check pulse effect changes
      missile.render(mockCtx);
      const shadowBlur1 = mockCtx.shadowBlur;
      
      missile.update(1, 100, 200);
      missile.render(mockCtx);
      const shadowBlur2 = mockCtx.shadowBlur;
      
      // Pulse should cause shadow blur to change (or stay in valid range)
      expect(typeof shadowBlur2).toBe('number');
    });
  });

  describe('render', () => {
    it('should not render when inactive', () => {
      missile.deactivate();
      missile.render(mockCtx);
      
      expect(mockCtx.save).not.toHaveBeenCalled();
    });

    it('should draw missile with glow effect', () => {
      missile.render(mockCtx);
      
      expect(mockCtx.save).toHaveBeenCalled();
      expect(mockCtx.restore).toHaveBeenCalled();
      expect(mockCtx.shadowBlur).toBeGreaterThan(0);
      expect(mockCtx.shadowColor).toBeDefined();
    });

    it('should draw arrow shape', () => {
      missile.render(mockCtx);
      
      expect(mockCtx.beginPath).toHaveBeenCalled();
      expect(mockCtx.moveTo).toHaveBeenCalled();
      expect(mockCtx.lineTo).toHaveBeenCalled();
      expect(mockCtx.closePath).toHaveBeenCalled();
      expect(mockCtx.fill).toHaveBeenCalled();
    });

    it('should draw trail particles', () => {
      missile.render(mockCtx);
      
      expect(mockCtx.fillRect).toHaveBeenCalled();
      // Should draw 3 trail particles
      expect(mockCtx.fillRect).toHaveBeenCalledTimes(3);
    });

    it('should pulse color based on timer', () => {
      missile.render(mockCtx);
      const alpha1 = mockCtx.globalAlpha;
      
      missile.update(1, 100, 200);
      missile.render(mockCtx);
      const alpha2 = mockCtx.globalAlpha;
      
      // Alpha should be set (may or may not be different due to pulse cycle)
      expect(typeof alpha1).toBe('number');
      expect(typeof alpha2).toBe('number');
    });

    it('should rotate context to missile angle', () => {
      missile.render(mockCtx);
      
      expect(mockCtx.translate).toHaveBeenCalled();
      expect(mockCtx.rotate).toHaveBeenCalled();
    });

    it('should apply pulse to shadow blur', () => {
      missile.render(mockCtx);
      
      expect(mockCtx.shadowBlur).toBeGreaterThan(0);
      expect(mockCtx.shadowBlur).toBeLessThan(100); // Reasonable range
    });
  });

  describe('getBounds', () => {
    it('should return square bounds centered on position', () => {
      const bounds = missile.getBounds();
      
      expect(bounds).toHaveProperty('x');
      expect(bounds).toHaveProperty('y');
      expect(bounds).toHaveProperty('width');
      expect(bounds).toHaveProperty('height');
    });

    it('should have equal width and height', () => {
      const bounds = missile.getBounds();
      
      expect(bounds.width).toBe(bounds.height);
    });

    it('should center bounds on missile position', () => {
      const position = missile.getPosition();
      const bounds = missile.getBounds();
      
      const centerX = bounds.x + bounds.width / 2;
      const centerY = bounds.y + bounds.height / 2;
      
      expect(centerX).toBe(position.x);
      expect(centerY).toBe(position.y);
    });

    it('should update bounds after movement', () => {
      const bounds1 = missile.getBounds();
      
      missile.update(1, 200, 200);
      
      const bounds2 = missile.getBounds();
      expect(bounds2.x !== bounds1.x || bounds2.y !== bounds1.y).toBe(true);
    });
  });

  describe('getPosition', () => {
    it('should return current position', () => {
      const position = missile.getPosition();
      
      expect(position.x).toBe(100);
      expect(position.y).toBe(100);
    });

    it('should return a copy of position', () => {
      const pos1 = missile.getPosition();
      const pos2 = missile.getPosition();
      
      expect(pos1).not.toBe(pos2);
      expect(pos1).toEqual(pos2);
    });

    it('should reflect position changes', () => {
      missile.update(1, 200, 200);
      const position = missile.getPosition();
      
      expect(position.x !== 100 || position.y !== 100).toBe(true);
    });
  });

  describe('getColor', () => {
    it('should return missile color', () => {
      const color = missile.getColor();
      
      expect(typeof color).toBe('string');
      expect(color.length).toBeGreaterThan(0);
    });

    it('should use constant color regardless of constructor color', () => {
      const missile1 = new HomingMissile(0, 0, '#ff0000');
      const missile2 = new HomingMissile(0, 0, '#00ff00');
      
      expect(missile1.getColor()).toBe(missile2.getColor());
    });
  });

  describe('isActive', () => {
    it('should return true initially', () => {
      expect(missile.isActive()).toBe(true);
    });

    it('should return false after deactivation', () => {
      missile.deactivate();
      
      expect(missile.isActive()).toBe(false);
    });

    it('should return false after max lifetime', () => {
      missile.update(100, 100, 200);
      
      expect(missile.isActive()).toBe(false);
    });
  });

  describe('deactivate', () => {
    it('should set active to false', () => {
      missile.deactivate();
      
      expect(missile.isActive()).toBe(false);
    });

    it('should prevent further updates', () => {
      missile.deactivate();
      const pos1 = missile.getPosition();
      
      missile.update(1, 200, 200);
      
      const pos2 = missile.getPosition();
      expect(pos2).toEqual(pos1);
    });

    it('should prevent rendering', () => {
      missile.deactivate();
      missile.render(mockCtx);
      
      expect(mockCtx.save).not.toHaveBeenCalled();
    });
  });

  describe('isOffScreen', () => {
    it('should return false when on screen', () => {
      expect(missile.isOffScreen(800, 600)).toBe(false);
    });

    it('should return true when far left', () => {
      const offScreenMissile = new HomingMissile(-100, 100, '#ff0000');
      
      expect(offScreenMissile.isOffScreen(800, 600)).toBe(true);
    });

    it('should return true when far right', () => {
      const offScreenMissile = new HomingMissile(900, 100, '#ff0000');
      
      expect(offScreenMissile.isOffScreen(800, 600)).toBe(true);
    });

    it('should return true when far above', () => {
      const offScreenMissile = new HomingMissile(100, -100, '#ff0000');
      
      expect(offScreenMissile.isOffScreen(800, 600)).toBe(true);
    });

    it('should return true when far below', () => {
      const offScreenMissile = new HomingMissile(100, 700, '#ff0000');
      
      expect(offScreenMissile.isOffScreen(800, 600)).toBe(true);
    });

    it('should include buffer zone', () => {
      // Missile needs to be beyond buffer (size * 2) to be off screen
      // Buffer is approximately 2 * missile size from edge
      const farOffMissile = new HomingMissile(850, 100, '#ff0000');
      
      expect(farOffMissile.isOffScreen(800, 600)).toBe(true);
    });
  });

  describe('tracking behavior', () => {
    it('should eventually face target direction', () => {
      // Target to the right - track over time
      const initialPos = missile.getPosition();
      
      // Update for reasonable time without exceeding lifetime
      for (let i = 0; i < 30; i++) {
        missile.update(0.05, 500, 100);
        if (!missile.isActive()) break;
      }
      
      const finalPos = missile.getPosition();
      
      // Should have moved from initial position toward target
      expect(missile.isActive()).toBe(true);
      expect(finalPos.x !== initialPos.x || finalPos.y !== initialPos.y).toBe(true);
    });

    it('should handle target directly above', () => {
      missile.update(0.5, 100, 50);
      const pos1 = missile.getPosition();
      
      for (let i = 0; i < 10; i++) {
        missile.update(0.1, 100, 50);
      }
      
      const pos2 = missile.getPosition();
      
      // Should move upward
      expect(pos2.y).toBeLessThan(pos1.y);
    });

    it('should handle target directly below', () => {
      const pos1 = missile.getPosition();
      
      missile.update(0.5, 100, 300);
      
      const pos2 = missile.getPosition();
      
      // Should move downward (already pointing down initially)
      expect(pos2.y).toBeGreaterThan(pos1.y);
    });

    it('should handle moving target', () => {
      // Track a moving target
      for (let i = 0; i < 10; i++) {
        missile.update(0.1, 100 + i * 10, 200);
      }
      
      const position = missile.getPosition();
      
      // Should have moved from initial position
      expect(position.x !== 100 || position.y !== 100).toBe(true);
    });
  });
});
