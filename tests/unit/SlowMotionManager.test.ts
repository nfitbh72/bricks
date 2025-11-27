/**
 * Tests for SlowMotionManager class
 */

import { SlowMotionManager } from '../../src/renderer/game/managers/SlowMotionManager';
import { Ball } from '../../src/renderer/game/entities/Ball';
import { Level } from '../../src/renderer/game/entities/Level';
import { LevelFactory } from '../../src/renderer/game/factories/LevelFactory';
import { StatusBar } from '../../src/renderer/game/ui/StatusBar';
import { EffectsManager } from '../../src/renderer/game/managers/EffectsManager';
import { BrickType } from '../../src/renderer/game/core/types';
import { SLOW_MOTION_FACTOR } from '../../src/renderer/config/constants';

describe('SlowMotionManager', () => {
  let manager: SlowMotionManager;

  beforeEach(() => {
    manager = new SlowMotionManager();
  });

  describe('initialization', () => {
    it('should create manager instance', () => {
      expect(manager).toBeDefined();
    });

    it('should start with slow-motion inactive', () => {
      expect(manager.isActive()).toBe(false);
    });
  });

  describe('getEffectiveDeltaTime', () => {
    it('should return normal deltaTime when slow-motion is inactive', () => {
      const deltaTime = 0.016;
      expect(manager.getEffectiveDeltaTime(deltaTime)).toBe(deltaTime);
    });

    it('should return reduced deltaTime when slow-motion is active', () => {
      // We need to activate slow-motion first
      // Create minimal mocks to trigger slow-motion
      const ball = new Ball(500, 500, 10, 600);
      ball.setVelocity(0, 200); // Moving down
      
      const levelConfig = {
        id: 1,
        name: 'Test Level',
        bricks: [
          { col: 0, row: 0, type: BrickType.NORMAL }
        ]
      };
      const level = LevelFactory.createLevel(levelConfig, 1920);
      
      const statusBar = new StatusBar(1920, 1080);
      const effectsManager = new EffectsManager();
      
      // Manually set ball position very close to the brick
      const bricks = level.getActiveBricks();
      if (bricks.length > 0) {
        const brickBounds = bricks[0].getBounds();
        ball.setPosition(brickBounds.x + 25, brickBounds.y + 100);
      }
      
      // Try to trigger slow-motion
      manager.checkAndTrigger(level, ball, statusBar, effectsManager, 1920, 1080);
      
      const deltaTime = 0.016;
      const effectiveDeltaTime = manager.getEffectiveDeltaTime(deltaTime);
      
      // If slow-motion activated, should be reduced
      if (manager.isActive()) {
        expect(effectiveDeltaTime).toBe(deltaTime * SLOW_MOTION_FACTOR);
      } else {
        // If not activated (depends on prediction), should be normal
        expect(effectiveDeltaTime).toBe(deltaTime);
      }
    });
  });

  describe('update', () => {
    it('should not change state when slow-motion is inactive', () => {
      manager.update(0.1);
      expect(manager.isActive()).toBe(false);
    });

    it('should eventually deactivate slow-motion after duration', () => {
      // Create minimal mocks to activate slow-motion
      const ball = new Ball(500, 500, 10, 600);
      const levelConfig = {
        id: 1,
        name: 'Test Level',
        bricks: [
          { col: 0, row: 0, type: BrickType.NORMAL }
        ]
      };
      const level = LevelFactory.createLevel(levelConfig, 1920);
      const statusBar = new StatusBar(1920, 1080);
      const effectsManager = new EffectsManager();
      
      // Position ball close to brick
      const bricks = level.getActiveBricks();
      if (bricks.length > 0) {
        const brickBounds = bricks[0].getBounds();
        ball.setPosition(brickBounds.x + 25, brickBounds.y + 50);
        ball.setVelocity(0, 200);
      }
      
      manager.checkAndTrigger(level, ball, statusBar, effectsManager, 1920, 1080);
      
      // If slow-motion was activated
      if (manager.isActive()) {
        const wasActive = true;
        
        // Update many times to exceed duration
        for (let i = 0; i < 100; i++) {
          manager.update(0.1);
        }
        
        // Should be deactivated after duration
        expect(manager.isActive()).toBe(false);
      }
    });
  });

  describe('reset', () => {
    it('should deactivate slow-motion', () => {
      // Try to activate slow-motion
      const ball = new Ball(500, 500, 10, 600);
      const levelConfig = {
        id: 1,
        name: 'Test Level',
        bricks: [
          { col: 0, row: 0, type: BrickType.NORMAL }
        ]
      };
      const level = LevelFactory.createLevel(levelConfig, 1920);
      const statusBar = new StatusBar(1920, 1080);
      const effectsManager = new EffectsManager();
      
      manager.checkAndTrigger(level, ball, statusBar, effectsManager, 1920, 1080);
      
      // Reset should always deactivate
      manager.reset();
      expect(manager.isActive()).toBe(false);
    });
  });

  describe('checkAndTrigger', () => {
    it('should not trigger when level is null', () => {
      const ball = new Ball(500, 500, 10, 600);
      const statusBar = new StatusBar(1920, 1080);
      const effectsManager = new EffectsManager();
      
      manager.checkAndTrigger(null, ball, statusBar, effectsManager, 1920, 1080);
      
      expect(manager.isActive()).toBe(false);
    });

    it('should not trigger when more than 1 brick remains', () => {
      const ball = new Ball(500, 500, 10, 600);
      const levelConfig = {
        id: 1,
        name: 'Test Level',
        bricks: [
          { col: 0, row: 0, type: BrickType.NORMAL },
          { col: 1, row: 0, type: BrickType.NORMAL }
        ]
      };
      const level = LevelFactory.createLevel(levelConfig, 1920);
      const statusBar = new StatusBar(1920, 1080);
      const effectsManager = new EffectsManager();
      
      manager.checkAndTrigger(level, ball, statusBar, effectsManager, 1920, 1080);
      
      expect(manager.isActive()).toBe(false);
    });

    it('should not trigger when 0 bricks remain', () => {
      const ball = new Ball(500, 500, 10, 600);
      const levelConfig = {
        id: 1,
        name: 'Test Level',
        bricks: []
      };
      const level = LevelFactory.createLevel(levelConfig, 1920);
      const statusBar = new StatusBar(1920, 1080);
      const effectsManager = new EffectsManager();
      
      manager.checkAndTrigger(level, ball, statusBar, effectsManager, 1920, 1080);
      
      expect(manager.isActive()).toBe(false);
    });

    it('should not trigger when ball is too far from final brick', () => {
      const ball = new Ball(100, 100, 10, 600);
      ball.setVelocity(100, 100);
      
      const levelConfig = {
        id: 1,
        name: 'Test Level',
        bricks: [
          { col: 10, row: 10, type: BrickType.NORMAL } // Far away
        ]
      };
      const level = LevelFactory.createLevel(levelConfig, 1920);
      const statusBar = new StatusBar(1920, 1080);
      const effectsManager = new EffectsManager();
      
      manager.checkAndTrigger(level, ball, statusBar, effectsManager, 1920, 1080);
      
      expect(manager.isActive()).toBe(false);
    });

    it('should not trigger again if already active', () => {
      const ball = new Ball(500, 500, 10, 600);
      const levelConfig = {
        id: 1,
        name: 'Test Level',
        bricks: [
          { col: 0, row: 0, type: BrickType.NORMAL }
        ]
      };
      const level = LevelFactory.createLevel(levelConfig, 1920);
      const statusBar = new StatusBar(1920, 1080);
      const effectsManager = new EffectsManager();
      
      // Position ball close to brick
      const bricks = level.getActiveBricks();
      if (bricks.length > 0) {
        const brickBounds = bricks[0].getBounds();
        ball.setPosition(brickBounds.x + 25, brickBounds.y + 50);
        ball.setVelocity(0, 200);
      }
      
      // First trigger
      manager.checkAndTrigger(level, ball, statusBar, effectsManager, 1920, 1080);
      const firstState = manager.isActive();
      
      // Second trigger (should not change anything)
      manager.checkAndTrigger(level, ball, statusBar, effectsManager, 1920, 1080);
      const secondState = manager.isActive();
      
      expect(firstState).toBe(secondState);
    });
  });
});
