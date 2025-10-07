# Brick Sizing Refactor Plan

**Status**: Planning Phase - DO NOT IMPLEMENT YET  
**Created**: 2025-10-08  
**Issue**: Brick sizing logic is mixed into level configuration, making it hard to maintain and extend

---

## Current Problems

### 1. Sizing Logic in Wrong Place
- `createLevel1()` calculates brick width/height based on canvas width
- Helper functions (`createWordBricks`, `createLetterBricks`, `createTextLayout`) accept width/height parameters
- Level configs have hardcoded brick dimensions (e.g., `40, 20` in LEVEL_1)
- Sizing concerns mixed with layout concerns

### 2. Inconsistency
- `createLevel1(canvasWidth)` - dynamic sizing
- `LEVEL_1` constant - hardcoded sizing (40x20)
- Two different approaches for the same level

### 3. Extensibility Issues
- Hard to change brick size globally
- Each level needs to recalculate sizing
- Brick size not centralized
- Future brick types will need consistent sizing

---

## Proposed Solution

### Core Principle
**Brick size should be a global constant. Level configs should only define brick POSITIONS (grid-based), not sizes.**

---

## New Architecture

### 1. Global Brick Constants

```typescript
// src/renderer/config/constants.ts (NEW FILE)

/**
 * Global game constants
 */

// Brick dimensions (fixed size)
export const BRICK_WIDTH = 40;
export const BRICK_HEIGHT = 20;
export const BRICK_SPACING = 2;

// Letter pattern constants
export const LETTER_BRICK_COLS = 5; // Each letter is 5 bricks wide
export const LETTER_BRICK_ROWS = 5; // Each letter is 5 bricks tall
export const LETTER_SPACING = 10;   // Space between letters (in pixels)

// Ball constants
export const BALL_RADIUS = 8;
export const BALL_SPEED = 300;

// Bat constants
export const BAT_WIDTH = 100;
export const BAT_HEIGHT = 10;
export const BAT_SPEED = 300;

// Game constants
export const PLAYER_STARTING_HEALTH = 3;
```

### 2. Grid-Based Layout System

Instead of calculating pixel positions, levels define brick positions in a grid:

```typescript
// src/renderer/game/types.ts (UPDATED)

export interface BrickConfig {
  // Option 1: Grid-based (PREFERRED)
  gridX: number;      // Grid column (0, 1, 2, ...)
  gridY: number;      // Grid row (0, 1, 2, ...)
  
  // Option 2: Keep pixel-based for backward compatibility
  x?: number;
  y?: number;
  
  // Brick properties (no size - that's global)
  health: number;
  type?: BrickType;
  color?: string;
}
```

### 3. Brick Position Calculator

```typescript
// src/renderer/config/brickLayout.ts (NEW FILE)

import { BRICK_WIDTH, BRICK_HEIGHT, BRICK_SPACING } from './constants';
import { BrickConfig } from '../game/types';

/**
 * Convert grid position to pixel position
 */
export function gridToPixel(gridX: number, gridY: number): { x: number; y: number } {
  return {
    x: gridX * (BRICK_WIDTH + BRICK_SPACING),
    y: gridY * (BRICK_HEIGHT + BRICK_SPACING),
  };
}

/**
 * Calculate centered starting position for a layout
 */
export function getCenteredStartPosition(
  canvasWidth: number,
  layoutWidth: number
): { x: number; y: number } {
  return {
    x: (canvasWidth - layoutWidth) / 2,
    y: 100, // Fixed top margin
  };
}

/**
 * Create brick from grid position
 */
export function createBrickAtGrid(
  gridX: number,
  gridY: number,
  offsetX: number = 0,
  offsetY: number = 0,
  health: number = 1,
  type?: BrickType
): BrickConfig {
  const pos = gridToPixel(gridX, gridY);
  return {
    gridX,
    gridY,
    x: pos.x + offsetX,
    y: pos.y + offsetY,
    health,
    type,
  };
}
```

### 4. Simplified Level Helpers

