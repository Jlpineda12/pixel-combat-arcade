// 2D Pixel Fighter Entity with Frame Data, States & Rendering

export const STATES = {
  IDLE: 'IDLE',
  WALK: 'WALK',
  JUMP: 'JUMP',
  CROUCH: 'CROUCH',
  PUNCH: 'PUNCH',
  KICK: 'KICK',
  SPECIAL: 'SPECIAL',
  BLOCK: 'BLOCK',
  HIT: 'HIT',
  KO: 'KO'
};

export class Fighter {
  constructor({ id, name, x, y, facing, colors, isCPU = false }) {
    this.id = id; // 'p1' or 'p2'
    this.name = name;
    this.startX = x;
    this.startY = y;
    this.x = x;
    this.y = y;
    this.vx = 0;
    this.vy = 0;
    this.facing = facing; // 1 = right, -1 = left
    this.isCPU = isCPU;

    // Dimensions
    this.width = 38;
    this.height = 70;
    this.groundY = y;

    // Combat Stats
    this.maxHp = 100;
    this.hp = 100;
    this.state = STATES.IDLE;
    this.stateTimer = 0;
    this.hasHit = false; // Prevents multi-hitting on a single attack
    this.specialCooldown = 0;

    // Movement speeds
    this.walkSpeed = 3.6;
    this.jumpForce = -13.5;
    this.gravity = 0.75;

    // Colors
    this.colors = colors; // { gi, belt, headband, hair, skin, trim }

    // Animation frame ticks
    this.animTick = 0;
  }

  reset(x, facing) {
    this.x = x;
    this.y = this.groundY;
    this.vx = 0;
    this.vy = 0;
    this.facing = facing;
    this.hp = this.maxHp;
    this.state = STATES.IDLE;
    this.stateTimer = 0;
    this.hasHit = false;
    this.specialCooldown = 0;
  }

  update(deltaMs, stageWidth, opponent) {
    this.animTick += 0.15;
    if (this.specialCooldown > 0) this.specialCooldown -= deltaMs;

    // Auto-face opponent unless attacking or knocked out
    if (this.state !== STATES.PUNCH && this.state !== STATES.KICK && 
        this.state !== STATES.SPECIAL && this.state !== STATES.KO) {
      if (opponent) {
        this.facing = this.x < opponent.x ? 1 : -1;
      }
    }

    // State Timer Countdown
    if (this.stateTimer > 0) {
      this.stateTimer -= deltaMs;
      if (this.stateTimer <= 0) {
        this.onStateEnd();
      }
    }

    // Physics (Gravity & Movement)
    this.x += this.vx;
    this.y += this.vy;

    if (this.y < this.groundY) {
      this.vy += this.gravity;
    } else {
      this.y = this.groundY;
      this.vy = 0;
      if (this.state === STATES.JUMP) {
        this.state = STATES.IDLE;
        this.vx = 0;
      }
    }

    // Stage Boundaries
    const halfW = this.width / 2;
    if (this.x - halfW < 20) this.x = 20 + halfW;
    if (this.x + halfW > stageWidth - 20) this.x = stageWidth - 20 - halfW;
  }

  onStateEnd() {
    if (this.state === STATES.PUNCH || this.state === STATES.KICK || 
        this.state === STATES.SPECIAL || this.state === STATES.HIT) {
      this.state = this.y < this.groundY ? STATES.JUMP : STATES.IDLE;
      this.hasHit = false;
      this.vx = 0;
    }
  }

  // --- Actions ---
  move(dir) {
    if (this.state !== STATES.IDLE && this.state !== STATES.WALK) return;
    this.vx = dir * this.walkSpeed;
    this.state = STATES.WALK;
  }

  stopMoving() {
    if (this.state === STATES.WALK) {
      this.vx = 0;
      this.state = STATES.IDLE;
    }
  }

