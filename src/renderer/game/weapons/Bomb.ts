/**
 * Bomb projectile - shot from bat when bombs upgrade is unlocked
 * Explodes on impact with bricks, dealing area damage
 */

import { Vector2D } from '../core/types';

export class Bomb {
  private position: Vector2D;
  private readonly speed: number;
  private readonly damage: number;
  private readonly explosionRadius: number;
  private readonly radius: number = 8; // Visual size of bomb
  private active: boolean = true;
  private exploded: boolean = false;

  constructor(x: number, y: number, speed: number, damage: number, explosionRadius: number) {
    this.position = { x, y };
    this.speed = speed;
    this.damage = damage;
    this.explosionRadius = explosionRadius;
  }

  /**
   * Update bomb position (moves upward)
   */
  update(deltaTime: number): void {
    if (!this.exploded) {
      // Move upward (negative Y)
      this.position.y -= this.speed * deltaTime;
    }
  }

  /**
   * Render the bomb
   */
  render(ctx: CanvasRenderingContext2D): void {
    if (!this.active) return;

    ctx.save();
    
    if (this.exploded) {
      // Draw explosion effect (expanding circle)
      const gradient = ctx.createRadialGradient(
        this.position.x, this.position.y, 0,
        this.position.x, this.position.y, this.explosionRadius
      );
      gradient.addColorStop(0, 'rgba(255, 200, 0, 0.8)');
      gradient.addColorStop(0.5, 'rgba(255, 100, 0, 0.4)');
      gradient.addColorStop(1, 'rgba(255, 0, 0, 0)');
      
      ctx.fillStyle = gradient;
      ctx.beginPath();
      ctx.arc(this.position.x, this.position.y, this.explosionRadius, 0, Math.PI * 2);
      ctx.fill();
    } else {
      // Draw bomb (dark circle with orange glow)
      ctx.shadowBlur = 10;
      ctx.shadowColor = '#ff6600';
      ctx.fillStyle = '#333333';
      ctx.beginPath();
      ctx.arc(this.position.x, this.position.y, this.radius, 0, Math.PI * 2);
      ctx.fill();
      
      // Add fuse spark
      ctx.fillStyle = '#ff6600';
      ctx.beginPath();
      ctx.arc(this.position.x, this.position.y - this.radius, 2, 0, Math.PI * 2);
      ctx.fill();
    }
    
    ctx.restore();
  }

  /**
   * Get bomb position
   */
  getPosition(): Vector2D {
    return { ...this.position };
  }

  /**
   * Get bomb bounds for collision detection
   */
  getBounds(): { x: number; y: number; width: number; height: number } {
    const size = this.radius * 2;
    return {
      x: this.position.x - this.radius,
      y: this.position.y - this.radius,
      width: size,
      height: size,
    };
  }

  /**
   * Get bomb damage
   */
  getDamage(): number {
    return this.damage;
  }

  /**
   * Get explosion radius
   */
  getExplosionRadius(): number {
    return this.explosionRadius;
  }

  /**
   * Check if bomb is active
   */
  isActive(): boolean {
    return this.active;
  }

  /**
   * Check if bomb has exploded
   */
  hasExploded(): boolean {
    return this.exploded;
  }

  /**
   * Trigger explosion
   */
  explode(): void {
    this.exploded = true;
    // Bomb stays active briefly to show explosion effect
    setTimeout(() => {
      this.active = false;
    }, 200); // Show explosion for 200ms
  }

  /**
   * Deactivate bomb immediately
   */
  deactivate(): void {
    this.active = false;
  }

  /**
   * Check if bomb is off-screen (top)
   */
  isOffScreen(minY: number): boolean {
    return this.position.y < minY;
  }
}
