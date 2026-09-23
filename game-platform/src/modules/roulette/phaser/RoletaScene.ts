import Phaser from 'phaser';
import type { RouletteGameState, RouletteMoveOption } from '../types/roulette';

/* ------------------------------------------------------------------ */
/*  Tokens (BehaviorLab)                                               */
/* ------------------------------------------------------------------ */

const TAU = Math.PI * 2;

const C = {
  bg: 0x08121d,
  header: 0x060f18,
  panel: 0x0e1a28,
  panelHi: 0x122235,
  panelHi2: 0x172b41,
  field: 0x0a1521,
  border: 0x1f3044,
  borderHi: 0x2e4661,
  accent: 0x0ea5e9,
  accentHi: 0x38bdf8,
  gold: 0xc9a45c,
  goldHi: 0xe4c784,
  felt: 0x0f3d2d,
  win: 0x22c55e,
  loss: 0xf87171,
  warn: 0xf59e0b,
  idle: 0x5f7188,
};

const CSS = {
  text: '#e7eef6',
  muted: '#93a4b8',
  dim: '#6b7d93',
  accent: '#0ea5e9',
  orange: '#f59e0b',
  gold: '#d9b872',
  dark: '#04121f',
};

const F = {
  title: 'Montserrat, sans-serif',
  body: 'Inter, sans-serif',
  mono: '"JetBrains Mono", monospace',
};

export type CondKey = RouletteMoveOption;
const CKEYS: CondKey[] = ['azul', 'vermelho', 'preto'];

const COND: Record<CondKey, { label: string; ui: number; pocket: number }> = {
  azul: { label: 'Azul', ui: 0x0ea5e9, pocket: 0x0284c7 },
  vermelho: { label: 'Vermelho', ui: 0xef4444, pocket: 0xdc2626 },
  preto: { label: 'Preto', ui: 0x334155, pocket: 0x111827 },
};

/** Ordem europeia sem o zero: 36 casas, 12 por condição, cores alternadas. */
const ORDER = [
  32, 15, 19, 4, 21, 2, 25, 17, 34, 6, 27, 13, 36, 11, 30, 8, 23, 10,
  5, 24, 16, 33, 1, 20, 14, 31, 9, 22, 18, 29, 7, 28, 12, 35, 3, 26,
];
const COLOR_OF: Record<number, CondKey> = {};
ORDER.forEach((n, i) => (COLOR_OF[n] = CKEYS[i % 3]));

const PAYOUT = 3;
const TRACK = 0.865; // raio da pista da bola (fração de R)
const POCKET = 0.605; // raio das casas

/* ------------------------------------------------------------------ */
/*  Layouts: paisagem e retrato, sempre dentro de 100vw x 100vh        */
/* ------------------------------------------------------------------ */

export type Orientation = 'land' | 'port';
export const SIZES: Record<Orientation, { w: number; h: number }> = {
  land: { w: 1920, h: 1080 },
  port: { w: 1080, h: 1920 },
};
export const orientationFor = (w: number, h: number): Orientation =>
  w / h < 0.85 ? 'port' : 'land';

type Box = { x: number; y: number; w: number; h: number };
type Layout = {
  m: number;
  hero: Box;
  stats: Box;
  app: Box;
  ctrl: Box;
  wheel: { cx: number; cy: number; R: number };
  table: Box;
};

const LAYOUTS: Record<Orientation, Layout> = {
  land: {
    m: 48,
    hero: { x: 48, y: 108, w: 900, h: 150 },
    stats: { x: 968, y: 108, w: 904, h: 150 },
    app: { x: 48, y: 278, w: 1400, h: 770 },
    ctrl: { x: 1468, y: 278, w: 404, h: 770 },
    wheel: { cx: 408, cy: 678, R: 285 },
    table: { x: 788, y: 374, w: 620, h: 590 },
  },
  port: {
    m: 40,
    hero: { x: 40, y: 108, w: 1000, h: 170 },
    stats: { x: 40, y: 294, w: 1000, h: 124 },
    app: { x: 40, y: 434, w: 1000, h: 1040 },
    ctrl: { x: 40, y: 1490, w: 1000, h: 390 },
    wheel: { cx: 540, cy: 834, R: 285 },
    table: { x: 80, y: 1146, w: 920, h: 250 },
  },
};

/* ------------------------------------------------------------------ */
/*  Estado da sessão                                                   */
/* ------------------------------------------------------------------ */

type Tone = 'idle' | 'spin' | 'win' | 'loss' | 'warn';

interface SessionState {
  code: string;
  fichas: number;
  inicial: number;
  meta: number;
  ensaios: number;
  acertos: number;
  semReforco: number;
  cond: CondKey | null;
  mag: number;
  start: number;
  endAt: number | null;
  spinning: boolean;
  ended: boolean;
  history: { n: number; col: CondKey }[];
  lastN: number | null;
  wheelRot: number;
  ballAngle: number;
  ballR: number;
  msg: string;
  tone: Tone;
}

/** Registro de cada ensaio, para envio a um coletor externo opcional (analytics). */
export interface TrialRecord {
  sessao: string;
  ensaio: number;
  condicao: CondKey;
  magnitude: number;
  resultado: number;
  corResultado: CondKey;
  reforco: boolean;
  fichasApos: number;
  timestamp: string;
}

/** Código curto derivado do matchId, só para exibição (mesmo critério da tela React). */
const shortCode = (matchId: string) => matchId.replace(/-/g, '').slice(-8).toUpperCase() || matchId;

/** Sorteia uma casa (0–35) cuja cor bate com a condição informada — usado só para o visual da roda. */
const pocketFor = (opcao: CondKey) => {
  const candidates: number[] = [];
  CKEYS.forEach((k, i) => { if (k === opcao) for (let j = i; j < ORDER.length; j += 3) candidates.push(j); });
  return candidates[Math.floor(Math.random() * candidates.length)];
};

/** Ensaio real, resolvido pelo backend — a cena só anima e exibe o resultado. */
export interface SpinResult {
  opcao: CondKey;
  aposta: number;
  won: boolean;
  coinsAmount: number;
  matchFinished: boolean;
}

/** Pontes com o backend real, atribuídas pelo componente React antes de iniciar o jogo. */
export interface RoletaHandlers {
  onSpin: (opcao: CondKey, aposta: number) => Promise<SpinResult>;
  onFinish: () => void | Promise<void>;
  onExit: () => void;
}

/** Estado inicial vindo do join da partida (backend é a fonte da verdade). */
const stateFromInitial = (initial: RouletteGameState): SessionState => ({
  code: shortCode(initial.matchId),
  fichas: initial.coins,
  inicial: initial.coins,
  meta: initial.pointsLimit,
  ensaios: initial.moveHistory.length,
  acertos: initial.moveHistory.filter((m) => m.won).length,
  semReforco: initial.pityStreak,
  cond: null,
  mag: Phaser.Math.Clamp(10, 1, Math.max(1, initial.coins)),
  start: Date.now(),
  endAt: null,
  spinning: false,
  ended: initial.status === 'finished',
  history: initial.moveHistory
    .slice(-8)
    .reverse()
    .map((m) => ({ n: ORDER[pocketFor(m.opcao)], col: m.opcao })),
  lastN: null,
  wheelRot: 0,
  ballAngle: -Math.PI / 2,
  ballR: POCKET,
  msg:
    initial.status === 'finished'
      ? 'Esta sessão já foi encerrada.'
      : 'Selecione uma condição e defina a magnitude para iniciar o ensaio.',
  tone: 'idle',
});

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */

