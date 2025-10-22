/**
 * Brick layout utilities
 * Helper functions for positioning bricks in levels
 */

import { BRICK_WIDTH, BRICK_HEIGHT, BRICK_SPACING, LETTER_SPACING, BRICK_LAYOUT_TOP_MARGIN } from './constants';
import { BrickConfig, BrickType } from '../game/core/types';

/**
 * Create bricks from a visual pattern
 * ' ' = empty space
 * 'N' = NORMAL brick (1 health)
 * 'H' = HEALTHY brick (3 health)
 * 'I' = INDESTRUCTIBLE brick (infinite health)
 * 'F' = OFFENSIVE_FALLING brick (falls when destroyed)
 * 'E' = OFFENSIVE_EXPLODING brick (explodes into debris)
 * 'L' = OFFENSIVE_LASER brick (shoots laser at bat)
 * 'M' = OFFENSIVE_HOMING brick (spawns homing missile)
 * 'S' = OFFENSIVE_SPLITTING brick (splits into 4 diagonal fragments)
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
      } else if (char === 'I') {
        type = BrickType.INDESTRUCTIBLE;
      } else if (char === 'F') {
        type = BrickType.OFFENSIVE_FALLING;
      } else if (char === 'E') {
        type = BrickType.OFFENSIVE_EXPLODING;
      } else if (char === 'L') {
        type = BrickType.OFFENSIVE_LASER;
      } else if (char === 'M') {
        type = BrickType.OFFENSIVE_HOMING;
      } else if (char === 'S') {
        type = BrickType.OFFENSIVE_SPLITTING;
      }
      
      if (type !== null) {
        bricks.push({ col, row, type });
      }
    }
  }
  
  return bricks;
}

/**
 * Letter patterns for word-based levels
 * Each letter is a 5x5 grid where 1 = brick, 0 = empty
 */
