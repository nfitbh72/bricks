/**
 * Particle system for visual effects
 */

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
    speed: number = 100
  ): void {
    for (let i = 0; i < count; i++) {
      // Random angle
      const angle = Math.random() * Math.PI * 2;
      // Random speed variation
      const particleSpeed = speed * (0.5 + Math.random() * 0.5);
      
      this.particles.push({
        x,
        y,
        vx: Math.cos(angle) * particleSpeed,
        vy: Math.sin(angle) * particleSpeed,
        life: 1.0,
        maxLife: 1.0,
        color,
        size: 2 + Math.random() * 3, // 2-5 pixels
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
      particle.vy += 200 * deltaTime;
      
      // Fade out
      particle.life -= deltaTime * 2; // Fade over 0.5 seconds
      
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
      ctx.shadowBlur = 10;
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