const shade = (c: number, f: number) => {
  const r = Math.round(((c >> 16) & 255) * f);
  const g = Math.round(((c >> 8) & 255) * f);
  const b = Math.round((c & 255) * f);
  return (r << 16) | (g << 8) | b;
};
const toNum = (css: string) => Phaser.Display.Color.HexStringToColor(css).color;
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
const mod = (a: number, n: number) => ((a % n) + n) % n;

type TextOpts = {
  size?: number;
  color?: string;
  family?: string;
  weight?: number | string;
  spacing?: number;
  ox?: number;
  oy?: number;
  wrap?: number;
  align?: string;
};

type IconName = 'grid' | 'doc' | 'plus' | 'user';

type BtnOpts = {
  label?: string;
  icon?: IconName;
  primary?: boolean;
  size?: number;
  spacing?: number;
  radius?: number;
  depth?: number;
  onClick?: () => void;
};

interface Btn {
  enabled: boolean;
  hover: boolean;
  draw: () => void;
  setEnabled: (v: boolean) => void;
}

interface OptionRow {
  draw: () => void;
}

type UI = {
  fichas: Phaser.GameObjects.Text;
  meta: Phaser.GameObjects.Text;
  ensaios: Phaser.GameObjects.Text;
  dur: Phaser.GameObjects.Text;
  metaBar: Phaser.GameObjects.Graphics;
  metaBarBox: Box;
  seq: Phaser.GameObjects.Text;
  pill: Phaser.GameObjects.Graphics;
  pillText: Phaser.GameObjects.Text;
  pillRight: number;
  pillY: number;
  dot: Phaser.GameObjects.Graphics;
  dotPos: { x: number; y: number };
  msg: Phaser.GameObjects.Text;
  magVal: Phaser.GameObjects.Text;
  magLabel: Phaser.GameObjects.Text;
  magCx: number;
  limit: Phaser.GameObjects.Text;
  exec: Btn;
  stop: Btn;
  boxHi: Phaser.GameObjects.Graphics;
  cellHi: Phaser.GameObjects.Graphics;
  histRight: number;
  histY: number;
};

/* ------------------------------------------------------------------ */
/*  Cena                                                               */
/* ------------------------------------------------------------------ */

export class RoletaScene extends Phaser.Scene {
  /** Callback opcional para persistir cada ensaio (API, Supabase etc.). */
  onTrial?: (t: TrialRecord) => void;

  /** Estado real da partida (join) e pontes com o backend — atribuídos pelo componente React. */
  initial?: RouletteGameState;
  onSpin?: RoletaHandlers['onSpin'];
  onFinish?: RoletaHandlers['onFinish'];
  onExit?: RoletaHandlers['onExit'];

  /** `this.s` sobrevive a `scene.restart()` (troca de orientação) — só é semeado a partir
   *  de `initial` uma vez; depois disso, quem manda são as respostas reais do backend. */
  private stateReady = false;
  private s: SessionState = {
    code: '', fichas: 0, inicial: 0, meta: 0, ensaios: 0, acertos: 0, semReforco: 0,
    cond: null, mag: 1, start: Date.now(), endAt: null, spinning: false, ended: false,
    history: [], lastN: null, wheelRot: 0, ballAngle: -Math.PI / 2, ballR: POCKET,
    msg: '', tone: 'idle',
  };
  /** Prazo (ms, relógio local) da sessão quando a partida tem tempo limite; null = sem prazo. */
  private deadlineAt: number | null = null;
  /** Tempo esgotou durante um ensaio em curso — encerra assim que ele resolver. */
  private pendingTimeout = false;
  private pendingSize: { w: number; h: number } | null = null;

  private L!: Layout;
  private port = false;
  private wheel!: { cx: number; cy: number; R: number };
  private rotor!: Phaser.GameObjects.Container;
  private ball!: Phaser.GameObjects.Container;

  private cells: Record<number, Box> = {};
  private boxes: Partial<Record<CondKey, Box>> = {};
  private opts: Partial<Record<CondKey, OptionRow>> = {};
  private boxHover: CondKey | null = null;

  private ui!: UI;
  private histObjs: Phaser.GameObjects.GameObject[] = [];
  private betChip: Phaser.GameObjects.Container | null = null;

  constructor() {
    super('roleta');
  }

  /** Chamado pelo componente React ao trocar de orientação. */
  requestLayout(size: { w: number; h: number }) {
    if (this.s.spinning) {
      this.pendingSize = size;
      return;
    }
    this.scale.setGameSize(size.w, size.h);
    this.scene.restart();
  }

  create() {
    if (!this.stateReady && this.initial) {
      this.s = stateFromInitial(this.initial);
      this.deadlineAt = this.initial.timeLimit != null ? Date.now() + this.initial.timeLimit * 1000 : null;
      this.stateReady = true;
    }

    const { width: W, height: H } = this.scale;
    this.port = H > W;
    this.L = LAYOUTS[this.port ? 'port' : 'land'];
    this.cells = {};
    this.boxes = {};
    this.opts = {};
    this.histObjs = [];
    this.betChip = null;

    this.drawBackground(W, H);
    this.drawHeader(W);
    this.ui = {} as UI;
    this.drawHero(this.L.hero);
    this.drawStats(this.L.stats);
    this.drawApparatus(this.L.app);
    this.drawControls(this.L.ctrl);

    this.time.addEvent({ delay: 1000, loop: true, callback: () => this.tick() });
    this.bindKeys();
    this.refresh();
    this.updateClock();
    if (this.s.ended) this.showSummary();
  }

  /** Bate o relógio e, quando a sessão tem tempo limite, fecha a partida ao expirar. */
  private tick() {
    this.updateClock();
    if (this.deadlineAt === null || this.s.ended) return;
    if (this.deadlineAt - Date.now() > 0) return;
    if (this.s.spinning) {
      this.pendingTimeout = true;
      return;
    }
    this.endSession('Tempo esgotado.');
  }

  /* ----------------------------- primitives ----------------------------- */

  private txt(x: number, y: number, str: string | number, o: TextOpts = {}) {
    const t = this.add.text(x, y, String(str), {
      fontFamily: o.family ?? F.body,
      fontSize: `${o.size ?? 16}px`,
      color: o.color ?? CSS.text,
      fontStyle: o.weight ? String(o.weight) : 'normal',
      align: o.align ?? 'left',
      wordWrap: o.wrap ? { width: o.wrap } : undefined,
    });
    if (o.spacing) t.setLetterSpacing(o.spacing);
    t.setOrigin(o.ox ?? 0, o.oy ?? 0);
    return t;
  }

  private card(g: Phaser.GameObjects.Graphics, b: Box, r = 22) {
    g.fillStyle(0x000000, 0.25).fillRoundedRect(b.x, b.y + 6, b.w, b.h, r);
    g.fillStyle(C.panel, 0.94).fillRoundedRect(b.x, b.y, b.w, b.h, r);
    g.lineStyle(1.5, C.border, 1).strokeRoundedRect(b.x, b.y, b.w, b.h, r);
  }

