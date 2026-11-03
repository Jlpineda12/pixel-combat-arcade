// Computer Opponent AI Controller with Reaction Logic & Combos

import { STATES } from './Fighter.js';

export class FighterAI {
  constructor(fighter, opponent) {
    this.fighter = fighter;
    this.opponent = opponent;
    this.decisionTimer = 0;
    this.decisionInterval = 220; // Re-evaluates action every 220ms
  }

  update(deltaMs, onAction) {
    if (this.fighter.state === STATES.KO || this.opponent.state === STATES.KO) return;

    this.decisionTimer -= deltaMs;
    if (this.decisionTimer <= 0) {
      this.decisionTimer = this.decisionInterval + (Math.random() * 80);
      this.makeDecision(onAction);
    }
  }

  makeDecision(onAction) {
    const dist = Math.abs(this.fighter.x - this.opponent.x);
    const facingPlayer = (this.opponent.x > this.fighter.x) ? 1 : -1;

    // 1. Reactive Defense: If player is attacking in close range, 65% chance to block
    const isPlayerAttacking = this.opponent.state === STATES.PUNCH || 
                              this.opponent.state === STATES.KICK || 
                              this.opponent.state === STATES.SPECIAL;

    if (dist < 90 && isPlayerAttacking && Math.random() < 0.65) {
      this.fighter.block();
      setTimeout(() => {
        if (this.fighter.state === STATES.BLOCK) this.fighter.standUp();
      }, 350);
      return;
    }

    // 2. Far Range (> 220px): Walk towards opponent or launch fireball
    if (dist > 220) {
      if (Math.random() < 0.35 && this.fighter.specialCooldown <= 0) {
        onAction('special', this.fighter);
      } else {
        this.fighter.move(facingPlayer);
      }
      return;
    }

    // 3. Mid Range (90px - 220px): Advance, Jump attack, or Fireball
    if (dist >= 90 && dist <= 220) {
      const roll = Math.random();
      if (roll < 0.5) {
        this.fighter.move(facingPlayer);
      } else if (roll < 0.75) {
        this.fighter.jump();
        setTimeout(() => {
          if (this.fighter.state === STATES.JUMP) {
            onAction('kick', this.fighter);
          }
        }, 150);
      } else if (this.fighter.specialCooldown <= 0) {
        onAction('special', this.fighter);
      }
      return;
    }

    // 4. Close Range (< 90px): Attack with Punch or Kick combo
    if (dist < 90) {
      this.fighter.stopMoving();
      const roll = Math.random();
      if (roll < 0.5) {
        onAction('punch', this.fighter);
      } else if (roll < 0.85) {
        onAction('kick', this.fighter);
      } else {
        // Back up slightly
        this.fighter.move(-facingPlayer);
        setTimeout(() => { this.fighter.stopMoving(); }, 160);
      }
    }
  }
}
