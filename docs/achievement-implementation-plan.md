# Achievement Implementation Plan

## Architecture

### New Class: `AchievementTracker`
**Location**: `src/renderer/game/managers/AchievementTracker.ts`

**Purpose**: Centralize all achievement tracking logic, progress counters, and unlock calls to keep `Game.ts` clean.

**Responsibilities**:
- Track cumulative progress (total bricks destroyed, total damage dealt, bosses defeated, etc.)
- Track per-level state (ball lives, damage taken, level time, combo count)
- Evaluate achievement conditions
- Call `steamAPI.unlockAchievement()` when conditions are met
- Maintain list of achievements unlocked during current level run
- Persist cumulative progress to localStorage

### Integration with Game
- `Game` creates `AchievementTracker` instance
- `Game` calls tracker methods at key events:
  - `onLevelStart(levelId, startingLives)`
  - `onLevelComplete(levelId, time, livesRemaining)`
  - `onBrickDestroyed(damage)`
  - `onBossDefeated(bossType)`
  - `onBatDamaged()`
  - `onComboAchieved(comboCount)`
  - `onUpgradeActivated(upgradeType)`
- `Game` retrieves `tracker.getAchievementsThisRun()` for Level Complete screen

---

## Achievement Breakdown & Implementation

### 1. Level Completion Achievements

#### `FIRST_LEVEL` - Complete the first level
**Type**: One-time event  
**Trigger**: `onLevelComplete(levelId=1)`  
**Logic**:
```typescript
if (levelId === 1) {
  await this.unlock('FIRST_LEVEL');
}
```

#### `HALFWAY_THERE` - Complete 5 levels
**Type**: Cumulative counter  
**State**: `levelsCompleted: Set<number>`  
**Trigger**: `onLevelComplete(levelId)`  
**Logic**:
```typescript
this.levelsCompleted.add(levelId);
if (this.levelsCompleted.size >= 5) {
  await this.unlock('HALFWAY_THERE');
}
```

#### `LEVEL_MASTER` - Complete all levels
**Type**: Cumulative counter  
**State**: `levelsCompleted: Set<number>`  
**Trigger**: `onLevelComplete(levelId)`  
**Logic**:
```typescript
this.levelsCompleted.add(levelId);
const totalLevels = 15; // Or get from level config
if (this.levelsCompleted.size >= totalLevels) {
  await this.unlock('LEVEL_MASTER');
}
```

---

### 2. Progress Achievements (Cumulative)

#### `UPGRADE_MASTER` - Activate all upgrades
**Type**: Cumulative counter  
**State**: `upgradesActivated: Set<string>`  
**Trigger**: `onUpgradeActivated(upgradeType)`  
**Logic**:
```typescript
this.upgradesActivated.add(upgradeType);
const totalUpgrades = Object.keys(UpgradeType).length;
if (this.upgradesActivated.size >= totalUpgrades) {
  await this.unlock('UPGRADE_MASTER');
}
```

#### `BRICK_SMASHER` - Destroy 1000 bricks
**Type**: Cumulative counter  
**State**: `totalBricksDestroyed: number`  
**Trigger**: `onBrickDestroyed()`  
**Logic**:
```typescript
this.totalBricksDestroyed++;
if (this.totalBricksDestroyed >= 1000) {
  await this.unlock('BRICK_SMASHER');
}
```

#### `BOSS_SMASHER` - Destroy 30 bosses
**Type**: Cumulative counter  
**State**: `totalBossesDefeated: number`  
**Trigger**: `onBossDefeated(bossType)`  
**Logic**:
```typescript
this.totalBossesDefeated++;
if (this.totalBossesDefeated >= 30) {
  await this.unlock('BOSS_SMASHER');
}
```

#### `DAMAGE_DEALER` - Deal 10000 damage to bricks
**Type**: Cumulative counter  
**State**: `totalDamageDealt: number`  
**Trigger**: `onBrickDestroyed(damage)`  
**Logic**:
```typescript
this.totalDamageDealt += damage;
if (this.totalDamageDealt >= 10000) {
  await this.unlock('DAMAGE_DEALER');
}
```

---

### 3. Boss Achievements

