// Hadouken / Energy Projectile Entity

export class Projectile {
  constructor({ x, y, direction, owner, color = '#00f5d4', glowColor = 'rgba(0, 245, 212, 0.6)' }) {
    this.x = x;
    this.y = y;
    this.direction = direction; // 1 (right) or -1 (left)
    this.owner = owner; // 'p1' or 'p2'
    this.speed = 7;
    this.radius = 12;
    this.damage = 14;
    this.color = color;
    this.glowColor = glowColor;
    this.active = true;
    this.trail = [];
  }

  update(stageWidth) {
    if (!this.active) return;

    this.trail.unshift({ x: this.x, y: this.y, alpha: 1.0 });
    if (this.trail.length > 5) this.trail.pop();

    for (const t of this.trail) {
      t.alpha -= 0.15;
    }

    this.x += this.speed * this.direction;

    // Off-screen check
    if (this.x < -30 || this.x > stageWidth + 30) {
      this.active = false;
    }
  }

  draw(ctx) {
    if (!this.active) return;

    ctx.save();

    // Trail
    for (const t of this.trail) {
      ctx.globalAlpha = Math.max(0, t.alpha);
      ctx.fillStyle = this.color;
      ctx.beginPath();
      ctx.arc(t.x, t.y, this.radius * 0.7, 0, Math.PI * 2);
      ctx.fill();
    }

    // Main Energy Orb with Glow
    ctx.globalAlpha = 1.0;
    ctx.shadowColor = this.glowColor;
    ctx.shadowBlur = 16;
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = this.color;
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.radius * 0.75, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
  }

  getHitbox() {
    return {
      x: this.x - this.radius,
      y: this.y - this.radius,
      width: this.radius * 2,
      height: this.radius * 2
    };
  }
}
