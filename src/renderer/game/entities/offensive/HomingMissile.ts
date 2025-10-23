/**
 * HomingMissile entity - represents a homing missile that tracks the bat
 * Spawned when a homing brick is destroyed
 */

import {
  HOMING_MISSILE_INITIAL_SPEED,
  HOMING_MISSILE_MAX_SPEED,
  HOMING_MISSILE_ACCELERATION,
  HOMING_MISSILE_TURN_RATE,
  HOMING_MISSILE_SIZE,
  HOMING_MISSILE_DAMAGE_PERCENT,
  HOMING_MISSILE_PULSE_SPEED,
  HOMING_MISSILE_COLOR,
  HOMING_MISSILE_MAX_LIFETIME,
  COLOR_WHITE,
  PARTICLE_GLOW_BLUR,
} from '../../../config/constants';

export class HomingMissile {
  private position: { x: number; y: number };
  private velocity: { x: number; y: number };
  private readonly size: number = HOMING_MISSILE_SIZE;
  private readonly color: string;
  private active: boolean = true;
  private speed: number = HOMING_MISSILE_INITIAL_SPEED;
  private angle: number = Math.PI / 2; // Start pointing down
  private pulseTimer: number = 0;
  private lifetime: number = 0; // Track lifetime for despawn

  constructor(x: number, y: number, color: string) {
    this.position = { x, y };
    // Start with downward velocity
    this.velocity = { x: 0, y: this.speed };
    // Use constant color instead of brick color for consistent bright purple
    this.color = HOMING_MISSILE_COLOR;
  }

  /**
   * Update missile position and track target
   */
  update(deltaTime: number, targetX: number, targetY: number): void {
    if (!this.active) return;

    // Track lifetime and deactivate after max lifetime
    this.lifetime += deltaTime;
    if (this.lifetime >= HOMING_MISSILE_MAX_LIFETIME) {
      this.deactivate();
      return;
    }

    // Accelerate up to max speed
    if (this.speed < HOMING_MISSILE_MAX_SPEED) {
      this.speed = Math.min(
        HOMING_MISSILE_MAX_SPEED,
        this.speed + HOMING_MISSILE_ACCELERATION * deltaTime
      );
    }

    // Calculate direction to target
    const dx = targetX - this.position.x;
    const dy = targetY - this.position.y;
    const targetAngle = Math.atan2(dy, dx);

    // Calculate angle difference
    let angleDiff = targetAngle - this.angle;
    
    // Normalize angle difference to [-PI, PI]
    while (angleDiff > Math.PI) angleDiff -= Math.PI * 2;
    while (angleDiff < -Math.PI) angleDiff += Math.PI * 2;

    // Turn toward target with limited turn rate
    const maxTurn = HOMING_MISSILE_TURN_RATE * deltaTime;
    if (Math.abs(angleDiff) < maxTurn) {
      this.angle = targetAngle;
    } else {
      this.angle += Math.sign(angleDiff) * maxTurn;
    }

    // Update velocity based on current angle and speed
    this.velocity.x = Math.cos(this.angle) * this.speed;
    this.velocity.y = Math.sin(this.angle) * this.speed;

    // Update position
    this.position.x += this.velocity.x * deltaTime;
    this.position.y += this.velocity.y * deltaTime;

    // Update pulse timer for visual effect
    this.pulseTimer += deltaTime * HOMING_MISSILE_PULSE_SPEED;
  }

  /**
   * Render the homing missile with arrow shape and pulsing glow
   */
  render(ctx: CanvasRenderingContext2D): void {
    if (!this.active) return;

    ctx.save();

    const x = this.position.x;
    const y = this.position.y;
    const size = this.size;

    // Calculate pulse effect (0.7 to 1.0)
    const pulse = 0.7 + Math.sin(this.pulseTimer) * 0.15;

    // Rotate context to missile angle
    ctx.translate(x, y);
    ctx.rotate(this.angle);

    // Draw glow effect with pulse
    ctx.shadowBlur = PARTICLE_GLOW_BLUR * pulse;
    ctx.shadowColor = this.color;

    // Draw missile body (arrow shape)
    ctx.fillStyle = this.color;
    ctx.beginPath();
    // Arrow point
    ctx.moveTo(size, 0);
    // Top wing
    ctx.lineTo(-size * 0.5, -size * 0.4);
    // Top fin
    ctx.lineTo(-size * 0.3, -size * 0.2);
    // Bottom fin
    ctx.lineTo(-size * 0.3, size * 0.2);
    // Bottom wing
    ctx.lineTo(-size * 0.5, size * 0.4);
    // Back to point
    ctx.closePath();
    ctx.fill();

    // Draw bright core with pulse
    ctx.globalAlpha = pulse;
    ctx.fillStyle = COLOR_WHITE;
    ctx.beginPath();
    ctx.moveTo(size * 0.6, 0);
    ctx.lineTo(-size * 0.2, -size * 0.2);
    ctx.lineTo(-size * 0.2, size * 0.2);
    ctx.closePath();
    ctx.fill();

    // Draw trail particles
    ctx.globalAlpha = 0.6 * pulse;
    for (let i = 1; i <= 3; i++) {
      const trailX = -size * 0.3 * i;
      const trailSize = size * 0.3 * (1 - i * 0.2);
      ctx.fillStyle = this.color;
      ctx.fillRect(
        trailX - trailSize / 2,
        -trailSize / 2,
        trailSize,
        trailSize
      );
    }

    ctx.restore();
  }

  /**
   * Get missile bounds for collision detection
   */
  getBounds(): { x: number; y: number; width: number; height: number } {
    return {
      x: this.position.x - this.size,
      y: this.position.y - this.size,
      width: this.size * 2,
      height: this.size * 2,
    };
  }

  /**
   * Get missile position
   */
  getPosition(): { x: number; y: number } {
    return { ...this.position };
  }

  /**
   * Get missile color
   */
  getColor(): string {
    return this.color;
  }

  /**
   * Check if missile is active
   */
  isActive(): boolean {
    return this.active;
  }

  /**
   * Deactivate the missile (after collision)
   */
  deactivate(): void {
    this.active = false;
  }

  /**
   * Check if missile is off screen
   */
  isOffScreen(canvasWidth: number, canvasHeight: number): boolean {
    return (
      this.position.x < -this.size * 2 ||
      this.position.x > canvasWidth + this.size * 2 ||
      this.position.y < -this.size * 2 ||
      this.position.y > canvasHeight + this.size * 2
    );
  }
}
