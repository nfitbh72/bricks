/**
 * Integration tests for collision detection
 */

import { Ball } from '../../src/renderer/game/Ball';
import { Bat } from '../../src/renderer/game/Bat';
import { Brick } from '../../src/renderer/game/Brick';
import { BrickConfig, BrickType } from '../../src/renderer/game/types';
import { checkCircleRectCollision } from '../../src/renderer/game/utils';
import { gridToPixel } from '../../src/renderer/config/brickLayout';
import { BRICK_WIDTH, BRICK_HEIGHT, BALL_RADIUS } from '../../src/renderer/config/constants';

// Test constants
const TEST_BALL_COLLISION_OFFSET = 5; // Distance from brick edge for collision tests

// Helper to create brick config from grid position
function createBrickConfig(col: number, row: number, type: BrickType): BrickConfig {
  return { col, row, type };
}

describe('Collision Detection Integration', () => {
  describe('Ball-Bat Collisions', () => {
    it('should bounce ball off bat center going straight up', () => {
      const ball = new Ball(400, 550, BALL_RADIUS, 300);
      const bat = new Bat(350, 560, 100, 10);
      
      ball.setVelocity(0, 100); // Moving down
      ball.bounceOffBat(bat);
      
      const velocity = ball.getVelocity();
      expect(velocity.x).toBeCloseTo(0, 1);
      expect(velocity.y).toBeLessThan(0); // Moving up
    });

    it('should bounce ball at angle when hitting bat edge', () => {
      const ball = new Ball(450, 550, BALL_RADIUS, 300);
      const bat = new Bat(350, 560, 100, 10);
      
      ball.setVelocity(50, 100); // Moving down-right
      ball.bounceOffBat(bat);
      
      const velocity = ball.getVelocity();
      expect(velocity.x).toBeGreaterThan(0); // Deflected right
      expect(velocity.y).toBeLessThan(0); // Moving up
    });

    it('should bounce ball left when hitting left side of bat', () => {
      const ball = new Ball(360, 550, BALL_RADIUS, 300);
      const bat = new Bat(350, 560, 100, 10);
      
      ball.setVelocity(-20, 100);
      ball.bounceOffBat(bat);
      
      const velocity = ball.getVelocity();
      expect(velocity.x).toBeLessThan(0); // Deflected left
      expect(velocity.y).toBeLessThan(0); // Moving up
    });

    it('should set ball speed to current speed after bat bounce', () => {
      const ball = new Ball(400, 550, BALL_RADIUS, 300);
      const bat = new Bat(350, 560, 100, 10);
      
      ball.setVelocity(100, 100);
      
      ball.bounceOffBat(bat);
      
      const velocity = ball.getVelocity();
      const speedAfter = Math.sqrt(velocity.x * velocity.x + velocity.y * velocity.y);
      // After bounce, speed should match ball's current speed (300)
      expect(speedAfter).toBeCloseTo(ball.getSpeed(), 1);
    });

    it('should handle extreme edge hits', () => {
      const ball = new Ball(450, 550, BALL_RADIUS, 300);
      const bat = new Bat(350, 560, 100, 10);
      
      ball.setVelocity(0, 100);
      ball.bounceOffBat(bat);
      
      const velocity = ball.getVelocity();
      expect(velocity.y).toBeLessThan(0); // Should still bounce up
    });
  });

  describe('Ball-Brick Collisions', () => {
    it('should detect collision when ball overlaps brick', () => {
      const brick = new Brick(createBrickConfig(2, 4, BrickType.NORMAL));
      const brickPos = gridToPixel(2, 4);
      // Place ball in center of brick
      const ball = new Ball(brickPos.x + BRICK_WIDTH / 2, brickPos.y + BRICK_HEIGHT / 2, BALL_RADIUS, 300);
      
      const ballBounds = ball.getBounds();
      const brickBounds = brick.getBounds();
      const result = checkCircleRectCollision(ballBounds, brickBounds);
      
      expect(result.collided).toBe(true);
    });

    it('should not detect collision when ball is far from brick', () => {
      const brick = new Brick(createBrickConfig(4, 9, BrickType.NORMAL));
      // Place ball far away from brick
      const ball = new Ball(100, 100, BALL_RADIUS, 300);
      
      const ballBounds = ball.getBounds();
      const brickBounds = brick.getBounds();
      const result = checkCircleRectCollision(ballBounds, brickBounds);
      
      expect(result.collided).toBe(false);
    });

    it('should provide normal vector for brick collision', () => {
      const brick = new Brick(createBrickConfig(2, 4, BrickType.NORMAL));
      const brickPos = gridToPixel(2, 4);
      // Place ball above brick (approaching from top) - within collision distance
      const ball = new Ball(brickPos.x + BRICK_WIDTH / 2, brickPos.y - TEST_BALL_COLLISION_OFFSET, BALL_RADIUS, 300);
      
      const ballBounds = ball.getBounds();
      const brickBounds = brick.getBounds();
      const result = checkCircleRectCollision(ballBounds, brickBounds);
      
      expect(result.collided).toBe(true);
      expect(result.normal).toBeDefined();
      expect(result.normal?.y).toBeLessThan(0); // Normal points up
    });

    it('should bounce ball correctly off brick top', () => {
      const brick = new Brick(createBrickConfig(2, 4, BrickType.NORMAL));
      const brickPos = gridToPixel(2, 4);
      // Place ball above brick - within collision distance
      const ball = new Ball(brickPos.x + BRICK_WIDTH / 2, brickPos.y - TEST_BALL_COLLISION_OFFSET, BALL_RADIUS, 300);
      
      ball.setVelocity(0, 100); // Moving down
      
      const ballBounds = ball.getBounds();
      const brickBounds = brick.getBounds();
      const result = checkCircleRectCollision(ballBounds, brickBounds);
      
      if (result.collided && result.normal) {
        ball.bounce(result.normal);
      }
      
      const velocity = ball.getVelocity();
      expect(velocity.y).toBeLessThan(0); // Should bounce up
    });

    it('should bounce ball correctly off brick side', () => {
      const brick = new Brick(createBrickConfig(2, 4, BrickType.NORMAL));
      const brickPos = gridToPixel(2, 4);
      // Place ball to the left of brick - within collision distance
      const ball = new Ball(brickPos.x - TEST_BALL_COLLISION_OFFSET, brickPos.y + BRICK_HEIGHT / 2, BALL_RADIUS, 300);
      
      ball.setVelocity(100, 0); // Moving right
      
      const ballBounds = ball.getBounds();
      const brickBounds = brick.getBounds();
      const result = checkCircleRectCollision(ballBounds, brickBounds);
      
      if (result.collided && result.normal) {
        ball.bounce(result.normal);
      }
      
      const velocity = ball.getVelocity();
      expect(velocity.x).toBeLessThan(0); // Should bounce left
    });

    it('should damage brick on collision', () => {
      const brick = new Brick(createBrickConfig(2, 4, BrickType.HEALTHY));
      const brickPos = gridToPixel(2, 4);
      // Place ball in center of brick
      const ball = new Ball(brickPos.x + BRICK_WIDTH / 2, brickPos.y + BRICK_HEIGHT / 2, BALL_RADIUS, 300);
      
      expect(brick.getHealth()).toBe(3);
      
      const ballBounds = ball.getBounds();
      const brickBounds = brick.getBounds();
      const result = checkCircleRectCollision(ballBounds, brickBounds);
      
      if (result.collided) {
        brick.takeDamage(1);
      }
      
      expect(brick.getHealth()).toBe(2);
    });

    it('should destroy brick when health reaches 0', () => {
      const brick = new Brick(createBrickConfig(2, 4, BrickType.NORMAL));
      const brickPos = gridToPixel(2, 4);
      // Place ball in center of brick
      const ball = new Ball(brickPos.x + BRICK_WIDTH / 2, brickPos.y + BRICK_HEIGHT / 2, BALL_RADIUS, 300);
      
      expect(brick.isDestroyed()).toBe(false);
      
      const ballBounds = ball.getBounds();
      const brickBounds = brick.getBounds();
      const result = checkCircleRectCollision(ballBounds, brickBounds);
      
      if (result.collided) {
        brick.takeDamage(1);
      }
      
      expect(brick.isDestroyed()).toBe(true);
    });
  });

  describe('Ball-Wall Collisions', () => {
    it('should bounce off left wall', () => {
      const ball = new Ball(5, 300, BALL_RADIUS, 300);
      ball.setVelocity(-100, 0);
      
      const hitBackWall = ball.checkWallCollisions(0, 800, 0, 600);
      
      const position = ball.getPosition();
      const velocity = ball.getVelocity();
      
      expect(position.x).toBe(BALL_RADIUS); // Corrected position (ball radius from left wall)
      expect(velocity.x).toBeGreaterThan(0); // Reversed
      expect(hitBackWall).toBe(false);
    });

    it('should bounce off right wall', () => {
      const ball = new Ball(795, 300, BALL_RADIUS, 300);
      ball.setVelocity(100, 0);
      
      const hitBackWall = ball.checkWallCollisions(0, 800, 0, 600);
      
      const position = ball.getPosition();
      const velocity = ball.getVelocity();
      
      expect(position.x).toBe(800 - BALL_RADIUS); // Corrected position (ball radius from right wall)
      expect(velocity.x).toBeLessThan(0); // Reversed
      expect(hitBackWall).toBe(false);
    });

    it('should bounce off top wall', () => {
      const ball = new Ball(400, 5, BALL_RADIUS, 300);
      ball.setVelocity(0, -100);
      
      const hitBackWall = ball.checkWallCollisions(0, 800, 0, 600);
      
      const position = ball.getPosition();
      const velocity = ball.getVelocity();
      
      expect(position.y).toBe(BALL_RADIUS); // Corrected position (ball radius from top wall)
      expect(velocity.y).toBeGreaterThan(0); // Reversed
      expect(hitBackWall).toBe(false);
    });

    it('should detect back wall hit and return true', () => {
      const ball = new Ball(400, 595, BALL_RADIUS, 300);
      ball.setVelocity(0, 100);
      
      const hitBackWall = ball.checkWallCollisions(0, 800, 0, 600);
      
      const position = ball.getPosition();
      const velocity = ball.getVelocity();
      
      expect(position.y).toBe(600 - BALL_RADIUS); // Corrected position (ball radius from back wall)
      expect(velocity.y).toBeLessThan(0); // Reversed
      expect(hitBackWall).toBe(true); // Player loses health
    });

    it('should handle corner collisions', () => {
      const ball = new Ball(5, 5, BALL_RADIUS, 300);
      ball.setVelocity(-100, -100);
      
      ball.checkWallCollisions(0, 800, 0, 600);
      
      const velocity = ball.getVelocity();
      expect(velocity.x).toBeGreaterThan(0); // Both reversed
      expect(velocity.y).toBeGreaterThan(0);
    });

    it('should not affect ball when not near walls', () => {
      const ball = new Ball(400, 300, BALL_RADIUS, 300);
      ball.setVelocity(100, 100);
      
      const hitBackWall = ball.checkWallCollisions(0, 800, 0, 600);
      
      const velocity = ball.getVelocity();
      expect(velocity.x).toBe(100); // Unchanged
      expect(velocity.y).toBe(100);
      expect(hitBackWall).toBe(false);
    });
  });

  describe('Complex Collision Scenarios', () => {
    it('should handle ball bouncing between bat and brick', () => {
      const ball = new Ball(100, 500, BALL_RADIUS, 300);
      const bat = new Bat(50, 560, 100, 10);
      const brick = new Brick(createBrickConfig(2, 4, BrickType.NORMAL));
      
      // Ball moving down toward bat
      ball.setVelocity(0, 100);
      ball.bounceOffBat(bat);
      
      let velocity = ball.getVelocity();
      expect(velocity.y).toBeLessThan(0); // Moving up
      
      // Get brick position and move ball to collide with it from below
      const brickBounds = brick.getBounds();
      ball.setPosition(brickBounds.x + brickBounds.width / 2, brickBounds.y + brickBounds.height + 5);
      ball.setVelocity(0, -100); // Moving up toward brick
      
      const ballBounds = ball.getBounds();
      const result = checkCircleRectCollision(ballBounds, brickBounds);
      
      expect(result.collided).toBe(true); // Should collide
      
      if (result.collided && result.normal) {
        ball.bounce(result.normal);
        brick.takeDamage(1);
      }
      
      velocity = ball.getVelocity();
      expect(velocity.y).toBeGreaterThan(0); // Bounced back down
      expect(brick.isDestroyed()).toBe(true);
    });

    it('should handle multiple brick collisions', () => {
      const brick1 = new Brick(createBrickConfig(2, 4, BrickType.NORMAL));
      const brick2 = new Brick(createBrickConfig(3, 4, BrickType.NORMAL));
      const brick1Pos = gridToPixel(2, 4);
      const brick2Pos = gridToPixel(3, 4);
      
      // Place ball in center of first brick
      const ball = new Ball(brick1Pos.x + BRICK_WIDTH / 2, brick1Pos.y + BRICK_HEIGHT / 2, BALL_RADIUS, 300);
      ball.setVelocity(100, 0);
      
      // Check collision with first brick
      let ballBounds = ball.getBounds();
      let result1 = checkCircleRectCollision(ballBounds, brick1.getBounds());
      
      if (result1.collided) {
        brick1.takeDamage(1);
      }
      
      // Move ball to second brick
      ball.setPosition(brick2Pos.x + BRICK_WIDTH / 2, brick2Pos.y + BRICK_HEIGHT / 2);
      
      // Check collision with second brick
      ballBounds = ball.getBounds();
      let result2 = checkCircleRectCollision(ballBounds, brick2.getBounds());
      
      if (result2.collided) {
        brick2.takeDamage(1);
      }
      
      expect(brick1.isDestroyed()).toBe(true);
      expect(brick2.isDestroyed()).toBe(true);
    });

    it('should handle ball trapped between walls', () => {
      const ball = new Ball(5, 300, BALL_RADIUS, 300);
      ball.setVelocity(-100, 0);
      
      // First collision
      ball.checkWallCollisions(0, 800, 0, 600);
      let velocity = ball.getVelocity();
      expect(velocity.x).toBeGreaterThan(0);
      
      // Move to right wall
      ball.setPosition(795, 300);
      ball.setVelocity(100, 0);
      
      // Second collision
      ball.checkWallCollisions(0, 800, 0, 600);
      velocity = ball.getVelocity();
      expect(velocity.x).toBeLessThan(0);
    });
  });

  describe('Edge Cases', () => {
    it('should handle ball exactly at wall boundary', () => {
      const ball = new Ball(BALL_RADIUS, 300, BALL_RADIUS, 300);
      ball.setVelocity(0, 100);
      
      const hitBackWall = ball.checkWallCollisions(0, 800, 0, 600);
      
      expect(hitBackWall).toBe(false);
    });

    it('should handle zero velocity collisions', () => {
      const ball = new Ball(100, 100, BALL_RADIUS, 300);
      const brick = new Brick(createBrickConfig(2, 4, BrickType.NORMAL));
      
      ball.setVelocity(0, 0);
      
      const ballBounds = ball.getBounds();
      const brickBounds = brick.getBounds();
      const result = checkCircleRectCollision(ballBounds, brickBounds);
      
      if (result.collided && result.normal) {
        ball.bounce(result.normal);
      }
      
      // Ball should remain stationary
      const velocity = ball.getVelocity();
      expect(velocity.x).toBe(0);
      expect(velocity.y).toBe(0);
    });

    it('should handle very high speed collisions', () => {
      const ball = new Ball(400, 550, BALL_RADIUS, 300);
      const bat = new Bat(350, 560, 100, 10);
      
      ball.setVelocity(1000, 1000);
      ball.bounceOffBat(bat);
      
      const velocity = ball.getVelocity();
      expect(velocity.y).toBeLessThan(0); // Should still bounce up
    });
  });
});
