/**
 * Unit tests for Bat class
 */

import { Bat } from '../../src/renderer/game/entities/Bat';

describe('Bat', () => {
  describe('constructor', () => {
    it('should initialize with correct position', () => {
      const bat = new Bat(100, 200, 100, 10);
      const position = bat.getPosition();
      expect(position.x).toBe(100);
      expect(position.y).toBe(200);
    });

    it('should initialize with correct width', () => {
      const bat = new Bat(100, 200, 100, 10);
      expect(bat.getWidth()).toBe(100);
    });

    it('should initialize with correct height', () => {
      const bat = new Bat(100, 200, 100, 10);
      expect(bat.getHeight()).toBe(10);
    });

    it('should initialize with default speed', () => {
      const bat = new Bat(100, 200, 100, 10);
      expect(bat.getSpeed()).toBe(300);
    });

    it('should initialize with custom speed', () => {
      const bat = new Bat(100, 200, 100, 10, 500);
      expect(bat.getSpeed()).toBe(500);
    });
  });

  describe('moveLeft', () => {
    it('should move bat left by speed * deltaTime', () => {
      const bat = new Bat(100, 200, 100, 10, 100);
      bat.setBounds(0, 800);
      bat.moveLeft(1); // 1 second
      const position = bat.getPosition();
      expect(position.x).toBe(0); // 100 - (100 * 1) = 0
    });

    it('should handle fractional deltaTime', () => {
      const bat = new Bat(100, 200, 100, 10, 100);
      bat.setBounds(0, 800);
      bat.moveLeft(0.5); // 0.5 seconds
      const position = bat.getPosition();
      expect(position.x).toBe(50); // 100 - (100 * 0.5) = 50
    });

    it('should not move beyond left boundary', () => {
      const bat = new Bat(10, 200, 100, 10, 100);
      bat.setBounds(0, 800);
      bat.moveLeft(1);
      const position = bat.getPosition();
      expect(position.x).toBe(0);
    });

    it('should stop at left boundary exactly', () => {
      const bat = new Bat(50, 200, 100, 10, 100);
      bat.setBounds(0, 800);
      bat.moveLeft(1);
      const position = bat.getPosition();
      expect(position.x).toBe(0);
    });
  });

  describe('moveRight', () => {
    it('should move bat right by speed * deltaTime', () => {
      const bat = new Bat(100, 200, 100, 10, 100);
      bat.setBounds(0, 800);
      bat.moveRight(1); // 1 second
      const position = bat.getPosition();
      expect(position.x).toBe(200); // 100 + (100 * 1) = 200
    });

    it('should handle fractional deltaTime', () => {
      const bat = new Bat(100, 200, 100, 10, 100);
      bat.setBounds(0, 800);
      bat.moveRight(0.5); // 0.5 seconds
      const position = bat.getPosition();
      expect(position.x).toBe(150); // 100 + (100 * 0.5) = 150
    });

    it('should not move beyond right boundary', () => {
      const bat = new Bat(750, 200, 100, 10, 100);
      bat.setBounds(0, 800);
      bat.moveRight(1);
      const position = bat.getPosition();
      expect(position.x).toBe(700); // 800 - 100 (width) = 700
    });

    it('should stop at right boundary exactly', () => {
      const bat = new Bat(650, 200, 100, 10, 100);
      bat.setBounds(0, 800);
      bat.moveRight(1);
      const position = bat.getPosition();
      expect(position.x).toBe(700);
    });
  });

  describe('moveUp', () => {
    it('should move bat up by speed * deltaTime', () => {
      const bat = new Bat(100, 200, 100, 10, 100);
      bat.setBounds(0, 800, 0, 600);
      bat.moveUp(1); // 1 second
      const position = bat.getPosition();
      expect(position.y).toBe(100); // 200 - (100 * 1) = 100
    });

    it('should handle fractional deltaTime', () => {
      const bat = new Bat(100, 200, 100, 10, 100);
      bat.setBounds(0, 800, 0, 600);
      bat.moveUp(0.5); // 0.5 seconds
      const position = bat.getPosition();
      expect(position.y).toBe(150); // 200 - (100 * 0.5) = 150
    });

    it('should not move beyond top boundary', () => {
      const bat = new Bat(100, 10, 100, 10, 100);
      bat.setBounds(0, 800, 0, 600);
      bat.moveUp(1);
      const position = bat.getPosition();
      expect(position.y).toBe(0);
    });

    it('should stop at top boundary exactly', () => {
      const bat = new Bat(100, 50, 100, 10, 100);
      bat.setBounds(0, 800, 0, 600);
      bat.moveUp(1);
      const position = bat.getPosition();
      expect(position.y).toBe(0);
    });
  });

  describe('moveDown', () => {
    it('should move bat down by speed * deltaTime', () => {
      const bat = new Bat(100, 200, 100, 10, 100);
      bat.setBounds(0, 800, 0, 600);
      bat.moveDown(1); // 1 second
      const position = bat.getPosition();
      expect(position.y).toBe(300); // 200 + (100 * 1) = 300
    });

    it('should handle fractional deltaTime', () => {
      const bat = new Bat(100, 200, 100, 10, 100);
      bat.setBounds(0, 800, 0, 600);
      bat.moveDown(0.5); // 0.5 seconds
      const position = bat.getPosition();
      expect(position.y).toBe(250); // 200 + (100 * 0.5) = 250
    });

    it('should not move beyond bottom boundary', () => {
      const bat = new Bat(100, 550, 100, 10, 100);
      bat.setBounds(0, 800, 0, 600);
      bat.moveDown(1);
      const position = bat.getPosition();
      expect(position.y).toBe(590); // 600 - 10 (height) = 590
    });

    it('should stop at bottom boundary exactly', () => {
      const bat = new Bat(100, 500, 100, 10, 100);
      bat.setBounds(0, 800, 0, 600);
      bat.moveDown(1);
      const position = bat.getPosition();
      expect(position.y).toBe(590);
    });
  });

  describe('setX', () => {
    it('should center bat on given x position', () => {
      const bat = new Bat(0, 200, 100, 10);
      bat.setBounds(0, 800);
      bat.setX(400); // Center at 400
      const position = bat.getPosition();
      expect(position.x).toBe(350); // 400 - 50 (half width) = 350
    });

    it('should constrain to left boundary when centering', () => {
      const bat = new Bat(0, 200, 100, 10);
      bat.setBounds(0, 800);
      bat.setX(30); // Try to center at 30
      const position = bat.getPosition();
      expect(position.x).toBe(0); // Constrained to left edge
    });

    it('should constrain to right boundary when centering', () => {
      const bat = new Bat(0, 200, 100, 10);
      bat.setBounds(0, 800);
      bat.setX(780); // Try to center at 780
      const position = bat.getPosition();
      expect(position.x).toBe(700); // Constrained to right edge (800 - 100)
    });

    it('should allow positioning in middle of screen', () => {
      const bat = new Bat(0, 200, 100, 10);
      bat.setBounds(0, 800);
      bat.setX(400);
      const centerX = bat.getCenterX();
      expect(centerX).toBe(400);
    });
  });

  describe('setY', () => {
    it('should center bat on given y position', () => {
      const bat = new Bat(100, 0, 100, 10);
      bat.setBounds(0, 800, 0, 600);
      bat.setY(300); // Center at 300
      const position = bat.getPosition();
      expect(position.y).toBe(295); // 300 - 5 (half height) = 295
    });

    it('should constrain to top boundary when centering', () => {
      const bat = new Bat(100, 0, 100, 10);
      bat.setBounds(0, 800, 0, 600);
      bat.setY(3); // Try to center at 3
      const position = bat.getPosition();
      expect(position.y).toBe(0); // Constrained to top edge
    });

    it('should constrain to bottom boundary when centering', () => {
      const bat = new Bat(100, 0, 100, 10);
      bat.setBounds(0, 800, 0, 600);
      bat.setY(598); // Try to center at 598
      const position = bat.getPosition();
      expect(position.y).toBe(590); // Constrained to bottom edge (600 - 10)
    });

    it('should allow positioning in middle of screen', () => {
      const bat = new Bat(100, 0, 100, 10);
      bat.setBounds(0, 800, 0, 600);
      bat.setY(300);
      const centerY = bat.getCenterY();
      expect(centerY).toBe(300);
    });
  });

  describe('setMousePosition', () => {
    it('should center bat on given mouse coordinates', () => {
      const bat = new Bat(0, 0, 100, 10);
      bat.setBounds(0, 800, 0, 600);
      bat.setMousePosition(400, 300);
      const position = bat.getPosition();
      expect(position.x).toBe(350); // 400 - 50
      expect(position.y).toBe(295); // 300 - 5
    });

    it('should constrain to boundaries', () => {
      const bat = new Bat(0, 0, 100, 10);
      bat.setBounds(0, 800, 0, 600);
      bat.setMousePosition(10, 3);
      const position = bat.getPosition();
      expect(position.x).toBe(0);
      expect(position.y).toBe(0);
    });

    it('should center bat at mouse position', () => {
      const bat = new Bat(0, 0, 100, 10);
      bat.setBounds(0, 800, 0, 600);
      bat.setMousePosition(400, 300);
      expect(bat.getCenterX()).toBe(400);
      expect(bat.getCenterY()).toBe(300);
    });
  });

  describe('setPosition', () => {
    it('should set position directly', () => {
      const bat = new Bat(0, 0, 100, 10);
      bat.setBounds(0, 800);
      bat.setPosition(200, 300);
      const position = bat.getPosition();
      expect(position.x).toBe(200);
      expect(position.y).toBe(300);
    });

    it('should constrain x position to bounds', () => {
      const bat = new Bat(0, 0, 100, 10);
      bat.setBounds(0, 800);
      bat.setPosition(-50, 300);
      const position = bat.getPosition();
      expect(position.x).toBe(0);
    });

    it('should not constrain y position', () => {
      const bat = new Bat(0, 0, 100, 10);
      bat.setBounds(0, 800);
      bat.setPosition(100, -50);
      const position = bat.getPosition();
      expect(position.y).toBe(-50);
    });
  });

  describe('setBounds', () => {
    it('should set boundary constraints', () => {
      const bat = new Bat(100, 200, 100, 10);
      bat.setBounds(50, 600);
      bat.moveLeft(10); // Try to move far left
      const position = bat.getPosition();
      expect(position.x).toBe(50); // Constrained to minX
    });

    it('should immediately constrain position when bounds are set', () => {
      const bat = new Bat(1000, 200, 100, 10);
      bat.setBounds(0, 800);
      const position = bat.getPosition();
      expect(position.x).toBe(700); // Immediately constrained
    });

    it('should handle narrow bounds', () => {
      const bat = new Bat(100, 200, 100, 10);
      bat.setBounds(0, 100);
      const position = bat.getPosition();
      expect(position.x).toBe(0); // Width equals bounds, so x must be 0
    });

    it('should set vertical boundary constraints', () => {
      const bat = new Bat(100, 200, 100, 10);
      bat.setBounds(0, 800, 50, 400);
      bat.moveUp(10); // Try to move far up
      const position = bat.getPosition();
      expect(position.y).toBe(50); // Constrained to minY
    });

    it('should immediately constrain vertical position when bounds are set', () => {
      const bat = new Bat(100, 1000, 100, 10);
      bat.setBounds(0, 800, 0, 600);
      const position = bat.getPosition();
      expect(position.y).toBe(590); // Immediately constrained (600 - 10)
    });

    it('should handle optional vertical bounds', () => {
      const bat = new Bat(100, 200, 100, 10);
      bat.setBounds(0, 800); // No vertical bounds
      const position = bat.getPosition();
      expect(position.y).toBe(200); // Y position unchanged
    });
  });

  describe('getBounds', () => {
    it('should return correct bounds', () => {
      const bat = new Bat(100, 200, 150, 10);
      const bounds = bat.getBounds();
      expect(bounds.x).toBe(100);
      expect(bounds.y).toBe(200);
      expect(bounds.width).toBe(150);
      expect(bounds.height).toBe(10);
    });

    it('should update bounds after position change', () => {
      const bat = new Bat(100, 200, 150, 10);
      bat.setBounds(0, 800);
      bat.setPosition(300, 400);
      const bounds = bat.getBounds();
      expect(bounds.x).toBe(300);
      expect(bounds.y).toBe(400);
    });
  });

  describe('getCenterX', () => {
    it('should return center x position', () => {
      const bat = new Bat(100, 200, 100, 10);
      expect(bat.getCenterX()).toBe(150); // 100 + 50
    });

    it('should update after movement', () => {
      const bat = new Bat(100, 200, 100, 10);
      bat.setBounds(0, 800);
      bat.moveRight(1);
      expect(bat.getCenterX()).toBeGreaterThan(150);
    });
  });

  describe('getCenterY', () => {
    it('should return center y position', () => {
      const bat = new Bat(100, 200, 100, 10);
      expect(bat.getCenterY()).toBe(205); // 200 + 5
    });

    it('should update after position change', () => {
      const bat = new Bat(100, 200, 100, 10);
      bat.setBounds(0, 800);
      bat.setPosition(100, 300);
      expect(bat.getCenterY()).toBe(305);
    });
  });

  describe('getRelativeHitPosition', () => {
    it('should return 0 when ball hits center', () => {
      const bat = new Bat(100, 200, 100, 10);
      const hitPos = bat.getRelativeHitPosition(150); // Center at 150
      expect(hitPos).toBe(0);
    });

    it('should return -1 when ball hits left edge', () => {
      const bat = new Bat(100, 200, 100, 10);
      const hitPos = bat.getRelativeHitPosition(100); // Left edge
      expect(hitPos).toBe(-1);
    });

    it('should return 1 when ball hits right edge', () => {
      const bat = new Bat(100, 200, 100, 10);
      const hitPos = bat.getRelativeHitPosition(200); // Right edge
      expect(hitPos).toBe(1);
    });

    it('should return 0.5 when ball hits halfway between center and right edge', () => {
      const bat = new Bat(100, 200, 100, 10);
      const hitPos = bat.getRelativeHitPosition(175); // 150 + 25
      expect(hitPos).toBe(0.5);
    });

    it('should return -0.5 when ball hits halfway between center and left edge', () => {
      const bat = new Bat(100, 200, 100, 10);
      const hitPos = bat.getRelativeHitPosition(125); // 150 - 25
      expect(hitPos).toBe(-0.5);
    });

    it('should clamp values beyond left edge to -1', () => {
      const bat = new Bat(100, 200, 100, 10);
      const hitPos = bat.getRelativeHitPosition(50); // Far left
      expect(hitPos).toBe(-1);
    });

    it('should clamp values beyond right edge to 1', () => {
      const bat = new Bat(100, 200, 100, 10);
      const hitPos = bat.getRelativeHitPosition(250); // Far right
      expect(hitPos).toBe(1);
    });
  });

  describe('getPosition', () => {
    it('should return a copy of position (not reference)', () => {
      const bat = new Bat(100, 200, 100, 10);
      const position1 = bat.getPosition();
      position1.x = 999;
      const position2 = bat.getPosition();
      expect(position2.x).toBe(100);
    });
  });

  describe('update', () => {
    it('should not throw when called', () => {
      const bat = new Bat(100, 200, 100, 10);
      expect(() => bat.update(0.016)).not.toThrow();
    });

    it('should not change position when called', () => {
      const bat = new Bat(100, 200, 100, 10);
      bat.setBounds(0, 800);
      const positionBefore = bat.getPosition();
      bat.update(0.016);
      const positionAfter = bat.getPosition();
      expect(positionAfter.x).toBe(positionBefore.x);
      expect(positionAfter.y).toBe(positionBefore.y);
    });
  });

  describe('render', () => {
    it('should not throw when rendering', () => {
      const bat = new Bat(100, 200, 100, 10);
      const mockCtx = {
        save: jest.fn(),
        restore: jest.fn(),
        fillRect: jest.fn(),
        beginPath: jest.fn(),
        arc: jest.fn(),
        lineTo: jest.fn(),
        closePath: jest.fn(),
        fill: jest.fn(),
        shadowBlur: 0,
        shadowColor: '',
        fillStyle: '',
      } as unknown as CanvasRenderingContext2D;

      expect(() => bat.render(mockCtx)).not.toThrow();
    });

    it('should call canvas methods for drawing', () => {
      const bat = new Bat(100, 200, 100, 10);
      const mockCtx = {
        save: jest.fn(),
        restore: jest.fn(),
        fillRect: jest.fn(),
        beginPath: jest.fn(),
        arc: jest.fn(),
        lineTo: jest.fn(),
        closePath: jest.fn(),
        fill: jest.fn(),
        shadowBlur: 0,
        shadowColor: '',
        fillStyle: '',
      } as unknown as CanvasRenderingContext2D;

      bat.render(mockCtx);

      expect(mockCtx.save).toHaveBeenCalled();
      expect(mockCtx.beginPath).toHaveBeenCalled();
      expect(mockCtx.arc).toHaveBeenCalled();
      expect(mockCtx.fill).toHaveBeenCalled();
      expect(mockCtx.restore).toHaveBeenCalled();
    });
  });

  describe('integration - movement combinations', () => {
    it('should handle multiple left movements', () => {
      const bat = new Bat(400, 200, 100, 10, 100);
      bat.setBounds(0, 800);
      bat.moveLeft(1);
      bat.moveLeft(1);
      bat.moveLeft(1);
      const position = bat.getPosition();
      expect(position.x).toBe(100); // 400 - 300 = 100
    });

    it('should handle multiple right movements', () => {
      const bat = new Bat(100, 200, 100, 10, 100);
      bat.setBounds(0, 800);
      bat.moveRight(1);
      bat.moveRight(1);
      const position = bat.getPosition();
      expect(position.x).toBe(300); // 100 + 200 = 300
    });

    it('should handle left then right movement', () => {
      const bat = new Bat(400, 200, 100, 10, 100);
      bat.setBounds(0, 800);
      bat.moveLeft(1);
      bat.moveRight(2);
      const position = bat.getPosition();
      expect(position.x).toBe(500); // 400 - 100 + 200 = 500
    });

    it('should handle setX after movement', () => {
      const bat = new Bat(100, 200, 100, 10);
      bat.setBounds(0, 800);
      bat.moveRight(1);
      bat.setX(400);
      const centerX = bat.getCenterX();
      expect(centerX).toBe(400);
    });

    it('should handle 2D movement (up and right)', () => {
      const bat = new Bat(100, 300, 100, 10, 100);
      bat.setBounds(0, 800, 0, 600);
      bat.moveRight(1);
      bat.moveUp(1);
      const position = bat.getPosition();
      expect(position.x).toBe(200); // 100 + 100
      expect(position.y).toBe(200); // 300 - 100
    });

    it('should handle 2D movement (down and left)', () => {
      const bat = new Bat(400, 200, 100, 10, 100);
      bat.setBounds(0, 800, 0, 600);
      bat.moveLeft(1);
      bat.moveDown(1);
      const position = bat.getPosition();
      expect(position.x).toBe(300); // 400 - 100
      expect(position.y).toBe(300); // 200 + 100
    });

    it('should handle setMousePosition after keyboard movement', () => {
      const bat = new Bat(100, 100, 100, 10);
      bat.setBounds(0, 800, 0, 600);
      bat.moveRight(1);
      bat.moveDown(1);
      bat.setMousePosition(400, 300);
      expect(bat.getCenterX()).toBe(400);
      expect(bat.getCenterY()).toBe(300);
    });
  });
});
