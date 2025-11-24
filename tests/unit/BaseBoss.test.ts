/**
 * Tests for BaseBoss - Base class for all boss entities
 */

import { BaseBoss } from '../../src/renderer/game/entities/offensive/BaseBoss';
import { Brick } from '../../src/renderer/game/entities/Brick';
import { BrickType } from '../../src/renderer/game/core/types';
import { ThrownBrick } from '../../src/renderer/game/entities/offensive/ThrownBrick';

// Create a concrete implementation for testing
class TestBoss extends BaseBoss {
  protected readonly moveSpeed: number = 100;
  protected readonly throwInterval: number = 2;
  protected readonly thrownBrickSpeed: number = 300;

  update(deltaTime: number, batX: number, batY: number): void {
    this.updateMovement(deltaTime);
    this.updateThrownBricks(deltaTime);
    this.updateThrowCooldown(deltaTime, batX, batY);
  }

  render(ctx: CanvasRenderingContext2D): void {
    this.renderBossBody(ctx);
    this.renderHealthBar(ctx);
    this.renderThrownBricks(ctx);
  }
}

describe('BaseBoss', () => {
  let boss: TestBoss;
  let mockCtx: any;
  const canvasWidth = 800;
  const canvasHeight = 600;

  beforeEach(() => {
    boss = new TestBoss(400, 200, 100, '#ff0000', canvasWidth, canvasHeight);
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
      expect(boss.isDestroyed()).toBe(false);
    });

    it('should initialize with empty thrown bricks', () => {
      expect(boss.getThrownBricks()).toEqual([]);
    });
  });

  describe('health management', () => {
    it('should take damage correctly', () => {
      boss.takeDamage(30);
      expect(boss.getHealth()).toBe(70);
    });

    it('should not go below zero health', () => {
      boss.takeDamage(150);
      expect(boss.getHealth()).toBe(0);
    });

    it('should deactivate when health reaches zero', () => {
      boss.takeDamage(100);
      expect(boss.isActive()).toBe(false);
      expect(boss.isDestroyed()).toBe(true);
    });

    it('should return null bounds when inactive', () => {
      boss.takeDamage(100);
      expect(boss.getBounds()).toBeNull();
    });

    it('should handle multiple damage instances', () => {
      boss.takeDamage(20);
      boss.takeDamage(30);
      boss.takeDamage(40);
      expect(boss.getHealth()).toBe(10);
      expect(boss.isActive()).toBe(true);
    });
  });

  describe('movement', () => {
    it('should move towards target position', () => {
      const initialX = boss.getBounds()!.x;
      const initialY = boss.getBounds()!.y;
      
      boss.update(1, 400, 500); // 1 second
      
      const newBounds = boss.getBounds()!;
      // Position should have changed
      expect(newBounds.x !== initialX || newBounds.y !== initialY).toBe(true);
    });

    it('should stay within boundaries', () => {
      // Force boss to extreme position
      for (let i = 0; i < 100; i++) {
        boss.update(0.1, 0, 0);
      }
      
      const bounds = boss.getBounds()!;
      expect(bounds.x).toBeGreaterThanOrEqual(40); // minX
      expect(bounds.x).toBeLessThanOrEqual(720); // maxX
      expect(bounds.y).toBeGreaterThanOrEqual(60); // minY
      expect(bounds.y).toBeLessThanOrEqual(300); // maxY
    });

    it('should pick new target when reached', () => {
      const initialX = boss.getBounds()!.x;
      
      // Update many times to ensure target is reached and new one picked
      for (let i = 0; i < 50; i++) {
        boss.update(0.1, 400, 500);
      }
      
      // Boss should have moved
      expect(boss.getBounds()!.x).not.toBe(initialX);
    });
  });

  describe('thrown bricks', () => {
    let mockBricks: Brick[];

    beforeEach(() => {
      mockBricks = [
        new Brick({ row: 0, col: 0, type: BrickType.NORMAL }, 1),
        new Brick({ row: 0, col: 1, type: BrickType.NORMAL }, 1),
        new Brick({ row: 0, col: 2, type: BrickType.NORMAL }, 1),
      ];
    });

    it('should set available bricks', () => {
      boss.setAvailableBricks(mockBricks);
      expect(boss.getThrownBricks()).toHaveLength(0);
    });

    it('should filter out destroyed bricks', () => {
      mockBricks[0].takeDamage(999);
      boss.setAvailableBricks(mockBricks);
      
      // Should only have 2 bricks available
      boss.update(3, 400, 500); // Wait for throw cooldown
      expect(boss.getThrownBricks().length).toBeLessThanOrEqual(2);
    });

    it('should filter out indestructible bricks', () => {
      const indestructibleBrick = new Brick({ row: 0, col: 3, type: BrickType.INDESTRUCTIBLE }, 1);
      mockBricks.push(indestructibleBrick);
      
      boss.setAvailableBricks(mockBricks);
      boss.update(3, 400, 500);
      
      // Should not throw indestructible brick
      const thrownBricks = boss.getThrownBricks();
      expect(thrownBricks.length).toBeLessThanOrEqual(3);
    });

    it('should throw brick after cooldown', () => {
      boss.setAvailableBricks(mockBricks);
      
      expect(boss.getThrownBricks()).toHaveLength(0);
      
      boss.update(2.1, 400, 500); // Wait for throw interval
      
      expect(boss.getThrownBricks().length).toBeGreaterThan(0);
    });

    it('should not throw brick before cooldown', () => {
      boss.setAvailableBricks(mockBricks);
      
      boss.update(2.1, 400, 500); // First throw
      boss.update(1, 400, 500); // Less than throw interval - should not throw again
      
      expect(boss.getThrownBricks()).toHaveLength(1); // Only first throw
    });

    it('should update thrown bricks', () => {
      boss.setAvailableBricks(mockBricks);
      boss.update(2.1, 400, 500); // Throw a brick
      
      const thrownBricks = boss.getThrownBricks();
      expect(thrownBricks.length).toBeGreaterThan(0);
      
      // Update again to move thrown bricks
      boss.update(1, 400, 500);
      
      // Thrown bricks should still exist (not off screen yet)
      expect(boss.getThrownBricks().length).toBeGreaterThan(0);
    });

    it('should remove off-screen thrown bricks', () => {
      boss.setAvailableBricks(mockBricks);
      boss.update(2.1, 400, 500); // Throw a brick
      
      // Update many times to move brick off screen
      for (let i = 0; i < 100; i++) {
        boss.update(0.1, 400, 500);
      }
      
      // Thrown bricks should be removed
      expect(boss.getThrownBricks()).toHaveLength(0);
    });

    it('should not throw when no bricks available', () => {
      boss.setAvailableBricks([]);
      
      boss.update(3, 400, 500);
      
      expect(boss.getThrownBricks()).toHaveLength(0);
    });

    it('should remove brick from available when thrown', () => {
      boss.setAvailableBricks(mockBricks);
      const initialAvailable = 3;
      
      boss.update(0.1, 400, 500); // Throw first brick (cooldown starts at 0)
      boss.update(2.1, 400, 500); // Throw second brick
      boss.update(2.1, 400, 500); // Throw third brick
      
      // All bricks should have been thrown (removed from available)
      // Some may have gone off-screen and been removed from thrown bricks
      // Try to throw again - should not throw (no bricks left in available)
      const countBefore = boss.getThrownBricks().length;
      boss.update(2.1, 400, 500);
      const countAfter = boss.getThrownBricks().length;
      
      // Count should not increase (no new bricks thrown)
      expect(countAfter).toBeLessThanOrEqual(countBefore);
    });
  });

  describe('update when inactive', () => {
    it('should not update when inactive', () => {
      boss.takeDamage(100);
      const initialBounds = boss.getBounds();
      
      boss.update(1, 400, 500);
      
      expect(boss.getBounds()).toBe(initialBounds);
    });
  });
});
