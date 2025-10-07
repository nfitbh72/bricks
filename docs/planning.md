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

## Phase 4: Brick Entity

**Goal**: Implement the Brick class with health and destruction.

### Tasks

1. **Create Brick class** (`src/renderer/game/Brick.ts`)
   - Properties: position (x, y), width, height, health, maxHealth, color
   - Constructor: Initialize with position, dimensions, and health
   - `takeDamage(amount)`: Reduce health
   - `isDestroyed()`: Check if health <= 0
   - `render(ctx)`: Draw brick with visual feedback based on health
   - `getColor()`: Return color based on health percentage

2. **Write tests** (`tests/unit/Brick.test.ts`)
   - Brick initialization
   - Damage handling
   - Destruction detection
   - Health percentage calculation

### Acceptance Criteria
- [ ] Brick class implemented with all methods
- [ ] Bricks change appearance based on health
- [ ] Unit tests pass with >90% coverage
- [ ] Can render multiple bricks on canvas

### Questions to Consider
- Should bricks have different colors based on health?
- Do we want particle effects when bricks are destroyed?
- Should some bricks be indestructible (for future levels)?

---

## Phase 5: Level Configuration

**Goal**: Create level configuration system and implement Level 1.

### Tasks

1. **Create level configuration** (`src/renderer/config/levels.ts`)
   - Define `LevelConfig` structure
   - Implement Level 1: Bricks forming "BRICKS"
   - Helper function to create brick layouts from text

2. **Create Level class** (`src/renderer/game/Level.ts`)
   - Properties: config, bricks array
   - Constructor: Load level config and create bricks
   - `getBricks()`: Return brick array
   - `isComplete()`: Check if all bricks destroyed
   - `getRemainingBricks()`: Count active bricks

3. **Write brick layout helper**
   - `createTextLayout(text, x, y, brickWidth, brickHeight): BrickConfig[]`
   - Convert text string to brick positions

4. **Write tests** (`tests/unit/Level.test.ts`)
   - Level loading
   - Brick creation from config
   - Completion detection

### Acceptance Criteria
- [ ] Level 1 configuration complete (BRICKS layout)
- [ ] Level class loads and creates bricks correctly
- [ ] Helper function creates proper brick layouts
- [ ] Unit tests pass with >90% coverage

### Questions to Consider
- How should we handle spacing between letters?
- Should bricks be different sizes for different letters?
- Do we want to support multi-line text layouts?

---

## Phase 6: Collision Detection

**Goal**: Implement collision detection between all game entities.

### Tasks

1. **Implement collision detection** (`src/renderer/game/utils.ts`)
   - Ball vs Rectangle (bat, bricks)
   - Ball vs walls
   - Calculate bounce angles

2. **Add collision response to Ball**
   - `bounce(normal)`: Bounce off surface with given normal
   - `bounceOffBat(bat)`: Special bounce logic for bat (angle based on hit position)

3. **Write comprehensive tests** (`tests/integration/collision.test.ts`)
   - Ball-bat collisions
   - Ball-brick collisions
   - Ball-wall collisions
   - Edge cases (corners, multiple simultaneous collisions)

### Acceptance Criteria
- [ ] Ball bounces correctly off bat
- [ ] Ball bounces correctly off bricks
- [ ] Ball bounces correctly off walls
- [ ] Bat hit position affects ball angle
- [ ] Integration tests pass with >85% coverage

### Questions to Consider
- Should we add spin/curve to the ball based on bat movement?
- How should we handle simultaneous collisions (ball in corner)?
- Do we want different bounce behaviors for different brick types?

---

## Phase 7: Game Engine Core

**Goal**: Implement the main Game class with game loop and state management.

### Tasks

1. **Create Game class** (`src/renderer/game/Game.ts`)
   - Properties: canvas, context, ball, bat, level, gameState, playerHealth
   - Constructor: Initialize canvas and entities
   - `start()`: Start game loop
   - `pause()`: Pause game
   - `resume()`: Resume game
   - `update(deltaTime)`: Update all entities
   - `render()`: Render all entities
   - `checkCollisions()`: Check and handle all collisions
   - `loadLevel(config)`: Load a new level

2. **Implement game loop**
   - Use `requestAnimationFrame`
   - Calculate deltaTime for frame-independent physics
   - Update → Check Collisions → Render

3. **Implement health system**
   - Decrease health when ball hits back wall
   - Game over when health reaches 0
   - Display health on screen

4. **Write tests** (`tests/integration/gameState.test.ts`)
   - Game initialization
   - State transitions
   - Health management
   - Level completion detection

### Acceptance Criteria
- [ ] Game loop runs at 60 FPS
- [ ] All entities update and render correctly
- [ ] Collisions work in full game context
- [ ] Health decreases when ball hits back wall
- [ ] Integration tests pass

### Questions to Consider
- Should we cap the frame rate or let it run freely?
- Do we want a score system in addition to health?
- Should there be a combo multiplier for consecutive brick hits?

---

## Phase 8: UI Screens

**Goal**: Implement intro, game over, and level complete screens.

### Tasks

1. **Create IntroScreen class** (`src/renderer/ui/IntroScreen.ts`)
   - Render title and START button
   - Handle click events
   - Dystopian styling with neon colors

2. **Create GameOverScreen class** (`src/renderer/ui/GameOverScreen.ts`)
   - Display "GAME OVER" message
   - Show final score/level
   - RESTART button

3. **Create LevelCompleteScreen class** (`src/renderer/ui/LevelCompleteScreen.ts`)
   - Display "LEVEL COMPLETE" message
   - Show upgrade options (placeholder for now)
   - CONTINUE button

4. **Integrate screens into Game class**
   - Render appropriate screen based on gameState
   - Handle state transitions

5. **Update styles** (`src/renderer/styles.css`)
   - Dystopian theme
   - Neon color palette
   - Button styles

### Acceptance Criteria
- [ ] Intro screen displays with START button
- [ ] Game over screen displays with RESTART button
- [ ] Level complete screen displays with CONTINUE button
- [ ] All screens have dystopian styling
- [ ] State transitions work correctly

### Questions to Consider
- Should the intro screen have animations?
- Do we want to show statistics on the game over screen?
- Should there be a pause screen as well?

---

## Phase 9: Visual Polish

**Goal**: Add visual effects and polish to match dystopian aesthetic.

### Tasks

1. **Enhance rendering**
   - Add glow effects to ball and bat
   - Add shadows and depth
   - Implement brick destruction particles
   - Add motion blur to ball

2. **Create particle system** (`src/renderer/game/ParticleSystem.ts`)
   - Particle class
   - Emitter class
   - Render particles on brick destruction

3. **Add visual feedback**
   - Screen shake on impacts
   - Flash effects on damage
   - Smooth color transitions

4. **Optimize rendering**
   - Only render visible objects
   - Use off-screen canvas for static elements

### Acceptance Criteria
- [ ] Game has polished, dystopian visual style
- [ ] Particle effects work on brick destruction
- [ ] Visual feedback enhances gameplay
- [ ] Game runs smoothly at 60 FPS

### Questions to Consider
- How intense should the screen shake be?
- Should we add a CRT/scanline effect?
- Do we want background animations?

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
