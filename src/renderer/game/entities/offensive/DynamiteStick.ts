/**
 * DynamiteStick entity - represents a dynamite stick that explodes after a delay
 * Stays in place, flashes as a warning, then explodes in a large circular area
 */

import {
  DYNAMITE_STICK_FUSE_TIME,
  DYNAMITE_STICK_FLASH_INTERVAL,
  DYNAMITE_STICK_DRIFT_SPEED,
  DYNAMITE_STICK_WIDTH,
  DYNAMITE_STICK_HEIGHT,
  DYNAMITE_EXPLOSION_RADIUS,
  DYNAMITE_EXPLOSION_DURATION,
  BRICK_GLOW_BLUR,
} from '../../../config/constants';
import { Brick } from '../Brick';

export interface DynamiteExplosionResult {
  exploded: boolean;
  centerX: number;
  centerY: number;
  radius: number;
  bricksToDamage: Brick[];
}

export class DynamiteStick {
  private position: { x: number; y: number };
  private velocity: { x: number; y: number };
  private readonly width: number = DYNAMITE_STICK_WIDTH;
  private readonly height: number = DYNAMITE_STICK_HEIGHT;
  private readonly color: string;
  private active: boolean = true;
  private rotation: number = 0; // Rotation angle in radians
  private rotationSpeed: number; // Radians per second
  private fuseTimer: number = 0; // Time since creation
  private flashTimer: number = 0; // Timer for flash effect
  private showFlash: boolean = false; // Whether to show flash
  private exploded: boolean = false; // Whether it has exploded
  private explosionTimer: number = 0; // Timer for explosion visual effect
  private damageApplied: boolean = false; // Whether explosion damage has been applied

  constructor(x: number, y: number, color: string) {
    // Center the dynamite stick on the brick position
    this.position = { 
      x: x + (104 - this.width) / 2, // BRICK_WIDTH is 104
      y: y 
    };
    // Random drift direction
    const angle = Math.random() * Math.PI * 2;
    this.velocity = {
      x: Math.cos(angle) * DYNAMITE_STICK_DRIFT_SPEED,
      y: Math.sin(angle) * DYNAMITE_STICK_DRIFT_SPEED
    };
    this.color = color;
    // Random rotation speed between -3 and 3 radians per second
    this.rotationSpeed = (Math.random() - 0.5) * 6;
  }

  /**
   * Update dynamite stick position, rotation, and fuse timer
   */
  update(deltaTime: number): void {
    if (!this.active) return;

    // Update fuse timer
    this.fuseTimer += deltaTime;

    // Update flash timer
    this.flashTimer += deltaTime;
    if (this.flashTimer >= DYNAMITE_STICK_FLASH_INTERVAL) {
      this.flashTimer = 0;
      this.showFlash = !this.showFlash;
    }

    // Check if fuse has expired
    if (this.fuseTimer >= DYNAMITE_STICK_FUSE_TIME && !this.exploded) {
      this.exploded = true;
      // Don't deactivate yet - let the manager handle explosion and cleanup
      return;
    }

    // Update explosion visual effect timer
    if (this.exploded) {
      this.explosionTimer += deltaTime;
      return;
    }

    // Apply drift movement
    this.position.x += this.velocity.x * deltaTime;
    this.position.y += this.velocity.y * deltaTime;
    
    // Update rotation for visual effect
    this.rotation += this.rotationSpeed * deltaTime;
  }

