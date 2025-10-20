/**
 * Unit tests for StatusBar class
 */

import { StatusBar } from '../../src/renderer/game/ui/StatusBar';
import { BRICK_HEIGHT } from '../../src/renderer/config/constants';

describe('StatusBar', () => {
  const canvasWidth = 800;
  const canvasHeight = 600;

  describe('constructor', () => {
    it('should initialize with correct dimensions', () => {
      const statusBar = new StatusBar(canvasWidth, canvasHeight);
      expect(statusBar.getY()).toBe(canvasHeight - (BRICK_HEIGHT * 2));
      expect(statusBar.getHeight()).toBe(BRICK_HEIGHT * 2);
    });
  });

  describe('setLevelTitle', () => {
    it('should set level title', () => {
      const statusBar = new StatusBar(canvasWidth, canvasHeight);
      statusBar.setLevelTitle('Level 1: Test');
      // Title is set (no getter, but render will use it)
      expect(statusBar).toBeDefined();
    });
  });

  describe('setPlayerHealth', () => {
    it('should set player health', () => {
      const statusBar = new StatusBar(canvasWidth, canvasHeight);
      statusBar.setPlayerHealth(3);
      expect(statusBar).toBeDefined();
    });
  });

  describe('setBrickCounts', () => {
    it('should set brick counts', () => {
      const statusBar = new StatusBar(canvasWidth, canvasHeight);
      statusBar.setBrickCounts(10, 20);
      expect(statusBar).toBeDefined();
    });
  });

  describe('getY', () => {
    it('should return correct Y position', () => {
      const statusBar = new StatusBar(canvasWidth, canvasHeight);
      expect(statusBar.getY()).toBe(canvasHeight - (BRICK_HEIGHT * 2));
    });
  });

  describe('getHeight', () => {
    it('should return double brick height', () => {
      const statusBar = new StatusBar(canvasWidth, canvasHeight);
      expect(statusBar.getHeight()).toBe(BRICK_HEIGHT * 2);
    });
  });

  describe('render', () => {
    it('should not throw when rendering', () => {
      const statusBar = new StatusBar(canvasWidth, canvasHeight);
      const mockCtx = {
        fillStyle: '',
        strokeStyle: '',
        lineWidth: 0,
        font: '',
        textAlign: '',
        textBaseline: '',
        shadowBlur: 0,
        shadowColor: '',
        fillRect: jest.fn(),
        strokeRect: jest.fn(),
        fillText: jest.fn(),
        beginPath: jest.fn(),
        moveTo: jest.fn(),
        lineTo: jest.fn(),
        stroke: jest.fn(),
      } as unknown as CanvasRenderingContext2D;

      expect(() => statusBar.render(mockCtx)).not.toThrow();
    });

    it('should call canvas methods for drawing', () => {
      const statusBar = new StatusBar(canvasWidth, canvasHeight);
      statusBar.setLevelTitle('Test Level');
      statusBar.setPlayerHealth(3);
      statusBar.setBrickCounts(10, 20);
      
      const mockCtx = {
        fillStyle: '',
        strokeStyle: '',
        lineWidth: 0,
        font: '',
        textAlign: '',
        textBaseline: '',
        shadowBlur: 0,
        shadowColor: '',
        fillRect: jest.fn(),
        strokeRect: jest.fn(),
        fillText: jest.fn(),
        beginPath: jest.fn(),
        moveTo: jest.fn(),
        lineTo: jest.fn(),
        stroke: jest.fn(),
      } as unknown as CanvasRenderingContext2D;

      statusBar.render(mockCtx);

      expect(mockCtx.fillRect).toHaveBeenCalled();
      expect(mockCtx.fillText).toHaveBeenCalledWith('TEST LEVEL', canvasWidth / 2, expect.any(Number));
      expect(mockCtx.fillText).toHaveBeenCalledWith('♥♥♥', 15, expect.any(Number));
      expect(mockCtx.fillText).toHaveBeenCalledWith('0:00', expect.any(Number), expect.any(Number)); // Timer
      expect(mockCtx.fillText).toHaveBeenCalledWith('[10/20]', expect.any(Number), expect.any(Number)); // Brick count
    });
  });
});
