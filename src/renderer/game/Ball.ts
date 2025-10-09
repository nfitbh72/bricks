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
  private readonly initialSpeed: number;
  private currentSpeed: number;
  private isGrey: boolean = false;
  private damage: number = 1; // Base damage
  private elapsedTime: number = 0; // Track time for acceleration
  private readonly speedIncreasePerSecond: number = 5; // 300 per minute = 5 per second

  constructor(x: number, y: number, radius: number, speed: number) {
    this.position = { x, y };
    this.initialPosition = { x, y };
    this.velocity = { x: 0, y: 0 };
    this.radius = radius;
    this.initialSpeed = speed;
    this.currentSpeed = speed;
  }

  /**
   * Update ball position based on velocity and deltaTime
   * Also handles speed acceleration over time
   */
  update(deltaTime: number): void {
    // Accumulate elapsed time for speed calculation
    this.elapsedTime += deltaTime;
    
    // Calculate new speed based on elapsed time
    const speedIncrease = this.elapsedTime * this.speedIncreasePerSecond;
    this.currentSpeed = this.initialSpeed + speedIncrease;
    
    // deltaTime is in seconds, so multiply velocity by it for frame-independent movement
    this.position.x += this.velocity.x * deltaTime;
    this.position.y += this.velocity.y * deltaTime;
  }

  /**
   * Render the ball on the canvas with comet tail effect
   */
  render(ctx: CanvasRenderingContext2D): void {
    ctx.save();

    // Choose color based on state
    const color = this.isGrey ? '#666666' : '#00ffff';

    // Draw comet tail if ball is moving
    if (this.velocity.x !== 0 || this.velocity.y !== 0) {
      this.renderCometTail(ctx, color);
    }

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
   * Render comet tail effect behind the ball
   * Tail length increases with speed
   */
  private renderCometTail(ctx: CanvasRenderingContext2D, color: string): void {
    // Calculate tail direction (opposite to velocity)
    const speed = magnitude(this.velocity);
    if (speed === 0) return;

    const dirX = -this.velocity.x / speed;
    const dirY = -this.velocity.y / speed;

    // Tail length scales with speed (longer at higher speeds)
    // Base length at initial speed (300), scales up to 3x at 900 speed
    const speedRatio = this.currentSpeed / this.initialSpeed;
    const baseTailLength = 20;
    const tailLength = baseTailLength * Math.min(speedRatio, 3);

    // Number of tail segments
    const segments = 8;

    // Draw tail segments with decreasing opacity
    for (let i = 0; i < segments; i++) {
      const t = i / segments;
      const distance = tailLength * t;
      
      // Position of this tail segment
      const tailX = this.position.x + dirX * distance;
      const tailY = this.position.y + dirY * distance;
      
      // Size decreases along the tail
      const segmentRadius = this.radius * (1 - t * 0.7);
      
      // Opacity decreases along the tail
      const opacity = (1 - t) * 0.6;
      
      ctx.globalAlpha = opacity;
      ctx.fillStyle = color;
      ctx.shadowBlur = 15 * (1 - t);
      ctx.shadowColor = color;
      
      ctx.beginPath();
      ctx.arc(tailX, tailY, segmentRadius, 0, Math.PI * 2);
      ctx.fill();
    }

    // Reset alpha and shadow
    ctx.globalAlpha = 1;
    ctx.shadowBlur = 0;
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
   * Also resets speed acceleration
   */
  reset(): void {
    this.position = { ...this.initialPosition };
    this.velocity = { x: 0, y: 0 };
    this.isGrey = false;
    this.elapsedTime = 0;
    this.currentSpeed = this.initialSpeed;
  }

  /**
   * Launch the ball in a direction using current speed
   */
  launch(angle: number): void {
    // Convert angle to radians and calculate velocity components
    const radians = (angle * Math.PI) / 180;
    this.velocity = {
      x: Math.cos(radians) * this.currentSpeed,
      y: Math.sin(radians) * this.currentSpeed,
    };
  }

  /**
   * Update velocity magnitude to match current speed (maintains direction)
   */
  private updateVelocityMagnitude(): void {
    if (this.velocity.x !== 0 || this.velocity.y !== 0) {
      const currentMagnitude = magnitude(this.velocity);
      if (currentMagnitude > 0) {
        const scale = this.currentSpeed / currentMagnitude;
        this.velocity.x *= scale;
        this.velocity.y *= scale;
      }
    }
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
   * Get ball speed (current speed with acceleration)
   */
  getSpeed(): number {
    return this.currentSpeed;
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
   * Maintains current speed with acceleration
   */
  bounce(normal: Vector2D): void {
    const normalizedNormal = normalize(normal);
    const reflectedVelocity = reflect(this.velocity, normalizedNormal);
    this.velocity = reflectedVelocity;
    // Update velocity magnitude to match current accelerated speed
    this.updateVelocityMagnitude();
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
    
    // Convert to radians and set velocity using current accelerated speed
    const radians = (bounceAngle * Math.PI) / 180;
    
    this.velocity = {
      x: Math.cos(radians) * this.currentSpeed,
      y: Math.sin(radians) * this.currentSpeed,
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

  /**
   * Get ball damage
   */
  getDamage(): number {
    return this.damage;
  }

  /**
   * Set ball damage (from upgrades)
   */
  setDamage(damage: number): void {
    this.damage = damage;
  }
}
