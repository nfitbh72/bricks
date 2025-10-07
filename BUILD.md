# Building Bricks with UPGRADES

## Prerequisites
- Node.js 18+ 
- npm

## Development

```bash
# Install dependencies
npm install

# Run in development mode
npm run dev

# Run tests
npm test
```

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
