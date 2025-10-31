/**
 * StateTransitionHandler - manages all game state transitions and handlers
 */

import { GameState, LevelConfig } from '../core/types';
import { Bat } from '../entities/Bat';
import { Ball } from '../entities/Ball';
import { GameUpgrades } from '../systems/GameUpgrades';
import { ScreenManager } from '../managers/ScreenManager';
import { AudioManager } from '../managers/AudioManager';
import { getLevel } from '../../config/levels';

export interface StateTransitionContext {
  canvas: HTMLCanvasElement;
  ctx: CanvasRenderingContext2D;
  bat: Bat;
  ball: Ball;
  gameUpgrades: GameUpgrades;
  screenManager: ScreenManager;
  audioManager: AudioManager;
  gameState: GameState;
  currentLevelId: number;
  totalBricksDestroyed: number;
  isDevUpgradeMode: boolean;
  loadLevel: (config: LevelConfig) => void;
  startTransition: (onComplete: () => void, nextLevel?: number) => void;
  applyOptions: () => void;
  setCurrentLevelId: (id: number) => void;
  setTotalBricksDestroyed: (count: number) => void;
  setIsDevUpgradeMode: (value: boolean) => void;
  setGameState: (state: GameState) => void;
}

export class StateTransitionHandler {
  private context: StateTransitionContext;

  constructor(context: StateTransitionContext) {
    this.context = context;
  }

  /**
   * Update context reference (called when context changes)
   */
  updateContext(context: StateTransitionContext): void {
    this.context = context;
  }

  /**
   * Handle start game from intro
   */
  handleStartGame(): void {
    this.context.startTransition(() => {
      // Reset upgrades for new game
      this.context.gameUpgrades.reset();
      this.context.screenManager.upgradeTreeScreen.reset();
      
      // Ensure dev mode is off for normal gameplay
      this.context.setIsDevUpgradeMode(false);
      
      const levelConfig = getLevel(1);
      if (!levelConfig) {
        throw new Error('Level 1 not found');
      }
      this.context.setCurrentLevelId(1);
      this.context.setTotalBricksDestroyed(0);
      this.context.loadLevel(levelConfig);
      
      // Show tutorial for level 1
      this.context.setGameState(GameState.TUTORIAL);
    }, 1); // Pass level 1
  }

  /**
   * Handle dev upgrades button (for testing)
   * @TODO: Remove this entire method before production
   */
  handleDevUpgrades(): void {
    // Mark that we're in dev upgrade mode
    this.context.setIsDevUpgradeMode(true);
    
    // Start at level 0 so that handleUpgradeComplete increments to level 1
    this.context.setCurrentLevelId(0);
    this.context.setTotalBricksDestroyed(0);
    
    // Capture a dark background for the upgrade screen
    this.context.ctx.fillStyle = '#0a0a0a';
    this.context.ctx.fillRect(0, 0, this.context.canvas.width, this.context.canvas.height);
    this.context.screenManager.upgradeTreeScreen.captureBackground();
    
    // Give 500 points for testing
    this.context.screenManager.upgradeTreeScreen.setAvailablePoints(500);
    
    // Enable dev mode to show ALL button
    this.context.screenManager.upgradeTreeScreen.setDevMode(true);
    
    // Transition to upgrade screen
    this.context.setGameState(GameState.UPGRADE);
  }

  /**
   * Handle restart from game over
   */
  handleRestart(): void {
    this.context.startTransition(() => {
      // Reset upgrades when restarting
      this.context.gameUpgrades.reset();
      this.context.screenManager.upgradeTreeScreen.reset();
      
      // Exit dev mode when returning to intro
      this.context.setIsDevUpgradeMode(false);
      
      this.context.setGameState(GameState.INTRO);
    }, 1); // Pass level 1 when restarting
  }

  /**
   * Handle transition from level complete to upgrade screen
   */
  handleLevelCompleteTransition(): void {
    // Check if there are more levels
    const nextLevelId = this.context.currentLevelId + 1;
    const nextLevelConfig = getLevel(nextLevelId);
    
    if (!nextLevelConfig) {
      // No more levels - show game over with "COMPLETE" message
      this.context.setGameState(GameState.GAME_OVER);
      this.context.screenManager.gameOverScreen.setStats(
        this.context.currentLevelId, // Show last completed level
        this.context.totalBricksDestroyed,
        true
      );
      return;
    }
    
    // More levels exist - show upgrade screen
    // Capture current game state as background
    this.context.screenManager.upgradeTreeScreen.captureBackground();
    
    // Award 3 points for completing the level
    const currentPoints = this.context.screenManager.upgradeTreeScreen.getAvailablePoints();
    this.context.screenManager.upgradeTreeScreen.setAvailablePoints(currentPoints + 3);
    
    // Disable dev mode for normal gameplay
    this.context.screenManager.upgradeTreeScreen.setDevMode(false);
    
    // Transition to upgrade screen
    this.context.setGameState(GameState.UPGRADE);
  }