const LETTER_PATTERNS: { [key: string]: number[][] } = {
  A: [
    [0, 1, 1, 1, 0],
    [1, 0, 0, 0, 1],
    [1, 1, 1, 1, 1],
    [1, 0, 0, 0, 1],
    [1, 0, 0, 0, 1],
  ],
  B: [
    [1, 1, 1, 1, 0],
    [1, 0, 0, 0, 1],
    [1, 1, 1, 1, 0],
    [1, 0, 0, 0, 1],
    [1, 1, 1, 1, 0],
  ],
  C: [
    [0, 1, 1, 1, 1],
    [1, 0, 0, 0, 0],
    [1, 0, 0, 0, 0],
    [1, 0, 0, 0, 0],
    [0, 1, 1, 1, 1],
  ],
  D: [
    [1, 1, 1, 1, 0],
    [1, 0, 0, 0, 1],
    [1, 0, 0, 0, 1],
    [1, 0, 0, 0, 1],
    [1, 1, 1, 1, 0],
  ],
  E: [
    [1, 1, 1, 1, 1],
    [1, 0, 0, 0, 0],
    [1, 1, 1, 1, 0],
    [1, 0, 0, 0, 0],
    [1, 1, 1, 1, 1],
  ],
  F: [
    [1, 1, 1, 1, 1],
    [1, 0, 0, 0, 0],
    [1, 1, 1, 1, 0],
    [1, 0, 0, 0, 0],
    [1, 0, 0, 0, 0],
  ],
  G: [
    [0, 1, 1, 1, 1],
    [1, 0, 0, 0, 0],
    [1, 0, 1, 1, 1],
    [1, 0, 0, 0, 1],
    [0, 1, 1, 1, 0],
  ],
  H: [
    [1, 0, 0, 0, 1],
    [1, 0, 0, 0, 1],
    [1, 1, 1, 1, 1],
    [1, 0, 0, 0, 1],
    [1, 0, 0, 0, 1],
  ],
  I: [
    [1, 1, 1, 1, 1],
    [0, 0, 1, 0, 0],
    [0, 0, 1, 0, 0],
    [0, 0, 1, 0, 0],
    [1, 1, 1, 1, 1],
  ],
  J: [
    [1, 1, 1, 1, 1],
    [0, 0, 0, 1, 0],
    [0, 0, 0, 1, 0],
    [1, 0, 0, 1, 0],
    [0, 1, 1, 0, 0],
  ],
  K: [
    [1, 0, 0, 0, 1],
    [1, 0, 0, 1, 0],
    [1, 1, 1, 0, 0],
    [1, 0, 0, 1, 0],
    [1, 0, 0, 0, 1],
  ],
  L: [
    [1, 0, 0, 0, 0],
    [1, 0, 0, 0, 0],
    [1, 0, 0, 0, 0],
    [1, 0, 0, 0, 0],
    [1, 1, 1, 1, 1],
  ],
  M: [
    [1, 0, 0, 0, 1],
    [1, 1, 0, 1, 1],
    [1, 0, 1, 0, 1],
    [1, 0, 0, 0, 1],
    [1, 0, 0, 0, 1],
  ],
  N: [
    [1, 0, 0, 0, 1],
    [1, 1, 0, 0, 1],
    [1, 0, 1, 0, 1],
    [1, 0, 0, 1, 1],
    [1, 0, 0, 0, 1],
  ],
  O: [
    [0, 1, 1, 1, 0],
    [1, 0, 0, 0, 1],
    [1, 0, 0, 0, 1],
    [1, 0, 0, 0, 1],
    [0, 1, 1, 1, 0],
  ],
  P: [
    [1, 1, 1, 1, 0],
    [1, 0, 0, 0, 1],
    [1, 1, 1, 1, 0],
    [1, 0, 0, 0, 0],
    [1, 0, 0, 0, 0],
  ],
  Q: [
    [0, 1, 1, 1, 0],
    [1, 0, 0, 0, 1],
    [1, 0, 0, 0, 1],
    [1, 0, 0, 1, 0],
    [0, 1, 1, 0, 1],
  ],
  R: [
    [1, 1, 1, 1, 0],
    [1, 0, 0, 0, 1],
    [1, 1, 1, 1, 0],
    [1, 0, 1, 0, 0],
    [1, 0, 0, 1, 0],
  ],
  S: [
    [0, 1, 1, 1, 1],
    [1, 0, 0, 0, 0],
    [0, 1, 1, 1, 0],
    [0, 0, 0, 0, 1],
    [1, 1, 1, 1, 0],
  ],
  T: [
    [1, 1, 1, 1, 1],
    [0, 0, 1, 0, 0],
    [0, 0, 1, 0, 0],
    [0, 0, 1, 0, 0],
    [0, 0, 1, 0, 0],
  ],
  U: [
    [1, 0, 0, 0, 1],
    [1, 0, 0, 0, 1],
    [1, 0, 0, 0, 1],
    [1, 0, 0, 0, 1],
    [0, 1, 1, 1, 0],
  ],
  V: [
    [1, 0, 0, 0, 1],
    [1, 0, 0, 0, 1],
    [1, 0, 0, 0, 1],
    [0, 1, 0, 1, 0],
    [0, 0, 1, 0, 0],
  ],
  W: [
    [1, 0, 0, 0, 1],
    [1, 0, 0, 0, 1],
    [1, 0, 1, 0, 1],
    [1, 1, 0, 1, 1],
    [1, 0, 0, 0, 1],
  ],
  X: [
    [1, 0, 0, 0, 1],
    [0, 1, 0, 1, 0],
    [0, 0, 1, 0, 0],
    [0, 1, 0, 1, 0],
    [1, 0, 0, 0, 1],
  ],
  Y: [
    [1, 0, 0, 0, 1],
    [0, 1, 0, 1, 0],
    [0, 0, 1, 0, 0],
    [0, 0, 1, 0, 0],
    [0, 0, 1, 0, 0],
  ],
  Z: [
    [1, 1, 1, 1, 1],
    [0, 0, 0, 1, 0],
    [0, 0, 1, 0, 0],
    [0, 1, 0, 0, 0],
    [1, 1, 1, 1, 1],
  ],
  // Numbers
  '0': [
    [0, 1, 1, 1, 0],
    [1, 0, 0, 1, 1],
    [1, 0, 1, 0, 1],
    [1, 1, 0, 0, 1],
    [0, 1, 1, 1, 0],
  ],
  '1': [
    [0, 0, 1, 0, 0],
    [0, 1, 1, 0, 0],
    [0, 0, 1, 0, 0],
    [0, 0, 1, 0, 0],
    [0, 1, 1, 1, 0],
  ],
  '2': [
    [0, 1, 1, 1, 0],
    [1, 0, 0, 0, 1],
    [0, 0, 1, 1, 0],
    [0, 1, 0, 0, 0],
    [1, 1, 1, 1, 1],
  ],
  '3': [
    [1, 1, 1, 1, 0],
    [0, 0, 0, 0, 1],
    [0, 1, 1, 1, 0],
    [0, 0, 0, 0, 1],
    [1, 1, 1, 1, 0],
  ],
  '4': [
    [1, 0, 0, 1, 0],
    [1, 0, 0, 1, 0],
    [1, 1, 1, 1, 1],
    [0, 0, 0, 1, 0],
    [0, 0, 0, 1, 0],
  ],
  '5': [
    [1, 1, 1, 1, 1],
    [1, 0, 0, 0, 0],
    [1, 1, 1, 1, 0],
    [0, 0, 0, 0, 1],
    [1, 1, 1, 1, 0],
  ],
  '6': [
    [0, 1, 1, 1, 0],
    [1, 0, 0, 0, 0],
    [1, 1, 1, 1, 0],
    [1, 0, 0, 0, 1],
    [0, 1, 1, 1, 0],
  ],
  '7': [
    [1, 1, 1, 1, 1],
    [0, 0, 0, 0, 1],
    [0, 0, 0, 1, 0],
    [0, 0, 1, 0, 0],
    [0, 0, 1, 0, 0],
  ],
  '8': [
    [0, 1, 1, 1, 0],
    [1, 0, 0, 0, 1],
    [0, 1, 1, 1, 0],
    [1, 0, 0, 0, 1],
    [0, 1, 1, 1, 0],
  ],
  '9': [
    [0, 1, 1, 1, 0],
    [1, 0, 0, 0, 1],
    [0, 1, 1, 1, 1],
    [0, 0, 0, 0, 1],
    [0, 1, 1, 1, 0],
  ],
  // Special characters
  ' ': [
    [0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0],
  ],
  '-': [
    [0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0],
    [1, 1, 1, 1, 1],
    [0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0],
  ],
  '=': [
    [0, 0, 0, 0, 0],
    [1, 1, 1, 1, 1],
    [0, 0, 0, 0, 0],
    [1, 1, 1, 1, 1],
    [0, 0, 0, 0, 0],
  ],
  '&': [
    [0, 1, 1, 0, 0],
    [1, 0, 0, 1, 0],
    [0, 1, 1, 0, 1],
    [1, 0, 0, 1, 0],
    [0, 1, 1, 0, 1],
  ],
  '$': [
    [0, 1, 1, 1, 1],
    [1, 0, 1, 0, 0],
    [0, 1, 1, 1, 0],
    [0, 0, 1, 0, 1],
    [1, 1, 1, 1, 0],
  ],
  '#': [
    [0, 1, 0, 1, 0],
    [1, 1, 1, 1, 1],
    [0, 1, 0, 1, 0],
    [1, 1, 1, 1, 1],
    [0, 1, 0, 1, 0],
  ],
  '@': [
    [0, 1, 1, 1, 0],
    [1, 0, 0, 0, 1],
    [1, 0, 1, 1, 1],
    [1, 0, 1, 1, 1],
    [0, 1, 1, 1, 0],
  ],
  '!': [
    [0, 0, 1, 0, 0],
    [0, 0, 1, 0, 0],
    [0, 0, 1, 0, 0],
    [0, 0, 0, 0, 0],
    [0, 0, 1, 0, 0],
  ],
  '*': [
    [1, 0, 1, 0, 1],
    [0, 1, 1, 1, 0],
    [1, 1, 1, 1, 1],
    [0, 1, 1, 1, 0],
    [1, 0, 1, 0, 1],
  ],
  ':': [
    [0, 0, 0, 0, 0],
    [0, 0, 1, 0, 0],
    [0, 0, 0, 0, 0],
    [0, 0, 1, 0, 0],
    [0, 0, 0, 0, 0],
  ],
};

/**
 * Create bricks for a word using letter patterns
 * Each letter is 5 columns wide, with 1 column spacing between letters
 */
export function createBricksFromWord(
  word: string,
  brickType: BrickType = BrickType.NORMAL
): BrickConfig[] {
  const bricks: BrickConfig[] = [];
  let colOffset = 0;
  const LETTER_WIDTH_COLS = 5;
  const LETTER_SPACING_COLS = 1;

  for (const letter of word.toUpperCase()) {
    if (letter === ' ') {
      colOffset += 3 + LETTER_SPACING_COLS;
      continue;
    }

    const pattern = LETTER_PATTERNS[letter];
    if (!pattern) {
      continue; // Skip unknown letters
    }

    // Create bricks from letter pattern
    for (let row = 0; row < pattern.length; row++) {
      for (let col = 0; col < pattern[row].length; col++) {
        if (pattern[row][col] === 1) {
          bricks.push({
            col: colOffset + col,
            row,
            type: brickType,
          });
        }
      }
    }

    // Move to next letter position
    colOffset += LETTER_WIDTH_COLS + LETTER_SPACING_COLS;
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
    y: BRICK_LAYOUT_TOP_MARGIN,
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
