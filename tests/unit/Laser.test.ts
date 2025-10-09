/**
 * Tests for Laser class
 */

import { Laser } from '../../src/renderer/game/Laser';

describe('Laser', () => {
  let mockCtx: CanvasRenderingContext2D;

  beforeEach(() => {
    mockCtx = {
      save: jest.fn(),
      restore: jest.fn(),
      fillRect: jest.fn(),
      fillStyle: '',
      shadowBlur: 0,
      shadowColor: '',
    } as unknown as CanvasRenderingContext2D;
  });

  describe('constructor', () => {
    it('should create laser with correct initial position', () => {
      const laser = new Laser(100, 200, 300, 5);
      const bounds = laser.getBounds();
      
      expect(bounds.x).toBe(98); // x - width/2 = 100 - 2
      expect(bounds.y).toBe(195); // y - height/2 = 200 - 5
    });

    it('should create laser with correct damage', () => {
      const laser = new Laser(100, 200, 300, 5);
      expect(laser.getDamage()).toBe(5);
    });

    it('should be active initially', () => {
      const laser = new Laser(100, 200, 300, 5);
      expect(laser.isActive()).toBe(true);
    });
  });

  describe('update', () => {
    it('should move upward based on speed and deltaTime', () => {
      const laser = new Laser(100, 200, 300, 5);
      const initialY = laser.getBounds().y;
      
      laser.update(0.1); // 0.1 seconds
      
      const newY = laser.getBounds().y;
      expect(newY).toBeLessThan(initialY); // Moved up (y decreased)
      expect(newY).toBe(initialY - 300 * 0.1); // 300 speed * 0.1 seconds = 30 pixels
    });

    it('should move correct distance with different deltaTime', () => {
      const laser = new Laser(100, 200, 600, 5);
      const initialY = laser.getBounds().y;
      
      laser.update(0.5); // 0.5 seconds
      
      const newY = laser.getBounds().y;
      expect(newY).toBe(initialY - 600 * 0.5); // 600 speed * 0.5 seconds = 300 pixels
    });

    it('should not move if deltaTime is zero', () => {
      const laser = new Laser(100, 200, 300, 5);
      const initialY = laser.getBounds().y;
      
      laser.update(0);
      
      const newY = laser.getBounds().y;
      expect(newY).toBe(initialY);
    });

    it('should check if off screen', () => {
      const laser = new Laser(100, 10, 300, 5);
      
      expect(laser.isOffScreen(0)).toBe(false);
      
      laser.update(1); // Move 300 pixels up
      
      expect(laser.isOffScreen(0)).toBe(true);
    });

    it('should remain active while on screen', () => {
      const laser = new Laser(100, 200, 300, 5);
      
      laser.update(0.1); // Move 30 pixels up
      
      expect(laser.isActive()).toBe(true);
    });
  });

  describe('deactivate', () => {
    it('should deactivate laser', () => {
      const laser = new Laser(100, 200, 300, 5);
      
      expect(laser.isActive()).toBe(true);
      
      laser.deactivate();
      
      expect(laser.isActive()).toBe(false);
    });

    it('should remain deactivated after multiple calls', () => {
      const laser = new Laser(100, 200, 300, 5);
      
      laser.deactivate();
      laser.deactivate();
      
      expect(laser.isActive()).toBe(false);
    });
  });

  describe('getBounds', () => {
    it('should return correct bounds', () => {
      const laser = new Laser(100, 200, 300, 5);
      const bounds = laser.getBounds();
      
      expect(bounds.x).toBe(98); // x - width/2 = 100 - 2
      expect(bounds.y).toBe(195); // y - height/2 = 200 - 5
      expect(bounds.width).toBe(4); // Laser width
      expect(bounds.height).toBe(10); // Laser height
    });

    it('should return updated bounds after movement', () => {
      const laser = new Laser(100, 200, 300, 5);
      
      laser.update(0.1);
      
      const bounds = laser.getBounds();
      expect(bounds.x).toBe(98); // X doesn't change (100 - 2)
      expect(bounds.y).toBe(165); // Y moved up by 30 (195 - 30)
    });
  });


  describe('getDamage', () => {
    it('should return correct damage', () => {
      const laser = new Laser(100, 200, 300, 7.5);
      expect(laser.getDamage()).toBe(7.5);
    });

    it('should handle zero damage', () => {
      const laser = new Laser(100, 200, 300, 0);
      expect(laser.getDamage()).toBe(0);
    });

    it('should handle fractional damage', () => {
      const laser = new Laser(100, 200, 300, 0.5);
      expect(laser.getDamage()).toBe(0.5);
    });
  });

  describe('render', () => {
    it('should not render if inactive', () => {
      const laser = new Laser(100, 200, 300, 5);
      laser.deactivate();
      
      laser.render(mockCtx);
      
      expect(mockCtx.fillRect).not.toHaveBeenCalled();
    });

    it('should render if active', () => {
      const laser = new Laser(100, 200, 300, 5);
      
      laser.render(mockCtx);
      
      expect(mockCtx.save).toHaveBeenCalled();
      expect(mockCtx.fillRect).toHaveBeenCalled();
      expect(mockCtx.restore).toHaveBeenCalled();
    });

    it('should render at correct position', () => {
      const laser = new Laser(100, 200, 300, 5);
      
      laser.render(mockCtx);
      
      expect(mockCtx.fillRect).toHaveBeenCalledWith(98, 195, 4, 10);
    });

    it('should render at updated position after movement', () => {
      const laser = new Laser(100, 200, 300, 5);
      
      laser.update(0.1); // Move up 30 pixels
      laser.render(mockCtx);
      
      expect(mockCtx.fillRect).toHaveBeenCalledWith(98, 165, 4, 10);
    });
  });

  describe('edge cases', () => {
    it('should handle negative initial position', () => {
      const laser = new Laser(-10, -20, 300, 5);
      const bounds = laser.getBounds();
      
      expect(bounds.x).toBe(-12); // -10 - 2
      expect(bounds.y).toBe(-25); // -20 - 5
    });

    it('should handle very high speed', () => {
      const laser = new Laser(100, 200, 10000, 5);
      
      laser.update(0.01); // Move 100 pixels
      
      const bounds = laser.getBounds();
      expect(bounds.y).toBe(95); // 195 - 100
    });

    it('should handle very small deltaTime', () => {
      const laser = new Laser(100, 200, 300, 5);
      const initialY = laser.getBounds().y;
      
      laser.update(0.001); // Very small time step
      
      const newY = laser.getBounds().y;
      expect(newY).toBe(initialY - 0.3); // Moved 0.3 pixels
    });
  });
});
