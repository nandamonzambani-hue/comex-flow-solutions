// Regras do quebra-cabeça, sem nenhuma dependência de interface: dá para testar e reaproveitar no servidor.

export const CAP = 4;
export const EMPTY_SHIPS = 2;
export const MAX_COLORS = 9;

/** Cada navio é uma pilha de cores (índices), da base para o topo. */
export type Ship = number[];
export type Board = Ship[];
export type Move = [from: number, to: number];

export const PORTS = [
  'Porto de Santos', 'Porto de Roterdã', 'Porto de Xangai', 'Porto de Singapura', 'Porto de Hamburgo',
  'Porto de Busan', 'Porto de Antuérpia', 'Porto de Jebel Ali', 'Porto de Los Angeles', 'Porto de Paranaguá',
];
// Códigos UN/LOCODE de portos reais, pintados no casco de cada navio.
export const CODES = ['BRSSZ', 'NLRTM', 'CNSHA', 'SGSIN', 'DEHAM', 'KRPUS', 'BEANR', 'AEJEA', 'USLAX', 'BRPNG',
  'BRRIG', 'CNNGB', 'MYPKG', 'ESVLC', 'JPTYO'];

export const portFor = (level: number) => PORTS[Math.floor((level - 1) / 10) % PORTS.length];
export const colorsFor = (level: number) => Math.min(3 + Math.floor((level - 1) / 3), MAX_COLORS);
export const rewardFor = (level: number) => 10 + Math.floor(level / 5) * 2;

const top = (s: Ship) => s[s.length - 1];
export const clone = (b: Board): Board => b.map(s => s.slice());

export function topRun(s: Ship): number {
  if (!s.length) return 0;
  const c = top(s);
  let k = 0;
  for (let i = s.length - 1; i >= 0 && s[i] === c; i--) k++;
  return k;
}

export const isDone = (s: Ship) => s.length === CAP && topRun(s) === CAP;
export const isWon = (b: Board) => b.every(s => !s.length || isDone(s));

/**
 * Quantos contêineres saem de `a` para `b` (0 = jogada inválida).
 * `strict` descarta jogadas inúteis (levar uma pilha de cor única para um navio vazio); o solucionador usa isso para podar.
 */
export function canMove(b: Board, a: number, to: number, strict = false): number {
  if (a === to) return 0;
  const A = b[a], B = b[to];
  if (!A.length || B.length >= CAP || isDone(A)) return 0;
  if (B.length && top(B) !== top(A)) return 0;
  const run = topRun(A);
  if (strict && !B.length && run === A.length) return 0;
  return Math.min(run, CAP - B.length);
}

export function applyMove(b: Board, a: number, to: number, k: number): void {
  for (let i = 0; i < k; i++) b[to].push(b[a].pop()!);
}

export const hasMoves = (b: Board) => b.some((_, a) => b.some((_, t) => canMove(b, a, t) > 0));

/**
 * Busca em profundidade com conjunto de estados visitados.
 * Retorna a lista de jogadas, `false` se não há solução, ou `'limit'` se estourou o orçamento de nós.
 */
export function solve(start: Board, limit = 150_000): Move[] | false | 'limit' {
  const seen = new Set<string>();
  const path: Move[] = [];
  let nodes = 0;
  const key = (b: Board) => b.map(s => s.join(',')).sort().join('|');

  function dfs(b: Board): boolean | null {
    if (isWon(b)) return true;
    if (++nodes > limit) return null;
    const k = key(b);
    if (seen.has(k)) return false;
    seen.add(k);

    const options: [score: number, a: number, t: number, n: number][] = [];
    for (let a = 0; a < b.length; a++) {
      let emptyTried = false;
      for (let t = 0; t < b.length; t++) {
        const n = canMove(b, a, t, true);
        if (!n) continue;
        if (!b[t].length) {
          if (emptyTried) continue; // navios vazios são equivalentes entre si
          emptyTried = true;
        }
        let score = b[t].length ? 2 : 0;
        if (n === topRun(b[a])) score += 1;
        options.push([score, a, t, n]);
      }
    }
    options.sort((x, y) => y[0] - x[0]);

    for (const [, a, t, n] of options) {
      const next = clone(b);
      applyMove(next, a, t, n);
      path.push([a, t]);
      const r = dfs(next);
      if (r !== false) return r;
      path.pop();
    }
    return false;
  }

  const r = dfs(clone(start));
  return r === true ? path : r === null ? 'limit' : false;
}

/** PRNG determinístico (mulberry32). */
export function rng(seed: number): () => number {
  return () => {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export interface Level {
  board: Board;
  codes: string[];
}

/** O mesmo número de nível gera sempre o mesmo tabuleiro, para os jogadores compararem partidas. */
export function genLevel(level: number): Level {
  const nc = colorsFor(level);
  let last: Board = [];
  for (let attempt = 0; attempt < 80; attempt++) {
    const r = rng(level * 9973 + attempt * 131);
    const pool: number[] = [];
    for (let c = 0; c < nc; c++) for (let i = 0; i < CAP; i++) pool.push(c);
    for (let i = pool.length - 1; i > 0; i--) {
      const j = Math.floor(r() * (i + 1));
      [pool[i], pool[j]] = [pool[j], pool[i]];
    }
    const board: Board = [];
    for (let c = 0; c < nc; c++) board.push(pool.slice(c * CAP, c * CAP + CAP));
    for (let e = 0; e < EMPTY_SHIPS; e++) board.push([]);
    last = board;
    if (board.some(s => topRun(s) >= 3)) continue; // fácil demais
    if (Array.isArray(solve(board, 120_000))) return { board, codes: codesFor(level, board.length) };
  }
  return { board: last, codes: codesFor(level, last.length) };
}

function codesFor(level: number, n: number): string[] {
  const r = rng(level * 31 + 7);
  const shuffled = CODES.slice().sort(() => r() - 0.5);
  return Array.from({ length: n }, (_, i) => shuffled[i % shuffled.length]);
}
