/**
 * Boss3 - "The Splitter"
 * Splits into multiple smaller copies when damaged below 50% health
 * Each copy moves faster and fires splitting fragments
 */

import { BaseBoss } from './BaseBoss';
import { SplittingFragment } from './SplittingFragment';
import { 
  BOSS3_MOVE_SPEED,
  BOSS3_THROW_INTERVAL,
  BOSS3_THROWN_BRICK_SPEED,
  BOSS3_SPLIT_THRESHOLD,
  BOSS3_SPLIT_COUNT,
  BOSS3_COPY_HEALTH_MULTIPLIER,
  BOSS3_COPY_SPEED_MULTIPLIER,
  BOSS3_COPY_SIZE_MULTIPLIER,
  BRICK_WIDTH,
  BRICK_HEIGHT,
  BAT_WIDTH
} from '../../../config/constants';

export class Boss3 extends BaseBoss {
  protected readonly moveSpeed: number;
  protected readonly throwInterval: number = BOSS3_THROW_INTERVAL;
  protected readonly thrownBrickSpeed: number = BOSS3_THROWN_BRICK_SPEED;
  
  private hasSplit: boolean = false;
  private readonly isCopy: boolean;
  private readonly copyScale: number;
  private splittingFragments: SplittingFragment[] = [];
  private fragmentThrowCooldown: number = 0;
  private readonly fragmentThrowInterval: number = 1.5; // Throw fragments more frequently
  
  constructor(
    x: number, 
    y: number, 
    health: number, 
    color: string, 
    canvasWidth: number, 
    canvasHeight: number,
    isCopy: boolean = false,
    copyScale: number = 1.0
  ) {
    super(x, y, health, color, canvasWidth, canvasHeight);
    this.isCopy = isCopy;
    this.copyScale = copyScale;
    
    // Copies move faster
    this.moveSpeed = isCopy 
      ? BOSS3_MOVE_SPEED * BOSS3_COPY_SPEED_MULTIPLIER 
      : BOSS3_MOVE_SPEED;
  }

  /**
   * Check if boss should split and return split data
   */
  shouldSplit(): boolean {
    if (this.hasSplit || this.isCopy) return false;
    const healthPercent = this.health / this.maxHealth;
    return healthPercent < BOSS3_SPLIT_THRESHOLD && healthPercent > 0;
  }

  /**
   * Create split copies of this boss
   */
  createSplitCopies(): Boss3[] {
    if (this.hasSplit || this.isCopy) return [];
    
    this.hasSplit = true;
    const copies: Boss3[] = [];
    const copyHealth = this.maxHealth * BOSS3_COPY_HEALTH_MULTIPLIER;
    const copyScale = BOSS3_COPY_SIZE_MULTIPLIER;
    
    // Create copies at offset positions - at least BAT_WIDTH distance from boss
    const minSpacing = BAT_WIDTH;
    for (let i = 0; i < BOSS3_SPLIT_COUNT; i++) {
      // Spread copies horizontally with at least bat-width spacing
      const offsetX = (i - (BOSS3_SPLIT_COUNT - 1) / 2) * minSpacing * 1.5;
      // Alternate vertical positions to create a spread pattern
      const offsetY = (i % 2 === 0 ? -1 : 1) * BRICK_HEIGHT * 1.5;
      
      const copy = new Boss3(
        this.x + offsetX,
        this.y + offsetY,
        copyHealth,
        this.color,
        this.canvasWidth,
        this.canvasHeight,
        true, // is copy
        copyScale
      );
      
      // Give copies access to same bricks
      copy.setAvailableBricks(this.availableBricks);
      copies.push(copy);
    }
    
    return copies;
  }

  update(deltaTime: number, batX: number, batY: number): void {
    if (!this.active) return;

    this.updateMovement(deltaTime);
    this.updateThrownBricks(deltaTime);
    this.updateThrowCooldown(deltaTime, batX, batY);
    
    // Update splitting fragments
    for (const fragment of this.splittingFragments) {
      fragment.update(deltaTime);
      if (fragment.isOffScreen(this.canvasWidth, this.canvasHeight)) {
        fragment.deactivate();
      }
    }
    this.splittingFragments = this.splittingFragments.filter(f => f.isActive());
    
    // Throw splitting fragments
    this.fragmentThrowCooldown -= deltaTime;
    if (this.fragmentThrowCooldown <= 0) {
      this.throwSplittingFragments(batX, batY);
      this.fragmentThrowCooldown = this.fragmentThrowInterval;
    }
  }

