/**
 * Integration tests for CollisionManager
 * Tests the orchestration of collision detection and callbacks
 */

import { CollisionManager } from '../../src/renderer/game/CollisionManager';
import { Ball } from '../../src/renderer/game/Ball';
import { Bat } from '../../src/renderer/game/Bat';
import { Level } from '../../src/renderer/game/Level';
import { Laser } from '../../src/renderer/game/Laser';
import { GameUpgrades } from '../../src/renderer/game/GameUpgrades';
import { LevelConfig, BrickType, UpgradeType } from '../../src/renderer/game/types';

describe('CollisionManager Integration', () => {
  let collisionManager: CollisionManager;
  let ball: Ball;
  let bat: Bat;
  let gameUpgrades: GameUpgrades;

  beforeEach(() => {
    collisionManager = new CollisionManager();
    ball = new Ball(400, 300, 10, 300);
    bat = new Bat(350, 500, 100, 10, 300);
    gameUpgrades = new GameUpgrades();
  });

  describe('Ball-Bat Collisions', () => {
    it('should bounce ball off bat', () => {
      // Position ball to collide with bat
      const batPos = bat.getPosition();
      ball.setPosition(batPos.x + 50, batPos.y - 5);
      ball.setVelocity(0, 100); // Moving down

      const initialVelocity = ball.getVelocity();
      expect(initialVelocity.y).toBeGreaterThan(0);

      collisionManager.checkBallBatCollision(ball, bat);

      const finalVelocity = ball.getVelocity();
      expect(finalVelocity.y).toBeLessThan(0); // Should bounce up
    });

    it('should not bounce grey ball', () => {
      const batPos = bat.getPosition();
      ball.setPosition(batPos.x + 50, batPos.y - 5);
      ball.setVelocity(0, 100);
      ball.setGrey(true);

      const initialVelocity = ball.getVelocity();
      collisionManager.checkBallBatCollision(ball, bat);
      const finalVelocity = ball.getVelocity();

      expect(finalVelocity.y).toBe(initialVelocity.y); // No bounce
    });
  });

  describe('Ball-Brick Collisions', () => {
    let level: Level;

    beforeEach(() => {
      const levelConfig: LevelConfig = {
        id: 1,
        name: 'Test Level',
        bricks: [
          { col: 5, row: 2, type: BrickType.NORMAL },
          { col: 6, row: 2, type: BrickType.HEALTHY },
          { col: 7, row: 2, type: BrickType.INDESTRUCTIBLE },
        ],
        baseHealth: 1,
      };
      level = new Level(levelConfig, 800);
    });

    it('should damage normal brick on collision', () => {
      const onBrickHit = jest.fn();
      collisionManager.setCallbacks({ onBrickHit });

      const bricks = level.getActiveBricks();
      const normalBrick = bricks.find(b => !b.isIndestructible() && b.getMaxHealth() === 1);
      expect(normalBrick).toBeDefined();

      if (normalBrick) {
        const bounds = normalBrick.getBounds();
        ball.setPosition(bounds.x + bounds.width / 2, bounds.y + bounds.height / 2);
        ball.setDamage(1);

        collisionManager.checkBallBrickCollisions(ball, level, gameUpgrades);

        expect(onBrickHit).toHaveBeenCalled();
      }
    });

    it('should destroy brick when health reaches zero', () => {
      const onBrickDestroyed = jest.fn();
      collisionManager.setCallbacks({ onBrickDestroyed });

      const bricks = level.getActiveBricks();
      const normalBrick = bricks.find(b => !b.isIndestructible() && b.getMaxHealth() === 1);

      if (normalBrick) {
        const bounds = normalBrick.getBounds();
        ball.setPosition(bounds.x + bounds.width / 2, bounds.y + bounds.height / 2);
        ball.setDamage(10); // Enough to destroy

        collisionManager.checkBallBrickCollisions(ball, level, gameUpgrades);

        expect(onBrickDestroyed).toHaveBeenCalled();
        expect(normalBrick.isDestroyed()).toBe(true);
      }
    });

    it('should not destroy indestructible bricks', () => {
      const onBrickHit = jest.fn();
      const onBrickDestroyed = jest.fn();
      collisionManager.setCallbacks({ onBrickHit, onBrickDestroyed });

      const bricks = level.getActiveBricks();
      const indestructibleBrick = bricks.find(b => b.isIndestructible());
      expect(indestructibleBrick).toBeDefined();

      if (indestructibleBrick) {
        const initialHealth = indestructibleBrick.getHealth();
        const bounds = indestructibleBrick.getBounds();
        ball.setPosition(bounds.x + bounds.width / 2, bounds.y + bounds.height / 2);
        ball.setDamage(999);

        collisionManager.checkBallBrickCollisions(ball, level, gameUpgrades);

        expect(indestructibleBrick.getHealth()).toBe(initialHealth);
        expect(indestructibleBrick.isDestroyed()).toBe(false);
        expect(onBrickDestroyed).not.toHaveBeenCalled();
      }
    });

    it('should handle critical hits when upgrade is active', () => {
      const upgrades = new Map<string, number>();
      upgrades.set(UpgradeType.BALL_ADD_CRITICAL_HITS, 1);
      gameUpgrades.setUpgradeLevels(upgrades);

      const onBrickHit = jest.fn();
      collisionManager.setCallbacks({ onBrickHit });

      const bricks = level.getActiveBricks();
      const brick = bricks[0];
      const bounds = brick.getBounds();

      // Try multiple times to get a critical hit (10% chance)
      let gotCritical = false;
      for (let i = 0; i < 100 && !gotCritical; i++) {
        onBrickHit.mockClear();
        brick.setHealth(10);
        ball.setPosition(bounds.x + bounds.width / 2, bounds.y + bounds.height / 2);

        collisionManager.checkBallBrickCollisions(ball, level, gameUpgrades);

        if (onBrickHit.mock.calls.length > 0) {
          const isCritical = onBrickHit.mock.calls[0][2];
          if (isCritical) {
            gotCritical = true;
          }
        }
      }

      // With 100 attempts at 10% chance, should get at least one
      expect(gotCritical).toBe(true);
    });

    it('should handle explosions when upgrade is active', () => {
      const upgrades = new Map<string, number>();
      upgrades.set(UpgradeType.BALL_EXPLOSIONS, 1);
      gameUpgrades.setUpgradeLevels(upgrades);

      const onExplosionDamage = jest.fn();
      collisionManager.setCallbacks({ onExplosionDamage });

      const bricks = level.getActiveBricks();
      const brick = bricks[0];
      const bounds = brick.getBounds();
      ball.setPosition(bounds.x + bounds.width / 2, bounds.y + bounds.height / 2);

      collisionManager.checkBallBrickCollisions(ball, level, gameUpgrades);

      // Should trigger explosion damage to nearby bricks
      expect(onExplosionDamage).toHaveBeenCalled();
    });

    it('should handle piercing when upgrade is active', () => {
      const upgrades = new Map<string, number>();
      upgrades.set(UpgradeType.BALL_ADD_PIERCING, 1);
      gameUpgrades.setUpgradeLevels(upgrades);

      const onBrickHit = jest.fn();
      collisionManager.setCallbacks({ onBrickHit });

      const bricks = level.getActiveBricks();
      const brick = bricks[0];
      const bounds = brick.getBounds();
      ball.setPosition(bounds.x + bounds.width / 2, bounds.y + bounds.height / 2);

      collisionManager.checkBallBrickCollisions(ball, level, gameUpgrades);

      // Should hit brick (piercing allows hitting multiple)
      expect(onBrickHit).toHaveBeenCalled();
    });
  });

  describe('Laser-Brick Collisions', () => {
    let level: Level;
    let lasers: Laser[];

    beforeEach(() => {
      const levelConfig: LevelConfig = {
        id: 1,
        name: 'Test Level',
        bricks: [
          { col: 5, row: 2, type: BrickType.NORMAL },
          { col: 6, row: 2, type: BrickType.HEALTHY },
        ],
        baseHealth: 1,
      };
      level = new Level(levelConfig, 800);
      lasers = [];
    });

    it('should damage brick when laser hits', () => {
      const onBrickHit = jest.fn();
      collisionManager.setCallbacks({ onBrickHit });

      const bricks = level.getActiveBricks();
      const brick = bricks[0];
      const bounds = brick.getBounds();

      const laser = new Laser(
        bounds.x + bounds.width / 2,
        bounds.y + bounds.height / 2,
        500,
        1
      );
      lasers.push(laser);

      collisionManager.checkLaserBrickCollisions(lasers, level);

      expect(onBrickHit).toHaveBeenCalled();
    });

    it('should deactivate laser after hitting brick', () => {
      const bricks = level.getActiveBricks();
      const brick = bricks[0];
      const bounds = brick.getBounds();

      const laser = new Laser(
        bounds.x + bounds.width / 2,
        bounds.y + bounds.height / 2,
        500,
        1
      );
      lasers.push(laser);

      expect(laser.isActive()).toBe(true);

      collisionManager.checkLaserBrickCollisions(lasers, level);

      expect(laser.isActive()).toBe(false);
    });

    it('should destroy brick when laser damage is sufficient', () => {
      const onBrickDestroyed = jest.fn();
      collisionManager.setCallbacks({ onBrickDestroyed });

      const bricks = level.getActiveBricks();
      const brick = bricks[0];
      const bounds = brick.getBounds();

      const laser = new Laser(
        bounds.x + bounds.width / 2,
        bounds.y + bounds.height / 2,
        500,
        10 // High damage
      );
      lasers.push(laser);

      collisionManager.checkLaserBrickCollisions(lasers, level);

      expect(onBrickDestroyed).toHaveBeenCalled();
      expect(brick.isDestroyed()).toBe(true);
    });

    it('should handle multiple lasers hitting different bricks', () => {
      const onBrickHit = jest.fn();
      collisionManager.setCallbacks({ onBrickHit });

      const bricks = level.getActiveBricks();

      // Create laser for each brick
      bricks.forEach(brick => {
        const bounds = brick.getBounds();
        const laser = new Laser(
          bounds.x + bounds.width / 2,
          bounds.y + bounds.height / 2,
          500,
          1
        );
        lasers.push(laser);
      });

      collisionManager.checkLaserBrickCollisions(lasers, level);

      expect(onBrickHit).toHaveBeenCalledTimes(bricks.length);
    });

    it('should not check inactive lasers', () => {
      const onBrickHit = jest.fn();
      collisionManager.setCallbacks({ onBrickHit });

      const bricks = level.getActiveBricks();
      const brick = bricks[0];
      const bounds = brick.getBounds();

      const laser = new Laser(
        bounds.x + bounds.width / 2,
        bounds.y + bounds.height / 2,
        500,
        1
      );
      laser.deactivate();
      lasers.push(laser);

      collisionManager.checkLaserBrickCollisions(lasers, level);

      expect(onBrickHit).not.toHaveBeenCalled();
    });
  });

  describe('Callback System', () => {
    it('should accept and store callbacks', () => {
      const callbacks = {
        onBrickHit: jest.fn(),
        onBrickDestroyed: jest.fn(),
        onExplosionDamage: jest.fn(),
      };

      expect(() => {
        collisionManager.setCallbacks(callbacks);
      }).not.toThrow();
    });

    it('should work with partial callbacks', () => {
      expect(() => {
        collisionManager.setCallbacks({ onBrickHit: jest.fn() });
      }).not.toThrow();
    });

    it('should work with empty callbacks', () => {
      expect(() => {
        collisionManager.setCallbacks({});
      }).not.toThrow();
    });
  });

  describe('Integration Scenarios', () => {
    it('should handle complete collision workflow', () => {
      const levelConfig: LevelConfig = {
        id: 1,
        name: 'Test Level',
        bricks: [
          { col: 5, row: 2, type: BrickType.NORMAL },
        ],
        baseHealth: 1,
      };
      const level = new Level(levelConfig, 800);

      const onBrickHit = jest.fn();
      const onBrickDestroyed = jest.fn();
      collisionManager.setCallbacks({ onBrickHit, onBrickDestroyed });

      const bricks = level.getActiveBricks();
      const brick = bricks[0];
      const bounds = brick.getBounds();

      // Position ball to hit brick
      ball.setPosition(bounds.x + bounds.width / 2, bounds.y + bounds.height / 2);
      ball.setDamage(1);

      // Hit should destroy brick (1 damage = 1 health with baseHealth 1)
      collisionManager.checkBallBrickCollisions(ball, level, gameUpgrades);
      expect(onBrickHit).toHaveBeenCalledTimes(1);
      expect(onBrickDestroyed).toHaveBeenCalledTimes(1);
      expect(brick.isDestroyed()).toBe(true);

      // Verify brick is destroyed
      expect(level.getActiveBricks()).toHaveLength(0);
    });

    it('should handle level with mixed brick types', () => {
      const levelConfig: LevelConfig = {
        id: 1,
        name: 'Test Level',
        bricks: [
          { col: 5, row: 2, type: BrickType.NORMAL },
          { col: 6, row: 2, type: BrickType.HEALTHY },
          { col: 7, row: 2, type: BrickType.INDESTRUCTIBLE },
        ],
        baseHealth: 2,
      };
      const level = new Level(levelConfig, 800);

      const bricks = level.getActiveBricks();
      expect(bricks).toHaveLength(3);

      const normalBrick = bricks.find(b => !b.isIndestructible() && b.getMaxHealth() === 2);
      const healthyBrick = bricks.find(b => !b.isIndestructible() && b.getMaxHealth() === 6);
      const indestructibleBrick = bricks.find(b => b.isIndestructible());

      expect(normalBrick).toBeDefined();
      expect(healthyBrick).toBeDefined();
      expect(indestructibleBrick).toBeDefined();

      // Normal brick should have 2 health (baseHealth * 1)
      expect(normalBrick?.getHealth()).toBe(2);
      // Healthy brick should have 6 health (baseHealth * 3)
      expect(healthyBrick?.getHealth()).toBe(6);
      // Indestructible should have infinite health
      expect(indestructibleBrick?.getHealth()).toBe(Infinity);
    });
  });
});
