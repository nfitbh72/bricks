/**
 * Steam API for Renderer Process
 * Access Steam features from the game code
 */

declare global {
  interface Window {
    electronAPI: {
      quitApp: () => void;
      loadLeaderboards: () => Promise<Record<string, unknown>>;
      saveLeaderboards: (data: Record<string, unknown>) => Promise<{ success: boolean; error?: string }>;
      // Steam API
      steam: {
        isAvailable: () => Promise<boolean>;
        getPlayerName: () => Promise<string>;
        getSteamId: () => Promise<string>;
        unlockAchievement: (achievementId: string) => Promise<boolean>;
        isAchievementUnlocked: (achievementId: string) => Promise<boolean>;
        getUnlockedAchievements: () => Promise<string[]>;
        clearAchievement: (achievementId: string) => Promise<boolean>;
        isOfflineMode: () => Promise<boolean>;
      };
    };
  }
}

/**
 * Steam API wrapper for easy access in game code
 */
export class SteamAPI {
  private static instance: SteamAPI;
  private available: boolean = false;
  private offlineMode: boolean = true;

  private constructor() {}

  static getInstance(): SteamAPI {
    if (!SteamAPI.instance) {
      SteamAPI.instance = new SteamAPI();
    }
    return SteamAPI.instance;
  }

  /**
   * Initialize and check Steam availability
   */
  async initialize(): Promise<boolean> {
    try {
      this.available = await window.electronAPI.steam.isAvailable();
      this.offlineMode = await window.electronAPI.steam.isOfflineMode();
      
      if (this.available) {
        const playerName = await window.electronAPI.steam.getPlayerName();
        console.log(`🎮 Steam active - Welcome ${playerName}!`);
      } else {
        console.log('🎮 Running in offline mode');
      }
      
      return this.available;
    } catch (error) {
      console.warn('Steam API not available:', error);
      this.available = false;
      this.offlineMode = true;
      return false;
    }
  }

  /**
   * Check if Steam is available
   */
  isAvailable(): boolean {
    return this.available;
  }

  /**
   * Check if running in offline mode
   */
  isOfflineMode(): boolean {
    return this.offlineMode;
  }

  /**
   * Get player name
   */
  async getPlayerName(): Promise<string> {
    if (!this.available) return 'Player';
    return await window.electronAPI.steam.getPlayerName();
  }

  /**
   * Get Steam ID
   */
  async getSteamId(): Promise<string> {
    if (!this.available) return '';
    return await window.electronAPI.steam.getSteamId();
  }

  /**
   * Unlock achievement
   */
  async unlockAchievement(achievementId: string): Promise<boolean> {
    try {
      return await window.electronAPI.steam.unlockAchievement(achievementId);
    } catch {
      console.error('Failed to unlock achievement');
      return false;
    }
  }

  /**
   * Check if achievement is unlocked
   */
  async isAchievementUnlocked(achievementId: string): Promise<boolean> {
    try {
      return await window.electronAPI.steam.isAchievementUnlocked(achievementId);
    } catch {
      return false;
    }
  }

  /**
   * Get all unlocked achievements
   */
  async getUnlockedAchievements(): Promise<string[]> {
    try {
      return await window.electronAPI.steam.getUnlockedAchievements();
    } catch {
      return [];
    }
  }

  /**
   * Clear achievement (for testing)
   */
  async clearAchievement(achievementId: string): Promise<boolean> {
    try {
      return await window.electronAPI.steam.clearAchievement(achievementId);
    } catch {
      return false;
    }
  }
}

// Export singleton instance
export const steamAPI = SteamAPI.getInstance();
