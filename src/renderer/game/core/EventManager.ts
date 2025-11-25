/**
 * EventManager class
 * Centralized event handling to decouple systems
 */

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type EventCallback<T = any> = (data: T) => void;

export class EventManager {
    private listeners: Map<string, EventCallback[]> = new Map();

    /**
     * Subscribe to an event
     */
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    public on<T = any>(event: string, callback: EventCallback<T>): void {
        if (!this.listeners.has(event)) {
            this.listeners.set(event, []);
        }
        const callbacks = this.listeners.get(event);
        if (callbacks) {
            callbacks.push(callback);
        }
    }

    /**
     * Unsubscribe from an event
     */
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    public off<T = any>(event: string, callback: EventCallback<T>): void {
        const callbacks = this.listeners.get(event);
        if (callbacks) {
            const index = callbacks.indexOf(callback);
            if (index !== -1) {
                callbacks.splice(index, 1);
            }
        }
    }

    /**
     * Emit an event
     */
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    public emit<T = any>(event: string, data?: T): void {
        const callbacks = this.listeners.get(event);
        if (callbacks) {
            // Clone array to prevent issues if listeners are removed during emission
            [...callbacks].forEach(callback => callback(data));
        }
    }

    /**
     * Clear all listeners
     */
    public clear(): void {
        this.listeners.clear();
    }
}

// Event constants
export const GameEvents = {
    BRICK_HIT: 'brick_hit',
    BRICK_DESTROYED: 'brick_destroyed',
    GAME_OVER: 'game_over',
    LEVEL_COMPLETE: 'level_complete',
    SCORE_UPDATED: 'score_updated',
    PLAYER_HEALTH_CHANGED: 'player_health_changed',
    BOSS_SPAWNED: 'boss_spawned',
    BOSS_DEFEATED: 'boss_defeated',
};
