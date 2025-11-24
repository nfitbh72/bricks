/**
 * Level Complete screen with CONTINUE button
 */

import { Screen } from './Screen';
import { Button } from './Button';
import { Leaderboard, LeaderboardEntry } from '../game/systems/Leaderboard';
import { t } from '../i18n/LanguageManager';
import { FONT_TITLE_XLARGE, FONT_TITLE_MEDIUM, FONT_TITLE_NORMAL, FONT_TITLE_XSMALL, FONT_TITLE_SMALL, GLOW_HUGE, GLOW_LARGE, GLOW_NORMAL, GLOW_MEDIUM, COLOR_BLACK, COLOR_GREEN, COLOR_CYAN, COLOR_YELLOW, COLOR_MAGENTA, COLOR_TEXT_GRAY } from '../config/constants';
import { ACHIEVEMENTS } from '../config/achievements';
import { AchievementTracker } from '../game/managers/AchievementTracker';

export class LevelCompleteScreen extends Screen {
  private onContinue: () => void;
  private currentLevel: number = 1;
  private levelTime: number = 0;
  private backgroundImage: HTMLImageElement | null = null;
  private leaderboardEntries: LeaderboardEntry[] = [];
  private isOnLeaderboard: boolean = false;
  private playerName: string = 'AAA';
  private nameEntryIndex: number = 0; // Which character is being entered (0-2)
  private flashTimer: number = 0;
  private showFlash: boolean = true;
  private isDevMode: boolean = false;
  private achievementsThisRun: string[] = [];
  private achievementTracker: AchievementTracker | null = null; // Proper type instead of 'any'
  private achievementsWithProgressChange: string[] = []; // Cumulative achievements that had progress changes

  constructor(canvas: HTMLCanvasElement, onContinue: () => void) {
    super(canvas);
    this.onContinue = onContinue;
    // Don't create buttons yet - wait for setLevel to have achievement data
  }

