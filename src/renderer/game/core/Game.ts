/**
 * Game class - main game engine with loop and state management
 */

import { Ball } from '../entities/Ball';
import { Bat } from '../entities/Bat';
import { Brick } from '../entities/Brick';
import { Level } from '../entities/Level';
import { StatusBar } from '../ui/StatusBar';
import { GameContext } from '../core/GameContext';
import { GameEvents } from '../core/EventManager';

interface BrickHitEvent {
  brick: Brick;
  damage: number;
  isCritical: boolean;
  x?: number;
  y?: number;
}

interface BrickDestroyedEvent {
  brick: Brick;
  x: number;
  y: number;
  isCritical: boolean;
  ball?: Ball;
}

interface ExplosionDamageEvent {
  brick: Brick;
  damage: number;
  x: number;
  y: number;
}
import { GameState, LevelConfig, BrickType } from '../core/types';
import { GameLoop } from './GameLoop';
import { GameUpgrades } from '../systems/GameUpgrades';
import { AudioManager } from '../managers/AudioManager';
import { InputManager } from '../managers/InputManager';
import { ScreenManager } from '../managers/ScreenManager';
import { EffectsManager } from '../managers/EffectsManager';
import { CollisionManager } from '../managers/CollisionManager';
import { CollisionHandlerRegistry } from '../managers/CollisionHandlerRegistry';
import { WeaponManager } from '../managers/WeaponManager';
import { OffensiveEntityManager } from '../managers/OffensiveEntityManager';
import { SlowMotionManager } from '../managers/SlowMotionManager';
import { StateTransitionHandler, StateTransitionContext } from '../managers/StateTransitionHandler';
import { RenderManager } from '../managers/RenderManager';
import { AchievementTracker } from '../managers/AchievementTracker';
import { BossManager } from '../managers/BossManager';
import { BallManager } from '../managers/BallManager';
import { LevelInitializer } from '../managers/LevelInitializer';
import {
  PLAYER_STARTING_HEALTH,
  BAT_WIDTH,
  BAT_HEIGHT,
  BAT_SPEED,
  BALL_RADIUS,
  BALL_SPEED,
  SCREEN_SHAKE_BAT_DAMAGE_INTENSITY,
  SCREEN_SHAKE_BAT_DAMAGE_DURATION,
  MULTIBALL_BRICK_SPAWN_COUNT
} from '../../config/constants';

export class Game {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private context: GameContext;
  private bat: Bat;
  private level: Level | null = null;
  private statusBar: StatusBar;
  private gameState: GameState = GameState.INTRO;
  private playerHealth: number = PLAYER_STARTING_HEALTH;
  private gameLoop: GameLoop;

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
  private bossManager: BossManager;
  private ballManager: BallManager;
  private levelInitializer: LevelInitializer;
  private levelStartProgress: {
    totalBricksDestroyed: number;
    totalBossesDefeated: number;
    totalDamageDealt: number;
    levelsCompleted: number;
    upgradesActivated: number;
    bossTypesDefeated: number;
  } | null = null;


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

    // Initialize game context
    this.context = new GameContext();

    // Initialize upgrade manager
    this.gameUpgrades = new GameUpgrades();
    this.gameUpgrades.setBaseValues(batWidth, batHeight, ballSpeed, ballRadius);

    const centerX = canvas.width / 2;
    const batY = canvas.height - 100; // Bat higher up

    this.bat = new Bat(centerX - batWidth / 2, batY, batWidth, batHeight, BAT_SPEED);
    this.bat.setBounds(0, canvas.width, 0, canvas.height);

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
    this.collisionManager = new CollisionManager(this.context);
    this.setupEventListeners();
    this.setupCollisionHandlers();

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

    // Initialize boss manager
    this.bossManager = new BossManager(canvas.width, canvas.height);

    // Initialize ball manager
    this.ballManager = new BallManager(canvas.width, canvas.height);

    // Initialize level initializer
    this.levelInitializer = new LevelInitializer(canvas.width, canvas.height);

    // Expose for debugging (remove in production)
    (window as unknown as Record<string, unknown>).achievementTracker = this.achievementTracker;
    (window as unknown as Record<string, unknown>).resetAchievements = () => this.achievementTracker.resetProgress();

    // Apply saved options
    this.applyOptions();

    // Load background image
    this.loadBackgroundImage();

    // Set achievement tracker in screen manager for progress display
    this.screenManager.setAchievementTracker(this.achievementTracker);

    // Set game upgrades in screen manager for stats display
    this.screenManager.setGameUpgrades(this.gameUpgrades);

