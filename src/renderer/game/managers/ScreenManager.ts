/**
 * ScreenManager - Manages UI screens and transitions with lazy initialization
 */

import { IntroScreen } from '../../ui/IntroScreen';
import { GameOverScreen } from '../../ui/GameOverScreen';
import { LevelCompleteScreen } from '../../ui/LevelCompleteScreen';
import { TransitionScreen } from '../../ui/TransitionScreen';
import { PauseScreen } from '../../ui/PauseScreen';
import { UpgradeTreeScreen } from '../../ui/UpgradeTreeScreen';
import { OptionsScreen } from '../../ui/OptionsScreen';
import { TutorialScreen } from '../../ui/TutorialScreen';
import { AchievementsScreen } from '../../ui/AchievementsScreen';
import { GameState } from '../core/types';
import { getUpgrades } from '../../config/upgrades';
import { GameContext } from '../core/GameContext';

export interface ScreenCallbacks {
  onStartGame: () => void;
  onQuit: () => void;
  onDevUpgrades: () => void;
  onOpenOptions: () => void;
  onOpenAchievements: () => void;
  onRestart: () => void;
  onLevelCompleteTransition: () => void;
  onUpgradeComplete: () => void;
  onUpgradeActivated: (upgradeType: string) => void;
  onStartLevel: (levelId: number) => void;
  onResume: () => void;
  onQuitFromPause: () => void;
  onCloseOptions: () => void;
  onCloseTutorial: () => void;
  onCloseAchievements: () => void;
}

export class ScreenManager {
  private canvas: HTMLCanvasElement;
  private context: GameContext;
  private callbacks: ScreenCallbacks;
  
  // UI Screens (lazy initialized)
  private _introScreen?: IntroScreen;
  private _tutorialScreen?: TutorialScreen;
  private _gameOverScreen?: GameOverScreen;
  private _levelCompleteScreen?: LevelCompleteScreen;
  private _upgradeTreeScreen?: UpgradeTreeScreen;
  private _transitionScreen?: TransitionScreen;
  private _pauseScreen?: PauseScreen;
  private _optionsScreen?: OptionsScreen;
  private _achievementsScreen?: AchievementsScreen;
  
  private isTransitioning: boolean = false;
  private previousState: GameState | null = null;

  constructor(canvas: HTMLCanvasElement, context: GameContext, callbacks: ScreenCallbacks) {
    this.canvas = canvas;
    this.context = context;
    this.callbacks = callbacks;
    
    // Screens are now lazily initialized when accessed
  }

  /**
   * Lazy getter for intro screen
   */
  get introScreen(): IntroScreen {
    if (!this._introScreen) {
      this._introScreen = new IntroScreen(
        this.canvas,
        this.callbacks.onStartGame,
        this.callbacks.onQuit,
        this.callbacks.onDevUpgrades,
        this.callbacks.onOpenOptions,
        this.callbacks.onOpenAchievements
      );
    }
    return this._introScreen;
  }

  /**
   * Lazy getter for tutorial screen
   */
  get tutorialScreen(): TutorialScreen {
    if (!this._tutorialScreen) {
      this._tutorialScreen = new TutorialScreen(
        this.canvas,
        this.callbacks.onCloseTutorial
      );
    }
    return this._tutorialScreen;
  }

  /**
   * Lazy getter for game over screen
   */
  get gameOverScreen(): GameOverScreen {
    if (!this._gameOverScreen) {
      this._gameOverScreen = new GameOverScreen(
        this.canvas,
        this.callbacks.onRestart,
        this.callbacks.onQuit
      );
    }
    return this._gameOverScreen;
  }

  /**
   * Lazy getter for level complete screen
   */
  get levelCompleteScreen(): LevelCompleteScreen {
    if (!this._levelCompleteScreen) {
      this._levelCompleteScreen = new LevelCompleteScreen(
        this.canvas,
        this.callbacks.onLevelCompleteTransition
      );
    }
    return this._levelCompleteScreen;
  }

  /**
   * Lazy getter for upgrade tree screen
   */
  get upgradeTreeScreen(): UpgradeTreeScreen {
    if (!this._upgradeTreeScreen) {
      this._upgradeTreeScreen = new UpgradeTreeScreen(
        this.canvas,
        this.callbacks.onUpgradeComplete,
        this.callbacks.onStartLevel,
        getUpgrades(),
        this.callbacks.onUpgradeActivated,
        this.context.gameUpgrades // May be undefined initially, but set before first access
      );
    }
    return this._upgradeTreeScreen;
  }

  /**
   * Lazy getter for transition screen
   */
  get transitionScreen(): TransitionScreen {
    if (!this._transitionScreen) {
      this._transitionScreen = new TransitionScreen(this.canvas);
    }
    return this._transitionScreen;
  }

  /**
   * Lazy getter for pause screen
   */
  get pauseScreen(): PauseScreen {
    if (!this._pauseScreen) {
      this._pauseScreen = new PauseScreen(
        this.canvas,
        this.callbacks.onResume,
        this.callbacks.onQuitFromPause,
        this.callbacks.onOpenOptions
      );
    }
    return this._pauseScreen;
  }

  /**
   * Lazy getter for options screen
   */
  get optionsScreen(): OptionsScreen {
    if (!this._optionsScreen) {
      this._optionsScreen = new OptionsScreen(
        this.canvas,
        this.callbacks.onCloseOptions
      );
    }
    return this._optionsScreen;
  }

