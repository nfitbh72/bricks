/**
 * Brick layout utilities
 * Helper functions for positioning bricks in levels
 */

import { BRICK_WIDTH, BRICK_HEIGHT, BRICK_SPACING, LETTER_SPACING } from './constants';
import { BrickConfig, BrickType } from '../game/types';

/**
 * Create bricks from a visual pattern
 * ' ' = empty space
 * 'N' = NORMAL brick (1 health)
 * 'H' = HEALTHY brick (3 health)
 */
export function createBricksFromPattern(pattern: string[]): BrickConfig[] {
  const bricks: BrickConfig[] = [];
  
  for (let row = 0; row < pattern.length; row++) {
    const line = pattern[row];
    for (let col = 0; col < line.length; col++) {
      const char = line[col];
      
      let type: BrickType | null = null;
      if (char === 'N') {
        type = BrickType.NORMAL;
      } else if (char === 'H') {
        type = BrickType.HEALTHY;
      }
      
      if (type !== null) {
        bricks.push({ col, row, type });
      }
    }
  }
  
  return bricks;
}

/**
 * Convert grid position to pixel position
 */
export function gridToPixel(gridX: number, gridY: number): { x: number; y: number } {
  return {
    x: gridX * (BRICK_WIDTH + BRICK_SPACING),
    y: gridY * (BRICK_HEIGHT + BRICK_SPACING),
  };
}

/**
 * Calculate centered starting position for a layout
 */
export function getCenteredStartPosition(
  canvasWidth: number,
  layoutWidth: number
): { x: number; y: number } {
  return {
    x: (canvasWidth - layoutWidth) / 2,
    y: 100, // Fixed top margin
  };
}

/**
 * Create brick config from grid position
 */
export function createBrickAtGrid(
  col: number,
  row: number,
  type: BrickType = BrickType.NORMAL
): BrickConfig {
  return {
    col,
    row,
    type,
  };
}

/**
 * Calculate the pixel width of a word layout
 * Each letter is 5 columns, with LETTER_SPACING between letters
 */
export function calculateWordWidth(word: string): number {
  const letterCount = word.replace(/\s/g, '').length; // Count non-space letters
  const spaceCount = (word.match(/\s/g) || []).length;
  
  // Each letter: 5 columns (each column = BRICK_WIDTH + BRICK_SPACING)
  // Between letters: LETTER_SPACING
  // Spaces: 3 columns + LETTER_SPACING
  const letterWidth = 5 * (BRICK_WIDTH + BRICK_SPACING);
  const spaceWidth = 3 * (BRICK_WIDTH + BRICK_SPACING) + LETTER_SPACING;
  
  return (letterCount * letterWidth) + 
         ((letterCount - 1) * LETTER_SPACING) + 
         (spaceCount * spaceWidth) -
         BRICK_SPACING; // Remove trailing spacing
}
