/**
 * Level configurations for the Bricks game
 */

import { LevelConfig, BrickConfig, BrickType } from '../game/types';
import { createBricksFromPattern } from './brickLayout';

/**
 * Create a brick layout from text
 * Each character becomes a brick, spaces are skipped
 * Returns grid coordinates (row/col)
 */
export function createTextLayout(
  text: string,
  startCol: number,
  startRow: number,
  brickType: BrickType = BrickType.NORMAL
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
        type: brickType,
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
  brickType: BrickType = BrickType.NORMAL
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
          type: brickType,
        });
      }
    }
  }

  return bricks;
}

/**
 * Create bricks for a word using letter patterns
 * Returns grid coordinates (row/col)
 * Each letter is 5 columns wide, with 1 column spacing between letters
 */
export function createWordBricks(
  word: string,
  startCol: number,
  startRow: number,
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

    const letterBricks = createLetterBricks(
      letter,
      startCol + colOffset,
      startRow,
      brickType
    );

    bricks.push(...letterBricks);
    // Move to next letter position
    colOffset += LETTER_WIDTH_COLS + LETTER_SPACING_COLS;
  }

  return bricks;
}

/**
 * Create Level 1 configuration
 * Simple block pattern for introductory level
 */
export function createLevel1(): LevelConfig {
  const pattern = [
    "NN   ",
    "NNNNN",
    "NNNNN",
    "NN   ",
  ];
  
  return {
    id: 1,
    name: 'Level 1: Simple Blocks',
    bricks: createBricksFromPattern(pattern),
    playerHealth: 3,
  };
}

/**
 * Create Level 2 configuration
 * Mixed brick types with pattern
 */
export function createLevel2(): LevelConfig {
  const pattern = [
    "HHHHHHHHH",
    "H       H",
    "H NNNNN H",
    "H NNNNN H",
    "H NNNNN H",
    "H       H",
    "HHHHHHHHH",
  ];
  
  return {
    id: 2,
    name: 'Level 2: The Frame',
    bricks: createBricksFromPattern(pattern),
    playerHealth: 3,
  };
}

//bricks: createWordBricks('BRICKS', 0, 5, BrickType.NORMAL)
/**
 * Get level by ID
 */
export function getLevel(id: number): LevelConfig | undefined {
  switch (id) {
    case 1:
      return createLevel1();
    case 2:
      return createLevel2();
    default:
      return undefined;
  }
}
