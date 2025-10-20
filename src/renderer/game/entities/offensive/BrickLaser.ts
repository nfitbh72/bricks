/**
 * BrickLaser entity - represents a laser fired from a laser brick
 * Fires after a delay and travels straight down toward the bat
 */

import { 
  LASER_BRICK_LASER_WIDTH, 
  LASER_BRICK_LASER_SPEED,
  LASER_BRICK_FIRE_DELAY,
  LASER_BRICK_WARNING_COLOR
} from '../../../config/constants';

export class BrickLaser {
  private position: { x: number; y: number };
  private readonly targetX: number; // Target bat X position
  private readonly width: number = LASER_BRICK_LASER_WIDTH;
  private readonly speed: number = LASER_BRICK_LASER_SPEED;
  private readonly color: string;
  private active: boolean = true;
  private charging: boolean = true;
  private chargeTimer: number = 0;
  private readonly chargeDelay: number = LASER_BRICK_FIRE_DELAY;

  constructor(x: number, y: number, targetX: number, color: string) {
    this.position = { x, y };
    this.targetX = targetX;
    this.color = color;
  }

  /**
   * Update laser position and charging state
   */
  update(deltaTime: number): void {
    if (!this.active) return;

    if (this.charging) {
      this.chargeTimer += deltaTime;
      if (this.chargeTimer >= this.chargeDelay) {
        this.charging = false;
      }
    } else {
      // Move downward
      this.position.y += this.speed * deltaTime;
    }
  }

  /**
   * Render the laser beam
   */
  render(ctx: CanvasRenderingContext2D): void {
    if (!this.active) return;

    ctx.save();

    if (this.charging) {
      // Draw warning indicator during charge
      const chargeProgress = this.chargeTimer / this.chargeDelay;
      const alpha = 0.3 + (chargeProgress * 0.7); // Fade in from 0.3 to 1.0
      
      ctx.globalAlpha = alpha;
      ctx.strokeStyle = LASER_BRICK_WARNING_COLOR;
      ctx.lineWidth = this.width;
      ctx.shadowBlur = 15;
      ctx.shadowColor = LASER_BRICK_WARNING_COLOR;
      
      // Draw vertical warning line
      ctx.beginPath();
      ctx.moveTo(this.position.x, this.position.y);
      ctx.lineTo(this.position.x, this.position.y + 100); // Short warning beam
      ctx.stroke();
    } else {
      // Draw active laser beam
      const height = 20; // Laser beam length
      
      ctx.fillStyle = this.color;
      ctx.shadowBlur = 20;
      ctx.shadowColor = this.color;
      
      // Draw laser as a vertical rectangle
      ctx.fillRect(
        this.position.x - this.width / 2,
        this.position.y,
        this.width,
        height
      );
      
      // Draw bright core
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(
        this.position.x - this.width / 4,
        this.position.y,
        this.width / 2,
        height
      );
    }

    ctx.restore();
  }

  /**
   * Get laser bounds for collision detection
   * Only returns bounds when laser is active (not charging)
   */
  getBounds(): { x: number; y: number; width: number; height: number } | null {
    if (this.charging) return null;
    
    const height = 20;
    return {
      x: this.position.x - this.width / 2,
      y: this.position.y,
      width: this.width,
      height: height,
    };
  }

  /**
   * Get laser position
   */
  getPosition(): { x: number; y: number } {
    return { ...this.position };
  }

  /**
   * Get laser color
   */
  getColor(): string {
    return this.color;
  }

  /**
   * Check if laser is active
   */
  isActive(): boolean {
    return this.active;
  }

  /**
   * Check if laser is still charging
   */
  isCharging(): boolean {
    return this.charging;
  }

  /**
   * Deactivate the laser (after collision)
   */
  deactivate(): void {
    this.active = false;
  }

  /**
   * Check if laser is off screen (below bottom)
   */
  isOffScreen(canvasHeight: number): boolean {
    return this.position.y > canvasHeight;
  }
}
