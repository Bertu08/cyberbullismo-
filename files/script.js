/* ═══════════════════════════════════════════════════════
   CYBERSNAKE – script.js
   Tema: cyberbullismo e sicurezza online
   Struttura: Snake · Food · Game
═══════════════════════════════════════════════════════ */

'use strict';

// ─────────────────────────────────────────
// COSTANTI CONFIGURABILI
// ─────────────────────────────────────────
const CFG = {
  CELL:           20,      // dimensione di ogni cella in px
  CANVAS_CELLS:   25,      // numero di celle per lato (500 × 500)
  FPS:            12,      // velocità serpente iniziale
  SCORE_GOOD:     10,      // punti per messaggio positivo
  SCORE_BAD:      -5,      // punti per messaggio tossico
  FOOD_COUNT:     4,       // messaggi contemporanei sul canvas
  POPUP_MS:       2000,    // durata popup educativo (ms)
  LIVES:          3,       // vite iniziali
  COMBO_NEEDED:   3,       // verdi di fila per attivare combo x2
  POWERUP_CHANCE: 0.08,    // probabilità power-up ogni spawn (8%)

  // Colori
  C_BG:         '#080c14',
  C_GRID:       '#0e1821',
  C_SNAKE_HEAD: '#00e5ff',
  C_SNAKE_BODY: '#007a8c',
  C_GOOD:       '#00ff88',
  C_BAD:        '#ff2255',
  C_LABEL_GOOD: '#00ffaa',
  C_LABEL_BAD:  '#ff4477',
  C_POWERUP:    '#ffdd00',
  C_TEXT:       '#c8d8e8',
};

const CANVAS_PX = CFG.CELL * CFG.CANVAS_CELLS; // 500 px

// ─────────────────────────────────────────
// CONTENUTI EDUCATIVI
// ─────────────────────────────────────────
const MESSAGES_GOOD = [
  'Alì bravo in matematica',
  'Alì simpatico',
  'Alì generoso',
  'Alì sportivo',
  'Alì sempre gentile',
];
const MESSAGES_BAD = [
  'Alì interrogato', 'Ali seì un monellino',
  'Alì sei il figlio del peccato', 'Alì monolocale',
  'Alì sei una quercia', 'Alì gay',
];

const MESSAGES_GOOD_FACCHETTI = [
  '6 in italiano', '6 in storia',
];
const MESSAGES_BAD_FACCHETTI = [
  'Facchetti espulso', 'Facchetti bocciato', 'Facchetti gay',
];

const MESSAGES_GOOD_FABIAN = [
  'ste crazy time?', 'DEBITI',
];
const MESSAGES_BAD_FABIAN = [
  'stefanella interrogato', 'Fabian battaglia di bouvines?', 'fabian gay',
];

const EDU_TIPS = [
  '⚠️ Il cyberbullismo può ferire davvero.',
  '🛡️ Segnala i messaggi offensivi.',
  '💬 Le parole online hanno peso reale.',
  '👥 Chiedi aiuto a un adulto di fiducia.',
  '🚫 Non rispondere alle provocazioni online.',
  '❤️ Il rispetto vale anche in rete.',
];

const GAMEOVER_MESSAGES = [
  '🛡️ Segnala sempre il cyberbullismo.<br>Non sei mai solo.',
  '💪 Non arrenderti! Ogni commento negativo può essere contrastato con gentilezza.',
  '🚨 I tuoi amici contano su di te. Se vedi cyberbullismo, parla con un adulto.',
  '🌟 Il tuo valore non dipende dai like. Costruisci comunità positive online.',
  '📱 Pensa prima di scrivere. Ogni parola online ha peso.',
];
const GAMEOVER_MESSAGES_FACCHETTI = [
  '📚 Facchetti, la prossima volta studia anche storia!',
  '🖊️ Un 6 in italiano è già un traguardo, dai!',
  '🛡️ Segnala sempre il cyberbullismo. Non sei mai solo.',
  '💪 Non mollare, Facchetti. La rivincita è servita!',
];
const GAMEOVER_MESSAGES_FABIAN = [
  '🎰 Crazy time non paga sempre, Fabian!',
  '📖 La battaglia di Bouvines? Studia e lo scopri!',
  '🛡️ Segnala il cyberbullismo. Non sei mai solo.',
  '💸 I debiti si saldano, ma il gioco continua!',
];

