# Building Bricks with UPGRADES

## Prerequisites
- Node.js 18+ 
- npm

## Development

```bash
# Install dependencies
npm install

# Build the project (includes linting)
npm run build

# Run in development mode
npm run dev

# Run linter
npm run lint

# Run linter with auto-fix
npm run lint:fix

# Run tests (includes linting)
npm test
```

### Build Process

The build process consists of four steps:

1. **Linting** (`npm run lint`)
   - Runs ESLint on all TypeScript files
   - Catches code quality issues and potential bugs
   - Enforces consistent code style

2. **Main process compilation** (`npm run build:main`)
   - Compiles TypeScript files for the Electron main process
   - Output: `dist/main/`

3. **Renderer process bundling** (`npm run build:renderer`)
   - Bundles TypeScript and SCSS files using webpack
   - Compiles SCSS to CSS and injects styles
   - Bundles font assets
   - Output: `dist/renderer/renderer.js` and assets

4. **Asset copying** (`npm run copy-assets`)
   - Copies HTML, fonts, images, sounds, and i18n files
   - Output: `dist/renderer/assets/` and `dist/renderer/i18n/`

### Styling System

The project uses **typed SCSS modules** for maintainable, type-safe styling:

- **SCSS files**: Located in `src/renderer/styles/`
  - `_variables.scss` - Colors, fonts, sizes
  - `_fonts.scss` - Font-face declarations
  - `_mixins.scss` - Reusable style patterns
  - `base.scss` - Base HTML/body styles
  - `index.scss` - Main entry point

- **Font constants**: TypeScript constants in `src/renderer/config/fontStyles.ts`
  - Type-safe font strings for canvas rendering
  - Synchronized with SCSS variables
  - Provides autocomplete and refactoring support

## Building Distributables

### Build for current platform
```bash
npm run dist
```

### Build for macOS
```bash
npm run dist:mac
```
Creates:
- `release/Bricks with UPGRADES-1.0.0.dmg` (installer)
- `release/Bricks with UPGRADES-1.0.0-mac.zip` (portable)

### Build for Windows
```bash
npm run dist:win
```
Creates:
- `release/Bricks with UPGRADES Setup 1.0.0.exe` (installer)
- `release/Bricks with UPGRADES 1.0.0.exe` (portable)

### Build for all platforms
```bash
npm run dist
```

## Notes

- **Icons**: Place icon files in `build/` directory:
  - `icon.icns` for macOS (512x512 or larger)
  - `icon.ico` for Windows (256x256 or larger)
  - `icon.png` for Linux (512x512 or larger)

- **Cross-platform building**: 
  - macOS can build for all platforms
  - Windows can build for Windows and Linux
  - Linux can build for Linux only

- **Code signing**: For production releases, configure code signing in `package.json` build section

## Output

Built applications will be in the `release/` directory.