  private icon(g: Phaser.GameObjects.Graphics, name: IconName, cx: number, cy: number, col: number) {
    g.lineStyle(2, col, 1);
    if (name === 'grid') {
      for (const dx of [-5, 5]) for (const dy of [-5, 5]) g.strokeRoundedRect(cx + dx - 3.5, cy + dy - 3.5, 7, 7, 1.5);
    } else if (name === 'doc') {
      g.strokeRoundedRect(cx - 7, cy - 9, 14, 18, 2);
      g.lineBetween(cx - 3, cy - 2, cx + 3, cy - 2);
      g.lineBetween(cx - 3, cy + 3, cx + 3, cy + 3);
    } else if (name === 'plus') {
      g.strokeCircle(cx, cy, 9);
      g.lineBetween(cx - 4, cy, cx + 4, cy);
      g.lineBetween(cx, cy - 4, cx, cy + 4);
    } else {
      g.strokeCircle(cx, cy, 12);
      g.strokeCircle(cx, cy - 3, 4.5);
      g.beginPath();
      g.arc(cx, cy + 10, 7.5, Math.PI * 1.15, Math.PI * 1.85);
      g.strokePath();
    }
  }

  private button(x: number, y: number, w: number, h: number, o: BtnOpts): Btn {
    const d = o.depth ?? 0;
    const g = this.add.graphics().setDepth(d);
    const ig = this.add.graphics().setDepth(d + 1);
    const r = o.radius ?? 12;
    let t: Phaser.GameObjects.Text | null = null;
    let iconX = x + w / 2;
    if (o.label) {
      t = this.txt(0, 0, o.label, {
        size: o.size ?? 17,
        weight: 600,
        spacing: o.spacing,
      }).setDepth(d + 1);
      if (o.icon) {
        const total = 20 + 10 + t.width;
        iconX = x + (w - total) / 2 + 10;
        t.setPosition(iconX + 20, y + h / 2).setOrigin(0, 0.5);
      } else {
        t.setPosition(x + w / 2, y + h / 2).setOrigin(0.5);
      }
    }
    const btn: Btn = {
      enabled: true,
      hover: false,
      draw: () => {
        g.clear();
        ig.clear();
        let fill: number;
        let stroke: number;
        let tc: string;
        if (o.primary) {
          fill = btn.enabled ? (btn.hover ? C.accentHi : C.accent) : 0x173349;
          stroke = fill;
          tc = btn.enabled ? CSS.dark : CSS.dim;
          if (btn.enabled) g.fillStyle(C.accent, 0.16).fillRoundedRect(x - 4, y + 4, w + 8, h + 8, r + 4);
        } else {
          fill = btn.hover && btn.enabled ? C.panelHi2 : C.panelHi;
          stroke = btn.hover && btn.enabled ? C.borderHi : C.border;
          tc = btn.enabled ? CSS.text : CSS.dim;
        }
        g.fillStyle(fill, 1).fillRoundedRect(x, y, w, h, r);
        g.lineStyle(1.5, stroke, 1).strokeRoundedRect(x, y, w, h, r);
        t?.setColor(tc);
        if (o.icon) this.icon(ig, o.icon, o.label ? iconX : x + w / 2, y + h / 2, toNum(tc));
      },
      setEnabled: (v: boolean) => {
        btn.enabled = v;
        btn.draw();
      },
    };
    const z = this.add.zone(x, y, w, h).setOrigin(0).setDepth(d + 2).setInteractive({ useHandCursor: true });
    z.on('pointerover', () => { btn.hover = true; btn.draw(); });
    z.on('pointerout', () => { btn.hover = false; btn.draw(); });
    z.on('pointerdown', () => { if (btn.enabled) o.onClick?.(); });
    btn.draw();
    return btn;
  }

  private chip(x: number, y: number, r: number, value: number) {
    const c = this.add.container(x, y);
    const g = this.add.graphics();
    const col = value < 5 ? 0xe5e7eb : value < 10 ? 0xc2410c : value < 25 ? 0x0f766e : value < 50 ? 0x6d28d9 : 0x111827;
    const edge = value >= 50 ? C.goldHi : value < 5 ? 0x0f172a : 0xffffff;
    g.fillStyle(0x000000, 0.4).fillCircle(2, 4, r);
    g.fillStyle(col, 1).fillCircle(0, 0, r);
    g.lineStyle(r * 0.26, edge, 0.95);
    for (let k = 0; k < 6; k++) {
      const a = (k * TAU) / 6;
      g.beginPath();
      g.arc(0, 0, r * 0.84, a, a + 0.32);
      g.strokePath();
    }
    g.fillStyle(shade(col, 0.82), 1).fillCircle(0, 0, r * 0.6);
    g.lineStyle(1, edge, 0.6).strokeCircle(0, 0, r * 0.6);
    const t = this.txt(0, 0, value, {
      size: Math.round(r * 0.62),
      weight: 700,
      family: F.title,
      color: value < 5 ? '#0f172a' : '#ffffff',
      ox: 0.5,
      oy: 0.5,
    });
    c.add([g, t]);
    return c;
  }

  /* ----------------------------- background / header ----------------------------- */

  private drawBackground(W: number, H: number) {
    const g = this.add.graphics();
    g.fillStyle(C.bg, 1).fillRect(0, 0, W, H);
    for (let i = 0; i < 12; i++) g.fillStyle(C.accent, 0.01).fillCircle(W * 0.28, H * 0.05, 1000 - i * 70);
    g.lineStyle(1, 0x5aa9e6, 0.035);
    for (let x = 0; x < W; x += 48) g.lineBetween(x, 0, x, H);
    for (let y = 0; y < H; y += 48) g.lineBetween(0, y, W, y);
  }

  private drawHeader(W: number) {
    const m = this.L.m;
    const g = this.add.graphics();
    g.fillStyle(C.header, 0.9).fillRect(0, 0, W, 84);
    g.lineStyle(1, C.border, 1).lineBetween(0, 84, W, 84);

    g.fillStyle(0x0b2236, 1).fillRoundedRect(m, 18, 48, 48, 12);
    g.lineStyle(1.5, C.accent, 0.55).strokeRoundedRect(m, 18, 48, 48, 12);
    const cx = m + 24, cy = 42;
    g.lineStyle(2, C.accent, 1);
    g.strokeCircle(cx, cy, 12);
    g.lineBetween(cx, cy - 12, cx, cy + 12);
    g.strokeCircle(cx - 5.5, cy - 3, 3);
    g.strokeCircle(cx + 5.5, cy + 4, 3);

    this.txt(m + 64, 30, 'BehaviorLab', { size: 23, weight: 700 });

    // Sem navegação de professor (Criar Sessão / Relatórios / Sessões) aqui — quem
    // está nesta tela é o aluno jogando a partida, não precisa dessas ações.
    const badgeText = this.txt(0, 0, 'SESSÃO DO ALUNO', {
      size: 13,
      weight: 600,
      spacing: 2,
      color: CSS.muted,
      oy: 0.5,
    });
    const pad = 22, h = 42;
    const w = badgeText.width + pad * 2;
    const x = W - m - w, y = 42;
    g.fillStyle(C.panelHi, 1).fillRoundedRect(x, y - h / 2, w, h, h / 2);
    g.lineStyle(1.5, C.border, 1).strokeRoundedRect(x, y - h / 2, w, h, h / 2);
    badgeText.setPosition(x + w / 2, y).setOrigin(0.5, 0.5);
  }

  /* ----------------------------- hero / stats ----------------------------- */

