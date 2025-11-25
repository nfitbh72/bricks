/**
 * Tests for OFFENSIVE_BOMB brick type
 */

import { Brick } from '../../src/renderer/game/entities/Brick';
import { BrickType } from '../../src/renderer/game/core/types';
import { getBrickColorByType } from '../../src/renderer/config/brickLayout';

describe('Brick - OFFENSIVE_BOMB Type', () => {
  describe('BrickType enum', () => {
    it('should have OFFENSIVE_BOMB type', () => {
      expect(BrickType.OFFENSIVE_BOMB).toBe('OFFENSIVE_BOMB');
    });
  });

  describe('isOffensive', () => {
    it('should return true for OFFENSIVE_BOMB', () => {
      const brick = new Brick({ col: 0, row: 0, type: BrickType.OFFENSIVE_BOMB }, 1);
      expect(brick.isOffensive()).toBe(true);
    });
  });

  describe('getType', () => {
    it('should return OFFENSIVE_BOMB', () => {
      const brick = new Brick({ col: 0, row: 0, type: BrickType.OFFENSIVE_BOMB }, 1);
      expect(brick.getType()).toBe(BrickType.OFFENSIVE_BOMB);
    });
  });

  describe('getColor - OFFENSIVE_BOMB', () => {
    it('should return distinct color for OFFENSIVE_BOMB', () => {
      const brick = new Brick({ col: 0, row: 0, type: BrickType.OFFENSIVE_BOMB }, 1);
      expect(brick.getColor()).toBe(getBrickColorByType(BrickType.OFFENSIVE_BOMB));
    });

    it('should use custom color if provided', () => {
      const customColor = '#123456';
      const brick = new Brick({ col: 0, row: 0, type: BrickType.OFFENSIVE_BOMB, color: customColor }, 1);
      expect(brick.getColor()).toBe(customColor);
    });
  });

  describe('health - OFFENSIVE_BOMB', () => {
    it('should have 1x health multiplier for OFFENSIVE_BOMB', () => {
      const brick = new Brick({ col: 0, row: 0, type: BrickType.OFFENSIVE_BOMB }, 2);
      expect(brick.getHealth()).toBe(2); // baseHealth * 1
    });
  });

  describe('takeDamage - OFFENSIVE_BOMB', () => {
    it('should take damage normally', () => {
      const brick = new Brick({ col: 0, row: 0, type: BrickType.OFFENSIVE_BOMB }, 3);
      brick.takeDamage(1);
      expect(brick.getHealth()).toBe(2);
    });

    it('should be destroyed when health reaches zero', () => {
      const brick = new Brick({ col: 0, row: 0, type: BrickType.OFFENSIVE_BOMB }, 1);
      brick.takeDamage(1);
      expect(brick.isDestroyed()).toBe(true);
    });
  });

  describe('isIndestructible - OFFENSIVE_BOMB', () => {
    it('should return false for OFFENSIVE_BOMB', () => {
      const brick = new Brick({ col: 0, row: 0, type: BrickType.OFFENSIVE_BOMB }, 1);
      expect(brick.isIndestructible()).toBe(false);
    });
  });
});
