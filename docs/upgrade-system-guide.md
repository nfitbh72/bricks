# Upgrade System Guide

This guide explains how to add new upgrades to the game's upgrade system.

## Table of Contents
1. [Overview](#overview)
2. [Upgrade Types](#upgrade-types)
3. [Adding a New Upgrade](#adding-a-new-upgrade)
4. [Examples](#examples)
5. [Testing](#testing)

---

## Overview

The upgrade system consists of three main components:

1. **Upgrade Types** (`src/renderer/game/types.ts`) - Enum defining all upgrade types
2. **Upgrade Tree** (`src/renderer/config/upgrades.ts`) - Tree structure defining available upgrades
3. **Upgrade Logic** (`src/renderer/game/GameUpgrades.ts`) - Implementation of upgrade effects
4. **Game Integration** (`src/renderer/game/Game.ts`) - Where upgrades are applied

### Upgrade Flow

```
Player completes level
    ↓
Upgrade screen shown
    ↓
Player selects upgrade
    ↓
Upgrade level incremented
    ↓
GameUpgrades applies effects
    ↓
Game entities updated
```

---

## Upgrade Types

There are three categories of upgrades:

### 1. **Stat Upgrades** (Incremental)
Increase a numeric value each time purchased.

**Examples:**
- Ball Damage (+1 per level)
- Bat Width (+10% per level)
- Health (+1 per level)

### 2. **Unlock Upgrades** (One-time)
Enable a new feature or mechanic.

**Examples:**
- Bat Shooter (enables laser shooting)
- Ball Piercing (enables pierce mechanic)
- Ball Explosions (enables splash damage)

### 3. **Enhancement Upgrades** (Incremental)
Improve an unlocked feature.

**Examples:**
- Bat Shooter+ (+10% damage per level)
- Piercing+ (+10% chance per level)
- Explosions+ (+10% damage per level)

---

## Adding a New Upgrade

Follow these steps to add a new upgrade to the game:

### Step 1: Add Upgrade Type to Enum

**File:** `src/renderer/game/types.ts`

Add your upgrade type to the `UpgradeType` enum:

```typescript
export enum UpgradeType {
    // Existing upgrades...
    YOUR_NEW_UPGRADE = 'YOUR_NEW_UPGRADE',
}
```

**Naming Convention:**
- Use SCREAMING_SNAKE_CASE
- Format: `{ENTITY}_{ACTION}_{DETAILS}`
- Examples:
  - `BALL_DAMAGE_INCREASE_INCREMENT_1`
  - `BAT_ADD_SHOOTER`
  - `BALL_CHANCE_PIERCING_10_PERCENT`

### Step 2: Add to Upgrade Tree

**File:** `src/renderer/config/upgrades.ts`

Add your upgrade to the tree structure:

```typescript
{
    name: 'Your Upgrade Name',
    description: 'What the upgrade does',
    times: 3,  // How many times it can be purchased
    previewNextUpgrades: 1,  // How many child upgrades to show before unlock
    unlockNextUpgradesAfterTimes: 2,  // Purchase count before children unlock
    type: UpgradeType.YOUR_NEW_UPGRADE,
    nextUpgrades: [
        // Child upgrades (if any)
    ],
}
```

**Upgrade Properties:**

| Property | Type | Description |
|----------|------|-------------|
| `name` | string | Display name shown to player |
| `description` | string | What the upgrade does |
| `times` | number | Max purchase count (1 for unlocks) |
| `previewNextUpgrades` | number | Purchases needed to preview children |
| `unlockNextUpgradesAfterTimes` | number | Purchases needed to unlock children |
| `type` | UpgradeType | Enum value for this upgrade |
| `nextUpgrades` | Upgrade[] | Array of child upgrades |

**Tree Structure Tips:**
- Root upgrades are top-level entries in the array
- Child upgrades go in the `nextUpgrades` array
- You can nest upgrades multiple levels deep
- Use `previewNextUpgrades: 0` for leaf nodes

### Step 3: Implement Upgrade Logic

**File:** `src/renderer/game/GameUpgrades.ts`

Add methods to handle your upgrade's logic:

#### For Unlock Upgrades:

```typescript
/**
 * Check if your feature is unlocked
 */
hasYourFeature(): boolean {
    return this.getUpgradeLevel(UpgradeType.YOUR_NEW_UPGRADE) > 0;
}
```

#### For Stat Upgrades:

```typescript
/**
 * Get your stat value
 */
getYourStatValue(): number {
    const level = this.getUpgradeLevel(UpgradeType.YOUR_NEW_UPGRADE);
    const baseValue = 10;  // Starting value
    const increment = 5;   // Per-level increase
    
    return baseValue + (level * increment);
}
```

#### For Percentage Upgrades:

```typescript
/**
 * Get your percentage multiplier
 */
getYourMultiplier(): number {
    const level = this.getUpgradeLevel(UpgradeType.YOUR_NEW_UPGRADE);
    return 1 + (level * 0.1);  // 10% per level
}
```

#### For Chance-Based Upgrades:

```typescript
/**
 * Get your chance value (0 to 1)
 */
getYourChance(): number {
    if (!this.hasYourFeature()) return 0;
    
    const bonusLevel = this.getUpgradeLevel(UpgradeType.YOUR_FEATURE_BONUS);
    const baseChance = 0.1;  // 10% base
    const bonusChance = bonusLevel * 0.1;  // +10% per level
    
    return Math.min(baseChance + bonusChance, 1.0);  // Cap at 100%
}
```

### Step 4: Integrate with Game

**File:** `src/renderer/game/Game.ts`

Apply your upgrade in the appropriate location:

#### In `handleUpgradeComplete()` (for entity properties):

```typescript
private handleUpgradeComplete(): void {
    const upgrades = this.upgradeTreeScreen.getUpgradeLevels();
    this.gameUpgrades.setUpgradeLevels(upgrades);
    
    // Apply your upgrade
    if (this.gameUpgrades.hasYourFeature()) {
        const value = this.gameUpgrades.getYourStatValue();
        this.yourEntity.setProperty(value);
    }
}
```

#### In game loop (for runtime checks):

```typescript
// In collision detection or update logic
if (this.gameUpgrades.hasYourFeature()) {
    const chance = this.gameUpgrades.getYourChance();
    if (Math.random() < chance) {
        // Apply your effect
    }
}
```

### Step 5: Add Tests

**File:** `tests/unit/GameUpgrades.test.ts`

Add unit tests for your upgrade:

```typescript
describe('your feature', () => {
    it('should return false for hasYourFeature with no upgrade', () => {
        expect(gameUpgrades.hasYourFeature()).toBe(false);
    });

    it('should return true for hasYourFeature when unlocked', () => {
        const upgrades = new Map<string, number>();
        upgrades.set(UpgradeType.YOUR_NEW_UPGRADE, 1);
        gameUpgrades.setUpgradeLevels(upgrades);

        expect(gameUpgrades.hasYourFeature()).toBe(true);
    });

    it('should calculate correct value at level 1', () => {
        const upgrades = new Map<string, number>();
        upgrades.set(UpgradeType.YOUR_NEW_UPGRADE, 1);
        gameUpgrades.setUpgradeLevels(upgrades);

        expect(gameUpgrades.getYourStatValue()).toBe(15);  // base 10 + 5
    });
});
```

---

## Examples

### Example 1: Simple Stat Upgrade (Ball Speed)

#### Step 1: Add to types.ts
```typescript
export enum UpgradeType {
    BALL_SPEED_INCREASE_10_PERCENT = 'BALL_SPEED_INCREASE_10_PERCENT',
}
```

#### Step 2: Add to upgrades.ts
```typescript
{
    name: 'Ball Speed',
    description: 'Increase ball speed by 10%',
    times: 3,
    previewNextUpgrades: 0,
    unlockNextUpgradesAfterTimes: 0,
    type: UpgradeType.BALL_SPEED_INCREASE_10_PERCENT,
    nextUpgrades: [],
}
```

#### Step 3: Add to GameUpgrades.ts
```typescript
applyBallUpgrades(): { speed: number; radius: number; damage: number } {
    const damageLevel = this.getUpgradeLevel(UpgradeType.BALL_DAMAGE_INCREASE_INCREMENT_1);
    const damage = 1 + damageLevel;
    
    // Add speed upgrade
    const speedLevel = this.getUpgradeLevel(UpgradeType.BALL_SPEED_INCREASE_10_PERCENT);
    const speedMultiplier = 1 + (speedLevel * 0.1);
    const speed = this.baseBallSpeed * speedMultiplier;
    
    return {
        speed,
        radius: this.baseBallRadius,
        damage,
    };
}
```

#### Step 4: Apply in Game.ts
```typescript
private handleUpgradeComplete(): void {
    // ... existing code ...
    
    const ballProps = this.gameUpgrades.applyBallUpgrades();
    this.ball.setDamage(ballProps.damage);
    // Ball speed would need a setter method added to Ball class
}
```

---

### Example 2: Unlock + Enhancement (Multi-Ball)

#### Step 1: Add to types.ts
```typescript
export enum UpgradeType {
    BALL_ADD_MULTIBALL = 'BALL_ADD_MULTIBALL',
    BALL_MULTIBALL_COUNT_INCREASE_1 = 'BALL_MULTIBALL_COUNT_INCREASE_1',
}
```

#### Step 2: Add to upgrades.ts
```typescript
{
    name: 'Multi-Ball',
    description: 'Spawn 2 additional balls on brick hit',
    times: 1,
    previewNextUpgrades: 0,
    unlockNextUpgradesAfterTimes: 1,
    type: UpgradeType.BALL_ADD_MULTIBALL,
    nextUpgrades: [
        {
            name: 'Multi-Ball+',
            description: 'Spawn 1 additional ball',
            times: 3,
            previewNextUpgrades: 0,
            unlockNextUpgradesAfterTimes: 0,
            type: UpgradeType.BALL_MULTIBALL_COUNT_INCREASE_1,
            nextUpgrades: [],
        }
    ],
}
```

#### Step 3: Add to GameUpgrades.ts
```typescript
/**
 * Check if multi-ball is unlocked
 */
hasMultiBall(): boolean {
    return this.getUpgradeLevel(UpgradeType.BALL_ADD_MULTIBALL) > 0;
}

/**
 * Get number of extra balls to spawn
 */
getMultiBallCount(): number {
    if (!this.hasMultiBall()) return 0;
    
    const bonusLevel = this.getUpgradeLevel(UpgradeType.BALL_MULTIBALL_COUNT_INCREASE_1);
    return 2 + bonusLevel;  // Base 2, +1 per level
}
```

#### Step 4: Apply in Game.ts
```typescript
// In ball-brick collision handling
if (collision.collided) {
    brick.takeDamage(this.ball.getDamage());
    
    // Multi-ball effect
    if (this.gameUpgrades.hasMultiBall()) {
        const count = this.gameUpgrades.getMultiBallCount();
        for (let i = 0; i < count; i++) {
            this.spawnExtraBall();  // You'd need to implement this
        }
    }
}
```

---

### Example 3: Conditional Effect (Critical Hits)

#### Step 1: Add to types.ts
```typescript
export enum UpgradeType {
    BALL_ADD_CRITICAL_HIT = 'BALL_ADD_CRITICAL_HIT',
    BALL_CRITICAL_CHANCE_10_PERCENT = 'BALL_CRITICAL_CHANCE_10_PERCENT',
    BALL_CRITICAL_DAMAGE_INCREASE_50_PERCENT = 'BALL_CRITICAL_DAMAGE_INCREASE_50_PERCENT',
}
```

#### Step 2: Add to upgrades.ts
```typescript
{
    name: 'Critical Hit',
    description: '10% chance to deal double damage',
    times: 1,
    previewNextUpgrades: 2,
    unlockNextUpgradesAfterTimes: 1,
    type: UpgradeType.BALL_ADD_CRITICAL_HIT,
    nextUpgrades: [
        {
            name: 'Critical Chance+',
            description: 'Increase crit chance by 10%',
            times: 3,
            previewNextUpgrades: 0,
            unlockNextUpgradesAfterTimes: 0,
            type: UpgradeType.BALL_CRITICAL_CHANCE_10_PERCENT,
            nextUpgrades: [],
        },
        {
            name: 'Critical Damage+',
            description: 'Increase crit damage by 50%',
            times: 3,
            previewNextUpgrades: 0,
            unlockNextUpgradesAfterTimes: 0,
            type: UpgradeType.BALL_CRITICAL_DAMAGE_INCREASE_50_PERCENT,
            nextUpgrades: [],
        }
    ],
}
```

#### Step 3: Add to GameUpgrades.ts
```typescript
/**
 * Check if critical hits are unlocked
 */
hasCriticalHit(): boolean {
    return this.getUpgradeLevel(UpgradeType.BALL_ADD_CRITICAL_HIT) > 0;
}

/**
 * Get critical hit chance (0 to 1)
 */
getCriticalChance(): number {
    if (!this.hasCriticalHit()) return 0;
    
    const bonusLevel = this.getUpgradeLevel(UpgradeType.BALL_CRITICAL_CHANCE_10_PERCENT);
    const baseChance = 0.1;  // 10% base
    const bonusChance = bonusLevel * 0.1;  // +10% per level
    
    return Math.min(baseChance + bonusChance, 1.0);
}

/**
 * Get critical damage multiplier
 */
getCriticalDamageMultiplier(): number {
    if (!this.hasCriticalHit()) return 1.0;
    
    const bonusLevel = this.getUpgradeLevel(UpgradeType.BALL_CRITICAL_DAMAGE_INCREASE_50_PERCENT);
    return 2.0 + (bonusLevel * 0.5);  // Base 2x, +0.5x per level
}
```

#### Step 4: Apply in Game.ts
```typescript
// In ball-brick collision handling
if (collision.collided) {
    let damage = this.ball.getDamage();
    
    // Check for critical hit
    if (this.gameUpgrades.hasCriticalHit()) {
        const critChance = this.gameUpgrades.getCriticalChance();
        if (Math.random() < critChance) {
            const critMultiplier = this.gameUpgrades.getCriticalDamageMultiplier();
            damage *= critMultiplier;
            // Show critical hit visual effect
            this.showCriticalHitEffect();
        }
    }
    
    brick.takeDamage(damage);
}
```

---

## Testing

### Unit Tests

Always add tests for your upgrade logic in `tests/unit/GameUpgrades.test.ts`:

```typescript
describe('your new upgrade', () => {
    it('should start disabled', () => {
        expect(gameUpgrades.hasYourFeature()).toBe(false);
    });

    it('should enable when purchased', () => {
        const upgrades = new Map<string, number>();
        upgrades.set(UpgradeType.YOUR_NEW_UPGRADE, 1);
        gameUpgrades.setUpgradeLevels(upgrades);

        expect(gameUpgrades.hasYourFeature()).toBe(true);
    });

    it('should calculate correct values', () => {
        const upgrades = new Map<string, number>();
        upgrades.set(UpgradeType.YOUR_NEW_UPGRADE, 2);
        gameUpgrades.setUpgradeLevels(upgrades);

        expect(gameUpgrades.getYourValue()).toBe(expectedValue);
    });

    it('should cap at maximum value', () => {
        const upgrades = new Map<string, number>();
        upgrades.set(UpgradeType.YOUR_NEW_UPGRADE, 999);
        gameUpgrades.setUpgradeLevels(upgrades);

        expect(gameUpgrades.getYourValue()).toBe(maxValue);
    });
});
```

### Manual Testing

1. **Start game** and complete first level
2. **Verify upgrade appears** in upgrade tree
3. **Purchase upgrade** and verify it increments
4. **Continue playing** and verify effect works
5. **Test edge cases**:
   - Maximum level reached
   - Child upgrades unlock correctly
   - Stacking with other upgrades
   - Reset on new game

---

## Best Practices

### Naming Conventions

- **Upgrade Types**: `ENTITY_ACTION_DETAILS`
- **Methods**: `hasFeature()`, `getFeatureValue()`, `getFeatureMultiplier()`
- **Variables**: Descriptive names like `critChance`, `explosionRadius`

### Code Organization

- Keep upgrade logic in `GameUpgrades.ts`
- Keep tree structure in `upgrades.ts`
- Keep type definitions in `types.ts`
- Apply effects in `Game.ts`

### Performance

- Cache calculations when possible
- Avoid checking upgrades in tight loops
- Use early returns for disabled upgrades

### Balance

- Start with conservative values
- Test with max upgrades
- Consider synergies with other upgrades
- Ensure upgrades feel impactful

### Documentation

- Add JSDoc comments to all methods
- Explain formulas and calculations
- Document edge cases and caps
- Update this guide with new patterns

---

## Common Patterns

### Pattern 1: Base + Increment
```typescript
const level = this.getUpgradeLevel(UpgradeType.YOUR_UPGRADE);
return baseValue + (level * increment);
```

### Pattern 2: Multiplier
```typescript
const level = this.getUpgradeLevel(UpgradeType.YOUR_UPGRADE);
return 1 + (level * 0.1);  // 10% per level
```

### Pattern 3: Unlock + Bonus
```typescript
if (!this.hasFeature()) return 0;
const bonusLevel = this.getUpgradeLevel(UpgradeType.FEATURE_BONUS);
return baseValue + (bonusLevel * increment);
```

### Pattern 4: Capped Percentage
```typescript
const level = this.getUpgradeLevel(UpgradeType.YOUR_UPGRADE);
const value = baseChance + (level * increment);
return Math.min(value, 1.0);  // Cap at 100%
```

---

## Troubleshooting

### Upgrade not appearing in tree
- Check that it's added to `upgrades.ts`
- Verify parent's `previewNextUpgrades` > 0
- Check `unlockNextUpgradesAfterTimes` value

### Upgrade not working
- Verify `UpgradeType` enum value matches
- Check that logic is in `GameUpgrades.ts`
- Ensure `Game.ts` calls the upgrade method
- Add console.log to debug values

### Tests failing
- Check mock upgrade levels are set correctly
- Verify expected values match implementation
- Ensure test describes the actual behavior

### Upgrade too powerful/weak
- Adjust base values and increments
- Consider adding caps or diminishing returns
- Test with other upgrades active
- Get player feedback

---

## Reference

### Key Files

| File | Purpose |
|------|---------|
| `src/renderer/game/types.ts` | Type definitions and enums |
| `src/renderer/config/upgrades.ts` | Upgrade tree structure |
| `src/renderer/game/GameUpgrades.ts` | Upgrade logic implementation |
| `src/renderer/game/Game.ts` | Game integration |
| `tests/unit/GameUpgrades.test.ts` | Unit tests |

### Related Documentation

- `upgrade-tree-visual-design.md` - Visual design of upgrade UI
- `architecture.md` - Overall system architecture
- `planning.md` - Feature planning and roadmap
