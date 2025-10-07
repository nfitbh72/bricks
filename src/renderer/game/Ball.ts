/**
 * Ball entity - represents the game ball that bounces around
 */

import { Vector2D } from './types';

export class Ball {
  private position: Vector2D;
  private velocity: Vector2D;
  private readonly initialPosition: Vector2D;
  private readonly radius: number;
  private readonly speed: number;

  constructor(x: number, y: number, radius: number, speed: number) {
    this.position = { x, y };
    this.initialPosition = { x, y };
    this.velocity = { x: 0, y: 0 };
    this.radius = radius;
    this.speed = speed;
  }

  /**
   * Update ball position based on velocity and deltaTime
   */
  update(deltaTime: number): void {
    // deltaTime is in seconds, so multiply velocity by it for frame-independent movement
    this.position.x += this.velocity.x * deltaTime;
    this.position.y += this.velocity.y * deltaTime;
  }

  /**
   * Render the ball on the canvas
   */
  render(ctx: CanvasRenderingContext2D): void {
    ctx.save();

    // Draw glow effect (dystopian neon style)
    ctx.shadowBlur = 20;
    ctx.shadowColor = '#00ffff';

    // Draw ball
    ctx.fillStyle = '#00ffff';
    ctx.beginPath();
    ctx.arc(this.position.x, this.position.y, this.radius, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
  }

  /**
   * Set the ball's velocity
   */
  setVelocity(vx: number, vy: number): void {
    this.velocity = { x: vx, y: vy };
  }

  /**
   * Reverse horizontal velocity (bounce off vertical surface)
   */
  reverseX(): void {
    this.velocity.x = -this.velocity.x;
  }

  /**
   * Reverse vertical velocity (bounce off horizontal surface)
   */
  reverseY(): void {
    this.velocity.y = -this.velocity.y;
  }

  /**
   * Reset ball to initial position and stop movement
   */
  reset(): void {
    this.position = { ...this.initialPosition };
    this.velocity = { x: 0, y: 0 };
  }

  /**
   * Launch the ball in a direction
   */
  launch(angle: number): void {
    // Convert angle to radians and calculate velocity components
    const radians = (angle * Math.PI) / 180;
    this.velocity = {
      x: Math.cos(radians) * this.speed,
      y: Math.sin(radians) * this.speed,
    };
  }

  /**
   * Get current position
   */
  getPosition(): Vector2D {
    return { ...this.position };
  }

  /**
   * Get current velocity
   */
  getVelocity(): Vector2D {
    return { ...this.velocity };
  }

  /**
   * Get ball radius
   */
  getRadius(): number {
    return this.radius;
  }

  /**
   * Get ball speed
   */
  getSpeed(): number {
    return this.speed;
  }

  /**
   * Set position directly (useful for collision response)
   */
  setPosition(x: number, y: number): void {
    this.position = { x, y };
  }

  /**
   * Get ball bounds for collision detection
   */
  getBounds(): { x: number; y: number; radius: number } {
    return {
      x: this.position.x,
      y: this.position.y,
      radius: this.radius,
    };
  }
}
