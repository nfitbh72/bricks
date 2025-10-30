# Architecture Guide

> **Purpose**: Enable developers to quickly understand and extend the codebase

## Tech Stack

- **Electron** (Node.js + Chromium) - Desktop app framework
- **TypeScript** - Type-safe development
- **Canvas API** - 2D rendering
- **SCSS** - Typed stylesheets with variables
- **Webpack** - Module bundling and asset processing
- **Jest** - Testing (666 tests)
- **IPC (Inter-Process Communication)** - Main ↔ Renderer data exchange

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

### 🏆 Leaderboard System
- Persistent storage via Electron file system
- Automatic save/load on level completion
- Fake leaderboard generation for new levels
- Player name entry with 3-character limit

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
- Brick render caching (see below)

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

## Data Persistence

### Leaderboard Storage

The game uses Electron's IPC (Inter-Process Communication) to persist leaderboard data to disk.

**Architecture:**

```
┌─────────────────────────────────────────────────────────────┐
│ Renderer Process (Game UI)                                  │
│                                                              │
│  ┌──────────────────────────────────────────────────────┐  │
│  │ Leaderboard.ts                                       │  │
│  │ - load() → window.electron.loadLeaderboards()       │  │
│  │ - save() → window.electron.saveLeaderboards(data)   │  │
│  │ - Caches data in memory                             │  │
│  └──────────────────────────────────────────────────────┘  │
│                           ↕ IPC                             │
└─────────────────────────────────────────────────────────────┘
                            ↕
┌─────────────────────────────────────────────────────────────┐
│ Main Process (Node.js)                                      │
│                                                              │
│  ┌──────────────────────────────────────────────────────┐  │
│  │ main.ts                                              │  │
│  │ - ipcMain.handle('load-leaderboards')               │  │
│  │ - ipcMain.handle('save-leaderboards')               │  │
│  │ - fs.readFileSync() / fs.writeFileSync()            │  │
│  └──────────────────────────────────────────────────────┘  │
│                           ↕                                 │
│  ┌──────────────────────────────────────────────────────┐  │
│  │ File System                                          │  │
│  │ ~/Library/Application Support/bricks/                │  │
│  │   └── leaderboards.json                             │  │
│  └──────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
```

**Storage Location:**
- **macOS**: `~/Library/Application Support/bricks/leaderboards.json`
- **Windows**: `%APPDATA%/bricks/leaderboards.json`
- **Linux**: `~/.config/bricks/leaderboards.json`

**Data Flow:**

1. **On Level Complete:**
   - `LevelCompleteScreen.setLevel()` calls `Leaderboard.getLeaderboard(levelId)`
   - First call triggers `Leaderboard.load()` which fetches from disk via IPC
   - Data cached in memory for subsequent access

2. **On Name Entry Complete:**
   - Player enters 3-character name
   - `Leaderboard.updateLeaderboard()` updates cache and saves to disk
   - IPC call to main process writes JSON file

3. **File Format:**
   ```json
   {
     "1": [
       { "name": "AAA", "time": 45.2, "isPlayer": false },
       { "name": "BBB", "time": 52.8, "isPlayer": false }
     ],
     "2": [
       { "name": "CCC", "time": 38.1, "isPlayer": false }
     ]
   }
   ```

**Security:**
- Context isolation enabled (renderer cannot access Node.js directly)
- Preload script (`preload.ts`) exposes only specific IPC methods
- Type-safe API via TypeScript definitions (`global.d.ts`)

**Implementation Files:**
- `src/main/main.ts` - IPC handlers for file I/O
- `src/main/preload.ts` - Context bridge exposing safe APIs
- `src/renderer/global.d.ts` - TypeScript definitions for window.electron
- `src/renderer/game/systems/Leaderboard.ts` - Business logic and caching
- `src/renderer/ui/LevelCompleteScreen.ts` - UI integration

---

## Performance Optimization: Brick Render Caching

### Problem
Rendering many bricks (65+ in Level 5) caused performance issues because each brick was creating expensive canvas operations every frame:
- Linear gradients (3 color stops)
- Complex rounded rectangle paths (2 per brick)
- Shadow blur effects
- Color manipulation (lighten/darken)
- Text rendering

**Cost**: With 65 bricks at 60 FPS = 3,900 full renders/second

