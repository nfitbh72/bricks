/**
 * Game class - main game engine with loop and state management
 */

import { Ball } from './Ball';
import { Bat } from './Bat';
import { Level } from './Level';
import { GameState, LevelConfig } from './types';
import { checkCircleRectCollision } from './utils';

export class Game {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private ball: Ball;
  private bat: Bat;
  private level: Level | null = null;
  private gameState: GameState = GameState.PLAYING;
  private playerHealth: number = 3;
  private animationFrameId: number | null = null;
  private lastTime: number = 0;
  private accumulator: number = 0;
  private readonly fixedTimeStep: number = 1 / 60; // 60 FPS

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

    // Initialize ball and bat
    const centerX = canvas.width / 2;
    const batY = canvas.height - 50;
    
    this.bat = new Bat(centerX - 50, batY, 100, 10, 300);
    this.bat.setBounds(0, canvas.width, 0, canvas.height);
    
    // Ball starts stationary on the bat
    this.ball = new Ball(centerX, batY - 15, 10, 300);

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
      this.useMouseControl = true;
    });
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
    const batY = this.canvas.height - 50;
    this.bat.setPosition(centerX - 50, batY);
    this.ball.reset();
    this.ball.setPosition(centerX, batY - 15);
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
    if (this.gameState !== GameState.PLAYING) {
      return; // Pause updates when not playing
    }

    // Handle input
    this.handleInput(deltaTime);

    // Update ball
    this.ball.update(deltaTime);

    // Check wall collisions
    const hitBackWall = this.ball.checkWallCollisions(
      0,
      this.canvas.width,
      0,
      this.canvas.height
    );

    if (hitBackWall) {
      this.playerHealth--;
      if (this.playerHealth <= 0) {
        this.gameState = GameState.GAME_OVER;
        return;
      }
    }

    // Check collisions
    this.checkCollisions();

    // Check level completion
    if (this.level && this.level.isComplete()) {
      this.gameState = GameState.LEVEL_COMPLETE;
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
        brick.takeDamage(1);
        
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
    // Clear canvas
    this.ctx.fillStyle = '#0a0a0a';
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

    // Render level (bricks)
    if (this.level) {
      this.level.render(this.ctx);
    }

    // Render bat
    this.bat.render(this.ctx);

    // Render ball
    this.ball.render(this.ctx);

    // Render UI
    this.renderUI();
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
}
