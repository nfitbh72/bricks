import { IEntity, Bounds } from './IEntity';
import { CollisionGroup } from './CollisionTypes';

export interface ICollidable extends IEntity {
    getCollisionGroup(): CollisionGroup;
    onCollision(other: ICollidable, bounds: Bounds, otherBounds: Bounds): void;
}
