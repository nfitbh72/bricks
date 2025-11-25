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

1. **Upgrade Types** (`src/renderer/game/core/types.ts`) - Enum defining all upgrade types
2. **Upgrade Tree** (`src/renderer/config/upgrades.ts`) - Tree structure defining available upgrades
3. **Upgrade Logic** (`src/renderer/game/systems/GameUpgrades.ts`) - Implementation of upgrade effects
4. **Game Integration** (`src/renderer/game/managers/StateTransitionHandler.ts`) - Where upgrades are applied

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

**File:** `src/renderer/game/core/types.ts`

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

### Step 2: Add to Flat Upgrade Array

**File:** `src/renderer/config/upgrades.ts`

Add your upgrade to the flat array inside the `getUpgrades()` function. The tree structure is built automatically based on prerequisites:

```typescript
export function getUpgrades(): Upgrade[] {
    return [
        // Root upgrades (no prerequisites)
        {
            name: t('game.upgrades.yourUpgrade.name'),
            description: t('game.upgrades.yourUpgrade.description'),
            times: 3,  // How many times it can be purchased
            type: UpgradeType.YOUR_NEW_UPGRADE,
        },
        
        // Child upgrade (requires parent)
        {
            name: t('game.upgrades.yourChildUpgrade.name'),
            description: t('game.upgrades.yourChildUpgrade.description'),
            times: 1,
            type: UpgradeType.YOUR_CHILD_UPGRADE,
            prerequisites: [
                { type: UpgradeType.YOUR_NEW_UPGRADE, level: 2 },  // Requires parent at level 2
            ],
        },
    ];
}
```

**Note:** The upgrade system uses the i18n translation system (`t()` function) for names and descriptions.

**Upgrade Properties:**

| Property | Type | Description |
|----------|------|-------------|
| `name` | string | Display name shown to player |
| `description` | string | What the upgrade does |
| `times` | number | Max purchase count (1 for unlocks) |
| `type` | UpgradeType | Enum value for this upgrade |
| `prerequisites` | UpgradePrerequisite[] | (Optional) Required upgrades and their levels |

**Prerequisites:**
- Upgrades with no `prerequisites` are root nodes (shown at the top)
- The first prerequisite determines the parent in the tree
- Additional prerequisites create cross-branch requirements
- Format: `{ type: UpgradeType.PARENT, level: 2 }` means parent must be at level 2 or higher

### Step 3: Implement Upgrade Logic

**File:** `src/renderer/game/systems/GameUpgrades.ts`

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

**File:** `src/renderer/game/managers/StateTransitionHandler.ts`

Apply your upgrade in the `applyUpgrades()` method:

#### In `applyUpgrades()` (for entity properties):

```typescript
private applyUpgrades(): void {
    const upgrades = this.context.screenManager.upgradeTreeScreen.getUpgradeLevels();
    this.context.gameUpgrades.setUpgradeLevels(upgrades);
    
    // Apply your upgrade
    if (this.context.gameUpgrades.hasYourFeature()) {
        const value = this.context.gameUpgrades.getYourStatValue();
        this.context.yourEntity.setProperty(value);
    }
}
```

#### In game loop (for runtime checks in Game.ts):

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

#### Step 4: Apply in StateTransitionHandler.ts
```typescript
private applyUpgrades(): void {
    // ... existing code ...
    
    const ballProps = this.context.gameUpgrades.applyBallUpgrades();
    this.context.ball.setDamage(ballProps.damage);
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
// In ball-brick collision handling in Game.ts
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
    BALL_ADD_CRITICAL_HITS = 'BALL_ADD_CRITICAL_HITS',
    BALL_CHANCE_CRITICAL_HITS_10_PERCENT = 'BALL_CHANCE_CRITICAL_HITS_10_PERCENT',
    BALL_SUPER_STATS = 'BALL_SUPER_STATS',
}
```

#### Step 2: Add to upgrades.ts
```typescript
{
    name: 'Critical Hit',
    description: '10% chance to deal double damage',
    times: 1,
    previewNextUpgrades: 0,
    unlockNextUpgradesAfterTimes: 1,
    type: UpgradeType.BALL_ADD_CRITICAL_HITS,
    nextUpgrades: [
        {
            name: 'Critical Chance+',
            description: 'Increase crit chance by 10%',
            times: 3,
            previewNextUpgrades: 1,
            unlockNextUpgradesAfterTimes: 2,
            type: UpgradeType.BALL_CHANCE_CRITICAL_HITS_10_PERCENT,
            nextUpgrades: [
                {
                    name: 'SUPER STATS',
                    description: 'Improve all ball stats',
                    times: 10,
                    previewNextUpgrades: 0,
                    unlockNextUpgradesAfterTimes: 0,
                    type: UpgradeType.BALL_SUPER_STATS,
                    nextUpgrades: [],
                }
            ],
        }
    ],
}
```

