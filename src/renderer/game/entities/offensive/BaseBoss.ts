/**
 * BaseBoss - Abstract base class for all boss entities
 * Contains shared logic for movement, health, projectiles, and rendering
 */

import { Brick } from '../Brick';
import { ThrownBrick } from './ThrownBrick';
import { BRICK_WIDTH, BRICK_HEIGHT } from '../../../config/constants';
import { ICollidable } from '../../core/ICollidable';
import { Bounds } from '../../core/IEntity';
import { CollisionGroup } from '../../core/CollisionTypes';

export abstract class BaseBoss implements ICollidable {
  // Shared properties
  protected x: number;
  protected y: number;
  protected health: number;
  protected readonly maxHealth: number;
  protected active: boolean = true;
  protected readonly width: number = BRICK_WIDTH;
  protected readonly height: number = BRICK_HEIGHT;
  protected readonly color: string;
  protected thrownBricks: ThrownBrick[] = [];
  protected velocityX: number = 0;
  protected velocityY: number = 0;
  protected targetX: number;
  protected targetY: number;
  protected throwCooldown: number = 0;
  protected availableBricks: Brick[] = [];
  protected readonly minX: number;
  protected readonly maxX: number;
  protected readonly minY: number;
  protected readonly maxY: number;
  protected readonly canvasWidth: number;
  protected readonly canvasHeight: number;
  
  // Boss-specific configuration (must be set by subclasses)
  protected abstract readonly moveSpeed: number;
  protected abstract readonly throwInterval: number;
  protected abstract readonly thrownBrickSpeed: number;
  
  constructor(x: number, y: number, health: number, color: string, canvasWidth: number, canvasHeight: number) {
    this.x = x;
    this.y = y;
    this.health = health;
    this.maxHealth = health;
    this.color = color;
    this.canvasWidth = canvasWidth;
    this.canvasHeight = canvasHeight;
    
    // Set movement boundaries (stay within play area)
    this.minX = BRICK_WIDTH;
    this.maxX = canvasWidth - BRICK_WIDTH * 2;
    this.minY = BRICK_HEIGHT * 3;
    this.maxY = canvasHeight / 2;
    
    // Start with a random target
    this.targetX = this.x;
    this.targetY = this.y;
    this.pickNewTarget();
  }
  
  /**
   * Pick a random target position within movement boundaries
   */
  protected pickNewTarget(): void {
    this.targetX = this.minX + Math.random() * (this.maxX - this.minX);
    this.targetY = this.minY + Math.random() * (this.maxY - this.minY);
  }
  
  /**
   * Update movement towards target position
   */
  protected updateMovement(deltaTime: number): void {
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
  }
  
  /**
   * Update all thrown brick projectiles
   */
  protected updateThrownBricks(deltaTime: number): void {
    for (const brick of this.thrownBricks) {
      brick.update(deltaTime);
      if (brick.isOffScreen(this.canvasWidth, this.canvasHeight)) {
        brick.deactivate();
      }
    }

    // Remove inactive thrown bricks
    this.thrownBricks = this.thrownBricks.filter(b => b.isActive());
  }
  
  /**
   * Update throw cooldown and throw bricks when ready
   */
  protected updateThrowCooldown(deltaTime: number, batX: number, batY: number): void {
    this.throwCooldown -= deltaTime;
    if (this.throwCooldown <= 0 && this.availableBricks.length > 0) {
      this.throwBrickAtBat(batX, batY);
      this.throwCooldown = this.throwInterval;
    }
  }
  
  /**
   * Throw a brick at the bat position
   */
  protected throwBrickAtBat(batX: number, batY: number): void {
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
      this.thrownBrickSpeed,
      brickColor
    );

    this.thrownBricks.push(thrownBrick);
  }
  
  /**
   * Render health bar above boss
   */
  protected renderHealthBar(ctx: CanvasRenderingContext2D): void {
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
  }
  
  /**
   * Render boss body with glow effect and "BOSS" text
   */
  protected renderBossBody(ctx: CanvasRenderingContext2D): void {
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
  }
  
  /**
   * Render all thrown brick projectiles
   */
  protected renderThrownBricks(ctx: CanvasRenderingContext2D): void {
    for (const brick of this.thrownBricks) {
      brick.render(ctx);
    }
  }
  
  /**
   * Get center X coordinate
   */
  protected getCenterX(): number {
    return this.x + this.width / 2;
  }
  
  /**
   * Get center Y coordinate
   */
  protected getCenterY(): number {
    return this.y + this.height / 2;
  }
  
  // Abstract methods - must be implemented by subclasses
  abstract render(ctx: CanvasRenderingContext2D): void;
  abstract updateBoss(deltaTime: number, batX: number, batY: number): void;

  // IEntity interface implementation
  update(deltaTime: number): void {
      // Use stored targets or default behavior if needed
      // For bosses, the game loop calls update(dt, batX, batY) explicitly
      // This method satisfies IEntity interface but shouldn't be the primary update call
      // We can default batX/batY to center or handle this differently
      this.updateBoss(deltaTime, this.canvasWidth / 2, this.canvasHeight - 100);
  }
  
  // Standard interface methods
  setAvailableBricks(bricks: Brick[]): void {
    // Filter out destroyed and indestructible bricks
    this.availableBricks = bricks.filter(b => !b.isDestroyed() && !b.isIndestructible());
  }

  takeDamage(damage: number): void {
    this.health -= damage;
    if (this.health <= 0) {
      this.health = 0;
      this.active = false;
    }
  }

  getBounds(): Bounds | null {
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

  deactivate(): void {
      this.active = false;
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

  getCollisionGroup(): CollisionGroup {
      return CollisionGroup.OFFENSIVE;
  }

  onCollision(_other: ICollidable, _bounds: Bounds, _otherBounds: Bounds): void {
      // Handled by collision manager
  }
}