// ─────────────────────────────────────────
// CLASSE SNAKE
// ─────────────────────────────────────────
class Snake {
  constructor() { this.reset(); }

  reset() {
    const mid = Math.floor(CFG.CANVAS_CELLS / 2);
    this.body = [
      { x: mid,     y: mid },
      { x: mid - 1, y: mid },
      { x: mid - 2, y: mid },
    ];
    this.dir  = { x: 1, y: 0 };
    this.next = { x: 1, y: 0 };
    this.grew = false;
    this.dead = false;
  }

  setDir(x, y) {
    if (x === -this.dir.x && y === -this.dir.y) return;
    this.next = { x, y };
  }

  move() {
    this.dir = { ...this.next };
    const head    = this.body[0];
    const newHead = { x: head.x + this.dir.x, y: head.y + this.dir.y };

    if (
      newHead.x < 0 || newHead.x >= CFG.CANVAS_CELLS ||
      newHead.y < 0 || newHead.y >= CFG.CANVAS_CELLS
    ) { this.dead = true; return; }

    for (const seg of this.body) {
      if (seg.x === newHead.x && seg.y === newHead.y) { this.dead = true; return; }
    }

    this.body.unshift(newHead);
    if (this.grew) { this.grew = false; } else { this.body.pop(); }
  }

  grow()   { this.grew = true; }
  shrink() { if (this.body.length > 1) this.body.pop(); }

  get head()   { return this.body[0]; }
  get length() { return this.body.length; }

  draw(ctx, shieldActive) {
    this.body.forEach((seg, i) => {
      const x = seg.x * CFG.CELL;
      const y = seg.y * CFG.CELL;
      const s = CFG.CELL;
      const r = i === 0 ? 5 : 3;
      const headColor = shieldActive ? CFG.C_POWERUP : CFG.C_SNAKE_HEAD;
      ctx.fillStyle = i === 0 ? headColor : CFG.C_SNAKE_BODY;
      if (i === 0) {
        ctx.shadowColor = headColor;
        ctx.shadowBlur  = shieldActive ? 20 : 12;
      } else {
        ctx.shadowBlur = 0;
      }
      roundRect(ctx, x + 1, y + 1, s - 2, s - 2, r);
    });
    ctx.shadowBlur = 0;
  }
}

// ─────────────────────────────────────────
// CLASSE FOOD
// ─────────────────────────────────────────
class Food {
  constructor(type, text, x, y) {
    this.type = type; // 'good' | 'bad' | 'powerup'
    this.text = text;
    this.x    = x;
    this.y    = y;
    this.tick = 0;
  }

  draw(ctx) {
    this.tick++;
    const px = this.x * CFG.CELL;
    const py = this.y * CFG.CELL;

    let base, label;
    if (this.type === 'powerup')      { base = CFG.C_POWERUP;    label = '#fff'; }
    else if (this.type === 'good')    { base = CFG.C_GOOD;        label = CFG.C_LABEL_GOOD; }
    else                               { base = CFG.C_BAD;         label = CFG.C_LABEL_BAD; }

    ctx.font = `bold 9px 'Courier New', monospace`;
    const tw = ctx.measureText(this.text).width;
    const pw = Math.max(tw + 14, CFG.CELL);
    const ph = 16;
    const cx = px + CFG.CELL / 2 - pw / 2;
    const cy = py + CFG.CELL / 2 - ph / 2;
    const alpha = 0.65 + 0.35 * Math.sin(this.tick * 0.15);

    ctx.save();
    ctx.globalAlpha = alpha;
    ctx.shadowColor = base;
    ctx.shadowBlur  = this.type === 'powerup' ? 18 : 10;
    ctx.fillStyle   = base + '33';
    roundRect(ctx, cx, cy, pw, ph, 4);
    ctx.strokeStyle = base;
    ctx.lineWidth   = this.type === 'powerup' ? 2 : 1.2;
    ctx.strokeRect(cx + 0.6, cy + 0.6, pw - 1.2, ph - 1.2);
    ctx.restore();

    ctx.save();
    ctx.globalAlpha  = 0.9 + 0.1 * Math.sin(this.tick * 0.15);
    ctx.font         = `bold 9px 'Courier New', monospace`;
    ctx.fillStyle    = label;
    ctx.textAlign    = 'center';
    ctx.textBaseline = 'middle';
    ctx.shadowColor  = label;
    ctx.shadowBlur   = 6;
    ctx.fillText(this.text, px + CFG.CELL / 2, py + CFG.CELL / 2);
    ctx.restore();
  }
}

