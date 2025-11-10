# Steam Integration - Quick Start

## ✅ Installation Complete!

Steam integration has been added to your game with **graceful degradation** - the game runs perfectly fine with or without Steam!

## 🎮 Running the Game

### Normal Development (No Steam Required)
```bash
npm start
# or
npm run dev
```

**Output when Steam is NOT running:**
```
🎮 Running in offline mode (Steam not available)
🏆 Achievement system running in OFFLINE mode
```

### With Steam (For Testing Steam Features)
1. **Start Steam client first**
2. Run the game:
```bash
npm start
```

**Output when Steam IS running:**
```
✅ Steam initialized for YourName (76561198...)
📋 Using App ID: 480 (SpaceWar test app)
✅ Steam integration active
🏆 Achievement system loaded
```

## 📝 How to Use Steam Features in Your Game

### 1. Initialize Steam API (Already Done in main.ts)
Steam automatically initializes when the app starts. No action needed!

### 2. Use Achievements in Game Code

```typescript
import { steamAPI } from '../steam/steamAPI';

// Initialize once at game start
await steamAPI.initialize();

// Unlock achievement when boss is defeated
async function onBossDefeated(bossNumber: number): Promise<void> {
  const achievementId = `DEFEAT_BOSS_${bossNumber}`;
  const unlocked = await steamAPI.unlockAchievement(achievementId);
  
  if (unlocked) {
    console.log(`🏆 Achievement unlocked: ${achievementId}`);
    // Show in-game notification
  }
}

// Check if achievement is unlocked
const isUnlocked = await steamAPI.isAchievementUnlocked('FIRST_LEVEL');

// Get all unlocked achievements
const unlocked = await steamAPI.getUnlockedAchievements();
console.log('Unlocked achievements:', unlocked);
```

### 3. Check Steam Status

```typescript
import { steamAPI } from '../steam/steamAPI';

// Check if Steam is available
if (steamAPI.isAvailable()) {
  console.log('Steam is active!');
  const playerName = await steamAPI.getPlayerName();
  console.log(`Welcome ${playerName}!`);
} else {
  console.log('Running in offline mode');
}
```

## 📋 Achievement IDs

All achievements are defined in `/src/renderer/config/achievements.ts`:

- `FIRST_LEVEL` - Complete the first level
- `DEFEAT_BOSS_1` - Defeat Boss 1: The Thrower
- `DEFEAT_BOSS_2` - Defeat Boss 2: The Shielder
- `DEFEAT_BOSS_3` - Defeat Boss 3: The Splitter
- `ALL_BOSSES` - Defeat all three boss types
- `PERFECT_LEVEL` - Complete a level without losing the ball
- `SPEED_RUN` - Complete a level in under 60 seconds
- `NO_DAMAGE` - Complete a boss level without taking damage
- And more...

## 🔧 Testing Steam Integration

### Using SpaceWar (Test App ID 480)

The integration currently uses **App ID 480** (SpaceWar) for testing. This is Valve's official test app.

1. Start Steam
2. Run your game
3. Achievements will show up in Steam overlay as "SpaceWar" achievements
4. This is normal for testing!

### When You Get Your Real App ID

1. Open `/src/main/steam/SteamManager.ts`
2. Change line 35:
```typescript
private readonly APP_ID = 480; // Change to your real App ID
```

3. Create `steam_appid.txt` in project root:
```
YOUR_REAL_APP_ID
```

4. Add to `.gitignore`:
```
steam_appid.txt
```

## 🎯 Example: Unlock Achievement on Level Complete

```typescript
// In your level completion code
import { steamAPI } from '../steam/steamAPI';

export class Level {
  async onLevelComplete(): Promise<void> {
    // ... existing level complete logic
    
    // Unlock achievement
    if (this.levelNumber === 1) {
      await steamAPI.unlockAchievement('FIRST_LEVEL');
    }
    
    if (this.levelNumber === 5) {
      await steamAPI.unlockAchievement('HALFWAY_THERE');
    }
    
    // Check if all levels complete
    const allLevelsComplete = this.checkAllLevelsComplete();
    if (allLevelsComplete) {
      await steamAPI.unlockAchievement('LEVEL_MASTER');
    }
  }
}
```

## 🎯 Example: Unlock Achievement on Boss Defeat

```typescript
// In your boss defeat code
import { steamAPI } from '../steam/steamAPI';

export class Boss1 {
  async onDefeat(): Promise<void> {
    // ... existing defeat logic
    
    // Unlock boss-specific achievement
    await steamAPI.unlockAchievement('DEFEAT_BOSS_1');
    
    // Check if all bosses defeated
    const allBossesDefeated = await this.checkAllBossesDefeated();
    if (allBossesDefeated) {
      await steamAPI.unlockAchievement('ALL_BOSSES');
    }
  }
  
  private async checkAllBossesDefeated(): Promise<boolean> {
    const boss1 = await steamAPI.isAchievementUnlocked('DEFEAT_BOSS_1');
    const boss2 = await steamAPI.isAchievementUnlocked('DEFEAT_BOSS_2');
    const boss3 = await steamAPI.isAchievementUnlocked('DEFEAT_BOSS_3');
    return boss1 && boss2 && boss3;
  }
}
```

## 📊 What Works in Offline Mode

When Steam is not running, the game still works perfectly:

✅ Game runs normally  
✅ Achievements are tracked locally  
✅ Console logs show what would happen  
✅ No errors or crashes  
✅ All game features work  

When Steam IS running:

✅ All of the above PLUS  
✅ Real Steam achievements unlock  
✅ Achievements show in Steam overlay  
✅ Achievements sync to Steam Cloud  
✅ Player name from Steam  

## 🐛 Troubleshooting

### "Steam not available" message
- **Normal!** This means Steam client isn't running
- Game works fine in offline mode
- Start Steam client to enable Steam features

### Achievements not unlocking in Steam
1. Make sure Steam client is running
2. Check console for "✅ Steam initialized" message
3. Verify App ID is correct (480 for testing)
4. Check Steam overlay is enabled

### Build errors with steamworks.js
```bash
# Rebuild native modules
npm rebuild
```

## 📁 File Structure

```
src/
├── main/
│   └── steam/
│       ├── SteamManager.ts          # Core Steam integration
│       ├── AchievementManager.ts    # Achievement handling
│       └── SteamIPC.ts              # IPC communication
└── renderer/
    ├── steam/
    │   └── steamAPI.ts              # Renderer-side API
    └── config/
        └── achievements.ts          # Achievement definitions
```

## 🚀 Next Steps

1. **Add achievement unlocks** to your game logic
2. **Test with Steam running** to see achievements unlock
3. **When ready for production:**
   - Get your Steam App ID
   - Update `APP_ID` in SteamManager.ts
   - Configure achievements in Steamworks dashboard
   - Build and upload to Steam

## 💡 Tips

- **Development**: Just run `npm start` - Steam is optional
- **Testing Steam**: Start Steam first, then run game
- **Debugging**: Check console for Steam status messages
- **Offline mode**: All features work, achievements tracked locally

---

**That's it!** Your game now has Steam integration that works seamlessly in both online and offline modes. Happy developing! 🎮
