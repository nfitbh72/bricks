/**
 * Brick entity - represents a destructible brick in the game
 */

import { BrickConfig } from '../core/types';
import { BrickType } from '../core/types';
import { 
  BRICK_WIDTH, 
  BRICK_HEIGHT, 
  BRICK_GLOW_BLUR,
  OFFENSIVE_BRICK_COLOR_FALLING,
  OFFENSIVE_BRICK_COLOR_EXPLODING,
  OFFENSIVE_BRICK_COLOR_LASER
} from '../../config/constants';
import { gridToPixel } from '../../config/brickLayout';

export class Brick {
  private position: { x: number; y: number };
  private readonly width: number = BRICK_WIDTH;
  private readonly height: number = BRICK_HEIGHT;
  private health: number;
  private readonly maxHealth: number;
  private readonly type: BrickType;
  private readonly customColor: string | null;

  /**
   * Calculate health multiplier for brick type
   * Indestructible bricks use Infinity to represent unlimited health
   */
  private static readonly BRICK_TYPE_MULTIPLIER: Record<BrickType, number> = {
    [BrickType.NORMAL]: 1,
    [BrickType.HEALTHY]: 3,
    [BrickType.INDESTRUCTIBLE]: Infinity,
    [BrickType.OFFENSIVE_FALLING]: 1,
    [BrickType.OFFENSIVE_EXPLODING]: 1,
    [BrickType.OFFENSIVE_LASER]: 1,
    [BrickType.OFFENSIVE_HOMING]: 1,
  };

  /**
   * Neon color palette (16 colors)
   * Colors are indexed by health % 16
   */
  private static readonly NEON_COLORS: string[] = [
    '#ff00ff', // Magenta
    '#00ffff', // Cyan
    '#00ff00', // Green
    '#ffff00', // Yellow
    '#ff0080', // Hot Pink
    '#0080ff', // Sky Blue
    '#80ff00', // Lime
    '#ff8000', // Orange
    '#ff0040', // Red-Pink
    '#00ff80', // Spring Green
    '#8000ff', // Purple
    '#ff00c0', // Rose
    '#00c0ff', // Light Blue
    '#c0ff00', // Yellow-Green
    '#ff4000', // Red-Orange
    '#40ff00', // Bright Green
  ];

  constructor(config: BrickConfig, baseHealth: number = 1) {
    // Convert grid coordinates to pixel coordinates
    const pixelPos = gridToPixel(config.col, config.row);
    this.position = pixelPos;
    this.type = config.type;
    
    // Calculate health: baseHealth * type multiplier
    const multiplier = Brick.BRICK_TYPE_MULTIPLIER[config.type];
    this.maxHealth = baseHealth * multiplier;
    this.health = this.maxHealth;
    
    this.customColor = config.color || null;
  }

  /**
   * Reduce brick health by damage amount
   */
  takeDamage(amount: number): void {
    this.health -= amount;
    if (this.health < 0) {
      this.health = 0;
    }
  }

  /**
   * Check if brick is destroyed (health <= 0)
   * Indestructible bricks are never destroyed
   */
  isDestroyed(): boolean {
    return this.health <= 0;
  }

  /**
   * Check if brick is indestructible
   */
  isIndestructible(): boolean {
    return this.type === BrickType.INDESTRUCTIBLE;
  }

  /**
   * Check if brick is an offensive type
   */
  isOffensive(): boolean {
    return (
      this.type === BrickType.OFFENSIVE_FALLING ||
      this.type === BrickType.OFFENSIVE_EXPLODING ||
      this.type === BrickType.OFFENSIVE_LASER
    );
  }

  /**
   * Get brick type
   */
  getType(): BrickType {
    return this.type;
  }

  /**
   * Get current health
   */
  getHealth(): number {
    return this.health;
  }

  /**
   * Get maximum health
   */
  getMaxHealth(): number {
    return this.maxHealth;
  }

  /**
   * Get health as a percentage (0-1)
   */
  getHealthPercentage(): number {
    return this.health / this.maxHealth;
  }

  /**
   * Get brick position
   */
  getPosition(): { x: number; y: number } {
    return { ...this.position };
  }

  /**
   * Get brick width
   */
  getWidth(): number {
    return this.width;
  }

