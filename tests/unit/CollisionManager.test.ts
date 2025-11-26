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

      collisionManager.populateSpatialHash(level);
      collisionManager.populateSpatialHash(level);
      collisionManager.checkBallBrickCollisions(ball, level, gameUpgrades);

      expect(bounceSpy).toHaveBeenCalled();
    });

    it('should apply damage to brick on collision', () => {
      const brickBounds = brick.getBounds();
      ball.setPosition(brickBounds.x + 10, brickBounds.y + 10);

      collisionManager.populateSpatialHash(level);
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

      collisionManager.populateSpatialHash(level);
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

      collisionManager.populateSpatialHash(level);
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
      collisionManager.populateSpatialHash(level);
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

      collisionManager.populateSpatialHash(level);
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

      collisionManager.populateSpatialHash(level);
      collisionManager.checkBallBrickCollisions(ball, level, gameUpgrades);

      // Should destroy first brick
      expect(emitSpy).toHaveBeenCalledWith(GameEvents.BRICK_DESTROYED, expect.anything());
    });
  });
});