// ─────────────────────────────────────────
// CLASSE GAME
// ─────────────────────────────────────────
class Game {
  constructor() {
    this.canvas = document.getElementById('game-canvas');
    this.ctx    = this.canvas.getContext('2d');
    this.canvas.width  = CANVAS_PX;
    this.canvas.height = CANVAS_PX;

    this.snake = new Snake();
    this.foods = [];

    // Stato partita
    this.score       = 0;
    this.record      = parseInt(localStorage.getItem('cybersnake_record') || '0');
    this.running     = false;
    this.paused      = false;
    this.lastTime    = 0;
    this.interval    = 1000 / CFG.FPS;
    this.character   = null;
    this.currentFPS  = CFG.FPS;

    // Vite
    this.lives = CFG.LIVES;

    // Streak combo
    this.streak      = 0;
    this.comboActive = false;

    // Scudo
    this.shieldActive = false;
    this.shieldTimer  = null;

    // Flash morte
    this.flashAlpha = 0;

    // Statistiche partita
    this.stats = { goodEaten: 0, badEaten: 0, powerupEaten: 0, maxStreak: 0, maxFPS: CFG.FPS };

    // Audio: singleton AudioContext
    this.audioCtx = null;
    this._initAudio = () => {
      if (!this.audioCtx) {
        this.audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      }
      if (this.audioCtx.state === 'suspended') this.audioCtx.resume();
    };
    document.addEventListener('keydown',     () => this._initAudio(), { once: true });
    document.addEventListener('pointerdown', () => this._initAudio(), { once: true });

    this.gameOverSound = new Audio('javascript.mp3');

    // Riferimenti UI
    this.elScore     = document.getElementById('val-score');
    this.elRecord    = document.getElementById('val-record');
    this.elCharacter = document.getElementById('val-character');
    this.elLives     = document.getElementById('val-lives');
    this.elSpeed     = document.getElementById('val-speed');
    this.elCombo     = document.getElementById('combo-indicator');
    this.popup       = document.getElementById('edu-popup');
    this.popupTimer  = null;
    this.dialog      = document.getElementById('dialog-gameover');
    this.elGoMsg     = document.getElementById('gameover-msg');
    this.elGoRecord  = document.getElementById('gameover-record');
    this.elStatsBody = document.getElementById('stats-body');

    this.screens = {
      name:     document.getElementById('screen-name'),
      start:    document.getElementById('screen-start'),
      game:     document.getElementById('screen-game'),
      gameover: document.getElementById('screen-gameover'),
      stats:    document.getElementById('screen-stats'),
    };

    // Bind eventi
    document.getElementById('btn-ali').addEventListener('click',        () => this.selectCharacter('Alì'));
    document.getElementById('btn-facchetti').addEventListener('click',  () => this.selectCharacter('Facchetti'));
    document.getElementById('btn-fabian').addEventListener('click',     () => this.selectCharacter('Fabian'));
    document.getElementById('btn-start').addEventListener('click',      () => this.startGame());
    document.getElementById('btn-yes').addEventListener('click',        () => this.startGame());
    document.getElementById('btn-no').addEventListener('click',         () => this.showStats());
    document.getElementById('btn-stats-back').addEventListener('click', () => this.goToCharacterSelect());
    document.addEventListener('keydown', e => this.handleKey(e));

    this.updateHUD();
  }

  // ──────────────────────────────
  // SELEZIONE PERSONAGGIO
  // ──────────────────────────────
  selectCharacter(name) {
    this.character = name;
    if (this.elCharacter) this.elCharacter.textContent = name;
    this.showScreen('start');
  }

