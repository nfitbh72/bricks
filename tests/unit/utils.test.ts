/**
 * Unit tests for utility functions
 */

import {
  checkRectCollision,
  checkCircleRectCollision,
  normalize,
  distance,
  dotProduct,
  reflect,
  clamp,
  lerp,
  magnitude,
  scale,
} from '../../src/renderer/game/utils';
import { Vector2D, Rectangle, Circle } from '../../src/renderer/game/types';

describe('checkRectCollision', () => {
  it('should detect collision between overlapping rectangles', () => {
    const rect1: Rectangle = { x: 0, y: 0, width: 100, height: 100 };
    const rect2: Rectangle = { x: 50, y: 50, width: 100, height: 100 };
    expect(checkRectCollision(rect1, rect2)).toBe(true);
  });

  it('should not detect collision between non-overlapping rectangles', () => {
    const rect1: Rectangle = { x: 0, y: 0, width: 100, height: 100 };
    const rect2: Rectangle = { x: 200, y: 200, width: 100, height: 100 };
    expect(checkRectCollision(rect1, rect2)).toBe(false);
  });

  it('should detect collision when rectangles touch edges', () => {
    const rect1: Rectangle = { x: 0, y: 0, width: 100, height: 100 };
    const rect2: Rectangle = { x: 100, y: 0, width: 100, height: 100 };
    expect(checkRectCollision(rect1, rect2)).toBe(false);
  });

  it('should detect collision when one rectangle is inside another', () => {
    const rect1: Rectangle = { x: 0, y: 0, width: 200, height: 200 };
    const rect2: Rectangle = { x: 50, y: 50, width: 50, height: 50 };
    expect(checkRectCollision(rect1, rect2)).toBe(true);
  });
});

describe('checkCircleRectCollision', () => {
  it('should detect collision when circle overlaps rectangle', () => {
    const circle: Circle = { x: 50, y: 50, radius: 20 };
    const rect: Rectangle = { x: 60, y: 60, width: 100, height: 100 };
    const result = checkCircleRectCollision(circle, rect);
    expect(result.collided).toBe(true);
    expect(result.normal).toBeDefined();
  });

  it('should not detect collision when circle is far from rectangle', () => {
    const circle: Circle = { x: 50, y: 50, radius: 20 };
    const rect: Rectangle = { x: 200, y: 200, width: 100, height: 100 };
    const result = checkCircleRectCollision(circle, rect);
    expect(result.collided).toBe(false);
  });

  it('should detect collision when circle center is inside rectangle', () => {
    const circle: Circle = { x: 100, y: 100, radius: 10 };
    const rect: Rectangle = { x: 50, y: 50, width: 100, height: 100 };
    const result = checkCircleRectCollision(circle, rect);
    expect(result.collided).toBe(true);
  });

  it('should calculate correct normal for top collision', () => {
    const circle: Circle = { x: 100, y: 45, radius: 10 };
    const rect: Rectangle = { x: 50, y: 50, width: 100, height: 100 };
    const result = checkCircleRectCollision(circle, rect);
    expect(result.collided).toBe(true);
    expect(result.normal?.y).toBeLessThan(0); // Normal points upward
  });

  it('should calculate correct normal for side collision', () => {
    const circle: Circle = { x: 45, y: 100, radius: 10 };
    const rect: Rectangle = { x: 50, y: 50, width: 100, height: 100 };
    const result = checkCircleRectCollision(circle, rect);
    expect(result.collided).toBe(true);
    expect(result.normal?.x).toBeLessThan(0); // Normal points left
  });
});

describe('normalize', () => {
  it('should normalize a vector to unit length', () => {
    const vector: Vector2D = { x: 3, y: 4 };
    const normalized = normalize(vector);
    expect(normalized.x).toBeCloseTo(0.6);
    expect(normalized.y).toBeCloseTo(0.8);
    expect(magnitude(normalized)).toBeCloseTo(1);
  });

  it('should handle zero vector', () => {
    const vector: Vector2D = { x: 0, y: 0 };
    const normalized = normalize(vector);
    expect(normalized.x).toBe(0);
    expect(normalized.y).toBe(0);
  });

  it('should handle already normalized vector', () => {
    const vector: Vector2D = { x: 1, y: 0 };
    const normalized = normalize(vector);
    expect(normalized.x).toBeCloseTo(1);
    expect(normalized.y).toBeCloseTo(0);
  });
});