#### `DEFEAT_BOSS_1` - Defeat Boss 1: The Thrower
**Type**: One-time event  
**Trigger**: `onBossDefeated(bossType='BOSS_1')`  
**Logic**:
```typescript
if (bossType === BrickType.BOSS_1) {
  await this.unlock('DEFEAT_BOSS_1');
}
```

#### `DEFEAT_BOSS_2` - Defeat Boss 2: The Shielder
**Type**: One-time event  
**Trigger**: `onBossDefeated(bossType='BOSS_2')`  
**Logic**:
```typescript
if (bossType === BrickType.BOSS_2) {
  await this.unlock('DEFEAT_BOSS_2');
}
```

#### `DEFEAT_BOSS_3` - Defeat Boss 3: The Splitter
**Type**: One-time event  
**Trigger**: `onBossDefeated(bossType='BOSS_3')`  
**Logic**:
```typescript
if (bossType === BrickType.BOSS_3) {
  await this.unlock('DEFEAT_BOSS_3');
}
```

#### `ALL_BOSSES` - Defeat all three boss types
**Type**: Cumulative set  
**State**: `bossTypesDefeated: Set<BrickType>`  
**Trigger**: `onBossDefeated(bossType)`  
**Logic**:
```typescript
this.bossTypesDefeated.add(bossType);
if (this.bossTypesDefeated.size >= 3) {
  await this.unlock('ALL_BOSSES');
}
```

---

### 4. Skill Achievements (Per-Level)

#### `PERFECT_LEVEL` - Complete a level without losing the ball
**Type**: Per-level condition  
**State**: `levelStartLives: number`, `currentLives: number`  
**Trigger**: `onLevelComplete()`  
**Logic**:
```typescript
// Set on level start
this.levelStartLives = startingLives;

// On level complete
if (currentLives === this.levelStartLives) {
  await this.unlock('PERFECT_LEVEL');
}
```

#### `SPEED_RUN` - Complete a level in under 10 seconds
**Type**: Per-level condition  
**State**: `levelTime: number`  
**Trigger**: `onLevelComplete(levelId, time)`  
**Logic**:
```typescript
if (time < 10) {
  await this.unlock('SPEED_RUN');
}
```

#### `NO_DAMAGE` - Complete a boss level without taking damage
**Type**: Per-level condition  
**State**: `levelHasBoss: boolean`, `damageTakenThisLevel: boolean`  
**Trigger**: `onLevelComplete()`, `onBatDamaged()`  
**Logic**:
```typescript
// On level start (if boss present)
this.levelHasBoss = hasBoss;
this.damageTakenThisLevel = false;

// On bat damaged
this.damageTakenThisLevel = true;

// On level complete
if (this.levelHasBoss && !this.damageTakenThisLevel) {
  await this.unlock('NO_DAMAGE');
}
```

#### `COMBO_MASTER` - Destroy 10 bricks in a single combo
**Type**: Per-level event  
**State**: `maxComboThisLevel: number`  
**Trigger**: `onComboAchieved(comboCount)`  
**Logic**:
```typescript
this.maxComboThisLevel = Math.max(this.maxComboThisLevel, comboCount);
if (comboCount >= 10) {
  await this.unlock('COMBO_MASTER');
}
```

---

### 5. Hidden Achievement

#### `SECRET_LEVEL` - Find the secret level
**Type**: One-time event  
**Trigger**: `onLevelStart(levelId)` if secret level  
**Logic**:
```typescript
const SECRET_LEVEL_ID = 99; // Or whatever you define
if (levelId === SECRET_LEVEL_ID) {
  await this.unlock('SECRET_LEVEL');
}
```

---

## Implementation Steps

### Phase 1: Create AchievementTracker Class
1. Create `src/renderer/game/managers/AchievementTracker.ts`
2. Define state interface for cumulative and per-level tracking
3. Implement localStorage persistence for cumulative stats
4. Create event handler methods (`onLevelStart`, `onLevelComplete`, etc.)
5. Implement `unlock()` method that:
   - Calls `steamAPI.unlockAchievement(id)`
   - If successful, adds to `achievementsThisRun`
   - Saves progress to localStorage

