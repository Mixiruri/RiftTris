/**
 * @name RiftTris
 * @author Cami (github.com/Mixiruri · Discord @soriita)
 * @description Tetris inside the League client: 5 modes, 25 achievements, 5 skins and a 90-second Rapid mode built for champ select.
 * @version 1.2.0
 */

/* =====================================================================
   CONFIG
   ===================================================================== */
const SAVE_KEY = 'rifttris.v1';
const RAPID_MS = 90_000;
const LOCK_MS = 500;
const MAX_RESETS = 15;
const AUTOSAVE_MS = 5000;
const VERSION = '1.2.0';

const COLS = 10, ROWS = 22, VIS = 20, HIDDEN = ROWS - VIS;
const CELL = 26;
const PANEL_L = 120, GAP = 12, PANEL_R = 110;
const BOARD_W = COLS * CELL;
const BX = PANEL_L + GAP;
const RX = BX + BOARD_W + GAP;
const CW = RX + PANEL_R;
const CH = VIS * CELL;

const MODES = {
  rapid:   { name: 'Rapid',   tag: '90 seconds', icon: '⚡', desc: '90-second score attack. Fits right inside champ select.' },
  sprint:  { name: 'Sprint',  tag: '40 lines',   icon: '⏱', desc: 'Clear 40 lines as fast as you can.' },
  classic: { name: 'Classic', tag: 'Marathon',   icon: '♛', desc: 'Level up every 10 lines until you top out.' },
  dig:     { name: 'Dig',     tag: '10 rows',    icon: '⛏', desc: 'Break through all the garbage at the bottom.' },
  zen:     { name: 'Zen',     tag: 'Endless',    icon: '☯', desc: 'No pressure, no game over. Perfect for queue time.' },
};
const MODE_ORDER = ['rapid', 'sprint', 'classic', 'dig', 'zen'];
const RESUMABLE = new Set(['sprint', 'classic', 'dig', 'zen']);

const ACH = [
  { id: 'first_blood', name: 'First Blood',      desc: 'Clear your first line.' },
  { id: 'tetris',      name: 'Tetris',           desc: 'Clear 4 lines at once.' },
  { id: 'pentakill',   name: 'Pentakill',        desc: '5 Tetrises in a single game.' },
  { id: 'tspin',       name: 'Juke',             desc: 'Clear lines with a T-Spin.' },
  { id: 'tsd',         name: 'Flash + Ignite',   desc: 'Land a T-Spin Double.' },
  { id: 'tst',         name: 'Outplayed',        desc: 'Land a T-Spin Triple.' },
  { id: 'pc',          name: 'Ace',              desc: 'Empty the whole board (Perfect Clear).' },
  { id: 'combo5',      name: 'Killing Spree',    desc: 'Chain a 5 combo.' },
  { id: 'combo10',     name: 'Legendary',        desc: 'Chain a 10 combo.' },
  { id: 'b2b4',        name: 'Snowball',         desc: '4 back-to-backs in a row.' },
  { id: 'sprint2',     name: 'Fast Rotation',    desc: 'Finish Sprint in under 2:00.' },
  { id: 'sprint1',     name: 'Challenger',       desc: 'Finish Sprint in under 1:00.' },
  { id: 'sprint_nh',   name: 'No Flash',         desc: 'Finish Sprint without using Hold.' },
  { id: 'rapid10',     name: 'Decent Farm',      desc: 'Score 10,000 in Rapid.' },
  { id: 'rapid30',     name: '10 CS per Minute', desc: 'Score 30,000 in Rapid.' },
  { id: 'champ',       name: 'Multitasker',      desc: 'Finish a Rapid game during champ select.' },
  { id: 'lvl10',       name: 'Mid Game',         desc: 'Reach level 10 in Classic.' },
  { id: 'lvl15',       name: 'Late Game',        desc: 'Reach level 15 in Classic.' },
  { id: 'dig',         name: 'Miner',            desc: 'Complete Dig.' },
  { id: 'dig45',       name: 'Mole',             desc: 'Complete Dig in under 45 seconds.' },
  { id: 'zen100',      name: 'Inner Peace',      desc: 'Clear 100 lines in one Zen session.' },
  { id: 'lines1k',     name: 'Veteran',          desc: 'Clear 1,000 lines in total.' },
  { id: 'games25',     name: 'Addicted',         desc: 'Play 25 games.' },
  { id: 'all_modes',   name: 'Fill Player',      desc: 'Finish a game in every mode.' },
  { id: 'skins',       name: 'Skin Collector',   desc: 'Finish a game with every skin.' },
];

/* =====================================================================
   COLOR HELPERS
   ===================================================================== */
