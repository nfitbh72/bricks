/**
 * Base class for UI screens
 */

import { Button } from './Button';

export abstract class Screen {
  protected canvas: HTMLCanvasElement;
  protected ctx: CanvasRenderingContext2D;
  protected buttons: Button[] = [];

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    const context = canvas.getContext('2d');
    if (!context) {
      throw new Error('Could not get 2D context from canvas');
    }
    this.ctx = context;
  }

  /**
   * Handle mouse move for button hover effects
   */
  handleMouseMove(x: number, y: number): void {
    for (const button of this.buttons) {
      button.setHovered(button.containsPoint(x, y));
    }
  }

  /**
   * Handle mouse click
   */
  handleClick(x: number, y: number): void {
    for (const button of this.buttons) {
      if (button.containsPoint(x, y)) {
        button.click();
        break;
      }
    }
  }

  /**
   * Handle key press
   */
  abstract handleKeyPress(key: string): void;

  /**
   * Render the screen
   */
  abstract render(): void;

  /**
   * Get buttons (for testing)
   */
  getButtons(): Button[] {
    return this.buttons;
  }
}
