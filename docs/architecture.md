# Architecture Guide

> **Purpose**: Enable developers to quickly understand and extend the codebase

## Tech Stack

- **Electron** (Node.js + Chromium) - Desktop app framework
- **TypeScript** - Type-safe development
- **Canvas API** - 2D rendering
- **Jest** - Testing (658 tests)

## Core Principles

1. **Modular Design** - Each manager handles one concern
2. **Centralized Config** - All constants in `config/constants.ts`
3. **Manager Pattern** - Coordinators in `game/managers/`
4. **Entity-Component** - Game objects in `game/entities/`
5. **No DOM Testing** - Test logic, not rendering

## Adding New Features

### 🎮 New Game Mechanic

**Example: Add a shield power-up**

1. **Define constant** in `src/renderer/config/constants.ts`:
   ```typescript
   export const SHIELD_DURATION = 5; // seconds
   export const SHIELD_COLOR = '#00ffff';
   ```

2. **Add to Bat entity** in `src/renderer/game/entities/Bat.ts`:
   ```typescript
   private shieldActive: boolean = false;
   private shieldTimer: number = 0;
   
   activateShield(): void {
     this.shieldActive = true;
     this.shieldTimer = SHIELD_DURATION;
   }
   ```

3. **Update in game loop** in `src/renderer/game/core/Game.ts`:
   ```typescript
   // In update() method
   this.bat.updateShield(deltaTime);
   ```

4. **Add collision logic** in `src/renderer/game/managers/CollisionManager.ts`:
   ```typescript
   if (this.bat.hasShield()) {
     return; // Ignore collision
   }
   ```

5. **Write tests** in `tests/unit/Bat.test.ts`:
   ```typescript
   it('should activate shield', () => {
     bat.activateShield();
     expect(bat.hasShield()).toBe(true);
   });
   ```

### 📊 New Level

**File**: `src/renderer/config/levels.ts`

```typescript
{
  id: 10,
  name: 'Level 10: BOSS',
  bricks: createBricksFromWord('BOSS', 5, 3),
  baseHealth: 10, // Brick health multiplier
}
```

**Brick layout helpers**:
- `createBricksFromWord(word, startCol, startRow)` - Spell out words
- `createBricksFromPattern(pattern)` - Custom 2D array patterns

### 💪 New Upgrade

**File**: `src/renderer/config/upgrades.ts`

```typescript
{
  name: t('game.upgrades.triple_shot.name'),
  description: t('game.upgrades.triple_shot.description'),
  type: UpgradeType.TRIPLE_SHOT,
  times: 1,
  nextUpgrades: [],
  previewNextUpgrades: 0,
  unlockNextUpgradesAfterTimes: 1,
}
```

**Then implement in**:
1. Add `TRIPLE_SHOT` to `UpgradeType` enum in `game/core/types.ts`
2. Handle in `game/systems/GameUpgrades.ts`
3. Apply in `game/managers/WeaponManager.ts`

### 🌍 New Translation

**Files**: `src/renderer/i18n/*.json`

```json
{
  "game": {
    "upgrades": {
      "triple_shot": {
        "name": "Triple Shot",
        "description": "Fire 3 lasers at once"
      }
    }
  }
}
```

**Usage**: `t('game.upgrades.triple_shot.name')`

### 🎨 New Visual Effect

**File**: `src/renderer/game/managers/EffectsManager.ts`

```typescript
// Add particle effect
this.effectsManager.createParticles(
  x, y,           // Position
  20,             // Count
  '#ff00ff',      // Color
  300             // Lifetime (ms)
);

// Add screen shake
this.effectsManager.triggerScreenShake(
  5,              // Intensity (pixels)
  0.3             // Duration (seconds)
);
```

## Manager Responsibilities

### 🎮 Game.ts (Core Orchestrator)
- **Game loop** - 60 FPS fixed timestep
- **State management** - INTRO → PLAYING → LEVEL_COMPLETE → UPGRADE
- **Entity coordination** - Updates all managers and entities
- **Entry point** for most game logic changes

### 🔊 AudioManager
- Background music playback
- Sound effects (brick hit, explosion, etc.)
- Volume control (music/SFX separate)

### ⌨️ InputManager
- Keyboard (WASD, arrows, space, ESC)
- Mouse (movement, click)
- Callbacks for game actions

