# Development Planning

This document provides a step-by-step roadmap for building the Bricks game iteratively. Each phase builds upon the previous one, with clear deliverables and testing checkpoints.

## Development Principles

1. **Incremental Development**: Build and test one feature at a time
2. **Test-Driven**: Write tests before or alongside implementation
3. **Configuration-Driven**: Keep game logic separate from level data
4. **Modularity**: Each class has a single, well-defined responsibility

After each phase, prepare a git commit command with a brief commit message
---

## Phase 0: Project Setup ✅

**Status**: Complete (existing Electron + TypeScript setup)

**Deliverables**:
- ✅ Electron app structure
- ✅ TypeScript configuration
- ✅ Build scripts
- ✅ Basic window with fullscreen

---

## Phase 1: Testing Infrastructure & Core Types ✅

**Status**: Complete

**Goal**: Set up testing framework and define core types/interfaces.

### Tasks

1. **Install Jest and dependencies** ✅
   ```bash
   npm install --save-dev jest ts-jest @types/jest
   ```

2. **Configure Jest** ✅
   - Create `jest.config.js`
   - Configure TypeScript support
   - Add test scripts to `package.json`

3. **Define core types** (`src/renderer/game/types.ts`) ✅
   - `Vector2D` interface (x, y coordinates)
   - `Rectangle` interface (x, y, width, height)
   - `Circle` interface (x, y, radius)
   - `GameState` enum
   - `LevelConfig` interface
   - `BrickConfig` interface
   - `Upgrade` interface
   - `CollisionResult` interface

4. **Create utility functions** (`src/renderer/game/utils.ts`) ✅
   - `checkRectCollision(rect1, rect2): boolean`
   - `checkCircleRectCollision(circle, rect): CollisionResult`
   - `normalize(vector): Vector2D`
   - `distance(point1, point2): number`
   - `dotProduct(v1, v2): number`
   - `reflect(vector, normal): Vector2D`
   - `clamp(value, min, max): number`
   - `lerp(start, end, t): number`
   - `magnitude(vector): number`
   - `scale(vector, scalar): Vector2D`

5. **Write tests** ✅
   - `tests/unit/utils.test.ts`: 35 tests, all passing

### Acceptance Criteria
- [x] Jest runs successfully with `npm test`
- [x] All utility functions have unit tests
- [x] Tests pass with 93.47% coverage for utils (exceeds 90% target)

### Results
- **35 tests passing**
- **93.47% line coverage** on utils.ts
- All collision detection, vector math, and helper functions tested

---

## Phase 2: Ball Entity ✅

**Status**: Complete

**Goal**: Implement the Ball class with movement and basic physics.

### Tasks

1. **Create Ball class** (`src/renderer/game/Ball.ts`) ✅
   - Properties: position (x, y), velocity (vx, vy), radius, speed
   - Constructor: Initialize with starting position and speed
   - `update(deltaTime)`: Update position based on velocity
   - `render(ctx)`: Draw ball on canvas with neon glow effect
   - `setVelocity(vx, vy)`: Set velocity vector
   - `reverseX()`: Reverse horizontal velocity (bounce)
   - `reverseY()`: Reverse vertical velocity (bounce)
   - `reset()`: Reset to starting position
   - `launch(angle)`: Launch ball at specific angle
   - `setPosition(x, y)`: Set position directly
   - `getPosition()`, `getVelocity()`, `getBounds()`: Getters

2. **Write tests** (`tests/unit/Ball.test.ts`) ✅
   - Ball initialization
   - Position updates based on velocity
   - Velocity changes
   - Boundary checks
   - Launch mechanics
   - Render testing with mocked canvas context

3. **Create simple test harness** ⏭️
   - Deferred to Phase 7 (Game Engine Core)

### Acceptance Criteria
- [x] Ball class implemented with all methods
- [x] Unit tests pass with 100% coverage on Ball.ts
- [x] 37 tests passing for Ball entity

### Results
- **37 tests passing** for Ball class
- **100% coverage** on Ball.ts (lines, branches, functions)
- **72 total tests passing** (Ball + utils)
- Ball includes dystopian neon cyan glow effect

---

## Phase 3: Bat Entity ✅

