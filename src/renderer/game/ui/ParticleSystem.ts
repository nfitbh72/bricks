/**
 * Particle system for visual effects
 */

import {
  PARTICLE_MIN_SIZE,
  PARTICLE_MAX_SIZE,
  PARTICLE_DEFAULT_SPEED,
  PARTICLE_SPEED_VARIATION_MIN,
  PARTICLE_SPEED_VARIATION_MAX,
  PARTICLE_GRAVITY,
  PARTICLE_FADE_RATE,
  PARTICLE_GLOW_BLUR,
} from '../../config/constants';

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
  color: string;
  size: number;
}

export class ParticleSystem {
  private particles: Particle[] = [];

  /**
   * Create particles at a position
   */
  createParticles(
    x: number,
    y: number,
    count: number,
    color: string,
    speed: number = PARTICLE_DEFAULT_SPEED
  ): void {
    for (let i = 0; i < count; i++) {
      // Random angle
      const angle = Math.random() * Math.PI * 2;
      // Random speed variation
      const particleSpeed = speed * (PARTICLE_SPEED_VARIATION_MIN + Math.random() * PARTICLE_SPEED_VARIATION_MAX);
      
      this.particles.push({
        x,
        y,
        vx: Math.cos(angle) * particleSpeed,
        vy: Math.sin(angle) * particleSpeed,
        life: 1.0,
        maxLife: 1.0,
        color,
        size: PARTICLE_MIN_SIZE + Math.random() * (PARTICLE_MAX_SIZE - PARTICLE_MIN_SIZE),
      });
    }
  }

  /**
   * Update all particles
   */
  update(deltaTime: number): void {
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const particle = this.particles[i];
      
      // Update position
      particle.x += particle.vx * deltaTime;
      particle.y += particle.vy * deltaTime;
      
      // Apply gravity
      particle.vy += PARTICLE_GRAVITY * deltaTime;
      
      // Fade out
      particle.life -= deltaTime * PARTICLE_FADE_RATE;
      
      // Remove dead particles
      if (particle.life <= 0) {
        this.particles.splice(i, 1);
      }
    }
  }

  /**
   * Render all particles
   */
  render(ctx: CanvasRenderingContext2D): void {
    ctx.save();
    
    for (const particle of this.particles) {
      const alpha = particle.life / particle.maxLife;
      
      // Draw particle with glow
      ctx.shadowBlur = PARTICLE_GLOW_BLUR;
      ctx.shadowColor = particle.color;
      ctx.globalAlpha = alpha;
      ctx.fillStyle = particle.color;
      
      ctx.beginPath();
      ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
      ctx.fill();
    }
    
    ctx.restore();
  }

  /**
   * Get particle count (for debugging/optimization)
   */
  getParticleCount(): number {
    return this.particles.length;
  }

  /**
   * Clear all particles
   */
  clear(): void {
    this.particles = [];
  }
}