  /**
   * Render the dynamite stick with rotation, flashing effect, and fuse
   */
  render(ctx: CanvasRenderingContext2D): void {
    if (!this.active) return;

    // Render explosion effect if exploded
    if (this.exploded) {
      this.renderExplosion(ctx);
      return;
    }

    ctx.save();

    const w = this.width;
    const h = this.height;
    const centerX = this.position.x + w / 2;
    const centerY = this.position.y + h / 2;

    // Translate to center and rotate
    ctx.translate(centerX, centerY);
    ctx.rotate(this.rotation);
    ctx.translate(-w / 2, -h / 2);

    // Draw glow effect (intensifies when flashing)
    const glowIntensity = this.showFlash ? BRICK_GLOW_BLUR * 2 : BRICK_GLOW_BLUR;
    ctx.shadowBlur = glowIntensity;
    ctx.shadowColor = this.color;

    // Main body color (flashes brighter)
    const bodyColor = this.showFlash ? this.lightenColor(this.color, 80) : this.color;

    // Draw dynamite stick body (rounded rectangle)
    const cornerRadius = 2;
    ctx.fillStyle = bodyColor;
    
    ctx.beginPath();
    ctx.moveTo(cornerRadius, 0);
    ctx.lineTo(w - cornerRadius, 0);
    ctx.arcTo(w, 0, w, cornerRadius, cornerRadius);
    ctx.lineTo(w, h - cornerRadius);
    ctx.arcTo(w, h, w - cornerRadius, h, cornerRadius);
    ctx.lineTo(cornerRadius, h);
    ctx.arcTo(0, h, 0, h - cornerRadius, cornerRadius);
    ctx.lineTo(0, cornerRadius);
    ctx.arcTo(0, 0, cornerRadius, 0, cornerRadius);
    ctx.closePath();
    ctx.fill();

    // Draw outer border
    ctx.strokeStyle = this.lightenColor(this.color, 40);
    ctx.lineWidth = 2;
    ctx.stroke();

    // Draw fuse at top (small line extending upward)
    ctx.shadowBlur = 0;
    ctx.strokeStyle = '#FFD700'; // Gold color for fuse
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(w / 2, 0);
    ctx.lineTo(w / 2, -5);
    ctx.stroke();

    // Draw fuse spark (flashing)
    if (this.showFlash) {
      ctx.fillStyle = '#FFFF00'; // Bright yellow
      ctx.shadowBlur = 10;
      ctx.shadowColor = '#FFFF00';
      ctx.beginPath();
      ctx.arc(w / 2, -5, 2, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.restore();
  }

  /**
   * Render explosion visual effect
   */
  private renderExplosion(ctx: CanvasRenderingContext2D): void {
    const progress = Math.min(this.explosionTimer / DYNAMITE_EXPLOSION_DURATION, 1);
    const centerX = this.position.x + this.width / 2;
    const centerY = this.position.y + this.height / 2;
    
    ctx.save();
    
    // Outer expanding circle
    const outerRadius = DYNAMITE_EXPLOSION_RADIUS * progress;
    const outerAlpha = 1 - progress;
    
    ctx.beginPath();
    ctx.arc(centerX, centerY, outerRadius, 0, Math.PI * 2);
    ctx.strokeStyle = this.color;
    ctx.lineWidth = 3;
    ctx.globalAlpha = outerAlpha;
    ctx.shadowBlur = 20;
    ctx.shadowColor = this.color;
    ctx.stroke();
    
    // Inner filled circle (shrinks as it fades)
    const innerRadius = DYNAMITE_EXPLOSION_RADIUS * (1 - progress * 0.5);
    const innerAlpha = (1 - progress) * 0.3;
    
    ctx.beginPath();
    ctx.arc(centerX, centerY, innerRadius, 0, Math.PI * 2);
    ctx.fillStyle = this.color;
    ctx.globalAlpha = innerAlpha;
    ctx.shadowBlur = 30;
    ctx.shadowColor = this.color;
    ctx.fill();
    
    ctx.restore();
  }

  /**
   * Get bounds for collision detection (before explosion)
   */
  getBounds(): { x: number; y: number; width: number; height: number } | null {
    if (!this.active || this.exploded) return null;
    
    return {
      x: this.position.x,
      y: this.position.y,
      width: this.width,
      height: this.height,
    };
  }

  /**
   * Get explosion result if exploded
   * Returns bricks within explosion radius
   * Only returns bricks on first call (when damage hasn't been applied yet)
   */
  getExplosionResult(allBricks: Brick[]): DynamiteExplosionResult | null {
    if (!this.exploded || this.damageApplied) return null;
    
    this.damageApplied = true;

    const centerX = this.position.x + this.width / 2;
    const centerY = this.position.y + this.height / 2;
    const radius = DYNAMITE_EXPLOSION_RADIUS;

    const bricksToDamage: Brick[] = [];

    for (const brick of allBricks) {
      if (brick.isDestroyed() || brick.isIndestructible()) {
        continue;
      }

      const brickBounds = brick.getBounds();
      const brickCenterX = brickBounds.x + brickBounds.width / 2;
      const brickCenterY = brickBounds.y + brickBounds.height / 2;

      // Check if brick center is within explosion radius
      const dx = brickCenterX - centerX;
      const dy = brickCenterY - centerY;
      const distance = Math.sqrt(dx * dx + dy * dy);

      if (distance <= radius) {
        bricksToDamage.push(brick);
      }
    }

    return {
      exploded: true,
      centerX,
      centerY,
      radius,
      bricksToDamage,
    };
  }

  /**
   * Get dynamite position
   */
  getPosition(): { x: number; y: number } {
    return { ...this.position };
  }

  /**
   * Get dynamite color
   */
  getColor(): string {
    return this.color;
  }

  /**
   * Check if dynamite is active
   */
  isActive(): boolean {
    return this.active;
  }

  /**
   * Check if dynamite has exploded
   */
  hasExploded(): boolean {
    return this.exploded;
  }

  /**
   * Check if explosion animation is complete
   */
  isExplosionComplete(): boolean {
    return this.exploded && this.explosionTimer >= DYNAMITE_EXPLOSION_DURATION;
  }

  /**
   * Deactivate the dynamite (after explosion or collision)
   */
  deactivate(): void {
    this.active = false;
  }

  /**
   * Check if dynamite is off screen (below bottom)
   */
  isOffScreen(canvasHeight: number): boolean {
    return this.position.y > canvasHeight;
  }

  /**
   * Lighten a hex color
   */
  private lightenColor(color: string, percent: number): string {
    const num = parseInt(color.replace('#', ''), 16);
    const r = Math.min(255, ((num >> 16) & 0xff) + percent);
    const g = Math.min(255, ((num >> 8) & 0xff) + percent);
    const b = Math.min(255, (num & 0xff) + percent);
    return `#${((r << 16) | (g << 8) | b).toString(16).padStart(6, '0')}`;
  }
}
