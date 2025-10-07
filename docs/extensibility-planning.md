# Extensibility Planning: Brick Types & Upgrade System

**Status**: Planning Phase - DO NOT IMPLEMENT YET  
**Created**: 2025-10-08  
**Purpose**: Design architecture to support extensible brick types and upgrade systems for bat, ball, and back wall

---

## Executive Summary

This document outlines the architectural changes needed to make the Bricks game extensible for:
- **Multiple brick types** with different behaviors, health, and effects
- **Bat upgrades** for size, special abilities, and offensive capabilities
- **Ball upgrades** for physics modifications and special abilities
- **Back wall upgrades** for defensive and special effects

The goal is to create a flexible, maintainable system that allows easy addition of new features without major refactoring.

---

## Current Architecture Analysis

### Current Brick System
- **Location**: `src/renderer/game/Brick.ts`
- **Properties**: position, width, height, health, maxHealth, customColor
- **Behavior**: Simple health-based damage system, color changes with health
- **Limitations**: 
  - No behavior differentiation between bricks
  - No special effects on hit/destroy
  - No passive abilities
  - Single damage model (1 damage per hit)

### Current Bat System
- **Location**: `src/renderer/game/Bat.ts`
- **Properties**: position, width, height, speed, bounds
- **Behavior**: Movement (keyboard/mouse), collision detection
- **Limitations**:
  - Fixed size (can't be upgraded)
  - No special abilities
  - No offensive capabilities
  - Single behavior model

### Current Ball System
- **Location**: `src/renderer/game/Ball.ts`
- **Properties**: position, velocity, radius, speed, isGrey state
- **Behavior**: Movement, bouncing, grey state (passes through bat)
- **Limitations**:
  - Fixed size and speed
  - Single ball only
  - No special abilities
  - Limited state system

### Current Back Wall
- **Location**: Implicit in `Game.ts` collision detection
- **Behavior**: Triggers health loss, turns ball grey
- **Limitations**:
  - No entity representation
  - No upgradeable properties
  - No defensive abilities

---

## Proposed Architecture

### 1. Brick Type System

#### 1.1 Base Architecture

**Create a type-based brick system using composition over inheritance:**

```typescript
// src/renderer/game/types.ts

export enum BrickType {
  STANDARD = 'STANDARD',
  ARMORED = 'ARMORED',           // High health
  EXPLOSIVE = 'EXPLOSIVE',        // Damages nearby bricks
  REGENERATING = 'REGENERATING',  // Heals over time
  MOVING = 'MOVING',              // Moves in pattern
  TELEPORTING = 'TELEPORTING',    // Teleports when hit
  INDESTRUCTIBLE = 'INDESTRUCTIBLE', // Cannot be destroyed
  POWER_UP = 'POWER_UP',          // Drops power-up when destroyed
  MULTI_HIT = 'MULTI_HIT',        // Requires multiple hits in succession
  PHASING = 'PHASING',            // Ball passes through sometimes
  REFLECTIVE = 'REFLECTIVE',      // Reflects ball at unusual angles
}

export interface BrickBehavior {
  onHit(brick: Brick, ball: Ball, game: Game): void;
  onDestroy(brick: Brick, game: Game): void;
  update(brick: Brick, deltaTime: number): void;
  render(brick: Brick, ctx: CanvasRenderingContext2D): void;
  canBeDestroyed(): boolean;
}

export interface BrickTypeConfig {
  type: BrickType;
  health: number;
  color: string;
  scoreValue: number;
  behavior: BrickBehavior;
}
```

#### 1.2 Brick Behavior System

**Create behavior classes for each brick type:**

```typescript
// src/renderer/game/bricks/behaviors/StandardBehavior.ts
export class StandardBehavior implements BrickBehavior {
  onHit(brick: Brick, ball: Ball, game: Game): void {
    brick.takeDamage(1);
  }
  
  onDestroy(brick: Brick, game: Game): void {
    // Spawn particles
  }
  
  update(brick: Brick, deltaTime: number): void {
    // No special update logic
  }
  
  render(brick: Brick, ctx: CanvasRenderingContext2D): void {
    // Standard rendering
  }
  
  canBeDestroyed(): boolean {
    return true;
  }
}

// src/renderer/game/bricks/behaviors/ExplosiveBehavior.ts
export class ExplosiveBehavior implements BrickBehavior {
  private explosionRadius: number = 100;
  
  onHit(brick: Brick, ball: Ball, game: Game): void {
    brick.takeDamage(1);
  }
  
  onDestroy(brick: Brick, game: Game): void {
    // Damage all bricks within radius
    const nearbyBricks = game.getBricksInRadius(
      brick.getPosition(), 
      this.explosionRadius
    );
    nearbyBricks.forEach(b => b.takeDamage(1));
    // Spawn explosion particles
  }
  
  update(brick: Brick, deltaTime: number): void {}
  
  render(brick: Brick, ctx: CanvasRenderingContext2D): void {
    // Render with pulsing glow effect
  }
  
  canBeDestroyed(): boolean {
    return true;
  }
}
```

#### 1.3 Brick Class Refactoring

**Refactor Brick class to support behaviors:**

```typescript
// src/renderer/game/Brick.ts (refactored)
export class Brick {
  private position: Vector2D;
  private width: number;
  private height: number;
  private health: number;
  private maxHealth: number;
  private type: BrickType;
  private behavior: BrickBehavior;
  private customData: Map<string, any>; // For behavior-specific data
  
  constructor(config: BrickConfig) {
    this.position = { x: config.x, y: config.y };
    this.width = config.width;
    this.height = config.height;
    this.health = config.health;
    this.maxHealth = config.health;
    this.type = config.type || BrickType.STANDARD;
    this.behavior = BrickBehaviorFactory.create(this.type);
    this.customData = new Map();
  }
  
  // Delegate to behavior
  handleHit(ball: Ball, game: Game): void {
    this.behavior.onHit(this, ball, game);
  }
  
  handleDestroy(game: Game): void {
    this.behavior.onDestroy(this, game);
  }
  
  update(deltaTime: number): void {
    this.behavior.update(this, deltaTime);
  }
  
  render(ctx: CanvasRenderingContext2D): void {
    this.behavior.render(this, ctx);
  }
  
  canBeDestroyed(): boolean {
    return this.behavior.canBeDestroyed();
  }
  
  // Custom data for behaviors
  setData(key: string, value: any): void {
    this.customData.set(key, value);
  }
  
  getData(key: string): any {
    return this.customData.get(key);
  }
}
```

#### 1.4 Brick Factory

**Create factory for brick type instantiation:**

```typescript
// src/renderer/game/bricks/BrickBehaviorFactory.ts
export class BrickBehaviorFactory {
  private static behaviors = new Map<BrickType, () => BrickBehavior>([
    [BrickType.STANDARD, () => new StandardBehavior()],
    [BrickType.ARMORED, () => new ArmoredBehavior()],
    [BrickType.EXPLOSIVE, () => new ExplosiveBehavior()],
    [BrickType.REGENERATING, () => new RegeneratingBehavior()],
    [BrickType.MOVING, () => new MovingBehavior()],
    [BrickType.INDESTRUCTIBLE, () => new IndestructibleBehavior()],
    // ... more types
  ]);
  
  static create(type: BrickType): BrickBehavior {
    const factory = this.behaviors.get(type);
    if (!factory) {
      throw new Error(`Unknown brick type: ${type}`);
    }
    return factory();
  }
  
  static register(type: BrickType, factory: () => BrickBehavior): void {
    this.behaviors.set(type, factory);
  }
}
```

---

### 2. Bat Upgrade System

#### 2.1 Upgrade Architecture

**Create upgrade system using modifiers:**

```typescript
// src/renderer/game/types.ts

export enum BatUpgradeType {
  // Size modifications
  WIDTH_INCREASE = 'WIDTH_INCREASE',
  WIDTH_DECREASE = 'WIDTH_DECREASE',
  HEIGHT_INCREASE = 'HEIGHT_INCREASE',
  
  // Special abilities
  STICKY_BAT = 'STICKY_BAT',           // Catch and release ball
  SHIELD = 'SHIELD',                    // Protects from back wall hit
  MULTI_HIT = 'MULTI_HIT',              // Can hit ball multiple times
  
  // Offensive
  LASER = 'LASER',                      // Shoot lasers upward
  PROJECTILE = 'PROJECTILE',            // Shoot projectiles
  DESTROY_ON_CONTACT = 'DESTROY_ON_CONTACT', // Bat destroys bricks it touches
}

export interface BatUpgrade {
  type: BatUpgradeType;
  name: string;
  description: string;
  modifier: BatModifier;
}

export interface BatModifier {
  apply(bat: Bat, game: Game): void;
  remove(bat: Bat, game: Game): void;
  update(bat: Bat, deltaTime: number, game: Game): void;
}
```

#### 2.2 Bat Class Refactoring

**Refactor Bat to support upgrades:**

```typescript
// src/renderer/game/Bat.ts (refactored)
export class Bat {
  private position: Vector2D;
  private baseWidth: number;
  private baseHeight: number;
  private currentWidth: number;
  private currentHeight: number;
  private speed: number;
  private activeUpgrades: Map<BatUpgradeType, BatModifier>;
  private abilities: BatAbility[];
  
  constructor(x: number, y: number, width: number, height: number, speed: number) {
    this.position = { x, y };
    this.baseWidth = width;
    this.baseHeight = height;
    this.currentWidth = width;
    this.currentHeight = height;
    this.speed = speed;
    this.activeUpgrades = new Map();
    this.abilities = [];
  }
  
  applyUpgrade(upgrade: BatUpgrade, game: Game): void {
    if (this.activeUpgrades.has(upgrade.type)) {
      // Handle stacking or replacement
      this.removeUpgrade(upgrade.type, game);
    }
    upgrade.modifier.apply(this, game);
    this.activeUpgrades.set(upgrade.type, upgrade.modifier);
  }
  
  removeUpgrade(type: BatUpgradeType, game: Game): void {
    const modifier = this.activeUpgrades.get(type);
    if (modifier) {
      modifier.remove(this, game);
      this.activeUpgrades.delete(type);
    }
  }
  
  update(deltaTime: number, game: Game): void {
    // Update all active modifiers
    this.activeUpgrades.forEach(modifier => {
      modifier.update(this, deltaTime, game);
    });
    
    // Update abilities
    this.abilities.forEach(ability => {
      ability.update(deltaTime, game);
    });
  }
  
  addAbility(ability: BatAbility): void {
    this.abilities.push(ability);
  }
  
  removeAbility(ability: BatAbility): void {
    const index = this.abilities.indexOf(ability);
    if (index > -1) {
      this.abilities.splice(index, 1);
    }
  }
  
  // Modifiable properties
  setWidth(width: number): void {
    this.currentWidth = width;
  }
  
  setHeight(height: number): void {
    this.currentHeight = height;
  }
  
  getWidth(): number {
    return this.currentWidth;
  }
  
  getHeight(): number {
    return this.currentHeight;
  }
}
```

#### 2.3 Bat Modifier Examples

**Create modifier classes:**

```typescript
// src/renderer/game/bat/modifiers/WidthIncreaseModifier.ts
export class WidthIncreaseModifier implements BatModifier {
  private amount: number;
  
  constructor(amount: number = 20) {
    this.amount = amount;
  }
  
  apply(bat: Bat, game: Game): void {
    bat.setWidth(bat.getWidth() + this.amount);
  }
  
  remove(bat: Bat, game: Game): void {
    bat.setWidth(bat.getWidth() - this.amount);
  }
  
  update(bat: Bat, deltaTime: number, game: Game): void {
    // No update needed for static modifier
  }
}

// src/renderer/game/bat/modifiers/StickyBatModifier.ts
export class StickyBatModifier implements BatModifier {
  private caughtBall: Ball | null = null;
  
  apply(bat: Bat, game: Game): void {
    // Add sticky ability
    bat.addAbility(new StickyBatAbility(this));
  }
  
  remove(bat: Bat, game: Game): void {
    // Remove sticky ability
  }
  
  update(bat: Bat, deltaTime: number, game: Game): void {
    // Handle ball catching/releasing logic
  }
  
  catchBall(ball: Ball): void {
    this.caughtBall = ball;
    ball.setVelocity(0, 0);
  }
  
  releaseBall(): void {
    if (this.caughtBall) {
      this.caughtBall.launch(-90); // Launch upward
      this.caughtBall = null;
    }
  }
}
```

---

### 3. Ball Upgrade System

#### 3.1 Ball Upgrade Architecture

```typescript
// src/renderer/game/types.ts

export enum BallUpgradeType {
  // Physics
  SIZE_INCREASE = 'SIZE_INCREASE',
  SIZE_DECREASE = 'SIZE_DECREASE',
  SPEED_INCREASE = 'SPEED_INCREASE',
  SPEED_DECREASE = 'SPEED_DECREASE',
  HEAVY = 'HEAVY',                    // Breaks through multiple bricks
  LIGHT = 'LIGHT',                    // More bouncy
  
  // Special abilities
  MULTI_BALL = 'MULTI_BALL',          // Split into multiple balls
  PIERCING = 'PIERCING',              // Goes through bricks
  HOMING = 'HOMING',                  // Targets bricks
  EXPLOSIVE = 'EXPLOSIVE',            // Damages area on brick hit
}

export interface BallUpgrade {
  type: BallUpgradeType;
  name: string;
  description: string;
  modifier: BallModifier;
}

export interface BallModifier {
  apply(ball: Ball, game: Game): void;
  remove(ball: Ball, game: Game): void;
  update(ball: Ball, deltaTime: number, game: Game): void;
  onBrickHit(ball: Ball, brick: Brick, game: Game): void;
}
```

#### 3.2 Ball Class Refactoring

```typescript
// src/renderer/game/Ball.ts (refactored)
export class Ball {
  private position: Vector2D;
  private velocity: Vector2D;
  private baseRadius: number;
  private currentRadius: number;
  private baseSpeed: number;
  private currentSpeed: number;
  private isGrey: boolean;
  private activeUpgrades: Map<BallUpgradeType, BallModifier>;
  private properties: Map<string, any>; // For modifier-specific properties
  
  constructor(x: number, y: number, radius: number, speed: number) {
    this.position = { x, y };
    this.velocity = { x: 0, y: 0 };
    this.baseRadius = radius;
    this.currentRadius = radius;
    this.baseSpeed = speed;
    this.currentSpeed = speed;
    this.isGrey = false;
    this.activeUpgrades = new Map();
    this.properties = new Map();
  }
  
  applyUpgrade(upgrade: BallUpgrade, game: Game): void {
    if (this.activeUpgrades.has(upgrade.type)) {
      this.removeUpgrade(upgrade.type, game);
    }
    upgrade.modifier.apply(this, game);
    this.activeUpgrades.set(upgrade.type, upgrade.modifier);
  }
  
  removeUpgrade(type: BallUpgradeType, game: Game): void {
    const modifier = this.activeUpgrades.get(type);
    if (modifier) {
      modifier.remove(this, game);
      this.activeUpgrades.delete(type);
    }
  }
  
  update(deltaTime: number, game: Game): void {
    // Update position
    this.position.x += this.velocity.x * deltaTime;
    this.position.y += this.velocity.y * deltaTime;
    
    // Update all active modifiers
    this.activeUpgrades.forEach(modifier => {
      modifier.update(this, deltaTime, game);
    });
  }
  
  handleBrickHit(brick: Brick, game: Game): void {
    // Notify all modifiers of brick hit
    this.activeUpgrades.forEach(modifier => {
      modifier.onBrickHit(this, brick, game);
    });
  }
  
  // Modifiable properties
  setRadius(radius: number): void {
    this.currentRadius = radius;
  }
  
  setSpeed(speed: number): void {
    this.currentSpeed = speed;
  }
  
  getRadius(): number {
    return this.currentRadius;
  }
  
  getSpeed(): number {
    return this.currentSpeed;
  }
  
  setProperty(key: string, value: any): void {
    this.properties.set(key, value);
  }
  
  getProperty(key: string): any {
    return this.properties.get(key);
  }
}
```

#### 3.3 Ball Modifier Examples

```typescript
// src/renderer/game/ball/modifiers/PiercingModifier.ts
export class PiercingModifier implements BallModifier {
  private maxPierceCount: number;
  
  constructor(maxPierceCount: number = 3) {
    this.maxPierceCount = maxPierceCount;
  }
  
  apply(ball: Ball, game: Game): void {
    ball.setProperty('piercing', true);
    ball.setProperty('pierceCount', this.maxPierceCount);
  }
  
  remove(ball: Ball, game: Game): void {
    ball.setProperty('piercing', false);
  }
  
  update(ball: Ball, deltaTime: number, game: Game): void {
    // No update needed
  }
  
  onBrickHit(ball: Ball, brick: Brick, game: Game): void {
    const pierceCount = ball.getProperty('pierceCount') || 0;
    if (pierceCount > 0) {
      // Don't bounce, just damage brick and continue
      brick.takeDamage(1);
      ball.setProperty('pierceCount', pierceCount - 1);
    }
  }
}

// src/renderer/game/ball/modifiers/HomingModifier.ts
export class HomingModifier implements BallModifier {
  private homingStrength: number;
  
  constructor(homingStrength: number = 50) {
    this.homingStrength = homingStrength;
  }
  
  apply(ball: Ball, game: Game): void {
    ball.setProperty('homing', true);
  }
  
  remove(ball: Ball, game: Game): void {
    ball.setProperty('homing', false);
  }
  
  update(ball: Ball, deltaTime: number, game: Game): void {
    if (!ball.getProperty('homing')) return;
    
    // Find nearest brick
    const nearestBrick = game.findNearestBrick(ball.getPosition());
    if (!nearestBrick) return;
    
    // Apply force toward brick
    const ballPos = ball.getPosition();
    const brickPos = nearestBrick.getPosition();
    const direction = {
      x: brickPos.x - ballPos.x,
      y: brickPos.y - ballPos.y
    };
    const normalized = normalize(direction);
    
    // Adjust velocity slightly toward brick
    const velocity = ball.getVelocity();
    velocity.x += normalized.x * this.homingStrength * deltaTime;
    velocity.y += normalized.y * this.homingStrength * deltaTime;
    ball.setVelocity(velocity.x, velocity.y);
  }
  
  onBrickHit(ball: Ball, brick: Brick, game: Game): void {
    // Standard behavior
  }
}
```

---

### 4. Back Wall System

#### 4.1 Back Wall Entity Creation

**Create a new BackWall entity:**

```typescript
// src/renderer/game/BackWall.ts
export class BackWall {
  private position: Vector2D;
  private width: number;
  private height: number;
  private activeUpgrades: Map<BackWallUpgradeType, BackWallModifier>;
  private abilities: BackWallAbility[];
  
  constructor(x: number, y: number, width: number, height: number) {
    this.position = { x, y };
    this.width = width;
    this.height = height;
    this.activeUpgrades = new Map();
    this.abilities = [];
  }
  
  applyUpgrade(upgrade: BackWallUpgrade, game: Game): void {
    if (this.activeUpgrades.has(upgrade.type)) {
      this.removeUpgrade(upgrade.type, game);
    }
    upgrade.modifier.apply(this, game);
    this.activeUpgrades.set(upgrade.type, upgrade.modifier);
  }
  
  removeUpgrade(type: BackWallUpgradeType, game: Game): void {
    const modifier = this.activeUpgrades.get(type);
    if (modifier) {
      modifier.remove(this, game);
      this.activeUpgrades.delete(type);
    }
  }
  
  update(deltaTime: number, game: Game): void {
    this.activeUpgrades.forEach(modifier => {
      modifier.update(this, deltaTime, game);
    });
    
    this.abilities.forEach(ability => {
      ability.update(deltaTime, game);
    });
  }
  
  render(ctx: CanvasRenderingContext2D): void {
    // Render back wall (usually invisible or subtle)
    this.activeUpgrades.forEach(modifier => {
      modifier.render(this, ctx);
    });
  }
  
  handleBallContact(ball: Ball, game: Game): boolean {
    // Returns true if health should be lost
    let shouldLoseHealth = true;
    
    this.activeUpgrades.forEach(modifier => {
      const result = modifier.onBallContact(ball, this, game);
      if (!result) {
        shouldLoseHealth = false;
      }
    });
    
    return shouldLoseHealth;
  }
  
  addAbility(ability: BackWallAbility): void {
    this.abilities.push(ability);
  }
  
  getBounds(): Rectangle {
    return {
      x: this.position.x,
      y: this.position.y,
      width: this.width,
      height: this.height
    };
  }
}
```

#### 4.2 Back Wall Upgrade Types

```typescript
// src/renderer/game/types.ts

export enum BackWallUpgradeType {
  // Defensive
  BUMPER = 'BUMPER',                  // Bounces ball back with force
  SHIELD = 'SHIELD',                  // Temporary shield (limited uses)
  SPRING = 'SPRING',                  // Launches ball upward
  CUSHION = 'CUSHION',                // Soft bounce, no health loss
  
  // Special effects
  SLOW_ZONE = 'SLOW_ZONE',            // Slows ball on contact
  DIRECTION_CHANGER = 'DIRECTION_CHANGER', // Changes ball direction
  PLATFORM_GENERATOR = 'PLATFORM_GENERATOR', // Creates temporary platforms
}

export interface BackWallUpgrade {
  type: BackWallUpgradeType;
  name: string;
  description: string;
  modifier: BackWallModifier;
}

export interface BackWallModifier {
  apply(wall: BackWall, game: Game): void;
  remove(wall: BackWall, game: Game): void;
  update(wall: BackWall, deltaTime: number, game: Game): void;
  render(wall: BackWall, ctx: CanvasRenderingContext2D): void;
  onBallContact(ball: Ball, wall: BackWall, game: Game): boolean; // Returns true if health should be lost
}
```

#### 4.3 Back Wall Modifier Examples

```typescript
// src/renderer/game/backwall/modifiers/BumperModifier.ts
export class BumperModifier implements BackWallModifier {
  private bounceForce: number;
  
  constructor(bounceForce: number = 1.5) {
    this.bounceForce = bounceForce;
  }
  
  apply(wall: BackWall, game: Game): void {
    // Enable bumper
  }
  
  remove(wall: BackWall, game: Game): void {
    // Disable bumper
  }
  
  update(wall: BackWall, deltaTime: number, game: Game): void {
    // No update needed
  }
  
  render(wall: BackWall, ctx: CanvasRenderingContext2D): void {
    // Draw bumper visual effect
    const bounds = wall.getBounds();
    ctx.save();
    ctx.strokeStyle = '#00ffff';
    ctx.lineWidth = 3;
    ctx.shadowBlur = 15;
    ctx.shadowColor = '#00ffff';
    ctx.strokeRect(bounds.x, bounds.y, bounds.width, bounds.height);
    ctx.restore();
  }
  
  onBallContact(ball: Ball, wall: BackWall, game: Game): boolean {
    // Bounce ball back with extra force
    const velocity = ball.getVelocity();
    ball.setVelocity(velocity.x, -Math.abs(velocity.y) * this.bounceForce);
    return false; // Don't lose health
  }
}

// src/renderer/game/backwall/modifiers/ShieldModifier.ts
export class ShieldModifier implements BackWallModifier {
  private maxUses: number;
  private currentUses: number;
  
  constructor(maxUses: number = 3) {
    this.maxUses = maxUses;
    this.currentUses = maxUses;
  }
  
  apply(wall: BackWall, game: Game): void {
    this.currentUses = this.maxUses;
  }
  
  remove(wall: BackWall, game: Game): void {
    // Remove shield
  }
  
  update(wall: BackWall, deltaTime: number, game: Game): void {
    // No update needed
  }
  
  render(wall: BackWall, ctx: CanvasRenderingContext2D): void {
    if (this.currentUses <= 0) return;
    
    // Draw shield with remaining uses
    const bounds = wall.getBounds();
    ctx.save();
    ctx.fillStyle = `rgba(0, 255, 255, ${0.1 * this.currentUses})`;
    ctx.fillRect(bounds.x, bounds.y, bounds.width, bounds.height);
    
    // Draw use indicators
    const useWidth = bounds.width / this.maxUses;
    for (let i = 0; i < this.currentUses; i++) {
      ctx.fillStyle = '#00ffff';
      ctx.fillRect(bounds.x + (i * useWidth), bounds.y, useWidth - 2, 5);
    }
    ctx.restore();
  }
  
  onBallContact(ball: Ball, wall: BackWall, game: Game): boolean {
    if (this.currentUses > 0) {
      this.currentUses--;
      ball.reverseY();
      return false; // Don't lose health
    }
    return true; // Shield depleted, lose health
  }
}
```

---

### 5. Game Class Integration

#### 5.1 Game Class Refactoring

**Update Game class to support new systems:**

```typescript
// src/renderer/game/Game.ts (additions)
export class Game {
  // ... existing properties
  private backWall: BackWall;
  private balls: Ball[]; // Support multiple balls
  private projectiles: Projectile[]; // For bat/ball projectiles
  private temporaryPlatforms: Platform[]; // For back wall platforms
  
  constructor(canvas: HTMLCanvasElement) {
    // ... existing initialization
    
    // Initialize back wall
    this.backWall = new BackWall(
      0,
      this.canvas.height - 10,
      this.canvas.width,
      10
    );
    
    // Support multiple balls
    this.balls = [this.ball];
  }
  
  // Helper methods for modifiers
  getBricksInRadius(position: Vector2D, radius: number): Brick[] {
    return this.level.getActiveBricks().filter(brick => {
      const brickPos = brick.getPosition();
      const dist = distance(position, brickPos);
      return dist <= radius;
    });
  }
  
  findNearestBrick(position: Vector2D): Brick | null {
    const bricks = this.level.getActiveBricks();
    if (bricks.length === 0) return null;
    
    let nearest = bricks[0];
    let minDist = distance(position, nearest.getPosition());
    
    for (let i = 1; i < bricks.length; i++) {
      const dist = distance(position, bricks[i].getPosition());
      if (dist < minDist) {
        minDist = dist;
        nearest = bricks[i];
      }
    }
    
    return nearest;
  }
  
  addBall(ball: Ball): void {
    this.balls.push(ball);
  }
  
  removeBall(ball: Ball): void {
    const index = this.balls.indexOf(ball);
    if (index > -1) {
      this.balls.splice(index, 1);
    }
  }
  
  addProjectile(projectile: Projectile): void {
    this.projectiles.push(projectile);
  }
  
  addTemporaryPlatform(platform: Platform): void {
    this.temporaryPlatforms.push(platform);
  }
  
  update(deltaTime: number): void {
    // ... existing update logic
    
    // Update back wall
    this.backWall.update(deltaTime, this);
    
    // Update all balls
    this.balls.forEach(ball => ball.update(deltaTime, this));
    
    // Update projectiles
    this.projectiles.forEach(p => p.update(deltaTime));
    this.projectiles = this.projectiles.filter(p => !p.isExpired());
    
    // Update temporary platforms
    this.temporaryPlatforms.forEach(p => p.update(deltaTime));
    this.temporaryPlatforms = this.temporaryPlatforms.filter(p => !p.isExpired());
  }
  
  checkCollisions(): void {
    // ... existing collision logic
    
    // Check back wall collisions with upgrade support
    this.balls.forEach(ball => {
      const ballBounds = ball.getBounds();
      if (ballBounds.y + ballBounds.radius >= this.backWall.getBounds().y) {
        const shouldLoseHealth = this.backWall.handleBallContact(ball, this);
        if (shouldLoseHealth) {
          this.playerHealth--;
          ball.setGrey(true);
        }
      }
    });
  }
}
```

---

### 6. Upgrade Delivery System

#### 6.1 Power-Up Drops

**Create power-up entities that drop from bricks:**

```typescript
// src/renderer/game/PowerUp.ts
export enum PowerUpType {
  BAT_UPGRADE,
  BALL_UPGRADE,
  BACK_WALL_UPGRADE,
  HEALTH,
}

export class PowerUp {
  private position: Vector2D;
  private velocity: Vector2D;
  private type: PowerUpType;
  private upgrade: BatUpgrade | BallUpgrade | BackWallUpgrade | null;
  private width: number = 30;
  private height: number = 30;
  private collected: boolean = false;
  
  constructor(x: number, y: number, type: PowerUpType, upgrade?: any) {
    this.position = { x, y };
    this.velocity = { x: 0, y: 100 }; // Falls downward
    this.type = type;
    this.upgrade = upgrade || null;
  }
  
  update(deltaTime: number): void {
    this.position.y += this.velocity.y * deltaTime;
  }
  
  render(ctx: CanvasRenderingContext2D): void {
    ctx.save();
    ctx.fillStyle = this.getColor();
    ctx.shadowBlur = 10;
    ctx.shadowColor = this.getColor();
    ctx.fillRect(this.position.x, this.position.y, this.width, this.height);
    ctx.restore();
  }
  
  checkBatCollision(bat: Bat): boolean {
    const batBounds = bat.getBounds();
    return checkRectCollision(
      { x: this.position.x, y: this.position.y, width: this.width, height: this.height },
      batBounds
    );
  }
  
  collect(game: Game): void {
    this.collected = true;
    
    switch (this.type) {
      case PowerUpType.BAT_UPGRADE:
        if (this.upgrade) game.getBat().applyUpgrade(this.upgrade as BatUpgrade, game);
        break;
      case PowerUpType.BALL_UPGRADE:
        if (this.upgrade) game.getBall().applyUpgrade(this.upgrade as BallUpgrade, game);
        break;
      case PowerUpType.BACK_WALL_UPGRADE:
        if (this.upgrade) game.getBackWall().applyUpgrade(this.upgrade as BackWallUpgrade, game);
        break;
      case PowerUpType.HEALTH:
        game.addHealth(1);
        break;
    }
  }
  
  isCollected(): boolean {
    return this.collected;
  }
  
  isOffScreen(maxY: number): boolean {
    return this.position.y > maxY;
  }
  
  private getColor(): string {
    switch (this.type) {
      case PowerUpType.BAT_UPGRADE: return '#ff00ff';
      case PowerUpType.BALL_UPGRADE: return '#00ffff';
      case PowerUpType.BACK_WALL_UPGRADE: return '#ffff00';
      case PowerUpType.HEALTH: return '#00ff00';
      default: return '#ffffff';
    }
  }
}
```

#### 6.2 Level-Based Upgrade Selection

**Keep existing upgrade screen for level transitions:**

```typescript
// src/renderer/ui/UpgradeScreen.ts (future implementation)
export class UpgradeScreen {
  private upgrades: (BatUpgrade | BallUpgrade | BackWallUpgrade)[];
  
  constructor() {
    this.upgrades = [];
  }
  
  generateUpgradeOptions(): void {
    // Generate 3 random upgrades from available pool
    this.upgrades = [
      this.getRandomBatUpgrade(),
      this.getRandomBallUpgrade(),
      this.getRandomBackWallUpgrade(),
    ];
  }
  
  // ... rendering and selection logic
}
```

---

### 7. Configuration System Updates

#### 7.1 Level Configuration

**Update level config to support brick types:**

```typescript
// src/renderer/game/types.ts (updated)
export interface BrickConfig {
  x: number;
  y: number;
  width: number;
  height: number;
  health: number;
  type?: BrickType;        // NEW
  color?: string;
  behaviorConfig?: any;    // NEW: Type-specific configuration
}

export interface LevelConfig {
  id: number;
  name: string;
  bricks: BrickConfig[];
  playerHealth: number;
  allowedUpgrades?: UpgradeType[];  // NEW: Limit upgrades per level
  difficulty?: number;               // NEW: Difficulty multiplier
}
```

#### 7.2 Level Creation Helpers

**Update level creation to support brick types:**

```typescript
// src/renderer/config/levels.ts (additions)
export function createMixedBricks(
  pattern: string,
  startX: number,
  startY: number,
  brickWidth: number,
  brickHeight: number,
  typeMap: Map<string, BrickType>
): BrickConfig[] {
  const bricks: BrickConfig[] = [];
  const lines = pattern.split('\n');
  
  for (let row = 0; row < lines.length; row++) {
    for (let col = 0; col < lines[row].length; col++) {
      const char = lines[row][col];
      if (char === ' ') continue;
      
      const type = typeMap.get(char) || BrickType.STANDARD;
      const health = getBrickHealthForType(type);
      
      bricks.push({
        x: startX + (col * (brickWidth + 2)),
        y: startY + (row * (brickHeight + 2)),
        width: brickWidth,
        height: brickHeight,
        health,
        type,
      });
    }
  }
  
  return bricks;
}

function getBrickHealthForType(type: BrickType): number {
  switch (type) {
    case BrickType.ARMORED: return 5;
    case BrickType.INDESTRUCTIBLE: return 999999;
    case BrickType.STANDARD: return 1;
    default: return 1;
  }
}
```

---

## Implementation Phases

### Phase 1: Foundation (Refactoring)
**Goal**: Refactor existing classes to support extensibility without breaking current functionality

1. **Update type definitions** (`types.ts`)
   - Add new enums and interfaces
   - Keep backward compatibility

2. **Refactor Brick class**
   - Add behavior system
   - Maintain existing tests
   - Add type property

3. **Refactor Ball class**
   - Add upgrade system
   - Add property map
   - Support multiple balls array in Game

4. **Refactor Bat class**
   - Add upgrade system
   - Add modifiable width/height
   - Add abilities array

5. **Create BackWall entity**
   - New class with upgrade support
   - Integrate into Game class
   - Update collision detection

6. **Update Game class**
   - Add helper methods for modifiers
   - Support multiple balls
   - Add projectile/platform arrays
   - Integrate BackWall

**Acceptance Criteria**:
- All existing tests pass
- Game plays identically to before
- New systems in place but not yet used
- Code coverage maintained

---

### Phase 2: Brick Behaviors
**Goal**: Implement brick type system with 3-5 example types

1. **Create behavior infrastructure**
   - `BrickBehavior` interface
   - `BrickBehaviorFactory`
   - Base behavior classes

2. **Implement brick types**
   - StandardBehavior (existing functionality)
   - ArmoredBehavior (high health)
   - ExplosiveBehavior (area damage)
   - IndestructibleBehavior (can't be destroyed)
   - PowerUpBehavior (drops power-up)

3. **Update level configuration**
   - Add brick type support
   - Create example levels with mixed types

4. **Write tests**
   - Unit tests for each behavior
   - Integration tests for brick interactions

**Acceptance Criteria**:
- 5 brick types working
- Level can mix brick types
- All behaviors tested
- Visual differentiation between types

---

### Phase 3: Bat Upgrades
**Goal**: Implement bat upgrade system with 3-5 example upgrades

1. **Create upgrade infrastructure**
   - `BatModifier` interface
   - Upgrade application/removal system

2. **Implement upgrades**
   - WidthIncreaseModifier
   - StickyBatModifier
   - ShieldModifier
   - LaserModifier
   - ProjectileModifier

3. **Create Projectile system**
   - Projectile entity
   - Collision with bricks
   - Rendering

4. **Write tests**
   - Unit tests for each modifier
   - Integration tests for upgrade stacking

**Acceptance Criteria**:
- 5 bat upgrades working
- Upgrades can be applied/removed
- Projectiles work correctly
- All upgrades tested

---

### Phase 4: Ball Upgrades
**Goal**: Implement ball upgrade system with 3-5 example upgrades

1. **Create upgrade infrastructure**
   - `BallModifier` interface
   - Upgrade application/removal system

2. **Implement upgrades**
   - SizeModifier
   - SpeedModifier
   - PiercingModifier
   - HomingModifier
   - MultiBallModifier

3. **Multi-ball system**
   - Ball spawning
   - Independent ball updates
   - Ball removal when off-screen

4. **Write tests**
   - Unit tests for each modifier
   - Integration tests for multi-ball

**Acceptance Criteria**:
- 5 ball upgrades working
- Multi-ball system functional
- Homing behavior works
- All upgrades tested

---

### Phase 5: Back Wall Upgrades
**Goal**: Implement back wall upgrade system with 3-5 example upgrades

1. **Create upgrade infrastructure**
   - `BackWallModifier` interface
   - Upgrade application/removal system

2. **Implement upgrades**
   - BumperModifier
   - ShieldModifier
   - SpringModifier
   - SlowZoneModifier
   - PlatformGeneratorModifier

3. **Platform system**
   - Temporary platform entity
   - Ball collision with platforms
   - Platform expiration

4. **Write tests**
   - Unit tests for each modifier
   - Integration tests for back wall interactions

**Acceptance Criteria**:
- 5 back wall upgrades working
- Platforms work correctly
- Shield uses tracked properly
- All upgrades tested

---

### Phase 6: Power-Up System
**Goal**: Implement power-up drops from bricks

1. **Create PowerUp entity**
   - Falling animation
   - Bat collision detection
   - Collection logic

2. **Integrate with brick behaviors**
   - PowerUpBehavior spawns power-ups
   - Random upgrade selection

3. **Update Game class**
   - Track active power-ups
   - Update/render power-ups
   - Remove collected/off-screen power-ups

4. **Write tests**
   - Unit tests for PowerUp
   - Integration tests for collection

**Acceptance Criteria**:
- Power-ups drop from special bricks
- Bat can collect power-ups
- Upgrades applied on collection
- Visual feedback on collection

---

### Phase 7: Upgrade Selection UI
**Goal**: Implement upgrade selection screen between levels

1. **Create UpgradeScreen UI**
   - Display 3 upgrade options
   - Show descriptions
   - Handle selection

2. **Upgrade pool system**
   - Define available upgrades
   - Random selection
   - Prevent duplicates (optional)

3. **Integrate with game flow**
   - Show after level complete
   - Apply selected upgrade
   - Continue to next level

4. **Write tests**
   - UI interaction tests
   - Upgrade application tests

**Acceptance Criteria**:
- Upgrade screen shows after level
- 3 options displayed
- Selection applies upgrade
- Upgrades persist across levels

---

### Phase 8: Advanced Brick Types
**Goal**: Implement more complex brick behaviors

1. **MovingBehavior**
   - Brick moves in pattern
   - Collision detection updates

2. **RegeneratingBehavior**
   - Brick heals over time
   - Visual feedback

3. **TeleportingBehavior**
   - Brick teleports when hit
   - Random position selection

4. **PhasingBehavior**
   - Ball sometimes passes through
   - Visual transparency effect

**Acceptance Criteria**:
- 4 advanced brick types working
- Smooth animations
- Proper collision handling
- All behaviors tested

---

### Phase 9: Polish & Balance
**Goal**: Polish systems and balance gameplay

1. **Visual effects**
   - Upgrade application effects
   - Power-up collection effects
   - Brick type visual differentiation

2. **Balance testing**
   - Adjust upgrade values
   - Test difficulty progression
   - Ensure fun gameplay

3. **Performance optimization**
   - Profile modifier updates
   - Optimize rendering
   - Reduce memory allocations

4. **Documentation**
   - Document all upgrade types
   - Create upgrade guide
   - Update architecture docs

**Acceptance Criteria**:
- Game feels balanced
- Visual feedback clear
- Performance maintained
- Documentation complete

---

## Testing Strategy

### Unit Tests
- Each behavior class
- Each modifier class
- Factory classes
- PowerUp entity
- BackWall entity

### Integration Tests
- Brick type interactions
- Upgrade stacking
- Multi-ball with upgrades
- Power-up collection flow
- Back wall with upgrades

### Manual Testing
- Play through levels with different upgrade combinations
- Test edge cases (all upgrades, no upgrades)
- Performance testing with many entities
- Visual verification of effects

---

## Key Design Principles

### 1. Composition Over Inheritance
- Use behavior objects instead of subclassing
- Allows runtime behavior changes
- Easier to test and maintain

### 2. Open/Closed Principle
- Open for extension (new behaviors/modifiers)
- Closed for modification (core classes stable)
- New features don't break existing code

### 3. Single Responsibility
- Each behavior handles one brick type
- Each modifier handles one upgrade
- Clear separation of concerns

### 4. Dependency Injection
- Behaviors/modifiers receive dependencies
- Easier to test in isolation
- Flexible configuration

### 5. Data-Driven Design
- Level configs specify brick types
- Upgrade pools defined in data
- Easy to balance without code changes

---

## Potential Challenges & Solutions

### Challenge 1: Performance with Many Modifiers
**Solution**: 
- Use object pooling for frequently created objects
- Batch similar operations
- Profile and optimize hot paths

### Challenge 2: Upgrade Stacking Complexity
**Solution**:
- Define clear stacking rules per upgrade type
- Some upgrades replace, others stack
- Document behavior clearly

### Challenge 3: Save/Load with Upgrades
**Solution**:
- Serialize active upgrades
- Store upgrade state in save data
- Reapply on load

### Challenge 4: Testing Complexity
**Solution**:
- Mock Game class for unit tests
- Use test helpers for common setups
- Focus on behavior contracts

### Challenge 5: Visual Clarity
**Solution**:
- Distinct colors/effects per brick type
- Clear upgrade indicators
- Particle effects for feedback

---

## Future Enhancements

### Beyond Initial Implementation
1. **Upgrade Tiers**: Common, Rare, Epic upgrades
2. **Negative Upgrades**: Risk/reward mechanics
3. **Combo System**: Synergies between upgrades
4. **Upgrade Removal**: Ability to remove unwanted upgrades
5. **Upgrade Shop**: Spend points on specific upgrades
6. **Custom Brick Editor**: Create custom brick types
7. **Modifier Scripting**: Lua/JS scripting for behaviors
8. **Network Play**: Share custom levels/brick types

---

## Summary

This extensibility system provides:
- ✅ **Flexible brick types** via behavior composition
- ✅ **Comprehensive upgrade systems** for bat, ball, and back wall
- ✅ **Multiple delivery mechanisms** (level selection + power-up drops)
- ✅ **Maintainable architecture** following SOLID principles
- ✅ **Extensive testing** at all levels
- ✅ **Clear implementation path** with 9 phases
- ✅ **Future-proof design** for additional features

The system is designed to be built incrementally, with each phase adding value while maintaining stability. All existing functionality is preserved through careful refactoring and comprehensive testing.

**Next Steps**: Review this plan, ask questions, then begin Phase 1 (Foundation) when ready.