```typescript
// src/renderer/config/levels.ts (REFACTORED)

import { BRICK_WIDTH, BRICK_HEIGHT, BRICK_SPACING, LETTER_SPACING } from './constants';
import { createBrickAtGrid, getCenteredStartPosition } from './brickLayout';

/**
 * Create bricks from letter pattern (grid-based)
 */
export function createLetterBricks(
  letter: string,
  startGridX: number,
  startGridY: number,
  health: number = 1
): BrickConfig[] {
  const pattern = LETTER_PATTERNS[letter.toUpperCase()];
  if (!pattern) {
    return [];
  }

  const bricks: BrickConfig[] = [];

  for (let row = 0; row < pattern.length; row++) {
    for (let col = 0; col < pattern[row].length; col++) {
      if (pattern[row][col] === 1) {
        bricks.push(
          createBrickAtGrid(
            startGridX + col,
            startGridY + row,
            0, 0,
            health
          )
        );
      }
    }
  }

  return bricks;
}

/**
 * Create bricks for a word (grid-based)
 */
export function createWordBricks(
  word: string,
  startGridX: number,
  startGridY: number,
  health: number = 1
): BrickConfig[] {
  const bricks: BrickConfig[] = [];
  let currentGridX = startGridX;
  
  // Calculate letter spacing in grid units
  const letterSpacingInGridUnits = Math.ceil(LETTER_SPACING / (BRICK_WIDTH + BRICK_SPACING));

  for (const letter of word.toUpperCase()) {
    if (letter === ' ') {
      currentGridX += 3 + letterSpacingInGridUnits;
      continue;
    }

    const letterBricks = createLetterBricks(
      letter,
      currentGridX,
      startGridY,
      health
    );

    bricks.push(...letterBricks);
    currentGridX += 5 + letterSpacingInGridUnits; // Each letter is 5 bricks wide
  }

  return bricks;
}

/**
 * Create centered word layout
 */
export function createCenteredWordBricks(
  word: string,
  canvasWidth: number,
  startY: number = 100,
  health: number = 1
): BrickConfig[] {
  // Calculate total width needed
  const letterCount = word.replace(/\s/g, '').length;
  const spaceCount = (word.match(/\s/g) || []).length;
  const letterSpacingInGridUnits = Math.ceil(LETTER_SPACING / (BRICK_WIDTH + BRICK_SPACING));
  
  const totalGridWidth = 
    (letterCount * 5) + // Each letter is 5 bricks wide
    ((letterCount - 1) * letterSpacingInGridUnits) + // Spacing between letters
    (spaceCount * (3 + letterSpacingInGridUnits)); // Spaces
  
  const totalPixelWidth = totalGridWidth * (BRICK_WIDTH + BRICK_SPACING);
  const startX = (canvasWidth - totalPixelWidth) / 2;
  
  // Convert start position to grid coordinates
  const startGridX = Math.floor(startX / (BRICK_WIDTH + BRICK_SPACING));
  const startGridY = Math.floor(startY / (BRICK_HEIGHT + BRICK_SPACING));
  
  return createWordBricks(word, startGridX, startGridY, health);
}
```

### 5. Simplified Level Definitions

```typescript
// src/renderer/config/levels.ts (LEVEL DEFINITIONS)

/**
 * Level 1: BRICKS
 * Simple level with the word "BRICKS"
 */
export function createLevel1(canvasWidth: number): LevelConfig {
  return {
    id: 1,
    name: 'Level 1: BRICKS',
    bricks: createCenteredWordBricks('BRICKS', canvasWidth, 100, 1),
    playerHealth: 3,
  };
}

/**
 * Level 2: More complex pattern
 */
export function createLevel2(canvasWidth: number): LevelConfig {
  const bricks: BrickConfig[] = [];
  
  // Top row - armored bricks
  for (let col = 0; col < 20; col++) {
    bricks.push(createBrickAtGrid(col, 0, 0, 50, 3, BrickType.ARMORED));
  }
  
  // Middle - word "LEVEL 2"
  bricks.push(...createCenteredWordBricks('LEVEL 2', canvasWidth, 150, 1));
  
  // Bottom row - standard bricks
  for (let col = 0; col < 20; col++) {
    bricks.push(createBrickAtGrid(col, 15, 0, 50, 1));
  }
  
  return {
    id: 2,
    name: 'Level 2: Armored',
    bricks,
    playerHealth: 3,
  };
}

// Export level factory functions
export const LEVEL_FACTORIES = [
  createLevel1,
  createLevel2,
];

/**
 * Get level by ID (creates it dynamically)
 */
export function getLevel(id: number, canvasWidth: number): LevelConfig | undefined {
  const factory = LEVEL_FACTORIES[id - 1];
  return factory ? factory(canvasWidth) : undefined;
}
```

### 6. Update Brick Class

The Brick class should use global constants instead of constructor parameters for size:

```typescript
// src/renderer/game/Brick.ts (UPDATED)

import { BRICK_WIDTH, BRICK_HEIGHT } from '../config/constants';

export class Brick {
  private position: { x: number; y: number };
  private readonly width: number = BRICK_WIDTH;   // Use constant
  private readonly height: number = BRICK_HEIGHT; // Use constant
  private health: number;
  private readonly maxHealth: number;
  private readonly customColor: string | null;
  private type: BrickType;
  
  constructor(config: BrickConfig) {
    // If grid position provided, convert to pixels
    if (config.gridX !== undefined && config.gridY !== undefined) {
      const pos = gridToPixel(config.gridX, config.gridY);
      this.position = { x: pos.x, y: pos.y };
    } else {
      // Fallback to direct pixel position (backward compatibility)
      this.position = { x: config.x || 0, y: config.y || 0 };
    }
    
    this.health = config.health;
    this.maxHealth = config.health;
    this.customColor = config.color || null;
    this.type = config.type || BrickType.STANDARD;
  }
  
  // Remove width/height from constructor - use constants
  // All other methods remain the same
}
```

