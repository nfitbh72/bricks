/**
 * Boss1 - The first boss that spawns arms, moves around, and throws bricks
 */

import { Brick } from '../Brick';
import { BossArm } from './BossArm';
import { ThrownBrick } from './ThrownBrick';
import { BRICK_WIDTH, BRICK_HEIGHT } from '../../../config/constants';

export class Boss1 {
  private x: number;
  private y: number;
  private health: number;
  private readonly maxHealth: number;
  private active: boolean = true;
  private readonly width: number = BRICK_WIDTH;
  private readonly height: number = BRICK_HEIGHT;
  private readonly color: string;
  private arms: BossArm[] = [];
  private thrownBricks: ThrownBrick[] = [];
  private velocityX: number = 0;
  private velocityY: number = 0;
  private readonly moveSpeed: number = 150;
  private targetX: number;
  private targetY: number;
  private throwCooldown: number = 0;
  private readonly throwInterval: number = 2.0; // Throw every 2 seconds
  private availableBricks: Brick[] = [];
  private readonly minX: number;
  private readonly maxX: number;
  private readonly minY: number;
  private readonly maxY: number;

  constructor(x: number, y: number, health: number, color: string, canvasWidth: number, canvasHeight: number) {
    this.x = x;
    this.y = y;
    this.health = health;
    this.maxHealth = health;
    this.color = color;
    
    // Set movement boundaries (stay within play area)
    this.minX = BRICK_WIDTH;
    this.maxX = canvasWidth - BRICK_WIDTH * 2;
    this.minY = BRICK_HEIGHT * 3;
    this.maxY = canvasHeight / 2;
    
    // Start with a random target
    this.targetX = this.x;
    this.targetY = this.y;
    this.pickNewTarget();

    // Spawn two arms
    this.spawnArms();
  }

  private spawnArms(): void {
    // Left arm
    this.arms.push(new BossArm(this.x, this.y, -20, 5, this.color));
    // Right arm
    this.arms.push(new BossArm(this.x, this.y, this.width + 5, 5, this.color));
  }

  private pickNewTarget(): void {
    // Pick a random position within bounds
    this.targetX = this.minX + Math.random() * (this.maxX - this.minX);
    this.targetY = this.minY + Math.random() * (this.maxY - this.minY);
  }

  setAvailableBricks(bricks: Brick[]): void {
    // Filter out destroyed and indestructible bricks
    this.availableBricks = bricks.filter(b => !b.isDestroyed() && !b.isIndestructible());
  }

  update(deltaTime: number, batX: number, batY: number): void {
    if (!this.active) return;

    // Move towards target
    const dx = this.targetX - this.x;
    const dy = this.targetY - this.y;
    const distance = Math.sqrt(dx * dx + dy * dy);

    if (distance < 10) {
      // Reached target, pick new one
      this.pickNewTarget();
    } else {
      // Move towards target
      this.velocityX = (dx / distance) * this.moveSpeed;
      this.velocityY = (dy / distance) * this.moveSpeed;
      this.x += this.velocityX * deltaTime;
      this.y += this.velocityY * deltaTime;

      // Clamp to boundaries
      this.x = Math.max(this.minX, Math.min(this.maxX, this.x));
      this.y = Math.max(this.minY, Math.min(this.maxY, this.y));
    }

    // Update arms
    for (const arm of this.arms) {
      arm.update(this.x, this.y, deltaTime);
    }

    // Update thrown bricks
    for (const brick of this.thrownBricks) {
      brick.update(deltaTime);
      if (brick.isOffScreen(800)) {
        brick.deactivate();
      }
    }

    // Remove inactive thrown bricks
    this.thrownBricks = this.thrownBricks.filter(b => b.isActive());

    // Throw bricks at the bat
    this.throwCooldown -= deltaTime;
    if (this.throwCooldown <= 0 && this.availableBricks.length > 0) {
      this.throwBrickAtBat(batX, batY);
      this.throwCooldown = this.throwInterval;
    }
  }

  private throwBrickAtBat(batX: number, batY: number): void {
    if (this.availableBricks.length === 0) return;

    // Pick a random brick to throw
    const randomIndex = Math.floor(Math.random() * this.availableBricks.length);
    const brickToThrow = this.availableBricks[randomIndex];
    
    // Remove from available bricks
    this.availableBricks.splice(randomIndex, 1);

    // Get brick color
    const brickColor = brickToThrow.getColor();

    // Destroy the brick (it's being thrown)
    brickToThrow.takeDamage(999999);

    // Create thrown brick projectile from boss position towards bat
    const thrownBrick = new ThrownBrick(
      this.x + this.width / 2,
      this.y + this.height / 2,
      batX,
      batY,
      300, // Speed
      brickColor
    );

    this.thrownBricks.push(thrownBrick);
  }

  render(ctx: CanvasRenderingContext2D): void {
    if (!this.active) return;

    // Render arms first (behind boss)
    for (const arm of this.arms) {
      arm.render(ctx);
    }

    // Render boss body
    ctx.save();

    // Draw glow effect
    ctx.shadowBlur = 15;
    ctx.shadowColor = this.color;

    // Draw boss body
    ctx.fillStyle = this.color;
    ctx.fillRect(this.x, this.y, this.width, this.height);

    // Draw border
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 3;
    ctx.strokeRect(this.x, this.y, this.width, this.height);

    // Draw "BOSS" text
    ctx.shadowBlur = 0;
    ctx.fillStyle = '#000000';
    ctx.font = 'bold 12px monospace';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('BOSS', this.x + this.width / 2, this.y + this.height / 2);

    // Draw health bar above boss
    const healthBarWidth = this.width;
    const healthBarHeight = 4;
    const healthBarY = this.y - 10;
    const healthPercent = this.health / this.maxHealth;

    // Background
    ctx.fillStyle = '#333333';
    ctx.fillRect(this.x, healthBarY, healthBarWidth, healthBarHeight);

    // Health
    ctx.fillStyle = healthPercent > 0.5 ? '#00ff00' : healthPercent > 0.25 ? '#ffff00' : '#ff0000';
    ctx.fillRect(this.x, healthBarY, healthBarWidth * healthPercent, healthBarHeight);

    ctx.restore();

    // Render thrown bricks
    for (const brick of this.thrownBricks) {
      brick.render(ctx);
    }
  }

  takeDamage(damage: number): void {
    this.health -= damage;
    if (this.health <= 0) {
      this.health = 0;
      this.active = false;
    }
  }

  getBounds(): { x: number; y: number; width: number; height: number } | null {
    if (!this.active) return null;
    return {
      x: this.x,
      y: this.y,
      width: this.width,
      height: this.height,
    };
  }

  getThrownBricks(): ThrownBrick[] {
    return this.thrownBricks;
  }

  isActive(): boolean {
    return this.active;
  }

  isDestroyed(): boolean {
    return !this.active;
  }

  getHealth(): number {
    return this.health;
  }

  getMaxHealth(): number {
    return this.maxHealth;
  }
}
