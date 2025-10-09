/**
 * Game class - main game engine with loop and state management
 */

import { Ball } from './Ball';
import { Bat } from './Bat';
import { Level } from './Level';
import { StatusBar } from './StatusBar';
import { GameState, LevelConfig } from './types';
import { calculateGameElementScale } from './utils';
import { GameUpgrades } from './GameUpgrades';
import { getLevel } from '../config/levels';
import { AudioManager } from './AudioManager';
import { InputManager } from './InputManager';
import { ScreenManager } from './ScreenManager';
import { EffectsManager } from './EffectsManager';
import { CollisionManager } from './CollisionManager';
import { WeaponManager } from './WeaponManager';
import { PLAYER_STARTING_HEALTH } from '../config/constants';

export class Game {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private ball: Ball;
  private bat: Bat;
  private level: Level | null = null;
  private statusBar: StatusBar;
  private gameState: GameState = GameState.INTRO;
  private playerHealth: number = PLAYER_STARTING_HEALTH;
  private animationFrameId: number | null = null;
  private lastTime: number = 0;
  private accumulator: number = 0;
  private readonly fixedTimeStep: number = 1 / 60; // 60 FPS

  // Managers
  private audioManager: AudioManager;
  private inputManager: InputManager;
  private screenManager: ScreenManager;
  private effectsManager: EffectsManager;
  private collisionManager: CollisionManager;
  private weaponManager: WeaponManager;


  // Game stats
  private currentLevelId: number = 1;
  private totalBricksDestroyed: number = 0;
  private gameOverDelay: number = 1000; // 1 second delay
  private gameOverTimer: number = 0;
  private isDevUpgradeMode: boolean = false;
  private levelTime: number = 0; // Time spent on current level in seconds

  // Upgrades
  private gameUpgrades: GameUpgrades;


  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    const context = canvas.getContext('2d');
    if (!context) {
      throw new Error('Could not get 2D context from canvas');
    }
    this.ctx = context;

    // Calculate scale factor based on canvas size
    const scaleFactor = calculateGameElementScale(canvas.width, canvas.height);
    
    // Initialize ball and bat with scaled dimensions
    // Base sizes (at 4K): bat = 150x15, ball radius = 10, ball speed = 600
    const baseRadius = 10;
    const baseBatWidth = 150;
    const baseBatHeight = 15;
    const baseBallSpeed = 600;
    
    const ballRadius = baseRadius * scaleFactor;
    const batWidth = baseBatWidth * scaleFactor;
    const batHeight = baseBatHeight * scaleFactor;
    const ballSpeed = baseBallSpeed * scaleFactor;
    
    // Initialize upgrade manager
    this.gameUpgrades = new GameUpgrades();
    this.gameUpgrades.setBaseValues(batWidth, batHeight, ballSpeed, ballRadius);
    
    const centerX = canvas.width / 2;
    const batY = canvas.height - 100; // Bat higher up
    const ballY = batY - 30; // Ball above the bat
    
    this.bat = new Bat(centerX - batWidth / 2, batY, batWidth, batHeight, 300);
    this.bat.setBounds(0, canvas.width, 0, canvas.height);
    
    this.ball = new Ball(centerX, ballY, ballRadius, ballSpeed);

    // Initialize status bar
    this.statusBar = new StatusBar(canvas.width, canvas.height);

    // Initialize audio manager
    this.audioManager = new AudioManager();

    // Initialize screen manager
    this.screenManager = new ScreenManager(canvas, {
      onStartGame: () => this.handleStartGame(),
      onQuit: () => this.handleQuit(),
      onDevUpgrades: () => this.handleDevUpgrades(),
      onOpenOptions: () => this.handleOpenOptions(),
      onRestart: () => this.handleRestart(),
      onLevelCompleteTransition: () => this.handleLevelCompleteTransition(),
      onUpgradeComplete: () => this.handleUpgradeComplete(),
      onResume: () => this.handleResume(),
      onQuitFromPause: () => this.handleQuitFromPause(),
      onCloseOptions: () => this.handleCloseOptions(),
    });
    
