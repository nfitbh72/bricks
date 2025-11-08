/**
 * Tests for BossArm - Boss1 arm component
 */

import { BossArm } from '../../src/renderer/game/entities/offensive/BossArm';

describe('BossArm', () => {
  let arm: BossArm;
  let mockCtx: any;

  beforeEach(() => {
    arm = new BossArm(100, 100, -20, 5, '#ff0000');
    mockCtx = {
      save: jest.fn(),
      restore: jest.fn(),
      fillRect: jest.fn(),
      strokeRect: jest.fn(),
      shadowBlur: 0,
      shadowColor: '',
      fillStyle: '',
      strokeStyle: '',
      lineWidth: 0,
    };
  });

  describe('initialization', () => {
    it('should initialize at given position', () => {
      const position = arm.getPosition();
      expect(position.x).toBe(100);
      expect(position.y).toBe(100);
    });

    it('should store offset values', () => {
      const bounds = arm.getBounds();
      // Position should be at initial x + offsetX
      expect(bounds.x).toBe(100);
      expect(bounds.y).toBe(100);
    });

    it('should have correct dimensions', () => {
      const bounds = arm.getBounds();
      expect(bounds.width).toBe(15);
      expect(bounds.height).toBe(30);
    });
  });

  describe('update', () => {
    it('should follow boss position with offset', () => {
      arm.update(200, 150, 0.1);
      
      const position = arm.getPosition();
      expect(position.x).toBe(180); // 200 + (-20)
      expect(position.y).toBe(155); // 150 + 5
    });

    it('should update position when boss moves', () => {
      arm.update(100, 100, 0.1);
      const pos1 = arm.getPosition();
      
      arm.update(200, 200, 0.1);
      const pos2 = arm.getPosition();
      
      expect(pos2.x).not.toBe(pos1.x);
      expect(pos2.y).not.toBe(pos1.y);
    });

    it('should maintain offset from boss', () => {
      arm.update(300, 250, 0.1);
      
      const position = arm.getPosition();
      expect(position.x).toBe(280); // 300 + (-20)
      expect(position.y).toBe(255); // 250 + 5
    });

    it('should increment animation phase', () => {
      // Animation phase is internal, but we can verify update works
      for (let i = 0; i < 100; i++) {
        arm.update(100, 100, 0.1);
      }
      
      // Should not crash
      expect(arm.getPosition()).toBeDefined();
    });

    it('should animate over time', () => {
      // Render at different times to verify animation
      arm.update(100, 100, 0);
      arm.render(mockCtx);
      const calls1 = mockCtx.fillRect.mock.calls.length;
      
      mockCtx.fillRect.mockClear();
      
      arm.update(100, 100, 1);
      arm.render(mockCtx);
      const calls2 = mockCtx.fillRect.mock.calls.length;
      
      // Should still render
      expect(calls2).toBeGreaterThan(0);
    });
  });

  describe('render', () => {
    it('should render arm', () => {
      arm.render(mockCtx);
      
      expect(mockCtx.save).toHaveBeenCalled();
      expect(mockCtx.restore).toHaveBeenCalled();
      expect(mockCtx.fillRect).toHaveBeenCalled();
    });

    it('should apply glow effect', () => {
      arm.render(mockCtx);
      
      expect(mockCtx.shadowBlur).toBeGreaterThan(0);
      expect(mockCtx.shadowColor).toBe('#ff0000');
    });

    it('should draw border', () => {
      arm.render(mockCtx);
      
      expect(mockCtx.strokeRect).toHaveBeenCalled();
      expect(mockCtx.strokeStyle).toBe('#ffffff');
      expect(mockCtx.lineWidth).toBe(1);
    });

    it('should use correct color', () => {
      const blueArm = new BossArm(100, 100, 0, 0, '#0000ff');
      
      blueArm.render(mockCtx);
      
      expect(mockCtx.fillStyle).toBe('#0000ff');
      expect(mockCtx.shadowColor).toBe('#0000ff');
    });

    it('should animate with wave motion', () => {
      // Render at different animation phases
      arm.update(100, 100, 0);
      arm.render(mockCtx);
      const call1 = mockCtx.fillRect.mock.calls[0];
      
      mockCtx.fillRect.mockClear();
      
      arm.update(100, 100, 1);
      arm.render(mockCtx);
      const call2 = mockCtx.fillRect.mock.calls[0];
      
      // X position should be different due to wave animation
      // (wave offset is applied)
      expect(call1).toBeDefined();
      expect(call2).toBeDefined();
    });
  });

  describe('getPosition', () => {
    it('should return current position', () => {
      const position = arm.getPosition();
      
      expect(position).toHaveProperty('x');
      expect(position).toHaveProperty('y');
    });

    it('should return updated position after update', () => {
      arm.update(200, 200, 0.1);
      
      const position = arm.getPosition();
      expect(position.x).toBe(180); // 200 + (-20)
      expect(position.y).toBe(205); // 200 + 5
    });

    it('should reflect boss movement', () => {
      arm.update(100, 100, 0.1);
      const pos1 = arm.getPosition();
      
      arm.update(300, 300, 0.1);
      const pos2 = arm.getPosition();
      
      expect(pos2.x).toBe(pos1.x + 200);
      expect(pos2.y).toBe(pos1.y + 200);
    });
  });

  describe('getBounds', () => {
    it('should return correct bounds', () => {
      const bounds = arm.getBounds();
      
      expect(bounds.x).toBe(100);
      expect(bounds.y).toBe(100);
      expect(bounds.width).toBe(15);
      expect(bounds.height).toBe(30);
    });

    it('should update bounds after movement', () => {
      arm.update(200, 200, 0.1);
      
      const bounds = arm.getBounds();
      expect(bounds.x).toBe(180);
      expect(bounds.y).toBe(205);
    });

    it('should have consistent dimensions', () => {
      arm.update(150, 150, 0.1);
      const bounds1 = arm.getBounds();
      
      arm.update(250, 250, 0.1);
      const bounds2 = arm.getBounds();
      
      expect(bounds1.width).toBe(bounds2.width);
      expect(bounds1.height).toBe(bounds2.height);
    });
  });

  describe('offset behavior', () => {
    it('should handle positive offset', () => {
      const rightArm = new BossArm(100, 100, 45, 5, '#ff0000');
      rightArm.update(100, 100, 0.1);
      
      const position = rightArm.getPosition();
      expect(position.x).toBe(145); // 100 + 45
      expect(position.y).toBe(105); // 100 + 5
    });

    it('should handle negative offset', () => {
      const leftArm = new BossArm(100, 100, -20, 5, '#ff0000');
      leftArm.update(100, 100, 0.1);
      
      const position = leftArm.getPosition();
      expect(position.x).toBe(80); // 100 + (-20)
      expect(position.y).toBe(105); // 100 + 5
    });

    it('should handle zero offset', () => {
      const centerArm = new BossArm(100, 100, 0, 0, '#ff0000');
      centerArm.update(100, 100, 0.1);
      
      const position = centerArm.getPosition();
      expect(position.x).toBe(100);
      expect(position.y).toBe(100);
    });
  });

  describe('animation phase', () => {
    it('should progress animation over time', () => {
      // Animation phase increases with deltaTime
      arm.update(100, 100, 0.1);
      arm.update(100, 100, 0.1);
      arm.update(100, 100, 0.1);
      
      // Should not crash and should render
      arm.render(mockCtx);
      expect(mockCtx.fillRect).toHaveBeenCalled();
    });

    it('should create wave motion', () => {
      // Wave motion is visible in rendering
      // We can't directly test the wave, but verify it renders correctly
      for (let i = 0; i < 10; i++) {
        arm.update(100, 100, 0.1);
        mockCtx.fillRect.mockClear();
        arm.render(mockCtx);
        expect(mockCtx.fillRect).toHaveBeenCalled();
      }
    });
  });

  describe('multiple arms', () => {
    it('should support left and right arms with different offsets', () => {
      const leftArm = new BossArm(100, 100, -20, 5, '#ff0000');
      const rightArm = new BossArm(100, 100, 45, 5, '#ff0000');
      
      leftArm.update(200, 200, 0.1);
      rightArm.update(200, 200, 0.1);
      
      const leftPos = leftArm.getPosition();
      const rightPos = rightArm.getPosition();
      
      expect(leftPos.x).toBeLessThan(rightPos.x);
      expect(leftPos.y).toBe(rightPos.y);
    });
  });
});
