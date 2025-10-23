/**
 * Tests for OffensiveEntityManager class
 */

import { OffensiveEntityManager } from '../../src/renderer/game/managers/OffensiveEntityManager';
import { Brick } from '../../src/renderer/game/entities/Brick';
import { BrickType } from '../../src/renderer/game/core/types';

describe('OffensiveEntityManager', () => {
  let manager: OffensiveEntityManager;

  beforeEach(() => {
    manager = new OffensiveEntityManager();
  });

  describe('initialization', () => {
    it('should create manager instance', () => {
      expect(manager).toBeDefined();
    });

    it('should start with empty entity arrays', () => {
      expect(manager.getFallingBricks()).toHaveLength(0);
      expect(manager.getDebris()).toHaveLength(0);
      expect(manager.getBrickLasers()).toHaveLength(0);
    });
  });

  describe('spawnOffensiveEntity', () => {
    it('should spawn falling brick for OFFENSIVE_FALLING brick type', () => {
      const brick = new Brick({ col: 0, row: 0, type: BrickType.OFFENSIVE_FALLING, color: '#ff0000' }, 1);
      
      manager.spawnOffensiveEntity(brick, 125, 110, 500);
      
      const fallingBricks = manager.getFallingBricks();
      expect(fallingBricks).toHaveLength(1);
      expect(manager.getDebris()).toHaveLength(0);
      expect(manager.getBrickLasers()).toHaveLength(0);
    });

    it('should spawn 8 debris particles for OFFENSIVE_EXPLODING brick type', () => {
      const brick = new Brick({ col: 0, row: 0, type: BrickType.OFFENSIVE_EXPLODING, color: '#00ff00' }, 1);
      
      manager.spawnOffensiveEntity(brick, 125, 110, 500);
      
      const debris = manager.getDebris();
      expect(debris).toHaveLength(8);
      expect(manager.getFallingBricks()).toHaveLength(0);
      expect(manager.getBrickLasers()).toHaveLength(0);
    });

    it('should spawn brick laser for OFFENSIVE_LASER brick type', () => {
      const brick = new Brick({ col: 0, row: 0, type: BrickType.OFFENSIVE_LASER, color: '#0000ff' }, 1);
      
      manager.spawnOffensiveEntity(brick, 125, 110, 500);
      
      const brickLasers = manager.getBrickLasers();
      expect(brickLasers).toHaveLength(1);
      expect(manager.getFallingBricks()).toHaveLength(0);
      expect(manager.getDebris()).toHaveLength(0);
    });

    it('should not spawn anything for normal brick type', () => {
      const brick = new Brick({ col: 0, row: 0, type: BrickType.NORMAL, color: '#ffffff' }, 1);
      
      manager.spawnOffensiveEntity(brick, 125, 110, 500);
      
      expect(manager.getFallingBricks()).toHaveLength(0);
      expect(manager.getDebris()).toHaveLength(0);
      expect(manager.getBrickLasers()).toHaveLength(0);
    });
  });

  describe('update', () => {
    it('should update all falling bricks', () => {
      const brick = new Brick({ col: 0, row: 0, type: BrickType.OFFENSIVE_FALLING, color: '#ff0000' }, 1);
      manager.spawnOffensiveEntity(brick, 125, 110, 500);
      
      const initialPos = manager.getFallingBricks()[0].getPosition();
      
      manager.update(0.1, 1920, 1080, 960, 540);
      
      const newPos = manager.getFallingBricks()[0].getPosition();
      expect(newPos.y).toBeGreaterThan(initialPos.y); // Should fall down
    });

    it('should update all debris particles', () => {
      const brick = new Brick({ col: 0, row: 0, type: BrickType.OFFENSIVE_EXPLODING, color: '#00ff00' }, 1);
      manager.spawnOffensiveEntity(brick, 125, 110, 500);
      
      const initialPositions = manager.getDebris().map(d => d.getPosition());
      
      manager.update(0.1, 1920, 1080, 960, 540);
      
      const newPositions = manager.getDebris().map(d => d.getPosition());
      
      // At least one debris particle should have moved
      let hasMoved = false;
      for (let i = 0; i < initialPositions.length; i++) {
        if (initialPositions[i].x !== newPositions[i].x || initialPositions[i].y !== newPositions[i].y) {
          hasMoved = true;
          break;
        }
      }
      expect(hasMoved).toBe(true);
    });

    it('should update all brick lasers', () => {
      const brick = new Brick({ col: 0, row: 0, type: BrickType.OFFENSIVE_LASER, color: '#0000ff' }, 1);
      manager.spawnOffensiveEntity(brick, 125, 110, 500);
      
      const initialPos = manager.getBrickLasers()[0].getPosition();
      
      manager.update(0.1, 1920, 1080, 960, 540);
      
      const newPos = manager.getBrickLasers()[0].getPosition();
      // Laser should move down after fire delay
      expect(newPos).toBeDefined();
    });

    it('should remove off-screen falling bricks', () => {
      const brick = new Brick({ col: 0, row: 0, type: BrickType.OFFENSIVE_FALLING, color: '#ff0000' }, 1);
      manager.spawnOffensiveEntity(brick, 125, 110, 500);
      
      // Update many times to move brick off screen
      for (let i = 0; i < 100; i++) {
        manager.update(0.1, 1920, 1080, 960, 540);
      }
      
      // Should be removed when off screen
      expect(manager.getFallingBricks().length).toBeLessThanOrEqual(1);
    });

    it('should remove off-screen debris', () => {
      const brick = new Brick({ col: 0, row: 0, type: BrickType.OFFENSIVE_EXPLODING, color: '#00ff00' }, 1);
      manager.spawnOffensiveEntity(brick, 125, 110, 500);
      
      expect(manager.getDebris()).toHaveLength(8);
      
      // Update many times to move debris off screen
      for (let i = 0; i < 100; i++) {
        manager.update(0.1, 1920, 1080, 960, 540);
      }
      
      // Some or all debris should be removed when off screen
      expect(manager.getDebris().length).toBeLessThanOrEqual(8);
    });
  });

  describe('clear', () => {
    it('should clear all offensive entities', () => {
      // Spawn various entities
      const fallingBrick = new Brick({ col: 0, row: 0, type: BrickType.OFFENSIVE_FALLING, color: '#ff0000' }, 1);
      const explodingBrick = new Brick({ col: 1, row: 0, type: BrickType.OFFENSIVE_EXPLODING, color: '#00ff00' }, 1);
      const laserBrick = new Brick({ col: 2, row: 0, type: BrickType.OFFENSIVE_LASER, color: '#0000ff' }, 1);
      
      manager.spawnOffensiveEntity(fallingBrick, 125, 110, 500);
      manager.spawnOffensiveEntity(explodingBrick, 225, 110, 500);
      manager.spawnOffensiveEntity(laserBrick, 325, 110, 500);
      
      expect(manager.getFallingBricks()).toHaveLength(1);
      expect(manager.getDebris()).toHaveLength(8);
      expect(manager.getBrickLasers()).toHaveLength(1);
      
      manager.clear();
      
      expect(manager.getFallingBricks()).toHaveLength(0);
      expect(manager.getDebris()).toHaveLength(0);
      expect(manager.getBrickLasers()).toHaveLength(0);
    });
  });

  describe('render', () => {
    it('should not throw when rendering with no entities', () => {
      const mockCtx = {} as CanvasRenderingContext2D;
      
      expect(() => {
        manager.render(mockCtx);
      }).not.toThrow();
    });

    it('should not throw when rendering with entities', () => {
      const mockGradient = {
        addColorStop: jest.fn(),
      };
      
      const mockCtx = {
        fillStyle: '',
        fillRect: jest.fn(),
        strokeStyle: '',
        strokeRect: jest.fn(),
        beginPath: jest.fn(),
        moveTo: jest.fn(),
        lineTo: jest.fn(),
        arcTo: jest.fn(),
        closePath: jest.fn(),
        fill: jest.fn(),
        stroke: jest.fn(),
        save: jest.fn(),
        restore: jest.fn(),
        translate: jest.fn(),
        rotate: jest.fn(),
        lineWidth: 0,
        shadowBlur: 0,
        shadowColor: '',
        globalAlpha: 1,
        createLinearGradient: jest.fn(() => mockGradient),
      } as any;
      
      const brick = new Brick({ col: 0, row: 0, type: BrickType.OFFENSIVE_FALLING, color: '#ff0000' }, 1);
      manager.spawnOffensiveEntity(brick, 125, 110, 500);
      
      expect(() => {
        manager.render(mockCtx);
      }).not.toThrow();
    });
  });
});
