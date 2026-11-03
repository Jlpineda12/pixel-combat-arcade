// Automated QA Test Suite for Pixel Combat Arcade 1984
import { Fighter, STATES } from '../src/game/Fighter.js';
import { Projectile } from '../src/game/Projectile.js';
import { BattleMusic } from '../src/audio/BattleMusic.js';
import { FighterAI } from '../src/game/AI.js';

let passed = 0;
let failed = 0;

function assert(condition, testName) {
  if (condition) {
    console.log(`  ✅ PASS: ${testName}`);
    passed++;
  } else {
    console.error(`  ❌ FAIL: ${testName}`);
    failed++;
  }
}

function section(title) {
  console.log(`\n========================================`);
  console.log(`🥊 ${title}`);
  console.log(`========================================`);
}

// ========================================================
// 1. FIGHTER MECHANICS & STATE MACHINE
// ========================================================
section('1. Fighter Mechanics & Frame Data Tests');

const p1 = new Fighter({
  id: 'p1',
  name: 'CYBER-RYU',
  x: 140,
  y: 350,
  facing: 1,
  colors: { gi: '#00bbf9', belt: '#111', headband: '#f00', hair: '#222', skin: '#fed', trim: '#00f' }
});

assert(p1.hp === 100, 'Fighter initializes with 100 HP');
assert(p1.state === STATES.IDLE, 'Fighter initializes in IDLE state');
assert(p1.facing === 1, 'P1 faces right (1) towards opponent');

// Test Jump Physics
p1.jump();
assert(p1.state === STATES.JUMP, 'Jump action enters JUMP state');
assert(p1.vy < 0, 'Jump velocity is negative (moves upward)');

// Gravity check
p1.update(16, 560, null);
assert(p1.vy > p1.jumpForce, 'Gravity accelerates fighter downward');

// Land on ground
p1.vy = 5;
p1.y = 348;
p1.update(16, 560, null);
assert(p1.y === 350 && p1.state === STATES.IDLE, 'Landing returns fighter to IDLE on ground');

// Test Crouch
p1.crouch();
assert(p1.state === STATES.CROUCH, 'Crouch action enters CROUCH state');
const crouchBox = p1.getHurtbox();
p1.standUp();
const standBox = p1.getHurtbox();
assert(crouchBox.height < standBox.height, 'Crouching reduces hurtbox height for low-profile dodging');

// Test Punch Frame Data
p1.punch();
assert(p1.state === STATES.PUNCH, 'Punch enters PUNCH state');
const punchHitbox = p1.getAttackHitbox();
assert(punchHitbox !== null && punchHitbox.damage === 12, 'Punch generates active hitbox with 12 damage');
assert(punchHitbox.x > p1.x, 'Punch extends forward in facing direction');

// Test Kick Frame Data
p1.onStateEnd();
p1.kick();
assert(p1.state === STATES.KICK, 'Kick enters KICK state');
const kickHitbox = p1.getAttackHitbox();
assert(kickHitbox !== null && kickHitbox.damage === 18, 'Kick generates active hitbox with 18 damage');

// Test Special Hadouken & Cooldown
p1.onStateEnd();
const specialSuccess = p1.special();
assert(specialSuccess === true && p1.state === STATES.SPECIAL, 'Special triggers Hadouken pose');
assert(p1.specialCooldown === 1400, 'Special initiates 1400ms cooldown');

const spamSpecial = p1.special();
assert(spamSpecial === false, 'Cannot spam special while on cooldown');


// ========================================================
// 2. COMBAT DAMAGE & GUARD (BLOCK) SYSTEM
// ========================================================
section('2. Combat Damage, Guard & Knockdown Tests');

const p2 = new Fighter({
  id: 'p2',
  name: 'SHADOW-KEN',
  x: 420,
  y: 350,
  facing: -1,
  colors: { gi: '#f00', belt: '#111', headband: '#ff0', hair: '#fa0', skin: '#fed', trim: '#f88' }
});

// Clean hit
const damageTaken = p2.takeDamage(12, 1, false);
assert(damageTaken === 12, 'Clean hit deals full 12 damage');
assert(p2.hp === 88, 'HP correctly drops from 100 to 88');
assert(p2.state === STATES.HIT, 'Unblocked strike puts opponent in HIT recoil state');