  // ──────────────────────────────
  // TORNA ALLA SELEZIONE
  // ──────────────────────────────
  goToCharacterSelect() {
    this.hideDialog();
    this.showScreen('name');
  }

  // ──────────────────────────────
  // DIALOGO
  // ──────────────────────────────
  showDialog() { this.dialog.classList.remove('hidden'); }
  hideDialog() { this.dialog.classList.add('hidden'); }

  // ──────────────────────────────
  // SCHERMATA STATISTICHE
  // ──────────────────────────────
  showStats() {
    this.hideDialog();
    if (this.elStatsBody) {
      this.elStatsBody.innerHTML = `
        <tr><td>👤 Personaggio</td><td>${this.character || '—'}</td></tr>
        <tr><td>🏆 Punteggio finale</td><td>${this.score}</td></tr>
        <tr><td>📈 Record assoluto</td><td>${this.record}</td></tr>
        <tr><td>✅ Messaggi positivi mangiati</td><td>${this.stats.goodEaten}</td></tr>
        <tr><td>❌ Messaggi tossici mangiati</td><td>${this.stats.badEaten}</td></tr>
        <tr><td>🛡️ Power-up raccolti</td><td>${this.stats.powerupEaten}</td></tr>
        <tr><td>🔥 Streak massima</td><td>${this.stats.maxStreak} verde di fila</td></tr>
        <tr><td>⚡ Velocità massima raggiunta</td><td>${this.stats.maxFPS} FPS</td></tr>
      `;
    }
    this.showScreen('stats');
  }

  // ──────────────────────────────
  // GESTIONE SCHERMATE
  // ──────────────────────────────
  showScreen(name) {
    Object.values(this.screens).forEach(s => { if (s) s.classList.remove('active'); });
    if (this.screens[name]) this.screens[name].classList.add('active');
  }

  // ──────────────────────────────
  // AVVIO PARTITA
  // ──────────────────────────────
  startGame() {
    if (this.running) return;
    this.hideDialog();

    this.snake.reset();
    this.foods        = [];
    this.score        = 0;
    this.lives        = CFG.LIVES;
    this.streak       = 0;
    this.comboActive  = false;
    this.shieldActive = false;
    this.flashAlpha   = 0;
    this.currentFPS   = CFG.FPS;
    this.interval     = 1000 / this.currentFPS;
    this.paused       = false;
    this.running      = true;
    this.stats        = { goodEaten: 0, badEaten: 0, powerupEaten: 0, maxStreak: 0, maxFPS: CFG.FPS };

    if (this.shieldTimer) { clearTimeout(this.shieldTimer); this.shieldTimer = null; }

    this.spawnFoods();
    this.updateHUD();
    this.showScreen('game');
    this.lastTime = 0;
    requestAnimationFrame(t => this.loop(t));
  }

  // ──────────────────────────────
  // GAME LOOP
  // ──────────────────────────────
  loop(timestamp) {
    if (!this.running) return;

    if (!this.paused) {
      const delta = timestamp - this.lastTime;
      if (delta >= this.interval) {
        this.lastTime = timestamp - (delta % this.interval);
        this.update();
      }
    }

    this.draw();
    requestAnimationFrame(t => this.loop(t));
  }

