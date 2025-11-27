/**
 * Boss1 - The first boss that spawns arms, moves around, and throws bricks
 */

import { BaseBoss } from './BaseBoss';
import { BossArm } from './BossArm';
import { BOSS1_MOVE_SPEED, BOSS1_THROW_INTERVAL, BOSS1_THROWN_BRICK_SPEED } from '../../../config/constants';

export class Boss1 extends BaseBoss {
  protected readonly moveSpeed: number = BOSS1_MOVE_SPEED;
  protected readonly throwInterval: number = BOSS1_THROW_INTERVAL;
  protected readonly thrownBrickSpeed: number = BOSS1_THROWN_BRICK_SPEED;
  
  private arms: BossArm[] = [];

  constructor(x: number, y: number, health: number, color: string, canvasWidth: number, canvasHeight: number) {
    super(x, y, health, color, canvasWidth, canvasHeight);
    this.spawnArms();
  }

  private spawnArms(): void {
    // Left arm
    this.arms.push(new BossArm(this.x, this.y, -20, 5, this.color));
    // Right arm
    this.arms.push(new BossArm(this.x, this.y, this.width + 5, 5, this.color));
  }

  updateBoss(deltaTime: number, batX: number, batY: number): void {
    if (!this.active) return;

    this.updateMovement(deltaTime);

    // Update arms
    for (const arm of this.arms) {
      arm.update(this.x, this.y, deltaTime);
    }

    this.updateThrownBricks(deltaTime);
    this.updateThrowCooldown(deltaTime, batX, batY);
  }

  render(ctx: CanvasRenderingContext2D): void {
    if (!this.active) return;

    ctx.save();

    // Render arms first (behind boss)
    for (const arm of this.arms) {
      arm.render(ctx);
    }

    this.renderBossBody(ctx);
    this.renderHealthBar(ctx);
    this.renderThrownBricks(ctx);

    ctx.restore();
  }
}
