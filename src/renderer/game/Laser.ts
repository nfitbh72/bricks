/**
 * Laser projectile - shot from bat when shooter upgrade is unlocked
 */

import { Vector2D } from './types';

export class Laser {
  private position: Vector2D;
  private readonly speed: number;
  private readonly damage: number;
  private readonly width: number = 2;
  private readonly height: number = 10;
  private active: boolean = true;

  constructor(x: number, y: number, speed: number, damage: number) {
    this.position = { x, y };
    this.speed = speed;
    this.damage = damage;
  }

  /**
   * Update laser position (moves upward)
   */
  update(deltaTime: number): void {
    // Move upward (negative Y)
    this.position.y -= this.speed * deltaTime;
  }

  /**
   * Render the laser
   */
  render(ctx: CanvasRenderingContext2D): void {
    if (!this.active) return;

    // Draw laser WITHOUT shadow for now (testing)
    ctx.save();
    ctx.fillStyle = '#00ffff';
    ctx.fillRect(
      this.position.x - this.width / 2,
      this.position.y - this.height / 2,
      this.width,
      this.height
    );
    ctx.restore();
  }

  /**
   * Get laser position
   */
  getPosition(): Vector2D {
    return { ...this.position };
  }

  /**
   * Get laser bounds for collision detection
   */
  getBounds(): { x: number; y: number; width: number; height: number } {
    return {
      x: this.position.x - this.width / 2,
      y: this.position.y - this.height / 2,
      width: this.width,
      height: this.height,
    };
  }

  /**
   * Get laser damage
   */
  getDamage(): number {
    return this.damage;
  }

  /**
   * Check if laser is active
   */
  isActive(): boolean {
    return this.active;
  }

  /**
   * Deactivate laser (after hitting something or going off-screen)
   */
  deactivate(): void {
    this.active = false;
  }

  /**
   * Check if laser is off-screen (top)
   */
  isOffScreen(minY: number): boolean {
    return this.position.y < minY;
  }
}