**Status**: Complete

**Goal**: Implement the Bat class with keyboard and mouse controls.

### Tasks

1. **Create Bat class** (`src/renderer/game/Bat.ts`) ✅
   - Properties: position (x, y), width, height, speed
   - Constructor: Initialize with position and dimensions
   - `update(deltaTime)`: Update position based on input
   - `render(ctx)`: Draw bat on canvas with neon magenta glow
   - `moveLeft(deltaTime)`: Move bat left
   - `moveRight(deltaTime)`: Move bat right
   - `setX(x)`: Set horizontal position (for mouse control, centers bat)
   - `setBounds(minX, maxX)`: Set boundary constraints
   - `getRelativeHitPosition(ballX)`: Calculate hit position for angle-based bouncing
   - `getCenterX()`, `getCenterY()`: Get center positions
   - `getPosition()`, `getBounds()`, getters for width, height, speed

2. **Implement input handling** (`src/renderer/renderer.ts`) ⏭️
   - Deferred to Phase 7 (Game Engine Core)
   - Input handling will be integrated with game loop

3. **Write tests** (`tests/unit/Bat.test.ts`) ✅
   - Bat initialization
   - Movement left/right with deltaTime
   - Boundary constraints
   - Position setting (direct and mouse-centered)
   - Relative hit position calculation
   - Integration tests for movement combinations

### Acceptance Criteria
- [x] Bat class implemented with all methods
- [x] Bat stays within screen bounds
- [x] Unit tests pass with 100% coverage on Bat.ts
- [x] 45 tests passing for Bat entity

### Results
- **66 tests passing** for Bat class
- **100% coverage** on Bat.ts (lines, branches, functions)
- **138 total tests passing** (Ball + Bat + utils)
- Bat includes dystopian neon magenta glow effect
- Relative hit position method ready for angle-based ball bouncing
- **2D movement support**: moveUp(), moveDown(), setY(), setMousePosition()
- Optional vertical bounds for flexible positioning

---

## Phase 4: Brick Entity ✅

**Status**: Complete

**Goal**: Implement the Brick class with health and destruction.

### Tasks

1. **Create Brick class** (`src/renderer/game/Brick.ts`) ✅
   - Properties: position (x, y), width, height, health, maxHealth, customColor
   - Constructor: Initialize with position, dimensions, and health
   - `takeDamage(amount)`: Reduce health (supports fractional damage)
   - `isDestroyed()`: Check if health <= 0
   - `render(ctx)`: Draw brick with visual feedback based on health
   - `getColor()`: Return color based on health percentage or custom color
   - `getHealthPercentage()`: Calculate health as 0-1 value
   - `restore()`: Restore to full health
   - `setHealth(health)`: Set health directly (clamped to 0-maxHealth)
   - `getBounds()`, `getPosition()`: Getters for collision detection

2. **Write tests** (`tests/unit/Brick.test.ts`) ✅
   - Brick initialization
   - Damage handling (including fractional and zero damage)
   - Destruction detection
   - Health percentage calculation
   - Color system (health-based and custom)
   - Restoration and health setting
   - Render behavior (including destroyed bricks)
   - Integration tests for damage/destruction flow

### Acceptance Criteria
- [x] Brick class implemented with all methods
- [x] Bricks change appearance based on health (color + opacity)
- [x] Unit tests pass with 100% coverage on Brick.ts
- [x] 47 tests passing for Brick entity

### Results
- **47 tests passing** for Brick class
- **100% coverage** on Brick.ts (lines, branches, functions)
- **185 total tests passing** (Ball + Bat + Brick + utils)
- **Health-based color system**: Green (>66%), Yellow (33-66%), Magenta (<33%), Gray (destroyed)
- **Opacity changes** with health (0.3 to 1.0)
- **Custom color support** for special bricks
- **Dystopian neon glow effect** with borders

---

## Phase 5: Level Configuration ✅

**Status**: Complete

**Goal**: Create level configuration system and implement Level 1.

### Tasks

1. **Create level configuration** (`src/renderer/config/levels.ts`) ✅
   - Define `LevelConfig` structure
   - Implement Level 1: Bricks forming "BRICKS"
   - Helper functions: `createTextLayout`, `createLetterBricks`, `createWordBricks`
   - Letter patterns for B, R, I, C, K, S (5x5 grid patterns)
   - `getLevel(id)`: Retrieve level by ID

