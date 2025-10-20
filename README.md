# Bricks Game

Dystopian brick-breaking game built with Electron + TypeScript + Canvas.

## 🚀 Quick Start

```bash
npm install          # Install dependencies
npm run dev          # Run in development mode
npm test             # Run test suite
```

## 📦 Build & Distribution

```bash
npm run build        # Compile TypeScript → dist/
npm start            # Run compiled app
npm run watch        # Auto-rebuild on changes
```

**Output**: Compiled JavaScript in `dist/` directory

## 📁 Code Locations

### Core Game Engine
```
src/renderer/game/
├── core/
│   ├── Game.ts              # 🎮 Main game loop & orchestration
│   ├── types.ts             # Type definitions
│   └── utils.ts             # Utility functions
│
├── entities/                # Game objects
│   ├── Ball.ts              # Player ball
│   ├── Bat.ts               # Player paddle
│   ├── Brick.ts             # Brick entity
│   ├── Level.ts             # Level container
│   └── offensive/           # Enemy projectiles
│       ├── BrickLaser.ts
│       ├── Debris.ts
│       └── FallingBrick.ts
│
├── managers/                # Subsystem coordinators
│   ├── AudioManager.ts      # 🔊 Sound/music
│   ├── CollisionManager.ts  # 💥 Collision detection
│   ├── EffectsManager.ts    # ✨ Visual effects
│   ├── InputManager.ts      # ⌨️ Input handling
│   ├── OffensiveEntityManager.ts
│   ├── ScreenManager.ts     # 🖥️ UI coordination
│   ├── SlowMotionManager.ts
│   ├── StateTransitionHandler.ts
│   └── WeaponManager.ts
│
├── systems/                 # Game systems
│   ├── GameUpgrades.ts      # 💪 Upgrade logic
│   └── Leaderboard.ts
│
├── weapons/
│   └── Laser.ts             # Player laser
│
└── ui/                      # HUD elements
    ├── DamageNumber.ts
    ├── ParticleSystem.ts
    └── StatusBar.ts
```

### Configuration & Content
```
src/renderer/config/
├── constants.ts             # 🎯 Game balance values
├── levels.ts                # 📊 Level definitions
├── upgrades.ts              # 🌳 Upgrade tree config
└── brickLayout.ts           # Brick positioning

src/renderer/ui/             # 🖼️ UI Screens
├── IntroScreen.ts
├── GameOverScreen.ts
├── PauseScreen.ts
├── OptionsScreen.ts
├── LevelCompleteScreen.ts
├── UpgradeTreeScreen.ts
└── TransitionScreen.ts

src/renderer/i18n/           # 🌍 Translations
├── LanguageManager.ts
└── *.json                   # Language files (en, es, fr, de, ja)
```

### Entry Points
- `src/main/main.ts` - Electron main process
- `src/renderer/renderer.ts` - Game initialization
- `src/renderer/index.html` - HTML entry

## 🔑 Key Reminders

### Adding New Features
- **Game logic** → `src/renderer/game/core/Game.ts`
- **Constants** → `src/renderer/config/constants.ts`
- **New levels** → `src/renderer/config/levels.ts`
- **Upgrades** → `src/renderer/config/upgrades.ts`
- **Translations** → `src/renderer/i18n/*.json`

### Testing
```bash
npm test                    # Run all tests
npm run test:watch          # Watch mode
```
- Tests in `tests/unit/` and `tests/integration/`
- 658 tests covering entities, managers, and systems
- Avoid testing DOM/jsdom (per methodology)

### Architecture
- **Modular design** - Each manager handles one concern
- **Manager pattern** - Coordinators in `game/managers/`
- **Entity-component** - Game objects in `game/entities/`
- **Centralized config** - All constants in `config/`

### ⚠️ StateTransitionHandler Critical Rules

**When modifying `StateTransitionHandler.ts` or `Game.ts` handlers:**

1. **Handlers that use `setters` directly** (setGameState, setCurrentLevelId, etc.):
   - ❌ DO NOT call `syncFromTransitionContext()`
   - Examples: `handleDevUpgrades`, `handleLevelCompleteTransition`, `handlePause`

2. **Handlers that use `startTransition` with sync callbacks**:
   - ✅ DO call `syncFromTransitionContext()`
   - Examples: `handleStartGame`, `handleRestart`

3. **Handlers that use `startTransition` with async callbacks**:
   - ❌ DO NOT call `syncFromTransitionContext()`
   - Examples: `handleUpgradeComplete`, `handleStartLevel`

**Why?** The context object passes primitive values by value, not reference. Calling sync after using setters will overwrite your changes with stale values.

See `docs/architecture.md` for detailed design.

## 📝 License

MIT
