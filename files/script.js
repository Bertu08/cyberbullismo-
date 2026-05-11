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
  CELL:         20,        // dimensione di ogni cella in px
  CANVAS_CELLS: 25,        // numero di celle per lato (500 × 500)
  FPS:          8,         // velocità serpente (frame al secondo)
  SCORE_GOOD:   10,        // punti per messaggio positivo
  SCORE_BAD:   -5,         // punti per messaggio tossico
  FOOD_COUNT:   4,         // messaggi contemporanei sul canvas
  POPUP_MS:     2000,      // durata popup educativo (ms)

  // Colori
  C_BG:         '#080c14',
  C_GRID:       '#0e1821',
  C_SNAKE_HEAD: '#00e5ff',
  C_SNAKE_BODY: '#007a8c',
  C_GOOD:       '#00ff88',
  C_BAD:        '#ff2255',
  C_LABEL_GOOD: '#00ffaa',
  C_LABEL_BAD:  '#ff4477',
  C_TEXT:       '#c8d8e8',
};

const CANVAS_PX = CFG.CELL * CFG.CANVAS_CELLS; // 500 px

// ─────────────────────────────────────────
// CONTENUTI EDUCATIVI
// ─────────────────────────────────────────
const MESSAGES_GOOD = [
'non ci sono bei messaggi per Alì'
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
  'Facchetti espulso', 'Facchetti bocciato', 'facchetti gay',
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
  '💪 Non arrenderti! Ogni commento negativo online può essere contrastato con gentilezza.',
  '🚨 I tuoi amici contano su di te. Se vedi cyberbullismo, parla con un adulto di fiducia.',
  '🌟 Ricorda: il tuo valore non dipende dai like. Costruisci comunità positive online.',
  '📱 Pensa prima di scrivere. Ogni parola online ha il peso di una vera conversazione.',
];

// Messaggi game over specifici per Facchetti
const GAMEOVER_MESSAGES_FACCHETTI = [
  '📚 Facchetti, la prossima volta studia anche storia!',
  '🖊️ Un 6 in italiano è già un traguardo, dai!',
  '🛡️ Segnala sempre il cyberbullismo. Non sei mai solo.',
  '💪 Non mollare, Facchetti. La rivincita è servita!',
];

// Messaggi game over specifici per Fabian
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
  constructor() {
    this.reset();
  }

  reset() {
    const mid = Math.floor(CFG.CANVAS_CELLS / 2);
    // Partiamo con 3 segmenti, testa a destra
    this.body = [
      { x: mid,     y: mid },
      { x: mid - 1, y: mid },
      { x: mid - 2, y: mid },
    ];
    this.dir   = { x: 1, y: 0 };   // direzione corrente
    this.next  = { x: 1, y: 0 };   // prossima direzione (evita inversione istantanea)
    this.grew  = false;             // flag crescita
    this.dead  = false;
  }

  // Cambia direzione (ignora inversione a 180°)
  setDir(x, y) {
    // Non permettere inversione diretta
    if (x === -this.dir.x && y === -this.dir.y) return;
    this.next = { x, y };
  }

  // Avanza di un passo
  move() {
    this.dir = { ...this.next };

    const head = this.body[0];
    const newHead = {
      x: head.x + this.dir.x,
      y: head.y + this.dir.y,
    };

    // Collisione con muri
    if (
      newHead.x < 0 || newHead.x >= CFG.CANVAS_CELLS ||
      newHead.y < 0 || newHead.y >= CFG.CANVAS_CELLS
    ) {
      this.dead = true;
      return;
    }

    // Collisione con se stesso
    for (const seg of this.body) {
      if (seg.x === newHead.x && seg.y === newHead.y) {
        this.dead = true;
        return;
      }
    }

    this.body.unshift(newHead);

    if (this.grew) {
      this.grew = false; // non rimuovere la coda → cresce
    } else {
      this.body.pop();
    }
  }

  // Cresce di un segmento
  grow() {
    this.grew = true;
  }

  // Accorcia (rimuove ultima sezione se len > 1)
  shrink() {
    if (this.body.length > 1) {
      this.body.pop();
    }
  }

  get head() { return this.body[0]; }
  get length() { return this.body.length; }

  // Disegna il serpente sul canvas
  draw(ctx) {
    this.body.forEach((seg, i) => {
      const x = seg.x * CFG.CELL;
      const y = seg.y * CFG.CELL;
      const s = CFG.CELL;
      const r = i === 0 ? 5 : 3; // raggio bordi

      ctx.fillStyle = i === 0 ? CFG.C_SNAKE_HEAD : CFG.C_SNAKE_BODY;

      // Glow sulla testa
      if (i === 0) {
        ctx.shadowColor = CFG.C_SNAKE_HEAD;
        ctx.shadowBlur  = 12;
      } else {
        ctx.shadowBlur = 0;
      }

      // Rettangolo arrotondato
      roundRect(ctx, x + 1, y + 1, s - 2, s - 2, r);
    });
    ctx.shadowBlur = 0;
  }
}

