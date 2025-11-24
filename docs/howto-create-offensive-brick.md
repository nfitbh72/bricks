# How to Create a New Offensive Brick Type

This guide explains how to add a new offensive brick type to the game. Offensive bricks spawn entities that attack the player when destroyed.

## Overview

Offensive bricks are special brick types that create hostile entities (falling bricks, lasers, explosives, etc.) when destroyed. The system consists of:

1. **Brick Type Definition** - Add to the `BrickType` enum
2. **Offensive Entity Class** - Create the entity that spawns
3. **Entity Manager Integration** - Register spawn behavior
4. **Visual Configuration** - Set colors and appearance
5. **Tests** - Add unit tests for the new type

---

## Step 1: Add Brick Type to Enum

**File:** `/src/renderer/game/core/types.ts`

Add your new type to the `BrickType` enum:

```typescript
export enum BrickType {
  NORMAL = 'NORMAL',
  HEALTHY = 'HEALTHY',
  INDESTRUCTIBLE = 'INDESTRUCTIBLE',
  OFFENSIVE_FALLING = 'OFFENSIVE_FALLING',
  OFFENSIVE_EXPLODING = 'OFFENSIVE_EXPLODING',
  OFFENSIVE_LASER = 'OFFENSIVE_LASER',
  OFFENSIVE_YOUR_NEW_TYPE = 'OFFENSIVE_YOUR_NEW_TYPE',  // Add here
}
```

**Naming Convention:** Use `OFFENSIVE_` prefix for all offensive types.

---

## Step 2: Update Brick Class

**File:** `/src/renderer/game/entities/Brick.ts`

### 2.1 Add Health Multiplier

```typescript
private static readonly BRICK_TYPE_MULTIPLIER: Record<BrickType, number> = {
  [BrickType.NORMAL]: 1,
  [BrickType.HEALTHY]: 3,
  [BrickType.INDESTRUCTIBLE]: Infinity,
  [BrickType.OFFENSIVE_FALLING]: 1,
  [BrickType.OFFENSIVE_EXPLODING]: 1,
  [BrickType.OFFENSIVE_LASER]: 1,
  [BrickType.OFFENSIVE_YOUR_NEW_TYPE]: 1,  // Add multiplier
};
```

### 2.2 Add Offensive Color (Optional)

If your brick needs a distinct warning color:

**File:** `/src/renderer/config/constants.ts`

```typescript
export const OFFENSIVE_BRICK_COLOR_YOUR_TYPE = '#FF00FF';
```

**File:** `/src/renderer/game/entities/Brick.ts`

Add your new color constant to the imports and add a case in the `getColor()` method:

```typescript
import { 
  OFFENSIVE_BRICK_COLOR_FALLING,
  OFFENSIVE_BRICK_COLOR_EXPLODING,
  OFFENSIVE_BRICK_COLOR_LASER,
  OFFENSIVE_BRICK_COLOR_HOMING,
  OFFENSIVE_BRICK_COLOR_SPLITTING,
  OFFENSIVE_BRICK_COLOR_BOMB,
  OFFENSIVE_BRICK_COLOR_DYNAMITE,
  OFFENSIVE_BRICK_COLOR_YOUR_TYPE,  // Import
} from '../../config/constants';

// In the getColor() method, add your case:
getColor(): string {
  // ... existing code ...
  switch (this.type) {
    // ... existing cases ...
    case BrickType.OFFENSIVE_YOUR_NEW_TYPE:
      return OFFENSIVE_BRICK_COLOR_YOUR_TYPE;  // Add case
    default:
      return COLOR_WHITE;
  }
}
```

---

## Step 3: Create Offensive Entity Class

**File:** `/src/renderer/game/entities/offensive/YourNewEntity.ts`

Create a new entity class following this template:

