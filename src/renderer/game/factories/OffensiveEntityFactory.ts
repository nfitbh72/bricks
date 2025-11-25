import { FallingBrick } from '../entities/offensive/FallingBrick';
import { Debris } from '../entities/offensive/Debris';
import { BrickLaser } from '../entities/offensive/BrickLaser';
import { HomingMissile } from '../entities/offensive/HomingMissile';
import { SplittingFragment } from '../entities/offensive/SplittingFragment';
import { DynamiteStick } from '../entities/offensive/DynamiteStick';
import { Brick } from '../entities/Brick';
import { BrickType } from '../core/types';
import { 
  EXPLODING_BRICK_DEBRIS_COUNT,
  EXPLODING_BRICK_DEBRIS_SPEED,
  SPLITTING_FRAGMENT_SPEED,
  BOMB_BRICK_EXPLOSION_RADIUS_X_MULTIPLIER,
  BOMB_BRICK_EXPLOSION_RADIUS_Y_MULTIPLIER,
  BRICK_WIDTH,
  BRICK_HEIGHT
} from '../../config/constants';

export interface OffensiveSpawnResult {
  fallingBricks: FallingBrick[];
  debris: Debris[];
  brickLasers: BrickLaser[];
  homingMissiles: HomingMissile[];
  splittingFragments: SplittingFragment[];
  dynamiteSticks: DynamiteStick[];
  bricksToDamage: Brick[];
}

export class OffensiveEntityFactory {
  /**
   * Create offensive entities based on the destroyed brick type
   */
  static createEntities(
    brick: Brick, 
    x: number, 
    y: number, 
    batCenterX: number, 
    allBricks?: Brick[]
  ): OffensiveSpawnResult {
    const result: OffensiveSpawnResult = {
      fallingBricks: [],
      debris: [],
      brickLasers: [],
      homingMissiles: [],
      splittingFragments: [],
      dynamiteSticks: [],
      bricksToDamage: []
    };

    const brickType = brick.getType();
    const color = brick.getColor();
    const brickBounds = brick.getBounds();

    switch (brickType) {
      case BrickType.OFFENSIVE_FALLING:
        result.fallingBricks.push(new FallingBrick(brickBounds.x, brickBounds.y, color));
        break;

      case BrickType.OFFENSIVE_EXPLODING:
        // Create debris in 8 directions
        const angleStep = (Math.PI * 2) / EXPLODING_BRICK_DEBRIS_COUNT;
        for (let i = 0; i < EXPLODING_BRICK_DEBRIS_COUNT; i++) {
          const angle = angleStep * i;
          const velocityX = Math.cos(angle) * EXPLODING_BRICK_DEBRIS_SPEED;
          const velocityY = Math.sin(angle) * EXPLODING_BRICK_DEBRIS_SPEED;
          result.debris.push(new Debris(x, y, velocityX, velocityY, color));
        }
        break;

      case BrickType.OFFENSIVE_LASER:
        // Create laser targeting bat's current position
        result.brickLasers.push(new BrickLaser(x, y, batCenterX, color));
        break;

      case BrickType.OFFENSIVE_HOMING:
        // Create homing missile at destroyed brick position
        result.homingMissiles.push(new HomingMissile(x, y, color));
        break;

      case BrickType.OFFENSIVE_SPLITTING:
        // Create 4 diagonal fragments
        const angles = [Math.PI / 4, 3 * Math.PI / 4, 5 * Math.PI / 4, 7 * Math.PI / 4]; // 45°, 135°, 225°, 315°
        for (const angle of angles) {
          const velocityX = Math.cos(angle) * SPLITTING_FRAGMENT_SPEED;
          const velocityY = Math.sin(angle) * SPLITTING_FRAGMENT_SPEED;
          result.splittingFragments.push(new SplittingFragment(x, y, velocityX, velocityY, color));
        }
        break;

      case BrickType.OFFENSIVE_BOMB:
        // Damage all bricks within elliptical area (wider horizontally, narrower vertically)
        if (!allBricks) break;
        
        const bombCenter = {
          x: brickBounds.x + brickBounds.width / 2,
          y: brickBounds.y + brickBounds.height / 2
        };
        
        // Ellipse radii - wider horizontally to hit adjacent bricks, narrower vertically to limit chain reactions
        const radiusX = BRICK_WIDTH * BOMB_BRICK_EXPLOSION_RADIUS_X_MULTIPLIER;
        const radiusY = BRICK_HEIGHT * BOMB_BRICK_EXPLOSION_RADIUS_Y_MULTIPLIER;
        
        for (const otherBrick of allBricks) {
          if (otherBrick === brick || otherBrick.isDestroyed() || otherBrick.isIndestructible()) {
            continue;
          }
          
          const otherBounds = otherBrick.getBounds();
          const otherCenter = {
            x: otherBounds.x + otherBounds.width / 2,
            y: otherBounds.y + otherBounds.height / 2
          };
          
          // Ellipse equation: (dx/rx)^2 + (dy/ry)^2 <= 1
          const dx = otherCenter.x - bombCenter.x;
          const dy = otherCenter.y - bombCenter.y;
          const ellipseValue = (dx / radiusX) ** 2 + (dy / radiusY) ** 2;
          
          if (ellipseValue <= 1) {
            result.bricksToDamage.push(otherBrick);
          }
        }
        break;

      case BrickType.OFFENSIVE_DYNAMITE:
        // Create falling dynamite stick at destroyed brick position
        result.dynamiteSticks.push(new DynamiteStick(brickBounds.x, brickBounds.y, color));
        break;
    }

    return result;
  }
}
