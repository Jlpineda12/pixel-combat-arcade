// Main Combat Arcade Game State Machine & Battle Controller

import { renderThemedMenu, drawThemedBackdrop } from './MenuFX.js';
import { Fighter, STATES } from './Fighter.js';
import { Projectile } from './Projectile.js';
import { ParticleSystem } from './Particles.js';
import { Stage } from './Stage.js';
import { FighterAI } from './AI.js';

export const GAME_STATES = {
  MENU: 'MENU',
  CONTROLS: 'CONTROLS',
  ROUND_INTRO: 'ROUND_INTRO',
  FIGHTING: 'FIGHTING',
  ROUND_OVER: 'ROUND_OVER',
  MATCH_OVER: 'MATCH_OVER',
  PAUSED: 'PAUSED'
};

export class Game {
  constructor(canvas, synth, sfx, music) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.synth = synth;
    this.sfx = sfx;
    this.music = music;

    this.width = 560;
    this.height = 420;
    this.state = GAME_STATES.MENU;

    // Stage
    this.stage = new Stage(this.width, this.height);
    this.particles = new ParticleSystem();
    this.projectiles = [];

    // Fighters (P1 Cyan Cyber vs P2 Red Shadow)
    this.p1 = new Fighter({
      id: 'p1',
      name: 'CYBER-RYU',
      x: 140,
      y: this.stage.groundY,
      facing: 1,
      colors: {
        gi: '#00bbf9', // Cyan Gi
        belt: '#111827', // Black belt
        headband: '#ff334b', // Red headband
        hair: '#1e293b',
        skin: '#fed7aa',
        trim: '#00f5d4'
      }
    });

    this.p2 = new Fighter({
      id: 'p2',
      name: 'SHADOW-KEN',
      x: 420,
      y: this.stage.groundY,
      facing: -1,
      isCPU: true,
      colors: {
        gi: '#ff2a44', // Crimson Red Gi
        belt: '#111827',
        headband: '#fee440', // Golden yellow
        hair: '#f59e0b',
        skin: '#fed7aa',
        trim: '#ff7888'
      }
    });

    // AI
    this.ai = new FighterAI(this.p2, this.p1);

    // Rounds & Match Rules
    this.round = 1;
    this.maxRounds = 3;
    this.p1Wins = 0;
    this.p2Wins = 0;
    this.roundTime = 99; // 99 seconds round clock
    this.roundTimerMs = 0;
    this.stateTimer = 0;
    this.bannerText = '';

    // Hit-stop (Micro freeze on impactful hits)
    this.hitStopFrames = 0;
    this.shakeIntensity = 0;
    this.shakeDecay = 0.88;

    // Menu Selection
    this.selectedChoice = 'YES';
    this.highScore = parseInt(localStorage.getItem('pixel_combat_hiscore') || '123000', 10);
    this.score = 0;

