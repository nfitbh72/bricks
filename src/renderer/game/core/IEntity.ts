export interface Bounds {
    x: number;
    y: number;
    width: number;
    height: number;
}

export interface IEntity {
    update(dt: number): void;
    render(ctx: CanvasRenderingContext2D): void;
    getBounds(): Bounds | null;
    isActive(): boolean;
    deactivate(): void;
}
