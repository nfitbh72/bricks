/**
 * DamageNumber - Displays floating damage numbers above bricks
 */

import {
  DAMAGE_NUMBER_LIFETIME,
  DAMAGE_NUMBER_FADE_DURATION,
  DAMAGE_NUMBER_FLOAT_SPEED,
  DAMAGE_NUMBER_FONT_SIZE_NORMAL,
  DAMAGE_NUMBER_FONT_SIZE_CRITICAL,
  DAMAGE_NUMBER_GLOW_BLUR,
} from '../../config/constants';

export class DamageNumber {
  private x: number;
  private y: number;
  private damage: number;
  private isCritical: boolean;
  private lifetime: number;
  private maxLifetime: number = DAMAGE_NUMBER_LIFETIME;
  private startTime: number;

  constructor(x: number, y: number, damage: number, isCritical: boolean) {
    this.x = x;
    this.y = y;
    this.damage = damage;
    this.isCritical = isCritical;
    this.lifetime = 0;
    this.startTime = performance.now();
  }

  /**
   * Update the damage number position and lifetime
   */
  update(currentTime: number): void {
    this.lifetime = currentTime - this.startTime;
    
    // Float upward
    this.y -= DAMAGE_NUMBER_FLOAT_SPEED;
  }

  /**
   * Check if the damage number should be removed
   */
  isExpired(): boolean {
    return this.lifetime >= this.maxLifetime;
  }

  /**
   * Render the damage number
   */
  render(ctx: CanvasRenderingContext2D): void {
    if (this.isExpired()) return;

    ctx.save();

    // Calculate opacity based on lifetime
    const fadeStart = this.maxLifetime - DAMAGE_NUMBER_FADE_DURATION;
    let opacity = 1.0;
    if (this.lifetime > fadeStart) {
      opacity = 1.0 - ((this.lifetime - fadeStart) / DAMAGE_NUMBER_FADE_DURATION);
    }

    // Set color based on critical hit
    const color = this.isCritical ? '#ffff00' : '#ffffff'; // Yellow for crit, white for normal
    
    // Add glow effect for critical hits
    if (this.isCritical) {
      ctx.shadowBlur = DAMAGE_NUMBER_GLOW_BLUR;
      ctx.shadowColor = color;
    }

    // Set font and style
    ctx.fillStyle = color;
    ctx.globalAlpha = opacity;
    ctx.font = this.isCritical ? `bold ${DAMAGE_NUMBER_FONT_SIZE_CRITICAL}px Arial` : `${DAMAGE_NUMBER_FONT_SIZE_NORMAL}px Arial`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    // Display damage value (rounded to 1 decimal if fractional)
    const damageText = this.damage % 1 === 0 
      ? this.damage.toString() 
      : this.damage.toFixed(1);

    ctx.fillText(damageText, this.x, this.y);

    ctx.restore();
  }
}
