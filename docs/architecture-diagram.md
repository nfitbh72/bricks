# Game Architecture Diagram

## Before Refactoring
```
┌─────────────────────────────────────────────────────────────┐
│                          Game.ts                            │
│                        (1,184 lines)                        │
├─────────────────────────────────────────────────────────────┤
│ • Game Loop & State Management                              │
│ • Audio (3 properties + methods)                            │
│ • Input Handling (4 properties + event listeners)           │
│ • UI Screens (7 screen objects + transition logic)          │
│ • Collision Detection                                       │
│ • Level Management                                          │
│ • Upgrade System                                            │
│ • Visual Effects (particles, damage numbers, screen shake)  │
│ • Rendering                                                 │
└─────────────────────────────────────────────────────────────┘
```

## After Refactoring
```
┌─────────────────────────────────────────────────────────────┐
│                          Game.ts                            │
│                         (~900 lines)                        │
├─────────────────────────────────────────────────────────────┤
│ • Game Loop & State Management                              │
│ • Collision Detection                                       │
│ • Level Management                                          │
│ • Upgrade System                                            │
│ • Visual Effects (particles, damage numbers, screen shake)  │
│ • Rendering                                                 │
│                                                             │
│ ┌─────────────┐  ┌──────────────┐  ┌──────────────┐       │
│ │AudioManager │  │InputManager  │  │ScreenManager │       │
│ └─────────────┘  └──────────────┘  └──────────────┘       │
└────────┬──────────────────┬──────────────────┬─────────────┘
         │                  │                  │
         │                  │                  │
         ▼                  ▼                  ▼
┌─────────────────┐ ┌──────────────┐ ┌──────────────────┐
│  AudioManager   │ │InputManager  │ │  ScreenManager   │
├─────────────────┤ ├──────────────┤ ├──────────────────┤
│ • Music         │ │ • Keyboard   │ │ • IntroScreen    │
│ • SFX           │ │ • Mouse      │ │ • GameOverScreen │
│ • Volume        │ │ • Callbacks  │ │ • PauseScreen    │
│   Control       │ │ • State      │ │ • UpgradeScreen  │
│                 │ │   Queries    │ │ • Transitions    │
└─────────────────┘ └──────────────┘ └──────────────────┘
```

## Component Interaction Flow

### Input Flow
```
User Input (Keyboard/Mouse)
         │
         ▼
   InputManager
    (captures & stores state)
         │
         ├─► Callbacks ──► Game.ts (game actions)
         │
         └─► State Queries ◄── Game.ts (movement, etc.)
```

### Audio Flow
```
Game Events (collision, destruction, etc.)
         │
         ▼
   AudioManager
    (plays appropriate sounds)
         │
         ├─► Background Music (looping)
         └─► Sound Effects (one-shot)
```

### Screen Flow
```
Game State Changes
         │
         ▼
   ScreenManager
    (manages active screen)
         │
         ├─► Render Current Screen
         ├─► Handle Screen Input
         └─► Manage Transitions
```

## Dependency Graph
```
Game.ts
  ├─► AudioManager (composition)
  ├─► InputManager (composition)
  ├─► ScreenManager (composition)
  │     ├─► IntroScreen
  │     ├─► GameOverScreen
  │     ├─► LevelCompleteScreen
  │     ├─► UpgradeTreeScreen
  │     ├─► TransitionScreen
  │     ├─► PauseScreen
  │     └─► OptionsScreen
  ├─► Ball
  ├─► Bat
  ├─► Level
  ├─► Laser[]
  ├─► ParticleSystem
  ├─► GameUpgrades
  └─► StatusBar
```

## Benefits of New Architecture

### 1. Single Responsibility Principle
Each manager has one clear purpose:
- **AudioManager**: Audio only
- **InputManager**: Input only
- **ScreenManager**: UI screens only

### 2. Easier Testing
```typescript
// Can now test each manager independently
const audioManager = new AudioManager();
audioManager.setSFXVolume(0.5);
expect(audioManager.getSFXVolume()).toBe(0.5);

const inputManager = new InputManager(mockCanvas);
inputManager.setCallbacks({ onSpace: mockCallback });
// Simulate space key press
expect(mockCallback).toHaveBeenCalled();
```

### 3. Reduced Coupling
- Game.ts doesn't need to know about audio file paths
- Game.ts doesn't need to manage event listeners
- Game.ts doesn't need to know about screen rendering details

### 4. Easier Extension
Want to add a new sound? Just add a method to AudioManager.
Want to add gamepad support? Just extend InputManager.
Want to add a new screen? Just add it to ScreenManager.

### 5. Better Code Organization
```
src/renderer/game/
  ├── Game.ts              (main game logic)
  ├── AudioManager.ts      (audio subsystem)
  ├── InputManager.ts      (input subsystem)
  ├── ScreenManager.ts     (UI subsystem)
  ├── Ball.ts
  ├── Bat.ts
  ├── Brick.ts
  ├── Level.ts
  └── ...
```

## Performance Impact
- **Negligible**: Manager objects are created once during initialization
- **No additional overhead**: Direct method calls, no complex abstractions
- **Potential improvements**: Managers can implement their own optimizations without affecting Game.ts
