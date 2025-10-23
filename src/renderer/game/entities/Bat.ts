/**
 * Bat entity - represents the player-controlled paddle
 */

import { Vector2D } from '../core/types';
import {
  BAT_GLOW_BLUR,
  BAT_TURRET_WIDTH_MULTIPLIER,
  BAT_TURRET_HEIGHT_MULTIPLIER,
  BAT_TURRET_BARREL_WIDTH_MULTIPLIER,
  BAT_TURRET_BARREL_HEIGHT_MULTIPLIER,
  BAT_TURRET_TIP_WIDTH_MULTIPLIER,
  BAT_TURRET_TIP_HEIGHT_MULTIPLIER,
} from '../../config/constants';

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
  private showTurret: boolean = false; // Show turret when lasers are active
  private turretCount: number = 1; // Number of turrets to render

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

    // Draw turrets if lasers are active
    if (this.showTurret) {
      this.renderTurrets(ctx);
    }

    ctx.restore();
  }

  /**
   * Render multiple turrets equally spaced along the bat
   */
  private renderTurrets(ctx: CanvasRenderingContext2D): void {
    const turretPositions = this.getTurretPositions();
    
    for (const turretX of turretPositions) {
      this.renderSingleTurret(ctx, turretX);
    }
  }

  /**
   * Render a single turret at the specified X position
   */
  private renderSingleTurret(ctx: CanvasRenderingContext2D, centerX: number): void {
    const turretY = this.position.y;
    const turretWidth = this.height * BAT_TURRET_WIDTH_MULTIPLIER;
    const turretHeight = this.height * BAT_TURRET_HEIGHT_MULTIPLIER;
    const barrelWidth = this.height * BAT_TURRET_BARREL_WIDTH_MULTIPLIER;
    const barrelHeight = this.height * BAT_TURRET_BARREL_HEIGHT_MULTIPLIER;

    // Draw turret base (trapezoid)
    ctx.fillStyle = '#ff00ff';
    ctx.beginPath();
    ctx.moveTo(centerX - turretWidth / 2, turretY);
    ctx.lineTo(centerX - turretWidth / 3, turretY - turretHeight);
    ctx.lineTo(centerX + turretWidth / 3, turretY - turretHeight);
    ctx.lineTo(centerX + turretWidth / 2, turretY);
    ctx.closePath();
    ctx.fill();

    // Draw barrel (rectangle on top)
    ctx.fillStyle = '#ff00ff';
    ctx.fillRect(
      centerX - barrelWidth / 2,
      turretY - turretHeight - barrelHeight,
      barrelWidth,
      barrelHeight
    );

    // Draw barrel tip (small rectangle)
    const tipWidth = barrelWidth * BAT_TURRET_TIP_WIDTH_MULTIPLIER;
    const tipHeight = this.height * BAT_TURRET_TIP_HEIGHT_MULTIPLIER;
    ctx.fillStyle = '#00ffff'; // Cyan tip for contrast
    ctx.shadowColor = '#00ffff';
    ctx.fillRect(
      centerX - tipWidth / 2,
      turretY - turretHeight - barrelHeight - tipHeight,
      tipWidth,
      tipHeight
    );
  }

  /**
   * Calculate X positions for all turrets, equally spaced along the bat
   */
  getTurretPositions(): number[] {
    if (this.turretCount === 1) {
      // Single turret at center
      return [this.position.x + this.width / 2];
    }

    const positions: number[] = [];
    const spacing = this.width / (this.turretCount + 1);

    for (let i = 1; i <= this.turretCount; i++) {
      positions.push(this.position.x + spacing * i);
    }

    return positions;
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

  /**
   * Set whether to show turret (when lasers are active)
   */
  setShowTurret(show: boolean): void {
    this.showTurret = show;
  }

  /**
   * Set the number of turrets to render
   */
  setTurretCount(count: number): void {
    this.turretCount = Math.max(1, count); // Minimum 1 turret
  }

  /**
   * Get the number of turrets
   */
  getTurretCount(): number {
    return this.turretCount;
  }
}
