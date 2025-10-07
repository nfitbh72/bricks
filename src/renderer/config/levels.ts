/**
 * Level configurations for the Bricks game
 */

import { LevelConfig, BrickConfig } from '../game/types';

/**
 * Create a brick layout from text
 * Each character becomes a brick, spaces are skipped
 */
export function createTextLayout(
  text: string,
  startX: number,
  startY: number,
  brickWidth: number,
  brickHeight: number,
  brickHealth: number = 1,
  spacing: number = 2
): BrickConfig[] {
  const bricks: BrickConfig[] = [];
  const lines = text.split('\n');

  for (let lineIndex = 0; lineIndex < lines.length; lineIndex++) {
    const line = lines[lineIndex];
    let xOffset = 0;

    for (let charIndex = 0; charIndex < line.length; charIndex++) {
      const char = line[charIndex];
      
      // Skip spaces
      if (char === ' ') {
        xOffset += brickWidth + spacing;
        continue;
      }

      // Create brick for this character
      bricks.push({
        x: startX + xOffset,
        y: startY + (lineIndex * (brickHeight + spacing)),
        width: brickWidth,
        height: brickHeight,
        health: brickHealth,
      });

      xOffset += brickWidth + spacing;
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
 */
export function createLetterBricks(
  letter: string,
  startX: number,
  startY: number,
  brickWidth: number,
  brickHeight: number,
  brickHealth: number = 1,
  spacing: number = 2
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
          x: startX + (col * (brickWidth + spacing)),
          y: startY + (row * (brickHeight + spacing)),
          width: brickWidth,
          height: brickHeight,
          health: brickHealth,
        });
      }
    }
  }

  return bricks;
}

/**
 * Create bricks for a word using letter patterns
 */
export function createWordBricks(
  word: string,
  startX: number,
  startY: number,
  brickWidth: number,
  brickHeight: number,
  brickHealth: number = 1,
  letterSpacing: number = 10,
  brickSpacing: number = 2
): BrickConfig[] {
  const bricks: BrickConfig[] = [];
  let xOffset = 0;

  for (const letter of word.toUpperCase()) {
    if (letter === ' ') {
      xOffset += (brickWidth * 3) + letterSpacing;
      continue;
    }

    const letterBricks = createLetterBricks(
      letter,
      startX + xOffset,
      startY,
      brickWidth,
      brickHeight,
      brickHealth,
      brickSpacing
    );

    bricks.push(...letterBricks);
    xOffset += (brickWidth * 5) + (brickSpacing * 4) + letterSpacing;
  }

  return bricks;
}

/**
 * Level 1: BRICKS
 * Forms the word "BRICKS" with bricks
 */
export const LEVEL_1: LevelConfig = {
  id: 1,
  name: 'Level 1: BRICKS',
  bricks: createWordBricks('BRICKS', 100, 150, 40, 20, 1, 30, 5),
  ballSpeed: 300,
  batWidth: 100,
  batHeight: 10,
  playerHealth: 3,
};

/**
 * All levels in order
 */
export const LEVELS: LevelConfig[] = [LEVEL_1];

/**
 * Get level by ID
 */
export function getLevel(id: number): LevelConfig | undefined {
  return LEVELS.find((level) => level.id === id);
}
