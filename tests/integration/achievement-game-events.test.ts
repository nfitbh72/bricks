/**
 * Achievement System Integration Tests
 * Tests the complete flow from game events to achievement progress
 */

/**
 * @jest-environment jsdom
 */

// Mock Electron modules
jest.mock('electron', () => ({
  app: {
    getPath: jest.fn(() => '/mock/user/data'),
  },
  ipcMain: {
    on: jest.fn(),
    handle: jest.fn(),
  },
}));

// Mock Node modules
jest.mock('fs', () => ({
  existsSync: jest.fn(),
  readFileSync: jest.fn(),
  writeFileSync: jest.fn(),
  mkdirSync: jest.fn(),
}));

jest.mock('path', () => ({
  join: jest.fn((...args) => args.join('/')),
  dirname: jest.fn((path) => path.split('/').slice(0, -1).join('/')),
}));

import { AchievementTracker } from '../../src/renderer/game/managers/AchievementTracker';
import { AchievementManager } from '../../src/main/steam/AchievementManager';

// Mock dependencies
const mockElectronAPI = {
  unlockAchievement: jest.fn(),
  getUnlockedAchievements: jest.fn(),
  isSteamEnabled: jest.fn(),
};

(global as any).electronAPI = mockElectronAPI;

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: jest.fn((key: string) => store[key] || null),
    setItem: jest.fn((key: string, value: string) => {
      store[key] = value.toString();
    }),
    removeItem: jest.fn((key: string) => {
      delete store[key];
    }),
    clear: jest.fn(() => {
      store = {};
    }),
  };
})();

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
});

// Mock window.electronAPI for steamAPI
Object.defineProperty(window, 'electronAPI', {
  value: {
    steam: {
      unlockAchievement: mockElectronAPI.unlockAchievement,
      getUnlockedAchievements: mockElectronAPI.getUnlockedAchievements,
      isSteamEnabled: mockElectronAPI.isSteamEnabled,
    },
  },
});

