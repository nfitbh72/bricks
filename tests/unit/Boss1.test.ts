/**
 * Tests for Boss1 - The Thrower boss
 */

import { Boss1 } from '../../src/renderer/game/entities/offensive/Boss1';
import { Brick } from '../../src/renderer/game/entities/Brick';
import { BrickType } from '../../src/renderer/game/core/types';

describe('Boss1', () => {
  let boss: Boss1;
  let mockCtx: any;
  const canvasWidth = 800;
  const canvasHeight = 600;

  beforeEach(() => {
    boss = new Boss1(400, 200, 100, '#ff0000', canvasWidth, canvasHeight);
    mockCtx = {
      save: jest.fn(),
      restore: jest.fn(),
      fillRect: jest.fn(),
      strokeRect: jest.fn(),
      fillText: jest.fn(),
      translate: jest.fn(),
      rotate: jest.fn(),
      shadowBlur: 0,
      shadowColor: '',
      fillStyle: '',
      strokeStyle: '',
      lineWidth: 0,
      font: '',
      textAlign: '',
      textBaseline: '',
    };
  });

  describe('initialization', () => {
    it('should initialize with correct position', () => {
      expect(boss.getBounds()).toEqual({
        x: 400,
        y: 200,
        width: 120,
        height: 25,
      });
    });

    it('should initialize with correct health', () => {
      expect(boss.getHealth()).toBe(100);
      expect(boss.getMaxHealth()).toBe(100);
    });

    it('should initialize as active', () => {
      expect(boss.isActive()).toBe(true);
    });

    it('should spawn with arms', () => {
      // Boss1 should spawn 2 arms in constructor
      // We can't directly test arms, but we can verify rendering includes them
      boss.render(mockCtx);
      expect(mockCtx.save).toHaveBeenCalled();
      expect(mockCtx.restore).toHaveBeenCalled();
    });
  });

  describe('update', () => {
    it('should update position over time', () => {
      const initialBounds = boss.getBounds()!;
      
      boss.updateBoss(1, 400, 500);
      
      const newBounds = boss.getBounds()!;
      // Position should change (either x or y)
      expect(
        newBounds.x !== initialBounds.x || newBounds.y !== initialBounds.y
      ).toBe(true);
    });

    it('should not update when inactive', () => {
      boss.takeDamage(100);
      const bounds = boss.getBounds();
      
      boss.updateBoss(1, 400, 500);
      
      expect(boss.getBounds()).toBe(bounds);
    });

    it('should update arms position', () => {
      // Arms should follow boss position
      boss.updateBoss(1, 400, 500);
      
      // Verify by rendering - arms should be rendered
      boss.render(mockCtx);
      expect(mockCtx.fillRect).toHaveBeenCalled();
    });

    it('should throw bricks after cooldown', () => {
      const mockBricks = [
        new Brick({ row: 0, col: 0, type: BrickType.NORMAL }, 1),
      ];
      boss.setAvailableBricks(mockBricks);
      
      expect(boss.getThrownBricks()).toHaveLength(0);
      
      // Wait for throw interval (2 seconds)
      boss.updateBoss(2.1, 400, 500);
      
      expect(boss.getThrownBricks().length).toBeGreaterThan(0);
    });

  });

  describe('takeDamage', () => {
    it('should reduce health', () => {
      boss.takeDamage(30);
      expect(boss.getHealth()).toBe(70);
    });

    it('should deactivate when health reaches zero', () => {
      boss.takeDamage(100);
      expect(boss.isActive()).toBe(false);
      expect(boss.isDestroyed()).toBe(true);
    });

    it('should handle multiple hits', () => {
      boss.takeDamage(20);
      boss.takeDamage(30);
      expect(boss.getHealth()).toBe(50);
    });
  });

  describe('thrown bricks', () => {
    it('should throw bricks toward bat position', () => {
      const mockBricks = [
        new Brick({ row: 0, col: 0, type: BrickType.NORMAL }, 1),
      ];
      boss.setAvailableBricks(mockBricks);
      
      boss.updateBoss(2.1, 400, 500);
      
      const thrownBricks = boss.getThrownBricks();
      expect(thrownBricks.length).toBeGreaterThan(0);
      expect(thrownBricks[0].isActive()).toBe(true);
    });

    it('should remove bricks from available when thrown', () => {
      const mockBricks = [
        new Brick({ row: 0, col: 0, type: BrickType.NORMAL }, 1),
        new Brick({ row: 0, col: 1, type: BrickType.NORMAL }, 1),
      ];
      boss.setAvailableBricks(mockBricks);
      
      boss.updateBoss(0.1, 400, 500); // Throw first (cooldown starts at 0)
      boss.updateBoss(2.1, 400, 500); // Throw second
      
      // Bricks may have gone off-screen and been removed
      // Try to throw again - should not throw (no bricks left in available)
      const countBefore = boss.getThrownBricks().length;
      boss.updateBoss(2.1, 400, 500);
      const countAfter = boss.getThrownBricks().length;
      
      // Count should not increase (no new bricks thrown)
      expect(countAfter).toBeLessThanOrEqual(countBefore);
    });

    it('should not throw when no bricks available', () => {
      boss.setAvailableBricks([]);
      
      boss.updateBoss(3, 400, 500);
      
      expect(boss.getThrownBricks()).toHaveLength(0);
    });
  });

  describe('render', () => {
    it('should not render when inactive', () => {
      boss.takeDamage(100);
      mockCtx.fillRect.mockClear();
      
      boss.render(mockCtx);
      
      expect(mockCtx.fillRect).not.toHaveBeenCalled();
    });

    it('should render boss body', () => {
      boss.render(mockCtx);
      
      expect(mockCtx.fillRect).toHaveBeenCalled();
      expect(mockCtx.strokeRect).toHaveBeenCalled();
      expect(mockCtx.fillText).toHaveBeenCalledWith('BOSS', expect.any(Number), expect.any(Number));
    });

    it('should render arms', () => {
      boss.render(mockCtx);
      
      // Arms should be rendered (multiple fillRect calls)
      expect(mockCtx.fillRect.mock.calls.length).toBeGreaterThan(2);
    });

    it('should render health bar', () => {
      boss.render(mockCtx);
      
      // Health bar background + health fill
      const fillRectCalls = mockCtx.fillRect.mock.calls.length;
      expect(fillRectCalls).toBeGreaterThanOrEqual(2);
    });

    it('should render thrown bricks', () => {
      const mockBricks = [
        new Brick({ row: 0, col: 0, type: BrickType.NORMAL }, 1),
      ];
      boss.setAvailableBricks(mockBricks);
      boss.updateBoss(2.1, 400, 500);
      
      boss.render(mockCtx);
      
      // Should include thrown brick rendering
      expect(mockCtx.save).toHaveBeenCalled();
      expect(mockCtx.restore).toHaveBeenCalled();
    });

    it('should use save/restore for rendering', () => {
      boss.render(mockCtx);
      
      expect(mockCtx.save).toHaveBeenCalled();
      expect(mockCtx.restore).toHaveBeenCalled();
    });
  });

  describe('movement boundaries', () => {
    it('should stay within canvas bounds', () => {
      // Update many times to test boundary clamping
      for (let i = 0; i < 100; i++) {
        boss.updateBoss(0.1, 0, 0);
      }
      
      const bounds = boss.getBounds()!;
      expect(bounds.x).toBeGreaterThanOrEqual(40);
      expect(bounds.x).toBeLessThanOrEqual(720);
      expect(bounds.y).toBeGreaterThanOrEqual(60);
      expect(bounds.y).toBeLessThanOrEqual(300);
    });
  });

  describe('getBounds', () => {
    it('should return correct bounds when active', () => {
      const bounds = boss.getBounds();
      expect(bounds).not.toBeNull();
      expect(bounds!.width).toBe(120);
      expect(bounds!.height).toBe(25);
    });

    it('should return null when inactive', () => {
      boss.takeDamage(100);
      expect(boss.getBounds()).toBeNull();
    });
  });
});
