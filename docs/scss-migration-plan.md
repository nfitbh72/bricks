# SCSS Migration Plan

## Overview
Migrate from plain CSS to typed SCSS modules for better maintainability, type safety, and developer experience.

## Goals
- ✅ Type-safe font and color constants
- ✅ Centralized styling variables
- ✅ Reusable mixins for common patterns
- ✅ Zero runtime performance impact
- ✅ Better IDE autocomplete and error detection

---

## Phase 1: Setup & Dependencies

### 1.1 Install NPM Packages
```bash
npm install --save-dev sass sass-loader typed-scss-modules
```

**Packages:**
- `sass` - SCSS compiler
- `sass-loader` - Webpack loader for SCSS files
- `typed-scss-modules` - Generate TypeScript definitions from SCSS

### 1.2 Update Webpack Configuration
Add SCSS loader to `webpack.config.js`:
```javascript
{
  test: /\.scss$/,
  use: ['style-loader', 'css-loader', 'sass-loader'],
  exclude: /node_modules/,
}
```

### 1.3 Add NPM Scripts
Update `package.json`:
```json
{
  "scripts": {
    "generate:scss-types": "typed-scss-modules src/renderer/styles --watch",
    "build:styles": "sass src/renderer/styles/index.scss dist/renderer/styles.css",
    "build:renderer": "npm run build:styles && webpack"
  }
}
```

---

## Phase 2: SCSS Structure

### 2.1 Directory Structure
```
src/renderer/styles/
├── _variables.scss      # Colors, fonts, sizes, spacing
├── _fonts.scss          # @font-face declarations
├── _mixins.scss         # Reusable style mixins
├── base.scss            # Base HTML/body styles
└── index.scss           # Main entry (imports all)
```

### 2.2 File Contents

#### `_variables.scss`
```scss
// Font Families
$font-primary: 'D Day Stencil', Arial, sans-serif;
$font-secondary: 'Population Zero BB', 'D Day Stencil', Arial, sans-serif;
$font-monospace: 'Courier New', monospace;

// Font Sizes
$font-size-huge: 72px;
$font-size-xlarge: 64px;
$font-size-large: 48px;
$font-size-medium: 36px;
$font-size-normal: 32px;
$font-size-small: 28px;
$font-size-xsmall: 24px;
$font-size-tiny: 20px;
$font-size-micro: 18px;
$font-size-mini: 16px;
$font-size-brick: 12px;

// Colors - Neon/Dystopian Palette
$color-magenta: #ff00ff;
$color-cyan: #00ffff;
$color-green: #00ff00;
$color-yellow: #ffff00;
$color-red: #ff0000;
$color-orange: #ff4400;
$color-black: #0a0a0a;
$color-white: #ffffff;

// Glow/Shadow Blur Values
$glow-small: 5px;
$glow-medium: 10px;
$glow-normal: 15px;
$glow-large: 20px;
$glow-xlarge: 30px;
$glow-huge: 40px;
```

#### `_fonts.scss`
```scss
@font-face {
  font-family: 'D Day Stencil';
  src: url('./assets/fonts/D Day Stencil.ttf') format('truetype');
  font-weight: normal;
  font-style: normal;
}

@font-face {
  font-family: 'Population Zero BB';
  src: url('./assets/fonts/PopulationZeroBB.otf') format('opentype');
  font-weight: normal;
  font-style: normal;
}
```

#### `_mixins.scss`
```scss
// Text glow effect
@mixin text-glow($color, $blur: $glow-normal) {
  text-shadow: 0 0 $blur $color;
}

// Common font styles (for documentation, not canvas)
@mixin font-title-huge {
  font-family: $font-primary;
  font-size: $font-size-huge;
}

@mixin font-title-large {
  font-family: $font-primary;
  font-size: $font-size-xlarge;
}

@mixin font-title-medium {
  font-family: $font-primary;
  font-size: $font-size-large;
}
```

