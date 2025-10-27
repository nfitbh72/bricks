/**
 * BossArm - An arm attached to the boss that moves with it
 */

export class BossArm {
  private x: number;
  private y: number;
  private readonly offsetX: number;
  private readonly offsetY: number;
  private readonly width: number = 15;
  private readonly height: number = 30;
  private readonly color: string;
  private animationPhase: number = 0;

  constructor(x: number, y: number, offsetX: number, offsetY: number, color: string) {
    this.x = x;
    this.y = y;
    this.offsetX = offsetX;
    this.offsetY = offsetY;
    this.color = color;
  }

  update(bossX: number, bossY: number, deltaTime: number): void {
    this.x = bossX + this.offsetX;
    this.y = bossY + this.offsetY;
    this.animationPhase += deltaTime * 3;
  }

  render(ctx: CanvasRenderingContext2D): void {
    ctx.save();

    // Animate arm with slight wave motion
    const waveOffset = Math.sin(this.animationPhase) * 3;

    // Draw arm with glow
    ctx.shadowBlur = 8;
    ctx.shadowColor = this.color;
    ctx.fillStyle = this.color;
    ctx.fillRect(this.x + waveOffset, this.y, this.width, this.height);

    // Draw border
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 1;
    ctx.strokeRect(this.x + waveOffset, this.y, this.width, this.height);

    ctx.restore();
  }

  getPosition(): { x: number; y: number } {
    return { x: this.x, y: this.y };
  }

  getBounds(): { x: number; y: number; width: number; height: number } {
    return {
      x: this.x,
      y: this.y,
      width: this.width,
      height: this.height,
    };
  }
}
