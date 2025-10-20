/**
 * Tests for BrickLaser entity
 */

import { BrickLaser } from '../../src/renderer/game/entities/offensive/BrickLaser';
import { LASER_BRICK_FIRE_DELAY, LASER_BRICK_LASER_SPEED } from '../../src/renderer/config/constants';

describe('BrickLaser', () => {
  let brickLaser: BrickLaser;
  const initialX = 100;
  const initialY = 200;
  const targetX = 400;
  const color = '#ffff00';

  beforeEach(() => {
    brickLaser = new BrickLaser(initialX, initialY, targetX, color);
  });

  describe('constructor', () => {
    it('should initialize with correct position', () => {
      const pos = brickLaser.getPosition();
      expect(pos.x).toBe(initialX);
      expect(pos.y).toBe(initialY);
    });

    it('should initialize with correct color', () => {
      expect(brickLaser.getColor()).toBe(color);
    });

    it('should initialize as active', () => {
      expect(brickLaser.isActive()).toBe(true);
    });

    it('should initialize as charging', () => {
      expect(brickLaser.isCharging()).toBe(true);
    });
  });

  describe('update - charging phase', () => {
    it('should remain charging during delay', () => {
      brickLaser.update(LASER_BRICK_FIRE_DELAY / 2);
      expect(brickLaser.isCharging()).toBe(true);
    });

    it('should not move while charging', () => {
      const initialPos = brickLaser.getPosition();
      brickLaser.update(LASER_BRICK_FIRE_DELAY / 2);
      const newPos = brickLaser.getPosition();
      
      expect(newPos.y).toBe(initialPos.y);
    });

    it('should stop charging after delay', () => {
      brickLaser.update(LASER_BRICK_FIRE_DELAY);
      expect(brickLaser.isCharging()).toBe(false);
    });

    it('should return null bounds while charging', () => {
      const bounds = brickLaser.getBounds();
      expect(bounds).toBeNull();
    });
  });

  describe('update - active phase', () => {
    beforeEach(() => {
      // Complete charging phase
      brickLaser.update(LASER_BRICK_FIRE_DELAY);
    });

    it('should move downward when active', () => {
      const initialPos = brickLaser.getPosition();
      const deltaTime = 0.1;
      
      brickLaser.update(deltaTime);
      
      const newPos = brickLaser.getPosition();
      expect(newPos.y).toBeCloseTo(initialPos.y + LASER_BRICK_LASER_SPEED * deltaTime, 1);
    });

    it('should maintain constant speed', () => {
      const deltaTime = 0.1;
      
      const pos1 = brickLaser.getPosition();
      brickLaser.update(deltaTime);
      const pos2 = brickLaser.getPosition();
      brickLaser.update(deltaTime);
      const pos3 = brickLaser.getPosition();
      
      const dist1 = pos2.y - pos1.y;
      const dist2 = pos3.y - pos2.y;
      
      expect(dist2).toBeCloseTo(dist1, 1);
    });

    it('should return valid bounds when active', () => {
      const bounds = brickLaser.getBounds();
      expect(bounds).not.toBeNull();
      expect(bounds!.width).toBeGreaterThan(0);
      expect(bounds!.height).toBeGreaterThan(0);
    });
  });

  describe('deactivate', () => {
    it('should set active to false', () => {
      brickLaser.deactivate();
      expect(brickLaser.isActive()).toBe(false);
    });

    it('should not update when inactive', () => {
      brickLaser.update(LASER_BRICK_FIRE_DELAY); // Complete charging
      brickLaser.deactivate();
      
      const initialPos = brickLaser.getPosition();
      brickLaser.update(0.1);
      const newPos = brickLaser.getPosition();
      
      expect(newPos.y).toBe(initialPos.y);
    });
  });

  describe('isOffScreen', () => {
    beforeEach(() => {
      brickLaser.update(LASER_BRICK_FIRE_DELAY); // Complete charging
    });

    it('should return false when on screen', () => {
      expect(brickLaser.isOffScreen(1000)).toBe(false);
    });

    it('should return true when below bottom', () => {
      const canvasHeight = 100;
      expect(brickLaser.isOffScreen(canvasHeight)).toBe(true);
    });

    it('should return true after traveling off screen', () => {
      const canvasHeight = 300;
      
      // Update many times to make it travel down
      for (let i = 0; i < 50; i++) {
        brickLaser.update(0.1);
      }
      
      expect(brickLaser.isOffScreen(canvasHeight)).toBe(true);
    });
  });

  describe('charging timer', () => {
    it('should accumulate charge time correctly', () => {
      const step = LASER_BRICK_FIRE_DELAY / 4;
      
      brickLaser.update(step);
      expect(brickLaser.isCharging()).toBe(true);
      
      brickLaser.update(step);
      expect(brickLaser.isCharging()).toBe(true);
      
      brickLaser.update(step);
      expect(brickLaser.isCharging()).toBe(true);
      
      brickLaser.update(step);
      expect(brickLaser.isCharging()).toBe(false);
    });
  });
});