#### `base.scss`
```scss
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  width: 100vw;
  height: 100vh;
  background-color: $color-black;
  overflow: hidden;
}

#gameCanvas {
  display: block;
  width: 100%;
  height: 100%;
  background-color: $color-black;
  cursor: default;
}
```

#### `index.scss`
```scss
@import 'variables';
@import 'fonts';
@import 'mixins';
@import 'base';
```

---

## Phase 3: TypeScript Font Constants

### 3.1 Create Font Constants Module
New file: `src/renderer/config/fontStyles.ts`

```typescript
/**
 * Centralized font style constants for canvas rendering
 * Generated from SCSS variables for consistency
 */

// Font families
export const FONT_PRIMARY = '"D Day Stencil", Arial';
export const FONT_SECONDARY = '"Population Zero BB", "D Day Stencil", Arial';
export const FONT_MONOSPACE = '"Courier New", monospace';

// Font sizes (px)
export const FONT_SIZE_HUGE = 72;
export const FONT_SIZE_XLARGE = 64;
export const FONT_SIZE_LARGE = 48;
export const FONT_SIZE_MEDIUM = 36;
export const FONT_SIZE_NORMAL = 32;
export const FONT_SIZE_SMALL = 28;
export const FONT_SIZE_XSMALL = 24;
export const FONT_SIZE_TINY = 20;
export const FONT_SIZE_MICRO = 18;
export const FONT_SIZE_MINI = 16;
export const FONT_SIZE_BRICK = 12;

// Composite font strings (for ctx.font)
export const FONT_TITLE_HUGE = `${FONT_SIZE_HUGE}px ${FONT_PRIMARY}`;
export const FONT_TITLE_XLARGE = `${FONT_SIZE_XLARGE}px ${FONT_PRIMARY}`;
export const FONT_TITLE_LARGE = `${FONT_SIZE_LARGE}px ${FONT_PRIMARY}`;
export const FONT_TITLE_MEDIUM = `${FONT_SIZE_MEDIUM}px ${FONT_PRIMARY}`;
export const FONT_TITLE_NORMAL = `${FONT_SIZE_NORMAL}px ${FONT_PRIMARY}`;
export const FONT_TITLE_SMALL = `${FONT_SIZE_SMALL}px ${FONT_PRIMARY}`;
export const FONT_TITLE_XSMALL = `${FONT_SIZE_XSMALL}px ${FONT_PRIMARY}`;

export const FONT_SECONDARY_LARGE = `${FONT_SIZE_LARGE}px ${FONT_SECONDARY}`;
export const FONT_SECONDARY_TINY = `${FONT_SIZE_TINY}px ${FONT_SECONDARY}`;
export const FONT_SECONDARY_MICRO = `${FONT_SIZE_MICRO}px ${FONT_SECONDARY}`;
export const FONT_SECONDARY_MINI = `${FONT_SIZE_MINI}px ${FONT_SECONDARY}`;

export const FONT_MONO_BRICK = `${FONT_SIZE_BRICK}px ${FONT_MONOSPACE}`;
export const FONT_MONO_MINI = `${FONT_SIZE_MINI}px ${FONT_MONOSPACE}`;

// Glow blur values
export const GLOW_SMALL = 5;
export const GLOW_MEDIUM = 10;
export const GLOW_NORMAL = 15;
export const GLOW_LARGE = 20;
export const GLOW_XLARGE = 30;
export const GLOW_HUGE = 40;
```

### 3.2 Update constants.ts
Remove font-related constants, import from `fontStyles.ts`:
```typescript
export * from './fontStyles';
```

---

## Phase 4: Component Refactoring

### 4.1 Components to Update
- ✅ `IntroScreen.ts` - Title and subtitle
- ✅ `GameOverScreen.ts` - Title and stats
- ✅ `PauseScreen.ts` - Paused text
- ✅ `LevelCompleteScreen.ts` - Level complete text
- ✅ `OptionsScreen.ts` - Options UI
- ✅ `Button.ts` - Button text
- ✅ `StatusBar.ts` - HUD text
- ✅ `Brick.ts` - Health numbers

### 4.2 Refactoring Pattern

