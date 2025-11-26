/**
 * Debris entity - represents explosive fragments from exploding bricks
 * Travels with initial velocity and falls due to gravity
 */

import { EXPLODING_BRICK_DEBRIS_SIZE, PARTICLE_GLOW_BLUR, SPLITTING_FRAGMENT_GRAVITY } from '../../../config/constants';
import { Bounds } from '../../core/IEntity';
import { ICollidable } from '../../core/ICollidable';
import { CollisionGroup } from '../../core/CollisionTypes';

export class Debris implements ICollidable {
  private position: { x: number; y: number };
  private velocity: { x: number; y: number };
  private readonly size: number = EXPLODING_BRICK_DEBRIS_SIZE;
  private readonly color: string;
  private active: boolean = true;

  constructor(x: number, y: number, velocityX: number, velocityY: number, color: string) {
    this.position = { x, y };
    this.velocity = { x: velocityX, y: velocityY };
    this.color = color;
  }

  /**
   * Update debris position with gravity
   */
  update(deltaTime: number): void {
    if (!this.active) return;

    // Apply gravity to vertical velocity
    this.velocity.y += SPLITTING_FRAGMENT_GRAVITY * deltaTime;

    // Update position
    this.position.x += this.velocity.x * deltaTime;
    this.position.y += this.velocity.y * deltaTime;
  }

  /**
   * Render the debris particle
   */
  render(ctx: CanvasRenderingContext2D): void {
    if (!this.active) return;

    ctx.save();

    const x = this.position.x;
    const y = this.position.y;
    const size = this.size;

    // Draw glow effect
    ctx.shadowBlur = PARTICLE_GLOW_BLUR;
    ctx.shadowColor = this.color;

    // Draw debris as a square
    ctx.fillStyle = this.color;
    ctx.fillRect(x - size / 2, y - size / 2, size, size);

    // Draw border for definition
    ctx.strokeStyle = this.color;
    ctx.lineWidth = 1;
    ctx.strokeRect(x - size / 2, y - size / 2, size, size);

    ctx.restore();
  }

  /**
   * Get debris bounds for collision detection
   */
  getBounds(): Bounds | null {
    if (!this.active) return null;
    return {
      x: this.position.x - this.size / 2,
      y: this.position.y - this.size / 2,
      width: this.size,
      height: this.size,
    };
  }

  /**
   * Get debris position
   */
  getPosition(): { x: number; y: number } {
    return { ...this.position };
  }

  /**
   * Get debris color
   */
  getColor(): string {
    return this.color;
  }

  /**
   * Check if debris is active
   */
  isActive(): boolean {
    return this.active;
  }

  /**
   * Deactivate the debris (after collision)
   */
  deactivate(): void {
    this.active = false;
  }

  /**
   * Check if debris is off screen
   */
  isOffScreen(canvasWidth: number, canvasHeight: number): boolean {
    return (
      this.position.x < -this.size ||
      this.position.x > canvasWidth + this.size ||
      this.position.y < -this.size ||
      this.position.y > canvasHeight + this.size
    );
  }

  getCollisionGroup(): CollisionGroup {
      return CollisionGroup.OFFENSIVE;
  }

  onCollision(_other: ICollidable, _bounds: Bounds, _otherBounds: Bounds): void {
      // Handled by collision handlers
  }
}
