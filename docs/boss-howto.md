# Boss System - How-To Guide

This guide explains how the boss system works in the Bricks game and how to create new bosses.

## Overview

The boss system allows special "boss bricks" to spawn powerful enemies when hit by the ball. Currently, there are two boss types implemented:

- **Boss1** - "The Thrower": A mobile boss with arms that throws bricks at the player
- **Boss2** - "The Shielder": A boss with a rotating shield that deflects the ball

## Architecture

### Key Components

1. **Boss Brick Types** (`BrickType.BOSS_1`, `BrickType.BOSS_2`)
   - Special brick types defined in `src/renderer/game/core/types.ts`
   - Displayed with "BOSS" text on the brick
   - When hit by the ball, they spawn a boss entity instead of being destroyed

2. **Boss Entity Classes**
   - `Boss1.ts` - First boss implementation
   - `Boss2.ts` - Second boss implementation
   - `BossArm.ts` - Visual component for Boss1
   - `ThrownBrick.ts` - Projectile thrown by bosses

3. **Game Integration**
   - Boss activation handled in `Game.ts` via `activateBoss()` method
   - Collision detection in `CollisionManager.ts`
   - Boss constants in `constants.ts`

## How Boss Activation Works

### 1. Brick Setup

Boss bricks are created like any other brick but with a special type:

```typescript
// In level pattern (brickLayout.ts)
// '1' = BOSS_1 brick
// '2' = BOSS_2 brick

const pattern = [
  "........",
  "...1....",  // Boss1 brick in center
  "........"
];
```

### 2. Activation Trigger

When a boss brick is hit by the ball:

```typescript
// From Game.ts - activateBoss() method
private activateBoss(brick: Brick, info: { centerX: number; centerY: number }): void {
  // 1. Restore the brick (prevent destruction)
  brick.restore();
  
  // 2. Determine boss type from brick type
  const brickType = brick.getType();
  
  // 3. Calculate boss health based on level's base health
  const baseHealth = this.level.getConfig().baseHealth || 1;
  const bossHealth = baseHealth * BOSS_HEALTH_MULTIPLIER;
  
  // 4. Spawn boss at brick position
  if (brickType === BrickType.BOSS_2) {
    this.boss = new Boss2(x, y, bossHealth, color, canvasWidth, canvasHeight);
  } else {
    this.boss = new Boss1(x, y, bossHealth, color, canvasWidth, canvasHeight);
  }
}
```

### 3. Boss Lifecycle

Once spawned, the boss:
- Updates every frame via `boss.update(deltaTime, batX, batY)`
- Renders via `boss.render(ctx)`
- Takes damage from ball collisions
- Becomes inactive when health reaches 0

## Creating a New Boss

### Step 1: Define the Boss Type

Add a new brick type in `src/renderer/game/core/types.ts`:

```typescript
export enum BrickType {
  // ... existing types
  BOSS_3 = 'BOSS_3',  // Your new boss
}
```

### Step 2: Create the Boss Class

Create a new file `src/renderer/game/entities/offensive/Boss3.ts`:

```typescript
export class Boss3 {
  private x: number;
  private y: number;
  private health: number;
  private readonly maxHealth: number;
  private active: boolean = true;
  private readonly width: number = BRICK_WIDTH;
  private readonly height: number = BRICK_HEIGHT;
  private readonly color: string;
  
  constructor(x: number, y: number, health: number, color: string, 
              canvasWidth: number, canvasHeight: number) {
    this.x = x;
    this.y = y;
    this.health = health;
    this.maxHealth = health;
    this.color = color;
    // Initialize your boss-specific properties
  }
  
  update(deltaTime: number, batX: number, batY: number): void {
    if (!this.active) return;
    // Implement boss behavior (movement, attacks, etc.)
  }
  
  render(ctx: CanvasRenderingContext2D): void {
    if (!this.active) return;
    // Render boss visuals
  }
  
  takeDamage(damage: number): void {
    this.health -= damage;
    if (this.health <= 0) {
      this.health = 0;
      this.active = false;
    }
  }
  
  getBounds(): { x: number; y: number; width: number; height: number } | null {
    if (!this.active) return null;
    return { x: this.x, y: this.y, width: this.width, height: this.height };
  }
  
  isActive(): boolean {
    return this.active;
  }
  
  isDestroyed(): boolean {
    return !this.active;
  }
  
  getHealth(): number {
    return this.health;
  }
  
  getMaxHealth(): number {
    return this.maxHealth;
  }
}
```