**Before:**
```typescript
this.ctx.font = '72px "D Day Stencil", Arial';
this.ctx.shadowBlur = 40;
```

**After:**
```typescript
import { FONT_TITLE_HUGE, GLOW_HUGE } from '../config/fontStyles';

this.ctx.font = FONT_TITLE_HUGE;
this.ctx.shadowBlur = GLOW_HUGE;
```

---

## Phase 5: Build Process Updates

### 5.1 Update package.json Scripts
```json
{
  "build": "npm run build:main && npm run build:renderer && npm run copy-assets",
  "build:renderer": "npm run build:styles && webpack",
  "build:styles": "sass src/renderer/styles/index.scss dist/renderer/styles.css",
  "copy-assets": "cp src/renderer/index.html dist/renderer/ && cp dist/renderer/styles.css dist/renderer/ && ...",
  "dev": "npm run build && electron .",
  "watch:styles": "sass --watch src/renderer/styles/index.scss dist/renderer/styles.css"
}
```

### 5.2 Update index.html
Change CSS reference:
```html
<link rel="stylesheet" href="styles.css">
```

---

## Phase 6: Testing & Validation

### 6.1 Build Tests
- ✅ Run `npm run build` - should complete without errors
- ✅ Verify `dist/renderer/styles.css` is generated
- ✅ Check file size is similar to original

### 6.2 Runtime Tests
- ✅ Run `npm start` - game should launch
- ✅ Verify all fonts render correctly
- ✅ Check all screens (Intro, Game, Pause, GameOver, LevelComplete, Options)
- ✅ Verify no console errors

### 6.3 Type Safety Tests
- ✅ TypeScript compilation with no errors
- ✅ IDE autocomplete works for font constants
- ✅ Refactoring tools work correctly

---

## Phase 7: Documentation

### 7.1 Update BUILD.md
- Add SCSS compilation step
- Document new npm scripts
- Explain font constants usage

### 7.2 Update architecture.md
- Document styles directory structure
- Explain typed SCSS approach
- Add font styling guidelines

---

## Migration Checklist

### Setup
- [ ] Install sass, sass-loader, typed-scss-modules
- [ ] Update webpack.config.js
- [ ] Add npm scripts

### SCSS Files
- [ ] Create styles directory
- [ ] Create _variables.scss
- [ ] Create _fonts.scss
- [ ] Create _mixins.scss
- [ ] Create base.scss
- [ ] Create index.scss

### TypeScript
- [ ] Create fontStyles.ts
- [ ] Update constants.ts
- [ ] Update IntroScreen.ts
- [ ] Update GameOverScreen.ts
- [ ] Update PauseScreen.ts
- [ ] Update LevelCompleteScreen.ts
- [ ] Update OptionsScreen.ts
- [ ] Update Button.ts
- [ ] Update StatusBar.ts
- [ ] Update Brick.ts

### Build & Test
- [ ] Update package.json scripts
- [ ] Update copy-assets script
- [ ] Test build process
- [ ] Test runtime behavior
- [ ] Verify all screens render correctly

### Documentation
- [ ] Update BUILD.md
- [ ] Update architecture.md
- [ ] Add inline code comments

---

## Rollback Plan

If issues arise:
1. Revert webpack.config.js changes
2. Restore original styles.css reference in index.html
3. Remove SCSS dependencies
4. Keep font constants (they're still useful)

---

## Success Criteria

✅ Build completes without errors
✅ Game runs identically to before
✅ All fonts render correctly
✅ TypeScript compilation succeeds
✅ IDE provides autocomplete for font constants
✅ No runtime performance degradation
✅ Documentation is updated

---

## Timeline Estimate

- **Phase 1-2** (Setup & SCSS): ~30 minutes
- **Phase 3** (TypeScript constants): ~20 minutes
- **Phase 4** (Component refactoring): ~60 minutes
- **Phase 5** (Build process): ~20 minutes
- **Phase 6** (Testing): ~30 minutes
- **Phase 7** (Documentation): ~20 minutes

**Total: ~3 hours**