describe('Achievement System Integration', () => {
  let tracker: AchievementTracker;
  let manager: AchievementManager;

  beforeEach(async () => {
    localStorageMock.clear();
    jest.clearAllMocks();
    
    tracker = new AchievementTracker();
    manager = new AchievementManager();
    await manager.initialize();
  });

  afterEach(async () => {
    // Clean up any pending promises or timers
    jest.clearAllTimers();
    jest.useRealTimers();
    
    // Wait for any pending promises to resolve
    await new Promise(resolve => {
      setTimeout(resolve, 0);
    });
  });

  describe('game event → achievement progress flow', () => {
    it('should track brick destruction and unlock BRICK_SMASHER at threshold', async () => {
      // Track progress towards BRICK_SMASHER (1000 bricks)
      for (let i = 0; i < 999; i++) {
        await tracker.onBrickDestroyed(1);
      }

      let progress = tracker.getProgress();
      expect(progress.totalBricksDestroyed).toBe(999);
      expect(mockElectronAPI.unlockAchievement).not.toHaveBeenCalledWith('BRICK_SMASHER');

      // Final brick that should unlock the achievement
      await tracker.onBrickDestroyed(1);

      progress = tracker.getProgress();
      expect(progress.totalBricksDestroyed).toBe(1000);
      
      // Should trigger achievement unlock
      expect(mockElectronAPI.unlockAchievement).toHaveBeenCalledWith('BRICK_SMASHER');
    });

    it('should track boss defeats and unlock BOSS_SMASHER at threshold', async () => {
      mockElectronAPI.unlockAchievement.mockResolvedValue(true);

      // Track progress towards BOSS_SMASHER (30 bosses)
      for (let i = 0; i < 29; i++) {
        await tracker.onBossDefeated('THROWER');
      }

      let progress = tracker.getProgress();
      expect(progress.totalBossesDefeated).toBe(29);
      expect(mockElectronAPI.unlockAchievement).not.toHaveBeenCalledWith('BOSS_SMASHER');

      // Final boss that should unlock the achievement
      await tracker.onBossDefeated('SPAWNER');

      progress = tracker.getProgress();
      expect(progress.totalBossesDefeated).toBe(30);
      
      // Should trigger achievement unlock
      expect(mockElectronAPI.unlockAchievement).toHaveBeenCalledWith('BOSS_SMASHER');
    });

    it('should track damage and unlock DAMAGE_DEALER at threshold', async () => {
      // Track progress towards DAMAGE_DEALER (10000 damage)
      await tracker.onBrickDestroyed(9999);

      let progress = tracker.getProgress();
      expect(progress.totalDamageDealt).toBe(9999);
      expect(mockElectronAPI.unlockAchievement).not.toHaveBeenCalledWith('DAMAGE_DEALER');

      // Final damage that should unlock the achievement
      await tracker.onBrickDestroyed(1);

      progress = tracker.getProgress();
      expect(progress.totalDamageDealt).toBe(10000);
      
      // Should trigger achievement unlock
      expect(mockElectronAPI.unlockAchievement).toHaveBeenCalledWith('DAMAGE_DEALER');
    });

    it('should track level completion and unlock HALFWAY_THERE at threshold', async () => {
      // Track progress towards HALFWAY_THERE (5 levels)
      for (let i = 1; i <= 4; i++) {
        await tracker.onLevelComplete(i, 100, 3);
      }

      let progress = tracker.getProgress();
      expect(progress.levelsCompleted).toHaveLength(4);
      expect(mockElectronAPI.unlockAchievement).not.toHaveBeenCalledWith('HALFWAY_THERE');

      // Final level that should unlock the achievement
      await tracker.onLevelComplete(5, 100, 3);

      progress = tracker.getProgress();
      expect(progress.levelsCompleted).toHaveLength(5);
      
      // Should trigger achievement unlock
      expect(mockElectronAPI.unlockAchievement).toHaveBeenCalledWith('HALFWAY_THERE');
    });

    it('should track level completion and unlock LEVEL_MASTER at threshold', async () => {
      // Track progress towards LEVEL_MASTER (12 levels)
      for (let i = 1; i <= 11; i++) {
        await tracker.onLevelComplete(i, 100, 3);
      }

      let progress = tracker.getProgress();
      expect(progress.levelsCompleted).toHaveLength(11);
      expect(mockElectronAPI.unlockAchievement).not.toHaveBeenCalledWith('LEVEL_MASTER');

      // Final level that should unlock the achievement
      await tracker.onLevelComplete(12, 100, 3);

      progress = tracker.getProgress();
      expect(progress.levelsCompleted).toHaveLength(12);
      
      // Should trigger achievement unlock
      expect(mockElectronAPI.unlockAchievement).toHaveBeenCalledWith('LEVEL_MASTER');
    });

    it('should track upgrades and unlock UPGRADE_MASTER at threshold', async () => {
      // Track progress towards UPGRADE_MASTER (17 upgrades)
      const upgrades = [
        'RAPID_FIRE', 'MULTI_BALL', 'POWER_BALL', 'WIDER_PADDLE', 'SLOWER_BALL',
        'EXTRA_LIFE', 'SHIELD', 'LASER', 'MAGNET', 'EXPLOSIVE_BALL',
        'PIERCE_BALL', 'SPLIT_BALL', 'TIME_SLOW', 'SCORE_MULTIPLIER', 'BRICK_DAMAGE',
        'BOSS_DAMAGE', 'SPEED_BOOST'
      ];

      for (let i = 0; i < 16; i++) {
        await tracker.onUpgradeActivated(upgrades[i]);
      }

      let progress = tracker.getProgress();
      expect(progress.upgradesActivated).toHaveLength(16);
      expect(mockElectronAPI.unlockAchievement).not.toHaveBeenCalledWith('UPGRADE_MASTER');

      // Final upgrade that should unlock the achievement
      await tracker.onUpgradeActivated(upgrades[16]);

      progress = tracker.getProgress();
      expect(progress.upgradesActivated).toHaveLength(17);
      
      // Should trigger achievement unlock
      expect(mockElectronAPI.unlockAchievement).toHaveBeenCalledWith('UPGRADE_MASTER');
    });

    it('should track boss types and unlock ALL_BOSSES when all types defeated', async () => {
      // Track progress towards ALL_BOSSES (3 boss types)
      await tracker.onBossDefeated('THROWER');
      await tracker.onBossDefeated('SPAWNER');

      let progress = tracker.getProgress();
      expect(progress.bossTypesDefeated).toHaveLength(2);
      expect(mockElectronAPI.unlockAchievement).not.toHaveBeenCalledWith('ALL_BOSSES');

      // Final boss type that should unlock the achievement
      await tracker.onBossDefeated('SPLITTER');

      progress = tracker.getProgress();
      expect(progress.bossTypesDefeated).toEqual(['THROWER', 'SPAWNER', 'SPLITTER']);
      
      // Should trigger achievement unlock
      expect(mockElectronAPI.unlockAchievement).toHaveBeenCalledWith('ALL_BOSSES');
    });
  });

  describe('special achievement tracking', () => {
    it('should unlock FIRST_LEVEL on first level completion', async () => {
      await tracker.onLevelComplete(1, 100, 3);

      expect(mockElectronAPI.unlockAchievement).toHaveBeenCalledWith('FIRST_LEVEL');
    });

    it('should unlock PERFECT_LEVEL when perfect level is tracked', async () => {
      await tracker.onLevelStart(1, 3, false);
      await tracker.onLevelComplete(1, 100, 3);

      expect(mockElectronAPI.unlockAchievement).toHaveBeenCalledWith('PERFECT_LEVEL');
    });

    it('should unlock SPEED_RUN when speed run is tracked', async () => {
      await tracker.onLevelStart(1, 3, false);
      await tracker.onLevelComplete(1, 8, 3); // 8 seconds is less than 10 second threshold

      expect(mockElectronAPI.unlockAchievement).toHaveBeenCalledWith('SPEED_RUN');
    });

    it('should unlock NO_DAMAGE when no damage level is tracked', async () => {
      await tracker.onLevelStart(1, 3, true);
      await tracker.onLevelComplete(1, 100, 3);

      expect(mockElectronAPI.unlockAchievement).toHaveBeenCalledWith('NO_DAMAGE');
    });
  });

  describe('multiple achievements from single event', () => {
    it('should unlock multiple achievements from level completion', async () => {
      // Complete level 1 perfectly, with no damage, and as a speed run
      await tracker.onLevelStart(1, 3, true);
      await tracker.onLevelComplete(1, 8, 3); // Speed run, no damage, perfect

      // Should unlock all four achievements
      expect(mockElectronAPI.unlockAchievement).toHaveBeenCalledWith('FIRST_LEVEL');
      expect(mockElectronAPI.unlockAchievement).toHaveBeenCalledWith('PERFECT_LEVEL');
      expect(mockElectronAPI.unlockAchievement).toHaveBeenCalledWith('NO_DAMAGE');
      expect(mockElectronAPI.unlockAchievement).toHaveBeenCalledWith('SPEED_RUN');
    });

    it('should track progress for multiple cumulative achievements simultaneously', async () => {
      await tracker.onLevelStart(1, 3, false);
      
      // Simulate a complex game session
      for (let i = 0; i < 500; i++) {
        await tracker.onBrickDestroyed(1);
      }
      await tracker.onBossDefeated('THROWER');
      await tracker.onLevelComplete(1, 100, 3);

      const progress = tracker.getProgress();
      
      expect(progress.totalBricksDestroyed).toBe(500);
      expect(progress.totalDamageDealt).toBe(500);
      expect(progress.totalBossesDefeated).toBe(1);
      expect(progress.levelsCompleted).toEqual([1]);
    });
  });

  describe('persistence across sessions', () => {
    it('should maintain progress across tracker instances', async () => {
      await tracker.onLevelStart(1, 3, false);
      
      // Build up progress in first tracker
      for (let i = 0; i < 500; i++) {
        await tracker.onBrickDestroyed(1);
      }
      await tracker.onLevelComplete(1, 100, 3);
      await tracker.onLevelComplete(2, 100, 3);
      await tracker.onLevelComplete(3, 100, 3);

      // Create new tracker (simulates app restart)
      const newTracker = new AchievementTracker();
      const progress = newTracker.getProgress();

      expect(progress.totalBricksDestroyed).toBe(500);
      expect(progress.levelsCompleted).toEqual([1, 2, 3]);
    });

    it('should not unlock achievements twice across sessions', async () => {
      // First session - unlock FIRST_LEVEL
      await tracker.onLevelComplete(1, 100, 3);
      expect(mockElectronAPI.unlockAchievement).toHaveBeenCalledWith('FIRST_LEVEL');

      // Create new tracker instance (simulating game restart)
      const newTracker = new AchievementTracker();
      
      // Try to unlock again - should not trigger duplicate unlock
      await newTracker.onLevelComplete(1, 100, 3);
      
      // Should only have been called once total
      expect(mockElectronAPI.unlockAchievement).toHaveBeenCalledTimes(1);
    });
  });

  describe('error handling and edge cases', () => {
    it('should handle Steam API failures gracefully', async () => {
      mockElectronAPI.unlockAchievement.mockRejectedValue(new Error('Steam API error'));

      // Should not throw when unlock fails
      expect(async () => {
        await tracker.onLevelComplete(1, 100, 3);
      }).not.toThrow();

      // Progress should still be tracked
      const progress = tracker.getProgress();
      expect(progress.levelsCompleted).toContain(1);
    });

    it('should work in offline mode', async () => {
      mockElectronAPI.isSteamEnabled.mockResolvedValue(false);
      mockElectronAPI.unlockAchievement.mockRejectedValue(new Error('Steam not available'));
      
      await tracker.onLevelStart(1, 3, false);
      
      // Should still track progress even when Steam is unavailable
      for (let i = 0; i < 100; i++) {
        await tracker.onBrickDestroyed(1);
      }
      await tracker.onLevelComplete(1, 100, 3);
      
      const progress = tracker.getProgress();
      expect(progress.levelsCompleted).toContain(1);
      expect(progress.totalBricksDestroyed).toBe(100);
    });

    it('should handle rapid successive events', async () => {
      mockElectronAPI.unlockAchievement.mockResolvedValue(true);

      // Rapid fire events
      for (let i = 0; i < 100; i++) {
        await tracker.onBrickDestroyed(1);
      }

      // Should handle all events without issues
      const progress = tracker.getProgress();
      expect(progress.totalBricksDestroyed).toBe(100);
    });
  });

  describe('achievement unlock timing', () => {
    it('should unlock achievements exactly at threshold', async () => {
      // Test exact threshold for BRICK_SMASHER
      for (let i = 0; i < 999; i++) {
        await tracker.onBrickDestroyed(1);
      }
      expect(mockElectronAPI.unlockAchievement).not.toHaveBeenCalledWith('BRICK_SMASHER');

      await tracker.onBrickDestroyed(1);
      expect(mockElectronAPI.unlockAchievement).toHaveBeenCalledWith('BRICK_SMASHER');
    });

    it('should not unlock achievements before threshold', async () => {
      // Test just before threshold for DAMAGE_DEALER (10000 damage)
      for (let i = 0; i < 9999; i++) {
        await tracker.onBrickDestroyed(1);
      }
      expect(mockElectronAPI.unlockAchievement).not.toHaveBeenCalledWith('DAMAGE_DEALER');

      await tracker.onBrickDestroyed(0); // No damage but still counts as brick
      expect(mockElectronAPI.unlockAchievement).not.toHaveBeenCalledWith('DAMAGE_DEALER');
    });

    it('should handle achievements that go over threshold', async () => {
      mockElectronAPI.unlockAchievement.mockResolvedValue(true);
      
      // Go over the BRICK_SMASHER threshold (1000)
      for (let i = 0; i < 1500; i++) {
        await tracker.onBrickDestroyed(1);
      }

      expect(mockElectronAPI.unlockAchievement).toHaveBeenCalledWith('BRICK_SMASHER');
      // Should be called many times due to combo achievements, but BRICK_SMASHER should be there
      expect(mockElectronAPI.unlockAchievement).toHaveBeenCalledWith(
        'BRICK_SMASHER'
      );
    });
  });
});
