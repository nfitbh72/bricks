/**
 * StatusBar - displays level info at the bottom of the screen
 */

import {
  BRICK_HEIGHT,
  STATUSBAR_BACKGROUND_COLOR,
  STATUSBAR_BORDER_COLOR,
  STATUSBAR_BORDER_WIDTH,
  STATUSBAR_BORDER_GLOW,
  STATUSBAR_FONT_FAMILY,
  STATUSBAR_FONT_SIZE_NORMAL,
  STATUSBAR_FONT_SIZE_HEARTS,
  STATUSBAR_TEXT_GLOW,
  STATUSBAR_HEARTS_GLOW,
  STATUSBAR_HEARTS_PADDING,
  STATUSBAR_ITEM_OFFSET,
  STATUSBAR_COLOR_HEARTS,
  STATUSBAR_COLOR_TIMER,
  STATUSBAR_COLOR_BRICKS,
  STATUSBAR_COLOR_TITLE,
} from '../config/constants';

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
    ctx.fillStyle = STATUSBAR_BACKGROUND_COLOR;
    ctx.fillRect(this.x, this.y, this.width, this.height);

    // Draw top border with glowing effect
    ctx.strokeStyle = STATUSBAR_BORDER_COLOR;
    ctx.lineWidth = STATUSBAR_BORDER_WIDTH;
    ctx.shadowBlur = STATUSBAR_BORDER_GLOW;
    ctx.shadowColor = STATUSBAR_BORDER_COLOR;
    ctx.beginPath();
    ctx.moveTo(this.x, this.y);
    ctx.lineTo(this.x + this.width, this.y);
    ctx.stroke();
    ctx.shadowBlur = 0;

    const centerY = this.y + this.height / 2;
    const statusFont = `${STATUSBAR_FONT_SIZE_NORMAL}px ${STATUSBAR_FONT_FAMILY}`;
    const heartFont = `${STATUSBAR_FONT_SIZE_HEARTS}px ${STATUSBAR_FONT_FAMILY}`;

    // Draw hearts on the left with magenta glow
    ctx.fillStyle = STATUSBAR_COLOR_HEARTS;
    ctx.font = heartFont;
    ctx.textAlign = 'left';
    ctx.textBaseline = 'middle';
    ctx.shadowBlur = STATUSBAR_HEARTS_GLOW;
    ctx.shadowColor = STATUSBAR_COLOR_HEARTS;
    const hearts = '♥'.repeat(Math.max(0, this.playerHealth));
    ctx.fillText(hearts, STATUSBAR_HEARTS_PADDING, centerY);
    ctx.shadowBlur = 0;

    // Draw timer left of center with yellow glow
    ctx.fillStyle = STATUSBAR_COLOR_TIMER;
    ctx.font = statusFont;
    ctx.textAlign = 'right';
    ctx.textBaseline = 'middle';
    ctx.shadowBlur = STATUSBAR_TEXT_GLOW;
    ctx.shadowColor = STATUSBAR_COLOR_TIMER;
    const timeText = this.formatTime(this.levelTime);
    ctx.fillText(timeText, this.width / 2 - STATUSBAR_ITEM_OFFSET, centerY);
    ctx.shadowBlur = 0;

    // Draw brick count left of center with cyan glow
    ctx.fillStyle = STATUSBAR_COLOR_BRICKS;
    ctx.font = statusFont;
    ctx.textAlign = 'left';
    ctx.textBaseline = 'middle';
    ctx.shadowBlur = STATUSBAR_TEXT_GLOW;
    ctx.shadowColor = STATUSBAR_COLOR_BRICKS;
    const brickText = `[${this.remainingBricks}/${this.totalBricks}]`;
    ctx.fillText(brickText, this.width / 2 + STATUSBAR_ITEM_OFFSET, centerY);
    ctx.shadowBlur = 0;

    // Draw level title centered with green glow
    if (this.levelTitle) {
      ctx.fillStyle = STATUSBAR_COLOR_TITLE;
      ctx.font = statusFont;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.shadowBlur = STATUSBAR_TEXT_GLOW;
      ctx.shadowColor = STATUSBAR_COLOR_TITLE;
      ctx.fillText(this.levelTitle.toUpperCase(), this.width / 2, centerY);
      ctx.shadowBlur = 0;
    }
  }
}
