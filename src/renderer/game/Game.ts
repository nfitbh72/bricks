/**
 * Game class - main game engine with loop and state management
 */

import { Ball } from './Ball';
import { Bat } from './Bat';
import { Level } from './Level';
import { GameState, LevelConfig } from './types';
import { checkCircleRectCollision, calculateGameElementScale } from './utils';
import { IntroScreen } from '../ui/IntroScreen';
import { GameOverScreen } from '../ui/GameOverScreen';
import { LevelCompleteScreen } from '../ui/LevelCompleteScreen';
import { TransitionScreen } from '../ui/TransitionScreen';
import { PauseScreen } from '../ui/PauseScreen';
import { ParticleSystem } from './ParticleSystem';
import { getLevel } from '../config/levels';

export class Game {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private ball: Ball;
  private bat: Bat;
  private level: Level | null = null;
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
  private transitionScreen: TransitionScreen;
  private pauseScreen: PauseScreen;
  private isTransitioning: boolean = false;

  // Visual effects
  private particleSystem: ParticleSystem;
  private screenShake: { x: number; y: number; intensity: number; duration: number } = {
    x: 0,
    y: 0,
    intensity: 0,
    duration: 0,
  };

  // Game stats
  private currentLevelId: number = 1;
  private totalBricksDestroyed: number = 0;
  private gameOverDelay: number = 1000; // 1 second delay
  private gameOverTimer: number = 0;

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
    
    const centerX = canvas.width / 2;
    const batY = canvas.height - 100; // Bat higher up
    const ballY = batY - 30; // Ball above the bat
    
    this.bat = new Bat(centerX - batWidth / 2, batY, batWidth, batHeight, 300);
    this.bat.setBounds(0, canvas.width, 0, canvas.height);
    
    this.ball = new Ball(centerX, ballY, ballRadius, ballSpeed);

    // Initialize UI screens
    this.introScreen = new IntroScreen(
      canvas,
      () => this.handleStartGame(),
      () => this.handleQuit()
    );
    this.gameOverScreen = new GameOverScreen(
      canvas,
      () => this.handleRestart(),
      () => this.handleQuit()
    );
    this.levelCompleteScreen = new LevelCompleteScreen(
      canvas,
      () => this.handleContinue()
    );
    this.transitionScreen = new TransitionScreen(canvas);
    this.pauseScreen = new PauseScreen(
      canvas,
      () => this.handleResume(),
      () => this.handleQuitFromPause()
    );

    // Initialize particle system
    this.particleSystem = new ParticleSystem();

    // Set up input listeners
    this.setupInputListeners();
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
      } else if (this.gameState === GameState.PAUSED) {
        this.pauseScreen.handleKeyPress(e.key);
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
      } else if (this.gameState === GameState.PAUSED) {
        this.pauseScreen.handleClick(x, y);
      }
    });
  }

  /**
   * Handle start game from intro
   */
  private handleStartGame(): void {
    this.startTransition(() => {
      // Create level 1 with responsive brick sizing
      const levelConfig = getLevel(1, this.canvas.width);
      if (!levelConfig) {
        throw new Error('Level 1 not found');
      }
      this.currentLevelId = 1;
      this.totalBricksDestroyed = 0;
      this.loadLevel(levelConfig);
    });
  }

  /**
   * Handle restart from game over
   */
  private handleRestart(): void {
    this.startTransition(() => {
      this.gameState = GameState.INTRO;
    });
  }

  /**
   * Handle continue from level complete
   */
  private handleContinue(): void {
    this.startTransition(() => {
      const nextLevelConfig = getLevel(this.currentLevelId + 1, this.canvas.width);
      if (nextLevelConfig) {
        this.currentLevelId++;
        this.loadLevel(nextLevelConfig);
      } else {
        // No more levels - show game over with "COMPLETE" message
        this.gameState = GameState.GAME_OVER;
        this.gameOverScreen.setStats(this.currentLevelId, this.totalBricksDestroyed, true);
      }
    });
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
      this.gameState = GameState.INTRO;
    });
  }

  /**
   * Start transition animation
   */
  private startTransition(onComplete: () => void): void {
    this.isTransitioning = true;
    this.transitionScreen.start(onComplete);
  }

  /**
   * Load a level
   */
  loadLevel(levelConfig: LevelConfig): void {
    this.level = new Level(levelConfig);
    this.playerHealth = levelConfig.playerHealth;
    this.gameState = GameState.PLAYING;
    
    // Reset ball and bat
    const centerX = this.canvas.width / 2;
    const batY = this.canvas.height - 100; // Bat higher up
    const ballY = batY - 30; // Ball above the bat
    const batWidth = this.bat.getWidth();
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

    // Update particles
    this.particleSystem.update(deltaTime);

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

    // Check wall collisions
    const hitBackWall = this.ball.checkWallCollisions(
      0,
      this.canvas.width,
      0,
      this.canvas.height
    );

    if (hitBackWall) {
      this.playerHealth--;
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
        // Bounce ball
        if (collision.normal) {
          this.ball.bounce(collision.normal);
        }
        
        // Damage brick
        const wasDestroyed = brick.isDestroyed();
        brick.takeDamage(1);
        
        // Track destroyed bricks and create particles
        if (!wasDestroyed && brick.isDestroyed()) {
          this.totalBricksDestroyed++;
          // Create particles at brick center
          const brickPos = brick.getPosition();
          const brickBounds = brick.getBounds();
          const centerX = brickPos.x + brickBounds.width / 2;
          const centerY = brickPos.y + brickBounds.height / 2;
          this.particleSystem.createParticles(centerX, centerY, 10, brick.getColor(), 150);
        }
        
        // Restore ball to normal if it was grey
        if (this.ball.getIsGrey()) {
          this.ball.restoreToNormal();
        }
        
        // Only process one brick collision per frame
        break;
      }
    }
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
    // Clear canvas
    this.ctx.fillStyle = '#0a0a0a';
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

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

    // Render particles
    this.particleSystem.render(this.ctx);

    this.ctx.restore();

    // Render UI (not affected by screen shake)
    this.renderUI();

    // Render CRT scanline overlay
    this.renderCRTOverlay();
  }

  /**
   * Render UI elements (health, etc.)
   */
  private renderUI(): void {
    this.ctx.save();

    // Health display (hearts/number at bottom)
    this.ctx.fillStyle = '#ff00ff';
    this.ctx.font = '24px Arial';
    this.ctx.shadowBlur = 10;
    this.ctx.shadowColor = '#ff00ff';
    
    const healthText = '❤️'.repeat(this.playerHealth);
    this.ctx.fillText(healthText, 10, this.canvas.height - 10);

    this.ctx.restore();
  }

  /**
   * Get current game state
   */
  getGameState(): GameState {
    return this.gameState;
  }

  /**
   * Get player health
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
