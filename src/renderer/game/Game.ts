/**
 * Game class - main game engine with loop and state management
 */

import { Ball } from './Ball';
import { Bat } from './Bat';
import { Level } from './Level';
import { Laser } from './Laser';
import { StatusBar } from './StatusBar';
import { GameState, LevelConfig } from './types';
import { checkCircleRectCollision, calculateGameElementScale } from './utils';
import { IntroScreen } from '../ui/IntroScreen';
import { GameOverScreen } from '../ui/GameOverScreen';
import { LevelCompleteScreen } from '../ui/LevelCompleteScreen';
import { TransitionScreen } from '../ui/TransitionScreen';
import { PauseScreen } from '../ui/PauseScreen';
import { UpgradeTreeScreen } from '../ui/UpgradeTreeScreen';
import { OptionsScreen, GameOptions } from '../ui/OptionsScreen';
import { ParticleSystem } from './ParticleSystem';
import { GameUpgrades } from './GameUpgrades';
import { DamageNumber } from './DamageNumber';
import { getLevel } from '../config/levels';
import { getUpgrades } from '../config/upgrades';
import { BRICK_WIDTH } from '../config/constants';

export class Game {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private ball: Ball;
  private bat: Bat;
  private lasers: Laser[] = [];
  private level: Level | null = null;
  private statusBar: StatusBar;
  private gameState: GameState = GameState.INTRO;
  private playerHealth: number = 3;
  private animationFrameId: number | null = null;
  private lastTime: number = 0;
  private accumulator: number = 0;
  private readonly fixedTimeStep: number = 1 / 60; // 60 FPS

  // UI Screens
  private introScreen: IntroScreen;
  private gameOverScreen: GameOverScreen;
  private levelCompleteScreen: LevelCompleteScreen;
  private upgradeTreeScreen: UpgradeTreeScreen;
  private transitionScreen: TransitionScreen;
  private pauseScreen: PauseScreen;
  private optionsScreen: OptionsScreen;
  private isTransitioning: boolean = false;
  private previousState: GameState | null = null; // Store state before options

  // Visual effects
  private particleSystem: ParticleSystem;
  private damageNumbers: DamageNumber[] = [];
  private backgroundImage: HTMLImageElement | null = null;
  private screenShake: { x: number; y: number; intensity: number; duration: number } = {
    x: 0,
    y: 0,
    intensity: 0,
    duration: 0,
  };

  // Sound effects
  private brickHitSound: HTMLAudioElement;
  private brickExplodeSound: HTMLAudioElement;
  private backgroundMusic: HTMLAudioElement;

  // Game stats
  private currentLevelId: number = 1;
  private totalBricksDestroyed: number = 0;
  private gameOverDelay: number = 1000; // 1 second delay
  private gameOverTimer: number = 0;
  private isDevUpgradeMode: boolean = false;

  // Upgrades
  private gameUpgrades: GameUpgrades;

  // Input state
  private keys: Set<string> = new Set();
  private mouseX: number = 0;
  private mouseY: number = 0;
  private useMouseControl: boolean = false;

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

    // Initialize UI screens
    // @TODO: Remove handleDevUpgrades callback before production
    this.introScreen = new IntroScreen(
      canvas,
      () => this.handleStartGame(),
      () => this.handleQuit(),
      () => this.handleDevUpgrades(),
      () => this.handleOpenOptions()
    );
    this.gameOverScreen = new GameOverScreen(
      canvas,
      () => this.handleRestart(),
      () => this.handleQuit()
    );
    this.levelCompleteScreen = new LevelCompleteScreen(
      canvas,
      () => this.handleLevelCompleteTransition()
    );
    this.upgradeTreeScreen = new UpgradeTreeScreen(
      canvas,
      () => this.handleUpgradeComplete(),
      getUpgrades()
    );
    this.transitionScreen = new TransitionScreen(canvas);
    this.pauseScreen = new PauseScreen(
      canvas,
      () => this.handleResume(),
      () => this.handleQuitFromPause(),
      () => this.handleOpenOptions()
    );
    this.optionsScreen = new OptionsScreen(
      canvas,
      () => this.handleCloseOptions()
    );
    
