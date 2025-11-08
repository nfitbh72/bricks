/**
 * Boss2 - "The Shielder"
 * Has a rotating shield that deflects the ball
 * Throws bricks at the player
 */

import { BaseBoss } from './BaseBoss';
import { 
  BRICK_WIDTH, 
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

export class Boss2 extends BaseBoss {
  protected readonly moveSpeed: number = BOSS2_MOVE_SPEED;
  protected readonly throwInterval: number = BOSS2_THROW_INTERVAL;
  protected readonly thrownBrickSpeed: number = BOSS2_THROWN_BRICK_SPEED;
  
  // Shield properties
  private shieldRotation: number = 0;
  private readonly shieldRotationSpeed: number = BOSS2_SHIELD_ROTATION_SPEED;
  private readonly shieldRadius: number = BRICK_WIDTH * BOSS2_SHIELD_RADIUS_MULTIPLIER;
  private readonly shieldSegments: ShieldSegment[] = [];
  private readonly numShieldSegments: number = BOSS2_SHIELD_SEGMENTS;
  private readonly shieldGapSize: number = BOSS2_SHIELD_GAP_RADIANS;

  constructor(x: number, y: number, health: number, color: string, canvasWidth: number, canvasHeight: number) {
    super(x, y, health, color, canvasWidth, canvasHeight);
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

  update(deltaTime: number, batX: number, batY: number): void {
    if (!this.active) return;

    // Rotate shield
    this.shieldRotation += this.shieldRotationSpeed * deltaTime;
    if (this.shieldRotation > Math.PI * 2) {
      this.shieldRotation -= Math.PI * 2;
    }

    this.updateMovement(deltaTime);
    this.updateThrownBricks(deltaTime);
    this.updateThrowCooldown(deltaTime, batX, batY);
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

    this.renderBossBody(ctx);
    this.renderHealthBar(ctx);
    this.renderThrownBricks(ctx);

    ctx.restore();
  }
}
