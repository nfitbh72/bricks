/**
 * Tests for Bat damage mechanics
 */

import { Bat } from '../../src/renderer/game/Bat';

describe('Bat - Damage Mechanics', () => {
  let bat: Bat;
  const initialWidth = 150;
  const initialHeight = 15;
  const initialX = 100;
  const initialY = 500;

  beforeEach(() => {
    bat = new Bat(initialX, initialY, initialWidth, initialHeight);
  });

  describe('takeDamage', () => {
    it('should reduce width by percentage', () => {
      const damagePercent = 10;
      const expectedWidth = initialWidth * 0.9; // 90% of original
      
      bat.takeDamage(damagePercent);
      
      expect(bat.getWidth()).toBeCloseTo(expectedWidth, 1);
    });

    it('should reduce width by 10% correctly', () => {
      bat.takeDamage(10);
      expect(bat.getWidth()).toBeCloseTo(135, 1);
    });

    it('should reduce width by 25% correctly', () => {
      bat.takeDamage(25);
      expect(bat.getWidth()).toBeCloseTo(112.5, 1);
    });

    it('should reduce width by 50% correctly', () => {
      bat.takeDamage(50);
      expect(bat.getWidth()).toBeCloseTo(75, 1);
    });

    it('should handle multiple damage instances', () => {
      bat.takeDamage(10); // 150 - 15 = 135
      bat.takeDamage(10); // 135 - 15 = 120
      
      expect(bat.getWidth()).toBeCloseTo(120, 1);
    });

    it('should allow width to reach zero', () => {
      bat.takeDamage(100);
      expect(bat.getWidth()).toBe(0);
    });

    it('should not allow negative width', () => {
      bat.takeDamage(150); // More than 100%
      expect(bat.getWidth()).toBe(0);
    });

    it('should handle very small damage amounts', () => {
      bat.takeDamage(1);
      expect(bat.getWidth()).toBeCloseTo(148.5, 1);
    });

    it('should stack damage correctly (not compound)', () => {
      // Three hits of 10% each (10% of original width = 15)
      bat.takeDamage(10); // 150 - 15 = 135
      bat.takeDamage(10); // 135 - 15 = 120
      bat.takeDamage(10); // 120 - 15 = 105
      
      expect(bat.getWidth()).toBeCloseTo(105, 1);
    });
  });

  describe('isDestroyed', () => {
    it('should return false when bat has width', () => {
      expect(bat.isDestroyed()).toBe(false);
    });

    it('should return false after partial damage', () => {
      bat.takeDamage(50);
      expect(bat.isDestroyed()).toBe(false);
    });

    it('should return true when width is zero', () => {
      bat.takeDamage(100);
      expect(bat.isDestroyed()).toBe(true);
    });

    it('should return true after multiple hits reduce width to zero', () => {
      // 10 hits of 10% each (10% of 150 = 15 per hit)
      // 10 * 15 = 150, so exactly 10 hits destroys the bat
      for (let i = 0; i < 10; i++) {
        bat.takeDamage(10);
      }
      expect(bat.isDestroyed()).toBe(true);
    });
  });

  describe('getBounds after damage', () => {
    it('should update bounds width after damage', () => {
      bat.takeDamage(10);
      const bounds = bat.getBounds();
      
      expect(bounds.width).toBeCloseTo(135, 1);
    });

    it('should maintain height after damage', () => {
      bat.takeDamage(50);
      const bounds = bat.getBounds();
      
      expect(bounds.height).toBe(initialHeight);
    });
  });

  describe('getWidth', () => {
    it('should return current width', () => {
      expect(bat.getWidth()).toBe(initialWidth);
    });

    it('should return updated width after damage', () => {
      bat.takeDamage(20);
      expect(bat.getWidth()).toBeCloseTo(120, 1);
    });
  });

  describe('edge cases', () => {
    it('should handle zero damage', () => {
      bat.takeDamage(0);
      expect(bat.getWidth()).toBe(initialWidth);
    });

    it('should handle very large damage values', () => {
      bat.takeDamage(1000);
      expect(bat.getWidth()).toBe(0);
      expect(bat.isDestroyed()).toBe(true);
    });

    it('should handle fractional damage percentages', () => {
      bat.takeDamage(5.5);
      expect(bat.getWidth()).toBeCloseTo(141.75, 1);
    });
  });
});
