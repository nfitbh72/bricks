/**
 * Ball entity - represents the game ball that bounces around
 */

import { Vector2D } from '../core/types';
import { reflect, normalize, magnitude, clamp } from '../core/utils';
import { Bat } from '../entities/Bat';
import {
  BALL_BASE_DAMAGE,
  BALL_SPEED_INCREASE_PER_SECOND,
  BALL_BOUNCE_MAX_ANGLE,
  BALL_TAIL_BASE_LENGTH,
  BALL_TAIL_SEGMENTS,
  BALL_TAIL_MAX_SPEED_MULTIPLIER,
  BALL_GLOW_BLUR,
  BALL_TAIL_GLOW_BLUR,
  PIERCING_WARNING_DURATION,
  PIERCING_FLASH_INTERVAL,
  STICKY_BALL_LAUNCH_ANGLE,
  STICKY_BALL_INDICATOR_LENGTH,
  STICKY_BALL_INDICATOR_WIDTH,
  STICKY_BALL_INDICATOR_COLOR,
  STICKY_BALL_INDICATOR_GLOW,
} from '../../config/constants';

export class Ball {
  private position: Vector2D;
  private velocity: Vector2D;
  private readonly initialPosition: Vector2D;
  private readonly radius: number;
  private readonly initialSpeed: number;
  private currentSpeed: number;
  private isGrey: boolean = false;
  private isPiercing: boolean = false;
  private piercingTimeRemaining: number = 0;
  private damage: number = BALL_BASE_DAMAGE;
  private elapsedTime: number = 0; // Track time for acceleration
  private readonly speedIncreasePerSecond: number = BALL_SPEED_INCREASE_PER_SECOND;
  private accelerationMultiplier: number = 1.0; // Can be reduced by upgrades
  private isSticky: boolean = false; // Ball sticks to bat at level start
  private stickyOffsetX: number = 0; // Offset from bat center when sticky
  private stickyOffsetY: number = 0; // Offset above bat when sticky

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
   * When sticky, position is updated by updateStickyPosition() instead
   */
  update(deltaTime: number): void {
    // Don't update position if ball is sticky (bat controls position)
    if (this.isSticky) {
      return;
    }
    
    // Accumulate elapsed time for speed calculation
    this.elapsedTime += deltaTime;
    
    // Calculate new speed based on elapsed time with acceleration multiplier
    const speedIncrease = this.elapsedTime * this.speedIncreasePerSecond * this.accelerationMultiplier;
    this.currentSpeed = this.initialSpeed + speedIncrease;
    
    // deltaTime is in seconds, so multiply velocity by it for frame-independent movement
    this.position.x += this.velocity.x * deltaTime;
    this.position.y += this.velocity.y * deltaTime;
  }