  private drawHero(b: Box) {
    const g = this.add.graphics();
    this.card(g, b);
    const p = this.port;
    this.txt(b.x + 38, b.y + (p ? 30 : 26), 'PARTIDA EM ANDAMENTO', { size: 13, color: CSS.muted, spacing: 3, weight: 600 });
    this.txt(b.x + 35, b.y + (p ? 50 : 44), 'Roleta Tricromática', { size: p ? 54 : 50, family: F.title, weight: 700 });
    this.txt(b.x + 38, b.y + (p ? 124 : 110), 'Roleta de cassino · 36 casas em três condições equiprováveis · paga 3×', {
      size: 17,
      color: CSS.muted,
      wrap: b.w - 330,
    });

    const right = b.x + b.w - 38;
    this.ui.pill = this.add.graphics();
    this.ui.pillText = this.txt(0, 0, '', { size: 14, weight: 500, oy: 0.5 });
    this.ui.pillRight = right;
    this.ui.pillY = b.y + (p ? 48 : 42);
    this.txt(right, b.y + (p ? 92 : 80), 'CÓDIGO DA SESSÃO', { size: 12, color: CSS.muted, spacing: 3, weight: 600, ox: 1 });
    this.txt(right, b.y + (p ? 114 : 102), this.s.code, { size: 22, family: F.mono, weight: 700, spacing: 6, ox: 1 });
  }

  private drawStats(b: Box) {
    const gap = 16;
    const cw = (b.w - gap * 3) / 4;
    const g = this.add.graphics();
    const size = this.port ? 40 : 46;
    const defs: [string, 'fichas' | 'meta' | 'ensaios' | 'dur', string, string][] = [
      ['FICHAS', 'fichas', CSS.text, F.title],
      ['META', 'meta', CSS.accent, F.title],
      ['ENSAIOS', 'ensaios', CSS.text, F.title],
      ['DURAÇÃO', 'dur', CSS.orange, F.mono],
    ];
    defs.forEach(([label, key, color, family], i) => {
      const x = b.x + i * (cw + gap);
      this.card(g, { x, y: b.y, w: cw, h: b.h }, 18);
      this.txt(x + 26, b.y + 24, label, { size: 13, color: CSS.muted, spacing: 3, weight: 600 });
      const vy = b.y + b.h - (key === 'meta' ? 34 : 24);
      this.ui[key] = this.txt(x + 26, vy, '', {
        size: key === 'dur' ? size - 6 : size,
        family,
        weight: key === 'dur' ? 600 : 600,
        color,
        oy: 1,
      });
      if (key === 'meta') {
        this.ui.metaBar = this.add.graphics();
        this.ui.metaBarBox = { x: x + 26, y: b.y + b.h - 22, w: cw - 52, h: 5 };
      }
    });
  }

  /* ----------------------------- apparatus ----------------------------- */

  private drawApparatus(b: Box) {
    const g = this.add.graphics();
    this.card(g, b);
    this.txt(b.x + 38, b.y + 32, 'Aparato', { size: 32, family: F.title, weight: 600 });
    this.ui.seq = this.txt(b.x + b.w - 38, b.y + 46, '', { size: 14, family: F.mono, color: CSS.muted, ox: 1 });

    this.buildWheel(this.L.wheel);
    this.buildTable(this.L.table, this.port ? 'h' : 'v');

    const fy = b.y + b.h - 62;
    g.lineStyle(1, C.border, 1).lineBetween(b.x + 38, fy, b.x + b.w - 38, fy);
    const my = fy + 31;
    this.ui.dot = this.add.graphics();
    this.ui.dotPos = { x: b.x + 44, y: my };
    this.ui.msg = this.txt(b.x + 60, my, '', { size: 17, color: CSS.muted, oy: 0.5, wrap: b.w - 500 });
    this.ui.histRight = b.x + b.w - 38;
    this.ui.histY = my;
  }

  private buildWheel(w: { cx: number; cy: number; R: number }) {
    const { cx, cy, R } = w;
    this.wheel = w;
    const g = this.add.graphics();

    this.txt(cx, cy - R - 40, 'LEITOR', { size: 13, spacing: 4, color: CSS.muted, weight: 600, ox: 0.5 });

    // bacia de madeira
    g.fillStyle(0x000000, 0.45).fillCircle(cx + 8, cy + 14, R + 6);
    g.fillStyle(0x24150b, 1).fillCircle(cx, cy, R);
    g.fillStyle(0x5b3a20, 1).fillCircle(cx, cy, R - 5);
    for (let i = 0; i < 5; i++) g.lineStyle(1, 0x3e2614, 0.45).strokeCircle(cx, cy, R - 9 - i * 3.2);

    // pista da bola
    g.fillStyle(0x1a110a, 1).fillCircle(cx, cy, R * 0.93);
    g.lineStyle(3, C.gold, 1).strokeCircle(cx, cy, R * 0.93);
    g.lineStyle(R * 0.06, 0x2c1f15, 1).strokeCircle(cx, cy, R * TRACK);
    g.lineStyle(1.5, 0x4a3524, 0.9).strokeCircle(cx, cy, R * 0.905);

    // defletores
    g.fillStyle(C.goldHi, 1);
    for (let i = 0; i < 8; i++) {
      const a = (i * TAU) / 8 + TAU / 16;
      const px = cx + Math.cos(a) * R * 0.86;
      const py = cy + Math.sin(a) * R * 0.86;
      const rx = Math.cos(a), ry = Math.sin(a), tx = -ry, ty = rx;
      g.fillPoints(
        [
          new Phaser.Math.Vector2(px + rx * 11, py + ry * 11),
          new Phaser.Math.Vector2(px + tx * 5, py + ty * 5),
          new Phaser.Math.Vector2(px - rx * 11, py - ry * 11),
          new Phaser.Math.Vector2(px - tx * 5, py - ty * 5),
        ],
        true,
      );
    }

    // aro do rotor
    g.fillStyle(0x7a5a2c, 1).fillCircle(cx, cy, R * 0.818);
    g.fillStyle(C.gold, 1).fillCircle(cx, cy, R * 0.806);

    // rotor
    const rot = this.add.container(cx, cy);
    const rg = this.add.graphics();
    rot.add(rg);
    const step = TAU / 36;
    const rN = R * 0.795, rP = R * 0.665, rC = R * 0.545;

    ORDER.forEach((_, i) => {
      const a0 = -Math.PI / 2 + i * step - step / 2;
      const col = COND[CKEYS[i % 3]].pocket;
      rg.fillStyle(col, 1);
      rg.beginPath();
      rg.slice(0, 0, rN, a0, a0 + step, false);
      rg.closePath();
      rg.fillPath();
    });
    ORDER.forEach((_, i) => {
      const a0 = -Math.PI / 2 + i * step - step / 2;
      rg.fillStyle(shade(COND[CKEYS[i % 3]].pocket, 0.55), 1);
      rg.beginPath();
      rg.slice(0, 0, rP, a0, a0 + step, false);
      rg.closePath();
      rg.fillPath();
    });
    rg.lineStyle(1.2, C.gold, 0.9).strokeCircle(0, 0, rP);
    for (let i = 0; i < 36; i++) {
      const a = -Math.PI / 2 + i * step - step / 2;
      rg.lineStyle(1, C.gold, 0.6).lineBetween(Math.cos(a) * rP, Math.sin(a) * rP, Math.cos(a) * rN, Math.sin(a) * rN);
      rg.lineStyle(2.4, C.goldHi, 1).lineBetween(Math.cos(a) * rC, Math.sin(a) * rC, Math.cos(a) * rP, Math.sin(a) * rP);
    }

    // cone central
    const tones = [0x6b4424, 0x5d3a1e, 0x714828, 0x603c1f, 0x6e4626];
    tones.forEach((c, j) => rg.fillStyle(c, 1).fillCircle(0, 0, rC * (1 - j * 0.14)));
    rg.lineStyle(3, C.gold, 1).strokeCircle(0, 0, rC);

    // torre
    for (let k = 0; k < 4; k++) {
      const a = (k * TAU) / 4 + TAU / 8;
      const ex = Math.cos(a) * R * 0.33, ey = Math.sin(a) * R * 0.33;
      rg.lineStyle(9, 0x9c7a3e, 1).lineBetween(0, 0, ex, ey);
      rg.lineStyle(4, C.goldHi, 0.8).lineBetween(0, 0, ex, ey);
      rg.fillStyle(C.goldHi, 1).fillCircle(ex, ey, 9);
      rg.fillStyle(0xfff1c9, 0.8).fillCircle(ex - 2.5, ey - 2.5, 3);
    }
    rg.fillStyle(0x9c7a3e, 1).fillCircle(0, 0, R * 0.125);
    rg.fillStyle(C.goldHi, 1).fillCircle(-3, -3, R * 0.1);

    // números
    ORDER.forEach((n, i) => {
      const a = -Math.PI / 2 + i * step;
      const r = (rN + rP) / 2 + 1;
      const t = this.txt(Math.cos(a) * r, Math.sin(a) * r, n, {
        size: 17,
        family: F.title,
        weight: 700,
        ox: 0.5,
        oy: 0.5,
      });
      t.setRotation(a + Math.PI / 2);
      rot.add(t);
    });
    rot.setRotation(this.s.wheelRot);
    this.rotor = rot;

    // selo central (fixo)
    const cg = this.add.graphics();
    cg.fillStyle(0x0b1622, 1).fillCircle(cx, cy, 25);
    cg.lineStyle(2, C.gold, 1).strokeCircle(cx, cy, 25);
    this.txt(cx, cy, `${PAYOUT}×`, { size: 16, family: F.mono, weight: 600, ox: 0.5, oy: 0.5 });

    // bola
    const ball = this.add.container(0, 0);
    ball.add([
      this.add.circle(2, 3, 9, 0x000000, 0.45),
      this.add.circle(0, 0, 9, 0xf3f4f6),
      this.add.circle(-3, -3, 3.5, 0xffffff),
    ]);
    this.ball = ball;
    this.placeBall(this.s.ballAngle, this.s.ballR);

    // leitor
    const pg = this.add.graphics();
    pg.fillStyle(0x000000, 0.35).fillTriangle(cx - 12, cy - R - 5, cx + 14, cy - R - 5, cx + 1, cy - R + 22);
    pg.fillStyle(0xffffff, 1).fillTriangle(cx - 13, cy - R - 8, cx + 13, cy - R - 8, cx, cy - R + 18);
  }

