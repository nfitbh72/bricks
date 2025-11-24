/**
 * AchievementManager Tests
 * Tests Steam API integration and IPC communication
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

import { AchievementManager } from '../../src/main/steam/AchievementManager';

// Mock Electron IPC
const mockIPC = {
  send: jest.fn(),
  on: jest.fn(),
  invoke: jest.fn(),
  handle: jest.fn(),
};

const mockElectronAPI = {
  unlockAchievement: jest.fn(),
  getUnlockedAchievements: jest.fn(),
  isSteamEnabled: jest.fn(),
};

// Mock the electron API
(global as any).electronAPI = mockElectronAPI;

describe('AchievementManager', () => {
  let manager: AchievementManager;

  beforeEach(() => {
    jest.clearAllMocks();
    manager = new AchievementManager();
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
    it('should initialize without errors', () => {
      expect(() => {
        manager.initialize();
      }).not.toThrow();
    });
  });

  describe('achievement unlocking', () => {
    beforeEach(() => {
      manager.initialize();
    });

    it('should unlock achievement in offline mode', () => {
      // AchievementManager starts in offline mode by default
      const result = manager.unlockAchievement('FIRST_LEVEL');

      expect(result).toBe(true);
    });

    it('should not unlock same achievement twice', () => {
      // First unlock
      const result1 = manager.unlockAchievement('FIRST_LEVEL');
      expect(result1).toBe(true);

      // Second unlock attempt
      const result2 = manager.unlockAchievement('FIRST_LEVEL');
      expect(result2).toBe(false);
    });

    it('should handle invalid achievement IDs gracefully', () => {
      const result = manager.unlockAchievement('');

      // Should not throw
      expect(typeof result).toBe('boolean');
    });
  });

  describe('getting unlocked achievements', () => {
    beforeEach(() => {
      manager.initialize();
    });

    it('should get unlocked achievements from local storage', () => {
      // First unlock some achievements
      manager.unlockAchievement('FIRST_LEVEL');
      manager.unlockAchievement('BRICK_SMASHER');

      const result = manager.getUnlockedAchievements();

      expect(result).toEqual(['FIRST_LEVEL', 'BRICK_SMASHER']);
    });

    it('should handle empty unlocked achievements list', () => {
      const result = manager.getUnlockedAchievements();

      expect(result).toEqual([]);
    });
  });

  describe('reset functionality', () => {
    beforeEach(() => {
      manager.initialize();
    });

    it('should clear unlocked achievements cache', () => {
      // First unlock some achievements
      manager.unlockAchievement('FIRST_LEVEL');
      manager.unlockAchievement('BRICK_SMASHER');

      // Clear achievements
      const result1 = manager.clearAchievement('FIRST_LEVEL');
      const result2 = manager.clearAchievement('BRICK_SMASHER');

      expect(result1).toBe(true);
      expect(result2).toBe(true);

      // Should be able to unlock again
      const unlockAgain = manager.unlockAchievement('FIRST_LEVEL');
      expect(unlockAgain).toBe(true);
    });
  });

  describe('offline mode handling', () => {
    it('should work in offline mode by default', () => {
      manager.initialize();

      // Should work in offline mode
      const result = manager.unlockAchievement('FIRST_LEVEL');
      expect(result).toBe(true);
    });
  });

  describe('error handling', () => {
    it('should handle invalid achievement IDs gracefully', () => {
      manager.initialize();

      const result1 = manager.unlockAchievement('');
      const result2 = manager.unlockAchievement(null as any);
      const result3 = manager.unlockAchievement(undefined as any);

      // Should not throw
      expect(typeof result1).toBe('boolean');
      expect(typeof result2).toBe('boolean');
      expect(typeof result3).toBe('boolean');
    });
  });

  describe('concurrent operations', () => {
    it('should handle multiple unlock attempts', () => {
      manager.initialize();

      // Try to unlock multiple achievements
      const result1 = manager.unlockAchievement('FIRST_LEVEL');
      const result2 = manager.unlockAchievement('BRICK_SMASHER');
      const result3 = manager.unlockAchievement('BOSS_SMASHER');

      expect(result1).toBe(true);
      expect(result2).toBe(true);
      expect(result3).toBe(true);
    });

    it('should handle concurrent unlock of same achievement', () => {
      manager.initialize();

      // Try to unlock same achievement multiple times
      const result1 = manager.unlockAchievement('FIRST_LEVEL');
      const result2 = manager.unlockAchievement('FIRST_LEVEL');
      const result3 = manager.unlockAchievement('FIRST_LEVEL');

      // Should only unlock once, but first call should return true
      expect(result1).toBe(true);
      expect(result2).toBe(false);
      expect(result3).toBe(false);
    });
  });

  describe('state management', () => {
    it('should handle initialization correctly', async () => {
      expect(() => {
        manager.initialize();
      }).not.toThrow();
    });

    it('should handle multiple initialization calls', async () => {
      manager.initialize();
      manager.initialize();
      manager.initialize();

      // Should not cause issues
      expect(() => {
        manager.initialize();
      }).not.toThrow();
    });
  });
});
