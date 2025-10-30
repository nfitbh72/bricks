/**
 * Tutorial screen shown at the start of level 1
 */

import { Screen } from './Screen';
import { Button } from './Button';
import { t } from '../i18n/LanguageManager';
import { FONT_TITLE_LARGE, FONT_TITLE_SMALL, GLOW_LARGE, COLOR_CYAN, COLOR_GREEN } from '../config/constants';

export class TutorialScreen extends Screen {
  private onClose: () => void;

  constructor(canvas: HTMLCanvasElement, onClose: () => void) {
    super(canvas);
    this.onClose = onClose;
    this.createButtons();
  }

  /**
   * Create buttons
   */
  private createButtons(): void {
    const centerX = this.canvas.width / 2;
    const buttonWidth = 150;
    const buttonHeight = 50;

    // OK button
    this.buttons.push(
      new Button({
        x: centerX - buttonWidth / 2,
        y: this.canvas.height / 2 + 120,
        width: buttonWidth,
        height: buttonHeight,
        text: t('ui.buttons.ok'),
        onClick: () => this.onClose(),
      })
    );
  }

  /**
   * Handle click - close on click anywhere
   */
  handleClick(x: number, y: number): void {
    // Check if button was clicked first
    for (const button of this.buttons) {
      if (button.containsPoint(x, y)) {
        button.click();
        return;
      }
    }
    
    // Otherwise, close on any click
    this.onClose();
  }

  /**
   * Handle key press
   */
  handleKeyPress(key: string): void {
    // Close on Enter or Escape
    if (key === 'Enter' || key === 'Escape' || key === ' ') {
      this.onClose();
    }
  }

  /**
   * Refresh translations when language changes
   */
  refreshTranslations(): void {
    if (this.buttons.length >= 1) {
      this.buttons[0].setText(t('ui.buttons.ok'));
    }
  }

  /**
   * Render the tutorial screen
   */
  render(): void {
    // Semi-transparent dark overlay
    this.ctx.fillStyle = 'rgba(10, 10, 10, 0.9)';
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

    this.ctx.save();

    const centerX = this.canvas.width / 2;
    const centerY = this.canvas.height / 2;

    // Draw title
    this.ctx.shadowBlur = GLOW_LARGE;
    this.ctx.shadowColor = COLOR_CYAN;
    this.ctx.fillStyle = COLOR_CYAN;
    this.ctx.font = FONT_TITLE_LARGE;
    this.ctx.textAlign = 'center';
    this.ctx.textBaseline = 'middle';
    this.ctx.fillText(t('ui.screens.tutorial.title'), centerX, centerY - 80);

    // Draw explanation text
    this.ctx.shadowBlur = 0;
    this.ctx.fillStyle = COLOR_GREEN;
    this.ctx.font = FONT_TITLE_SMALL;
    
    const line1 = t('ui.screens.tutorial.line1');
    const line2 = t('ui.screens.tutorial.line2');
    
    this.ctx.fillText(line1, centerX, centerY - 10);
    this.ctx.fillText(line2, centerX, centerY + 30);

    this.ctx.restore();

    // Render buttons
    for (const button of this.buttons) {
      button.render(this.ctx);
    }
  }
}