  /**
   * Handle continue from upgrade screen to next level
   */
  handleUpgradeComplete(): void {
    // Apply all purchased upgrades before transitioning
    this.applyUpgrades();
    
    // Always load next level (both in dev mode and normal mode)
    const levelIdToLoad = this.context.currentLevelId + 1;
    
    this.context.startTransition(() => {
      // Don't reset isDevUpgradeMode - it should persist throughout the dev session
      this.context.setCurrentLevelId(levelIdToLoad);
      const levelConfig = getLevel(levelIdToLoad);
      
      if (levelConfig) {
        this.context.loadLevel(levelConfig);
      }
    }, levelIdToLoad);
  }

  /**
   * Handle start level from dev upgrades (dev mode)
   */
  handleStartLevel(levelId: number): void {
    // Apply all purchased upgrades before transitioning
    this.applyUpgrades();
    
    this.context.startTransition(() => {
      // Don't reset isDevUpgradeMode - it should persist throughout the dev session
      
      // Set the level and reset stats
      this.context.setCurrentLevelId(levelId);
      this.context.setTotalBricksDestroyed(0);
      
      // Load the selected level
      const levelConfig = getLevel(levelId);
      if (levelConfig) {
        this.context.loadLevel(levelConfig);
      }
    }, levelId);
  }

  /**
   * Handle quit
   */
  handleQuit(): void {
    if (window.electron) {
      window.electron.quit();
    }
  }

  /**
   * Handle pause
   */
  handlePause(): void {
    if (this.context.gameState === GameState.PLAYING) {
      this.context.setGameState(GameState.PAUSED);
      this.context.canvas.style.cursor = 'default'; // Show cursor on pause
    }
  }

  /**
   * Handle resume from pause
   */
  handleResume(): void {
    if (this.context.gameState === GameState.PAUSED) {
      this.context.setGameState(GameState.PLAYING);
      this.context.canvas.style.cursor = 'none'; // Hide cursor when resuming
    }
  }

  /**
   * Handle quit from pause menu
   */
  handleQuitFromPause(): void {
    this.context.startTransition(() => {
      // Reset upgrades when quitting to menu
      this.context.gameUpgrades.reset();
      this.context.screenManager.upgradeTreeScreen.reset();
      this.context.setGameState(GameState.INTRO);
    }); // No level shown when going to intro
  }

  /**
   * Handle opening options screen
   */
  handleOpenOptions(): void {
    this.context.screenManager.setPreviousState(this.context.gameState);
    this.context.setGameState(GameState.OPTIONS);
    this.context.screenManager.optionsScreen.attach();
  }

  /**
   * Handle closing options screen
   */
  handleCloseOptions(): void {
    this.context.screenManager.optionsScreen.detach();
    const previousState = this.context.screenManager.getPreviousState();
    if (previousState) {
      this.context.setGameState(previousState);
      this.context.screenManager.setPreviousState(null);
    }
    
    // Apply volume settings
    this.context.applyOptions();
  }

  /**
   * Apply all purchased upgrades from the upgrade tree
   */
  private applyUpgrades(): void {
    // Get upgrade levels from the upgrade tree screen
    const upgrades = this.context.screenManager.upgradeTreeScreen.getUpgradeLevels();
    
    // Update upgrade manager
    this.context.gameUpgrades.setUpgradeLevels(upgrades);
    
    // Apply bat upgrades
    const batDimensions = this.context.gameUpgrades.applyBatUpgrades();
    
    const batPos = this.context.bat.getPosition();
    const batSpeed = this.context.bat.getSpeed();
    
    // Recreate bat with new dimensions (centered at same position)
    const centerX = batPos.x + this.context.bat.getWidth() / 2;
    this.context.bat = new Bat(
      centerX - batDimensions.width / 2,
      batPos.y,
      batDimensions.width,
      batDimensions.height,
      batSpeed
    );
    this.context.bat.setBounds(0, this.context.canvas.width, 0, this.context.canvas.height);
    
    // Apply shooter upgrades
    if (this.context.gameUpgrades.hasBatShooter()) {
      this.context.bat.setShowTurret(true);
      const turretCount = this.context.gameUpgrades.getTotalShooterCount();
      this.context.bat.setTurretCount(turretCount);
    }
    
    // Apply ball upgrades
    const ballProps = this.context.gameUpgrades.applyBallUpgrades();
    this.context.ball.setDamage(ballProps.damage);
    
    // Apply ball acceleration multiplier
    const accelerationMultiplier = this.context.gameUpgrades.getBallAccelerationMultiplier();
    this.context.ball.setAccelerationMultiplier(accelerationMultiplier);
  }
}