  private placeBall(a: number, rf: number) {
    const { cx, cy, R } = this.wheel;
    this.ball.setPosition(cx + Math.cos(a) * R * rf, cy + Math.sin(a) * R * rf);
  }

  /* ----------------------------- mesa ----------------------------- */

  private buildTable(r: Box, orient: 'v' | 'h') {
    const g = this.add.graphics();
    g.fillStyle(0x000000, 0.4).fillRoundedRect(r.x + 5, r.y + 10, r.w, r.h, 26);
    g.fillStyle(0x2c1a0d, 1).fillRoundedRect(r.x, r.y, r.w, r.h, 26);
    g.fillStyle(0x4d311c, 1).fillRoundedRect(r.x + 4, r.y + 4, r.w - 8, r.h - 8, 23);
    g.lineStyle(1, 0x7a5431, 0.7).strokeRoundedRect(r.x + 9, r.y + 9, r.w - 18, r.h - 18, 19);

    const rail = 16;
    const f: Box = { x: r.x + rail, y: r.y + rail, w: r.w - rail * 2, h: r.h - rail * 2 };
    g.fillStyle(C.felt, 1).fillRoundedRect(f.x, f.y, f.w, f.h, 14);
    [0.95, 0.8, 0.62, 0.45].forEach(k =>
      g.fillStyle(0x1f6a4f, 0.07).fillEllipse(f.x + f.w / 2, f.y + f.h / 2, f.w * k, f.h * k),
    );
    g.lineStyle(1.5, C.gold, 0.5).strokeRoundedRect(f.x + 7, f.y + 7, f.w - 14, f.h - 14, 10);

    const cellG = this.add.graphics();
    const drawCell = (n: number, x: number, y: number, w: number, h: number) => {
      cellG.lineStyle(1.2, C.gold, 0.85).strokeRect(x, y, w, h);
      cellG.fillStyle(COND[COLOR_OF[n]].pocket, 1).fillRoundedRect(x + 5, y + 5, w - 10, h - 10, 5);
      this.txt(x + w / 2, y + h / 2, n, { size: 19, family: F.title, weight: 700, ox: 0.5, oy: 0.5 });
      this.cells[n] = { x, y, w, h };
    };

    if (orient === 'v') {
      this.txt(f.x + f.w / 2, f.y + 34, `MESA TRICROMÁTICA  ·  PAGA ${PAYOUT}×`, {
        size: 13, color: CSS.gold, spacing: 4, weight: 600, ox: 0.5, oy: 0.5,
      });
      const top = f.y + 62, bottom = f.y + f.h - 22;
      const ch = (bottom - top) / 12, cw = 88, gap = 18, colW = 180;
      const x0 = f.x + (f.w - (cw * 3 + gap + colW)) / 2;
      for (let row = 0; row < 12; row++)
        for (let c = 0; c < 3; c++) drawCell(row * 3 + c + 1, x0 + c * cw, top + row * ch, cw, ch);
      CKEYS.forEach((k, j) =>
        this.colorBox(k, { x: x0 + cw * 3 + gap, y: top + j * 4 * ch, w: colW, h: 4 * ch }, 'v', g),
      );
    } else {
      const top = f.y + 14, ch = 42;
      const cw = (f.w - 28) / 12, x0 = f.x + 14;
      for (let c = 0; c < 12; c++)
        for (let row = 0; row < 3; row++) drawCell(c * 3 + (3 - row), x0 + c * cw, top + row * ch, cw, ch);
      const by = top + ch * 3 + 10;
      const bh = f.y + f.h - 14 - by;
      CKEYS.forEach((k, j) => this.colorBox(k, { x: x0 + j * 4 * cw, y: by, w: 4 * cw, h: bh }, 'h', g));
    }

    this.ui.boxHi = this.add.graphics();
    this.ui.cellHi = this.add.graphics();
  }

  private colorBox(k: CondKey, b: Box, orient: 'v' | 'h', g: Phaser.GameObjects.Graphics) {
    this.boxes[k] = b;
    g.lineStyle(1.2, C.gold, 0.85).strokeRect(b.x, b.y, b.w, b.h);
    const col = COND[k].pocket;
    const diamond = (dx: number, dy: number, hw: number, hh: number) => {
      const pts = [
        new Phaser.Math.Vector2(dx, dy - hh),
        new Phaser.Math.Vector2(dx + hw, dy),
        new Phaser.Math.Vector2(dx, dy + hh),
        new Phaser.Math.Vector2(dx - hw, dy),
      ];
      g.fillStyle(col, 1).fillPoints(pts, true);
      g.lineStyle(1.5, C.goldHi, 1).strokePoints(pts, true);
    };
    const label = `${COND[k].label.toUpperCase()}`;
    if (orient === 'v') {
      diamond(b.x + b.w / 2, b.y + b.h / 2 - 14, 46, 28);
      this.txt(b.x + b.w / 2, b.y + b.h / 2 + 34, label, { size: 14, color: CSS.gold, spacing: 4, weight: 700, ox: 0.5, oy: 0.5 });
    } else {
      diamond(b.x + 44, b.y + b.h / 2, 26, 16);
      this.txt(b.x + 84, b.y + b.h / 2, label, { size: 14, color: CSS.gold, spacing: 4, weight: 700, oy: 0.5 });
    }
    const z = this.add.zone(b.x, b.y, b.w, b.h).setOrigin(0).setInteractive({ useHandCursor: true });
    z.on('pointerover', () => { this.boxHover = k; this.drawBoxHighlights(); });
    z.on('pointerout', () => { this.boxHover = null; this.drawBoxHighlights(); });
    z.on('pointerdown', () => this.selectCond(k));
  }