### Phase 2: Integrate with Game.ts
1. Add `AchievementTracker` instance to `Game`
2. Call `tracker.onLevelStart()` in `loadLevel()`
3. Call `tracker.onLevelComplete()` when level completes
4. Call `tracker.onBrickDestroyed()` in collision callback
5. Call `tracker.onBossDefeated()` when boss is destroyed
6. Call `tracker.onBatDamaged()` in bat damage callback
7. Replace `achievementsUnlockedThisRun` with `tracker.getAchievementsThisRun()`

### Phase 3: Wire Specific Events
1. **Brick destruction**: Already wired via collision callbacks
2. **Boss defeat**: Add call in boss destruction logic
3. **Bat damage**: Already wired via collision callbacks
4. **Combo tracking**: Need to implement combo detection system
5. **Upgrade activation**: Wire into upgrade tree screen

### Phase 4: Combo System (if not exists)
1. Track consecutive brick destructions within time window
2. Reset combo on ball miss or timeout
3. Call `tracker.onComboAchieved(count)` when combo increases

### Phase 5: Testing & Polish
1. Test each achievement can be unlocked
2. Verify persistence across game sessions
3. Test achievements appear on Level Complete screen
4. Test achievements appear on Achievements screen with green ticks

---

## State Persistence

### Cumulative Stats (localStorage)
```typescript
interface AchievementProgress {
  levelsCompleted: number[];
  totalBricksDestroyed: number;
  totalBossesDefeated: number;
  totalDamageDealt: number;
  bossTypesDefeated: string[];
  upgradesActivated: string[];
}
```

**Storage Key**: `achievementProgress`

### Per-Level Stats (reset each level)
```typescript
interface LevelStats {
  levelStartLives: number;
  damageTakenThisLevel: boolean;
  levelHasBoss: boolean;
  maxComboThisLevel: number;
}
```

---

## Game.ts Integration Points

### Current Code Locations

1. **Level Start**: `Game.loadLevel()` (line ~636)
2. **Level Complete**: `Game.update()` level completion check (line ~921-929)
3. **Brick Destroyed**: `CollisionManager` callback setup (line ~422-444)
4. **Boss Defeated**: Boss destruction check in `Game.update()` (line ~919-920)
5. **Bat Damaged**: `CollisionManager` callback setup (line ~453-464)

### New Calls Needed

```typescript
// In loadLevel()
this.achievementTracker.onLevelStart(
  levelConfig.id,
  this.playerHealth,
  this.boss !== null
);

// In level complete block
this.achievementTracker.onLevelComplete(
  this.level.getId(),
  this.levelTime,
  this.playerHealth
);

// In brick destroyed callback
this.achievementTracker.onBrickDestroyed(damage);

// In boss defeat logic (new)
if (this.boss && this.boss.isDestroyed() && !this.bossDefeatRecorded) {
  this.achievementTracker.onBossDefeated(this.boss.getType());
  this.bossDefeatRecorded = true;
}

// In bat damaged callback
this.achievementTracker.onBatDamaged();

// In upgrade activation (UpgradeTreeScreen)
this.achievementTracker.onUpgradeActivated(upgrade.type);
```

---

## Benefits of This Approach

1. **Separation of Concerns**: Achievement logic isolated from game logic
2. **Easy to Test**: Can unit test achievement conditions independently
3. **Easy to Extend**: Add new achievements by adding conditions to tracker
4. **Maintainable**: All achievement code in one place
5. **Persistent Progress**: Cumulative achievements survive game restarts
6. **Clean Game.ts**: Minimal changes to existing game code

---

## Estimated Complexity

- **Phase 1** (Tracker class): ~200 lines, 2-3 hours
- **Phase 2** (Integration): ~50 lines, 1 hour
- **Phase 3** (Event wiring): ~100 lines, 1-2 hours
- **Phase 4** (Combo system): ~80 lines, 1 hour (if needed)
- **Phase 5** (Testing): 1-2 hours

**Total**: ~430 lines, 6-9 hours of work

---

## Next Steps

1. Review and approve this plan
2. Implement `AchievementTracker` class
3. Wire into `Game.ts` at integration points
4. Test each achievement type
5. Polish UI feedback
