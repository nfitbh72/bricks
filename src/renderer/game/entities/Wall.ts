/**
 * Wall entity - represents side walls that appear when screen is wider than 1800px
 */

import { COLOR_CYAN } from '../../config/constants';

export class Wall {
  private readonly x: number;
  private readonly y: number;
  private readonly width: number;
  private readonly height: number;

  constructor(x: number, y: number, width: number, height: number) {
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
  }

  /**
   * Render the wall on the canvas
   */
  render(ctx: CanvasRenderingContext2D): void {
    ctx.save();

    // Draw wall with neon cyan glow
    ctx.shadowBlur = 15;
    ctx.shadowColor = COLOR_CYAN;
    ctx.fillStyle = COLOR_CYAN;
    ctx.globalAlpha = 0.3; // Semi-transparent
    ctx.fillRect(this.x, this.y, this.width, this.height);

    // Draw border for emphasis
    ctx.globalAlpha = 0.8;
    ctx.strokeStyle = COLOR_CYAN;
    ctx.lineWidth = 2;
    ctx.strokeRect(this.x, this.y, this.width, this.height);

    ctx.restore();
  }

  /**
   * Get wall bounds for collision detection
   */
  getBounds(): { x: number; y: number; width: number; height: number } {
    return {
      x: this.x,
      y: this.y,
      width: this.width,
      height: this.height,
    };
  }

  /**
   * Get the right edge of the wall
   */
  getRightEdge(): number {
    return this.x + this.width;
  }

  /**
   * Get the left edge of the wall
   */
  getLeftEdge(): number {
    return this.x;
  }
}