// ─────────────────────────────────────────
// CLASSE FOOD  (un singolo messaggio)
// ─────────────────────────────────────────
class Food {
  constructor(type, text, x, y) {
    this.type = type; // 'good' | 'bad'
    this.text = text;
    this.x    = x;
    this.y    = y;
    this.tick = 0;    // usato per animazione pulsante
  }

  // Disegna il messaggio come "chip" colorato
  draw(ctx) {
    this.tick++;

    const px = this.x * CFG.CELL;
    const py = this.y * CFG.CELL;

    const isGood = this.type === 'good';
    const base   = isGood ? CFG.C_GOOD  : CFG.C_BAD;
    const label  = isGood ? CFG.C_LABEL_GOOD : CFG.C_LABEL_BAD;

    // Misuriamo la larghezza del testo per il chip
    ctx.font = `bold 9px 'Courier New', monospace`;
    const tw = ctx.measureText(this.text).width;
    const pw = Math.max(tw + 14, CFG.CELL);
    const ph = 16;

    const cx = px + CFG.CELL / 2 - pw / 2;
    const cy = py + CFG.CELL / 2 - ph / 2;

    // Pulsazione alpha
    const alpha = 0.65 + 0.35 * Math.sin(this.tick * 0.15);

    // Sfondo chip
    ctx.save();
    ctx.globalAlpha = alpha;
    ctx.shadowColor = base;
    ctx.shadowBlur  = 10;
    ctx.fillStyle   = base + '33'; // ~20% opacity
    roundRect(ctx, cx, cy, pw, ph, 4);
    // Bordo
    ctx.strokeStyle = base;
    ctx.lineWidth   = 1.2;
    ctx.strokeRect(cx + 0.6, cy + 0.6, pw - 1.2, ph - 1.2);
    ctx.restore();

    // Testo
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
    // Canvas
    this.canvas = document.getElementById('game-canvas');
    this.ctx    = this.canvas.getContext('2d');
    this.canvas.width  = CANVAS_PX;
    this.canvas.height = CANVAS_PX;

    // Entità
    this.snake  = new Snake();
    this.foods  = [];

    // Stato
    this.score    = 0;
    this.record   = parseInt(localStorage.getItem('cybersnake_record') || '0');
    this.running  = false;
    this.lastTime = 0;
    this.interval = 1000 / CFG.FPS;
    this.character = null; // nome personaggio scelto

    // UI
    this.elScore  = document.getElementById('val-score');
    this.elRecord = document.getElementById('val-record');
    this.popup    = document.getElementById('edu-popup');
    this.popupTimer = null;

    // Schermate
    this.screens = {
      name:     document.getElementById('screen-name'),
      start:    document.getElementById('screen-start'),
      game:     document.getElementById('screen-game'),
      gameover: document.getElementById('screen-gameover'),
    };

    // Bind eventi
    document.getElementById('btn-ali').addEventListener('click',       () => this.selectCharacter('Alì'));
    document.getElementById('btn-facchetti').addEventListener('click', () => this.selectCharacter('Facchetti'));
      document.getElementById('btn-fabian').addEventListener('click',   () => this.selectCharacter('Fabian'));
    document.getElementById('btn-start').addEventListener('click',   () => this.startGame());
    document.getElementById('btn-restart').addEventListener('click', () => this.startGame());
    document.addEventListener('keydown', e => this.handleKey(e));

    // Mostra record iniziale
    this.updateHUD();
  }

