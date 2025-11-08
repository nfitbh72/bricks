/**
 * Level configurations for the Bricks game
 */

import { LevelConfig } from '../game/core/types';
import { createBricksFromPattern } from './brickLayout';
import { t } from '../i18n/LanguageManager';

/**
 * Total number of levels in the game
 */
export const TOTAL_LEVELS = 12;

/**
 * Create Level 1 configuration
 * Simple block pattern for introductory level
 */
export function createLevel1(): LevelConfig {
  const pattern = [
    "NNNN",
    "NFFN",
    "NFFN",
    "NNNN"
  ];
  
  return {
    id: 1,
    name: t('game.levels.level1Name'),
    bricks: createBricksFromPattern(pattern),
    baseHealth: 1,
  };
}

/**
 * Create Level 2 configuration
 * Debris cascade - falling bricks pattern
 */
export function createLevel2(): LevelConfig {
  const pattern = [
    "FFFFFFFFF",
    "F F F F F",
    "FFFFFFFFF",
    "F F F F F",
    "FFFFFFFFF"
  ];

  return {
    id: 2,
    name: t('game.levels.level2Name'),
    bricks: createBricksFromPattern(pattern),
    baseHealth: 2,
  };
}

/**
 * Create Level 3 configuration
 * Laser grid - beware the crossfire
 */
export function createLevel3(): LevelConfig {
  const pattern = [
    "L L L L L",
    "         ",
    "L L L L L",
    "         ",
    "L L L L L",
    "         ",
    "L L L L L"
  ];
  
  return {
    id: 3,
    name: t('game.levels.level3Name'),
    bricks: createBricksFromPattern(pattern),
    baseHealth: 2,
  };
}

/**
 * Create Level 4 configuration
 * Boss 1 - The Thrower
 */
export function createLevel4(): LevelConfig {
  const pattern = [
    "NNNNNNNN",
    "........",
    "...1....",
    "........",
    "FFFFFFFF"
  ];
  
  return {
    id: 4,
    name: t('game.levels.level4Name'),
    bricks: createBricksFromPattern(pattern),
    baseHealth: 3,
  };
}

/**
 * Create Level 5 configuration
 * Explosive checkerboard
 */
export function createLevel5(): LevelConfig {
  const pattern = [
    "BNBNBNBN",
    "NBNBNBNB",
    "BNBNBNBN",
    "NBNBNBNB",
    "BNBNBNBN"
  ];
  
  return {
    id: 5,
    name: t('game.levels.level5Name'),
    bricks: createBricksFromPattern(pattern),
    baseHealth: 3,
  };
}

/**
 * Create Level 6 configuration
 * Splitting spiral
 */
export function createLevel6(): LevelConfig {
  const pattern = [
    "SSSSSSSS",
    "S      S",
    "S SSSS S",
    "S S  S S",
    "S SSSS S",
    "S      S",
    "SSSSSSSS"
  ];
  
  return {
    id: 6,
    name: t('game.levels.level6Name'),
    bricks: createBricksFromPattern(pattern),
    baseHealth: 4,
  };
}

/**
 * Create Level 7 configuration
 * Homing missile maze
 */
export function createLevel7(): LevelConfig {
  const pattern = [
    "MMMMMMMM",
    "M      M",
    "M MMMM M",
    "M M  M M",
    "M M  M M",
    "M MMMM M",
    "M      M",
    "MMMMMMMM"
  ];
  
  return {
    id: 7,
    name: t('game.levels.level7Name'),
    bricks: createBricksFromPattern(pattern),
    baseHealth: 4,
  };
}

/**
 * Create Level 8 configuration
 * Boss 2 - The Shielder
 */
export function createLevel8(): LevelConfig {
  const pattern = [
    "NNNNNNNN",
    "........",
    "...2....",
    "........",
    "FFFFFFFF"
  ];
  
  return {
    id: 8,
    name: t('game.levels.level8Name'),
    bricks: createBricksFromPattern(pattern),
    baseHealth: 5,
  };
}

/**
 * Create Level 9 configuration
 * Dynamite cross
 */
export function createLevel9(): LevelConfig {
  const pattern = [
    "   DDD   ",
    "   DDD   ",
    "   DDD   ",
    "DDDDDDDDD",
    "DDDDDDDDD",
    "DDDDDDDDD",
    "   DDD   ",
    "   DDD   ",
    "   DDD   "
  ];
  
  return {
    id: 9,
    name: t('game.levels.level9Name'),
    bricks: createBricksFromPattern(pattern),
    baseHealth: 5,
  };
}

/**
 * Create Level 10 configuration
 * Mixed offensive chaos
 */
export function createLevel10(): LevelConfig {
  const pattern = [
    "LMSBDSML",
    "MSFFFFBM",
    "BFNNNNFS",
    "SFNHHNFD",
    "DFNHHNFS",
    "SFNNNNFB",
    "MBFFFFSM",
    "LMSDSBML"
  ];
  
  return {
    id: 10,
    name: t('game.levels.level10Name'),
    bricks: createBricksFromPattern(pattern),
    baseHealth: 5,
  };
}

/**
 * Create Level 11 configuration
 * Explosive diamond
 */
export function createLevel11(): LevelConfig {
  const pattern = [
    "    B    ",
    "   BBB   ",
    "  BBBBB  ",
    " BBBBBBB ",
    "BBBBBBBBB",
    " BBBBBBB ",
    "  BBBBB  ",
    "   BBB   ",
    "    B    "
  ];
  
  return {
    id: 11,
    name: t('game.levels.level11Name'),
    bricks: createBricksFromPattern(pattern),
    baseHealth: 6,
  };
}

/**
 * Create Level 12 configuration
 * Boss 3 - The Splitter (Final Boss)
 */
export function createLevel12(): LevelConfig {
  const pattern = [
    "NNNNNNNN",
    "........",
    "...3....",
    "........",
    "FFFFFFFF"
  ];
  
  return {
    id: 12,
    name: t('game.levels.level12Name'),
    bricks: createBricksFromPattern(pattern),
    baseHealth: 6,
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
    case 4:
      return createLevel4();
    case 5:
      return createLevel5();
    case 6:
      return createLevel6();
    case 7:
      return createLevel7();
    case 8:
      return createLevel8();
    case 9:
      return createLevel9();
    case 10:
      return createLevel10();
    case 11:
      return createLevel11();
    case 12:
      return createLevel12();
    default:
      return undefined;
  }
}
