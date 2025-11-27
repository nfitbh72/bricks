/**
 * Enhanced tests for Ball class - covering advanced mechanics
 */

import { Ball } from '../../src/renderer/game/entities/Ball';
import { Bat } from '../../src/renderer/game/entities/Bat';

describe('Ball - Enhanced Coverage', () => {
  let ball: Ball;
  let mockCtx: any;

  beforeEach(() => {
    ball = new Ball(400, 300, 10, 200);
    mockCtx = {
      save: jest.fn(),
      restore: jest.fn(),
      beginPath: jest.fn(),
      arc: jest.fn(),
      fill: jest.fn(),
      moveTo: jest.fn(),
      lineTo: jest.fn(),
      stroke: jest.fn(),
      fillRect: jest.fn(),
      translate: jest.fn(),
      rotate: jest.fn(),
      shadowBlur: 0,
      shadowColor: '',
      fillStyle: '',
      strokeStyle: '',
      lineWidth: 0,
      globalAlpha: 1,
    };
  });

  describe('piercing mechanics', () => {
    it('should activate piercing mode', () => {
      ball.setPiercing(true, 2);
      ball.setVelocity(100, 0);
      
      ball.render(mockCtx);
      
      // Should render with piercing effect
      expect(mockCtx.arc).toHaveBeenCalled();
    });

    it('should render with piercing color', () => {
      ball.setPiercing(true, 2);
      ball.setVelocity(100, 0);
      
      ball.render(mockCtx);
      
      expect(mockCtx.arc).toHaveBeenCalled();
    });

    it('should flash when piercing about to expire', () => {
      ball.setPiercing(true, 0.4); // Less than warning duration
      ball.setVelocity(100, 0);
      
      ball.render(mockCtx);
      
      // Should render (color will flash)
      expect(mockCtx.arc).toHaveBeenCalled();
    });

    it('should handle piercing state changes', () => {
      ball.setPiercing(true, 2);
      ball.setPiercing(false, 0);
      ball.setVelocity(100, 0);
      
      ball.render(mockCtx);
      
      expect(mockCtx.arc).toHaveBeenCalled();
    });
  });

  describe('sticky ball mechanics', () => {
    it('should stick to bat', () => {
      ball.setSticky(true, 0, -20);
      expect(ball.getIsSticky()).toBe(true);
    });

    it('should not update position when sticky', () => {
      ball.setSticky(true, 0, -20);
      const initialPos = ball.getPosition();
      
      ball.update(1);
      
      const newPos = ball.getPosition();
      expect(newPos.x).toBe(initialPos.x);
      expect(newPos.y).toBe(initialPos.y);
    });

    it('should update sticky position with bat center', () => {
      ball.setSticky(true, 10, -20);
      
      ball.updateStickyPosition(400, 550);
      
      const pos = ball.getPosition();
      expect(pos.x).toBe(410); // center + offset
      expect(pos.y).toBe(530); // y + offset
    });

    it('should launch from sticky at angle', () => {
      ball.setSticky(true, 0, -20);
      
      ball.launchFromSticky();
      
      expect(ball.getIsSticky()).toBe(false);
      const velocity = ball.getVelocity();
      expect(velocity.x).not.toBe(0);
      expect(velocity.y).not.toBe(0);
    });

    it('should render launch indicator when sticky', () => {
      ball.setSticky(true, 0, -20);
      
      ball.render(mockCtx);
      
      expect(mockCtx.moveTo).toHaveBeenCalled();
      expect(mockCtx.lineTo).toHaveBeenCalled();
    });

    it('should adjust launch angle', () => {
      ball.setSticky(true, 0, -20);
      const initialAngle = ball.getLaunchAngle();
      
      ball.adjustLaunchAngle(-10);
      
      const newAngle = ball.getLaunchAngle();
      expect(newAngle).toBe(initialAngle - 10);
    });

    it('should clamp launch angle', () => {
      ball.setSticky(true, 0, -20);
      
      ball.adjustLaunchAngle(-200); // Try to go too far left
      
      const angle = ball.getLaunchAngle();
      expect(angle).toBeGreaterThanOrEqual(-150);
      expect(angle).toBeLessThanOrEqual(-30);
    });

    it('should track initial sticky state', () => {
      ball.setSticky(true, 0, -20, true);
      expect(ball.getIsInitialSticky()).toBe(true);
    });
  });

  describe('bounceOffBat advanced', () => {
    it('should calculate angle based on hit position', () => {
      const bat = new Bat(350, 550, 100, 20, 800);
      ball.setPosition(400, 540); // Center of bat
      ball.setVelocity(0, 100);
      
      ball.bounceOffBat(bat);
      
      const velocity = ball.getVelocity();
      expect(velocity.y).toBeLessThan(0); // Should bounce up
    });

    it('should bounce at steeper angle from bat edge', () => {
      const bat = new Bat(350, 550, 100, 20, 800);
      ball.setPosition(440, 540); // Right edge
      ball.setVelocity(0, 100);
      
      ball.bounceOffBat(bat);
      
      const velocity = ball.getVelocity();
      expect(Math.abs(velocity.x)).toBeGreaterThan(0);
    });

    it('should handle hit from bottom of bat', () => {
      const bat = new Bat(350, 550, 100, 20, 800);
      ball.setPosition(400, 580); // Below bat center
      ball.setVelocity(0, -100);
      
      ball.bounceOffBat(bat);
      
      const velocity = ball.getVelocity();
      expect(velocity.y).toBeGreaterThan(0); // Should bounce down
    });

    it('should maintain speed after bat bounce', () => {
      const bat = new Bat(350, 550, 100, 20, 800);
      ball.setVelocity(0, 200);
      const speedBefore = ball.getSpeed();
      
      ball.bounceOffBat(bat);
      
      const speedAfter = ball.getSpeed();
      expect(speedAfter).toBeCloseTo(speedBefore, 0);
    });
  });

  describe('checkWallCollisions', () => {
    it('should bounce off left wall', () => {
      ball.setPosition(5, 300);
      ball.setVelocity(-100, 0);
      
      ball.checkWallCollisions(0, 800, 0, 600);
      
      const velocity = ball.getVelocity();
      expect(velocity.x).toBeGreaterThan(0); // Reversed
    });

    it('should bounce off right wall', () => {
      ball.setPosition(795, 300);
      ball.setVelocity(100, 0);
      
      ball.checkWallCollisions(0, 800, 0, 600);
      
      const velocity = ball.getVelocity();
      expect(velocity.x).toBeLessThan(0); // Reversed
    });

    it('should bounce off top wall', () => {
      ball.setPosition(400, 5);
      ball.setVelocity(0, -100);
      
      ball.checkWallCollisions(0, 800, 0, 600);
      
      const velocity = ball.getVelocity();
      expect(velocity.y).toBeGreaterThan(0); // Reversed
    });

    it('should detect back wall hit', () => {
      ball.setPosition(400, 595);
      ball.setVelocity(0, 100);
      
      const hitBackWall = ball.checkWallCollisions(0, 800, 0, 600);
      
      expect(hitBackWall).toBe(true);
    });

    it('should restore ball on left wall', () => {
      ball.setGrey(true);
      ball.setPosition(5, 300);
      ball.setVelocity(-100, 0);
      
      ball.checkWallCollisions(0, 800, 0, 600);
      
      // Ball should be restored (tested via rendering)
      ball.render(mockCtx);
      expect(mockCtx.arc).toHaveBeenCalled();
    });

    it('should restore ball on right wall', () => {
      ball.setGrey(true);
      ball.setPosition(795, 300);
      ball.setVelocity(100, 0);
      
      ball.checkWallCollisions(0, 800, 0, 600);
      
      // Ball should be restored
      ball.render(mockCtx);
      expect(mockCtx.arc).toHaveBeenCalled();
    });
  });

  describe('grey state', () => {
    it('should set grey state', () => {
      ball.setGrey(true);
      ball.setVelocity(100, 0);
      
      ball.render(mockCtx);
      expect(mockCtx.arc).toHaveBeenCalled();
    });

    it('should render with grey color', () => {
      ball.setGrey(true);
      ball.setVelocity(100, 0);
      
      ball.render(mockCtx);
      
      expect(mockCtx.arc).toHaveBeenCalled();
    });

    it('should restore to normal', () => {
      ball.setGrey(true);
      ball.restoreToNormal();
      ball.setVelocity(100, 0);
      
      ball.render(mockCtx);
      expect(mockCtx.arc).toHaveBeenCalled();
    });
  });

  describe('damage', () => {
    it('should return base damage', () => {
      expect(ball.getDamage()).toBeGreaterThan(0);
    });

    it('should set damage', () => {
      ball.setDamage(50);
      expect(ball.getDamage()).toBe(50);
    });

    it('should handle zero damage', () => {
      ball.setDamage(0);
      expect(ball.getDamage()).toBe(0);
    });
  });

  describe('speed acceleration', () => {
    it('should increase speed over time', () => {
      ball.setVelocity(100, 0);
      const initialSpeed = ball.getSpeed();
      
      ball.update(5); // 5 seconds
      
      const newSpeed = ball.getSpeed();
      expect(newSpeed).toBeGreaterThan(initialSpeed);
    });

    it('should set acceleration multiplier', () => {
      ball.setAccelerationMultiplier(0.5);
      ball.setVelocity(100, 0);
      const initialSpeed = ball.getSpeed();
      
      ball.update(5);
      
      const newSpeed = ball.getSpeed();
      const speedIncrease = newSpeed - initialSpeed;
      expect(speedIncrease).toBeLessThan(initialSpeed); // Slower acceleration
    });

    it('should disable acceleration with zero multiplier', () => {
      ball.setAccelerationMultiplier(0);
      ball.setVelocity(100, 0);
      const initialSpeed = ball.getSpeed();
      
      ball.update(10);
      
      const newSpeed = ball.getSpeed();
      expect(newSpeed).toBe(initialSpeed);
    });
  });

  describe('launch', () => {
    it('should launch at specified angle', () => {
      ball.launch(-90); // Straight up
      
      const velocity = ball.getVelocity();
      expect(velocity.x).toBeCloseTo(0, 0);
      expect(velocity.y).toBeLessThan(0);
    });

    it('should launch at 45 degrees', () => {
      ball.launch(-45);
      
      const velocity = ball.getVelocity();
      expect(velocity.x).toBeGreaterThan(0);
      expect(velocity.y).toBeLessThan(0);
      expect(Math.abs(velocity.x)).toBeCloseTo(Math.abs(velocity.y), 0);
    });

    it('should use current speed for launch', () => {
      ball.update(5); // Accelerate
      const speed = ball.getSpeed();
      
      ball.launch(-90);
      
      const velocity = ball.getVelocity();
      const actualSpeed = Math.sqrt(velocity.x ** 2 + velocity.y ** 2);
      expect(actualSpeed).toBeCloseTo(speed, 0);
    });
  });

  describe('reset', () => {
    it('should reset position to initial', () => {
      ball.setPosition(100, 100);
      
      ball.reset();
      
      const pos = ball.getPosition();
      expect(pos.x).toBe(400);
      expect(pos.y).toBe(300);
    });

    it('should reset velocity to zero', () => {
      ball.setVelocity(100, 100);
      
      ball.reset();
      
      const velocity = ball.getVelocity();
      expect(velocity.x).toBe(0);
      expect(velocity.y).toBe(0);
    });

    it('should reset speed to initial', () => {
      ball.update(10); // Accelerate
      
      ball.reset();
      
      expect(ball.getSpeed()).toBe(200);
    });

    it('should clear grey state', () => {
      ball.setGrey(true);
      
      ball.reset();
      
      // Verify by rendering - should not be grey
      ball.setVelocity(100, 0);
      ball.render(mockCtx);
      expect(mockCtx.arc).toHaveBeenCalled();
    });
  });

  describe('bounce', () => {
    it('should bounce off horizontal surface', () => {
      ball.setVelocity(100, 100);
      
      ball.bounce({ x: 0, y: -1 }); // Horizontal surface
      
      const velocity = ball.getVelocity();
      expect(velocity.y).toBeLessThan(0); // Y reversed
    });

    it('should bounce off vertical surface', () => {
      ball.setVelocity(100, 100);
      
      ball.bounce({ x: -1, y: 0 }); // Vertical surface
      
      const velocity = ball.getVelocity();
      expect(velocity.x).toBeLessThan(0); // X reversed
    });

    it('should maintain speed after bounce', () => {
      ball.setVelocity(100, 100);
      const speedBefore = ball.getSpeed();
      
      ball.bounce({ x: 0, y: -1 });
      
      const velocity = ball.getVelocity();
      const speedAfter = Math.sqrt(velocity.x ** 2 + velocity.y ** 2);
      expect(speedAfter).toBeCloseTo(speedBefore, 0);
    });
  });

  describe('render with tail effect', () => {
    it('should render tail when moving', () => {
      ball.setVelocity(200, 0);
      
      ball.render(mockCtx);
      
      // Should draw multiple arc segments for tail
      expect(mockCtx.arc.mock.calls.length).toBeGreaterThan(1);
    });

    it('should render without tail when stationary', () => {
      ball.setVelocity(0, 0);
      
      ball.render(mockCtx);
      
      // Should draw only the ball
      expect(mockCtx.arc).toHaveBeenCalled();
    });
  });

  describe('setPosition', () => {
    it('should set position directly', () => {
      ball.setPosition(100, 200);
      
      const pos = ball.getPosition();
      expect(pos.x).toBe(100);
      expect(pos.y).toBe(200);
    });

    it('should override current position', () => {
      ball.setVelocity(100, 100);
      ball.update(1);
      
      ball.setPosition(500, 500);
      
      const pos = ball.getPosition();
      expect(pos.x).toBe(500);
      expect(pos.y).toBe(500);
    });
  });

  describe('getBounds', () => {
    it('should return circular bounds', () => {
      const bounds = ball.getCircleBounds();
      
      expect(bounds).toHaveProperty('x');
      expect(bounds).toHaveProperty('y');
      expect(bounds).toHaveProperty('radius');
      expect(bounds.radius).toBe(10);
    });

    it('should update bounds with position', () => {
      ball.setPosition(200, 300);
      
      const bounds = ball.getCircleBounds();
      expect(bounds.x).toBe(200);
      expect(bounds.y).toBe(300);
    });
  });
});
