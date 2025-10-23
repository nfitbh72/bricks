/**
 * Pause screen with RESUME and QUIT buttons
 */

import { Screen } from './Screen';
import { Button } from './Button';
import { t } from '../i18n/LanguageManager';
import { FONT_TITLE_HUGE, GLOW_HUGE, COLOR_MAGENTA } from '../config/constants';

export class PauseScreen extends Screen {
  private onResume: () => void;
  private onQuit: () => void;
  private onOptions: () => void;

  constructor(canvas: HTMLCanvasElement, onResume: () => void, onQuit: () => void, onOptions: () => void) {
    super(canvas);
    this.onResume = onResume;
    this.onQuit = onQuit;
    this.onOptions = onOptions;
    this.createButtons();
  }

  /**
   * Create buttons
   */
  private createButtons(): void {
    const centerX = this.canvas.width / 2;
    const buttonWidth = 200;
    const buttonHeight = 60;

    // RESUME button
    this.buttons.push(
      new Button({
        x: centerX - buttonWidth / 2,
        y: this.canvas.height / 2 - 10,
        width: buttonWidth,
        height: buttonHeight,
        text: t('ui.buttons.resume'),
        onClick: () => this.onResume(),
      })
    );

    // OPTIONS button
    this.buttons.push(
      new Button({
        x: centerX - buttonWidth / 2,
        y: this.canvas.height / 2 + 70,
        width: buttonWidth,
        height: buttonHeight,
        text: t('ui.buttons.options'),
        onClick: () => this.onOptions(),
      })
    );

    // QUIT button
    this.buttons.push(
      new Button({
        x: centerX - buttonWidth / 2,
        y: this.canvas.height / 2 + 150,
        width: buttonWidth,
        height: buttonHeight,
        text: t('ui.buttons.quit'),
        onClick: () => this.onQuit(),
      })
    );
  }

  /**
   * Handle key press
   */
  handleKeyPress(key: string): void {
    if (key === 'Escape') {
      this.onResume();
    }
  }

  /**
   * Refresh translations when language changes
   */
  refreshTranslations(): void {
    // Update button texts
    if (this.buttons.length >= 3) {
      this.buttons[0].setText(t('ui.buttons.resume'));
      this.buttons[1].setText(t('ui.buttons.options'));
      this.buttons[2].setText(t('ui.buttons.quit'));
    }
  }

  /**
   * Render the pause screen
   */
  render(): void {
    // Semi-transparent dark overlay
    this.ctx.fillStyle = 'rgba(10, 10, 10, 0.85)';
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

    this.ctx.save();

    // Draw "PAUSED" title
    this.ctx.shadowBlur = GLOW_HUGE;
    this.ctx.shadowColor = COLOR_MAGENTA;
    this.ctx.fillStyle = COLOR_MAGENTA;
    this.ctx.font = FONT_TITLE_HUGE;
    this.ctx.textAlign = 'center';
    this.ctx.textBaseline = 'middle';
    this.ctx.fillText(t('ui.screens.paused'), this.canvas.width / 2, this.canvas.height / 2 - 120);

    this.ctx.restore();

    // Render buttons
    for (const button of this.buttons) {
      button.render(this.ctx);
    }
  }
}
