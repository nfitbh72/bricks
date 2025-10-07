# Bricks Game

A dystopian-styled brick-breaking game built with Electron, TypeScript, and Canvas API. Clear all the bricks to win each level while managing your health and upgrading your abilities.

## 🎮 Game Overview

**Objective**: Destroy all bricks in each level by bouncing a ball off your bat (paddle).

**Features**:
- 🎨 Dystopian aesthetic with bright neon colors
- 🖥️ Fullscreen immersive gameplay
- 🎯 Multiple levels with increasing difficulty
- 💪 Upgrade system between levels
- ⌨️ Keyboard and mouse controls
- ❤️ Health system with game over mechanics

## 🚀 Quick Start

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Run in development mode**:
   ```bash
   npm run dev
   ```

3. **Build for production**:
   ```bash
   npm run build
   npm start
   ```

## 🎯 How to Play

- **Move Bat**: Use arrow keys (←/→) or mouse to control the paddle
- **Start Game**: Click the START button on the intro screen
- **Objective**: Destroy all bricks without losing all your health
- **Health**: You lose health when the ball hits the back wall
- **Win**: Clear all bricks to complete the level and choose upgrades

## 📁 Project Structure

```
bricks/
├── src/
│   ├── main/              # Electron main process
│   │   ├── main.ts        # Main entry point
│   │   └── preload.ts     # Preload script for secure IPC
│   └── renderer/          # Renderer process (game UI)
│       ├── game/          # Game engine and entities
│       │   ├── Game.ts    # Main game engine
│       │   ├── Ball.ts    # Ball entity
│       │   ├── Bat.ts     # Bat/paddle entity
│       │   ├── Brick.ts   # Brick entity
│       │   ├── Level.ts   # Level manager
│       │   └── types.ts   # Shared types
│       ├── config/        # Game configuration
│       │   └── levels.ts  # Level definitions
│       ├── index.html     # Main HTML file
│       ├── styles.css     # Styles
│       └── renderer.ts    # Renderer entry point
├── tests/                 # Test files
├── dist/                  # Compiled JavaScript (generated)
├── docs/                  # Documentation
│   ├── architecture.md    # Technical architecture
│   └── planning.md        # Development roadmap
├── package.json
└── tsconfig.json
```

## 🛠️ Development

- **Build once**: `npm run build`
- **Watch mode**: `npm run watch` (auto-rebuild on changes)
- **Run app**: `npm run dev`
- **Run tests**: `npm test`
- **Run tests (watch)**: `npm run test:watch`

## 📚 Documentation

- [Architecture](./docs/architecture.md) - Technical design and module structure
- [Planning](./docs/planning.md) - Development roadmap and iteration plan

## 🎨 Game Design

**Visual Style**: Dystopian with bright neon colors (cyan, magenta, yellow, green)
**Level 1 Configuration**:
- Bricks form the word "BRICKS"
- Each brick has 1 health
- Player starts with 3 health
- Ball speed: 1 (base speed)
- Bat dimensions: 100x10 pixels

## 🧪 Testing

The project uses Jest for testing with a focus on:
- Unit tests for game entities (Ball, Bat, Brick)
- Integration tests for collision detection
- Game state management tests

## 📝 License

MIT