```typescript
/**
 * YourNewEntity - description of what it does
 */

import { BRICK_WIDTH, BRICK_HEIGHT, BRICK_GLOW_BLUR } from '../../../config/constants';

export class YourNewEntity {
  private position: { x: number; y: number };
  private velocity: { x: number; y: number };
  private readonly width: number = BRICK_WIDTH;
  private readonly height: number = BRICK_HEIGHT;
  private readonly color: string;
  private active: boolean = true;
  private rotation: number = 0;
  private rotationSpeed: number;

  constructor(x: number, y: number, color: string) {
    this.position = { x, y };
    this.velocity = { x: 0, y: 0 };
    this.color = color;
    this.rotationSpeed = (Math.random() - 0.5) * 6;
  }

  /**
   * Update entity state
   */
  update(deltaTime: number): void {
    if (!this.active) return;

    // Update position, velocity, rotation, etc.
    this.position.x += this.velocity.x * deltaTime;
    this.position.y += this.velocity.y * deltaTime;
    this.rotation += this.rotationSpeed * deltaTime;
  }

  /**
   * Render the entity
   */
  render(ctx: CanvasRenderingContext2D): void {
    if (!this.active) return;

    ctx.save();
    
    // Your rendering code here
    // Use rounded corners and inner glow for consistency
    
    ctx.restore();
  }

  /**
   * Get bounds for collision detection
   */
  getBounds(): { x: number; y: number; width: number; height: number } | null {
    if (!this.active) return null;
    
    return {
      x: this.position.x,
      y: this.position.y,
      width: this.width,
      height: this.height,
    };
  }

  /**
   * Check if entity is active
   */
  isActive(): boolean {
    return this.active;
  }

  /**
   * Deactivate the entity
   */
  deactivate(): void {
    this.active = false;
  }

  /**
   * Check if entity is off screen
   */
  isOffScreen(canvasWidth: number, canvasHeight: number): boolean {
    return (
      this.position.y > canvasHeight ||
      this.position.x < -this.width ||
      this.position.x > canvasWidth
    );
  }

  /**
   * Get entity position
   */
  getPosition(): { x: number; y: number } {
    return { ...this.position };
  }

  /**
   * Get entity color
   */
  getColor(): string {
    return this.color;
  }
}
```

**Key Requirements:**
- Must have `isActive()`, `deactivate()`, `getBounds()` methods
- Must have `update(deltaTime)` and `render(ctx)` methods
- Should return `null` from `getBounds()` when inactive
- Use rounded corners and inner glow for visual consistency

---

## Step 4: Integrate with OffensiveEntityManager

**File:** `/src/renderer/game/managers/OffensiveEntityManager.ts`

### 4.1 Import Your Entity

```typescript
import { YourNewEntity } from '../entities/offensive/YourNewEntity';
```

### 4.2 Add Entity Array

```typescript
export class OffensiveEntityManager {
  private fallingBricks: FallingBrick[] = [];
  private debris: Debris[] = [];
  private brickLasers: BrickLaser[] = [];
  private yourNewEntities: YourNewEntity[] = [];  // Add array
```

### 4.3 Add Spawn Logic

```typescript
spawnOffensiveEntity(
  brick: Brick,
  x: number,
  y: number,
  batCenterX: number,
  allBricks?: Brick[]
): Brick[] | null {
  const brickType = brick.getType();
  const color = brick.getColor();
  const brickBounds = brick.getBounds();

  switch (brickType) {
    case BrickType.OFFENSIVE_FALLING:
      this.fallingBricks.push(new FallingBrick(brickBounds.x, brickBounds.y, color));
      return null;

    case BrickType.OFFENSIVE_EXPLODING:
      // Create debris in 8 directions
      const angleStep = (Math.PI * 2) / EXPLODING_BRICK_DEBRIS_COUNT;
      for (let i = 0; i < EXPLODING_BRICK_DEBRIS_COUNT; i++) {
        const angle = angleStep * i;
        const velocityX = Math.cos(angle) * EXPLODING_BRICK_DEBRIS_SPEED;
        const velocityY = Math.sin(angle) * EXPLODING_BRICK_DEBRIS_SPEED;
        this.debris.push(new Debris(x, y, velocityX, velocityY, color));
      }
      return null;

    case BrickType.OFFENSIVE_LASER:
      this.brickLasers.push(new BrickLaser(x, y, batCenterX, color));
      return null;

    case BrickType.OFFENSIVE_YOUR_NEW_TYPE:
      // Add your spawn logic
      this.yourNewEntities.push(new YourNewEntity(x, y, color));
      return null;
  }
}
```

**Note:** The method returns `Brick[] | null`. Return `null` for most offensive types, or return an array of bricks to damage (like `OFFENSIVE_BOMB` does for area damage).

### 4.4 Add Update Logic