  jump() {
    if (this.y === this.groundY && this.state !== STATES.HIT && this.state !== STATES.KO) {
      this.vy = this.jumpForce;
      this.state = STATES.JUMP;
      return true;
    }
    return false;
  }

  crouch() {
    if (this.y === this.groundY && this.state !== STATES.PUNCH && this.state !== STATES.KICK) {
      this.state = STATES.CROUCH;
      this.vx = 0;
    }
  }

  standUp() {
    if (this.state === STATES.CROUCH || this.state === STATES.BLOCK) {
      this.state = STATES.IDLE;
    }
  }

  block() {
    if (this.y === this.groundY && this.state !== STATES.PUNCH && this.state !== STATES.KICK) {
      this.state = STATES.BLOCK;
      this.vx = 0;
    }
  }

  punch() {
    if (this.state === STATES.HIT || this.state === STATES.KO) return false;
    if (this.state === STATES.PUNCH || this.state === STATES.KICK || this.state === STATES.SPECIAL) return false;

    this.state = STATES.PUNCH;
    this.stateTimer = 220; // 220ms active punch
    this.hasHit = false;
    return true;
  }

  kick() {
    if (this.state === STATES.HIT || this.state === STATES.KO) return false;
    if (this.state === STATES.PUNCH || this.state === STATES.KICK || this.state === STATES.SPECIAL) return false;

    this.state = STATES.KICK;
    this.stateTimer = 280; // 280ms active kick
    this.hasHit = false;
    return true;
  }

  special() {
    if (this.state === STATES.HIT || this.state === STATES.KO || this.specialCooldown > 0) return false;
    if (this.state === STATES.PUNCH || this.state === STATES.KICK || this.state === STATES.SPECIAL) return false;

    this.state = STATES.SPECIAL;
    this.stateTimer = 340;
    this.specialCooldown = 1400; // 1.4s cooldown
    this.hasHit = false;
    this.vx = 0;
    return true;
  }

  takeDamage(amount, knockbackDir = 0, isBlocked = false) {
    if (this.state === STATES.KO) return 0;

    const actualDamage = isBlocked ? Math.max(2, Math.floor(amount * 0.2)) : amount;
    this.hp = Math.max(0, this.hp - actualDamage);

    if (this.hp <= 0) {
      this.state = STATES.KO;
      this.vx = knockbackDir * 3.5;
      this.vy = -6;
    } else if (!isBlocked) {
      this.state = STATES.HIT;
      this.stateTimer = 250;
      this.vx = knockbackDir * 3;
    } else {
      // Block pushback
      this.vx = knockbackDir * 1.5;
      setTimeout(() => { this.vx = 0; }, 100);
    }

    return actualDamage;
  }

  // --- Collision Boxes ---
  getHurtbox() {
    const isCrouched = this.state === STATES.CROUCH;
    const h = isCrouched ? this.height * 0.65 : this.height;
    return {
      x: this.x - this.width / 2,
      y: this.y - h,
      width: this.width,
      height: h
    };
  }

  getAttackHitbox() {
    if (this.hasHit) return null;

    if (this.state === STATES.PUNCH) {
      return {
        damage: 12,
        x: this.facing === 1 ? this.x + 12 : this.x - 38,
        y: this.y - 52,
        width: 26,
        height: 18
      };
    } else if (this.state === STATES.KICK) {
      return {
        damage: 18,
        x: this.facing === 1 ? this.x + 14 : this.x - 46,
        y: this.y - 38,
        width: 32,
        height: 22
      };
    }
    return null;
  }

