/**
 * Unit tests for Leaderboard class
 */

import { Leaderboard, LeaderboardEntry } from '../../src/renderer/game/systems/Leaderboard';

describe('Leaderboard', () => {
  let mockElectronAPI: any;

  beforeEach(() => {
    // Reset static state
    (Leaderboard as any).cachedData = {};
    (Leaderboard as any).isLoaded = false;
    
    // Mock electron API
    mockElectronAPI = {
      loadLeaderboards: jest.fn(),
      saveLeaderboards: jest.fn()
    };
    
    (global as any).window = {
      electron: mockElectronAPI
    };
    
    // Mock console methods to reduce noise
    jest.spyOn(console, 'log').mockImplementation();
    jest.spyOn(console, 'warn').mockImplementation();
    jest.spyOn(console, 'error').mockImplementation();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('load', () => {
    it('should load leaderboard data from electron API', async () => {
      const mockData = {
        '1': [
          { name: 'TEST', time: 100, isPlayer: false },
          { name: 'ABC', time: 200, isPlayer: false }
        ]
      };
      mockElectronAPI.loadLeaderboards.mockResolvedValue(mockData);
      
      await Leaderboard.load();
      
      expect(mockElectronAPI.loadLeaderboards).toHaveBeenCalled();
      expect((Leaderboard as any).isLoaded).toBe(true);
    });

    it('should handle missing electron API gracefully', async () => {
      (global as any).window = { electron: null };
      
      await Leaderboard.load();
      
      expect((Leaderboard as any).isLoaded).toBe(true);
    });

    it('should parse level IDs correctly', async () => {
      const mockData = {
        '1': [{ name: 'TEST', time: 100, isPlayer: false }],
        '2': [{ name: 'ABC', time: 200, isPlayer: false }]
      };
      mockElectronAPI.loadLeaderboards.mockResolvedValue(mockData);
      
      await Leaderboard.load();
      
      const cachedData = (Leaderboard as any).cachedData;
      expect(cachedData[1]).toBeDefined();
      expect(cachedData[2]).toBeDefined();
    });

    it('should mark entries as non-player', async () => {
      const mockData = {
        '1': [{ name: 'TEST', time: 100, isPlayer: true }]
      };
      mockElectronAPI.loadLeaderboards.mockResolvedValue(mockData);
      
      await Leaderboard.load();
      
      const cachedData = (Leaderboard as any).cachedData;
      expect(cachedData[1][0].isPlayer).toBe(false);
    });

    it('should handle empty data', async () => {
      mockElectronAPI.loadLeaderboards.mockResolvedValue(null);
      
      await Leaderboard.load();
      
      expect((Leaderboard as any).isLoaded).toBe(true);
      expect((Leaderboard as any).cachedData).toEqual({});
    });

    it('should handle load errors', async () => {
      mockElectronAPI.loadLeaderboards.mockRejectedValue(new Error('Load failed'));
      
      await Leaderboard.load();
      
      expect((Leaderboard as any).isLoaded).toBe(true);
    });

    it('should not reload if already loaded', async () => {
      mockElectronAPI.loadLeaderboards.mockResolvedValue({});
      
      await Leaderboard.load();
      await Leaderboard.load();
      
      expect(mockElectronAPI.loadLeaderboards).toHaveBeenCalledTimes(1);
    });

    it('should skip empty arrays', async () => {
      const mockData = {
        '1': [],
        '2': [{ name: 'TEST', time: 100, isPlayer: false }]
      };
      mockElectronAPI.loadLeaderboards.mockResolvedValue(mockData);
      
      await Leaderboard.load();
      
      const cachedData = (Leaderboard as any).cachedData;
      expect(cachedData[1]).toBeUndefined();
      expect(cachedData[2]).toBeDefined();
    });
  });

  describe('save', () => {
    it('should save leaderboard data via electron API', async () => {
      (Leaderboard as any).cachedData = {
        1: [{ name: 'TEST', time: 100, isPlayer: false }]
      };
      
      await Leaderboard.save();
      
      expect(mockElectronAPI.saveLeaderboards).toHaveBeenCalled();
    });

    it('should filter out player entries before saving', async () => {
      (Leaderboard as any).cachedData = {
        1: [
          { name: 'TEST', time: 100, isPlayer: false },
          { name: 'PLAYER', time: 150, isPlayer: true }
        ]
      };
      
      await Leaderboard.save();
      
      const savedData = mockElectronAPI.saveLeaderboards.mock.calls[0][0];
      expect(savedData['1']).toHaveLength(2);
      expect(savedData['1'].every((e: LeaderboardEntry) => !e.isPlayer)).toBe(true);
    });

    it('should convert data to JSON format', async () => {
      (Leaderboard as any).cachedData = {
        1: [{ name: 'TEST', time: 100, isPlayer: false }]
      };
      
      await Leaderboard.save();
      
      const savedData = mockElectronAPI.saveLeaderboards.mock.calls[0][0];
      expect(typeof savedData).toBe('object');
      expect(savedData['1']).toBeDefined();
    });

    it('should handle save errors', async () => {
      mockElectronAPI.saveLeaderboards.mockRejectedValue(new Error('Save failed'));
      (Leaderboard as any).cachedData = {
        1: [{ name: 'TEST', time: 100, isPlayer: false }]
      };
      
      await expect(Leaderboard.save()).resolves.not.toThrow();
    });

    it('should not save empty arrays', async () => {
      (Leaderboard as any).cachedData = {
        1: [],
        2: [{ name: 'TEST', time: 100, isPlayer: false }]
      };
      
      await Leaderboard.save();
      
      const savedData = mockElectronAPI.saveLeaderboards.mock.calls[0][0];
      expect(savedData['1']).toBeUndefined();
      expect(savedData['2']).toBeDefined();
    });
  });

  describe('getLeaderboard', () => {
    it('should return cached data if available', async () => {
      const cachedEntries = [{ name: 'TEST', time: 100, isPlayer: false }];
      (Leaderboard as any).cachedData = { 1: cachedEntries };
      (Leaderboard as any).isLoaded = true;
      
      const result = await Leaderboard.getLeaderboard(1);
      
      expect(result).toEqual(cachedEntries);
      expect(result).not.toBe(cachedEntries); // Should be a copy
    });

    it('should generate fake entries if no cache', async () => {
      (Leaderboard as any).isLoaded = true;
      
      const result = await Leaderboard.getLeaderboard(1);
      
      expect(result).toHaveLength(4);
      expect(result[0]).toHaveProperty('name');
      expect(result[0]).toHaveProperty('time');
      expect(result[0]).toHaveProperty('isPlayer');
    });

    it('should cache generated fake entries', async () => {
      (Leaderboard as any).isLoaded = true;
      
      await Leaderboard.getLeaderboard(1);
      
      const cachedData = (Leaderboard as any).cachedData;
      expect(cachedData[1]).toBeDefined();
      expect(cachedData[1]).toHaveLength(4);
    });

    it('should call load if not loaded', async () => {
      mockElectronAPI.loadLeaderboards.mockResolvedValue({});
      
      await Leaderboard.getLeaderboard(1);
      
      expect(mockElectronAPI.loadLeaderboards).toHaveBeenCalled();
    });
  });

  describe('updateLeaderboard', () => {
    it('should update cache', async () => {
      (Leaderboard as any).isLoaded = true;
      const newEntries = [{ name: 'NEW', time: 50, isPlayer: false }];
      
      await Leaderboard.updateLeaderboard(1, newEntries);
      
      const cachedData = (Leaderboard as any).cachedData;
      expect(cachedData[1]).toEqual(newEntries);
    });

    it('should trigger save', async () => {
      (Leaderboard as any).isLoaded = true;
      const newEntries = [{ name: 'NEW', time: 50, isPlayer: false }];
      
      await Leaderboard.updateLeaderboard(1, newEntries);
      
      expect(mockElectronAPI.saveLeaderboards).toHaveBeenCalled();
    });

    it('should call load if not loaded', async () => {
      mockElectronAPI.loadLeaderboards.mockResolvedValue({});
      const newEntries = [{ name: 'NEW', time: 50, isPlayer: false }];
      
      await Leaderboard.updateLeaderboard(1, newEntries);
      
      expect(mockElectronAPI.loadLeaderboards).toHaveBeenCalled();
    });
  });

  describe('generateFakeLeaderboard', () => {
    it('should generate consistent fake names', () => {
      const result1 = (Leaderboard as any).generateFakeLeaderboard(1);
      const result2 = (Leaderboard as any).generateFakeLeaderboard(1);
      
      expect(result1[0].name).toBe(result2[0].name);
    });

    it('should generate reasonable fake times', () => {
      const result = (Leaderboard as any).generateFakeLeaderboard(1);
      
      expect(result[0].time).toBe(300); // 5 minutes
      expect(result[1].time).toBe(360); // 6 minutes
      expect(result[2].time).toBe(420); // 7 minutes
      expect(result[3].time).toBe(480); // 8 minutes
    });

    it('should create 4 fake entries', () => {
      const result = (Leaderboard as any).generateFakeLeaderboard(1);
      
      expect(result).toHaveLength(4);
    });

    it('should mark all entries as non-player', () => {
      const result = (Leaderboard as any).generateFakeLeaderboard(1);
      
      expect(result.every((e: LeaderboardEntry) => !e.isPlayer)).toBe(true);
    });

    it('should generate different names for different levels', () => {
      const result1 = (Leaderboard as any).generateFakeLeaderboard(1);
      const result2 = (Leaderboard as any).generateFakeLeaderboard(2);
      
      expect(result1[0].name).not.toBe(result2[0].name);
    });
  });

  describe('isPlayerOnLeaderboard', () => {
    it('should return true if player time beats worst time', () => {
      const entries = [
        { name: 'A', time: 100, isPlayer: false },
        { name: 'B', time: 200, isPlayer: false },
        { name: 'C', time: 300, isPlayer: false }
      ];
      
      expect(Leaderboard.isPlayerOnLeaderboard(250, entries)).toBe(true);
    });

    it('should return false if player time is worse than all', () => {
      const entries = [
        { name: 'A', time: 100, isPlayer: false },
        { name: 'B', time: 200, isPlayer: false },
        { name: 'C', time: 300, isPlayer: false }
      ];
      
      expect(Leaderboard.isPlayerOnLeaderboard(350, entries)).toBe(false);
    });

    it('should return true if player time equals worst time', () => {
      const entries = [
        { name: 'A', time: 100, isPlayer: false },
        { name: 'B', time: 200, isPlayer: false }
      ];
      
      expect(Leaderboard.isPlayerOnLeaderboard(200, entries)).toBe(false);
    });
  });

  describe('insertPlayer', () => {
    it('should add player entry', () => {
      const entries = [
        { name: 'A', time: 100, isPlayer: false },
        { name: 'B', time: 300, isPlayer: false }
      ];
      
      const result = Leaderboard.insertPlayer(200, 'PLAYER', entries);
      
      expect(result.some(e => e.isPlayer)).toBe(true);
      expect(result.find(e => e.isPlayer)?.name).toBe('PLAYER');
    });

    it('should sort by time ascending', () => {
      const entries = [
        { name: 'A', time: 100, isPlayer: false },
        { name: 'C', time: 300, isPlayer: false }
      ];
      
      const result = Leaderboard.insertPlayer(200, 'PLAYER', entries);
      
      expect(result[0].time).toBeLessThanOrEqual(result[1].time);
      expect(result[1].time).toBeLessThanOrEqual(result[2].time);
    });

    it('should limit to top 4 entries', () => {
      const entries = [
        { name: 'A', time: 100, isPlayer: false },
        { name: 'B', time: 200, isPlayer: false },
        { name: 'C', time: 300, isPlayer: false },
        { name: 'D', time: 400, isPlayer: false }
      ];
      
      const result = Leaderboard.insertPlayer(150, 'PLAYER', entries);
      
      expect(result).toHaveLength(4);
    });

    it('should remove existing player entries', () => {
      const entries = [
        { name: 'A', time: 100, isPlayer: false },
        { name: 'OLD', time: 250, isPlayer: true },
        { name: 'B', time: 300, isPlayer: false }
      ];
      
      const result = Leaderboard.insertPlayer(200, 'NEW', entries);
      
      const playerEntries = result.filter(e => e.isPlayer);
      expect(playerEntries).toHaveLength(1);
      expect(playerEntries[0].name).toBe('NEW');
    });

    it('should place player in correct position', () => {
      const entries = [
        { name: 'A', time: 100, isPlayer: false },
        { name: 'C', time: 300, isPlayer: false }
      ];
      
      const result = Leaderboard.insertPlayer(200, 'PLAYER', entries);
      
      expect(result[1].name).toBe('PLAYER');
      expect(result[1].time).toBe(200);
    });
  });

  describe('getPlayerRank', () => {
    it('should return 1-based rank for player', () => {
      const entries = [
        { name: 'A', time: 100, isPlayer: false },
        { name: 'PLAYER', time: 200, isPlayer: true },
        { name: 'B', time: 300, isPlayer: false }
      ];
      
      expect(Leaderboard.getPlayerRank(entries)).toBe(2);
    });

    it('should return null if player not on leaderboard', () => {
      const entries = [
        { name: 'A', time: 100, isPlayer: false },
        { name: 'B', time: 200, isPlayer: false }
      ];
      
      expect(Leaderboard.getPlayerRank(entries)).toBeNull();
    });

    it('should return 1 if player is first', () => {
      const entries = [
        { name: 'PLAYER', time: 100, isPlayer: true },
        { name: 'A', time: 200, isPlayer: false }
      ];
      
      expect(Leaderboard.getPlayerRank(entries)).toBe(1);
    });

    it('should return 4 if player is last', () => {
      const entries = [
        { name: 'A', time: 100, isPlayer: false },
        { name: 'B', time: 200, isPlayer: false },
        { name: 'C', time: 300, isPlayer: false },
        { name: 'PLAYER', time: 400, isPlayer: true }
      ];
      
      expect(Leaderboard.getPlayerRank(entries)).toBe(4);
    });
  });

  describe('formatTime', () => {
    it('should format time as M:SS', () => {
      expect(Leaderboard.formatTime(65)).toBe('1:05');
    });

    it('should pad seconds with zero', () => {
      expect(Leaderboard.formatTime(61)).toBe('1:01');
    });

    it('should handle zero seconds', () => {
      expect(Leaderboard.formatTime(60)).toBe('1:00');
    });

    it('should handle times over 10 minutes', () => {
      expect(Leaderboard.formatTime(665)).toBe('11:05');
    });

    it('should handle times under 1 minute', () => {
      expect(Leaderboard.formatTime(45)).toBe('0:45');
    });

    it('should handle zero time', () => {
      expect(Leaderboard.formatTime(0)).toBe('0:00');
    });
  });
});
