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
  /*
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
  */
 const pattern = [
  "",
  "",
  "",
  "",
  "",
  "",
  "",
  "",
  "",
  "",
  "",
  "",
  "",
  "",
  "",
  "",
  "N",
 ];
  
  return {
    id: 1,
    name: 'Level 1: One',
    bricks: createBricksFromPattern(pattern),
    //bricks: createBricksFromWord("1", BrickType.NORMAL),
    baseHealth: 1, // Normal bricks = 1 HP, Healthy bricks = 3 HP
  };
}

/**
 * Create Level 2 configuration
 * Mixed brick types with pattern
 */
export function createLevel2(): LevelConfig {
  return {
    id: 2,
    name: 'Level 2: Two (duh!)',
    bricks: createBricksFromWord("2", BrickType.NORMAL),
    baseHealth: 2, // Normal bricks = 2 HP, Healthy bricks = 6 HP
  };
}

/**
 * Create Level 3 configuration
 * Skull pattern with mixed brick types
 */
export function createLevel3(): LevelConfig {
  const pattern = [
    "",
    "    HHHHHHHHH",
    "   HHHIIIIIHHHH",
    "  HHHIINNNIIHHHH",
    "  HHIINNNNNIIHHH",
    " HHHINNNNNNNIHHH",
    " HHHINNNNNNNIHHH",
    " HHHINNIIINNIHHH",
    " HHHINNIIINNIHHH",
    "  HHINNNNNNIHH",
    "  HHHINNNNIHHHH",
    "   HHHIIIIHHH",
    "    HHHHHHHH",
    "   HHH    HHH",
    "  HHH      HHH",
    "  HHH      HHH",
    " HHHH      HHHH",
    " NNNN      NNNN",
    "NNNNN      NNNNN",
  ];
  
  return {
    id: 3,
    name: 'Level 3: Skull Island (AI Generated LOL)',
    bricks: createBricksFromPattern(pattern),
    baseHealth: 2, // Normal bricks = 3 HP, Healthy bricks = 9 HP
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
    case 3:
      return createLevel3();
    default:
      return undefined;
  }
}
