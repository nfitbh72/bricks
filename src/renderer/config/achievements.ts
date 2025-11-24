/**
 * Achievement Definitions
 * Define all game achievements here
 */

export interface Achievement {
  id: string;
  name: string;
  description: string;
  hidden?: boolean;
}

export const ACHIEVEMENTS: Achievement[] = [
  // Level completion
  {
    id: 'FIRST_LEVEL',
    name: 'Getting Started',
    description: 'Complete the first level',
  },
  {
    id: 'HALFWAY_THERE',
    name: 'Halfway There',
    description: 'Complete 5 levels',
  },
  {
    id: 'LEVEL_MASTER',
    name: 'Level Master',
    description: 'Complete all levels',
  },

  // Progress Achievements
  {
    id: 'UPGRADE_MASTER',
    name: 'Upgrade Seeker',
    description: 'Activate all upgrades'
  },

  {
    id: 'BRICK_SMASHER',
    name: 'Brick Destroyer',
    description: 'Destroy 1000 bricks'
  },

  {
    id: 'BOSS_SMASHER',
    name: 'Boss Smasher',
    description: 'Destroy 30 bosses'
  },

  {
    id: 'DAMAGE_DEALER',
    name: 'Damage Dealer',
    description: 'Deal 10000 damage to bricks'
  },

  // Boss achievements
  {
    id: 'DEFEAT_BOSS_1',
    name: 'Thrower Down',
    description: 'Defeat Boss 1: The Thrower',
  },
  {
    id: 'DEFEAT_BOSS_2',
    name: 'Shield Breaker',
    description: 'Defeat Boss 2: The Shielder',
  },
  {
    id: 'DEFEAT_BOSS_3',
    name: 'Split Decision',
    description: 'Defeat Boss 3: The Splitter',
  },
  {
    id: 'ALL_BOSSES',
    name: 'Boss Master',
    description: 'Defeat all three boss types',
  },

  // Skill achievements
  {
    id: 'PERFECT_LEVEL',
    name: 'Flawless',
    description: 'Complete a level without losing the ball',
  },
  {
    id: 'SPEED_RUN',
    name: 'Speed Demon',
    description: 'Complete a level in under 10 seconds',
  },
  {
    id: 'NO_DAMAGE',
    name: 'Untouchable',
    description: 'Complete a boss level without taking damage',
  },
  {
    id: 'COMBO_MASTER',
    name: 'Combo Master',
    description: 'Destroy 10 bricks in a single combo',
  },

  // Hidden achievements
  {
    id: 'SECRET_LEVEL',
    name: '???',
    description: 'Find the secret level',
    hidden: true,
  },
];

// Helper to get achievement by ID
export function getAchievement(id: string): Achievement | undefined {
  return ACHIEVEMENTS.find(a => a.id === id);
}