  // ──────────────────────────────
  // SELEZIONE PERSONAGGIO
  // ──────────────────────────────
  selectCharacter(name) {
    this.character = name;
    this.showScreen('start');
  }

  // ──────────────────────────────
  // GESTIONE SCHERMATE
  // ──────────────────────────────
  showScreen(name) {
    Object.values(this.screens).forEach(s => s.classList.remove('active'));
    this.screens[name].classList.add('active');
  }

  // ──────────────────────────────
  // AVVIO PARTITA
  // ──────────────────────────────
  startGame() {
    this.snake.reset();
    this.foods  = [];
    this.score  = 0;
    this.running = true;

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

    const delta = timestamp - this.lastTime;

    if (delta >= this.interval) {
      this.lastTime = timestamp - (delta % this.interval);
      this.update();
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
      this.gameOver();
      return;
    }

    // Controlla collisione con cibo
    const head = this.snake.head;
    for (let i = this.foods.length - 1; i >= 0; i--) {
      const f = this.foods[i];
      if (f.x === head.x && f.y === head.y) {
        this.foods.splice(i, 1);

        if (f.type === 'good') {
          // Messaggio positivo
          this.score += CFG.SCORE_GOOD;
          this.snake.grow();
          this.playBeep(660, 0.08, 'sine');
        } else {
          // Messaggio tossico
          this.score = Math.max(0, this.score + CFG.SCORE_BAD);
          this.snake.shrink();
          this.playBeep(150, 0.15, 'sawtooth');
          this.showEduPopup();
        }

        this.updateHUD();
        this.spawnOneFood();
        break;
      }
    }
  }

  // ──────────────────────────────
  // DRAW (grafica)
  // ──────────────────────────────
  draw() {
    const ctx = this.ctx;
    const W   = CANVAS_PX;
    const C   = CFG.CELL;

    // Sfondo
    ctx.fillStyle = CFG.C_BG;
    ctx.fillRect(0, 0, W, W);

    // Griglia leggera
    ctx.strokeStyle = CFG.C_GRID;
    ctx.lineWidth   = 0.5;
    for (let i = 0; i <= CFG.CANVAS_CELLS; i++) {
      ctx.beginPath();
      ctx.moveTo(i * C, 0); ctx.lineTo(i * C, W);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(0, i * C); ctx.lineTo(W, i * C);
      ctx.stroke();
    }

    // Cibo
    this.foods.forEach(f => f.draw(ctx));

    // Serpente
    this.snake.draw(ctx);
  }

  // ──────────────────────────────
  // GAME OVER
  // ──────────────────────────────
  gameOver() {
    this.running = false;

    // Aggiorna record
    if (this.score > this.record) {
      this.record = this.score;
      localStorage.setItem('cybersnake_record', this.record);
    }

    document.getElementById('final-score').textContent  = this.score;
    document.getElementById('final-record').textContent = this.record;
    document.getElementById('player-name').textContent  = this.character || 'Sconosciuto';

    // Messaggio game over casuale basato sul personaggio scelto
    let messages;
    if (this.character === 'Facchetti') {
      messages = GAMEOVER_MESSAGES_FACCHETTI;
    } else if (this.character === 'Fabian') {
      messages = GAMEOVER_MESSAGES_FABIAN;
    } else {
      messages = GAMEOVER_MESSAGES;
    }
    const randomMsg = messages[Math.floor(Math.random() * messages.length)];
    document.querySelector('#screen-gameover .edu-msg').innerHTML = randomMsg;
    

    this.playBeep(220, 0.2, 'sawtooth');

    setTimeout(() => this.showScreen('gameover'), 300);
  }

