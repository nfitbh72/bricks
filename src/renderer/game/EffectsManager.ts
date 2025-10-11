/**
 * EffectsManager - Manages visual effects including particles, damage numbers, screen shake, and backgrounds
 */

import { ParticleSystem } from './ParticleSystem';
import { DamageNumber } from './DamageNumber';
import { 
  BACKGROUND_IMAGE_OPACITY,
  SLOW_MOTION_ZOOM_SCALE,
  SLOW_MOTION_DURATION
} from '../config/constants';

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

  // Slow-motion visual effects
  private slowMotionActive: boolean = false;
  private slowMotionTimer: number = 0;
  private slowMotionZoom: number = 1.0;
  private slowMotionZoomStart: number = 1.0;
  private slowMotionFocusX: number = 0;
  private slowMotionFocusY: number = 0;
  private slowMotionTargetFocusX: number = 0;
  private slowMotionTargetFocusY: number = 0;
  private canvasWidth: number = 0;
  private canvasHeight: number = 0;

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

    // Update slow-motion visual effects
    if (this.slowMotionActive) {
      this.slowMotionTimer += deltaTime;
      this.updateSlowMotionVisuals();

      // End slow-motion after duration
      if (this.slowMotionTimer >= SLOW_MOTION_DURATION) {
        this.slowMotionActive = false;
        this.slowMotionTimer = 0;
      }
    } else {
      // Smoothly return to normal zoom when not in slow-motion
      if (this.slowMotionZoom > 1.0) {
        this.slowMotionZoom = Math.max(1.0, this.slowMotionZoom - deltaTime * 2.0);
      }
    }
  }

  /**
   * Update slow-motion zoom and focus point interpolation
   */
  private updateSlowMotionVisuals(): void {
    const zoomInDuration = 0.5;
    const zoomOutStart = SLOW_MOTION_DURATION - 0.5;

    // Easing function for smooth zoom (ease-in-out)
    const easeInOutCubic = (t: number): number => {
      return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
    };

    if (this.slowMotionTimer < zoomInDuration) {
      // Zoom in with easing from starting zoom level
      const progress = this.slowMotionTimer / zoomInDuration;
      const easedProgress = easeInOutCubic(progress);
      this.slowMotionZoom = this.slowMotionZoomStart + (SLOW_MOTION_ZOOM_SCALE - this.slowMotionZoomStart) * easedProgress;

      // Interpolate focus point from center to target
      const startFocusX = this.canvasWidth / 2;
      const startFocusY = this.canvasHeight / 2;
      this.slowMotionFocusX = startFocusX + (this.slowMotionTargetFocusX - startFocusX) * easedProgress;
      this.slowMotionFocusY = startFocusY + (this.slowMotionTargetFocusY - startFocusY) * easedProgress;
    } else if (this.slowMotionTimer > zoomOutStart) {
      // Zoom out with easing back to 1.0
      const progress = (this.slowMotionTimer - zoomOutStart) / 0.5;
      const easedProgress = easeInOutCubic(progress);
      this.slowMotionZoom = SLOW_MOTION_ZOOM_SCALE - (SLOW_MOTION_ZOOM_SCALE - 1.0) * easedProgress;

      // Interpolate focus point back to center
      const startFocusX = this.canvasWidth / 2;
      const startFocusY = this.canvasHeight / 2;
      this.slowMotionFocusX = this.slowMotionTargetFocusX + (startFocusX - this.slowMotionTargetFocusX) * easedProgress;
      this.slowMotionFocusY = this.slowMotionTargetFocusY + (startFocusY - this.slowMotionTargetFocusY) * easedProgress;
    } else {
      // Hold at max zoom and target focus
      this.slowMotionZoom = SLOW_MOTION_ZOOM_SCALE;
      this.slowMotionFocusX = this.slowMotionTargetFocusX;
      this.slowMotionFocusY = this.slowMotionTargetFocusY;
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
   * Trigger slow-motion effect
   */
  triggerSlowMotion(canvasWidth: number, canvasHeight: number, targetFocusX: number, targetFocusY: number): void {
    this.slowMotionActive = true;
    this.slowMotionTimer = 0;
    this.slowMotionZoomStart = this.slowMotionZoom;
    this.canvasWidth = canvasWidth;
    this.canvasHeight = canvasHeight;
    
    // Start focus at screen center
    this.slowMotionFocusX = canvasWidth / 2;
    this.slowMotionFocusY = canvasHeight / 2;
    
    // Set target focus point
    this.slowMotionTargetFocusX = targetFocusX;
    this.slowMotionTargetFocusY = targetFocusY;
  }

  /**
   * Check if slow-motion is active
   */
  isSlowMotionActive(): boolean {
    return this.slowMotionActive;
  }

  /**
   * Apply slow-motion zoom transform to canvas context
   */
  applySlowMotionTransform(ctx: CanvasRenderingContext2D): void {
    if (this.slowMotionZoom > 1.001) {
      // Translate to focus point, scale, then translate back
      ctx.translate(this.canvasWidth / 2, this.canvasHeight / 2);
      ctx.scale(this.slowMotionZoom, this.slowMotionZoom);
      ctx.translate(-this.slowMotionFocusX, -this.slowMotionFocusY);
    }
  }

  /**
   * Render slow-motion overlay effect
   */
  renderSlowMotionOverlay(ctx: CanvasRenderingContext2D, canvasWidth: number, canvasHeight: number): void {
    if (!this.slowMotionActive) return;

    ctx.save();
    
    // Desaturate effect - slight blue tint
    ctx.globalAlpha = 0.15;
    ctx.fillStyle = '#0088ff';
    ctx.fillRect(0, 0, canvasWidth, canvasHeight);
    
    // Add motion blur effect with radial gradient
    const centerX = canvasWidth / 2;
    const centerY = canvasHeight / 2;
    const gradient = ctx.createRadialGradient(
      centerX, centerY, 0,
      centerX, centerY, Math.max(canvasWidth, canvasHeight) * 0.6
    );
    gradient.addColorStop(0, 'rgba(255, 255, 255, 0)');
    gradient.addColorStop(0.7, 'rgba(255, 255, 255, 0)');
    gradient.addColorStop(1, 'rgba(255, 255, 255, 0.05)');
    
    ctx.globalAlpha = 1;
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvasWidth, canvasHeight);
    
    ctx.restore();
  }

  /**
   * Reset slow-motion state
   */
  resetSlowMotion(): void {
    this.slowMotionActive = false;
    this.slowMotionTimer = 0;
    this.slowMotionZoom = 1.0;
  }

  /**
   * Clear all effects
   */
  clear(): void {
    this.damageNumbers = [];
    this.screenShake = { x: 0, y: 0, intensity: 0, duration: 0 };
    this.resetSlowMotion();
  }
}
