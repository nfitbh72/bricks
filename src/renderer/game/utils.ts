/**
 * Utility functions for game physics and collision detection
 */

import { Vector2D, Rectangle, Circle, CollisionResult } from './types';

/**
 * Check collision between two rectangles (AABB collision)
 */
export function checkRectCollision(rect1: Rectangle, rect2: Rectangle): boolean {
  return (
    rect1.x < rect2.x + rect2.width &&
    rect1.x + rect1.width > rect2.x &&
    rect1.y < rect2.y + rect2.height &&
    rect1.y + rect1.height > rect2.y
  );
}

/**
 * Check collision between a circle and a rectangle
 * Returns collision result with normal vector for bounce calculation
 */
export function checkCircleRectCollision(
  circle: Circle,
  rect: Rectangle
): CollisionResult {
  // Find the closest point on the rectangle to the circle center
  const closestX = Math.max(rect.x, Math.min(circle.x, rect.x + rect.width));
  const closestY = Math.max(rect.y, Math.min(circle.y, rect.y + rect.height));

  // Calculate distance between circle center and closest point
  const distanceX = circle.x - closestX;
  const distanceY = circle.y - closestY;
  const distanceSquared = distanceX * distanceX + distanceY * distanceY;

  // Check if distance is less than radius (collision occurred)
  if (distanceSquared < circle.radius * circle.radius) {
    const distance = Math.sqrt(distanceSquared);
    const penetration = circle.radius - distance;

    // Calculate normal vector (direction to push circle out)
    let normal: Vector2D;
    if (distance > 0) {
      normal = {
        x: distanceX / distance,
        y: distanceY / distance,
      };
    } else {
      // Circle center is inside rectangle, use closest edge
      const dx1 = circle.x - rect.x;
      const dx2 = rect.x + rect.width - circle.x;
      const dy1 = circle.y - rect.y;
      const dy2 = rect.y + rect.height - circle.y;

      const minDist = Math.min(dx1, dx2, dy1, dy2);

      if (minDist === dx1) normal = { x: -1, y: 0 };
      else if (minDist === dx2) normal = { x: 1, y: 0 };
      else if (minDist === dy1) normal = { x: 0, y: -1 };
      else normal = { x: 0, y: 1 };
    }

    return {
      collided: true,
      normal,
      penetration,
    };
  }

  return { collided: false };
}

/**
 * Normalize a vector to unit length
 */
export function normalize(vector: Vector2D): Vector2D {
  const length = Math.sqrt(vector.x * vector.x + vector.y * vector.y);
  if (length === 0) {
    return { x: 0, y: 0 };
  }
  return {
    x: vector.x / length,
    y: vector.y / length,
  };
}

/**
 * Calculate distance between two points
 */
export function distance(point1: Vector2D, point2: Vector2D): number {
  const dx = point2.x - point1.x;
  const dy = point2.y - point1.y;
  return Math.sqrt(dx * dx + dy * dy);
}

/**
 * Calculate dot product of two vectors
 */
export function dotProduct(v1: Vector2D, v2: Vector2D): number {
  return v1.x * v2.x + v1.y * v2.y;
}

/**
 * Reflect a vector across a normal
 * Used for calculating bounce direction
 */
export function reflect(vector: Vector2D, normal: Vector2D): Vector2D {
  const dot = dotProduct(vector, normal);
  return {
    x: vector.x - 2 * dot * normal.x,
    y: vector.y - 2 * dot * normal.y,
  };
}

/**
 * Clamp a value between min and max
 */
export function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

/**
 * Linear interpolation between two values
 */
export function lerp(start: number, end: number, t: number): number {
  return start + (end - start) * t;
}

/**
 * Get the magnitude (length) of a vector
 */
export function magnitude(vector: Vector2D): number {
  return Math.sqrt(vector.x * vector.x + vector.y * vector.y);
}

/**
 * Scale a vector by a scalar value
 */
export function scale(vector: Vector2D, scalar: number): Vector2D {
  return {
    x: vector.x * scalar,
    y: vector.y * scalar,
  };
}

/**
 * Calculate scale factor for ball and bat based on canvas size
 * At 1080p (1920x1080), scale is 0.5 (50% smaller)
 * At larger resolutions, scale increases proportionally
 * 
 * Reference resolution: 1920x1080 = scale 0.5
 * Base resolution (100% scale): 3840x2160 (4K)
 */
export function calculateGameElementScale(canvasWidth: number, canvasHeight: number): number {
  // Reference: at 1920x1080, we want scale = 0.5
  // So base resolution for scale = 1.0 would be 3840x2160
  const baseWidth = 3840;
  const baseHeight = 2160;
  
  // Calculate scale based on diagonal to handle different aspect ratios
  const canvasDiagonal = Math.sqrt(canvasWidth * canvasWidth + canvasHeight * canvasHeight);
  const baseDiagonal = Math.sqrt(baseWidth * baseWidth + baseHeight * baseHeight);
  
  return canvasDiagonal / baseDiagonal;
}
