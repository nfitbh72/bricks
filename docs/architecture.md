# Architecture

## Overview

Bricks is built as an Electron application using TypeScript and the Canvas API for rendering. The architecture emphasizes modularity, testability, and separation of concerns. The game features a comprehensive upgrade system, multi-language support, and modular subsystems for audio, input, and UI management.

## Technology Stack

- **Runtime**: Electron (Node.js + Chromium)
- **Language**: TypeScript
- **Rendering**: Canvas API (2D context)
- **Testing**: Jest
- **Build**: TypeScript Compiler (tsc)

## Application Structure

### Electron Architecture

```
┌─────────────────────────────────────────┐
│         Main Process (Node.js)          │
│  - Window management                    │
│  - System integration                   │
│  - File system access                   │
└─────────────────┬───────────────────────┘
                  │ IPC
┌─────────────────┴───────────────────────┐
│      Renderer Process (Chromium)        │
│  - Game engine                          │
│  - Canvas rendering                     │
│  - User input handling                  │
└─────────────────────────────────────────┘
```

**Main Process** (`src/main/`):
- `main.ts`: Creates and manages the BrowserWindow, handles app lifecycle
- `preload.ts`: Secure bridge for IPC communication (context isolation)

**Renderer Process** (`src/renderer/`):
- Game logic, rendering, and user interaction
- No direct access to Node.js APIs (security)

## Game Engine Architecture

### Core Modules

```
┌──────────────────────────────────────────────┐
│              Game (Main Engine)              │
│  - Game loop (requestAnimationFrame)        │
│  - State management                          │
│  - Entity coordination                       │
└───────┬──────────────────────────────────────┘
        │
        ├─── AudioManager (Subsystem)
        │     - Background music
        │     - Sound effects
        │     - Volume control
        │
        ├─── InputManager (Subsystem)
        │     - Keyboard/mouse handling
        │     - Input state queries
        │     - Event callbacks
        │
        ├─── ScreenManager (Subsystem)
        │     - UI screen management
        │     - Screen transitions
        │     - Render delegation
        │
        ├─── CollisionManager (Subsystem)
        │     - Ball-bat collisions
        │     - Ball-brick collisions
        │     - Wall collisions
        │
        ├─── GameUpgrades (System)
        │     - Upgrade tree management
        │     - Upgrade point tracking
        │     - Ability unlocking
        │
        ├─── Level (Level Manager)
        │     - Load level configuration
        │     - Track completion state
        │     - Brick management
        │
        ├─── Ball (Entity)
        │     - Position, velocity
        │     - Damage, piercing, critical hits
        │     - Rendering
        │
        ├─── Bat (Entity)
        │     - Position, dimensions
        │     - Laser shooting
        │     - Rendering
        │
        ├─── Brick[] (Entity Collection)
        │     - Position, health, type
        │     - Damage handling
        │     - Rendering
        │
        ├─── Laser[] (Projectiles)
        │     - Position, velocity
        │     - Collision detection
        │     - Rendering
        │
        ├─── ParticleSystem (Visual Effects)
        │     - Particle generation
        │     - Animation
        │     - Rendering
        │
        └─── StatusBar (HUD)
              - Level info display
              - Health display
              - Timer display
```

### Class Design

#### Game Class
**Responsibilities**:
- Initialize canvas and context
- Run game loop
- Manage game state (intro, playing, paused, gameOver, levelComplete)
- Handle collision detection
- Coordinate entity updates and rendering
- Manage player health

**Key Methods**:
```typescript
class Game {
  constructor(canvas: HTMLCanvasElement)
  start(): void
  pause(): void
  resume(): void
  update(deltaTime: number): void
  render(): void
  checkCollisions(): void
  loadLevel(levelConfig: LevelConfig): void
}
```

#### Ball Class
**Responsibilities**:
- Track position and velocity
- Update position based on velocity
- Bounce off walls, bat, and bricks
- Render itself

**Key Methods**:
```typescript
class Ball {
  constructor(x: number, y: number, radius: number, speed: number)
  update(deltaTime: number): void
  render(ctx: CanvasRenderingContext2D): void
  bounce(normal: Vector2D): void
  reset(): void
}
```

#### Bat Class
**Responsibilities**:
- Track position and dimensions
- Handle keyboard/mouse input
- Constrain movement to screen bounds
- Render itself

**Key Methods**:
```typescript
class Bat {
  constructor(x: number, y: number, width: number, height: number)
  update(deltaTime: number): void
  render(ctx: CanvasRenderingContext2D): void
  moveLeft(): void
  moveRight(): void
  setPosition(x: number): void
}
```

#### Brick Class
**Responsibilities**:
- Track position, dimensions, and health
- Handle damage
- Determine if destroyed
- Render with visual feedback based on health

**Key Methods**:
```typescript
class Brick {
  constructor(x: number, y: number, width: number, height: number, health: number)
  takeDamage(amount: number): void
  isDestroyed(): boolean
  render(ctx: CanvasRenderingContext2D): void
}
```

#### Level Class
**Responsibilities**:
- Load level configuration
- Create brick layouts
- Track level completion
- Provide upgrade options

