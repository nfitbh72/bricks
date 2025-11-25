/**
 * Tests for FallingBrick entity
 */

import { FallingBrick } from '../../src/renderer/game/entities/offensive/FallingBrick';
import { FALLING_BRICK_GRAVITY, BRICK_WIDTH, BRICK_HEIGHT } from '../../src/renderer/config/constants';

describe('FallingBrick', () => {
  let fallingBrick: FallingBrick;
  const initialX = 100;
  const initialY = 200;
  const color = '#ff4400';

  beforeEach(() => {
    fallingBrick = new FallingBrick(initialX, initialY, color);
  });

  describe('constructor', () => {
    it('should initialize with correct position', () => {
      const pos = fallingBrick.getPosition();
      expect(pos.x).toBe(initialX);
      expect(pos.y).toBe(initialY);
    });

    it('should initialize with correct color', () => {
      expect(fallingBrick.getColor()).toBe(color);
    });

    it('should initialize as active', () => {
      expect(fallingBrick.isActive()).toBe(true);
    });

    it('should have correct dimensions', () => {
      const bounds = fallingBrick.getBounds();
      expect(bounds).not.toBeNull();
      expect(bounds!.width).toBe(BRICK_WIDTH);
      expect(bounds!.height).toBe(BRICK_HEIGHT);
    });
  });

  describe('update', () => {
    it('should apply gravity to velocity', () => {
      const deltaTime = 0.1;
      const initialPos = fallingBrick.getPosition();

      fallingBrick.update(deltaTime);

      const newPos = fallingBrick.getPosition();
      // Should have moved down due to gravity
      expect(newPos.y).toBeGreaterThan(initialPos.y);
    });

    it('should accelerate over time', () => {
      const deltaTime = 0.1;

      fallingBrick.update(deltaTime);
      const pos1 = fallingBrick.getPosition();

      fallingBrick.update(deltaTime);
      const pos2 = fallingBrick.getPosition();

      fallingBrick.update(deltaTime);
      const pos3 = fallingBrick.getPosition();

      // Distance should increase each frame (acceleration)
      const dist1 = pos1.y - initialY;
      const dist2 = pos2.y - pos1.y;
      const dist3 = pos3.y - pos2.y;

      expect(dist2).toBeGreaterThan(dist1);
      expect(dist3).toBeGreaterThan(dist2);
    });

    it('should not update when inactive', () => {
      fallingBrick.deactivate();
      const initialPos = fallingBrick.getPosition();

      fallingBrick.update(0.1);

      const newPos = fallingBrick.getPosition();
      expect(newPos.y).toBe(initialPos.y);
    });
  });

  describe('deactivate', () => {
    it('should set active to false', () => {
      fallingBrick.deactivate();
      expect(fallingBrick.isActive()).toBe(false);
    });
  });

  describe('isOffScreen', () => {
    it('should return false when on screen', () => {
      expect(fallingBrick.isOffScreen(1000)).toBe(false);
    });

    it('should return true when below bottom', () => {
      const canvasHeight = 100;
      expect(fallingBrick.isOffScreen(canvasHeight)).toBe(true);
    });

    it('should return true after falling off screen', () => {
      const canvasHeight = 300;

      // Update many times to make it fall
      for (let i = 0; i < 100; i++) {
        fallingBrick.update(0.1);
      }

      expect(fallingBrick.isOffScreen(canvasHeight)).toBe(true);
    });
  });

  describe('getBounds', () => {
    it('should return correct bounds', () => {
      const bounds = fallingBrick.getBounds();
      expect(bounds).not.toBeNull();
      expect(bounds!.x).toBe(initialX);
      expect(bounds!.y).toBe(initialY);
      expect(bounds!.width).toBe(BRICK_WIDTH);
      expect(bounds!.height).toBe(BRICK_HEIGHT);
    });

    it('should update bounds after movement', () => {
      fallingBrick.update(0.1);
      const bounds = fallingBrick.getBounds();
      expect(bounds).not.toBeNull();
      expect(bounds!.y).toBeGreaterThan(initialY);
    });
  });
});
