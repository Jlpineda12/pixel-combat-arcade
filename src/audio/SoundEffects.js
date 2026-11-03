// Retro Arcade Procedural Combat Sound Effects (SFX)

export class SoundEffects {
  constructor(synth) {
    this.synth = synth;
  }

  coinInsert() {
    this.synth.playTone({
      freq: 987.77,
      type: 'square',
      duration: 0.08,
      volume: 0.6,
      bus: 'sfx'
    });
    setTimeout(() => {
      this.synth.playTone({
        freq: 1318.51,
        type: 'square',
        duration: 0.25,
        volume: 0.7,
        bus: 'sfx'
      });
    }, 75);
  }

  menuMove() {
    this.synth.playTone({
      freq: 493.88,
      type: 'square',
      duration: 0.04,
      volume: 0.35,
      bus: 'sfx'
    });
  }

  menuConfirm() {
    this.synth.playTone({
      freq: 587.33,
      type: 'square',
      duration: 0.06,
      volume: 0.5,
      bus: 'sfx'
    });
    setTimeout(() => {
      this.synth.playTone({
        freq: 880.00,
        type: 'square',
        duration: 0.12,
        volume: 0.6,
        bus: 'sfx'
      });
    }, 60);
  }

  // Light Attack Whiff (Punch)
  punchWhiff() {
    this.synth.playNoise({
      duration: 0.06,
      volume: 0.3,
      playbackRate: 1.4,
      filterFreq: 3200,
      filterType: 'bandpass'
    });
  }

  // Heavy Attack Whiff (Kick)
  kickWhiff() {
    this.synth.playNoise({
      duration: 0.09,
      volume: 0.45,
      playbackRate: 0.9,
      filterFreq: 1800,
      filterType: 'lowpass'
    });
  }

  // Punch Impact (Solid 8-bit smack)
  punchHit() {
    this.synth.playNoise({
      duration: 0.08,
      volume: 0.6,
      playbackRate: 1.2,
      filterFreq: 1200,
      filterType: 'lowpass'
    });
    this.synth.playTone({
      freq: 180,
      type: 'triangle',
      duration: 0.08,
      pitchDrop: 120,
      volume: 0.6
    });
  }

  // Heavy Kick Impact (Deeper crunch + screen punch)
  kickHit() {
    this.synth.playNoise({
      duration: 0.12,
      volume: 0.75,
      playbackRate: 0.8,
      filterFreq: 800,
      filterType: 'lowpass'
    });
    this.synth.playTone({
      freq: 240,
      type: 'sawtooth',
      duration: 0.14,
      pitchDrop: 190,
      volume: 0.75
    });
  }

  // Blocked strike (Metallic shield ping)
  blockClash() {
    this.synth.playTone({
      freq: 880,
      type: 'square',
      duration: 0.05,
      volume: 0.45
    });
    setTimeout(() => {
      this.synth.playTone({
        freq: 1200,
        type: 'square',
        duration: 0.06,
        volume: 0.4
      });
    }, 30);
  }

  // Hadouken / Energy Projectile launch
  fireballLaunch() {
    this.synth.playTone({
      freq: 220,
      type: 'sawtooth',
      duration: 0.22,
      pitchRise: 440,
      volume: 0.6
    });
  }

  // Fireball collision explosion
  fireballHit() {
    this.synth.playNoise({
      duration: 0.2,
      volume: 0.7,
      playbackRate: 0.7,
      filterFreq: 1400,
      filterType: 'bandpass'
    });
    this.synth.playTone({
      freq: 300,
      type: 'triangle',
      duration: 0.18,
      pitchDrop: 240,
      volume: 0.65
    });
  }

  // Jump leap sound
  jump() {
    this.synth.playTone({
      freq: 150,
      type: 'triangle',
      duration: 0.1,
      pitchRise: 180,
      volume: 0.35
    });
  }

  // "FIGHT!" announcer chime
  fightGong() {
    const notes = [329.63, 440.00, 659.25, 880.00];
    notes.forEach((freq, idx) => {
      setTimeout(() => {
        this.synth.playTone({
          freq,
          type: 'square',
          duration: 0.18,
          volume: 0.65
        });
      }, idx * 60);
    });
  }

  // "K.O.!" Dramatic Finish Explosion
  koExplosion() {
    this.synth.playNoise({
      duration: 0.6,
      volume: 0.85,
      playbackRate: 0.6,
      filterFreq: 1100,
      filterType: 'lowpass'
    });
    this.synth.playTone({
      freq: 360,
      type: 'sawtooth',
      duration: 0.8,
      pitchDrop: 320,
      volume: 0.8
    });
  }
}
