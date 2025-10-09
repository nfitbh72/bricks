/**
 * WeaponManager unit tests
 */

import { WeaponManager } from '../../src/renderer/game/WeaponManager';
import { Bat } from '../../src/renderer/game/Bat';
import { Ball } from '../../src/renderer/game/Ball';
import { GameUpgrades } from '../../src/renderer/game/GameUpgrades';
import { UpgradeType } from '../../src/renderer/game/types';

// Mock canvas context
const createMockContext = () => ({
  save: jest.fn(),
  restore: jest.fn(),
  fillRect: jest.fn(),
  beginPath: jest.fn(),
  arc: jest.fn(),
  fill: jest.fn(),
  fillStyle: '',
});

describe('WeaponManager', () => {
  let weaponManager: WeaponManager;
  let bat: Bat;
  let ball: Ball;
  let gameUpgrades: GameUpgrades;
  let mockCtx: any;

  // Helper to unlock shooter upgrade
  const unlockShooter = () => {
    const upgrades = new Map<string, number>();
    upgrades.set(UpgradeType.BAT_ADD_SHOOTER, 1);
    gameUpgrades.setUpgradeLevels(upgrades);
  };

  beforeEach(() => {
    weaponManager = new WeaponManager();
    bat = new Bat(100, 500, 150, 15, 300);
    ball = new Ball(400, 300, 10, 600);
    gameUpgrades = new GameUpgrades();
    mockCtx = createMockContext();
    jest.clearAllMocks();
  });

  describe('constructor', () => {
    it('should initialize with no lasers', () => {
      expect(weaponManager.getActiveCount()).toBe(0);
      expect(weaponManager.getLasers()).toHaveLength(0);
    });
  });

  describe('shootLaser', () => {
    it('should not create laser when shooter upgrade is not unlocked', () => {
      weaponManager.shootLaser(bat, ball, gameUpgrades);
      expect(weaponManager.getActiveCount()).toBe(0);
    });

    it('should create laser when shooter upgrade is unlocked', () => {
      unlockShooter();
      
      weaponManager.shootLaser(bat, ball, gameUpgrades);
      expect(weaponManager.getActiveCount()).toBe(1);
    });

    it('should create multiple lasers on multiple calls', () => {
      unlockShooter();
      
      weaponManager.shootLaser(bat, ball, gameUpgrades);
      weaponManager.shootLaser(bat, ball, gameUpgrades);
      weaponManager.shootLaser(bat, ball, gameUpgrades);
      
      expect(weaponManager.getActiveCount()).toBe(3);
    });

    it('should create laser at bat position', () => {
      unlockShooter();
      
      weaponManager.shootLaser(bat, ball, gameUpgrades);
      
      const lasers = weaponManager.getLasers();
      expect(lasers).toHaveLength(1);
      
      const laser = lasers[0];
      const bounds = laser.getBounds();
      
      // Laser should be created near bat center
      expect(bounds.x).toBeGreaterThan(0);
      expect(bounds.y).toBeGreaterThan(0);
    });
  });

  describe('update', () => {
    it('should not throw when updating with no lasers', () => {
      expect(() => {
        weaponManager.update(0.016);
      }).not.toThrow();
    });

    it('should update laser positions', () => {
      unlockShooter();
      weaponManager.shootLaser(bat, ball, gameUpgrades);
      
      const lasers = weaponManager.getLasers();
      const initialY = lasers[0].getBounds().y;
      
      weaponManager.update(0.016);
      
      const updatedY = lasers[0].getBounds().y;
      expect(updatedY).toBeLessThan(initialY); // Laser moves up
    });

    it('should remove inactive lasers', () => {
      unlockShooter();
      weaponManager.shootLaser(bat, ball, gameUpgrades);
      
      const lasers = weaponManager.getLasers();
      lasers[0].deactivate();
      
      weaponManager.update(0.016);
      
      expect(weaponManager.getActiveCount()).toBe(0);
    });

    it('should deactivate lasers that go off-screen', () => {
      unlockShooter();
      weaponManager.shootLaser(bat, ball, gameUpgrades);
      
      // Update many times to move laser off-screen
      for (let i = 0; i < 100; i++) {
        weaponManager.update(0.1);
      }
      
      expect(weaponManager.getActiveCount()).toBe(0);
    });

    it('should handle multiple lasers independently', () => {
      unlockShooter();
      
      weaponManager.shootLaser(bat, ball, gameUpgrades);
      weaponManager.shootLaser(bat, ball, gameUpgrades);
      weaponManager.shootLaser(bat, ball, gameUpgrades);
      
      const lasers = weaponManager.getLasers();
      lasers[1].deactivate();
      
      weaponManager.update(0.016);
      
      expect(weaponManager.getActiveCount()).toBe(2);
    });
  });

  describe('render', () => {
    it('should not throw when rendering with no lasers', () => {
      expect(() => {
        weaponManager.render(mockCtx);
      }).not.toThrow();
    });

    it('should call context methods when rendering lasers', () => {
      unlockShooter();
      weaponManager.shootLaser(bat, ball, gameUpgrades);
      
      weaponManager.render(mockCtx);
      
      expect(mockCtx.save).toHaveBeenCalled();
      expect(mockCtx.restore).toHaveBeenCalled();
    });

    it('should not render inactive lasers', () => {
      unlockShooter();
      weaponManager.shootLaser(bat, ball, gameUpgrades);
      
      const lasers = weaponManager.getLasers();
      lasers[0].deactivate();
      
      weaponManager.render(mockCtx);
      
      // Should still call save/restore but not render the laser
      expect(mockCtx.save).toHaveBeenCalled();
      expect(mockCtx.restore).toHaveBeenCalled();
    });
  });

  describe('getLasers', () => {
    it('should return empty array initially', () => {
      const lasers = weaponManager.getLasers();
      expect(lasers).toHaveLength(0);
    });

    it('should return all lasers', () => {
      unlockShooter();
      
      weaponManager.shootLaser(bat, ball, gameUpgrades);
      weaponManager.shootLaser(bat, ball, gameUpgrades);
      
      const lasers = weaponManager.getLasers();
      expect(lasers).toHaveLength(2);
    });

    it('should return array reference that can be used for collision detection', () => {
      unlockShooter();
      weaponManager.shootLaser(bat, ball, gameUpgrades);
      
      const lasers = weaponManager.getLasers();
      expect(lasers[0].isActive()).toBe(true);
      expect(lasers[0].getBounds()).toBeDefined();
    });
  });

  describe('clear', () => {
    it('should remove all lasers', () => {
      unlockShooter();
      
      weaponManager.shootLaser(bat, ball, gameUpgrades);
      weaponManager.shootLaser(bat, ball, gameUpgrades);
      weaponManager.shootLaser(bat, ball, gameUpgrades);
      
      expect(weaponManager.getActiveCount()).toBe(3);
      
      weaponManager.clear();
      
      expect(weaponManager.getActiveCount()).toBe(0);
      expect(weaponManager.getLasers()).toHaveLength(0);
    });

    it('should not throw when clearing empty manager', () => {
      expect(() => {
        weaponManager.clear();
      }).not.toThrow();
    });
  });

  describe('getActiveCount', () => {
    it('should return 0 initially', () => {
      expect(weaponManager.getActiveCount()).toBe(0);
    });

    it('should return correct count after shooting', () => {
      unlockShooter();
      
      weaponManager.shootLaser(bat, ball, gameUpgrades);
      expect(weaponManager.getActiveCount()).toBe(1);
      
      weaponManager.shootLaser(bat, ball, gameUpgrades);
      expect(weaponManager.getActiveCount()).toBe(2);
    });

    it('should return correct count after deactivation', () => {
      unlockShooter();
      
      weaponManager.shootLaser(bat, ball, gameUpgrades);
      weaponManager.shootLaser(bat, ball, gameUpgrades);
      
      const lasers = weaponManager.getLasers();
      lasers[0].deactivate();
      
      weaponManager.update(0.016); // Trigger cleanup
      
      expect(weaponManager.getActiveCount()).toBe(1);
    });

    it('should return 0 after clear', () => {
      unlockShooter();
      weaponManager.shootLaser(bat, ball, gameUpgrades);
      
      weaponManager.clear();
      
      expect(weaponManager.getActiveCount()).toBe(0);
    });
  });

  describe('integration', () => {
    it('should handle rapid shooting', () => {
      unlockShooter();
      
      for (let i = 0; i < 50; i++) {
        weaponManager.shootLaser(bat, ball, gameUpgrades);
      }
      
      expect(weaponManager.getActiveCount()).toBe(50);
      
      weaponManager.update(0.016);
      expect(weaponManager.getActiveCount()).toBe(50); // All still active
    });

    it('should handle shoot-update-render cycle', () => {
      unlockShooter();
      
      expect(() => {
        weaponManager.shootLaser(bat, ball, gameUpgrades);
        weaponManager.update(0.016);
        weaponManager.render(mockCtx);
      }).not.toThrow();
    });

    it('should handle level transitions', () => {
      unlockShooter();
      
      // Shoot some lasers
      weaponManager.shootLaser(bat, ball, gameUpgrades);
      weaponManager.shootLaser(bat, ball, gameUpgrades);
      
      // Clear for new level
      weaponManager.clear();
      
      // Shoot new lasers
      weaponManager.shootLaser(bat, ball, gameUpgrades);
      
      expect(weaponManager.getActiveCount()).toBe(1);
    });
  });
});
