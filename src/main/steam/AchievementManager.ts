/**
 * Achievement Manager - Handles Steam achievements with offline fallback
 */

import { ipcMain } from 'electron';
import { SteamManager } from './SteamManager';

export interface Achievement {
  id: string;
  name: string;
  description: string;
  hidden?: boolean;
}

export class AchievementManager {
  private steamManager: SteamManager;
  private unlockedAchievements: Set<string> = new Set();
  private offlineMode: boolean = true;

  constructor() {
    this.steamManager = SteamManager.getInstance();
  }

  /**
   * Initialize achievement system
   */
  initialize(): void {
    this.offlineMode = !this.steamManager.isAvailable();
    
    if (!this.offlineMode) {
      this.loadSteamAchievements();
    } else {
      console.log('🏆 Achievement system running in OFFLINE mode');
      this.loadOfflineAchievements();
    }

    this.setupIPC();
  }

  /**
   * Load achievements from Steam
   */
  private loadSteamAchievements(): void {
    const client = this.steamManager.getClient();
    if (!client) return;

    try {
      // In a real implementation, you'd query all achievement IDs
      // For now, we'll just track what gets unlocked
      console.log('✅ Steam achievements loaded');
    } catch (error) {
      console.error('Failed to load Steam achievements:', error);
    }
  }

  /**
   * Load achievements from local storage (offline mode)
   */
  private loadOfflineAchievements(): void {
    try {
      // Load from local storage or file
      // For now, start with empty set
      console.log('📝 Offline achievements initialized');
    } catch (error) {
      console.error('Failed to load offline achievements:', error);
    }
  }

  /**
   * Unlock an achievement
   * Works in both online and offline mode
   */
  unlockAchievement(achievementId: string): boolean {
    // Check if already unlocked
    if (this.unlockedAchievements.has(achievementId)) {
      return false;
    }

    if (this.offlineMode) {
      // Offline mode - just track locally
      console.log(`🏆 [OFFLINE] Achievement unlocked: ${achievementId}`);
      this.unlockedAchievements.add(achievementId);
      return true;
    }

    // Online mode - unlock via Steam
    const client = this.steamManager.getClient();
    if (!client) {
      console.warn('Steam client not available');
      return false;
    }

    try {
      const success = client.achievement.activate(achievementId);
      if (success) {
        console.log(`🏆 Achievement unlocked: ${achievementId}`);
        this.unlockedAchievements.add(achievementId);
        return true;
      }
      return false;
    } catch (error) {
      console.error(`Failed to unlock achievement ${achievementId}:`, error);
      return false;
    }
  }

  /**
   * Check if achievement is unlocked
   */
  isUnlocked(achievementId: string): boolean {
    if (this.offlineMode) {
      return this.unlockedAchievements.has(achievementId);
    }

    const client = this.steamManager.getClient();
    if (!client) return false;

    try {
      return client.achievement.isActivated(achievementId);
    } catch {
      return this.unlockedAchievements.has(achievementId);
    }
  }

  /**
   * Clear achievement (for testing only)
   */
  clearAchievement(achievementId: string): boolean {
    if (this.offlineMode) {
      this.unlockedAchievements.delete(achievementId);
      console.log(`🧹 [OFFLINE] Achievement cleared: ${achievementId}`);
      return true;
    }

    const client = this.steamManager.getClient();
    if (!client) return false;

    try {
      const success = client.achievement.clear(achievementId);
      if (success) {
        this.unlockedAchievements.delete(achievementId);
        console.log(`🧹 Achievement cleared: ${achievementId}`);
      }
      return success;
    } catch {
      console.error(`Failed to clear achievement ${achievementId}`);
      return false;
    }
  }

  /**
   * Get all unlocked achievements
   */
  getUnlockedAchievements(): string[] {
    return Array.from(this.unlockedAchievements);
  }

  /**
   * Setup IPC handlers for renderer process
   */
  private setupIPC(): void {
    ipcMain.handle('steam:unlockAchievement', (_, achievementId: string) => {
      return this.unlockAchievement(achievementId);
    });

    ipcMain.handle('steam:isAchievementUnlocked', (_, achievementId: string) => {
      return this.isUnlocked(achievementId);
    });

    ipcMain.handle('steam:getUnlockedAchievements', () => {
      return this.getUnlockedAchievements();
    });

    ipcMain.handle('steam:clearAchievement', (_, achievementId: string) => {
      return this.clearAchievement(achievementId);
    });

    ipcMain.handle('steam:isOfflineMode', () => {
      return this.offlineMode;
    });
  }
}
