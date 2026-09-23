/**
 * @name RiftTris
 * @author Cami (github.com/Mixiruri · Discord @soriita)
 * @description Tetris inside the League client: 5 modes, 25 achievements, 5 skins and a 90-second Rapid mode built for champ select.
 * @version 1.7.0
 */

/* =====================================================================
   CONFIG
   ===================================================================== */
const SAVE_KEY = 'rifttris.v1';
const RAPID_MS = 90_000;
const LOCK_MS = 500;
const MAX_RESETS = 15;
const AUTOSAVE_MS = 5000;
const VERSION = '1.7.0';

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
  versus:  { name: 'Versus AI', tag: 'Ladder',   icon: '⚔', desc: 'Pick any bot from Iron to Challenger and beat it to earn its badge.' },
  ranked:  { name: 'Ranked Solo', tag: 'Tryhard', icon: '♜', desc: 'A fixed rank with LP, promotion series and demotions. No restarts.' },
};
const MODE_ORDER = ['rapid', 'sprint', 'classic', 'dig', 'zen', 'versus', 'ranked'];
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
  { id: 'vs_iron',        name: 'Out of Iron',       desc: 'Beat the Iron AI.' },
  { id: 'vs_bronze',      name: 'Bronze Breaker',    desc: 'Beat the Bronze AI.' },
  { id: 'vs_silver',      name: 'Silver Lining',     desc: 'Beat the Silver AI.' },
  { id: 'vs_gold',        name: 'Gold Rush',         desc: 'Beat the Gold AI.' },
  { id: 'vs_platinum',    name: 'Platinum Plated',   desc: 'Beat the Platinum AI.' },
  { id: 'vs_emerald',     name: 'Emerald City',      desc: 'Beat the Emerald AI.' },
  { id: 'vs_diamond',     name: 'Diamond Hands',     desc: 'Beat the Diamond AI.' },
  { id: 'vs_master',      name: 'Master Class',      desc: 'Beat the Master AI.' },
  { id: 'vs_grandmaster', name: 'Grandmaster Flash', desc: 'Beat the Grandmaster AI.' },
  { id: 'vs_challenger',  name: 'Apex Predator',     desc: 'Beat the Challenger AI.' },
  { id: 'vs_flawless',    name: 'Flawless Victory',  desc: 'Beat Gold or higher without taking a single garbage line.' },
  { id: 'rk_first',       name: 'Placements Done',   desc: 'Win your first Ranked Solo game.' },
  { id: 'rk_promo',       name: 'Promoted',          desc: 'Win a promotion series in Ranked Solo.' },
  { id: 'rk_clean',       name: 'Clean Sweep',       desc: 'Win a promotion series 2-0.' },
  { id: 'rk_gold',        name: 'Gold Standard',     desc: 'Reach Gold in Ranked Solo.' },
  { id: 'rk_diamond',     name: 'Shine Bright',      desc: 'Reach Diamond in Ranked Solo.' },
  { id: 'rk_challenger',  name: 'Top of the Ladder', desc: 'Reach Challenger in Ranked Solo.' },
];
// losses allowed at 0 LP before you drop a tier (Iron can't drop)
const SHIELD = [Infinity, 4, 4, 3, 3, 3, 2, 2, 1, 1];
const LP_WIN = 20, LP_LOSS = 18;

// AI ranks: pps = pieces per second, err = chance of a sloppy placement,
// hold = uses hold, tet = how hard it builds for Tetrises
const RANKS = [
  { id: 'iron',        name: 'Iron',        tag: 'I',  color: '#7a716c', pps: 0.45, err: 0.35, hold: false, tet: 0 },
  { id: 'bronze',      name: 'Bronze',      tag: 'B',  color: '#a86b45', pps: 0.65, err: 0.25, hold: false, tet: 0 },
  { id: 'silver',      name: 'Silver',      tag: 'S',  color: '#9aa8b2', pps: 0.85, err: 0.18, hold: false, tet: 0 },
  { id: 'gold',        name: 'Gold',        tag: 'G',  color: '#d9aa45', pps: 1.1,  err: 0.12, hold: true,  tet: 0.3 },
  { id: 'platinum',    name: 'Platinum',    tag: 'P',  color: '#4fb3a9', pps: 1.35, err: 0.08, hold: true,  tet: 0.5 },
  { id: 'emerald',     name: 'Emerald',     tag: 'E',  color: '#2fc774', pps: 1.6,  err: 0.05, hold: true,  tet: 0.7 },
  { id: 'diamond',     name: 'Diamond',     tag: 'D',  color: '#6b82e6', pps: 1.9,  err: 0.03, hold: true,  tet: 0.9 },
  { id: 'master',      name: 'Master',      tag: 'M',  color: '#b05cf0', pps: 2.3,  err: 0.015, hold: true, tet: 1 },
  { id: 'grandmaster', name: 'Grandmaster', tag: 'GM', color: '#e2504f', pps: 2.8,  err: 0.005, hold: true, tet: 1 },
  { id: 'challenger',  name: 'Challenger',  tag: 'C',  color: '#f4d27a', pps: 3.4,  err: 0,     hold: true, tet: 1 },
];
const rankDesc = r => r.err >= 0.2 ? 'Makes lots of mistakes' : r.err >= 0.1 ? 'Makes some mistakes' : r.err >= 0.03 ? 'Rarely misplaces' : r.err > 0 ? 'Almost perfect' : 'Perfect placement';

/* =====================================================================
   ACHIEVEMENT ICONS (24×24, drawn in currentColor)
   ===================================================================== */
const F = 'fill="currentColor" stroke="none"';
const ACH_ICONS = {
  first_blood: `<path ${F} d="M12 2.5c3.2 4.3 6 7.7 6 11A6 6 0 0 1 6 13.5c0-3.3 2.8-6.7 6-11z"/><path d="M9.2 14.2a2.9 2.9 0 0 0 2.3 2.6" stroke="rgba(0,0,0,.35)"/>`,
  tetris: `<rect ${F} x="3" y="3" width="18" height="3.4" rx=".8"/><rect ${F} x="3" y="8.2" width="18" height="3.4" rx=".8"/><rect ${F} x="3" y="13.4" width="18" height="3.4" rx=".8"/><rect ${F} x="3" y="18.6" width="18" height="3.4" rx=".8"/>`,
  pentakill: `<path d="M12 3a7 7 0 0 0-7 7c0 2.4 1.2 4.1 2.5 5.2V18a1 1 0 0 0 1 1h7a1 1 0 0 0 1-1v-2.8c1.3-1.1 2.5-2.8 2.5-5.2a7 7 0 0 0-7-7z"/><circle ${F} cx="9.2" cy="11" r="1.7"/><circle ${F} cx="14.8" cy="11" r="1.7"/><path d="M10 19v2.5M12 19v2.5M14 19v2.5"/>`,
  tspin: `<rect ${F} x="4" y="3" width="5" height="5" rx=".6"/><rect ${F} x="9.5" y="3" width="5" height="5" rx=".6"/><rect ${F} x="15" y="3" width="5" height="5" rx=".6"/><rect ${F} x="9.5" y="8.5" width="5" height="5" rx=".6"/><path d="M4.5 16.5a8.5 5 0 0 0 15 0"/><path d="M17 15.8l2.6.7.6-2.7"/>`,
  tsd: `<path ${F} d="M13.5 2L5 13.5h6.2L10 22l9-12.2h-6.3z"/>`,
  tst: `<circle cx="12" cy="12" r="7.5"/><circle cx="12" cy="12" r="3.2"/><circle ${F} cx="12" cy="12" r="1"/><path d="M12 2v3.5M12 18.5V22M2 12h3.5M18.5 12H22"/>`,
  pc: `<rect x="3.5" y="3.5" width="17" height="17" rx="2"/><path ${F} d="M12 6.5l1.3 4.2 4.2 1.3-4.2 1.3L12 17.5l-1.3-4.2L6.5 12l4.2-1.3z"/>`,
  combo5: `<path ${F} d="M12 2c1 3.6 5.5 5.6 5.5 10.5a5.5 5.5 0 0 1-11 0c0-2.4 1.1-4 2.4-5.3.2 1.8 1.1 2.9 2.3 3.3.2-3.3.1-5.6.8-8.5z"/>`,
  combo10: `<path ${F} d="M3 7.5l4.8 4.3L12 4.5l4.2 7.3L21 7.5 19 17.5H5z"/><rect ${F} x="5" y="19" width="14" height="2" rx=".6"/>`,
  b2b4: `<path d="M12 2.5v19M3.8 7.2l16.4 9.6M3.8 16.8l16.4-9.6"/><path d="M9.5 3.8L12 6.3l2.5-2.5M9.5 20.2L12 17.7l2.5 2.5M3.4 10.3l3.4.9-.9 3.4M20.6 10.3l-3.4.9.9 3.4"/>`,
  sprint2: `<circle cx="12" cy="13.5" r="7.5"/><path d="M12 13.5V9.5M10 2.5h4M12 2.5v3.5M18.6 6.9l1.6-1.6"/>`,
  sprint1: `<path d="M6.5 3.5h11L21 9l-9 11.5L3 9z"/><path d="M3 9h18M12 20.5L8.3 9l2.2-5.5M12 20.5L15.7 9l-2.2-5.5"/>`,
  sprint_nh: `<path d="M13.5 2.5L5.5 13.5h6l-1 8 8-11.3h-6z"/><path d="M3 3l18 18" stroke-width="2.2"/>`,
  rapid10: `<ellipse cx="12" cy="5.5" rx="6.5" ry="2.5"/><path d="M5.5 5.5v4.3c0 1.4 2.9 2.5 6.5 2.5s6.5-1.1 6.5-2.5V5.5M5.5 9.8v4.4c0 1.4 2.9 2.5 6.5 2.5s6.5-1.1 6.5-2.5V9.8M5.5 14.2v4.3c0 1.4 2.9 2.5 6.5 2.5s6.5-1.1 6.5-2.5v-4.3"/>`,
  rapid30: `<path ${F} d="M18.6 2.6l2.8 2.8-9.9 9.9-2.8-2.8z"/><path d="M7.2 11.8l5 5M9.6 14.4l-5 5"/><circle ${F} cx="3.8" cy="20.2" r="1.4"/>`,
  champ: `<path d="M6.5 2.5h11M6.5 21.5h11M8 2.5c0 4.2 4 5.6 4 9.5s-4 5.3-4 9.5M16 2.5c0 4.2-4 5.6-4 9.5s4 5.3 4 9.5"/><path ${F} d="M9.3 20.2h5.4L12 16.8z"/>`,
  lvl10: `<path d="M7.5 21.5V10.5L5.5 8.5v-5h3v2h2v-2h3v2h2v-2h3v5l-2 2v11z"/><path d="M10.5 21.5v-4a1.5 1.5 0 0 1 3 0v4"/>`,
  lvl15: `<path ${F} d="M20.5 14.8A8.5 8.5 0 1 1 9.2 3.5a6.8 6.8 0 0 0 11.3 11.3z"/><circle ${F} cx="17.5" cy="4.5" r=".9"/><circle ${F} cx="20.5" cy="8" r=".7"/>`,
  dig: `<path d="M3.5 9C7.5 4.5 16.5 4.5 20.5 9" stroke-width="2.4"/><path d="M12 6v15.5" stroke-width="2.2"/>`,
  dig45: `<path d="M20.5 3.5l-6.8 6.8M18.5 2l3.5 3.5"/><path d="M13.8 8.7l1.5 1.5c.6.6.6 1.5 0 2.1l-6 6c-1.6 1.6-4.3 1.6-5.3.6s-1-3.7.6-5.3l6-6c.6-.6 1.5-.6 2.1 0z"/>`,
  zen100: `<path d="M12 20.5c-4.5 0-8.5-2.2-9.5-6.5 3.2-.6 6.5.6 9.5 3.4 3-2.8 6.3-4 9.5-3.4-1 4.3-5 6.5-9.5 6.5z"/><path d="M12 17.4c-2.4-2.8-2.4-7.3 0-11.4 2.4 4.1 2.4 8.6 0 11.4z"/>`,
  lines1k: `<path d="M8 2.5l3 6.5M16 2.5l-3 6.5"/><circle cx="12" cy="15.5" r="6"/><path ${F} d="M12 12l1 2.2 2.4.3-1.8 1.6.5 2.4-2.1-1.2-2.1 1.2.5-2.4-1.8-1.6 2.4-.3z"/>`,
  games25: `<path d="M7 8h10a4 4 0 0 1 4 4.6l-.7 3.8a2.3 2.3 0 0 1-4 1.1L15 16H9l-1.3 1.5a2.3 2.3 0 0 1-4-1.1L3 12.6A4 4 0 0 1 7 8z"/><path d="M7.5 10.8v3.4M5.8 12.5h3.4"/><circle ${F} cx="15.5" cy="11.3" r="1"/><circle ${F} cx="17.6" cy="13.4" r="1"/>`,
  all_modes: `<rect ${F} x="3.5" y="3.5" width="7.5" height="7.5" rx="1"/><rect x="13" y="3.5" width="7.5" height="7.5" rx="1"/><rect x="3.5" y="13" width="7.5" height="7.5" rx="1"/><rect ${F} x="13" y="13" width="7.5" height="7.5" rx="1"/>`,
  skins: `<path d="M12 2.8a9.2 9.2 0 1 0 0 18.4c1.3 0 2.1-.8 2.1-1.9 0-1.3-1-1.7-1-2.8 0-1 .8-1.6 1.9-1.6h2.3a4.3 4.3 0 0 0 4.3-4.3c0-4.4-4.3-7.8-9.6-7.8z"/><circle ${F} cx="7.3" cy="11.5" r="1.4"/><circle ${F} cx="9.8" cy="7.2" r="1.4"/><circle ${F} cx="14.8" cy="7.2" r="1.4"/>`,
};
const shieldIcon = (tag, inner = '') => `<path d="M12 2.5l7.5 2.8v6.2c0 4.6-3.1 8.3-7.5 10-4.4-1.7-7.5-5.4-7.5-10V5.3z"/>${inner ||
  `<text x="12" y="${tag.length > 1 ? 14.6 : 15.2}" text-anchor="middle" font-family="Arial, sans-serif" font-weight="700" font-size="${tag.length > 1 ? 6.5 : 8.5}" fill="currentColor" stroke="none">${tag}</text>`}`;
ACH_ICONS.vs_iron = shieldIcon('I'); ACH_ICONS.vs_bronze = shieldIcon('B'); ACH_ICONS.vs_silver = shieldIcon('S');
ACH_ICONS.vs_gold = shieldIcon('G'); ACH_ICONS.vs_platinum = shieldIcon('P'); ACH_ICONS.vs_emerald = shieldIcon('E');
ACH_ICONS.vs_diamond = shieldIcon('D'); ACH_ICONS.vs_master = shieldIcon('M'); ACH_ICONS.vs_grandmaster = shieldIcon('GM');
ACH_ICONS.vs_challenger = shieldIcon('C', `<path fill="currentColor" stroke="none" d="M7.5 9.5l2.4 2 2.1-3.6 2.1 3.6 2.4-2-1 5.5H8.5z"/>`);
ACH_ICONS.vs_flawless = shieldIcon('', `<path d="M8.3 11.8l2.6 2.6 4.8-5"/>`);
const chev = (y) => `<path d="M8.5 ${y}l3.5-3 3.5 3"/>`;
ACH_ICONS.rk_first = shieldIcon('', `<text x="12" y="15.2" text-anchor="middle" font-family="Arial, sans-serif" font-weight="700" font-size="8.5" fill="currentColor" stroke="none">1</text>`);
ACH_ICONS.rk_promo = shieldIcon('', chev(12.5));
ACH_ICONS.rk_clean = shieldIcon('', chev(10.5) + chev(14.5));
ACH_ICONS.rk_gold = shieldIcon('', `<text x="12" y="13.6" text-anchor="middle" font-family="Arial, sans-serif" font-weight="700" font-size="7" fill="currentColor" stroke="none">G</text>${chev(18)}`);
ACH_ICONS.rk_diamond = shieldIcon('', `<path d="M9 10.5l1.5-2h3l1.5 2-3 4z"/>${chev(18)}`);
ACH_ICONS.rk_challenger = shieldIcon('', `<path fill="currentColor" stroke="none" d="M7.8 8.5l2.3 1.9 1.9-3.3 1.9 3.3 2.3-1.9-.9 4.8H8.7z"/>${chev(18)}`);
// full-color emblem for the ladder screen
const rankEmblem = (r, size = 34) => `<svg viewBox="0 0 24 24" width="${size}" height="${size}"><defs><linearGradient id="rg-${r.id}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${r.color}"/><stop offset="1" stop-color="${r.color}" stop-opacity=".55"/></linearGradient></defs>
  <path d="M12 2l8 3v6.5c0 4.9-3.3 8.8-8 10.5-4.7-1.7-8-5.6-8-10.5V5z" fill="url(#rg-${r.id})" stroke="rgba(0,0,0,.45)" stroke-width="1"/>
  <path d="M12 4.2l6 2.3v5c0 3.8-2.5 6.9-6 8.3-3.5-1.4-6-4.5-6-8.3v-5z" fill="none" stroke="rgba(255,255,255,.35)" stroke-width=".8"/>
  <text x="12" y="${r.tag.length > 1 ? 14.4 : 15.3}" text-anchor="middle" font-family="Arial, sans-serif" font-weight="800" font-size="${r.tag.length > 1 ? 6.5 : 8.5}" fill="#10141c" fill-opacity=".85">${r.tag}</text></svg>`;
