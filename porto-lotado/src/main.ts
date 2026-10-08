import '@fontsource/big-shoulders-stencil-display/latin-800';
import '@fontsource/big-shoulders-stencil-display/latin-900';
import '@fontsource/barlow-condensed/latin-500';
import '@fontsource/barlow-condensed/latin-600';
import '@fontsource/barlow-condensed/latin-700';
import './styles.css';
import { App } from '@capacitor/app';
import { ECONOMY, isNative } from './config';
import { COLORS, SYMBOLS } from './game/colors';
import {
  CAP, CODES, applyMove, canMove, clone, genLevel, hasMoves, isDone, isWon, portFor, rewardFor, solve, topRun,
  type Board,
} from './game/rules';
import { initAds, setAdSimulator, showInterstitial, showRewarded, type AdKind } from './services/ads';
import { load, save as persist, feel, setSound, sfx } from './services/device';
import { buy, initPurchases, ownsNoAds, priceOf, restore, storeSimulated, type ProductId } from './services/purchases';

// ---------- estado ----------

interface Saved {
  lvl: number; coins: number; soundOn: boolean; noAds: boolean; goldHull: boolean;
  ships: Board; start: Board; codes: string[]; history: Board[]; undos: number; extraUsed: boolean; moves: number;
}

let lvl = 1, coins = 0, soundOn = true, noAds = false, goldHull = false;
let ships: Board = [], start: Board = [], codes: string[] = [], history: Board[] = [];
let sel = -1, undos = ECONOMY.freeUndosPerLevel, extraUsed = false, moves = 0, busy = false;
let hintTimer = 0;

const STATE_KEY = 'state';
const snapshot = (): Saved => ({ lvl, coins, soundOn, noAds, goldHull, ships, start, codes, history, undos, extraUsed, moves });
const save = () => persist(STATE_KEY, snapshot());

const $ = <T extends HTMLElement = HTMLElement>(id: string) => document.getElementById(id) as T;
const board = $('board');
const reduceMotion = () => matchMedia('(prefers-reduced-motion: reduce)').matches;

// ---------- desenho ----------

function boxHTML(c: number, lift: boolean): string {
  const d = COLORS[c];
  return `<div class="box${lift ? ' lift' : ''}" style="--c:${d.fill};--k:${d.ink}">`
    + `<svg viewBox="0 0 12 12" fill="currentColor">${SYMBOLS[d.symbol]}</svg></div>`;
}

function layout(): number {
  const n = ships.length, rows = n <= 5 ? 1 : 2, cols = Math.ceil(n / rows);
  const bw = board.clientWidth, bh = board.clientHeight;
  const gap = n > 8 ? 8 : 12, rowGap = 14;
  let w = Math.min(86, (bw - gap * (cols - 1) - 14 * cols) / cols);
  const shipH = (w: number) => w * 0.47 * 4.75 + 6 + w * 0.4 + 6;
  while (w > 28 && rows * shipH(w) + (rows - 1) * rowGap > bh) w -= 1;
  const root = document.documentElement.style;
  root.setProperty('--w', `${w.toFixed(1)}px`);
  root.setProperty('--h', `${(w * 0.47).toFixed(1)}px`);
  board.style.setProperty('--gap', `${gap}px`);
  board.style.setProperty('--rowgap', `${rowGap}px`);
  return cols;
}

function render(): void {
  const cols = layout();
  let html = '';
  for (let r = 0; r * cols < ships.length; r++) {
    html += '<div class="row">';
    for (let i = r * cols; i < Math.min(ships.length, (r + 1) * cols); i++) {
      const s = ships[i], run = topRun(s), done = isDone(s);
      const cls = ['ship', i === sel ? 'sel' : '', done ? 'done' : ''].filter(Boolean).join(' ');
      html += `<button class="${cls}" data-i="${i}" aria-label="Navio ${codes[i]}, ${s.length} de ${CAP} contêineres">`
        + `<div class="stack">${s.map((c, j) => boxHTML(c, i === sel && j >= s.length - run)).join('')}</div>`
        + `<div class="hull"><span>${done ? '✓ ' : ''}${codes[i]}</span></div></button>`;
    }
    html += '</div>';
  }
  board.innerHTML = html;
  $('lvl').textContent = String(lvl);
  $('port').textContent = portFor(lvl);
  $('coins').textContent = String(coins);
  const badge = $('undoBadge');
  badge.textContent = undos > 0 ? String(undos) : 'AD';
  badge.classList.toggle('ad', undos <= 0);
  $<HTMLButtonElement>('bUndo').disabled = !history.length;
  $<HTMLButtonElement>('bShip').disabled = extraUsed;
  $('tip').hidden = lvl > 2;
  document.documentElement.style.setProperty('--hullc', goldHull ? '#6b5413' : 'var(--hull)');
}