  /**
   * Render a summary of achievements progressed during this level
   */
  private renderAchievementsSummary(): void {
    if (!this.achievementTracker) return;
    
    const centerX = this.canvas.width / 2;
    const startY = this.canvas.height / 2 - 30; // Move up
    const lineHeight = 25; // Reduce line height

    // Get progress data
    const progress = this.achievementTracker.getProgress();
    const achievementsWithProgress: Array<{achievement: typeof ACHIEVEMENTS[0], progress: number, unlocked: boolean}> = [];

    // Calculate progress for each achievement (same logic as AchievementsScreen)
    for (const achievement of ACHIEVEMENTS) {
      if (achievement.hidden) continue;
      
      let progressPercent = 0;
      let unlocked = false;

      switch (achievement.id) {
        case 'FIRST_LEVEL':
          progressPercent = progress.levelsCompleted.includes(1) ? 100 : 0;
          unlocked = progressPercent === 100;
          break;
        case 'HALFWAY_THERE':
          progressPercent = Math.min(100, (progress.levelsCompleted.length / 5) * 100);
          unlocked = progress.levelsCompleted.length >= 5;
          break;
        case 'LEVEL_MASTER':
          progressPercent = Math.min(100, (progress.levelsCompleted.length / 12) * 100);
          unlocked = progress.levelsCompleted.length >= 12;
          break;
        case 'BRICK_SMASHER':
          progressPercent = Math.min(100, (progress.totalBricksDestroyed / 1000) * 100);
          unlocked = progress.totalBricksDestroyed >= 1000;
          break;
        case 'BOSS_SMASHER':
          progressPercent = Math.min(100, (progress.totalBossesDefeated / 30) * 100);
          unlocked = progress.totalBossesDefeated >= 30;
          break;
        case 'UPGRADE_MASTER':
          progressPercent = Math.min(100, (progress.upgradesActivated.length / 17) * 100);
          unlocked = progress.upgradesActivated.length >= 17;
          break;
        case 'ALL_BOSSES':
          progressPercent = Math.min(100, (progress.bossTypesDefeated.length / 3) * 100);
          unlocked = progress.bossTypesDefeated.length >= 3;
          break;
        case 'DAMAGE_DEALER':
          progressPercent = Math.min(100, (progress.totalDamageDealt / 10000) * 100);
          unlocked = progress.totalDamageDealt >= 10000;
          break;
        case 'PERFECT_LEVEL':
        case 'SPEED_RUN':
        case 'NO_DAMAGE':
        case 'SECRET_LEVEL':
          if (this.achievementsThisRun.includes(achievement.id)) {
            progressPercent = 100;
            unlocked = true;
          }
          break;
        default:
          if (this.achievementsThisRun.includes(achievement.id)) {
            progressPercent = 100;
            unlocked = true;
          }
      }

      // Show cumulative achievements only if: progress > 0 AND progress changed this level
      // OR if unlocked this run (instant achievements)
      const isCumulativeAchievement = ['FIRST_LEVEL', 'HALFWAY_THERE', 'LEVEL_MASTER', 'BRICK_SMASHER', 'BOSS_SMASHER', 'UPGRADE_MASTER', 'ALL_BOSSES', 'DAMAGE_DEALER'].includes(achievement.id);
      const hadProgressChange = this.achievementsWithProgressChange.includes(achievement.id);
      
      if (isCumulativeAchievement) {
        // Only show if progress > 0 AND had progress change during this level
        if (progressPercent > 0 && hadProgressChange) {
          achievementsWithProgress.push({ achievement, progress: progressPercent, unlocked });
        }
      } else {
        // Show instant achievements if unlocked this run
        if (unlocked || this.achievementsThisRun.includes(achievement.id)) {
          achievementsWithProgress.push({ achievement, progress: progressPercent, unlocked });
        }
      }
    }

    if (achievementsWithProgress.length === 0) return;

    // Sort: unlocked first, then by progress descending
    achievementsWithProgress.sort((a, b) => {
      if (a.unlocked !== b.unlocked) return b.unlocked ? 1 : -1;
      return b.progress - a.progress;
    });

    // Heading
    this.ctx.font = FONT_TITLE_SMALL;
    this.ctx.fillStyle = COLOR_CYAN;
    this.ctx.shadowColor = COLOR_CYAN;
    this.ctx.shadowBlur = GLOW_MEDIUM;
    this.ctx.textAlign = 'center';
    this.ctx.fillText('Achievements Progress', centerX, startY);

    // Entries
    this.ctx.font = FONT_TITLE_XSMALL;
    this.ctx.textAlign = 'left';

    achievementsWithProgress.forEach((item, index) => {
      const { achievement, progress, unlocked } = item;
      const y = startY + (index + 1) * lineHeight;

      // Status icon
      const icon = unlocked ? '✓' : progress > 0 ? '⏳' : '○';
      const iconColor = unlocked ? COLOR_GREEN : progress > 0 ? COLOR_YELLOW : COLOR_TEXT_GRAY;
      
      this.ctx.fillStyle = iconColor;
      this.ctx.shadowColor = iconColor;
      this.ctx.shadowBlur = unlocked ? GLOW_NORMAL : GLOW_NORMAL;
      this.ctx.fillText(icon, centerX - 140, y);

      // Achievement name
      this.ctx.fillStyle = unlocked ? COLOR_GREEN : COLOR_TEXT_GRAY;
      this.ctx.shadowColor = unlocked ? COLOR_GREEN : 'transparent';
      this.ctx.fillText(achievement.name, centerX - 120, y);

      // Progress bar for cumulative achievements
      if (progress > 0 && !unlocked) {
        const barWidth = 100;
        const barHeight = 8;
        const barX = centerX + 20;
        const barY = y - 6;

        // Bar background
        this.ctx.fillStyle = 'rgba(255, 255, 255, 0.1)';
        this.ctx.shadowBlur = 0;
        this.ctx.fillRect(barX, barY, barWidth, barHeight);

        // Bar fill
        const fillColor = progress >= 67 ? '#00ff66' : progress >= 34 ? '#ffaa00' : '#ff3333';
        this.ctx.fillStyle = fillColor;
        this.ctx.shadowBlur = 5;
        this.ctx.shadowColor = fillColor;
        this.ctx.fillRect(barX, barY, barWidth * progress / 100, barHeight);

        // Progress text
        this.ctx.shadowBlur = 0;
        this.ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
        this.ctx.font = '9px monospace';
        this.ctx.textAlign = 'center';
        this.ctx.fillText(`${Math.round(progress)}%`, barX + barWidth / 2, barY + barHeight / 2 + 3);
        
        // Reset font for next iteration
        this.ctx.font = FONT_TITLE_XSMALL;
        this.ctx.textAlign = 'left';
      } else if (unlocked) {
        // Completed text
        this.ctx.fillStyle = COLOR_GREEN;
        this.ctx.shadowColor = COLOR_GREEN;
        this.ctx.shadowBlur = GLOW_NORMAL;
        this.ctx.fillText('COMPLETED', centerX + 20, y);
      }
    });
  }

