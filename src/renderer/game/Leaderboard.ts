/**
 * Leaderboard system with fake entries and player name entry
 */

export interface LeaderboardEntry {
  name: string;
  time: number; // in seconds
  isPlayer: boolean;
}

export class Leaderboard {
  private static readonly FAKE_NAMES = [
    'ZYX', 'VOX', 'NEO', 'RAD', 'CYB', 'GLT', 'NOX', 'VEX',
    'KRZ', 'BLK', 'ASH', 'DRK', 'GRY', 'SHD', 'VPR', 'TXN',
  ];

  private static readonly DEFAULT_TIMES = [300, 360, 420, 480]; // 5m, 6m, 7m, 8m

  /**
   * Generate fake leaderboard for a level
   */
  static generateFakeLeaderboard(levelId: number): LeaderboardEntry[] {
    // Use level ID to seed consistent fake names
    const entries: LeaderboardEntry[] = [];
    
    for (let i = 0; i < 4; i++) {
      const nameIndex = (levelId * 4 + i) % this.FAKE_NAMES.length;
      entries.push({
        name: this.FAKE_NAMES[nameIndex],
        time: this.DEFAULT_TIMES[i],
        isPlayer: false,
      });
    }
    
    return entries;
  }

  /**
   * Check if player time makes the leaderboard
   */
  static isPlayerOnLeaderboard(playerTime: number, entries: LeaderboardEntry[]): boolean {
    const worstTime = Math.max(...entries.map(e => e.time));
    return playerTime < worstTime;
  }

  /**
   * Insert player into leaderboard and return updated entries
   */
  static insertPlayer(
    playerTime: number,
    playerName: string,
    entries: LeaderboardEntry[]
  ): LeaderboardEntry[] {
    // Add player entry
    const newEntries = [
      ...entries,
      { name: playerName, time: playerTime, isPlayer: true },
    ];

    // Sort by time (ascending)
    newEntries.sort((a, b) => a.time - b.time);

    // Keep only top 4
    return newEntries.slice(0, 4);
  }

  /**
   * Get player's rank (1-4) or null if not on leaderboard
   */
  static getPlayerRank(entries: LeaderboardEntry[]): number | null {
    const playerIndex = entries.findIndex(e => e.isPlayer);
    return playerIndex >= 0 ? playerIndex + 1 : null;
  }

  /**
   * Format time as M:SS
   */
  static formatTime(seconds: number): string {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  }
}