    this.keys = {};
    this.setupInputs();
  }

  setupInputs() {
    window.addEventListener('keydown', (e) => {
      if (!this.synth.initialized) {
        this.synth.init();
        this.music.start('menu');
      }

      this.keys[e.code] = true;

      if (this.state === GAME_STATES.MENU) {
        if (e.code === 'KeyC') {
          this.sfx.menuConfirm();
          this.state = GAME_STATES.CONTROLS;
        } else {
          this.handleMenuInput(e);
        }
      } else if (this.state === GAME_STATES.CONTROLS) {
        if (e.code === 'Enter' || e.code === 'Escape' || e.code === 'Space' || e.code === 'KeyC') {
          this.sfx.menuConfirm();
          this.state = GAME_STATES.MENU;
        }
      } else if (this.state === GAME_STATES.FIGHTING) {
        this.handleCombatKeyDown(e);
      } else if (this.state === GAME_STATES.MATCH_OVER) {
        if (e.code === 'Enter' || e.code === 'Space') {
          this.sfx.coinInsert();
          this.startMatch();
        } else if (e.code === 'Escape') {
          this.state = GAME_STATES.MENU;
          this.music.setMode('menu');
        }
      } else if (e.code === 'KeyP' || e.code === 'Escape') {
        this.togglePause();
      }
    });

    window.addEventListener('keyup', (e) => {
      this.keys[e.code] = false;
      if (this.state === GAME_STATES.FIGHTING) {
        this.handleCombatKeyUp(e);
      }
    });

    // Canvas click
    this.canvas.addEventListener('click', (e) => {
      if (!this.synth.initialized) {
        this.synth.init();
        this.music.start('menu');
      }

      if (this.state === GAME_STATES.MENU) {
        this.sfx.coinInsert();
        this.startMatch();
      } else if (this.state === GAME_STATES.MATCH_OVER) {
        this.sfx.coinInsert();
        this.startMatch();
      }
    });
  }

  handleMenuInput(e) {
    if (e.code === 'ArrowLeft' || e.code === 'KeyA') {
      if (this.selectedChoice !== 'YES') {
        this.selectedChoice = 'YES';
        this.sfx.menuMove();
      }
    } else if (e.code === 'ArrowRight' || e.code === 'KeyD') {
      if (this.selectedChoice !== 'NO') {
        this.selectedChoice = 'NO';
        this.sfx.menuMove();
      }
    } else if (e.code === 'Enter' || e.code === 'Space') {
      if (this.selectedChoice === 'YES') {
        this.sfx.coinInsert();
        this.startMatch();
      } else {
        this.sfx.menuConfirm();
        setTimeout(() => { this.selectedChoice = 'YES'; }, 400);
      }
    }
  }

  handleCombatKeyDown(e) {
    // Jump
    if (e.code === 'KeyW' || e.code === 'ArrowUp') {
      if (this.p1.jump()) this.sfx.jump();
    }
    // Crouch
    else if (e.code === 'KeyS' || e.code === 'ArrowDown') {
      this.p1.crouch();
    }
    // Block / Guard
    else if (e.code === 'Space' || e.code === 'KeyB') {
      this.p1.block();
    }
    // Light Punch
    else if (e.code === 'KeyJ' || e.code === 'KeyZ' || e.code === 'KeyU') {
      if (this.p1.punch()) this.sfx.punchWhiff();
    }
    // Heavy Kick
    else if (e.code === 'KeyK' || e.code === 'KeyX' || e.code === 'KeyI') {
      if (this.p1.kick()) this.sfx.kickWhiff();
    }
    // Special Hadouken
    else if (e.code === 'KeyL' || e.code === 'KeyC' || e.code === 'KeyO') {
      if (this.p1.special()) {
        this.sfx.fireballLaunch();
        this.spawnProjectile(this.p1);
      }
    }
  }

  handleCombatKeyUp(e) {
    if (e.code === 'KeyS' || e.code === 'ArrowDown' || e.code === 'Space' || e.code === 'KeyB') {
      this.p1.standUp();
    }
  }

  startMatch() {
    this.round = 1;
    this.p1Wins = 0;
    this.p2Wins = 0;
    this.score = 0;
    this.startRound();
  }

  startRound() {
    this.p1.reset(140, 1);
    this.p2.reset(420, -1);
    this.projectiles = [];
    this.particles.clear();
    this.roundTime = 99;
    this.roundTimerMs = 0;

    this.state = GAME_STATES.ROUND_INTRO;
    this.stateTimer = 2200; // 2.2s intro announcement
    this.bannerText = `ROUND ${this.round}`;

    this.music.setMode('battle');
    setTimeout(() => {
      if (this.state === GAME_STATES.ROUND_INTRO) {
        this.bannerText = 'FIGHT!';
        this.sfx.fightGong();
      }
    }, 1100);
  }

  togglePause() {
    if (this.state === GAME_STATES.FIGHTING) {
      this.state = GAME_STATES.PAUSED;
      this.music.stop();
    } else if (this.state === GAME_STATES.PAUSED) {
      this.state = GAME_STATES.FIGHTING;
      this.music.start('battle');
    }
  }

  spawnProjectile(fighter) {
    const isP1 = fighter.id === 'p1';
    const proj = new Projectile({
      x: fighter.facing === 1 ? fighter.x + 36 : fighter.x - 36,
      y: fighter.y - 45,
      direction: fighter.facing,
      owner: fighter.id,
      color: isP1 ? '#00f5d4' : '#ff334b',
      glowColor: isP1 ? 'rgba(0, 245, 212, 0.6)' : 'rgba(255, 51, 75, 0.6)'
    });
    this.projectiles.push(proj);
  }

  triggerScreenShake(intensity = 6) {
    this.shakeIntensity = intensity;
  }

  update(timestamp) {
    if (this.hitStopFrames > 0) {
      this.hitStopFrames--;
      return; // Freeze frame for impact
    }

    const deltaMs = 16.6; // ~60fps step
    this.stage.update();
    this.particles.update();

    if (this.shakeIntensity > 0.05) {
      this.shakeIntensity *= this.shakeDecay;
    } else {
      this.shakeIntensity = 0;
    }

    if (this.state === GAME_STATES.ROUND_INTRO) {
      this.stateTimer -= deltaMs;
      if (this.stateTimer <= 0) {
        this.state = GAME_STATES.FIGHTING;
        this.bannerText = '';
      }
    } else if (this.state === GAME_STATES.FIGHTING) {
      this.updateCombat(deltaMs);
    } else if (this.state === GAME_STATES.ROUND_OVER) {
      this.p1.update(deltaMs, this.width, this.p2);
      this.p2.update(deltaMs, this.width, this.p1);
      this.stateTimer -= deltaMs;
      if (this.stateTimer <= 0) {
        if (this.p1Wins >= 2 || this.p2Wins >= 2) {
          this.state = GAME_STATES.MATCH_OVER;
        } else {
          this.round++;
          this.startRound();
        }
      }
    }
  }

  updateCombat(deltaMs) {
    // 1. Clock Countdown
    this.roundTimerMs += deltaMs;
    if (this.roundTimerMs >= 1000) {
      this.roundTime--;
      this.roundTimerMs -= 1000;
      if (this.roundTime <= 0) {
        this.onTimeOver();
        return;
      }
    }

    // 2. Player 1 Movement (Horizontal)
    if (this.p1.state !== STATES.PUNCH && this.p1.state !== STATES.KICK && 
        this.p1.state !== STATES.SPECIAL && this.p1.state !== STATES.CROUCH && 
        this.p1.state !== STATES.BLOCK && this.p1.state !== STATES.HIT) {
      if (this.keys['KeyA'] || this.keys['ArrowLeft']) {
        this.p1.move(-1);
      } else if (this.keys['KeyD'] || this.keys['ArrowRight']) {
        this.p1.move(1);
      } else {
        this.p1.stopMoving();
      }
    }

    // 3. AI Update for Player 2
    this.ai.update(deltaMs, (action, aiFighter) => {
      if (action === 'punch') {
        if (aiFighter.punch()) this.sfx.punchWhiff();
      } else if (action === 'kick') {
        if (aiFighter.kick()) this.sfx.kickWhiff();
      } else if (action === 'special') {
        if (aiFighter.special()) {
          this.sfx.fireballLaunch();
          this.spawnProjectile(aiFighter);
        }
      }
    });

    // 4. Update Fighters
    this.p1.update(deltaMs, this.width, this.p2);
    this.p2.update(deltaMs, this.width, this.p1);

    // 5. Update Projectiles
    for (let i = this.projectiles.length - 1; i >= 0; i--) {
      const proj = this.projectiles[i];
      proj.update(this.width);
      if (!proj.active) {
        this.projectiles.splice(i, 1);
        continue;
      }

      // Check collision against opponent
      const target = proj.owner === 'p1' ? this.p2 : this.p1;
      const targetHurtbox = target.getHurtbox();
      const projBox = proj.getHitbox();

      if (this.checkAABB(projBox, targetHurtbox)) {
        proj.active = false;
        const isBlocked = target.state === STATES.BLOCK;
        const damage = target.takeDamage(proj.damage, proj.direction, isBlocked);

        if (isBlocked) {
          this.sfx.blockClash();
          this.particles.spark(proj.x, proj.y, '#00f5d4', 8, 3);
        } else {
          this.sfx.fireballHit();
          this.particles.spark(proj.x, proj.y, '#fda415', 20, 6);
          this.triggerScreenShake(7);
          this.hitStopFrames = 3;
          if (proj.owner === 'p1') this.score += 200;
        }

        this.checkKO();
      }
    }

    // 6. Check Melee Attacks (Hitboxes vs Hurtboxes)
    this.checkMeleeAttack(this.p1, this.p2);
    this.checkMeleeAttack(this.p2, this.p1);
  }

  checkMeleeAttack(attacker, defender) {
    const attackBox = attacker.getAttackHitbox();
    if (!attackBox) return;

    const hurtbox = defender.getHurtbox();
    if (this.checkAABB(attackBox, hurtbox)) {
      attacker.hasHit = true; // One hit per attack animation
      const isBlocked = defender.state === STATES.BLOCK;
      const damage = defender.takeDamage(attackBox.damage, attacker.facing, isBlocked);

      const hitX = attacker.facing === 1 ? attackBox.x + attackBox.width : attackBox.x;
      const hitY = attackBox.y + attackBox.height / 2;

      if (isBlocked) {
        this.sfx.blockClash();
        this.particles.spark(hitX, hitY, '#93c5fd', 10, 4);
      } else {
        if (attackBox.damage > 15) {
          this.sfx.kickHit();
          this.triggerScreenShake(8);
          this.hitStopFrames = 3;
        } else {
          this.sfx.punchHit();
          this.triggerScreenShake(4);
          this.hitStopFrames = 2;
        }
        this.particles.spark(hitX, hitY, '#fda415', 18, 5);
        if (attacker.id === 'p1') this.score += attackBox.damage * 10;
      }

      this.checkKO();
    }
  }

  checkKO() {
    if (this.p1.hp <= 0 || this.p2.hp <= 0) {
      this.state = GAME_STATES.ROUND_OVER;
      this.stateTimer = 2800; // 2.8s post-KO drama
      this.sfx.koExplosion();
      this.triggerScreenShake(14);
      this.hitStopFrames = 6; // dramatic slow freeze

      if (this.p1.hp <= 0 && this.p2.hp <= 0) {
        this.bannerText = 'DOUBLE K.O.!';
      } else if (this.p2.hp <= 0) {
        this.p1Wins++;
        this.bannerText = this.p1Wins >= 2 ? 'VICTORY!' : 'K.O. - P1 WINS!';
        this.score += 1000;
      } else {
        this.p2Wins++;
        this.bannerText = this.p2Wins >= 2 ? 'DEFEAT...' : 'K.O. - CPU WINS!';
      }

      if (this.score > this.highScore) {
        this.highScore = this.score;
        localStorage.setItem('pixel_combat_hiscore', this.highScore.toString());
      }
    }
  }

  onTimeOver() {
    this.state = GAME_STATES.ROUND_OVER;
    this.stateTimer = 2600;

    if (this.p1.hp > this.p2.hp) {
      this.p1Wins++;
      this.bannerText = 'TIME OVER - P1 WINS!';
    } else if (this.p2.hp > this.p1.hp) {
      this.p2Wins++;
      this.bannerText = 'TIME OVER - CPU WINS!';
    } else {
      this.bannerText = 'DRAW GAME!';
    }
  }

  checkAABB(a, b) {
    return (
      a.x < b.x + b.width &&
      a.x + a.width > b.x &&
      a.y < b.y + b.height &&
      a.y + a.height > b.y
    );
  }

  render() {
    const { ctx } = this;
    ctx.save();

    // Screen Shake offset
    if (this.shakeIntensity > 0) {
      const sx = (Math.random() - 0.5) * this.shakeIntensity * 2;
      const sy = (Math.random() - 0.5) * this.shakeIntensity * 2;
      ctx.translate(sx, sy);
    }

    if (this.state === GAME_STATES.MENU) {
      this.renderMenu();
    } else if (this.state === GAME_STATES.CONTROLS) {
      this.renderControls();
    } else {
      // 1. Stage Background
      this.stage.draw(ctx);

      // 2. Projectiles
      for (const proj of this.projectiles) {
        proj.draw(ctx);
      }

      // 3. Fighters
      this.p1.draw(ctx);
      this.p2.draw(ctx);

      // 4. Hit Sparks & Particles
      this.particles.draw(ctx);

      // 5. Combat HUD (Health Bars, Clock, Round Wins)
      this.renderCombatHUD();

      // 6. Round Intro / KO Banners
      if (this.bannerText) {
        this.renderBanner();
      }

      // 7. Paused Overlay
      if (this.state === GAME_STATES.PAUSED) {
        this.renderPauseOverlay();
      }
    }
    // Glass glare is now rendered by the CRT shell (CSS)

    ctx.restore();
  }

  renderMenu() {
    // Themed animated title screen (backdrop, wave title, attract-mode scene)
    renderThemedMenu(this.ctx, {
      id: 'combat',
      width: this.canvas.width,
      height: this.canvas.height,
      highScore: this.highScore,
      choice: this.selectedChoice
    });
  }

  renderControls() {
    const { ctx, width } = this;
    drawThemedBackdrop(ctx, 'combat', this.canvas.width, this.canvas.height);
    ctx.fillStyle = 'rgba(8, 3, 14, 0.55)';
    ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    ctx.save();
    ctx.textAlign = 'center';

    const cx = width / 2;

    // Header
    ctx.font = '18px "Press Start 2P", monospace';
    ctx.fillStyle = '#fda415';
    ctx.fillText('★ HOW TO PLAY ★', cx, 55);

    // Box
    ctx.fillStyle = 'rgba(25, 12, 30, 0.75)';
    ctx.fillRect(40, 75, width - 80, 265);
    ctx.strokeStyle = '#fda415';
    ctx.lineWidth = 2;
    ctx.strokeRect(40, 75, width - 80, 265);

    ctx.font = '9.5px "Press Start 2P", monospace';
    const lines = [
      { k: 'ARROWS / [A, D]', d: 'MOVE LEFT / RIGHT' },
      { k: '[W] / [UP]', d: 'JUMP' },
      { k: '[S] / [DOWN]', d: 'CROUCH / DUCK' },
      { k: '[SPACE] / [B]', d: 'BLOCK / GUARD (80% REDUCTION)' },
      { k: '[J] / [Z]', d: 'LIGHT PUNCH (12 DMG)' },
      { k: '[K] / [X]', d: 'HEAVY KICK (18 DMG)' },
      { k: '[L] / [C]', d: 'HADOUKEN ENERGY BLAST' },
      { k: '[P] / [ESC]', d: 'PAUSE GAME' }
    ];

    let y = 110;
    lines.forEach(item => {
      ctx.textAlign = 'left';
      ctx.fillStyle = '#fda415';
      ctx.fillText(item.k, 60, y);

      ctx.textAlign = 'right';
      ctx.fillStyle = '#fff5ea';
      ctx.fillText(item.d, width - 60, y);
      y += 28;
    });

    // Return prompt
    ctx.textAlign = 'center';
    ctx.font = '10px "Press Start 2P", monospace';
    ctx.fillStyle = '#fff5ea';
    ctx.fillText('PRESS [ENTER] OR [ESC] TO RETURN', cx, 375);

    ctx.restore();
  }

  renderCombatHUD() {
    const { ctx } = this;
    ctx.save();

    // 1. Health Bar P1 (Left: Cyan -> Red when low)
    const barW = 190;
    const barH = 16;
    const barY = 28;

    // Background bar
    ctx.fillStyle = '#1e1024';
    ctx.fillRect(35, barY, barW, barH);
    ctx.strokeStyle = '#fda415';
    ctx.lineWidth = 2;
    ctx.strokeRect(35, barY, barW, barH);

    // Fill bar
    const p1Fill = Math.max(0, (this.p1.hp / this.p1.maxHp) * (barW - 4));
    ctx.fillStyle = this.p1.hp > 25 ? '#00f5d4' : '#ff334b';
    ctx.fillRect(37 + (barW - 4 - p1Fill), barY + 2, p1Fill, barH - 4);

    // Name P1
    ctx.font = '10px "Press Start 2P", monospace';
    ctx.fillStyle = '#fff5ea';
    ctx.textAlign = 'left';
    ctx.fillText(this.p1.name, 35, barY + 30);

    // 2. Health Bar P2 (Right)
    const p2BarX = this.width - 35 - barW;
    ctx.fillStyle = '#1e1024';
    ctx.fillRect(p2BarX, barY, barW, barH);
    ctx.strokeStyle = '#fda415';
    ctx.strokeRect(p2BarX, barY, barW, barH);

    const p2Fill = Math.max(0, (this.p2.hp / this.p2.maxHp) * (barW - 4));
    ctx.fillStyle = this.p2.hp > 25 ? '#ff2a44' : '#ef4444';
    ctx.fillRect(p2BarX + 2, barY + 2, p2Fill, barH - 4);

    ctx.textAlign = 'right';
    ctx.fillText(this.p2.name, this.width - 35, barY + 30);

    // 3. Round Timer Clock in the Center
    ctx.textAlign = 'center';
    ctx.font = '20px "Press Start 2P", monospace';
    ctx.fillStyle = this.roundTime <= 10 ? '#ff334b' : '#fda415';
    ctx.fillText(this.roundTime.toString().padStart(2, '0'), this.width / 2, barY + 16);

    // 4. Round Win Markers (Golden Badges)
    // P1 wins
    for (let i = 0; i < 2; i++) {
      ctx.fillStyle = i < this.p1Wins ? '#fda415' : '#3c2547';
      ctx.fillRect(35 + i * 16, barY + 38, 10, 10);
    }
    // P2 wins
    for (let i = 0; i < 2; i++) {
      ctx.fillStyle = i < this.p2Wins ? '#fda415' : '#3c2547';
      ctx.fillRect(this.width - 35 - 10 - i * 16, barY + 38, 10, 10);
    }

    ctx.restore();
  }

  renderBanner() {
    const { ctx } = this;
    ctx.save();
    ctx.textAlign = 'center';
    ctx.font = '28px "Press Start 2P", monospace';

    // Drop shadow
    ctx.fillStyle = '#7d3309';
    ctx.fillText(this.bannerText, this.width / 2, this.height / 2 + 3);

    ctx.fillStyle = '#fda415';
    ctx.fillText(this.bannerText, this.width / 2, this.height / 2);

    ctx.restore();
  }

  renderPauseOverlay() {
    const { ctx } = this;
    ctx.save();
    ctx.fillStyle = 'rgba(35, 18, 45, 0.8)';
    ctx.fillRect(0, 0, this.width, this.height);

    ctx.textAlign = 'center';
    ctx.font = '22px "Press Start 2P", monospace';
    ctx.fillStyle = '#fda415';
    ctx.fillText('PAUSED', this.width / 2, this.height / 2);

    ctx.font = '10px "Press Start 2P", monospace';
    ctx.fillStyle = '#fff5ea';
    ctx.fillText('PRESS [P] OR [ESC] TO RESUME', this.width / 2, this.height / 2 + 36);
    ctx.restore();
  }

  drawPixelHearts(startX, startY, count) {
    const { ctx } = this;
    const heartSpacing = 26;
    for (let i = 0; i < 5; i++) {
      const hx = startX + (i * heartSpacing);
      const px = 2.6;
      const rows = [
        [0,1,1,0,1,1,0],
        [1,1,1,1,1,1,1],
        [1,1,1,1,1,1,1],
        [0,1,1,1,1,1,0],
        [0,0,1,1,1,0,0],
        [0,0,0,1,0,0,0]
      ];
      ctx.save();
      for (let r = 0; r < rows.length; r++) {
        for (let c = 0; c < rows[r].length; c++) {
          if (rows[r][c] === 1) {
            ctx.fillStyle = r < 3 ? '#fda415' : '#fc7814';
            ctx.fillRect(hx + (c * px), startY + (r * px), px, px);
          }
        }
      }
      ctx.restore();
    }
  }

  drawGlassReflections() {
    const { ctx } = this;
    ctx.save();
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.08)';
    ctx.lineWidth = 16;
    ctx.beginPath();
    ctx.moveTo(35, 140);
    ctx.quadraticCurveTo(38, 60, 120, 36);
    ctx.stroke();

    ctx.strokeStyle = 'rgba(255, 255, 255, 0.05)';
    ctx.lineWidth = 12;
    ctx.beginPath();
    ctx.moveTo(this.width - 35, 150);
    ctx.quadraticCurveTo(this.width - 38, 70, this.width - 110, 42);
    ctx.stroke();
    ctx.restore();
  }
}
