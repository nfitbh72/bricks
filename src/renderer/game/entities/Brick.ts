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
  OFFENSIVE_BRICK_COLOR_LASER,
  OFFENSIVE_BRICK_COLOR_BOMB,
  OFFENSIVE_BRICK_COLOR_DYNAMITE,
  FONT_MONO_BRICK,
  COLOR_MAGENTA,
  COLOR_CYAN,
  COLOR_GREEN,
  COLOR_YELLOW,
  COLOR_HOT_PINK,
  COLOR_SKY_BLUE,
  COLOR_LIME,
  COLOR_ORANGE,
  COLOR_RED_PINK,
  COLOR_SPRING_GREEN,
  COLOR_PURPLE,
  COLOR_ROSE,
  COLOR_LIGHT_BLUE,
  COLOR_YELLOW_GREEN,
  COLOR_RED_ORANGE,
  COLOR_BRIGHT_GREEN,
  COLOR_WHITE,
  COLOR_TEXT_GRAY,
  COLOR_METALLIC_GRAY,
  COLOR_BLACK,
} from '../../config/constants';
import { gridToPixel } from '../../config/brickLayout';

export interface BrickDestructionInfo {
  wasDestroyed: boolean;
  justDestroyed: boolean;
  centerX: number;
  centerY: number;
}

export class Brick {
  private position: { x: number; y: number };
  private readonly width: number = BRICK_WIDTH;
  private readonly height: number = BRICK_HEIGHT;
  private health: number;
  private readonly maxHealth: number;
  private readonly type: BrickType;
  private readonly customColor: string | null;
  private onDestroyCallback?: (brick: Brick, info: BrickDestructionInfo) => void;

