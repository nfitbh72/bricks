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
 * Create Level 1 configuration based on canvas width
 */
export function createLevel1(canvasWidth: number): LevelConfig {
  // Calculate brick size to fill most of the screen width
  // Word "BRICKS" = 6 letters, each letter is 5 bricks wide with spacing
  const totalLetters = 6;
  const bricksPerLetter = 5;
  const letterSpacing = 30;
  const brickSpacing = 5;
  
  // Calculate brick width to use ~80% of screen width
  const usableWidth = canvasWidth * 0.8;
  const totalSpacing = (totalLetters - 1) * letterSpacing + (totalLetters * bricksPerLetter - 1) * brickSpacing;
  const brickWidth = Math.floor((usableWidth - totalSpacing) / (totalLetters * bricksPerLetter));
  const brickHeight = Math.floor(brickWidth / 2); // 2:1 aspect ratio
  
  // Calculate starting X to center the word
  const totalWidth = (totalLetters * bricksPerLetter * brickWidth) + totalSpacing;
  const startX = (canvasWidth - totalWidth) / 2;
  
  return {
    id: 1,
    name: 'Level 1: BRICKS',
    bricks: createWordBricks('BRICKS', startX, 150, brickWidth, brickHeight, 1, letterSpacing, brickSpacing),
    ballSpeed: 600,
    batWidth: 150,
    batHeight: 15,
    playerHealth: 3,
  };
}

/**
 * Level 1: BRICKS
 * Forms the word "BRICKS" with bricks
 * Note: This uses default values. Use createLevel1(canvasWidth) for responsive sizing.
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
