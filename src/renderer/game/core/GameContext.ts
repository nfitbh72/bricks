/**
 * GameContext class
 * Service Locator / Context for shared game dependencies
 */

import { EventManager } from './EventManager';
import { SpatialHash } from './SpatialHash';
import { GameUpgrades } from '../systems/GameUpgrades';
import { AchievementTracker } from '../managers/AchievementTracker';

export class GameContext {
    public readonly eventManager: EventManager;
    public readonly spatialHash: SpatialHash;
    
    // Optional dependencies set after construction
    public gameUpgrades?: GameUpgrades;
    public achievementTracker?: AchievementTracker;

    constructor() {
        this.eventManager = new EventManager();
        this.spatialHash = new SpatialHash(100); // 100px cell size
    }
    
    /**
     * Set game upgrades (called after GameUpgrades is created)
     */
    setGameUpgrades(gameUpgrades: GameUpgrades): void {
        this.gameUpgrades = gameUpgrades;
    }
    
    /**
     * Set achievement tracker (called after AchievementTracker is created)
     */
    setAchievementTracker(achievementTracker: AchievementTracker): void {
        this.achievementTracker = achievementTracker;
    }
}
