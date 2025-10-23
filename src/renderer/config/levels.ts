/**
 * Level configurations for the Bricks game
 */

import { LevelConfig, BrickType } from '../game/core/types';
import { createBricksFromPattern, createBricksFromWord } from './brickLayout';
import { t } from '../i18n/LanguageManager';

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
    baseHealth: 3, // Normal bricks = 3 HP, Healthy bricks = 9 HP
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
    baseHealth: 4, // Normal bricks = 4 HP, Healthy bricks = 12 HP
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
    default:
      return undefined;
  }
}
