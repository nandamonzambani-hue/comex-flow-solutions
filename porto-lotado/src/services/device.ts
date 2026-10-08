import { Haptics, ImpactStyle, NotificationType } from '@capacitor/haptics';
import { Preferences } from '@capacitor/preferences';
import { isNative } from '../config';

// ---------- armazenamento ----------
// Preferences grava no armazenamento nativo; no iOS o localStorage da WebView pode ser apagado pelo sistema.

export async function load<T>(key: string): Promise<T | null> {
  try {
    const { value } = await Preferences.get({ key });
    return value ? (JSON.parse(value) as T) : null;
  } catch { return null; }
}

export function save(key: string, data: unknown): void {
  Preferences.set({ key, value: JSON.stringify(data) }).catch(() => {});
}

// ---------- vibração ----------

export type Feel = 'tap' | 'drop' | 'bad' | 'complete' | 'win';

export function feel(kind: Feel): void {
  try {
    if (isNative) {
      if (kind === 'tap') void Haptics.impact({ style: ImpactStyle.Light });
      else if (kind === 'drop') void Haptics.impact({ style: ImpactStyle.Medium });
      else if (kind === 'bad') void Haptics.notification({ type: NotificationType.Warning });
      else void Haptics.notification({ type: NotificationType.Success });
      return;
    }
    const ms = { tap: 8, drop: 12, bad: 30, complete: [15, 40, 15], win: [20, 60, 20, 60, 40] }[kind];
    navigator.vibrate?.(ms);
  } catch { /* sem vibração neste aparelho */ }
}

// ---------- som ----------
// Sons sintetizados: zero arquivos de áudio no pacote.

let ctx: AudioContext | null = null;
let enabled = true;
export const setSound = (on: boolean) => { enabled = on; };

function tone(f: number, dur: number, type: OscillatorType = 'sine', vol = 0.12, slide = 1, delay = 0) {
  if (!enabled) return;
  try {
    ctx ??= new AudioContext();
    if (ctx.state === 'suspended') void ctx.resume();
    const t = ctx.currentTime + delay;
    const o = ctx.createOscillator();
    const g = ctx.createGain();
    o.type = type;
    o.frequency.setValueAtTime(f, t);
    if (slide !== 1) o.frequency.exponentialRampToValueAtTime(f * slide, t + dur);
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(vol, t + 0.012);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    o.connect(g).connect(ctx.destination);
    o.start(t);
    o.stop(t + dur + 0.03);
  } catch { /* áudio indisponível */ }
}

export const sfx = {
  pick: () => tone(480, 0.09, 'triangle', 0.12, 1.5),
  drop: () => tone(150, 0.14, 'square', 0.06, 0.55),
  bad: () => tone(190, 0.16, 'sawtooth', 0.05, 0.7),
  horn: () => { tone(98, 0.7, 'sawtooth', 0.06); tone(147, 0.7, 'sawtooth', 0.045); },
  win: () => [523, 659, 784, 1047].forEach((f, i) => tone(f, 0.2, 'triangle', 0.12, 1, i * 0.09)),
  coin: () => { tone(988, 0.08, 'square', 0.05); tone(1319, 0.18, 'square', 0.05, 1, 0.07); },
};
