/**
 * Unit tests for InputManager class
 */

import { InputManager } from '../../src/renderer/game/managers/InputManager';

describe('InputManager', () => {
  let canvas: any;
  let inputManager: InputManager;
  let keydownListeners: ((e: any) => void)[] = [];
  let keyupListeners: ((e: any) => void)[] = [];
  let mousemoveListeners: ((e: any) => void)[] = [];
  let clickListeners: ((e: any) => void)[] = [];

  beforeEach(() => {
    keydownListeners = [];
    keyupListeners = [];
    mousemoveListeners = [];
    clickListeners = [];
    
    // Mock canvas element
    canvas = {
      width: 800,
      height: 600,
      addEventListener: jest.fn((event: string, handler: any) => {
        if (event === 'mousemove') mousemoveListeners.push(handler);
        if (event === 'click') clickListeners.push(handler);
      }),
      getBoundingClientRect: jest.fn(() => ({
        left: 0,
        top: 0,
        right: 800,
        bottom: 600,
        width: 800,
        height: 600,
        x: 0,
        y: 0,
        toJSON: () => {}
      }))
    };
    
    // Mock window event listeners
    const originalAddEventListener = (global as any).window?.addEventListener;
    (global as any).window = {
      addEventListener: jest.fn((event: string, handler: any) => {
        if (event === 'keydown') keydownListeners.push(handler);
        if (event === 'keyup') keyupListeners.push(handler);
      })
    };
    
    inputManager = new InputManager(canvas);
    
    // Restore original if it existed
    if (originalAddEventListener) {
      (global as any).window.addEventListener = originalAddEventListener;
    }
  });

  describe('keyboard input', () => {
    it('should track key press state', () => {
      keydownListeners.forEach(listener => listener({ key: 'a' }));
      
      expect(inputManager.isKeyPressed('a')).toBe(true);
    });

    it('should track key release state', () => {
      keydownListeners.forEach(listener => listener({ key: 'a' }));
      keyupListeners.forEach(listener => listener({ key: 'a' }));
      
      expect(inputManager.isKeyPressed('a')).toBe(false);
    });

    it('should handle both lowercase and original case keys', () => {
      keydownListeners.forEach(listener => listener({ key: 'ArrowLeft' }));
      
      expect(inputManager.isKeyPressed('ArrowLeft')).toBe(true);
      expect(inputManager.isKeyPressed('arrowleft')).toBe(true);
    });

    it('should trigger onEscape callback', () => {
      const onEscape = jest.fn();
      inputManager.setCallbacks({ onEscape });
      
      keydownListeners.forEach(listener => listener({ key: 'Escape', preventDefault: jest.fn() }));
      
      expect(onEscape).toHaveBeenCalled();
    });

    it('should trigger onSpace callback once per press', () => {
      const onSpace = jest.fn();
      inputManager.setCallbacks({ onSpace });
      
      keydownListeners.forEach(listener => listener({ key: ' ' }));
      
      // Simulate key repeat (should not trigger again)
      keydownListeners.forEach(listener => listener({ key: ' ' }));
      
      expect(onSpace).toHaveBeenCalledTimes(1);
    });

    it('should not repeat space callback on hold', () => {
      const onSpace = jest.fn();
      inputManager.setCallbacks({ onSpace });
      
      // First press
      keydownListeners.forEach(listener => listener({ key: ' ' }));
      
      // Multiple repeats while held
      for (let i = 0; i < 5; i++) {
        keydownListeners.forEach(listener => listener({ key: ' ' }));
      }
      
      expect(onSpace).toHaveBeenCalledTimes(1);
    });

    it('should trigger onKeyPress callback', () => {
      const onKeyPress = jest.fn();
      inputManager.setCallbacks({ onKeyPress });
      
      keydownListeners.forEach(listener => listener({ key: 'a' }));
      
      expect(onKeyPress).toHaveBeenCalledWith('a');
    });

    it('should reset space flag on key release', () => {
      const onSpace = jest.fn();
      inputManager.setCallbacks({ onSpace });
      
      // Press space
      keydownListeners.forEach(listener => listener({ key: ' ' }));
      
      // Release space
      keyupListeners.forEach(listener => listener({ key: ' ' }));
      
      // Press space again (should trigger callback again)
      keydownListeners.forEach(listener => listener({ key: ' ' }));
      
      expect(onSpace).toHaveBeenCalledTimes(2);
    });
  });

  describe('mouse input', () => {
    it('should track mouse position relative to canvas', () => {
      // Mock canvas.getBoundingClientRect
      canvas.getBoundingClientRect = jest.fn(() => ({
        left: 100,
        top: 50,
        right: 900,
        bottom: 650,
        width: 800,
        height: 600,
        x: 100,
        y: 50,
        toJSON: () => {}
      }));
      
      mousemoveListeners.forEach(listener => listener({ clientX: 250, clientY: 150 }));
      
      const position = inputManager.getMousePosition();
      expect(position.x).toBe(150); // 250 - 100
      expect(position.y).toBe(100); // 150 - 50
    });

    it('should trigger onMouseMove callback', () => {
      const onMouseMove = jest.fn();
      inputManager.setCallbacks({ onMouseMove });
      
      canvas.getBoundingClientRect = jest.fn(() => ({
        left: 0,
        top: 0,
        right: 800,
        bottom: 600,
        width: 800,
        height: 600,
        x: 0,
        y: 0,
        toJSON: () => {}
      }));
      
      mousemoveListeners.forEach(listener => listener({ clientX: 100, clientY: 200 }));
      
      expect(onMouseMove).toHaveBeenCalledWith(100, 200);
    });

    it('should trigger onClick callback', () => {
      const onClick = jest.fn();
      inputManager.setCallbacks({ onClick });
      
      canvas.getBoundingClientRect = jest.fn(() => ({
        left: 0,
        top: 0,
        right: 800,
        bottom: 600,
        width: 800,
        height: 600,
        x: 0,
        y: 0,
        toJSON: () => {}
      }));
      
      clickListeners.forEach(listener => listener({ clientX: 150, clientY: 250 }));
      
      expect(onClick).toHaveBeenCalledWith(150, 250);
    });

    it('should calculate correct canvas-relative coordinates', () => {
      canvas.getBoundingClientRect = jest.fn(() => ({
        left: 50,
        top: 100,
        right: 850,
        bottom: 700,
        width: 800,
        height: 600,
        x: 50,
        y: 100,
        toJSON: () => {}
      }));
      
      mousemoveListeners.forEach(listener => listener({ clientX: 300, clientY: 400 }));
      
      const position = inputManager.getMousePosition();
      expect(position.x).toBe(250); // 300 - 50
      expect(position.y).toBe(300); // 400 - 100
    });
  });

  describe('getMovementInput', () => {
    it('should detect WASD keys', () => {
      keydownListeners.forEach(listener => listener({ key: 'w' }));
      keydownListeners.forEach(listener => listener({ key: 'a' }));
      keydownListeners.forEach(listener => listener({ key: 's' }));
      keydownListeners.forEach(listener => listener({ key: 'd' }));
      
      const movement = inputManager.getMovementInput();
      expect(movement.up).toBe(true);
      expect(movement.left).toBe(true);
      expect(movement.down).toBe(true);
      expect(movement.right).toBe(true);
    });

    it('should detect arrow keys', () => {
      keydownListeners.forEach(listener => listener({ key: 'ArrowUp' }));
      keydownListeners.forEach(listener => listener({ key: 'ArrowLeft' }));
      keydownListeners.forEach(listener => listener({ key: 'ArrowDown' }));
      keydownListeners.forEach(listener => listener({ key: 'ArrowRight' }));
      
      const movement = inputManager.getMovementInput();
      expect(movement.up).toBe(true);
      expect(movement.left).toBe(true);
      expect(movement.down).toBe(true);
      expect(movement.right).toBe(true);
    });

    it('should return all directions correctly', () => {
      const movement = inputManager.getMovementInput();
      expect(movement).toHaveProperty('up');
      expect(movement).toHaveProperty('down');
      expect(movement).toHaveProperty('left');
      expect(movement).toHaveProperty('right');
    });

    it('should return false for unpressed keys', () => {
      const movement = inputManager.getMovementInput();
      expect(movement.up).toBe(false);
      expect(movement.down).toBe(false);
      expect(movement.left).toBe(false);
      expect(movement.right).toBe(false);
    });
  });

  describe('isSpaceHeld', () => {
    it('should return true when space is held', () => {
      keydownListeners.forEach(listener => listener({ key: ' ' }));
      
      expect(inputManager.isSpaceHeld()).toBe(true);
    });

    it('should return false when space is released', () => {
      keydownListeners.forEach(listener => listener({ key: ' ' }));
      keyupListeners.forEach(listener => listener({ key: ' ' }));
      
      expect(inputManager.isSpaceHeld()).toBe(false);
    });

    it('should return false initially', () => {
      expect(inputManager.isSpaceHeld()).toBe(false);
    });
  });

  describe('clearKeys', () => {
    it('should clear all pressed keys', () => {
      keydownListeners.forEach(listener => listener({ key: 'a' }));
      keydownListeners.forEach(listener => listener({ key: 'w' }));
      keydownListeners.forEach(listener => listener({ key: ' ' }));
      
      inputManager.clearKeys();
      
      expect(inputManager.isKeyPressed('a')).toBe(false);
      expect(inputManager.isKeyPressed('w')).toBe(false);
      expect(inputManager.isSpaceHeld()).toBe(false);
    });

    it('should reset space pressed flag', () => {
      const onSpace = jest.fn();
      inputManager.setCallbacks({ onSpace });
      
      // Press space
      keydownListeners.forEach(listener => listener({ key: ' ' }));
      
      // Clear keys
      inputManager.clearKeys();
      
      // Press space again (should trigger callback)
      keydownListeners.forEach(listener => listener({ key: ' ' }));
      
      expect(onSpace).toHaveBeenCalledTimes(2);
    });
  });

  describe('mouse control', () => {
    it('should enable/disable mouse control', () => {
      expect(inputManager.isMouseControlEnabled()).toBe(false);
      
      inputManager.setMouseControl(true);
      expect(inputManager.isMouseControlEnabled()).toBe(true);
      
      inputManager.setMouseControl(false);
      expect(inputManager.isMouseControlEnabled()).toBe(false);
    });

    it('should get/set mouse position', () => {
      inputManager.setMousePosition(100, 200);
      
      const position = inputManager.getMousePosition();
      expect(position.x).toBe(100);
      expect(position.y).toBe(200);
    });

    it('should update mouse position when set', () => {
      inputManager.setMousePosition(50, 75);
      expect(inputManager.getMousePosition().x).toBe(50);
      expect(inputManager.getMousePosition().y).toBe(75);
      
      inputManager.setMousePosition(150, 225);
      expect(inputManager.getMousePosition().x).toBe(150);
      expect(inputManager.getMousePosition().y).toBe(225);
    });
  });

  describe('setCallbacks', () => {
    it('should set multiple callbacks', () => {
      const onEscape = jest.fn();
      const onSpace = jest.fn();
      const onKeyPress = jest.fn();
      
      inputManager.setCallbacks({
        onEscape,
        onSpace,
        onKeyPress
      });
      
      keydownListeners.forEach(listener => listener({ key: 'Escape', preventDefault: jest.fn() }));
      keydownListeners.forEach(listener => listener({ key: ' ' }));
      keydownListeners.forEach(listener => listener({ key: 'a' }));
      
      expect(onEscape).toHaveBeenCalled();
      expect(onSpace).toHaveBeenCalled();
      expect(onKeyPress).toHaveBeenCalled();
    });

    it('should merge callbacks with existing ones', () => {
      const onEscape = jest.fn();
      const onSpace = jest.fn();
      
      inputManager.setCallbacks({ onEscape });
      inputManager.setCallbacks({ onSpace });
      
      keydownListeners.forEach(listener => listener({ key: 'Escape', preventDefault: jest.fn() }));
      keydownListeners.forEach(listener => listener({ key: ' ' }));
      
      expect(onEscape).toHaveBeenCalled();
      expect(onSpace).toHaveBeenCalled();
    });
  });
});
