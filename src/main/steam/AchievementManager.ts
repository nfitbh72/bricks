/**
 * Achievement Manager - Handles Steam achievements with offline fallback
 */

import { app, ipcMain } from 'electron';
import fs from 'fs';
import path from 'path';
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
  private storagePath: string;

  constructor() {
    this.steamManager = SteamManager.getInstance();
    this.storagePath = this.getStoragePath();
  }

  /**
   * Initialize achievement system
   */
  initialize(): void {
    this.offlineMode = !this.steamManager.isAvailable();
    
    // Always load local achievements first so they persist across runs
    this.loadOfflineAchievements();

    if (!this.offlineMode) {
      this.loadSteamAchievements();
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
      console.log('✅ Steam achievements loaded (online mode)');
    } catch (error) {
      console.error('Failed to load Steam achievements:', error);
    }
  }

  /**
   * Load achievements from local storage (offline mode)
   */
  private loadOfflineAchievements(): void {
    try {
      if (!fs.existsSync(this.storagePath)) {
        console.log('📝 No existing achievement save found - starting fresh');
        return;
      }

      const raw = fs.readFileSync(this.storagePath, 'utf-8');
      const parsed = JSON.parse(raw) as { unlocked: string[] };
      if (Array.isArray(parsed.unlocked)) {
        this.unlockedAchievements = new Set(parsed.unlocked);
        console.log(`📝 Loaded ${this.unlockedAchievements.size} achievements from local storage`);
      } else {
        console.warn('Offline achievements file malformed - starting fresh');
      }
    } catch (error) {
      console.error('Failed to load offline achievements:', error);
    }
  }

  /**
   * Save current achievements to local JSON file
   */
  private saveOfflineAchievements(): void {
    try {
      const dir = path.dirname(this.storagePath);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }

      const data = {
        unlocked: Array.from(this.unlockedAchievements),
      };

      fs.writeFileSync(this.storagePath, JSON.stringify(data, null, 2), 'utf-8');
    } catch (error) {
      console.error('Failed to save offline achievements:', error);
    }
  }

  /**
   * Get the path to the local achievements JSON file
   */
  private getStoragePath(): string {
    const userData = app.getPath('userData');
    return path.join(userData, 'achievements.json');
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
      // Offline mode - track locally only
      this.unlockedAchievements.add(achievementId);
      this.saveOfflineAchievements();
      return true;
    }

    // Online mode - unlock via Steam, but still mirror locally
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
        this.saveOfflineAchievements();
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
      this.saveOfflineAchievements();
      return true;
    }

    const client = this.steamManager.getClient();
    if (!client) return false;

    try {
      const success = client.achievement.clear(achievementId);
      if (success) {
        this.unlockedAchievements.delete(achievementId);
        console.log(`🧹 Achievement cleared: ${achievementId}`);
        this.saveOfflineAchievements();
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
