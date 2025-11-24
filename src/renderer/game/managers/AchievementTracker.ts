/**
 * Achievement Tracker
 * Centralizes all achievement tracking logic, progress counters, and unlock calls
 */

import { steamAPI } from '../../steam/steamAPI';
import { TOTAL_LEVELS, TOTAL_BOSSES } from '../../config/constants';
import { UpgradeType } from '../core/types';

// Progress persistence interface
interface AchievementProgress {
  levelsCompleted: number[];
  totalBricksDestroyed: number;
  totalBossesDefeated: number;
  totalDamageDealt: number;
  bossTypesDefeated: string[];
  upgradesActivated: string[];
}

// Per-level tracking state
interface LevelStats {
  levelStartLives: number;
  damageTakenThisLevel: boolean;
  levelHasBoss: boolean;
  maxComboThisLevel: number;
  currentCombo: number;
  lastBrickDestroyedTime: number;
}

export class AchievementTracker {
  private achievementsThisRun: string[] = [];
  private cumulativeProgress: AchievementProgress;
  private levelStats: LevelStats;
  
  // Constants
  private readonly COMBO_TIMEOUT = 2000; // 2 seconds to maintain combo
  private readonly SPEED_RUN_THRESHOLD = 10; // seconds
  private readonly SECRET_LEVEL_ID = 99; // TODO: Get from game config
  
  constructor() {
    this.cumulativeProgress = this.loadProgress();
    this.levelStats = this.resetLevelStats();
  }
  