  // ──────────────────────────────
  // SPAWN CIBO
  // ──────────────────────────────
  spawnFoods() {
    for (let i = 0; i < CFG.FOOD_COUNT; i++) {
      this.spawnOneFood();
    }
  }

  spawnOneFood() {
    // Sceglie posizione libera
    let pos;
    let attempts = 0;
    do {
      pos = {
        x: Math.floor(Math.random() * CFG.CANVAS_CELLS),
        y: Math.floor(Math.random() * CFG.CANVAS_CELLS),
      };
      attempts++;
    } while (
      attempts < 100 &&
      (this.isOccupied(pos.x, pos.y))
    );

    // Tipo: ~60% positivi, ~40% tossici
    const isGood = Math.random() < 0.6;
    const type   = isGood ? 'good' : 'bad';

    // Seleziona il pool messaggi in base al personaggio
    let goodPool, badPool;
    if (this.character === 'Facchetti') {
      goodPool = MESSAGES_GOOD_FACCHETTI;
      badPool  = MESSAGES_BAD_FACCHETTI;
    } else if (this.character === 'Fabian') {
      goodPool = MESSAGES_GOOD_FABIAN;
      badPool  = MESSAGES_BAD_FABIAN;
    } else {
      goodPool = MESSAGES_GOOD;
      badPool  = MESSAGES_BAD;
    }
    const pool   = isGood ? goodPool : badPool;
    const text   = pool[Math.floor(Math.random() * pool.length)];

    this.foods.push(new Food(type, text, pos.x, pos.y));
  }

  isOccupied(x, y) {
    // Controlla serpente
    for (const seg of this.snake.body) {
      if (seg.x === x && seg.y === y) return true;
    }
    // Controlla altro cibo
    for (const f of this.foods) {
      if (f.x === x && f.y === y) return true;
    }
    return false;
  }

  // ──────────────────────────────
  // HUD
  // ──────────────────────────────
  updateHUD() {
    this.elScore.textContent  = this.score;
    this.elRecord.textContent = this.record;
    document.getElementById('val-record').textContent = this.record;
  }

  // ──────────────────────────────
  // POPUP EDUCATIVO
  // ──────────────────────────────
  showEduPopup() {
    const tip = EDU_TIPS[Math.floor(Math.random() * EDU_TIPS.length)];
    this.popup.textContent = tip;
    this.popup.classList.remove('hidden');

    clearTimeout(this.popupTimer);
    this.popupTimer = setTimeout(() => {
      this.popup.classList.add('hidden');
    }, CFG.POPUP_MS);
  }

  // ──────────────────────────────
  // INPUT TASTIERA
  // ──────────────────────────────
  handleKey(e) {
    const map = {
      ArrowUp:    { x:  0, y: -1 },
      ArrowDown:  { x:  0, y:  1 },
      ArrowLeft:  { x: -1, y:  0 },
      ArrowRight: { x:  1, y:  0 },
      w: { x:  0, y: -1 },
      s: { x:  0, y:  1 },
      a: { x: -1, y:  0 },
      d: { x:  1, y:  0 },
      W: { x:  0, y: -1 },
      S: { x:  0, y:  1 },
      A: { x: -1, y:  0 },
      D: { x:  1, y:  0 },
    };
    const dir = map[e.key];
    if (dir) {
      e.preventDefault();
      if (this.running) this.snake.setDir(dir.x, dir.y);
    }
  }

  // ──────────────────────────────
  // SUONO (Web Audio API)
  // ──────────────────────────────
  playBeep(freq, gain, type) {
    try {
      const ctx  = new (window.AudioContext || window.webkitAudioContext)();
      const osc  = ctx.createOscillator();
      const amp  = ctx.createGain();
      osc.connect(amp);
      amp.connect(ctx.destination);
      osc.type            = type;
      osc.frequency.value = freq;
      amp.gain.setValueAtTime(gain, ctx.currentTime);
      amp.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.18);
      osc.start();
      osc.stop(ctx.currentTime + 0.2);
    } catch (_) { /* audio non disponibile */ }
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
window.addEventListener('DOMContentLoaded', () => {
  new Game();
});