  /**
   * Throw splitting fragments in a pattern
   * Fragments spawn at least BRICK_WIDTH away from boss center
   */
  private throwSplittingFragments(batX: number, batY: number): void {
    const centerX = this.x + (this.width * this.copyScale) / 2;
    const centerY = this.y + (this.height * this.copyScale) / 2;
    
    // Throw 3 fragments in a spread pattern
    const angleToTarget = Math.atan2(batY - centerY, batX - centerX);
    const spreadAngles = [-0.3, 0, 0.3]; // -17°, 0°, +17°
    
    for (const angleOffset of spreadAngles) {
      const angle = angleToTarget + angleOffset;
      const velocityX = Math.cos(angle) * this.thrownBrickSpeed;
      const velocityY = Math.sin(angle) * this.thrownBrickSpeed;
      
      // Spawn fragment at least BRICK_WIDTH away from boss center
      const spawnDistance = BRICK_WIDTH;
      const spawnX = centerX + Math.cos(angle) * spawnDistance;
      const spawnY = centerY + Math.sin(angle) * spawnDistance;
      
      const fragment = new SplittingFragment(
        spawnX,
        spawnY,
        velocityX,
        velocityY,
        this.color
      );
      
      this.splittingFragments.push(fragment);
    }
  }

  render(ctx: CanvasRenderingContext2D): void {
    if (!this.active) return;

    ctx.save();

    // Apply scale for copies
    if (this.isCopy) {
      const centerX = this.x + this.width / 2;
      const centerY = this.y + this.height / 2;
      ctx.translate(centerX, centerY);
      ctx.scale(this.copyScale, this.copyScale);
      ctx.translate(-centerX, -centerY);
    }

    // Render with cracked appearance if damaged
    const healthPercent = this.health / this.maxHealth;
    
    // Draw glow effect
    ctx.shadowBlur = 15;
    ctx.shadowColor = this.color;

    // Draw boss body
    ctx.fillStyle = this.color;
    ctx.fillRect(this.x, this.y, this.width, this.height);

    // Draw cracks if damaged
    if (healthPercent < 0.75) {
      ctx.strokeStyle = '#000000';
      ctx.lineWidth = 2;
      ctx.globalAlpha = 0.6;
      
      // Draw crack lines
      const crackCount = healthPercent < 0.5 ? 4 : 2;
      for (let i = 0; i < crackCount; i++) {
        ctx.beginPath();
        const startX = this.x + Math.random() * this.width;
        const startY = this.y + Math.random() * this.height;
        const endX = this.x + Math.random() * this.width;
        const endY = this.y + Math.random() * this.height;
        ctx.moveTo(startX, startY);
        ctx.lineTo(endX, endY);
        ctx.stroke();
      }
      
      ctx.globalAlpha = 1.0;
    }

    // Draw border
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 3;
    ctx.strokeRect(this.x, this.y, this.width, this.height);

    // Draw "BOSS" text or "COPY" for copies
    ctx.shadowBlur = 0;
    ctx.fillStyle = '#000000';
    ctx.font = this.isCopy ? 'bold 10px monospace' : 'bold 12px monospace';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    const text = this.isCopy ? 'COPY' : 'BOSS';
    ctx.fillText(text, this.x + this.width / 2, this.y + this.height / 2);

    ctx.restore();

    // Render health bar and projectiles (not scaled)
    this.renderHealthBar(ctx);
    this.renderThrownBricks(ctx);
    
    // Render splitting fragments
    for (const fragment of this.splittingFragments) {
      fragment.render(ctx);
    }
  }

  /**
   * Get splitting fragments for collision detection
   */
  getSplittingFragments(): SplittingFragment[] {
    return this.splittingFragments;
  }

  /**
   * Check if this is a copy
   */
  getIsCopy(): boolean {
    return this.isCopy;
  }

  /**
   * Mark as split
   */
  markAsSplit(): void {
    this.hasSplit = true;
  }
}