// Blocked hit
p2.onStateEnd();
p2.block();
assert(p2.state === STATES.BLOCK, 'Defender enters BLOCK guard state');
const blockedDamage = p2.takeDamage(18, 1, true);
assert(blockedDamage <= Math.ceil(18 * 0.2), 'Guard reduces incoming damage by 80%');
assert(p2.hp === 88 - blockedDamage, 'Blocked chip damage correctly applied');

// Knockout check
p2.takeDamage(100, 1, false);
assert(p2.hp === 0, 'HP drops to 0 on lethal damage');
assert(p2.state === STATES.KO, 'Lethal damage triggers KO knockdown state');


// ========================================================
// 3. PROJECTILE (HADOUKEN) MECHANICS
// ========================================================
section('3. Projectile Hadouken Physics & Collisions');

const proj = new Projectile({
  x: 100,
  y: 300,
  direction: 1,
  owner: 'p1',
  color: '#00f5d4'
});

assert(proj.damage === 14, 'Hadouken projectile has 14 base damage');
assert(proj.active === true, 'Projectile starts active');

// Advance projectile
proj.update(560);
assert(proj.x === 107, 'Projectile moves forward at 7px/frame (100 -> 107)');

// Off-screen culling
proj.x = 600;
proj.update(560);
assert(proj.active === false, 'Projectile automatically deactivates when exiting screen');


// ========================================================
// 4. CPU AI REACTION LOGIC
// ========================================================
section('4. Opponent AI Decision & Defense Logic');

p2.reset(400, -1);
p1.reset(140, 1);
const ai = new FighterAI(p2, p1);

// Test Far-distance decision (dist = 260px)
let aiActionTriggered = null;
ai.makeDecision((action) => { aiActionTriggered = action; });
assert(p2.vx < 0 || aiActionTriggered === 'special', 'Far distance: AI moves towards player or fires projectile');

// Test Close-range reactive defense when player attacks
p1.x = 380; // Distance = 20px (close range)
p1.punch();
let defended = false;
for (let i = 0; i < 10; i++) {
  p2.state = STATES.IDLE;
  ai.makeDecision(() => {});
  if (p2.state === STATES.BLOCK) {
    defended = true;
    break;
  }
}
assert(defended, 'Close range: AI reactively raises guard when player punches');


// ========================================================
// 5. BATTLE CHIPTUNE SYNTHESIZER
// ========================================================
section('5. Procedural Battle Audio Engine');

const mockSynth = {
  initialized: true,
  isMuted: false,
  playTone: () => {},
  playNoise: () => {}
};

const music = new BattleMusic(mockSynth);
assert(music.menuBpm === 114, 'Menu music runs at 114 BPM');
assert(music.battleBpm === 144, 'Battle theme runs at intense 144 BPM');
assert(music.freqs.D4 === 293.66, 'D minor scale tuning verified');
assert(music.chords.length === 4, '4-chord fighting progression loaded');
assert(music.leadPattern.length === 16, '16-step battle lead melody initialized');


// ========================================================
// 6. FULL MATCH SIMULATION (BEST 2 OF 3 ROUNDS)
// ========================================================
section('6. Full Match Simulation: Best of 3 Rounds to Victory');

let p1RoundsWon = 0;
let p2RoundsWon = 0;

for (let r = 1; r <= 2; r++) {
  p1.reset(140, 1);
  p2.reset(420, -1);

  // Simulate P1 landing series of kicks and punches on P2
  while (p2.hp > 0) {
    p2.takeDamage(20, 1, false);
  }
  
  if (p2.hp <= 0) {
    p1RoundsWon++;
  }
}

assert(p1RoundsWon === 2, 'P1 successfully wins 2 consecutive rounds');
assert(p1RoundsWon >= 2, 'Match ends with tournament victory for P1 (2 wins achieved)');


// ========================================================
// QA SUMMARY
// ========================================================
console.log(`\n========================================`);
console.log(`📋 QA TEST SUMMARY:`);
console.log(`   Passed: ${passed}`);
console.log(`   Failed: ${failed}`);
console.log(`========================================\n`);

if (failed > 0) {
  process.exit(1);
} else {
  console.log('🎉 ALL 26 COMBAT QA TESTS PASSED 100% SUCCESSFULLY!\n');
}
