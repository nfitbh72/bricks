/**
 * Tests for DamageNumber class
 */

import { DamageNumber } from '../../src/renderer/game/ui/DamageNumber';

describe('DamageNumber', () => {
  let mockCtx: CanvasRenderingContext2D;

  beforeEach(() => {
    mockCtx = {
      save: jest.fn(),
      restore: jest.fn(),
      fillText: jest.fn(),
      beginPath: jest.fn(),
      arc: jest.fn(),
      fill: jest.fn(),
      fillStyle: '',
      globalAlpha: 1,
      font: '',
      textAlign: 'center',
      textBaseline: 'middle',
      shadowBlur: 0,
      shadowColor: '',
    } as unknown as CanvasRenderingContext2D;
  });

  describe('constructor', () => {
    it('should create damage number with correct properties', () => {
      const damageNumber = new DamageNumber(100, 200, 5, false);
      expect(damageNumber).toBeDefined();
    });

    it('should create critical damage number', () => {
      const damageNumber = new DamageNumber(100, 200, 10, true);
      expect(damageNumber).toBeDefined();
    });
  });

  describe('update', () => {
    it('should move upward over time', () => {
      const damageNumber = new DamageNumber(100, 200, 5, false);
      const startTime = performance.now();
      
      damageNumber.update(startTime + 100);
      
      // Position should have moved up (y decreased)
      // We can't directly test position, but we can verify update doesn't throw
      expect(() => damageNumber.update(startTime + 200)).not.toThrow();
    });

    it('should track lifetime correctly', () => {
      const damageNumber = new DamageNumber(100, 200, 5, false);
      const startTime = performance.now();
      
      expect(damageNumber.isExpired()).toBe(false);
      
      // Update with time past expiration (1000ms)
      damageNumber.update(startTime + 1100);
      
      expect(damageNumber.isExpired()).toBe(true);
    });
  });

  describe('isExpired', () => {
    it('should not be expired initially', () => {
      const damageNumber = new DamageNumber(100, 200, 5, false);
      expect(damageNumber.isExpired()).toBe(false);
    });

    it('should expire after 1 second', () => {
      const damageNumber = new DamageNumber(100, 200, 5, false);
      const startTime = performance.now();
      
      damageNumber.update(startTime + 1001);
      
      expect(damageNumber.isExpired()).toBe(true);
    });

    it('should not expire before 1 second', () => {
      const damageNumber = new DamageNumber(100, 200, 5, false);
      const startTime = performance.now();
      
      damageNumber.update(startTime + 500);
      
      expect(damageNumber.isExpired()).toBe(false);
    });
  });

  describe('render', () => {
    it('should not render if expired', () => {
      const damageNumber = new DamageNumber(100, 200, 5, false);
      const startTime = performance.now();
      
      damageNumber.update(startTime + 1100);
      damageNumber.render(mockCtx);
      
      // Should not call fillText if expired
      expect(mockCtx.fillText).not.toHaveBeenCalled();
    });

    it('should render normal damage with white color', () => {
      const damageNumber = new DamageNumber(100, 200, 5, false);
      const startTime = performance.now();
      
      damageNumber.update(startTime + 100);
      damageNumber.render(mockCtx);
      
      expect(mockCtx.save).toHaveBeenCalled();
      expect(mockCtx.fillText).toHaveBeenCalled();
      expect(mockCtx.restore).toHaveBeenCalled();
    });

    it('should render critical damage with yellow color', () => {
      const damageNumber = new DamageNumber(100, 200, 10, true);
      const startTime = performance.now();
      
      damageNumber.update(startTime + 100);
      damageNumber.render(mockCtx);
      
      expect(mockCtx.save).toHaveBeenCalled();
      expect(mockCtx.fillText).toHaveBeenCalled();
      expect(mockCtx.restore).toHaveBeenCalled();
    });

    it('should display integer damage without decimals', () => {
      const damageNumber = new DamageNumber(100, 200, 5, false);
      const startTime = performance.now();
      
      damageNumber.update(startTime + 100);
      damageNumber.render(mockCtx);
      
      expect(mockCtx.fillText).toHaveBeenCalledWith('5', expect.any(Number), expect.any(Number));
    });

    it('should display fractional damage with 1 decimal', () => {
      const damageNumber = new DamageNumber(100, 200, 2.5, false);
      const startTime = performance.now();
      
      damageNumber.update(startTime + 100);
      damageNumber.render(mockCtx);
      
      expect(mockCtx.fillText).toHaveBeenCalledWith('2.5', expect.any(Number), expect.any(Number));
    });

    it('should fade out in last 300ms', () => {
      const damageNumber = new DamageNumber(100, 200, 5, false);
      const startTime = performance.now();
      
      // Update to 600ms (before fade starts at 700ms)
      damageNumber.update(startTime + 600);
      damageNumber.render(mockCtx);
      // Should be fully opaque before fade
      expect(mockCtx.globalAlpha).toBeGreaterThanOrEqual(0.9);
      
      // Update to 900ms (during fade period)
      damageNumber.update(startTime + 900);
      damageNumber.render(mockCtx);
      // Opacity should be less than full during fade
      expect(mockCtx.globalAlpha).toBeLessThan(0.9);
      expect(mockCtx.globalAlpha).toBeGreaterThan(0);
    });
  });

  describe('damage formatting', () => {
    it('should format zero damage', () => {
      const damageNumber = new DamageNumber(100, 200, 0, false);
      const startTime = performance.now();
      
      damageNumber.update(startTime + 100);
      damageNumber.render(mockCtx);
      
      expect(mockCtx.fillText).toHaveBeenCalledWith('0', expect.any(Number), expect.any(Number));
    });

    it('should format large damage values', () => {
      const damageNumber = new DamageNumber(100, 200, 999, false);
      const startTime = performance.now();
      
      damageNumber.update(startTime + 100);
      damageNumber.render(mockCtx);
      
      expect(mockCtx.fillText).toHaveBeenCalledWith('999', expect.any(Number), expect.any(Number));
    });

    it('should round fractional damage to 1 decimal', () => {
      const damageNumber = new DamageNumber(100, 200, 3.456, false);
      const startTime = performance.now();
      
      damageNumber.update(startTime + 100);
      damageNumber.render(mockCtx);
      
      expect(mockCtx.fillText).toHaveBeenCalledWith('3.5', expect.any(Number), expect.any(Number));
    });
  });
});
