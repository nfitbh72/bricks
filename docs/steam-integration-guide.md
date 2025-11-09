# Steam SDK Integration Guide

## Overview
Technical guide for integrating Steamworks SDK into the Bricks game (Electron-based). This document focuses exclusively on the technical implementation steps.

---

## Prerequisites

### Required Accounts & Setup
- [ ] Steam Partner account (https://partner.steamgames.com)
- [ ] App ID assigned by Steam
- [ ] Steamworks SDK downloaded (latest version)
- [ ] Steam client installed for testing

### Development Environment
- Node.js 18+ (current project requirement)
- Electron (current framework)
- TypeScript support
- Build tools for native modules

---

## Phase 1: SDK Installation & Setup

### 1.1 Install Greenworks (Steamworks for Electron)
**Recommended Library**: `greenworks` - Node.js bindings for Steamworks

```bash
npm install greenworks --save
```

**Alternative**: `steamworks.js` (newer, better TypeScript support)
```bash
npm install steamworks.js --save
```

### 1.2 Configure Steam App ID

Create `steam_appid.txt` in project root:
```
480  # Use 480 for testing (SpaceWar), replace with your App ID
```

Add to `.gitignore`:
```
steam_appid.txt
```

### 1.3 Copy Steam SDK Files

Required files in project root:
- **Windows**: `steam_api64.dll` or `steam_api.dll`
- **macOS**: `libsteam_api.dylib`
- **Linux**: `libsteam_api.so`

Download from: Steamworks SDK → `redistributable_bin/`

### 1.4 Update package.json

```json
{
  "build": {
    "extraFiles": [
      {
        "from": "steam_api64.dll",
        "to": "."
      },
      {
        "from": "libsteam_api.dylib",
        "to": "."
      }
    ]
  }
}
```

---

## Phase 2: Core Steam Integration

### 2.1 Initialize Steam API

Create `src/main/steam/SteamManager.ts`:

```typescript
import * as greenworks from 'greenworks';

export class SteamManager {
  private static instance: SteamManager;
  private initialized: boolean = false;
  private steamId: string = '';
  private playerName: string = '';

  private constructor() {}

  static getInstance(): SteamManager {
    if (!SteamManager.instance) {
      SteamManager.instance = new SteamManager();
    }
    return SteamManager.instance;
  }

  initialize(): boolean {
    try {
      if (!greenworks.initAPI()) {
        console.error('Failed to initialize Steam API');
        return false;
      }

      this.initialized = true;
      this.steamId = greenworks.getSteamId().steamId;
      this.playerName = greenworks.getSteamId().screenName;
      
      console.log(`Steam initialized for ${this.playerName} (${this.steamId})`);
      return true;
    } catch (error) {
      console.error('Steam initialization error:', error);
      return false;
    }
  }

  isInitialized(): boolean {
    return this.initialized;
  }

  getSteamId(): string {
    return this.steamId;
  }

  getPlayerName(): string {
    return this.playerName;
  }

  shutdown(): void {
    if (this.initialized) {
      greenworks.shutdown();
      this.initialized = false;
    }
  }
}
```

### 2.2 Initialize in Main Process

Update `src/main/main.ts`:

```typescript
import { SteamManager } from './steam/SteamManager';

app.whenReady().then(() => {
  // Initialize Steam before creating window
  const steamManager = SteamManager.getInstance();
  const steamInitialized = steamManager.initialize();
  
  if (!steamInitialized) {
    console.warn('Running without Steam integration');
  }

  createWindow();
});

app.on('before-quit', () => {
  SteamManager.getInstance().shutdown();
});
```

### 2.3 IPC Communication (Main ↔ Renderer)

Create `src/main/steam/SteamIPC.ts`:

```typescript
import { ipcMain } from 'electron';
import { SteamManager } from './SteamManager';

export function setupSteamIPC(): void {
  const steam = SteamManager.getInstance();

  ipcMain.handle('steam:isInitialized', () => {
    return steam.isInitialized();
  });

  ipcMain.handle('steam:getPlayerName', () => {
    return steam.getPlayerName();
  });

  ipcMain.handle('steam:getSteamId', () => {
    return steam.getSteamId();
  });
}
```

Register in `main.ts`:
```typescript
import { setupSteamIPC } from './steam/SteamIPC';

app.whenReady().then(() => {
  setupSteamIPC();
  // ... rest of initialization
});
```

---

## Phase 3: Achievements System

### 3.1 Define Achievements

Create `src/renderer/config/achievements.ts`:

```typescript
export interface Achievement {
  id: string;
  name: string;
  description: string;
  hidden?: boolean;
}

export const ACHIEVEMENTS: Achievement[] = [
  {
    id: 'FIRST_LEVEL',
    name: 'Getting Started',
    description: 'Complete the first level',
  },
  {
    id: 'DEFEAT_BOSS_1',
    name: 'Thrower Down',
    description: 'Defeat Boss 1: The Thrower',
  },
  {
    id: 'DEFEAT_BOSS_2',
    name: 'Shield Breaker',
    description: 'Defeat Boss 2: The Shielder',
  },
  {
    id: 'DEFEAT_BOSS_3',
    name: 'Split Decision',
    description: 'Defeat Boss 3: The Splitter',
  },
  {
    id: 'PERFECT_LEVEL',
    name: 'Flawless',
    description: 'Complete a level without losing the ball',
  },
  {
    id: 'SPEED_RUN',
    name: 'Speed Demon',
    description: 'Complete a level in under 60 seconds',
  },
  {
    id: 'ALL_BOSSES',
    name: 'Boss Master',
    description: 'Defeat all three boss types',
  },
  {
    id: 'NO_DAMAGE',
    name: 'Untouchable',
    description: 'Complete a boss level without taking damage',
  },
  // Add 22-42 more achievements...
];
```

### 3.2 Achievement Manager

Create `src/main/steam/AchievementManager.ts`:

```typescript
import * as greenworks from 'greenworks';
import { ipcMain } from 'electron';

export class AchievementManager {
  private unlockedAchievements: Set<string> = new Set();

  initialize(): void {
    this.loadUnlockedAchievements();
    this.setupIPC();
  }

  private loadUnlockedAchievements(): void {
    try {
      // Query all achievements from Steam
      greenworks.getAchievementNames((names: string[]) => {
        names.forEach(name => {
          if (greenworks.getAchievement(name)) {
            this.unlockedAchievements.add(name);
          }
        });
      });
    } catch (error) {
      console.error('Failed to load achievements:', error);
    }
  }

  unlockAchievement(achievementId: string): boolean {
    if (this.unlockedAchievements.has(achievementId)) {
      return false; // Already unlocked
    }

    try {
      greenworks.activateAchievement(achievementId, () => {
        console.log(`Achievement unlocked: ${achievementId}`);
        this.unlockedAchievements.add(achievementId);
      }, (error: Error) => {
        console.error(`Failed to unlock achievement ${achievementId}:`, error);
      });
      return true;
    } catch (error) {
      console.error('Achievement unlock error:', error);
      return false;
    }
  }

  isUnlocked(achievementId: string): boolean {
    return this.unlockedAchievements.has(achievementId);
  }

  clearAchievement(achievementId: string): void {
    // For testing only
    greenworks.clearAchievement(achievementId, () => {
      this.unlockedAchievements.delete(achievementId);
    });
  }

  private setupIPC(): void {
    ipcMain.handle('steam:unlockAchievement', (_, achievementId: string) => {
      return this.unlockAchievement(achievementId);
    });

    ipcMain.handle('steam:isAchievementUnlocked', (_, achievementId: string) => {
      return this.isUnlocked(achievementId);
    });

    ipcMain.handle('steam:getUnlockedAchievements', () => {
      return Array.from(this.unlockedAchievements);
    });
  }
}
```

### 3.3 Use in Game Code

```typescript
// In game logic (renderer process)
import { ipcRenderer } from 'electron';

// When boss is defeated
async function onBossDefeated(bossType: number): Promise<void> {
  const achievementId = `DEFEAT_BOSS_${bossType}`;
  const unlocked = await ipcRenderer.invoke('steam:unlockAchievement', achievementId);
  
  if (unlocked) {
    // Show in-game notification
    showAchievementNotification(achievementId);
  }
}
```

---

## Phase 4: Leaderboards

### 4.1 Leaderboard Manager

Create `src/main/steam/LeaderboardManager.ts`:

```typescript
import * as greenworks from 'greenworks';
import { ipcMain } from 'electron';

export interface LeaderboardEntry {
  steamId: string;
  playerName: string;
  score: number;
  rank: number;
}

export class LeaderboardManager {
  private leaderboards: Map<string, any> = new Map();

  initialize(): void {
    this.setupIPC();
  }

  findOrCreateLeaderboard(name: string): Promise<void> {
    return new Promise((resolve, reject) => {
      greenworks.findOrCreateLeaderboard(
        name,
        greenworks.LeaderboardSortMethod.Descending,
        greenworks.LeaderboardDisplayType.Numeric,
        () => {
          console.log(`Leaderboard created/found: ${name}`);
          resolve();
        },
        (error: Error) => {
          console.error(`Leaderboard error for ${name}:`, error);
          reject(error);
        }
      );
    });
  }

  uploadScore(leaderboardName: string, score: number): Promise<void> {
    return new Promise((resolve, reject) => {
      greenworks.uploadLeaderboardScore(
        leaderboardName,
        score,
        greenworks.LeaderboardUploadScoreMethod.KeepBest,
        () => {
          console.log(`Score uploaded to ${leaderboardName}: ${score}`);
          resolve();
        },
        (error: Error) => {
          console.error(`Failed to upload score:`, error);
          reject(error);
        }
      );
    });
  }

  downloadScores(
    leaderboardName: string,
    requestType: 'Global' | 'Friends' | 'AroundUser',
    rangeStart: number = 0,
    rangeEnd: number = 10
  ): Promise<LeaderboardEntry[]> {
    return new Promise((resolve, reject) => {
      const type = greenworks.LeaderboardDataRequest[requestType];
      
      greenworks.downloadLeaderboardEntries(
        leaderboardName,
        type,
        rangeStart,
        rangeEnd,
        (entries: any[]) => {
          const formatted = entries.map((entry, index) => ({
            steamId: entry.steamId,
            playerName: entry.playerName || 'Unknown',
            score: entry.score,
            rank: rangeStart + index + 1,
          }));
          resolve(formatted);
        },
        (error: Error) => {
          console.error('Failed to download leaderboard:', error);
          reject(error);
        }
      );
    });
  }

  private setupIPC(): void {
    ipcMain.handle('steam:uploadScore', async (_, leaderboardName: string, score: number) => {
      await this.uploadScore(leaderboardName, score);
    });

    ipcMain.handle('steam:getLeaderboard', async (_, leaderboardName: string, type: string) => {
      return await this.downloadScores(leaderboardName, type as any);
    });
  }
}
```

### 4.2 Define Leaderboards

```typescript
// src/renderer/config/leaderboards.ts
export const LEADERBOARDS = {
  TOTAL_SCORE: 'total_score',
  LEVEL_1_TIME: 'level_1_time',
  LEVEL_2_TIME: 'level_2_time',
  // ... for each level
  BOSS_1_TIME: 'boss_1_time',
  BOSS_2_TIME: 'boss_2_time',
  BOSS_3_TIME: 'boss_3_time',
  ARCADE_HIGH_SCORE: 'arcade_high_score',
};
```

---

## Phase 5: Cloud Save

### 5.1 Cloud Save Manager

Create `src/main/steam/CloudSaveManager.ts`:

```typescript
import * as greenworks from 'greenworks';
import { ipcMain } from 'electron';

export class CloudSaveManager {
  initialize(): void {
    this.setupIPC();
  }

  saveToCloud(filename: string, data: string): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        greenworks.saveTextToFile(filename, data, () => {
          console.log(`Saved to cloud: ${filename}`);
          resolve();
        }, (error: Error) => {
          console.error('Cloud save failed:', error);
          reject(error);
        });
      } catch (error) {
        reject(error);
      }
    });
  }

  loadFromCloud(filename: string): Promise<string> {
    return new Promise((resolve, reject) => {
      try {
        greenworks.readTextFromFile(filename, (data: string) => {
          console.log(`Loaded from cloud: ${filename}`);
          resolve(data);
        }, (error: Error) => {
          console.error('Cloud load failed:', error);
          reject(error);
        });
      } catch (error) {
        reject(error);
      }
    });
  }

  fileExists(filename: string): boolean {
    try {
      return greenworks.isCloudEnabledForUser() && greenworks.isCloudEnabled();
    } catch (error) {
      return false;
    }
  }

  private setupIPC(): void {
    ipcMain.handle('steam:saveToCloud', async (_, filename: string, data: string) => {
      await this.saveToCloud(filename, data);
    });

    ipcMain.handle('steam:loadFromCloud', async (_, filename: string) => {
      return await this.loadFromCloud(filename);
    });

    ipcMain.handle('steam:cloudEnabled', () => {
      return this.fileExists('');
    });
  }
}
```

### 5.2 Integrate with Save System

```typescript
// In your save manager
async function saveGame(saveData: GameSaveData): Promise<void> {
  const jsonData = JSON.stringify(saveData);
  
  // Save locally
  await saveToLocalFile('save.json', jsonData);
  
  // Save to Steam Cloud if available
  if (await ipcRenderer.invoke('steam:cloudEnabled')) {
    await ipcRenderer.invoke('steam:saveToCloud', 'save.json', jsonData);
  }
}

async function loadGame(): Promise<GameSaveData | null> {
  try {
    // Try cloud first
    if (await ipcRenderer.invoke('steam:cloudEnabled')) {
      const cloudData = await ipcRenderer.invoke('steam:loadFromCloud', 'save.json');
      return JSON.parse(cloudData);
    }
  } catch (error) {
    console.warn('Cloud load failed, trying local');
  }
  
  // Fallback to local
  return await loadFromLocalFile('save.json');
}
```

---

## Phase 6: Rich Presence

### 6.1 Rich Presence Manager

Create `src/main/steam/RichPresenceManager.ts`:

```typescript
import * as greenworks from 'greenworks';

export class RichPresenceManager {
  updatePresence(key: string, value: string): void {
    try {
      greenworks.setRichPresence(key, value);
    } catch (error) {
      console.error('Failed to update rich presence:', error);
    }
  }

  clearPresence(): void {
    try {
      greenworks.clearRichPresence();
    } catch (error) {
      console.error('Failed to clear rich presence:', error);
    }
  }

  // Convenience methods
  setInMenu(): void {
    this.updatePresence('steam_display', '#InMenu');
  }

  setInLevel(levelNumber: number): void {
    this.updatePresence('steam_display', '#InLevel');
    this.updatePresence('level', levelNumber.toString());
  }

  setFightingBoss(bossName: string): void {
    this.updatePresence('steam_display', '#FightingBoss');
    this.updatePresence('boss', bossName);
  }
}
```

### 6.2 Configure in Steamworks

In Steamworks Partner dashboard:
1. Go to **Community** → **Rich Presence**
2. Add localization tokens:
   - `#InMenu`: "In Main Menu"
   - `#InLevel`: "Playing Level {level}"
   - `#FightingBoss`: "Fighting {boss}"

---

## Phase 7: Steam Overlay & Input

### 7.1 Enable Overlay

```typescript
// In main.ts
const mainWindow = new BrowserWindow({
  // ... other options
  webPreferences: {
    // Enable overlay
    enableRemoteModule: false,
    contextIsolation: true,
    nodeIntegration: false,
  },
});

// Detect overlay activation
greenworks.on('game-overlay-activated', (isActive: boolean) => {
  if (isActive) {
    // Pause game
    mainWindow.webContents.send('overlay-activated');
  } else {
    // Resume game
    mainWindow.webContents.send('overlay-deactivated');
  }
});
```

### 7.2 Steam Input API (Controller Support)

```typescript
import * as greenworks from 'greenworks';

export class SteamInputManager {
  initialize(): void {
    if (greenworks.initInput) {
      greenworks.initInput();
      console.log('Steam Input initialized');
    }
  }

  shutdown(): void {
    if (greenworks.shutdownInput) {
      greenworks.shutdownInput();
    }
  }
}
```

---

## Phase 8: Build & Distribution

### 8.1 Update Build Configuration

`electron-builder.yml`:
```yaml
appId: com.yourstudio.bricks
productName: Bricks
directories:
  output: dist
  buildResources: build

win:
  target:
    - nsis
  icon: build/icon.ico
  
mac:
  target:
    - dmg
  icon: build/icon.icns
  category: public.app-category.games
  
linux:
  target:
    - AppImage
  icon: build/icon.png
  category: Game

files:
  - "**/*"
  - "!**/*.ts"
  - "!*.map"
  
extraFiles:
  - from: steam_api64.dll
    to: .
  - from: libsteam_api.dylib
    to: .
  - from: libsteam_api.so
    to: .
```

### 8.2 Build Scripts

Update `package.json`:
```json
{
  "scripts": {
    "build:win": "electron-builder --win",
    "build:mac": "electron-builder --mac",
    "build:linux": "electron-builder --linux",
    "build:all": "electron-builder -mwl",
    "build:steam": "npm run build && npm run copy-steam-files"
  }
}
```

### 8.3 Steam Depot Configuration

Create `steam/app_build.vdf`:
```vdf
"AppBuild"
{
  "AppID" "YOUR_APP_ID"
  "Desc" "Build description"
  "BuildOutput" "steam/output"
  "ContentRoot" "dist"
  "SetLive" "default"
  
  "Depots"
  {
    "YOUR_DEPOT_ID_WIN"
    {
      "FileMapping"
      {
        "LocalPath" "win-unpacked\*"
        "DepotPath" "."
        "recursive" "1"
      }
    }
    
    "YOUR_DEPOT_ID_MAC"
    {
      "FileMapping"
      {
        "LocalPath" "mac\*"
        "DepotPath" "."
        "recursive" "1"
      }
    }
    
    "YOUR_DEPOT_ID_LINUX"
    {
      "FileMapping"
      {
        "LocalPath" "linux-unpacked\*"
        "DepotPath" "."
        "recursive" "1"
      }
    }
  }
}
```

### 8.4 Upload to Steam

```bash
# Build the game
npm run build:steam

# Upload using SteamCmd
steamcmd +login YOUR_USERNAME +run_app_build steam/app_build.vdf +quit
```

---

## Testing Checklist

### Local Testing
- [ ] Steam client running
- [ ] `steam_appid.txt` with test App ID (480)
- [ ] Steam API initializes successfully
- [ ] Player name displays correctly
- [ ] Achievements unlock and persist
- [ ] Leaderboards upload/download
- [ ] Cloud saves work
- [ ] Rich presence updates
- [ ] Overlay activates/deactivates
- [ ] Controller input works

### Pre-Release Testing
- [ ] Replace test App ID with real App ID
- [ ] Test on clean Steam account
- [ ] Verify all achievements unlock
- [ ] Test leaderboard rankings
- [ ] Verify cloud save sync across devices
- [ ] Test offline mode (graceful degradation)
- [ ] Test Steam overlay in-game
- [ ] Verify all platforms (Win/Mac/Linux)

---

## Common Issues & Solutions

### Issue: Steam API fails to initialize
**Solution**: 
- Ensure Steam client is running
- Check `steam_appid.txt` exists and has correct App ID
- Verify Steam DLL/dylib/so files are in correct location
- Check console for specific error messages

### Issue: Achievements don't unlock
**Solution**:
- Verify achievement IDs match Steamworks configuration
- Check Steam overlay is enabled
- Ensure Steam API is initialized before unlocking
- Test with `greenworks.getAchievementNames()` to verify setup

### Issue: Leaderboards not working
**Solution**:
- Create leaderboards in Steamworks dashboard first
- Verify leaderboard names match exactly
- Check sort method and display type are correct
- Test with small score values first

### Issue: Cloud saves not syncing
**Solution**:
- Enable Steam Cloud in Steamworks dashboard
- Check file size limits (< 100MB per file)
- Verify user has Steam Cloud enabled in settings
- Test with small files first

### Issue: Build fails with native module errors
**Solution**:
- Rebuild native modules: `npm rebuild`
- Use electron-rebuild: `npx electron-rebuild`
- Check Node.js version matches Electron version
- Verify greenworks version is compatible

---

## Performance Considerations

### Initialization
- Initialize Steam API early (before window creation)
- Handle initialization failure gracefully
- Don't block UI on Steam operations

### Achievement Unlocking
- Batch achievement checks on level completion
- Cache unlocked achievements locally
- Don't spam unlock calls

### Leaderboard Updates
- Upload scores only on level completion
- Implement rate limiting (max 1 upload per 10 seconds)
- Cache leaderboard data (refresh every 5 minutes)

### Cloud Saves
- Auto-save every 30-60 seconds
- Implement conflict resolution (timestamp-based)
- Compress large save files
- Limit cloud save frequency

---

## Security Best Practices

### API Key Protection
- Never commit `steam_appid.txt` to public repos
- Use environment variables for sensitive data
- Implement server-side validation for critical operations

### Save Data Integrity
- Validate save data before loading
- Implement checksums for cloud saves
- Handle corrupted saves gracefully
- Keep local backups

### Leaderboard Security
- Implement server-side score validation (if possible)
- Use Steam's anti-cheat features
- Monitor for suspicious scores
- Report cheaters to Steam

---

## Timeline Estimate

### Week 1: Setup & Core Integration
- Install SDK and dependencies
- Initialize Steam API
- Set up IPC communication
- Test basic functionality

### Week 2: Achievements & Leaderboards
- Implement achievement system
- Create leaderboard manager
- Define all achievements and leaderboards
- Test unlock/upload functionality

### Week 3: Cloud Save & Rich Presence
- Implement cloud save system
- Set up rich presence
- Test sync across devices
- Handle edge cases

### Week 4: Testing & Polish
- Full integration testing
- Fix bugs and edge cases
- Performance optimization
- Documentation

**Total Time**: 3-4 weeks for complete integration

---

## Resources

### Documentation
- Steamworks SDK: https://partner.steamgames.com/doc/sdk
- Greenworks: https://github.com/greenheartgames/greenworks
- Steamworks.js: https://github.com/ceifa/steamworks.js

### Tools
- SteamCmd: https://developer.valvesoftware.com/wiki/SteamCMD
- Steamworks SDK: https://partner.steamgames.com/downloads/

### Support
- Steamworks Developer Forums
- Steam Partner Support
- Electron Discord

---

**Document Version**: 1.0  
**Last Updated**: 2025-11-10  
**Estimated Completion**: 3-4 weeks
