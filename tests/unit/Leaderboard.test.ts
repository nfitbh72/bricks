/**
 * Unit tests for Leaderboard class
 * Tests focus on core leaderboard behavior: ranking, insertion, and formatting
 */

import { Leaderboard, LeaderboardEntry } from '../../src/renderer/game/systems/Leaderboard';

describe('Leaderboard', () => {
  beforeEach(() => {
    // Reset static state between tests
    (Leaderboard as any).cachedData = {};
    
    // Mock console to reduce noise
    jest.spyOn(console, 'error').mockImplementation();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('getLeaderboard', () => {
    it('should return leaderboard entries for a level', () => {
      const result = Leaderboard.getLeaderboard(1);
      
      expect(result).toHaveLength(4);
      expect(result[0]).toHaveProperty('name');
      expect(result[0]).toHaveProperty('time');
      expect(result[0]).toHaveProperty('isPlayer');
    });

    it('should generate consistent fake entries for same level', () => {
      const result1 = Leaderboard.getLeaderboard(1);
      const result2 = Leaderboard.getLeaderboard(1);
      
      expect(result1[0].name).toBe(result2[0].name);
      expect(result1[0].time).toBe(result2[0].time);
    });

    it('should generate different entries for different levels', () => {
      const result1 = Leaderboard.getLeaderboard(1);
      const result2 = Leaderboard.getLeaderboard(2);
      
      expect(result1[0].name).not.toBe(result2[0].name);
    });

    it('should mark generated entries as non-player', () => {
      const result = Leaderboard.getLeaderboard(1);
      
      expect(result.every(e => !e.isPlayer)).toBe(true);
    });

    it('should generate reasonable default times', () => {
      const result = Leaderboard.getLeaderboard(1);
      
      expect(result[0].time).toBe(300); // 5 minutes
      expect(result[1].time).toBe(360); // 6 minutes
      expect(result[2].time).toBe(420); // 7 minutes
      expect(result[3].time).toBe(480); // 8 minutes
    });
  });

  describe('isPlayerOnLeaderboard - checking if player qualifies', () => {
    it('should return true when player time is better than worst entry', () => {
      const entries = [
        { name: 'A', time: 100, isPlayer: false },
        { name: 'B', time: 200, isPlayer: false },
        { name: 'C', time: 300, isPlayer: false }
      ];
      
      expect(Leaderboard.isPlayerOnLeaderboard(250, entries)).toBe(true);
    });

    it('should return false when player time is worse than all entries', () => {
      const entries = [
        { name: 'A', time: 100, isPlayer: false },
        { name: 'B', time: 200, isPlayer: false },
        { name: 'C', time: 300, isPlayer: false }
      ];
      
      expect(Leaderboard.isPlayerOnLeaderboard(350, entries)).toBe(false);
    });

    it('should return false when player time equals worst time', () => {
      const entries = [
        { name: 'A', time: 100, isPlayer: false },
        { name: 'B', time: 200, isPlayer: false }
      ];
      
      expect(Leaderboard.isPlayerOnLeaderboard(200, entries)).toBe(false);
    });

    it('should handle empty leaderboard', () => {
      expect(Leaderboard.isPlayerOnLeaderboard(100, [])).toBe(false);
    });
  });

  describe('insertPlayer - adding player to leaderboard', () => {
    it('should add player entry to leaderboard', () => {
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

  describe('getPlayerRank - finding player position', () => {
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

  describe('formatTime - time display formatting', () => {
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
