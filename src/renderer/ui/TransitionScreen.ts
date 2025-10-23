/**
 * Transition screen with spinning brick and fade effect
 */

import { COLOR_BLACK, COLOR_MAGENTA } from '../config/constants';

export class TransitionScreen {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private rotation: number = 0;
  private opacity: number = 0;
  private fadeIn: boolean = true;
  private startTime: number = 0;
  private duration: number = 2000; // 2 seconds
  private onComplete: (() => void) | null = null;

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
  start(onComplete: () => void): void {
    this.startTime = performance.now();
    this.rotation = 0;
    this.opacity = 0;
    this.fadeIn = true;
    this.onComplete = onComplete;
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
