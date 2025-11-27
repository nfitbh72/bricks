/**
 * GameLoop class
 * Handles the main game loop with fixed timestep updates
 */
export class GameLoop {
  private lastTime: number = 0;
  private accumulator: number = 0;
  private readonly fixedTimeStep: number = 1 / 60; // 60 FPS
  private animationFrameId: number | null = null;
  private isRunning: boolean = false;

  constructor(
    private updateFn: (deltaTime: number) => void,
    private renderFn: () => void
  ) {}

  /**
   * Start the game loop
   */
  public start(): void {
    if (this.isRunning) return;
    
    this.isRunning = true;
    this.lastTime = performance.now();
    this.accumulator = 0;
    this.loop(this.lastTime);
  }

  /**
   * Stop the game loop
   */
  public stop(): void {
    this.isRunning = false;
    if (this.animationFrameId !== null) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
    }
  }

  /**
   * Main loop function
   */
  private loop = (currentTime: number): void => {
    if (!this.isRunning) return;

    this.animationFrameId = requestAnimationFrame(this.loop);

    const deltaTime = (currentTime - this.lastTime) / 1000; // Convert to seconds
    this.lastTime = currentTime;

    // Accumulate time
    this.accumulator += deltaTime;

    // Fixed timestep updates
    // Prevent spiral of death by capping accumulator if needed (optional, but good practice)
    if (this.accumulator > 0.2) {
        this.accumulator = 0.2;
    }

    while (this.accumulator >= this.fixedTimeStep) {
      this.updateFn(this.fixedTimeStep);
      this.accumulator -= this.fixedTimeStep;
    }

    // Render
    this.renderFn();
  };
}