  /**
   * Set current level, time, and load its background image
   */
  async setLevel(
    level: number, 
    time: number = 0, 
    isDevMode: boolean = false, 
    achievementsThisRun: string[] = [], 
    achievementTracker: AchievementTracker | null = null,
    achievementsWithProgressChange: string[] = []
  ): Promise<void> {
    console.log(`[LevelCompleteScreen] setLevel called: level=${level}, time=${time}, isDevMode=${isDevMode}, achievements=${achievementsThisRun.join(',')}`);
    
    this.currentLevel = level;
    this.levelTime = time;
    this.isDevMode = isDevMode;
    this.achievementsThisRun = achievementsThisRun;
    this.achievementTracker = achievementTracker; // Store the tracker
    this.achievementsWithProgressChange = achievementsWithProgressChange; // Store progress changes
    this.loadBackgroundImage(level);
    
    // Load leaderboard from persistent storage
    this.leaderboardEntries = await Leaderboard.getLeaderboard(level);
    console.log(`[LevelCompleteScreen] Loaded ${this.leaderboardEntries.length} leaderboard entries:`, this.leaderboardEntries);
    
    // Don't add player to leaderboard if in dev mode
    this.isOnLeaderboard = !isDevMode && Leaderboard.isPlayerOnLeaderboard(time, this.leaderboardEntries);
    console.log(`[LevelCompleteScreen] isOnLeaderboard=${this.isOnLeaderboard}`);
    
    // Reset name entry
    this.playerName = 'AAA';
    this.nameEntryIndex = 0;
    this.flashTimer = 0;
    this.showFlash = true;
    
    // If player is on leaderboard, insert them
    if (this.isOnLeaderboard) {
      this.leaderboardEntries = Leaderboard.insertPlayer(time, this.playerName, this.leaderboardEntries);
      console.log(`[LevelCompleteScreen] Player inserted into leaderboard:`, this.leaderboardEntries);
    }

    // Clear existing buttons and recreate with dynamic positioning
    this.buttons = [];
    this.createButtons();
  }

  /**
   * Format time as MM:SS
   */
  private formatTime(seconds: number): string {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  }

  /**
   * Load the background image for the level
   */
  private loadBackgroundImage(levelId: number): void {
    const img = new Image();
    img.src = `./assets/images/level${levelId}.jpg`;
    img.onload = () => {
      this.backgroundImage = img;
    };
    img.onerror = () => {
      console.warn(`Failed to load background image for level ${levelId}`);
      this.backgroundImage = null;
    };
  }

  /**
   * Create buttons
   */
  private createButtons(): void {
    const centerX = this.canvas.width / 2;
    const buttonWidth = 200;
    const buttonHeight = 60;

    // Calculate dynamic button position
    let achievementsHeight = 0;
    if (this.achievementTracker) {
      // Calculate how many achievements will be shown
      const progress = this.achievementTracker.getProgress();
      let achievementsToShow = 0;
      
      for (const achievement of ACHIEVEMENTS) {
        if (achievement.hidden) continue;
        
        let progressPercent = 0;
        switch (achievement.id) {
          case 'FIRST_LEVEL':
            progressPercent = progress.levelsCompleted.includes(1) ? 100 : 0;
            break;
          case 'HALFWAY_THERE':
            progressPercent = Math.min(100, (progress.levelsCompleted.length / 5) * 100);
            break;
          case 'LEVEL_MASTER':
            progressPercent = Math.min(100, (progress.levelsCompleted.length / 12) * 100);
            break;
          case 'BRICK_SMASHER':
            progressPercent = Math.min(100, (progress.totalBricksDestroyed / 1000) * 100);
            break;
          case 'BOSS_SMASHER':
            progressPercent = Math.min(100, (progress.totalBossesDefeated / 30) * 100);
            break;
          case 'UPGRADE_MASTER':
            progressPercent = Math.min(100, (progress.upgradesActivated.length / 17) * 100);
            break;
          case 'ALL_BOSSES':
            progressPercent = Math.min(100, (progress.bossTypesDefeated.length / 3) * 100);
            break;
          default:
            if (this.achievementsThisRun.includes(achievement.id)) {
              progressPercent = 100;
            }
        }
        
        if (progressPercent > 0) achievementsToShow++;
      }
      
      achievementsHeight = 25 + (achievementsToShow * 25); // Heading + each achievement (reduced)
    }
    const leaderboardHeight = 35 + (5 * 35); // Header + 5 entries (reduced)
    const buttonY = this.canvas.height / 2 - 10 + achievementsHeight + leaderboardHeight + 10; // Move up

    // CONTINUE button - positioned dynamically below content
    this.buttons.push(
      new Button({
        x: centerX - buttonWidth / 2,
        y: buttonY,
        width: buttonWidth,
        height: buttonHeight,
        text: t('ui.buttons.continue'),
        onClick: () => this.onContinue(),
      })
    );
  }