  /* ----------------------------- controles ----------------------------- */

  private sectionTitle(x: number, y: number, n: string, label: string, color: string) {
    this.txt(x, y + 12, n, { size: 14, family: F.mono, color, weight: 600 });
    this.txt(x + 34, y, label, { size: 28, weight: 500 });
  }

  private drawControls(b: Box) {
    const g = this.add.graphics();
    this.card(g, b);
    const p = this.port;
    const px = b.x + (p ? 36 : 34);
    const iw = b.w - (p ? 72 : 68);

    if (!p) {
      this.sectionTitle(px, b.y + 30, '01', 'Condição', CSS.accent);
      CKEYS.forEach((k, i) => this.optionRow(k, { x: px, y: b.y + 82 + i * 66, w: iw, h: 56 }));
      g.lineStyle(1, C.border, 1).lineBetween(px, b.y + 292, px + iw, b.y + 292);

      this.sectionTitle(px, b.y + 314, '02', 'Magnitude', CSS.orange);
      this.stepper({ x: px, y: b.y + 366, w: iw, h: 64 });
      this.ui.limit = this.txt(px, b.y + 446, '', { size: 14, family: F.mono, color: CSS.muted });
      this.chipRow(px + iw / 2, b.y + 502, iw);
      g.lineStyle(1, C.border, 1).lineBetween(px, b.y + 548, px + iw, b.y + 548);

      this.sectionTitle(px, b.y + 568, '03', 'Execução', CSS.muted);
      this.ui.exec = this.button(px, b.y + 620, iw, 62, { label: 'EXECUTAR ENSAIO', primary: true, size: 16, spacing: 4, onClick: () => this.execute() });
      this.ui.stop = this.button(px, b.y + 696, iw, 50, { label: 'ENCERRAR SESSÃO', size: 14, spacing: 3, onClick: () => this.endSession('Sessão encerrada por você.') });
    } else {
      this.sectionTitle(px, b.y + 26, '01', 'Condição', CSS.accent);
      const ow = (iw - 20) / 3;
      CKEYS.forEach((k, i) => this.optionRow(k, { x: px + i * (ow + 10), y: b.y + 78, w: ow, h: 56 }));
      g.lineStyle(1, C.border, 1).lineBetween(px, b.y + 156, px + iw, b.y + 156);

      const colW = (iw - 40) / 2;
      this.sectionTitle(px, b.y + 172, '02', 'Magnitude', CSS.orange);
      this.stepper({ x: px, y: b.y + 222, w: colW, h: 60 });
      this.ui.limit = this.txt(px, b.y + 298, '', { size: 14, family: F.mono, color: CSS.muted });
      this.chipRow(px + colW / 2, b.y + 350, colW);

      const rx = px + colW + 40;
      this.sectionTitle(rx, b.y + 172, '03', 'Execução', CSS.muted);
      this.ui.exec = this.button(rx, b.y + 222, colW, 60, { label: 'EXECUTAR ENSAIO', primary: true, size: 16, spacing: 4, onClick: () => this.execute() });
      this.ui.stop = this.button(rx, b.y + 296, colW, 50, { label: 'ENCERRAR SESSÃO', size: 14, spacing: 3, onClick: () => this.endSession('Sessão encerrada por você.') });
    }
  }

  private optionRow(k: CondKey, b: Box) {
    const g = this.add.graphics();
    this.txt(b.x + 52, b.y + b.h / 2, COND[k].label, { size: 18, weight: 500, oy: 0.5 });
    let hover = false;
    const row: OptionRow = {
      draw: () => {
        const active = this.s.cond === k;
        g.clear();
        g.fillStyle(active ? 0x0f2539 : hover ? 0x0d1b2b : C.field, 1).fillRoundedRect(b.x, b.y, b.w, b.h, 12);
        g.lineStyle(active ? 2 : 1.5, active ? C.accent : hover ? C.borderHi : C.border, 1).strokeRoundedRect(b.x, b.y, b.w, b.h, 12);
        g.fillStyle(COND[k].ui, 1).fillRoundedRect(b.x + 22, b.y + b.h / 2 - 9, 18, 18, 4);
        if (k === 'preto') g.lineStyle(1, 0x475569, 1).strokeRoundedRect(b.x + 22, b.y + b.h / 2 - 9, 18, 18, 4);
        if (active) {
          const cx = b.x + b.w - 26, cy = b.y + b.h / 2;
          g.fillStyle(C.accent, 1).fillCircle(cx, cy, 10);
          g.lineStyle(2.4, 0x04121f, 1);
          g.beginPath();
          g.moveTo(cx - 4.5, cy);
          g.lineTo(cx - 1, cy + 3.5);
          g.lineTo(cx + 5, cy - 3.5);
          g.strokePath();
        }
      },
    };
    const z = this.add.zone(b.x, b.y, b.w, b.h).setOrigin(0).setInteractive({ useHandCursor: true });
    z.on('pointerover', () => { hover = true; row.draw(); });
    z.on('pointerout', () => { hover = false; row.draw(); });
    z.on('pointerdown', () => this.selectCond(k));
    this.opts[k] = row;
  }

  private stepper(b: Box) {
    const g = this.add.graphics();
    g.fillStyle(C.field, 1).fillRoundedRect(b.x, b.y, b.w, b.h, 12);
    g.lineStyle(1.5, C.border, 1).strokeRoundedRect(b.x, b.y, b.w, b.h, 12);
    g.lineBetween(b.x + 60, b.y, b.x + 60, b.y + b.h);
    g.lineBetween(b.x + b.w - 60, b.y, b.x + b.w - 60, b.y + b.h);
    this.txt(b.x + 30, b.y + b.h / 2, '−', { size: 24, ox: 0.5, oy: 0.5 });
    this.txt(b.x + b.w - 30, b.y + b.h / 2, '+', { size: 24, ox: 0.5, oy: 0.5 });
    this.ui.magVal = this.txt(0, b.y + b.h / 2 + 2, '', { size: 38, family: F.title, weight: 600, ox: 1, oy: 0.5 });
    this.ui.magLabel = this.txt(0, b.y + b.h / 2, 'FICHAS', { size: 12, color: CSS.muted, spacing: 3, weight: 600, oy: 0.5 });
    this.ui.magCx = b.x + b.w / 2;
    const minus = this.add.zone(b.x, b.y, 60, b.h).setOrigin(0).setInteractive({ useHandCursor: true });
    const plus = this.add.zone(b.x + b.w - 60, b.y, 60, b.h).setOrigin(0).setInteractive({ useHandCursor: true });
    minus.on('pointerdown', () => this.setMag(this.s.mag - 1));
    plus.on('pointerdown', () => this.setMag(this.s.mag + 1));
  }

  private chipRow(cx: number, cy: number, w: number) {
    const vals = [1, 5, 10, 25];
    const gap = Math.min(76, w / 4);
    vals.forEach((v, i) => {
      const x = cx + (i - 1.5) * gap;
      const c = this.chip(x, cy, 22, v);
      c.setSize(48, 48).setInteractive({ useHandCursor: true });
      c.on('pointerover', () => c.setScale(1.08));
      c.on('pointerout', () => c.setScale(1));
      c.on('pointerdown', () => this.setMag(v));
    });
  }

