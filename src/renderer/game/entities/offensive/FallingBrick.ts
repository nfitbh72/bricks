/**
 * FallingBrick entity - represents a brick that falls when destroyed
 * Accelerates downward due to gravity and damages the bat on contact
 */

import { FALLING_BRICK_GRAVITY, BRICK_WIDTH, BRICK_HEIGHT, BRICK_GLOW_BLUR } from '../../../config/constants';

export class FallingBrick {
  private position: { x: number; y: number };
  private velocity: { x: number; y: number };
  private readonly width: number = BRICK_WIDTH;
  private readonly height: number = BRICK_HEIGHT;
  private readonly color: string;
  private active: boolean = true;
  private rotation: number = 0; // Rotation angle in radians
  private rotationSpeed: number; // Radians per second

  constructor(x: number, y: number, color: string) {
    this.position = { x, y };
    this.velocity = { x: 0, y: 0 }; // Starts stationary, gravity will accelerate it
    this.color = color;
    // Random rotation speed between -3 and 3 radians per second
    this.rotationSpeed = (Math.random() - 0.5) * 6;
  }

  /**
   * Update falling brick position with gravity and rotation
   */
  update(deltaTime: number): void {
    if (!this.active) return;

    // Apply gravity
    this.velocity.y += FALLING_BRICK_GRAVITY * deltaTime;

    // Update position
    this.position.x += this.velocity.x * deltaTime;
    this.position.y += this.velocity.y * deltaTime;

    // Update rotation
    this.rotation += this.rotationSpeed * deltaTime;
  }

  /**
   * Render the falling brick with rotation and rounded corners
   */
  render(ctx: CanvasRenderingContext2D): void {
    if (!this.active) return;

    ctx.save();

    const w = this.width;
    const h = this.height;
    const centerX = this.position.x + w / 2;
    const centerY = this.position.y + h / 2;

    // Translate to center and rotate
    ctx.translate(centerX, centerY);
    ctx.rotate(this.rotation);
    ctx.translate(-w / 2, -h / 2);

    // Draw glow effect
    ctx.shadowBlur = BRICK_GLOW_BLUR;
    ctx.shadowColor = this.color;

    // Create gradient for 3D effect
    const gradient = ctx.createLinearGradient(0, 0, w, h);
    gradient.addColorStop(0, this.lightenColor(this.color, 30));
    gradient.addColorStop(0.5, this.color);
    gradient.addColorStop(1, this.darkenColor(this.color, 30));

    // Draw brick with gradient and rounded corners
    const cornerRadius = 3;
    ctx.fillStyle = gradient;
    
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
    ctx.strokeStyle = this.color;
    ctx.lineWidth = 2;
    ctx.stroke();

    // Draw inner glow for depth
    ctx.shadowBlur = 0;
    ctx.strokeStyle = this.lightenColor(this.color, 50);
    ctx.lineWidth = 1;
    ctx.globalAlpha = 0.6;
    
    const innerPadding = 2;
    ctx.beginPath();
    ctx.moveTo(cornerRadius + innerPadding, innerPadding);
    ctx.lineTo(w - cornerRadius - innerPadding, innerPadding);
    ctx.arcTo(w - innerPadding, innerPadding, w - innerPadding, cornerRadius + innerPadding, cornerRadius);
    ctx.lineTo(w - innerPadding, h - cornerRadius - innerPadding);
    ctx.arcTo(w - innerPadding, h - innerPadding, w - cornerRadius - innerPadding, h - innerPadding, cornerRadius);
    ctx.lineTo(cornerRadius + innerPadding, h - innerPadding);
    ctx.arcTo(innerPadding, h - innerPadding, innerPadding, h - cornerRadius - innerPadding, cornerRadius);
    ctx.lineTo(innerPadding, cornerRadius + innerPadding);
    ctx.arcTo(innerPadding, innerPadding, cornerRadius + innerPadding, innerPadding, cornerRadius);
    ctx.closePath();
    ctx.stroke();

    ctx.restore();
  }

  /**
   * Get brick bounds for collision detection
   */
  getBounds(): { x: number; y: number; width: number; height: number } {
    return {
      x: this.position.x,
      y: this.position.y,
      width: this.width,
      height: this.height,
    };
  }

  /**
   * Get brick position
   */
  getPosition(): { x: number; y: number } {
    return { ...this.position };
  }

  /**
   * Get brick color
   */
  getColor(): string {
    return this.color;
  }

  /**
   * Check if brick is active
   */
  isActive(): boolean {
    return this.active;
  }

  /**
   * Deactivate the brick (after collision)
   */
  deactivate(): void {
    this.active = false;
  }

  /**
   * Check if brick is off screen (below bottom)
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

  /**
   * Darken a hex color
   */
  private darkenColor(color: string, percent: number): string {
    const num = parseInt(color.replace('#', ''), 16);
    const r = Math.max(0, ((num >> 16) & 0xff) - percent);
    const g = Math.max(0, ((num >> 8) & 0xff) - percent);
    const b = Math.max(0, (num & 0xff) - percent);
    return `#${((r << 16) | (g << 8) | b).toString(16).padStart(6, '0')}`;
  }
}