const shipEl = (i: number) => board.querySelector<HTMLElement>(`.ship[data-i="${i}"]`);
const topBoxes = (i: number, k: number) => {
  const all = shipEl(i)!.querySelectorAll<HTMLElement>('.box');
  return [...all].slice(all.length - k);
};
function flash(i: number, cls: string): void {
  const el = shipEl(i);
  if (!el) return;
  el.classList.remove(cls);
  void el.offsetWidth;
  el.classList.add(cls);
}

function sparks(i: number): void {
  const el = shipEl(i);
  if (!el || reduceMotion()) return;
  const r = el.getBoundingClientRect(), color = COLORS[ships[i][0]].fill;
  for (let n = 0; n < 14; n++) {
    const p = document.createElement('div');
    p.className = 'spark';
    p.style.background = n % 3 ? color : '#f4b42c';
    p.style.left = `${r.left + r.width / 2}px`;
    p.style.top = `${r.top + r.height * 0.35}px`;
    document.body.appendChild(p);
    const ang = Math.random() * Math.PI * 2, d = 40 + Math.random() * 60;
    p.animate([
      { transform: 'translate(0,0) rotate(0)', opacity: 1 },
      { transform: `translate(${Math.cos(ang) * d}px,${Math.sin(ang) * d - 30}px) rotate(${Math.random() * 540}deg)`, opacity: 0 },
    ], { duration: 650 + Math.random() * 300, easing: 'cubic-bezier(.2,.7,.4,1)' }).onfinish = () => p.remove();
  }
}

// ---------- jogadas ----------

function clearHint(): void {
  clearTimeout(hintTimer);
  board.querySelectorAll('.hint').forEach(e => e.classList.remove('hint'));
}

function doMove(a: number, b: number): boolean {
  const k = canMove(ships, a, b);
  if (!k) return false;
  clearHint();
  // Posição de saída de cada contêiner, do topo para baixo (o primeiro a sair cai primeiro no destino).
  const from = topBoxes(a, k).reverse().map(e => e.getBoundingClientRect());
  history.push(clone(ships));
  applyMove(ships, a, b, k);
  moves++;
  sel = -1;
  render();

  busy = true;
  sfx.pick();
  feel('tap');
  const dst = topBoxes(b, k);
  let left = dst.length;
  dst.forEach((el, n) => {
    const fr = from[n], to = el.getBoundingClientRect();
    el.style.visibility = 'hidden';
    const done = () => { fl.remove(); el.style.visibility = ''; if (--left === 0) afterMove(b); };
    const fl = el.cloneNode(true) as HTMLElement;
    fl.classList.remove('lift');
    fl.classList.add('flyer');
    Object.assign(fl.style, { left: `${to.left}px`, top: `${to.top}px`, width: `${to.width}px`, height: `${to.height}px`, visibility: 'visible' });
    document.body.appendChild(fl);
    if (reduceMotion()) { done(); return; }
    const dx = fr.left - to.left, dy = fr.top - to.top, lift = Math.min(fr.top, to.top) - to.top - 40;
    fl.animate([
      { transform: `translate(${dx}px,${dy}px)` },
      { transform: `translate(${dx}px,${lift}px)`, offset: 0.3 },
      { transform: `translate(0,${lift}px)`, offset: 0.7 },
      { transform: 'translate(0,0)' },
    ], { duration: 420, delay: n * 55, easing: 'ease-in-out', fill: 'backwards' }).onfinish = done;
  });
  return true;
}

function afterMove(b: number): void {
  busy = false;
  sfx.drop();
  feel('drop');
  if (isDone(ships[b])) { flash(b, 'pop'); sfx.horn(); sparks(b); feel('complete'); }
  if (isWon(ships)) setTimeout(win, 500);
  else if (!hasMoves(ships)) setTimeout(stuck, 350);
  save();
}