**Key Methods**:
```typescript
class Level {
  constructor(config: LevelConfig)
  getBricks(): Brick[]
  isComplete(): boolean
  getUpgradeOptions(): Upgrade[]
}
```

## Data Flow

### Game Loop
```
┌─────────────────────────────────────┐
│  requestAnimationFrame callback     │
└──────────────┬──────────────────────┘
               │
               ▼
┌─────────────────────────────────────┐
│  Calculate deltaTime                │
└──────────────┬──────────────────────┘
               │
               ▼
┌─────────────────────────────────────┐
│  Update Phase                       │
│  - Update ball position             │
│  - Update bat position              │
│  - Check collisions                 │
│  - Update game state                │
└──────────────┬──────────────────────┘
               │
               ▼
┌─────────────────────────────────────┐
│  Render Phase                       │
│  - Clear canvas                     │
│  - Render bricks                    │
│  - Render bat                       │
│  - Render ball                      │
│  - Render UI (health, score)        │
└──────────────┬──────────────────────┘
               │
               ▼
         (loop continues)
```

### Input Handling
```
User Input (keyboard/mouse)
    │
    ▼
Event Listeners (renderer.ts)
    │
    ▼
Bat.moveLeft() / Bat.moveRight() / Bat.setPosition()
    │
    ▼
Bat position updated
    │
    ▼
Rendered in next frame
```

### Collision Detection
```
CollisionManager
    │
    ├─── checkBallBatCollision()
    │     └─── Bounce with angle based on hit position
    │
    ├─── checkBallBrickCollisions()
    │     ├─── Check piercing chance
    │     ├─── Check critical hit chance
    │     ├─── Apply damage
    │     ├─── Trigger explosions
    │     └─── Remove if destroyed
    │
    ├─── checkBallWallCollisions()
    │     └─── Bounce or lose health
    │
    └─── checkLaserBrickCollisions()
          └─── Damage bricks hit by lasers
```

## Configuration System

### Level Configuration
Levels are defined as data objects, completely separate from the game engine:

```typescript
interface LevelConfig {
  id: number;
  name: string;
  bricks: BrickConfig[];
  baseHealth?: number; // Multiplier for brick health
}

interface BrickConfig {
  col: number;  // Grid column
  row: number;  // Grid row
  type: BrickType; // NORMAL, HEALTHY, or INDESTRUCTIBLE
  color?: string;
}
```

**Level System** (`src/renderer/config/levels.ts`):
- Levels use word-based brick layouts via `createBricksFromWord()`
- Brick health scales with `baseHealth` multiplier
- Three brick types: NORMAL (1x), HEALTHY (3x), INDESTRUCTIBLE (∞)
- Centralized constants in `constants.ts`

### Upgrade Configuration
Upgrades are defined in a tree structure:

```typescript
interface Upgrade {
  name: string;
  description: string;
  type: UpgradeType;
  times: number;  // How many times it can be purchased
  nextUpgrades: Upgrade[];  // Child upgrades
  previewNextUpgrades: number;
  unlockNextUpgradesAfterTimes: number;
}
```

**Upgrade Tree** (`src/renderer/config/upgrades.ts`):
- Two main branches: Bat upgrades and Ball upgrades
- Progressive unlocking system
- Translatable names and descriptions via i18n

This approach allows:
- Easy level creation without touching game engine code
- Configuration-driven upgrade system
- Simple testing of different configurations
- Multi-language support for all text

## State Management

### Game States
```typescript
enum GameState {
  INTRO,       // Show start screen
  PLAYING,     // Active gameplay
  PAUSED,      // Game paused
  LEVEL_COMPLETE, // Show upgrade screen
  GAME_OVER    // Show game over screen
}
```

### State Transitions
```
INTRO → (click START) → PLAYING
PLAYING → (all bricks destroyed) → LEVEL_COMPLETE
PLAYING → (health = 0) → GAME_OVER
LEVEL_COMPLETE → (select upgrade) → PLAYING (next level)
GAME_OVER → (click RESTART) → INTRO
```

## Rendering Strategy

### Canvas Layers (Conceptual)
1. **Background**: Dark dystopian background
2. **Bricks**: Rendered with neon colors, glow effects
3. **Bat**: Neon-colored paddle
4. **Ball**: Bright glowing ball with trail effect
5. **UI Overlay**: Health, score, level info

