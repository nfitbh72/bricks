import { BaseBoss } from './BaseBoss';
import {
    BOSS6_MOVE_SPEED,
    BOSS6_THROW_INTERVAL,
    BOSS6_THROWN_BRICK_SPEED,
    BOSS6_PHASE_INTERVAL,
    BOSS6_PHASE_DURATION,
    BOSS6_TELEPORT_COOLDOWN,
    BOSS6_ILLUSION_CHANCE,
    BRICK_WIDTH,
    BRICK_HEIGHT
} from '../../../config/constants';
import { Ball } from '../../entities/Ball';

export class PhantomBoss extends BaseBoss {
    protected readonly moveSpeed: number = BOSS6_MOVE_SPEED;
    protected readonly throwInterval: number = BOSS6_THROW_INTERVAL;
    protected readonly thrownBrickSpeed: number = BOSS6_THROWN_BRICK_SPEED;

    private phaseTimer: number = 0;
    private phaseDurationTimer: number = 0;
    private isPhasing: boolean = false;

    private teleportTimer: number = 0;

    private illusion: { x: number; y: number; active: boolean; timer: number } | null = null;

    constructor(x: number, y: number, health: number, color: string, canvasWidth: number, canvasHeight: number) {
        super(x, y, health, color, canvasWidth, canvasHeight);
        this.phaseTimer = BOSS6_PHASE_INTERVAL;
        this.teleportTimer = BOSS6_TELEPORT_COOLDOWN;
    }

    update(deltaTime: number, batX: number, batY: number): void {
        if (!this.active) return;

        // Only move if not phasing (or maybe move while phasing but ghost-like?)
        // Let's say it moves normally but is invulnerable
        this.updateMovement(deltaTime);

        // Only throw bricks if not phasing
        if (!this.isPhasing) {
            this.updateThrownBricks(deltaTime);
            this.updateThrowCooldown(deltaTime, batX, batY);
        } else {
            // Update thrown bricks even if phasing, so existing ones continue
            this.updateThrownBricks(deltaTime);
        }

        // Update phasing
        this.updatePhasing(deltaTime);

        // Update teleport
        this.updateTeleport(deltaTime);

        // Update illusion
        if (this.illusion && this.illusion.active) {
            this.illusion.timer -= deltaTime;
            if (this.illusion.timer <= 0) {
                this.illusion.active = false;
            }
        }
    }

    private updatePhasing(deltaTime: number): void {
        if (this.isPhasing) {
            this.phaseDurationTimer -= deltaTime;
            if (this.phaseDurationTimer <= 0) {
                this.isPhasing = false;
                this.phaseTimer = BOSS6_PHASE_INTERVAL;
            }
        } else {
            this.phaseTimer -= deltaTime;
            if (this.phaseTimer <= 0) {
                this.isPhasing = true;
                this.phaseDurationTimer = BOSS6_PHASE_DURATION;
            }
        }
    }

    private updateTeleport(deltaTime: number): void {
        this.teleportTimer -= deltaTime;
        if (this.teleportTimer <= 0 && !this.isPhasing) {
            this.teleport();
            this.teleportTimer = BOSS6_TELEPORT_COOLDOWN;
        }
    }

    private teleport(): void {
        // Pick new random position
        this.pickNewTarget();
        this.x = this.targetX;
        this.y = this.targetY;

        // Chance to spawn illusion at old position
        if (Math.random() < BOSS6_ILLUSION_CHANCE) {
            this.illusion = {
                x: this.x, // Actually this should be the OLD position, but I just updated x/y. 
                // Wait, I should have saved old pos.
                // Let's fix:
                // But for now, let's just spawn illusion at a random nearby spot or the previous target?
                // Let's spawn illusion at a random spot to confuse player
                y: this.y,
                active: true,
                timer: 2.0 // Illusion lasts 2 seconds
            };
            // Correct logic:
            // I want illusion to appear where the boss WAS, or somewhere else?
            // "Spawns a fake copy"
            // Let's make illusion appear at a random position
            this.illusion.x = this.minX + Math.random() * (this.maxX - this.minX);
            this.illusion.y = this.minY + Math.random() * (this.maxY - this.minY);
        }
    }

    // Override takeDamage to handle invulnerability during phasing
    takeDamage(damage: number): void {
        if (this.isPhasing) return; // Invulnerable
        super.takeDamage(damage);
    }

    /**
     * Check collision with illusion
     * Returns true if collision occurred
     */
    checkIllusionCollision(ball: Ball): boolean {
        if (!this.illusion || !this.illusion.active) return false;

        const ballBounds = ball.getBounds();

        // Simple AABB check
        const ballRect = {
            x: ballBounds.x - ballBounds.radius,
            y: ballBounds.y - ballBounds.radius,
            width: ballBounds.radius * 2,
            height: ballBounds.radius * 2
        };

        if (
            ballRect.x < this.illusion.x + this.width &&
            ballRect.x + ballRect.width > this.illusion.x &&
            ballRect.y < this.illusion.y + this.height &&
            ballRect.y + ballRect.height > this.illusion.y
        ) {
            // Collision detected - illusion disappears
            this.illusion.active = false;
            return true;
        }

        return false;
    }

    render(ctx: CanvasRenderingContext2D): void {
        if (!this.active) return;

        ctx.save();

        // Render illusion
        if (this.illusion && this.illusion.active) {
            ctx.globalAlpha = 0.5;
            ctx.fillStyle = this.color;
            ctx.fillRect(this.illusion.x, this.illusion.y, this.width, this.height);
            ctx.strokeStyle = '#FFFFFF';
            ctx.strokeRect(this.illusion.x, this.illusion.y, this.width, this.height);
            ctx.fillStyle = '#000000';
            ctx.font = 'bold 12px monospace';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText('BOSS', this.illusion.x + this.width / 2, this.illusion.y + this.height / 2);
            ctx.globalAlpha = 1.0;
        }

        // Render boss
        if (this.isPhasing) {
            ctx.globalAlpha = 0.3; // Transparent when phasing
        }

        this.renderBossBody(ctx);

        ctx.globalAlpha = 1.0;

        this.renderHealthBar(ctx);
        this.renderThrownBricks(ctx);

        ctx.restore();
    }
}
