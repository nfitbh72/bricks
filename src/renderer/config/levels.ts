/**
 * Level configurations for the Bricks game
 */

import { LevelConfig } from '../game/core/types';
import { createBricksFromPattern } from './brickLayout';
import { t } from '../i18n/LanguageManager';

/**
 * Total number of levels in the game
 */
export const TOTAL_LEVELS = 9;

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
    "NNNN",
    "NFFN",
    "NFFN",
    "NNNN"
  ];
  
  return {
    id: 1,
    name: t('game.levels.level1Name'),
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
    const pattern = [
    "IIIIII",
    "INNNNI",
    "INHENI",
    "INEHNI",
    "INNNNI"
  ];

  return {
    id: 2,
    name: t('game.levels.level2Name'),
    bricks: createBricksFromPattern(pattern),
    baseHealth: 2, // Normal bricks = 2 HP, Healthy bricks = 6 HP
  };
}

/**
 * Create Level 3 configuration
 * Skull pattern with mixed brick types
 */
export function createLevel3(): LevelConfig {
  const pattern = [
    "IIIIIIIII",
    "IL L L LI",
    "I S S S I",
    "IL L L LI",
    "I S S S I",
    "IHHHHHHHI",
    "I       I",
    "I       I",
    "I       I",
    "I       I",
    "I       I",
    "I       I",
    "I       I",
    "I       I",
    "I       I",
    "I       I"
  ];
  
  return {
    id: 3,
    name: t('game.levels.level3Name'),
    bricks: createBricksFromPattern(pattern),
    baseHealth: 2, // Normal bricks = 3 HP, Healthy bricks = 9 HP
  };
}

export function createLevel4(): LevelConfig {
  const pattern = [
    "IIIIIIIII",
    "IM M M MI",
    "I S S S I",
    "IM M M MI",
    "I S S S I",
    "IHHHHHHHI",
    "I       I",
    "I       I",
    "I       I",
    "I       I",
    "I       I",
    "I       I",
    "I       I",
    "I       I",
    "I       I",
    "I       I"
  ];
  
  return {
    id: 4,
    name: t('game.levels.level4Name'),
    bricks: createBricksFromPattern(pattern),
    baseHealth: 3, // Normal bricks = 4 HP, Healthy bricks = 12 HP
  };
}

export function createLevel5(): LevelConfig {
  const pattern = [
    "IIIIIIIII",
    "INNNNNNNI",
    "INNNNNNNI",
    "INNNNNNNI",
    "INNNNNNNI",
    "IHMMMMMHI",
    "IMBMBMBMI",
    "IMMBMBMMI",
    "IMBMBMBMI",
    "I       I",
    "I       I",
    "I       I",
    "I       I",
    "I       I",
    "I       I",
    "I       I",
    "I       I",
    "I       I",
    "I       I",
    "I       I"
  ];
  
  return {
    id: 5,
    name: t('game.levels.level5Name'),
    bricks: createBricksFromPattern(pattern),
    baseHealth: 3, // Normal bricks = 4 HP, Healthy bricks = 12 HP
  };
}

export function createLevel6(): LevelConfig {
  const pattern = [
    "IIIIIIIII",
    "INNNNNNNI",
    "INNNNNNNI",
    "INNNDNNNI",
    "INNNDNNNI",
    "INNNDNNNI",
    "I       I",
    "I       I",
    "I       I",
    "I       I",
    "I       I",
    "I       I",
    "I       I",
    "I       I",
    "I       I",
    "I       I",
    "I       I"
  ];
  
  return {
    id: 6,
    name: t('game.levels.level6Name'),
    bricks: createBricksFromPattern(pattern),
    baseHealth: 4, // Normal bricks = 6 HP, Healthy bricks = 18 HP
  };
}

/**
 * Create Level 7 configuration
 * Boss level with Boss 1 brick in the middle
 */
export function createLevel7(): LevelConfig {
  const pattern = [
    "IIIIIIIII",
    "INNNNNNNI",
    "INNNNNNNI",
    "INNNNNNNI",
    "INDM1MDNI",
    "INNNNNNNI",
    "INNNNNNNI",
    "INNNNNNNI",
    "IFFFFFFFI",
    "I       I",
    "I       I",
    "I       I",
    "I       I",
    "I       I",
    "I       I",
    "I       I",
    "I       I",
    "I       I",
    "I       I",
    "I       I"
  ];
  
  return {
    id: 7,
    name: t('game.levels.level7Name'),
    bricks: createBricksFromPattern(pattern),
    baseHealth: 4, // Normal bricks = 6 HP, Healthy bricks = 18 HP
  };
}

/**
 * Create Level 8 configuration
 * 8x8 grid with only offensive bricks in a spiral mandala pattern
 */
export function createLevel8(): LevelConfig {
  const pattern = [
    "LLLLLLLL",
    "LMSBDSML",
    "LSFFFFSL",
    "LBFEEEFB",
    "LDFEEEFD",
    "LSFFFFSL",
    "LMSBDSML",
    "LLLLLLLL"
  ];
  
  return {
    id: 8,
    name: t('game.levels.level8Name'),
    bricks: createBricksFromPattern(pattern),
    baseHealth: 5, // Higher health for challenging offensive-only level
  };
}

/**
 * Create Level 9 configuration
 * Test level for Boss2 - just a single boss brick
 */
export function createLevel9(): LevelConfig {
  const pattern = [
    "NNNNNNNN",
    "........",
    "...2....",
    "........",
    "........",
    "........",
    "........",
    "........"
  ];
  
  return {
    id: 9,
    name: t('game.levels.level9Name'),
    bricks: createBricksFromPattern(pattern),
    baseHealth: 5,
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
    default:
      return undefined;
  }
}
