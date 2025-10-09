/**
 * Button component for UI screens
 */

import {
  BUTTON_COLOR_NORMAL,
  BUTTON_COLOR_HOVERED,
  BUTTON_GLOW_NORMAL,
  BUTTON_GLOW_HOVERED,
  BUTTON_BORDER_WIDTH,
  BUTTON_FONT_SIZE,
  BUTTON_FONT_FAMILY,
} from '../config/constants';

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
    const glowColor = this.isHovered ? BUTTON_COLOR_HOVERED : BUTTON_COLOR_NORMAL;
    ctx.shadowBlur = this.isHovered ? BUTTON_GLOW_HOVERED : BUTTON_GLOW_NORMAL;
    ctx.shadowColor = glowColor;

    // Draw border
    ctx.strokeStyle = glowColor;
    ctx.lineWidth = BUTTON_BORDER_WIDTH;
    ctx.strokeRect(this.x, this.y, this.width, this.height);

    // Draw text
    ctx.fillStyle = glowColor;
    ctx.font = `${BUTTON_FONT_SIZE}px ${BUTTON_FONT_FAMILY}`;
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