function tap(i: number): void {
  if (busy) return;
  if (sel === -1) {
    if (!ships[i].length || isDone(ships[i])) { flash(i, 'shake'); sfx.bad(); return; }
    sel = i;
    sfx.pick();
    feel('tap');
    render();
    return;
  }
  if (sel === i) { sel = -1; render(); return; }
  if (doMove(sel, i)) return;
  sfx.bad();
  feel('bad');
  const prev = sel;
  sel = ships[i].length && !isDone(ships[i]) ? i : -1;
  render();
  flash(prev, 'shake');
}

board.addEventListener('click', e => {
  const s = (e.target as HTMLElement).closest<HTMLElement>('.ship');
  if (s) tap(Number(s.dataset.i));
});

// ---------- janelas ----------

const modal = $('modal'), card = $('card');
interface ModalButton { label: string; cls?: string; onClick?: () => void }

function showModal(html: string, buttons: ModalButton[] = []): void {
  card.innerHTML = `${html}<div class="btns"></div>`;
  const wrap = card.querySelector('.btns')!;
  for (const b of buttons) {
    const el = document.createElement('button');
    el.className = `btn ${b.cls ?? ''}`;
    el.textContent = b.label;
    if (b.onClick) el.onclick = b.onClick;
    wrap.appendChild(el);
  }
  modal.hidden = false;
  wrap.querySelector('button')?.focus({ preventScroll: true });
}
const hideModal = () => { modal.hidden = true; };

let toastTimer = 0;
function toast(msg: string): void {
  const t = $('toast');
  t.textContent = msg;
  t.classList.add('on');
  clearTimeout(toastTimer);
  toastTimer = window.setTimeout(() => t.classList.remove('on'), 2200);
}

// Anúncio falso para o navegador. No app, o AdMob mostra o anúncio de verdade por cima do jogo.
function simulateAd(kind: AdKind): Promise<boolean> {
  return new Promise(resolve => {
    const secs = kind === 'interstitial' ? 3 : 4;
    showModal(`<p class="fine">${kind === 'interstitial' ? 'Anúncio entre níveis' : 'Anúncio com recompensa'} (simulado)</p>
      <div class="adbox"><strong>ESPAÇO DO ANÚNCIO</strong><span>No app, aqui roda um vídeo do AdMob</span></div>
      <div class="meter"><i id="adMeter"></i></div>`, [{ label: `Aguarde ${secs}s` }]);
    const btn = card.querySelector<HTMLButtonElement>('.btns .btn')!;
    btn.disabled = true;
    const meter = $('adMeter');
    const t0 = performance.now();
    const tick = () => {
      const p = Math.min(1, (performance.now() - t0) / (secs * 1000));
      meter.style.width = `${p * 100}%`;
      if (p < 1) { btn.textContent = `Aguarde ${Math.ceil(secs - p * secs)}s`; requestAnimationFrame(tick); return; }
      btn.disabled = false;
      btn.classList.add('primary');
      btn.textContent = kind === 'interstitial' ? 'Fechar anúncio' : 'Receber recompensa';
      btn.onclick = () => { hideModal(); resolve(true); };
    };
    tick();
  });
}
setAdSimulator(simulateAd);

async function rewarded(onReward: () => void): Promise<void> {
  if (busy) return;
  busy = true;
  const ok = await showRewarded();
  busy = false;
  if (ok) onReward();
  else toast('Nenhum anúncio disponível agora. Tente de novo em instantes.');
}

function win(): void {
  sfx.win();
  feel('win');
  const reward = rewardFor(lvl);
  let claimed = false;
  const finish = async (mult: number) => {
    if (claimed) return;
    claimed = true;
    coins += reward * mult;
    sfx.coin();
    hideModal();
    if (!noAds && lvl >= ECONOMY.interstitialFromLevel && lvl % ECONOMY.interstitialEvery === 0) await showInterstitial();
    lvl++;
    startLevel();
  };
  showModal(`<h2>Porto liberado!</h2><p>Nível ${lvl} concluído em ${moves} jogadas</p><div class="big">+${reward}</div>`, [
    { label: `Dobrar para ${reward * 2}`, cls: 'primary ad', onClick: () => { hideModal(); void rewarded(() => finish(2)).then(() => { if (!claimed) win(); }); } },
    { label: 'Próximo nível', onClick: () => void finish(1) },
  ]);
}

