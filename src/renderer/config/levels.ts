/**
 * Level configurations for the Bricks game
 */

import { LevelConfig } from '../game/types';
import { createBricksFromPattern } from './brickLayout';

/**
 * Create Level 1 configuration
 * Simple block pattern for introductory level
 */
export function createLevel1(): LevelConfig {
  const pattern = [
    "NNN",
    "N N",
    "NNNNNNH",
    "N     HH  N",
    "NNNNNNH       N",
    "N N",
    "NNN",
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
