/**
 * BallManager - Handles ball spawning, removal, and lifecycle management
 * Extracts ball-related logic from Game.ts
 */

import { Ball } from '../entities/Ball';
import { Bat } from '../entities/Bat';
import { EffectsManager } from './EffectsManager';
import { StatusBar } from '../ui/StatusBar';
import {
  BALL_RADIUS,
  BALL_SPEED,
  MULTIBALL_MIN_ANGLE,
  MULTIBALL_MAX_ANGLE,
  MULTIBALL_DESPAWN_PARTICLE_COUNT,
  MAX_BALLS_ON_SCREEN,
  SCREEN_SHAKE_BACK_WALL_INTENSITY,
  SCREEN_SHAKE_BACK_WALL_DURATION,
} from '../../config/constants';

export class BallManager {
  private balls: Ball[] = [];
  private canvasWidth: number;
  private canvasHeight: number;

  constructor(canvasWidth: number, canvasHeight: number) {
    this.canvasWidth = canvasWidth;
    this.canvasHeight = canvasHeight;

    // Initialize with a single ball at center
    const centerX = canvasWidth / 2;
    const batY = canvasHeight - 100;
    const ballY = batY - 30;
    const initialBall = new Ball(centerX, ballY, BALL_RADIUS, BALL_SPEED);
    this.balls = [initialBall];
  }

  /**
   * Update all balls
   */
  update(deltaTime: number): void {
    for (const ball of this.balls) {
      if (!ball.getIsSticky()) {
        ball.update(deltaTime);
      }
    }
  }

  /**
   * Update sticky ball position to follow bat
   */
  updateStickyBallPosition(bat: Bat): void {
    const primaryBall = this.getPrimaryBall();
    if (primaryBall.getIsSticky()) {
      primaryBall.updateStickyPosition(bat.getCenterX(), bat.getPosition().y);
    }
  }

  /**
   * Check wall collisions for all balls and handle ball removal
   * Returns true if player lost health (last ball hit bottom)
   */
  checkWallCollisions(
    statusBarTop: number,
    playerHealth: number,
    effectsManager: EffectsManager,
    statusBar: StatusBar
  ): { lostHealth: boolean; newHealth: number } {
    const ballsToRemove: Ball[] = [];
    let lostHealth = false;
    let newHealth = playerHealth;

    for (const ball of this.balls) {
      if (!ball.getIsSticky()) {
        const hitBackWall = ball.checkWallCollisions(
          0,
          this.canvasWidth,
          0,
          statusBarTop
        );

        if (hitBackWall) {
          // Multi-ball logic: if more than one ball, despawn this ball
          if (this.balls.length > 1) {
            ballsToRemove.push(ball);
            // Spawn particles for visual feedback
            const ballPos = ball.getPosition();
            effectsManager.createParticles(
              ballPos.x,
              ballPos.y,
              MULTIBALL_DESPAWN_PARTICLE_COUNT,
              ball.getIsGrey() ? '#808080' : '#00ffff',
              150
            );
          } else {
            // Last ball: lose health and trigger screen shake
            newHealth--;
            statusBar.setPlayerHealth(newHealth);
            effectsManager.triggerScreenShake(
              SCREEN_SHAKE_BACK_WALL_INTENSITY,
              SCREEN_SHAKE_BACK_WALL_DURATION
            );
            lostHealth = true;
          }
        }
      }
    }

    // Remove balls that hit bottom (when multiple balls exist)
    if (ballsToRemove.length > 0) {
      this.balls = this.balls.filter(ball => !ballsToRemove.includes(ball));
    }

    return { lostHealth, newHealth };
  }

  /**
   * Spawn additional balls from a source ball
   * Respects MAX_BALLS_ON_SCREEN cap
   */
  spawnAdditionalBalls(sourceBall: Ball, count: number): void {
    for (let i = 0; i < count; i++) {
      // Check if we've hit the ball cap
      if (this.balls.length >= MAX_BALLS_ON_SCREEN) {
        break;
      }

      const newBall = sourceBall.clone();
      // Random angle in upward range (avoid downward angles)
      const randomAngle = MULTIBALL_MIN_ANGLE + Math.random() * (MULTIBALL_MAX_ANGLE - MULTIBALL_MIN_ANGLE);
      newBall.setVelocityFromAngle(randomAngle, sourceBall.getSpeed());
      this.balls.push(newBall);
    }
  }

  /**
   * Reset balls to single ball at level start
   */
  resetForLevel(bat: Bat): void {
    const centerX = this.canvasWidth / 2;
    const batY = bat.getPosition().y;
    const ballY = batY - 30;

    // Reset primary ball
    const primaryBall = this.getPrimaryBall();
    primaryBall.reset();
    primaryBall.setPosition(centerX, ballY);

    // Remove any extra balls from previous level
    this.balls = [primaryBall];

    // Make ball sticky at level start - position on top of bat
    const ballRadius = primaryBall.getRadius();
    primaryBall.setSticky(true, 0, -ballRadius, true); // true = initial sticky
  }

  /**
   * Get primary ball (first ball, used for sticky ball logic and weapon targeting)
   */
  getPrimaryBall(): Ball {
    return this.balls[0];
  }

  /**
   * Get all balls
   */
  getBalls(): Ball[] {
    return this.balls;
  }

  /**
   * Get ball count
   */
  getBallCount(): number {
    return this.balls.length;
  }

  /**
   * Check if primary ball is sticky
   */
  isPrimaryBallSticky(): boolean {
    return this.getPrimaryBall().getIsSticky();
  }

  /**
   * Set base values for ball properties (called when upgrades change)
   * Note: Ball properties are set at construction, so this is for future extensibility
   */
  setBaseValues(_ballSpeed: number, _ballRadius: number): void {
    // Ball doesn't have setters for speed/radius as they're set at construction
    // This method is here for future extensibility if needed
  }
}