### Step 3: Add Boss Constants

In `src/renderer/config/constants.ts`:

```typescript
// Boss3 constants
export const BOSS3_HEALTH_MULTIPLIER = 8;
export const BOSS3_MOVE_SPEED = 150;
export const BOSS3_SPAWN_OFFSET_Y = -2;
// Add any other boss-specific constants
```

### Step 4: Update Brick Configuration

In `src/renderer/game/entities/Brick.ts`:

```typescript
private static readonly BRICK_TYPE_MULTIPLIER: Record<BrickType, number> = {
  // ... existing types
  [BrickType.BOSS_3]: 1,
};

// In getColor() method
case BrickType.BOSS_3:
  return '#your_color_here';

// In render methods, add BOSS_3 to boss brick checks
if (this.type === BrickType.BOSS_1 || this.type === BrickType.BOSS_2 || this.type === BrickType.BOSS_3) {
  displayText = 'BOSS';
}
```

### Step 5: Update Brick Layout Parser

In `src/renderer/config/brickLayout.ts`:

```typescript
// Add to pattern documentation
// '3' = BOSS_3 brick (your new boss)

// In createBricksFromPattern()
} else if (char === '3') {
  type = BrickType.BOSS_3;
}
```

### Step 6: Integrate into Game

In `src/renderer/game/core/Game.ts`:

```typescript
import { Boss3 } from '../entities/offensive/Boss3';

// Update boss type
private boss: Boss1 | Boss2 | Boss3 | null = null;

// In activateBoss() method
if (brickType === BrickType.BOSS_3) {
  bossHealth = baseHealth * BOSS3_HEALTH_MULTIPLIER;
  spawnOffsetY = brick.getHeight() * BOSS3_SPAWN_OFFSET_Y;
}

// In boss spawning logic
if (brickType === BrickType.BOSS_3) {
  this.boss = new Boss3(bossX, bossY, bossHealth, brick.getColor(), 
                        this.canvas.width, this.canvas.height);
} else if (brickType === BrickType.BOSS_2) {
  // ... existing code
}

// Update brick detection
if ((brickType === BrickType.BOSS_1 || brickType === BrickType.BOSS_2 || 
     brickType === BrickType.BOSS_3) && !this.boss) {
  this.activateBoss(destroyedBrick, info);
}
```

### Step 7: Update Collision Manager

In `src/renderer/game/managers/CollisionManager.ts`:

```typescript
// Update type signature
checkBossBallCollisions(
  boss: Boss1 | Boss2 | Boss3,
  // ... rest of parameters
): void {
  // Add any boss-specific collision logic if needed
}
```

## Boss Design Patterns

### Movement Pattern

Bosses typically move within defined boundaries:

```typescript
// Set movement boundaries
this.minX = BRICK_WIDTH;
this.maxX = canvasWidth - BRICK_WIDTH * 2;
this.minY = BRICK_HEIGHT * 3;
this.maxY = canvasHeight / 2;

// Pick random targets and move towards them
private pickNewTarget(): void {
  this.targetX = this.minX + Math.random() * (this.maxX - this.minX);
  this.targetY = this.minY + Math.random() * (this.maxY - this.minY);
}
```

### Attack Pattern

Bosses can throw projectiles at the player:

```typescript
// Cooldown-based attacks
private throwCooldown: number = 0;
private readonly throwInterval: number = 2.0; // seconds

update(deltaTime: number, batX: number, batY: number): void {
  this.throwCooldown -= deltaTime;
  if (this.throwCooldown <= 0) {
    this.attackPlayer(batX, batY);
    this.throwCooldown = this.throwInterval;
  }
}
```

### Health Display

Bosses should display a health bar:

```typescript
// In render() method
const healthBarWidth = this.width;
const healthBarHeight = 4;
const healthBarY = this.y - 10;
const healthPercent = this.health / this.maxHealth;

// Background
ctx.fillStyle = '#333333';
ctx.fillRect(this.x, healthBarY, healthBarWidth, healthBarHeight);

// Health (color-coded)
ctx.fillStyle = healthPercent > 0.5 ? '#00ff00' : 
                healthPercent > 0.25 ? '#ffff00' : '#ff0000';
ctx.fillRect(this.x, healthBarY, healthBarWidth * healthPercent, healthBarHeight);
```

## Boss Examples

### Boss1 - The Thrower