2. **Create Level class** (`src/renderer/game/Level.ts`) ✅
   - Properties: config, bricks array
   - Constructor: Load level config and create bricks
   - `getBricks()`: Return all bricks
   - `getActiveBricks()`: Return non-destroyed bricks
   - `isComplete()`: Check if all bricks destroyed
   - `getRemainingBricks()`: Count active bricks
   - `getTotalBricks()`: Get total brick count
   - `reset()`: Restore all bricks to full health
   - `render(ctx)`: Render all bricks
   - Getters: `getId()`, `getName()`, `getBallSpeed()`, `getBatWidth()`, `getBatHeight()`, `getPlayerHealth()`

3. **Write brick layout helpers** ✅
   - `createTextLayout()`: Simple text to bricks (character-based)
   - `createLetterBricks()`: Create bricks from 5x5 letter patterns
   - `createWordBricks()`: Create word from letter patterns with spacing

4. **Write tests** (`tests/unit/Level.test.ts`) ✅
   - Level configuration helpers (createTextLayout, createLetterBricks, createWordBricks)
   - LEVEL_1 validation
   - Level class functionality
   - Brick creation from config
   - Completion detection
   - Reset functionality
   - Integration with LEVEL_1

### Acceptance Criteria
- [x] Level 1 configuration complete (BRICKS layout using letter patterns)
- [x] Level class loads and creates bricks correctly
- [x] Helper functions create proper brick layouts
- [x] Unit tests pass with 100% coverage on Level.ts and levels.ts
- [x] 59 tests passing for Level system

### Results
- **59 tests passing** for Level system
- **100% coverage** on Level.ts (lines, branches, functions)
- **100% coverage** on levels.ts (statements, functions)
- **244 total tests passing** (Ball + Bat + Brick + Level + utils)
- **93.51% overall code coverage**
- **Letter patterns** for all letters in "BRICKS"
- **Configurable spacing** between letters and bricks
- **LEVEL_1** creates "BRICKS" word with proper game parameters

---

## Phase 6: Collision Detection ✅

**Status**: Complete

**Goal**: Implement collision detection between all game entities.

### Tasks

1. **Implement collision detection** (`src/renderer/game/utils.ts`) ✅
   - Ball vs Rectangle (bat, bricks) - using existing `checkCircleRectCollision`
   - Ball vs walls - implemented in Ball class
   - Calculate bounce angles - using `reflect` and `normalize` utilities

2. **Add collision response to Ball** ✅
   - `bounce(normal)`: Bounce off surface with given normal vector
   - `bounceOffBat(bat)`: Angle-based bounce (±60° from vertical based on hit position)
   - `checkWallCollisions(minX, maxX, minY, maxY)`: Handle all wall bounces, returns true if back wall hit

3. **Write comprehensive tests** (`tests/integration/collision.test.ts`) ✅
   - Ball-bat collisions (center, edges, speed preservation)
   - Ball-brick collisions (detection, normal vectors, damage)
   - Ball-wall collisions (all 4 walls, back wall detection)
   - Complex scenarios (bat-brick bouncing, multiple bricks)
   - Edge cases (corners, zero velocity, high speed, exact boundaries)

### Acceptance Criteria
- [x] Ball bounces correctly off bat with angle based on hit position
- [x] Ball bounces correctly off bricks using normal vectors
- [x] Ball bounces correctly off all walls
- [x] Bat hit position affects ball angle (±60° max deflection)
- [x] Integration tests pass with 100% coverage on collision code
- [x] 24 integration tests passing

### Results
- **24 integration tests passing** for collision detection
- **100% coverage** on Ball.ts collision methods
- **95.91% coverage** on utils.ts (collision helpers)
- **268 total tests passing** across the project
- **95.12% overall code coverage**
- **Angle-based bat bouncing**: Center = straight up, edges = ±60° deflection
- **Back wall detection**: Returns true when ball hits bottom wall (player loses health)
- **Speed preservation**: Ball maintains speed after bat bounce
- **Robust wall handling**: Corrects position and reverses velocity

