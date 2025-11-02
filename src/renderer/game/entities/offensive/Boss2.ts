/**
 * Boss2 - "The Shielder"
 * Has a rotating shield that deflects the ball
 * Throws bricks at the player
 */

import { Brick } from '../Brick';
import { ThrownBrick } from './ThrownBrick';
import { 
  BRICK_WIDTH, 
  BRICK_HEIGHT, 
  BOSS2_MOVE_SPEED,
  BOSS2_THROW_INTERVAL,
  BOSS2_THROWN_BRICK_SPEED,
  BOSS2_SHIELD_RADIUS_MULTIPLIER,
  BOSS2_SHIELD_SEGMENTS,
  BOSS2_SHIELD_GAP_RADIANS,
  BOSS2_SHIELD_ROTATION_SPEED,
  BOSS2_SHIELD_THICKNESS
} from '../../../config/constants';

interface ShieldSegment {
  angle: number; // Angle in radians
  active: boolean; // Whether this segment is active (not destroyed)
}

export class Boss2 {
  private x: number;
  private y: number;
  private health: number;
  private readonly maxHealth: number;
  private active: boolean = true;
  private readonly width: number = BRICK_WIDTH;
  private readonly height: number = BRICK_HEIGHT;
  private readonly color: string;
  private thrownBricks: ThrownBrick[] = [];
  private velocityX: number = 0;
  private velocityY: number = 0;
  private readonly moveSpeed: number = BOSS2_MOVE_SPEED;
  private targetX: number;
  private targetY: number;
  private throwCooldown: number = 0;
  private readonly throwInterval: number = BOSS2_THROW_INTERVAL;
  private availableBricks: Brick[] = [];
  private readonly minX: number;
  private readonly maxX: number;
  private readonly minY: number;
  private readonly maxY: number;
  private readonly canvasWidth: number;
  private readonly canvasHeight: number;
  
  // Shield properties
  private shieldRotation: number = 0;
  private readonly shieldRotationSpeed: number = BOSS2_SHIELD_ROTATION_SPEED;
  private readonly shieldRadius: number = BRICK_WIDTH * BOSS2_SHIELD_RADIUS_MULTIPLIER;
  private readonly shieldSegments: ShieldSegment[] = [];
  private readonly numShieldSegments: number = BOSS2_SHIELD_SEGMENTS;
  private readonly shieldGapSize: number = BOSS2_SHIELD_GAP_RADIANS;

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

    // Initialize shield segments
    this.initializeShield();
  }

  private initializeShield(): void {
    const segmentAngle = (Math.PI * 2) / this.numShieldSegments;
    for (let i = 0; i < this.numShieldSegments; i++) {
      this.shieldSegments.push({
        angle: i * segmentAngle,
        active: true
      });
    }
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

    // Rotate shield
    this.shieldRotation += this.shieldRotationSpeed * deltaTime;
    if (this.shieldRotation > Math.PI * 2) {
      this.shieldRotation -= Math.PI * 2;
    }

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

    // Update thrown bricks
    for (const brick of this.thrownBricks) {
      brick.update(deltaTime);
      if (brick.isOffScreen(this.canvasWidth, this.canvasHeight)) {
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
      BOSS2_THROWN_BRICK_SPEED,
      brickColor
    );

    this.thrownBricks.push(thrownBrick);
  }

  /**
   * Check if the ball collides with any shield arc
   * Returns the shield segment angle if collision detected, null otherwise
   */
  checkShieldCollision(ballX: number, ballY: number, ballRadius: number): number | null {
    const centerX = this.x + this.width / 2;
    const centerY = this.y + this.height / 2;
    const dx = ballX - centerX;
    const dy = ballY - centerY;
    const distanceFromCenter = Math.sqrt(dx * dx + dy * dy);
    
    // Check if ball is within the shield ring (radius ± thickness/2)
    const innerRadius = this.shieldRadius - BOSS2_SHIELD_THICKNESS / 2;
    const outerRadius = this.shieldRadius + BOSS2_SHIELD_THICKNESS / 2;
    
    if (distanceFromCenter < innerRadius - ballRadius || distanceFromCenter > outerRadius + ballRadius) {
      return null; // Ball is not near the shield ring
    }
    
    // Ball is in the shield ring area - check if it hits a segment
    const angleToball = Math.atan2(dy, dx);
    let normalizedAngle = angleToball;
    while (normalizedAngle < 0) {
      normalizedAngle += Math.PI * 2;
    }
    while (normalizedAngle >= Math.PI * 2) {
      normalizedAngle -= Math.PI * 2;
    }
    
    const segmentAngle = (Math.PI * 2) / this.numShieldSegments;
    for (const segment of this.shieldSegments) {
      if (!segment.active) continue;
      
      let currentAngle = segment.angle + this.shieldRotation;
      while (currentAngle < 0) {
        currentAngle += Math.PI * 2;
      }
      while (currentAngle >= Math.PI * 2) {
        currentAngle -= Math.PI * 2;
      }
      
      const segmentStart = currentAngle;
      const segmentEnd = currentAngle + segmentAngle - this.shieldGapSize;
      
      let isInSegment = false;
      if (segmentEnd > Math.PI * 2) {
        const wrappedEnd = segmentEnd - Math.PI * 2;
        if (normalizedAngle >= segmentStart || normalizedAngle <= wrappedEnd) {
          isInSegment = true;
        }
      } else {
        if (normalizedAngle >= segmentStart && normalizedAngle <= segmentEnd) {
          isInSegment = true;
        }
      }
      
      if (isInSegment) {
        // Return the middle angle of this segment for deflection
        let segmentMiddle = currentAngle + (segmentAngle - this.shieldGapSize) / 2;
        while (segmentMiddle >= Math.PI * 2) {
          segmentMiddle -= Math.PI * 2;
        }
        return segmentMiddle;
      }
    }
    
    return null;
  }


  render(ctx: CanvasRenderingContext2D): void {
    if (!this.active) return;

    const centerX = this.x + this.width / 2;
    const centerY = this.y + this.height / 2;

    ctx.save();

    // Render shield segments
    const segmentAngle = (Math.PI * 2) / this.numShieldSegments;
    for (const segment of this.shieldSegments) {
      if (!segment.active) continue;

      const currentAngle = segment.angle + this.shieldRotation;
      const startAngle = currentAngle;
      const endAngle = currentAngle + segmentAngle - this.shieldGapSize;

      // Draw shield arc
      ctx.beginPath();
      ctx.arc(centerX, centerY, this.shieldRadius, startAngle, endAngle);
      ctx.lineWidth = BOSS2_SHIELD_THICKNESS;
      ctx.strokeStyle = '#00ccff';
      ctx.shadowBlur = 10;
      ctx.shadowColor = '#00ccff';
      ctx.stroke();
    }

    // Render boss body
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
    ctx.fillText('BOSS', centerX, centerY);

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