**Features:**
- Spawns two animated arms
- Moves randomly around the play area
- Throws bricks from the level at the player's bat
- Fast movement speed (250 px/s)
- Frequent attacks (1 second interval)
- Health: 6x base health

**Key Mechanics:**
```typescript
// Arms follow the boss
for (const arm of this.arms) {
  arm.update(this.x, this.y, deltaTime);
}

// Throws actual bricks from the level
private throwBrickAtBat(batX: number, batY: number): void {
  const brickToThrow = this.availableBricks[randomIndex];
  brickToThrow.takeDamage(999999); // Destroy the brick
  
  // Create projectile
  const thrownBrick = new ThrownBrick(
    this.x + this.width / 2,
    this.y + this.height / 2,
    batX, batY,
    BOSS1_THROWN_BRICK_SPEED,
    brickColor
  );
}
```

### Boss2 - The Shielder

**Features:**
- Rotating shield with 3 segments
- Shield deflects the ball
- Slower movement (70 px/s)
- Less frequent attacks (3 second interval)
- Health: 4x base health (lower due to shield protection)

**Key Mechanics:**
```typescript
// Rotating shield
this.shieldRotation += this.shieldRotationSpeed * deltaTime;

// Shield collision detection
checkShieldCollision(ballX: number, ballY: number, ballRadius: number): number | null {
  // Check if ball is within shield ring
  // Check if ball hits an active segment
  // Return angle for deflection calculation
}

// Render shield arcs
for (const segment of this.shieldSegments) {
  if (!segment.active) continue;
  ctx.arc(centerX, centerY, this.shieldRadius, startAngle, endAngle);
  ctx.lineWidth = BOSS2_SHIELD_THICKNESS;
  ctx.strokeStyle = '#00ccff';
}
```

## Testing Your Boss

1. **Create a test level** with your boss brick:
   ```typescript
   const pattern = [
     "........",
     "...3....",  // Your Boss3
     "........"
   ];
   ```

2. **Test scenarios:**
   - Boss spawns correctly when brick is hit
   - Boss moves within boundaries
   - Boss attacks work properly
   - Boss takes damage from ball
   - Boss is destroyed at 0 health
   - Visual effects (particles, health bar) work
   - Collision detection is accurate

3. **Balance testing:**
   - Adjust health multiplier for difficulty
   - Tune movement speed
   - Adjust attack frequency
   - Test with different base health values

## Best Practices

1. **Keep boss state self-contained** - All boss logic should be in the boss class
2. **Use constants** - Define all tunable values in `constants.ts`
3. **Follow existing patterns** - Match the structure of Boss1 and Boss2
4. **Implement all required methods** - `update()`, `render()`, `takeDamage()`, `getBounds()`, etc.
5. **Handle edge cases** - Check for null/undefined, boundary conditions
6. **Add visual feedback** - Glow effects, health bars, animations
7. **Test collision detection** - Ensure ball and projectile collisions work correctly
8. **Consider performance** - Avoid expensive operations in `update()` and `render()`

## Common Pitfalls

- **Forgetting to update type unions** - Add your boss to all `Boss1 | Boss2` type declarations
- **Not handling inactive state** - Always check `if (!this.active) return;` in update/render
- **Hardcoding values** - Use constants instead of magic numbers
- **Missing boundary checks** - Bosses should stay within the play area
- **Incorrect collision bounds** - Return null from `getBounds()` when inactive
- **Not cleaning up projectiles** - Remove inactive projectiles to prevent memory leaks

## Future Enhancements

Potential boss features to implement:
- Multiple phases (boss changes behavior at low health)
- Destructible parts (arms, shields, etc.)
- Special abilities (teleport, summon minions, etc.)
- Invulnerability periods
- Environmental hazards
- Boss-specific power-ups
- Achievement tracking
- Boss rush mode

## Related Files

- `src/renderer/game/entities/offensive/Boss1.ts` - Boss1 implementation
- `src/renderer/game/entities/offensive/Boss2.ts` - Boss2 implementation
- `src/renderer/game/entities/offensive/BossArm.ts` - Boss1 arm component
- `src/renderer/game/entities/offensive/ThrownBrick.ts` - Boss projectile
- `src/renderer/game/core/Game.ts` - Boss activation and lifecycle
- `src/renderer/game/managers/CollisionManager.ts` - Boss collision detection
- `src/renderer/game/core/types.ts` - Boss brick types
- `src/renderer/config/constants.ts` - Boss constants
- `src/renderer/config/brickLayout.ts` - Boss brick pattern parsing
