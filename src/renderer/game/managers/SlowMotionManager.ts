/**
 * SlowMotionManager - manages slow-motion effects and prediction logic
 */

import { Ball } from '../entities/Ball';
import { Level } from '../entities/Level';
import { StatusBar } from '../ui/StatusBar';
import { EffectsManager } from '../managers/EffectsManager';
import { 
  SLOW_MOTION_FACTOR, 
  SLOW_MOTION_DURATION,
  SLOW_MOTION_TRIGGER_DISTANCE
} from '../../config/constants';

export class SlowMotionManager {
  private isSlowMotion: boolean = false;
  private slowMotionTimer: number = 0;

  /**
   * Check if slow-motion is currently active
   */
  isActive(): boolean {
    return this.isSlowMotion;
  }

  /**
   * Get the effective delta time with slow-motion applied
   */
  getEffectiveDeltaTime(deltaTime: number): number {
    if (this.isSlowMotion) {
      return deltaTime * SLOW_MOTION_FACTOR;
    }
    return deltaTime;
  }

  /**
   * Update slow-motion timer and check if it should end
   */
  update(deltaTime: number): void {
    if (this.isSlowMotion) {
      this.slowMotionTimer += deltaTime;
      
      // End slow-motion after duration
      if (this.slowMotionTimer >= SLOW_MOTION_DURATION) {
        console.log('✅ Slow-motion ended');
        this.isSlowMotion = false;
        this.slowMotionTimer = 0;
      }
    }
  }

  /**
   * Reset slow-motion state
   */
  reset(): void {
    this.isSlowMotion = false;
    this.slowMotionTimer = 0;
  }

  /**
   * Check if slow-motion should be triggered (1 destructible brick left, ball approaching)
   * If triggered, activates slow-motion and visual effects
   */
  checkAndTrigger(
    level: Level | null,
    ball: Ball,
    statusBar: StatusBar,
    effectsManager: EffectsManager,
    canvasWidth: number,
    canvasHeight: number
  ): void {
    // Only trigger if not already in slow-motion and exactly 1 destructible brick remains
    if (!level || this.isSlowMotion || level.getRemainingDestructibleBricks() !== 1) {
      return;
    }

    if (this.predictBallWillHitBrick(level, ball, statusBar, canvasWidth)) {
      console.log('🎬 SLOW-MOTION ACTIVATED! Ball approaching final destructible brick!');
      this.isSlowMotion = true;
      this.slowMotionTimer = 0;
      
      // Calculate target focus point (midpoint between ball and final destructible brick)
      const ballPos = ball.getPosition();
      const destructibleBricks = level.getBricks().filter(b => !b.isIndestructible() && !b.isDestroyed());
      if (destructibleBricks.length === 1) {
        const brickBounds = destructibleBricks[0].getBounds();
        const brickCenterX = brickBounds.x + brickBounds.width / 2;
        const brickCenterY = brickBounds.y + brickBounds.height / 2;
        
        const targetFocusX = (ballPos.x + brickCenterX) / 2;
        const targetFocusY = (ballPos.y + brickCenterY) / 2;
        
        // Trigger slow-motion visual effects in EffectsManager
        effectsManager.triggerSlowMotion(
          canvasWidth,
          canvasHeight,
          targetFocusX,
          targetFocusY
        );
        
        console.log(`Slow-motion triggered with focus at (${targetFocusX.toFixed(0)}, ${targetFocusY.toFixed(0)})`);
      }
    }
  }

  /**
   * Predict if the ball will hit a brick soon (ray tracing)
   * Returns true if ball will hit a brick within configured trigger distance
   */
  private predictBallWillHitBrick(
    level: Level,
    ball: Ball,
    statusBar: StatusBar,
    canvasWidth: number
  ): boolean {
    const ballPos = ball.getPosition();
    const ballVel = ball.getVelocity();
    const ballRadius = ball.getRadius();
    
    // Get the final destructible brick
    const destructibleBricks = level.getBricks().filter(b => !b.isIndestructible() && !b.isDestroyed());
    if (destructibleBricks.length !== 1) return false;
    
    const finalBrick = destructibleBricks[0];
    const brickBounds = finalBrick.getBounds();
    
    // Calculate distance from ball to brick
    const closestX = Math.max(brickBounds.x, Math.min(ballPos.x, brickBounds.x + brickBounds.width));
    const closestY = Math.max(brickBounds.y, Math.min(ballPos.y, brickBounds.y + brickBounds.height));
    
    const distX = ballPos.x - closestX;
    const distY = ballPos.y - closestY;
    const distance = Math.sqrt(distX * distX + distY * distY);
    
    // Trigger distance: configured brick heights
    const triggerDistance = brickBounds.height * SLOW_MOTION_TRIGGER_DISTANCE;
    
    if (distance > triggerDistance) {
      return false; // Too far away
    }
    
    // Ball is close - now ray trace to confirm it will hit
    const predictionTime = 0.5; // Look ahead 0.5 seconds
    const steps = 20; // Number of simulation steps
    const dt = predictionTime / steps;
    
    let testX = ballPos.x;
    let testY = ballPos.y;
    let testVelX = ballVel.x;
    let testVelY = ballVel.y;
    
    const statusBarTop = statusBar.getY();
    
    for (let i = 0; i < steps; i++) {
      // Update test position
      testX += testVelX * dt;
      testY += testVelY * dt;
      
      // Check wall bounces
      if (testX - ballRadius < 0) {
        testX = ballRadius;
        testVelX = Math.abs(testVelX);
      }
      if (testX + ballRadius > canvasWidth) {
        testX = canvasWidth - ballRadius;
        testVelX = -Math.abs(testVelX);
      }
      if (testY - ballRadius < 0) {
        testY = ballRadius;
        testVelY = Math.abs(testVelY);
      }
      if (testY + ballRadius > statusBarTop) {
        // Hit back wall - won't hit brick
        return false;
      }
      
      // Check if test position intersects the brick
      const testClosestX = Math.max(brickBounds.x, Math.min(testX, brickBounds.x + brickBounds.width));
      const testClosestY = Math.max(brickBounds.y, Math.min(testY, brickBounds.y + brickBounds.height));
      
      const testDistX = testX - testClosestX;
      const testDistY = testY - testClosestY;
      const testDistSquared = testDistX * testDistX + testDistY * testDistY;
      
      if (testDistSquared < ballRadius * ballRadius) {
        console.log(`📍 Ray trace: Ball is ${distance.toFixed(0)}px away, will hit brick in ~${(i * dt).toFixed(2)}s`);
        return true; // Will hit brick!
      }
    }
    
    return false; // Won't hit brick in prediction window
  }
}