---

## Phase 7: Game Engine Core ✅

**Status**: Complete

**Goal**: Implement the main Game class with game loop and state management.

### Tasks

1. **Create Game class** (`src/renderer/game/Game.ts`) ✅
   - Properties: canvas, context, ball, bat, level, gameState, playerHealth
   - Constructor: Initialize canvas and entities
   - `start()`: Start game loop with `requestAnimationFrame`
   - `stop()`: Stop game loop
   - `update(deltaTime)`: Update all entities with fixed timestep
   - `render()`: Render all entities
   - `checkCollisions()`: Check and handle all collisions
   - `loadLevel(config)`: Load a new level
   - Input handling: WASD + Arrow keys + 2D mouse control
   - Grey ball system: Ball turns grey after hitting back wall, passes through bat

2. **Implement game loop** ✅
   - Use `requestAnimationFrame` for smooth rendering
   - Fixed timestep (1/60 second) for consistent physics
   - Accumulator pattern for frame-independent updates
   - Update → Check Collisions → Render

3. **Implement health system** ✅
   - Health decreases when ball hits back wall
   - Ball turns grey and passes through bat after back wall hit
   - Ball restores to normal (cyan) when hitting brick or side/top walls
   - Game over (paused) when health reaches 0
   - Health displayed as hearts (❤️) at bottom of screen

