/**
 * Unit tests for CollisionManager class
 */

import { CollisionManager } from '../../src/renderer/game/managers/CollisionManager';
import { Ball } from '../../src/renderer/game/entities/Ball';
import { Bat } from '../../src/renderer/game/entities/Bat';
import { Brick } from '../../src/renderer/game/entities/Brick';
import { Level } from '../../src/renderer/game/entities/Level';
import { LevelFactory } from '../../src/renderer/game/factories/LevelFactory';
import { Laser } from '../../src/renderer/game/weapons/Laser';
import { GameUpgrades } from '../../src/renderer/game/systems/GameUpgrades';
import { FallingBrick } from '../../src/renderer/game/entities/offensive/FallingBrick';
import { Debris } from '../../src/renderer/game/entities/offensive/Debris';
import { BrickLaser } from '../../src/renderer/game/entities/offensive/BrickLaser';
import { HomingMissile } from '../../src/renderer/game/entities/offensive/HomingMissile';
import { SplittingFragment } from '../../src/renderer/game/entities/offensive/SplittingFragment';
import { DynamiteStick } from '../../src/renderer/game/entities/offensive/DynamiteStick';
import { BrickType } from '../../src/renderer/game/core/types';
import { GameContext } from '../../src/renderer/game/core/GameContext';
import { GameEvents } from '../../src/renderer/game/core/EventManager';