  // Static cache for rendered brick images
  private static renderCache: Map<string, HTMLCanvasElement> = new Map();
  private static cacheEnabled: boolean = true;

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
    [BrickType.OFFENSIVE_SPLITTING]: 1,
    [BrickType.OFFENSIVE_BOMB]: 1,
    [BrickType.OFFENSIVE_DYNAMITE]: 1,
    [BrickType.BOSS_1]: 10,
  };

  /**
   * Neon color palette for bricks
   * Colors are indexed by health % 16
   */
  private static readonly NEON_COLORS: string[] = [
    COLOR_MAGENTA,        // Magenta
    COLOR_CYAN,           // Cyan
    COLOR_GREEN,          // Green
    COLOR_YELLOW,         // Yellow
    COLOR_HOT_PINK,       // Hot Pink
    COLOR_SKY_BLUE,       // Sky Blue
    COLOR_LIME,           // Lime
    COLOR_ORANGE,         // Orange
    COLOR_RED_PINK,       // Red-Pink
    COLOR_SPRING_GREEN,   // Spring Green
    COLOR_PURPLE,         // Purple
    COLOR_ROSE,           // Rose
    COLOR_LIGHT_BLUE,     // Light Blue
    COLOR_YELLOW_GREEN,   // Yellow-Green
    COLOR_RED_ORANGE,     // Red-Orange
    COLOR_BRIGHT_GREEN,   // Bright Green
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
   * Returns destruction info and triggers onDestroy callback if brick was just destroyed
   */
  takeDamage(amount: number): BrickDestructionInfo {
    const wasDestroyed = this.isDestroyed();
    this.health -= amount;
    if (this.health < 0) {
      this.health = 0;
    }
    const justDestroyed = !wasDestroyed && this.isDestroyed();
    
    const bounds = this.getBounds();
    const info: BrickDestructionInfo = {
      wasDestroyed,
      justDestroyed,
      centerX: bounds.x + bounds.width / 2,
      centerY: bounds.y + bounds.height / 2,
    };
    
    // Trigger destruction callback if brick was just destroyed
    if (justDestroyed && this.onDestroyCallback) {
      this.onDestroyCallback(this, info);
    }
    
    return info;
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
      this.type === BrickType.OFFENSIVE_LASER ||
      this.type === BrickType.OFFENSIVE_HOMING ||
      this.type === BrickType.OFFENSIVE_SPLITTING ||
      this.type === BrickType.OFFENSIVE_BOMB ||
      this.type === BrickType.OFFENSIVE_DYNAMITE
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
      case BrickType.OFFENSIVE_BOMB:
        return OFFENSIVE_BRICK_COLOR_BOMB;
      case BrickType.OFFENSIVE_DYNAMITE:
        return OFFENSIVE_BRICK_COLOR_DYNAMITE;
      default:
        return COLOR_WHITE;
    }
  }

  /**
   * Get color based on current health using neon palette
   */
  private getColorByHealth(): string {
    if (this.health <= 0) {
      return COLOR_TEXT_GRAY; // Gray - destroyed
    }
    
    // Indestructible bricks have a special metallic gray color
    if (this.isIndestructible()) {
      return COLOR_METALLIC_GRAY; // Metallic gray
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

    // Use cached rendering if available and in browser environment
    if (Brick.cacheEnabled && typeof document !== 'undefined') {
      const cacheKey = this.getCacheKey();
      let cachedCanvas = Brick.renderCache.get(cacheKey);
      
      if (!cachedCanvas) {
        cachedCanvas = this.renderToCache();
        Brick.renderCache.set(cacheKey, cachedCanvas);
      }
      
      // Draw cached image with opacity
      ctx.globalAlpha = opacity;
      ctx.drawImage(cachedCanvas, x, y);
      ctx.restore();
      return;
    }

    // Draw glow effect (dystopian neon style)
    ctx.shadowBlur = BRICK_GLOW_BLUR;
    ctx.shadowColor = color;

    // Create gradient for 3D effect (top-left to bottom-right)
    const gradient = ctx.createLinearGradient(x, y, x + w, y + h);
    gradient.addColorStop(0, this.lightenColor(color, 30));
    gradient.addColorStop(0.5, color);
    gradient.addColorStop(1, this.darkenColor(color, 30));

    // Draw brick with gradient and rounded corners
    const cornerRadius = 3; // Small radius for subtle rounding
    ctx.fillStyle = gradient;
    ctx.globalAlpha = opacity;
    
    // Draw rounded rectangle
    ctx.beginPath();
    ctx.moveTo(x + cornerRadius, y);
    ctx.lineTo(x + w - cornerRadius, y);
    ctx.arcTo(x + w, y, x + w, y + cornerRadius, cornerRadius);
    ctx.lineTo(x + w, y + h - cornerRadius);
    ctx.arcTo(x + w, y + h, x + w - cornerRadius, y + h, cornerRadius);
    ctx.lineTo(x + cornerRadius, y + h);
    ctx.arcTo(x, y + h, x, y + h - cornerRadius, cornerRadius);
    ctx.lineTo(x, y + cornerRadius);
    ctx.arcTo(x, y, x + cornerRadius, y, cornerRadius);
    ctx.closePath();
    ctx.fill();

    // Draw outer border for definition
    ctx.globalAlpha = 1;
    ctx.strokeStyle = color;
    ctx.lineWidth = 2;
    ctx.stroke();

    // Draw inner glow for depth (lighter border inside)
    ctx.shadowBlur = 0; // Remove outer glow for inner border
    ctx.strokeStyle = this.lightenColor(color, 50);
    ctx.lineWidth = 1;
    ctx.globalAlpha = 0.6;
    
    // Draw inner rounded rectangle (slightly smaller)
    const innerPadding = 2;
    ctx.beginPath();
    ctx.moveTo(x + cornerRadius + innerPadding, y + innerPadding);
    ctx.lineTo(x + w - cornerRadius - innerPadding, y + innerPadding);
    ctx.arcTo(x + w - innerPadding, y + innerPadding, x + w - innerPadding, y + cornerRadius + innerPadding, cornerRadius);
    ctx.lineTo(x + w - innerPadding, y + h - cornerRadius - innerPadding);
    ctx.arcTo(x + w - innerPadding, y + h - innerPadding, x + w - cornerRadius - innerPadding, y + h - innerPadding, cornerRadius);
    ctx.lineTo(x + cornerRadius + innerPadding, y + h - innerPadding);
    ctx.arcTo(x + innerPadding, y + h - innerPadding, x + innerPadding, y + h - cornerRadius - innerPadding, cornerRadius);
    ctx.lineTo(x + innerPadding, y + cornerRadius + innerPadding);
    ctx.arcTo(x + innerPadding, y + innerPadding, x + cornerRadius + innerPadding, y + innerPadding, cornerRadius);
    ctx.closePath();
    ctx.stroke();

    // Draw health text (skip for indestructible bricks)
    if (!this.isIndestructible()) {
      ctx.shadowBlur = 0; // Remove shadow for text
      ctx.fillStyle = COLOR_BLACK;
      ctx.font = FONT_MONO_BRICK;
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
   * Generate cache key for this brick's appearance
   */
  private getCacheKey(): string {
    const color = this.getColor();
    const healthText = this.isIndestructible() ? 'I' : 
      (this.health % 1 === 0 ? this.health.toString() : this.health.toFixed(1));
    return `${color}_${healthText}_${this.isIndestructible()}`;
  }

  /**
   * Render brick to an offscreen canvas for caching
   */
  private renderToCache(): HTMLCanvasElement {
    const canvas = document.createElement('canvas');
    canvas.width = this.width;
    canvas.height = this.height;
    const ctx = canvas.getContext('2d');
    if (!ctx) {
      throw new Error('Failed to get 2D context for brick cache');
    }

    const w = this.width;
    const h = this.height;
    const color = this.getColor();

    // Draw glow effect (dystopian neon style)
    ctx.shadowBlur = BRICK_GLOW_BLUR;
    ctx.shadowColor = color;

    // Create gradient for 3D effect (top-left to bottom-right)
    const gradient = ctx.createLinearGradient(0, 0, w, h);
    gradient.addColorStop(0, this.lightenColor(color, 30));
    gradient.addColorStop(0.5, color);
    gradient.addColorStop(1, this.darkenColor(color, 30));

    // Draw brick with gradient and rounded corners
    const cornerRadius = 3;
    ctx.fillStyle = gradient;
    
    // Draw rounded rectangle
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

    // Draw outer border for definition
    ctx.globalAlpha = 1;
    ctx.strokeStyle = color;
    ctx.lineWidth = 2;
    ctx.stroke();

    // Draw inner glow for depth (lighter border inside)
    ctx.shadowBlur = 0;
    ctx.strokeStyle = this.lightenColor(color, 50);
    ctx.lineWidth = 1;
    ctx.globalAlpha = 0.6;
    
    // Draw inner rounded rectangle (slightly smaller)
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

    // Draw health text (skip for indestructible bricks)
    if (!this.isIndestructible()) {
      ctx.shadowBlur = 0;
      ctx.globalAlpha = 1;
      ctx.fillStyle = COLOR_BLACK;
      ctx.font = FONT_MONO_BRICK;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      
      const healthText = this.health % 1 === 0 
        ? this.health.toString() 
        : this.health.toFixed(1);
      
      ctx.fillText(healthText, w / 2, h / 2);
    }

    return canvas;
  }

  /**
   * Clear the render cache (useful when changing levels or resetting)
   */
  static clearRenderCache(): void {
    Brick.renderCache.clear();
  }

  /**
   * Enable or disable render caching
   */
  static setRenderCacheEnabled(enabled: boolean): void {
    Brick.cacheEnabled = enabled;
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

  /**
   * Set callback to be triggered when brick is destroyed
   */
  setOnDestroyCallback(callback: (brick: Brick, info: BrickDestructionInfo) => void): void {
    this.onDestroyCallback = callback;
  }
}
