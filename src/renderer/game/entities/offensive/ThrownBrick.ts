/**
 * ThrownBrick - A brick thrown by the boss towards the bat
 */

export class ThrownBrick {
  private x: number;
  private y: number;
  private velocityX: number;
  private velocityY: number;
  private active: boolean = true;
  private readonly width: number = 40;
  private readonly height: number = 20;
  private readonly color: string;
  private rotation: number = 0;
  private rotationSpeed: number;

  constructor(x: number, y: number, targetX: number, targetY: number, speed: number, color: string) {
    this.x = x;
    this.y = y;
    this.color = color;

    // Calculate direction to target
    const dx = targetX - x;
    const dy = targetY - y;
    const distance = Math.sqrt(dx * dx + dy * dy);

    // Normalize and apply speed
    this.velocityX = (dx / distance) * speed;
    this.velocityY = (dy / distance) * speed;

    // Random rotation speed for visual effect
    this.rotationSpeed = (Math.random() - 0.5) * 0.2;
  }

  update(deltaTime: number): void {
    if (!this.active) return;

    this.x += this.velocityX * deltaTime;
    this.y += this.velocityY * deltaTime;
    this.rotation += this.rotationSpeed;
  }

  render(ctx: CanvasRenderingContext2D): void {
    if (!this.active) return;

    ctx.save();
    ctx.translate(this.x, this.y);
    ctx.rotate(this.rotation);

    // Draw brick with glow
    ctx.shadowBlur = 10;
    ctx.shadowColor = this.color;
    ctx.fillStyle = this.color;
    ctx.fillRect(-this.width / 2, -this.height / 2, this.width, this.height);

    // Draw border
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 2;
    ctx.strokeRect(-this.width / 2, -this.height / 2, this.width, this.height);

    ctx.restore();
  }

  getBounds(): { x: number; y: number; width: number; height: number } | null {
    if (!this.active) return null;
    return {
      x: this.x - this.width / 2,
      y: this.y - this.height / 2,
      width: this.width,
      height: this.height,
    };
  }

  isActive(): boolean {
    return this.active;
  }

  deactivate(): void {
    this.active = false;
  }

  isOffScreen(canvasHeight: number): boolean {
    return this.y > canvasHeight + 50 || this.y < -50 || this.x < -50 || this.x > 1000;
  }
}
