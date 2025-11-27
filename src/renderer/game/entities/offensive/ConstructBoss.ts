import { BaseBoss } from './BaseBoss';
import {
    BOSS5_MOVE_SPEED,
    BOSS5_THROW_INTERVAL,
    BOSS5_THROWN_BRICK_SPEED,
    BOSS5_WALL_SPAWN_INTERVAL,
    BOSS5_WALL_DURATION,
    BOSS5_REPAIR_RATE,
    BOSS5_REPAIR_DELAY,
    BRICK_WIDTH,
    BRICK_HEIGHT
} from '../../../config/constants';
import { Ball } from '../../entities/Ball';

interface WallSegment {
    x: number;
    y: number;
    width: number;
    height: number;
    active: boolean;
    health: number;
    maxHealth: number;
}

export class ConstructBoss extends BaseBoss {
    protected readonly moveSpeed: number = BOSS5_MOVE_SPEED;
    protected readonly throwInterval: number = BOSS5_THROW_INTERVAL;
    protected readonly thrownBrickSpeed: number = BOSS5_THROWN_BRICK_SPEED;

    private wallTimer: number = 0;
    private wallDurationTimer: number = 0;
    private isWallActive: boolean = false;
    private walls: WallSegment[] = [];

    private repairTimer: number = 0;
    private timeSinceLastDamage: number = 0;

    constructor(x: number, y: number, health: number, color: string, canvasWidth: number, canvasHeight: number) {
        super(x, y, health, color, canvasWidth, canvasHeight);
    }

    update(deltaTime: number, batX: number, batY: number): void {
        if (!this.active) return;

        this.updateMovement(deltaTime);
        this.updateThrownBricks(deltaTime);
        this.updateThrowCooldown(deltaTime, batX, batY);

        // Update wall
        this.updateWall(deltaTime);

        // Update repair
        this.updateRepair(deltaTime);
    }

    private updateWall(deltaTime: number): void {
        if (this.isWallActive) {
            this.wallDurationTimer -= deltaTime;
            if (this.wallDurationTimer <= 0) {
                this.despawnWall();
            }
        } else {
            this.wallTimer -= deltaTime;
            if (this.wallTimer <= 0) {
                this.spawnWall();
            }
        }
    }

    private spawnWall(): void {
        this.isWallActive = true;
        this.wallDurationTimer = BOSS5_WALL_DURATION;
        this.walls = [];

        // Spawn 3 wall segments in front of the boss
        const segmentWidth = BRICK_WIDTH;
        const segmentHeight = BRICK_HEIGHT;
        const startX = this.x + this.width / 2 - (segmentWidth * 3) / 2;
        const y = this.y + this.height + 20; // Below the boss

        for (let i = 0; i < 3; i++) {
            this.walls.push({
                x: startX + i * segmentWidth,
                y: y,
                width: segmentWidth,
                height: segmentHeight,
                active: true,
                health: 2, // 2 hits to destroy
                maxHealth: 2
            });
        }
    }

    private despawnWall(): void {
        this.isWallActive = false;
        this.walls = [];
        this.wallTimer = BOSS5_WALL_SPAWN_INTERVAL;
    }

    private updateRepair(deltaTime: number): void {
        this.timeSinceLastDamage += deltaTime;

        if (this.timeSinceLastDamage >= BOSS5_REPAIR_DELAY && this.health < this.maxHealth) {
            this.health += BOSS5_REPAIR_RATE * deltaTime;
            if (this.health > this.maxHealth) {
                this.health = this.maxHealth;
            }
        }
    }

    takeDamage(damage: number): void {
        super.takeDamage(damage);
        this.timeSinceLastDamage = 0; // Reset repair timer on damage
    }

    /**
     * Check collision with wall segments
     * Returns true if collision occurred
     */
    checkWallCollision(ball: Ball): boolean {
        if (!this.isWallActive) return false;

        const ballBounds = ball.getBounds();
        let collided = false;

        for (const wall of this.walls) {
            if (!wall.active) continue;

            // Simple AABB check for now, or use circle-rect if available
            // Assuming ballBounds has x, y, radius
            // Convert ball to rect for simple check
            const ballRect = {
                x: ballBounds.x - ballBounds.radius,
                y: ballBounds.y - ballBounds.radius,
                width: ballBounds.radius * 2,
                height: ballBounds.radius * 2
            };

            if (
                ballRect.x < wall.x + wall.width &&
                ballRect.x + ballRect.width > wall.x &&
                ballRect.y < wall.y + wall.height &&
                ballRect.y + ballRect.height > wall.y
            ) {
                // Collision detected
                wall.health -= 1;
                if (wall.health <= 0) {
                    wall.active = false;
                }

                // Bounce ball (simple reverse Y for now, ideally use normal)
                ball.reverseY();
                collided = true;
            }
        }

        return collided;
    }

    render(ctx: CanvasRenderingContext2D): void {
        if (!this.active) return;

        ctx.save();

        // Render walls
        if (this.isWallActive) {
            for (const wall of this.walls) {
                if (!wall.active) continue;

                ctx.fillStyle = '#FFA500'; // Orange
                ctx.shadowBlur = 10;
                ctx.shadowColor = '#FFA500';
                ctx.fillRect(wall.x, wall.y, wall.width, wall.height);

                ctx.strokeStyle = '#FFFFFF';
                ctx.lineWidth = 2;
                ctx.strokeRect(wall.x, wall.y, wall.width, wall.height);

                // Draw cracks based on health
                if (wall.health < wall.maxHealth) {
                    ctx.beginPath();
                    ctx.moveTo(wall.x, wall.y);
                    ctx.lineTo(wall.x + wall.width, wall.y + wall.height);
                    ctx.stroke();
                }
            }
        }

        // Render repair effect
        if (this.timeSinceLastDamage >= BOSS5_REPAIR_DELAY && this.health < this.maxHealth) {
            ctx.shadowBlur = 20;
            ctx.shadowColor = '#00FF00'; // Green repair glow
        }

        this.renderBossBody(ctx);
        this.renderHealthBar(ctx);
        this.renderThrownBricks(ctx);

        ctx.restore();
    }
}
