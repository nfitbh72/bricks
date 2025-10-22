/**
 * SplittingFragment entity - represents a fragment from a splitting brick
 * Spawned when a splitting brick is destroyed (4 diagonal fragments)
 */

import {
  SPLITTING_FRAGMENT_SIZE,
  SPLITTING_FRAGMENT_SPEED,
  SPLITTING_FRAGMENT_FALL_DISTANCE,
  SPLITTING_FRAGMENT_SHAKE_DURATION,
  SPLITTING_FRAGMENT_SHAKE_INTENSITY,
  SPLITTING_FRAGMENT_GRAVITY,
  PARTICLE_GLOW_BLUR,
} from '../../../config/constants';

export class SplittingFragment {
  private position: { x: number; y: number };
  private velocity: { x: number; y: number };
  private readonly size: number = SPLITTING_FRAGMENT_SIZE;
  private readonly color: string;
  private active: boolean = true;
  private rotation: number = 0;
  private rotationSpeed: number;
  private startPosition: { x: number; y: number };
  private isShaking: boolean = false;
  private isFalling: boolean = false;
  private shakeTimer: number = 0;
  private shakePosition: { x: number; y: number } = { x: 0, y: 0 };

  constructor(x: number, y: number, velocityX: number, velocityY: number, color: string) {
    this.position = { x, y };
    this.startPosition = { x, y };
    this.velocity = { x: velocityX, y: velocityY };
    this.color = color;
    // Random rotation speed for visual variety
    this.rotationSpeed = (Math.random() - 0.5) * 8;
  }

  /**
   * Update fragment position
   */
  update(deltaTime: number): void {
    if (!this.active) return;

    // Check if fragment has traveled 100 pixels
    const distanceTraveled = Math.sqrt(
      Math.pow(this.position.x - this.startPosition.x, 2) +
      Math.pow(this.position.y - this.startPosition.y, 2)
    );

    // Switch to shaking mode after traveling the fall distance
    if (!this.isShaking && !this.isFalling && distanceTraveled >= SPLITTING_FRAGMENT_FALL_DISTANCE) {
      this.isShaking = true;
      this.shakeTimer = 0;
      // Stop all velocity during shake
      this.velocity.x = 0;
      this.velocity.y = 0;
      // Store shake position
      this.shakePosition = { x: this.position.x, y: this.position.y };
    }

    // Handle shaking phase
    if (this.isShaking) {
      this.shakeTimer += deltaTime;
      
      if (this.shakeTimer >= SPLITTING_FRAGMENT_SHAKE_DURATION) {
        // End shake, start falling
        this.isShaking = false;
        this.isFalling = true;
        // Reset to shake position (remove shake offset)
        this.position.x = this.shakePosition.x;
        this.position.y = this.shakePosition.y;
        // Start falling vertically (no horizontal velocity)
        this.velocity.x = 0;
        this.velocity.y = 0;
      } else {
        // Apply shake offset
        const shakeX = (Math.random() - 0.5) * SPLITTING_FRAGMENT_SHAKE_INTENSITY;
        const shakeY = (Math.random() - 0.5) * SPLITTING_FRAGMENT_SHAKE_INTENSITY;
        this.position.x = this.shakePosition.x + shakeX;
        this.position.y = this.shakePosition.y + shakeY;
      }
    }

    // Apply gravity if falling
    if (this.isFalling) {
      this.velocity.y += SPLITTING_FRAGMENT_GRAVITY * deltaTime;
    }

    // Update position (only if not shaking)
    if (!this.isShaking) {
      this.position.x += this.velocity.x * deltaTime;
      this.position.y += this.velocity.y * deltaTime;
    }

    // Update rotation for visual effect
    this.rotation += this.rotationSpeed * deltaTime;
  }

  /**
   * Render the splitting fragment as a rotating brick piece
   */
  render(ctx: CanvasRenderingContext2D): void {
    if (!this.active) return;

    ctx.save();

    const x = this.position.x;
    const y = this.position.y;
    const size = this.size;

    // Apply rotation
    ctx.translate(x, y);
    ctx.rotate(this.rotation);

    // Draw glow effect
    ctx.shadowBlur = PARTICLE_GLOW_BLUR;
    ctx.shadowColor = this.color;

    // Draw fragment as a brick piece (rectangle with slight irregularity)
    ctx.fillStyle = this.color;
    ctx.fillRect(-size / 2, -size / 2, size, size);

    // Draw darker edge for depth
    ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
    ctx.fillRect(-size / 2, size / 2 - 3, size, 3);
    ctx.fillRect(size / 2 - 3, -size / 2, 3, size);

    // Draw highlight for 3D effect
    ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
    ctx.fillRect(-size / 2, -size / 2, size, 3);
    ctx.fillRect(-size / 2, -size / 2, 3, size);

    ctx.restore();
  }

  /**
   * Get fragment bounds for collision detection
   */
  getBounds(): { x: number; y: number; width: number; height: number } {
    return {
      x: this.position.x - this.size / 2,
      y: this.position.y - this.size / 2,
      width: this.size,
      height: this.size,
    };
  }

  /**
   * Get fragment position
   */
  getPosition(): { x: number; y: number } {
    return { ...this.position };
  }

  /**
   * Get fragment color
   */
  getColor(): string {
    return this.color;
  }

  /**
   * Check if fragment is active
   */
  isActive(): boolean {
    return this.active;
  }

  /**
   * Deactivate the fragment (after collision)
   */
  deactivate(): void {
    this.active = false;
  }

  /**
   * Check if fragment is off screen
   */
  isOffScreen(canvasWidth: number, canvasHeight: number): boolean {
    return (
      this.position.x < -this.size ||
      this.position.x > canvasWidth + this.size ||
      this.position.y < -this.size ||
      this.position.y > canvasHeight + this.size
    );
  }
}