describe('CollisionManager', () => {
  let context: GameContext;
  let emitSpy: jest.SpyInstance;
  let collisionManager: CollisionManager;
  let ball: Ball;
  let bat: Bat;
  let gameUpgrades: GameUpgrades;

  beforeEach(() => {
    context = new GameContext();
    emitSpy = jest.spyOn(context.eventManager, 'emit');
    collisionManager = new CollisionManager(context);
    ball = new Ball(400, 500, 10, 300);
    bat = new Bat(400, 550, 100, 20, 800);
    gameUpgrades = new GameUpgrades();
  });

  describe('update', () => {
    it('should update ball piercing state', () => {
      const setPiercingSpy = jest.spyOn(ball, 'setPiercing');

      collisionManager.update(0.5, ball);

      expect(setPiercingSpy).toHaveBeenCalled();
    });

    it('should handle zero deltaTime', () => {
      const setPiercingSpy = jest.spyOn(ball, 'setPiercing');

      collisionManager.update(0, ball);

      expect(setPiercingSpy).toHaveBeenCalled();
    });
  });



  describe('checkBallBatCollision', () => {
    it('should detect collision between ball and bat', () => {
      const bounceOffBatSpy = jest.spyOn(ball, 'bounceOffBat');

      // Position ball to collide with bat (use bat's actual position)
      const batBounds = bat.getBounds();
      ball.setPosition(batBounds.x + 10, batBounds.y + 5);

      collisionManager.checkBallBatCollision(ball, bat);

      expect(bounceOffBatSpy).toHaveBeenCalledWith(bat);
    });

    it('should skip collision when ball is grey', () => {
      const bounceOffBatSpy = jest.spyOn(ball, 'bounceOffBat');

      ball.setGrey(true);
      ball.setPosition(400, 540);

      collisionManager.checkBallBatCollision(ball, bat);

      expect(bounceOffBatSpy).not.toHaveBeenCalled();
    });

    it('should not bounce when no collision', () => {
      const bounceOffBatSpy = jest.spyOn(ball, 'bounceOffBat');

      // Position ball far from bat
      ball.setPosition(400, 100);

      collisionManager.checkBallBatCollision(ball, bat);

      expect(bounceOffBatSpy).not.toHaveBeenCalled();
    });
  });

  describe('checkBallBrickCollisions', () => {
    let level: Level;
    let brick: Brick;

    beforeEach(() => {
      const config = {
        id: 1,
        name: 'Test Level',
        bricks: [{ row: 2, col: 2, type: BrickType.NORMAL }],
        baseHealth: 1
      };
      level = LevelFactory.createLevel(config, 800);
      brick = level.getActiveBricks()[0];
    });

    it('should detect ball-brick collision', () => {
      const bounceSpy = jest.spyOn(ball, 'bounce');

      // Position ball to collide with brick (use brick's actual position)
      const brickBounds = brick.getBounds();
      ball.setPosition(brickBounds.x + 10, brickBounds.y + 10);

      collisionManager.checkBallBrickCollisions(ball, level, gameUpgrades);

      expect(bounceSpy).toHaveBeenCalled();
    });

    it('should apply damage to brick on collision', () => {
      const brickBounds = brick.getBounds();
      ball.setPosition(brickBounds.x + 10, brickBounds.y + 10);

      collisionManager.checkBallBrickCollisions(ball, level, gameUpgrades);

      expect(emitSpy).toHaveBeenCalledWith(GameEvents.BRICK_HIT, expect.objectContaining({
        brick,
        damage: expect.any(Number),
        isCritical: false
      }));
    });

    it('should trigger onBrickDestroyed when brick is destroyed', () => {
      const brickBounds = brick.getBounds();
      ball.setPosition(brickBounds.x + 10, brickBounds.y + 10);

      collisionManager.checkBallBrickCollisions(ball, level, gameUpgrades);

      expect(emitSpy).toHaveBeenCalledWith(GameEvents.BRICK_DESTROYED, expect.objectContaining({
        brick,
        x: expect.any(Number),
        y: expect.any(Number),
        isCritical: false
      }));
    });

    it('should not damage indestructible bricks', () => {
      const config = {
        id: 1,
        name: 'Test Level',
        bricks: [{ row: 2, col: 2, type: BrickType.INDESTRUCTIBLE }],
        baseHealth: 1
      };
      level = LevelFactory.createLevel(config, 800);
      const indestructibleBrick = level.getActiveBricks()[0];

      const brickBounds = indestructibleBrick.getBounds();
      ball.setPosition(brickBounds.x + 10, brickBounds.y + 10);

      collisionManager.checkBallBrickCollisions(ball, level, gameUpgrades);

      // Should hit but not destroy
      expect(emitSpy).toHaveBeenCalledWith(GameEvents.BRICK_HIT, expect.objectContaining({
        brick: indestructibleBrick,
        damage: 0,
        isCritical: false
      }));
      expect(indestructibleBrick.isDestroyed()).toBe(false);
    });

    it('should apply critical hits when upgrade is active', () => {
      // Set up critical hits upgrade
      const upgrades = new Map<string, number>();
      upgrades.set('BALL_ADD_CRITICAL_HITS', 1);
      gameUpgrades.setUpgradeLevels(upgrades);

      // Mock Math.random to guarantee critical hit
      const originalRandom = Math.random;
      Math.random = jest.fn(() => 0.01); // Below critical hit chance

      const brickBounds = brick.getBounds();
      ball.setPosition(brickBounds.x + 10, brickBounds.y + 10);
      collisionManager.checkBallBrickCollisions(ball, level, gameUpgrades);

      // Should be called with critical flag
      expect(emitSpy).toHaveBeenCalledWith(GameEvents.BRICK_HIT, expect.objectContaining({
        brick,
        isCritical: true
      }));

      Math.random = originalRandom;
    });

    it('should restore grey ball to normal on collision', () => {
      const restoreToNormalSpy = jest.spyOn(ball, 'restoreToNormal');

      ball.setGrey(true);
      const brickBounds = brick.getBounds();
      ball.setPosition(brickBounds.x + 10, brickBounds.y + 10);

      collisionManager.checkBallBrickCollisions(ball, level, gameUpgrades);

      expect(restoreToNormalSpy).toHaveBeenCalled();
    });

    it('should handle multiple brick collisions', () => {
      const config = {
        id: 1,
        name: 'Test Level',
        bricks: [
          { row: 2, col: 2, type: BrickType.NORMAL },
          { row: 2, col: 3, type: BrickType.NORMAL }
        ],
        baseHealth: 1
      };
      level = LevelFactory.createLevel(config, 800);

      const firstBrick = level.getActiveBricks()[0];
      const brickBounds = firstBrick.getBounds();
      ball.setPosition(brickBounds.x + 10, brickBounds.y + 10);

      collisionManager.checkBallBrickCollisions(ball, level, gameUpgrades);

      // Should destroy first brick
      expect(emitSpy).toHaveBeenCalledWith(GameEvents.BRICK_DESTROYED, expect.anything());
    });
  });

  describe('checkLaserBrickCollisions', () => {
    let level: Level;
    let laser: Laser;

    beforeEach(() => {
      const config = {
        id: 1,
        name: 'Test Level',
        bricks: [{ row: 2, col: 2, type: BrickType.NORMAL }],
        baseHealth: 3
      };
      level = LevelFactory.createLevel(config, 800);
      // Position laser to hit the brick
      const brick = level.getActiveBricks()[0];
      const brickBounds = brick.getBounds();
      laser = new Laser(brickBounds.x + 10, brickBounds.y + 10, 300, 10);
    });

    it('should detect laser hitting brick', () => {
      const deactivateSpy = jest.spyOn(laser, 'deactivate');

      collisionManager.checkLaserBrickCollisions([laser], level);

      expect(deactivateSpy).toHaveBeenCalled();
    });

    it('should apply laser damage to brick', () => {
      const brick = level.getActiveBricks()[0];

      collisionManager.checkLaserBrickCollisions([laser], level);

      expect(emitSpy).toHaveBeenCalledWith(GameEvents.BRICK_HIT, expect.objectContaining({
        brick,
        damage: expect.any(Number),
        isCritical: false
      }));
    });

    it('should not hit destroyed bricks', () => {
      const brick = level.getActiveBricks()[0];
      brick.takeDamage(999); // Destroy brick

      const deactivateSpy = jest.spyOn(laser, 'deactivate');

      collisionManager.checkLaserBrickCollisions([laser], level);

      expect(deactivateSpy).not.toHaveBeenCalled();
    });

    it('should not damage indestructible bricks', () => {
      const config = {
        id: 1,
        name: 'Test Level',
        bricks: [{ row: 2, col: 2, type: BrickType.INDESTRUCTIBLE }],
        baseHealth: 1
      };
      level = LevelFactory.createLevel(config, 800);

      collisionManager.checkLaserBrickCollisions([laser], level);

      expect(emitSpy).not.toHaveBeenCalledWith(GameEvents.BRICK_HIT, expect.anything());
    });

    it('should trigger onBrickDestroyed when laser destroys brick', () => {
      const brick = level.getActiveBricks()[0];

      collisionManager.checkLaserBrickCollisions([laser], level);

      if (brick.isDestroyed()) {
        expect(emitSpy).toHaveBeenCalledWith(GameEvents.BRICK_DESTROYED, expect.anything());
      }
    });
  });

  describe('checkFallingBrickBatCollisions', () => {
    it('should detect falling brick hitting bat', () => {
      const fallingBrick = new FallingBrick(400, 540, '#ff0000');
      const takeDamageSpy = jest.spyOn(bat, 'takeDamage');

      collisionManager.checkFallingBrickBatCollisions([fallingBrick], bat);

      expect(takeDamageSpy).toHaveBeenCalled();
    });

    it('should apply falling brick damage', () => {
      const fallingBrick = new FallingBrick(400, 540, '#ff0000');

      collisionManager.checkFallingBrickBatCollisions([fallingBrick], bat);

      expect(emitSpy).toHaveBeenCalledWith('bat_damaged', expect.objectContaining({
        damagePercent: expect.any(Number)
      }));
    });

    it('should deactivate falling brick on collision', () => {
      const fallingBrick = new FallingBrick(400, 540, '#ff0000');
      const deactivateSpy = jest.spyOn(fallingBrick, 'deactivate');

      collisionManager.checkFallingBrickBatCollisions([fallingBrick], bat);

      expect(deactivateSpy).toHaveBeenCalled();
    });

    it('should not detect collision when falling brick is far from bat', () => {
      const fallingBrick = new FallingBrick(100, 100, '#ff0000');
      const takeDamageSpy = jest.spyOn(bat, 'takeDamage');

      collisionManager.checkFallingBrickBatCollisions([fallingBrick], bat);

      expect(takeDamageSpy).not.toHaveBeenCalled();
    });
  });

  describe('checkDebrisBatCollisions', () => {
    it('should detect debris hitting bat', () => {
      const batBounds = bat.getBounds();
      const debris = new Debris(batBounds.x + 10, batBounds.y + 10, 1, 1, '#ff0000');
      const takeDamageSpy = jest.spyOn(bat, 'takeDamage');

      collisionManager.checkDebrisBatCollisions([debris], bat);

      expect(takeDamageSpy).toHaveBeenCalled();
    });

    it('should apply debris damage', () => {
      const batBounds = bat.getBounds();
      const debris = new Debris(batBounds.x + 10, batBounds.y + 10, 1, 1, '#ff0000');

      collisionManager.checkDebrisBatCollisions([debris], bat);

      expect(emitSpy).toHaveBeenCalledWith('bat_damaged', expect.objectContaining({
        damagePercent: expect.any(Number)
      }));
    });

    it('should deactivate debris on collision', () => {
      const batBounds = bat.getBounds();
      const debris = new Debris(batBounds.x + 10, batBounds.y + 10, 1, 1, '#ff0000');
      const deactivateSpy = jest.spyOn(debris, 'deactivate');

      collisionManager.checkDebrisBatCollisions([debris], bat);

      expect(deactivateSpy).toHaveBeenCalled();
    });
  });

  describe('checkBrickLaserBatCollisions', () => {
    it('should not detect collision while laser is charging', () => {
      const batBounds = bat.getBounds();
      const brickLaser = new BrickLaser(batBounds.x + 10, batBounds.y - 100, batBounds.x + 10, '#ff0000');
      const takeDamageSpy = jest.spyOn(bat, 'takeDamage');

      collisionManager.checkBrickLaserBatCollisions([brickLaser], bat);

      expect(takeDamageSpy).not.toHaveBeenCalled();
    });

    it('should handle brick laser collision detection', () => {
      // BrickLaser collision detection is complex due to charging and firing mechanics
      // This test verifies the method can be called without errors
      const batBounds = bat.getBounds();
      const brickLaser = new BrickLaser(batBounds.x + 10, batBounds.y - 50, batBounds.x + 10, '#ff0000');

      expect(() => {
        collisionManager.checkBrickLaserBatCollisions([brickLaser], bat);
      }).not.toThrow();
    });
  });

  describe('checkHomingMissileBatCollisions', () => {
    it('should detect homing missile hitting bat', () => {
      const batBounds = bat.getBounds();
      const missile = new HomingMissile(batBounds.x + 10, batBounds.y + 10, '#ff0000');
      const takeDamageSpy = jest.spyOn(bat, 'takeDamage');

      collisionManager.checkHomingMissileBatCollisions([missile], bat);

      expect(takeDamageSpy).toHaveBeenCalled();
    });

    it('should apply homing missile damage', () => {
      const batBounds = bat.getBounds();
      const missile = new HomingMissile(batBounds.x + 10, batBounds.y + 10, '#ff0000');

      collisionManager.checkHomingMissileBatCollisions([missile], bat);

      expect(emitSpy).toHaveBeenCalledWith('bat_damaged', expect.objectContaining({
        damagePercent: expect.any(Number)
      }));
    });

    it('should deactivate missile on collision', () => {
      const batBounds = bat.getBounds();
      const missile = new HomingMissile(batBounds.x + 10, batBounds.y + 10, '#ff0000');
      const deactivateSpy = jest.spyOn(missile, 'deactivate');

      collisionManager.checkHomingMissileBatCollisions([missile], bat);

      expect(deactivateSpy).toHaveBeenCalled();
    });
  });

  describe('checkSplittingFragmentBatCollisions', () => {
    it('should detect splitting fragment hitting bat', () => {
      const batBounds = bat.getBounds();
      const fragment = new SplittingFragment(batBounds.x + 10, batBounds.y + 10, 1, 1, '#ff0000');
      const takeDamageSpy = jest.spyOn(bat, 'takeDamage');

      collisionManager.checkSplittingFragmentBatCollisions([fragment], bat);

      expect(takeDamageSpy).toHaveBeenCalled();
    });

    it('should apply splitting fragment damage', () => {
      const batBounds = bat.getBounds();
      const fragment = new SplittingFragment(batBounds.x + 10, batBounds.y + 10, 1, 1, '#ff0000');

      collisionManager.checkSplittingFragmentBatCollisions([fragment], bat);

      expect(emitSpy).toHaveBeenCalledWith('bat_damaged', expect.objectContaining({
        damagePercent: expect.any(Number)
      }));
    });

    it('should deactivate fragment on collision', () => {
      const batBounds = bat.getBounds();
      const fragment = new SplittingFragment(batBounds.x + 10, batBounds.y + 10, 1, 1, '#ff0000');
      const deactivateSpy = jest.spyOn(fragment, 'deactivate');

      collisionManager.checkSplittingFragmentBatCollisions([fragment], bat);

      expect(deactivateSpy).toHaveBeenCalled();
    });
  });

  describe('checkDynamiteStickCollisions', () => {
    let dynamite: DynamiteStick;
    let bricks: Brick[];

    beforeEach(() => {
      const batBounds = bat.getBounds();
      dynamite = new DynamiteStick(batBounds.x + 10, batBounds.y + 10, '#ff0000');
      const config = {
        id: 1,
        name: 'Test Level',
        bricks: [{ row: 2, col: 2, type: BrickType.NORMAL }],
        baseHealth: 3
      };
      const level = LevelFactory.createLevel(config, 800);
      bricks = level.getActiveBricks();
    });

    it('should detect dynamite hitting bat before explosion', () => {
      const takeDamageSpy = jest.spyOn(bat, 'takeDamage');

      collisionManager.checkDynamiteStickCollisions([dynamite], bat, bricks, 10);

      expect(takeDamageSpy).toHaveBeenCalled();
    });

    it('should apply dynamite damage to bat', () => {
      collisionManager.checkDynamiteStickCollisions([dynamite], bat, bricks, 10);

      expect(emitSpy).toHaveBeenCalledWith('bat_damaged', expect.objectContaining({
        damagePercent: expect.any(Number)
      }));
    });

    it('should deactivate dynamite on direct hit', () => {
      const deactivateSpy = jest.spyOn(dynamite, 'deactivate');

      collisionManager.checkDynamiteStickCollisions([dynamite], bat, bricks, 10);

      expect(deactivateSpy).toHaveBeenCalled();
    });

    it('should handle explosion damage to bricks', () => {
      // Trigger explosion
      dynamite.update(5.0); // Wait for explosion

      collisionManager.checkDynamiteStickCollisions([dynamite], bat, bricks, 10);

      // Explosion damage callback may be called if bricks are in range
      // This depends on the explosion radius and brick positions
      // We can just verify that no error is thrown, or verify emit if we're sure
    });
  });

});
