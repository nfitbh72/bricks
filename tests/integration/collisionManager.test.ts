/**
 * Integration tests for CollisionManager
 * Tests the orchestration of collision detection and callbacks
 */

import { CollisionManager } from '../../src/renderer/game/managers/CollisionManager';
import { Ball } from '../../src/renderer/game/entities/Ball';
import { Bat } from '../../src/renderer/game/entities/Bat';
import { Level } from '../../src/renderer/game/entities/Level';
import { LevelFactory } from '../../src/renderer/game/factories/LevelFactory';
import { Laser } from '../../src/renderer/game/weapons/Laser';
import { GameUpgrades } from '../../src/renderer/game/systems/GameUpgrades';
import { LevelConfig, BrickType, UpgradeType } from '../../src/renderer/game/core/types';
import { GameContext } from '../../src/renderer/game/core/GameContext';
import { GameEvents } from '../../src/renderer/game/core/EventManager';

describe('CollisionManager Integration', () => {
  let collisionManager: CollisionManager;
  let ball: Ball;
  let bat: Bat;
  let gameUpgrades: GameUpgrades;

  let context: GameContext;
  let emitSpy: jest.SpyInstance;

  beforeEach(() => {
    context = new GameContext();
    emitSpy = jest.spyOn(context.eventManager, 'emit');
    collisionManager = new CollisionManager(context);
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

    it('should bounce ball off bottom of bat', () => {
      // Position ball to collide with bottom of bat
      const batPos = bat.getPosition();
      const batHeight = bat.getHeight();
      ball.setPosition(batPos.x + 50, batPos.y + batHeight + 5);
      ball.setVelocity(0, -100); // Moving up

      const initialVelocity = ball.getVelocity();
      expect(initialVelocity.y).toBeLessThan(0);

      collisionManager.checkBallBatCollision(ball, bat);

      const finalVelocity = ball.getVelocity();
      expect(finalVelocity.y).toBeGreaterThan(0); // Should bounce down
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
      level = LevelFactory.createLevel(levelConfig, 800);
    });

    it('should damage normal brick on collision', () => {
      const bricks = level.getActiveBricks();
      const normalBrick = bricks.find(b => !b.isIndestructible() && b.getMaxHealth() === 1);
      expect(normalBrick).toBeDefined();

      if (normalBrick) {
        const bounds = normalBrick.getBounds();
        ball.setPosition(bounds.x + bounds.width / 2, bounds.y + bounds.height / 2);
        ball.setDamage(1);

        collisionManager.populateSpatialHash(level);
      collisionManager.checkBallBrickCollisions(ball, level, gameUpgrades);

        expect(emitSpy).toHaveBeenCalledWith(GameEvents.BRICK_HIT, expect.anything());
      }
    });

    it('should destroy brick when health reaches zero', () => {
      const bricks = level.getActiveBricks();
      const normalBrick = bricks.find(b => !b.isIndestructible() && b.getMaxHealth() === 1);

      if (normalBrick) {
        const bounds = normalBrick.getBounds();
        ball.setPosition(bounds.x + bounds.width / 2, bounds.y + bounds.height / 2);
        ball.setDamage(10); // Enough to destroy

        collisionManager.populateSpatialHash(level);
      collisionManager.checkBallBrickCollisions(ball, level, gameUpgrades);

        expect(emitSpy).toHaveBeenCalledWith(GameEvents.BRICK_DESTROYED, expect.anything());
        expect(normalBrick.isDestroyed()).toBe(true);
      }
    });

    it('should not destroy indestructible bricks', () => {
      const bricks = level.getActiveBricks();
      const indestructibleBrick = bricks.find(b => b.isIndestructible());
      expect(indestructibleBrick).toBeDefined();

      if (indestructibleBrick) {
        const initialHealth = indestructibleBrick.getHealth();
        const bounds = indestructibleBrick.getBounds();
        ball.setPosition(bounds.x + bounds.width / 2, bounds.y + bounds.height / 2);
        ball.setDamage(999);

        collisionManager.populateSpatialHash(level);
      collisionManager.checkBallBrickCollisions(ball, level, gameUpgrades);

        expect(indestructibleBrick.getHealth()).toBe(initialHealth);
        expect(indestructibleBrick.isDestroyed()).toBe(false);
        expect(emitSpy).toHaveBeenCalledWith(GameEvents.BRICK_HIT, expect.objectContaining({
          brick: indestructibleBrick,
          damage: 0,
          isCritical: false
        }));
        expect(emitSpy).not.toHaveBeenCalledWith(GameEvents.BRICK_DESTROYED, expect.anything());
      }
    });

    it('should handle critical hits when upgrade is active', () => {
      const upgrades = new Map<string, number>();
      upgrades.set(UpgradeType.BALL_ADD_CRITICAL_HITS, 1);
      gameUpgrades.setUpgradeLevels(upgrades);

      const bricks = level.getActiveBricks();
      const brick = bricks[0];
      const bounds = brick.getBounds();

      // Try multiple times to get a critical hit (10% chance)
      let gotCritical = false;
      for (let i = 0; i < 100 && !gotCritical; i++) {
        emitSpy.mockClear();
        brick.setHealth(10);
        ball.setPosition(bounds.x + bounds.width / 2, bounds.y + bounds.height / 2);

        collisionManager.populateSpatialHash(level);
      collisionManager.checkBallBrickCollisions(ball, level, gameUpgrades);

        const calls = emitSpy.mock.calls.filter(call => call[0] === GameEvents.BRICK_HIT);
        if (calls.length > 0) {
          const data = calls[0][1];
          if (data.isCritical) {
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

      const bricks = level.getActiveBricks();
      const brick = bricks[0];
      const bounds = brick.getBounds();
      ball.setPosition(bounds.x + bounds.width / 2, bounds.y + bounds.height / 2);

      collisionManager.populateSpatialHash(level);
      collisionManager.checkBallBrickCollisions(ball, level, gameUpgrades);

      // Should trigger explosion damage to nearby bricks
      expect(emitSpy).toHaveBeenCalledWith('explosion_damage', expect.anything());
    });

    it('should not trigger explosions when hitting indestructible bricks', () => {
      const upgrades = new Map<string, number>();
      upgrades.set(UpgradeType.BALL_EXPLOSIONS, 1);
      gameUpgrades.setUpgradeLevels(upgrades);

      const bricks = level.getActiveBricks();
      const indestructibleBrick = bricks.find(b => b.isIndestructible());
      expect(indestructibleBrick).toBeDefined();

      if (indestructibleBrick) {
        const bounds = indestructibleBrick.getBounds();
        ball.setPosition(bounds.x + bounds.width / 2, bounds.y + bounds.height / 2);

        collisionManager.populateSpatialHash(level);
      collisionManager.checkBallBrickCollisions(ball, level, gameUpgrades);

        // Should NOT trigger explosion damage for indestructible bricks
        expect(emitSpy).not.toHaveBeenCalledWith('explosion_damage', expect.anything());
      }
    });

    it('should handle piercing when upgrade is active', () => {
      const upgrades = new Map<string, number>();
      upgrades.set(UpgradeType.BALL_ADD_PIERCING, 1);
      gameUpgrades.setUpgradeLevels(upgrades);

      const bricks = level.getActiveBricks();
      const brick = bricks[0];
      const bounds = brick.getBounds();
      ball.setPosition(bounds.x + bounds.width / 2, bounds.y + bounds.height / 2);

      collisionManager.populateSpatialHash(level);
      collisionManager.checkBallBrickCollisions(ball, level, gameUpgrades);

      // Should hit brick (piercing allows hitting multiple)
      expect(emitSpy).toHaveBeenCalledWith(GameEvents.BRICK_HIT, expect.anything());
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
      level = LevelFactory.createLevel(levelConfig, 800);
      lasers = [];
    });

    it('should damage brick when laser hits', () => {
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

      collisionManager.populateSpatialHash(level);
      collisionManager.checkLaserBrickCollisions(lasers, level);

      expect(emitSpy).toHaveBeenCalledWith(GameEvents.BRICK_HIT, expect.anything());
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

      collisionManager.populateSpatialHash(level);
      collisionManager.checkLaserBrickCollisions(lasers, level);

      expect(laser.isActive()).toBe(false);
    });

    it('should destroy brick when laser damage is sufficient', () => {
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

      collisionManager.populateSpatialHash(level);
      collisionManager.checkLaserBrickCollisions(lasers, level);

      expect(emitSpy).toHaveBeenCalledWith(GameEvents.BRICK_DESTROYED, expect.anything());
      expect(brick.isDestroyed()).toBe(true);
    });

    it('should handle multiple lasers hitting different bricks', () => {
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

      collisionManager.populateSpatialHash(level);
      collisionManager.checkLaserBrickCollisions(lasers, level);

      // Check that BRICK_HIT was emitted for each brick
      const hitEvents = emitSpy.mock.calls.filter(call => call[0] === GameEvents.BRICK_HIT);
      expect(hitEvents.length).toBe(bricks.length);
    });

    it('should not check inactive lasers', () => {
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

      collisionManager.populateSpatialHash(level);
      collisionManager.checkLaserBrickCollisions(lasers, level);

      expect(emitSpy).not.toHaveBeenCalledWith(GameEvents.BRICK_HIT, expect.anything());
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
      const level = LevelFactory.createLevel(levelConfig, 800);

      const bricks = level.getActiveBricks();
      const brick = bricks[0];
      const bounds = brick.getBounds();

      // Position ball to hit brick
      ball.setPosition(bounds.x + bounds.width / 2, bounds.y + bounds.height / 2);
      ball.setDamage(1);

      // Hit should destroy brick (1 damage = 1 health with baseHealth 1)
      collisionManager.populateSpatialHash(level);
      collisionManager.checkBallBrickCollisions(ball, level, gameUpgrades);

      expect(emitSpy).toHaveBeenCalledWith(GameEvents.BRICK_HIT, expect.anything());
      expect(emitSpy).toHaveBeenCalledWith(GameEvents.BRICK_DESTROYED, expect.anything());
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
      const level = LevelFactory.createLevel(levelConfig, 800);

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