  /**
   * Get brick height
   */
  getHeight(): number {
    return this.height;
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
   * Get brick color based on health percentage
   */
  getColor(): string {
    // If custom color was provided, always use it
    if (this.customColor) {
      return this.customColor;
    }
    // Offensive bricks have distinct warning colors
    if (this.isOffensive()) {
      return this.getOffensiveColor();
    }
    // Otherwise, use health-based color
    return this.getColorByHealth();
  }

  /**
   * Get color for offensive brick types
   */
  private getOffensiveColor(): string {
    switch (this.type) {
      case BrickType.OFFENSIVE_FALLING:
        return OFFENSIVE_BRICK_COLOR_FALLING;
      case BrickType.OFFENSIVE_EXPLODING:
        return OFFENSIVE_BRICK_COLOR_EXPLODING;
      case BrickType.OFFENSIVE_LASER:
        return OFFENSIVE_BRICK_COLOR_LASER;
      default:
        return '#ffffff';
    }
  }

  /**
   * Get color based on current health using neon palette
   */
  private getColorByHealth(): string {
    if (this.health <= 0) {
      return '#666666'; // Gray - destroyed
    }
    
    // Indestructible bricks have a special metallic gray color
    if (this.isIndestructible()) {
      return '#888888'; // Metallic gray
    }
    
    // Use health modulo 16 to index into neon color palette
    // Floor the health to handle fractional damage (e.g., from lasers)
    const colorIndex = Math.round(this.health) % 16;
    return Brick.NEON_COLORS[colorIndex];
  }

  /**
   * Render the brick on the canvas with optimized 3D effect
   */
  render(ctx: CanvasRenderingContext2D): void {
    if (this.isDestroyed()) {
      return; // Don't render destroyed bricks
    }

    ctx.save();

    // Calculate opacity based on health
    // Indestructible bricks always render at full opacity
    const healthPercent = this.getHealthPercentage();
    const opacity = this.isIndestructible() ? 1.0 : 0.3 + (healthPercent * 0.7); // 0.3 to 1.0

    const x = this.position.x;
    const y = this.position.y;
    const w = this.width;
    const h = this.height;
    const color = this.getColor();

    // Draw glow effect (dystopian neon style)
    ctx.shadowBlur = BRICK_GLOW_BLUR;
    ctx.shadowColor = color;

    // Create gradient for 3D effect (top-left to bottom-right)
    const gradient = ctx.createLinearGradient(x, y, x + w, y + h);
    gradient.addColorStop(0, this.lightenColor(color, 30));
    gradient.addColorStop(0.5, color);
    gradient.addColorStop(1, this.darkenColor(color, 30));

    // Draw brick with gradient
    ctx.fillStyle = gradient;
    ctx.globalAlpha = opacity;
    ctx.fillRect(x, y, w, h);

    // Draw border for definition
    ctx.globalAlpha = 1;
    ctx.strokeStyle = color;
    ctx.lineWidth = 2;
    ctx.strokeRect(x, y, w, h);

    // Draw health text (skip for indestructible bricks)
    if (!this.isIndestructible()) {
      ctx.shadowBlur = 0; // Remove shadow for text
      ctx.fillStyle = '#000000';
      ctx.font = '12px "Courier New", monospace';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      
      // Display health rounded to 1 decimal place if fractional, otherwise as integer
      const healthText = this.health % 1 === 0 
        ? this.health.toString() 
        : this.health.toFixed(1);
      
      ctx.fillText(healthText, x + w / 2, y + h / 2);
    }

    ctx.restore();
  }

  /**
   * Lighten a hex color (cached for performance)
   */
  private lightenColor(color: string, percent: number): string {
    const num = parseInt(color.replace('#', ''), 16);
    const r = Math.min(255, ((num >> 16) & 0xff) + percent);
    const g = Math.min(255, ((num >> 8) & 0xff) + percent);
    const b = Math.min(255, (num & 0xff) + percent);
    return `#${((r << 16) | (g << 8) | b).toString(16).padStart(6, '0')}`;
  }

  /**
   * Darken a hex color (cached for performance)
   */
  private darkenColor(color: string, percent: number): string {
    const num = parseInt(color.replace('#', ''), 16);
    const r = Math.max(0, ((num >> 16) & 0xff) - percent);
    const g = Math.max(0, ((num >> 8) & 0xff) - percent);
    const b = Math.max(0, (num & 0xff) - percent);
    return `#${((r << 16) | (g << 8) | b).toString(16).padStart(6, '0')}`;
  }

  /**
   * Restore brick to full health (for testing/power-ups)
   */
  restore(): void {
    this.health = this.maxHealth;
  }

  /**
   * Set health directly (for testing)
   */
  setHealth(health: number): void {
    this.health = Math.max(0, Math.min(health, this.maxHealth));
  }
}
