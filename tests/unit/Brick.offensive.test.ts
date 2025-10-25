/**
 * Tests for Brick offensive types
 */

import { Brick } from '../../src/renderer/game/entities/Brick';
import { BrickType } from '../../src/renderer/game/core/types';
import {
  OFFENSIVE_BRICK_COLOR_FALLING,
  OFFENSIVE_BRICK_COLOR_EXPLODING,
  OFFENSIVE_BRICK_COLOR_LASER,
  OFFENSIVE_BRICK_COLOR_DYNAMITE,
} from '../../src/renderer/config/constants';

describe('Brick - Offensive Types', () => {
  describe('BrickType enum', () => {
    it('should have OFFENSIVE_FALLING type', () => {
      expect(BrickType.OFFENSIVE_FALLING).toBe('OFFENSIVE_FALLING');
    });

    it('should have OFFENSIVE_EXPLODING type', () => {
      expect(BrickType.OFFENSIVE_EXPLODING).toBe('OFFENSIVE_EXPLODING');
    });

    it('should have OFFENSIVE_LASER type', () => {
      expect(BrickType.OFFENSIVE_LASER).toBe('OFFENSIVE_LASER');
    });

    it('should have OFFENSIVE_DYNAMITE type', () => {
      expect(BrickType.OFFENSIVE_DYNAMITE).toBe('OFFENSIVE_DYNAMITE');
    });
  });

  describe('isOffensive', () => {
    it('should return true for OFFENSIVE_FALLING', () => {
      const brick = new Brick({ col: 0, row: 0, type: BrickType.OFFENSIVE_FALLING }, 1);
      expect(brick.isOffensive()).toBe(true);
    });

    it('should return true for OFFENSIVE_EXPLODING', () => {
      const brick = new Brick({ col: 0, row: 0, type: BrickType.OFFENSIVE_EXPLODING }, 1);
      expect(brick.isOffensive()).toBe(true);
    });

    it('should return true for OFFENSIVE_LASER', () => {
      const brick = new Brick({ col: 0, row: 0, type: BrickType.OFFENSIVE_LASER }, 1);
      expect(brick.isOffensive()).toBe(true);
    });

    it('should return true for OFFENSIVE_DYNAMITE', () => {
      const brick = new Brick({ col: 0, row: 0, type: BrickType.OFFENSIVE_DYNAMITE }, 1);
      expect(brick.isOffensive()).toBe(true);
    });

    it('should return false for NORMAL', () => {
      const brick = new Brick({ col: 0, row: 0, type: BrickType.NORMAL }, 1);
      expect(brick.isOffensive()).toBe(false);
    });

    it('should return false for HEALTHY', () => {
      const brick = new Brick({ col: 0, row: 0, type: BrickType.HEALTHY }, 1);
      expect(brick.isOffensive()).toBe(false);
    });

    it('should return false for INDESTRUCTIBLE', () => {
      const brick = new Brick({ col: 0, row: 0, type: BrickType.INDESTRUCTIBLE }, 1);
      expect(brick.isOffensive()).toBe(false);
    });
  });

  describe('getType', () => {
    it('should return OFFENSIVE_FALLING', () => {
      const brick = new Brick({ col: 0, row: 0, type: BrickType.OFFENSIVE_FALLING }, 1);
      expect(brick.getType()).toBe(BrickType.OFFENSIVE_FALLING);
    });

    it('should return OFFENSIVE_EXPLODING', () => {
      const brick = new Brick({ col: 0, row: 0, type: BrickType.OFFENSIVE_EXPLODING }, 1);
      expect(brick.getType()).toBe(BrickType.OFFENSIVE_EXPLODING);
    });

    it('should return OFFENSIVE_LASER', () => {
      const brick = new Brick({ col: 0, row: 0, type: BrickType.OFFENSIVE_LASER }, 1);
      expect(brick.getType()).toBe(BrickType.OFFENSIVE_LASER);
    });

    it('should return OFFENSIVE_DYNAMITE', () => {
      const brick = new Brick({ col: 0, row: 0, type: BrickType.OFFENSIVE_DYNAMITE }, 1);
      expect(brick.getType()).toBe(BrickType.OFFENSIVE_DYNAMITE);
    });
  });

  describe('getColor - offensive bricks', () => {
    it('should return distinct color for OFFENSIVE_FALLING', () => {
      const brick = new Brick({ col: 0, row: 0, type: BrickType.OFFENSIVE_FALLING }, 1);
      expect(brick.getColor()).toBe(OFFENSIVE_BRICK_COLOR_FALLING);
    });

    it('should return distinct color for OFFENSIVE_EXPLODING', () => {
      const brick = new Brick({ col: 0, row: 0, type: BrickType.OFFENSIVE_EXPLODING }, 1);
      expect(brick.getColor()).toBe(OFFENSIVE_BRICK_COLOR_EXPLODING);
    });

    it('should return distinct color for OFFENSIVE_LASER', () => {
      const brick = new Brick({ col: 0, row: 0, type: BrickType.OFFENSIVE_LASER }, 1);
      expect(brick.getColor()).toBe(OFFENSIVE_BRICK_COLOR_LASER);
    });

    it('should return distinct color for OFFENSIVE_DYNAMITE', () => {
      const brick = new Brick({ col: 0, row: 0, type: BrickType.OFFENSIVE_DYNAMITE }, 1);
      expect(brick.getColor()).toBe(OFFENSIVE_BRICK_COLOR_DYNAMITE);
    });

    it('should use custom color if provided', () => {
      const customColor = '#123456';
      const brick = new Brick(
        { col: 0, row: 0, type: BrickType.OFFENSIVE_FALLING, color: customColor },
        1
      );
      expect(brick.getColor()).toBe(customColor);
    });
  });

  describe('health - offensive bricks', () => {
    it('should have 1x health multiplier for OFFENSIVE_FALLING', () => {
      const brick = new Brick({ col: 0, row: 0, type: BrickType.OFFENSIVE_FALLING }, 5);
      expect(brick.getMaxHealth()).toBe(5);
      expect(brick.getHealth()).toBe(5);
    });

    it('should have 1x health multiplier for OFFENSIVE_EXPLODING', () => {
      const brick = new Brick({ col: 0, row: 0, type: BrickType.OFFENSIVE_EXPLODING }, 5);
      expect(brick.getMaxHealth()).toBe(5);
      expect(brick.getHealth()).toBe(5);
    });

    it('should have 1x health multiplier for OFFENSIVE_LASER', () => {
      const brick = new Brick({ col: 0, row: 0, type: BrickType.OFFENSIVE_LASER }, 5);
      expect(brick.getMaxHealth()).toBe(5);
      expect(brick.getHealth()).toBe(5);
    });

    it('should have 1x health multiplier for OFFENSIVE_DYNAMITE', () => {
      const brick = new Brick({ col: 0, row: 0, type: BrickType.OFFENSIVE_DYNAMITE }, 5);
      expect(brick.getMaxHealth()).toBe(5);
      expect(brick.getHealth()).toBe(5);
    });
  });

  describe('takeDamage - offensive bricks', () => {
    it('should take damage normally', () => {
      const brick = new Brick({ col: 0, row: 0, type: BrickType.OFFENSIVE_FALLING }, 10);
      brick.takeDamage(3);
      expect(brick.getHealth()).toBe(7);
    });

    it('should be destroyed when health reaches zero', () => {
      const brick = new Brick({ col: 0, row: 0, type: BrickType.OFFENSIVE_EXPLODING }, 5);
      brick.takeDamage(5);
      expect(brick.isDestroyed()).toBe(true);
    });
  });

  describe('isIndestructible - offensive bricks', () => {
    it('should return false for OFFENSIVE_FALLING', () => {
      const brick = new Brick({ col: 0, row: 0, type: BrickType.OFFENSIVE_FALLING }, 1);
      expect(brick.isIndestructible()).toBe(false);
    });

    it('should return false for OFFENSIVE_EXPLODING', () => {
      const brick = new Brick({ col: 0, row: 0, type: BrickType.OFFENSIVE_EXPLODING }, 1);
      expect(brick.isIndestructible()).toBe(false);
    });

    it('should return false for OFFENSIVE_LASER', () => {
      const brick = new Brick({ col: 0, row: 0, type: BrickType.OFFENSIVE_LASER }, 1);
      expect(brick.isIndestructible()).toBe(false);
    });

    it('should return false for OFFENSIVE_DYNAMITE', () => {
      const brick = new Brick({ col: 0, row: 0, type: BrickType.OFFENSIVE_DYNAMITE }, 1);
      expect(brick.isIndestructible()).toBe(false);
    });
  });
});
