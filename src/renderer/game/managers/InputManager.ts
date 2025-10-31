/**
 * InputManager - Handles keyboard and mouse input
 */

export interface InputCallbacks {
  onEscape?: () => void;
  onSpace?: () => void;
  onKeyPress?: (key: string) => void;
  onMouseMove?: (x: number, y: number) => void;
  onClick?: (x: number, y: number) => void;
  onRightClick?: (x: number, y: number) => void;
}

export class InputManager {
  private canvas: HTMLCanvasElement;
  private keys: Set<string> = new Set();
  private mouseX: number = 0;
  private mouseY: number = 0;
  private useMouseControl: boolean = false;
  private callbacks: InputCallbacks = {};
  private spacePressed: boolean = false;

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    this.setupListeners();
  }

  /**
   * Set up keyboard and mouse input listeners
   */
  private setupListeners(): void {
    // Keyboard
    window.addEventListener('keydown', (e) => {
      this.keys.add(e.key.toLowerCase());
      this.keys.add(e.key); // Also add original case for arrow keys
      
      // Handle ESC key
      if (e.key === 'Escape') {
        e.preventDefault();
        if (this.callbacks.onEscape) {
          this.callbacks.onEscape();
        }
        return;
      }
      
      // Handle Space key (only fire once per key press, not on repeat)
      if (e.key === ' ' && !this.spacePressed) {
        this.spacePressed = true;
        if (this.callbacks.onSpace) {
          this.callbacks.onSpace();
        }
      }
      
      // Generic key press callback
      if (this.callbacks.onKeyPress) {
        this.callbacks.onKeyPress(e.key);
      }
    });

    window.addEventListener('keyup', (e) => {
      this.keys.delete(e.key.toLowerCase());
      this.keys.delete(e.key);
      
      // Reset space pressed flag on key release
      if (e.key === ' ') {
        this.spacePressed = false;
      }
    });

    // Mouse
    this.canvas.addEventListener('mousemove', (e) => {
      const rect = this.canvas.getBoundingClientRect();
      this.mouseX = e.clientX - rect.left;
      this.mouseY = e.clientY - rect.top;
      
      if (this.callbacks.onMouseMove) {
        this.callbacks.onMouseMove(this.mouseX, this.mouseY);
      }
    });

    // Mouse click (left button)
    this.canvas.addEventListener('click', (e) => {
      const rect = this.canvas.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      
      if (this.callbacks.onClick) {
        this.callbacks.onClick(x, y);
      }
    });

    // Mouse right-click
    this.canvas.addEventListener('contextmenu', (e) => {
      e.preventDefault(); // Prevent context menu
      const rect = this.canvas.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      
      if (this.callbacks.onRightClick) {
        this.callbacks.onRightClick(x, y);
      }
    });
  }

  /**
   * Set input callbacks
   */
  setCallbacks(callbacks: InputCallbacks): void {
    this.callbacks = { ...this.callbacks, ...callbacks };
  }

  /**
   * Check if a key is pressed
   */
  isKeyPressed(key: string): boolean {
    return this.keys.has(key);
  }

  /**
   * Get mouse position
   */
  getMousePosition(): { x: number; y: number } {
    return { x: this.mouseX, y: this.mouseY };
  }

  /**
   * Set mouse position (useful for initialization)
   */
  setMousePosition(x: number, y: number): void {
    this.mouseX = x;
    this.mouseY = y;
  }

  /**
   * Enable/disable mouse control
   */
  setMouseControl(enabled: boolean): void {
    this.useMouseControl = enabled;
  }

  /**
   * Check if mouse control is enabled
   */
  isMouseControlEnabled(): boolean {
    return this.useMouseControl;
  }

  /**
   * Check if movement keys are pressed
   */
  getMovementInput(): { left: boolean; right: boolean; up: boolean; down: boolean } {
    return {
      left: this.keys.has('a') || this.keys.has('ArrowLeft'),
      right: this.keys.has('d') || this.keys.has('ArrowRight'),
      up: this.keys.has('w') || this.keys.has('ArrowUp'),
      down: this.keys.has('s') || this.keys.has('ArrowDown'),
    };
  }

  /**
   * Check if Space key is currently held down
   */
  isSpaceHeld(): boolean {
    return this.keys.has(' ');
  }

  /**
   * Clear all pressed keys (useful for state transitions)
   */
  clearKeys(): void {
    this.keys.clear();
    this.spacePressed = false;
  }
}
