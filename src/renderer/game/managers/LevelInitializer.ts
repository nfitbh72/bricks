/**
 * LevelInitializer - Handles level initialization and setup
 * Extracts level loading logic from Game.ts
 */

import { Level } from '../entities/Level';
import { Brick } from '../entities/Brick';
import { Bat } from '../entities/Bat';
import { LevelFactory } from '../factories/LevelFactory';
import { StatusBar } from '../ui/StatusBar';
import { GameUpgrades } from '../systems/GameUpgrades';
import { WeaponManager } from './WeaponManager';
import { OffensiveEntityManager } from './OffensiveEntityManager';
import { BossManager } from './BossManager';
import { BallManager } from './BallManager';
import { SlowMotionManager } from './SlowMotionManager';
import { EffectsManager } from './EffectsManager';
import { InputManager } from './InputManager';
import { AchievementTracker } from './AchievementTracker';
import { LevelConfig, BrickType } from '../core/types';
import {
  PLAYER_STARTING_HEALTH,
  BOMB_BRICK_DAMAGE_MULTIPLIER,
} from '../../config/constants';

export interface LevelInitializationResult {
  level: Level;
  playerHealth: number;
  bombDamage: number;
  levelStartProgress: {
    totalBricksDestroyed: number;
    totalBossesDefeated: number;
    totalDamageDealt: number;
    levelsCompleted: number;
    upgradesActivated: number;
    bossTypesDefeated: number;
  };
}

export class LevelInitializer {
  private canvasWidth: number;
  private canvasHeight: number;

  constructor(canvasWidth: number, canvasHeight: number) {
    this.canvasWidth = canvasWidth;
    this.canvasHeight = canvasHeight;
  }

  /**
   * Initialize a level with all necessary setup
   */
  initializeLevel(
    levelConfig: LevelConfig,
    gameUpgrades: GameUpgrades,
    weaponManager: WeaponManager,
    offensiveEntityManager: OffensiveEntityManager,
    bossManager: BossManager,
    ballManager: BallManager,
    slowMotionManager: SlowMotionManager,
    effectsManager: EffectsManager,
    inputManager: InputManager,
    achievementTracker: AchievementTracker,
    statusBar: StatusBar,
    bat: Bat,
    onBrickDestroy: (brick: Brick, info: { centerX: number; centerY: number }) => void
  ): LevelInitializationResult {
    // Clear brick render cache when loading new level
    Brick.clearRenderCache();

    // Create level with canvas width for centering
    const level = LevelFactory.createLevel(levelConfig, this.canvasWidth);

    // Set up destruction callbacks for all bricks
    this.setupBrickDestructionCallbacks(level, onBrickDestroy);

    // Set player health: base + upgrade bonus
    const upgradeBonus = gameUpgrades.getHealthBonus();
    const playerHealth = PLAYER_STARTING_HEALTH + upgradeBonus;

    // Clear any active lasers and offensive entities
    weaponManager.clear();
    offensiveEntityManager.clear();

    // Clear boss
    bossManager.clear();

    // Reset slow-motion state
    slowMotionManager.reset();
    effectsManager.resetSlowMotion();

    // Reset per-level achievement tracking
    achievementTracker.clearThisRun();

    // Capture progress snapshot at level start
    const currentProgress = achievementTracker.getProgress();
    const levelStartProgress = {
      totalBricksDestroyed: currentProgress.totalBricksDestroyed,
      totalBossesDefeated: currentProgress.totalBossesDefeated,
      totalDamageDealt: currentProgress.totalDamageDealt,
      levelsCompleted: currentProgress.levelsCompleted.length,
      upgradesActivated: currentProgress.upgradesActivated.length,
      bossTypesDefeated: currentProgress.bossTypesDefeated.length,
    };

    // Initialize achievement tracking for this level
    const hasBoss = level.getBricks().some(brick =>
      brick.getType() === BrickType.BOSS_1 ||
      brick.getType() === BrickType.BOSS_2 ||
      brick.getType() === BrickType.BOSS_3
    );
    achievementTracker.onLevelStart(levelConfig.id, playerHealth, hasBoss);

    // Calculate bomb damage using multiplier constant
    const bombDamage = ballManager.getPrimaryBall().getDamage() * BOMB_BRICK_DAMAGE_MULTIPLIER;

    // Load background image for this level
    effectsManager.loadBackgroundImage(levelConfig.id);

    // Update status bar
    statusBar.setLevelTitle(levelConfig.name);
    statusBar.setPlayerHealth(playerHealth);
    statusBar.setBrickCounts(
      level.getRemainingBricks(),
      level.getTotalBricks()
    );

    // Reset bat width (remove damage from previous level, preserve upgrade size)
    bat.resetWidth();

    // Reset ball and bat position
    this.resetPlayerPositions(bat, ballManager, inputManager);

    return {
      level,
      playerHealth,
      bombDamage,
      levelStartProgress,
    };
  }

  /**
   * Set up destruction callbacks for all bricks in the level
   */
  private setupBrickDestructionCallbacks(
    level: Level,
    onBrickDestroy: (brick: Brick, info: { centerX: number; centerY: number }) => void
  ): void {
    const bricks = level.getBricks();
    for (const brick of bricks) {
      brick.setOnDestroyCallback((destroyedBrick, info) => {
        onBrickDestroy(destroyedBrick, info);
      });
    }
  }

  /**
   * Reset player (bat and ball) positions for level start
   */
  private resetPlayerPositions(
    bat: Bat,
    ballManager: BallManager,
    inputManager: InputManager
  ): void {
    const centerX = this.canvasWidth / 2;
    const batY = this.canvasHeight - 100; // Bat higher up
    const batWidth = bat.getWidth();
    const batHeight = bat.getHeight();

    // Move mouse pointer to bat spawn position (center of bat)
    inputManager.setMousePosition(centerX, batY + batHeight / 2);

    // Center bat
    bat.setPosition(centerX - batWidth / 2, batY);

    // Reset all balls to single ball at start position
    ballManager.resetForLevel(bat);
  }
}