  /**
   * Render the ball on the canvas with comet tail effect
   * Also renders launch indicator when sticky
   */
  render(ctx: CanvasRenderingContext2D): void {
    ctx.save();

    // Choose color based on state
    let color = '#00ffff'; // Default cyan
    if (this.isGrey) {
      color = '#666666'; // Grey when inactive
    } else if (this.isPiercing) {
      // Check if we're in warning period (last 0.5 seconds)
      if (this.piercingTimeRemaining <= PIERCING_WARNING_DURATION) {
        // Flash between white and red every 0.1 seconds
        const flashCycle = Math.floor(this.piercingTimeRemaining / PIERCING_FLASH_INTERVAL) % 2;
        color = flashCycle === 0 ? '#ffffff' : '#ff0000';
      } else {
        color = '#ff0000'; // Neon red when piercing
      }
    }

    // Draw launch indicator if ball is sticky
    if (this.isSticky) {
      this.renderLaunchIndicator(ctx);
    }

    // Draw comet tail if ball is moving
    if (this.velocity.x !== 0 || this.velocity.y !== 0) {
      this.renderCometTail(ctx, color);
    }

    // Draw glow effect (dystopian neon style)
    ctx.shadowBlur = BALL_GLOW_BLUR;
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
    const speedRatio = this.currentSpeed / this.initialSpeed;
    const tailLength = BALL_TAIL_BASE_LENGTH * Math.min(speedRatio, BALL_TAIL_MAX_SPEED_MULTIPLIER);

    // Number of tail segments
    const segments = BALL_TAIL_SEGMENTS;

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
      ctx.shadowBlur = BALL_TAIL_GLOW_BLUR * (1 - t);
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
    const batBounds = bat.getBounds();
    const batCenterY = batBounds.y + batBounds.height / 2;
    
    // Determine if ball hit top or bottom of bat
    const hitFromTop = this.position.y < batCenterY;
    
    // Get relative hit position (-1 to 1)
    const relativeHitPos = bat.getRelativeHitPosition(this.position.x);
    
    // Calculate bounce angle based on hit position
    const maxAngle = BALL_BOUNCE_MAX_ANGLE;
    
    if (hitFromTop) {
      // Hit top of bat - bounce upward
      // Center = -90 degrees (straight up)
      // Edges = up to ±60 degrees from vertical
      const bounceAngle = -90 + (relativeHitPos * maxAngle);
      const radians = (bounceAngle * Math.PI) / 180;
      
      this.velocity = {
        x: Math.cos(radians) * this.currentSpeed,
        y: Math.sin(radians) * this.currentSpeed,
      };
    } else {
      // Hit bottom of bat - bounce downward
      // Center = 90 degrees (straight down)
      // Edges = up to ±60 degrees from vertical
      const bounceAngle = 90 + (relativeHitPos * maxAngle);
      const radians = (bounceAngle * Math.PI) / 180;
      
      this.velocity = {
        x: Math.cos(radians) * this.currentSpeed,
        y: Math.sin(radians) * this.currentSpeed,
      };
    }
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

  /**
   * Set acceleration multiplier (from upgrades)
   */
  setAccelerationMultiplier(multiplier: number): void {
    this.accelerationMultiplier = multiplier;
  }

  /**
   * Set piercing state (for visual feedback)
   */
  setPiercing(piercing: boolean, timeRemaining: number = 0): void {
    this.isPiercing = piercing;
    this.piercingTimeRemaining = timeRemaining;
  }

  /**
   * Set sticky state (ball sticks to bat)
   */
  setSticky(sticky: boolean, offsetX: number = 0, offsetY: number = -30): void {
    this.isSticky = sticky;
    this.stickyOffsetX = offsetX;
    this.stickyOffsetY = offsetY;
    if (sticky) {
      // Reset velocity when becoming sticky
      this.velocity = { x: 0, y: 0 };
    }
  }

  /**
   * Check if ball is sticky
   */
  getIsSticky(): boolean {
    return this.isSticky;
  }

  /**
   * Update ball position when sticky to follow bat
   */
  updateStickyPosition(batCenterX: number, batY: number): void {
    if (this.isSticky) {
      this.position.x = batCenterX + this.stickyOffsetX;
      this.position.y = batY + this.stickyOffsetY;
    }
  }

  /**
   * Launch ball from sticky state
   */
  launchFromSticky(): void {
    if (this.isSticky) {
      this.isSticky = false;
      this.launch(STICKY_BALL_LAUNCH_ANGLE);
    }
  }

  /**
   * Render launch direction indicator when ball is sticky
   */
  private renderLaunchIndicator(ctx: CanvasRenderingContext2D): void {
    const angle = STICKY_BALL_LAUNCH_ANGLE;
    const radians = (angle * Math.PI) / 180;
    const endX = this.position.x + Math.cos(radians) * STICKY_BALL_INDICATOR_LENGTH;
    const endY = this.position.y + Math.sin(radians) * STICKY_BALL_INDICATOR_LENGTH;

    // Draw indicator line with glow
    ctx.shadowBlur = STICKY_BALL_INDICATOR_GLOW;
    ctx.shadowColor = STICKY_BALL_INDICATOR_COLOR;
    ctx.strokeStyle = STICKY_BALL_INDICATOR_COLOR;
    ctx.lineWidth = STICKY_BALL_INDICATOR_WIDTH;
    ctx.lineCap = 'round';

    ctx.beginPath();
    ctx.moveTo(this.position.x, this.position.y);
    ctx.lineTo(endX, endY);
    ctx.stroke();

    // Draw arrowhead
    const arrowSize = 8;
    const arrowAngle = 25 * Math.PI / 180;
    
    ctx.beginPath();
    ctx.moveTo(endX, endY);
    ctx.lineTo(
      endX - arrowSize * Math.cos(radians - arrowAngle),
      endY - arrowSize * Math.sin(radians - arrowAngle)
    );
    ctx.moveTo(endX, endY);
    ctx.lineTo(
      endX - arrowSize * Math.cos(radians + arrowAngle),
      endY - arrowSize * Math.sin(radians + arrowAngle)
    );
    ctx.stroke();
  }
}
