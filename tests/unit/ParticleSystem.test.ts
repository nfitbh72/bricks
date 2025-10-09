/**
 * Tests for ParticleSystem class
 */

import { ParticleSystem } from '../../src/renderer/game/ParticleSystem';

describe('ParticleSystem', () => {
  let particleSystem: ParticleSystem;
  let mockCtx: CanvasRenderingContext2D;

  beforeEach(() => {
    particleSystem = new ParticleSystem();
    mockCtx = {
      save: jest.fn(),
      restore: jest.fn(),
      fillRect: jest.fn(),
      beginPath: jest.fn(),
      arc: jest.fn(),
      fill: jest.fn(),
      fillStyle: '',
      globalAlpha: 1,
      shadowBlur: 0,
      shadowColor: '',
    } as unknown as CanvasRenderingContext2D;
  });

  describe('constructor', () => {
    it('should create particle system', () => {
      expect(particleSystem).toBeDefined();
    });

    it('should start with no particles', () => {
      particleSystem.render(mockCtx);
      // If no particles, render should not draw anything
      expect(mockCtx.arc).not.toHaveBeenCalled();
    });
  });

  describe('createParticles', () => {
    it('should create particles at specified position', () => {
      particleSystem.createParticles(100, 200, 10, '#ff0000', 100);
      
      particleSystem.render(mockCtx);
      
      // Should have rendered particles
      expect(mockCtx.arc).toHaveBeenCalled();
    });

    it('should create specified number of particles', () => {
      particleSystem.createParticles(100, 200, 5, '#ff0000', 100);
      
      particleSystem.render(mockCtx);
      
      // Should call arc 5 times (one per particle)
      expect(mockCtx.arc).toHaveBeenCalledTimes(5);
    });

    it('should create particles with specified color', () => {
      particleSystem.createParticles(100, 200, 3, '#00ff00', 100);
      
      particleSystem.render(mockCtx);
      
      // Color should be set
      expect(mockCtx.fillStyle).toContain('00ff00');
    });

    it('should handle zero particles', () => {
      particleSystem.createParticles(100, 200, 0, '#ff0000', 1000);
      
      particleSystem.render(mockCtx);
      
      expect(mockCtx.arc).not.toHaveBeenCalled();
    });

    it('should handle negative particle count gracefully', () => {
      expect(() => {
        particleSystem.createParticles(100, 200, -5, '#ff0000', 1000);
      }).not.toThrow();
    });

    it('should create multiple batches of particles', () => {
      particleSystem.createParticles(100, 200, 3, '#ff0000', 1000);
      particleSystem.createParticles(150, 250, 2, '#00ff00', 1000);
      
      particleSystem.render(mockCtx);
      
      // Should render 5 particles total
      expect(mockCtx.arc).toHaveBeenCalledTimes(5);
    });
  });

  describe('update', () => {
    it('should update particle positions', () => {
      particleSystem.createParticles(100, 200, 5, '#ff0000', 1000);
      
      particleSystem.update(0.1); // Update for 0.1 seconds
      
      // Particles should still exist
      particleSystem.render(mockCtx);
      expect(mockCtx.arc).toHaveBeenCalled();
    });

    it('should remove expired particles', () => {
      particleSystem.createParticles(100, 200, 5, '#ff0000', 100);
      
      particleSystem.update(0.6); // Particles fade over 0.5 seconds (life -= deltaTime * 2)
      
      particleSystem.render(mockCtx);
      
      // Particles should be expired and not rendered
      expect(mockCtx.arc).not.toHaveBeenCalled();
    });

    it('should keep particles alive within lifetime', () => {
      particleSystem.createParticles(100, 200, 5, '#ff0000', 100);
      
      particleSystem.update(0.2); // Update for 0.2s (within 0.5s lifetime)
      
      particleSystem.render(mockCtx);
      
      // Particles should still be rendered
      expect(mockCtx.arc).toHaveBeenCalledTimes(5);
    });

    it('should handle multiple updates', () => {
      particleSystem.createParticles(100, 200, 3, '#ff0000', 1000);
      
      particleSystem.update(0.1);
      particleSystem.update(0.1);
      particleSystem.update(0.1);
      
      particleSystem.render(mockCtx);
      
      // Particles should still exist after 300ms
      expect(mockCtx.arc).toHaveBeenCalledTimes(3);
    });

    it('should handle zero deltaTime', () => {
      particleSystem.createParticles(100, 200, 5, '#ff0000', 1000);
      
      particleSystem.update(0);
      
      particleSystem.render(mockCtx);
      
      // Particles should still be rendered
      expect(mockCtx.arc).toHaveBeenCalledTimes(5);
    });
  });

  describe('render', () => {
    it('should not render when no particles exist', () => {
      particleSystem.render(mockCtx);
      
      expect(mockCtx.arc).not.toHaveBeenCalled();
    });

    it('should render active particles', () => {
      particleSystem.createParticles(100, 200, 5, '#ff0000', 1000);
      
      particleSystem.render(mockCtx);
      
      expect(mockCtx.save).toHaveBeenCalled();
      expect(mockCtx.arc).toHaveBeenCalled();
      expect(mockCtx.fill).toHaveBeenCalled();
      expect(mockCtx.restore).toHaveBeenCalled();
    });

    it('should not render expired particles', () => {
      particleSystem.createParticles(100, 200, 5, '#ff0000', 100);
      
      particleSystem.update(0.6); // Past 0.5s lifetime
      particleSystem.render(mockCtx);
      
      expect(mockCtx.arc).not.toHaveBeenCalled();
    });

    it('should render particles with correct opacity', () => {
      particleSystem.createParticles(100, 200, 1, '#ff0000', 1000);
      
      particleSystem.render(mockCtx);
      
      // Opacity should be set
      expect(mockCtx.globalAlpha).toBeGreaterThan(0);
      expect(mockCtx.globalAlpha).toBeLessThanOrEqual(1);
    });
  });

  describe('particle lifecycle', () => {
    it('should fade particles over time', () => {
      particleSystem.createParticles(100, 200, 1, '#ff0000', 100);
      
      // Render at start
      particleSystem.render(mockCtx);
      const initialAlpha = mockCtx.globalAlpha;
      
      // Update and render partway through lifetime
      particleSystem.update(0.3); // 0.3s into 0.5s lifetime
      particleSystem.render(mockCtx);
      const laterAlpha = mockCtx.globalAlpha;
      
      // Alpha should decrease over time
      expect(laterAlpha).toBeLessThan(initialAlpha);
    });

    it('should handle rapid particle creation and expiration', () => {
      // Create particles
      particleSystem.createParticles(100, 200, 10, '#ff0000', 100);
      
      particleSystem.update(0.01);
      particleSystem.render(mockCtx);
      expect(mockCtx.arc).toHaveBeenCalledTimes(10);
      
      // Clear mock
      mockCtx.arc = jest.fn();
      
      // Expire particles
      particleSystem.update(0.6); // Past 0.5s lifetime
      particleSystem.render(mockCtx);
      expect(mockCtx.arc).not.toHaveBeenCalled();
      
      // Create new particles
      particleSystem.createParticles(150, 250, 5, '#00ff00', 100);
      particleSystem.render(mockCtx);
      expect(mockCtx.arc).toHaveBeenCalledTimes(5);
    });
  });

  describe('edge cases', () => {
    it('should handle very large number of particles', () => {
      expect(() => {
        particleSystem.createParticles(100, 200, 1000, '#ff0000', 1000);
      }).not.toThrow();
    });

    it('should handle very short update time', () => {
      particleSystem.createParticles(100, 200, 5, '#ff0000', 100);
      
      particleSystem.update(0.001); // Very small time step
      particleSystem.render(mockCtx);
      
      // Particles should still exist
      expect(mockCtx.arc).toHaveBeenCalledTimes(5);
    });

    it('should handle particles over full lifetime', () => {
      particleSystem.createParticles(100, 200, 5, '#ff0000', 100);
      
      particleSystem.update(0.1); // 0.1 second
      particleSystem.render(mockCtx);
      
      // Particles should still exist
      expect(mockCtx.arc).toHaveBeenCalledTimes(5);
    });

    it('should handle negative coordinates', () => {
      expect(() => {
        particleSystem.createParticles(-100, -200, 5, '#ff0000', 1000);
      }).not.toThrow();
      
      particleSystem.render(mockCtx);
      expect(mockCtx.arc).toHaveBeenCalled();
    });

    it('should handle different color formats', () => {
      expect(() => {
        particleSystem.createParticles(100, 200, 3, 'rgb(255, 0, 0)', 1000);
        particleSystem.createParticles(100, 200, 3, 'rgba(0, 255, 0, 0.5)', 1000);
        particleSystem.createParticles(100, 200, 3, 'red', 1000);
      }).not.toThrow();
    });
  });

  describe('performance', () => {
    it('should efficiently handle many particle updates', () => {
      particleSystem.createParticles(100, 200, 100, '#ff0000', 1000);
      
      const startTime = performance.now();
      for (let i = 0; i < 100; i++) {
        particleSystem.update(0.01);
      }
      const endTime = performance.now();
      
      // Should complete in reasonable time (< 100ms for 100 updates)
      expect(endTime - startTime).toBeLessThan(100);
    });
  });
});
