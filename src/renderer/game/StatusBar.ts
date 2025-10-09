/**
 * StatusBar - displays level info at the bottom of the screen
 */

import { BRICK_HEIGHT } from '../config/constants';

export class StatusBar {
  private readonly x: number;
  private readonly y: number;
  private readonly width: number;
  private readonly height: number;
  private levelTitle: string;
  private playerHealth: number;
  private remainingBricks: number;
  private totalBricks: number;
  private levelTime: number;

  constructor(canvasWidth: number, canvasHeight: number) {
    this.x = 0;
    this.y = canvasHeight - (BRICK_HEIGHT * 2);
    this.width = canvasWidth;
    this.height = BRICK_HEIGHT * 2;
    this.levelTitle = '';
    this.playerHealth = 0;
    this.remainingBricks = 0;
    this.totalBricks = 0;
    this.levelTime = 0;
  }

  /**
   * Set the level title to display
   */
  setLevelTitle(title: string): void {
    this.levelTitle = title;
  }

  /**
   * Set player health (for hearts display)
   */
  setPlayerHealth(health: number): void {
    this.playerHealth = health;
  }

  /**
   * Set brick counts
   */
  setBrickCounts(remaining: number, total: number): void {
    this.remainingBricks = remaining;
    this.totalBricks = total;
  }

  /**
   * Set level time in seconds
   */
  setLevelTime(time: number): void {
    this.levelTime = time;
  }

  /**
   * Get level time in seconds
   */
  getLevelTime(): number {
    return this.levelTime;
  }

  /**
   * Format time as MM:SS
   */
  private formatTime(seconds: number): string {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  }

  /**
   * Get the Y position of the status bar (for collision detection)
   */
  getY(): number {
    return this.y;
  }

  /**
   * Get the height of the status bar
   */
  getHeight(): number {
    return this.height;
  }

  /**
   * Render the status bar
   */
  render(ctx: CanvasRenderingContext2D): void {
    // Draw background bar - dark dystopian background
    ctx.fillStyle = '#0a0a0a';
    ctx.fillRect(this.x, this.y, this.width, this.height);

    // Draw top border with glowing effect
    ctx.strokeStyle = '#00ff00';
    ctx.lineWidth = 1;
    ctx.shadowBlur = 5;
    ctx.shadowColor = '#00ff00';
    ctx.beginPath();
    ctx.moveTo(this.x, this.y);
    ctx.lineTo(this.x + this.width, this.y);
    ctx.stroke();
    ctx.shadowBlur = 0;

    const centerY = this.y + this.height / 2;
    const statusFont = '24px "D Day Stencil", Arial';
    const heartFont = '28px "D Day Stencil", Arial';

    // Draw hearts on the left with magenta glow
    ctx.fillStyle = '#ff00ff';
    ctx.font = heartFont;
    ctx.textAlign = 'left';
    ctx.textBaseline = 'middle';
    ctx.shadowBlur = 12;
    ctx.shadowColor = '#ff00ff';
    const hearts = '♥'.repeat(Math.max(0, this.playerHealth));
    ctx.fillText(hearts, 15, centerY);
    ctx.shadowBlur = 0;

    // Draw timer left of center with yellow glow
    ctx.fillStyle = '#ffff00';
    ctx.font = statusFont;
    ctx.textAlign = 'right';
    ctx.textBaseline = 'middle';
    ctx.shadowBlur = 10;
    ctx.shadowColor = '#ffff00';
    const timeText = this.formatTime(this.levelTime);
    ctx.fillText(timeText, this.width / 2 - 120, centerY);
    ctx.shadowBlur = 0;

    // Draw brick count left of center with cyan glow
    ctx.fillStyle = '#00ffff';
    ctx.font = statusFont;
    ctx.textAlign = 'left';
    ctx.textBaseline = 'middle';
    ctx.shadowBlur = 10;
    ctx.shadowColor = '#00ffff';
    const brickText = `[${this.remainingBricks}/${this.totalBricks}]`;
    ctx.fillText(brickText, this.width / 2 + 120, centerY);
    ctx.shadowBlur = 0;

    // Draw level title centered with green glow
    if (this.levelTitle) {
      ctx.fillStyle = '#00ff00';
      ctx.font = statusFont;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.shadowBlur = 10;
      ctx.shadowColor = '#00ff00';
      ctx.fillText(this.levelTitle.toUpperCase(), this.width / 2, centerY);
      ctx.shadowBlur = 0;
    }
  }
}
