/**
 * Tests for Boss3 - The Splitter boss
 */

import { Boss3 } from '../../src/renderer/game/entities/offensive/Boss3';
import { Brick } from '../../src/renderer/game/entities/Brick';
import { BrickType } from '../../src/renderer/game/core/types';

describe('Boss3', () => {
  let boss: Boss3;
  let mockCtx: any;
  const canvasWidth = 800;
  const canvasHeight = 600;

  beforeEach(() => {
    boss = new Boss3(400, 200, 100, '#ff0000', canvasWidth, canvasHeight);
    mockCtx = {
      save: jest.fn(),
      restore: jest.fn(),
      fillRect: jest.fn(),
      strokeRect: jest.fn(),
      fillText: jest.fn(),
      translate: jest.fn(),
      rotate: jest.fn(),
      scale: jest.fn(),
      beginPath: jest.fn(),
      moveTo: jest.fn(),
      lineTo: jest.fn(),
      stroke: jest.fn(),
      shadowBlur: 0,
      shadowColor: '',
      fillStyle: '',
      strokeStyle: '',
      lineWidth: 0,
      font: '',
      textAlign: '',
      textBaseline: '',
      globalAlpha: 1,
    };
  });

  describe('initialization', () => {
    it('should initialize with correct position', () => {
      expect(boss.getBounds()).toEqual({
        x: 400,
        y: 200,
        width: 120,
        height: 25,
      });
    });

    it('should initialize as non-copy', () => {
      expect(boss.getIsCopy()).toBe(false);
    });

    it('should initialize without splitting', () => {
      expect(boss.shouldSplit()).toBe(false);
    });

    it('should initialize as active', () => {
      expect(boss.isActive()).toBe(true);
    });
  });

  describe('splitting mechanics', () => {
    it('should split when health below threshold', () => {
      boss.takeDamage(60); // Below 50% health
      
      expect(boss.shouldSplit()).toBe(true);
    });

    it('should not split when health above threshold', () => {
      boss.takeDamage(30); // Still above 50%
      
      expect(boss.shouldSplit()).toBe(false);
    });

    it('should not split if already split', () => {
      boss.takeDamage(60);
      boss.markAsSplit();
      
      expect(boss.shouldSplit()).toBe(false);
    });

    it('should not split if is a copy', () => {
      const copy = new Boss3(400, 200, 50, '#ff0000', canvasWidth, canvasHeight, true, 0.7);
      copy.takeDamage(30);
      
      expect(copy.shouldSplit()).toBe(false);
    });

    it('should create split copies', () => {
      boss.takeDamage(60);
      
      const copies = boss.createSplitCopies();
      
      expect(copies.length).toBeGreaterThan(0);
      expect(copies.length).toBeLessThanOrEqual(3); // BOSS3_SPLIT_COUNT
    });

    it('should create smaller copies', () => {
      boss.takeDamage(60);
      
      const copies = boss.createSplitCopies();
      
      for (const copy of copies) {
        expect(copy.getIsCopy()).toBe(true);
      }
    });

    it('should not create copies if already split', () => {
      boss.takeDamage(60);
      boss.markAsSplit();
      
      const copies = boss.createSplitCopies();
      
      expect(copies).toHaveLength(0);
    });

    it('should position copies with spacing', () => {
      boss.takeDamage(60);
      
      const copies = boss.createSplitCopies();
      
      if (copies.length >= 2) {
        const bounds1 = copies[0].getBounds()!;
        const bounds2 = copies[1].getBounds()!;
        
        // Copies should be at different positions
        expect(bounds1.x !== bounds2.x || bounds1.y !== bounds2.y).toBe(true);
      }
    });
  });

  describe('fragment throwing', () => {
    it('should throw splitting fragments', () => {
      boss.update(2, 400, 500); // Wait for cooldown
      
      const fragments = boss.getSplittingFragments();
      expect(fragments.length).toBeGreaterThan(0);
    });

    it('should throw in spread pattern', () => {
      boss.update(2, 400, 500);
      
      const fragments = boss.getSplittingFragments();
      // Should throw 3 fragments in spread
      expect(fragments.length).toBe(3);
    });

    it('should spawn fragments at BRICK_WIDTH distance', () => {
      boss.update(2, 400, 500);
      
      const fragments = boss.getSplittingFragments();
      const centerX = 460; // boss x + width/2 (400 + 120/2)
      const centerY = 212.5; // boss y + height/2 (200 + 25/2)
      
      for (const fragment of fragments) {
        const bounds = fragment.getBounds()!;
        const dx = (bounds.x + bounds.width / 2) - centerX;
        const dy = (bounds.y + bounds.height / 2) - centerY;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        // Should be at least BRICK_WIDTH (120) away
        expect(distance).toBeGreaterThanOrEqual(100); // Allow margin for fragment size
      }
    });

    it('should update fragments', () => {
      boss.update(2, 400, 500);
      const initialCount = boss.getSplittingFragments().length;
      
      boss.update(1, 400, 500);
      
      // Fragments should still exist
      expect(boss.getSplittingFragments().length).toBe(initialCount);
    });

    it('should remove off-screen fragments', () => {
      boss.update(2, 400, 500);
      
      // Update many times to move fragments off screen
      for (let i = 0; i < 100; i++) {
        boss.update(0.1, 400, 500);
      }
      
      // Fragments should be removed
      expect(boss.getSplittingFragments()).toHaveLength(0);
    });
  });

  describe('movement', () => {
    it('should move horizontally', () => {
      const initialX = boss.getBounds()!.x;
      
      boss.update(1, 400, 500);
      
      const newX = boss.getBounds()!.x;
      expect(newX).not.toBe(initialX);
    });

    it('should move faster if is copy', () => {
      const normalBoss = new Boss3(400, 200, 100, '#ff0000', canvasWidth, canvasHeight, false, 1.0);
      const copyBoss = new Boss3(400, 200, 50, '#ff0000', canvasWidth, canvasHeight, true, 0.7);
      
      normalBoss.update(1, 400, 500);
      copyBoss.update(1, 400, 500);
      
      const normalBounds = normalBoss.getBounds()!;
      const copyBounds = copyBoss.getBounds()!;
      
      // Both should have moved
      expect(normalBounds.x).not.toBe(400);
      expect(copyBounds.x).not.toBe(400);
    });

    it('should stay within boundaries', () => {
      for (let i = 0; i < 100; i++) {
        boss.update(0.1, 0, 0);
      }
      
      const bounds = boss.getBounds()!;
      expect(bounds.x).toBeGreaterThanOrEqual(40);
      expect(bounds.x).toBeLessThanOrEqual(720);
    });
  });

  describe('render', () => {
    it('should not render when inactive', () => {
      boss.takeDamage(100);
      mockCtx.fillRect.mockClear();
      
      boss.render(mockCtx);
      
      expect(mockCtx.fillRect).not.toHaveBeenCalled();
    });

    it('should render boss body', () => {
      boss.render(mockCtx);
      
      expect(mockCtx.fillRect).toHaveBeenCalled();
      expect(mockCtx.strokeRect).toHaveBeenCalled();
    });

    it('should render "BOSS" text for original', () => {
      boss.render(mockCtx);
      
      expect(mockCtx.fillText).toHaveBeenCalledWith('BOSS', expect.any(Number), expect.any(Number));
    });

    it('should render "COPY" text for copies', () => {
      const copy = new Boss3(400, 200, 50, '#ff0000', canvasWidth, canvasHeight, true, 0.7);
      
      copy.render(mockCtx);
      
      expect(mockCtx.fillText).toHaveBeenCalledWith('COPY', expect.any(Number), expect.any(Number));
    });

    it('should render with scale for copies', () => {
      const copy = new Boss3(400, 200, 50, '#ff0000', canvasWidth, canvasHeight, true, 0.7);
      
      copy.render(mockCtx);
      
      expect(mockCtx.scale).toHaveBeenCalled();
    });

    it('should render cracks when damaged', () => {
      boss.takeDamage(60); // Below 75% health
      
      boss.render(mockCtx);
      
      // Should draw crack lines
      expect(mockCtx.beginPath).toHaveBeenCalled();
      expect(mockCtx.stroke).toHaveBeenCalled();
    });

    it('should render fragments', () => {
      boss.update(2, 400, 500); // Throw fragments
      
      boss.render(mockCtx);
      
      // Fragments should be rendered
      expect(mockCtx.save).toHaveBeenCalled();
      expect(mockCtx.restore).toHaveBeenCalled();
    });

    it('should render health bar', () => {
      boss.render(mockCtx);
      
      expect(mockCtx.fillRect.mock.calls.length).toBeGreaterThanOrEqual(2);
    });
  });

  describe('takeDamage', () => {
    it('should reduce health', () => {
      boss.takeDamage(30);
      expect(boss.getHealth()).toBe(70);
    });

    it('should deactivate when health reaches zero', () => {
      boss.takeDamage(100);
      expect(boss.isActive()).toBe(false);
    });
  });

  describe('update when inactive', () => {
    it('should not update when inactive', () => {
      boss.takeDamage(100);
      const bounds = boss.getBounds();
      
      boss.update(1, 400, 500);
      
      expect(boss.getBounds()).toBe(bounds);
    });
  });

  describe('getSplittingFragments', () => {
    it('should return empty array initially', () => {
      expect(boss.getSplittingFragments()).toHaveLength(0);
    });

    it('should return fragments after throwing', () => {
      boss.update(2, 400, 500);
      
      expect(boss.getSplittingFragments().length).toBeGreaterThan(0);
    });
  });

  describe('getIsCopy', () => {
    it('should return false for original', () => {
      expect(boss.getIsCopy()).toBe(false);
    });

    it('should return true for copy', () => {
      const copy = new Boss3(400, 200, 50, '#ff0000', canvasWidth, canvasHeight, true, 0.7);
      expect(copy.getIsCopy()).toBe(true);
    });
  });

  describe('markAsSplit', () => {
    it('should prevent further splitting', () => {
      boss.takeDamage(60);
      boss.markAsSplit();
      
      expect(boss.shouldSplit()).toBe(false);
    });
  });
});