    // Initialize game loop
    this.gameLoop = new GameLoop(
      (dt) => this.update(dt),
      () => this.render()
    );
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
          const primaryBall = this.ballManager.getPrimaryBall();
          if (primaryBall.getIsSticky() && (primaryBall.getIsInitialSticky() || !this.gameUpgrades.hasStickyBat())) {
            primaryBall.launchFromSticky();
          } else if (!primaryBall.getIsSticky()) {
            this.weaponManager.shootLaser(this.bat, primaryBall, this.gameUpgrades);
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
          const primaryBall = this.ballManager.getPrimaryBall();
          if (primaryBall.getIsSticky()) {
            primaryBall.launchFromSticky();
          } else {
            this.weaponManager.shootLaser(this.bat, primaryBall, this.gameUpgrades);
          }
        }
      },
      onRightClick: (_x: number, _y: number) => {
        // Only shoot bombs during active gameplay
        const primaryBall = this.ballManager.getPrimaryBall();
        if (this.gameState === GameState.PLAYING && !primaryBall.getIsSticky()) {
          this.weaponManager.shootBomb(this.bat, primaryBall, this.gameUpgrades);
        }
      },
    });
  }

  /**
   * Handle brick destruction
   * This ensures all bricks trigger offensive entities when destroyed, regardless of damage source
   */
  private handleBrickDestruction(destroyedBrick: Brick, info: { centerX: number; centerY: number }): void {
    if (!this.level) return;

    // Check if this is a boss brick - activate boss instead of destroying
    const brickType = destroyedBrick.getType();
    if ((brickType === BrickType.BOSS_1 || brickType === BrickType.BOSS_2 || brickType === BrickType.BOSS_3) && !this.bossManager.hasBoss()) {
      if (this.level) {
        this.bossManager.activateBoss(destroyedBrick, info, this.level, this.effectsManager);
      }
      return;
    }

    // Handle multi-ball brick - spawn additional balls
    if (brickType === BrickType.OFFENSIVE_MULTIBALL && this.ballManager.getBallCount() > 0) {
      // Use first ball as source for cloning
      this.ballManager.spawnAdditionalBalls(this.ballManager.getPrimaryBall(), MULTIBALL_BRICK_SPAWN_COUNT);
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
      // Queue delayed explosions in WeaponManager
      this.weaponManager.queueDelayedExplosions(bricksToDamage);

      // Extra particles for bomb explosion
      this.effectsManager.createParticles(info.centerX, info.centerY, 40, destroyedBrick.getColor(), 200);
    }
  }


  /**
   * Set up event listeners
   */
  private setupEventListeners(): void {
    // Brick Hit
    this.context.eventManager.on<BrickHitEvent>(GameEvents.BRICK_HIT, (data) => {
      const { brick, damage, isCritical, x } = data;

      // Only show damage numbers for destructible bricks
      if (!brick.isIndestructible()) {
        const brickBounds = brick.getBounds();
        const brickCenterX = brickBounds.x + brickBounds.width / 2;

        // Use hitX if available, otherwise center
        // Limit hitX to within brick bounds to ensure it's not floating too far off
        let displayX = x !== undefined ? x : brickCenterX;

        // Clamp displayX to be within the brick's horizontal bounds (plus a small margin)
        displayX = Math.max(brickBounds.x, Math.min(brickBounds.x + brickBounds.width, displayX));

        const brickTopY = brickBounds.y - 5;
        this.effectsManager.addDamageNumber(displayX, brickTopY, damage, isCritical);
      }

      if (!brick.isDestroyed()) {
        // Play ding sound for indestructible bricks, regular damage sound for others
        if (brick.isIndestructible()) {
          this.audioManager.playIndestructibleBrickHit();
        } else {
          this.audioManager.playBrickDamage();
        }
      }
    });

    // Brick Destroyed
    this.context.eventManager.on<BrickDestroyedEvent>(GameEvents.BRICK_DESTROYED, (data) => {
      const { brick, x, y, isCritical, ball } = data;

      this.totalBricksDestroyed++;

      // Track brick destruction for achievements
      const damage = brick.getMaxHealth(); // Get the damage value of this brick
      this.achievementTracker.onBrickDestroyed(damage).catch(error => {
        console.warn('Achievement tracker error:', error);
      });

      // Multi-ball upgrade - chance to spawn additional balls on brick destruction
      // Use the ball that destroyed the brick (if available), otherwise fall back to first ball
      if (this.gameUpgrades.hasMultiBall() && this.ballManager.getBallCount() > 0) {
        const multiBallChance = this.gameUpgrades.getMultiBallChance();
        if (Math.random() < multiBallChance) {
          const multiBallCount = this.gameUpgrades.getMultiBallCount();
          const sourceBall = ball || this.ballManager.getPrimaryBall();
          this.ballManager.spawnAdditionalBalls(sourceBall, multiBallCount);
        }
      }

      if (!this.level) return;

      const remainingBricks = this.level.getRemainingBricks();
      this.statusBar.setBrickCounts(
        remainingBricks,
        this.level.getTotalBricks()
      );

      console.log(`Brick destroyed! Remaining bricks: ${remainingBricks}`);

      // Create particles (more for final brick)
      const particleCount = remainingBricks === 0 ? 30 : (isCritical ? 20 : 10);
      const particleLifetime = remainingBricks === 0 ? 300 : (isCritical ? 200 : 150);
      const particleColor = isCritical ? '#ffff00' : brick.getColor();
      this.effectsManager.createParticles(x, y, particleCount, particleColor, particleLifetime);

      // Play explosion sound
      this.audioManager.playBrickExplode();
    });

    // Explosion Damage
    this.context.eventManager.on<ExplosionDamageEvent>('explosion_damage', (data) => {
      const { brick, damage, x, y } = data;
      this.effectsManager.addDamageNumber(x, y - 5, damage, false);

      if (brick.isDestroyed()) {
        this.effectsManager.createParticles(x, y, 8, brick.getColor(), 120);
      }
    });

    // Bat Damaged
    this.context.eventManager.on('bat_damaged', () => {

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
    });
  }

  /**
   * Set up collision handlers for generic collision processing
   */
  private setupCollisionHandlers(): void {
    CollisionHandlerRegistry.registerAllHandlers(
      this.collisionManager,
      this.context
    );
  }

  /**
   * Get transition context for StateTransitionHandler
   */
  private getTransitionContext(): StateTransitionContext {
    return {
      canvas: this.canvas,
      ctx: this.ctx,
      bat: this.bat,
      ball: this.ballManager.getPrimaryBall(),
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
    // Initialize level using LevelInitializer
    const result = this.levelInitializer.initializeLevel(
      levelConfig,
      this.gameUpgrades,
      this.weaponManager,
      this.offensiveEntityManager,
      this.bossManager,
      this.ballManager,
      this.slowMotionManager,
      this.effectsManager,
      this.inputManager,
      this.achievementTracker,
      this.statusBar,
      this.bat,
      (brick, info) => this.handleBrickDestruction(brick, info)
    );

    // Apply results
    this.level = result.level;
    this.playerHealth = result.playerHealth;
    this.bombDamage = result.bombDamage;
    this.levelStartProgress = result.levelStartProgress;

    // Reset level timer
    this.levelTime = 0;

    // Reset per-level achievement tracking
    this.achievementsUnlockedThisRun.clear();

    // Reset level complete timer
    this.levelCompleteTimer = 0;

    this.gameState = GameState.PLAYING;
  }

  /**
   * Start the game loop
   */
  start(): void {
    this.gameLoop.start();
  }

  /**
   * Stop the game loop
   */
  stop(): void {
    this.gameLoop.stop();
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

    // Update level timer only if primary ball is not sticky (use real deltaTime)
    const primaryBall = this.ballManager.getPrimaryBall();
    if (!primaryBall.getIsSticky()) {
      this.levelTime += deltaTime;
      this.statusBar.setLevelTime(this.levelTime);
    }

    // Update delayed bomb explosions
    this.weaponManager.updateDelayedExplosions(
      deltaTime,
      this.bombDamage,
      (brick, x, y, damage, justDestroyed) => {
        // Show damage number
        this.effectsManager.addDamageNumber(x, y - 5, damage, false);

        // If brick was just destroyed by bomb damage, create particles and update counts
        if (justDestroyed) {
          this.effectsManager.createParticles(x, y, 8, brick.getColor(), 120);

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
      }
    );

    // Handle input (use effective deltaTime for movement)
    this.handleInput(effectiveDeltaTime);

    // Update sticky ball position to follow bat (only primary ball can be sticky)
    this.ballManager.updateStickyBallPosition(this.bat);
    if (primaryBall.getIsSticky()) {
      // If sticky bat upgrade is active AND this is not the initial sticky state,
      // launch when Space is released
      if (this.gameUpgrades.hasStickyBat() && !primaryBall.getIsInitialSticky() && !this.inputManager.isSpaceHeld()) {
        primaryBall.launchFromSticky();
      }
    }

    // Update bat turret visibility and count based on laser upgrade
    const hasShooter = this.gameUpgrades.hasBatShooter();
    this.bat.setShowTurret(hasShooter);
    if (hasShooter) {
      this.bat.setTurretCount(this.gameUpgrades.getTotalShooterCount());
    }

    // Update all balls (use effective deltaTime for slow-mo)
    this.ballManager.update(effectiveDeltaTime);

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

    // Update boss manager
    this.bossManager.update(effectiveDeltaTime, this.bat, this.effectsManager);

    // Update collision manager for all balls (use effective deltaTime for slow-mo)
    for (const ball of this.ballManager.getBalls()) {
      this.collisionManager.update(effectiveDeltaTime, ball);
    }

    // Update visual effects (use effective deltaTime for slow-mo)
    this.effectsManager.update(effectiveDeltaTime);

    // Check wall collisions for all balls (bottom boundary is status bar top)
    const statusBarTop = this.statusBar.getY();
    const wallCollisionResult = this.ballManager.checkWallCollisions(
      statusBarTop,
      this.playerHealth,
      this.effectsManager,
      this.statusBar
    );
    if (wallCollisionResult.lostHealth) {
      this.playerHealth = wallCollisionResult.newHealth;
    }

    // Check if we should trigger slow-motion (1 brick left, any ball approaching)
    // Use primary ball for slow-motion check
    this.slowMotionManager.checkAndTrigger(
      this.level,
      this.ballManager.getPrimaryBall(),
      this.statusBar,
      this.effectsManager,
      this.canvas.width,
      this.canvas.height
    );

    // Check collisions for all balls
    if (!this.ballManager.isPrimaryBallSticky()) {
      this.checkCollisions();
    }

    // Check level completion with delay for animations
    // Level is complete when all destructible bricks are destroyed AND boss is destroyed (if it exists)
    // For Boss3, all copies must also be destroyed
    if (this.level && this.level.isComplete() && this.bossManager.isComplete() && this.gameState === GameState.PLAYING) {
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

        // Calculate which cumulative achievements had progress changes
        const achievementsWithProgressChange = this.levelStartProgress
          ? this.achievementTracker.getAchievementsWithProgressChange(this.levelStartProgress)
          : [];

        this.gameState = GameState.LEVEL_COMPLETE;
        // Use level.getId() to ensure we show the level that was just completed
        this.screenManager.levelCompleteScreen.setLevel(
          this.level.getId(),
          this.levelTime,
          this.isDevUpgradeMode,
          this.achievementTracker.getAchievementsThisRun(),
          this.achievementTracker,
          achievementsWithProgressChange
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
   * Handle keyboard and mouse input
   */
  private handleInput(deltaTime: number): void {
    // Get keyboard movement input
    const movement = this.inputManager.getMovementInput();

    // If primary ball is sticky, left/right arrows adjust launch angle (works in both mouse and keyboard mode)
    const primaryBall = this.ballManager.getPrimaryBall();
    if (primaryBall.getIsSticky()) {
      if (movement.left) {
        primaryBall.adjustLaunchAngle(-2); // Adjust left (more negative angle)
      }
      if (movement.right) {
        primaryBall.adjustLaunchAngle(2); // Adjust right (less negative angle)
      }
    }

    if (this.inputManager.isMouseControlEnabled()) {
      // Mouse control (2D)
      const mousePos = this.inputManager.getMousePosition();
      this.bat.setMousePosition(mousePos.x, mousePos.y);
    } else {
      // Keyboard control (WASD + Arrow keys)
      // Only move bat if primary ball is not sticky
      if (!primaryBall.getIsSticky()) {
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

    // Delegate all collision orchestration to CollisionManager
    this.collisionManager.checkAllCollisions(
      this.level,
      this.ballManager.getBalls(),
      this.bat,
      this.gameUpgrades,
      this.inputManager,
      this.weaponManager,
      this.offensiveEntityManager,
      this.bossManager
    );

    // Boss collisions (boss-specific logic remains in BossManager)
    this.bossManager.checkCollisions(
      this.ballManager.getBalls(),
      this.bat,
      this.collisionManager,
      this.effectsManager,
      this.achievementTracker
    );
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
      this.ballManager.getBalls(),
      this.statusBar,
      this.effectsManager,
      this.weaponManager,
      this.offensiveEntityManager,
      this.bossManager.getBoss(),
      this.bossManager.getBossCopies(),
      options.showParticles,
      options.showDamageNumbers
    );
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
   * Get balls reference (for testing)
   */
  getBalls(): Ball[] {
    return this.ballManager.getBalls();
  }

  /**
   * Get primary ball reference (for testing)
   */
  getBall(): Ball {
    return this.ballManager.getPrimaryBall();
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
