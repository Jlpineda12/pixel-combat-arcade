// Application Entry Point for PIXEL COMBAT
import { SynthEngine } from './audio/SynthEngine.js';
import { SoundEffects } from './audio/SoundEffects.js';
import { BattleMusic } from './audio/BattleMusic.js';
import { Game } from './game/Game.js';
import { RetroShell } from './shell/RetroShell.js';

window.addEventListener('DOMContentLoaded', () => {
  const canvas = document.getElementById('game-canvas');
  const synth = new SynthEngine();
  const sfx = new SoundEffects(synth);
  const music = new BattleMusic(synth);
  const game = new Game(canvas, synth, sfx, music);

  // Audio can only start after a user gesture (browser autoplay policy)
  const startAudio = () => {
    if (!synth.initialized) {
      synth.init();
      music.start('menu');
    } else {
      synth.resume();
    }
  };

  // Presentation layer: synthwave room, neon marquee, CRT, boot sequence,
  // touch gamepad on phones and the terminal status bar.
  new RetroShell({
    id: 'combat',
    title: 'PIXEL COMBAT',
    year: '1984',
    accent: '#ff334b',
    accent2: '#fda415',
    joystickColor: '#ff2a44',
    repo: 'https://github.com/Jlpineda12/pixel-combat-arcade',
    buttons: { A: { code: 'KeyJ', alt: ['KeyZ'], label: 'PUNCH' }, B: { code: 'KeyK', alt: ['KeyX'], label: 'KICK' } },
    ticker: ["CYBER-RYU VS SHADOW-KEN", "HADOUKEN = [L]", "BLOQUEA CON [SPACE]", "BANDA SONORA A 144 BPM", "ROUND 1 · FIGHT!"],
    onFirstInput: startAudio
  }).init();

  window.addEventListener('click', startAudio, { once: true });
  window.addEventListener('keydown', startAudio, { once: true });

  // Main 60 FPS loop
  function loop(timestamp) {
    game.update(timestamp);
    game.render();
    requestAnimationFrame(loop);
  }
  requestAnimationFrame(loop);
});
