/**
 * Leaderboard system with persistent storage and fake entries
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
  
  private static cachedData: { [levelId: number]: LeaderboardEntry[] } = {};
  private static isLoaded = false;

  /**
   * Load leaderboards from persistent storage
   */
  static async load(): Promise<void> {
    if (this.isLoaded) {
      console.log('[Leaderboard] Already loaded, skipping');
      return;
    }
    
    console.log('[Leaderboard] Starting load...');
    
    try {
      // Check if electron API is available
      if (!window.electron) {
        console.warn('[Leaderboard] Electron API not available, using fake leaderboards only');
        this.isLoaded = true;
        return;
      }
      
      console.log('[Leaderboard] Calling window.electron.loadLeaderboards()...');
      const data = await window.electron.loadLeaderboards();
      console.log('[Leaderboard] Loaded data from disk:', JSON.stringify(data, null, 2));
      
      if (!data) {
        console.log('[Leaderboard] No data returned, starting fresh');
        this.isLoaded = true;
        return;
      }
      
      // Convert string keys to numbers and filter out player entries
      this.cachedData = {};
      for (const [levelIdStr, entries] of Object.entries(data)) {
        const levelId = parseInt(levelIdStr, 10);
        const entriesArray = entries as LeaderboardEntry[];
        
        // Only cache if there are actual entries, otherwise we'll generate fake ones later
        if (entriesArray.length > 0) {
          // Remove isPlayer flag from persisted data
          this.cachedData[levelId] = entriesArray.map(e => ({ ...e, isPlayer: false }));
          console.log(`[Leaderboard] Cached ${this.cachedData[levelId].length} entries for level ${levelId}`);
        } else {
          console.log(`[Leaderboard] Skipping empty array for level ${levelId}, will generate fake data`);
        }
      }
      this.isLoaded = true;
      console.log('[Leaderboard] Load complete. Cache:', this.cachedData);
    } catch (error) {
      console.error('[Leaderboard] Failed to load leaderboards:', error);
      this.isLoaded = true; // Mark as loaded even on error to prevent retry loops
    }
  }

  /**
   * Save leaderboards to persistent storage
   */
  static async save(): Promise<void> {
    try {
      // Convert to plain object for JSON serialization
      const dataToSave: { [key: string]: LeaderboardEntry[] } = {};
      for (const [levelId, entries] of Object.entries(this.cachedData)) {
        // Save all entries, but remove the isPlayer flag (it's only for display)
        const entriesToSave = entries.map(e => ({
          name: e.name,
          time: e.time,
          isPlayer: false // Always save as false, isPlayer is only for temporary display
        }));
        
        // Only save if there are actual entries (don't save empty arrays)
        if (entriesToSave.length > 0) {
          dataToSave[levelId] = entriesToSave;
        }
      }
      console.log('[Leaderboard] Saving to disk:', JSON.stringify(dataToSave, null, 2));
      await window.electron?.saveLeaderboards(dataToSave);
    } catch (error) {
      console.error('[Leaderboard] Failed to save leaderboards:', error);
    }
  }

  /**
   * Get leaderboard for a level (loads from cache or generates fake data)
   */
  static async getLeaderboard(levelId: number): Promise<LeaderboardEntry[]> {
    console.log(`[Leaderboard] Getting leaderboard for level ${levelId}`);
    
    // Ensure data is loaded
    await this.load();
    
    // Return cached data if available
    if (this.cachedData[levelId]) {
      console.log(`[Leaderboard] Returning cached data for level ${levelId}:`, this.cachedData[levelId]);
      return [...this.cachedData[levelId]]; // Return copy to prevent mutation
    }
    
    // Generate fake leaderboard if no data exists and cache it
    console.log(`[Leaderboard] No cached data for level ${levelId}, generating fake leaderboard`);
    const fakeLeaderboard = this.generateFakeLeaderboard(levelId);
    this.cachedData[levelId] = fakeLeaderboard;
    console.log(`[Leaderboard] Generated fake leaderboard for level ${levelId}:`, fakeLeaderboard);
    return [...fakeLeaderboard];
  }

  /**
   * Update leaderboard for a level and save to storage
   */
  static async updateLeaderboard(levelId: number, entries: LeaderboardEntry[]): Promise<void> {
    console.log(`[Leaderboard] Updating leaderboard for level ${levelId}:`, entries);
    
    // Ensure data is loaded
    await this.load();
    
    // Update cache
    this.cachedData[levelId] = entries;
    console.log(`[Leaderboard] Cache updated for level ${levelId}`);
    
    // Save to persistent storage
    await this.save();
    console.log(`[Leaderboard] Saved to disk`);
  }

  /**
   * Generate fake leaderboard for a level
   */
  private static generateFakeLeaderboard(levelId: number): LeaderboardEntry[] {
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
    // Remove any existing player entries first (to avoid duplicates when updating name)
    const entriesWithoutPlayer = entries.filter(e => !e.isPlayer);
    
    // Add player entry
    const newEntries = [
      ...entriesWithoutPlayer,
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