function stuck(): void {
  showModal('<h2>Sem jogadas</h2><p>Os navios travaram. Desfaça uma jogada ou chame mais um navio vazio.</p>', [
    ...(extraUsed ? [] : [{ label: '+1 Navio vazio', cls: 'primary ad', onClick: () => { hideModal(); void rewarded(addShip); } }]),
    { label: 'Desfazer', onClick: () => { hideModal(); undo(); } },
    { label: 'Reiniciar nível', onClick: () => { hideModal(); restart(); } },
  ]);
}

// ---------- ações ----------

function undo(): void {
  if (busy || !history.length) return;
  if (undos <= 0) {
    void rewarded(() => { undos += ECONOMY.undosPerAd; render(); save(); toast(`+${ECONOMY.undosPerAd} desfazer`); });
    return;
  }
  ships = history.pop()!;
  undos--;
  sel = -1;
  clearHint();
  render();
  save();
}

function restart(): void {
  if (busy) return;
  ships = clone(start);
  codes = codes.slice(0, ships.length);
  history = [];
  sel = -1;
  moves = 0;
  extraUsed = false;
  clearHint();
  render();
  save();
}

function addShip(): void {
  if (extraUsed) return;
  extraUsed = true;
  ships.push([]);
  codes.push(CODES[(ships.length * 7) % CODES.length]);
  history = []; // o navio extra não pode ser desfeito
  sel = -1;
  render();
  flash(ships.length - 1, 'pop');
  sfx.horn();
  save();
}

function hint(): void {
  const sol = solve(ships, 200_000);
  if (Array.isArray(sol) && sol.length) {
    const [a, b] = sol[0];
    sel = -1;
    render();
    shipEl(a)?.classList.add('hint');
    shipEl(b)?.classList.add('hint');
    toast(`Leve do ${codes[a]} para o ${codes[b]}`);
    hintTimer = window.setTimeout(clearHint, 4000);
  } else if (sol === false) {
    toast('Daqui não tem saída. Desfaça ou use +1 Navio.');
  } else {
    toast('Tente desfazer algumas jogadas.');
  }
}

$('bUndo').onclick = undo;
$('bRestart').onclick = restart;
$('bHint').onclick = () => { if (!isWon(ships)) void rewarded(hint); };
$('bShip').onclick = () => { if (!extraUsed) void rewarded(addShip); };

function soundIcon(): void {
  const b = $('bSound');
  b.innerHTML = soundOn
    ? '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 9v6h4l5 4V5L8 9z"/><path d="M16.5 8.5a5 5 0 0 1 0 7M19 6a8.5 8.5 0 0 1 0 12"/></svg>'
    : '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 9v6h4l5 4V5L8 9z"/><path d="m17 9 5 6M22 9l-5 6"/></svg>';
  b.setAttribute('aria-label', soundOn ? 'Desligar som' : 'Ligar som');
}
$('bSound').onclick = () => {
  soundOn = !soundOn;
  setSound(soundOn);
  soundIcon();
  save();
  if (soundOn) sfx.pick();
};

// ---------- loja ----------

async function purchase(id: ProductId, grant: () => void): Promise<void> {
  const r = await buy(id);
  if (r === 'ok') { grant(); save(); render(); sfx.coin(); }
  else if (r === 'error') toast('A compra não foi concluída. Verifique a conexão e tente de novo.');
  shop();
}

function shop(): void {
  const item = (name: string, sub: string, label: string, cls: string, id: string) =>
    `<div class="shop-item"><div><b>${name}</b><small>${sub}</small></div><button class="btn ${cls}" id="${id}">${label}</button></div>`;
  showModal(`<h2>Loja</h2>
    ${item('Remover anúncios', 'Sem anúncios entre níveis', noAds ? 'Ativo' : priceOf('no_ads'), 'primary', 'sNoAds')}
    ${item(`Pacote de ${ECONOMY.coinPack} moedas`, 'Para skins e itens', priceOf('coins_500'), 'primary', 'sCoins')}
    ${item('Casco dourado', 'Skin para todos os navios', goldHull ? 'Ativo' : `${ECONOMY.goldHullPrice} moedas`, '', 'sGold')}
    ${storeSimulated ? '<p class="fine">Loja simulada: nada é cobrado. No app publicado, a cobrança é feita pelo Google Play e pela App Store.</p>' : ''}`,
  [
    ...(storeSimulated ? [] : [{ label: 'Restaurar compras', onClick: () => void doRestore() }]),
    { label: 'Fechar', onClick: hideModal },
  ]);
  const nb = $<HTMLButtonElement>('sNoAds');
  nb.disabled = noAds;
  nb.onclick = () => void purchase('no_ads', () => { noAds = true; toast('Anúncios entre níveis removidos'); });
  $('sCoins').onclick = () => void purchase('coins_500', () => { coins += ECONOMY.coinPack; toast(`+${ECONOMY.coinPack} moedas`); });
  const gb = $<HTMLButtonElement>('sGold');
  gb.disabled = goldHull;
  gb.onclick = () => {
    if (coins < ECONOMY.goldHullPrice) { toast(`Faltam ${ECONOMY.goldHullPrice - coins} moedas`); sfx.bad(); return; }
    coins -= ECONOMY.goldHullPrice;
    goldHull = true;
    save();
    render();
    sfx.coin();
    toast('Casco dourado ativado');
    shop();
  };
}

