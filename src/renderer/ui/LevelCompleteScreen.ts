/**
 * Level Complete screen with CONTINUE button
 */

import { Screen } from './Screen';
import { Button } from './Button';

export class LevelCompleteScreen extends Screen {
  private onContinue: () => void;
  private currentLevel: number = 1;
  private levelTime: number = 0;
  private backgroundImage: HTMLImageElement | null = null;

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

    // CONTINUE button
    this.buttons.push(
      new Button({
        x: centerX - buttonWidth / 2,
        y: this.canvas.height / 2 + 80,
        width: buttonWidth,
        height: buttonHeight,
        text: 'CONTINUE',
        onClick: () => this.onContinue(),
      })
    );
  }

  /**
   * Handle key press (Space/Enter triggers CONTINUE)
   */
  handleKeyPress(key: string): void {
    if (key === ' ' || key === 'Enter') {
      this.onContinue();
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
    this.ctx.fillText('LEVEL COMPLETE!', this.canvas.width / 2, this.canvas.height / 2 - 80);

    // Draw level number
    this.ctx.font = '36px "D Day Stencil", Arial';
    this.ctx.fillStyle = '#00ffff';
    this.ctx.shadowColor = '#00ffff';
    this.ctx.shadowBlur = 20;
    this.ctx.fillText(
      `Level ${this.currentLevel}`,
      this.canvas.width / 2,
      this.canvas.height / 2 - 20
    );

    // Draw completion time
    this.ctx.font = '32px "D Day Stencil", Arial';
    this.ctx.fillStyle = '#ffff00';
    this.ctx.shadowColor = '#ffff00';
    this.ctx.shadowBlur = 20;
    this.ctx.fillText(
      `Time: ${this.formatTime(this.levelTime)}`,
      this.canvas.width / 2,
      this.canvas.height / 2 + 30
    );

    this.ctx.restore();

    // Render buttons
    for (const button of this.buttons) {
      button.render(this.ctx);
    }
  }
}
