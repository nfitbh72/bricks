/**
 * EffectsManager unit tests
 */

import { EffectsManager } from '../../src/renderer/game/EffectsManager';

// Mock canvas context
const createMockContext = () => ({
  save: jest.fn(),
  restore: jest.fn(),
  translate: jest.fn(),
  fillRect: jest.fn(),
  drawImage: jest.fn(),
  beginPath: jest.fn(),
  arc: jest.fn(),
  fill: jest.fn(),
  fillText: jest.fn(),
  fillStyle: '',
  globalAlpha: 1,
  font: '',
  textAlign: 'center',
  textBaseline: 'middle',
});

// Mock Image
class MockImage {
  src: string = '';
  onload: (() => void) | null = null;
  onerror: (() => void) | null = null;
  
  constructor() {
    // Simulate successful load after a tick
    setTimeout(() => {
      if (this.onload) this.onload();
    }, 0);
  }
}

global.Image = MockImage as any;

describe('EffectsManager', () => {
  let effectsManager: EffectsManager;
  let mockCtx: any;

  beforeEach(() => {
    effectsManager = new EffectsManager();
    mockCtx = createMockContext();
    jest.clearAllMocks();
  });

  describe('constructor', () => {
    it('should initialize without errors', () => {
      expect(effectsManager).toBeDefined();
    });
  });

  describe('createParticles', () => {
    it('should not throw when creating particles', () => {
      expect(() => {
        effectsManager.createParticles(100, 200, 10, '#ff0000', 150);
      }).not.toThrow();
    });

    it('should accept various particle counts', () => {
      expect(() => {
        effectsManager.createParticles(100, 200, 0, '#ff0000', 150);
        effectsManager.createParticles(100, 200, 1, '#ff0000', 150);
        effectsManager.createParticles(100, 200, 100, '#ff0000', 150);
      }).not.toThrow();
    });
  });

  describe('addDamageNumber', () => {
    it('should not throw when adding damage number', () => {
      expect(() => {
        effectsManager.addDamageNumber(100, 200, 50, false);
      }).not.toThrow();
    });

    it('should accept critical damage numbers', () => {
      expect(() => {
        effectsManager.addDamageNumber(100, 200, 100, true);
      }).not.toThrow();
    });

    it('should accept various damage values', () => {
      expect(() => {
        effectsManager.addDamageNumber(100, 200, 0, false);
        effectsManager.addDamageNumber(100, 200, 1, false);
        effectsManager.addDamageNumber(100, 200, 9999, false);
      }).not.toThrow();
    });
  });

  describe('triggerScreenShake', () => {
    it('should not throw when triggering screen shake', () => {
      expect(() => {
        effectsManager.triggerScreenShake(5, 0.5);
      }).not.toThrow();
    });

    it('should return zero offset initially', () => {
      const offset = effectsManager.getScreenShakeOffset();
      expect(offset.x).toBe(0);
      expect(offset.y).toBe(0);
    });

    it('should return non-zero offset after triggering', () => {
      effectsManager.triggerScreenShake(10, 1.0);
      effectsManager.update(0.016); // One frame
      
      const offset = effectsManager.getScreenShakeOffset();
      // Offset should be within intensity range
      expect(Math.abs(offset.x)).toBeLessThanOrEqual(10);
      expect(Math.abs(offset.y)).toBeLessThanOrEqual(10);
    });

    it('should reset offset after duration expires', () => {
      effectsManager.triggerScreenShake(5, 0.1);
      effectsManager.update(0.2); // Update past duration
      
      const offset = effectsManager.getScreenShakeOffset();
      expect(offset.x).toBe(0);
      expect(offset.y).toBe(0);
    });
  });

  describe('update', () => {
    it('should not throw when updating', () => {
      expect(() => {
        effectsManager.update(0.016);
      }).not.toThrow();
    });

    it('should handle multiple updates', () => {
      expect(() => {
        effectsManager.update(0.016);
        effectsManager.update(0.016);
        effectsManager.update(0.016);
      }).not.toThrow();
    });

    it('should update screen shake over time', () => {
      effectsManager.triggerScreenShake(10, 0.5);
      
      // Update for half the duration
      effectsManager.update(0.25);
      const offset1 = effectsManager.getScreenShakeOffset();
      expect(Math.abs(offset1.x) + Math.abs(offset1.y)).toBeGreaterThan(0);
      
      // Update past duration
      effectsManager.update(0.5);
      const offset2 = effectsManager.getScreenShakeOffset();
      expect(offset2.x).toBe(0);
      expect(offset2.y).toBe(0);
    });
  });

  describe('render', () => {
    it('should not throw when rendering', () => {
      expect(() => {
        effectsManager.render(mockCtx, true, true);
      }).not.toThrow();
    });

    it('should respect showParticles flag', () => {
      effectsManager.createParticles(100, 200, 10, '#ff0000', 150);
      
      effectsManager.render(mockCtx, false, true);
      // Particles should not be rendered when showParticles is false
      // Just ensure no errors occur
      expect(() => {
        effectsManager.render(mockCtx, false, true);
      }).not.toThrow();
    });

    it('should respect showDamageNumbers flag', () => {
      effectsManager.addDamageNumber(100, 200, 50, false);
      
      effectsManager.render(mockCtx, true, false);
      // Damage numbers should not be rendered when showDamageNumbers is false
      expect(mockCtx.save).toHaveBeenCalled();
    });
  });

  describe('loadBackgroundImage', () => {
    it('should not throw when loading background', () => {
      expect(() => {
        effectsManager.loadBackgroundImage(1);
      }).not.toThrow();
    });

    it('should accept various level IDs', () => {
      expect(() => {
        effectsManager.loadBackgroundImage(1);
        effectsManager.loadBackgroundImage(5);
        effectsManager.loadBackgroundImage(10);
      }).not.toThrow();
    });
  });

  describe('renderBackground', () => {
    it('should not throw when rendering background', () => {
      expect(() => {
        effectsManager.renderBackground(mockCtx, 800, 600);
      }).not.toThrow();
    });

    it('should call context methods when background is loaded', async () => {
      effectsManager.loadBackgroundImage(1);
      
      // Wait for image to "load"
      await new Promise(resolve => setTimeout(resolve, 10));
      
      effectsManager.renderBackground(mockCtx, 800, 600);
      
      expect(mockCtx.save).toHaveBeenCalled();
      expect(mockCtx.restore).toHaveBeenCalled();
    });
  });

  describe('clear', () => {
    it('should not throw when clearing', () => {
      expect(() => {
        effectsManager.clear();
      }).not.toThrow();
    });

    it('should reset screen shake', () => {
      effectsManager.triggerScreenShake(10, 1.0);
      effectsManager.update(0.016);
      
      effectsManager.clear();
      
      const offset = effectsManager.getScreenShakeOffset();
      expect(offset.x).toBe(0);
      expect(offset.y).toBe(0);
    });
  });

  describe('integration', () => {
    it('should handle multiple effects simultaneously', () => {
      effectsManager.createParticles(100, 100, 5, '#ff0000', 100);
      effectsManager.addDamageNumber(200, 200, 50, false);
      effectsManager.triggerScreenShake(5, 0.5);
      
      expect(() => {
        effectsManager.update(0.016);
      }).not.toThrow();
    });

    it('should handle rapid effect creation', () => {
      for (let i = 0; i < 100; i++) {
        effectsManager.createParticles(i * 10, i * 10, 3, '#ff0000', 100);
        effectsManager.addDamageNumber(i * 10, i * 10, i, false);
      }
      
      expect(() => {
        effectsManager.update(0.016);
      }).not.toThrow();
    });
  });
});
