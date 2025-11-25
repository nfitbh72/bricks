/**
 * Unit tests for SpatialHash
 */

import { SpatialHash } from '../../src/renderer/game/core/SpatialHash';
import { IEntity, Bounds } from '../../src/renderer/game/core/IEntity';

// Mock entity for testing
class MockEntity implements IEntity {
    constructor(private bounds: Bounds | null, private active: boolean = true) { }

    update(dt: number): void { }
    render(ctx: CanvasRenderingContext2D): void { }
    getBounds(): Bounds | null {
        return this.bounds;
    }
    isActive(): boolean {
        return this.active;
    }
    deactivate(): void {
        this.active = false;
    }
}

describe('SpatialHash', () => {
    let spatialHash: SpatialHash;

    beforeEach(() => {
        spatialHash = new SpatialHash(100); // 100px cell size
    });

    describe('constructor', () => {
        it('should create with default cell size', () => {
            const hash = new SpatialHash();
            expect(hash.getCellSize()).toBe(100);
        });

        it('should create with custom cell size', () => {
            const hash = new SpatialHash(50);
            expect(hash.getCellSize()).toBe(50);
        });
    });

    describe('insert and query', () => {
        it('should insert and query entity in single cell', () => {
            const entity = new MockEntity({ x: 10, y: 10, width: 20, height: 20 });
            spatialHash.insert(entity);

            const results = spatialHash.query({ x: 0, y: 0, width: 50, height: 50 });
            expect(results).toContain(entity);
            expect(results.length).toBe(1);
        });

        it('should not insert entity with null bounds', () => {
            const entity = new MockEntity(null);
            spatialHash.insert(entity);

            const results = spatialHash.query({ x: 0, y: 0, width: 100, height: 100 });
            expect(results.length).toBe(0);
        });

        it('should query entities in multiple cells', () => {
            const entity1 = new MockEntity({ x: 10, y: 10, width: 20, height: 20 });
            const entity2 = new MockEntity({ x: 150, y: 10, width: 20, height: 20 });

            spatialHash.insert(entity1);
            spatialHash.insert(entity2);

            // Query that spans both cells
            const results = spatialHash.query({ x: 0, y: 0, width: 200, height: 50 });
            expect(results).toContain(entity1);
            expect(results).toContain(entity2);
            expect(results.length).toBe(2);
        });

        it('should not return entities from non-overlapping cells', () => {
            const entity1 = new MockEntity({ x: 10, y: 10, width: 20, height: 20 });
            const entity2 = new MockEntity({ x: 250, y: 250, width: 20, height: 20 });

            spatialHash.insert(entity1);
            spatialHash.insert(entity2);

            // Query only first cell
            const results = spatialHash.query({ x: 0, y: 0, width: 50, height: 50 });
            expect(results).toContain(entity1);
            expect(results).not.toContain(entity2);
            expect(results.length).toBe(1);
        });

        it('should handle entity spanning multiple cells', () => {
            // Entity that spans 4 cells (2x2)
            const entity = new MockEntity({ x: 90, y: 90, width: 30, height: 30 });
            spatialHash.insert(entity);

            // Query each of the 4 cells
            const results1 = spatialHash.query({ x: 80, y: 80, width: 10, height: 10 });
            const results2 = spatialHash.query({ x: 110, y: 80, width: 10, height: 10 });
            const results3 = spatialHash.query({ x: 80, y: 110, width: 10, height: 10 });
            const results4 = spatialHash.query({ x: 110, y: 110, width: 10, height: 10 });

            expect(results1).toContain(entity);
            expect(results2).toContain(entity);
            expect(results3).toContain(entity);
            expect(results4).toContain(entity);
        });

        it('should return unique entities when querying multiple cells', () => {
            // Entity spanning 2 cells
            const entity = new MockEntity({ x: 90, y: 10, width: 30, height: 20 });
            spatialHash.insert(entity);

            // Query that covers both cells
            const results = spatialHash.query({ x: 80, y: 0, width: 50, height: 50 });

            // Should only return entity once even though it's in 2 cells
            expect(results.filter(e => e === entity).length).toBe(1);
        });
    });

    describe('clear', () => {
        it('should remove all entities', () => {
            const entity1 = new MockEntity({ x: 10, y: 10, width: 20, height: 20 });
            const entity2 = new MockEntity({ x: 150, y: 10, width: 20, height: 20 });

            spatialHash.insert(entity1);
            spatialHash.insert(entity2);

            spatialHash.clear();

            const results = spatialHash.query({ x: 0, y: 0, width: 200, height: 50 });
            expect(results.length).toBe(0);
        });

        it('should reset cell count', () => {
            const entity = new MockEntity({ x: 10, y: 10, width: 20, height: 20 });
            spatialHash.insert(entity);

            expect(spatialHash.getCellCount()).toBeGreaterThan(0);

            spatialHash.clear();

            expect(spatialHash.getCellCount()).toBe(0);
        });
    });

    describe('statistics', () => {
        it('should track cell count', () => {
            const entity1 = new MockEntity({ x: 10, y: 10, width: 20, height: 20 });
            const entity2 = new MockEntity({ x: 150, y: 150, width: 20, height: 20 });

            spatialHash.insert(entity1);
            spatialHash.insert(entity2);

            expect(spatialHash.getCellCount()).toBe(2);
        });

        it('should track entity reference count', () => {
            const entity1 = new MockEntity({ x: 10, y: 10, width: 20, height: 20 }); // 1 cell
            const entity2 = new MockEntity({ x: 90, y: 90, width: 30, height: 30 }); // 4 cells

            spatialHash.insert(entity1);
            spatialHash.insert(entity2);

            // entity1 in 1 cell + entity2 in 4 cells = 5 references
            expect(spatialHash.getEntityReferenceCount()).toBe(5);
        });
    });

    describe('edge cases', () => {
        it('should handle entity at origin', () => {
            const entity = new MockEntity({ x: 0, y: 0, width: 10, height: 10 });
            spatialHash.insert(entity);

            const results = spatialHash.query({ x: 0, y: 0, width: 50, height: 50 });
            expect(results).toContain(entity);
        });

        it('should handle entity with zero size', () => {
            const entity = new MockEntity({ x: 50, y: 50, width: 0, height: 0 });
            spatialHash.insert(entity);

            const results = spatialHash.query({ x: 0, y: 0, width: 100, height: 100 });
            expect(results).toContain(entity);
        });

        it('should handle negative coordinates', () => {
            const entity = new MockEntity({ x: -50, y: -50, width: 20, height: 20 });
            spatialHash.insert(entity);

            const results = spatialHash.query({ x: -100, y: -100, width: 100, height: 100 });
            expect(results).toContain(entity);
        });

        it('should handle very large coordinates', () => {
            const entity = new MockEntity({ x: 10000, y: 10000, width: 20, height: 20 });
            spatialHash.insert(entity);

            const results = spatialHash.query({ x: 9900, y: 9900, width: 200, height: 200 });
            expect(results).toContain(entity);
        });
    });
});
