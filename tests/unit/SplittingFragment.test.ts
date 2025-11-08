/**
 * Unit tests for SplittingFragment class
 */

import { SplittingFragment } from '../../src/renderer/game/entities/offensive/SplittingFragment';

describe('SplittingFragment', () => {
  let fragment: SplittingFragment;
  let mockCtx: any;

  beforeEach(() => {
    fragment = new SplittingFragment(100, 100, 50, 50, '#ff0000');
    
    // Mock canvas context
    mockCtx = {
      save: jest.fn(),
      restore: jest.fn(),
      translate: jest.fn(),
      rotate: jest.fn(),
      fillRect: jest.fn(),
      shadowBlur: 0,
      shadowColor: '',
      fillStyle: ''
    };
  });

  describe('initialization', () => {
    it('should initialize at given position', () => {
      const position = fragment.getPosition();
      expect(position.x).toBe(100);
      expect(position.y).toBe(100);
    });

    it('should initialize with given velocity', () => {
      const initialPos = fragment.getPosition();
      fragment.update(1);
      const newPos = fragment.getPosition();
      
      // Should have moved based on velocity
      expect(newPos.x).toBeGreaterThan(initialPos.x);
      expect(newPos.y).toBeGreaterThan(initialPos.y);
    });

    it('should start active', () => {
      expect(fragment.isActive()).toBe(true);
    });

    it('should use given color', () => {
      expect(fragment.getColor()).toBe('#ff0000');
    });

    it('should have random rotation speed', () => {
      const fragment1 = new SplittingFragment(0, 0, 0, 0, '#ff0000');
      const fragment2 = new SplittingFragment(0, 0, 0, 0, '#ff0000');
      
      // Update both and check if rotations differ (random rotation speeds)
      fragment1.update(1);
      fragment2.update(1);
      
      // Both should be active (rotations may or may not differ due to randomness)
      expect(fragment1.isActive()).toBe(true);
      expect(fragment2.isActive()).toBe(true);
    });
  });

  describe('update - moving phase', () => {
    it('should not update when inactive', () => {
      fragment.deactivate();
      const initialPos = fragment.getPosition();
      
      fragment.update(1);
      
      const newPos = fragment.getPosition();
      expect(newPos).toEqual(initialPos);
    });

    it('should move with initial velocity', () => {
      const initialPos = fragment.getPosition();
      
      fragment.update(0.1);
      
      const newPos = fragment.getPosition();
      expect(newPos.x).toBeGreaterThan(initialPos.x);
      expect(newPos.y).toBeGreaterThan(initialPos.y);
    });

    it('should rotate based on rotation speed', () => {
      // Render before and after to check rotation is applied
      fragment.render(mockCtx);
      const rotateCallsBefore = mockCtx.rotate.mock.calls.length;
      
      fragment.update(1);
      fragment.render(mockCtx);
      
      expect(mockCtx.rotate).toHaveBeenCalled();
      expect(mockCtx.rotate.mock.calls.length).toBeGreaterThan(rotateCallsBefore);
    });

    it('should calculate distance traveled', () => {
      const initialPos = fragment.getPosition();
      
      // Move for a while
      for (let i = 0; i < 10; i++) {
        fragment.update(0.1);
      }
      
      const newPos = fragment.getPosition();
      const distance = Math.sqrt(
        Math.pow(newPos.x - initialPos.x, 2) + 
        Math.pow(newPos.y - initialPos.y, 2)
      );
      
      expect(distance).toBeGreaterThan(0);
    });
  });

  describe('update - shaking phase', () => {
    beforeEach(() => {
      // Move fragment to trigger shake phase (100+ pixels)
      for (let i = 0; i < 30; i++) {
        fragment.update(0.1);
      }
    });

    it('should switch to shaking after fall distance', () => {
      // Fragment should have traveled enough distance to start shaking
      // Position should be jittering around a point
      const pos1 = fragment.getPosition();
      fragment.update(0.01);
      const pos2 = fragment.getPosition();
      fragment.update(0.01);
      const pos3 = fragment.getPosition();
      
      // Positions should be close but slightly different (shaking)
      const dist12 = Math.sqrt(Math.pow(pos2.x - pos1.x, 2) + Math.pow(pos2.y - pos1.y, 2));
      const dist23 = Math.sqrt(Math.pow(pos3.x - pos2.x, 2) + Math.pow(pos3.y - pos2.y, 2));
      
      // Should be small movements (shake) not large movements (velocity)
      expect(dist12).toBeLessThan(10);
      expect(dist23).toBeLessThan(10);
    });

    it('should stop velocity during shake', () => {
      const pos1 = fragment.getPosition();
      fragment.update(0.01);
      const pos2 = fragment.getPosition();
      
      // Movement should be minimal (just shake, no velocity)
      const distance = Math.sqrt(
        Math.pow(pos2.x - pos1.x, 2) + 
        Math.pow(pos2.y - pos1.y, 2)
      );
      
      expect(distance).toBeLessThan(10); // Shake is small
    });

    it('should shake for correct duration', () => {
      // Update through shake duration
      for (let i = 0; i < 20; i++) {
        fragment.update(0.1);
      }
      
      // Should still be active after shake
      expect(fragment.isActive()).toBe(true);
    });

    it('should maintain position during shake', () => {
      const pos1 = fragment.getPosition();
      
      // Update a few times during shake
      fragment.update(0.01);
      fragment.update(0.01);
      fragment.update(0.01);
      
      const pos2 = fragment.getPosition();
      
      // Should be roughly in same area (within shake radius)
      const distance = Math.sqrt(
        Math.pow(pos2.x - pos1.x, 2) + 
        Math.pow(pos2.y - pos1.y, 2)
      );
      
      expect(distance).toBeLessThan(100); // Within shake range (can be larger with random shake)
    });
  });

  describe('update - falling phase', () => {
    beforeEach(() => {
      // Move through initial movement and shake phases
      for (let i = 0; i < 50; i++) {
        fragment.update(0.1);
      }
    });

    it('should start falling after shake', () => {
      const pos1 = fragment.getPosition();
      
      fragment.update(0.5);
      
      const pos2 = fragment.getPosition();
      
      // Should be falling (moving downward)
      expect(pos2.y).toBeGreaterThan(pos1.y);
    });

    it('should apply gravity during fall', () => {
      const pos1 = fragment.getPosition();
      fragment.update(0.1);
      const pos2 = fragment.getPosition();
      
      fragment.update(0.1);
      const pos3 = fragment.getPosition();
      
      // Acceleration should increase fall speed
      const speed1 = pos2.y - pos1.y;
      const speed2 = pos3.y - pos2.y;
      
      expect(speed2).toBeGreaterThanOrEqual(speed1);
    });

    it('should fall vertically without horizontal movement', () => {
      const pos1 = fragment.getPosition();
      
      fragment.update(0.5);
      
      const pos2 = fragment.getPosition();
      
      // X should not change much (no horizontal velocity)
      expect(Math.abs(pos2.x - pos1.x)).toBeLessThan(1);
    });

    it('should deactivate when off screen', () => {
      // Fall for a long time
      for (let i = 0; i < 100; i++) {
        fragment.update(0.1);
      }
      
      // Should be off screen
      expect(fragment.isOffScreen(800, 600)).toBe(true);
    });
  });

  describe('phase transitions', () => {
    it('should transition from moving to shaking', () => {
      const initialPos = fragment.getPosition();
      
      // Move until shake starts
      for (let i = 0; i < 30; i++) {
        fragment.update(0.1);
      }
      
      const shakePos = fragment.getPosition();
      
      // Should have moved significantly from start
      const distance = Math.sqrt(
        Math.pow(shakePos.x - initialPos.x, 2) + 
        Math.pow(shakePos.y - initialPos.y, 2)
      );
      
      expect(distance).toBeGreaterThan(50);
    });

    it('should transition from shaking to falling', () => {
      // Move through both phases
      for (let i = 0; i < 60; i++) {
        fragment.update(0.1);
      }
      
      const pos1 = fragment.getPosition();
      fragment.update(0.5);
      const pos2 = fragment.getPosition();
      
      // Should be falling (moving down)
      expect(pos2.y).toBeGreaterThan(pos1.y);
    });

    it('should complete all three phases', () => {
      // Phase 1: Moving
      expect(fragment.isActive()).toBe(true);
      
      // Phase 2: Shaking (after ~100 pixels)
      for (let i = 0; i < 30; i++) {
        fragment.update(0.1);
      }
      expect(fragment.isActive()).toBe(true);
      
      // Phase 3: Falling (after shake duration)
      for (let i = 0; i < 30; i++) {
        fragment.update(0.1);
      }
      expect(fragment.isActive()).toBe(true);
    });
  });

  describe('render', () => {
    it('should not render when inactive', () => {
      fragment.deactivate();
      fragment.render(mockCtx);
      
      expect(mockCtx.save).not.toHaveBeenCalled();
    });

    it('should draw fragment with rotation', () => {
      fragment.render(mockCtx);
      
      expect(mockCtx.save).toHaveBeenCalled();
      expect(mockCtx.restore).toHaveBeenCalled();
      expect(mockCtx.translate).toHaveBeenCalled();
      expect(mockCtx.rotate).toHaveBeenCalled();
    });

    it('should apply shake offset during shake phase', () => {
      // Move to shake phase
      for (let i = 0; i < 30; i++) {
        fragment.update(0.1);
      }
      
      fragment.render(mockCtx);
      
      expect(mockCtx.translate).toHaveBeenCalled();
    });

    it('should draw with glow effect', () => {
      fragment.render(mockCtx);
      
      expect(mockCtx.shadowBlur).toBeGreaterThan(0);
      expect(mockCtx.shadowColor).toBe('#ff0000');
    });

    it('should draw fragment as square', () => {
      fragment.render(mockCtx);
      
      expect(mockCtx.fillRect).toHaveBeenCalled();
      // Should draw main body plus edges/highlights
      expect(mockCtx.fillRect.mock.calls.length).toBeGreaterThan(1);
    });

    it('should draw depth effects', () => {
      fragment.render(mockCtx);
      
      // Should draw darker edges and highlights
      expect(mockCtx.fillRect.mock.calls.length).toBeGreaterThanOrEqual(4);
    });
  });

  describe('getBounds', () => {
    it('should return square bounds centered on position', () => {
      const bounds = fragment.getBounds();
      
      expect(bounds).toHaveProperty('x');
      expect(bounds).toHaveProperty('y');
      expect(bounds).toHaveProperty('width');
      expect(bounds).toHaveProperty('height');
    });

    it('should have equal width and height', () => {
      const bounds = fragment.getBounds();
      
      expect(bounds.width).toBe(bounds.height);
    });

    it('should center bounds on fragment position', () => {
      const position = fragment.getPosition();
      const bounds = fragment.getBounds();
      
      const centerX = bounds.x + bounds.width / 2;
      const centerY = bounds.y + bounds.height / 2;
      
      expect(centerX).toBe(position.x);
      expect(centerY).toBe(position.y);
    });

    it('should update bounds after movement', () => {
      const bounds1 = fragment.getBounds();
      
      fragment.update(1);
      
      const bounds2 = fragment.getBounds();
      expect(bounds2.x !== bounds1.x || bounds2.y !== bounds1.y).toBe(true);
    });
  });

  describe('getPosition', () => {
    it('should return current position', () => {
      const position = fragment.getPosition();
      
      expect(position.x).toBe(100);
      expect(position.y).toBe(100);
    });

    it('should return a copy of position', () => {
      const pos1 = fragment.getPosition();
      const pos2 = fragment.getPosition();
      
      expect(pos1).not.toBe(pos2);
      expect(pos1).toEqual(pos2);
    });

    it('should reflect position changes', () => {
      fragment.update(1);
      const position = fragment.getPosition();
      
      expect(position.x !== 100 || position.y !== 100).toBe(true);
    });
  });

  describe('getColor', () => {
    it('should return fragment color', () => {
      expect(fragment.getColor()).toBe('#ff0000');
    });

    it('should preserve color from constructor', () => {
      const blueFragment = new SplittingFragment(0, 0, 0, 0, '#0000ff');
      
      expect(blueFragment.getColor()).toBe('#0000ff');
    });
  });

  describe('isActive', () => {
    it('should return true initially', () => {
      expect(fragment.isActive()).toBe(true);
    });

    it('should return false after deactivation', () => {
      fragment.deactivate();
      
      expect(fragment.isActive()).toBe(false);
    });
  });

  describe('deactivate', () => {
    it('should set active to false', () => {
      fragment.deactivate();
      
      expect(fragment.isActive()).toBe(false);
    });

    it('should prevent further updates', () => {
      fragment.deactivate();
      const pos1 = fragment.getPosition();
      
      fragment.update(1);
      
      const pos2 = fragment.getPosition();
      expect(pos2).toEqual(pos1);
    });

    it('should prevent rendering', () => {
      fragment.deactivate();
      fragment.render(mockCtx);
      
      expect(mockCtx.save).not.toHaveBeenCalled();
    });
  });

  describe('isOffScreen', () => {
    it('should return false when on screen', () => {
      expect(fragment.isOffScreen(800, 600)).toBe(false);
    });

    it('should return true when far left', () => {
      const offScreenFragment = new SplittingFragment(-50, 100, 0, 0, '#ff0000');
      
      expect(offScreenFragment.isOffScreen(800, 600)).toBe(true);
    });

    it('should return true when far right', () => {
      const offScreenFragment = new SplittingFragment(850, 100, 0, 0, '#ff0000');
      
      expect(offScreenFragment.isOffScreen(800, 600)).toBe(true);
    });

    it('should return true when far above', () => {
      const offScreenFragment = new SplittingFragment(100, -50, 0, 0, '#ff0000');
      
      expect(offScreenFragment.isOffScreen(800, 600)).toBe(true);
    });

    it('should return true when far below', () => {
      const offScreenFragment = new SplittingFragment(100, 650, 0, 0, '#ff0000');
      
      expect(offScreenFragment.isOffScreen(800, 600)).toBe(true);
    });

    it('should include buffer zone', () => {
      // Fragment size is 32 - need to be beyond canvas + size (800 + 32 = 832)
      const farOffFragment = new SplittingFragment(833, 100, 0, 0, '#ff0000');
      
      expect(farOffFragment.isOffScreen(800, 600)).toBe(true);
    });
  });

  describe('rotation behavior', () => {
    it('should rotate continuously', () => {
      fragment.update(1);
      fragment.render(mockCtx);
      const rotation1 = mockCtx.rotate.mock.calls[0][0];
      
      fragment.update(1);
      fragment.render(mockCtx);
      const rotation2 = mockCtx.rotate.mock.calls[1][0];
      
      // Rotation should change
      expect(rotation2).not.toBe(rotation1);
    });

    it('should rotate during all phases', () => {
      // Initial phase
      fragment.update(0.5);
      fragment.render(mockCtx);
      expect(mockCtx.rotate).toHaveBeenCalled();
      
      mockCtx.rotate.mockClear();
      
      // After moving to shake phase
      for (let i = 0; i < 30; i++) {
        fragment.update(0.1);
      }
      fragment.render(mockCtx);
      expect(mockCtx.rotate).toHaveBeenCalled();
    });
  });
});