  // ──────────────────────────────
  // UPDATE (logica)
  // ──────────────────────────────
  update() {
    this.snake.move();

    if (this.snake.dead) {
      this.onSnakeDead();
      return;
    }

    const head = this.snake.head;
    for (let i = this.foods.length - 1; i >= 0; i--) {
      const f = this.foods[i];
      if (f.x !== head.x || f.y !== head.y) continue;

      this.foods.splice(i, 1);

      if (f.type === 'powerup') {
        // ── POWER-UP: scudo ──
        this.stats.powerupEaten++;
        this.shieldActive = true;
        if (this.shieldTimer) clearTimeout(this.shieldTimer);
        this.shieldTimer = setTimeout(() => {
          this.shieldActive = false;
          this.updateHUD();
        }, 5000);
        this.playBeep(880, 0.12, 'sine');
        this.showFloatingText('🛡️ SCUDO!', CFG.C_POWERUP);

      } else if (f.type === 'good') {
        // ── MESSAGGIO POSITIVO ──
        this.stats.goodEaten++;
        this.streak++;
        if (this.streak > this.stats.maxStreak) this.stats.maxStreak = this.streak;

        const comboMult = this.streak >= CFG.COMBO_NEEDED ? 2 : 1;
        const pts = CFG.SCORE_GOOD * comboMult;
        this.score += pts;

        if (comboMult === 2) {
          this.comboActive = true;
          this.showFloatingText(`🔥 COMBO x2! +${pts}`, CFG.C_GOOD);
        }

        this.snake.grow();
        this.playBeep(660, 0.08, 'sine');

        // Aumenta velocità ogni 20 punti (max 30 FPS)
        const newFPS = Math.min(30, CFG.FPS + Math.floor(this.score / 20));
        if (newFPS !== this.currentFPS) {
          this.currentFPS = newFPS;
          this.interval   = 1000 / this.currentFPS;
        }
        if (this.currentFPS > this.stats.maxFPS) this.stats.maxFPS = this.currentFPS;

      } else {
        // ── MESSAGGIO TOSSICO ──
        this.stats.badEaten++;
        this.streak      = 0;
        this.comboActive = false;

        if (this.shieldActive) {
          // Scudo assorbe il colpo
          this.shieldActive = false;
          if (this.shieldTimer) { clearTimeout(this.shieldTimer); this.shieldTimer = null; }
          this.playBeep(300, 0.1, 'square');
          this.showFloatingText('🛡️ SCUDO USATO!', CFG.C_POWERUP);
        } else {
          this.score = Math.max(0, this.score + CFG.SCORE_BAD);
          this.lives--;
          this.snake.shrink();
          this.flashAlpha = 0.5;
          this.playBeep(150, 0.15, 'sawtooth');
          this.showEduPopup();
          if (this.lives <= 0) {
            this.updateHUD();
            this.spawnOneFood();
            this.gameOver();
            return;
          }
        }
      }

      this.updateHUD();
      this.spawnOneFood();
      break;
    }
  }

  // ──────────────────────────────
  // MORTE SERPENTE (muro / se stesso)
  // ──────────────────────────────
  onSnakeDead() {
    this.lives--;
    this.flashAlpha = 0.6;
    this.playBeep(150, 0.2, 'sawtooth');

    if (this.lives <= 0) {
      this.gameOver();
    } else {
      this.snake.reset();
      this.updateHUD();
    }
  }

  // ──────────────────────────────
  // DRAW
  // ──────────────────────────────
  draw() {
    const ctx = this.ctx;
    const W   = CANVAS_PX;
    const C   = CFG.CELL;

    ctx.fillStyle = CFG.C_BG;
    ctx.fillRect(0, 0, W, W);

    // Griglia
    ctx.strokeStyle = CFG.C_GRID;
    ctx.lineWidth   = 0.5;
    for (let i = 0; i <= CFG.CANVAS_CELLS; i++) {
      ctx.beginPath(); ctx.moveTo(i * C, 0); ctx.lineTo(i * C, W); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(0, i * C); ctx.lineTo(W, i * C); ctx.stroke();
    }

    this.foods.forEach(f => f.draw(ctx));
    this.snake.draw(ctx, this.shieldActive);

    // Flash rosso alla perdita di una vita
    if (this.flashAlpha > 0) {
      ctx.save();
      ctx.globalAlpha = this.flashAlpha;
      ctx.fillStyle   = '#ff0033';
      ctx.fillRect(0, 0, W, W);
      ctx.restore();
      this.flashAlpha = Math.max(0, this.flashAlpha - 0.05);
    }

    // Overlay pausa
    if (this.paused) {
      ctx.save();
      ctx.globalAlpha = 0.55;
      ctx.fillStyle   = '#000';
      ctx.fillRect(0, 0, W, W);
      ctx.restore();
      ctx.save();
      ctx.fillStyle    = '#00e5ff';
      ctx.font         = 'bold 36px Courier New';
      ctx.textAlign    = 'center';
      ctx.textBaseline = 'middle';
      ctx.shadowColor  = '#00e5ff';
      ctx.shadowBlur   = 20;
      ctx.fillText('⏸ PAUSA', W / 2, W / 2);
      ctx.font       = '16px Courier New';
      ctx.fillStyle  = '#c8d8e8';
      ctx.shadowBlur = 0;
      ctx.fillText('Premi P o Spazio per riprendere', W / 2, W / 2 + 44);
      ctx.restore();
    }
  }