### 💥 CollisionManager
- Ball-bat collision (angle-based bounce)
- Ball-brick collision (damage, piercing, critical hits)
- Laser-brick collision
- Offensive entity-bat collision

### 🖥️ ScreenManager
- UI screen routing (intro, pause, game over, etc.)
- Screen transitions
- Delegates rendering to appropriate screen

### ✨ EffectsManager
- Particle system
- Screen shake
- Damage numbers
- Slow-motion effects
- Background images

### 🎯 StateTransitionHandler
- Handles all state changes (start game, restart, level complete, etc.)
- Applies upgrades
- Manages dev mode

### ⚔️ OffensiveEntityManager
- Manages enemy projectiles (falling bricks, debris, lasers)
- Spawns based on brick type
- Updates and renders all offensive entities

### ⏱️ SlowMotionManager
- Triggers slow-motion on final brick
- Ray-tracing prediction
- Time dilation calculations

## Key Interfaces

### BrickType Enum
```typescript
enum BrickType {
  NORMAL,                    // 1x health
  HEALTHY,                   // 3x health
  INDESTRUCTIBLE,            // ∞ health
  OFFENSIVE_FALLING,         // Drops when destroyed
  OFFENSIVE_EXPLODING,       // Explodes into debris
  OFFENSIVE_LASER,           // Shoots laser at bat
}
```

### GameState Enum
```typescript
enum GameState {
  INTRO,           // Start screen
  PLAYING,         // Active gameplay
  PAUSED,          // Paused
  LEVEL_COMPLETE,  // Show upgrade screen
  UPGRADE,         // Upgrade tree
  GAME_OVER,       // Game over screen
  OPTIONS,         // Settings
}
```

## Testing

### Writing Tests

**Location**: `tests/unit/` or `tests/integration/`

```typescript
import { Ball } from '../../src/renderer/game/entities/Ball';

describe('Ball', () => {
  it('should move based on velocity', () => {
    const ball = new Ball(100, 100, 10, 600);
    ball.setVelocity(100, 0);
    ball.update(0.1);
    
    const pos = ball.getPosition();
    expect(pos.x).toBeGreaterThan(100);
  });
});
```

**Guidelines**:
- ✅ Test logic and state changes
- ❌ Avoid testing DOM/rendering (per methodology)
- ✅ Test entities, managers, and systems
- ✅ Use descriptive test names

**Run tests**: `npm test` or `npm run test:watch`

## Common Patterns

### Adding a Manager

1. Create in `src/renderer/game/managers/YourManager.ts`
2. Initialize in `Game.ts` constructor
3. Call `update()` and `render()` in game loop
4. Write tests in `tests/unit/YourManager.test.ts`

### Accessing Game State

```typescript
// In Game.ts
this.gameState = GameState.PLAYING;

// In managers (via callbacks)
this.screenManager.render(this.gameState, ...);
```

### Using Constants

```typescript
// Define in config/constants.ts
export const NEW_FEATURE_SPEED = 500;

// Import where needed
import { NEW_FEATURE_SPEED } from '../../config/constants';
```

## Quick Reference

### File Locations (see README.md for full structure)
- **Game loop**: `src/renderer/game/core/Game.ts`
- **Constants**: `src/renderer/config/constants.ts`
- **Levels**: `src/renderer/config/levels.ts`
- **Upgrades**: `src/renderer/config/upgrades.ts`
- **Translations**: `src/renderer/i18n/*.json`
- **Managers**: `src/renderer/game/managers/`
- **Entities**: `src/renderer/game/entities/`
- **Tests**: `tests/unit/` and `tests/integration/`

### Performance Tips
- Target 60 FPS with fixed timestep
- Use `deltaTime` for frame-independent physics
- Centralize constants for easy tuning
- Object pooling for particles (already implemented)

### Debugging
```typescript
// Add console logs in Game.ts update loop
console.log('Ball pos:', this.ball.getPosition());

// Check collision manager state
console.log('Collisions:', this.collisionManager);

// Verify manager initialization
console.log('Managers initialized:', {
  audio: !!this.audioManager,
  input: !!this.inputManager,
  // ...
});
```

---

**See README.md for complete folder structure and build instructions.**
