import { describe, expect, it } from 'vitest';
import {
  CAP, applyMove, canMove, clone, colorsFor, genLevel, hasMoves, isDone, isWon, solve, topRun, type Board,
} from '../src/game/rules';

describe('regras', () => {
  it('só empilha sobre a mesma cor ou em navio vazio', () => {
    const b: Board = [[0, 1], [2], [], [1, 1, 1]];
    expect(canMove(b, 0, 1)).toBe(0);
    expect(canMove(b, 0, 2)).toBe(1);
    expect(canMove(b, 0, 3)).toBe(1);
    expect(canMove(b, 3, 0)).toBe(2); // move o grupo inteiro que couber
  });

  it('não mexe em navio completo', () => {
    const b: Board = [[2, 2, 2, 2], []];
    expect(isDone(b[0])).toBe(true);
    expect(canMove(b, 0, 1)).toBe(0);
  });

  it('reconhece vitória e falta de jogadas', () => {
    expect(isWon([[1, 1, 1, 1], [], [0, 0, 0, 0]])).toBe(true);
    expect(isWon([[1, 1, 1], [1]])).toBe(false);
    expect(hasMoves([[0, 1, 0, 1], [1, 0, 1, 0]])).toBe(false);
  });

  it('o solucionador encontra uma solução válida', () => {
    const start: Board = [[0, 1, 0, 1], [1, 0, 1, 0], [], []];
    const sol = solve(start);
    expect(Array.isArray(sol)).toBe(true);
    const b = clone(start);
    for (const [a, t] of sol as [number, number][]) {
      const n = canMove(b, a, t);
      expect(n).toBeGreaterThan(0);
      applyMove(b, a, t, n);
    }
    expect(isWon(b)).toBe(true);
  });
});

describe('geração de níveis', () => {
  it('é determinística', () => {
    expect(genLevel(17)).toEqual(genLevel(17));
  });

  it('os primeiros 40 níveis têm solução e a quantidade certa de cores', () => {
    for (let lvl = 1; lvl <= 40; lvl++) {
      const { board, codes } = genLevel(lvl);
      expect(codes).toHaveLength(board.length);
      expect(board.flat()).toHaveLength(colorsFor(lvl) * CAP);
      expect(board.some(s => topRun(s) >= 3)).toBe(false);
      expect(Array.isArray(solve(board, 500_000))).toBe(true);
    }
  });
});