async function doRestore(): Promise<void> {
  const owned = await restore();
  if (owned === null) { toast('Não foi possível falar com a loja agora.'); return; }
  noAds = owned || noAds;
  save();
  toast(owned ? 'Compras restauradas' : 'Nenhuma compra encontrada nesta conta');
  shop();
}
$('bShop').onclick = shop;

// ---------- ciclo de vida ----------

function startLevel(): void {
  const g = genLevel(lvl);
  ships = clone(g.board);
  start = clone(g.board);
  codes = g.codes;
  history = [];
  sel = -1;
  moves = 0;
  undos = ECONOMY.freeUndosPerLevel;
  extraUsed = false;
  render();
  save();
}

function initSea(): void {
  const cv = $<HTMLCanvasElement>('sea'), ctx = cv.getContext('2d')!;
  const size = () => {
    const d = devicePixelRatio || 1;
    cv.width = innerWidth * d;
    cv.height = innerHeight * d;
    ctx.setTransform(d, 0, 0, d, 0, 0);
  };
  size();
  addEventListener('resize', size);
  const draw = (t: number) => {
    const W = innerWidth, H = innerHeight;
    const g = ctx.createLinearGradient(0, 0, 0, H);
    g.addColorStop(0, '#0f4152');
    g.addColorStop(1, '#072530');
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, W, H);
    ctx.lineWidth = 1.5;
    for (let r = 0; r < 14; r++) {
      const y0 = 60 + r * (H / 13), amp = 3 + r * 0.4, ph = t / 1600 + r * 1.7;
      ctx.strokeStyle = `rgba(160,220,225,${0.035 + (r % 3) * 0.012})`;
      ctx.beginPath();
      for (let x = 0; x <= W; x += 12) {
        const y = y0 + Math.sin(x / 46 + ph) * amp;
        if (x) ctx.lineTo(x, y); else ctx.moveTo(x, y);
      }
      ctx.stroke();
    }
    if (!reduceMotion() && !document.hidden) requestAnimationFrame(draw);
  };
  requestAnimationFrame(draw);
  document.addEventListener('visibilitychange', () => { if (!document.hidden) requestAnimationFrame(draw); });
}

async function boot(): Promise<void> {
  const saved = await load<Partial<Saved>>(STATE_KEY);
  if (saved?.ships && Array.isArray(saved.ships)) {
    ({ lvl = 1, coins = 0, soundOn = true, noAds = false, goldHull = false } = saved);
    ships = saved.ships;
    start = saved.start ?? clone(ships);
    codes = saved.codes ?? ships.map((_, i) => CODES[i % CODES.length]);
    history = saved.history ?? [];
    undos = saved.undos ?? ECONOMY.freeUndosPerLevel;
    extraUsed = !!saved.extraUsed;
    moves = saved.moves ?? 0;
    if (isWon(ships)) { lvl++; startLevel(); } else render();
  } else {
    startLevel();
  }
  setSound(soundOn);
  soundIcon();
  addEventListener('resize', render);
  initSea();

  if (isNative) {
    // Botão "voltar" do Android: fecha a janela aberta; sem janela, minimiza o app.
    void App.addListener('backButton', () => { if (!modal.hidden && !busy) hideModal(); else void App.minimizeApp(); });
    void App.addListener('pause', save);
  }

  // Anúncios e loja carregam em segundo plano: o jogo já está jogável.
  void initAds();
  await initPurchases();
  const owned = await ownsNoAds();
  if (owned !== null && owned !== noAds) { noAds = owned; save(); }
}

void boot();
