/**
 * EffectsManager - Manages visual effects including particles, damage numbers, screen shake, and backgrounds
 */

import { ParticleSystem } from './ParticleSystem';
import { DamageNumber } from './DamageNumber';
import { BACKGROUND_IMAGE_OPACITY } from '../config/constants';

export class EffectsManager {
  private particleSystem: ParticleSystem;
  private damageNumbers: DamageNumber[] = [];
  private backgroundImage: HTMLImageElement | null = null;
  private screenShake: { x: number; y: number; intensity: number; duration: number } = {
    x: 0,
    y: 0,
    intensity: 0,
    duration: 0,
  };

  constructor() {
    this.particleSystem = new ParticleSystem();
  }

  /**
   * Update all visual effects
   */
  update(deltaTime: number): void {
    // Update particles
    this.particleSystem.update(deltaTime);

    // Update damage numbers
    const currentTime = performance.now();
    this.damageNumbers.forEach(damageNumber => damageNumber.update(currentTime));
    this.damageNumbers = this.damageNumbers.filter(damageNumber => !damageNumber.isExpired());

    // Update screen shake
    if (this.screenShake.duration > 0) {
      this.screenShake.duration -= deltaTime;
      if (this.screenShake.duration <= 0) {
        this.screenShake.x = 0;
        this.screenShake.y = 0;
        this.screenShake.intensity = 0;
      } else {
        // Random shake within intensity
        this.screenShake.x = (Math.random() - 0.5) * 2 * this.screenShake.intensity;
        this.screenShake.y = (Math.random() - 0.5) * 2 * this.screenShake.intensity;
      }
    }
  }

  /**
   * Render all visual effects
   */
  render(ctx: CanvasRenderingContext2D, showParticles: boolean, showDamageNumbers: boolean): void {
    // Render particles (if enabled)
    if (showParticles) {
      this.particleSystem.render(ctx);
    }

    // Render damage numbers (if enabled)
    if (showDamageNumbers) {
      this.damageNumbers.forEach(damageNumber => damageNumber.render(ctx));
    }
  }

  /**
   * Create particle effect
   */
  createParticles(x: number, y: number, count: number, color: string, lifetime: number): void {
    this.particleSystem.createParticles(x, y, count, color, lifetime);
  }

  /**
   * Add a damage number
   */
  addDamageNumber(x: number, y: number, damage: number, isCritical: boolean): void {
    this.damageNumbers.push(new DamageNumber(x, y, damage, isCritical));
  }

  /**
   * Trigger screen shake effect
   */
  triggerScreenShake(intensity: number, duration: number): void {
    this.screenShake.intensity = intensity;
    this.screenShake.duration = duration;
  }

  /**
   * Get screen shake offset
   */
  getScreenShakeOffset(): { x: number; y: number } {
    return { x: this.screenShake.x, y: this.screenShake.y };
  }

  /**
   * Load background image for a level
   */
  loadBackgroundImage(levelId: number): void {
    const img = new Image();
    img.src = `./assets/images/level${levelId}.jpg`;
    img.onload = () => {
      this.backgroundImage = img;
    };
    img.onerror = () => {
      console.warn(`Failed to load background image for level ${levelId}`);
      this.backgroundImage = null;
    };
  }

  /**
   * Render background image
   */
  renderBackground(ctx: CanvasRenderingContext2D, width: number, height: number): void {
    if (this.backgroundImage) {
      ctx.save();
      ctx.globalAlpha = BACKGROUND_IMAGE_OPACITY;
      ctx.drawImage(this.backgroundImage, 0, 0, width, height);
      ctx.globalAlpha = 1.0;
      ctx.restore();
    }
  }

  /**
   * Clear all effects
   */
  clear(): void {
    this.damageNumbers = [];
    this.screenShake = { x: 0, y: 0, intensity: 0, duration: 0 };
  }
}
