/**
 * SpatialHash - Spatial partitioning data structure for efficient collision detection
 * Divides space into a grid of cells and tracks which entities are in each cell
 */

import { IEntity, Bounds } from './IEntity';

export class SpatialHash {
    private cellSize: number;
    private grid: Map<string, IEntity[]>;

    constructor(cellSize: number = 100) {
        this.cellSize = cellSize;
        this.grid = new Map();
    }

    /**
     * Clear all entities from the grid
     * Call this at the start of each frame before re-inserting entities
     */
    clear(): void {
        this.grid.clear();
    }

    /**
     * Insert an entity into the spatial hash
     * Entities that span multiple cells will be added to all overlapping cells
     */
    insert(entity: IEntity): void {
        const bounds = entity.getBounds();
        if (!bounds) return;

        const cellKeys = this.getCellsForBounds(bounds);
        for (const cellKey of cellKeys) {
            if (!this.grid.has(cellKey)) {
                this.grid.set(cellKey, []);
            }
            const cell = this.grid.get(cellKey);
            if (cell) {
                cell.push(entity);
            }
        }
    }

    /**
     * Query entities near the given bounds
     * Returns all entities in cells that overlap with the bounds
     * Note: May return duplicates if entity spans multiple cells
     */
    query(bounds: Bounds): IEntity[] {
        const cellKeys = this.getCellsForBounds(bounds);
        const entities = new Set<IEntity>();

        for (const cellKey of cellKeys) {
            const cellEntities = this.grid.get(cellKey);
            if (cellEntities) {
                cellEntities.forEach(e => entities.add(e));
            }
        }

        return Array.from(entities);
    }

    /**
     * Get all cell keys that the given bounds overlaps
     */
    private getCellsForBounds(bounds: Bounds): string[] {
        const minCellX = Math.floor(bounds.x / this.cellSize);
        const minCellY = Math.floor(bounds.y / this.cellSize);
        const maxCellX = Math.floor((bounds.x + bounds.width) / this.cellSize);
        const maxCellY = Math.floor((bounds.y + bounds.height) / this.cellSize);

        const cellKeys: string[] = [];
        for (let x = minCellX; x <= maxCellX; x++) {
            for (let y = minCellY; y <= maxCellY; y++) {
                cellKeys.push(`${x},${y}`);
            }
        }

        return cellKeys;
    }

    /**
     * Get the cell size used by this spatial hash
     */
    getCellSize(): number {
        return this.cellSize;
    }

    /**
     * Get the number of cells currently in use
     */
    getCellCount(): number {
        return this.grid.size;
    }

    /**
     * Get the total number of entity references stored
     * (entities spanning multiple cells are counted multiple times)
     */
    getEntityReferenceCount(): number {
        let count = 0;
        for (const entities of this.grid.values()) {
            count += entities.length;
        }
        return count;
    }
}