  // --- 2D Pixel Martial Artist Rendering ---
  draw(ctx) {
    ctx.save();
    ctx.translate(this.x, this.y);
    ctx.scale(this.facing, 1);

    const isCrouched = this.state === STATES.CROUCH;
    const isHit = this.state === STATES.HIT;
    const isKO = this.state === STATES.KO;
    const isPunch = this.state === STATES.PUNCH;
    const isKick = this.state === STATES.KICK;
    const isBlock = this.state === STATES.BLOCK;

    // Bobbing offset when idle
    const bob = (this.state === STATES.IDLE && !isCrouched) ? Math.sin(this.animTick) * 1.5 : 0;

    // Shadow on ground
    ctx.fillStyle = 'rgba(0, 0, 0, 0.4)';
    ctx.beginPath();
    ctx.ellipse(0, 0, this.width * 0.6, 5, 0, 0, Math.PI * 2);
    ctx.fill();

    if (isKO) {
      // Fallen KO Pose on the floor
      ctx.fillStyle = this.colors.gi;
      ctx.fillRect(-35, -16, 60, 16);
      ctx.fillStyle = this.colors.skin;
      ctx.fillRect(25, -20, 14, 14);
      ctx.fillStyle = this.colors.hair;
      ctx.fillRect(23, -24, 18, 6);
      ctx.restore();
      return;
    }

    const baseY = isCrouched ? 14 : 0;

    // 1. Legs / Pants
    ctx.fillStyle = this.colors.gi;
    if (isKick) {
      // Extended kick leg
      ctx.fillRect(-10, -26 + baseY, 12, 26);
      ctx.fillRect(0, -32 + baseY, 32, 12);
      ctx.fillStyle = this.colors.skin;
      ctx.fillRect(28, -32 + baseY, 8, 12); // Foot
    } else if (isCrouched) {
      ctx.fillRect(-16, -18 + baseY, 14, 18);
      ctx.fillRect(2, -18 + baseY, 14, 18);
    } else {
      // Normal stance legs
      ctx.fillRect(-14, -28 + bob, 10, 28);
      ctx.fillRect(4, -28 + bob, 10, 28);
    }

    // 2. Torso & Gi
    ctx.fillStyle = isHit ? '#ffffff' : this.colors.gi;
    ctx.fillRect(-14, -56 + baseY + bob, 28, 30);

    // V-neck opening showing chest
    ctx.fillStyle = this.colors.skin;
    ctx.fillRect(-4, -56 + baseY + bob, 8, 14);

    // Black / Red Belt
    ctx.fillStyle = this.colors.belt;
    ctx.fillRect(-15, -30 + baseY + bob, 30, 6);
    // Hanging belt ends
    ctx.fillRect(6, -24 + baseY + bob, 4, 12);

    // 3. Arms & Hands
    ctx.fillStyle = this.colors.skin;
    if (isPunch) {
      // Extended punch arm
      ctx.fillStyle = this.colors.gi;
      ctx.fillRect(2, -50 + baseY + bob, 16, 10);
      ctx.fillStyle = this.colors.skin;
      ctx.fillRect(18, -52 + baseY + bob, 14, 12); // Fist
    } else if (isBlock) {
      // Crossed guard arms
      ctx.fillStyle = this.colors.skin;
      ctx.fillRect(2, -54 + baseY + bob, 12, 20);
      ctx.fillRect(-2, -58 + baseY + bob, 12, 18);
    } else {
      // Guard stance fists
      ctx.fillRect(6, -46 + baseY + bob, 10, 10);
      ctx.fillRect(-8, -48 + baseY + bob, 10, 10);
    }

    // 4. Head
    ctx.fillStyle = isHit ? '#ffffff' : this.colors.skin;
    ctx.fillRect(-10, -74 + baseY + bob, 20, 18);

    // Headband
    ctx.fillStyle = this.colors.headband;
    ctx.fillRect(-11, -72 + baseY + bob, 22, 5);
    // Hanging headband knot tail behind head
    ctx.fillRect(-16, -70 + baseY + bob, 6, 12);

    // Hair
    ctx.fillStyle = this.colors.hair;
    ctx.fillRect(-10, -80 + baseY + bob, 20, 8);

    // Eyes
    ctx.fillStyle = '#111827';
    ctx.fillRect(3, -66 + baseY + bob, 3, 3);

    ctx.restore();
  }
}