### Solution: Static Render Cache

**Implementation** (`src/renderer/game/entities/Brick.ts`):

```typescript
// Static cache shared across all brick instances
private static renderCache: Map<string, HTMLCanvasElement> = new Map();

// Generate unique key based on appearance
private getCacheKey(): string {
  const color = this.getColor();
  const healthText = this.isIndestructible() ? 'I' : 
    (this.health % 1 === 0 ? this.health.toString() : this.health.toFixed(1));
  return `${color}_${healthText}_${this.isIndestructible()}`;
}

// Render once to offscreen canvas
private renderToCache(): HTMLCanvasElement {
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  // ... full render with gradients, paths, shadows, text
  return canvas;
}

// Fast render using cached image
render(ctx: CanvasRenderingContext2D): void {
  const cacheKey = this.getCacheKey();
  let cachedCanvas = Brick.renderCache.get(cacheKey);
  
  if (!cachedCanvas) {
    cachedCanvas = this.renderToCache();
    Brick.renderCache.set(cacheKey, cachedCanvas);
  }
  
  // Simple image copy (10-20x faster than full render)
  ctx.globalAlpha = opacity;
  ctx.drawImage(cachedCanvas, x, y);
}
```

### How It Works

1. **First render**: Brick creates offscreen canvas with full visual appearance
2. **Cache storage**: Canvas stored in static Map with key like `#FF00FF_5_false`
3. **Subsequent renders**: Simple `drawImage()` copy from cache
4. **Dynamic opacity**: Only opacity changes based on health percentage
5. **Cache management**: Cleared when loading new levels via `Brick.clearRenderCache()`

### Performance Impact

- **Before**: O(n × complexity) - full render for each brick
- **After**: O(n × blit) - simple image copy for each brick
- **Result**: 10-20x faster rendering, smooth 60 FPS even with 65+ bricks

### Cache Management

```typescript
// Clear cache (called in Game.loadLevel())
Brick.clearRenderCache();

// Disable caching if needed (for debugging)
Brick.setRenderCacheEnabled(false);
```

**Memory**: Cache grows with unique brick appearances (~10-20 entries typical), cleared between levels to prevent buildup.

---

## Styling Architecture

### SCSS Module System

The project uses a modular SCSS architecture with TypeScript integration:

**Directory Structure:**
```
src/renderer/styles/
├── _variables.scss  # Design tokens (colors, fonts, sizes)
├── _fonts.scss      # Font-face declarations
├── _mixins.scss     # Reusable style patterns
├── base.scss        # Base HTML/body styles
└── index.scss       # Main entry point
```

**Key Features:**
- **Type-safe constants**: Font and color styles defined in `config/fontStyles.ts` and `config/colorStyles.ts`
- **Centralized variables**: All colors, fonts, and sizes in `_variables.scss`
- **Modern syntax**: Uses `@use` instead of deprecated `@import`
- **Zero runtime cost**: SCSS compiled at build time

**Usage in Canvas Rendering:**
```typescript
import { FONT_TITLE_HUGE, GLOW_LARGE, COLOR_MAGENTA, COLOR_CYAN } from '../config/constants';

ctx.font = FONT_TITLE_HUGE;       // '72px "D Day Stencil", Arial'
ctx.shadowBlur = GLOW_LARGE;      // 20
ctx.fillStyle = COLOR_MAGENTA;    // '#ff00ff'
ctx.shadowColor = COLOR_CYAN;     // '#00ffff'
```

**Adding New Styles:**

*Fonts:*
1. Add size to `_variables.scss`: `$font-size-custom: 40px;`
2. Export constant in `fontStyles.ts`: `export const FONT_SIZE_CUSTOM = 40;`
3. Create composite: `export const FONT_CUSTOM = \`${FONT_SIZE_CUSTOM}px ${FONT_PRIMARY}\`;`
4. Use in components: `ctx.font = FONT_CUSTOM;`

*Colors:*
1. Add color to `_variables.scss`: `$color-custom: #abcdef;`
2. Export constant in `colorStyles.ts`: `export const COLOR_CUSTOM = '#abcdef';`
3. Use in components: `ctx.fillStyle = COLOR_CUSTOM;`

---

**See README.md for complete folder structure and build instructions.**
