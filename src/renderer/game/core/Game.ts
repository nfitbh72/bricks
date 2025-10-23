/**
 * Game class - main game engine with loop and state management
 */

import { Ball } from '../entities/Ball';
import { Bat } from '../entities/Bat';
import { Level } from '../entities/Level';
import { StatusBar } from '../ui/StatusBar';
import { GameState, LevelConfig, BrickType } from '../core/types';
import { calculateGameElementScale } from '../core/utils';
import { GameUpgrades } from '../systems/GameUpgrades';
import { getLevel } from '../../config/levels';
import { AudioManager } from '../managers/AudioManager';
import { InputManager } from '../managers/InputManager';
import { ScreenManager } from '../managers/ScreenManager';
import { EffectsManager } from '../managers/EffectsManager';
import { CollisionManager } from '../managers/CollisionManager';
import { WeaponManager } from '../managers/WeaponManager';
import { OffensiveEntityManager } from '../managers/OffensiveEntityManager';
import { SlowMotionManager } from '../managers/SlowMotionManager';
import { StateTransitionHandler, StateTransitionContext } from '../managers/StateTransitionHandler';
import { Brick } from '../entities/Brick';
import { 
  PLAYER_STARTING_HEALTH
} from '../../config/constants';
import { LanguageManager } from '../../i18n/LanguageManager';

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
  private offensiveEntityManager: OffensiveEntityManager;
  private slowMotionManager: SlowMotionManager;
  private stateTransitionHandler: StateTransitionHandler;


  // Game stats
  private currentLevelId: number = 1;
  private totalBricksDestroyed: number = 0;
  private gameOverDelay: number = 1000; // 1 second delay
  private gameOverTimer: number = 0;
  private levelCompleteDelay: number = 1000; // 1 second delay for animations
  private levelCompleteTimer: number = 0;
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
      onStartLevel: (levelId: number) => this.handleStartLevel(levelId),
      onResume: () => this.handleResume(),
      onQuitFromPause: () => this.handleQuitFromPause(),
      onCloseOptions: () => this.handleCloseOptions(),
    });
    
    // Set volume change callback for real-time updates
    this.screenManager.optionsScreen.setVolumeChangeCallback((musicVolume: number, sfxVolume: number) => {
      this.audioManager.setMusicVolume(musicVolume);
      this.audioManager.setSFXVolume(sfxVolume);
    });

    // Set language change callback to refresh UI
    this.screenManager.optionsScreen.setLanguageChangeCallback(() => {
      // Force a re-render to update all translated text
      this.render();
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

    // Initialize offensive entity manager
    this.offensiveEntityManager = new OffensiveEntityManager();

    // Initialize slow-motion manager
    this.slowMotionManager = new SlowMotionManager();

    // Initialize state transition handler
    this.stateTransitionHandler = new StateTransitionHandler(this.getTransitionContext());

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
          // Launch ball if sticky, otherwise shoot laser
          if (this.ball.getIsSticky()) {
            this.ball.launchFromSticky();
          } else {
            this.weaponManager.shootLaser(this.bat, this.ball, this.gameUpgrades);
          }
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
          // Launch ball if sticky, otherwise shoot laser
          if (this.ball.getIsSticky()) {
            this.ball.launchFromSticky();
          } else {
            this.weaponManager.shootLaser(this.bat, this.ball, this.gameUpgrades);
          }
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
          this.audioManager.playBrickDamage();
        }
      },
      onBrickDestroyed: (brick, x, y, isCritical) => {
        this.totalBricksDestroyed++;
        const remainingBricks = this.level!.getRemainingBricks();
        this.statusBar.setBrickCounts(
          remainingBricks,
          this.level!.getTotalBricks()
        );
        
        console.log(`Brick destroyed! Remaining bricks: ${remainingBricks}`);
        
        // Spawn offensive entities based on brick type
        const batCenterX = this.bat.getCenterX();
        this.offensiveEntityManager.spawnOffensiveEntity(brick, x, y, batCenterX);
        
        // Create particles (more for final brick)
        const particleCount = remainingBricks === 0 ? 30 : (isCritical ? 20 : 10);
        const particleLifetime = remainingBricks === 0 ? 300 : (isCritical ? 200 : 150);
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
      onBatDamaged: (damagePercent) => {
        // Visual feedback for bat damage
        this.effectsManager.triggerScreenShake(2, 0.15);
        
        // Check if bat is destroyed
        if (this.bat.isDestroyed()) {
          this.playerHealth = 0;
        } else {
          // Play bat damage sound when damaged but not destroyed
          this.audioManager.playBatDamage();
        }
      },
    });
  }

  /**
   * Get transition context for StateTransitionHandler
   */
  private getTransitionContext(): StateTransitionContext {
    return {
      canvas: this.canvas,
      ctx: this.ctx,
      bat: this.bat,
      ball: this.ball,
      gameUpgrades: this.gameUpgrades,
      screenManager: this.screenManager,
      audioManager: this.audioManager,
      gameState: this.gameState,
      currentLevelId: this.currentLevelId,
      totalBricksDestroyed: this.totalBricksDestroyed,
      isDevUpgradeMode: this.isDevUpgradeMode,
      loadLevel: (config) => this.loadLevel(config),
      startTransition: (onComplete) => this.startTransition(onComplete),
      applyOptions: () => this.applyOptions(),
      setCurrentLevelId: (id: number) => { this.currentLevelId = id; },
      setTotalBricksDestroyed: (count: number) => { this.totalBricksDestroyed = count; },
      setIsDevUpgradeMode: (value: boolean) => { this.isDevUpgradeMode = value; },
      setGameState: (state: GameState) => { this.gameState = state; },
    };
  }

  /**
   * Handle start game from intro
   */
  private handleStartGame(): void {
    this.stateTransitionHandler.updateContext(this.getTransitionContext());
    this.stateTransitionHandler.handleStartGame();
    // Note: No sync needed - handler uses async transition callback with setters
  }

  /**
   * Sync state back from transition context after handler modifies it
   */
  private syncFromTransitionContext(): void {
    const context = this.stateTransitionHandler['context'];
    this.bat = context.bat;
    this.ball = context.ball;
    this.gameState = context.gameState;
    this.currentLevelId = context.currentLevelId;
    this.totalBricksDestroyed = context.totalBricksDestroyed;
    this.isDevUpgradeMode = context.isDevUpgradeMode;
  }

  /**
   * Handle dev upgrades button (for testing)
   * @TODO: Remove this entire method before production
   */
  private handleDevUpgrades(): void {
    this.stateTransitionHandler.updateContext(this.getTransitionContext());
    this.stateTransitionHandler.handleDevUpgrades();
    // Note: No sync needed - handler uses setters directly
  }

  /**
   * Handle restart from game over
   */
  private handleRestart(): void {
    this.stateTransitionHandler.updateContext(this.getTransitionContext());
    this.stateTransitionHandler.handleRestart();
    // Note: No sync needed - handler uses async transition callback
  }

  /**
   * Handle transition from level complete to upgrade screen
   */
  private handleLevelCompleteTransition(): void {
    this.stateTransitionHandler.updateContext(this.getTransitionContext());
    this.stateTransitionHandler.handleLevelCompleteTransition();
    // Note: No sync needed - handler uses setters directly
  }

  /**
   * Handle continue from upgrade screen to next level
   */
  private handleUpgradeComplete(): void {
    this.stateTransitionHandler.updateContext(this.getTransitionContext());
    this.stateTransitionHandler.handleUpgradeComplete();
    // Note: syncFromTransitionContext() is NOT called here because
    // the transition callback will modify state asynchronously
  }

  /**
   * Handle start level from dev upgrades (dev mode)
   */
  private handleStartLevel(levelId: number): void {
    this.stateTransitionHandler.updateContext(this.getTransitionContext());
    this.stateTransitionHandler.handleStartLevel(levelId);
    // Note: syncFromTransitionContext() is NOT called here because
    // the transition callback will modify state asynchronously
  }


  /**
   * Handle quit
   */
  private handleQuit(): void {
    this.stateTransitionHandler.handleQuit();
  }

  /**
   * Handle pause
   */
  private handlePause(): void {
    this.stateTransitionHandler.updateContext(this.getTransitionContext());
    this.stateTransitionHandler.handlePause();
    // Note: No sync needed - handler uses setters directly
  }

  /**
   * Handle resume from pause
   */
  private handleResume(): void {
    this.stateTransitionHandler.updateContext(this.getTransitionContext());
    this.stateTransitionHandler.handleResume();
    // Note: No sync needed - handler uses setters directly
  }

  /**
   * Handle quit from pause menu
   */
  private handleQuitFromPause(): void {
    this.stateTransitionHandler.updateContext(this.getTransitionContext());
    this.stateTransitionHandler.handleQuitFromPause();
    // Note: No sync needed - handler uses async transition callback
  }

  /**
   * Handle opening options screen
   */
  private handleOpenOptions(): void {
    this.stateTransitionHandler.updateContext(this.getTransitionContext());
    this.stateTransitionHandler.handleOpenOptions();
    // Note: No sync needed - handler uses setters directly
  }

  /**
   * Handle closing options screen
   */
  private handleCloseOptions(): void {
    this.stateTransitionHandler.updateContext(this.getTransitionContext());
    this.stateTransitionHandler.handleCloseOptions();
    // Note: No sync needed - handler uses setters directly
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
    
    // Clear any active lasers and offensive entities
    this.weaponManager.clear();
    this.offensiveEntityManager.clear();
    
    // Reset level timer
    this.levelTime = 0;
    
    // Reset slow-motion state
    this.slowMotionManager.reset();
    this.effectsManager.resetSlowMotion();
    
    // Reset level complete timer
    this.levelCompleteTimer = 0;
    
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
    
    // Make ball sticky at level start - position on top of bat
    const ballRadius = this.ball.getRadius();
    this.ball.setSticky(true, 0, -ballRadius);
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

    // Handle slow-motion time dilation
    this.slowMotionManager.update(deltaTime);
    const effectiveDeltaTime = this.slowMotionManager.getEffectiveDeltaTime(deltaTime);

    // Update screen animations (use real deltaTime for UI)
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

    // Update level timer (use real deltaTime)
    this.levelTime += deltaTime;
    this.statusBar.setLevelTime(this.levelTime);

    // Handle input (use effective deltaTime for movement)
    this.handleInput(effectiveDeltaTime);

    // Update sticky ball position to follow bat
    if (this.ball.getIsSticky()) {
      this.ball.updateStickyPosition(this.bat.getCenterX(), this.bat.getPosition().y);
    }

    // Update bat turret visibility and count based on laser upgrade
    const hasShooter = this.gameUpgrades.hasBatShooter();
    this.bat.setShowTurret(hasShooter);
    if (hasShooter) {
      this.bat.setTurretCount(this.gameUpgrades.getTotalShooterCount());
    }

    // Update ball (use effective deltaTime for slow-mo)
    this.ball.update(effectiveDeltaTime);

    // Update weapons (use effective deltaTime for slow-mo)
    this.weaponManager.update(effectiveDeltaTime);

    // Update offensive brick entities (use effective deltaTime for slow-mo)
    this.offensiveEntityManager.update(
      effectiveDeltaTime,
      this.canvas.width,
      this.canvas.height,
      this.bat.getCenterX(),
      this.bat.getCenterY()
    );

    // Update collision manager (use effective deltaTime for slow-mo)
    this.collisionManager.update(effectiveDeltaTime, this.ball);

    // Update visual effects (use effective deltaTime for slow-mo)
    this.effectsManager.update(effectiveDeltaTime);

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

    // Check if we should trigger slow-motion (1 brick left, ball approaching)
    this.slowMotionManager.checkAndTrigger(
      this.level,
      this.ball,
      this.statusBar,
      this.effectsManager,
      this.canvas.width,
      this.canvas.height
    );

    // Check collisions
    this.checkCollisions();

    // Check level completion with delay for animations
    if (this.level && this.level.isComplete() && this.gameState === GameState.PLAYING) {
      this.levelCompleteTimer += deltaTime * 1000; // Convert to ms
      if (this.levelCompleteTimer >= this.levelCompleteDelay) {
        this.gameState = GameState.LEVEL_COMPLETE;
        // Use level.getId() to ensure we show the level that was just completed
        this.screenManager.levelCompleteScreen.setLevel(this.level.getId(), this.levelTime);
        this.levelCompleteTimer = 0;
      }
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

    // Offensive entity-Bat collisions
    this.collisionManager.checkFallingBrickBatCollisions(this.offensiveEntityManager.getFallingBricks(), this.bat);
    this.collisionManager.checkDebrisBatCollisions(this.offensiveEntityManager.getDebris(), this.bat);
    this.collisionManager.checkBrickLaserBatCollisions(this.offensiveEntityManager.getBrickLasers(), this.bat);
    this.collisionManager.checkHomingMissileBatCollisions(this.offensiveEntityManager.getHomingMissiles(), this.bat);
    this.collisionManager.checkSplittingFragmentBatCollisions(this.offensiveEntityManager.getSplittingFragments(), this.bat);
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

    // Apply screen shake and slow-motion zoom
    const shake = this.effectsManager.getScreenShakeOffset();
    this.ctx.save();
    
    // Apply slow-motion zoom transform (handled by EffectsManager)
    this.effectsManager.applySlowMotionTransform(this.ctx);
    
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

    // Render offensive brick entities
    this.offensiveEntityManager.render(this.ctx);

    // Render visual effects (if enabled)
    const options = this.screenManager.optionsScreen.getOptions();
    this.effectsManager.render(this.ctx, options.showParticles, options.showDamageNumbers);

    this.ctx.restore();

    // Render launch instruction if ball is sticky
    if (this.ball.getIsSticky()) {
      this.renderLaunchInstruction();
    }

    // Render status bar (not affected by screen shake)
    this.statusBar.render(this.ctx);

    // Render CRT scanline overlay
    this.renderCRTOverlay();

    // Render slow-motion overlay (handled by EffectsManager)
    this.effectsManager.renderSlowMotionOverlay(this.ctx, this.canvas.width, this.canvas.height);
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
   * Render launch instruction text when ball is sticky
   */
  private renderLaunchInstruction(): void {
    const langManager = LanguageManager.getInstance();
    const instructionText = langManager.t('game.status.launchBall');
    
    this.ctx.save();
    
    // Position text in upper third of screen
    const textY = this.canvas.height * 0.3;
    
    // Draw text with glow effect
    this.ctx.font = '32px "D Day Stencil", Arial';
    this.ctx.textAlign = 'center';
    this.ctx.textBaseline = 'middle';
    this.ctx.fillStyle = '#00ff00'; // Green
    this.ctx.shadowBlur = 20;
    this.ctx.shadowColor = '#00ff00';
    this.ctx.fillText(instructionText, this.canvas.width / 2, textY);
    
    this.ctx.restore();
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
