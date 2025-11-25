# Refactoring Plan: Modularizing the Game Architecture

This document outlines the step-by-step plan to refactor the game architecture, addressing the "God Object" anti-pattern in `Game.ts` and improving overall modularity.

## Phase 1: Core Architecture & The "God Object" ✅ COMPLETE
**Goal**: Decompose `Game.ts` into smaller, focused responsibilities.

### Step 1.1: Extract GameLoop ✅
- **Action**: Create a `GameLoop` class in `src/renderer/game/core/GameLoop.ts`.
- **Status**: COMPLETE
- **Responsibility**: Handle `requestAnimationFrame`, `deltaTime` calculation, and the fixed timestep loop.

### Step 1.2: Event Bus Pattern ✅
- **Action**: Create `EventManager` in `src/renderer/game/core/EventManager.ts`.
- **Status**: COMPLETE
- **Responsibility**: Centralized event handling to decouple systems.

### Step 1.3: GameContext / Service Locator ✅
- **Action**: Create `GameContext` in `src/renderer/game/core/GameContext.ts`.
- **Status**: COMPLETE
- **Responsibility**: Specific container for shared dependencies.

## Phase 2: Entity Management 🚧 IN PROGRESS
**Goal**: Unify entity handling to support easier extensibility.

### Step 2.1: Unified Entity Interface ✅
- **Action**: Define `IEntity` interface.
- **Status**: COMPLETE
- **Changes**:
    - Created `IEntity` interface with `update()`, `render()`, `getBounds()`, `isActive()`, `deactivate()`
    - Created `Bounds` type for collision detection
    - Updated 5 entities to implement `IEntity`: `FallingBrick`, `Debris`, `BrickLaser`, `SplittingFragment`, `DynamiteStick`
    - Created `HomingMissileWrapper` for `HomingMissile` (special update signature)
    - Fixed `CollisionManager` null checks for `getBounds()` returning `Bounds | null`

### Step 2.2: Single List Management ✅
- **Action**: Refactor `OffensiveEntityManager` to use a single `List<IEntity>`.
- **Status**: COMPLETE
- **Changes**:
    - Replaced 6 separate arrays with single `entities: IEntity[]`
    - Kept `homingMissileWrappers` array for special handling
    - Simplified update/render loops to single iterations
    - Type-specific getters use `filter()` to return typed views
    - Reduced code duplication significantly

### Step 2.3: Factory Pattern
- **Action**: Create `OffensiveEntityFactory`.
- **Status**: PENDING (factory already exists, may need updates)
- **Changes**:
    - Update factory to return unified entity list if needed.

## Phase 3: Separation of Rendering & Logic ✅ COMPLETE (Step 3.1)
**Goal**: Decouple game logic from the DOM/Canvas.

### Step 3.1: Render System ✅
- **Action**: Consolidate all rendering in `RenderManager`.
- **Status**: COMPLETE
- **Changes**:
    - Added `boss` and `bossCopies` parameters to `RenderManager.renderGameplay()`
    - Moved boss rendering logic from `Game.ts` to `RenderManager`
    - All rendering now goes through `RenderManager`
    - `Game.ts` no longer has direct rendering calls

### Step 3.2: View/Model Separation (DEFERRED)
- **Action**: Separate logic classes from rendering.
- **Status**: DEFERRED - This is a much larger refactor
- **Changes**:
    - Would require creating separate renderer classes for each entity type
    - Would need to extract visual state from entity logic
    - Significant changes to entity architecture
- **Recommendation**: Defer until there's a clear need

## Phase 4: Collision System
**Goal**: Optimize and generalize collision detection.

### Step 4.1: Spatial Partitioning
- **Action**: Implement a QuadTree or Spatial Hash.
- **Changes**:
    - Reduce collision checks from O(N^2) to O(N log N).

### Step 4.2: Generic Collision Handlers
- **Action**: Define collision groups and generic handlers.
- **Changes**:
    - Remove specific methods like `checkBallBrickCollisions`.
    - Use `ICollidable` interface and `onCollision` callbacks.

## Phase 5: Level & Factory Logic
**Goal**: Make `Level` a pure data object.

### Step 5.1: Level Factory
- **Action**: Create `LevelBuilder` or `LevelFactory` (enhance existing).
- **Changes**:
    - Move parsing and layout logic out of `Level.ts`.

### Step 5.2: Pure Data Level
- **Action**: Refactor `Level.ts`.
- **Changes**:
    - It should only hold the list of bricks and current state.

## Phase 6: Screen Management
**Goal**: Improve screen lifecycle management.

### Step 6.1: Dependency Injection
- **Action**: Pass dependencies to `ScreenManager` or Screens via `GameContext`.
- **Changes**:
    - Remove `setAchievementTracker` style methods.

### Step 6.2: Lazy Instantiation
- **Action**: Instantiate screens only when needed.
- **Changes**:
    - Reduce initial load time and memory usage.
