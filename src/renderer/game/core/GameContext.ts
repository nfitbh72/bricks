/**
 * GameContext class
 * Service Locator / Context for shared game dependencies
 */

import { EventManager } from './EventManager';
import { SpatialHash } from './SpatialHash';

export class GameContext {
    public readonly eventManager: EventManager;
    public readonly spatialHash: SpatialHash;

    constructor() {
        this.eventManager = new EventManager();
        this.spatialHash = new SpatialHash(100); // 100px cell size
    }
}