  // ──────────────────────────────
  // GAME OVER
  // ──────────────────────────────
  gameOver() {
    this.running = false;

    const newRecord = this.score > this.record;
    if (newRecord) {
      this.record = this.score;
      localStorage.setItem('cybersnake_record', this.record);
    }

    let pool;
    if (this.character === 'Facchetti')   pool = GAMEOVER_MESSAGES_FACCHETTI;
    else if (this.character === 'Fabian') pool = GAMEOVER_MESSAGES_FABIAN;
    else                                   pool = GAMEOVER_MESSAGES;
    const msg = pool[Math.floor(Math.random() * pool.length)];

    if (this.elGoMsg)    this.elGoMsg.innerHTML    = (newRecord ? '🏆 Nuovo record! ' : '') + msg;
    if (this.elGoRecord) this.elGoRecord.textContent = `Punteggio: ${this.score} | Record: ${this.record}`;

    this.updateHUD();
    this.gameOverSound.currentTime = 0;
    this.gameOverSound.play().catch(() => {});
    setTimeout(() => this.showDialog(), 300);
  }

  // ──────────────────────────────
  // SPAWN CIBO
  // ──────────────────────────────
  spawnFoods() {
    for (let i = 0; i < CFG.FOOD_COUNT; i++) this.spawnOneFood();
  }

  spawnOneFood() {
    let pos, attempts = 0;
    do {
      pos = {
        x: Math.floor(Math.random() * CFG.CANVAS_CELLS),
        y: Math.floor(Math.random() * CFG.CANVAS_CELLS),
      };
      attempts++;
    } while (attempts < 100 && this.isOccupied(pos.x, pos.y));

    // Power-up (8% di probabilità)
    if (Math.random() < CFG.POWERUP_CHANCE) {
      this.foods.push(new Food('powerup', '🛡️ SCUDO', pos.x, pos.y));
      return;
    }

    // Bilanciamento good/bad garantito
    const goodCount = this.foods.filter(f => f.type === 'good').length;
    const badCount  = this.foods.filter(f => f.type === 'bad').length;
    let isGood;
    if (goodCount === 0)     isGood = true;
    else if (badCount === 0) isGood = false;
    else                     isGood = Math.random() < 0.6;

    const type = isGood ? 'good' : 'bad';

    let goodPool, badPool;
    if (this.character === 'Facchetti')       { goodPool = MESSAGES_GOOD_FACCHETTI; badPool = MESSAGES_BAD_FACCHETTI; }
    else if (this.character === 'Fabian')     { goodPool = MESSAGES_GOOD_FABIAN;    badPool = MESSAGES_BAD_FABIAN;    }
    else                                       { goodPool = MESSAGES_GOOD;           badPool = MESSAGES_BAD;           }

    const pool = isGood ? goodPool : badPool;
    const text = pool[Math.floor(Math.random() * pool.length)];
    this.foods.push(new Food(type, text, pos.x, pos.y));
  }

  isOccupied(x, y) {
    for (const seg of this.snake.body) if (seg.x === x && seg.y === y) return true;
    for (const f of this.foods)         if (f.x   === x && f.y   === y) return true;
    return false;
  }

