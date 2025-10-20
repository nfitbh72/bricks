/**
 * FallingBrick entity - represents a brick that falls when destroyed
 * Accelerates downward due to gravity and damages the bat on contact
 */

import { FALLING_BRICK_GRAVITY, BRICK_WIDTH, BRICK_HEIGHT, BRICK_GLOW_BLUR } from '../../../config/constants';

export class FallingBrick {
  private position: { x: number; y: number };
  private velocity: { x: number; y: number };
  private readonly width: number = BRICK_WIDTH;
  private readonly height: number = BRICK_HEIGHT;
  private readonly color: string;
  private active: boolean = true;

  constructor(x: number, y: number, color: string) {
    this.position = { x, y };
    this.velocity = { x: 0, y: 0 }; // Starts stationary, gravity will accelerate it
    this.color = color;
  }

  /**
   * Update falling brick position with gravity
   */
  update(deltaTime: number): void {
    if (!this.active) return;

    // Apply gravity
    this.velocity.y += FALLING_BRICK_GRAVITY * deltaTime;

    // Update position
    this.position.x += this.velocity.x * deltaTime;
    this.position.y += this.velocity.y * deltaTime;
  }

  /**
   * Render the falling brick
   */
  render(ctx: CanvasRenderingContext2D): void {
    if (!this.active) return;

    ctx.save();

    const x = this.position.x;
    const y = this.position.y;
    const w = this.width;
    const h = this.height;

    // Draw glow effect
    ctx.shadowBlur = BRICK_GLOW_BLUR;
    ctx.shadowColor = this.color;

    // Create gradient for 3D effect
    const gradient = ctx.createLinearGradient(x, y, x + w, y + h);
    gradient.addColorStop(0, this.lightenColor(this.color, 30));
    gradient.addColorStop(0.5, this.color);
    gradient.addColorStop(1, this.darkenColor(this.color, 30));

    // Draw brick with gradient
    ctx.fillStyle = gradient;
    ctx.fillRect(x, y, w, h);

    // Draw border
    ctx.strokeStyle = this.color;
    ctx.lineWidth = 2;
    ctx.strokeRect(x, y, w, h);

    ctx.restore();
  }

  /**
   * Get brick bounds for collision detection
   */
  getBounds(): { x: number; y: number; width: number; height: number } {
    return {
      x: this.position.x,
      y: this.position.y,
      width: this.width,
      height: this.height,
    };
  }

  /**
   * Get brick position
   */
  getPosition(): { x: number; y: number } {
    return { ...this.position };
  }

  /**
   * Get brick color
   */
  getColor(): string {
    return this.color;
  }

  /**
   * Check if brick is active
   */
  isActive(): boolean {
    return this.active;
  }

  /**
   * Deactivate the brick (after collision)
   */
  deactivate(): void {
    this.active = false;
  }

  /**
   * Check if brick is off screen (below bottom)
   */
  isOffScreen(canvasHeight: number): boolean {
    return this.position.y > canvasHeight;
  }

  /**
   * Lighten a hex color
   */
  private lightenColor(color: string, percent: number): string {
    const num = parseInt(color.replace('#', ''), 16);
    const r = Math.min(255, ((num >> 16) & 0xff) + percent);
    const g = Math.min(255, ((num >> 8) & 0xff) + percent);
    const b = Math.min(255, (num & 0xff) + percent);
    return `#${((r << 16) | (g << 8) | b).toString(16).padStart(6, '0')}`;
  }

  /**
   * Darken a hex color
   */
  private darkenColor(color: string, percent: number): string {
    const num = parseInt(color.replace('#', ''), 16);
    const r = Math.max(0, ((num >> 16) & 0xff) - percent);
    const g = Math.max(0, ((num >> 8) & 0xff) - percent);
    const b = Math.max(0, (num & 0xff) - percent);
    return `#${((r << 16) | (g << 8) | b).toString(16).padStart(6, '0')}`;
  }
}
