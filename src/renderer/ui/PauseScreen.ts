/**
 * Pause screen with RESUME and QUIT buttons
 */

import { Screen } from './Screen';
import { Button } from './Button';

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
        text: 'RESUME',
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
        text: 'OPTIONS',
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
        text: 'QUIT',
        onClick: () => this.onQuit(),
      })
    );
  }

  /**
   * Handle key press (ESC/Space/Enter triggers RESUME)
   */
  handleKeyPress(key: string): void {
    if (key === 'Escape' || key === ' ' || key === 'Enter') {
      this.onResume();
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
    this.ctx.shadowBlur = 40;
    this.ctx.shadowColor = '#ff00ff';
    this.ctx.fillStyle = '#ff00ff';
    this.ctx.font = '72px "D Day Stencil", Arial';
    this.ctx.textAlign = 'center';
    this.ctx.textBaseline = 'middle';
    this.ctx.fillText('PAUSED', this.canvas.width / 2, this.canvas.height / 2 - 120);

    this.ctx.restore();

    // Render buttons
    for (const button of this.buttons) {
      button.render(this.ctx);
    }
  }
}