  // ──────────────────────────────
  // HUD
  // ──────────────────────────────
  updateHUD() {
    if (this.elScore)     this.elScore.textContent     = this.score;
    if (this.elRecord)    this.elRecord.textContent    = this.record;
    if (this.elCharacter) this.elCharacter.textContent = this.character || '';
    if (this.elLives)     this.elLives.textContent     = '❤️'.repeat(Math.max(0, this.lives));
    if (this.elSpeed)     this.elSpeed.textContent     = `⚡ ${this.currentFPS} FPS`;
    if (this.elCombo) {
      if (this.streak >= CFG.COMBO_NEEDED) {
        this.elCombo.textContent = `🔥 COMBO x2 (streak: ${this.streak})`;
        this.elCombo.classList.remove('hidden');
      } else if (this.streak > 0) {
        this.elCombo.textContent = `🟢 Streak: ${this.streak}/${CFG.COMBO_NEEDED}`;
        this.elCombo.classList.remove('hidden');
      } else {
        this.elCombo.classList.add('hidden');
      }
    }
  }

  // ──────────────────────────────
  // TESTO FLOTTANTE (feedback visivo)
  // ──────────────────────────────
  showFloatingText(text, color) {
    const el = document.createElement('div');
    el.textContent = text;
    el.style.cssText = `
      position:absolute; left:50%; top:40%;
      transform:translateX(-50%);
      color:${color};
      font:bold 18px 'Courier New',monospace;
      text-shadow:0 0 10px ${color};
      pointer-events:none;
      z-index:99;
      animation:floatUp 1s ease-out forwards;
    `;
    const gameScreen = document.getElementById('screen-game');
    if (gameScreen) {
      gameScreen.appendChild(el);
      setTimeout(() => el.remove(), 1000);
    }
  }

  // ──────────────────────────────
  // POPUP EDUCATIVO
  // ──────────────────────────────
  showEduPopup() {
    const tip = EDU_TIPS[Math.floor(Math.random() * EDU_TIPS.length)];
    this.popup.textContent = tip;
    this.popup.classList.remove('hidden');
    clearTimeout(this.popupTimer);
    this.popupTimer = setTimeout(() => this.popup.classList.add('hidden'), CFG.POPUP_MS);
  }

  // ──────────────────────────────
  // INPUT TASTIERA
  // ──────────────────────────────
  handleKey(e) {
    // Pausa con P o Spazio
    if ((e.key === 'p' || e.key === 'P' || e.key === ' ') && this.running) {
      e.preventDefault();
      this.paused = !this.paused;
      if (!this.paused) {
        this.lastTime = 0;
        requestAnimationFrame(t => this.loop(t));
      }
      return;
    }

    const map = {
      ArrowUp:    { x:  0, y: -1 }, ArrowDown:  { x: 0, y:  1 },
      ArrowLeft:  { x: -1, y:  0 }, ArrowRight: { x: 1, y:  0 },
      w: { x: 0, y:-1 }, W: { x: 0, y:-1 },
      s: { x: 0, y: 1 }, S: { x: 0, y: 1 },
      a: { x:-1, y: 0 }, A: { x:-1, y: 0 },
      d: { x: 1, y: 0 }, D: { x: 1, y: 0 },
    };
    const dir = map[e.key];
    if (dir) {
      e.preventDefault();
      if (this.running && !this.paused) this.snake.setDir(dir.x, dir.y);
    }
  }

  // ──────────────────────────────
  // SUONO (Web Audio API singleton)
  // ──────────────────────────────
  playBeep(freq, gain, type) {
    try {
      if (!this.audioCtx) return;
      const ctx = this.audioCtx;
      const osc = ctx.createOscillator();
      const amp = ctx.createGain();
      osc.connect(amp);
      amp.connect(ctx.destination);
      osc.type            = type;
      osc.frequency.value = freq;
      amp.gain.setValueAtTime(gain, ctx.currentTime);
      amp.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.18);
      osc.start();
      osc.stop(ctx.currentTime + 0.2);
    } catch (_) {}
  }
}

// ─────────────────────────────────────────
// HELPER: rettangolo arrotondato
// ─────────────────────────────────────────
function roundRect(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.quadraticCurveTo(x + w, y,     x + w, y + r);
  ctx.lineTo(x + w, y + h - r);
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  ctx.lineTo(x + r, y + h);
  ctx.quadraticCurveTo(x, y + h,     x, y + h - r);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y,         x + r, y);
  ctx.closePath();
  ctx.fill();
}

// ─────────────────────────────────────────
// AVVIO
// ─────────────────────────────────────────
window.addEventListener('DOMContentLoaded', () => { new Game(); });