### 7. Update Game Class

```typescript
// src/renderer/game/Game.ts (UPDATED)

import { getLevel } from '../config/levels';

export class Game {
  // ...
  
  private handleStartGame(): void {
    this.startTransition(() => {
      // Pass canvas width to level factory
      const levelConfig = getLevel(1, this.canvas.width);
      if (!levelConfig) {
        throw new Error('Level 1 not found');
      }
      this.currentLevelId = 1;
      this.totalBricksDestroyed = 0;
      this.loadLevel(levelConfig);
      this.gameState = GameState.PLAYING;
    });
  }
  
  private handleContinueToNextLevel(): void {
    this.startTransition(() => {
      this.currentLevelId++;
      const levelConfig = getLevel(this.currentLevelId, this.canvas.width);
      
      if (!levelConfig) {
        // No more levels - game complete
        this.gameState = GameState.GAME_OVER;
        return;
      }
      
      this.loadLevel(levelConfig);
      this.gameState = GameState.PLAYING;
    });
  }
}
```

---

## Migration Strategy

### Phase 1: Add Constants (Non-Breaking)
1. Create `src/renderer/config/constants.ts`
2. Create `src/renderer/config/brickLayout.ts`
3. Add new helper functions
4. **No changes to existing code yet**

### Phase 2: Refactor Level Helpers (Non-Breaking)
1. Update `createLetterBricks()` to use constants
2. Update `createWordBricks()` to use constants
3. Add `createCenteredWordBricks()` helper
4. Keep old function signatures for backward compatibility

### Phase 3: Update Level Definitions
1. Refactor `createLevel1()` to use new helpers
2. Remove `LEVEL_1` constant (not needed anymore)
3. Update `getLevel()` to accept canvas width
4. Update all level factory functions

### Phase 4: Update Game Class
1. Update `handleStartGame()` to pass canvas width
2. Update `handleContinueToNextLevel()` to pass canvas width
3. Remove imports of old level constants

### Phase 5: Update Brick Class (Optional)
1. Use constants for width/height
2. Support grid-based positioning
3. Maintain backward compatibility with pixel positions

### Phase 6: Clean Up
1. Remove old helper function signatures
2. Remove unused code
3. Update tests
4. Update documentation

---

## Benefits

### 1. Consistency
- All bricks are the same size
- Easy to change globally
- No more calculation errors

### 2. Simplicity
- Level configs only define layout
- No sizing logic in levels
- Clear separation of concerns

### 3. Extensibility
- Easy to add new brick types (same size)
- Grid-based positioning is intuitive
- Future features (brick editor) will be easier

### 4. Maintainability
- Constants in one place
- Easy to understand
- Less code duplication

### 5. Performance
- No runtime calculations for brick size
- Constants can be optimized by compiler
- Simpler collision detection

---

## Testing Strategy

### Unit Tests
- Test `gridToPixel()` conversion
- Test `createBrickAtGrid()` helper
- Test `createCenteredWordBricks()` layout
- Test brick creation with constants

### Integration Tests
- Test level loading with new system
- Test brick rendering with constants
- Test collision detection unchanged

### Regression Tests
- Verify all existing tests still pass
- Verify game plays identically
- Verify visual appearance unchanged

---

## Alternative Approaches Considered

### Alternative 1: Responsive Brick Sizing
**Rejected**: Makes collision detection complex, inconsistent gameplay across screen sizes

### Alternative 2: Brick Size in BrickConfig
**Rejected**: Allows inconsistent sizes, harder to maintain, not needed for gameplay

### Alternative 3: Brick Size Per Level
**Rejected**: Unnecessary complexity, no gameplay benefit

---

## Summary

**Previous State**: Brick sizing scattered across level configs, calculated dynamically, inconsistent

**Current State (COMPLETED)**: 
- ✅ Brick size defined in global constants (`constants.ts`)
- ✅ Level configs use grid-based positioning (row/col)
- ✅ Helper functions simplified (no size parameters)
- ✅ Clear separation of concerns (data vs rendering)
- ✅ Easy to extend for future features
- ✅ All 272 tests passing
- ✅ Build successful

**Implementation**: Completed all 6 phases

## Implementation Results

### Files Created
- `src/renderer/config/constants.ts` - Global game constants
- `src/renderer/config/brickLayout.ts` - Grid-to-pixel conversion utilities

### Files Modified
- `src/renderer/game/types.ts` - BrickConfig now uses row/col instead of x/y/width/height
- `src/renderer/game/Brick.ts` - Constructor accepts BrickConfig, converts grid to pixels
- `src/renderer/game/Level.ts` - Simplified brick creation
- `src/renderer/config/levels.ts` - All helpers use grid coordinates
- All test files updated to use new grid-based system

### Key Achievement
**Level specifications are now pure data** - only row, column, and health. All pixel calculations happen at runtime in the game code, not in level definitions.

**Status**: ✅ COMPLETE - Ready for extensibility implementation