#### Step 3: Add to GameUpgrades.ts
```typescript
/**
 * Check if critical hits are unlocked
 */
hasCriticalHits(): boolean {
    return this.getUpgradeLevel(UpgradeType.BALL_ADD_CRITICAL_HITS) > 0;
}

/**
 * Get critical hit chance (0 to 1)
 */
getCriticalHitChance(): number {
    if (!this.hasCriticalHits()) return 0;
    
    const bonusLevel = this.getUpgradeLevel(UpgradeType.BALL_CHANCE_CRITICAL_HITS_10_PERCENT);
    const baseChance = 0.1;  // 10% base
    const bonusChance = bonusLevel * 0.1;  // +10% per level
    
    return Math.min(baseChance + bonusChance, 1.0);
}

/**
 * Get total critical hit chance including super stats bonus
 * BALL_SUPER_STATS increases crit chance by 10% per level
 */
getTotalCriticalHitChance(): number {
    if (!this.hasCriticalHits()) return 0;
    
    const baseChance = this.getCriticalHitChance();
    const superStatsLevel = this.getUpgradeLevel(UpgradeType.BALL_SUPER_STATS);
    const bonusChance = superStatsLevel * 0.1; // +10% chance per level
    
    return Math.min(baseChance + bonusChance, 1.0); // Cap at 100%
}

/**
 * Get critical hit damage multiplier
 * Base multiplier is 2.0x (double damage)
 * BALL_SUPER_STATS increases by 10% per level
 */
getCriticalHitDamageMultiplier(): number {
    if (!this.hasCriticalHits()) return 2.0;
    
    const superStatsLevel = this.getUpgradeLevel(UpgradeType.BALL_SUPER_STATS);
    const baseDamage = 2.0; // 2x damage base
    const bonusDamage = superStatsLevel * 0.1; // +10% per level
    
    return baseDamage + bonusDamage;
}
```

#### Step 4: Apply in Game.ts
```typescript
// In ball-brick collision handling
if (collision.collided) {
    let damage = this.ball.getDamage();
    
    // Check for critical hit
    if (this.gameUpgrades.hasCriticalHits()) {
        const critChance = this.gameUpgrades.getTotalCriticalHitChance();
        if (Math.random() < critChance) {
            const critMultiplier = this.gameUpgrades.getCriticalHitDamageMultiplier();
            damage *= critMultiplier;
            // Show critical hit visual effect
            this.showCriticalHitEffect();
        }
    }
    
    brick.takeDamage(damage);
}
```

---

### Example 4: Multi-Stat Enhancement with Multiple Prerequisites (Super Stats)

The `BALL_SUPER_STATS` upgrade demonstrates how to create an upgrade that requires multiple other upgrades to be maxed out first. This creates a powerful late-game upgrade that rewards players for fully investing in multiple upgrade paths.

#### Step 1: Define in upgrades.ts

```typescript
{
    name: 'SUPER STATS',
    description: 'Improve all ball stats',
    times: 10,
    type: UpgradeType.BALL_SUPER_STATS,
    prerequisites: [
        { type: UpgradeType.BALL_PIERCING_DURATION, level: 3 },
        { type: UpgradeType.BALL_CHANCE_CRITICAL_HITS_10_PERCENT, level: 3 },
        { type: UpgradeType.BALL_EXPLOSION_RADIUS_INCREASE_20_PERCENT, level: 3 },
    ],
}
```

**How it works:**
- The upgrade appears as a child of the first prerequisite (Piercing Duration)
- It only unlocks when ALL three prerequisites are at level 3
- This creates a convergence point for three separate upgrade branches

#### Step 2: Implement Multi-Stat Effects

Each level of `BALL_SUPER_STATS` provides:
- +10% critical hit chance
- +10% critical hit damage
- +10% piercing chance
- +10% explosion damage
- +10% explosion radius
- +1 second piercing duration

```typescript
// In GameUpgrades.ts - Each affected method checks for BALL_SUPER_STATS bonus

getBallPiercingChance(): number {
    if (!this.hasBallPiercing()) return 0;
    
    const piercingLevel = this.getUpgradeLevel(UpgradeType.BALL_CHANCE_PIERCING_10_PERCENT);
    const superStatsLevel = this.getUpgradeLevel(UpgradeType.BALL_SUPER_STATS);
    const baseChance = 0.1;
    const bonusChance = piercingLevel * 0.1;
    const superStatsBonus = superStatsLevel * 0.1; // Super stats contribution
    
    return Math.min(baseChance + bonusChance + superStatsBonus, 1.0);
}

getBallExplosionDamageMultiplier(): number {
    if (!this.hasBallExplosions()) return 0;
    
    const explosionLevel = this.getUpgradeLevel(UpgradeType.BALL_EXPLOSIONS_INCREASE_10_PERCENT);
    const superStatsLevel = this.getUpgradeLevel(UpgradeType.BALL_SUPER_STATS);
    const baseMultiplier = 0.1;
    const bonusMultiplier = explosionLevel * 0.1;
    const superStatsBonus = superStatsLevel * 0.1; // Super stats contribution
    
    return baseMultiplier + bonusMultiplier + superStatsBonus;
}

// Similar pattern for other affected stats...
```

**Key Points:**
- Multiple prerequisites create cross-branch requirements
- Super stats only affect features that are already unlocked
- Each method independently checks the super stats level
- Bonuses stack additively with other upgrades
- Allows for powerful late-game scaling across multiple mechanics
- Encourages diverse upgrade strategies

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
| `src/renderer/game/core/types.ts` | Type definitions and enums |
| `src/renderer/config/upgrades.ts` | Upgrade tree structure |
| `src/renderer/game/systems/GameUpgrades.ts` | Upgrade logic implementation |
| `src/renderer/game/managers/StateTransitionHandler.ts` | Upgrade application |
| `src/renderer/game/core/Game.ts` | Runtime upgrade checks |
| `tests/unit/GameUpgrades.test.ts` | Unit tests |

### Related Documentation

- `upgrade-tree-visual-design.md` - Visual design of upgrade UI
- `architecture.md` - Overall system architecture
- `planning.md` - Feature planning and roadmap
