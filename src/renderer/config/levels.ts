/**
 * Level configurations for the Bricks game
 */

import { LevelConfig, BrickConfig } from '../game/types';
import { BRICK_WIDTH, BRICK_HEIGHT, BRICK_SPACING, LETTER_SPACING } from './constants';
import { calculateWordWidth } from './brickLayout';

/**
 * Create a brick layout from text
 * Each character becomes a brick, spaces are skipped
 * Returns grid coordinates (row/col)
 */
export function createTextLayout(
  text: string,
  startCol: number,
  startRow: number,
  brickHealth: number = 1
): BrickConfig[] {
  const bricks: BrickConfig[] = [];
  const lines = text.split('\n');

  for (let lineIndex = 0; lineIndex < lines.length; lineIndex++) {
    const line = lines[lineIndex];
    let colOffset = 0;

    for (let charIndex = 0; charIndex < line.length; charIndex++) {
      const char = line[charIndex];
      
      // Skip spaces
      if (char === ' ') {
        colOffset++;
        continue;
      }

      // Create brick at grid position
      bricks.push({
        col: startCol + colOffset,
        row: startRow + lineIndex,
        health: brickHealth,
      });

      colOffset++;
    }
  }

  return bricks;
}

/**
 * Create brick patterns for letters
 * Returns a 5x5 grid pattern where 1 = brick, 0 = empty
 */
const LETTER_PATTERNS: { [key: string]: number[][] } = {
  B: [
    [1, 1, 1, 1, 0],
    [1, 0, 0, 0, 1],
    [1, 1, 1, 1, 0],
    [1, 0, 0, 0, 1],
    [1, 1, 1, 1, 0],
  ],
  R: [
    [1, 1, 1, 1, 0],
    [1, 0, 0, 0, 1],
    [1, 1, 1, 1, 0],
    [1, 0, 1, 0, 0],
    [1, 0, 0, 1, 0],
  ],
  I: [
    [1, 1, 1, 1, 1],
    [0, 0, 1, 0, 0],
    [0, 0, 1, 0, 0],
    [0, 0, 1, 0, 0],
    [1, 1, 1, 1, 1],
  ],
  C: [
    [0, 1, 1, 1, 1],
    [1, 0, 0, 0, 0],
    [1, 0, 0, 0, 0],
    [1, 0, 0, 0, 0],
    [0, 1, 1, 1, 1],
  ],
  K: [
    [1, 0, 0, 0, 1],
    [1, 0, 0, 1, 0],
    [1, 1, 1, 0, 0],
    [1, 0, 0, 1, 0],
    [1, 0, 0, 0, 1],
  ],
  S: [
    [0, 1, 1, 1, 1],
    [1, 0, 0, 0, 0],
    [0, 1, 1, 1, 0],
    [0, 0, 0, 0, 1],
    [1, 1, 1, 1, 0],
  ],
};

/**
 * Create bricks from letter patterns
 * Returns grid coordinates (row/col)
 */
export function createLetterBricks(
  letter: string,
  startCol: number,
  startRow: number,
  brickHealth: number = 1
): BrickConfig[] {
  const pattern = LETTER_PATTERNS[letter.toUpperCase()];
  if (!pattern) {
    return [];
  }

  const bricks: BrickConfig[] = [];

  for (let row = 0; row < pattern.length; row++) {
    for (let col = 0; col < pattern[row].length; col++) {
      if (pattern[row][col] === 1) {
        bricks.push({
          col: startCol + col,
          row: startRow + row,
          health: brickHealth,
        });
      }
    }
  }

  return bricks;
}

/**
 * Create bricks for a word using letter patterns
 * Returns grid coordinates (row/col)
 */
export function createWordBricks(
  word: string,
  startCol: number,
  startRow: number,
  brickHealth: number = 1
): BrickConfig[] {
  const bricks: BrickConfig[] = [];
  let colOffset = 0;
  const letterSpacingCols = Math.ceil(LETTER_SPACING / (BRICK_WIDTH + BRICK_SPACING));

  for (const letter of word.toUpperCase()) {
    if (letter === ' ') {
      colOffset += 3 + letterSpacingCols;
      continue;
    }

    const letterBricks = createLetterBricks(
      letter,
      startCol + colOffset,
      startRow,
      brickHealth
    );

    bricks.push(...letterBricks);
    // Each letter is 5 columns wide, plus letter spacing
    colOffset += 5 + letterSpacingCols;
  }

  return bricks;
}

/**
 * Create Level 1 configuration
 * Simple block pattern for introductory level
 */
export function createLevel1(canvasWidth: number): LevelConfig {
  const pattern = [
    [1, 1, 0, 0, 0],
    [1, 1, 1, 1, 1],
    [1, 1, 1, 1, 1],
    [1, 1, 0, 0, 0],
  ];
  
  const bricks: BrickConfig[] = [];
  const patternWidth = 5;
  
  // Calculate canvas width in columns
  const canvasWidthCols = Math.floor(canvasWidth / (BRICK_WIDTH + BRICK_SPACING));
  
  // Center the pattern
  const startCol = Math.max(0, Math.floor((canvasWidthCols - patternWidth) / 2));
  const startRow = 5;
  
  // Create bricks from pattern
  for (let row = 0; row < pattern.length; row++) {
    for (let col = 0; col < pattern[row].length; col++) {
      if (pattern[row][col] === 1) {
        bricks.push({
          col: startCol + col,
          row: startRow + row,
          health: 1,
        });
      }
    }
  }
  
  return {
    id: 1,
    name: 'Level 1: Simple Blocks',
    bricks,
    playerHealth: 3,
  };
}

/**
 * Create Level 2 configuration
 * Word "BRICKS" centered horizontally
 */
export function createLevel2(canvasWidth: number): LevelConfig {
  const word = 'BRICKS';
  
  // Calculate word width in columns
  const letterSpacingCols = Math.ceil(LETTER_SPACING / (BRICK_WIDTH + BRICK_SPACING));
  const wordWidthCols = (word.length * 5) + ((word.length - 1) * letterSpacingCols);
  
  // Calculate canvas width in columns
  const canvasWidthCols = Math.floor(canvasWidth / (BRICK_WIDTH + BRICK_SPACING));
  
  // Center the word
  const startCol = Math.max(0, Math.floor((canvasWidthCols - wordWidthCols) / 2));
  const startRow = 5; // Start at row 5
  
  return {
    id: 2,
    name: 'Level 2: BRICKS',
    bricks: createWordBricks(word, startCol, startRow, 1),
    playerHealth: 3,
  };
}

/**
 * Get level by ID
 * Creates level dynamically with canvas width for proper centering
 */
export function getLevel(id: number, canvasWidth: number): LevelConfig | undefined {
  switch (id) {
    case 1:
      return createLevel1(canvasWidth);
    case 2:
      return createLevel2(canvasWidth);
    default:
      return undefined;
  }
}
