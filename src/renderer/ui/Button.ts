/**
 * Button component for UI screens
 */

export interface ButtonConfig {
  x: number;
  y: number;
  width: number;
  height: number;
  text: string;
  onClick: () => void;
}

export class Button {
  private x: number;
  private y: number;
  private width: number;
  private height: number;
  private text: string;
  private onClick: () => void;
  private isHovered: boolean = false;

  constructor(config: ButtonConfig) {
    this.x = config.x;
    this.y = config.y;
    this.width = config.width;
    this.height = config.height;
    this.text = config.text;
    this.onClick = config.onClick;
  }

  /**
   * Check if point is inside button
   */
  containsPoint(x: number, y: number): boolean {
    return (
      x >= this.x &&
      x <= this.x + this.width &&
      y >= this.y &&
      y <= this.y + this.height
    );
  }

  /**
   * Set hover state
   */
  setHovered(hovered: boolean): void {
    this.isHovered = hovered;
  }

  /**
   * Handle click
   */
  click(): void {
    this.onClick();
  }

  /**
   * Render button
   */
  render(ctx: CanvasRenderingContext2D): void {
    ctx.save();

    // Neon glow effect
    const glowColor = this.isHovered ? '#00ffff' : '#ff00ff';
    ctx.shadowBlur = this.isHovered ? 30 : 15;
    ctx.shadowColor = glowColor;

    // Draw border
    ctx.strokeStyle = glowColor;
    ctx.lineWidth = 3;
    ctx.strokeRect(this.x, this.y, this.width, this.height);

    // Draw text
    ctx.fillStyle = glowColor;
    ctx.font = '32px "D Day Stencil", Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(this.text, this.x + this.width / 2, this.y + this.height / 2);

    ctx.restore();
  }

  /**
   * Get button bounds
   */
  getBounds(): { x: number; y: number; width: number; height: number } {
    return {
      x: this.x,
      y: this.y,
      width: this.width,
      height: this.height,
    };
  }
}