  /**
   * Lazy getter for achievements screen
   */
  get achievementsScreen(): AchievementsScreen {
    if (!this._achievementsScreen) {
      this._achievementsScreen = new AchievementsScreen(
        this.canvas,
        this.callbacks.onCloseAchievements,
        this.context.achievementTracker
      );
    }
    return this._achievementsScreen;
  }

  /**
   * Handle mouse move for current screen
   */
  handleMouseMove(x: number, y: number, currentState: GameState): void {
    switch (currentState) {
      case GameState.INTRO:
        this.introScreen.handleMouseMove(x, y);
        break;
      case GameState.ACHIEVEMENTS:
        this.achievementsScreen.handleMouseMove(x, y);
        break;
      case GameState.TUTORIAL:
        this.tutorialScreen.handleMouseMove(x, y);
        break;
      case GameState.GAME_OVER:
        this.gameOverScreen.handleMouseMove(x, y);
        break;
      case GameState.LEVEL_COMPLETE:
        this.levelCompleteScreen.handleMouseMove(x, y);
        break;
      case GameState.UPGRADE:
        this.upgradeTreeScreen.handleMouseMove(x, y);
        break;
      case GameState.PAUSED:
        this.pauseScreen.handleMouseMove(x, y);
        break;
    }
  }

  /**
   * Handle click for current screen
   */
  handleClick(x: number, y: number, currentState: GameState): void {
    switch (currentState) {
      case GameState.INTRO:
        this.introScreen.handleClick(x, y);
        break;
      case GameState.ACHIEVEMENTS:
        this.achievementsScreen.handleClick(x, y);
        break;
      case GameState.TUTORIAL:
        this.tutorialScreen.handleClick(x, y);
        break;
      case GameState.GAME_OVER:
        this.gameOverScreen.handleClick(x, y);
        break;
      case GameState.LEVEL_COMPLETE:
        this.levelCompleteScreen.handleClick(x, y);
        break;
      case GameState.UPGRADE:
        this.upgradeTreeScreen.handleClick(x, y);
        break;
      case GameState.PAUSED:
        this.pauseScreen.handleClick(x, y);
        break;
    }
  }

  /**
   * Handle key press for current screen
   */
  handleKeyPress(key: string, currentState: GameState): void {
    switch (currentState) {
      case GameState.INTRO:
        this.introScreen.handleKeyPress(key);
        break;
      case GameState.ACHIEVEMENTS:
        this.achievementsScreen.handleKeyPress(key);
        break;
      case GameState.TUTORIAL:
        this.tutorialScreen.handleKeyPress(key);
        break;
      case GameState.GAME_OVER:
        this.gameOverScreen.handleKeyPress(key);
        break;
      case GameState.LEVEL_COMPLETE:
        this.levelCompleteScreen.handleKeyPress(key);
        break;
      case GameState.UPGRADE:
        this.upgradeTreeScreen.handleKeyPress(key);
        break;
      case GameState.PAUSED:
        this.pauseScreen.handleKeyPress(key);
        break;
    }
  }

  /**
   * Update current screen (for animations)
   */
  update(currentState: GameState, deltaTime: number): void {
    if (currentState === GameState.LEVEL_COMPLETE) {
      this.levelCompleteScreen.update(deltaTime);
    }
  }

  /**
   * Render current screen
   */
  render(currentState: GameState, previousState: GameState | null, renderGameplayFn: () => void): void {
    switch (currentState) {
      case GameState.INTRO:
        this.introScreen.render();
        break;
      case GameState.ACHIEVEMENTS:
        this.achievementsScreen.render();
        break;
      case GameState.TUTORIAL:
        // Render game in background
        renderGameplayFn();
        // Render tutorial overlay
        this.tutorialScreen.render();
        break;
      case GameState.GAME_OVER:
        this.gameOverScreen.render();
        break;
      case GameState.LEVEL_COMPLETE:
        this.levelCompleteScreen.render();
        break;
      case GameState.UPGRADE:
        this.upgradeTreeScreen.render();
        break;
      case GameState.OPTIONS:
        // Render previous screen in background
        if (previousState === GameState.INTRO) {
          this.introScreen.render();
        } else if (previousState === GameState.PAUSED) {
          renderGameplayFn();
          this.pauseScreen.render();
        }
        // Render options overlay
        this.optionsScreen.render();
        break;
      case GameState.PAUSED:
        // Render game in background
        renderGameplayFn();
        // Render pause overlay
        this.pauseScreen.render();
        break;
      case GameState.PLAYING:
        renderGameplayFn();
        break;
    }
  }

  /**
   * Start transition animation
   */
  startTransition(onComplete: () => void, nextLevel?: number): void {
    this.isTransitioning = true;
    this.transitionScreen.start(onComplete, nextLevel);
  }

  /**
   * Update transition (returns true if complete)
   */
  updateTransition(currentTime: number): boolean {
    if (!this.isTransitioning) return false;
    
    const complete = this.transitionScreen.update(currentTime);
    this.transitionScreen.render();
    
    if (complete) {
      this.isTransitioning = false;
      this.transitionScreen.reset();
    }
    
    return !complete; // Return true if still transitioning
  }

  /**
   * Check if currently transitioning
   */
  isInTransition(): boolean {
    return this.isTransitioning;
  }

  /**
   * Set previous state (for options screen)
   */
  setPreviousState(state: GameState | null): void {
    this.previousState = state;
  }

  /**
   * Get previous state
   */
  getPreviousState(): GameState | null {
    return this.previousState;
  }
}