4. **Ball grey state system** ✅
   - `setGrey(boolean)`: Set grey state
   - `getIsGrey()`: Check if grey
   - `restoreToNormal()`: Restore to normal
   - Grey ball renders in grey color (#666666)
   - Grey ball passes through bat (no collision)
   - Grey ball still damages bricks normally

5. **Write tests** ✅
   - Added 8 tests for grey ball state
   - All existing collision tests updated and passing
   - 276 total tests passing

### Acceptance Criteria
- [x] Game loop runs with fixed 60 FPS timestep
- [x] All entities update and render correctly
- [x] Collisions work in full game context
- [x] Health decreases when ball hits back wall
- [x] Grey ball system works (passes through bat, restores on brick/wall hit)
- [x] Input handling works (WASD + Arrows + 2D mouse)
- [x] Game pauses on GAME_OVER state
- [x] Level completion transitions to LEVEL_COMPLETE state

### Results
- **Game.ts** implemented (318 lines)
- **Ball grey state** added with 8 new tests
- **276 total tests passing** (8 new grey state tests)
- **Fixed timestep game loop** with accumulator pattern
- **Dual input system**: Keyboard (WASD + Arrows) and 2D mouse
- **Grey ball mechanics**: Turns grey on back wall hit, restores on brick/side/top wall hit
- **Health display**: Hearts (❤️) shown at bottom of screen
- **State management**: PLAYING, LEVEL_COMPLETE, GAME_OVER

---

## Phase 8: UI Screens ✅

**Status**: Complete

**Goal**: Implement intro, game over, and level complete screens.

### Tasks

1. **Create UI base classes** ✅
   - `Button.ts`: Reusable button component with neon glow effects
   - `Screen.ts`: Base class for all UI screens
   - Moved font file to `src/renderer/assets/fonts/`

2. **Create IntroScreen class** (`src/renderer/ui/IntroScreen.ts`) ✅
   - Display game title: "BRICKS with UPGRADES"
   - START button (Space/Enter/Click)
   - QUIT button
   - Dystopian neon aesthetic

3. **Create GameOverScreen class** (`src/renderer/ui/GameOverScreen.ts`) ✅
   - Display "GAME OVER" or "COMPLETE!" (if all levels done)
   - Show stats: level reached, bricks destroyed
   - RESTART button → Intro screen
   - QUIT button
   - 1 second delay before showing

4. **Create LevelCompleteScreen class** (`src/renderer/ui/LevelCompleteScreen.ts`) ✅
   - Display "LEVEL COMPLETE!"
   - Show current level number
   - CONTINUE button (Space/Enter/Click)
   - Upgrades deferred to Phase 10

5. **Implement screen transitions** (`src/renderer/ui/TransitionScreen.ts`) ✅
   - 2-second spinning brick animation
   - Fade in/out effects
   - 2D rotating rectangle with neon glow

6. **Integrate into Game class** ✅
   - Screen state management (INTRO, PLAYING, LEVEL_COMPLETE, GAME_OVER)
   - Input handling for screens (keyboard + mouse)
   - Button hover effects
   - Stats tracking (level, bricks destroyed)
   - Navigation flow implementation
   - QUIT functionality via Electron IPC

7. **Electron integration** ✅
   - Updated preload.ts to expose quit API
   - Updated main.ts to handle quit-app IPC event
   - Added global type declarations

### Acceptance Criteria
- [x] All screens render correctly with dystopian neon style
- [x] Buttons work (click and keyboard: Space/Enter)
- [x] Transitions are smooth with spinning brick (2 seconds)
- [x] Game flow works: INTRO → PLAYING → LEVEL_COMPLETE → Next Level
- [x] Game Over shows correct stats (level reached, bricks destroyed)
- [x] QUIT button closes Electron app
- [x] 1 second delay before showing Game Over screen
- [x] "COMPLETE!" message when all levels finished

### Results
- **6 UI classes** created (Button, Screen, IntroScreen, GameOverScreen, LevelCompleteScreen, TransitionScreen)
- **Game.ts** updated with full screen integration
- **D Day Stencil font** integrated for dystopian aesthetic
- **Spinning brick transition** with 2-second fade animation
- **Complete navigation flow** implemented
- **Stats tracking** for level progression and brick destruction
- **Electron IPC** for quit functionality
- **276 tests** still passing (UI screens don't have unit tests yet)

---

## Phase 9: Visual Polish ✅

**Status**: Complete

**Goal**: Add visual effects and polish to match dystopian aesthetic.

### Tasks

1. **Create particle system** (`src/renderer/game/ParticleSystem.ts`) ✅
   - Particle class with position, velocity, life, color, size
   - 10 particles per destroyed brick
   - Particles match brick color
   - Fade out over 0.5 seconds with gravity
   - Glow effect on particles

2. **Implement screen shake** ✅
   - Triggers on back wall hit (player loses health)
   - Subtle intensity (3px)
   - Duration: 0.2 seconds
   - Random shake within intensity bounds
   - Does not affect UI rendering

3. **Add CRT/scanline overlay** ✅
   - Horizontal scanlines every 2 pixels
   - 10% opacity for authentic CRT look
   - Radial vignette effect (darkens edges)
   - Applied only during gameplay

4. **Enhanced glow effects** ✅
   - Ball and bat already have neon glow (from Phase 2-3)
   - Particles have matching glow effects
   - Bricks have neon borders with glow

### Acceptance Criteria
- [x] Game has polished, dystopian visual style
- [x] Particle effects work on brick destruction (10 particles, fade out, same color)
- [x] Screen shake on back wall hit (subtle, 3px, 0.2s)
- [x] CRT scanline overlay adds retro aesthetic
- [x] Game runs smoothly at 60 FPS

### Results
- **ParticleSystem.ts** created (100 lines)
- **10 particles** spawn when brick is destroyed
- **Screen shake** on health loss only (subtle 3px)
- **CRT overlay** with scanlines and vignette
- **Performance**: Smooth 60 FPS maintained
- **Visual cohesion**: All effects match dystopian neon aesthetic

---

## Phase 10: Upgrade System

**Goal**: Implement upgrade selection between levels.

### Tasks

1. **Define upgrade types** (`src/renderer/game/types.ts`)
   - Bat width increase
   - Ball speed decrease
   - Extra health
   - Multi-ball (future)

2. **Implement upgrade application** (`src/renderer/game/Game.ts`)
   - `applyUpgrade(upgrade)`: Modify game parameters
   - Store active upgrades

3. **Create upgrade UI** (`src/renderer/ui/UpgradeScreen.ts`)
   - Display 3 random upgrade options
   - Handle selection
   - Show upgrade descriptions

4. **Write tests** (`tests/unit/upgrades.test.ts`)
   - Upgrade application
   - Upgrade stacking
   - Upgrade limits

### Acceptance Criteria
- [ ] 3 upgrade options shown after level completion
- [ ] Upgrades correctly modify game parameters
- [ ] Upgrades persist across levels
- [ ] Tests pass for upgrade system

### Questions to Consider
- Should upgrades stack or replace?
- Should there be negative upgrades (risks/rewards)?
- How many upgrades should be available total?

---

## Phase 11: Multiple Levels

**Goal**: Create additional levels with increasing difficulty.

### Tasks

1. **Design Level 2-5** (`src/renderer/config/levels.ts`)
   - Level 2: More bricks, some with 2 health
   - Level 3: Moving bricks (future enhancement)
   - Level 4: Complex patterns
   - Level 5: Boss level with special mechanics

2. **Implement level progression**
   - Load next level after completion
   - Track current level
   - Increase difficulty (ball speed, brick health)

3. **Add level selection** (optional)
   - Level select screen
   - Unlock levels as player progresses

### Acceptance Criteria
- [ ] 5 levels designed and implemented
- [ ] Difficulty increases appropriately
- [ ] Level progression works smoothly
- [ ] Player can progress through all levels

### Questions to Consider
- Should levels have themes?
- Do we want procedurally generated levels?
- Should there be a level editor?

---

## Phase 12: Sound & Music

**Goal**: Add audio feedback and background music.

### Tasks

1. **Create AudioManager class** (`src/renderer/game/AudioManager.ts`)
   - Load and manage audio files
   - Play sound effects
   - Control music volume

2. **Add sound effects**
   - Ball bounce (different for bat, brick, wall)
   - Brick destruction
   - Health loss
   - Level complete
   - Game over

3. **Add background music**
   - Dystopian/electronic soundtrack
   - Loop seamlessly
   - Volume controls

### Acceptance Criteria
- [ ] Sound effects play on appropriate events
- [ ] Background music loops
- [ ] Audio can be muted
- [ ] No audio glitches or delays

### Questions to Consider
- Should music change based on game state?
- Do we want dynamic music that responds to gameplay?
- Should there be different tracks for different levels?

---

## Phase 13: Final Polish & Testing

**Goal**: Bug fixes, optimization, and comprehensive testing.

### Tasks

1. **Comprehensive testing**
   - Play through all levels
   - Test all upgrade combinations
   - Test edge cases
   - Performance testing

2. **Bug fixes**
   - Fix any discovered issues
   - Optimize performance bottlenecks
   - Improve collision detection accuracy

3. **User experience improvements**
   - Add keyboard shortcuts
   - Improve UI responsiveness
   - Add tooltips/help text

4. **Documentation**
   - Update README with final features
   - Add gameplay GIF/video
   - Document controls clearly

### Acceptance Criteria
- [ ] All tests pass
- [ ] No known bugs
- [ ] Game runs smoothly on target hardware
- [ ] Documentation is complete

---

## Phase 14: Packaging & Distribution

**Goal**: Package the game for distribution.

### Tasks

1. **Set up electron-builder**
   ```bash
   npm install --save-dev electron-builder
   ```

2. **Configure build**
   - Add build config to `package.json`
   - Set up icons
   - Configure installers

3. **Build for platforms**
   - macOS (DMG)
   - Windows (EXE)
   - Linux (AppImage)

4. **Test installers**
   - Install on clean systems
   - Verify all features work

### Acceptance Criteria
- [ ] Installers build successfully
- [ ] Game installs and runs on all platforms
- [ ] No installation errors

---

## Future Enhancements

Ideas for post-launch updates:

1. **Gameplay**
   - Power-ups (slow-mo, shield, laser)
   - Boss battles
   - Endless mode
   - Time attack mode

2. **Progression**
   - Achievements
   - Leaderboards
   - Daily challenges
   - Unlockable skins

3. **Social**
   - Share scores
   - Replay system
   - Level sharing

4. **Technical**
   - Save/load system
   - Settings menu
   - Gamepad support
   - Mobile version

---

## Summary

This planning document provides a clear roadmap from basic setup to a fully-featured game. Each phase builds incrementally, with testing checkpoints to ensure quality. Follow the phases in order, and ask questions when assumptions need clarification.

**Current Status**: Phase 0 complete, ready to begin Phase 1.

**Next Steps**: Set up Jest and define core types (Phase 1).