    // Set volume change callback for real-time updates
    this.screenManager.optionsScreen.setVolumeChangeCallback((musicVolume: number, sfxVolume: number) => {
      this.audioManager.setMusicVolume(musicVolume);
      this.audioManager.setSFXVolume(sfxVolume);
    });

    // Initialize effects manager
    this.effectsManager = new EffectsManager();

    // Initialize input manager
    this.inputManager = new InputManager(canvas);
    this.setupInputCallbacks();

    // Initialize collision manager
    this.collisionManager = new CollisionManager();
    this.setupCollisionCallbacks();

    // Initialize weapon manager
    this.weaponManager = new WeaponManager();

    // Apply saved options
    this.applyOptions();

    // Load background image
    this.loadBackgroundImage();
  }

  /**
   * Load the background image for a specific level
   */
  private loadBackgroundImage(levelId?: number): void {
    const id = levelId || this.currentLevelId;
    this.effectsManager.loadBackgroundImage(id);
  }

  /**
   * Set up input callbacks for the input manager
   */
  private setupInputCallbacks(): void {
    this.inputManager.setCallbacks({
      onEscape: () => {
        if (this.gameState === GameState.PLAYING) {
          this.handlePause();
        } else if (this.gameState === GameState.PAUSED) {
          this.handleResume();
        }
      },
      onSpace: () => {
        if (this.gameState === GameState.PLAYING) {
          this.weaponManager.shootLaser(this.bat, this.ball, this.gameUpgrades);
        }
      },
      onKeyPress: (key: string) => {
        this.screenManager.handleKeyPress(key, this.gameState);
      },
      onMouseMove: (x: number, y: number) => {
        this.screenManager.handleMouseMove(x, y, this.gameState);
        
        if (this.gameState === GameState.PLAYING) {
          this.inputManager.setMouseControl(true);
          this.canvas.style.cursor = 'none';
        }
      },
      onClick: (x: number, y: number) => {
        this.screenManager.handleClick(x, y, this.gameState);
        
        if (this.gameState === GameState.PLAYING) {
          this.weaponManager.shootLaser(this.bat, this.ball, this.gameUpgrades);
        }
      },
    });
  }

  /**
   * Set up collision callbacks
   */
  private setupCollisionCallbacks(): void {
    this.collisionManager.setCallbacks({
      onBrickHit: (brick, damage, isCritical) => {
        const brickBounds = brick.getBounds();
        const brickCenterX = brickBounds.x + brickBounds.width / 2;
        const brickTopY = brickBounds.y - 5;
        this.effectsManager.addDamageNumber(brickCenterX, brickTopY, damage, isCritical);
        
        if (!brick.isDestroyed()) {
          this.audioManager.playBrickHit();
        }
      },
      onBrickDestroyed: (brick, x, y, isCritical) => {
        this.totalBricksDestroyed++;
        this.statusBar.setBrickCounts(
          this.level!.getRemainingBricks(),
          this.level!.getTotalBricks()
        );
        
        // Create particles
        const particleCount = isCritical ? 20 : 10;
        const particleLifetime = isCritical ? 200 : 150;
        const particleColor = isCritical ? '#ffff00' : brick.getColor();
        this.effectsManager.createParticles(x, y, particleCount, particleColor, particleLifetime);
        
        // Play explosion sound
        this.audioManager.playBrickExplode();
      },
      onExplosionDamage: (brick, damage, x, y) => {
        this.effectsManager.addDamageNumber(x, y - 5, damage, false);
        
        if (brick.isDestroyed()) {
          this.effectsManager.createParticles(x, y, 8, brick.getColor(), 120);
        }
      },
    });
  }

  /**
   * Handle start game from intro
   */
  private handleStartGame(): void {
    this.startTransition(() => {
      // Reset upgrades for new game
      this.gameUpgrades.reset();
      this.screenManager.upgradeTreeScreen.reset();
      
      const levelConfig = getLevel(1);
      if (!levelConfig) {
        throw new Error('Level 1 not found');
      }
      this.currentLevelId = 1;
      this.totalBricksDestroyed = 0;
      this.loadLevel(levelConfig);
    });
  }

  /**
   * Handle dev upgrades button (for testing)
   * @TODO: Remove this entire method before production
   */
  private handleDevUpgrades(): void {
    // Mark that we're in dev upgrade mode
    this.isDevUpgradeMode = true;
    
    // Capture a dark background for the upgrade screen
    this.ctx.fillStyle = '#0a0a0a';
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    this.screenManager.upgradeTreeScreen.captureBackground();
    
    // Give 500 points for testing
    this.screenManager.upgradeTreeScreen.setAvailablePoints(500);
    
    // Enable dev mode to show ALL button
    this.screenManager.upgradeTreeScreen.setDevMode(true);
    
    // Transition to upgrade screen
    this.gameState = GameState.UPGRADE;
  }

  /**
   * Handle restart from game over
   */
  private handleRestart(): void {
    this.startTransition(() => {
      // Reset upgrades when restarting
      this.gameUpgrades.reset();
      this.screenManager.upgradeTreeScreen.reset();
      this.gameState = GameState.INTRO;
    });
  }

  /**
   * Handle transition from level complete to upgrade screen
   */
  private handleLevelCompleteTransition(): void {
    // Capture current game state as background
    this.screenManager.upgradeTreeScreen.captureBackground();
    
    // Award 3 points for completing the level
    const currentPoints = this.screenManager.upgradeTreeScreen.getAvailablePoints();
    this.screenManager.upgradeTreeScreen.setAvailablePoints(currentPoints + 3);
    
    // Disable dev mode for normal gameplay
    this.screenManager.upgradeTreeScreen.setDevMode(false);
    
    // Transition to upgrade screen
    this.gameState = GameState.UPGRADE;
  }

  /**
   * Handle continue from upgrade screen to next level
   */
  private handleUpgradeComplete(): void {
    // Apply all purchased upgrades before transitioning
    this.applyUpgrades();
    
    this.startTransition(() => {
      // If coming from DEV UPGRADES, always start at level 1
      if (this.isDevUpgradeMode) {
        this.isDevUpgradeMode = false;
        this.currentLevelId = 1;
        this.totalBricksDestroyed = 0;
        const levelConfig = getLevel(1);
        if (levelConfig) {
          this.loadLevel(levelConfig);
        }
      } else {
        // Normal flow: go to next level
        const nextLevelConfig = getLevel(this.currentLevelId + 1);
        if (nextLevelConfig) {
          this.currentLevelId++;
          this.loadLevel(nextLevelConfig);
        } else {
          // No more levels - show game over with "COMPLETE" message
          this.gameState = GameState.GAME_OVER;
          this.screenManager.gameOverScreen.setStats(this.currentLevelId, this.totalBricksDestroyed, true);
        }
      }
    });
  }

  /**
   * Apply all purchased upgrades from the upgrade tree
   */
  private applyUpgrades(): void {
    // Get upgrade levels from the upgrade tree screen
    const upgrades = this.screenManager.upgradeTreeScreen.getUpgradeLevels();
    
    // Update upgrade manager
    this.gameUpgrades.setUpgradeLevels(upgrades);
    
    // Apply bat upgrades
    const batDimensions = this.gameUpgrades.applyBatUpgrades();
    
    const batPos = this.bat.getPosition();
    const batSpeed = this.bat.getSpeed();
    
    // Recreate bat with new dimensions (centered at same position)
    const centerX = batPos.x + this.bat.getWidth() / 2;
    this.bat = new Bat(
      centerX - batDimensions.width / 2,
      batPos.y,
      batDimensions.width,
      batDimensions.height,
      batSpeed
    );
    this.bat.setBounds(0, this.canvas.width, 0, this.canvas.height);
    
    // Apply ball upgrades
    const ballProps = this.gameUpgrades.applyBallUpgrades();
    this.ball.setDamage(ballProps.damage);
  }

  /**
   * Handle quit
   */
  private handleQuit(): void {
    if (window.electron) {
      window.electron.quit();
    }
  }

  /**
   * Handle pause
   */
  private handlePause(): void {
    if (this.gameState === GameState.PLAYING) {
      this.gameState = GameState.PAUSED;
      this.canvas.style.cursor = 'default'; // Show cursor on pause
    }
  }

  /**
   * Handle resume from pause
   */
  private handleResume(): void {
    if (this.gameState === GameState.PAUSED) {
      this.gameState = GameState.PLAYING;
      this.canvas.style.cursor = 'none'; // Hide cursor when resuming
    }
  }

  /**
   * Handle quit from pause menu
   */
  private handleQuitFromPause(): void {
    this.startTransition(() => {
      // Reset upgrades when quitting to menu
      this.gameUpgrades.reset();
      this.screenManager.upgradeTreeScreen.reset();
      this.gameState = GameState.INTRO;
    });
  }

  /**
   * Handle opening options screen
   */
  private handleOpenOptions(): void {
    this.screenManager.setPreviousState(this.gameState);
    this.gameState = GameState.OPTIONS;
    this.screenManager.optionsScreen.attach();
  }

  /**
   * Handle closing options screen
   */
  private handleCloseOptions(): void {
    this.screenManager.optionsScreen.detach();
    const previousState = this.screenManager.getPreviousState();
    if (previousState) {
      this.gameState = previousState;
      this.screenManager.setPreviousState(null);
    }
    
    // Apply volume settings
    this.applyOptions();
  }

  /**
   * Apply options to game
   */
  private applyOptions(): void {
    const options = this.screenManager.optionsScreen.getOptions();
    
    // Apply music volume
    this.audioManager.setMusicVolume(options.musicVolume);
    
    // Apply SFX volume
    this.audioManager.setSFXVolume(options.sfxVolume);
  }

  /**
   * Start transition animation
   */
  private startTransition(onComplete: () => void): void {
    this.screenManager.startTransition(onComplete);
  }


  /**
   * Load a level
   * Centers bricks horizontally on the canvas
   */
  loadLevel(levelConfig: LevelConfig): void {
    // Create level with canvas width for centering
    this.level = new Level(levelConfig, this.canvas.width);
    
    // Set player health: base + upgrade bonus
    const upgradeBonus = this.gameUpgrades.getHealthBonus();
    this.playerHealth = PLAYER_STARTING_HEALTH + upgradeBonus;
    
    // Clear any active lasers
    this.weaponManager.clear();
    
    // Reset level timer
    this.levelTime = 0;
    
    this.gameState = GameState.PLAYING;
    
    // Load background image for this level
    this.loadBackgroundImage(levelConfig.id);
    
    // Update status bar
    this.statusBar.setLevelTitle(levelConfig.name);
    this.statusBar.setPlayerHealth(this.playerHealth);
    this.statusBar.setBrickCounts(
      this.level.getRemainingBricks(),
      this.level.getTotalBricks()
    );
    
    // Reset ball and bat position (preserve bat size from upgrades)
    const centerX = this.canvas.width / 2;
    const batY = this.canvas.height - 100; // Bat higher up
    const ballY = batY - 30; // Ball above the bat
    const batWidth = this.bat.getWidth();
    const batHeight = this.bat.getHeight();
    
    // Move mouse pointer to bat spawn position (center of bat)
    this.inputManager.setMousePosition(centerX, batY + batHeight / 2);
    
    this.bat.setPosition(centerX - batWidth / 2, batY); // Center bat
    this.ball.reset();
    this.ball.setPosition(centerX, ballY);
  }

  /**
   * Start the game loop
   */
  start(): void {
    this.lastTime = performance.now();
    this.gameLoop(this.lastTime);
  }

  /**
   * Stop the game loop
   */
  stop(): void {
    if (this.animationFrameId !== null) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
    }
  }

  /**
   * Main game loop with fixed timestep
   */
  private gameLoop(currentTime: number): void {
    this.animationFrameId = requestAnimationFrame((time) => this.gameLoop(time));

    const deltaTime = (currentTime - this.lastTime) / 1000; // Convert to seconds
    this.lastTime = currentTime;

    // Accumulate time
    this.accumulator += deltaTime;

    // Fixed timestep updates
    while (this.accumulator >= this.fixedTimeStep) {
      this.update(this.fixedTimeStep);
      this.accumulator -= this.fixedTimeStep;
    }

    // Render
    this.render();
  }

  /**
   * Update game state
   */
  private update(deltaTime: number): void {
    // Handle transition
    if (this.screenManager.isInTransition()) {
      return;
    }

    // Update screen animations
    this.screenManager.update(this.gameState, deltaTime);

    // Handle game over delay
    if (this.gameState === GameState.PLAYING && this.playerHealth <= 0) {
      this.gameOverTimer += deltaTime * 1000; // Convert to ms
      if (this.gameOverTimer >= this.gameOverDelay) {
        this.gameState = GameState.GAME_OVER;
        this.screenManager.gameOverScreen.setStats(this.currentLevelId, this.totalBricksDestroyed, false);
        this.gameOverTimer = 0;
      }
      return;
    }

    if (this.gameState !== GameState.PLAYING) {
      return; // Pause updates when not playing or paused
    }

    // Update level timer
    this.levelTime += deltaTime;
    this.statusBar.setLevelTime(this.levelTime);

    // Handle input
    this.handleInput(deltaTime);

    // Update ball
    this.ball.update(deltaTime);

    // Update weapons
    this.weaponManager.update(deltaTime);

    // Update visual effects
    this.effectsManager.update(deltaTime);

    // Check wall collisions (bottom boundary is status bar top)
    const statusBarTop = this.statusBar.getY();
    const hitBackWall = this.ball.checkWallCollisions(
      0,
      this.canvas.width,
      0,
      statusBarTop
    );

    if (hitBackWall) {
      this.playerHealth--;
      this.statusBar.setPlayerHealth(this.playerHealth);
      // Trigger screen shake on back wall hit
      this.effectsManager.triggerScreenShake(3, 0.2); // 3px intensity, 0.2s duration
    }

    // Check collisions
    this.checkCollisions();

    // Check level completion
    if (this.level && this.level.isComplete()) {
      this.gameState = GameState.LEVEL_COMPLETE;
      this.screenManager.levelCompleteScreen.setLevel(this.currentLevelId, this.levelTime);
    }
  }

  /**
   * Handle keyboard and mouse input
   */
  private handleInput(deltaTime: number): void {
    if (this.inputManager.isMouseControlEnabled()) {
      // Mouse control (2D)
      const mousePos = this.inputManager.getMousePosition();
      this.bat.setMousePosition(mousePos.x, mousePos.y);
    } else {
      // Keyboard control (WASD + Arrow keys)
      const movement = this.inputManager.getMovementInput();
      if (movement.left) {
        this.bat.moveLeft(deltaTime);
      }
      if (movement.right) {
        this.bat.moveRight(deltaTime);
      }
      if (movement.up) {
        this.bat.moveUp(deltaTime);
      }
      if (movement.down) {
        this.bat.moveDown(deltaTime);
      }
    }
  }

  /**
   * Check all collisions
   */
  private checkCollisions(): void {
    if (!this.level) return;

    // Ball-Bat collision
    this.collisionManager.checkBallBatCollision(this.ball, this.bat);

    // Ball-Brick collisions
    this.collisionManager.checkBallBrickCollisions(this.ball, this.level, this.gameUpgrades);

    // Laser-Brick collisions
    this.collisionManager.checkLaserBrickCollisions(this.weaponManager.getLasers(), this.level);
  }

  /**
   * Render the game
   */
  private render(): void {
    // Handle transition rendering
    if (this.screenManager.updateTransition(performance.now())) {
      return; // Still transitioning
    }

    // Update cursor visibility based on game state
    if (this.gameState === GameState.PLAYING) {
      this.canvas.style.cursor = 'none'; // Hide cursor during gameplay
    } else {
      this.canvas.style.cursor = 'default'; // Show cursor on menus
    }

    // Render using screen manager
    this.screenManager.render(
      this.gameState,
      this.screenManager.getPreviousState(),
      () => this.renderGameplay()
    );
  }

  /**
   * Render gameplay (used for both PLAYING and PAUSED states)
   */
  private renderGameplay(): void {
    // Clear canvas with black
    this.ctx.fillStyle = '#0a0a0a';
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

    // Draw background image if loaded
    this.effectsManager.renderBackground(this.ctx, this.canvas.width, this.canvas.height);

    // Apply screen shake
    const shake = this.effectsManager.getScreenShakeOffset();
    this.ctx.save();
    this.ctx.translate(shake.x, shake.y);

    // Render level (bricks)
    if (this.level) {
      this.level.render(this.ctx);
    }

    // Render bat
    this.bat.render(this.ctx);

    // Render ball
    this.ball.render(this.ctx);

    // Render weapons (lasers)
    this.weaponManager.render(this.ctx);

    // Render visual effects (if enabled)
    const options = this.screenManager.optionsScreen.getOptions();
    this.effectsManager.render(this.ctx, options.showParticles, options.showDamageNumbers);

    this.ctx.restore();

    // Render status bar (not affected by screen shake)
    this.statusBar.render(this.ctx);

    // Render CRT scanline overlay
    this.renderCRTOverlay();
  }


  /**
   * Get current game state (for testing)
   */
  getGameState(): GameState {
    return this.gameState;
  }

  /**
   * Get player health (for testing)
   */
  getPlayerHealth(): number {
    return this.playerHealth;
  }

  /**
   * Get ball reference (for testing)
   */
  getBall(): Ball {
    return this.ball;
  }

  /**
   * Get bat reference (for testing)
   */
  getBat(): Bat {
    return this.bat;
  }

  /**
   * Get level reference (for testing)
   */
  getLevel(): Level | null {
    return this.level;
  }

  /**
   * Set game state (for testing)
   */
  setGameState(state: GameState): void {
    this.gameState = state;
  }


  /**
   * Render CRT scanline overlay effect
   */
  private renderCRTOverlay(): void {
    this.ctx.save();
    
    // Draw scanlines
    this.ctx.globalAlpha = 0.1;
    this.ctx.fillStyle = '#000000';
    
    for (let y = 0; y < this.canvas.height; y += 2) {
      this.ctx.fillRect(0, y, this.canvas.width, 1);
    }
    
    // Add slight vignette effect
    const gradient = this.ctx.createRadialGradient(
      this.canvas.width / 2,
      this.canvas.height / 2,
      0,
      this.canvas.width / 2,
      this.canvas.height / 2,
      Math.max(this.canvas.width, this.canvas.height) / 2
    );
    gradient.addColorStop(0, 'rgba(0, 0, 0, 0)');
    gradient.addColorStop(1, 'rgba(0, 0, 0, 0.3)');
    
    this.ctx.globalAlpha = 1;
    this.ctx.fillStyle = gradient;
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    
    this.ctx.restore();
  }
}
