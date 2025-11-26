import { Bounds } from '../../core/IEntity';
import { ICollidable } from '../../core/ICollidable';
import { CollisionGroup } from '../../core/CollisionTypes';
import { HomingMissile } from './HomingMissile';

/**
 * Wrapper for HomingMissile that implements IEntity
 * Stores target coordinates and delegates to the underlying HomingMissile
 */
export class HomingMissileWrapper implements ICollidable {
    private missile: HomingMissile;
    private targetX: number = 0;
    private targetY: number = 0;

    constructor(missile: HomingMissile) {
        this.missile = missile;
    }

    /**
     * Set the target coordinates for homing behavior
     */
    setTarget(x: number, y: number): void {
        this.targetX = x;
        this.targetY = y;
    }

    /**
     * Update the missile with stored target coordinates
     */
    update(dt: number): void {
        this.missile.update(dt, this.targetX, this.targetY);
    }

    render(ctx: CanvasRenderingContext2D): void {
        this.missile.render(ctx);
    }

    getBounds(): Bounds | null {
        return this.missile.getBounds();
    }

    isActive(): boolean {
        return this.missile.isActive();
    }

    deactivate(): void {
        this.missile.deactivate();
    }

    /**
     * Get the underlying HomingMissile instance
     */
    getHomingMissile(): HomingMissile {
        return this.missile;
    }

    /**
     * Check if missile is off screen
     */
    isOffScreen(canvasWidth: number, canvasHeight: number): boolean {
        return this.missile.isOffScreen(canvasWidth, canvasHeight);
    }

    getCollisionGroup(): CollisionGroup {
        return CollisionGroup.OFFENSIVE;
    }

    onCollision(_other: ICollidable, _bounds: Bounds, _otherBounds: Bounds): void {
        // Handled by collision handlers
    }
}
