/**
 * AchievementTracker Tests
 * Tests core achievement progress tracking functionality
 */

/**
 * @jest-environment jsdom
 */

import { AchievementTracker } from '../../src/renderer/game/managers/AchievementTracker';

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
      unlockAchievement: jest.fn(),
      getUnlockedAchievements: jest.fn(),
      isSteamEnabled: jest.fn(),
    },
  },
});

describe('AchievementTracker', () => {
  let tracker: AchievementTracker;

  beforeEach(() => {
    localStorageMock.clear();
    jest.clearAllMocks();
    tracker = new AchievementTracker();
  });

  afterEach(() => {
    // Clean up any pending promises or timers
    jest.clearAllTimers();
    jest.useRealTimers();
    
    // Wait for any pending promises to resolve
    return new Promise(resolve => {
      setTimeout(resolve, 0);
    });
  });

  describe('initialization', () => {
    it('should start with empty progress', () => {
      const progress = tracker.getProgress();
      
      expect(progress.totalBricksDestroyed).toBe(0);
      expect(progress.totalBossesDefeated).toBe(0);
      expect(progress.totalDamageDealt).toBe(0);
      expect(progress.levelsCompleted).toEqual([]);
      expect(progress.upgradesActivated).toEqual([]);
      expect(progress.bossTypesDefeated).toEqual([]);
    });

    it('should load existing progress from localStorage', () => {
      const existingProgress = {
        totalBricksDestroyed: 500,
        totalBossesDefeated: 5,
        totalDamageDealt: 2500,
        levelsCompleted: [1, 2, 3],
        upgradesActivated: ['RAPID_FIRE', 'MULTI_BALL'],
        bossTypesDefeated: ['THROWER'],
        perfectLevels: [1],
        speedRuns: [2],
        noDamageLevels: [1],
      };

      localStorageMock.setItem('achievementProgress', JSON.stringify(existingProgress));
      
      const newTracker = new AchievementTracker();
      const progress = newTracker.getProgress();

      expect(progress.totalBricksDestroyed).toBe(500);
      expect(progress.totalBossesDefeated).toBe(5);
      expect(progress.levelsCompleted).toEqual([1, 2, 3]);
    });
  });

  describe('brick destruction tracking', () => {
    it('should track brick destruction correctly', async () => {
      await tracker.onBrickDestroyed(1);
      await tracker.onBrickDestroyed(1);
      await tracker.onBrickDestroyed(1);

      const progress = tracker.getProgress();
      expect(progress.totalBricksDestroyed).toBe(3);
    });

    it('should track multiple bricks at once', async () => {
      await tracker.onBrickDestroyed(1);
      await tracker.onBrickDestroyed(1);
      await tracker.onBrickDestroyed(1);
      await tracker.onBrickDestroyed(1);
      await tracker.onBrickDestroyed(1);
      await tracker.onBrickDestroyed(1);
      await tracker.onBrickDestroyed(1);
      await tracker.onBrickDestroyed(1);
      await tracker.onBrickDestroyed(1);
      await tracker.onBrickDestroyed(1);

      const progress = tracker.getProgress();
      expect(progress.totalBricksDestroyed).toBe(10);
    });

    it('should accumulate brick destruction across calls', async () => {
      await tracker.onBrickDestroyed(1);
      await tracker.onBrickDestroyed(1);
      await tracker.onBrickDestroyed(1);
      await tracker.onBrickDestroyed(1);
      await tracker.onBrickDestroyed(1);
      await tracker.onBrickDestroyed(1);
      await tracker.onBrickDestroyed(1);

      const progress = tracker.getProgress();
      expect(progress.totalBricksDestroyed).toBe(7);
    });
  });

  describe('boss defeat tracking', () => {
    it('should track boss defeat correctly', async () => {
      await tracker.onBossDefeated('THROWER');

      const progress = tracker.getProgress();
      expect(progress.totalBossesDefeated).toBe(1);
      expect(progress.bossTypesDefeated).toContain('THROWER');
    });

    it('should not count same boss type twice', async () => {
      await tracker.onBossDefeated('THROWER');
      await tracker.onBossDefeated('THROWER');

      const progress = tracker.getProgress();
      expect(progress.totalBossesDefeated).toBe(2);
      expect(progress.bossTypesDefeated.filter(t => t === 'THROWER')).toHaveLength(1);
    });

    it('should track different boss types', async () => {
      await tracker.onBossDefeated('THROWER');
      await tracker.onBossDefeated('SPAWNER');
      await tracker.onBossDefeated('THROWER'); // Same type again

      const progress = tracker.getProgress();
      expect(progress.totalBossesDefeated).toBe(3);
      expect(progress.bossTypesDefeated).toEqual(['THROWER', 'SPAWNER']);
      expect(progress.bossTypesDefeated).toHaveLength(2);
    });
  });

  describe('damage tracking', () => {
    it('should track damage dealt correctly', async () => {
      await tracker.onBrickDestroyed(100);
      await tracker.onBrickDestroyed(250);

      const progress = tracker.getProgress();
      expect(progress.totalDamageDealt).toBe(350);
    });

    it('should accumulate damage over time', async () => {
      await tracker.onBrickDestroyed(1000);
      await tracker.onBrickDestroyed(500);
      await tracker.onBrickDestroyed(2000);

      const progress = tracker.getProgress();
      expect(progress.totalDamageDealt).toBe(3500);
    });
  });

  describe('level completion tracking', () => {
    it('should track level completion correctly', async () => {
      await tracker.onLevelComplete(1, 100, 3);

      const progress = tracker.getProgress();
      expect(progress.levelsCompleted).toContain(1);
      expect(progress.levelsCompleted).toHaveLength(1);
    });

    it('should not duplicate level completion', async () => {
      await tracker.onLevelComplete(1, 100, 3);
      await tracker.onLevelComplete(1, 100, 3);

      const progress = tracker.getProgress();
      expect(progress.levelsCompleted.filter(l => l === 1)).toHaveLength(1);
      expect(progress.levelsCompleted).toHaveLength(1);
    });

    it('should track multiple levels', async () => {
      await tracker.onLevelComplete(1, 100, 3);
      await tracker.onLevelComplete(2, 100, 3);
      await tracker.onLevelComplete(3, 100, 3);

      const progress = tracker.getProgress();
      expect(progress.levelsCompleted).toEqual([1, 2, 3]);
    });
  });

  describe('upgrade tracking', () => {
    it('should track upgrade activation correctly', async () => {
      await tracker.onUpgradeActivated('RAPID_FIRE');

      const progress = tracker.getProgress();
      expect(progress.upgradesActivated).toContain('RAPID_FIRE');
      expect(progress.upgradesActivated).toHaveLength(1);
    });

    it('should not duplicate upgrade activation', async () => {
      await tracker.onUpgradeActivated('RAPID_FIRE');
      await tracker.onUpgradeActivated('RAPID_FIRE');

      const progress = tracker.getProgress();
      expect(progress.upgradesActivated.filter(u => u === 'RAPID_FIRE')).toHaveLength(1);
      expect(progress.upgradesActivated).toHaveLength(1);
    });

    it('should track multiple upgrades', async () => {
      await tracker.onUpgradeActivated('RAPID_FIRE');
      await tracker.onUpgradeActivated('MULTI_BALL');
      await tracker.onUpgradeActivated('POWER_BALL');

      const progress = tracker.getProgress();
      expect(progress.upgradesActivated).toEqual(['RAPID_FIRE', 'MULTI_BALL', 'POWER_BALL']);
    });
  });

  describe('persistence', () => {
    it('should save progress to localStorage', async () => {
      await tracker.onBrickDestroyed(1); // This increments bricks by 1
      await tracker.onBrickDestroyed(1); // This increments bricks by 1, total damage = 2
      await tracker.onBrickDestroyed(1); // This increments bricks by 1, total damage = 3
      await tracker.onBrickDestroyed(97); // This increments bricks by 1, total damage = 100
      await tracker.onLevelComplete(1, 100, 3);
      await tracker.onUpgradeActivated('RAPID_FIRE');

      expect(localStorageMock.setItem).toHaveBeenCalledWith(
        'achievementProgress',
        expect.stringContaining('"totalBricksDestroyed":4')
      );
    });

    it('should save progress after each tracking call', async () => {
      const initialCalls = (localStorageMock.setItem as jest.Mock).mock.calls.length;
      
      await tracker.onBrickDestroyed(1);
      expect((localStorageMock.setItem as jest.Mock).mock.calls.length).toBe(initialCalls + 1);
      
      await tracker.onLevelComplete(1, 100, 3);
      expect((localStorageMock.setItem as jest.Mock).mock.calls.length).toBe(initialCalls + 2);
    });
  });

  describe('reset functionality', () => {
    it('should reset all progress to initial state', async () => {
      // Build up some progress
      await tracker.onBrickDestroyed(500);
      await tracker.onBossDefeated('THROWER');
      await tracker.onLevelComplete(1, 100, 3);
      await tracker.onUpgradeActivated('RAPID_FIRE');

      // Reset
      tracker.resetProgress();

      // Check everything is reset
      const progress = tracker.getProgress();
      expect(progress.totalBricksDestroyed).toBe(0);
      expect(progress.totalBossesDefeated).toBe(0);
      expect(progress.totalDamageDealt).toBe(0);
      expect(progress.levelsCompleted).toEqual([]);
      expect(progress.upgradesActivated).toEqual([]);
      expect(progress.bossTypesDefeated).toEqual([]);
    });

    it('should clear localStorage on reset', async () => {
      await tracker.onBrickDestroyed(100);
      tracker.resetProgress();

      expect(localStorageMock.setItem).toHaveBeenCalledWith(
        'achievementProgress',
        expect.stringContaining('"totalBricksDestroyed":0')
      );
    });

    it('should save empty progress after reset', async () => {
      await tracker.onBrickDestroyed(100);
      tracker.resetProgress();

      expect(localStorageMock.setItem).toHaveBeenCalledWith(
        'achievementProgress',
        expect.stringContaining('"totalBricksDestroyed":0')
      );
    });
  });

  describe('achievement progress calculation', () => {
    it('should calculate correct progress for cumulative achievements', async () => {
      // Set up specific progress - each call increments bricks by 1
      for (let i = 0; i < 850; i++) {
        await tracker.onBrickDestroyed(1); // Each call adds 1 brick and 1 damage
      }
      await tracker.onBossDefeated('THROWER');
      await tracker.onBossDefeated('SPAWNER');
      await tracker.onLevelComplete(1, 100, 3);
      await tracker.onLevelComplete(2, 100, 3);
      await tracker.onLevelComplete(3, 100, 3);
      await tracker.onLevelComplete(4, 100, 3);
      await tracker.onUpgradeActivated('RAPID_FIRE');
      await tracker.onUpgradeActivated('MULTI_BALL');
      await tracker.onUpgradeActivated('POWER_BALL');

      const progress = tracker.getProgress();

      // BRICK_SMASHER: 850/1000 = 85%
      expect(progress.totalBricksDestroyed).toBe(850);
      
      // BOSS_SMASHER: 2/30 = 6.67%
      expect(progress.totalBossesDefeated).toBe(2);
      expect(progress.bossTypesDefeated).toHaveLength(2);
      
      // DAMAGE_DEALER: 850/10000 = 8.5% (850 calls with 1 damage each)
      expect(progress.totalDamageDealt).toBe(850);
      
      // LEVEL_MASTER: 4/12 = 33.33%
      expect(progress.levelsCompleted).toHaveLength(4);
      
      // UPGRADE_MASTER: 3/17 = 17.65%
      expect(progress.upgradesActivated).toHaveLength(3);
    });
  });

  describe('edge cases', () => {
    it('should handle zero damage values correctly', async () => {
      await tracker.onBrickDestroyed(0);

      const progress = tracker.getProgress();
      expect(progress.totalBricksDestroyed).toBe(1); // Still increments brick count
      expect(progress.totalDamageDealt).toBe(0);
    });

    it('should handle negative values gracefully', async () => {
      await tracker.onBrickDestroyed(-5);

      const progress = tracker.getProgress();
      // Should still increment brick count but damage can be negative
      expect(progress.totalBricksDestroyed).toBe(1);
      expect(progress.totalDamageDealt).toBe(-5);
    });

    it('should handle very large numbers', async () => {
      await tracker.onBrickDestroyed(999999);

      const progress = tracker.getProgress();
      expect(progress.totalBricksDestroyed).toBe(1);
      expect(progress.totalDamageDealt).toBe(999999);
    });

    it('should handle corrupted localStorage data', () => {
      localStorageMock.setItem('achievementProgress', 'invalid json');
      
      // Should console.warn but not throw
      const consoleSpy = jest.spyOn(console, 'warn').mockImplementation();
      
      expect(() => {
        new AchievementTracker();
      }).not.toThrow();

      const tracker = new AchievementTracker();
      const progress = tracker.getProgress();
      expect(progress.totalBricksDestroyed).toBe(0);
      
      expect(consoleSpy).toHaveBeenCalledWith(
        'Failed to load achievement progress:',
        expect.any(Error)
      );
      
      consoleSpy.mockRestore();
    });
  });
});
