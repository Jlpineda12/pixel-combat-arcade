// 2D Pixel Particle System for Combat Hit Sparks & Dust

export class ParticleSystem {
  constructor() {
    this.particles = [];
  }

  // Hit Spark on impact (bright pixel bursts)
  spark(x, y, color = '#fda415', count = 14, speed = 5) {
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const vel = (Math.random() * 0.7 + 0.3) * speed;
      this.particles.push({
        x,
        y,
        vx: Math.cos(angle) * vel,
        vy: Math.sin(angle) * vel,
        size: Math.random() < 0.5 ? 3 : 5,
        color,
        alpha: 1.0,
        decay: Math.random() * 0.04 + 0.03
      });
    }
  }

  // Dust puff on jump / landing / dash
  dust(x, y, count = 6) {
    for (let i = 0; i < count; i++) {
      this.particles.push({
        x: x + (Math.random() - 0.5) * 16,
        y,
        vx: (Math.random() - 0.5) * 1.5,
        vy: -Math.random() * 1.2,
        size: 4,
        color: '#8b7a9e',
        alpha: 0.8,
        decay: 0.04
      });
    }
  }

  update() {
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      p.x += p.vx;
      p.y += p.vy;
      p.vx *= 0.94;
      p.vy *= 0.94;
      p.alpha -= p.decay;

      if (p.alpha <= 0) {
        this.particles.splice(i, 1);
      }
    }
  }

  draw(ctx) {
    for (const p of this.particles) {
      ctx.save();
      ctx.globalAlpha = Math.max(0, p.alpha);
      ctx.fillStyle = p.color;
      ctx.fillRect(Math.floor(p.x), Math.floor(p.y), p.size, p.size);
      ctx.restore();
    }
  }

  clear() {
    this.particles = [];
  }
}
