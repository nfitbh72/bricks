/**
 * Bat entity - represents the player-controlled paddle
 */

import { Vector2D } from '../core/types';
import { BAT_GLOW_BLUR } from '../../config/constants';

export class Bat {
  private position: Vector2D;
  private width: number; // Changed from readonly to allow shrinking
  private readonly originalWidth: number; // Track original width for damage calculation
  private readonly height: number;
  private readonly speed: number;
  private minX: number = 0;
  private maxX: number = 0;
  private minY: number | null = null;
  private maxY: number | null = null;

  constructor(x: number, y: number, width: number, height: number, speed: number = 300) {
    this.position = { x, y };
    this.width = width;
    this.originalWidth = width;
    this.height = height;
    this.speed = speed;
  }

  /**
   * Update bat position based on input (called from game loop)
   */
  update(deltaTime: number): void {
    // Movement is handled by moveLeft/moveRight/setX methods
    // This method is here for consistency with other entities
    // and for future enhancements (e.g., smooth acceleration)
  }

  /**
   * Render the bat on the canvas
   */
  render(ctx: CanvasRenderingContext2D): void {
    ctx.save();

    // Draw glow effect (dystopian neon style)
    ctx.shadowBlur = BAT_GLOW_BLUR;
    ctx.shadowColor = '#ff00ff';

    // Draw bat
    ctx.fillStyle = '#ff00ff';
    ctx.fillRect(this.position.x, this.position.y, this.width, this.height);

    ctx.restore();
  }

  /**
   * Move bat left
   */
  moveLeft(deltaTime: number): void {
    this.position.x -= this.speed * deltaTime;
    this.constrainToBounds();
  }

  /**
   * Move bat right
   */
  moveRight(deltaTime: number): void {
    this.position.x += this.speed * deltaTime;
    this.constrainToBounds();
  }

  /**
   * Move bat up
   */
  moveUp(deltaTime: number): void {
    this.position.y -= this.speed * deltaTime;
    this.constrainToBounds();
  }

  /**
   * Move bat down
   */
  moveDown(deltaTime: number): void {
    this.position.y += this.speed * deltaTime;
    this.constrainToBounds();
  }

  /**
   * Set horizontal position directly (for mouse control)
   */
  setX(x: number): void {
    this.position.x = x - this.width / 2; // Center bat on mouse position
    this.constrainToBounds();
  }

  /**
   * Set vertical position directly (for mouse control)
   */
  setY(y: number): void {
    this.position.y = y - this.height / 2; // Center bat on mouse position
    this.constrainToBounds();
  }

  /**
   * Set position from mouse coordinates (centers bat on mouse)
   */
  setMousePosition(x: number, y: number): void {
    this.position.x = x - this.width / 2;
    this.position.y = y - this.height / 2;
    this.constrainToBounds();
  }

  /**
   * Set position directly
   */
  setPosition(x: number, y: number): void {
    this.position = { x, y };
    this.constrainToBounds();
  }

  /**
   * Set the boundary constraints for the bat
   */
  setBounds(minX: number, maxX: number, minY?: number, maxY?: number): void {
    this.minX = minX;
    this.maxX = maxX;
    if (minY !== undefined) this.minY = minY;
    if (maxY !== undefined) this.maxY = maxY;
    this.constrainToBounds();
  }

  /**
   * Keep bat within screen bounds
   */
  private constrainToBounds(): void {
    if (this.position.x < this.minX) {
      this.position.x = this.minX;
    }
    if (this.position.x + this.width > this.maxX) {
      this.position.x = this.maxX - this.width;
    }
    if (this.minY !== null && this.position.y < this.minY) {
      this.position.y = this.minY;
    }
    if (this.maxY !== null && this.position.y + this.height > this.maxY) {
      this.position.y = this.maxY - this.height;
    }
  }

  /**
   * Get current position
   */
  getPosition(): Vector2D {
    return { ...this.position };
  }

  /**
   * Get bat width
   */
  getWidth(): number {
    return this.width;
  }

  /**
   * Get bat height
   */
  getHeight(): number {
    return this.height;
  }

  /**
   * Get bat speed
   */
  getSpeed(): number {
    return this.speed;
  }

  /**
   * Get bat bounds for collision detection
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
   * Get the center X position of the bat
   */
  getCenterX(): number {
    return this.position.x + this.width / 2;
  }

  /**
   * Get the center Y position of the bat
   */
  getCenterY(): number {
    return this.position.y + this.height / 2;
  }

  /**
   * Calculate the relative hit position (-1 to 1) when ball hits bat
   * -1 = left edge, 0 = center, 1 = right edge
   */
  getRelativeHitPosition(ballX: number): number {
    const centerX = this.getCenterX();
    const relativeX = ballX - centerX;
    const normalizedX = relativeX / (this.width / 2);
    // Clamp to -1 to 1 range
    return Math.max(-1, Math.min(1, normalizedX));
  }

  /**
   * Damage the bat by reducing its width by a percentage
   * @param damagePercent - Percentage of ORIGINAL width to remove (0-100)
   */
  takeDamage(damagePercent: number): void {
    const damageAmount = this.originalWidth * (damagePercent / 100);
    this.width = Math.max(0, this.width - damageAmount);
    
    // Recenter bat position to keep it centered after shrinking
    this.constrainToBounds();
  }

  /**
   * Check if bat is destroyed (width <= 0)
   */
  isDestroyed(): boolean {
    return this.width <= 0;
  }
}
