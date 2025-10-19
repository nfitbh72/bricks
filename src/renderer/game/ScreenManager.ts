/**
 * ScreenManager - Manages UI screens and transitions
 */

import { IntroScreen } from '../ui/IntroScreen';
import { GameOverScreen } from '../ui/GameOverScreen';
import { LevelCompleteScreen } from '../ui/LevelCompleteScreen';
import { TransitionScreen } from '../ui/TransitionScreen';
import { PauseScreen } from '../ui/PauseScreen';
import { UpgradeTreeScreen } from '../ui/UpgradeTreeScreen';
import { OptionsScreen } from '../ui/OptionsScreen';
import { GameState } from './types';
import { getUpgrades } from '../config/upgrades';

export interface ScreenCallbacks {
  onStartGame: () => void;
  onQuit: () => void;
  onDevUpgrades: () => void;
  onOpenOptions: () => void;
  onRestart: () => void;
  onLevelCompleteTransition: () => void;
  onUpgradeComplete: () => void;
  onStartLevel: (levelId: number) => void;
  onResume: () => void;
  onQuitFromPause: () => void;
  onCloseOptions: () => void;
}

export class ScreenManager {
  private canvas: HTMLCanvasElement;
  
  // UI Screens
  public introScreen: IntroScreen;
  public gameOverScreen: GameOverScreen;
  public levelCompleteScreen: LevelCompleteScreen;
  public upgradeTreeScreen: UpgradeTreeScreen;
  public transitionScreen: TransitionScreen;
  public pauseScreen: PauseScreen;
  public optionsScreen: OptionsScreen;
  
  private isTransitioning: boolean = false;
  private previousState: GameState | null = null;

  constructor(canvas: HTMLCanvasElement, callbacks: ScreenCallbacks) {
    this.canvas = canvas;
    
    // Initialize UI screens
    this.introScreen = new IntroScreen(
      canvas,
      callbacks.onStartGame,
      callbacks.onQuit,
      callbacks.onDevUpgrades,
      callbacks.onOpenOptions
    );
    
    this.gameOverScreen = new GameOverScreen(
      canvas,
      callbacks.onRestart,
      callbacks.onQuit
    );
    
    this.levelCompleteScreen = new LevelCompleteScreen(
      canvas,
      callbacks.onLevelCompleteTransition
    );
    
    this.upgradeTreeScreen = new UpgradeTreeScreen(
      canvas,
      callbacks.onUpgradeComplete,
      callbacks.onStartLevel,
      getUpgrades()
    );
    
    this.transitionScreen = new TransitionScreen(canvas);
    
    this.pauseScreen = new PauseScreen(
      canvas,
      callbacks.onResume,
      callbacks.onQuitFromPause,
      callbacks.onOpenOptions
    );
    
    this.optionsScreen = new OptionsScreen(
      canvas,
      callbacks.onCloseOptions
    );
  }

  /**
   * Handle mouse move for current screen
   */
  handleMouseMove(x: number, y: number, currentState: GameState): void {
    switch (currentState) {
      case GameState.INTRO:
        this.introScreen.handleMouseMove(x, y);
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
  startTransition(onComplete: () => void): void {
    this.isTransitioning = true;
    this.transitionScreen.start(onComplete);
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
