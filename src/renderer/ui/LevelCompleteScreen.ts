/**
 * Level Complete screen with CONTINUE button
 */

import { Screen } from './Screen';
import { Button } from './Button';
import { Leaderboard, LeaderboardEntry } from '../game/Leaderboard';
import { t } from '../i18n/LanguageManager';

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

  constructor(canvas: HTMLCanvasElement, onContinue: () => void) {
    super(canvas);
    this.onContinue = onContinue;
    this.createButtons();
  }

  /**
   * Set current level, time, and load its background image
   */
  setLevel(level: number, time: number = 0): void {
    this.currentLevel = level;
    this.levelTime = time;
    this.loadBackgroundImage(level);
    
    // Generate leaderboard
    this.leaderboardEntries = Leaderboard.generateFakeLeaderboard(level);
    this.isOnLeaderboard = Leaderboard.isPlayerOnLeaderboard(time, this.leaderboardEntries);
    
    // Reset name entry
    this.playerName = 'AAA';
    this.nameEntryIndex = 0;
    this.flashTimer = 0;
    this.showFlash = true;
    
    // If player is on leaderboard, insert them
    if (this.isOnLeaderboard) {
      this.leaderboardEntries = Leaderboard.insertPlayer(time, this.playerName, this.leaderboardEntries);
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
          Leaderboard.generateFakeLeaderboard(this.currentLevel)
        );
        
        return;
      }
    }
    
    // Continue on space/enter (only if name entry is complete or not on leaderboard)
    if (key === ' ' || key === 'Enter') {
      if (!this.isOnLeaderboard || this.nameEntryIndex >= 3) {
        this.onContinue();
      }
    }
  }
  
  /**
   * Update flash animation
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
      this.ctx.fillStyle = '#0a0a0a';
      this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    }

    this.ctx.save();

    // Draw title
    this.ctx.shadowBlur = 40;
    this.ctx.shadowColor = '#00ff00';
    this.ctx.fillStyle = '#00ff00';
    this.ctx.font = '64px "D Day Stencil", Arial';
    this.ctx.textAlign = 'center';
    this.ctx.textBaseline = 'middle';
    this.ctx.fillText(t('ui.screens.levelComplete'), this.canvas.width / 2, this.canvas.height / 2 - 180);

    // Draw level number
    this.ctx.font = '36px "D Day Stencil", Arial';
    this.ctx.fillStyle = '#00ffff';
    this.ctx.shadowColor = '#00ffff';
    this.ctx.shadowBlur = 20;
    this.ctx.fillText(
      `${t('game.status.level')} ${this.currentLevel}`,
      this.canvas.width / 2,
      this.canvas.height / 2 - 120
    );

    // Draw completion time
    this.ctx.font = '32px "D Day Stencil", Arial';
    this.ctx.fillStyle = '#ffff00';
    this.ctx.shadowColor = '#ffff00';
    this.ctx.shadowBlur = 20;
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
      this.ctx.font = '24px "D Day Stencil", Arial';
      this.ctx.fillStyle = '#ff00ff';
      this.ctx.shadowColor = '#ff00ff';
      this.ctx.shadowBlur = 15;
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
    
    this.ctx.font = '28px "D Day Stencil", Arial';
    this.ctx.textAlign = 'left';
    this.ctx.shadowBlur = 10;
    
    // Draw header
    this.ctx.fillStyle = '#00ff00';
    this.ctx.shadowColor = '#00ff00';
    this.ctx.fillText(t('ui.leaderboard.rank'), this.canvas.width / 2 - 200, startY - 40);
    this.ctx.fillText(t('ui.leaderboard.name'), this.canvas.width / 2 - 80, startY - 40);
    this.ctx.fillText(t('ui.leaderboard.time'), this.canvas.width / 2 + 80, startY - 40);
    
    // Draw entries
    this.leaderboardEntries.forEach((entry, index) => {
      const y = startY + index * lineHeight;
      const rank = index + 1;
      
      // Rank
      this.ctx.fillStyle = '#00ffff';
      this.ctx.shadowColor = '#00ffff';
      this.ctx.fillText(`${rank}.`, this.canvas.width / 2 - 200, y);
      
      // Name (with flashing character for player entry)
      if (entry.isPlayer) {
        this.ctx.fillStyle = '#ff00ff';
        this.ctx.shadowColor = '#ff00ff';
        
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
        this.ctx.fillStyle = '#666666';
        this.ctx.shadowColor = '#666666';
        this.ctx.fillText(entry.name, this.canvas.width / 2 - 80, y);
      }
      
      // Time
      this.ctx.fillStyle = entry.isPlayer ? '#ffff00' : '#666666';
      this.ctx.shadowColor = entry.isPlayer ? '#ffff00' : '#666666';
      this.ctx.fillText(Leaderboard.formatTime(entry.time), this.canvas.width / 2 + 80, y);
    });
  }
}
