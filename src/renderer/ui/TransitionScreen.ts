/**
 * Transition screen with spinning brick and fade effect
 */

import { COLOR_BLACK, COLOR_MAGENTA, COLOR_CYAN, COLOR_GREEN, COLOR_TEXT_GRAY, FONT_TITLE_LARGE, FONT_TITLE_SMALL, FONT_TITLE_XSMALL, GLOW_LARGE, GLOW_MEDIUM } from '../config/constants';
import { Leaderboard, LeaderboardEntry } from '../game/systems/Leaderboard';
import { t } from '../i18n/LanguageManager';

export class TransitionScreen {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private rotation: number = 0;
  private opacity: number = 0;
  private fadeIn: boolean = true;
  private startTime: number = 0;
  private duration: number = 2000; // 2 seconds
  private onComplete: (() => void) | null = null;
  private nextLevel: number | null = null;
  private leaderboardEntries: LeaderboardEntry[] = [];

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    const context = canvas.getContext('2d');
    if (!context) {
      throw new Error('Could not get 2D context from canvas');
    }
    this.ctx = context;
  }

  /**
   * Start transition
   */
  start(onComplete: () => void, nextLevel?: number): void {
    this.startTime = performance.now();
    this.rotation = 0;
    this.opacity = 0;
    this.fadeIn = true;
    this.onComplete = onComplete;
    this.nextLevel = nextLevel ?? null;
    this.leaderboardEntries = [];
    
    // Load leaderboard for next level if provided
    if (this.nextLevel) {
      this.loadLeaderboard(this.nextLevel);
    }
  }

  /**
   * Load leaderboard for the next level
   */
  private async loadLeaderboard(levelId: number): Promise<void> {
    try {
      this.leaderboardEntries = await Leaderboard.getLeaderboard(levelId);
    } catch (error) {
      console.error('Failed to load leaderboard for transition:', error);
      this.leaderboardEntries = [];
    }
  }

  /**
   * Update transition state
   */
  update(currentTime: number): boolean {
    const elapsed = currentTime - this.startTime;
    const progress = Math.min(elapsed / this.duration, 1);

    // Update rotation (full rotation over 2 seconds)
    this.rotation = progress * Math.PI * 4; // 2 full rotations

    // Update opacity (fade in first half, fade out second half)
    if (progress < 0.5) {
      this.opacity = progress * 2; // Fade in
    } else {
      this.opacity = 2 - (progress * 2); // Fade out
    }

    // Check if complete
    if (progress >= 1) {
      if (this.onComplete) {
        this.onComplete();
      }
      return true; // Transition complete
    }

    return false; // Still transitioning
  }

  /**
   * Render the transition
   */
  render(): void {
    // Clear screen
    this.ctx.fillStyle = COLOR_BLACK;
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

    this.ctx.save();

    // Set opacity
    this.ctx.globalAlpha = this.opacity;

    // Move to center
    const centerX = this.canvas.width / 2;
    const centerY = this.canvas.height / 2;
    this.ctx.translate(centerX, centerY);

    // Rotate
    this.ctx.rotate(this.rotation);

    // Draw spinning brick (50x20 rectangle)
    const brickWidth = 50;
    const brickHeight = 20;

    // Neon glow effect
    this.ctx.shadowBlur = 20;
    this.ctx.shadowColor = COLOR_MAGENTA;

    // Draw brick
    this.ctx.fillStyle = COLOR_MAGENTA;
    this.ctx.fillRect(-brickWidth / 2, -brickHeight / 2, brickWidth, brickHeight);

    // Draw border
    this.ctx.strokeStyle = COLOR_MAGENTA;
    this.ctx.lineWidth = 2;
    this.ctx.strokeRect(-brickWidth / 2, -brickHeight / 2, brickWidth, brickHeight);

    this.ctx.restore();

    // Render leaderboard if next level is set
    if (this.nextLevel !== null) {
      this.renderLeaderboard();
    }
  }

  /**
   * Render the leaderboard for the next level
   */
  private renderLeaderboard(): void {
    this.ctx.save();
    this.ctx.globalAlpha = this.opacity;

    const centerX = this.canvas.width / 2;
    const startY = this.canvas.height / 2 + 80;
    const lineHeight = 35;

    // Draw "Next Level" title
    this.ctx.font = FONT_TITLE_LARGE;
    this.ctx.fillStyle = COLOR_CYAN;
    this.ctx.shadowBlur = GLOW_LARGE;
    this.ctx.shadowColor = COLOR_CYAN;
    this.ctx.textAlign = 'center';
    this.ctx.fillText(`${t('game.status.level')} ${this.nextLevel}`, centerX, startY - 40);

    // Draw leaderboard header
    this.ctx.font = FONT_TITLE_XSMALL;
    this.ctx.fillStyle = COLOR_GREEN;
    this.ctx.shadowBlur = GLOW_MEDIUM;
    this.ctx.shadowColor = COLOR_GREEN;
    this.ctx.textAlign = 'left';
    this.ctx.fillText(t('ui.leaderboard.rank'), centerX - 200, startY + 20);
    this.ctx.fillText(t('ui.leaderboard.name'), centerX - 80, startY + 20);
    this.ctx.fillText(t('ui.leaderboard.time'), centerX + 80, startY + 20);

    // Draw leaderboard entries
    this.ctx.font = FONT_TITLE_SMALL;
    this.leaderboardEntries.forEach((entry, index) => {
      const y = startY + 60 + index * lineHeight;
      const rank = index + 1;

      // Rank
      this.ctx.fillStyle = COLOR_CYAN;
      this.ctx.shadowColor = COLOR_CYAN;
      this.ctx.fillText(`${rank}.`, centerX - 200, y);

      // Name
      this.ctx.fillStyle = COLOR_TEXT_GRAY;
      this.ctx.shadowColor = COLOR_TEXT_GRAY;
      this.ctx.fillText(entry.name, centerX - 80, y);

      // Time
      this.ctx.fillText(Leaderboard.formatTime(entry.time), centerX + 80, y);
    });

    this.ctx.restore();
  }

  /**
   * Check if transition is active
   */
  isActive(): boolean {
    return this.onComplete !== null;
  }

  /**
   * Reset transition
   */
  reset(): void {
    this.onComplete = null;
    this.opacity = 0;
  }
}
