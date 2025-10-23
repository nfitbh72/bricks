/**
 * Intro screen with START and QUIT buttons
 */

import { Screen } from './Screen';
import { Button } from './Button';
import { t } from '../i18n/LanguageManager';

export class IntroScreen extends Screen {
  private onStart: () => void;
  private onQuit: () => void;
  private onOptions: () => void;
  // @TODO: Remove dev upgrades callback before production
  private onDevUpgrades: () => void;

  // Layout constants
  private readonly TOTAL_CONTENT_HEIGHT = 630;
  private readonly CONTENT_VERTICAL_POSITION = 0.45; // 45% from top

  constructor(canvas: HTMLCanvasElement, onStart: () => void, onQuit: () => void, onDevUpgrades: () => void, onOptions: () => void) {
    super(canvas);
    this.onStart = onStart;
    this.onQuit = onQuit;
    this.onOptions = onOptions;
    // @TODO: Remove dev upgrades callback before production
    this.onDevUpgrades = onDevUpgrades;
    this.createButtons();
  }

  /**
   * Create buttons
   */
  private createButtons(): void {
    const centerX = this.canvas.width / 2;
    const buttonWidth = 200;
    const buttonHeight = 60;
    
    // Position so the vertical midpoint is at configured position from top
    const contentMidY = this.canvas.height * this.CONTENT_VERTICAL_POSITION;
    const baseY = contentMidY - this.TOTAL_CONTENT_HEIGHT / 2;

    // START button
    this.buttons.push(
      new Button({
        x: centerX - buttonWidth / 2,
        y: baseY + 150,
        width: buttonWidth,
        height: buttonHeight,
        text: t('ui.buttons.startGame'),
        onClick: () => this.onStart(),
      })
    );

    // @TODO: Remove DEV UPGRADES button before production
    // DEV UPGRADES button
    this.buttons.push(
      new Button({
        x: centerX - buttonWidth / 2,
        y: baseY + 230,
        width: buttonWidth,
        height: buttonHeight,
        text: 'DEV UPGRADES',
        onClick: () => this.onDevUpgrades(),
      })
    );

    // OPTIONS button
    this.buttons.push(
      new Button({
        x: centerX - buttonWidth / 2,
        y: baseY + 310,
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
        y: baseY + 390,
        width: buttonWidth,
        height: buttonHeight,
        text: t('ui.buttons.quit'),
        onClick: () => this.onQuit(),
      })
    );
  }

  /**
   * Handle key press (Space/Enter triggers START)
   */
  handleKeyPress(key: string): void {
    if (key === ' ' || key === 'Enter') {
      this.onStart();
    }
  }

  /**
   * Refresh translations when language changes
   */
  refreshTranslations(): void {
    // Update button texts (button 1 is DEV UPGRADES, not translated)
    if (this.buttons.length >= 4) {
      this.buttons[0].setText(t('ui.buttons.startGame'));
      this.buttons[2].setText(t('ui.buttons.options'));
      this.buttons[3].setText(t('ui.buttons.quit'));
    }
  }

  /**
   * Render the intro screen
   */
  render(): void {
    // Clear screen
    this.ctx.fillStyle = '#0a0a0a';
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

    this.ctx.save();

    // Calculate positioning to center content vertically
    const contentMidY = this.canvas.height * this.CONTENT_VERTICAL_POSITION;
    const baseY = contentMidY - this.TOTAL_CONTENT_HEIGHT / 2;

    // Draw title
    this.ctx.shadowBlur = 40;
    this.ctx.shadowColor = '#ff00ff';
    this.ctx.fillStyle = '#ff00ff';
    this.ctx.font = '72px "D Day Stencil", Arial';
    this.ctx.textAlign = 'center';
    this.ctx.textBaseline = 'middle';
    this.ctx.fillText('BRICKS', this.canvas.width / 2, baseY);

    // Draw subtitle
    this.ctx.font = '36px "D Day Stencil", Arial';
    this.ctx.fillStyle = '#00ffff';
    this.ctx.shadowColor = '#00ffff';
    this.ctx.shadowBlur = 20;
    this.ctx.fillText('with UPGRADES', this.canvas.width / 2, baseY + 60);

    this.ctx.restore();

    // Render buttons
    for (const button of this.buttons) {
      button.render(this.ctx);
    }
  }
}
