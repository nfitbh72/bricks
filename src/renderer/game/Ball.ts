/**
 * Ball entity - represents the game ball that bounces around
 */

import { Vector2D } from './types';
import { reflect, normalize, magnitude, clamp } from './utils';
import { Bat } from './Bat';

export class Ball {
  private position: Vector2D;
  private velocity: Vector2D;
  private readonly initialPosition: Vector2D;
  private readonly radius: number;
  private readonly speed: number;
  private isGrey: boolean = false;

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

    // Choose color based on state
    const color = this.isGrey ? '#666666' : '#00ffff';

    // Draw glow effect (dystopian neon style)
    ctx.shadowBlur = 20;
    ctx.shadowColor = color;

    // Draw ball
    ctx.fillStyle = color;
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
    this.isGrey = false;
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

  /**
   * Bounce off a surface with a given normal vector
   */
  bounce(normal: Vector2D): void {
    const normalizedNormal = normalize(normal);
    const reflectedVelocity = reflect(this.velocity, normalizedNormal);
    this.velocity = reflectedVelocity;
  }

  /**
   * Bounce off the bat with angle based on hit position
   * The further from center, the steeper the angle
   */
  bounceOffBat(bat: Bat): void {
    // Get relative hit position (-1 to 1)
    const relativeHitPos = bat.getRelativeHitPosition(this.position.x);
    
    // Calculate bounce angle based on hit position
    // Center = -90 degrees (straight up)
    // Edges = up to ±60 degrees from vertical
    const maxAngle = 60; // Maximum deflection angle in degrees
    const bounceAngle = -90 + (relativeHitPos * maxAngle);
    
    // Convert to radians and set velocity
    const radians = (bounceAngle * Math.PI) / 180;
    // Use ball's speed if currently stationary, otherwise use current speed
    const currentSpeed = magnitude(this.velocity);
    const useSpeed = currentSpeed > 0 ? currentSpeed : this.speed;
    
    this.velocity = {
      x: Math.cos(radians) * useSpeed,
      y: Math.sin(radians) * useSpeed,
    };
  }

  /**
   * Check and handle wall collisions
   * Returns true if ball hit the back wall (player loses health)
   */
  checkWallCollisions(
    minX: number,
    maxX: number,
    minY: number,
    maxY: number
  ): boolean {
    let hitBackWall = false;

    // Left wall - restores ball to normal if grey
    if (this.position.x - this.radius < minX) {
      this.position.x = minX + this.radius;
      this.reverseX();
      if (this.isGrey) {
        this.isGrey = false;
      }
    }

    // Right wall - restores ball to normal if grey
    if (this.position.x + this.radius > maxX) {
      this.position.x = maxX - this.radius;
      this.reverseX();
      if (this.isGrey) {
        this.isGrey = false;
      }
    }

    // Top wall - restores ball to normal if grey
    if (this.position.y - this.radius < minY) {
      this.position.y = minY + this.radius;
      this.reverseY();
      if (this.isGrey) {
        this.isGrey = false;
      }
    }

    // Bottom wall (back wall - player loses health)
    if (this.position.y + this.radius > maxY) {
      this.position.y = maxY - this.radius;
      this.reverseY();
      hitBackWall = true;
      this.isGrey = true; // Turn grey after hitting back wall
    }

    return hitBackWall;
  }

  /**
   * Set ball to grey state (passes through bat)
   */
  setGrey(grey: boolean): void {
    this.isGrey = grey;
  }

  /**
   * Check if ball is in grey state
   */
  getIsGrey(): boolean {
    return this.isGrey;
  }

  /**
   * Restore ball to normal state (called when hitting brick or side/top walls)
   */
  restoreToNormal(): void {
    this.isGrey = false;
  }
}