  /* ----------------------------- estado / refresh ----------------------------- */

  private selectCond(k: CondKey) {
    if (this.s.spinning || this.s.ended) return;
    this.s.cond = k;
    this.setMsg(`Condição ${COND[k].label.toLowerCase()} selecionada · ${this.s.mag} fichas. Execute o ensaio.`, 'idle');
  }

  private setMag(v: number) {
    if (this.s.spinning || this.s.ended) return;
    this.s.mag = Phaser.Math.Clamp(Math.round(v), 1, Math.max(1, this.s.fichas));
    this.refresh();
  }

  private setMsg(msg: string, tone: Tone) {
    this.s.msg = msg;
    this.s.tone = tone;
    this.refresh();
  }

  private drawBoxHighlights() {
    const g = this.ui.boxHi;
    g.clear();
    CKEYS.forEach(k => {
      const b = this.boxes[k];
      if (!b) return;
      if (this.s.cond === k) {
        g.fillStyle(0xffffff, 0.07).fillRect(b.x + 1, b.y + 1, b.w - 2, b.h - 2);
        g.lineStyle(3, C.accent, 1).strokeRect(b.x + 1.5, b.y + 1.5, b.w - 3, b.h - 3);
      } else if (this.boxHover === k && !this.s.spinning && !this.s.ended) {
        g.fillStyle(0xffffff, 0.05).fillRect(b.x + 1, b.y + 1, b.w - 2, b.h - 2);
      }
    });
  }

  private refresh() {
    const s = this.s, u = this.ui;

    u.fichas.setText(String(s.fichas));
    u.meta.setText(String(s.meta));
    u.ensaios.setText(String(s.ensaios).padStart(2, '0'));
    const mb = u.metaBarBox;
    u.metaBar.clear();
    u.metaBar.fillStyle(C.border, 1).fillRoundedRect(mb.x, mb.y, mb.w, mb.h, 2.5);
    u.metaBar.fillStyle(C.accent, 1).fillRoundedRect(mb.x, mb.y, Math.max(5, mb.w * Math.min(1, s.fichas / s.meta)), mb.h, 2.5);

    u.seq.setText(`sequência sem reforço · ${s.semReforco}`);

    // pílula de status
    const label = s.ended ? 'Sessão encerrada' : s.spinning ? 'Ensaio em execução' : 'Coletando dados';
    const pc = s.ended ? C.warn : C.accent;
    u.pillText.setText(label).setColor(s.ended ? CSS.orange : CSS.accent);
    const pw = u.pillText.width + 48, ph = 38;
    const px = u.pillRight - pw;
    u.pill.clear();
    u.pill.fillStyle(pc, 0.1).fillRoundedRect(px, u.pillY - ph / 2, pw, ph, ph / 2);
    u.pill.lineStyle(1.5, pc, 0.55).strokeRoundedRect(px, u.pillY - ph / 2, pw, ph, ph / 2);
    u.pill.fillStyle(pc, 1).fillCircle(px + 20, u.pillY, 4);
    u.pillText.setPosition(px + 34, u.pillY);

    CKEYS.forEach(k => this.opts[k]?.draw());

    u.magVal.setText(String(s.mag)).setX(u.magCx + 14);
    u.magLabel.setX(u.magCx + 22);
    const groupW = u.magVal.width + 8 + u.magLabel.width;
    u.magVal.setX(u.magCx - groupW / 2 + u.magVal.width);
    u.magLabel.setX(u.magVal.x + 8);
    u.limit.setText(`limite atual · ${s.fichas} fichas`);

    u.exec.setEnabled(!s.spinning && !s.ended);
    u.stop.setEnabled(!s.spinning && !s.ended);

    // mensagem
    const toneCol = { idle: C.idle, spin: C.accent, win: C.win, loss: C.loss, warn: C.warn }[s.tone];
    u.dot.clear().fillStyle(toneCol, 1).fillCircle(u.dotPos.x, u.dotPos.y, 5);
    u.msg.setText(s.msg).setColor(s.tone === 'idle' ? CSS.muted : CSS.text);

    this.drawBoxHighlights();

    // ficha apostada na mesa
    this.betChip?.destroy();
    this.betChip = null;
    if (s.cond && !s.ended && s.fichas + (s.spinning ? s.mag : 0) > 0) {
      const b = this.boxes[s.cond]!;
      const vertical = b.h > b.w * 0.5;
      const x = b.x + b.w - 32;
      const y = vertical ? b.y + 32 : b.y + b.h / 2;
      this.betChip = this.chip(x, y, vertical ? 21 : 18, s.mag);
    }

    // casa sorteada
    u.cellHi.clear();
    if (s.lastN != null) {
      const c = this.cells[s.lastN];
      u.cellHi.lineStyle(8, C.goldHi, 0.25).strokeRect(c.x - 2, c.y - 2, c.w + 4, c.h + 4);
      u.cellHi.lineStyle(3, C.goldHi, 1).strokeRect(c.x + 1, c.y + 1, c.w - 2, c.h - 2);
    }

    // histórico
    this.histObjs.forEach(o => o.destroy());
    this.histObjs = [];
    if (s.history.length) {
      let x = u.histRight - 15;
      [...s.history].reverse().forEach((h, idx, arr) => {
        const newest = idx === arr.length - 1;
        const circ = this.add.circle(x, u.histY, 15, COND[h.col].pocket).setStrokeStyle(newest ? 2 : 1, newest ? C.goldHi : 0xffffff, newest ? 1 : 0.18);
        const t = this.txt(x, u.histY, h.n, { size: 12, family: F.title, weight: 700, ox: 0.5, oy: 0.5 });
        this.histObjs.push(circ, t);
        x -= 36;
      });
      this.histObjs.push(this.txt(x + 8, u.histY, 'últimos', { size: 13, family: F.mono, color: CSS.dim, ox: 1, oy: 0.5 }));
    }
  }

  private updateClock() {
    const end = this.s.endAt ?? Date.now();
    const sec = Math.floor((end - this.s.start) / 1000);
    const h = Math.floor(sec / 3600), m = Math.floor((sec % 3600) / 60), ss = sec % 60;
    const p2 = (n: number) => String(n).padStart(2, '0');
    this.ui.dur.setText(h > 0 ? `${h}:${p2(m)}:${p2(ss)}` : `${p2(m)}:${p2(ss)}`);
  }

  private bindKeys() {
    this.input.keyboard?.on('keydown', (e: KeyboardEvent) => {
      if (e.key === '1') this.selectCond('azul');
      else if (e.key === '2') this.selectCond('vermelho');
      else if (e.key === '3') this.selectCond('preto');
      else if (e.key === 'ArrowUp' || e.key === '+') this.setMag(this.s.mag + 1);
      else if (e.key === 'ArrowDown' || e.key === '-') this.setMag(this.s.mag - 1);
      else if (e.key === 'Enter' || e.key === ' ') this.execute();
    });
  }

  /* ----------------------------- ensaio ----------------------------- */

  private async execute() {
    const s = this.s;
    if (s.spinning || s.ended || !this.onSpin) return;
    if (!s.cond) {
      this.setMsg('Selecione uma condição antes de executar o ensaio.', 'warn');
      return;
    }
    const bet = { cond: s.cond, mag: Math.min(s.mag, s.fichas) };
    if (bet.mag <= 0) {
      this.setMsg('Fichas insuficientes para esta magnitude.', 'warn');
      return;
    }
    s.spinning = true;
    s.lastN = null;
    this.setMsg(`Ensaio ${s.ensaios + 1} em execução · ${COND[bet.cond].label}, ${bet.mag} fichas.`, 'spin');
    this.refresh();

    try {
      const result = await this.onSpin(bet.cond, bet.mag);
      const k = pocketFor(result.opcao);
      this.spin(k, () => this.resolve(k, bet, result));
    } catch {
      s.spinning = false;
      this.setMsg('Falha ao executar o ensaio. Tente novamente.', 'warn');
      this.refresh();
    }
  }

