# Steam Integration - Quick Reference Card

## 🚀 Running the Game

```bash
# Normal development (no Steam needed)
npm start

# With Steam (for testing Steam features)
# 1. Start Steam client first
# 2. Then run:
npm start
```

## 🎮 Using Steam API in Game Code

### Import
```typescript
import { steamAPI } from '../steam/steamAPI';
```

### Initialize (once at game start)
```typescript
await steamAPI.initialize();
```

### Unlock Achievement
```typescript
await steamAPI.unlockAchievement('DEFEAT_BOSS_1');
```

### Check Achievement Status
```typescript
const unlocked = await steamAPI.isAchievementUnlocked('DEFEAT_BOSS_1');
```

### Check Steam Availability
```typescript
if (steamAPI.isAvailable()) {
  // Steam is running
  const name = await steamAPI.getPlayerName();
}
```

## 🏆 Achievement IDs

| ID | Description |
|----|-------------|
| `FIRST_LEVEL` | Complete the first level |
| `HALFWAY_THERE` | Complete 5 levels |
| `LEVEL_MASTER` | Complete all levels |
| `DEFEAT_BOSS_1` | Defeat Boss 1: The Thrower |
| `DEFEAT_BOSS_2` | Defeat Boss 2: The Shielder |
| `DEFEAT_BOSS_3` | Defeat Boss 3: The Splitter |
| `ALL_BOSSES` | Defeat all three boss types |
| `PERFECT_LEVEL` | Complete level without losing ball |
| `SPEED_RUN` | Complete level in under 60 seconds |
| `NO_DAMAGE` | Complete boss level without damage |
| `COMBO_MASTER` | Destroy 10 bricks in single combo |
| `SECRET_LEVEL` | Find the secret level (hidden) |

## 📝 Integration Examples

### Boss Defeat
```typescript
// In Boss1.ts, Boss2.ts, Boss3.ts
async onDefeat() {
  await steamAPI.unlockAchievement(`DEFEAT_BOSS_${this.bossNumber}`);
}
```

### Level Complete
```typescript
// In Level.ts
async onLevelComplete() {
  if (this.levelNumber === 1) {
    await steamAPI.unlockAchievement('FIRST_LEVEL');
  }
}
```

### Perfect Run
```typescript
// In Level.ts
async onLevelComplete() {
  if (this.ballLives === this.startingLives) {
    await steamAPI.unlockAchievement('PERFECT_LEVEL');
  }
}
```

## 🔧 Configuration Files

| File | Purpose |
|------|---------|
| `src/main/steam/SteamManager.ts` | Core Steam integration |
| `src/renderer/steam/steamAPI.ts` | Game-facing API |
| `src/renderer/config/achievements.ts` | Achievement definitions |

## 📊 Console Messages

### Offline Mode
```
🎮 Running in OFFLINE mode (Steam not available)
🏆 Achievement system running in OFFLINE mode
🏆 [OFFLINE] Achievement unlocked: DEFEAT_BOSS_1
```

### Online Mode
```
✅ Steam initialized for YourName (76561198...)
📋 Using App ID: 480 (SpaceWar test app)
✅ Steam integration active
🏆 Achievement unlocked: DEFEAT_BOSS_1
```

## 🐛 Troubleshooting

| Issue | Solution |
|-------|----------|
| "Steam not available" | Normal! Steam client not running. Game works fine. |
| Achievements not unlocking | Start Steam client, then restart game |
| Build errors | Run `npm rebuild` |

## 📚 Documentation

- **Quick Start**: `STEAM_INTEGRATION.md`
- **Full Guide**: `docs/steam-integration-guide.md`
- **Summary**: `docs/steam-integration-summary.md`

---

**That's all you need to know!** 🎮

The game runs perfectly with `npm start` whether Steam is running or not.