### Visual Style
- **Color Palette**: Dark background (#0a0a0a) with neon accents
  - Cyan: #00ffff
  - Magenta: #ff00ff
  - Yellow: #ffff00
  - Green: #00ff00
- **Effects**: 
  - Glow/bloom on game objects
  - Motion blur on ball
  - Screen shake on impacts
  - Particle effects on brick destruction

## Testing Strategy

### Unit Tests
- **Ball**: Movement, bouncing, collision bounds
- **Bat**: Movement, input handling, boundary constraints
- **Brick**: Health management, destruction
- **Level**: Configuration loading, completion detection

### Integration Tests
- **Collision Detection**: Ball-bat, ball-brick, ball-wall interactions
- **Game State**: State transitions, win/lose conditions
- **Level Progression**: Loading next level, applying upgrades

### Test Structure
```
tests/
├── unit/
│   ├── Ball.test.ts
│   ├── Bat.test.ts
│   ├── Brick.test.ts
│   └── Level.test.ts
├── integration/
│   ├── collision.test.ts
│   ├── gameState.test.ts
│   └── levelProgression.test.ts
└── helpers/
    └── testUtils.ts
```

## Performance Considerations

1. **Collision Detection**: Use spatial partitioning if brick count > 100
2. **Rendering**: Only render visible objects
3. **Memory**: Object pooling for particles/effects
4. **Frame Rate**: Target 60 FPS, use deltaTime for consistent physics

## Extensibility

### Implemented Features
- ✅ **Upgrade System**: Comprehensive upgrade tree with 10+ upgrades
- ✅ **Brick Types**: NORMAL, HEALTHY, and INDESTRUCTIBLE bricks
- ✅ **Audio System**: AudioManager with music and SFX
- ✅ **Particle System**: Visual effects for explosions and impacts
- ✅ **Multi-language**: Support for 5 languages with auto-detection
- ✅ **Laser Shooting**: Bat can shoot projectiles
- ✅ **Ball Abilities**: Piercing, critical hits, explosions
- ✅ **Options Screen**: Volume and visual settings

### Future Enhancements
- **Power-ups**: Temporary power-ups that drop from bricks
- **More Brick Types**: Moving bricks, regenerating bricks
- **Difficulty Levels**: Easy/Medium/Hard configurations
- **Leaderboards**: Score tracking and persistence
- **More Levels**: Additional level patterns and challenges

### Plugin Architecture (Future)
```typescript
interface GamePlugin {
  onInit(game: Game): void;
  onUpdate(deltaTime: number): void;
  onRender(ctx: CanvasRenderingContext2D): void;
}
```

## Security Considerations

- **Context Isolation**: Enabled in Electron (preload script)
- **No eval()**: Avoid dynamic code execution
- **Input Validation**: Sanitize level configuration data
- **CSP**: Content Security Policy for renderer process

## Build & Deployment

### Development Build
```bash
npm run build    # Compile TypeScript
npm run dev      # Run Electron app
```

### Production Build
```bash
npm run build
npm start
```

### Future: Packaging
- Use `electron-builder` or `electron-forge`
- Create installers for Windows, macOS, Linux
- Code signing for distribution

## File Organization

```
src/renderer/
├── game/
│   ├── Game.ts                # Main game engine
│   ├── Ball.ts                # Ball entity
│   ├── Bat.ts                 # Bat entity
│   ├── Brick.ts               # Brick entity
│   ├── Level.ts               # Level manager
│   ├── Laser.ts               # Laser projectile
│   ├── AudioManager.ts        # Audio subsystem
│   ├── InputManager.ts        # Input handling subsystem
│   ├── ScreenManager.ts       # UI screen management
│   ├── CollisionManager.ts    # Collision detection
│   ├── GameUpgrades.ts        # Upgrade system
│   ├── ParticleSystem.ts      # Visual effects
│   ├── DamageNumber.ts        # Floating damage numbers
│   ├── StatusBar.ts           # HUD display
│   ├── types.ts               # Shared types and interfaces
│   └── utils.ts               # Utility functions (collision, math)
├── config/
│   ├── levels.ts              # Level configurations
│   ├── upgrades.ts            # Upgrade tree configuration
│   ├── constants.ts           # Game constants
│   └── brickLayout.ts         # Brick positioning utilities
├── ui/
│   ├── Screen.ts              # Base screen class
│   ├── Button.ts              # Button component
│   ├── IntroScreen.ts         # Intro screen UI
│   ├── GameOverScreen.ts      # Game over screen UI
│   ├── PauseScreen.ts         # Pause screen UI
│   ├── OptionsScreen.ts       # Options/settings screen
│   ├── LevelCompleteScreen.ts # Level completion screen
│   ├── UpgradeTreeScreen.ts   # Upgrade tree UI
│   └── TransitionScreen.ts    # Level transition screen
├── i18n/
│   ├── LanguageManager.ts     # Language management
│   ├── en.json                # English translations
│   ├── es.json                # Spanish translations
│   ├── fr.json                # French translations
│   ├── de.json                # German translations
│   └── ja.json                # Japanese translations
├── assets/
│   ├── audio/                 # Sound files
│   └── fonts/                 # Custom fonts
├── index.html                 # HTML entry point
├── styles.css                 # Global styles
└── renderer.ts                # Renderer entry point
```

## Dependencies

### Production
- `electron`: Desktop app framework

### Development
- `typescript`: Type-safe JavaScript
- `@types/node`: Node.js type definitions
- `jest`: Testing framework
- `@types/jest`: Jest type definitions
- `ts-jest`: TypeScript preprocessor for Jest

## Summary

This architecture provides:
- ✅ **Modularity**: Clear separation of concerns
- ✅ **Testability**: Pure functions and dependency injection
- ✅ **Maintainability**: Configuration-driven design
- ✅ **Extensibility**: Easy to add new features
- ✅ **Performance**: Efficient game loop and rendering
- ✅ **Security**: Electron best practices