    // Set volume change callback for real-time updates
    this.optionsScreen.setVolumeChangeCallback((musicVolume, sfxVolume) => {
      if (this.backgroundMusic) {
        this.backgroundMusic.volume = musicVolume * 0.2;
      }
      this.brickHitSound.volume = sfxVolume * 0.3;
      this.brickExplodeSound.volume = sfxVolume * 0.4;
    });

    // Initialize particle system
    this.particleSystem = new ParticleSystem();

    // Load sound effects
    this.brickHitSound = new Audio('./assets/sounds/ding.mp3');
    this.brickHitSound.volume = 0.3;
    this.brickExplodeSound = new Audio('./assets/sounds/explosion-107629.mp3');
    this.brickExplodeSound.volume = 0.4;
    
    // Load and start background music
    this.backgroundMusic = new Audio('./assets/sounds/lulu-swing-giulio-fazio-main-version-02-18-3209.mp3');
    this.backgroundMusic.volume = 0.2;
    this.backgroundMusic.loop = true;
    this.backgroundMusic.play().catch(err => {
      console.warn('Background music autoplay blocked. Will start on first user interaction:', err);
    });

    // Apply saved options
    this.applyOptions();

    // Load background image
    this.loadBackgroundImage();

    // Set up input listeners
    this.setupInputListeners();
  }

  /**
   * Load the background image for a specific level
   */
  private loadBackgroundImage(levelId?: number): void {
    const img = new Image();
    const id = levelId || this.currentLevelId;
    img.src = `./assets/images/level${id}.jpg`;
    img.onload = () => {
      this.backgroundImage = img;
    };
    img.onerror = () => {
      console.warn(`Failed to load background image for level ${id}`);
      // Fallback: try to load a default background if specific level image fails
      if (levelId !== undefined) {
        // Don't retry if we already specified a level
        this.backgroundImage = null;
      }
    };
  }

  /**
   * Set up keyboard and mouse input listeners
   */
  private setupInputListeners(): void {
    // Keyboard
    window.addEventListener('keydown', (e) => {
      this.keys.add(e.key.toLowerCase());
      this.keys.add(e.key); // Also add original case for arrow keys
      
      // Handle ESC key for pause/unpause
      if (e.key === 'Escape') {
        e.preventDefault(); // Prevent default ESC behavior
        if (this.gameState === GameState.PLAYING) {
          this.handlePause();
        } else if (this.gameState === GameState.PAUSED) {
          this.handleResume();
        }
        return; // Don't process other handlers for ESC
      }
      
      // Handle screen-specific key presses
      if (this.gameState === GameState.INTRO) {
        this.introScreen.handleKeyPress(e.key);
      } else if (this.gameState === GameState.GAME_OVER) {
        this.gameOverScreen.handleKeyPress(e.key);
      } else if (this.gameState === GameState.LEVEL_COMPLETE) {
        this.levelCompleteScreen.handleKeyPress(e.key);
      } else if (this.gameState === GameState.UPGRADE) {
        this.upgradeTreeScreen.handleKeyPress(e.key);
      } else if (this.gameState === GameState.PAUSED) {
        this.pauseScreen.handleKeyPress(e.key);
      } else if (this.gameState === GameState.PLAYING) {
        // Shoot laser on Space key if shooter upgrade is unlocked
        if (e.key === ' ') {
          this.shootLaser();
        }
      }
    });

    window.addEventListener('keyup', (e) => {
      this.keys.delete(e.key.toLowerCase());
      this.keys.delete(e.key);
    });

    // Mouse
    this.canvas.addEventListener('mousemove', (e) => {
      const rect = this.canvas.getBoundingClientRect();
      this.mouseX = e.clientX - rect.left;
      this.mouseY = e.clientY - rect.top;
      
      // Update screen hover states
      if (this.gameState === GameState.INTRO) {
        this.introScreen.handleMouseMove(this.mouseX, this.mouseY);
      } else if (this.gameState === GameState.GAME_OVER) {
        this.gameOverScreen.handleMouseMove(this.mouseX, this.mouseY);
      } else if (this.gameState === GameState.LEVEL_COMPLETE) {
        this.levelCompleteScreen.handleMouseMove(this.mouseX, this.mouseY);
      } else if (this.gameState === GameState.UPGRADE) {
        this.upgradeTreeScreen.handleMouseMove(this.mouseX, this.mouseY);
      } else if (this.gameState === GameState.PAUSED) {
        this.pauseScreen.handleMouseMove(this.mouseX, this.mouseY);
      } else if (this.gameState === GameState.PLAYING) {
        this.useMouseControl = true;
        // Ensure cursor stays hidden during gameplay
        this.canvas.style.cursor = 'none';
      }
    });

    // Mouse click
    this.canvas.addEventListener('click', (e) => {
      const rect = this.canvas.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      
      if (this.gameState === GameState.INTRO) {
        this.introScreen.handleClick(x, y);
      } else if (this.gameState === GameState.GAME_OVER) {
        this.gameOverScreen.handleClick(x, y);
      } else if (this.gameState === GameState.LEVEL_COMPLETE) {
        this.levelCompleteScreen.handleClick(x, y);
      } else if (this.gameState === GameState.UPGRADE) {
        this.upgradeTreeScreen.handleClick(x, y);
      } else if (this.gameState === GameState.PAUSED) {
        this.pauseScreen.handleClick(x, y);
      } else if (this.gameState === GameState.PLAYING) {
        // Shoot laser if shooter upgrade is unlocked
        this.shootLaser();
      }
    });
  }

  /**
   * Handle start game from intro
   */
  private handleStartGame(): void {
    this.startTransition(() => {
      // Reset upgrades for new game
      this.gameUpgrades.reset();
      this.upgradeTreeScreen.reset();
      
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
    this.upgradeTreeScreen.captureBackground();
    
    // Give 500 points for testing
    this.upgradeTreeScreen.setAvailablePoints(500);
    
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
      this.upgradeTreeScreen.reset();
      this.gameState = GameState.INTRO;
    });
  }

  /**
   * Handle transition from level complete to upgrade screen
   */
  private handleLevelCompleteTransition(): void {
    // Capture current game state as background
    this.upgradeTreeScreen.captureBackground();
    
    // Award 50 points for completing the level
    const currentPoints = this.upgradeTreeScreen.getAvailablePoints();
    this.upgradeTreeScreen.setAvailablePoints(currentPoints + 50);
    
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
          this.gameOverScreen.setStats(this.currentLevelId, this.totalBricksDestroyed, true);
        }
      }
    });
  }

  /**
   * Apply all purchased upgrades from the upgrade tree
   */
  private applyUpgrades(): void {
    // Get upgrade levels from the upgrade tree screen
    const upgrades = this.upgradeTreeScreen.getUpgradeLevels();
    
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
      this.upgradeTreeScreen.reset();
      this.gameState = GameState.INTRO;
    });
  }

  /**
   * Handle opening options screen
   */
  private handleOpenOptions(): void {
    this.previousState = this.gameState;
    this.gameState = GameState.OPTIONS;
    this.optionsScreen.attach();
  }

  /**
   * Handle closing options screen
   */
  private handleCloseOptions(): void {
    this.optionsScreen.detach();
    if (this.previousState) {
      this.gameState = this.previousState;
      this.previousState = null;
    }
    
    // Apply volume settings
    this.applyOptions();
  }

  /**
   * Apply options to game
   */
  private applyOptions(): void {
    const options = this.optionsScreen.getOptions();
    
    // Apply music volume
    if (this.backgroundMusic) {
      this.backgroundMusic.volume = options.musicVolume * 0.2; // Base volume 0.2
    }
    
    // Apply SFX volume
    this.brickHitSound.volume = options.sfxVolume * 0.3; // Base volume 0.3
    this.brickExplodeSound.volume = options.sfxVolume * 0.4; // Base volume 0.4
  }

  /**
   * Start transition animation
   */
  private startTransition(onComplete: () => void): void {
    this.isTransitioning = true;
    this.transitionScreen.start(onComplete);
  }

  /**
   * Shoot a laser from the bat (if shooter upgrade is unlocked)
   */
  private shootLaser(): void {
    // Check if shooter upgrade is unlocked
    if (!this.gameUpgrades.hasBatShooter()) {
      return;
    }

    // Get bat center position
    const batPos = this.bat.getPosition();
    const batWidth = this.bat.getWidth();
    const centerX = batPos.x + batWidth / 2;
    const centerY = batPos.y;

    // Calculate laser properties
    const ballSpeed = this.ball.getSpeed();
    const laserSpeed = ballSpeed * 3; // 3x ball speed
    const ballDamage = this.ball.getDamage();
    const laserDamage = ballDamage * 0.1; // 1/10th ball damage

    // Create and add laser
    const laser = new Laser(centerX, centerY, laserSpeed, laserDamage);
    this.lasers.push(laser);
  }

  /**
   * Update all lasers
   */
  private updateLasers(deltaTime: number): void {
    // Update laser positions
    for (const laser of this.lasers) {
      if (laser.isActive()) {
        laser.update(deltaTime);

        // Deactivate if off-screen
        if (laser.isOffScreen(0)) {
          laser.deactivate();
        }
      }
    }

    // Remove inactive lasers
    this.lasers = this.lasers.filter(laser => laser.isActive());
  }

  /**
   * Check laser-brick collisions
   */
  private checkLaserCollisions(): void {
    if (!this.level) return;
    if (this.gameState !== GameState.PLAYING) return;

    const bricks = this.level.getActiveBricks();

    // Create a copy of lasers array to avoid modification during iteration
    const lasersToCheck = [...this.lasers];

    for (const laser of lasersToCheck) {
      if (!laser.isActive()) continue;

      const laserBounds = laser.getBounds();

      for (const brick of bricks) {
        const brickBounds = brick.getBounds();

        // Simple AABB collision
        if (
          laserBounds.x < brickBounds.x + brickBounds.width &&
          laserBounds.x + laserBounds.width > brickBounds.x &&
          laserBounds.y < brickBounds.y + brickBounds.height &&
          laserBounds.y + laserBounds.height > brickBounds.y
        ) {
          // Damage brick
          const wasDestroyed = brick.isDestroyed();
          const laserDamage = laser.getDamage();
          brick.takeDamage(laserDamage);

          // Create damage number above brick
          const brickCenterX = brickBounds.x + brickBounds.width / 2;
          const brickTopY = brickBounds.y - 5;
          this.damageNumbers.push(new DamageNumber(brickCenterX, brickTopY, laserDamage, false));

          // Track destroyed bricks and create particles
          if (!wasDestroyed && brick.isDestroyed()) {
            this.totalBricksDestroyed++;
            this.statusBar.setBrickCounts(
              this.level.getRemainingBricks(),
              this.level.getTotalBricks()
            );

            // Create particles
            const brickPos = brick.getPosition();
            const centerX = brickPos.x + brickBounds.width / 2;
            const centerY = brickPos.y + brickBounds.height / 2;
            this.particleSystem.createParticles(centerX, centerY, 5, brick.getColor(), 100);

            // Play explosion sound
            this.playSound(this.brickExplodeSound);
          } else if (!brick.isDestroyed()) {
            // Brick was hit but not destroyed - play ding sound
            this.playSound(this.brickHitSound);
          }

          // Deactivate laser after hitting brick
          laser.deactivate();
          break;
        }
      }
    }
  }

  /**
   * Load a level
   * Centers bricks horizontally on the canvas
   */
  loadLevel(levelConfig: LevelConfig): void {
    // Create level with canvas width for centering
    this.level = new Level(levelConfig, this.canvas.width);
    
    // Set player health: base (1) + upgrade bonus
    const baseHealth = 1;
    const upgradeBonus = this.gameUpgrades.getHealthBonus();
    this.playerHealth = baseHealth + upgradeBonus;
    
    // Clear any active lasers
    this.lasers = [];
    
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
    this.mouseX = centerX;
    this.mouseY = batY + batHeight / 2;
    
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
    if (this.isTransitioning) {
      return;
    }

    // Handle game over delay
    if (this.gameState === GameState.PLAYING && this.playerHealth <= 0) {
      this.gameOverTimer += deltaTime * 1000; // Convert to ms
      if (this.gameOverTimer >= this.gameOverDelay) {
        this.gameState = GameState.GAME_OVER;
        this.gameOverScreen.setStats(this.currentLevelId, this.totalBricksDestroyed, false);
        this.gameOverTimer = 0;
      }
      return;
    }

    if (this.gameState !== GameState.PLAYING) {
      return; // Pause updates when not playing or paused
    }

    // Handle input
    this.handleInput(deltaTime);

    // Update ball
    this.ball.update(deltaTime);

    // Update lasers
    this.updateLasers(deltaTime);

    // Update particles
    this.particleSystem.update(deltaTime);

    // Update damage numbers
    const currentTime = performance.now();
    this.damageNumbers.forEach(damageNumber => damageNumber.update(currentTime));
    this.damageNumbers = this.damageNumbers.filter(damageNumber => !damageNumber.isExpired());

    // Update screen shake
    if (this.screenShake.duration > 0) {
      this.screenShake.duration -= deltaTime;
      if (this.screenShake.duration <= 0) {
        this.screenShake.x = 0;
        this.screenShake.y = 0;
        this.screenShake.intensity = 0;
      } else {
        // Random shake within intensity
        this.screenShake.x = (Math.random() - 0.5) * 2 * this.screenShake.intensity;
        this.screenShake.y = (Math.random() - 0.5) * 2 * this.screenShake.intensity;
      }
    }

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
      this.triggerScreenShake(3, 0.2); // 3px intensity, 0.2s duration
    }

    // Check collisions
    this.checkCollisions();

    // Check level completion
    if (this.level && this.level.isComplete()) {
      this.gameState = GameState.LEVEL_COMPLETE;
      this.levelCompleteScreen.setLevel(this.currentLevelId);
    }
  }

  /**
   * Handle keyboard and mouse input
   */
  private handleInput(deltaTime: number): void {
    if (this.useMouseControl) {
      // Mouse control (2D)
      this.bat.setMousePosition(this.mouseX, this.mouseY);
    } else {
      // Keyboard control (WASD + Arrow keys)
      if (this.keys.has('a') || this.keys.has('ArrowLeft')) {
        this.bat.moveLeft(deltaTime);
      }
      if (this.keys.has('d') || this.keys.has('ArrowRight')) {
        this.bat.moveRight(deltaTime);
      }
      if (this.keys.has('w') || this.keys.has('ArrowUp')) {
        this.bat.moveUp(deltaTime);
      }
      if (this.keys.has('s') || this.keys.has('ArrowDown')) {
        this.bat.moveDown(deltaTime);
      }
    }
  }

  /**
   * Check all collisions
   */
  private checkCollisions(): void {
    if (!this.level) return;

    const ballBounds = this.ball.getBounds();
    const batBounds = this.bat.getBounds();

    // Ball-Bat collision (only if ball is not grey)
    if (!this.ball.getIsGrey()) {
      const batCollision = checkCircleRectCollision(ballBounds, batBounds);
      if (batCollision.collided) {
        this.ball.bounceOffBat(this.bat);
      }
    }

    // Ball-Brick collisions
    const bricks = this.level.getActiveBricks();
    for (const brick of bricks) {
      const brickBounds = brick.getBounds();
      const collision = checkCircleRectCollision(ballBounds, brickBounds);
      
      if (collision.collided) {
        // Check for piercing
        const piercingChance = this.gameUpgrades.getBallPiercingChance();
        const pierced = piercingChance > 0 && Math.random() < piercingChance;
        
        // Bounce ball (unless piercing)
        if (!pierced && collision.normal) {
          this.ball.bounce(collision.normal);
        }
        
        // Calculate damage (with critical hit check)
        let damage = this.ball.getDamage();
        let isCritical = false;
        
        if (this.gameUpgrades.hasCriticalHits()) {
          const critChance = this.gameUpgrades.getCriticalHitChance();
          if (Math.random() < critChance) {
            damage *= 2; // Double damage on critical hit
            isCritical = true;
          }
        }
        
        // Damage brick
        const wasDestroyed = brick.isDestroyed();
        brick.takeDamage(damage);
        
        // Create damage number above brick
        const brickCenterX = brickBounds.x + brickBounds.width / 2;
        const brickTopY = brickBounds.y - 5; // Slightly above brick
        this.damageNumbers.push(new DamageNumber(brickCenterX, brickTopY, damage, isCritical));
        
        // Apply explosion damage to nearby bricks if upgrade is active
        if (this.gameUpgrades.hasBallExplosions()) {
          const explosionDamageMultiplier = this.gameUpgrades.getBallExplosionDamageMultiplier();
          const explosionDamage = this.ball.getDamage() * explosionDamageMultiplier;
          const explosionRadius = BRICK_WIDTH * 1.5; // 1.5 brick-width radius
          
          // Get impact point (center of the brick that was hit)
          const impactX = brickBounds.x + brickBounds.width / 2;
          const impactY = brickBounds.y + brickBounds.height / 2;
          
          // Check all other bricks for explosion damage
          for (const otherBrick of bricks) {
            if (otherBrick === brick || otherBrick.isDestroyed()) continue;
            
            const otherBounds = otherBrick.getBounds();
            const otherCenterX = otherBounds.x + otherBounds.width / 2;
            const otherCenterY = otherBounds.y + otherBounds.height / 2;
            
            // Calculate distance from impact point to brick center
            const dx = otherCenterX - impactX;
            const dy = otherCenterY - impactY;
            const distance = Math.sqrt(dx * dx + dy * dy);
            
            // Apply explosion damage if within radius
            if (distance <= explosionRadius) {
              const wasOtherDestroyed = otherBrick.isDestroyed();
              otherBrick.takeDamage(explosionDamage);
              
              // Create damage number for explosion damage
              const otherBrickTopY = otherBounds.y - 5;
              this.damageNumbers.push(new DamageNumber(otherCenterX, otherBrickTopY, explosionDamage, false));
              
              // Track if explosion destroyed this brick
              if (!wasOtherDestroyed && otherBrick.isDestroyed()) {
                this.totalBricksDestroyed++;
                // Update status bar brick count
                this.statusBar.setBrickCounts(
                  this.level.getRemainingBricks(),
                  this.level.getTotalBricks()
                );
                // Create particles at brick center
                this.particleSystem.createParticles(otherCenterX, otherCenterY, 8, otherBrick.getColor(), 120);
              }
            }
          }
        }
        
        // Track destroyed bricks and create particles
        if (!wasDestroyed && brick.isDestroyed()) {
          this.totalBricksDestroyed++;
          // Update status bar brick count
          this.statusBar.setBrickCounts(
            this.level.getRemainingBricks(),
            this.level.getTotalBricks()
          );
          // Create particles at brick center
          const brickPos = brick.getPosition();
          const brickBounds = brick.getBounds();
          const centerX = brickPos.x + brickBounds.width / 2;
          const centerY = brickPos.y + brickBounds.height / 2;
          
          // Extra particles for critical hits
          const particleCount = isCritical ? 20 : 10;
          const particleLifetime = isCritical ? 200 : 150;
          const particleColor = isCritical ? '#ffff00' : brick.getColor(); // Yellow for crits
          this.particleSystem.createParticles(centerX, centerY, particleCount, particleColor, particleLifetime);
          
          // Play explosion sound
          this.playSound(this.brickExplodeSound);
        } else if (!brick.isDestroyed()) {
          // Brick was hit but not destroyed - play ding sound
          this.playSound(this.brickHitSound);
          
          // Create small particle burst for critical hits on non-destroyed bricks
          if (isCritical) {
            const brickPos = brick.getPosition();
            const brickBounds = brick.getBounds();
            const centerX = brickPos.x + brickBounds.width / 2;
            const centerY = brickPos.y + brickBounds.height / 2;
            this.particleSystem.createParticles(centerX, centerY, 15, '#ffff00', 150); // Yellow particles for crit
          }
        }
        
        // Restore ball to normal if it was grey
        if (this.ball.getIsGrey()) {
          this.ball.restoreToNormal();
        }
        
        // If piercing, continue to next brick; otherwise stop
        if (!pierced) {
          break;
        }
      }
    }

    // Laser-Brick collisions
    this.checkLaserCollisions();
  }

  /**
   * Render the game
   */
  private render(): void {
    // Handle transition rendering
    if (this.isTransitioning) {
      const complete = this.transitionScreen.update(performance.now());
      this.transitionScreen.render();
      if (complete) {
        this.isTransitioning = false;
        this.transitionScreen.reset();
      }
      return;
    }

    // Update cursor visibility based on game state
    if (this.gameState === GameState.PLAYING) {
      this.canvas.style.cursor = 'none'; // Hide cursor during gameplay
    } else {
      this.canvas.style.cursor = 'default'; // Show cursor on menus
    }

    // Render based on game state
    if (this.gameState === GameState.INTRO) {
      this.introScreen.render();
    } else if (this.gameState === GameState.GAME_OVER) {
      this.gameOverScreen.render();
    } else if (this.gameState === GameState.LEVEL_COMPLETE) {
      this.levelCompleteScreen.render();
    } else if (this.gameState === GameState.UPGRADE) {
      this.upgradeTreeScreen.render();
    } else if (this.gameState === GameState.OPTIONS) {
      // Render previous screen in background
      if (this.previousState === GameState.INTRO) {
        this.introScreen.render();
      } else if (this.previousState === GameState.PAUSED) {
        this.renderGameplay();
        this.pauseScreen.render();
      }
      // Render options overlay
      this.optionsScreen.render();
    } else if (this.gameState === GameState.PAUSED) {
      // Render game in background
      this.renderGameplay();
      // Render pause overlay
      this.pauseScreen.render();
    } else if (this.gameState === GameState.PLAYING) {
      this.renderGameplay();
    }
  }

  /**
   * Render gameplay (used for both PLAYING and PAUSED states)
   */
  private renderGameplay(): void {
    // Clear canvas with black
    this.ctx.fillStyle = '#0a0a0a';
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

    // Draw background image if loaded
    if (this.backgroundImage) {
      this.ctx.save();
      this.ctx.globalAlpha = 0.3; // Make it subtle/darker
      this.ctx.drawImage(this.backgroundImage, 0, 0, this.canvas.width, this.canvas.height);
      this.ctx.globalAlpha = 1.0;
      this.ctx.restore();
    }

    // Apply screen shake
    this.ctx.save();
    this.ctx.translate(this.screenShake.x, this.screenShake.y);

    // Render level (bricks)
    if (this.level) {
      this.level.render(this.ctx);
    }

    // Render bat
    this.bat.render(this.ctx);

    // Render ball
    this.ball.render(this.ctx);

    // Render lasers
    this.ctx.save();
    for (const laser of this.lasers) {
      if (laser.isActive()) {
        laser.render(this.ctx);
      }
    }
    this.ctx.restore();

    // Render particles (if enabled)
    const options = this.optionsScreen.getOptions();
    if (options.showParticles) {
      this.particleSystem.render(this.ctx);
    }

    // Render damage numbers (if enabled)
    if (options.showDamageNumbers) {
      this.damageNumbers.forEach(damageNumber => damageNumber.render(this.ctx));
    }

    this.ctx.restore();

    // Render status bar (not affected by screen shake)
    this.statusBar.render(this.ctx);

    // Render CRT scanline overlay
    this.renderCRTOverlay();
  }

  /**
   * Play a sound effect
   */
  private playSound(audio: HTMLAudioElement): void {
    // Reset and play sound (allows rapid playback)
    audio.currentTime = 0;
    audio.play().catch(err => {
      console.warn('Failed to play sound:', err);
    });
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
   * Trigger screen shake effect
   */
  private triggerScreenShake(intensity: number, duration: number): void {
    this.screenShake.intensity = intensity;
    this.screenShake.duration = duration;
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
