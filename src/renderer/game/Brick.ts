/**
 * Brick entity - represents a destructible brick in the game
 */

export class Brick {
  private position: { x: number; y: number };
  private readonly width: number;
  private readonly height: number;
  private health: number;
  private readonly maxHealth: number;
  private readonly customColor: string | null;

  constructor(
    x: number,
    y: number,
    width: number,
    height: number,
    health: number,
    color?: string
  ) {
    this.position = { x, y };
    this.width = width;
    this.height = height;
    this.health = health;
    this.maxHealth = health;
    this.customColor = color || null;
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
   */
  isDestroyed(): boolean {
    return this.health <= 0;
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
    // Otherwise, use health-based color
    return this.getColorByHealth();
  }

  /**
   * Get color based on current health percentage
   */
  private getColorByHealth(): string {
    const healthPercent = this.getHealthPercentage();
    
    if (healthPercent > 0.66) {
      return '#00ff00'; // Green - healthy
    } else if (healthPercent > 0.33) {
      return '#ffff00'; // Yellow - damaged
    } else if (healthPercent > 0) {
      return '#ff00ff'; // Magenta - critical
    } else {
      return '#666666'; // Gray - destroyed
    }
  }

  /**
   * Render the brick on the canvas with 3D beveled effect
   */
  render(ctx: CanvasRenderingContext2D): void {
    if (this.isDestroyed()) {
      return; // Don't render destroyed bricks
    }

    ctx.save();

    // Calculate opacity based on health
    const healthPercent = this.getHealthPercentage();
    const opacity = 0.3 + (healthPercent * 0.7); // 0.3 to 1.0

    const x = this.position.x;
    const y = this.position.y;
    const w = this.width;
    const h = this.height;
    const bevelSize = 3; // Size of bevel in pixels
    const color = this.getColor();

    // Draw glow effect (dystopian neon style)
    ctx.shadowBlur = 10;
    ctx.shadowColor = color;

    // Draw main brick face
    ctx.fillStyle = color;
    ctx.globalAlpha = opacity;
    ctx.fillRect(x, y, w, h);

    // Draw top bevel (lighter)
    ctx.globalAlpha = opacity * 0.8;
    ctx.fillStyle = this.lightenColor(color, 40);
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(x + w, y);
    ctx.lineTo(x + w - bevelSize, y + bevelSize);
    ctx.lineTo(x + bevelSize, y + bevelSize);
    ctx.closePath();
    ctx.fill();

    // Draw left bevel (lighter)
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(x + bevelSize, y + bevelSize);
    ctx.lineTo(x + bevelSize, y + h - bevelSize);
    ctx.lineTo(x, y + h);
    ctx.closePath();
    ctx.fill();

    // Draw bottom bevel (darker)
    ctx.fillStyle = this.darkenColor(color, 40);
    ctx.beginPath();
    ctx.moveTo(x, y + h);
    ctx.lineTo(x + bevelSize, y + h - bevelSize);
    ctx.lineTo(x + w - bevelSize, y + h - bevelSize);
    ctx.lineTo(x + w, y + h);
    ctx.closePath();
    ctx.fill();

    // Draw right bevel (darker)
    ctx.beginPath();
    ctx.moveTo(x + w, y);
    ctx.lineTo(x + w, y + h);
    ctx.lineTo(x + w - bevelSize, y + h - bevelSize);
    ctx.lineTo(x + w - bevelSize, y + bevelSize);
    ctx.closePath();
    ctx.fill();

    // Draw border for definition
    ctx.globalAlpha = 1;
    ctx.strokeStyle = color;
    ctx.lineWidth = 2;
    ctx.strokeRect(x, y, w, h);

    ctx.restore();
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
