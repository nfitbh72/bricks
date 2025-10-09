/**
 * Level configurations for the Bricks game
 */

import { LevelConfig, BrickType } from '../game/types';
import { createBricksFromPattern, createBricksFromWord } from './brickLayout';

/**
 * Create Level 1 configuration
 * Simple block pattern for introductory level
 */
export function createLevel1(): LevelConfig {
  const pattern = [
    "",
    "",
    "",
    "NNN",
    "N N",
    "NNNNNNH",
    "N     HH  I",
    "NNNNNNH       I",
    "N N",
    "HHH",
  ];
  
  return {
    id: 1,
    name: 'Level 1: Effective Design',
    bricks: createBricksFromPattern(pattern),
    //bricks: createBricksFromWord("0-0", BrickType.HEALTHY),
  };
}

/**
 * Create Level 2 configuration
 * Mixed brick types with pattern
 */
export function createLevel2(): LevelConfig {
  return {
    id: 2,
    name: 'Level 2: Says Hi',
    bricks: createBricksFromWord("NFI", BrickType.HEALTHY),
    baseHealth: 2, // Normal bricks = 2 HP, Healthy bricks = 6 HP
  };
}

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
