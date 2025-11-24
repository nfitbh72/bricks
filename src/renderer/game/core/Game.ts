/**
 * Game class - main game engine with loop and state management
 */

import { Ball } from '../entities/Ball';
import { Bat } from '../entities/Bat';
import { Brick } from '../entities/Brick';
import { Level } from '../entities/Level';
import { StatusBar } from '../ui/StatusBar';
import { BaseBoss } from '../entities/offensive/BaseBoss';
import { Boss1 } from '../entities/offensive/Boss1';
import { Boss2 } from '../entities/offensive/Boss2';
import { Boss3 } from '../entities/offensive/Boss3';
import { GameState, LevelConfig, BrickType } from '../core/types';
import { GameUpgrades } from '../systems/GameUpgrades';
import { AudioManager } from '../managers/AudioManager';
import { InputManager } from '../managers/InputManager';
import { ScreenManager } from '../managers/ScreenManager';
import { EffectsManager } from '../managers/EffectsManager';
import { CollisionManager } from '../managers/CollisionManager';
import { WeaponManager } from '../managers/WeaponManager';
import { OffensiveEntityManager } from '../managers/OffensiveEntityManager';
import { SlowMotionManager } from '../managers/SlowMotionManager';
import { StateTransitionHandler, StateTransitionContext } from '../managers/StateTransitionHandler';
import { RenderManager } from '../managers/RenderManager';
import { AchievementTracker } from '../managers/AchievementTracker';
import { 
  PLAYER_STARTING_HEALTH, 
  BOMB_BRICK_DAMAGE_MULTIPLIER, 
  BAT_WIDTH, 
  BAT_HEIGHT, 
  BAT_SPEED,
  BALL_RADIUS,
  BALL_SPEED,
  SCREEN_SHAKE_BAT_DAMAGE_INTENSITY,
  SCREEN_SHAKE_BAT_DAMAGE_DURATION,
  SCREEN_SHAKE_BACK_WALL_INTENSITY,
  SCREEN_SHAKE_BACK_WALL_DURATION,
  SCREEN_SHAKE_BOMB_BRICK_INTENSITY,
  SCREEN_SHAKE_BOMB_BRICK_DURATION,
  BOSS1_HEALTH_MULTIPLIER,
  BOSS1_SPAWN_OFFSET_Y,
  BOSS2_HEALTH_MULTIPLIER,
  BOSS2_SPAWN_OFFSET_Y,
  BOSS3_HEALTH_MULTIPLIER,
  BOSS3_SPAWN_OFFSET_Y
} from '../../config/constants';

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
  private renderManager: RenderManager;
  private achievementTracker: AchievementTracker;


  // Game stats
  private currentLevelId: number = 1;
  private totalBricksDestroyed: number = 0;
  private gameOverDelay: number = 1000; // 1 second delay
  private gameOverTimer: number = 0;
  private levelCompleteDelay: number = 1000; // 1 second delay for animations
  private levelCompleteTimer: number = 0;
  private isDevUpgradeMode: boolean = false;
  private levelTime: number = 0; // Time spent on current level in seconds
  private bombDamage: number = 0; // Bomb brick damage (3x ball damage at level start)
  private delayedBombExplosions: Array<{
    brick: Brick;
    x: number;
    y: number;
    delay: number;
  }> = [];

  // Boss (can be array for Boss3 split copies)
  private boss: BaseBoss | null = null;
  private bossCopies: BaseBoss[] = [];

  // Upgrades
  private gameUpgrades: GameUpgrades;

  // Achievements unlocked during the current level run
  private achievementsUnlockedThisRun: Set<string> = new Set();


  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    const context = canvas.getContext('2d');
    if (!context) {
      throw new Error('Could not get 2D context from canvas');
    }
    this.ctx = context;

    // Use fixed dimensions from constants (no scaling)
    const batWidth = BAT_WIDTH;
    const batHeight = BAT_HEIGHT;
    const ballRadius = BALL_RADIUS;
    const ballSpeed = BALL_SPEED;
    
    // Initialize upgrade manager
    this.gameUpgrades = new GameUpgrades();
    this.gameUpgrades.setBaseValues(batWidth, batHeight, ballSpeed, ballRadius);
    
    const centerX = canvas.width / 2;
    const batY = canvas.height - 100; // Bat higher up
    const ballY = batY - 30; // Ball above the bat
    
    this.bat = new Bat(centerX - batWidth / 2, batY, batWidth, batHeight, BAT_SPEED);
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
      onOpenAchievements: () => this.handleOpenAchievements(),
      onRestart: () => this.handleRestart(),
      onLevelCompleteTransition: () => this.handleLevelCompleteTransition(),
      onUpgradeComplete: () => this.handleUpgradeComplete(),
      onUpgradeActivated: (upgradeType: string) => this.handleUpgradeActivated(upgradeType),
      onStartLevel: (levelId: number) => this.handleStartLevel(levelId),
      onResume: () => this.handleResume(),
      onQuitFromPause: () => this.handleQuitFromPause(),
      onCloseOptions: () => this.handleCloseOptions(),
      onCloseTutorial: () => this.handleCloseTutorial(),
      onCloseAchievements: () => this.handleCloseAchievements(),
    });
    
    // Set volume change callback for real-time updates
    this.screenManager.optionsScreen.setVolumeChangeCallback((musicVolume: number, sfxVolume: number) => {
      this.audioManager.setMusicVolume(musicVolume);
      this.audioManager.setSFXVolume(sfxVolume);
    });

    // Set language change callback to refresh UI
    this.screenManager.optionsScreen.setLanguageChangeCallback(() => {
      // Refresh all screen translations
      this.screenManager.introScreen.refreshTranslations();
      this.screenManager.pauseScreen.refreshTranslations();
      this.screenManager.gameOverScreen.refreshTranslations();
      this.screenManager.levelCompleteScreen.refreshTranslations();
      this.screenManager.upgradeTreeScreen.refreshTranslations();
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

    // Initialize render manager
    this.renderManager = new RenderManager(canvas, this.ctx);

    // Initialize achievement tracker
    this.achievementTracker = new AchievementTracker();
    
    // Expose for debugging (remove in production)
    (window as unknown as Record<string, unknown>).achievementTracker = this.achievementTracker;
    (window as unknown as Record<string, unknown>).resetAchievements = () => this.achievementTracker.resetProgress();

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
          // Launch on space press if:
          // 1. Ball is in initial sticky state (level start), OR
          // 2. Ball is sticky but sticky bat upgrade is not active
          // Otherwise shoot laser if ball is not sticky
          if (this.ball.getIsSticky() && (this.ball.getIsInitialSticky() || !this.gameUpgrades.hasStickyBat())) {
            this.ball.launchFromSticky();
          } else if (!this.ball.getIsSticky()) {
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
        // Capture state BEFORE screen handlers run to prevent click-through
        // when dialogs/screens transition to PLAYING state
        const stateBeforeClick = this.gameState;
        
        this.screenManager.handleClick(x, y, this.gameState);
        
        // Only process game clicks if we were already in PLAYING state
        // This prevents tutorial/dialog dismissal from also launching the ball
        if (stateBeforeClick === GameState.PLAYING) {
          // Launch ball if sticky, otherwise shoot laser
          if (this.ball.getIsSticky()) {
            this.ball.launchFromSticky();
          } else {
            this.weaponManager.shootLaser(this.bat, this.ball, this.gameUpgrades);
          }
        }
      },
      onRightClick: (_x: number, _y: number) => {
        // Only shoot bombs during active gameplay
        if (this.gameState === GameState.PLAYING && !this.ball.getIsSticky()) {
          this.weaponManager.shootBomb(this.bat, this.ball, this.gameUpgrades);
        }
      },
    });
  }

  /**
   * Set up brick destruction callbacks
   * This ensures all bricks trigger offensive entities when destroyed, regardless of damage source
   */
  private setupBrickDestructionCallbacks(): void {
    if (!this.level) return;
    
    const bricks = this.level.getBricks();
    for (const brick of bricks) {
      brick.setOnDestroyCallback((destroyedBrick, info) => {
        // Check if this is a boss brick - activate boss instead of destroying
        const brickType = destroyedBrick.getType();
        if ((brickType === BrickType.BOSS_1 || brickType === BrickType.BOSS_2 || brickType === BrickType.BOSS_3) && !this.boss) {
          this.activateBoss(destroyedBrick, info);
          return;
        }

        // Spawn offensive entities based on brick type (falling bricks, lasers, missiles, etc.)
        const batCenterX = this.bat.getCenterX();
        const bricksToDamage = this.offensiveEntityManager.spawnOffensiveEntity(
          destroyedBrick,
          info.centerX,
          info.centerY,
          batCenterX,
          this.level?.getBricks()
        );
        
        // Handle bomb chain reactions - ONLY for bomb bricks
        // Bomb bricks damage adjacent bricks, which may trigger their own effects
        if (bricksToDamage && bricksToDamage.length > 0) {
          const totalDuration = 1.5; // Total time for all explosions
          const delayPerBrick = totalDuration / bricksToDamage.length;
          
          for (let i = 0; i < bricksToDamage.length; i++) {
            const targetBrick = bricksToDamage[i];
            const targetBounds = targetBrick.getBounds();
            const targetX = targetBounds.x + targetBounds.width / 2;
            const targetY = targetBounds.y + targetBounds.height / 2;
            
            // Queue this brick for delayed explosion damage
            this.delayedBombExplosions.push({
              brick: targetBrick,
              x: targetX,
              y: targetY,
              delay: i * delayPerBrick
            });
          }
          
          // Extra particles for bomb explosion
          this.effectsManager.createParticles(info.centerX, info.centerY, 40, destroyedBrick.getColor(), 200);
        }
      });
    }
  }

  /**
   * Activate the boss when BOSS_1, BOSS_2, or BOSS_3 brick is hit
   */
  private activateBoss(brick: Brick, info: { centerX: number; centerY: number }): void {
    if (!this.level) return;

    // Restore brick health (prevent destruction)
    brick.restore();

    // Determine which boss type to spawn based on brick type
    const brickType = brick.getType();
    const baseHealth = this.level.getConfig().baseHealth || 1;
    
    // Calculate boss health and spawn offset based on boss type
    let bossHealth: number;
    let spawnOffsetY: number;
    
    if (brickType === BrickType.BOSS_2) {
      bossHealth = baseHealth * BOSS2_HEALTH_MULTIPLIER;
      spawnOffsetY = brick.getHeight() * BOSS2_SPAWN_OFFSET_Y;
    } else if (brickType === BrickType.BOSS_3) {
      bossHealth = baseHealth * BOSS3_HEALTH_MULTIPLIER;
      spawnOffsetY = brick.getHeight() * BOSS3_SPAWN_OFFSET_Y;
    } else {
      bossHealth = baseHealth * BOSS1_HEALTH_MULTIPLIER;
      spawnOffsetY = brick.getHeight() * BOSS1_SPAWN_OFFSET_Y;
    }
    
    // Spawn boss slightly above the brick position to avoid immediate ball collision
    const bossX = info.centerX - brick.getWidth() / 2;
    const bossY = info.centerY - brick.getHeight() / 2 + spawnOffsetY;
    
    // Create boss at safe position
    if (brickType === BrickType.BOSS_2) {
      this.boss = new Boss2(
        bossX,
        bossY,
        bossHealth,
        brick.getColor(),
        this.canvas.width,
        this.canvas.height
      );
    } else if (brickType === BrickType.BOSS_3) {
      this.boss = new Boss3(
        bossX,
        bossY,
        bossHealth,
        brick.getColor(),
        this.canvas.width,
        this.canvas.height
      );
    } else {
      // Default to Boss1
      this.boss = new Boss1(
        bossX,
        bossY,
        bossHealth,
        brick.getColor(),
        this.canvas.width,
        this.canvas.height
      );
    }

    // Give boss access to remaining bricks (excluding indestructible and the boss brick itself)
    const availableBricks = this.level.getBricks().filter(b => 
      b !== brick && !b.isIndestructible() && !b.isDestroyed()
    );
    this.boss.setAvailableBricks(availableBricks);

    // Create particles for boss activation
    this.effectsManager.createParticles(info.centerX, info.centerY, 50, brick.getColor(), 300);
  }

  /**
   * Set up collision callbacks
   */
  private setupCollisionCallbacks(): void {
    this.collisionManager.setCallbacks({
      onBrickHit: (brick, damage, isCritical) => {
        // Only show damage numbers for destructible bricks
        if (!brick.isIndestructible()) {
          const brickBounds = brick.getBounds();
          const brickCenterX = brickBounds.x + brickBounds.width / 2;
          const brickTopY = brickBounds.y - 5;
          this.effectsManager.addDamageNumber(brickCenterX, brickTopY, damage, isCritical);
        }
        
        if (!brick.isDestroyed()) {
          // Play ding sound for indestructible bricks, regular damage sound for others
          if (brick.isIndestructible()) {
            this.audioManager.playIndestructibleBrickHit();
          } else {
            this.audioManager.playBrickDamage();
          }
        }
      },
      onBrickDestroyed: (brick, x, y, isCritical) => {
        this.totalBricksDestroyed++;
        
        // Track brick destruction for achievements
        const damage = brick.getMaxHealth(); // Get the damage value of this brick
        this.achievementTracker.onBrickDestroyed(damage).catch(error => {
          console.warn('Achievement tracker error:', error);
        });
        
        if (!this.level) return;
        
        const remainingBricks = this.level.getRemainingBricks();
        this.statusBar.setBrickCounts(
          remainingBricks,
          this.level.getTotalBricks()
        );
        
        console.log(`Brick destroyed! Remaining bricks: ${remainingBricks}`);
        
        // Note: Offensive entity spawning is now handled by brick's onDestroy callback
        // This ensures all damage sources (ball, laser, bomb chains) trigger effects
        
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
      onBatDamaged: (_damagePercent: number) => {
        // Track bat damage for achievements
        this.achievementTracker.onBatDamaged();
        
        // Visual feedback for bat damage
        this.effectsManager.triggerScreenShake(SCREEN_SHAKE_BAT_DAMAGE_INTENSITY, SCREEN_SHAKE_BAT_DAMAGE_DURATION);
        
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
      startTransition: (onComplete, nextLevel) => this.startTransition(onComplete, nextLevel),
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
   * Handle upgrade activation for achievements
   */
  private handleUpgradeActivated(upgradeType: string): void {
    this.achievementTracker.onUpgradeActivated(upgradeType).catch(error => {
      console.warn('Achievement tracker error:', error);
    });
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
   * Handle closing tutorial screen
   */
  private handleCloseTutorial(): void {
    this.gameState = GameState.PLAYING;
  }

  /**
   * Handle opening achievements screen from intro
   */
  private handleOpenAchievements(): void {
    // Refresh data asynchronously; don't block UI
    void this.screenManager.achievementsScreen.refreshData();
    this.gameState = GameState.ACHIEVEMENTS;
  }

  /**
   * Handle closing achievements screen
   */
  private handleCloseAchievements(): void {
    this.gameState = GameState.INTRO;
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
  private startTransition(onComplete: () => void, nextLevel?: number): void {
    this.screenManager.startTransition(onComplete, nextLevel);
  }


  /**
   * Load a level
   * Centers bricks horizontally on the canvas
   */
  loadLevel(levelConfig: LevelConfig): void {
    // Clear brick render cache when loading new level
    Brick.clearRenderCache();
    
    // Create level with canvas width for centering
    this.level = new Level(levelConfig, this.canvas.width);
    
    // Set up destruction callbacks for all bricks
    this.setupBrickDestructionCallbacks();
    
    // Set player health: base + upgrade bonus
    const upgradeBonus = this.gameUpgrades.getHealthBonus();
    this.playerHealth = PLAYER_STARTING_HEALTH + upgradeBonus;
    
    // Clear any active lasers and offensive entities
    this.weaponManager.clear();
    this.offensiveEntityManager.clear();
    
    // Clear boss
    this.boss = null;
    
    // Clear delayed bomb explosions
    this.delayedBombExplosions = [];
    
    // Reset level timer
    this.levelTime = 0;

    // Reset per-level achievement tracking
    this.achievementsUnlockedThisRun.clear();
    this.achievementTracker.clearThisRun();
    
    // Initialize achievement tracking for this level
    const hasBoss = this.level.getBricks().some(brick => 
      brick.getType() === BrickType.BOSS_1 || 
      brick.getType() === BrickType.BOSS_2 || 
      brick.getType() === BrickType.BOSS_3
    );
    this.achievementTracker.onLevelStart(levelConfig.id, this.playerHealth, hasBoss);
    
    // Calculate bomb damage using multiplier constant
    this.bombDamage = this.ball.getDamage() * BOMB_BRICK_DAMAGE_MULTIPLIER;
    
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
    
    // Reset bat width (remove damage from previous level, preserve upgrade size)
    this.bat.resetWidth();
    
    // Reset ball and bat position
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
    this.ball.setSticky(true, 0, -ballRadius, true); // true = initial sticky
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

    // Update level timer only if ball is not sticky (use real deltaTime)
    if (!this.ball.getIsSticky()) {
      this.levelTime += deltaTime;
      this.statusBar.setLevelTime(this.levelTime);
    }

    // Update delayed bomb explosions
    this.updateDelayedBombExplosions(deltaTime);

    // Handle input (use effective deltaTime for movement)
    this.handleInput(effectiveDeltaTime);

    // Update sticky ball position to follow bat
    if (this.ball.getIsSticky()) {
      this.ball.updateStickyPosition(this.bat.getCenterX(), this.bat.getPosition().y);
      
      // If sticky bat upgrade is active AND this is not the initial sticky state,
      // launch when Space is released
      if (this.gameUpgrades.hasStickyBat() && !this.ball.getIsInitialSticky() && !this.inputManager.isSpaceHeld()) {
        this.ball.launchFromSticky();
      }
    }

    // Update bat turret visibility and count based on laser upgrade
    const hasShooter = this.gameUpgrades.hasBatShooter();
    this.bat.setShowTurret(hasShooter);
    if (hasShooter) {
      this.bat.setTurretCount(this.gameUpgrades.getTotalShooterCount());
    }

    // Update ball only if not sticky (use effective deltaTime for slow-mo)
    if (!this.ball.getIsSticky()) {
      this.ball.update(effectiveDeltaTime);
    }

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

    // Update boss if active (use effective deltaTime for slow-mo)
    if (this.boss && this.boss.isActive()) {
      this.boss.update(effectiveDeltaTime, this.bat.getCenterX(), this.bat.getCenterY());
      
      // Check if Boss3 should split
      if (this.boss instanceof Boss3 && this.boss.shouldSplit()) {
        const copies = this.boss.createSplitCopies();
        this.bossCopies = copies;
        this.boss.markAsSplit();
        
        // Create split effect
        const bounds = this.boss.getBounds();
        if (bounds) {
          this.effectsManager.createParticles(
            bounds.x + bounds.width / 2,
            bounds.y + bounds.height / 2,
            60,
            '#cc00ff',
            400
          );
        }
      }
    }
    
    // Update boss copies
    for (const copy of this.bossCopies) {
      if (copy.isActive()) {
        copy.update(effectiveDeltaTime, this.bat.getCenterX(), this.bat.getCenterY());
      }
    }
    // Remove destroyed copies
    this.bossCopies = this.bossCopies.filter(c => c.isActive());

    // Update collision manager (use effective deltaTime for slow-mo)
    this.collisionManager.update(effectiveDeltaTime, this.ball);

    // Update visual effects (use effective deltaTime for slow-mo)
    this.effectsManager.update(effectiveDeltaTime);

    // Check wall collisions only if ball is not sticky (bottom boundary is status bar top)
    if (!this.ball.getIsSticky()) {
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
        this.effectsManager.triggerScreenShake(SCREEN_SHAKE_BACK_WALL_INTENSITY, SCREEN_SHAKE_BACK_WALL_DURATION);
      }
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

    // Check collisions only if ball is not sticky
    if (!this.ball.getIsSticky()) {
      this.checkCollisions();
    }

    // Check level completion with delay for animations
    // Level is complete when all destructible bricks are destroyed AND boss is destroyed (if it exists)
    // For Boss3, all copies must also be destroyed
    const bossDefeated = !this.boss || this.boss.isDestroyed();
    const allCopiesDefeated = this.bossCopies.length === 0 || this.bossCopies.every(c => c.isDestroyed());
    if (this.level && this.level.isComplete() && bossDefeated && allCopiesDefeated && this.gameState === GameState.PLAYING) {
      this.levelCompleteTimer += deltaTime * 1000; // Convert to ms
      if (this.levelCompleteTimer >= this.levelCompleteDelay) {
        // Call achievement tracker for level completion (fire and forget)
        this.achievementTracker.onLevelComplete(
          this.level.getId(),
          this.levelTime,
          this.playerHealth
        ).catch(error => {
          console.warn('Achievement tracker error:', error);
        });
        
        this.gameState = GameState.LEVEL_COMPLETE;
        // Use level.getId() to ensure we show the level that was just completed
        this.screenManager.levelCompleteScreen.setLevel(
          this.level.getId(),
          this.levelTime,
          this.isDevUpgradeMode,
          this.achievementTracker.getAchievementsThisRun(),
          this.achievementTracker
        );
        this.levelCompleteTimer = 0;
      }
    }
  }

  /**
   * Record that an achievement was unlocked during this level run
   * (Game systems can call this after a successful unlock via steamAPI)
   */
  private recordAchievementUnlocked(id: string): void {
    this.achievementsUnlockedThisRun.add(id);
  }

  /**
   * Update delayed bomb explosions
   */
  private updateDelayedBombExplosions(deltaTime: number): void {
    // Decrease delay timers
    for (let i = this.delayedBombExplosions.length - 1; i >= 0; i--) {
      const explosion = this.delayedBombExplosions[i];
      explosion.delay -= deltaTime;
      
      // If delay has elapsed, trigger the explosion
      if (explosion.delay <= 0) {
        const targetBrick = explosion.brick;
        
        // Skip if brick is already destroyed
        if (targetBrick.isDestroyed()) {
          this.delayedBombExplosions.splice(i, 1);
          continue;
        }
        
        // Apply damage - brick's onDestroy callback will handle offensive entity spawning
        const destructionInfo = targetBrick.takeDamage(this.bombDamage);
        this.effectsManager.addDamageNumber(explosion.x, explosion.y - 5, this.bombDamage, false);
        
        // If brick was just destroyed by bomb damage, create particles and update counts
        if (destructionInfo.justDestroyed) {
          this.effectsManager.createParticles(explosion.x, explosion.y, 8, targetBrick.getColor(), 120);
          
          // Note: Offensive entity spawning and chain reactions are now handled by
          // the brick's onDestroy callback, ensuring consistent behavior regardless
          // of damage source (ball, laser, bomb, etc.)
          
          // Update brick counts
          this.totalBricksDestroyed++;
          if (this.level) {
            const remainingBricksAfterBomb = this.level.getRemainingBricks();
            this.statusBar.setBrickCounts(
              remainingBricksAfterBomb,
              this.level.getTotalBricks()
            );
          }
        }
        
        // Remove this explosion from the queue
        this.delayedBombExplosions.splice(i, 1);
      }
    }
  }

  /**
   * Handle keyboard and mouse input
   */
  private handleInput(deltaTime: number): void {
    // Get keyboard movement input
    const movement = this.inputManager.getMovementInput();
    
    // If ball is sticky, left/right arrows adjust launch angle (works in both mouse and keyboard mode)
    if (this.ball.getIsSticky()) {
      if (movement.left) {
        this.ball.adjustLaunchAngle(-2); // Adjust left (more negative angle)
      }
      if (movement.right) {
        this.ball.adjustLaunchAngle(2); // Adjust right (less negative angle)
      }
    }
    
    if (this.inputManager.isMouseControlEnabled()) {
      // Mouse control (2D)
      const mousePos = this.inputManager.getMousePosition();
      this.bat.setMousePosition(mousePos.x, mousePos.y);
    } else {
      // Keyboard control (WASD + Arrow keys)
      // Only move bat if ball is not sticky
      if (!this.ball.getIsSticky()) {
        if (movement.left) {
          this.bat.moveLeft(deltaTime);
        }
        if (movement.right) {
          this.bat.moveRight(deltaTime);
        }
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
    // If sticky bat is unlocked and Space is held, make ball sticky on contact
    if (this.gameUpgrades.hasStickyBat() && this.inputManager.isSpaceHeld() && !this.ball.getIsSticky()) {
      const ballBounds = this.ball.getBounds();
      const batBounds = this.bat.getBounds();
      const ballRadius = this.ball.getRadius();
      
      // Check if ball is touching bat
      if (ballBounds.y + ballRadius >= batBounds.y &&
          ballBounds.x + ballRadius >= batBounds.x &&
          ballBounds.x - ballRadius <= batBounds.x + batBounds.width) {
        // Make ball sticky on top of bat (not initial, so uses hold/release behavior)
        this.ball.setSticky(true, 0, -ballRadius, false);
      }
    }
    
    this.collisionManager.checkBallBatCollision(this.ball, this.bat);

    // Ball-Brick collisions
    this.collisionManager.checkBallBrickCollisions(this.ball, this.level, this.gameUpgrades);

    // Laser-Brick collisions
    this.collisionManager.checkLaserBrickCollisions(this.weaponManager.getLasers(), this.level);

    // Bomb-Brick collisions
    this.collisionManager.checkBombBrickCollisions(this.weaponManager.getBombs(), this.level);

    // Offensive entity-Bat collisions
    this.collisionManager.checkFallingBrickBatCollisions(this.offensiveEntityManager.getFallingBricks(), this.bat);
    this.collisionManager.checkDebrisBatCollisions(this.offensiveEntityManager.getDebris(), this.bat);
    this.collisionManager.checkBrickLaserBatCollisions(this.offensiveEntityManager.getBrickLasers(), this.bat);
    this.collisionManager.checkHomingMissileBatCollisions(this.offensiveEntityManager.getHomingMissiles(), this.bat);
    this.collisionManager.checkSplittingFragmentBatCollisions(this.offensiveEntityManager.getSplittingFragments(), this.bat);
    this.collisionManager.checkDynamiteStickCollisions(
      this.offensiveEntityManager.getDynamiteSticks(),
      this.bat,
      this.level.getActiveBricks(),
      this.ball.getDamage()
    );

    // Boss collisions
    if (this.boss && this.boss.isActive()) {
      // Ball-Boss collision
      this.collisionManager.checkBossBallCollisions(
        this.boss,
        this.ball,
        (damage, x, y) => {
          // Create particles and damage number
          this.effectsManager.createParticles(x, y, 8, '#ff0000', 100);
          this.effectsManager.addDamageNumber(x, y - 5, damage, false);
        },
        (x, y) => {
          // Boss destroyed - create big explosion
          this.effectsManager.createParticles(x, y, 50, '#ff0000', 300);
          
          // Track boss defeat for achievements
          if (this.boss) {
            let bossType: string;
            if (this.boss instanceof Boss1) {
              bossType = 'BOSS_1';
            } else if (this.boss instanceof Boss2) {
              bossType = 'BOSS_2';
            } else if (this.boss instanceof Boss3) {
              bossType = 'BOSS_3';
            } else {
              bossType = 'UNKNOWN';
            }
            this.achievementTracker.onBossDefeated(bossType).catch(error => {
              console.warn('Achievement tracker error:', error);
            });
          }
        },
        (x, y) => {
          // Shield blocked - create cyan particles
          this.effectsManager.createParticles(x, y, 5, '#00ccff', 80);
        }
      );

      // Thrown brick-Bat collision
      this.collisionManager.checkBossThrownBrickCollisions(
        this.boss,
        this.bat,
        (x, y) => {
          // Screen shake and particles
          this.effectsManager.triggerScreenShake(SCREEN_SHAKE_BOMB_BRICK_INTENSITY, SCREEN_SHAKE_BOMB_BRICK_DURATION);
          this.effectsManager.createParticles(x, y, 15, '#ff0000', 150);
        }
      );
    }
    
    // Boss copy collisions (for Boss3 split copies)
    for (const copy of this.bossCopies) {
      if (copy.isActive()) {
        this.collisionManager.checkBossBallCollisions(
          copy,
          this.ball,
          (damage, x, y) => {
            this.effectsManager.createParticles(x, y, 8, '#cc00ff', 100);
            this.effectsManager.addDamageNumber(x, y - 5, damage, false);
          },
          (x, y) => {
            this.effectsManager.createParticles(x, y, 30, '#cc00ff', 200);
            
            // Track boss copy defeat for achievements
            let bossType: string;
            if (copy instanceof Boss1) {
              bossType = 'BOSS_1';
            } else if (copy instanceof Boss2) {
              bossType = 'BOSS_2';
            } else if (copy instanceof Boss3) {
              bossType = 'BOSS_3';
            } else {
              bossType = 'UNKNOWN';
            }
            this.achievementTracker.onBossDefeated(bossType).catch(error => {
              console.warn('Achievement tracker error:', error);
            });
          }
        );
        
        this.collisionManager.checkBossThrownBrickCollisions(
          copy,
          this.bat,
          (x, y) => {
            this.effectsManager.triggerScreenShake(SCREEN_SHAKE_BOMB_BRICK_INTENSITY, SCREEN_SHAKE_BOMB_BRICK_DURATION);
            this.effectsManager.createParticles(x, y, 15, '#cc00ff', 150);
          }
        );
      }
    }
  }

  /**
   * Render the game
   */
  private render(): void {
    // Handle transition rendering
    if (this.screenManager.updateTransition(performance.now())) {
      return; // Still transitioning
    }

    // Render using render manager
    this.renderManager.render(
      this.gameState,
      this.screenManager.getPreviousState(),
      this.screenManager,
      () => this.renderGameplay()
    );
  }

  /**
   * Render gameplay (used for both PLAYING and PAUSED states)
   */
  private renderGameplay(): void {
    const options = this.screenManager.optionsScreen.getOptions();
    this.renderManager.renderGameplay(
      this.level,
      this.bat,
      this.ball,
      this.statusBar,
      this.effectsManager,
      this.weaponManager,
      this.offensiveEntityManager,
      options.showParticles,
      options.showDamageNumbers
    );

    // Render boss if active
    if (this.boss && this.boss.isActive()) {
      this.boss.render(this.ctx);
    }
    
    // Render boss copies
    for (const copy of this.bossCopies) {
      if (copy.isActive()) {
        copy.render(this.ctx);
      }
    }
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
}
