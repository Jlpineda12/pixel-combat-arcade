// Retro Combat Arena Stage Background & Ground Physics

export class Stage {
  constructor(width = 560, height = 420) {
    this.width = width;
    this.height = height;
    this.groundY = 350;
    this.lanternSwing = 0;
  }

  update() {
    this.lanternSwing = Math.sin(Date.now() * 0.003) * 3;
  }

  draw(ctx) {
    const { width, height, groundY } = this;
    ctx.save();

    // 1. Sky Gradient (Deep plum into dark violet matching arcade monitor)
    const skyGrad = ctx.createLinearGradient(0, 0, 0, groundY);
    skyGrad.addColorStop(0, '#24132b');
    skyGrad.addColorStop(0.6, '#351d3d');
    skyGrad.addColorStop(1, '#482453');
    ctx.fillStyle = skyGrad;
    ctx.fillRect(0, 0, width, groundY);

    // 2. Distant Moon / Sun in the sky
    ctx.fillStyle = 'rgba(253, 164, 21, 0.2)';
    ctx.beginPath();
    ctx.arc(width / 2, 90, 55, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#fda415';
    ctx.beginPath();
    ctx.arc(width / 2, 90, 40, 0, Math.PI * 2);
    ctx.fill();

    // 3. Distant Dojo / Cyber City Silhouette
    ctx.fillStyle = '#1e0e24';
    // Center temple roof
    ctx.beginPath();
    ctx.moveTo(width / 2 - 120, 260);
    ctx.lineTo(width / 2, 210);
    ctx.lineTo(width / 2 + 120, 260);
    ctx.fill();

    ctx.fillRect(width / 2 - 90, 260, 180, 90);

    // Distant side buildings
    ctx.fillRect(20, 230, 80, 120);
    ctx.fillRect(width - 100, 220, 80, 130);

    // Glowing amber windows
    ctx.fillStyle = 'rgba(253, 164, 21, 0.4)';
    ctx.fillRect(35, 250, 12, 16);
    ctx.fillRect(60, 250, 12, 16);
    ctx.fillRect(width - 85, 240, 12, 16);
    ctx.fillRect(width - 60, 240, 12, 16);

    // 4. Dojo Battle Floor with Wooden Texture
    const floorGrad = ctx.createLinearGradient(0, groundY, 0, height);
    floorGrad.addColorStop(0, '#3a1f44');
    floorGrad.addColorStop(1, '#1b0c20');
    ctx.fillStyle = floorGrad;
    ctx.fillRect(0, groundY, width, height - groundY);

    // Floorboard lines
    ctx.strokeStyle = '#281330';
    ctx.lineWidth = 2;
    for (let y = groundY; y < height; y += 18) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(width, y);
      ctx.stroke();
    }

    // 5. Hanging Traditional Lanterns (left and right)
    this.drawLantern(ctx, 45, 130, this.lanternSwing);
    this.drawLantern(ctx, width - 45, 130, -this.lanternSwing);

    ctx.restore();
  }

  drawLantern(ctx, x, y, swing) {
    ctx.save();
    ctx.translate(x, 0);

    // Cord
    ctx.strokeStyle = '#1a0b1e';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(swing, y);
    ctx.stroke();

    // Lantern Body
    ctx.translate(swing, y);
    ctx.fillStyle = '#ff2a44';
    ctx.shadowColor = 'rgba(255, 42, 68, 0.6)';
    ctx.shadowBlur = 12;

    ctx.beginPath();
    ctx.ellipse(0, 14, 12, 16, 0, 0, Math.PI * 2);
    ctx.fill();

    // Top & Bottom caps
    ctx.shadowBlur = 0;
    ctx.fillStyle = '#111';
    ctx.fillRect(-8, -2, 16, 4);
    ctx.fillRect(-8, 28, 16, 4);

    ctx.restore();
  }
}
