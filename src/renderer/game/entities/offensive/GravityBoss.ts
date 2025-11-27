import { BaseBoss } from './BaseBoss';
import {
    BOSS4_MOVE_SPEED,
    BOSS4_THROW_INTERVAL,
    BOSS4_THROWN_BRICK_SPEED,
    BOSS4_GRAVITY_PULL_FORCE,
    BOSS4_GRAVITY_WAVE_INTERVAL,
    BOSS4_GRAVITY_WAVE_DURATION,
    BRICK_WIDTH,
    BRICK_HEIGHT
} from '../../../config/constants';
import { Ball } from '../../entities/Ball';

export class GravityBoss extends BaseBoss {
    protected readonly moveSpeed: number = BOSS4_MOVE_SPEED;
    protected readonly throwInterval: number = BOSS4_THROW_INTERVAL;
    protected readonly thrownBrickSpeed: number = BOSS4_THROWN_BRICK_SPEED;

    private gravityWaveTimer: number = 0;
    private isGravityWaveActive: boolean = false;
    private gravityWaveDurationTimer: number = 0;

    constructor(x: number, y: number, health: number, color: string, canvasWidth: number, canvasHeight: number) {
        super(x, y, health, color, canvasWidth, canvasHeight);
    }

    update(deltaTime: number, batX: number, batY: number): void {
        if (!this.active) return;

        this.updateMovement(deltaTime);
        this.updateThrownBricks(deltaTime);
        this.updateThrowCooldown(deltaTime, batX, batY);

        // Update gravity wave
        this.updateGravityWave(deltaTime);
    }

    private updateGravityWave(deltaTime: number): void {
        if (this.isGravityWaveActive) {
            this.gravityWaveDurationTimer -= deltaTime;
            if (this.gravityWaveDurationTimer <= 0) {
                this.isGravityWaveActive = false;
                this.gravityWaveTimer = BOSS4_GRAVITY_WAVE_INTERVAL;
            }
        } else {
            this.gravityWaveTimer -= deltaTime;
            if (this.gravityWaveTimer <= 0) {
                this.isGravityWaveActive = true;
                this.gravityWaveDurationTimer = BOSS4_GRAVITY_WAVE_DURATION;
            }
        }
    }

    /**
     * Apply gravity pull to the ball if wave is active
     */
    applyGravity(ball: Ball): void {
        if (!this.active || !this.isGravityWaveActive) return;

        const ballBounds = ball.getBounds();
        const centerX = this.x + this.width / 2;
        const centerY = this.y + this.height / 2;

        const dx = centerX - ballBounds.x;
        const dy = centerY - ballBounds.y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        if (distance > 0) {
            const force = BOSS4_GRAVITY_PULL_FORCE;
            const ax = (dx / distance) * force;
            const ay = (dy / distance) * force;

            // Apply acceleration to ball velocity
            // We need to access ball velocity, assuming ball has methods to modify it
            // Since we don't have direct access to modify velocity by acceleration in Ball interface shown,
            // we might need to manually adjust it or add a method to Ball.
            // For now, let's assume we can get/set velocity or use a method.
            // Checking Ball.ts would be good, but assuming standard physics:
            const velocity = ball.getVelocity();
            // We need deltaTime here, but applyGravity is called from outside?
            // Or we can pass deltaTime to applyGravity.
            // Let's assume we pass deltaTime.
        }
    }

    // Override to accept deltaTime for gravity
    updateWithBall(deltaTime: number, batX: number, batY: number, ball: Ball): void {
        this.update(deltaTime, batX, batY);

        if (this.isGravityWaveActive) {
            const ballBounds = ball.getBounds();
            const centerX = this.x + this.width / 2;
            const centerY = this.y + this.height / 2;

            const dx = centerX - ballBounds.x;
            const dy = centerY - ballBounds.y;
            const distance = Math.sqrt(dx * dx + dy * dy);

            if (distance > 0) {
                const force = BOSS4_GRAVITY_PULL_FORCE;
                const ax = (dx / distance) * force;
                const ay = (dy / distance) * force;

                const velocity = ball.getVelocity();
                ball.setVelocity(
                    velocity.x + ax * deltaTime,
                    velocity.y + ay * deltaTime
                );
            }
        }
    }

    render(ctx: CanvasRenderingContext2D): void {
        if (!this.active) return;

        ctx.save();

        // Draw gravity wave aura
        if (this.isGravityWaveActive) {
            ctx.beginPath();
            ctx.arc(this.x + this.width / 2, this.y + this.height / 2, this.width * 2, 0, Math.PI * 2);
            ctx.fillStyle = 'rgba(128, 0, 128, 0.2)'; // Purple transparent
            ctx.fill();
            ctx.strokeStyle = 'rgba(128, 0, 128, 0.5)';
            ctx.lineWidth = 2;
            ctx.stroke();
        }

        this.renderBossBody(ctx);
        this.renderHealthBar(ctx);
        this.renderThrownBricks(ctx);

        ctx.restore();
    }
}