const achIcon = id => `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">${ACH_ICONS[id] || ''}</svg>`;

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
  settings: { das: 133, arr: 33, sdf: 25, ghost: true, champPill: true, autoPause: true, fabPos: null, skin: 'hextech', sfx: true, sfxVol: 50, music: true, musicVol: 35, muted: false, musicLoop: null },
  best: {}, played: {}, ach: {}, skinsUsed: {}, resume: null, history: [],
  versus: { beaten: {}, rec: {} },
  ranked: { tier: 0, lp: 0, series: null, zeroL: 0, tw: 0, tl: 0, w: 0, l: 0, peak: 0 },
  profile: { name: 'Summoner', char: 'cat', color: null, hat: 'none', face: 'none' },
  totals: { games: 0, lines: 0, tetrises: 0, tspins: 0, playMs: 0, pieces: 0 },
};
const clone = o => JSON.parse(JSON.stringify(o));

function mergeSave(raw) {
  const s = clone(DEFAULT_SAVE);
  if (raw && typeof raw === 'object') {
    for (const k of ['settings', 'best', 'played', 'ach', 'skinsUsed', 'totals', 'versus', 'ranked', 'profile']) Object.assign(s[k], raw[k] || {});
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
   SOUND — synthesized with Web Audio, no files needed
   ===================================================================== */
const SKIN_WAVE = { hextech: 'triangle', retro: 'square', cube: 'triangle', neon: 'sawtooth', pastel: 'sine' };
const semi = (f, k) => f * Math.pow(2, k / 12);

const Sfx = {
  ctx: null, bus: null, filter: null, noiseBuf: null, lastMove: 0,

  ready() {
    if (save.settings.muted || !save.settings.sfx || save.settings.sfxVol <= 0) return false;
    return this.ensure();
  },

  ensure() {
    try {
      if (!this.ctx) {
        const AC = window.AudioContext || window.webkitAudioContext;
        if (!AC) return false;
        this.ctx = new AC();
        this.filter = this.ctx.createBiquadFilter();
        this.filter.type = 'lowpass';
        this.bus = this.ctx.createGain();
        this.bus.connect(this.filter);
        this.filter.connect(this.ctx.destination);
        const len = this.ctx.sampleRate * 0.5;
        this.noiseBuf = this.ctx.createBuffer(1, len, this.ctx.sampleRate);
        const d = this.noiseBuf.getChannelData(0);
        for (let i = 0; i < len; i++) d[i] = Math.random() * 2 - 1;
      }
      if (this.ctx.state === 'suspended') this.ctx.resume();
      this.bus.gain.value = (save.settings.sfxVol / 100) * 0.7;
      this.filter.frequency.value = save.settings.skin === 'neon' ? 2400 : save.settings.skin === 'pastel' ? 3000 : 6000;
      return true;
    } catch { return false; }
  },

  tone(f, t0, dur, o = {}) {
    const c = this.ctx, osc = c.createOscillator(), g = c.createGain();
    osc.type = o.type || SKIN_WAVE[save.settings.skin] || 'triangle';
    osc.frequency.setValueAtTime(f, t0);
    if (o.to) osc.frequency.exponentialRampToValueAtTime(o.to, t0 + dur);
    const v = o.vol ?? 0.15;
    g.gain.setValueAtTime(0.0001, t0);
    g.gain.exponentialRampToValueAtTime(v, t0 + 0.006);
    g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
    osc.connect(g); g.connect(this.bus);
    osc.start(t0); osc.stop(t0 + dur + 0.03);
  },

  noise(t0, dur, o = {}) {
    const c = this.ctx, src = c.createBufferSource(), f = c.createBiquadFilter(), g = c.createGain();
    src.buffer = this.noiseBuf;
    f.type = o.high ? 'highpass' : 'lowpass';
    f.frequency.value = o.freq || 800;
    g.gain.setValueAtTime(o.vol ?? 0.2, t0);
    g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
    src.connect(f); f.connect(g); g.connect(this.bus);
    src.start(t0); src.stop(t0 + dur + 0.02);
  },

  arp(notes, t0, step, dur, o) { notes.forEach((f, i) => this.tone(f, t0 + i * step, dur, o)); },

  play(name, d = {}) {
    if (!this.ready()) return;
    const t = this.ctx.currentTime + 0.005;
    switch (name) {
      case 'move': {
        const now = performance.now();
        if (now - this.lastMove < 30) return;
        this.lastMove = now;
        return this.tone(440, t, 0.035, { vol: 0.05 });
      }
      case 'rotate': return this.tone(620, t, 0.05, { to: 720, vol: 0.06 });
      case 'hold': this.tone(392, t, 0.06, { vol: 0.07 }); return this.tone(587, t + 0.05, 0.08, { vol: 0.07 });
      case 'land': {
        if (d.hard) { this.noise(t, 0.06, { vol: 0.16, freq: 700 }); this.tone(150, t, 0.09, { to: 60, vol: 0.12, type: 'sine' }); }
        if (!d.n) {
          if (!d.hard) this.tone(170, t, 0.045, { vol: 0.06 });
          if (d.tspin) this.tone(392, t, 0.12, { to: 784, vol: 0.07 });
          return;
        }
        const b = semi(523.25, Math.min(Math.max(d.combo, 0), 12));
        const t1 = t + (d.hard ? 0.03 : 0);
        const chord = [b, semi(b, 4), semi(b, 7), b * 2];
        if (d.pc) { this.arp([b, semi(b, 4), semi(b, 7), b * 2, semi(b * 2, 4), semi(b * 2, 7), b * 4], t1, 0.06, 0.28, { vol: 0.11 }); return; }
        if (d.tspin) {
          this.tone(semi(b, -5), t1, 0.2, { to: b * 1.5, vol: 0.08, type: 'sine' });
          this.arp(chord.slice(0, d.n + 1), t1 + 0.05, 0.055, 0.16, { vol: 0.1 });
        } else {
          this.arp(chord.slice(0, d.n), t1, 0.055, d.n === 4 ? 0.22 : 0.14, { vol: 0.1 });
          if (d.n === 4) { this.tone(b * 4, t1 + 0.22, 0.35, { vol: 0.04, type: 'sine' }); this.noise(t1 + 0.18, 0.2, { vol: 0.05, freq: 5000, high: true }); }
        }
        if (d.b2b > 0) this.tone(semi(b * 2, 4), t1 + 0.28, 0.2, { vol: 0.07, type: 'sine' });
        return;
      }
      case 'level': return this.arp([659, 784, 988, 1319], t, 0.07, 0.14, { vol: 0.1 });
      case 'count': return this.tone(440, t, 0.1, { vol: 0.09 });
      case 'go': return this.tone(880, t, 0.2, { vol: 0.1 });
      case 'tick': return this.tone(1200, t, 0.05, { vol: 0.07, type: 'square' });
      case 'topout': return this.arp([392, 330, 262, 196], t, 0.13, 0.25, { vol: 0.1 });
      case 'zenreset': return this.arp([523, 392], t, 0.09, 0.16, { vol: 0.08 });
      case 'win': return this.arp([523, 659, 784, 1047, 1319], t, 0.075, 0.24, { vol: 0.1 });
      case 'ach': this.tone(988, t, 0.4, { type: 'sine', vol: 0.12 }); return this.tone(1319, t + 0.09, 0.5, { type: 'sine', vol: 0.1 });
      case 'pause': return this.tone(330, t, 0.07, { vol: 0.06 });
      case 'resume': return this.tone(494, t, 0.07, { vol: 0.06 });
      case 'ui': return this.tone(760, t, 0.03, { vol: 0.03 });
      case 'test': return this.arp([523, 659, 784], t, 0.06, 0.12, { vol: 0.1 });
      case 'send': this.tone(300, t, 0.18, { to: 1200, vol: 0.06, type: 'sawtooth' }); return this.noise(t, 0.15, { vol: 0.05, freq: 3000, high: true });
      case 'garbage': this.noise(t, 0.18, { vol: 0.14, freq: 400 }); return this.tone(90, t, 0.22, { to: 55, vol: 0.14, type: 'sine' });
      case 'warn': return this.arp([880, 660], t, 0.08, 0.08, { vol: 0.06, type: 'square' });
      case 'ko': this.noise(t, 0.3, { vol: 0.12, freq: 900 }); return this.arp([784, 988, 1175, 1568], t + 0.05, 0.06, 0.25, { vol: 0.1 });
    }
  },
};

/* =====================================================================
   MUSIC — plays music.mp3 from the plugin folder if present,
   otherwise a built-in chiptune of Korobeiniki (public-domain folk tune)
   ===================================================================== */
const MUSIC_URL = (() => { try { return new URL('./music.mp3', import.meta.url).href; } catch { return null; } })();
const NOTE_SEMI = { C: 0, 'C#': 1, D: 2, 'D#': 3, E: 4, F: 5, 'F#': 6, G: 7, 'G#': 8, A: 9, 'A#': 10, B: 11 };
const midiOf = n => { const m = /^([A-G]#?)(\d)$/.exec(n); return (+m[2] + 1) * 12 + NOTE_SEMI[m[1]]; };
const freqOf = m => 440 * Math.pow(2, (m - 69) / 12);

const MELODY_A = [
  ['E5', 1], ['B4', .5], ['C5', .5], ['D5', 1], ['C5', .5], ['B4', .5],
  ['A4', 1], ['A4', .5], ['C5', .5], ['E5', 1], ['D5', .5], ['C5', .5],
  ['B4', 1.5], ['C5', .5], ['D5', 1], ['E5', 1],
  ['C5', 1], ['A4', 1], ['A4', 1], [null, 1],
  [null, .5], ['D5', 1], ['F5', .5], ['A5', 1], ['G5', .5], ['F5', .5],
  ['E5', 1.5], ['C5', .5], ['E5', 1], ['D5', .5], ['C5', .5],
  ['B4', 1], ['B4', .5], ['C5', .5], ['D5', 1], ['E5', 1],
  ['C5', 1], ['A4', 1], ['A4', 1], [null, 1],
];
const MELODY_B = [
  ['E5', 2], ['C5', 2], ['D5', 2], ['B4', 2], ['C5', 2], ['A4', 2], ['G#4', 2], ['B4', 2],
  ['E5', 2], ['C5', 2], ['D5', 2], ['B4', 2], ['C5', 1], ['E5', 1], ['A5', 2], ['G#5', 4],
];
const BASS_A = ['E2', 'A2', 'G#2', 'A2', 'D2', 'C2', 'G#2', 'A2'];
const BASS_B = ['A2', 'E2', 'A2', 'E2', 'A2', 'E2', 'A2', 'E2'];

const SONG = (() => {
  const ev = [];
  let beat = 0;
  const lead = mel => { for (const [n, b] of mel) { if (n) ev.push({ beat, midi: midiOf(n), len: b, lead: true }); beat += b; } };
  const bass = (roots, start) => roots.forEach((r, bar) => {
    const m = midiOf(r);
    for (let i = 0; i < 8; i++) ev.push({ beat: start + bar * 4 + i * 0.5, midi: m + (i % 2 ? 12 : 0), len: 0.45, lead: false });
  });
  for (const part of ['A', 'A', 'B']) {
    const start = beat;
    if (part === 'A') { bass(BASS_A, start); lead(MELODY_A); }
    else { bass(BASS_B, start); lead(MELODY_B); }
  }
  ev.sort((a, b) => a.beat - b.beat);
  return { events: ev, length: beat, bpm: 150 };
})();

/* ---------- seamless loop finder for music.mp3 ---------- */
async function findLoop(buf) {
  const sr = buf.sampleRate, n = buf.length;
  const L = buf.getChannelData(0), R = buf.numberOfChannels > 1 ? buf.getChannelData(1) : L;
  // trim silence
  const th = 0.01;
  let a = 0; while (a < n && Math.abs(L[a]) < th && Math.abs(R[a]) < th) a++;
  let b = n - 1; while (b > a && Math.abs(L[b]) < th && Math.abs(R[b]) < th) b--;
  const start = a / sr, end = (b + 1) / sr;
  const res = { start, end, loopStart: start, loopEnd: end, match: 0 };
  if (end - start < 12) return res;

  const zncc = (x, i0, j0, w, step) => {
    let sx = 0, sy = 0, sxx = 0, syy = 0, sxy = 0, c = 0;
    for (let k = 0; k < w; k += step) { const u = x[i0 + k], v = x[j0 + k]; sx += u; sy += v; sxx += u * u; syy += v * v; sxy += u * v; c++; }
    const cov = sxy - sx * sy / c, vx = sxx - sx * sx / c, vy = syy - sy * sy / c;
    return vx > 0 && vy > 0 ? cov / Math.sqrt(vx * vy) : 0;
  };
  // coarse pass: loudness envelope in 5 ms blocks (finds where the same phrase comes back)
  const B = Math.max(1, Math.round(sr / 200)), ne = Math.floor(n / B), env = new Float32Array(ne);
  for (let k = 0; k < ne; k++) { let acc = 0; for (let j = k * B, e = j + B; j < e; j++) acc += Math.abs(L[j]) + Math.abs(R[j]); env[k] = acc / (2 * B); }
  const esr = sr / B, ref = Math.floor((start + 0.05) * esr), W = Math.floor(3 * esr);
  const lo = Math.max(ref + W, Math.floor((end - 45) * esr)), hi = Math.floor((end - 3.2) * esr);
  const sc = [];
  let best = -1;
  for (let i = lo; i < hi; i++) { const r = zncc(env, ref, i, W, 1); sc.push(r); if (r > best) best = r; }
  if (best < 0.35) return res;
  const cands = [];
  for (let k = 1; k < sc.length - 1; k++)
    if (sc[k] >= best * 0.9 && sc[k] >= sc[k - 1] && sc[k] >= sc[k + 1]) cands.push(lo + k);
  cands.sort((x, y) => y - x);   // latest first → longest loop
  await new Promise(r2 => setTimeout(r2, 0));
  // fine pass at full rate around each candidate
  const mono = new Float32Array(n);
  for (let i = 0; i < n; i++) mono[i] = (L[i] + R[i]) * 0.5;
  const refF = Math.floor((start + 0.05) * sr), WF = Math.floor(1 * sr);
  let fb = -1, fi = -1;
  for (const c of cands.slice(0, 4)) {
    const c0 = Math.round(c * B);
    let cb = -1, ci = c0;
    for (let i = c0 - 1400; i <= c0 + 1400; i++) {
      if (i < 0 || i + WF >= n) continue;
      const r = zncc(mono, refF, i, WF, 2);
      if (r > cb) { cb = r; ci = i; }
    }
    if (cb > fb) { fb = cb; fi = ci; }
    if (cb >= 0.6) { fb = cb; fi = ci; break; }
    await new Promise(r2 => setTimeout(r2, 0));
  }
  if (fb < 0.45) return res;
  res.loopStart = refF / sr; res.loopEnd = fi / sr; res.match = fb;
  return res;
}

const Music = {
  missing: !MUSIC_URL, playing: false, fresh: true, rate: 1,
  buf: null, loading: null, info: null, out: null, segs: [], timer: 0, seg: null, pos: 0,
  syn: { timer: 0, anchorT: 0, anchorBeat: 0, pausedBeat: 0, idx: 0, loop: 0, out: null },

  vol() { const st = save.settings; return st.muted || !st.music ? 0 : st.musicVol / 100; },

  load() {
    if (this.loading || this.missing) return this.loading;
    if (!Sfx.ensure()) return null;
    this.loading = (async () => {
      try {
        const r = await fetch(MUSIC_URL);
        if (!r.ok) throw new Error('no music.mp3');
        const data = await r.arrayBuffer();
        this.buf = await new Promise((ok, bad) => Sfx.ctx.decodeAudioData(data, ok, bad));
        const key = `${this.buf.length}:${this.buf.sampleRate}`;
        const cached = save.settings.musicLoop;
        if (cached && cached.key === key) this.info = cached;
        else { this.info = { ...(await findLoop(this.buf)), key }; save.settings.musicLoop = this.info; persist(); }
      } catch (err) {
        this.missing = true; this.buf = null;
      }
      if (this.playing) { this.playing = false; this.start(); }
    })();
    return this.loading;
  },

  start() {
    if (this.vol() <= 0) return;
    const fromStart = this.fresh;
    this.playing = true;
    if (this.missing) { this.fresh = false; return this.synthStart(fromStart); }
    if (!this.buf) { this.load(); return; }   // starts itself once decoded
    this.fresh = false;
    if (!Sfx.ensure()) return;
    const ctx = Sfx.ctx;
    this.killSegs(0.05);
    this.out = ctx.createGain();
    this.out.gain.value = this.vol() * 0.8;
    this.out.connect(ctx.destination);
    const i = this.info;
    let off = fromStart ? i.start : this.pos;
    if (off < i.start || off >= i.loopEnd - 0.05) off = i.start;
    this.segment(ctx.currentTime + 0.03, off, fromStart ? 1.2 : 0.35);
  },

  // plays from `off` to the loop end, then hands over to the next segment with a crossfade
  segment(t, off, fadeIn) {
    const ctx = Sfx.ctx, i = this.info;
    const matched = i.match > 0;
    const XF = matched ? 0.06 : 1.8;
    const src = ctx.createBufferSource(), g = ctx.createGain();
    src.buffer = this.buf;
    src.connect(g); g.connect(this.out);
    const endT = t + (i.loopEnd - off);
    g.gain.setValueAtTime(0, t);
    g.gain.linearRampToValueAtTime(1, t + Math.max(0.01, fadeIn));
    g.gain.setValueAtTime(1, Math.max(t + fadeIn, endT - XF));
    g.gain.linearRampToValueAtTime(0, endT);
    src.start(t, off);
    src.stop(endT + 0.05);
    const seg = { src, g, t, off };
    this.segs.push(seg);
    this.seg = seg;
    src.onended = () => { this.segs = this.segs.filter(x => x !== seg); };
    const nextT = endT - XF, nextOff = matched ? i.loopStart - XF : i.start;
    clearTimeout(this.timer);
    this.timer = setTimeout(() => { if (this.playing && this.out) this.segment(nextT, nextOff, XF); },
      Math.max(0, (nextT - ctx.currentTime - 0.5) * 1000));
  },

  killSegs(fade) {
    const ctx = Sfx.ctx;
    clearTimeout(this.timer); this.timer = 0;
    if (ctx && this.seg) {
      const p = this.seg.off + (ctx.currentTime - this.seg.t);
      if (p >= this.seg.off) this.pos = p;
    }
    for (const sg of this.segs) {
      try {
        sg.g.gain.cancelScheduledValues(ctx.currentTime);
        sg.g.gain.setValueAtTime(sg.g.gain.value, ctx.currentTime);
        sg.g.gain.linearRampToValueAtTime(0, ctx.currentTime + fade);
        sg.src.stop(ctx.currentTime + fade + 0.02);
      } catch {}
    }
    this.segs = []; this.seg = null;
    const o = this.out; this.out = null;
    if (o) setTimeout(() => { try { o.disconnect(); } catch {} }, (fade + 0.1) * 1000);
  },

  pause(fade = 0.18) {
    this.playing = false;
    this.killSegs(fade);
    this.synthStop();
  },

  stop() { this.pause(0.6); this.fresh = true; this.pos = 0; },

  setRate(r) {
    if (Math.abs(r - this.rate) < 0.001) return;
    const sy = this.syn, ctx = Sfx.ctx;
    if (sy.timer && ctx) { sy.anchorBeat = this.curBeat(); sy.anchorT = ctx.currentTime; }
    this.rate = r;   // only the built-in chiptune speeds up; the mp3 keeps its pitch
  },

  refresh() {
    const v = this.vol();
    if (v <= 0) { if (this.playing) this.pause(); return; }
    if (this.out) this.out.gain.value = v * 0.8;
    if (this.syn.out) this.syn.out.gain.value = v * 0.35;
  },

  spb() { return 60 / (SONG.bpm * this.rate); },
  curBeat() { const sy = this.syn; return sy.anchorBeat + (Sfx.ctx.currentTime - sy.anchorT) / this.spb(); },

  synthStart(fromStart) {
    if (!Sfx.ensure()) return;
    const ctx = Sfx.ctx, sy = this.syn;
    this.synthStop();
    if (fromStart) sy.pausedBeat = 0;
    const out = ctx.createGain();
    const lp = ctx.createBiquadFilter();
    lp.type = 'lowpass'; lp.frequency.value = save.settings.skin === 'neon' ? 2600 : 3800;
    out.gain.value = this.vol() * 0.35;
    out.connect(lp); lp.connect(ctx.destination);
    sy.out = out;
    const L = SONG.length;
    sy.loop = Math.floor(sy.pausedBeat / L);
    const within = sy.pausedBeat - sy.loop * L;
    sy.idx = SONG.events.findIndex(e => e.beat >= within - 1e-6);
    if (sy.idx < 0) { sy.idx = 0; sy.loop++; }
    sy.anchorBeat = sy.pausedBeat;
    sy.anchorT = ctx.currentTime + 0.06;
    sy.timer = setInterval(() => this.tick(), 40);
    this.tick();
  },

  synthStop() {
    const sy = this.syn, ctx = Sfx.ctx;
    if (!sy.timer) return;
    clearInterval(sy.timer); sy.timer = 0;
    if (ctx) sy.pausedBeat = Math.max(0, this.curBeat());
    if (sy.out && ctx) {
      const o = sy.out;
      o.gain.setTargetAtTime(0, ctx.currentTime, 0.02);
      setTimeout(() => { try { o.disconnect(); } catch {} }, 200);
    }
    sy.out = null;
  },

  tick() {
    const sy = this.syn, ctx = Sfx.ctx;
    if (!sy.timer || !ctx || !sy.out) return;
    const now = ctx.currentTime, ahead = now + 0.3, spb = this.spb(), L = SONG.length;
    const wave = SKIN_WAVE[save.settings.skin] || 'triangle';
    for (let guard = 0; guard < 64; guard++) {
      const e = SONG.events[sy.idx];
      const t = sy.anchorT + (e.beat + sy.loop * L - sy.anchorBeat) * spb;
      if (t > ahead) break;
      if (t >= now - 0.02) this.voice(e, Math.max(t, now), e.len * spb, wave);
      if (++sy.idx >= SONG.events.length) { sy.idx = 0; sy.loop++; }
    }
  },

  voice(e, t, dur, wave) {
    const ctx = Sfx.ctx, osc = ctx.createOscillator(), g = ctx.createGain();
    osc.type = e.lead ? wave : (wave === 'square' ? 'square' : 'triangle');
    osc.frequency.value = freqOf(e.midi);
    const v = e.lead ? (wave === 'sine' ? 0.5 : wave === 'triangle' ? 0.42 : 0.2) : (wave === 'square' ? 0.12 : 0.3);
    const d = Math.max(0.05, dur * 0.92);
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(v, t + 0.01);
    g.gain.setValueAtTime(v, t + d * 0.6);
    g.gain.exponentialRampToValueAtTime(0.0001, t + d);
    osc.connect(g); g.connect(this.syn.out);
    osc.start(t); osc.stop(t + d + 0.02);
  },
};

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

  fx(name, d) { try { this.hooks.sfx?.(name, d); } catch {} }

  reset() {
    this.board = Array.from({ length: ROWS }, () => Array(COLS).fill(0));
    this.bag = []; this.queue = [];
    while (this.queue.length < 6) this.queue.push(this.drawBag());
    this.hold = null; this.canHold = true;
    this.score = 0; this.lines = 0; this.level = 1;
    this.combo = -1; this.b2b = -1;
    this.stats = { pieces: 0, tetrises: 0, tspins: 0, holds: 0, maxCombo: 0, pcs: 0 };
    this.elapsed = 0; this.countdown = 1500; this.lastCount = 0; this.lastTick = 0; this.hardFlag = false;
    this.incoming = []; this.sent = 0; this.received = 0;
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
    g.countdown = 1500; g.lastCount = 0;
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

  receive(n) {
    if (n <= 0 || this.over) return;
    this.incoming.push({ n, hole: (Math.random() * COLS) | 0 });
  }
  pending() { return this.incoming.reduce((a, c) => a + c.n, 0); }

  // pushes k garbage rows from the bottom; returns true if blocks got pushed off the top
  pushGarbage(k, hole) {
    let overflow = false;
    for (let i = 0; i < k; i++) {
      if (this.board[0].some(Boolean)) overflow = true;
      this.board.shift();
      const row = Array(COLS).fill('G'); row[hole] = 0;
      this.board.push(row);
    }
    return overflow;
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
      this.fx('zenreset');
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
    this.fx('move');
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
        this.fx('rotate');
        return true;
      }
    }
    return false;
  }

  hardDrop() {
    if (!this.piece || this.over) return;
    let n = 0; while (this.fall()) n++;
    this.score += n * 2;
    this.hardFlag = true;
    this.lock();
  }

  holdPiece() {
    if (!this.canHold || !this.piece || this.over) return;
    const cur = this.piece.t;
    this.canHold = false; this.stats.holds++;
    this.fx('hold');
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
      if (nl > this.level) { this.level = nl; this.popup(`LEVEL ${nl}`, S.label); this.fx('level'); }
    }

    this.fx('land', { n, tspin, mini, pc, hard: this.hardFlag, combo: this.combo, b2b: this.b2b });
    this.hardFlag = false;
    this.hooks.onClear?.(this, { n, tspin, mini, pc });

    if (this.mode === 'versus') {
      if (n > 0) {
        let atk = tspin ? (mini ? [0, 0, 1][n] || 0 : [0, 2, 4, 6][n]) : [0, 0, 1, 2, 4][n];
        if (difficult && this.b2b > 0) atk += 1;
        atk += COMBO_ATK[Math.min(this.combo, COMBO_ATK.length - 1)];
        if (pc) atk += 10;
        while (atk > 0 && this.incoming.length) {
          const c = this.incoming[0], k = Math.min(atk, c.n);
          c.n -= k; atk -= k;
          if (!c.n) this.incoming.shift();
        }
        if (atk > 0) {
          this.sent += atk;
          this.popup(`+${atk} SENT`, S.warn);
          this.fx('send', { n: atk });
          this.hooks.onAttack?.(this, atk);
        }
      } else if (this.incoming.length) {
        let cap = 8, took = 0, overflow = false;
        while (cap > 0 && this.incoming.length) {
          const c = this.incoming[0], k = Math.min(cap, c.n);
          if (this.pushGarbage(k, c.hole)) overflow = true;
          c.n -= k; cap -= k; took += k;
          if (!c.n) this.incoming.shift();
        }
        this.received += took;
        this.fx('garbage', { n: took });
        if (overflow) return this.finish(false);
      }
    }

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
    if (this.countdown > 0) {
      const c = Math.ceil(this.countdown / 500);
      if (c !== this.lastCount) { this.lastCount = c; this.fx('count'); }
      this.countdown -= dt;
      if (this.countdown <= 0) this.fx('go');
      return;
    }
    this.elapsed += dt;

    if (this.mode === 'versus') {
      const nl = Math.min(1 + Math.floor(this.elapsed / 30000), 10);
      if (nl > this.level) { this.level = nl; this.popup('SPEED UP!', sk().colors.L); this.fx('level'); }
    }
    if (this.mode === 'rapid') {
      const nl = Math.min(1 + Math.floor(this.elapsed / 10000), 10);
      if (nl > this.level) { this.level = nl; this.popup('SPEED UP!', sk().colors.L); this.fx('level'); }
      const left = Math.ceil((RAPID_MS - this.elapsed) / 1000);
      if (left <= 5 && left > 0 && left !== this.lastTick) { this.lastTick = left; this.fx('tick'); }
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
    this.fx(won ? 'win' : 'topout');
    this.hooks.onFinish?.(this);
  }
}

const COMBO_ATK = [0, 0, 1, 1, 2, 2, 3, 3, 4, 4, 4, 5];

/* =====================================================================
   AI OPPONENT — El-Tetris style board evaluation + rank-based speed and mistakes
   ===================================================================== */
let TET_W = 1, TET_H = 8;
function evalBoard(b, placed, n, tet) {
  let rowT = 0, colT = 0, holes = 0, wells = 0, well9 = 0;
  const heights = new Array(COLS).fill(0);
  for (let y = 0; y < ROWS; y++) {
    let prev = true;
    for (let x = 0; x < COLS; x++) {
      const f = !!b[y][x];
      if (f !== prev) rowT++;
      prev = f;
      if (f && !heights[x]) heights[x] = ROWS - y;
    }
    if (!prev) rowT++;
  }
  for (let x = 0; x < COLS; x++) {
    let prev = false, seen = false;
    for (let y = 0; y < ROWS; y++) {
      const f = !!b[y][x];
      if (f !== prev) colT++;
      prev = f;
      if (f) seen = true; else if (seen) holes++;
    }
    if (!prev) colT++;
    let depth = 0;
    for (let y = 0; y < ROWS; y++) {
      const f = !!b[y][x];
      const l = x === 0 || !!b[y][x - 1], r = x === COLS - 1 || !!b[y][x + 1];
      if (!f && l && r) { depth++; wells += depth; if (x === COLS - 1) well9 += depth; }
      else if (f) depth = 0;
    }
  }
  const maxH = Math.max(...heights);
  const landing = ROWS - placed.reduce((a, c) => a + c[1], 0) / placed.length;
  let score = -4.5 * landing + 3.42 * n - 3.22 * rowT - 9.35 * colT - 7.9 * holes - 3.39 * wells;
  if (tet > 0 && maxH < TET_H) {
    // build for Tetrises: keep the right column open as a well and hold out for 4-line clears
    let wellRows = 0;
    for (let y = 0; y < ROWS; y++) if (!b[y][COLS - 1] && b[y].some(Boolean)) wellRows++;
    score += (3.39 * well9 + 3.22 * wellRows + 9.35) * tet * TET_W;
    if (n === 4) score += 60 * tet * TET_W;
    else if (n > 0) score -= 18 * tet * TET_W * (maxH < 9 ? 1 : 0.35);
    if (n < 4 && placed.some(c => c[0] === COLS - 1)) score -= 12 * tet * TET_W;
  }
  return score;
}

class Bot {
  constructor(game, rank) { this.g = game; this.r = rank; this.plan = null; this.t = 0; }

  spawnOf(t) { return { x: t === 'O' ? 4 : 3, y: 1 }; }

  options(t, useHold) {
    const g = this.g, out = [], seen = new Set();
    const sp = this.spawnOf(t);
    for (let r = 0; r < 4; r++) {
      if (g.collide(t, r, sp.x, sp.y)) continue;
      for (let x = -2; x < COLS; x++) {
        // reachable by sliding sideways from spawn
        const dir = Math.sign(x - sp.x);
        let ok = true;
        for (let cx = sp.x; cx !== x; cx += dir) if (g.collide(t, r, cx + dir, sp.y)) { ok = false; break; }
        if (!ok || g.collide(t, r, x, sp.y)) continue;
        let y = sp.y;
        while (!g.collide(t, r, x, y + 1)) y++;
        const cells = ROT[t][r].map(([cx, cy]) => [x + cx, y + cy]);
        const key = cells.map(c => c.join(',')).sort().join('|');
        if (seen.has(key)) continue;
        seen.add(key);
        const b = g.board.map(row => row.slice());
        for (const [cx, cy] of cells) if (cy >= 0) b[cy][cx] = t;
        let n = 0;
        for (let yy = 0; yy < ROWS; yy++) if (b[yy].every(Boolean)) { b.splice(yy, 1); b.unshift(Array(COLS).fill(0)); n++; }
        out.push({ t, r, x, hold: useHold, score: evalBoard(b, cells, n, g.pending() >= 3 ? 0 : this.r.tet) + (Math.random() - 0.5) * 0.01 });
      }
    }
    return out;
  }

  decide() {
    const g = this.g;
    let opts = this.options(g.piece.t, false);
    if (this.r.hold && g.canHold) {
      const ht = g.hold || g.queue[0];
      if (ht && ht !== g.piece.t) opts = opts.concat(this.options(ht, true));
    }
    if (!opts.length) return ['drop'];
    opts.sort((a, b) => b.score - a.score);
    const pick = Math.random() < this.r.err ? opts[(Math.random() * Math.min(6, opts.length)) | 0] : opts[0];
    const plan = [];
    if (pick.hold) plan.push('hold');
    if (pick.r === 1) plan.push('cw'); else if (pick.r === 2) plan.push('cw', 'cw'); else if (pick.r === 3) plan.push('ccw');
    plan.push({ x: pick.x }, 'drop');
    return plan;
  }

  update(dt) {
    const g = this.g;
    if (g.over || g.paused || g.countdown > 0 || !g.piece) return;
    const pieceMs = 1000 / this.r.pps;
    const step = Math.max(22, Math.min(140, pieceMs * 0.09));
    if (!this.plan) {
      this.plan = this.decide();
      const actions = this.plan.length + 2;
      this.t = -Math.max(0, pieceMs - actions * step) * (0.85 + Math.random() * 0.3);
    }
    this.t += dt;
    let guard = 0;
    while (this.t >= 0 && this.plan && g.piece && !g.over && guard++ < 30) {
      const a = this.plan[0];
      if (a === 'hold') { g.holdPiece(); this.plan.shift(); }
      else if (a === 'cw') { g.rotate(1); this.plan.shift(); }
      else if (a === 'ccw') { g.rotate(-1); this.plan.shift(); }
      else if (a === 'drop') { this.plan = null; g.hardDrop(); break; }
      else {
        const p = g.piece;
        if (p.x === a.x || !g.move(Math.sign(a.x - p.x))) this.plan.shift();
      }
      this.t -= step;
    }
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
    case 'versus':  return [['VS', ui.vs ? (ui.vs.rank.name.length > 9 ? ui.vs.rank.tag : ui.vs.rank.name.toUpperCase()) : '—', ui.vs ? ui.vs.rank.color : null], ['SENT', g.sent], ['LINES', g.lines], ['PPS', pps(g)]];
    default:        return [['LINES', g.lines], ['SCORE', sc], ['TIME', t], ['PPS', pps(g)]];
  }
}

const VS_CELL = 15, VS_X = CW + 26, VS_W = CW + 26 + COLS * VS_CELL + 4;

function drawMeter(ctx, S, x, n, cell) {
  if (n <= 0) return;
  const h = Math.min(n, VIS) * cell;
  ctx.save();
  ctx.fillStyle = n >= 8 ? S.warn : shade(S.colors.L, 0);
  if (S.glow) { ctx.shadowColor = ctx.fillStyle; ctx.shadowBlur = 8; }
  ctx.fillRect(x, VIS * cell - h + (cell === CELL ? 0 : 30), 5, h);
  ctx.restore();
}

function renderVersusSide(ctx, vs) {
  const S = sk(), ai = vs.ai, c = VS_CELL, top = 30, W = COLS * c, H = VIS * c;
  const retro = !!S.pixel;
  ctx.clearRect(CW, 0, VS_W - CW, CH);
  // incoming garbage meter for the player (left of the player's board)
  drawMeter(ctx, S, BX - 8, vs.player.pending(), CELL);
  // AI header
  ctx.save();
  ctx.textAlign = 'left';
  ctx.fillStyle = vs.rank.color; ctx.font = `${retro ? 400 : 700} ${retro ? 9 : 13}px ${S.fontD}`;
  ctx.fillText(`${vs.rank.name.toUpperCase()} AI`, VS_X, 16);
  ctx.restore();
  // AI board
  if (S.boardFill) S.boardFill(ctx, VS_X, top, W, H); else { ctx.fillStyle = S.board; ctx.fillRect(VS_X, top, W, H); }
  for (let y = HIDDEN; y < ROWS; y++)
    for (let x = 0; x < COLS; x++) {
      const v = ai.board[y][x];
      if (v) drawCell(ctx, S, VS_X + x * c, top + (y - HIDDEN) * c, v, c, ai.over ? 0.45 : 0.95);
    }
  const p = ai.piece;
  if (p && !ai.over) for (const [cx, cy] of ROT[p.t][p.r]) {
    const y = p.y + cy - HIDDEN;
    if (y >= 0) drawCell(ctx, S, VS_X + (p.x + cx) * c, top + y * c, p.t, c, 1);
  }
  ctx.save();
  ctx.strokeStyle = vs.rank.color; ctx.lineWidth = 2;
  ctx.strokeRect(VS_X - 1, top - 1, W + 2, H + 2);
  ctx.restore();
  drawMeter(ctx, S, VS_X - 8, ai.pending(), c);
  // AI stats
  ctx.save();
  ctx.textAlign = 'left';
  ctx.font = `600 ${retro ? 9 : 11}px ${S.fontB}`; ctx.fillStyle = S.muted;
  ctx.fillText(`SENT ${ai.sent}   ·   ${vs.rank.pps.toFixed(2)} PPS`, VS_X, top + H + 20);
  if (ai.ko) {
    ctx.fillStyle = S.overlay; ctx.fillRect(VS_X, top, W, H);
    ctx.textAlign = 'center'; ctx.fillStyle = S.label; ctx.font = `700 ${retro ? 16 : 26}px ${S.fontD}`;
    ctx.fillText('K.O.', VS_X + W / 2, top + H / 2 + 8);
  }
  ctx.restore();
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
    versus:  ['Z', [[0,0],[1,0],[1,1],[2,1]]],
    ranked:  ['T', [[0,0],[1,0],[2,0],[1,1]]],
  };
  const [t, cells] = shapes[mode];
  const mx = Math.max(...cells.map(c => c[0])) + 1, my = Math.max(...cells.map(c => c[1])) + 1;
  const ox = (W - mx * s) / 2, oy = (W - my * s) / 2;
  for (const [x, y] of cells) S.cell(ctx, ox + x * s, oy + y * s, s, S.colors[t], t);
}

/* =====================================================================
   AVATARS — original little characters that react to the game
   ===================================================================== */
const CHARS = {
  cat:     { name: 'Miso',   color: 0, top: 22, eyeY: 37, mouthY: 44 },
  fox:     { name: 'Kit',    color: 1, top: 22, eyeY: 37, mouthY: 45 },
  slime:   { name: 'Goo',    color: 5, top: 21, eyeY: 38, mouthY: 45 },
  robot:   { name: 'Bolt',   color: 2, top: 20, eyeY: 35, mouthY: 45 },
  ghost:   { name: 'Boo',    color: 7, top: 17, eyeY: 33, mouthY: 40 },
  penguin: { name: 'Waddle', color: 6, top: 19, eyeY: 32, mouthY: 38 },
};
const CHAR_ORDER = ['cat', 'fox', 'slime', 'robot', 'ghost', 'penguin'];
const BODY_COLORS = ['#f2a65a', '#ff7b3a', '#7fb3e6', '#b28dff', '#ff8fab', '#7fd68a', '#3b4150', '#eef0f7'];
const HATS = [
  { id: 'none', name: 'None' },
  { id: 'party', name: 'Party hat' },
  { id: 'beanie', name: 'Beanie' },
  { id: 'bow', name: 'Bow' },
  { id: 'headphones', name: 'Headphones' },
  { id: 'wizard', name: 'Wizard hat', req: ['tst'], hint: 'Land a T-Spin Triple' },
  { id: 'halo', name: 'Halo', req: ['zen100'], hint: 'Clear 100 lines in one Zen session' },
  { id: 'crown', name: 'Crown', req: ['vs_diamond', 'rk_diamond'], hint: 'Beat the Diamond AI or reach Diamond in Ranked' },
];
const FACES = [
  { id: 'none', name: 'None' },
  { id: 'blush', name: 'Blush' },
  { id: 'glasses', name: 'Glasses' },
  { id: 'bandaid', name: 'Band-aid' },
  { id: 'sunglasses', name: 'Sunglasses', req: ['sprint2'], hint: 'Finish Sprint in under 2:00' },
  { id: 'monocle', name: 'Monocle', req: ['games25'], hint: 'Play 25 games' },
];
const unlockedItem = it => !it.req || it.req.some(id => save.ach[id]);

function drawAvatar(ctx, px, prof, state, t) {
  const C = CHARS[prof.char] || CHARS.cat;
  const base = BODY_COLORS[prof.color ?? C.color] || BODY_COLORS[0];
  const dark = shade(base, -0.28), light = shade(base, 0.35);
  const k = px / 64;
  ctx.save();
  ctx.clearRect(0, 0, 64, 64);
  ctx.scale(1, 1);
  ctx.setTransform(k * (ctx.__dpr || 1), 0, 0, k * (ctx.__dpr || 1), 0, 0);
  ctx.lineCap = 'round'; ctx.lineJoin = 'round';

  // motion per state
  let dy = Math.sin(t * 2.2) * 1.2, dx = 0, sq = 1;
  if (prof.char === 'ghost') dy = Math.sin(t * 2) * 2.5;
  if (state === 'happy') dy -= Math.abs(Math.sin(t * 9)) * 3;
  if (state === 'excited' || state === 'cheer') { dy -= Math.abs(Math.sin(t * 8)) * 6; sq = 1 + Math.sin(t * 16) * 0.03; }
  if (state === 'hurt') dx = Math.sin(t * 60) * 2;
  if (state === 'sad') dy = 2 + Math.sin(t * 1.5) * 0.6;
  ctx.translate(32 + dx, 34 + dy);
  ctx.scale(1 / sq, sq);
  ctx.translate(-32, -34);

  // ---- body
  const E = C.eyeY, M = C.mouthY;
  switch (prof.char) {
    case 'cat': {
      ctx.fillStyle = base;
      ctx.beginPath(); ctx.moveTo(17, 30); ctx.lineTo(20, 14); ctx.lineTo(30, 24); ctx.fill();
      ctx.beginPath(); ctx.moveTo(47, 30); ctx.lineTo(44, 14); ctx.lineTo(34, 24); ctx.fill();
      ctx.fillStyle = '#ffb3c6';
      ctx.beginPath(); ctx.moveTo(20.5, 26); ctx.lineTo(21.5, 18.5); ctx.lineTo(27, 24); ctx.fill();
      ctx.beginPath(); ctx.moveTo(43.5, 26); ctx.lineTo(42.5, 18.5); ctx.lineTo(37, 24); ctx.fill();
      ctx.fillStyle = base; ctx.beginPath(); ctx.ellipse(32, 38, 17, 15, 0, 0, Math.PI * 2); ctx.fill();
      ctx.strokeStyle = dark; ctx.lineWidth = 1;
      ctx.beginPath(); ctx.moveTo(14, 41); ctx.lineTo(21, 42); ctx.moveTo(14, 45); ctx.lineTo(21, 44); ctx.moveTo(50, 41); ctx.lineTo(43, 42); ctx.moveTo(50, 45); ctx.lineTo(43, 44); ctx.stroke();
      break;
    }
    case 'fox': {
      ctx.fillStyle = base;
      ctx.beginPath(); ctx.moveTo(15, 32); ctx.lineTo(17, 10); ctx.lineTo(30, 24); ctx.fill();
      ctx.beginPath(); ctx.moveTo(49, 32); ctx.lineTo(47, 10); ctx.lineTo(34, 24); ctx.fill();
      ctx.fillStyle = '#fff4e6';
      ctx.beginPath(); ctx.moveTo(18, 22); ctx.lineTo(17.5, 13); ctx.lineTo(25, 21); ctx.fill();
      ctx.beginPath(); ctx.moveTo(46, 22); ctx.lineTo(46.5, 13); ctx.lineTo(39, 21); ctx.fill();
      ctx.fillStyle = base; ctx.beginPath(); ctx.ellipse(32, 38, 18, 14.5, 0, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = '#fff4e6'; ctx.beginPath(); ctx.ellipse(32, 45, 10, 7, 0, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = '#2a2230'; ctx.beginPath(); ctx.ellipse(32, 41.5, 2, 1.4, 0, 0, Math.PI * 2); ctx.fill();
      break;
    }
    case 'slime': {
      const g = ctx.createLinearGradient(0, 20, 0, 54);
      g.addColorStop(0, light); g.addColorStop(1, base);
      ctx.fillStyle = g;
      ctx.beginPath(); ctx.moveTo(12, 52); ctx.bezierCurveTo(10, 30, 22, 20, 32, 20); ctx.bezierCurveTo(42, 20, 54, 30, 52, 52);
      ctx.quadraticCurveTo(46, 55, 40, 52); ctx.quadraticCurveTo(32, 56, 24, 52); ctx.quadraticCurveTo(18, 55, 12, 52); ctx.fill();
      ctx.fillStyle = 'rgba(255,255,255,.55)'; ctx.beginPath(); ctx.ellipse(22, 29, 4, 2.5, -0.6, 0, Math.PI * 2); ctx.fill();
      break;
    }
    case 'robot': {
      ctx.strokeStyle = dark; ctx.lineWidth = 1.5;
      ctx.beginPath(); ctx.moveTo(32, 21); ctx.lineTo(32, 14); ctx.stroke();
      ctx.fillStyle = Math.sin(t * 4) > 0 ? '#ff5d6c' : '#ffd166'; ctx.beginPath(); ctx.arc(32, 13, 2.4, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = base; rrect(ctx, 14, 21, 36, 31, 7); ctx.fill();
      ctx.fillStyle = dark; ctx.fillRect(11, 32, 3, 9); ctx.fillRect(50, 32, 3, 9);
      ctx.fillStyle = '#141a26'; rrect(ctx, 18, 28, 28, 13, 4); ctx.fill();
      break;
    }
    case 'ghost': {
      ctx.fillStyle = base;
      ctx.beginPath(); ctx.moveTo(14, 50); ctx.lineTo(14, 34); ctx.bezierCurveTo(14, 20, 50, 20, 50, 34); ctx.lineTo(50, 50);
      const w = Math.sin(t * 5) * 1.5;
      ctx.quadraticCurveTo(47, 55 + w, 44, 50); ctx.quadraticCurveTo(41, 55 - w, 38, 50); ctx.quadraticCurveTo(35, 55 + w, 32, 50);
      ctx.quadraticCurveTo(29, 55 - w, 26, 50); ctx.quadraticCurveTo(23, 55 + w, 20, 50); ctx.quadraticCurveTo(17, 55 - w, 14, 50); ctx.fill();
      break;
    }
    case 'penguin': {
      ctx.fillStyle = base; ctx.beginPath(); ctx.ellipse(32, 36, 17, 18, 0, 0, Math.PI * 2); ctx.fill();
      ctx.beginPath(); ctx.ellipse(14.5, 40, 3.5, 8, 0.4, 0, Math.PI * 2); ctx.ellipse(49.5, 40, 3.5, 8, -0.4, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = '#f7f7fb'; ctx.beginPath(); ctx.ellipse(32, 39, 11.5, 13.5, 0, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = '#ffb347'; ctx.beginPath(); ctx.moveTo(29, 36.5); ctx.lineTo(35, 36.5); ctx.lineTo(32, 40.5); ctx.fill();
      ctx.beginPath(); ctx.ellipse(27, 54, 4, 1.8, 0, 0, Math.PI * 2); ctx.ellipse(37, 54, 4, 1.8, 0, 0, Math.PI * 2); ctx.fill();
      break;
    }
  }

  // ---- face
  const robot = prof.char === 'robot';
  const darkBody = BODY_COLORS.indexOf(base) === 6;
  const ink = robot ? '#7df9ff' : prof.char === 'penguin' ? '#1e2230' : darkBody ? '#f2f2f7' : '#2a2230';
  const eyeInk = prof.char === 'penguin' ? '#1e2230' : ink;
  const blink = state === 'idle' && (t % 3.6) < 0.12;
  const ex = 7;
  ctx.strokeStyle = eyeInk; ctx.fillStyle = eyeInk; ctx.lineWidth = 2;
  if (robot) { ctx.shadowColor = '#7df9ff'; ctx.shadowBlur = 4; }
  const eyes = (fn) => { fn(32 - ex); fn(32 + ex); };
  const hideEyes = prof.face === 'sunglasses' && state !== 'excited';
  if (!hideEyes) {
    if (blink || state === 'focus') eyes(x => { ctx.beginPath(); ctx.moveTo(x - 2.5, E); ctx.lineTo(x + 2.5, E); ctx.stroke(); });
    else if (state === 'happy' || state === 'cheer') eyes(x => { ctx.beginPath(); ctx.arc(x, E + 1, 2.6, Math.PI * 1.1, Math.PI * 1.9); ctx.stroke(); });
    else if (state === 'excited') eyes(x => { star(ctx, x, E, 3.6, '#ffd84d'); });
    else if (state === 'hurt') eyes(x => {
      ctx.save(); ctx.fillStyle = '#fff'; ctx.shadowBlur = 0; ctx.beginPath(); ctx.arc(x, E, 3.4, 0, Math.PI * 2); ctx.fill(); ctx.restore();
      ctx.beginPath(); ctx.arc(x, E, 1.2, 0, Math.PI * 2); ctx.fill();
    });
    else if (state === 'sad') eyes(x => { ctx.beginPath(); ctx.arc(x, E - 1, 2.6, Math.PI * 0.15, Math.PI * 0.85); ctx.stroke(); });
    else eyes(x => {
      ctx.beginPath(); ctx.arc(x, E, 2.3, 0, Math.PI * 2); ctx.fill();
      if (!robot) { ctx.save(); ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.arc(x - 0.8, E - 0.9, 0.8, 0, Math.PI * 2); ctx.fill(); ctx.restore(); }
    });
    if (state === 'worried' || state === 'hurt') {
      ctx.lineWidth = 1.4;
      ctx.beginPath(); ctx.moveTo(32 - ex - 3, E - 5.5); ctx.lineTo(32 - ex + 2.5, E - 4); ctx.moveTo(32 + ex + 3, E - 5.5); ctx.lineTo(32 + ex - 2.5, E - 4); ctx.stroke();
      ctx.lineWidth = 2;
    }
  }
  // mouth
  const my = prof.char === 'penguin' ? M + 5 : M;
  ctx.lineWidth = 1.6;
  if (state === 'happy' || state === 'excited' || state === 'cheer') {
    ctx.save(); ctx.fillStyle = robot ? '#7df9ff' : '#5b2333';
    ctx.beginPath(); ctx.moveTo(28, my - 1); ctx.quadraticCurveTo(32, my + (state === 'happy' ? 4.5 : 6.5), 36, my - 1); ctx.closePath(); ctx.fill(); ctx.restore();
  } else if (state === 'hurt') { ctx.beginPath(); ctx.ellipse(32, my + 1, 1.8, 2.4, 0, 0, Math.PI * 2); ctx.stroke(); }
  else if (state === 'sad') { ctx.beginPath(); ctx.arc(32, my + 3, 3, Math.PI * 1.15, Math.PI * 1.85); ctx.stroke(); }
  else if (state === 'worried') { ctx.beginPath(); ctx.moveTo(28.5, my + 1); ctx.quadraticCurveTo(30, my - 0.5, 31.5, my + 1); ctx.quadraticCurveTo(33, my + 2.5, 35.5, my + 0.5); ctx.stroke(); }
  else if (state === 'focus') { ctx.beginPath(); ctx.moveTo(29.5, my + 0.5); ctx.lineTo(34.5, my + 0.5); ctx.stroke(); }
  else if (prof.char === 'cat') { ctx.beginPath(); ctx.arc(30.2, my - 0.5, 1.8, 0.1, Math.PI - 0.1); ctx.arc(33.8, my - 0.5, 1.8, 0.1, Math.PI - 0.1); ctx.stroke(); }
  else { ctx.beginPath(); ctx.arc(32, my - 1.5, 3, Math.PI * 0.2, Math.PI * 0.8); ctx.stroke(); }
  ctx.shadowBlur = 0;

  // ---- face accessory
  const cheek = (x) => { ctx.beginPath(); ctx.ellipse(x, E + 5, 2.8, 1.6, 0, 0, Math.PI * 2); ctx.fill(); };
  if (prof.face === 'blush' || state === 'cheer' || state === 'excited') { ctx.fillStyle = 'rgba(255,110,150,.45)'; cheek(32 - 12); cheek(32 + 12); }
  if (prof.face === 'glasses') {
    ctx.strokeStyle = '#1b1f2a'; ctx.lineWidth = 1.3;
    ctx.beginPath(); ctx.arc(32 - ex, E, 4.2, 0, Math.PI * 2); ctx.moveTo(32 + ex + 4.2, E); ctx.arc(32 + ex, E, 4.2, 0, Math.PI * 2);
    ctx.moveTo(32 - ex + 4.2, E - 0.5); ctx.lineTo(32 + ex - 4.2, E - 0.5); ctx.stroke();
  }
  if (prof.face === 'sunglasses' && state !== 'excited') {
    ctx.fillStyle = '#12151c';
    rrect(ctx, 32 - ex - 5, E - 3.5, 10, 6.5, 2.5); ctx.fill(); rrect(ctx, 32 + ex - 5, E - 3.5, 10, 6.5, 2.5); ctx.fill();
    ctx.fillRect(32 - 2.5, E - 2.5, 5, 1.4);
    ctx.fillStyle = 'rgba(255,255,255,.5)'; ctx.fillRect(32 - ex - 3, E - 2.2, 3, 1); ctx.fillRect(32 + ex - 3, E - 2.2, 3, 1);
  }
  if (prof.face === 'monocle') {
    ctx.strokeStyle = '#d9aa45'; ctx.lineWidth = 1.2;
    ctx.beginPath(); ctx.arc(32 + ex, E, 4.3, 0, Math.PI * 2); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(32 + ex + 3, E + 3.5); ctx.quadraticCurveTo(46, E + 10, 44, E + 16); ctx.stroke();
  }
  if (prof.face === 'bandaid') {
    ctx.save(); ctx.translate(32 + 12, E + 5); ctx.rotate(-0.5);
    ctx.fillStyle = '#f4c7a1'; rrect(ctx, -4.5, -1.8, 9, 3.6, 1.6); ctx.fill();
    ctx.fillStyle = '#e0a98a'; ctx.fillRect(-1.2, -1.8, 2.4, 3.6); ctx.restore();
  }

  // ---- hat
  const T = C.top;
  switch (prof.hat) {
    case 'party': {
      ctx.fillStyle = '#ff5d8f'; ctx.beginPath(); ctx.moveTo(25, T + 4); ctx.lineTo(39, T + 4); ctx.lineTo(33, T - 13); ctx.fill();
      ctx.strokeStyle = '#ffd84d'; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.moveTo(27.5, T - 1); ctx.lineTo(36.5, T - 1); ctx.moveTo(30, T - 6); ctx.lineTo(35, T - 6); ctx.stroke();
      ctx.fillStyle = '#ffd84d'; ctx.beginPath(); ctx.arc(33, T - 13, 2.4, 0, Math.PI * 2); ctx.fill();
      break;
    }
    case 'beanie': {
      ctx.fillStyle = '#5a7bd8'; ctx.beginPath(); ctx.arc(32, T + 7, 13, Math.PI, 0); ctx.fill();
      ctx.fillStyle = '#3f5bb0'; rrect(ctx, 18.5, T + 4, 27, 5, 2); ctx.fill();
      ctx.fillStyle = '#eef0f7'; ctx.beginPath(); ctx.arc(32, T - 6.5, 3, 0, Math.PI * 2); ctx.fill();
      break;
    }
    case 'bow': {
      ctx.fillStyle = '#ff5d8f';
      ctx.beginPath(); ctx.moveTo(41, T + 3); ctx.lineTo(34.5, T - 2); ctx.lineTo(35, T + 8); ctx.fill();
      ctx.beginPath(); ctx.moveTo(41, T + 3); ctx.lineTo(47.5, T - 2); ctx.lineTo(47, T + 8); ctx.fill();
      ctx.fillStyle = '#d93c6f'; ctx.beginPath(); ctx.arc(41, T + 3, 2.3, 0, Math.PI * 2); ctx.fill();
      break;
    }
    case 'headphones': {
      ctx.strokeStyle = '#2b2f3a'; ctx.lineWidth = 3;
      ctx.beginPath(); ctx.arc(32, E, 19, Math.PI * 1.08, Math.PI * 1.92); ctx.stroke();
      ctx.fillStyle = '#e2504f'; rrect(ctx, 11, E - 5, 6, 12, 3); ctx.fill(); rrect(ctx, 47, E - 5, 6, 12, 3); ctx.fill();
      break;
    }
    case 'wizard': {
      ctx.fillStyle = '#5b3fb0'; ctx.beginPath(); ctx.ellipse(32, T + 4, 15, 3.5, 0, 0, Math.PI * 2); ctx.fill();
      ctx.beginPath(); ctx.moveTo(23, T + 3); ctx.lineTo(41, T + 3); ctx.lineTo(37, T - 16); ctx.fill();
      star(ctx, 31, T - 3, 2.2, '#ffd84d'); star(ctx, 36, T - 9, 1.6, '#ffd84d');
      break;
    }
    case 'halo': {
      ctx.save(); ctx.strokeStyle = '#ffe28a'; ctx.lineWidth = 2.2; ctx.shadowColor = '#ffe28a'; ctx.shadowBlur = 6;
      ctx.beginPath(); ctx.ellipse(32, T - 5 + Math.sin(t * 3) * 1, 10, 3, 0, 0, Math.PI * 2); ctx.stroke(); ctx.restore();
      break;
    }
    case 'crown': {
      ctx.fillStyle = '#f4c542';
      ctx.beginPath(); ctx.moveTo(22, T + 5); ctx.lineTo(22, T - 5); ctx.lineTo(27, T); ctx.lineTo(32, T - 8); ctx.lineTo(37, T); ctx.lineTo(42, T - 5); ctx.lineTo(42, T + 5); ctx.fill();
      ctx.fillStyle = '#e2504f'; ctx.beginPath(); ctx.arc(32, T + 1, 1.6, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = '#4fb3e6'; ctx.beginPath(); ctx.arc(26, T + 2, 1.2, 0, Math.PI * 2); ctx.arc(38, T + 2, 1.2, 0, Math.PI * 2); ctx.fill();
      break;
    }
  }

  // ---- effects
  ctx.setTransform(k * (ctx.__dpr || 1), 0, 0, k * (ctx.__dpr || 1), 0, 0);
  if (state === 'hurt' || state === 'worried') {
    ctx.fillStyle = '#7fd4ff';
    const sy = 22 + ((t * 20) % 8);
    ctx.beginPath(); ctx.moveTo(50, sy); ctx.quadraticCurveTo(53, sy + 5, 50, sy + 6.5); ctx.quadraticCurveTo(47, sy + 5, 50, sy); ctx.fill();
  }
  if (state === 'sad') {
    ctx.fillStyle = '#7fd4ff';
    const ty = E + 4 + ((t * 14) % 12);
    ctx.beginPath(); ctx.ellipse(32 - ex - 1, ty, 1.3, 2, 0, 0, Math.PI * 2); ctx.fill();
  }
  if (state === 'excited' || state === 'cheer') {
    for (let i = 0; i < 6; i++) {
      const a = t * 2 + i * (Math.PI / 3), r = 25 + Math.sin(t * 6 + i) * 3;
      star(ctx, 32 + Math.cos(a) * r, 32 + Math.sin(a) * r * 0.8, 1.8, ['#ffd84d', '#ff8fab', '#7fd4ff'][i % 3]);
    }
  }
  ctx.restore();
}

function star(ctx, x, y, r, color) {
  ctx.save(); ctx.fillStyle = color; ctx.shadowBlur = 0; ctx.beginPath();
  for (let i = 0; i < 10; i++) {
    const a = -Math.PI / 2 + i * Math.PI / 5, rr = i % 2 ? r * 0.45 : r;
    ctx.lineTo(x + Math.cos(a) * rr, y + Math.sin(a) * rr);
  }
  ctx.fill(); ctx.restore();
}

// reaction state per board ('p' = player, 'ai' = opponent)
const Av = {
  p: { state: 'idle', until: 0 }, ai: { state: 'idle', until: 0 },
  set(who, state, ms) {
    const a = this[who];
    if (a.until === Infinity && ms) return;          // final states (win/lose) stick
    a.state = state; a.until = ms ? performance.now() + ms : Infinity;
  },
  reset() { for (const w of ['p', 'ai']) { this[w].state = 'idle'; this[w].until = 0; } },
  event(who, name, d = {}) {
    if (name === 'land' && d.n > 0) {
      if (d.pc || d.n === 4 || (d.tspin && d.n > 0) || d.combo >= 3) this.set(who, 'excited', 1600);
      else this.set(who, 'happy', 900);
    } else if (name === 'garbage') this.set(who, 'hurt', 1100);
    else if (name === 'level') this.set(who, 'happy', 800);
    else if (name === 'win') this.set(who, 'cheer', 0);
    else if (name === 'topout') this.set(who, 'sad', 0);
  },
  state(who, g) {
    const a = this[who];
    if (a.until !== Infinity && performance.now() > a.until) { a.state = 'idle'; a.until = 0; }
    if (a.state !== 'idle' || !g) return a.state;
    if (g.countdown > 0) return 'focus';
    for (let y = 0; y < ROWS - 14; y++) if (g.board[y].some(Boolean)) return 'worried';
    return 'idle';
  },
};

function aiProfile(rankIdx) {
  const hats = ['none', 'none', 'beanie', 'headphones', 'headphones', 'bow', 'party', 'wizard', 'halo', 'crown'];
  return { char: 'robot', color: rankIdx >= 7 ? 3 : rankIdx >= 3 ? 2 : 6, hat: hats[rankIdx] || 'none', face: rankIdx >= 6 ? 'sunglasses' : 'none' };
}

function paintAvatar(canvas, prof, state, t) {
  if (!canvas) return;
  const dpr = window.devicePixelRatio || 1;
  const css = canvas.clientWidth || 52;
  const w = Math.round(css * dpr);
  if (canvas.width !== w) { canvas.width = w; canvas.height = w; }
  const ctx = canvas.getContext('2d');
  ctx.__dpr = 1;
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.clearRect(0, 0, w, w);
  drawAvatar(ctx, w, prof, state, t);
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

.rt-hud2{display:flex;align-items:center;gap:10px;margin:-6px 0 8px}
.rt-pc{display:flex;align-items:center;gap:9px;min-width:0}
.rt-pc.r{margin-left:auto;flex-direction:row-reverse;text-align:right}
.rt-scr{position:relative;width:52px;height:52px;flex:0 0 52px;border:2px solid var(--rt-goldd);border-radius:calc(var(--rt-radius) + 4px);
  background:radial-gradient(circle at 50% 35%,var(--rt-card),var(--rt-bg2));overflow:hidden;box-shadow:inset 0 0 12px rgba(0,0,0,.5)}
.rt-scr::after{content:'';position:absolute;inset:0;pointer-events:none;background:repeating-linear-gradient(0deg,rgba(0,0,0,.12) 0 1px,transparent 1px 3px);opacity:.6}
.rt-scr canvas{width:100%;height:100%;display:block}
.rt-pc .nm{font-family:var(--rt-fd);font-weight:700;font-size:14px;color:var(--rt-text);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;max-width:180px}
.rt-pc .sub{font-size:11px;color:var(--rt-muted);white-space:nowrap}
.rt-vsb{font-family:var(--rt-fd);font-weight:700;color:var(--rt-red);font-size:13px;letter-spacing:.1em}
.rt-hud2 .hk{margin-left:auto;font-size:11px;color:var(--rt-dim)}
.rt-inp{background:var(--rt-bg2);border:1px solid var(--rt-line);border-radius:var(--rt-radius);color:var(--rt-text);font:inherit;font-size:13px;padding:6px 8px;width:190px;user-select:text;outline:none}
.rt-inp:focus{border-color:var(--rt-gold)}
.rt-prof{display:flex;gap:16px;align-items:flex-start}
.rt-prof .big{flex:0 0 132px}
.rt-prof .big .rt-scr{width:132px;height:132px}
.rt-react{display:flex;flex-wrap:wrap;gap:4px;margin-top:6px}
.rt-chips2{display:flex;flex-wrap:wrap;gap:6px}
.rt-chip2{display:flex;align-items:center;gap:6px;background:none;border:1px solid var(--rt-line);border-radius:var(--rt-radius);color:var(--rt-muted);font:inherit;font-size:11px;padding:4px 8px;cursor:pointer}
.rt-chip2 canvas{width:30px;height:30px}
.rt-chip2:hover{color:var(--rt-text)}
.rt-chip2.on{border-color:var(--rt-gold);color:var(--rt-text)}
.rt-chip2.lock{cursor:not-allowed;border-style:dashed}
.rt-chip2.lock canvas{opacity:.35;filter:grayscale(1)}
.rt-chip2 .tx{display:flex;flex-direction:column;align-items:flex-start;text-align:left;line-height:1.25}
.rt-chip2 .tx svg{width:9px;height:9px;display:inline-block;vertical-align:-1px;margin-left:3px}
.rt-chip2 small{font-size:10px;color:var(--rt-gold);max-width:170px;white-space:normal}
.rt-sw{width:22px;height:22px;border-radius:50%;border:2px solid transparent;cursor:pointer;padding:0}
.rt-sw.on{border-color:var(--rt-text);box-shadow:0 0 0 2px var(--rt-goldd)}
.rt-rk{display:flex;gap:16px;align-items:center;padding:12px;border:1px solid var(--rt-line2);background:var(--rt-card);border-radius:var(--rt-radius)}
.rt-rk .tier{font-family:var(--rt-fd);font-weight:700;font-size:22px}
.rt-lp{height:8px;background:var(--rt-bg2);border:1px solid var(--rt-line);border-radius:4px;overflow:hidden;margin:6px 0 4px;width:100%}
.rt-lp i{display:block;height:100%;transition:width .8s ease}
.rt-dots{display:flex;gap:6px;margin-top:4px}
.rt-dots span{width:14px;height:14px;border-radius:50%;border:2px solid var(--rt-line);display:grid;place-items:center;font-size:9px}
.rt-dots .w{background:var(--rt-teal);border-color:var(--rt-teal)}
.rt-dots .l{background:var(--rt-red);border-color:var(--rt-red)}
.rt-banner{margin:8px auto 0;padding:8px 12px;border:1px solid var(--rt-goldd);border-radius:var(--rt-radius);background:var(--rt-card);display:inline-flex;align-items:center;gap:10px;text-align:left}
.rt-hud{display:flex;justify-content:space-between;align-items:baseline;margin:-4px 0 8px;color:var(--rt-muted);font-size:11px}
.rt-hud b{font-family:var(--rt-fd);font-size:13px;color:var(--rt-text)}
.rt-stage{position:relative;flex:1;min-height:0;perspective:1100px}
.rt-stage canvas{position:absolute;inset:0;width:100%;height:100%;object-fit:contain;transition:transform .4s}
html[data-rt-skin=cube] .rt-stage canvas{transform:rotateX(12deg) scale(.96)}
html[data-rt-skin=retro] .rt-stage canvas{image-rendering:pixelated}
.rt-pause{position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:8px;background:var(--rt-back)}
.rt-pause .t{font-family:var(--rt-fd);font-size:20px;font-weight:700;color:var(--rt-text);margin-bottom:8px}
.rt-pause .rt-btn{width:auto;min-width:200px;max-width:90%;white-space:normal;height:auto;min-height:32px;padding:6px 18px}
.rt-pause .note{font-size:11px;color:var(--rt-muted);margin-top:-2px}

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
.rt-unl i{width:24px;height:24px;flex:0 0 24px;display:grid;place-items:center;color:var(--rt-gold);border:1px solid var(--rt-goldd);border-radius:var(--rt-radius)}
.rt-unl i svg{width:15px;height:15px}
.rt-unl b{font-weight:600}.rt-unl span{color:var(--rt-muted)}

.rt-prog{display:flex;align-items:center;gap:10px;margin-bottom:14px}
.rt-prog .bar{flex:1;height:3px;background:var(--rt-line2)}
.rt-prog .bar i{display:block;height:100%;background:var(--rt-gold)}
.rt-prog b{font-variant-numeric:tabular-nums}
.rt-ach{display:flex;gap:10px;align-items:center;padding:7px 0;border-bottom:1px solid var(--rt-line2)}
.rt-ach .ic{width:36px;height:36px;flex:0 0 36px;display:flex;align-items:center;justify-content:center;border:1px solid var(--rt-line);border-radius:var(--rt-radius);color:var(--rt-dim);background:var(--rt-bg2);position:relative}
.rt-ach .ic svg{width:20px;height:20px;opacity:.35}
.rt-ach .ic .lk{position:absolute;right:-4px;bottom:-4px;width:14px;height:14px;display:grid;place-items:center;background:var(--rt-bg2);border:1px solid var(--rt-line);border-radius:50%}
.rt-ach .ic .lk svg{width:8px;height:8px;opacity:1}
.rt-ach.on{cursor:pointer}
.rt-ach.on:hover .ic{box-shadow:0 0 10px var(--rt-goldd)}
.rt-ach .t{flex:1}
.rt-ach .n{font-weight:600;color:var(--rt-muted)}
.rt-ach .d{font-size:11px;color:var(--rt-dim);margin-top:1px}
.rt-ach .dt{font-size:10px;color:var(--rt-dim);white-space:nowrap}
.rt-ach.on .ic{border-color:var(--rt-gold);color:var(--rt-gold);background:radial-gradient(circle at 50% 30%,var(--rt-card),var(--rt-bg2))}
.rt-ach.on .ic svg{opacity:1;filter:drop-shadow(0 0 4px var(--rt-goldd))}
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
#rt-achpop{position:fixed;right:16px;bottom:16px;z-index:2147483647;display:flex;flex-direction:column-reverse;gap:8px;pointer-events:none}
.rt-ap{width:310px;height:80px;box-sizing:border-box;display:flex;align-items:center;gap:12px;padding:0 14px 0 11px;
  background:linear-gradient(135deg,var(--rt-bg1),var(--rt-bg2));border:1px solid var(--rt-goldd);border-radius:var(--rt-radius);
  box-shadow:0 10px 28px rgba(0,0,0,.6);font-family:var(--rt-fb);color:var(--rt-text);
  transform:translateY(calc(100% + 24px));opacity:0;transition:transform .5s cubic-bezier(.2,.9,.25,1.15),opacity .25s}
.rt-ap.in{transform:none;opacity:1}
.rt-ap.out{transform:translateY(calc(100% + 24px));opacity:0;transition:transform .45s ease-in,opacity .45s ease-in}
.rt-ap .ico{position:relative;width:58px;height:58px;flex:0 0 58px;display:grid;place-items:center;overflow:hidden;
  color:var(--rt-gold);border:1px solid var(--rt-gold);border-radius:var(--rt-radius);background:radial-gradient(circle at 50% 30%,var(--rt-card),var(--rt-bg2))}
.rt-ap .ico svg{width:34px;height:34px;filter:drop-shadow(0 0 6px var(--rt-goldd));animation:rtPop .6s .15s cubic-bezier(.2,1.6,.4,1) both}
.rt-ap .ico::after{content:'';position:absolute;inset:-40%;background:linear-gradient(115deg,transparent 42%,rgba(255,255,255,.4) 50%,transparent 58%);transform:translateX(-120%);animation:rtShine 1.1s .45s ease-out forwards}
.rt-ap .tx{min-width:0}
.rt-ap .k{font-size:11px;color:var(--rt-muted)}
.rt-ap .n{font-family:var(--rt-fd);font-weight:700;font-size:15px;margin-top:1px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.rt-ap .d{font-size:11px;color:var(--rt-dim);margin-top:1px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
html[data-rt-skin=retro] .rt-ap{border-width:2px;box-shadow:4px 4px 0 #0f380f}
html[data-rt-skin=retro] .rt-ap .n{font-size:10px;font-weight:400}
html[data-rt-skin=neon] .rt-ap{box-shadow:0 0 20px rgba(255,46,200,.35)}
@keyframes rtShine{to{transform:translateX(120%)}}
@keyframes rtPop{from{transform:scale(.3);opacity:0}to{transform:none;opacity:1}}
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
  for (const id of ['rt-root', 'rt-fab', 'rt-toasts', 'rt-achpop', 'rt-style']) document.getElementById(id)?.remove();
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
          <button class="rt-tab" data-act="tab:profile">Profile</button>
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
  ui.body.addEventListener('change', e => safe(onSettingChange)(e));

  ui.toasts = el('<div id="rt-toasts"></div>');
  document.body.appendChild(ui.toasts);
  ui.achpop = el('<div id="rt-achpop"></div>');
  document.body.appendChild(ui.achpop);

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
  if (save.settings.music) Music.load();
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
  Music.pause();
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
  if (!g.paused && ui.open) Sfx.play('pause');
  g.paused = true; resetInput();
  ui.pauseEl?.classList.remove('rt-hidden');
}
function resumeGame() {
  const g = ui.game;
  if (!g || g.over) return;
  if (g.paused) Sfx.play('resume');
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
function currentRank() {
  let best = null;
  for (const r of RANKS) if (save.versus.beaten[r.id]) best = r;
  return best;
}
function nextRankIdx() {
  const cur = currentRank();
  return cur ? Math.min(RANKS.length - 1, RANKS.indexOf(cur) + 1) : 0;
}

function bestText(mode) {
  if (mode === 'versus') { const r = currentRank(); return r ? r.name : 'Unranked'; }
  if (mode === 'ranked') { const R = save.ranked; return R.w + R.l ? `${RANKS[R.tier].name} ${R.lp} LP` : 'Unranked'; }
  const b = save.best[mode];
  if (!b) return '—';
  if (mode === 'sprint' || mode === 'dig') return b.time ? fmt(b.time) : '—';
  if (mode === 'zen') return b.lines ? `${b.lines} lines` : '—';
  if (mode === 'versus') { const r = currentRank(); return r ? r.name : 'Unranked'; }
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
  if (ui.tab === 'profile') return renderProfile();
  if (ui.game && !ui.game.over && ui.screen !== 'menu') return renderGame();
  if (ui.screen === 'results' && ui.game) return renderResults(ui.game, ui.lastNew);
  if (ui.screen === 'ladder') return renderLadder();
  if (ui.screen === 'lobby') return renderLobby();
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
  Music.stop();
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
          <div class="b"><span>${id === 'versus' || id === 'ranked' ? 'Rank' : 'Best'}</span><b>${bestText(id)}</b></div>
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
  const cw = ui.cw || CW;
  const k = Math.max(1, Math.min(r.width / cw, r.height / CH)) * dpr;
  const w = Math.round(cw * k), h = Math.round(CH * k);
  if (ui.canvas.width !== w || ui.canvas.height !== h) {
    ui.canvas.width = w; ui.canvas.height = h;
    ui.ctx.setTransform(k, 0, 0, k, 0, 0);
    if (ui.game) drawFrame();
  }
}

function hudHtml(g) {
  const P = save.profile, vs = ui.vs;
  let sub = MODES[g.mode].name;
  if (vs?.ranked) {
    const R = save.ranked, t = RANKS[R.tier];
    sub = R.series ? `Promo series vs ${RANKS[R.tier + 1].name}` : `${t.name} · ${R.lp} LP`;
  }
  const me = `<div class="rt-pc"><div class="rt-scr"><canvas data-av="p"></canvas></div>
    <div><div class="nm">${escapeHtml(P.name || 'Summoner')}</div><div class="sub">${sub}</div></div></div>`;
  if (!vs) return `<div class="rt-hud2">${me}<span class="hk">Esc pause · R restart · V skin · M mute</span></div>`;
  return `<div class="rt-hud2">${me}<span class="rt-vsb">VS</span>
    <div class="rt-pc r"><div class="rt-scr" style="border-color:${vs.rank.color}"><canvas data-av="ai"></canvas></div>
    <div><div class="nm" style="color:${vs.rank.color}">${vs.rank.name} Bot</div><div class="sub">${vs.rank.pps.toFixed(2)} PPS</div></div></div></div>`;
}

function escapeHtml(t) { return String(t).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c])); }

function paintHudAvatars(ts) {
  const t = ts / 1000;
  const pc = ui.body.querySelector('canvas[data-av="p"]');
  if (pc) paintAvatar(pc, save.profile, Av.state('p', ui.game), t);
  const ac = ui.body.querySelector('canvas[data-av="ai"]');
  if (ac && ui.vs) paintAvatar(ac, aiProfile(ui.vs.idx), Av.state('ai', ui.vs.ai), t + 1.3);
}

function renderGame() {
  setTab('play');
  ui.screen = 'game';
  const g = ui.game, m = MODES[g.mode];
  ui.body.innerHTML = `
    ${hudHtml(g)}
    <div class="rt-stage">
      <canvas></canvas>
      <div class="rt-pause ${g.paused ? '' : 'rt-hidden'}">
        <div class="t">Paused</div>
        <button class="rt-btn pri" data-act="resume">Resume</button>
        ${ui.vs?.ranked ? `<button class="rt-btn ghost" data-act="surrender" style="color:var(--rt-red)">Surrender</button><div class="note">Surrendering counts as a loss</div>` : `
        <button class="rt-btn" data-act="restart">Restart</button>
        ${g.mode === 'zen' ? '<button class="rt-btn" data-act="endzen">End session</button>' : ''}
        <button class="rt-btn ghost" data-act="menu">${RESUMABLE.has(g.mode) ? 'Save & quit' : 'Quit'}</button>`}
      </div>
    </div>`;
  ui.canvas = ui.body.querySelector('.rt-stage canvas');
  ui.ctx = ui.canvas.getContext('2d');
  ui.pauseEl = ui.body.querySelector('.rt-pause');
  ui.cw = g.mode === 'versus' ? VS_W : CW;
  ui.canvas.width = ui.cw; ui.canvas.height = CH;
  ui.ro?.disconnect();
  ui.ro = new ResizeObserver(() => fitCanvas());
  ui.ro.observe(ui.body.querySelector('.rt-stage'));
  requestAnimationFrame(fitCanvas);
  drawFrame();
}

function drawFrame() {
  const g = ui.game;
  if (!g || !ui.ctx) return;
  if (g.mode === 'versus' && ui.vs) { ui.ctx.clearRect(0, 0, VS_W, CH); render(ui.ctx, g); renderVersusSide(ui.ctx, ui.vs); }
  else render(ui.ctx, g);
}

function renderResults(g, isNew) {
  setTab('play');
  ui.screen = 'results'; ui.lastScreen = 'results';
  ui.canvas = null; ui.ctx = null; ui.ro?.disconnect(); ui.ro = null;
  if (g.mode === 'versus' && ui.vs?.ranked) return renderRankedResults(g);
  if (g.mode === 'versus' && ui.vs) return renderVersusResults(g);
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
      <div class="rt-stats" style="grid-template-columns:repeat(4,1fr)">${cells.map(([k, v]) => `<div><span>${k}</span><b>${v}</b></div>`).join('')}</div>
      ${ui.sessionAch.length ? `<div class="rt-sec" style="text-align:left">Unlocked</div><div class="rt-unl">${ui.sessionAch.map(id => {
        const a = ACH.find(x => x.id === id);
        return `<div><i>${achIcon(a.id)}</i><b>${a.name}</b><span>${a.desc}</span></div>`;
      }).join('')}</div>` : ''}
      <div class="rt-actions">
        <button class="rt-btn ghost" data-act="menu">Modes</button>
        <button class="rt-btn pri" data-act="again">Play again</button>
      </div>
    </div>`;
}

function renderVersusResults(g) {
  const vs = ui.vs, r = vs.rank, promoted = ui.vsPromoted;
  const cells = [
    ['Sent', g.sent], ['Received', g.received], ['Lines', g.lines], ['PPS', pps(g)],
    ['Tetrises', g.stats.tetrises], ['T-Spins', g.stats.tspins], ['Max combo', Math.max(0, g.stats.maxCombo)], ['Time', fmt(g.elapsed)],
  ];
  const hasNext = vs.idx < RANKS.length - 1;
  ui.body.innerHTML = `
    <div class="rt-res">
      <div class="k">Versus ${r.name} AI</div>
      <div class="big" style="color:${g.won ? 'var(--rt-gold)' : 'var(--rt-red)'}">${g.won ? 'Victory' : 'Defeat'}</div>
      ${promoted ? `<div style="display:flex;align-items:center;justify-content:center;gap:10px;margin:6px 0 2px">${rankEmblem(r, 40)}
        <div style="text-align:left"><div class="pb">Rank up!</div><div style="font-size:13px">You're now <b style="color:${r.color}">${r.name}</b></div></div></div>`
        : `<div class="pb o">Your rank: ${bestText('versus')}</div>`}
      <div class="rt-stats" style="grid-template-columns:repeat(4,1fr)">${cells.map(([k, v]) => `<div><span>${k}</span><b>${v}</b></div>`).join('')}</div>
      ${ui.sessionAch.length ? `<div class="rt-sec" style="text-align:left">Unlocked</div><div class="rt-unl">${ui.sessionAch.map(id => {
        const a = ACH.find(x => x.id === id);
        return `<div><i>${achIcon(a.id)}</i><b>${a.name}</b><span>${a.desc}</span></div>`;
      }).join('')}</div>` : ''}
      <div class="rt-actions">
        <button class="rt-btn ghost" data-act="ladder">Ranks</button>
        <button class="rt-btn" data-act="again">Rematch</button>
        ${g.won && hasNext ? `<button class="rt-btn pri" data-act="nextrank">Fight ${RANKS[vs.idx + 1].name}</button>` : ''}
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
  const histMain = h => h.mode === 'versus' || h.mode === 'ranked' ? `${h.won ? 'Won' : 'Lost'} vs ${h.rank || 'AI'}` : (h.mode === 'sprint' || h.mode === 'dig') && h.won ? fmt(h.elapsed) : h.mode === 'zen' ? `${h.lines} lines` : `${num(h.score)} pts`;
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
      return `<div class="rt-ach ${on ? 'on' : ''}" ${on ? `data-act="achprev:${a.id}" title="Click to show the popup again"` : ''}><div class="ic">${achIcon(a.id)}${on ? '' : `<span class="lk">${ICON_LOCK}</span>`}</div>
        <div class="t"><div class="n">${a.name}</div><div class="d">${a.desc}</div></div>
        ${on ? `<div class="dt">${date(save.ach[a.id])}</div>` : ''}</div>`;
    }).join('')}`;
}

function renderSettings() {
  setTab('settings');
  ui.screen = 'settings'; ui.resetArmed = false;
  const s = save.settings;
  const range = (key, label, hint, min, max, unit = 'ms') => `
    <div class="rt-row"><div class="l">${label}<small>${hint}</small></div>
      <div><input type="range" data-set="${key}" data-unit="${unit}" min="${min}" max="${max}" step="1" value="${s[key]}"><span class="v" data-val="${key}">${s[key]}${unit === '%' ? '%' : ' ' + unit}</span></div></div>`;
  const check = (key, label, hint) => `
    <label class="rt-row"><div class="l">${label}<small>${hint}</small></div><input class="rt-chk" type="checkbox" data-set="${key}" ${s[key] ? 'checked' : ''}></label>`;
  const keys = [
    ['Move', '← →'], ['Soft drop', '↓'], ['Hard drop', 'Space'], ['Rotate right', '↑ / X'],
    ['Rotate left', 'Z / Ctrl'], ['Rotate 180°', 'A'], ['Hold', 'C / Shift'], ['Pause', 'Esc / P'],
    ['Restart', 'R'], ['Change skin', 'V'], ['Mute all', 'M'], ['Open / close', 'Alt+T / F8'], ['Quick start', '1 – 7'],
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

    <div class="rt-sec rt-gap">Sound</div>
    ${check('sfx', 'Sound effects', 'Each skin has its own sound')}
    ${range('sfxVol', 'Effects volume', 'Moves, clears, alerts', 0, 100, '%')}
    ${check('music', 'Music', Music.missing ? 'Built-in chiptune. Drop a music.mp3 in the plugin folder to use your own.' : 'Playing music.mp3 from the plugin folder')}
    ${range('musicVol', 'Music volume', 'Speeds up as the level rises', 0, 100, '%')}
    ${check('muted', 'Mute everything', 'Shortcut: M')}
    <div class="rt-actions" style="margin-top:8px"><button class="rt-btn sm ghost" data-act="sfxtest">Test sound</button></div>

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
  if (e.target.dataset?.prof === 'name') {
    save.profile.name = e.target.value.replace(/[<>]/g, '').slice(0, 16);
    persist();
    return;
  }
  const key = e.target.dataset?.set;
  if (!key) return;
  if (e.target.type === 'checkbox') save.settings[key] = e.target.checked;
  else {
    save.settings[key] = Number(e.target.value);
    const v = ui.body.querySelector(`[data-val="${key}"]`);
    const unit = e.target.dataset.unit || 'ms';
    if (v) v.textContent = unit === '%' ? `${e.target.value}%` : `${e.target.value} ${unit}`;
  }
  persist(); updateFab(); Music.refresh();
  if (key === 'sfx' && e.target.checked) Sfx.play('test');
}

function onSettingChange(e) {
  if (e.target.dataset?.set === 'sfxVol') Sfx.play('test');
}

function onClick(e) {
  const b = e.target.closest('[data-act]');
  if (!b) return;
  const act = b.dataset.act;
  if (act !== 'resume' && act !== 'sfxtest') Sfx.play('ui');
  if (act.startsWith('tab:')) return goTab(act.slice(4));
  if (act.startsWith('skin:')) return setSkin(act.slice(5));
  if (act.startsWith('link:')) return openLink(act.slice(5));
  if (act.startsWith('achprev:')) return achPopup(act.slice(8));
  if (act.startsWith('prof:')) {
    const [, key, val] = act.split(':');
    save.profile[key] = key === 'color' ? +val : val;
    if (key === 'char') save.profile.color = null;
    persist(); renderProfile();
    ui.profReact = { state: 'happy', until: performance.now() + 700 };
    return;
  }
  if (act.startsWith('react:')) { ui.profReact = { state: act.slice(6), until: performance.now() + 1600 }; return; }
  if (act.startsWith('rank:')) {
    const i = +act.slice(5);
    if (e.detail >= 2) return startVersus(i);
    ui.ladderSel = i;
    ui.body.querySelectorAll('.rt-mode').forEach(r => r.classList.toggle('on', r.dataset.act === act));
    const f = ui.body.querySelector('[data-act="fight"]'); if (f) f.textContent = `Fight ${RANKS[i].name}`;
    return;
  }
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
    case 'sfxtest': return Sfx.play('test');
    case 'menu': return renderMenu();
    case 'resume': return resumeGame();
    case 'restart': return ui.vs?.ranked ? null : ui.game.mode === 'versus' ? startVersus(ui.vs.idx) : startGame(ui.game.mode);
    case 'surrender': if (ui.game && !ui.game.over) { ui.game.paused = false; ui.pauseEl?.classList.add('rt-hidden'); ui.game.finish(false); } return;
    case 'queue': return startRanked();
    case 'lobby': return renderLobby();
    case 'fight': return startVersus(ui.ladderSel ?? nextRankIdx());
    case 'climb': return startVersus(nextRankIdx());
    case 'ladder': return renderLadder();
    case 'nextrank': return startVersus((ui.vs?.idx ?? 0) + 1);
    case 'again': return ui.lastMode === 'ranked' ? startRanked() : ui.lastMode === 'versus' && ui.vs ? startVersus(ui.vs.idx) : startGame(ui.lastMode);
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
const HOOKS = () => ({ onClear, onFinish, sfx: (n, d) => { Sfx.play(n, d); Av.event('p', n, d); } });

/* ---------- Ranked Solo ---------- */
function applyRanked(won, g) {
  const R = save.ranked, top = RANKS.length - 1;
  const before = { tier: R.tier, lp: R.lp, series: R.series ? { ...R.series } : null };
  let delta = 0, event = null;
  if (won) R.w++; else R.l++;
  if (R.series) {
    if (won) R.series.w++; else R.series.l++;
    if (R.series.w >= 2) {
      const clean = R.series.l === 0;
      R.tier = Math.min(top, R.tier + 1); R.lp = 0; R.series = null; R.tw = 0; R.tl = 0; R.zeroL = 0;
      event = 'promoted';
      unlock('rk_promo'); if (clean) unlock('rk_clean');
    } else if (R.series.l >= 2) { R.series = null; R.lp = 70; event = 'series_lost'; }
    else event = 'series';
  } else if (won) {
    R.tw++; R.zeroL = 0;
    delta = LP_WIN + (g.received === 0 ? 3 : 0) + Math.min(5, Math.floor(Math.max(0, g.sent - g.received) / 6));
    R.lp += delta;
    if (R.tier < top && R.lp >= 100) { R.lp = 100; R.series = { w: 0, l: 0 }; event = 'series_start'; }
  } else {
    R.tl++;
    if (R.lp === 0) R.zeroL++;
    delta = -Math.min(R.lp, LP_LOSS);
    R.lp += delta;
    const sh = SHIELD[R.tier];
    if (R.tier > 0 && (R.zeroL > sh || R.tl - R.tw >= sh + 2)) {
      R.tier--; R.lp = 75; R.tw = 0; R.tl = 0; R.zeroL = 0; event = 'demoted';
    }
  }
  R.peak = Math.max(R.peak, R.tier);
  if (won) unlock('rk_first');
  if (R.tier >= 3) unlock('rk_gold');
  if (R.tier >= 6) unlock('rk_diamond');
  if (R.tier >= 9) unlock('rk_challenger');
  ui.rk = { won, delta, event, before, after: { tier: R.tier, lp: R.lp, series: R.series ? { ...R.series } : null } };
  persist();
}

function shieldText(R) {
  if (R.tier === 0) return "Iron can't be demoted.";
  const sh = SHIELD[R.tier];
  const zeroLeft = Math.max(0, sh - R.zeroL);
  const gap = R.tl - R.tw, gapLeft = sh + 2 - gap;
  return `Demotion shield: ${R.lp === 0 ? `${zeroLeft} more loss${zeroLeft === 1 ? '' : 'es'} at 0 LP` : `kicks in at 0 LP (${sh} losses)`} · tier record ${R.tw}W ${R.tl}L (drop at ${gapLeft} more net loss${gapLeft === 1 ? '' : 'es'})`;
}

function seriesDots(series) {
  const dots = [];
  for (let i = 0; i < series.w; i++) dots.push('<span class="w">✓</span>');
  for (let i = 0; i < series.l; i++) dots.push('<span class="l">✕</span>');
  while (dots.length < 3) dots.push('<span></span>');
  return `<div class="rt-dots">${dots.join('')}</div>`;
}

function rankCard(R) {
  const t = RANKS[R.tier], top = R.tier === RANKS.length - 1;
  return `<div class="rt-rk">${rankEmblem(t, 72)}
    <div style="flex:1;min-width:0">
      <div class="tier" style="color:${t.color}">${t.name}</div>
      ${R.series ? `<div style="font-size:12px">Promotion series vs <b style="color:${RANKS[R.tier + 1].color}">${RANKS[R.tier + 1].name}</b> · win 2 of 3</div>${seriesDots(R.series)}`
        : `<div class="rt-lp"><i style="width:${Math.min(100, R.lp)}%;background:${t.color}"></i></div><div style="font-size:12px"><b>${R.lp} LP</b>${top ? '' : ' / 100'}</div>`}
    </div></div>`;
}

function renderLobby() {
  setTab('play');
  ui.screen = 'lobby';
  const R = save.ranked, P = save.profile;
  const games = R.w + R.l;
  ui.body.innerHTML = `
    <div class="rt-sec">Ranked Solo · ${escapeHtml(P.name || 'Summoner')}</div>
    ${rankCard(R)}
    <div class="rt-note" style="margin-top:8px">${shieldText(R)}</div>
    <div class="rt-stats" style="grid-template-columns:repeat(4,1fr);margin-top:12px">
      <div><span>Season</span><b>${R.w}W ${R.l}L</b></div>
      <div><span>Win rate</span><b>${games ? Math.round(R.w / games * 100) + '%' : '—'}</b></div>
      <div><span>Peak</span><b style="color:${RANKS[R.peak].color}">${games ? RANKS[R.peak].name : '—'}</b></div>
      <div><span>Next opponent</span><b>${RANKS[R.series ? R.tier + 1 : R.tier].name} Bot</b></div>
    </div>
    <div class="rt-sec">How it works</div>
    <div class="rt-note">A win gives about +${LP_WIN} LP (more if you win cleanly) and a loss costs −${LP_LOSS}. At 100 LP you play a best-of-3 promotion series against the next tier's bot.
      At 0 LP your demotion shield starts counting down, and if you run out, or fall too many games below even in the tier, you drop a tier with 75 LP.
      There are no restarts here: surrendering or closing the client mid-game counts as a loss.</div>
    <div class="rt-actions">
      <button class="rt-btn ghost" data-act="menu">Modes</button>
      <span class="rt-sp"></span>
      <button class="rt-btn pri" data-act="queue">${R.series ? 'Play promo game' : 'Find match'}</button>
    </div>`;
}

function renderRankedResults(g) {
  const rk = ui.rk || {}, R = save.ranked, t = RANKS[R.tier];
  const cells = [
    ['Sent', g.sent], ['Received', g.received], ['Lines', g.lines], ['PPS', pps(g)],
    ['Tetrises', g.stats.tetrises], ['T-Spins', g.stats.tspins], ['Max combo', Math.max(0, g.stats.maxCombo)], ['Time', fmt(g.elapsed)],
  ];
  let banner = '';
  if (rk.event === 'promoted') banner = `<div class="rt-banner">${rankEmblem(t, 44)}<div><div class="pb">Promoted!</div><div>Welcome to <b style="color:${t.color}">${t.name}</b></div></div></div>`;
  else if (rk.event === 'demoted') banner = `<div class="rt-banner" style="border-color:var(--rt-red)">${rankEmblem(t, 44)}<div><div class="pb" style="color:var(--rt-red)">Demoted</div><div>Back to <b style="color:${t.color}">${t.name}</b> with 75 LP</div></div></div>`;
  else if (rk.event === 'series_start') banner = `<div class="rt-banner"><div><div class="pb">Promotion series!</div><div>Win 2 of 3 against the <b style="color:${RANKS[R.tier + 1].color}">${RANKS[R.tier + 1].name}</b> bot</div></div></div>`;
  else if (rk.event === 'series') banner = `<div class="rt-banner"><div><div class="pb">Promotion series</div>${seriesDots(R.series)}</div></div>`;
  else if (rk.event === 'series_lost') banner = `<div class="rt-banner" style="border-color:var(--rt-red)"><div><div class="pb" style="color:var(--rt-red)">Series lost</div><div>Back to 70 LP, so you'll get another shot</div></div></div>`;
  const lpLine = rk.delta ? `<div style="font-size:16px;font-weight:700;margin-top:4px;color:${rk.delta > 0 ? 'var(--rt-teal)' : 'var(--rt-red)'}">${rk.delta > 0 ? '+' : ''}${rk.delta} LP</div>` : '';
  ui.body.innerHTML = `
    <div class="rt-res">
      <div class="k">Ranked Solo · vs ${ui.vs.rank.name} Bot</div>
      <div class="big" style="color:${g.won ? 'var(--rt-gold)' : 'var(--rt-red)'}">${g.won ? 'Victory' : 'Defeat'}</div>
      ${lpLine}
      ${banner}
      <div style="margin-top:12px;text-align:left">${rankCard(R)}</div>
      <div class="rt-stats" style="grid-template-columns:repeat(4,1fr)">${cells.map(([k, v]) => `<div><span>${k}</span><b>${v}</b></div>`).join('')}</div>
      ${ui.sessionAch.length ? `<div class="rt-sec" style="text-align:left">Unlocked</div><div class="rt-unl">${ui.sessionAch.map(id => {
        const a = ACH.find(x => x.id === id);
        return `<div><i>${achIcon(a.id)}</i><b>${a.name}</b><span>${a.desc}</span></div>`;
      }).join('')}</div>` : ''}
      <div class="rt-actions">
        <button class="rt-btn ghost" data-act="lobby">Lobby</button>
        <button class="rt-btn pri" data-act="queue">${R.series ? 'Next promo game' : 'Play again'}</button>
      </div>
    </div>`;
}

/* ---------- Profile ---------- */
function renderProfile() {
  setTab('profile');
  ui.screen = 'profile';
  const P = save.profile;
  const C = CHARS[P.char] || CHARS.cat;
  const colorIdx = P.color ?? C.color;
  const itemChips = (list, key) => list.map(it => {
    const ok = unlockedItem(it);
    return `<button class="rt-chip2 ${P[key] === it.id ? 'on' : ''} ${ok ? '' : 'lock'}" data-act="${ok ? `prof:${key}:${it.id}` : ''}" title="${ok ? it.name : 'Locked: ' + it.hint}">
      <canvas data-pv="${key}:${it.id}"></canvas><span class="tx"><span>${it.name}${ok ? '' : ` ${ICON_LOCK}`}</span>${ok ? '' : `<small>${it.hint}</small>`}</span></button>`;
  }).join('');
  ui.body.innerHTML = `
    <div class="rt-prof">
      <div class="big">
        <div class="rt-scr"><canvas data-av="prof"></canvas></div>
        <div class="rt-react">
          ${['happy', 'excited', 'hurt', 'sad', 'cheer'].map(s => `<button class="rt-btn sm ghost" data-act="react:${s}">${s}</button>`).join('')}
        </div>
      </div>
      <div style="flex:1;min-width:0">
        <div class="rt-sec">Player name</div>
        <input class="rt-inp" maxlength="16" data-prof="name" value="${escapeHtml(P.name || '')}" placeholder="Summoner">
        <div class="rt-note" style="margin-top:4px">Shows up next to your screen while you play and in Ranked.</div>
        <div class="rt-sec rt-gap">Character</div>
        <div class="rt-chips2">${CHAR_ORDER.map(id => `<button class="rt-chip2 ${P.char === id ? 'on' : ''}" data-act="prof:char:${id}"><canvas data-pv="char:${id}"></canvas>${CHARS[id].name}</button>`).join('')}</div>
        <div class="rt-sec rt-gap">Color</div>
        <div class="rt-chips2">${BODY_COLORS.map((c, i) => `<button class="rt-sw ${colorIdx === i ? 'on' : ''}" style="background:${c}" data-act="prof:color:${i}"></button>`).join('')}</div>
      </div>
    </div>
    <div class="rt-sec rt-gap">Hat</div>
    <div class="rt-chips2">${itemChips(HATS, 'hat')}</div>
    <div class="rt-sec rt-gap">Face</div>
    <div class="rt-chips2">${itemChips(FACES, 'face')}</div>
    ${creditsHtml()}`;
  ui.profReact = { state: 'idle', until: 0 };
  // small previews are static: paint once
  const t0 = 0.3;
  ui.body.querySelectorAll('canvas[data-pv]').forEach(c => {
    const [key, id] = c.dataset.pv.split(':');
    const prof = { ...P, [key]: id };
    if (key === 'char') prof.color = P.color;
    paintAvatar(c, prof, 'idle', t0);
  });
}

function paintProfile(ts) {
  const c = ui.body.querySelector('canvas[data-av="prof"]');
  if (!c) return;
  const r = ui.profReact || { state: 'idle', until: 0 };
  if (r.state !== 'idle' && performance.now() > r.until) r.state = 'idle';
  paintAvatar(c, save.profile, r.state, ts / 1000);
}

function renderLadder() {
  setTab('play');
  ui.screen = 'ladder';
  if (ui.ladderSel == null) ui.ladderSel = nextRankIdx();
  const cur = currentRank(), nxt = nextRankIdx();
  ui.body.innerHTML = `
    <div class="rt-sec">Versus AI · Ranked</div>
    <div class="rt-note" style="margin-bottom:10px">Clear lines to send garbage, and the first one to top out loses. Beat a rank to earn its achievement, then climb to the next one.
      Your rank: <b style="color:${cur ? cur.color : 'var(--rt-text)'}">${cur ? cur.name : 'Unranked'}</b></div>
    <div class="rt-list">
      ${RANKS.map((r, i) => {
        const rec = save.versus.rec[r.id] || { w: 0, l: 0 };
        const beaten = !!save.versus.beaten[r.id];
        return `<div class="rt-mode ${ui.ladderSel === i ? 'on' : ''}" data-act="rank:${i}">
          <span style="flex:0 0 40px;display:grid;place-items:center">${rankEmblem(r, 34)}</span>
          <div class="t">
            <div class="n" style="color:${r.color}">${r.name}${i === nxt && !beaten ? '<span class="rt-tagnow">Next</span>' : ''}${beaten ? '<span class="rt-tagnow" style="color:var(--rt-gold);border-color:var(--rt-gold)">Beaten</span>' : ''}</div>
            <div class="d">${r.pps.toFixed(2)} pieces/s · ${rankDesc(r)}${r.hold ? ' · uses hold' : ''}</div>
          </div>
          <div class="b"><span>Record</span><b>${rec.w}W ${rec.l}L</b></div>
        </div>`;
      }).join('')}
    </div>
    <div class="rt-actions">
      <button class="rt-btn ghost" data-act="menu">Modes</button>
      <span class="rt-sp"></span>
      <button class="rt-btn" data-act="climb" title="Fight the next rank you haven't beaten">Climb</button>
      <button class="rt-btn pri" data-act="fight">Fight ${RANKS[ui.ladderSel].name}</button>
    </div>`;
}

function startVersus(idx, ranked = false) {
  idx = Math.max(0, Math.min(RANKS.length - 1, idx));
  Av.reset();
  const rank = RANKS[idx];
  ui.sessionAch = []; ui.lastMode = ranked ? 'ranked' : 'versus'; ui.sel = ranked ? 'ranked' : 'versus'; if (!ranked) ui.ladderSel = idx; ui.autosave = 0;
  resetInput(); hideTurn(); setFocused(true);
  const player = new Game('versus', HOOKS());
  player.ranked = ranked;
  player.sdf = save.settings.sdf;
  const ai = new Game('versus', {
    onAttack: (_, n) => { player.receive(n); if (n >= 4) Sfx.play('warn'); },
    sfx: (n, d) => Av.event('ai', n, d),
    onFinish: () => {
      ai.ko = true;
      if (player.over) return;
      Sfx.play('ko');
      player.won = true;
      player.finish(true);
    },
  });
  player.hooks.onAttack = (_, n) => ai.receive(n);
  ui.vs = { rank, idx, player, ai, bot: new Bot(ai, rank), ranked };
  ui.game = player;
  Music.stop(); Music.setRate(1);
  persist();
  renderGame();
}

function startRanked() {
  const R = save.ranked;
  const opp = R.series ? Math.min(RANKS.length - 1, R.tier + 1) : R.tier;
  startVersus(opp, true);
}

function startGame(mode) {
  if (!MODES[mode]) return;
  if (mode === 'ranked') { if (ui.game && !ui.game.over) storeResume(); ui.sel = 'ranked'; return renderLobby(); }
  if (mode === 'versus') { if (ui.game && !ui.game.over) storeResume(); ui.sel = 'versus'; ui.ladderSel = null; return renderLadder(); }
  ui.vs = null; Av.reset();
  if (ui.game && !ui.game.over) storeResume();
  if (save.resume && save.resume.mode === mode) clearResume();
  ui.sessionAch = []; ui.lastMode = mode; ui.sel = mode; ui.autosave = 0;
  resetInput(); hideTurn(); setFocused(true);
  ui.game = new Game(mode, HOOKS());
  ui.game.sdf = save.settings.sdf;
  Music.stop(); Music.setRate(1);
  persist();
  renderGame();
}

function continueSaved() {
  const r = save.resume;
  if (!r || !MODES[r.mode]) return renderMenu();
  ui.sessionAch = []; ui.lastMode = r.mode; ui.sel = r.mode; ui.autosave = 0;
  resetInput(); hideTurn(); setFocused(true);
  ui.vs = null; Av.reset();
  ui.game = Game.restore(r, HOOKS());
  ui.game.sdf = save.settings.sdf;
  Music.stop();
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

let achQueueAt = 0;
function achPopup(id, silent = false) {
  const a = ACH.find(x => x.id === id);
  if (!a || !ui.achpop) return;
  // several unlocks at once come in one after another, like Steam
  const now = Date.now(), at = Math.max(now, achQueueAt);
  achQueueAt = at + 700;
  setTimeout(() => {
    const p = el(`<div class="rt-ap"><div class="ico">${achIcon(id)}</div>
      <div class="tx"><div class="k">Achievement unlocked</div><div class="n">${a.name}</div><div class="d">${a.desc}</div></div></div>`);
    ui.achpop.appendChild(p);
    requestAnimationFrame(() => requestAnimationFrame(() => p.classList.add('in')));
    if (!silent) Sfx.play('ach');
    setTimeout(() => { p.classList.remove('in'); p.classList.add('out'); }, 5000);
    setTimeout(() => p.remove(), 5600);
  }, at - now);
}

function unlock(id) {
  if (save.ach[id]) return;
  save.ach[id] = Date.now();
  ui.sessionAch.push(id);
  persist();
  achPopup(id);
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
  Music.stop();
  if (save.resume && save.resume.mode === g.mode) clearResume();
  const t = save.totals;
  t.games++; t.lines += g.lines; t.tetrises += g.stats.tetrises; t.tspins += g.stats.tspins;
  t.playMs += g.elapsed; t.pieces += g.stats.pieces;
  const modeKey = g.mode === 'versus' && ui.vs?.ranked ? 'ranked' : g.mode;
  save.played[modeKey] = (save.played[modeKey] || 0) + 1;
  save.skinsUsed[save.settings.skin] = true;
  save.history.unshift({ mode: modeKey, score: g.score, lines: g.lines, elapsed: g.elapsed, won: g.won, at: Date.now(), rank: g.mode === 'versus' && ui.vs ? ui.vs.rank.name : undefined });
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
  ui.vsPromoted = false;
  if (g.mode === 'versus' && ui.vs) {
    ui.vs.ai.over = true;
    if (!g.won) Av.set('ai', 'cheer', 0);
  }
  if (g.mode === 'versus' && ui.vs?.ranked) applyRanked(g.won, g);
  else if (g.mode === 'versus' && ui.vs) {
    const r = ui.vs.rank;
    const rec = save.versus.rec[r.id] || { w: 0, l: 0 };
    if (g.won) rec.w++; else rec.l++;
    save.versus.rec[r.id] = rec;
    if (g.won) {
      const before = currentRank();
      if (!save.versus.beaten[r.id]) save.versus.beaten[r.id] = Date.now();
      const after = currentRank();
      ui.vsPromoted = !!after && after !== before && after.id === r.id;
      unlock('vs_' + r.id);
      if (g.received === 0 && ui.vs.idx >= 3) unlock('vs_flawless');
      isNew = ui.vsPromoted;
    }
  }
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
function syncMusic(g) {
  const want = ui.open && ui.focused && ui.screen === 'game' && g && !g.over && !g.paused && g.countdown <= 0 && Music.vol() > 0;
  if (want) {
    Music.setRate(1 + (Math.min(g.level, 10) - 1) * 0.03);
    if (!Music.playing) Music.start();
  } else if (Music.playing) Music.pause();
}

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
    syncMusic(g);
    if (ui.screen === 'profile') paintProfile(ts);
    if (!g || !ui.ctx || ui.screen !== 'game') return;
    paintHudAvatars(ts);
    if (!g.paused && !g.over && g.countdown <= 0) das(dt);
    g.soft = ui.input.down && !g.paused;
    g.sdf = save.settings.sdf;
    g.update(dt);
    if (g.mode === 'versus' && ui.vs && !g.paused && !g.over) {
      ui.vs.ai.paused = false;
      ui.vs.ai.update(dt);
      ui.vs.bot.update(dt);
    } else if (ui.vs) ui.vs.ai.paused = true;
    drawFrame();
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
  'KeyC', 'ShiftLeft', 'ShiftRight', 'ControlLeft', 'ControlRight', 'Escape', 'KeyP', 'KeyR', 'KeyV', 'KeyM', 'Enter']);

function toggleMute() {
  save.settings.muted = !save.settings.muted;
  persist(); Music.refresh();
  if (!save.settings.muted) Sfx.play('test');
  toast('Sound', save.settings.muted ? 'Muted' : 'Sound on', 'Press M to toggle', 1300);
  if (ui.screen === 'settings') renderSettings();
}

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
      if (/^Digit[1-7]$/.test(e.code)) { stop(); return startGame(MODE_ORDER[+e.code.slice(5) - 1]); }
      if (e.code === 'ArrowDown' || e.code === 'ArrowUp') {
        stop();
        const i = MODE_ORDER.indexOf(ui.sel) + (e.code === 'ArrowDown' ? 1 : -1);
        ui.sel = MODE_ORDER[(i + MODE_ORDER.length) % MODE_ORDER.length];
        ui.body.querySelectorAll('.rt-mode').forEach(r => r.classList.toggle('on', r.dataset.act === `sel:${ui.sel}`));
        return;
      }
      if (e.code === 'Enter' || e.code === 'Space') { stop(); return startGame(ui.sel); }
    }
    if (ui.screen === 'results' && (e.code === 'KeyR' || e.code === 'Enter')) { stop(); return ui.lastMode === 'ranked' ? startRanked() : ui.lastMode === 'versus' && ui.vs ? startVersus(ui.vs.idx) : startGame(ui.lastMode); }
    if (ui.screen === 'lobby') {
      if (e.code === 'Enter' || e.code === 'Space') { stop(); return startRanked(); }
      if (e.code === 'Escape') { stop(); return renderMenu(); }
    }
    if (ui.screen === 'ladder') {
      if (e.code === 'ArrowDown' || e.code === 'ArrowUp') {
        stop();
        ui.ladderSel = Math.max(0, Math.min(RANKS.length - 1, (ui.ladderSel ?? 0) + (e.code === 'ArrowDown' ? 1 : -1)));
        return renderLadder();
      }
      if (e.code === 'Enter' || e.code === 'Space') { stop(); return startVersus(ui.ladderSel ?? nextRankIdx()); }
      if (e.code === 'Escape') { stop(); return renderMenu(); }
    }
    if (e.code === 'KeyV') { stop(); return cycleSkin(); }
    if (e.code === 'KeyM') { stop(); return toggleMute(); }
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
  if (e.code === 'KeyM') { if (!e.repeat) toggleMute(); return; }
  if (e.code === 'Escape' || e.code === 'KeyP') {
    if (g.over) return;
    if (!ui.turn.classList.contains('rt-hidden')) { hideTurn(); return; }
    return g.paused ? resumeGame() : pauseGame();
  }
  if (e.code === 'KeyR') { if (!e.repeat && !ui.vs?.ranked) (g.mode === 'versus' ? startVersus(ui.vs.idx) : startGame(g.mode)); return; }
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
  on(window, 'beforeunload', () => { if (ui.vs?.ranked && ui.game && !ui.game.over && ui.game.elapsed > 0) applyRanked(false, ui.game); storeResume(); persist(); });
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
  try { Music.stop(); } catch {}
  ui.ro?.disconnect();
  for (const id of ['rt-root', 'rt-fab', 'rt-toasts', 'rt-achpop', 'rt-style']) document.getElementById(id)?.remove();
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