  /**
   * Handle key press (Space/Enter triggers CONTINUE, letters for name entry)
   */
  handleKeyPress(key: string): void {
    // If on leaderboard and entering name
    if (this.isOnLeaderboard && this.nameEntryIndex < 3) {
      // Check if it's a letter
      if (key.length === 1 && /[A-Z]/i.test(key)) {
        const upperKey = key.toUpperCase();
        const nameArray = this.playerName.split('');
        nameArray[this.nameEntryIndex] = upperKey;
        this.playerName = nameArray.join('');
        
        // Move to next character
        this.nameEntryIndex++;
        this.flashTimer = 0;
        this.showFlash = true;
        
        // Update leaderboard with new name
        this.leaderboardEntries = Leaderboard.insertPlayer(
          this.levelTime,
          this.playerName,
          this.leaderboardEntries
        );
        
        // If name entry is complete, save to persistent storage (but not in dev mode)
        if (this.nameEntryIndex >= 3 && !this.isDevMode) {
          Leaderboard.updateLeaderboard(this.currentLevel, this.leaderboardEntries);
        }
      }
    }
    
    // Continue on space or enter (only if not entering name)
    if (key === ' ' || key === 'Enter') {
      if (!this.isOnLeaderboard || this.nameEntryIndex >= 3) {
        this.onContinue();
      }
    }
  }

  /**
   * Refresh translations when language changes
   */
  refreshTranslations(): void {
    // Update button text
    if (this.buttons.length >= 1) {
      this.buttons[0].setText(t('ui.buttons.continue'));
    }
  }

  /**
   * Update animations
   */
  update(deltaTime: number): void {
    if (this.isOnLeaderboard && this.nameEntryIndex < 3) {
      this.flashTimer += deltaTime;
      if (this.flashTimer >= 0.5) {
        this.showFlash = !this.showFlash;
        this.flashTimer = 0;
      }
    }
  }