function shade(hex, amt) {
  const n = parseInt(hex.slice(1), 16);
  let r = n >> 16, g = (n >> 8) & 255, b = n & 255;
  const t = amt < 0 ? 0 : 255, p = Math.abs(amt);
  r = Math.round((t - r) * p + r); g = Math.round((t - g) * p + g); b = Math.round((t - b) * p + b);
  return `rgb(${r},${g},${b})`;
}
function rrect(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

/* =====================================================================
   SKINS
   ===================================================================== */
const SKINS = {
  hextech: {
    name: 'Hextech', desc: 'Gold and blue, straight out of the client.',
    colors: { I: '#2fd6e6', J: '#3d6cf0', L: '#f09a3d', O: '#f0d43d', S: '#4fd66a', T: '#b05cf0', Z: '#f04f5c', G: '#5b6474' },
    board: 'rgba(1,10,19,0.92)', grid: 'rgba(200,170,110,0.07)', border: '#785a28',
    panel: 'rgba(1,10,19,0.7)', panelLine: '#463714',
    label: '#c8aa6e', text: '#f0e6d2', muted: '#a09b8c', accent: '#0ac8b9', warn: '#f04f5c', overlay: 'rgba(1,10,19,0.6)',
    fontD: '"Beaufort for LOL", "Cinzel", Georgia, serif', fontB: '"Spiegel", "Segoe UI", Arial, sans-serif',
    ghost: 'outline',
    css: {
      bg1: '#0a1428', bg2: '#010a13', card: 'rgba(30,35,40,.55)', line: '#3c3c41', line2: '#1e2328',
      gold: '#c8aa6e', goldd: '#785a28', teal: '#0ac8b9', text: '#f0e6d2', muted: '#a09b8c', dim: '#5b5a56',
      red: '#f04f5c', back: 'rgba(1,10,19,.85)', radius: '0px', btn1: '#1e2328', btn2: '#141a1f',
    },
    cell(ctx, x, y, s, c) {
      const e = Math.max(2, s * 0.15);
      ctx.fillStyle = c; ctx.fillRect(x + 1, y + 1, s - 2, s - 2);
      ctx.fillStyle = 'rgba(255,255,255,0.3)'; ctx.fillRect(x + 1, y + 1, s - 2, e);
      ctx.fillStyle = 'rgba(0,0,0,0.28)'; ctx.fillRect(x + 1, y + s - 1 - e, s - 2, e);
    },
  },

  retro: {
    name: 'Retro', desc: 'Four shades of green and scanlines. 1989 vibes.',
    colors: { I: '#306230', J: '#0f380f', L: '#306230', O: '#0f380f', S: '#8bac0f', T: '#306230', Z: '#8bac0f', G: '#306230' },
    pattern: { I: 0, J: 1, L: 2, O: 0, S: 2, T: 1, Z: 0, G: 3 },
    board: '#9bbc0f', grid: 'rgba(15,56,15,0.08)', border: '#0f380f',
    panel: '#8bac0f', panelLine: '#0f380f',
    label: '#0f380f', text: '#0f380f', muted: '#306230', accent: '#0f380f', warn: '#0f380f', overlay: 'rgba(155,188,15,0.7)',
    fontD: '"Press Start 2P", "Courier New", monospace', fontB: '"Courier New", monospace',
    ghost: 'dotted', scanlines: true, pixel: true,
    css: {
      bg1: '#9bbc0f', bg2: '#8bac0f', card: 'rgba(139,172,15,.9)', line: '#306230', line2: '#306230',
      gold: '#0f380f', goldd: '#0f380f', teal: '#0f380f', text: '#0f380f', muted: '#306230', dim: '#306230',
      red: '#0f380f', back: 'rgba(15,56,15,.8)', radius: '0px', btn1: '#8bac0f', btn2: '#8bac0f',
    },
    cell(ctx, x, y, s, c, t) {
      ctx.fillStyle = c; ctx.fillRect(x, y, s, s);
      ctx.strokeStyle = '#0f380f'; ctx.lineWidth = 2; ctx.strokeRect(x + 1, y + 1, s - 2, s - 2);
      const p = this.pattern[t] ?? 0, q = Math.round(s * 0.3);
      if (p === 1) { ctx.fillStyle = '#9bbc0f'; ctx.fillRect(x + q, y + q, s - 2 * q, s - 2 * q); }
      if (p === 2) { ctx.fillStyle = '#0f380f'; ctx.fillRect(x + q + 1, y + q + 1, s - 2 * q - 2, s - 2 * q - 2); }
      if (p === 3) { ctx.fillStyle = '#0f380f'; for (let i = 4; i < s - 3; i += 4) ctx.fillRect(x + i, y + i, 2, 2); }
      ctx.fillStyle = 'rgba(155,188,15,0.5)'; ctx.fillRect(x + 3, y + 3, 3, 3);
    },
  },

  cube: {
    name: '3D', desc: 'Extruded blocks on a tilted board.',
    colors: { I: '#22c7ff', J: '#3a5cff', L: '#ff8a2a', O: '#ffd23a', S: '#33e07a', T: '#b04bff', Z: '#ff3d5a', G: '#6b7385' },
    board: 'linear', grid: 'rgba(120,160,255,0.08)', border: '#3a5cff',
    panel: 'rgba(8,14,40,0.8)', panelLine: '#2a3a80',
    label: '#8fb0ff', text: '#eef3ff', muted: '#8e9ac0', accent: '#22c7ff', warn: '#ff3d5a', overlay: 'rgba(5,8,25,0.6)',
    fontD: '"Segoe UI", Arial, sans-serif', fontB: '"Segoe UI", Arial, sans-serif',
    ghost: 'outline', tilt: true,
    css: {
      bg1: '#111a44', bg2: '#05081a', card: 'rgba(30,45,110,.45)', line: '#2a3a80', line2: '#1a2458',
      gold: '#8fb0ff', goldd: '#3a5cff', teal: '#22c7ff', text: '#eef3ff', muted: '#8e9ac0', dim: '#56608a',
      red: '#ff3d5a', back: 'rgba(3,5,18,.85)', radius: '8px', btn1: '#1a2458', btn2: '#0e1638',
    },
    boardFill(ctx, x, y, w, h) {
      const g = ctx.createLinearGradient(0, y, 0, y + h);
      g.addColorStop(0, '#060a22'); g.addColorStop(1, '#141f55');
      ctx.fillStyle = g; ctx.fillRect(x, y, w, h);
    },
    cell(ctx, x, y, s, c) {
      const d = Math.max(2, Math.round(s * 0.16)), f = s - 1 - d;
      ctx.fillStyle = shade(c, -0.55);
      ctx.beginPath(); ctx.moveTo(x + 1, y + f); ctx.lineTo(x + f, y + f); ctx.lineTo(x + f + d, y + f + d); ctx.lineTo(x + 1 + d, y + f + d); ctx.fill();
      ctx.fillStyle = shade(c, -0.35);
      ctx.beginPath(); ctx.moveTo(x + f, y + 1); ctx.lineTo(x + f + d, y + 1 + d); ctx.lineTo(x + f + d, y + f + d); ctx.lineTo(x + f, y + f); ctx.fill();
      const g = ctx.createLinearGradient(x, y, x + f, y + f);
      g.addColorStop(0, shade(c, 0.35)); g.addColorStop(1, c);
      ctx.fillStyle = g; ctx.fillRect(x + 1, y + 1, f - 1, f - 1);
      ctx.fillStyle = 'rgba(255,255,255,0.45)'; ctx.fillRect(x + 1, y + 1, f - 1, 2);
    },
  },

  neon: {
    name: 'Neon', desc: 'Glowing outlines on pure black.',
    colors: { I: '#00f0ff', J: '#4d6bff', L: '#ff9a1f', O: '#fff01f', S: '#39ff6a', T: '#d24dff', Z: '#ff2e6d', G: '#6a6a8a' },
    board: '#04000c', grid: 'rgba(255,46,200,0.07)', border: '#ff2ec8',
    panel: 'rgba(4,0,12,0.85)', panelLine: '#5a1a70',
    label: '#ff2ec8', text: '#f4e9ff', muted: '#9a86b8', accent: '#00f0ff', warn: '#ff2e6d', overlay: 'rgba(4,0,12,0.65)',
    fontD: '"Segoe UI", Arial, sans-serif', fontB: '"Segoe UI", Arial, sans-serif',
    ghost: 'outline', glow: true,
    css: {
      bg1: '#120022', bg2: '#04000c', card: 'rgba(40,10,60,.5)', line: '#5a1a70', line2: '#2a0a3a',
      gold: '#ff2ec8', goldd: '#8a1a80', teal: '#00f0ff', text: '#f4e9ff', muted: '#9a86b8', dim: '#5e4c78',
      red: '#ff2e6d', back: 'rgba(2,0,8,.88)', radius: '6px', btn1: '#1a0630', btn2: '#0c0218',
    },
    cell(ctx, x, y, s, c) {
      ctx.save();
      ctx.shadowColor = c; ctx.shadowBlur = s * 0.5;
      ctx.globalAlpha *= 0.22; ctx.fillStyle = c; ctx.fillRect(x + 3, y + 3, s - 6, s - 6);
      ctx.globalAlpha /= 0.22;
      ctx.strokeStyle = c; ctx.lineWidth = 2; ctx.strokeRect(x + 3, y + 3, s - 6, s - 6);
      ctx.restore();
    },
  },

  pastel: {
    name: 'Pastel', desc: 'Soft candy blocks on a light board.',
    colors: { I: '#8fd8f0', J: '#9fb2f5', L: '#ffc49a', O: '#ffe28f', S: '#a8e6b0', T: '#d3b0f5', Z: '#ffa8b8', G: '#c8c3d6' },
    board: '#fff8fc', grid: 'rgba(180,150,200,0.13)', border: '#e3c5e8',
    panel: '#fff8fc', panelLine: '#ecd6f0',
    label: '#b27cc4', text: '#5b4668', muted: '#9a88a6', accent: '#e07aa6', warn: '#e0587a', overlay: 'rgba(255,248,252,0.75)',
    fontD: '"Segoe UI", Arial, sans-serif', fontB: '"Segoe UI", Arial, sans-serif',
    ghost: 'fill',
    css: {
      bg1: '#fff4fa', bg2: '#f6ecfb', card: 'rgba(255,255,255,.85)', line: '#ecd6f0', line2: '#f3e4f5',
      gold: '#b27cc4', goldd: '#e3c5e8', teal: '#e07aa6', text: '#5b4668', muted: '#9a88a6', dim: '#c0b0c8',
      red: '#e0587a', back: 'rgba(120,90,140,.45)', radius: '14px', btn1: '#ffffff', btn2: '#fbf1fd',
    },
    cell(ctx, x, y, s, c) {
      rrect(ctx, x + 2, y + 2, s - 4, s - 4, s * 0.28);
      ctx.fillStyle = c; ctx.fill();
      ctx.fillStyle = 'rgba(255,255,255,0.65)';
      rrect(ctx, x + s * 0.24, y + s * 0.2, s * 0.3, s * 0.16, s * 0.08); ctx.fill();
      ctx.strokeStyle = shade(c, -0.12); ctx.lineWidth = 1;
      rrect(ctx, x + 2.5, y + 2.5, s - 5, s - 5, s * 0.28); ctx.stroke();
    },
  },
};
const SKIN_ORDER = ['hextech', 'retro', 'cube', 'neon', 'pastel'];
const sk = () => SKINS[save.settings.skin] || SKINS.hextech;

/* =====================================================================
   PERSISTENCE — Pengu DataStore (survives client restarts) + localStorage mirror
   ===================================================================== */
const DEFAULT_SAVE = {
  settings: { das: 133, arr: 33, sdf: 25, ghost: true, champPill: true, autoPause: true, fabPos: null, skin: 'hextech' },
  best: {}, played: {}, ach: {}, skinsUsed: {}, resume: null, history: [],
  totals: { games: 0, lines: 0, tetrises: 0, tspins: 0, playMs: 0, pieces: 0 },
};
const clone = o => JSON.parse(JSON.stringify(o));

function mergeSave(raw) {
  const s = clone(DEFAULT_SAVE);
  if (raw && typeof raw === 'object') {
    for (const k of ['settings', 'best', 'played', 'ach', 'skinsUsed', 'totals']) Object.assign(s[k], raw[k] || {});
    if (raw.resume && typeof raw.resume === 'object') s.resume = raw.resume;
    if (Array.isArray(raw.history)) s.history = raw.history.slice(0, 20);
  }
  if (!SKINS[s.settings.skin]) s.settings.skin = 'hextech';
  return s;
}
function loadSave() {
  let a = null, b = null;
  try { a = window.DataStore?.get(SAVE_KEY); if (typeof a === 'string') a = JSON.parse(a); } catch {}
  try { b = JSON.parse(localStorage.getItem(SAVE_KEY)); } catch {}
  // keep whichever copy is newer
  const pick = (a?.savedAt || 0) >= (b?.savedAt || 0) ? (a || b) : b;
  return mergeSave(pick);
}
let save = loadSave();
function persist() {
  save.savedAt = Date.now();
  try { window.DataStore?.set(SAVE_KEY, clone(save)); } catch {}
  try { localStorage.setItem(SAVE_KEY, JSON.stringify(save)); } catch {}
}

/* =====================================================================
   PIECES + SRS
   ===================================================================== */
const SHAPES = {
  I: [[0,0,0,0],[1,1,1,1],[0,0,0,0],[0,0,0,0]],
  J: [[1,0,0],[1,1,1],[0,0,0]],
  L: [[0,0,1],[1,1,1],[0,0,0]],
  O: [[1,1],[1,1]],
  S: [[0,1,1],[1,1,0],[0,0,0]],
  T: [[0,1,0],[1,1,1],[0,0,0]],
  Z: [[1,1,0],[0,1,1],[0,0,0]],
};
const rotCW = m => m[0].map((_, i) => m.map(r => r[i]).reverse());
const cellsOf = m => { const c = []; m.forEach((row, y) => row.forEach((v, x) => v && c.push([x, y]))); return c; };
const ROT = {};
for (const k in SHAPES) {
  const r = [SHAPES[k]];
  for (let i = 1; i < 4; i++) r.push(rotCW(r[i - 1]));
  ROT[k] = r.map(cellsOf);
}

// SRS kicks (x, y with y pointing UP)
const KICK_JLSTZ = {
  '01': [[0,0],[-1,0],[-1,1],[0,-2],[-1,-2]], '10': [[0,0],[1,0],[1,-1],[0,2],[1,2]],
  '12': [[0,0],[1,0],[1,-1],[0,2],[1,2]],     '21': [[0,0],[-1,0],[-1,1],[0,-2],[-1,-2]],
  '23': [[0,0],[1,0],[1,1],[0,-2],[1,-2]],    '32': [[0,0],[-1,0],[-1,-1],[0,2],[-1,2]],
  '30': [[0,0],[-1,0],[-1,-1],[0,2],[-1,2]],  '03': [[0,0],[1,0],[1,1],[0,-2],[1,-2]],
};
const KICK_I = {
  '01': [[0,0],[-2,0],[1,0],[-2,-1],[1,2]],   '10': [[0,0],[2,0],[-1,0],[2,1],[-1,-2]],
  '12': [[0,0],[-1,0],[2,0],[-1,2],[2,-1]],   '21': [[0,0],[1,0],[-2,0],[1,-2],[-2,1]],
  '23': [[0,0],[2,0],[-1,0],[2,1],[-1,-2]],   '32': [[0,0],[-2,0],[1,0],[-2,-1],[1,2]],
  '30': [[0,0],[1,0],[-2,0],[1,-2],[-2,1]],   '03': [[0,0],[-1,0],[2,0],[-1,2],[2,-1]],
};
const KICK_180 = [[0,0],[0,1],[1,0],[-1,0],[0,-1]];

/* =====================================================================
   ENGINE
   ===================================================================== */
class Game {
  constructor(mode, hooks) { this.mode = mode; this.hooks = hooks; this.sdf = 25; this.reset(); }

  reset() {
    this.board = Array.from({ length: ROWS }, () => Array(COLS).fill(0));
    this.bag = []; this.queue = [];
    while (this.queue.length < 6) this.queue.push(this.drawBag());
    this.hold = null; this.canHold = true;
    this.score = 0; this.lines = 0; this.level = 1;
    this.combo = -1; this.b2b = -1;
    this.stats = { pieces: 0, tetrises: 0, tspins: 0, holds: 0, maxCombo: 0, pcs: 0 };
    this.elapsed = 0; this.countdown = 1500;
    this.over = false; this.won = false; this.paused = false;
    this.gTimer = 0; this.lockTimer = 0; this.lockResets = 0; this.lowest = 0;
    this.soft = false; this.lastRot = false; this.lastKick = 0;
    this.popups = []; this.flashes = [];
    if (this.mode === 'dig') this.addGarbage(10);
    this.spawn();
  }

  snapshot() {
    return {
      mode: this.mode, board: this.board, bag: this.bag, queue: this.queue, hold: this.hold, canHold: this.canHold,
      score: this.score, lines: this.lines, level: this.level, combo: this.combo, b2b: this.b2b,
      stats: this.stats, elapsed: this.elapsed, piece: this.piece, at: Date.now(),
    };
  }

  static restore(snap, hooks) {
    const g = new Game(snap.mode, hooks);
    for (const k of ['board', 'bag', 'queue', 'hold', 'canHold', 'score', 'lines', 'level', 'combo', 'b2b', 'stats', 'elapsed'])
      if (snap[k] !== undefined) g[k] = clone(snap[k]);
    g.countdown = 1500;
    const p = snap.piece;
    if (p && ROT[p.t] && !g.collide(p.t, p.r, p.x, p.y)) { g.piece = { ...p }; g.lowest = p.y; }
    else g.spawn();
    return g;
  }

  drawBag() {
    if (!this.bag.length) {
      this.bag = ['I', 'J', 'L', 'O', 'S', 'T', 'Z'];
      for (let i = 6; i > 0; i--) { const j = (Math.random() * (i + 1)) | 0; [this.bag[i], this.bag[j]] = [this.bag[j], this.bag[i]]; }
    }
    return this.bag.pop();
  }

  addGarbage(n) {
    let prev = -1;
    for (let i = 0; i < n; i++) {
      let hole; do { hole = (Math.random() * COLS) | 0; } while (hole === prev);
      prev = hole;
      const row = Array(COLS).fill('G'); row[hole] = 0;
      this.board.shift(); this.board.push(row);
    }
  }

  collide(t, r, x, y) {
    for (const [cx, cy] of ROT[t][r]) {
      const bx = x + cx, by = y + cy;
      if (bx < 0 || bx >= COLS || by >= ROWS) return true;
      if (by >= 0 && this.board[by][bx]) return true;
    }
    return false;
  }

  grounded() { const p = this.piece; return !!p && this.collide(p.t, p.r, p.x, p.y + 1); }

  spawn(t) {
    if (!t) { t = this.queue.shift(); while (this.queue.length < 6) this.queue.push(this.drawBag()); }
    const p = { t, r: 0, x: t === 'O' ? 4 : 3, y: 0 };
    this.piece = p;
    this.gTimer = 0; this.lockTimer = 0; this.lockResets = 0; this.lastRot = false;
    if (this.collide(p.t, p.r, p.x, p.y)) return this.topOut();
    if (!this.collide(p.t, p.r, p.x, p.y + 1)) p.y++;
    this.lowest = p.y;
  }

  topOut() {
    this.piece = null;
    if (this.mode === 'zen') {
      this.board = Array.from({ length: ROWS }, () => Array(COLS).fill(0));
      this.combo = -1; this.b2b = -1;
      this.popup('ZEN RESET', sk().accent);
      return this.spawn();
    }
    this.finish(false);
  }

  onMoved() {
    if (this.grounded() && this.lockResets < MAX_RESETS) { this.lockTimer = 0; this.lockResets++; }
  }

  move(dx) {
    const p = this.piece;
    if (!p || this.over || this.collide(p.t, p.r, p.x + dx, p.y)) return false;
    p.x += dx; this.lastRot = false; this.onMoved();
    return true;
  }

  fall() {
    const p = this.piece;
    if (!p || this.collide(p.t, p.r, p.x, p.y + 1)) return false;
    p.y++; this.lastRot = false;
    if (p.y > this.lowest) { this.lowest = p.y; this.lockResets = 0; this.lockTimer = 0; }
    return true;
  }

  rotate(dir) {
    const p = this.piece;
    if (!p || this.over || p.t === 'O') return false;
    const to = (p.r + (dir === 2 ? 2 : dir) + 4) % 4;
    const tests = dir === 2 ? KICK_180 : (p.t === 'I' ? KICK_I : KICK_JLSTZ)[`${p.r}${to}`];
    for (let i = 0; i < tests.length; i++) {
      const nx = p.x + tests[i][0], ny = p.y - tests[i][1];
      if (!this.collide(p.t, to, nx, ny)) {
        p.x = nx; p.y = ny; p.r = to;
        this.lastRot = true; this.lastKick = i;
        this.onMoved();
        return true;
      }
    }
    return false;
  }

  hardDrop() {
    if (!this.piece || this.over) return;
    let n = 0; while (this.fall()) n++;
    this.score += n * 2;
    this.lock();
  }

  holdPiece() {
    if (!this.canHold || !this.piece || this.over) return;
    const cur = this.piece.t;
    this.canHold = false; this.stats.holds++;
    if (this.hold) { const t = this.hold; this.hold = cur; this.spawn(t); }
    else { this.hold = cur; this.spawn(); }
  }

  ghostY() {
    const p = this.piece; let y = p.y;
    while (!this.collide(p.t, p.r, p.x, y + 1)) y++;
    return y;
  }

  gravity() {
    if (this.mode === 'zen') return 1000;
    const L = Math.min(this.level, 20);
    return Math.max(1000 * Math.pow(0.8 - (L - 1) * 0.007, L - 1), 16);
  }

  lock() {
    const p = this.piece;
    let tspin = false, mini = false;
    if (p.t === 'T' && this.lastRot) {
      const occ = (x, y) => x < 0 || x >= COLS || y >= ROWS || (y >= 0 && !!this.board[y][x]);
      const c = [occ(p.x, p.y), occ(p.x + 2, p.y), occ(p.x + 2, p.y + 2), occ(p.x, p.y + 2)]; // TL TR BR BL
      if (c.filter(Boolean).length >= 3) {
        tspin = true;
        const front = [c[p.r], c[(p.r + 1) % 4]];
        if (!(front[0] && front[1]) && this.lastKick !== 4) mini = true;
      }
    }

    let lockOut = true;
    for (const [cx, cy] of ROT[p.t][p.r]) {
      const y = p.y + cy;
      if (y >= HIDDEN) lockOut = false;
      if (y >= 0) this.board[y][p.x + cx] = p.t;
    }
    this.piece = null;
    this.stats.pieces++;

    const full = [];
    for (let y = 0; y < ROWS; y++) if (this.board[y].every(Boolean)) full.push(y);
    for (const y of full) { this.board.splice(y, 1); this.board.unshift(Array(COLS).fill(0)); }
    for (const y of full) if (y >= HIDDEN) this.flashes.push({ y: y - HIDDEN, t: 0 });

    const n = full.length;
    const lvl = this.level;
    let base = 0, label = '', difficult = false;
    if (tspin) {
      base = mini ? [100, 200, 400][n] ?? 400 : [400, 800, 1200, 1600][n];
      label = (mini ? 'T-SPIN MINI' : 'T-SPIN') + ['', ' SINGLE', ' DOUBLE', ' TRIPLE'][n];
      difficult = n > 0;
      if (n > 0) this.stats.tspins++;
    } else {
      base = [0, 100, 300, 500, 800][n];
      label = ['', 'SINGLE', 'DOUBLE', 'TRIPLE', 'TETRIS'][n];
      difficult = n === 4;
      if (n === 4) this.stats.tetrises++;
    }

    let pc = false;
    if (n > 0) {
      this.combo++;
      this.stats.maxCombo = Math.max(this.stats.maxCombo, this.combo);
      if (difficult) { this.b2b++; if (this.b2b > 0) base *= 1.5; } else this.b2b = -1;
      pc = this.board.every(r => r.every(v => !v));
    } else this.combo = -1;

    let pts = base * lvl;
    if (this.combo > 0) pts += 50 * this.combo * lvl;
    if (pc) { pts += [0, 800, 1200, 1800, 2000][n] * lvl; this.stats.pcs++; }
    this.score += Math.round(pts);
    this.lines += n;

    const S = sk();
    if (label && (tspin || n >= 2)) this.popup(label, tspin ? S.colors.T : n === 4 ? S.colors.I : S.text);
    if (difficult && this.b2b > 0) this.popup(`B2B x${this.b2b}`, S.label);
    if (this.combo > 0) this.popup(`COMBO ${this.combo}`, S.accent);
    if (pc) this.popup('PERFECT CLEAR', S.colors.O);

    if (this.mode === 'classic') {
      const nl = Math.min(1 + Math.floor(this.lines / 10), 20);
      if (nl > this.level) { this.level = nl; this.popup(`LEVEL ${nl}`, S.label); }
    }

    this.hooks.onClear?.(this, { n, tspin, mini, pc });

    if (this.mode === 'sprint' && this.lines >= 40) return this.finish(true);
    if (this.mode === 'dig' && !this.board.some(r => r.includes('G'))) return this.finish(true);
    if (lockOut && this.mode !== 'zen') return this.finish(false);

    this.canHold = true;
    this.spawn();
  }

  popup(text, color) { this.popups.push({ text, color, t: 0 }); if (this.popups.length > 4) this.popups.shift(); }

  tickFx(dt) {
    for (const p of this.popups) p.t += dt;
    this.popups = this.popups.filter(p => p.t < 1300);
    for (const f of this.flashes) f.t += dt;
    this.flashes = this.flashes.filter(f => f.t < 220);
  }

  update(dt) {
    this.tickFx(dt);
    if (this.over || this.paused) return;
    if (this.countdown > 0) { this.countdown -= dt; return; }
    this.elapsed += dt;

    if (this.mode === 'rapid') {
      const nl = Math.min(1 + Math.floor(this.elapsed / 10000), 10);
      if (nl > this.level) { this.level = nl; this.popup('SPEED UP!', sk().colors.L); }
      if (this.elapsed >= RAPID_MS) { this.elapsed = RAPID_MS; return this.finish(true); }
    }
    if (!this.piece) return;

    if (this.soft && this.sdf === 0) {
      let n = 0; while (this.fall()) n++;
      this.score += n;
    } else {
      const g = this.gravity();
      const interval = this.soft ? Math.min(g, this.sdf) : g;
      this.gTimer += dt;
      while (this.gTimer >= interval) {
        this.gTimer -= interval;
        if (this.fall()) { if (this.soft) this.score += 1; }
        else { this.gTimer = 0; break; }
      }
    }

    if (this.grounded()) {
      this.lockTimer += dt;
      if (this.lockTimer >= LOCK_MS) this.lock();
    }
  }

  finish(won) {
    if (this.over) return;
    this.over = true; this.won = won;
    this.hooks.onFinish?.(this);
  }
}

/* =====================================================================
   RENDER
   ===================================================================== */
const fmt = ms => {
  ms = Math.max(0, ms);
  const m = Math.floor(ms / 60000), s = Math.floor(ms / 1000) % 60, c = Math.floor(ms / 10) % 100;
  return `${m}:${String(s).padStart(2, '0')}.${String(c).padStart(2, '0')}`;
};
const pps = g => (g.elapsed > 0 ? (g.stats.pieces / (g.elapsed / 1000)).toFixed(2) : '0.00');
const num = n => Number(n).toLocaleString('en-US');
const garbageLeft = g => g.board.filter(r => r.includes('G')).length;

function drawCell(ctx, S, px, py, t, size = CELL, alpha = 1) {
  ctx.save();
  ctx.globalAlpha = alpha;
  S.cell(ctx, px, py, size, S.colors[t], t);
  ctx.restore();
}

function drawGhost(ctx, S, px, py, t) {
  const c = S.colors[t];
  ctx.save();
  if (S.ghost === 'fill') {
    ctx.globalAlpha = 0.25; S.cell(ctx, px, py, CELL, c, t);
  } else if (S.ghost === 'dotted') {
    ctx.fillStyle = S.border;
    for (let i = 3; i < CELL - 2; i += 4) {
      ctx.fillRect(px + i, py + 2, 2, 2); ctx.fillRect(px + i, py + CELL - 4, 2, 2);
      ctx.fillRect(px + 2, py + i, 2, 2); ctx.fillRect(px + CELL - 4, py + i, 2, 2);
    }
  } else {
    ctx.globalAlpha = 0.5; ctx.strokeStyle = c; ctx.lineWidth = 2;
    if (S.glow) { ctx.shadowColor = c; ctx.shadowBlur = 8; }
    ctx.strokeRect(px + 3, py + 3, CELL - 6, CELL - 6);
  }
  ctx.restore();
}

function drawMini(ctx, S, t, bx, by, bw, bh, alpha = 1) {
  const s = t === 'I' ? 16 : 18;
  const cells = ROT[t][0];
  const xs = cells.map(c => c[0]), ys = cells.map(c => c[1]);
  const minX = Math.min(...xs), maxX = Math.max(...xs), minY = Math.min(...ys), maxY = Math.max(...ys);
  const ox = bx + (bw - (maxX - minX + 1) * s) / 2 - minX * s;
  const oy = by + (bh - (maxY - minY + 1) * s) / 2 - minY * s;
  for (const [x, y] of cells) drawCell(ctx, S, ox + x * s, oy + y * s, t, s, alpha);
}

function panelBox(ctx, S, x, y, w, h) {
  ctx.fillStyle = S.panel; ctx.strokeStyle = S.panelLine; ctx.lineWidth = S.pixel ? 2 : 1;
  if (S.css.radius !== '0px') { rrect(ctx, x + 0.5, y + 0.5, w - 1, h - 1, parseInt(S.css.radius)); ctx.fill(); ctx.stroke(); }
  else { ctx.fillRect(x + 0.5, y + 0.5, w - 1, h - 1); ctx.strokeRect(x + 0.5, y + 0.5, w - 1, h - 1); }
}

function statsFor(g, S) {
  const t = fmt(g.elapsed), sc = num(g.score);
  switch (g.mode) {
    case 'rapid': {
      const left = RAPID_MS - g.elapsed;
      return [['TIME', fmt(left), left < 10000 ? S.warn : null], ['SCORE', sc], ['LINES', g.lines], ['LEVEL', g.level]];
    }
    case 'sprint':  return [['TIME', t], ['LINES', `${Math.min(g.lines, 40)}/40`], ['PPS', pps(g)], ['PIECES', g.stats.pieces]];
    case 'classic': return [['SCORE', sc], ['LEVEL', g.level], ['LINES', g.lines], ['TIME', t]];
    case 'dig':     return [['TIME', t], ['GARBAGE', garbageLeft(g)], ['PIECES', g.stats.pieces], ['PPS', pps(g)]];
    default:        return [['LINES', g.lines], ['SCORE', sc], ['TIME', t], ['PPS', pps(g)]];
  }
}

function render(ctx, g) {
  const S = sk();
  const retro = !!S.pixel;
  const fD = w => `${retro ? 400 : 700} ${retro ? Math.round(w * 0.62) : w}px ${S.fontD}`;
  ctx.clearRect(0, 0, CW, CH);
  ctx.imageSmoothingEnabled = !retro;

  // Board
  if (S.boardFill) S.boardFill(ctx, BX, 0, BOARD_W, CH);
  else { ctx.fillStyle = S.board; ctx.fillRect(BX, 0, BOARD_W, CH); }
  ctx.strokeStyle = S.grid; ctx.lineWidth = 1;
  ctx.beginPath();
  for (let x = 1; x < COLS; x++) { ctx.moveTo(BX + x * CELL + 0.5, 0); ctx.lineTo(BX + x * CELL + 0.5, CH); }
  for (let y = 1; y < VIS; y++) { ctx.moveTo(BX, y * CELL + 0.5); ctx.lineTo(BX + BOARD_W, y * CELL + 0.5); }
  ctx.stroke();

  for (let y = HIDDEN; y < ROWS; y++)
    for (let x = 0; x < COLS; x++) {
      const v = g.board[y][x];
      if (v) drawCell(ctx, S, BX + x * CELL, (y - HIDDEN) * CELL, v, CELL, g.over ? 0.55 : 1);
    }

  const p = g.piece;
  if (p && !g.over) {
    if (save.settings.ghost) {
      const gy = g.ghostY();
      if (gy !== p.y) for (const [cx, cy] of ROT[p.t][p.r]) {
        const y = gy + cy - HIDDEN;
        if (y >= 0) drawGhost(ctx, S, BX + (p.x + cx) * CELL, y * CELL, p.t);
      }
    }
    const lockFade = g.grounded() ? 1 - Math.min(g.lockTimer / LOCK_MS, 1) * 0.35 : 1;
    for (const [cx, cy] of ROT[p.t][p.r]) {
      const y = p.y + cy - HIDDEN;
      if (y >= 0) drawCell(ctx, S, BX + (p.x + cx) * CELL, y * CELL, p.t, CELL, lockFade);
    }
  }

  for (const f of g.flashes) {
    ctx.fillStyle = retro ? `rgba(15,56,15,${0.8 * (1 - f.t / 220)})` : `rgba(255,255,255,${0.75 * (1 - f.t / 220)})`;
    ctx.fillRect(BX, f.y * CELL, BOARD_W, CELL);
  }

  ctx.save();
  ctx.strokeStyle = S.border; ctx.lineWidth = retro ? 3 : 2;
  if (S.glow) { ctx.shadowColor = S.border; ctx.shadowBlur = 14; }
  ctx.strokeRect(BX - 1, 1, BOARD_W + 2, CH - 2);
  ctx.restore();

  // Popups
  ctx.textAlign = 'center';
  g.popups.forEach((pp, i) => {
    const a = pp.t < 150 ? pp.t / 150 : 1 - Math.max(0, (pp.t - 900) / 400);
    ctx.save();
    ctx.globalAlpha = Math.max(0, a);
    ctx.font = fD(i === 0 ? 20 : 16);
    ctx.fillStyle = retro ? S.text : pp.color;
    ctx.shadowColor = retro ? 'rgba(155,188,15,1)' : S.glow ? pp.color : 'rgba(0,0,0,0.9)';
    ctx.shadowBlur = retro ? 0 : S.glow ? 12 : 6;
    if (retro) { ctx.fillStyle = '#9bbc0f'; ctx.fillRect(BX + 20, CH * 0.3 + i * 26 - pp.t * 0.012 - 16, BOARD_W - 40, 22); ctx.fillStyle = S.text; }
    ctx.fillText(pp.text, BX + BOARD_W / 2, CH * 0.3 + i * 26 - pp.t * 0.012);
    ctx.restore();
  });

  // Countdown / end
  if (g.countdown > 0 && !g.over) {
    const n = Math.ceil(g.countdown / 500);
    ctx.fillStyle = S.overlay; ctx.fillRect(BX, 0, BOARD_W, CH);
    ctx.font = fD(64); ctx.fillStyle = S.label;
    ctx.fillText(String(n), BX + BOARD_W / 2, CH / 2 + 20);
  }
  if (g.over) {
    ctx.fillStyle = S.overlay; ctx.fillRect(BX, 0, BOARD_W, CH);
    ctx.font = fD(30); ctx.fillStyle = g.won ? S.label : S.warn;
    ctx.fillText(g.won ? (g.mode === 'rapid' ? 'TIME!' : 'CLEAR!') : 'TOP OUT', BX + BOARD_W / 2, CH / 2);
  }

  // Left panel
  ctx.textAlign = 'left';
  ctx.font = fD(12); ctx.fillStyle = S.label;
  ctx.fillText('HOLD', 0, 14);
  panelBox(ctx, S, 0, 22, PANEL_L, 74);
  if (g.hold) drawMini(ctx, S, g.hold, 0, 22, PANEL_L, 74, g.canHold ? 1 : 0.3);

  let sy = 128;
  for (const [label, value, color] of statsFor(g, S)) {
    ctx.font = `600 ${retro ? 10 : 11}px ${S.fontB}`; ctx.fillStyle = S.muted;
    ctx.fillText(label, 0, sy);
    ctx.font = fD(21); ctx.fillStyle = color || S.text;
    ctx.fillText(String(value), 0, sy + 24);
    sy += 50;
  }
  sy += 6;
  ctx.font = fD(13);
  if (g.combo > 0) { ctx.fillStyle = S.accent; ctx.fillText(`COMBO ${g.combo}`, 0, sy); sy += 20; }
  if (g.b2b > 0) { ctx.fillStyle = S.label; ctx.fillText(`B2B x${g.b2b}`, 0, sy); }

  // Right panel
  ctx.font = fD(12); ctx.fillStyle = S.label;
  ctx.fillText('NEXT', RX, 14);
  panelBox(ctx, S, RX, 22, PANEL_R, 5 * 58);
  g.queue.slice(0, 5).forEach((t, i) => drawMini(ctx, S, t, RX, 22 + i * 58, PANEL_R, 58, i === 0 ? 1 : 0.8));

  if (S.scanlines) {
    ctx.fillStyle = 'rgba(15,56,15,0.07)';
    for (let y = 0; y < CH; y += 3) ctx.fillRect(0, y, CW, 1);
  }
}

function renderPreview(canvas, id) {
  const S = SKINS[id];
  const dpr = window.devicePixelRatio || 1;
  const w = 120, h = 72, s = 14;
  canvas.width = w * dpr; canvas.height = h * dpr;
  const ctx = canvas.getContext('2d');
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  if (S.boardFill) S.boardFill(ctx, 0, 0, w, h); else { ctx.fillStyle = S.board; ctx.fillRect(0, 0, w, h); }
  const put = (t, cells) => cells.forEach(([x, y]) => S.cell(ctx, x * s + 4, y * s + 2, s, S.colors[t], t));
  put('G', [[0,4],[1,4],[2,4],[3,4],[5,4],[6,4],[7,4]]);
  put('I', [[0,3],[1,3],[2,3],[3,3]]);
  put('T', [[5,3],[6,3],[7,3],[6,2]]);
  put('O', [[4,0],[5,0],[4,1],[5,1]]);
  put('Z', [[0,2],[1,2],[1,1],[2,1]]);
  put('L', [[7,0],[7,1],[7,2],[6,1]].slice(0, 3));
  if (S.scanlines) { ctx.fillStyle = 'rgba(15,56,15,0.08)'; for (let y = 0; y < h; y += 3) ctx.fillRect(0, y, w, 1); }
}

function drawModeIcon(canvas, mode) {
  const S = sk();
  const dpr = window.devicePixelRatio || 1, W = 40, s = 10;
  canvas.width = W * dpr; canvas.height = W * dpr;
  const ctx = canvas.getContext('2d');
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  ctx.clearRect(0, 0, W, W);
  const shapes = {
    rapid:   ['I', [[0,0],[1,0],[2,0],[3,0]]],
    sprint:  ['S', [[1,0],[2,0],[0,1],[1,1]]],
    classic: ['T', [[0,0],[1,0],[2,0],[1,1]]],
    dig:     ['G', [[0,0],[2,0],[3,0],[0,1],[1,1],[3,1]]],
    zen:     ['O', [[0,0],[1,0],[0,1],[1,1]]],
  };
  const [t, cells] = shapes[mode];
  const mx = Math.max(...cells.map(c => c[0])) + 1, my = Math.max(...cells.map(c => c[1])) + 1;
  const ox = (W - mx * s) / 2, oy = (W - my * s) / 2;
  for (const [x, y] of cells) S.cell(ctx, ox + x * s, oy + y * s, s, S.colors[t], t);
}

/* =====================================================================
   CHAMP SELECT STATE
   ===================================================================== */
const champ = { phase: 'None', end: 0, timerPhase: '', turnId: null };
const PHASE_LABEL = { PLANNING: 'Declare', BAN_PICK: 'Bans / Picks', FINALIZATION: 'Finalization', GAME_STARTING: 'Starting' };

function myAction(s) {
  const me = s.localPlayerCellId;
  for (const group of s.actions || [])
    for (const a of group)
      if (a.actorCellId === me && a.isInProgress && !a.completed) return a;
  return null;
}

function onPhase(phase) {
  champ.phase = phase || 'None';
  if (champ.phase !== 'ChampSelect') { champ.end = 0; champ.turnId = null; hideTurn(); }
  if ((champ.phase === 'GameStart' || champ.phase === 'InProgress') && ui.open) { pauseGame(); hide(); }
  updateFab();
}

function onSession(s) {
  if (!s) { champ.end = 0; champ.turnId = null; hideTurn(); return; }
  if (s.timer) {
    champ.end = Date.now() + (s.timer.adjustedTimeLeftInPhase || 0);
    champ.timerPhase = s.timer.phase || '';
  }
  const a = myAction(s);
  if (a && a.id !== champ.turnId) { champ.turnId = a.id; onTurn(a.type); }
  else if (!a) { champ.turnId = null; hideTurn(); }
}

function onTurn(type) {
  if (!ui.open) return;
  const g = ui.game;
  const playing = ui.screen === 'game' && g && !g.over;
  if (playing && save.settings.autoPause) pauseGame();
  ui.turn.querySelector('.rt-turn-title').textContent =
    type === 'ban' ? 'Your turn to ban' : type === 'pick' ? 'Your turn to pick' : "It's your turn";
  ui.turn.querySelector('.rt-turn-sub').textContent =
    playing && save.settings.autoPause ? 'Your game is paused.' : "Head back to the client so you don't miss it.";
  ui.turn.classList.remove('rt-hidden');
}
function hideTurn() { ui.turn?.classList.add('rt-hidden'); }

/* =====================================================================
   UI STATE
   ===================================================================== */
const ui = {
  root: null, body: null, bar: null, fab: null, badge: null, toasts: null, turn: null,
  open: false, focused: false, tab: 'play', screen: 'menu', sel: 'rapid',
  game: null, canvas: null, ctx: null, pauseEl: null, ro: null,
  raf: 0, last: 0, watch: 0, sessionAch: [], resetArmed: false, lastMode: 'rapid', autosave: 0,
  drag: null, fabLast: 0,
  input: { left: false, right: false, down: false, dir: 0, das: 0, arr: 0 },
};

const LISTENERS = [];
function on(target, ev, fn, opt) { target.addEventListener(ev, fn, opt); LISTENERS.push([target, ev, fn, opt]); }

/* =====================================================================
   STYLES
   ===================================================================== */
const CSS = `
.rt-hidden{display:none!important}
#rt-root button:focus,#rt-root button:focus-visible{outline:none}
#rt-root{position:fixed;z-index:2147483600;box-sizing:border-box;display:flex;flex-direction:column;
  background:linear-gradient(180deg,var(--rt-bg1),var(--rt-bg2));border:1px solid var(--rt-goldd);border-radius:var(--rt-radius);
  box-shadow:0 12px 40px rgba(0,0,0,.6);font-family:var(--rt-fb);color:var(--rt-text);font-size:12px;overflow:hidden;user-select:none}
#rt-root.blur{border-color:var(--rt-line)}
#rt-root.blur .rt-bar{opacity:.75}
html[data-rt-skin=retro] #rt-root{border-width:3px;box-shadow:6px 6px 0 #0f380f}
html[data-rt-skin=neon] #rt-root{box-shadow:0 0 24px rgba(255,46,200,.3)}

.rt-bar{flex:0 0 38px;display:flex;align-items:center;gap:14px;padding:0 6px 0 12px;border-bottom:1px solid var(--rt-line2);cursor:move;background:rgba(0,0,0,.18)}
.rt-logo{display:flex;align-items:center;gap:8px;font-family:var(--rt-fd);font-weight:700;font-size:13px;letter-spacing:.06em;color:var(--rt-gold);white-space:nowrap}
html[data-rt-skin=retro] .rt-logo{font-size:9px;font-weight:400}
.rt-logo .m{position:relative;width:15px;height:10px}
.rt-logo .m i{position:absolute;width:5px;height:5px;background:var(--rt-piece)}
.rt-tabs{display:flex;height:100%}
.rt-tab{background:none;border:0;border-bottom:2px solid transparent;color:var(--rt-muted);font-family:var(--rt-fd);font-weight:700;font-size:11px;letter-spacing:.06em;text-transform:uppercase;padding:0 10px;cursor:pointer;height:100%}
html[data-rt-skin=retro] .rt-tab{font-size:8px;font-weight:400}
.rt-tab:hover{color:var(--rt-text)}
.rt-tab.on{color:var(--rt-text);border-bottom-color:var(--rt-gold)}
.rt-sp{flex:1}
.rt-badge{font-size:11px;color:var(--rt-teal);white-space:nowrap;font-variant-numeric:tabular-nums}
.rt-badge.warn{color:var(--rt-red)}
.rt-x{background:none;border:0;color:var(--rt-muted);width:28px;height:28px;cursor:pointer;display:flex;align-items:center;justify-content:center;border-radius:var(--rt-radius)}
.rt-x:hover{color:var(--rt-text);background:rgba(255,255,255,.06)}
.rt-x svg{width:10px;height:10px}

.rt-body{flex:1;min-height:0;overflow:auto;display:flex;flex-direction:column;padding:14px 16px 16px}
.rt-body::-webkit-scrollbar{width:6px}.rt-body::-webkit-scrollbar-thumb{background:var(--rt-line)}
.rt-sec{font-family:var(--rt-fd);font-weight:700;font-size:11px;letter-spacing:.06em;text-transform:uppercase;color:var(--rt-gold);margin:0 0 8px}
html[data-rt-skin=retro] .rt-sec{font-size:8px;font-weight:400}
.rt-sec + .rt-sec,.rt-gap{margin-top:18px}
.rt-note{color:var(--rt-muted);font-size:11px;line-height:1.4}

.rt-btn{background:linear-gradient(180deg,var(--rt-btn1),var(--rt-btn2));border:1px solid var(--rt-goldd);border-radius:var(--rt-radius);color:var(--rt-text);height:32px;padding:0 18px;
  font-family:var(--rt-fd);font-weight:700;font-size:12px;letter-spacing:.05em;text-transform:uppercase;cursor:pointer;white-space:nowrap}
html[data-rt-skin=retro] .rt-btn{font-size:8px;font-weight:400;border-width:2px}
.rt-btn:hover{border-color:var(--rt-gold);filter:brightness(1.15)}
.rt-btn.pri{border-color:var(--rt-gold);color:var(--rt-gold);min-width:140px}
.rt-btn.pri:hover{color:var(--rt-text)}
.rt-btn.ghost{background:none;border-color:var(--rt-line);color:var(--rt-muted)}
.rt-btn.ghost:hover{color:var(--rt-text)}
.rt-btn.dng{background:none;border-color:transparent;color:var(--rt-red);padding:0 6px}
.rt-btn.sm{height:26px;padding:0 10px;font-size:10px}
.rt-actions{display:flex;gap:8px;justify-content:flex-end;align-items:center;margin-top:14px}

.rt-resume{display:flex;align-items:center;gap:10px;padding:8px 10px;margin-bottom:12px;border:1px solid var(--rt-line);border-left:2px solid var(--rt-teal);background:var(--rt-card)}
.rt-resume .i{flex:1;min-width:0}
.rt-resume .i b{font-weight:600}
.rt-resume .i span{display:block;color:var(--rt-muted);font-size:11px;margin-top:1px}

.rt-list{border-top:1px solid var(--rt-line2)}
.rt-mode{display:flex;align-items:center;gap:12px;padding:8px 10px 8px 8px;border-bottom:1px solid var(--rt-line2);border-left:2px solid transparent;cursor:pointer}
.rt-mode:hover{background:rgba(255,255,255,.035)}
.rt-mode.on{background:var(--rt-card);border-left-color:var(--rt-gold)}
.rt-mode canvas{width:40px;height:40px;flex:0 0 40px}
.rt-mode .t{flex:1;min-width:0}
.rt-mode .n{font-family:var(--rt-fd);font-weight:700;font-size:14px;color:var(--rt-text)}
html[data-rt-skin=retro] .rt-mode .n{font-size:10px;font-weight:400}
.rt-mode .n small{font-family:var(--rt-fb);font-weight:400;font-size:11px;color:var(--rt-muted);margin-left:6px}
.rt-mode .d{color:var(--rt-muted);font-size:11px;margin-top:2px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.rt-mode .b{text-align:right;white-space:nowrap}
.rt-mode .b span{display:block;font-size:10px;color:var(--rt-dim);text-transform:uppercase;letter-spacing:.04em}
.rt-mode .b b{font-size:13px;color:var(--rt-gold);font-weight:600;font-variant-numeric:tabular-nums}
.rt-tagnow{display:inline-block;margin-left:6px;font-size:10px;color:var(--rt-teal);border:1px solid var(--rt-teal);padding:0 4px;vertical-align:1px}

.rt-hud{display:flex;justify-content:space-between;align-items:baseline;margin:-4px 0 8px;color:var(--rt-muted);font-size:11px}
.rt-hud b{font-family:var(--rt-fd);font-size:13px;color:var(--rt-text)}
.rt-stage{position:relative;flex:1;min-height:0;perspective:1100px}
.rt-stage canvas{position:absolute;inset:0;width:100%;height:100%;object-fit:contain;transition:transform .4s}
html[data-rt-skin=cube] .rt-stage canvas{transform:rotateX(12deg) scale(.96)}
html[data-rt-skin=retro] .rt-stage canvas{image-rendering:pixelated}
.rt-pause{position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:8px;background:var(--rt-back)}
.rt-pause .t{font-family:var(--rt-fd);font-size:20px;font-weight:700;color:var(--rt-text);margin-bottom:8px}
.rt-pause .rt-btn{width:200px}

.rt-res{text-align:center;padding-top:6px}
.rt-res .k{color:var(--rt-muted);font-size:11px;text-transform:uppercase;letter-spacing:.06em}
.rt-res .big{font-family:var(--rt-fd);font-size:44px;font-weight:700;color:var(--rt-text);margin:2px 0;font-variant-numeric:tabular-nums}
html[data-rt-skin=retro] .rt-res .big{font-size:24px;font-weight:400}
.rt-res .pb{color:var(--rt-teal);font-size:11px;font-weight:600}
.rt-res .pb.o{color:var(--rt-dim);font-weight:400}
.rt-stats{display:grid;grid-template-columns:repeat(auto-fit,minmax(96px,1fr));gap:1px;background:var(--rt-line2);border:1px solid var(--rt-line2);margin:16px 0 12px;text-align:left}
.rt-stats div{background:var(--rt-bg2);padding:7px 10px}
.rt-stats span{display:block;font-size:10px;color:var(--rt-muted);text-transform:uppercase;letter-spacing:.04em}
.rt-stats b{font-size:15px;font-weight:600;font-variant-numeric:tabular-nums}
.rt-unl{text-align:left;margin-top:6px}
.rt-unl div{padding:5px 0;border-bottom:1px solid var(--rt-line2);display:flex;gap:8px;align-items:center}
.rt-unl b{font-weight:600}.rt-unl span{color:var(--rt-muted)}

.rt-prog{display:flex;align-items:center;gap:10px;margin-bottom:14px}
.rt-prog .bar{flex:1;height:3px;background:var(--rt-line2)}
.rt-prog .bar i{display:block;height:100%;background:var(--rt-gold)}
.rt-prog b{font-variant-numeric:tabular-nums}
.rt-ach{display:flex;gap:10px;align-items:center;padding:7px 0;border-bottom:1px solid var(--rt-line2)}
.rt-ach .ic{width:26px;height:26px;flex:0 0 26px;display:flex;align-items:center;justify-content:center;border:1px solid var(--rt-line);color:var(--rt-dim)}
.rt-ach .ic svg{width:12px;height:12px}
.rt-ach .t{flex:1}
.rt-ach .n{font-weight:600;color:var(--rt-muted)}
.rt-ach .d{font-size:11px;color:var(--rt-dim);margin-top:1px}
.rt-ach .dt{font-size:10px;color:var(--rt-dim);white-space:nowrap}
.rt-ach.on .ic{border-color:var(--rt-gold);color:var(--rt-gold);background:var(--rt-card)}
.rt-ach.on .n{color:var(--rt-text)}.rt-ach.on .d{color:var(--rt-muted)}
.rt-tbl{width:100%;border-collapse:collapse}
.rt-tbl td{padding:5px 0;border-bottom:1px solid var(--rt-line2)}
.rt-tbl td:last-child{text-align:right;color:var(--rt-muted);font-variant-numeric:tabular-nums}
.rt-tbl b{font-weight:600;color:var(--rt-text)}

.rt-skins{display:grid;grid-template-columns:repeat(auto-fill,minmax(88px,1fr));gap:6px}
.rt-skin{background:none;border:1px solid var(--rt-line);border-radius:var(--rt-radius);padding:4px 4px 5px;cursor:pointer;color:var(--rt-muted);font-family:inherit;font-size:11px}
.rt-skin canvas{width:100%;height:auto;display:block;margin-bottom:4px}
.rt-skin:hover{color:var(--rt-text)}
.rt-skin.on{border-color:var(--rt-gold);color:var(--rt-text)}
.rt-row{display:flex;align-items:center;justify-content:space-between;gap:14px;padding:8px 0;border-bottom:1px solid var(--rt-line2)}
.rt-row .l small{display:block;color:var(--rt-dim);font-size:11px;margin-top:1px}
.rt-row input[type=range]{width:150px;accent-color:var(--rt-gold)}
.rt-row .v{display:inline-block;width:48px;text-align:right;color:var(--rt-gold);font-variant-numeric:tabular-nums}
.rt-chk{appearance:none;-webkit-appearance:none;width:16px;height:16px;border:1px solid var(--rt-goldd);background:var(--rt-bg2);cursor:pointer;display:grid;place-content:center;margin:0}
.rt-chk:checked::after{content:'';width:8px;height:8px;background:var(--rt-gold)}
.rt-keys{display:grid;grid-template-columns:repeat(auto-fill,minmax(190px,1fr));gap:0 18px}
.rt-keys div{display:flex;justify-content:space-between;padding:4px 0;border-bottom:1px solid var(--rt-line2);color:var(--rt-muted)}
.rt-keys kbd{font-family:inherit;color:var(--rt-text)}
.rt-io{display:flex;gap:6px;margin-top:8px}
.rt-io textarea{flex:1;height:26px;resize:none;background:var(--rt-bg2);border:1px solid var(--rt-line);color:var(--rt-text);font:11px monospace;padding:5px 6px;user-select:text}
.rt-io-msg{font-size:11px;color:var(--rt-teal);height:14px;margin-top:4px}

.rt-turn{position:absolute;inset:38px 0 0 0;z-index:5;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:10px;background:rgba(30,6,10,.92);border-top:2px solid var(--rt-red)}
.rt-turn-title{font-family:var(--rt-fd);font-size:26px;font-weight:700;color:#fff}
.rt-turn-sub{color:#e6d8c8}
.rt-turn .rt-actions{justify-content:center}

.rt-resize{position:absolute;right:0;bottom:0;width:16px;height:16px;cursor:nwse-resize;z-index:6;
  background:linear-gradient(135deg,transparent 0 55%,var(--rt-dim) 55% 62%,transparent 62% 72%,var(--rt-dim) 72% 79%,transparent 79%)}
.rt-resize:hover{background:linear-gradient(135deg,transparent 0 55%,var(--rt-gold) 55% 62%,transparent 62% 72%,var(--rt-gold) 72% 79%,transparent 79%)}

#rt-fab{position:fixed;right:22px;bottom:90px;z-index:2147483500;width:42px;height:28px;cursor:pointer;touch-action:none;transition:transform .12s,filter .12s;filter:drop-shadow(0 3px 5px rgba(0,0,0,.6))}
#rt-fab *{pointer-events:none}
#rt-fab i{position:absolute;width:14px;height:14px;box-sizing:border-box;background:var(--rt-piece);border:1px solid rgba(0,0,0,.45);
  box-shadow:inset 2px 2px 0 rgba(255,255,255,.35),inset -2px -2px 0 rgba(0,0,0,.25)}
#rt-fab:hover{transform:translateY(-2px);filter:drop-shadow(0 5px 8px rgba(0,0,0,.6)) brightness(1.15)}
#rt-fab.open i{opacity:.7}
#rt-fab .lb{position:absolute;left:50%;top:32px;transform:translateX(-50%);font:700 10px var(--rt-fb);color:var(--rt-teal);background:var(--rt-bg2);border:1px solid var(--rt-teal);padding:0 4px;white-space:nowrap}
#rt-fab.champ{animation:rtFab 1.6s ease-in-out infinite}
@keyframes rtFab{50%{filter:drop-shadow(0 0 8px var(--rt-teal))}}

.rt-credits{margin-top:auto;padding-top:14px;display:flex;align-items:center;gap:4px;color:var(--rt-dim);font-size:11px}
.rt-credits>span:first-child{margin-right:2px}
.rt-credits .ver{margin-left:auto}
.rt-link{display:flex;align-items:center;gap:6px;background:none;border:1px solid transparent;border-radius:var(--rt-radius);color:var(--rt-muted);font:inherit;font-size:11px;padding:4px 8px;cursor:pointer}
.rt-link svg{width:14px;height:14px}
.rt-link:hover{color:var(--rt-text);border-color:var(--rt-line)}
.rt-link.gh:hover svg{color:var(--rt-text)}
.rt-link.dc:hover svg{color:#5865f2}
html[data-rt-skin=retro] .rt-link.dc:hover svg{color:inherit}
#rt-toasts{position:fixed;top:70px;right:24px;z-index:2147483647;display:flex;flex-direction:column;gap:6px;pointer-events:none}
.rt-toast{width:250px;background:var(--rt-bg2);border:1px solid var(--rt-goldd);border-left:2px solid var(--rt-gold);border-radius:var(--rt-radius);padding:8px 10px;font-family:var(--rt-fb);color:var(--rt-text);font-size:12px;
  animation:rtIn .3s ease-out;transition:opacity .4s,transform .4s;box-shadow:0 6px 18px rgba(0,0,0,.45)}
.rt-toast.out{opacity:0;transform:translateX(16px)}
.rt-toast .k{font-size:10px;color:var(--rt-gold);text-transform:uppercase;letter-spacing:.05em}
.rt-toast .n{font-weight:600;font-size:13px;margin-top:1px}
.rt-toast .d{font-size:11px;color:var(--rt-muted);margin-top:1px}
@keyframes rtIn{from{opacity:0;transform:translateX(20px)}}
`;

const ICON_X = '<svg viewBox="0 0 10 10"><path d="M1 1l8 8M9 1L1 9" stroke="currentColor" stroke-width="1.5"/></svg>';
const ICON_CHECK = '<svg viewBox="0 0 12 12"><path d="M2 6.5l2.5 2.5L10 3" fill="none" stroke="currentColor" stroke-width="1.8"/></svg>';
const ICON_LOCK = '<svg viewBox="0 0 12 12"><rect x="2" y="5.5" width="8" height="5.5" fill="currentColor"/><path d="M4 5.5V4a2 2 0 014 0v1.5" fill="none" stroke="currentColor" stroke-width="1.4"/></svg>';
const T_CELLS = [[0, 0], [1, 0], [2, 0], [1, 1]];
const ICON_GH = '<svg viewBox="0 0 16 16"><path fill="currentColor" d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z"/></svg>';
const ICON_DC = '<svg viewBox="0 0 24 24"><path fill="currentColor" d="M20.317 4.37a19.79 19.79 0 00-4.885-1.515.074.074 0 00-.079.037c-.211.375-.445.865-.608 1.25a18.27 18.27 0 00-5.487 0 12.64 12.64 0 00-.617-1.25.077.077 0 00-.079-.037A19.74 19.74 0 003.677 4.37a.07.07 0 00-.032.028C.533 9.046-.319 13.58.099 18.058a.082.082 0 00.031.056 19.9 19.9 0 005.993 3.03.078.078 0 00.084-.028c.462-.63.873-1.295 1.226-1.994a.076.076 0 00-.042-.106 13.1 13.1 0 01-1.872-.892.077.077 0 01-.008-.128c.126-.094.252-.192.372-.291a.074.074 0 01.078-.01c3.927 1.793 8.18 1.793 12.061 0a.074.074 0 01.079.009c.12.099.246.198.373.292a.077.077 0 01-.007.128 12.3 12.3 0 01-1.873.891.077.077 0 00-.041.107c.36.698.772 1.363 1.225 1.993a.076.076 0 00.084.029 19.84 19.84 0 006.002-3.03.077.077 0 00.032-.055c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 00-.031-.029zM8.02 15.331c-1.183 0-2.157-1.086-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.095 2.157 2.42 0 1.332-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.086-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.095 2.157 2.42 0 1.332-.946 2.418-2.157 2.418z"/></svg>';
const LINKS = {
  github: 'https://github.com/Mixiruri',
  discord: 'https://discord.com/users/1544366048889798709',
  discordName: 'soriita',
};

/* =====================================================================
   SKIN APPLY
   ===================================================================== */
function applySkin() {
  const S = sk();
  const st = document.documentElement.style;
  for (const [k, v] of Object.entries(S.css)) st.setProperty(`--rt-${k}`, v);
  st.setProperty('--rt-fd', S.fontD);
  st.setProperty('--rt-fb', S.fontB);
  st.setProperty('--rt-piece', S.colors.T);
  document.documentElement.dataset.rtSkin = save.settings.skin;
}

function setSkin(id) {
  if (!SKINS[id]) return;
  save.settings.skin = id;
  persist(); applySkin();
  if (ui.screen === 'settings') renderSettings();
  else if (ui.screen === 'menu') renderMenu();
  else toast('Skin', SKINS[id].name, SKINS[id].desc, 1500);
}

function cycleSkin() {
  const i = SKIN_ORDER.indexOf(save.settings.skin);
  setSkin(SKIN_ORDER[(i + 1) % SKIN_ORDER.length]);
}

/* =====================================================================
   MOUNT / WINDOW
   ===================================================================== */
function el(html) { const t = document.createElement('template'); t.innerHTML = html.trim(); return t.content.firstElementChild; }

function mount() {
  for (const id of ['rt-root', 'rt-fab', 'rt-toasts', 'rt-style']) document.getElementById(id)?.remove();
  if (!document.getElementById('rt-font')) {
    const f = document.createElement('link');
    f.id = 'rt-font'; f.rel = 'stylesheet';
    f.href = 'https://fonts.googleapis.com/css2?family=Press+Start+2P&display=swap';
    document.head.appendChild(f);
  }
  const style = document.createElement('style');
  style.id = 'rt-style'; style.textContent = CSS;
  document.head.appendChild(style);
  applySkin();

  ui.root = el(`
    <div id="rt-root" class="rt-hidden">
      <div class="rt-bar">
        <div class="rt-logo"><span class="m">${T_CELLS.map(([x, y]) => `<i style="left:${x * 5}px;top:${y * 5}px"></i>`).join('')}</span>RiftTris</div>
        <div class="rt-tabs">
          <button class="rt-tab" data-act="tab:play">Play</button>
          <button class="rt-tab" data-act="tab:ach">Achievements</button>
          <button class="rt-tab" data-act="tab:settings">Settings</button>
        </div>
        <span class="rt-sp"></span>
        <span class="rt-badge rt-hidden"></span>
        <button class="rt-x" data-act="hide" title="Close (Alt+T / F8)">${ICON_X}</button>
      </div>
      <div class="rt-body"></div>
      <div class="rt-turn rt-hidden">
        <div class="rt-turn-title"></div>
        <div class="rt-turn-sub"></div>
        <div class="rt-actions">
          <button class="rt-btn pri" data-act="goclient">Go to client</button>
          <button class="rt-btn ghost" data-act="dismissturn">Keep playing</button>
        </div>
      </div>
      <div class="rt-resize" title="Resize"></div>
    </div>`);
  document.body.appendChild(ui.root);
  ui.body = ui.root.querySelector('.rt-body');
  ui.bar = ui.root.querySelector('.rt-bar');
  ui.badge = ui.root.querySelector('.rt-badge');
  ui.turn = ui.root.querySelector('.rt-turn');
  ui.root.addEventListener('click', e => safe(onClick)(e));
  ui.body.addEventListener('input', e => safe(onSettingInput)(e));

  ui.toasts = el('<div id="rt-toasts"></div>');
  document.body.appendChild(ui.toasts);

  ui.fab = el(`<div id="rt-fab" title="RiftTris (Alt+T / F8)">${T_CELLS.map(([x, y]) => `<i style="left:${x * 14}px;top:${y * 14}px"></i>`).join('')}<span class="lb rt-hidden">90s</span></div>`);
  document.body.appendChild(ui.fab);
  const pos = save.settings.fabPos;
  if (pos) placeFab(pos.left, pos.top);

  applyGeom();
  updateFab();
  if (ui.open) { ui.root.classList.remove('rt-hidden'); rerender(); }
}

function placeFab(left, top) {
  left = Math.max(0, Math.min(window.innerWidth - 42, left));
  top = Math.max(0, Math.min(window.innerHeight - 28, top));
  Object.assign(ui.fab.style, { left: left + 'px', top: top + 'px', right: 'auto', bottom: 'auto' });
}

function defaultGeom() {
  const h = Math.min(640, window.innerHeight - 60), w = Math.min(560, window.innerWidth - 40);
  return { x: Math.round((window.innerWidth - w) / 2), y: 40, w, h };
}

function applyGeom() {
  const g = { ...defaultGeom(), ...(save.settings.win || {}) };
  const W = window.innerWidth, H = window.innerHeight;
  g.w = Math.max(360, Math.min(W - 8, g.w));
  g.h = Math.max(400, Math.min(H - 8, g.h));
  g.x = Math.max(0, Math.min(W - g.w, g.x));
  g.y = Math.max(0, Math.min(H - g.h, g.y));
  Object.assign(ui.root.style, { left: g.x + 'px', top: g.y + 'px', width: g.w + 'px', height: g.h + 'px' });
  return g;
}

function setFocused(v) {
  if (ui.focused === v) return;
  ui.focused = v;
  ui.root?.classList.toggle('blur', !v);
  if (!v) { resetInput(); if (ui.screen === 'game') pauseGame(); }
}

function updateFab() {
  if (!ui.fab) return;
  const on = champ.phase === 'ChampSelect' && save.settings.champPill;
  ui.fab.classList.toggle('champ', on);
  ui.fab.classList.toggle('open', ui.open);
  ui.fab.querySelector('.lb').classList.toggle('rt-hidden', !on);
}

function show() {
  if (!ui.root || !document.documentElement.contains(ui.root)) mount();
  ui.open = true;
  ui.root.classList.remove('rt-hidden');
  applyGeom();
  setFocused(true);
  document.activeElement?.blur?.();
  if (ui.screen === 'game' && !ui.game) ui.screen = 'menu';
  rerender();
  updateFab();
  ui.last = 0;
  cancelAnimationFrame(ui.raf);
  ui.raf = requestAnimationFrame(loop);
}
function hide() {
  if (!ui.root) return;
  pauseGame();
  storeResume(); persist();
  ui.open = false;
  ui.root.classList.add('rt-hidden');
  cancelAnimationFrame(ui.raf);
  updateFab();
}
function toggle() {
  if (!ui.open) return show();
  if (!ui.focused) return setFocused(true);
  hide();
}

function fabActivate() {
  const now = Date.now();
  if (now - ui.fabLast < 150) return;
  ui.fabLast = now;
  if (champ.phase === 'ChampSelect' && save.settings.champPill && !ui.open && !(ui.game && !ui.game.over)) { show(); startGame('rapid'); }
  else if (ui.open) hide();
  else show();
}

/* ---------- global pointer handling (coordinate hit-test, runs before the client) ---------- */
function hit(elm, e) {
  if (!elm || !elm.isConnected) return false;
  const r = elm.getBoundingClientRect();
  return r.width > 0 && e.clientX >= r.left && e.clientX <= r.right && e.clientY >= r.top && e.clientY <= r.bottom;
}

function onPointer(e) {
  const d = ui.drag;
  if (e.type === 'pointerdown') {
    if (e.button !== 0) return;
    if (hit(ui.fab, e)) {
      const r = ui.fab.getBoundingClientRect();
      ui.drag = { kind: 'fab', sx: e.clientX, sy: e.clientY, ox: r.left, oy: r.top, moved: false };
      e.preventDefault(); e.stopPropagation();
      return;
    }
    if (!ui.open) return;
    const inside = hit(ui.root, e);
    setFocused(inside);
    if (!inside) return;
    const r = ui.root.getBoundingClientRect();
    if (e.target.closest?.('.rt-resize')) {
      ui.drag = { kind: 'resize', sx: e.clientX, sy: e.clientY, ow: r.width, oh: r.height, ox: r.left, oy: r.top };
      e.preventDefault();
    } else if (e.target.closest?.('.rt-bar') && !e.target.closest('button')) {
      ui.drag = { kind: 'win', sx: e.clientX, sy: e.clientY, ox: r.left, oy: r.top, ow: r.width, oh: r.height };
      e.preventDefault();
    }
    return;
  }
  if (!d) return;
  const dx = e.clientX - d.sx, dy = e.clientY - d.sy;
  if (e.type === 'pointermove') {
    if (!d.moved && Math.abs(dx) + Math.abs(dy) < 4) return;
    d.moved = true;
    if (d.kind === 'fab') placeFab(d.ox + dx, d.oy + dy);
    else if (d.kind === 'win') { save.settings.win = { x: d.ox + dx, y: d.oy + dy, w: d.ow, h: d.oh }; applyGeom(); }
    else if (d.kind === 'resize') { save.settings.win = { x: d.ox, y: d.oy, w: d.ow + dx, h: d.oh + dy }; applyGeom(); fitCanvas(); }
    e.preventDefault(); e.stopPropagation();
    return;
  }
  // pointerup / pointercancel
  ui.drag = null;
  if (d.kind === 'fab') {
    e.stopPropagation();
    if (d.moved) {
      save.settings.fabPos = { left: parseInt(ui.fab.style.left), top: parseInt(ui.fab.style.top) };
      persist();
      ui.fabLast = Date.now();
    } else if (e.type === 'pointerup') fabActivate();
  } else if (d.moved) {
    const r = ui.root.getBoundingClientRect();
    save.settings.win = { x: Math.round(r.left), y: Math.round(r.top), w: Math.round(r.width), h: Math.round(r.height) };
    persist();
  }
}

function onGlobalClick(e) {
  if (!hit(ui.fab, e)) return;
  e.preventDefault(); e.stopPropagation();
  if (!ui.drag) fabActivate(); // fallback if pointer events never reached us
}

/* ---------- input helpers ---------- */
function resetInput() { Object.assign(ui.input, { left: false, right: false, down: false, dir: 0, das: 0, arr: 0 }); if (ui.game) ui.game.soft = false; }

function pauseGame() {
  const g = ui.game;
  if (!g || g.over) return;
  g.paused = true; resetInput();
  ui.pauseEl?.classList.remove('rt-hidden');
}
function resumeGame() {
  const g = ui.game;
  if (!g || g.over) return;
  g.paused = false; resetInput();
  ui.pauseEl?.classList.add('rt-hidden');
  hideTurn();
}

/* ---------- resume slot ---------- */
function storeResume() {
  const g = ui.game;
  if (g && !g.over && RESUMABLE.has(g.mode) && g.stats.pieces > 0) save.resume = g.snapshot();
}
function clearResume() { save.resume = null; }

/* =====================================================================
   SCREENS
   ===================================================================== */
function bestText(mode) {
  const b = save.best[mode];
  if (!b) return '—';
  if (mode === 'sprint' || mode === 'dig') return b.time ? fmt(b.time) : '—';
  if (mode === 'zen') return b.lines ? `${b.lines} lines` : '—';
  return b.score ? num(b.score) : '—';
}

function ago(ts) {
  const m = Math.round((Date.now() - ts) / 60000);
  if (m < 1) return 'just now';
  if (m < 60) return `${m} min ago`;
  const h = Math.round(m / 60);
  if (h < 24) return `${h} h ago`;
  return `${Math.round(h / 24)} d ago`;
}

function setTab(tab) {
  ui.tab = tab;
  ui.root.querySelectorAll('.rt-tab').forEach(b => b.classList.toggle('on', b.dataset.act === `tab:${tab}`));
}

function rerender() {
  if (ui.tab === 'ach') return renderAch();
  if (ui.tab === 'settings') return renderSettings();
  if (ui.game && !ui.game.over && ui.screen !== 'menu') return renderGame();
  if (ui.screen === 'results' && ui.game) return renderResults(ui.game, ui.lastNew);
  return renderMenu();
}

function goTab(tab) {
  if (tab !== 'play' && ui.screen === 'game') pauseGame();
  if (tab === 'play' && ui.screen !== 'game' && ui.screen !== 'results') ui.screen = ui.game && !ui.game.over ? 'game' : 'menu';
  setTab(tab);
  if (tab === 'play') {
    if (ui.game && !ui.game.over) return renderGame();
    if (ui.game && ui.game.over && ui.lastScreen === 'results') return renderResults(ui.game, ui.lastNew);
    return renderMenu();
  }
  ui.lastScreen = ui.screen === 'results' ? 'results' : ui.lastScreen;
  rerender();
}

function creditsHtml() {
  return `<div class="rt-credits">
    <span>Made by</span>
    <button class="rt-link gh" data-act="link:github" title="${LINKS.github}">${ICON_GH}<span>Mixiruri</span></button>
    <button class="rt-link dc" data-act="link:discord" title="Discord: @${LINKS.discordName} (click to copy)">${ICON_DC}<span>@${LINKS.discordName}</span></button>
    <span class="ver">v${VERSION}</span>
  </div>`;
}

function copyText(text) {
  const done = () => true;
  if (navigator.clipboard?.writeText) return navigator.clipboard.writeText(text).then(done, () => execCopy(text));
  return Promise.resolve(execCopy(text));
}
function execCopy(text) {
  try {
    const ta = document.createElement('textarea');
    ta.value = text; ta.style.cssText = 'position:fixed;opacity:0';
    document.body.appendChild(ta); ta.select();
    const ok = document.execCommand('copy'); ta.remove();
    return ok;
  } catch { return false; }
}

function openLink(kind) {
  if (kind === 'github') {
    let w = null;
    try { w = window.open(LINKS.github, '_blank'); } catch {}
    if (!w) copyText(LINKS.github).then(() => toast('GitHub', 'Link copied', LINKS.github, 2500));
    return;
  }
  if (kind === 'discord') {
    copyText(`@${LINKS.discordName}`).then(ok => toast('Discord', ok ? 'Username copied' : `@${LINKS.discordName}`, `@${LINKS.discordName} — paste it in Discord to add me`, 2800));
  }
}

function renderMenu() {
  setTab('play');
  ui.screen = 'menu'; ui.lastScreen = 'menu';
  if (ui.game && !ui.game.over) storeResume();
  ui.game = null; ui.canvas = null; ui.ctx = null;
  ui.ro?.disconnect(); ui.ro = null;
  const inChamp = champ.phase === 'ChampSelect';
  const r = save.resume;
  ui.body.innerHTML = `
    ${r && MODES[r.mode] ? `<div class="rt-resume">
      <div class="i"><b>${MODES[r.mode].name}</b> in progress — ${num(r.score)} pts, ${r.lines} lines
        <span>Saved ${ago(r.at)} · ${fmt(r.elapsed)} played</span></div>
      <button class="rt-btn sm" data-act="resumeSave">Continue</button>
      <button class="rt-btn sm ghost" data-act="dropSave" title="Discard">${ICON_X}</button>
    </div>` : ''}
    <div class="rt-sec">Game mode</div>
    <div class="rt-list">
      ${MODE_ORDER.map((id, i) => {
        const m = MODES[id];
        return `<div class="rt-mode ${ui.sel === id ? 'on' : ''}" data-act="sel:${id}" title="Press ${i + 1} to start">
          <canvas data-icon="${id}"></canvas>
          <div class="t">
            <div class="n">${m.name}<small>${m.tag}</small>${id === 'rapid' && inChamp ? '<span class="rt-tagnow">Champ select</span>' : ''}</div>
            <div class="d">${m.desc}</div>
          </div>
          <div class="b"><span>Best</span><b>${bestText(id)}</b></div>
        </div>`;
      }).join('')}
    </div>
    <div class="rt-actions">
      <span class="rt-note" style="margin-right:auto">Double-click or press Enter to play</span>
      <button class="rt-btn pri" data-act="play">Play</button>
    </div>
    ${creditsHtml()}`;
  ui.body.querySelectorAll('canvas[data-icon]').forEach(c => drawModeIcon(c, c.dataset.icon));
}

function fitCanvas() {
  if (!ui.canvas || !ui.ctx) return;
  const r = ui.canvas.getBoundingClientRect();
  const dpr = window.devicePixelRatio || 1;
  const k = Math.max(1, Math.min(r.width / CW, r.height / CH)) * dpr;
  const w = Math.round(CW * k), h = Math.round(CH * k);
  if (ui.canvas.width !== w || ui.canvas.height !== h) {
    ui.canvas.width = w; ui.canvas.height = h;
    ui.ctx.setTransform(k, 0, 0, k, 0, 0);
    if (ui.game) render(ui.ctx, ui.game);
  }
}

function renderGame() {
  setTab('play');
  ui.screen = 'game';
  const g = ui.game, m = MODES[g.mode];
  ui.body.innerHTML = `
    <div class="rt-hud"><b>${m.name}</b><span>Esc pause · R restart · V skin</span></div>
    <div class="rt-stage">
      <canvas></canvas>
      <div class="rt-pause ${g.paused ? '' : 'rt-hidden'}">
        <div class="t">Paused</div>
        <button class="rt-btn pri" data-act="resume">Resume</button>
        <button class="rt-btn" data-act="restart">Restart</button>
        ${g.mode === 'zen' ? '<button class="rt-btn" data-act="endzen">End session</button>' : ''}
        <button class="rt-btn ghost" data-act="menu">${RESUMABLE.has(g.mode) ? 'Save & quit' : 'Quit'}</button>
      </div>
    </div>`;
  ui.canvas = ui.body.querySelector('canvas');
  ui.ctx = ui.canvas.getContext('2d');
  ui.pauseEl = ui.body.querySelector('.rt-pause');
  ui.canvas.width = CW; ui.canvas.height = CH;
  ui.ro?.disconnect();
  ui.ro = new ResizeObserver(() => fitCanvas());
  ui.ro.observe(ui.body.querySelector('.rt-stage'));
  requestAnimationFrame(fitCanvas);
  render(ui.ctx, g);
}

function renderResults(g, isNew) {
  setTab('play');
  ui.screen = 'results'; ui.lastScreen = 'results';
  ui.canvas = null; ui.ctx = null; ui.ro?.disconnect(); ui.ro = null;
  const titles = {
    rapid: g.won ? "Time's up" : 'Topped out', sprint: g.won ? '40 lines' : 'Topped out', classic: 'Game over',
    dig: g.won ? 'Dug out' : 'Topped out', zen: 'Session over',
  };
  let big;
  if ((g.mode === 'sprint' || g.mode === 'dig') && g.won) big = fmt(g.elapsed);
  else if (g.mode === 'zen') big = `${g.lines} lines`;
  else if (g.mode === 'sprint') big = `${g.lines}/40`;
  else if (g.mode === 'dig') big = `${garbageLeft(g)} left`;
  else big = num(g.score);

  const cells = [
    ['Score', num(g.score)], ['Lines', g.lines], ['Pieces', g.stats.pieces], ['PPS', pps(g)],
    ['Tetrises', g.stats.tetrises], ['T-Spins', g.stats.tspins], ['Max combo', Math.max(0, g.stats.maxCombo)], ['Time', fmt(g.elapsed)],
  ];
  ui.body.innerHTML = `
    <div class="rt-res">
      <div class="k">${MODES[g.mode].name} · ${titles[g.mode]}</div>
      <div class="big">${big}</div>
      ${isNew ? '<div class="pb">New personal best</div>' : `<div class="pb o">Best: ${bestText(g.mode)}</div>`}
      <div class="rt-stats">${cells.map(([k, v]) => `<div><span>${k}</span><b>${v}</b></div>`).join('')}</div>
      ${ui.sessionAch.length ? `<div class="rt-sec" style="text-align:left">Unlocked</div><div class="rt-unl">${ui.sessionAch.map(id => {
        const a = ACH.find(x => x.id === id);
        return `<div><b>${a.name}</b><span>${a.desc}</span></div>`;
      }).join('')}</div>` : ''}
      <div class="rt-actions">
        <button class="rt-btn ghost" data-act="menu">Modes</button>
        <button class="rt-btn pri" data-act="again">Play again</button>
      </div>
    </div>`;
}

function renderAch() {
  setTab('ach');
  ui.screen = 'ach';
  const n = Object.keys(save.ach).length;
  const t = save.totals;
  const hrs = t.playMs / 3600000;
  const date = ts => new Date(ts).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  const histMain = h => (h.mode === 'sprint' || h.mode === 'dig') && h.won ? fmt(h.elapsed) : h.mode === 'zen' ? `${h.lines} lines` : `${num(h.score)} pts`;
  const sorted = [...ACH].sort((a, b) => (save.ach[b.id] ? 1 : 0) - (save.ach[a.id] ? 1 : 0));
  ui.body.innerHTML = `
    <div class="rt-stats" style="margin-top:0">
      <div><span>Games</span><b>${num(t.games)}</b></div>
      <div><span>Lines</span><b>${num(t.lines)}</b></div>
      <div><span>Tetrises</span><b>${num(t.tetrises)}</b></div>
      <div><span>T-Spins</span><b>${num(t.tspins)}</b></div>
      <div><span>Time played</span><b>${hrs >= 1 ? hrs.toFixed(1) + ' h' : Math.round(t.playMs / 60000) + ' min'}</b></div>
    </div>
    ${save.history.length ? `<div class="rt-sec">Recent games</div>
      <table class="rt-tbl">${save.history.slice(0, 5).map(h => `<tr><td>${MODES[h.mode].name}${!h.won && (h.mode === 'sprint' || h.mode === 'dig') ? ' <span style="color:var(--rt-dim)">· topped out</span>' : ''}</td><td><b>${histMain(h)}</b> · ${ago(h.at)}</td></tr>`).join('')}</table>
      <div class="rt-gap"></div>` : ''}
    <div class="rt-sec">Achievements</div>
    <div class="rt-prog"><div class="bar"><i style="width:${(n / ACH.length) * 100}%"></i></div><b>${n} / ${ACH.length}</b></div>
    ${sorted.map(a => {
      const on = !!save.ach[a.id];
      return `<div class="rt-ach ${on ? 'on' : ''}"><div class="ic">${on ? ICON_CHECK : ICON_LOCK}</div>
        <div class="t"><div class="n">${a.name}</div><div class="d">${a.desc}</div></div>
        ${on ? `<div class="dt">${date(save.ach[a.id])}</div>` : ''}</div>`;
    }).join('')}`;
}

function renderSettings() {
  setTab('settings');
  ui.screen = 'settings'; ui.resetArmed = false;
  const s = save.settings;
  const range = (key, label, hint, min, max) => `
    <div class="rt-row"><div class="l">${label}<small>${hint}</small></div>
      <div><input type="range" data-set="${key}" min="${min}" max="${max}" step="1" value="${s[key]}"><span class="v" data-val="${key}">${s[key]} ms</span></div></div>`;
  const check = (key, label, hint) => `
    <label class="rt-row"><div class="l">${label}<small>${hint}</small></div><input class="rt-chk" type="checkbox" data-set="${key}" ${s[key] ? 'checked' : ''}></label>`;
  const keys = [
    ['Move', '← →'], ['Soft drop', '↓'], ['Hard drop', 'Space'], ['Rotate right', '↑ / X'],
    ['Rotate left', 'Z / Ctrl'], ['Rotate 180°', 'A'], ['Hold', 'C / Shift'], ['Pause', 'Esc / P'],
    ['Restart', 'R'], ['Change skin', 'V'], ['Open / close', 'Alt+T / F8'], ['Quick start', '1 – 5'],
  ];
  ui.body.innerHTML = `
    <div class="rt-sec">Skin</div>
    <div class="rt-skins">
      ${SKIN_ORDER.map(id => `<button class="rt-skin ${s.skin === id ? 'on' : ''}" data-act="skin:${id}"><canvas data-prev="${id}"></canvas>${SKINS[id].name}</button>`).join('')}
    </div>
    <div class="rt-note" style="margin-top:6px">${sk().desc}</div>

    <div class="rt-sec rt-gap">Handling</div>
    ${range('das', 'DAS', 'Delay before a held piece starts sliding', 40, 300)}
    ${range('arr', 'ARR', 'Slide speed while held (0 = instant)', 0, 100)}
    ${range('sdf', 'Soft drop', 'Drop interval while holding ↓ (0 = instant)', 0, 100)}
    ${check('ghost', 'Ghost piece', 'Shows where the piece will land')}

    <div class="rt-sec rt-gap">Champ select</div>
    ${check('champPill', 'Quick Rapid', 'Clicking the Tetris icon during champ select starts Rapid')}
    ${check('autoPause', 'Pause on my turn', 'Pauses the game and alerts you when you have to ban or pick')}

    <div class="rt-sec rt-gap">Controls</div>
    <div class="rt-keys">${keys.map(([a, k]) => `<div><span>${a}</span><kbd>${k}</kbd></div>`).join('')}</div>

    <div class="rt-sec rt-gap">Save data</div>
    <div class="rt-note">Everything saves automatically and survives client restarts. Use a backup code to move your progress to another PC.</div>
    <div class="rt-io">
      <textarea placeholder="Paste a backup code…"></textarea>
      <button class="rt-btn sm" data-act="export">Copy backup</button>
      <button class="rt-btn sm" data-act="import">Import</button>
    </div>
    <div class="rt-io-msg"></div>
    <div class="rt-actions" style="justify-content:space-between">
      <button class="rt-btn dng sm" data-act="wipe">Reset all progress</button>
      <button class="rt-btn sm ghost" data-act="resetwin">Reset window size</button>
    </div>
    ${creditsHtml()}`;
  ui.body.querySelectorAll('canvas[data-prev]').forEach(c => renderPreview(c, c.dataset.prev));
}

function ioMsg(t) { const m = ui.body.querySelector('.rt-io-msg'); if (m) m.textContent = t; }

function onSettingInput(e) {
  const key = e.target.dataset?.set;
  if (!key) return;
  if (e.target.type === 'checkbox') save.settings[key] = e.target.checked;
  else {
    save.settings[key] = Number(e.target.value);
    const v = ui.body.querySelector(`[data-val="${key}"]`);
    if (v) v.textContent = `${e.target.value} ms`;
  }
  persist(); updateFab();
}

function onClick(e) {
  const b = e.target.closest('[data-act]');
  if (!b) return;
  const act = b.dataset.act;
  if (act.startsWith('tab:')) return goTab(act.slice(4));
  if (act.startsWith('skin:')) return setSkin(act.slice(5));
  if (act.startsWith('link:')) return openLink(act.slice(5));
  if (act.startsWith('sel:')) {
    const id = act.slice(4);
    if (e.detail >= 2 || ui.sel === id && e.detail === 0) return startGame(id);
    ui.sel = id;
    ui.body.querySelectorAll('.rt-mode').forEach(r => r.classList.toggle('on', r.dataset.act === act));
    return;
  }
  switch (act) {
    case 'hide': return hide();
    case 'play': return startGame(ui.sel);
    case 'menu': return renderMenu();
    case 'resume': return resumeGame();
    case 'restart': return startGame(ui.game.mode);
    case 'again': return startGame(ui.lastMode);
    case 'endzen': ui.game.paused = false; return ui.game.finish(true);
    case 'goclient': hideTurn(); return hide();
    case 'dismissturn': hideTurn(); return;
    case 'resumeSave': return continueSaved();
    case 'dropSave': clearResume(); persist(); return renderMenu();
    case 'resetwin': save.settings.win = null; save.settings.fabPos = null; persist(); applyGeom();
      Object.assign(ui.fab.style, { left: '', top: '', right: '', bottom: '' }); return;
    case 'export': {
      const code = btoa(unescape(encodeURIComponent(JSON.stringify({ ...save, resume: null }))));
      const ta = ui.body.querySelector('.rt-io textarea');
      ta.value = code; ta.select();
      (navigator.clipboard?.writeText(code) || Promise.reject()).then(() => ioMsg('Copied to clipboard'), () => { try { document.execCommand('copy'); ioMsg('Copied'); } catch { ioMsg('Select the text and copy it'); } });
      return;
    }
    case 'import': {
      const ta = ui.body.querySelector('.rt-io textarea');
      try {
        const data = JSON.parse(decodeURIComponent(escape(atob(ta.value.trim()))));
        if (!data || !data.settings) throw 0;
        save = mergeSave(data); persist(); applySkin(); updateFab(); applyGeom();
        renderSettings(); ioMsg('Progress imported');
      } catch { ioMsg('That code is not valid'); }
      return;
    }
    case 'wipe':
      if (!ui.resetArmed) { ui.resetArmed = true; b.textContent = 'Click again to confirm'; return; }
      save = clone(DEFAULT_SAVE); persist(); applySkin(); updateFab(); return renderSettings();
  }
}

/* =====================================================================
   GAME FLOW
   ===================================================================== */
const HOOKS = () => ({ onClear, onFinish });

function startGame(mode) {
  if (!MODES[mode]) return;
  if (ui.game && !ui.game.over) storeResume();
  if (save.resume && save.resume.mode === mode) clearResume();
  ui.sessionAch = []; ui.lastMode = mode; ui.sel = mode; ui.autosave = 0;
  resetInput(); hideTurn(); setFocused(true);
  ui.game = new Game(mode, HOOKS());
  ui.game.sdf = save.settings.sdf;
  persist();
  renderGame();
}

function continueSaved() {
  const r = save.resume;
  if (!r || !MODES[r.mode]) return renderMenu();
  ui.sessionAch = []; ui.lastMode = r.mode; ui.sel = r.mode; ui.autosave = 0;
  resetInput(); hideTurn(); setFocused(true);
  ui.game = Game.restore(r, HOOKS());
  ui.game.sdf = save.settings.sdf;
  clearResume(); persist();
  renderGame();
}

function toast(kind, name, desc, ms = 3200) {
  if (!ui.toasts) return;
  const t = el(`<div class="rt-toast"><div class="k">${kind}</div><div class="n">${name}</div><div class="d">${desc}</div></div>`);
  ui.toasts.appendChild(t);
  setTimeout(() => t.classList.add('out'), ms);
  setTimeout(() => t.remove(), ms + 500);
}

function unlock(id) {
  if (save.ach[id]) return;
  save.ach[id] = Date.now();
  ui.sessionAch.push(id);
  persist();
  const a = ACH.find(x => x.id === id);
  toast('Achievement unlocked', a.name, a.desc);
}

function onClear(g, { n, tspin, mini, pc }) {
  if (n > 0) unlock('first_blood');
  if (n === 4) unlock('tetris');
  if (g.stats.tetrises >= 5) unlock('pentakill');
  if (tspin && n > 0) unlock('tspin');
  if (tspin && !mini && n === 2) unlock('tsd');
  if (tspin && !mini && n === 3) unlock('tst');
  if (pc) unlock('pc');
  if (g.combo >= 5) unlock('combo5');
  if (g.combo >= 10) unlock('combo10');
  if (g.b2b >= 3) unlock('b2b4');
  if (g.mode === 'classic' && g.level >= 10) unlock('lvl10');
  if (g.mode === 'classic' && g.level >= 15) unlock('lvl15');
  if (g.mode === 'zen' && g.lines >= 100) unlock('zen100');
}

function onFinish(g) {
  if (save.resume && save.resume.mode === g.mode) clearResume();
  const t = save.totals;
  t.games++; t.lines += g.lines; t.tetrises += g.stats.tetrises; t.tspins += g.stats.tspins;
  t.playMs += g.elapsed; t.pieces += g.stats.pieces;
  save.played[g.mode] = (save.played[g.mode] || 0) + 1;
  save.skinsUsed[save.settings.skin] = true;
  save.history.unshift({ mode: g.mode, score: g.score, lines: g.lines, elapsed: g.elapsed, won: g.won, at: Date.now() });
  save.history = save.history.slice(0, 20);

  const b = save.best[g.mode] || {};
  let isNew = false;
  if (g.mode === 'sprint' || g.mode === 'dig') {
    if (g.won && (!b.time || g.elapsed < b.time)) { b.time = g.elapsed; isNew = true; }
  } else if (g.mode === 'zen') {
    if (g.lines > (b.lines || 0)) { b.lines = g.lines; isNew = true; }
  } else if (g.score > (b.score || 0)) { b.score = g.score; b.lines = g.lines; isNew = true; }
  save.best[g.mode] = b;

  if (g.mode === 'sprint' && g.won) {
    if (g.elapsed < 120000) unlock('sprint2');
    if (g.elapsed < 60000) unlock('sprint1');
    if (g.stats.holds === 0) unlock('sprint_nh');
  }
  if (g.mode === 'rapid') {
    if (g.score >= 10000) unlock('rapid10');
    if (g.score >= 30000) unlock('rapid30');
    if (champ.phase === 'ChampSelect' && g.won) unlock('champ');
  }
  if (g.mode === 'dig' && g.won) { unlock('dig'); if (g.elapsed < 45000) unlock('dig45'); }
  if (t.lines >= 1000) unlock('lines1k');
  if (t.games >= 25) unlock('games25');
  if (MODE_ORDER.every(m => save.played[m] > 0)) unlock('all_modes');
  if (SKIN_ORDER.every(s => save.skinsUsed[s])) unlock('skins');

  persist();
  resetInput();
  ui.lastNew = isNew;
  setTimeout(() => { if (ui.game === g && ui.screen === 'game') renderResults(g, isNew); }, 900);
}

/* =====================================================================
   LOOP
   ===================================================================== */
function das(dt) {
  const inp = ui.input, g = ui.game;
  if (!inp.dir) return;
  inp.das += dt;
  const { das: DAS, arr: ARR } = save.settings;
  if (inp.das < DAS) return;
  if (ARR === 0) { while (g.move(inp.dir)); return; }
  inp.arr += dt;
  while (inp.arr >= ARR) { inp.arr -= ARR; if (!g.move(inp.dir)) { inp.arr = 0; break; } }
}

function updateBadge() {
  if (champ.phase === 'ChampSelect' && champ.end) {
    const s = Math.max(0, Math.ceil((champ.end - Date.now()) / 1000));
    ui.badge.textContent = `${PHASE_LABEL[champ.timerPhase] || 'Champ select'} · ${s}s`;
    ui.badge.classList.toggle('warn', s <= 10);
    ui.badge.classList.remove('rt-hidden');
  } else ui.badge.classList.add('rt-hidden');
}

function loop(ts) {
  ui.raf = requestAnimationFrame(loop);
  try {
    const dt = ui.last ? Math.min(ts - ui.last, 50) : 0;
    ui.last = ts;
    updateBadge();
    const g = ui.game;
    if (!g || !ui.ctx || ui.screen !== 'game') return;
    if (!g.paused && !g.over && g.countdown <= 0) das(dt);
    g.soft = ui.input.down && !g.paused;
    g.sdf = save.settings.sdf;
    g.update(dt);
    render(ui.ctx, g);
    if (!g.paused && !g.over && RESUMABLE.has(g.mode)) {
      ui.autosave += dt;
      if (ui.autosave >= AUTOSAVE_MS) { ui.autosave = 0; storeResume(); persist(); }
    }
  } catch (err) { console.error('[RiftTris] loop', err); }
}

/* =====================================================================
   KEYBOARD
   ===================================================================== */
const GAME_KEYS = new Set(['ArrowLeft', 'ArrowRight', 'ArrowDown', 'ArrowUp', 'Space', 'KeyX', 'KeyZ', 'KeyA',
  'KeyC', 'ShiftLeft', 'ShiftRight', 'ControlLeft', 'ControlRight', 'Escape', 'KeyP', 'KeyR', 'KeyV', 'Enter']);

const seenKeys = new WeakSet();
function onKeySafe(e) {
  if (seenKeys.has(e)) return;
  seenKeys.add(e);
  safe(onKey)(e);
}

function onKey(e) {
  const down = e.type === 'keydown';
  const isT = e.code === 'KeyT' || (e.key || '').toLowerCase() === 't';
  if (down && ((e.altKey && isT) || e.code === 'F8' || e.key === 'F8')) {
    e.preventDefault(); e.stopImmediatePropagation();
    if (!e.repeat) toggle();
    return;
  }
  if (!ui.open || !ui.focused) return;

  const tag = e.target?.tagName;
  if (tag === 'INPUT' || tag === 'TEXTAREA') {
    if (down && e.code === 'Escape') { e.preventDefault(); e.target.blur(); }
    return;
  }
  const stop = () => { e.preventDefault(); e.stopImmediatePropagation(); };

  // Menus
  if (ui.screen !== 'game') {
    if (!down) return;
    if (ui.screen === 'menu') {
      if (/^Digit[1-5]$/.test(e.code)) { stop(); return startGame(MODE_ORDER[+e.code.slice(5) - 1]); }
      if (e.code === 'ArrowDown' || e.code === 'ArrowUp') {
        stop();
        const i = MODE_ORDER.indexOf(ui.sel) + (e.code === 'ArrowDown' ? 1 : -1);
        ui.sel = MODE_ORDER[(i + MODE_ORDER.length) % MODE_ORDER.length];
        ui.body.querySelectorAll('.rt-mode').forEach(r => r.classList.toggle('on', r.dataset.act === `sel:${ui.sel}`));
        return;
      }
      if (e.code === 'Enter' || e.code === 'Space') { stop(); return startGame(ui.sel); }
    }
    if (ui.screen === 'results' && (e.code === 'KeyR' || e.code === 'Enter')) { stop(); return startGame(ui.lastMode); }
    if (e.code === 'KeyV') { stop(); return cycleSkin(); }
    if (e.code === 'Escape') { stop(); return ui.screen === 'menu' ? hide() : goTab('play'); }
    return;
  }

  if (!GAME_KEYS.has(e.code)) return;
  stop();

  const g = ui.game, inp = ui.input;
  if (!g) return;

  if (!down) {
    if (e.code === 'ArrowLeft') { inp.left = false; inp.dir = inp.right ? 1 : 0; inp.das = 0; inp.arr = 0; }
    if (e.code === 'ArrowRight') { inp.right = false; inp.dir = inp.left ? -1 : 0; inp.das = 0; inp.arr = 0; }
    if (e.code === 'ArrowDown') inp.down = false;
    return;
  }

  if (e.code === 'KeyV') { if (!e.repeat) cycleSkin(); return; }
  if (e.code === 'Escape' || e.code === 'KeyP') {
    if (g.over) return;
    if (!ui.turn.classList.contains('rt-hidden')) { hideTurn(); return; }
    return g.paused ? resumeGame() : pauseGame();
  }
  if (e.code === 'KeyR') { if (!e.repeat) startGame(g.mode); return; }
  if (e.code === 'Enter' && g.paused) return resumeGame();
  if (g.paused || g.over) return;

  const active = g.countdown <= 0;
  switch (e.code) {
    case 'ArrowLeft':
      if (e.repeat) return;
      inp.left = true; inp.dir = -1; inp.das = 0; inp.arr = 0;
      if (active) g.move(-1);
      return;
    case 'ArrowRight':
      if (e.repeat) return;
      inp.right = true; inp.dir = 1; inp.das = 0; inp.arr = 0;
      if (active) g.move(1);
      return;
    case 'ArrowDown': inp.down = true; return;
  }
  if (!active || e.repeat) return;
  switch (e.code) {
    case 'Space': g.hardDrop(); break;
    case 'ArrowUp': case 'KeyX': g.rotate(1); break;
    case 'KeyZ': case 'ControlLeft': case 'ControlRight': g.rotate(-1); break;
    case 'KeyA': g.rotate(2); break;
    case 'KeyC': case 'ShiftLeft': case 'ShiftRight': g.holdPiece(); break;
  }
}

/* =====================================================================
   LIFECYCLE
   ===================================================================== */
function safe(fn) {
  return (...a) => {
    try { return fn(...a); }
    catch (err) {
      console.error('[RiftTris]', err);
      try { toast('RiftTris error', 'Something went wrong', String(err && err.message || err), 6000); } catch {}
    }
  };
}

function bindGlobal() {
  on(window, 'pointerdown', e => safe(onPointer)(e), true);
  on(window, 'pointermove', e => safe(onPointer)(e), true);
  on(window, 'pointerup', e => safe(onPointer)(e), true);
  on(window, 'pointercancel', e => safe(onPointer)(e), true);
  on(window, 'click', e => safe(onGlobalClick)(e), true);
  for (const target of [window, document]) {
    on(target, 'keydown', onKeySafe, true);
    on(target, 'keyup', onKeySafe, true);
  }
  on(window, 'blur', () => { if (ui.open) pauseGame(); });
  on(window, 'resize', () => { if (ui.root) applyGeom(); if (ui.fab && save.settings.fabPos) placeFab(save.settings.fabPos.left, save.settings.fabPos.top); });
  on(window, 'beforeunload', () => { storeResume(); persist(); });
  // the client sometimes rebuilds the page — put our elements back if they disappear
  ui.watch = setInterval(() => {
    if (!ui.fab?.isConnected || !ui.root?.isConnected || !document.getElementById('rt-style')) safe(mount)();
  }, 2000);
}

function destroy() {
  for (const [t, ev, fn, opt] of LISTENERS) t.removeEventListener(ev, fn, opt);
  LISTENERS.length = 0;
  cancelAnimationFrame(ui.raf);
  clearInterval(ui.watch);
  ui.ro?.disconnect();
  for (const id of ['rt-root', 'rt-fab', 'rt-toasts', 'rt-style']) document.getElementById(id)?.remove();
}

/* =====================================================================
   PENGU ENTRY
   ===================================================================== */
export function init(context) {
  try {
    context.socket.observe('/lol-gameflow/v1/gameflow-phase', ev => safe(onPhase)(ev.data));
    context.socket.observe('/lol-champ-select/v1/session', ev => safe(onSession)(ev.eventType === 'Delete' ? null : ev.data));
  } catch (err) {
    console.warn('[RiftTris] Could not observe the LCU:', err);
  }
}

export function load() {
  const prev = window.RiftTris;
  try { prev?.destroy?.(); } catch {}
  save = loadSave();
  bindGlobal();
  mount();
  if (prev && !prev.destroy) {
    toast('RiftTris', 'Duplicate install found', `An older copy (v${prev.version || '?'}) is also installed. Delete it from your plugins folder.`, 9000);
  }
  window.RiftTris = { version: VERSION, open: safe(show), close: safe(hide), toggle: safe(toggle), destroy, save: () => save };
  fetch('/lol-gameflow/v1/gameflow-phase').then(r => (r.ok ? r.json() : null)).then(p => p && safe(onPhase)(p)).catch(() => {});
  fetch('/lol-champ-select/v1/session').then(r => (r.ok ? r.json() : null)).then(s => s && safe(onSession)(s)).catch(() => {});
  console.log(`[RiftTris] v${VERSION} loaded. Alt+T / F8 to open, or run RiftTris.open() in the console.`);
}
