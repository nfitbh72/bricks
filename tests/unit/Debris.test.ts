/**
 * Tests for Debris entity
 */

import { Debris } from '../../src/renderer/game/entities/offensive/Debris';
import { EXPLODING_BRICK_DEBRIS_SIZE } from '../../src/renderer/config/constants';

describe('Debris', () => {
  let debris: Debris;
  const initialX = 100;
  const initialY = 200;
  const velocityX = 150;
  const velocityY = -100;
  const color = '#ff0000';

  beforeEach(() => {
    debris = new Debris(initialX, initialY, velocityX, velocityY, color);
  });

  describe('constructor', () => {
    it('should initialize with correct position', () => {
      const pos = debris.getPosition();
      expect(pos.x).toBe(initialX);
      expect(pos.y).toBe(initialY);
    });

    it('should initialize with correct color', () => {
      expect(debris.getColor()).toBe(color);
    });

    it('should initialize as active', () => {
      expect(debris.isActive()).toBe(true);
    });
  });

  describe('update', () => {
    it('should move in the direction of velocity', () => {
      const deltaTime = 0.1;
      
      debris.update(deltaTime);
      
      const pos = debris.getPosition();
      expect(pos.x).toBeCloseTo(initialX + velocityX * deltaTime, 1);
      expect(pos.y).toBeCloseTo(initialY + velocityY * deltaTime, 1);
    });

    it('should maintain constant velocity', () => {
      const deltaTime = 0.1;
      
      debris.update(deltaTime);
      const pos1 = debris.getPosition();
      
      debris.update(deltaTime);
      const pos2 = debris.getPosition();
      
      // Distance traveled should be constant (no acceleration)
      const dist1X = pos1.x - initialX;
      const dist2X = pos2.x - pos1.x;
      
      expect(dist2X).toBeCloseTo(dist1X, 1);
    });

    it('should not update when inactive', () => {
      debris.deactivate();
      const initialPos = debris.getPosition();
      
      debris.update(0.1);
      
      const newPos = debris.getPosition();
      expect(newPos.x).toBe(initialPos.x);
      expect(newPos.y).toBe(initialPos.y);
    });
  });

  describe('deactivate', () => {
    it('should set active to false', () => {
      debris.deactivate();
      expect(debris.isActive()).toBe(false);
    });
  });

  describe('isOffScreen', () => {
    it('should return false when on screen', () => {
      expect(debris.isOffScreen(1000, 1000)).toBe(false);
    });

    it('should return true when off left edge', () => {
      const debrisLeft = new Debris(-50, 100, -100, 0, color);
      expect(debrisLeft.isOffScreen(800, 600)).toBe(true);
    });

    it('should return true when off right edge', () => {
      const debrisRight = new Debris(850, 100, 100, 0, color);
      expect(debrisRight.isOffScreen(800, 600)).toBe(true);
    });

    it('should return true when off top edge', () => {
      const debrisTop = new Debris(100, -50, 0, -100, color);
      expect(debrisTop.isOffScreen(800, 600)).toBe(true);
    });

    it('should return true when off bottom edge', () => {
      const debrisBottom = new Debris(100, 650, 0, 100, color);
      expect(debrisBottom.isOffScreen(800, 600)).toBe(true);
    });
  });

  describe('getBounds', () => {
    it('should return correct bounds centered on position', () => {
      const bounds = debris.getBounds();
      const halfSize = EXPLODING_BRICK_DEBRIS_SIZE / 2;
      
      expect(bounds.x).toBe(initialX - halfSize);
      expect(bounds.y).toBe(initialY - halfSize);
      expect(bounds.width).toBe(EXPLODING_BRICK_DEBRIS_SIZE);
      expect(bounds.height).toBe(EXPLODING_BRICK_DEBRIS_SIZE);
    });

    it('should update bounds after movement', () => {
      debris.update(0.1);
      const bounds = debris.getBounds();
      const halfSize = EXPLODING_BRICK_DEBRIS_SIZE / 2;
      const pos = debris.getPosition();
      
      expect(bounds.x).toBe(pos.x - halfSize);
      expect(bounds.y).toBe(pos.y - halfSize);
    });
  });
});
