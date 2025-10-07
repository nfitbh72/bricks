/**
 * Unit tests for Ball class
 */

import { Ball } from '../../src/renderer/game/Ball';

describe('Ball', () => {
  describe('constructor', () => {
    it('should initialize with correct position', () => {
      const ball = new Ball(100, 200, 10, 5);
      const position = ball.getPosition();
      expect(position.x).toBe(100);
      expect(position.y).toBe(200);
    });

    it('should initialize with correct radius', () => {
      const ball = new Ball(100, 200, 10, 5);
      expect(ball.getRadius()).toBe(10);
    });

    it('should initialize with correct speed', () => {
      const ball = new Ball(100, 200, 10, 5);
      expect(ball.getSpeed()).toBe(5);
    });

    it('should initialize with zero velocity', () => {
      const ball = new Ball(100, 200, 10, 5);
      const velocity = ball.getVelocity();
      expect(velocity.x).toBe(0);
      expect(velocity.y).toBe(0);
    });
  });

  describe('setVelocity', () => {
    it('should set velocity correctly', () => {
      const ball = new Ball(100, 200, 10, 5);
      ball.setVelocity(3, 4);
      const velocity = ball.getVelocity();
      expect(velocity.x).toBe(3);
      expect(velocity.y).toBe(4);
    });

    it('should handle negative velocities', () => {
      const ball = new Ball(100, 200, 10, 5);
      ball.setVelocity(-3, -4);
      const velocity = ball.getVelocity();
      expect(velocity.x).toBe(-3);
      expect(velocity.y).toBe(-4);
    });

    it('should handle zero velocity', () => {
      const ball = new Ball(100, 200, 10, 5);
      ball.setVelocity(5, 5);
      ball.setVelocity(0, 0);
      const velocity = ball.getVelocity();
      expect(velocity.x).toBe(0);
      expect(velocity.y).toBe(0);
    });
  });

  describe('update', () => {
    it('should update position based on velocity and deltaTime', () => {
      const ball = new Ball(100, 200, 10, 5);
      ball.setVelocity(10, 20);
      ball.update(1); // 1 second
      const position = ball.getPosition();
      expect(position.x).toBe(110);
      expect(position.y).toBe(220);
    });

    it('should handle fractional deltaTime', () => {
      const ball = new Ball(100, 200, 10, 5);
      ball.setVelocity(10, 20);
      ball.update(0.5); // 0.5 seconds
      const position = ball.getPosition();
      expect(position.x).toBe(105);
      expect(position.y).toBe(210);
    });

    it('should handle negative velocity', () => {
      const ball = new Ball(100, 200, 10, 5);
      ball.setVelocity(-10, -20);
      ball.update(1);
      const position = ball.getPosition();
      expect(position.x).toBe(90);
      expect(position.y).toBe(180);
    });

    it('should accumulate position over multiple updates', () => {
      const ball = new Ball(100, 200, 10, 5);
      ball.setVelocity(10, 20);
      ball.update(0.5);
      ball.update(0.5);
      const position = ball.getPosition();
      expect(position.x).toBe(110);
      expect(position.y).toBe(220);
    });

    it('should not move when velocity is zero', () => {
      const ball = new Ball(100, 200, 10, 5);
      ball.setVelocity(0, 0);
      ball.update(1);
      const position = ball.getPosition();
      expect(position.x).toBe(100);
      expect(position.y).toBe(200);
    });
  });

  describe('reverseX', () => {
    it('should reverse horizontal velocity', () => {
      const ball = new Ball(100, 200, 10, 5);
      ball.setVelocity(10, 20);
      ball.reverseX();
      const velocity = ball.getVelocity();
      expect(velocity.x).toBe(-10);
      expect(velocity.y).toBe(20);
    });

    it('should reverse negative horizontal velocity', () => {
      const ball = new Ball(100, 200, 10, 5);
      ball.setVelocity(-10, 20);
      ball.reverseX();
      const velocity = ball.getVelocity();
      expect(velocity.x).toBe(10);
      expect(velocity.y).toBe(20);
    });

    it('should handle multiple reversals', () => {
      const ball = new Ball(100, 200, 10, 5);
      ball.setVelocity(10, 20);
      ball.reverseX();
      ball.reverseX();
      const velocity = ball.getVelocity();
      expect(velocity.x).toBe(10);
      expect(velocity.y).toBe(20);
    });
  });

  describe('reverseY', () => {
    it('should reverse vertical velocity', () => {
      const ball = new Ball(100, 200, 10, 5);
      ball.setVelocity(10, 20);
      ball.reverseY();
      const velocity = ball.getVelocity();
      expect(velocity.x).toBe(10);
      expect(velocity.y).toBe(-20);
    });

    it('should reverse negative vertical velocity', () => {
      const ball = new Ball(100, 200, 10, 5);
      ball.setVelocity(10, -20);
      ball.reverseY();
      const velocity = ball.getVelocity();
      expect(velocity.x).toBe(10);
      expect(velocity.y).toBe(20);
    });

    it('should handle multiple reversals', () => {
      const ball = new Ball(100, 200, 10, 5);
      ball.setVelocity(10, 20);
      ball.reverseY();
      ball.reverseY();
      const velocity = ball.getVelocity();
      expect(velocity.x).toBe(10);
      expect(velocity.y).toBe(20);
    });
  });

  describe('reset', () => {
    it('should reset position to initial position', () => {
      const ball = new Ball(100, 200, 10, 5);
      ball.setVelocity(10, 20);
      ball.update(1);
      ball.reset();
      const position = ball.getPosition();
      expect(position.x).toBe(100);
      expect(position.y).toBe(200);
    });

    it('should reset velocity to zero', () => {
      const ball = new Ball(100, 200, 10, 5);
      ball.setVelocity(10, 20);
      ball.reset();
      const velocity = ball.getVelocity();
      expect(velocity.x).toBe(0);
      expect(velocity.y).toBe(0);
    });

    it('should allow ball to be moved again after reset', () => {
      const ball = new Ball(100, 200, 10, 5);
      ball.setVelocity(10, 20);
      ball.update(1);
      ball.reset();
      ball.setVelocity(5, 10);
      ball.update(1);
      const position = ball.getPosition();
      expect(position.x).toBe(105);
      expect(position.y).toBe(210);
    });
  });

  describe('launch', () => {
    it('should launch ball at 0 degrees (right)', () => {
      const ball = new Ball(100, 200, 10, 5);
      ball.launch(0);
      const velocity = ball.getVelocity();
      expect(velocity.x).toBeCloseTo(5, 5);
      expect(velocity.y).toBeCloseTo(0, 5);
    });

    it('should launch ball at 90 degrees (up)', () => {
      const ball = new Ball(100, 200, 10, 5);
      ball.launch(90);
      const velocity = ball.getVelocity();
      expect(velocity.x).toBeCloseTo(0, 5);
      expect(velocity.y).toBeCloseTo(5, 5);
    });

    it('should launch ball at 180 degrees (left)', () => {
      const ball = new Ball(100, 200, 10, 5);
      ball.launch(180);
      const velocity = ball.getVelocity();
      expect(velocity.x).toBeCloseTo(-5, 5);
      expect(velocity.y).toBeCloseTo(0, 5);
    });

    it('should launch ball at 270 degrees (down)', () => {
      const ball = new Ball(100, 200, 10, 5);
      ball.launch(270);
      const velocity = ball.getVelocity();
      expect(velocity.x).toBeCloseTo(0, 5);
      expect(velocity.y).toBeCloseTo(-5, 5);
    });

    it('should launch ball at 45 degrees (diagonal)', () => {
      const ball = new Ball(100, 200, 10, 5);
      ball.launch(45);
      const velocity = ball.getVelocity();
      expect(velocity.x).toBeCloseTo(3.535, 2);
      expect(velocity.y).toBeCloseTo(3.535, 2);
    });

    it('should launch ball at negative angle', () => {
      const ball = new Ball(100, 200, 10, 5);
      ball.launch(-45);
      const velocity = ball.getVelocity();
      expect(velocity.x).toBeCloseTo(3.535, 2);
      expect(velocity.y).toBeCloseTo(-3.535, 2);
    });

    it('should use ball speed for velocity magnitude', () => {
      const ball = new Ball(100, 200, 10, 10);
      ball.launch(0);
      const velocity = ball.getVelocity();
      expect(velocity.x).toBeCloseTo(10, 5);
    });
  });

  describe('setPosition', () => {
    it('should set position directly', () => {
      const ball = new Ball(100, 200, 10, 5);
      ball.setPosition(300, 400);
      const position = ball.getPosition();
      expect(position.x).toBe(300);
      expect(position.y).toBe(400);
    });

    it('should allow negative positions', () => {
      const ball = new Ball(100, 200, 10, 5);
      ball.setPosition(-50, -100);
      const position = ball.getPosition();
      expect(position.x).toBe(-50);
      expect(position.y).toBe(-100);
    });

    it('should not affect velocity', () => {
      const ball = new Ball(100, 200, 10, 5);
      ball.setVelocity(10, 20);
      ball.setPosition(300, 400);
      const velocity = ball.getVelocity();
      expect(velocity.x).toBe(10);
      expect(velocity.y).toBe(20);
    });
  });

  describe('getBounds', () => {
    it('should return correct bounds', () => {
      const ball = new Ball(100, 200, 10, 5);
      const bounds = ball.getBounds();
      expect(bounds.x).toBe(100);
      expect(bounds.y).toBe(200);
      expect(bounds.radius).toBe(10);
    });

    it('should update bounds after position change', () => {
      const ball = new Ball(100, 200, 10, 5);
      ball.setPosition(300, 400);
      const bounds = ball.getBounds();
      expect(bounds.x).toBe(300);
      expect(bounds.y).toBe(400);
      expect(bounds.radius).toBe(10);
    });
  });

  describe('getPosition', () => {
    it('should return a copy of position (not reference)', () => {
      const ball = new Ball(100, 200, 10, 5);
      const position1 = ball.getPosition();
      position1.x = 999;
      const position2 = ball.getPosition();
      expect(position2.x).toBe(100);
    });
  });

  describe('getVelocity', () => {
    it('should return a copy of velocity (not reference)', () => {
      const ball = new Ball(100, 200, 10, 5);
      ball.setVelocity(10, 20);
      const velocity1 = ball.getVelocity();
      velocity1.x = 999;
      const velocity2 = ball.getVelocity();
      expect(velocity2.x).toBe(10);
    });
  });

  describe('render', () => {
    it('should not throw when rendering', () => {
      const ball = new Ball(100, 200, 10, 5);
      const mockCtx = {
        save: jest.fn(),
        restore: jest.fn(),
        beginPath: jest.fn(),
        arc: jest.fn(),
        fill: jest.fn(),
        shadowBlur: 0,
        shadowColor: '',
        fillStyle: '',
      } as unknown as CanvasRenderingContext2D;
      
      expect(() => ball.render(mockCtx)).not.toThrow();
    });

    it('should call canvas methods for drawing', () => {
      const ball = new Ball(100, 200, 10, 5);
      const mockCtx = {
        save: jest.fn(),
        restore: jest.fn(),
        beginPath: jest.fn(),
        arc: jest.fn(),
        fill: jest.fn(),
        shadowBlur: 0,
        shadowColor: '',
        fillStyle: '',
      } as unknown as CanvasRenderingContext2D;
      
      ball.render(mockCtx);
      
      expect(mockCtx.save).toHaveBeenCalled();
      expect(mockCtx.arc).toHaveBeenCalledWith(100, 200, 10, 0, Math.PI * 2);
      expect(mockCtx.fill).toHaveBeenCalled();
      expect(mockCtx.restore).toHaveBeenCalled();
    });
  });
});
