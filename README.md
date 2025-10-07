# Bricks Game

A game built with Electron and TypeScript.

## Project Structure

```
bricks/
├── src/
│   ├── main/           # Electron main process
│   │   ├── main.ts     # Main entry point
│   │   └── preload.ts  # Preload script for secure IPC
│   └── renderer/       # Renderer process (UI)
│       ├── index.html  # Main HTML file
│       ├── styles.css  # Styles
│       └── renderer.ts # Renderer logic
├── dist/               # Compiled JavaScript (generated)
├── package.json
└── tsconfig.json
```

## Setup

1. Install dependencies:
   ```bash
   npm install
   ```

2. Build the TypeScript files:
   ```bash
   npm run build
   ```

3. Start the application:
   ```bash
   npm start
   ```

## Development

- **Build once**: `npm run build`
- **Watch mode**: `npm run watch` (in a separate terminal)
- **Run app**: `npm run dev`

## Features

- ✅ TypeScript for type safety
- ✅ Fullscreen window
- ✅ Secure context isolation
- ✅ Ready for game development

## Next Steps

Add your game logic in `src/renderer/renderer.ts` and update the UI in `src/renderer/index.html`.