  /**
   * Render the level complete screen
   */
  render(): void {
    // Draw background image if available
    if (this.backgroundImage) {
      this.ctx.drawImage(this.backgroundImage, 0, 0, this.canvas.width, this.canvas.height);
      
      // Add dark overlay for text readability
      this.ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
      this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    } else {
      // Fallback: solid dark background
      this.ctx.fillStyle = COLOR_BLACK;
      this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    }

    this.ctx.save();

    // Draw title
    this.ctx.shadowBlur = GLOW_HUGE;
    this.ctx.shadowColor = COLOR_GREEN;
    this.ctx.fillStyle = COLOR_GREEN;
    this.ctx.font = FONT_TITLE_XLARGE;
    this.ctx.textAlign = 'center';
    this.ctx.textBaseline = 'middle';
    this.ctx.fillText(t('ui.screens.levelComplete'), this.canvas.width / 2, this.canvas.height / 2 - 180);

    // Draw level number
    this.ctx.font = FONT_TITLE_MEDIUM;
    this.ctx.fillStyle = COLOR_CYAN;
    this.ctx.shadowColor = COLOR_CYAN;
    this.ctx.shadowBlur = GLOW_LARGE;
    this.ctx.fillText(
      `${t('game.status.level')} ${this.currentLevel}`,
      this.canvas.width / 2,
      this.canvas.height / 2 - 120
    );

    // Draw completion time
    this.ctx.font = FONT_TITLE_NORMAL;
    this.ctx.fillStyle = COLOR_YELLOW;
    this.ctx.shadowColor = COLOR_YELLOW;
    this.ctx.shadowBlur = GLOW_LARGE;
    this.ctx.fillText(
      `${t('game.status.time')}: ${this.formatTime(this.levelTime)}`,
      this.canvas.width / 2,
      this.canvas.height / 2 - 70
    );

    // Draw achievements progress (if tracker is available)
    if (this.achievementTracker) {
      this.renderAchievementsSummary();
    }

    // Draw leaderboard
    this.renderLeaderboard();

    this.ctx.restore();

    // Render buttons (only if name entry is complete or not on leaderboard)
    if (!this.isOnLeaderboard || this.nameEntryIndex >= 3) {
      for (const button of this.buttons) {
        button.render(this.ctx);
      }
    } else {
      // Calculate dynamic name entry position
      let achievementsHeight = 0;
      if (this.achievementTracker) {
        // Calculate how many achievements will be shown (same logic as above)
        const progress = this.achievementTracker.getProgress();
        let achievementsToShow = 0;
        
        for (const achievement of ACHIEVEMENTS) {
          if (achievement.hidden) continue;
          
          let progressPercent = 0;
          switch (achievement.id) {
            case 'FIRST_LEVEL':
              progressPercent = progress.levelsCompleted.includes(1) ? 100 : 0;
              break;
            case 'HALFWAY_THERE':
              progressPercent = Math.min(100, (progress.levelsCompleted.length / 5) * 100);
              break;
            case 'LEVEL_MASTER':
              progressPercent = Math.min(100, (progress.levelsCompleted.length / 12) * 100);
              break;
            case 'BRICK_SMASHER':
              progressPercent = Math.min(100, (progress.totalBricksDestroyed / 1000) * 100);
              break;
            case 'BOSS_SMASHER':
              progressPercent = Math.min(100, (progress.totalBossesDefeated / 30) * 100);
              break;
            case 'UPGRADE_MASTER':
              progressPercent = Math.min(100, (progress.upgradesActivated.length / 17) * 100);
              break;
            case 'ALL_BOSSES':
              progressPercent = Math.min(100, (progress.bossTypesDefeated.length / 3) * 100);
              break;
            case 'DAMAGE_DEALER':
              progressPercent = Math.min(100, (progress.totalDamageDealt / 10000) * 100);
              break;
            default:
              if (this.achievementsThisRun.includes(achievement.id)) {
                progressPercent = 100;
              }
          }
          
          // Count cumulative achievements only if: progress > 0 AND had progress change
          // OR instant achievements if unlocked this run
          const isCumulativeAchievement = ['FIRST_LEVEL', 'HALFWAY_THERE', 'LEVEL_MASTER', 'BRICK_SMASHER', 'BOSS_SMASHER', 'UPGRADE_MASTER', 'ALL_BOSSES', 'DAMAGE_DEALER'].includes(achievement.id);
          const hadProgressChange = this.achievementsWithProgressChange.includes(achievement.id);
          
          if (isCumulativeAchievement) {
            if (progressPercent > 0 && hadProgressChange) {
              achievementsToShow++;
            }
          } else {
            if (progressPercent > 0 || this.achievementsThisRun.includes(achievement.id)) {
              achievementsToShow++;
            }
          }
        }
        
        achievementsHeight = 25 + (achievementsToShow * 25); // Use reduced spacing
      }
      const leaderboardHeight = 35 + (5 * 35); // Use reduced spacing
      const promptY = this.canvas.height / 2 - 20 + achievementsHeight + leaderboardHeight + 10; // Move up
      
      // Show prompt for name entry
      this.ctx.font = FONT_TITLE_XSMALL;
      this.ctx.fillStyle = COLOR_MAGENTA;
      this.ctx.shadowColor = COLOR_MAGENTA;
      this.ctx.shadowBlur = GLOW_NORMAL;
      this.ctx.textAlign = 'center';
      this.ctx.fillText(
        t('ui.screens.enterYourName'),
        this.canvas.width / 2,
        promptY
      );
    }
  }

