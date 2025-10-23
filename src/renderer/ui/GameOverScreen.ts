/**
 * Game Over screen with stats and RESTART/QUIT buttons
 */

import { Screen } from './Screen';
import { Button } from './Button';
import { t } from '../i18n/LanguageManager';
import { FONT_TITLE_XLARGE, FONT_TITLE_SMALL, GLOW_HUGE, GLOW_LARGE, COLOR_BLACK, COLOR_GREEN, COLOR_RED, COLOR_MAGENTA, COLOR_CYAN } from '../config/constants';

export class GameOverScreen extends Screen {
  private onRestart: () => void;
  private onQuit: () => void;
  private levelReached: number = 1;
  private bricksDestroyed: number = 0;
  private isComplete: boolean = false;

  constructor(canvas: HTMLCanvasElement, onRestart: () => void, onQuit: () => void) {
    super(canvas);
    this.onRestart = onRestart;
    this.onQuit = onQuit;
    this.createButtons();
  }

  /**
   * Set game stats
   */
  setStats(levelReached: number, bricksDestroyed: number, isComplete: boolean = false): void {
    this.levelReached = levelReached;
    this.bricksDestroyed = bricksDestroyed;
    this.isComplete = isComplete;
  }

  /**
   * Create buttons
   */
  private createButtons(): void {
    const centerX = this.canvas.width / 2;
    const buttonWidth = 200;
    const buttonHeight = 60;

    // RESTART button
    this.buttons.push(
      new Button({
        x: centerX - buttonWidth / 2,
        y: this.canvas.height / 2 + 100,
        width: buttonWidth,
        height: buttonHeight,
        text: t('ui.buttons.restart'),
        onClick: () => this.onRestart(),
      })
    );

    // QUIT button
    this.buttons.push(
      new Button({
        x: centerX - buttonWidth / 2,
        y: this.canvas.height / 2 + 180,
        width: buttonWidth,
        height: buttonHeight,
        text: t('ui.buttons.quit'),
        onClick: () => this.onQuit(),
      })
    );
  }

  /**
   * Handle key press (Enter triggers RESTART)
   */
  handleKeyPress(key: string): void {
    if (key === 'Enter') {
      this.onRestart();
    }
  }

  /**
   * Refresh translations when language changes
   */
  refreshTranslations(): void {
    // Update button texts
    if (this.buttons.length >= 2) {
      this.buttons[0].setText(t('ui.buttons.restart'));
      this.buttons[1].setText(t('ui.buttons.quit'));
    }
  }

  /**
   * Render the game over screen
   */
  render(): void {
    // Clear screen
    this.ctx.fillStyle = COLOR_BLACK;
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

    this.ctx.save();

    // Draw title (always GAME OVER, but green if complete)
    const title = t('ui.screens.gameOver');
    const titleColor = this.isComplete ? COLOR_GREEN : COLOR_RED;
    
    this.ctx.shadowBlur = GLOW_HUGE;
    this.ctx.shadowColor = titleColor;
    this.ctx.fillStyle = titleColor;
    this.ctx.font = FONT_TITLE_XLARGE;
    this.ctx.textAlign = 'center';
    this.ctx.textBaseline = 'middle';
    this.ctx.fillText(title, this.canvas.width / 2, this.canvas.height / 2 - 120);

    // Draw stats
    this.ctx.font = FONT_TITLE_SMALL;
    this.ctx.fillStyle = COLOR_MAGENTA;
    this.ctx.shadowColor = COLOR_MAGENTA;
    this.ctx.shadowBlur = GLOW_LARGE;
    
    this.ctx.fillText(
      `Level Reached: ${this.levelReached}`,
      this.canvas.width / 2,
      this.canvas.height / 2 - 40
    );
    
    this.ctx.fillStyle = COLOR_CYAN;
    this.ctx.shadowColor = COLOR_CYAN;
    this.ctx.fillText(
      `Bricks Destroyed: ${this.bricksDestroyed}`,
      this.canvas.width / 2,
      this.canvas.height / 2 + 10
    );

    this.ctx.restore();

    // Render buttons
    for (const button of this.buttons) {
      button.render(this.ctx);
    }
  }
}