  private spin(k: number, done: () => void) {
    const s = this.s;
    const step = TAU / 36;
    const cur = s.wheelRot;
    const base = cur + TAU * 4;
    const target = base + mod(-k * step - base, TAU);
    const pocketAbs = (rot: number) => -Math.PI / 2 + k * step + rot;
    const off0 = TAU * 8 + mod(s.ballAngle - pocketAbs(cur), TAU);
    const startR = s.ballR;
    const LAND = 0.72;

    this.tweens.addCounter({
      from: 0,
      to: 1,
      duration: 7200,
      ease: 'Linear',
      onUpdate: tw => {
        const p = tw.getValue() ?? 0;
        const rot = cur + (target - cur) * (1 - Math.pow(1 - p, 3));
        this.rotor.setRotation(rot);

        const q = Math.min(p / LAND, 1);
        const ang = pocketAbs(rot) + off0 * Math.pow(1 - q, 2);
        let rf: number;
        if (q < 0.06) rf = lerp(startR, TRACK, q / 0.06);
        else if (q < 0.8) rf = TRACK;
        else if (q < 1) rf = lerp(TRACK, POCKET, Phaser.Math.Easing.Quadratic.In((q - 0.8) / 0.2));
        else {
          const t = (p - LAND) / (1 - LAND);
          rf = POCKET + 0.035 * Math.abs(Math.sin(t * Math.PI * 3)) * Math.pow(1 - t, 2);
        }
        this.placeBall(ang, rf);
      },
      onComplete: () => {
        s.wheelRot = mod(target, TAU);
        this.rotor.setRotation(s.wheelRot);
        s.ballAngle = -Math.PI / 2;
        s.ballR = POCKET;
        this.placeBall(s.ballAngle, s.ballR);
        done();
      },
    });
  }

  private resolve(k: number, bet: { cond: CondKey; mag: number }, result: SpinResult) {
    const s = this.s;
    const n = ORDER[k];
    const col = result.opcao;
    const win = result.won;
    const fichasAntes = s.fichas;
    const delta = result.coinsAmount - fichasAntes;
    s.ensaios++;
    s.spinning = false;
    s.fichas = result.coinsAmount;
    s.lastN = n;
    s.history.unshift({ n, col });
    s.history = s.history.slice(0, 8);

    if (win) {
      s.acertos++;
      s.semReforco = 0;
      s.msg = `Resultado ${n} · ${COND[col].label}. Reforço: +${delta} fichas.`;
      s.tone = 'win';
    } else {
      s.semReforco++;
      s.msg = `Resultado ${n} · ${COND[col].label}. Sem reforço: ${delta} fichas.`;
      s.tone = 'loss';
    }

    this.onTrial?.({
      sessao: s.code,
      ensaio: s.ensaios,
      condicao: bet.cond,
      magnitude: bet.mag,
      resultado: n,
      corResultado: col,
      reforco: win,
      fichasApos: s.fichas,
      timestamp: new Date().toISOString(),
    });
    this.game.events.emit('roleta:trial', s);

    this.floatDelta(delta >= 0 ? `+${delta}` : `${delta}`, win);
    s.mag = Phaser.Math.Clamp(s.mag, 1, Math.max(1, s.fichas));

    if (win && s.fichas >= s.meta) {
      s.msg += ' Meta atingida.';
    }
    this.refresh();
    this.pulseCell();

    if (result.matchFinished) {
      this.time.delayedCall(900, () => this.endSession(s.fichas <= 0 ? 'Fichas esgotadas.' : 'Meta atingida.'));
    } else if (this.pendingTimeout) {
      this.pendingTimeout = false;
      this.endSession('Tempo esgotado.');
    } else if (this.pendingSize) {
      const size = this.pendingSize;
      this.pendingSize = null;
      this.time.delayedCall(400, () => this.requestLayout(size));
    }
  }

  private floatDelta(str: string, win: boolean) {
    const t = this.ui.fichas;
    const f = this.txt(t.x + t.width + 14, t.y - t.height / 2, str, {
      size: 24,
      family: F.title,
      weight: 700,
      color: win ? '#4ade80' : '#f87171',
      oy: 0.5,
    });
    this.tweens.add({ targets: f, y: f.y - 30, alpha: 0, duration: 1400, ease: 'Cubic.Out', onComplete: () => f.destroy() });
  }

  private pulseCell() {
    this.tweens.add({ targets: this.ui.cellHi, alpha: { from: 1, to: 0.2 }, duration: 260, yoyo: true, repeat: 3 });
  }

  /* ----------------------------- sessão ----------------------------- */

  private endSession(reason: string) {
    if (this.s.spinning || this.s.ended) return;
    this.s.ended = true;
    this.s.endAt = Date.now();
    this.s.cond = null;
    this.setMsg(reason, 'warn');
    this.updateClock();
    this.game.events.emit('roleta:end', this.s);
    void this.onFinish?.();
    this.showSummary();
  }

  private showSummary() {
    const { width: W, height: H } = this.scale;
    const s = this.s;
    const D = 100;
    this.add.rectangle(0, 0, W, H, 0x02070d, 0.74).setOrigin(0).setDepth(D).setInteractive();
    const w = Math.min(600, W - 80), h = 470;
    const x = (W - w) / 2, y = (H - h) / 2;
    const g = this.add.graphics().setDepth(D);
    this.card(g, { x, y, w, h }, 24);

    const add = (o: Phaser.GameObjects.Text) => o.setDepth(D + 1);
    add(this.txt(x + 40, y + 36, 'SESSÃO ' + s.code, { size: 13, color: CSS.muted, spacing: 3, weight: 600 }));
    add(this.txt(x + 38, y + 60, 'Sessão encerrada', { size: 38, family: F.title, weight: 700 }));

    const saldo = s.fichas - s.inicial;
    const taxa = s.ensaios ? Math.round((s.acertos / s.ensaios) * 100) : 0;
    const rows: [string, string, string?][] = [
      ['Ensaios', String(s.ensaios)],
      ['Reforços', `${s.acertos} · ${taxa}%`],
      ['Fichas finais', String(s.fichas)],
      ['Saldo', `${saldo >= 0 ? '+' : '−'}${Math.abs(saldo)}`, saldo >= 0 ? '#4ade80' : '#f87171'],
      ['Duração', this.ui.dur.text, CSS.orange],
    ];
    rows.forEach(([k, v, c], i) => {
      const ry = y + 140 + i * 46;
      g.lineStyle(1, C.border, 1).lineBetween(x + 40, ry + 38, x + w - 40, ry + 38);
      add(this.txt(x + 40, ry + 12, k, { size: 17, color: CSS.muted }));
      add(this.txt(x + w - 40, ry + 10, v, { size: 20, family: F.mono, weight: 600, color: c ?? CSS.text, ox: 1 }));
    });
    this.button(x + 40, y + h - 88, w - 80, 58, {
      label: 'VOLTAR ÀS SESSÕES',
      primary: true,
      size: 16,
      spacing: 4,
      depth: D + 1,
      onClick: () => this.onExit?.(),
    });
  }
}