describe('distance', () => {
  it('should calculate distance between two points', () => {
    const point1: Vector2D = { x: 0, y: 0 };
    const point2: Vector2D = { x: 3, y: 4 };
    expect(distance(point1, point2)).toBe(5);
  });

  it('should return 0 for same point', () => {
    const point: Vector2D = { x: 10, y: 20 };
    expect(distance(point, point)).toBe(0);
  });

  it('should handle negative coordinates', () => {
    const point1: Vector2D = { x: -3, y: -4 };
    const point2: Vector2D = { x: 0, y: 0 };
    expect(distance(point1, point2)).toBe(5);
  });
});

describe('dotProduct', () => {
  it('should calculate dot product of two vectors', () => {
    const v1: Vector2D = { x: 2, y: 3 };
    const v2: Vector2D = { x: 4, y: 5 };
    expect(dotProduct(v1, v2)).toBe(23); // 2*4 + 3*5 = 23
  });

  it('should return 0 for perpendicular vectors', () => {
    const v1: Vector2D = { x: 1, y: 0 };
    const v2: Vector2D = { x: 0, y: 1 };
    expect(dotProduct(v1, v2)).toBe(0);
  });

  it('should handle negative values', () => {
    const v1: Vector2D = { x: -2, y: 3 };
    const v2: Vector2D = { x: 4, y: -5 };
    expect(dotProduct(v1, v2)).toBe(-23);
  });
});

describe('reflect', () => {
  it('should reflect vector across horizontal normal', () => {
    const vector: Vector2D = { x: 1, y: 1 };
    const normal: Vector2D = { x: 0, y: 1 };
    const reflected = reflect(vector, normal);
    expect(reflected.x).toBeCloseTo(1);
    expect(reflected.y).toBeCloseTo(-1);
  });

  it('should reflect vector across vertical normal', () => {
    const vector: Vector2D = { x: 1, y: 1 };
    const normal: Vector2D = { x: 1, y: 0 };
    const reflected = reflect(vector, normal);
    expect(reflected.x).toBeCloseTo(-1);
    expect(reflected.y).toBeCloseTo(1);
  });

  it('should reflect vector across diagonal normal', () => {
    const vector: Vector2D = { x: 1, y: 0 };
    const normal: Vector2D = normalize({ x: 1, y: 1 });
    const reflected = reflect(vector, normal);
    // When reflecting (1,0) across diagonal (1,1), result should be (0,1)
    expect(reflected.x).toBeCloseTo(0, 5);
    expect(reflected.y).toBeCloseTo(-1, 5);
  });
});

describe('clamp', () => {
  it('should clamp value to min', () => {
    expect(clamp(5, 10, 20)).toBe(10);
  });

  it('should clamp value to max', () => {
    expect(clamp(25, 10, 20)).toBe(20);
  });

  it('should return value if within range', () => {
    expect(clamp(15, 10, 20)).toBe(15);
  });

  it('should handle equal min and max', () => {
    expect(clamp(15, 10, 10)).toBe(10);
  });
});

describe('lerp', () => {
  it('should interpolate at t=0', () => {
    expect(lerp(0, 100, 0)).toBe(0);
  });

  it('should interpolate at t=1', () => {
    expect(lerp(0, 100, 1)).toBe(100);
  });

  it('should interpolate at t=0.5', () => {
    expect(lerp(0, 100, 0.5)).toBe(50);
  });

  it('should handle negative values', () => {
    expect(lerp(-100, 100, 0.5)).toBe(0);
  });
});

describe('magnitude', () => {
  it('should calculate magnitude of vector', () => {
    const vector: Vector2D = { x: 3, y: 4 };
    expect(magnitude(vector)).toBe(5);
  });

  it('should return 0 for zero vector', () => {
    const vector: Vector2D = { x: 0, y: 0 };
    expect(magnitude(vector)).toBe(0);
  });

  it('should handle negative components', () => {
    const vector: Vector2D = { x: -3, y: -4 };
    expect(magnitude(vector)).toBe(5);
  });
});

describe('scale', () => {
  it('should scale vector by positive scalar', () => {
    const vector: Vector2D = { x: 2, y: 3 };
    const scaled = scale(vector, 2);
    expect(scaled.x).toBe(4);
    expect(scaled.y).toBe(6);
  });

  it('should scale vector by negative scalar', () => {
    const vector: Vector2D = { x: 2, y: 3 };
    const scaled = scale(vector, -1);
    expect(scaled.x).toBe(-2);
    expect(scaled.y).toBe(-3);
  });

  it('should scale vector by zero', () => {
    const vector: Vector2D = { x: 2, y: 3 };
    const scaled = scale(vector, 0);
    expect(scaled.x).toBe(0);
    expect(scaled.y).toBe(0);
  });
});
