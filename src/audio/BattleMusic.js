// Procedural Chiptune Battle Soundtrack Generator (144 BPM Arcade Fighter)

export class BattleMusic {
  constructor(synth) {
    this.synth = synth;
    this.isPlaying = false;
    this.currentMode = 'menu'; // 'menu' | 'battle'
    this.step = 0;
    this.bar = 0;
    this.timerId = null;

    this.menuBpm = 114;
    this.battleBpm = 144;
    this.currentBpm = this.menuBpm;

    // Frequencies (Hz) in D Minor (Authentic Fighting Game Energy)
    this.freqs = {
      D1: 36.71, F1: 43.65, G1: 49.00, A1: 55.00, C2: 65.41,
      D2: 73.42, F2: 87.31, G2: 98.00, A2: 110.00, C3: 130.81,
      D3: 146.83, E3: 164.81, F3: 174.61, G3: 196.00, A3: 220.00, Bb3: 233.08, C4: 261.63,
      D4: 293.66, E4: 329.63, F4: 349.23, G4: 392.00, A4: 440.00, Bb4: 466.16, C5: 523.25,
      D5: 587.33, F5: 698.46, A5: 880.00
    };

    // Progression: Dm -> Bb -> C -> Am (Classic Fighting Anthem)
    this.chords = [
      { bass: 'D2', notes: ['D3', 'F3', 'A3', 'D4'] },
      { bass: 'Bb2', notes: ['Bb3', 'D4', 'F4', 'Bb4'] },
      { bass: 'C2', notes: ['C3', 'E3', 'G3', 'C4'] },
      { bass: 'A1', notes: ['A2', 'C3', 'E3', 'A3'] }
    ];

    this.leadPattern = [];
    this.generateLeadRiff();
  }

  generateLeadRiff() {
    const scale = ['D4', 'F4', 'G4', 'A4', 'C5', 'D5'];
    this.leadPattern = [];
    for (let i = 0; i < 16; i++) {
      if (i % 2 !== 0 && Math.random() < 0.5) {
        this.leadPattern.push(null);
      } else {
        this.leadPattern.push(scale[Math.floor(Math.random() * scale.length)]);
      }
    }
  }

  start(mode = 'menu') {
    this.currentMode = mode;
    this.currentBpm = mode === 'menu' ? this.menuBpm : this.battleBpm;
    if (this.isPlaying) return;

    this.isPlaying = true;
    this.step = 0;
    this.bar = 0;
    this.scheduleTick();
  }

  stop() {
    this.isPlaying = false;
    if (this.timerId) {
      clearTimeout(this.timerId);
      this.timerId = null;
    }
  }

  setMode(mode) {
    this.currentMode = mode;
    this.currentBpm = mode === 'menu' ? this.menuBpm : this.battleBpm;
    if (!this.isPlaying) {
      this.start(mode);
    }
  }

  scheduleTick() {
    if (!this.isPlaying) return;

    const stepMs = (60000 / this.currentBpm) / 4;
    this.tick();

    this.step = (this.step + 1) % 16;
    if (this.step === 0) {
      this.bar = (this.bar + 1) % this.chords.length;
      if (this.bar === 0) {
        this.generateLeadRiff();
      }
    }

    this.timerId = setTimeout(() => this.scheduleTick(), stepMs);
  }

  tick() {
    if (!this.synth.initialized || this.synth.isMuted) return;

    const chord = this.chords[this.bar];

    // Track 1: Fast Driving Bass (Triangle wave)
    if (this.step % 2 === 0) {
      const bassFreq = this.freqs[chord.bass] || 73.42;
      this.synth.playTone({
        freq: bassFreq,
        type: 'triangle',
        duration: 0.08,
        attack: 0.003,
        decay: 0.04,
        volume: 0.45,
        bus: 'music'
      });
    }

    // Track 2: 16th Arpeggiator (Square wave)
    const noteIdx = this.step % chord.notes.length;
    const arpFreq = this.freqs[chord.notes[noteIdx]];
    if (arpFreq) {
      this.synth.playTone({
        freq: arpFreq,
        type: 'square',
        duration: 0.04,
        attack: 0.002,
        decay: 0.03,
        volume: this.currentMode === 'menu' ? 0.14 : 0.22,
        bus: 'music'
      });
    }

    // Track 3: Lead Melody (Sawtooth riff)
    if (this.currentMode === 'battle' || this.bar % 2 === 0) {
      const leadNote = this.leadPattern[this.step];
      if (leadNote && this.freqs[leadNote]) {
        this.synth.playTone({
          freq: this.freqs[leadNote],
          type: 'sawtooth',
          duration: 0.12,
          attack: 0.006,
          decay: 0.05,
          volume: 0.28,
          bus: 'music'
        });
      }
    }

    // Track 4: 8-Bit Fighting Drums
    // Kick on steps 0, 8 (and 6 in battle)
    if (this.step === 0 || this.step === 8 || (this.currentMode === 'battle' && this.step === 6)) {
      this.synth.playTone({
        freq: 150,
        type: 'sine',
        duration: 0.08,
        pitchDrop: 110,
        volume: 0.55,
        bus: 'music'
      });
    }

    // Snare on steps 4, 12
    if (this.step === 4 || this.step === 12) {
      this.synth.playNoise({
        duration: 0.08,
        volume: 0.4,
        filterFreq: 2200,
        filterType: 'bandpass',
        bus: 'music'
      });
    }

    // Hi-hat on every step
    this.synth.playNoise({
      duration: 0.02,
      volume: 0.12,
      filterFreq: 6500,
      filterType: 'highpass',
      bus: 'music'
    });
  }
}