```typescript
update(deltaTime: number, canvasWidth: number, canvasHeight: number, batCenterX: number, batCenterY: number): void {
  // Update falling bricks
  for (const fallingBrick of this.fallingBricks) {
    fallingBrick.update(deltaTime);
  }

  // ... other updates ...

  // Update your new entities (pass bat position if needed for homing behavior)
  for (const entity of this.yourNewEntities) {
    entity.update(deltaTime); // or entity.update(deltaTime, batCenterX, batCenterY) if homing
  }

  // Remove inactive or off-screen entities
  this.yourNewEntities = this.yourNewEntities.filter(
    entity => entity.isActive() && !entity.isOffScreen(canvasWidth, canvasHeight)
  );
}
```

### 4.5 Add Render Logic

```typescript
render(ctx: CanvasRenderingContext2D): void {
  this.fallingBricks.forEach(brick => brick.render(ctx));
  this.debris.forEach(particle => particle.render(ctx));
  this.brickLasers.forEach(laser => laser.render(ctx));
  this.yourNewEntities.forEach(entity => entity.render(ctx));  // Add render
}
```

### 4.6 Add Clear Logic

```typescript
clear(): void {
  this.fallingBricks = [];
  this.debris = [];
  this.brickLasers = [];
  this.yourNewEntities = [];  // Add clear
}
```

### 4.7 Add Getter (if needed for collision detection)

```typescript
getYourNewEntities(): YourNewEntity[] {
  return this.yourNewEntities;
}
```

---

## Step 5: Add Collision Detection (if applicable)

**File:** `/src/renderer/game/managers/CollisionManager.ts`

If your entity can collide with the bat or ball:

```typescript
checkYourNewEntityCollisions(
  yourNewEntities: YourNewEntity[],
  bat: Bat
): void {
  for (const entity of yourNewEntities) {
    if (!entity.isActive()) continue;

    const entityBounds = entity.getBounds();
    if (!entityBounds) continue;

    const batBounds = bat.getBounds();

    if (checkRectCollision(entityBounds, batBounds)) {
      // Handle collision
      entity.deactivate();
      bat.takeDamage(0.1); // 10% damage
      
      // Trigger callbacks
      this.callbacks.onBatDamaged?.();
      this.callbacks.onScreenShake?.(5);
    }
  }
}
```

Then call it from the main `checkCollisions` method:

```typescript
checkCollisions(): void {
  // ... existing collision checks ...
  
  this.checkYourNewEntityCollisions(
    this.offensiveEntityManager.getYourNewEntities(),
    this.bat
  );
}
```

---

## Step 6: Add Unit Tests

**File:** `/tests/unit/YourNewEntity.test.ts`

Create comprehensive unit tests:

```typescript
import { YourNewEntity } from '../../src/renderer/game/entities/offensive/YourNewEntity';

describe('YourNewEntity', () => {
  describe('constructor', () => {
    it('should initialize with correct position', () => {
      const entity = new YourNewEntity(100, 200, '#ff0000');
      const position = entity.getPosition();
      expect(position.x).toBe(100);
      expect(position.y).toBe(200);
    });

    it('should initialize with correct color', () => {
      const entity = new YourNewEntity(100, 200, '#ff0000');
      expect(entity.getColor()).toBe('#ff0000');
    });

    it('should initialize as active', () => {
      const entity = new YourNewEntity(100, 200, '#ff0000');
      expect(entity.isActive()).toBe(true);
    });
  });

  describe('update', () => {
    it('should update position based on velocity', () => {
      const entity = new YourNewEntity(100, 200, '#ff0000');
      // Add test logic
    });

    it('should not update when inactive', () => {
      const entity = new YourNewEntity(100, 200, '#ff0000');
      entity.deactivate();
      const initialPos = entity.getPosition();
      entity.update(1);
      const finalPos = entity.getPosition();
      expect(finalPos).toEqual(initialPos);
    });
  });

  describe('deactivate', () => {
    it('should set active to false', () => {
      const entity = new YourNewEntity(100, 200, '#ff0000');
      entity.deactivate();
      expect(entity.isActive()).toBe(false);
    });
  });

  describe('isOffScreen', () => {
    it('should return false when on screen', () => {
      const entity = new YourNewEntity(100, 200, '#ff0000');
      expect(entity.isOffScreen(800, 600)).toBe(false);
    });

    it('should return true when off screen', () => {
      const entity = new YourNewEntity(100, 700, '#ff0000');
      expect(entity.isOffScreen(800, 600)).toBe(true);
    });
  });

  describe('getBounds', () => {
    it('should return correct bounds', () => {
      const entity = new YourNewEntity(100, 200, '#ff0000');
      const bounds = entity.getBounds();
      expect(bounds).not.toBeNull();
      expect(bounds?.x).toBe(100);
      expect(bounds?.y).toBe(200);
    });

    it('should return null when inactive', () => {
      const entity = new YourNewEntity(100, 200, '#ff0000');
      entity.deactivate();
      expect(entity.getBounds()).toBeNull();
    });
  });
});
```