  /**
   * Render the leaderboard
   */
  private renderLeaderboard(): void {
    // Calculate start position based on achievements display
    let achievementsHeight = 0;
    if (this.achievementTracker) {
      // Calculate how many achievements will be shown (same logic as createButtons)
      const progress = this.achievementTracker.getProgress();
      let achievementsToShow = 0;
      
      for (const achievement of ACHIEVEMENTS) {
        if (achievement.hidden) continue;
        
        let progressPercent = 0;
        switch (achievement.id) {
          case 'FIRST_LEVEL':
            progressPercent = progress.levelsCompleted.includes(1) ? 100 : 0;
            break;
          case 'HALFWAY_THERE':
            progressPercent = Math.min(100, (progress.levelsCompleted.length / 5) * 100);
            break;
          case 'LEVEL_MASTER':
            progressPercent = Math.min(100, (progress.levelsCompleted.length / 12) * 100);
            break;
          case 'BRICK_SMASHER':
            progressPercent = Math.min(100, (progress.totalBricksDestroyed / 1000) * 100);
            break;
          case 'BOSS_SMASHER':
            progressPercent = Math.min(100, (progress.totalBossesDefeated / 30) * 100);
            break;
          case 'UPGRADE_MASTER':
            progressPercent = Math.min(100, (progress.upgradesActivated.length / 17) * 100);
            break;
          case 'ALL_BOSSES':
            progressPercent = Math.min(100, (progress.bossTypesDefeated.length / 3) * 100);
            break;
          default:
            if (this.achievementsThisRun.includes(achievement.id)) {
              progressPercent = 100;
            }
        }
        
        if (progressPercent > 0) achievementsToShow++;
      }
      
      achievementsHeight = 30 + (achievementsToShow * 30);
    }
    
    const startY = this.canvas.height / 2 + 20 + achievementsHeight;
    const lineHeight = 40;
    
    this.ctx.font = FONT_TITLE_SMALL;
    this.ctx.textAlign = 'left';
    this.ctx.shadowBlur = GLOW_MEDIUM;
    
    // Draw header
    this.ctx.fillStyle = COLOR_GREEN;
    this.ctx.shadowColor = COLOR_GREEN;
    this.ctx.fillText(t('ui.leaderboard.rank'), this.canvas.width / 2 - 200, startY - 40);
    this.ctx.fillText(t('ui.leaderboard.name'), this.canvas.width / 2 - 80, startY - 40);
    this.ctx.fillText(t('ui.leaderboard.time'), this.canvas.width / 2 + 80, startY - 40);
    
    // Draw entries
    this.leaderboardEntries.forEach((entry, index) => {
      const y = startY + index * lineHeight;
      const rank = index + 1;
      
      // Rank
      this.ctx.fillStyle = COLOR_CYAN;
      this.ctx.shadowColor = COLOR_CYAN;
      this.ctx.fillText(`${rank}.`, this.canvas.width / 2 - 200, y);
      
      // Name (with flashing character for player entry)
      if (entry.isPlayer) {
        this.ctx.fillStyle = COLOR_MAGENTA;
        this.ctx.shadowColor = COLOR_MAGENTA;
        
        // Draw each character separately to handle flashing
        const nameChars = this.playerName.split('');
        for (let i = 0; i < nameChars.length; i++) {
          const charX = this.canvas.width / 2 - 80 + i * 20;
          
          // Flash the current character being entered
          if (i === this.nameEntryIndex && !this.showFlash) {
            // Don't draw (creates flash effect)
          } else {
            this.ctx.fillText(nameChars[i], charX, y);
          }
        }
      } else {
        this.ctx.fillStyle = COLOR_TEXT_GRAY;
        this.ctx.shadowColor = COLOR_TEXT_GRAY;
        this.ctx.fillText(entry.name, this.canvas.width / 2 - 80, y);
      }
      
      // Time
      this.ctx.fillStyle = entry.isPlayer ? COLOR_YELLOW : COLOR_TEXT_GRAY;
      this.ctx.shadowColor = entry.isPlayer ? COLOR_YELLOW : COLOR_TEXT_GRAY;
      this.ctx.fillText(Leaderboard.formatTime(entry.time), this.canvas.width / 2 + 80, y);
    });
  }
}