  /**
   * Load cumulative progress from localStorage
   */
  private loadProgress(): AchievementProgress {
    try {
      const saved = localStorage.getItem('achievementProgress');
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (error) {
      console.warn('Failed to load achievement progress:', error);
    }
    
    // Default progress
    return {
      levelsCompleted: [],
      totalBricksDestroyed: 0,
      totalBossesDefeated: 0,
      totalDamageDealt: 0,
      bossTypesDefeated: [],
      upgradesActivated: [],
    };
  }
  
  /**
   * Save cumulative progress to localStorage
   */
  private saveProgress(): void {
    try {
      localStorage.setItem('achievementProgress', JSON.stringify(this.cumulativeProgress));
    } catch (error) {
      console.warn('Failed to save achievement progress:', error);
    }
  }
  
  /**
   * Reset per-level tracking stats
   */
  private resetLevelStats(): LevelStats {
    return {
      levelStartLives: 0,
      damageTakenThisLevel: false,
      levelHasBoss: false,
      maxComboThisLevel: 0,
      currentCombo: 0,
      lastBrickDestroyedTime: 0,
    };
  }
  
  /**
   * Unlock achievement and track it for this run
   */
  private async unlock(achievementId: string): Promise<boolean> {
    try {
      const success = await steamAPI.unlockAchievement(achievementId);
      if (success) {
        this.achievementsThisRun.push(achievementId);
        console.log(`🏆 Achievement unlocked: ${achievementId}`);
      }
      return success;
    } catch (error) {
      console.error(`Failed to unlock achievement ${achievementId}:`, error);
      return false;
    }
  }
  
  /**
   * Called when a new level starts
   */
  onLevelStart(levelId: number, startingLives: number, hasBoss: boolean): void {
    this.levelStats = this.resetLevelStats();
    this.levelStats.levelStartLives = startingLives;
    this.levelStats.levelHasBoss = hasBoss;
    
    // Check for secret level
    if (levelId === this.SECRET_LEVEL_ID) {
      this.unlock('SECRET_LEVEL');
    }
  }
  
  /**
   * Called when a level is completed
   */
  async onLevelComplete(levelId: number, time: number, livesRemaining: number): Promise<void> {
    // Track level completion
    if (!this.cumulativeProgress.levelsCompleted.includes(levelId)) {
      this.cumulativeProgress.levelsCompleted.push(levelId);
      this.saveProgress();
      
      // Level completion achievements
      if (levelId === 1) {
        await this.unlock('FIRST_LEVEL');
      }
      
      if (this.cumulativeProgress.levelsCompleted.length >= 5) {
        await this.unlock('HALFWAY_THERE');
      }
      
      if (this.cumulativeProgress.levelsCompleted.length >= TOTAL_LEVELS) {
        await this.unlock('LEVEL_MASTER');
      }
    }
    
    // Skill-based achievements
    if (livesRemaining === this.levelStats.levelStartLives) {
      await this.unlock('PERFECT_LEVEL');
    }
    
    if (time < this.SPEED_RUN_THRESHOLD) {
      await this.unlock('SPEED_RUN');
    }
    
    if (this.levelStats.levelHasBoss && !this.levelStats.damageTakenThisLevel) {
      await this.unlock('NO_DAMAGE');
    }
  }
  
  /**
   * Called when a brick is destroyed
   */
  async onBrickDestroyed(damage: number): Promise<void> {
    // Update cumulative stats
    this.cumulativeProgress.totalBricksDestroyed++;
    this.cumulativeProgress.totalDamageDealt += damage;
    this.saveProgress();
    
    // Check cumulative achievements
    if (this.cumulativeProgress.totalBricksDestroyed >= 1000) {
      await this.unlock('BRICK_SMASHER');
    }
    
    if (this.cumulativeProgress.totalDamageDealt >= 10000) {
      await this.unlock('DAMAGE_DEALER');
    }
    
    // Update combo tracking
    const now = Date.now();
    if (now - this.levelStats.lastBrickDestroyedTime < this.COMBO_TIMEOUT) {
      this.levelStats.currentCombo++;
    } else {
      this.levelStats.currentCombo = 1;
    }
    this.levelStats.lastBrickDestroyedTime = now;
    this.levelStats.maxComboThisLevel = Math.max(
      this.levelStats.maxComboThisLevel, 
      this.levelStats.currentCombo
    );
    
    // Check combo achievement
    if (this.levelStats.currentCombo >= 10) {
      await this.unlock('COMBO_MASTER');
    }
  }
  
  /**
   * Called when a boss is defeated
   */
  async onBossDefeated(bossType: string): Promise<void> {
    // Update cumulative stats
    this.cumulativeProgress.totalBossesDefeated++;
    
    if (!this.cumulativeProgress.bossTypesDefeated.includes(bossType)) {
      this.cumulativeProgress.bossTypesDefeated.push(bossType);
    }
    this.saveProgress();
    
    // Boss-specific achievements
    if (bossType === 'BOSS_1') {
      await this.unlock('DEFEAT_BOSS_1');
    } else if (bossType === 'BOSS_2') {
      await this.unlock('DEFEAT_BOSS_2');
    } else if (bossType === 'BOSS_3') {
      await this.unlock('DEFEAT_BOSS_3');
    }
    
    // All bosses achievement
    if (this.cumulativeProgress.bossTypesDefeated.length >= TOTAL_BOSSES) {
      await this.unlock('ALL_BOSSES');
    }
    
    // Boss count achievement
    if (this.cumulativeProgress.totalBossesDefeated >= 30) {
      await this.unlock('BOSS_SMASHER');
    }
  }
  
  /**
   * Called when the bat takes damage
   */
  onBatDamaged(): void {
    this.levelStats.damageTakenThisLevel = true;
    // Reset combo when hit
    this.levelStats.currentCombo = 0;
  }
  
  /**
   * Called when an upgrade is activated
   */
  async onUpgradeActivated(upgradeType: string): Promise<void> {
    if (!this.cumulativeProgress.upgradesActivated.includes(upgradeType)) {
      this.cumulativeProgress.upgradesActivated.push(upgradeType);
      this.saveProgress();
      
      if (this.cumulativeProgress.upgradesActivated.length >= Object.keys(UpgradeType).length) {
        await this.unlock('UPGRADE_MASTER');
      }
    }
  }
  
  /**
   * Get achievements unlocked during the current level run
   */
  getAchievementsThisRun(): string[] {
    return [...this.achievementsThisRun];
  }
  
  /**
   * Clear the achievements unlocked this run (call when starting new level)
   */
  clearThisRun(): void {
    this.achievementsThisRun = [];
  }
  
  /**
   * Get current progress for debugging/testing
   */
  getProgress(): AchievementProgress {
    return { ...this.cumulativeProgress };
  }
  
  /**
   * Reset all progress (for testing)
   */
  resetProgress(): void {
    this.cumulativeProgress = {
      levelsCompleted: [],
      totalBricksDestroyed: 0,
      totalBossesDefeated: 0,
      totalDamageDealt: 0,
      bossTypesDefeated: [],
      upgradesActivated: [],
    };
    this.saveProgress();
    this.achievementsThisRun = [];
    this.levelStats = this.resetLevelStats();
  }
}