### Update OffensiveEntityManager Tests

**File:** `/tests/unit/OffensiveEntityManager.test.ts`

Add test cases for your new type:

```typescript
it('should spawn your new entity for OFFENSIVE_YOUR_NEW_TYPE brick type', () => {
  const brick = new Brick(
    { col: 0, row: 0, type: BrickType.OFFENSIVE_YOUR_NEW_TYPE, color: '#ff0000' },
    1
  );
  
  manager.spawnOffensiveEntity(brick, 125, 110, 500);
  
  const entities = manager.getYourNewEntities();
  expect(entities.length).toBe(1);
  expect(entities[0].getColor()).toBe('#ff0000');
});
```

---

## Step 7: Add to Level Configurations

**File:** `/src/renderer/game/levels/*.ts`

Add your new brick type to level configurations:

```typescript
export function createYourLevel(): LevelConfig {
  return {
    id: 10,
    name: 'Your Level Name',
    baseHealth: 2,
    bricks: [
      { col: 5, row: 3, type: BrickType.OFFENSIVE_YOUR_NEW_TYPE },
      // ... more bricks
    ],
  };
}
```

---

## Checklist

Before considering your offensive brick complete:

- [ ] Added to `BrickType` enum
- [ ] Added health multiplier to `BRICK_TYPE_MULTIPLIER`
- [ ] Created entity class with all required methods
- [ ] Added spawn logic to `OffensiveEntityManager`
- [ ] Added update logic to `OffensiveEntityManager`
- [ ] Added render logic to `OffensiveEntityManager`
- [ ] Added clear logic to `OffensiveEntityManager`
- [ ] Added collision detection (if applicable)
- [ ] Created comprehensive unit tests
- [ ] Updated `OffensiveEntityManager` tests
- [ ] Added to at least one level configuration
- [ ] Tested in-game behavior
- [ ] All tests passing (`npm test`)

---

## Visual Consistency Guidelines

To maintain the game's aesthetic:

1. **Use rounded corners** (3px radius with `arcTo()`)
2. **Add inner glow** (lighter border 2px inset at 60% opacity)
3. **Use gradient fills** (top-left to bottom-right)
4. **Add outer glow** (shadowBlur with shadowColor)
5. **Add rotation** for falling/moving entities
6. **Use neon colors** from the game's color palette

---

## Common Patterns

### Gravity-Based Movement
```typescript
const GRAVITY = 800; // pixels per second squared
this.velocity.y += GRAVITY * deltaTime;
```

### Homing Behavior
```typescript
const targetX = bat.getPosition().x;
const targetY = bat.getPosition().y;
const dx = targetX - this.position.x;
const dy = targetY - this.position.y;
const angle = Math.atan2(dy, dx);
this.velocity.x = Math.cos(angle) * speed;
this.velocity.y = Math.sin(angle) * speed;
```

### Timed Behavior
```typescript
private timer: number = 0;
private readonly delay: number = 2; // seconds

update(deltaTime: number): void {
  this.timer += deltaTime;
  if (this.timer >= this.delay) {
    // Trigger behavior
  }
}
```

---

## Examples

See existing implementations:
- **FallingBrick** - Simple gravity-based falling
- **BrickLaser** - Charging delay then downward movement
- **Debris** - Multiple particles with random velocities (exploding brick)
- **HomingMissile** - Tracks bat position with acceleration and turning
- **SplittingFragment** - Diagonal movement then vertical falling
- **DynamiteStick** - Timed fuse with explosion radius damage

---

## Need Help?

- Check existing offensive brick implementations in `/src/renderer/game/entities/offensive/`
- Review `OffensiveEntityManager.ts` for integration patterns
- Look at unit tests for testing patterns
- Ensure all tests pass before committing
