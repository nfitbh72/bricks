/**
 * Level Complete screen with CONTINUE button
 */

import { Screen } from './Screen';
import { Button } from './Button';
import { Leaderboard, LeaderboardEntry } from '../game/systems/Leaderboard';
import { t } from '../i18n/LanguageManager';
import { FONT_TITLE_XLARGE, FONT_TITLE_MEDIUM, FONT_TITLE_NORMAL, FONT_TITLE_XSMALL, FONT_TITLE_SMALL, GLOW_HUGE, GLOW_LARGE, GLOW_NORMAL, GLOW_MEDIUM, COLOR_BLACK, COLOR_GREEN, COLOR_CYAN, COLOR_YELLOW, COLOR_MAGENTA, COLOR_TEXT_GRAY } from '../config/constants';

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

  constructor(canvas: HTMLCanvasElement, onContinue: () => void) {
    super(canvas);
    this.onContinue = onContinue;
    this.createButtons();
  }

  /**
   * Set current level, time, and load its background image
   */
  async setLevel(level: number, time: number = 0, isDevMode: boolean = false): Promise<void> {
    console.log(`[LevelCompleteScreen] setLevel called: level=${level}, time=${time}, isDevMode=${isDevMode}`);
    
    this.currentLevel = level;
    this.levelTime = time;
    this.isDevMode = isDevMode;
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

    // CONTINUE button - positioned below leaderboard
    this.buttons.push(
      new Button({
        x: centerX - buttonWidth / 2,
        y: this.canvas.height / 2 + 180, // Moved down to clear leaderboard
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

    // Draw leaderboard
    this.renderLeaderboard();

    this.ctx.restore();

    // Render buttons (only if name entry is complete or not on leaderboard)
    if (!this.isOnLeaderboard || this.nameEntryIndex >= 3) {
      for (const button of this.buttons) {
        button.render(this.ctx);
      }
    } else {
      // Show prompt for name entry
      this.ctx.font = FONT_TITLE_XSMALL;
      this.ctx.fillStyle = COLOR_MAGENTA;
      this.ctx.shadowColor = COLOR_MAGENTA;
      this.ctx.shadowBlur = GLOW_NORMAL;
      this.ctx.textAlign = 'center';
      this.ctx.fillText(
        t('ui.screens.enterYourName'),
        this.canvas.width / 2,
        this.canvas.height / 2 + 180
      );
    }
  }

  /**
   * Render the leaderboard
   */
  private renderLeaderboard(): void {
    const startY = this.canvas.height / 2 + 20; // Increased gap from time
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
