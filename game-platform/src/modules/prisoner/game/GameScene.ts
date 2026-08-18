import Phaser from 'phaser';
import { CardSprite } from './CardSprite';
import type { CardType } from './CardSprite';
import { eventBus, GAME_EVENTS, PLAYER_EVENTS, UI_EVENTS } from './events';

type Choice = 'cooperate' | 'defect';
type Phase = 'waiting' | 'dealing' | 'choosing' | 'committed' | 'revealing' | 'finished';

interface RoundResultData {
  round: number;
  result: {
    player1Choice: Choice;
    player2Choice: Choice;
    player1Points: number;
    player2Points: number;
    player1TimedOut?: boolean;
    player2TimedOut?: boolean;
  };
  totalPoints: { player1: number | null; player2: number | null };
  nextRound: number | null;
  timedOut: boolean;
}

interface MatchReadyData {
  currentRound: number;
  totalRounds: number;
  roundTimeLimit: number | null;
  userViewPoints: boolean;
  player1Id: string;
  player2Id: string;
  totalPoints?: { player1: number | null; player2: number | null };
  pendingChoices?: { player1: boolean; player2: boolean };
  roundEndsAt?: number | null;
  serverNow?: number;
  receivedAt?: number;
}

interface RoundStartData {
  round: number;
  totalRounds: number;
  roundEndsAt: number | null;
  serverNow: number;
  receivedAt?: number;
}

interface MatchFinishedData {
  finalScore: { player1: number; player2: number };
}

export class GameScene extends Phaser.Scene {
  private queue: Array<{ type: string; data: unknown }> = [];
  private busy = false;
  private phase: Phase = 'waiting';
  private opponentGone = false;
  private isPlayer1 = false;
  private currentRound = 1;
  private totalRounds = 10;
  private roundTimeLimit: number | null = null;
  private myScore = 0;
  private oppScore: number | null = 0;
  private lastResultRound = 0;
  private roundEndsAt: number | null = null;
  private clockOffset = 0;
  private timerVisible = false;

  private handCards: CardSprite[] = [];
  private myTableCard: CardSprite | null = null;
  private oppTableCard: CardSprite | null = null;
  private tableTexts: Phaser.GameObjects.Text[] = [];
  private verdictText: Phaser.GameObjects.Text | null = null;

  private roundText!: Phaser.GameObjects.Text;
  private timerText!: Phaser.GameObjects.Text;
  private myScoreText!: Phaser.GameObjects.Text;
  private oppScoreText!: Phaser.GameObjects.Text;
  private statusText!: Phaser.GameObjects.Text;
  private timerBar!: Phaser.GameObjects.Graphics;
  private pipsGfx!: Phaser.GameObjects.Graphics;
  private flashRect!: Phaser.GameObjects.Rectangle;

  private pendingTimers: Phaser.Time.TimerEvent[] = [];
  private busHandlers: Array<{ event: string; fn: (...args: unknown[]) => void }> = [];

  private cx = 0;
  private cy = 0;
  private handY = 0;
  private myX = 0;
  private oppX = 0;

  constructor() {
    super({ key: 'GameScene' });
  }

  // ══════════════════════════════════════════════════════════════════════
  // Fila de eventos
  // ══════════════════════════════════════════════════════════════════════

  private enqueue(type: string, data: unknown) {
    this.queue.push({ type, data });
    this.pump();
  }

  private pump() {
    if (this.busy) return;
    const ev = this.queue.shift();
    if (!ev) return;

    this.busy = true;
    let called = false;
    const done = () => {
      if (called) return;
      called = true;
      this.busy = false;
      this.pump();
    };

    try {
      this.handleEvent(ev.type, ev.data, done);
    } catch (err) {
      console.error('[GameScene] erro ao processar evento', ev.type, err);
      done();
    }
  }

  private handleEvent(type: string, data: unknown, done: () => void) {
    switch (type) {
      case GAME_EVENTS.MATCH_READY:
        this.handleMatchReady(data as MatchReadyData, done);
        break;
      case GAME_EVENTS.ROUND_START:
        this.handleRoundStart(data as RoundStartData, done);
        break;
      case GAME_EVENTS.CHOICE_RECEIVED:
        if (this.phase === 'committed') this.setStatus('Escolha registrada. Aguardando o outro suspeito...');
        done();
        break;
      case GAME_EVENTS.ROUND_TIMEOUT:
        this.handleRoundTimeoutCue(done);
        break;
      case GAME_EVENTS.ROUND_RESULT:
        this.handleRoundResult(data as RoundResultData, done);
        break;
      case GAME_EVENTS.MATCH_FINISHED:
        this.handleMatchFinished(data as MatchFinishedData, done);
        break;
      case GAME_EVENTS.PLAYER_DISCONNECTED:
        this.opponentGone = true;
        this.roundEndsAt = null;
        this.setStatus('O suspeito saiu da sala. Aguardando retorno...');
        done();
        break;
      default:
        done();
    }
  }

  private ms(base: number): number {
    const heavy = this.queue.filter(
      e => e.type === GAME_EVENTS.ROUND_RESULT || e.type === GAME_EVENTS.MATCH_READY,
    ).length;
    return Math.max(1, Math.round(base * (heavy > 0 ? 0.35 : 1)));
  }

  private schedule(delay: number, cb: () => void) {
    const t = this.time.delayedCall(delay, cb);
    this.pendingTimers.push(t);
    return t;
  }

  private clearPendingTimers() {
    this.pendingTimers.forEach(t => t.remove(false));
    this.pendingTimers = [];
  }

  create() {
    const { width, height } = this.scale;
    this.cx = width / 2;
    this.cy = height / 2;
    this.handY = height - 90;
    this.myX = this.cx - 65;
    this.oppX = this.cx + 65;

    this.isPlayer1 = sessionStorage.getItem('isPlayer1') === 'true';

    const doCleanup = () => {
      this.busHandlers.forEach(({ event, fn }) => eventBus.off(event, fn));
      this.busHandlers = [];
      this.clearPendingTimers();
    };
    this.events.once('shutdown', doCleanup);
    this.events.once('destroy', doCleanup);

    this.buildTable();
    this.buildHUD();
    this.registerEvents();

    this.setStatus('Preparando o interrogatório...');

    const raw = sessionStorage.getItem('matchReadyData');
    if (raw) {
      try {
        this.enqueue(GAME_EVENTS.MATCH_READY, JSON.parse(raw));
      } catch {
      }
    }
    const rawResult = sessionStorage.getItem('matchResult');
    if (rawResult) {
      try {
        const res = JSON.parse(rawResult) as { matchId?: string };
        if (res?.matchId && res.matchId === sessionStorage.getItem('matchId')) {
          this.enqueue(GAME_EVENTS.MATCH_FINISHED, res);
        }
      } catch {
      }
    }
  }

  private onBus(event: string, fn: (...args: unknown[]) => void) {
    this.busHandlers.push({ event, fn });
    eventBus.on(event, fn);
  }

  private registerEvents() {
    for (const ev of Object.values(GAME_EVENTS)) {
      this.onBus(ev, (data: unknown) => this.enqueue(ev, data));
    }
  }

  update() {
    this.drawTimer();
  }

  private handleMatchReady(d: MatchReadyData, done: () => void) {
    this.totalRounds = d.totalRounds;
    this.roundTimeLimit = d.roundTimeLimit;
    this.currentRound = d.currentRound;
    this.lastResultRound = d.currentRound - 1;
    this.opponentGone = false;

    const tp = d.totalPoints;
    this.myScore = (this.isPlayer1 ? tp?.player1 : tp?.player2) ?? 0;
    const opp = this.isPlayer1 ? tp?.player2 : tp?.player1;
    this.oppScore = opp === undefined ? 0 : opp;

    this.roundEndsAt = d.roundEndsAt ?? null;
    this.clockOffset = d.serverNow ? d.serverNow - (d.receivedAt ?? Date.now()) : 0;

    this.clearPendingTimers();
    this.sweepTable(true);
    this.destroyHand();

    this.refreshRoundHud();
    this.refreshScores(false);

    const myPending = d.pendingChoices
      ? (this.isPlayer1 ? d.pendingChoices.player1 : d.pendingChoices.player2)
      : false;

    if (myPending) {
      this.phase = 'committed';
      this.myTableCard = new CardSprite(this, this.myX, this.cy, 'back');
      this.myTableCard.slideIn(this.myX, this.cy + 170, this.myX, this.cy, this.ms(320));
      this.setStatus('Escolha registrada. Aguardando o outro suspeito...');
      this.schedule(this.ms(360), done);
    } else {
      this.dealRound(done);
    }
  }

  private handleRoundStart(d: RoundStartData, done: () => void) {
    this.currentRound = d.round;
    if (d.totalRounds) this.totalRounds = d.totalRounds;
    this.roundEndsAt = d.roundEndsAt ?? null;
    if (d.serverNow) this.clockOffset = d.serverNow - (d.receivedAt ?? Date.now());
    this.refreshRoundHud();
    done();
  }

  private handleRoundTimeoutCue(done: () => void) {
    if (this.phase === 'choosing') {
      this.handCards.forEach(c => c.shake());
      this.phase = 'committed';
    }
    this.setStatus('TEMPO ESGOTADO');
    this.roundEndsAt = null;

    this.flashRect.setAlpha(0);
    this.tweens.add({
      targets: this.flashRect,
      alpha: { from: 0.2, to: 0 },
      duration: this.ms(320),
    });

    this.schedule(this.ms(380), done);
  }

  private handleRoundResult(d: RoundResultData, done: () => void) {
    if (d.round <= this.lastResultRound) {
      done();
      return;
    }
    this.lastResultRound = d.round;

    this.phase = 'revealing';
    this.roundEndsAt = null;
    this.setStatus('');

    const r = d.result;
    const myChoice  = this.isPlayer1 ? r.player1Choice : r.player2Choice;
    const oppChoice = this.isPlayer1 ? r.player2Choice : r.player1Choice;
    const myPts     = this.isPlayer1 ? r.player1Points : r.player2Points;
    const oppPts    = this.isPlayer1 ? r.player2Points : r.player1Points;
    const myTO      = this.isPlayer1 ? !!r.player1TimedOut : !!r.player2TimedOut;
    const oppTO     = this.isPlayer1 ? !!r.player2TimedOut : !!r.player1TimedOut;

    this.myScore = (this.isPlayer1 ? d.totalPoints.player1 : d.totalPoints.player2) ?? this.myScore;
    const oppTot = this.isPlayer1 ? d.totalPoints.player2 : d.totalPoints.player1;
    this.oppScore = oppTot ?? null;

    if (!this.myTableCard) {
      this.handCards.forEach(c => {
        c.disableInteractive();
        this.tweens.add({ targets: c, alpha: 0, duration: this.ms(200) });
      });
      this.myTableCard = new CardSprite(this, this.myX, this.cy + 170, 'back');
      this.myTableCard.slideIn(this.myX, this.cy + 170, this.myX, this.cy, this.ms(380));
    } else {
      this.myTableCard.killAnims();
      if (this.myTableCard.cardType !== 'back') this.myTableCard.rebuildAs('back');
      this.myTableCard.moveToPos(this.myX, this.cy, this.ms(180));
    }

    this.oppTableCard?.destroy();
    this.oppTableCard = new CardSprite(this, this.oppX, this.cy - 170, 'back');
    this.oppTableCard.slideIn(this.oppX, this.cy - 170, this.oppX, this.cy, this.ms(380));

    this.addTableLabels();

    this.schedule(this.ms(520), () => {
      this.myTableCard?.flip(myChoice as CardType, undefined, this.ms(140));
      this.schedule(this.ms(180), () => {
        if (!this.oppTableCard) { done(); return; }
        this.oppTableCard.flip(oppChoice as CardType, () => {
          this.floatPoints(myPts, this.myX, this.cy);
          this.floatPoints(oppPts, this.oppX, this.cy);
          if (myTO) this.addTimeoutTag(this.myX);
          if (oppTO) this.addTimeoutTag(this.oppX);
          this.showVerdict(myChoice, oppChoice);
          this.refreshScores(true);

          this.schedule(this.ms(1500), () => {
            if (d.nextRound !== null) {
              this.sweepTable(false);
              this.schedule(this.ms(430), () => {
                this.currentRound = d.nextRound!;
                this.refreshRoundHud();
                this.dealRound(done);
              });
            } else {
              this.phase = 'finished';
              done();
            }
          });
        }, this.ms(140));
      });
    });
  }

  private finalShown = false;

  private handleMatchFinished(d: MatchFinishedData, done: () => void) {
    if (this.finalShown) {
      done();
      return;
    }
    this.finalShown = true;

    this.phase = 'finished';
    this.roundEndsAt = null;
    this.setStatus('');

    const my  = this.isPlayer1 ? d.finalScore.player1 : d.finalScore.player2;
    const opp = this.isPlayer1 ? d.finalScore.player2 : d.finalScore.player1;

    const veil = this.add.rectangle(this.cx, this.cy, this.scale.width, this.scale.height, 0x000000, 0)
      .setDepth(30);
    this.tweens.add({ targets: veil, fillAlpha: 0.78, duration: this.ms(500) });

    const mono = { fontFamily: 'monospace' };
    const mkText = (y: number, text: string, size: number, color: string, bold = false) =>
      this.add.text(this.cx, y, text, {
        fontSize: `${size}px`, color, ...(bold ? { fontStyle: 'bold' } : {}), ...mono,
      }).setOrigin(0.5).setDepth(31).setAlpha(0);

    const verdict = my > opp ? 'VOCÊ VENCEU' : my < opp ? 'VOCÊ PERDEU' : 'EMPATE';
    const vColor  = my > opp ? '#3ad898' : my < opp ? '#c04040' : '#6aaad8';

    const t1 = mkText(this.cy - 70, 'FIM DO INTERROGATÓRIO', 13, '#4a9ad8');
    const t2 = mkText(this.cy - 24, `VOCÊ  ${my}  ×  ${opp}  SUSPEITO`, 22, '#c8d4e0', true);
    const t3 = mkText(this.cy + 26, verdict, 17, vColor, true);

    [t1, t2, t3].forEach((t, i) => {
      this.tweens.add({ targets: t, alpha: 1, duration: this.ms(400), delay: this.ms(300 + i * 220) });
    });

    this.schedule(this.ms(2800), () => {
      this.cameras.main.fadeOut(this.ms(500), 0, 0, 0);
      this.cameras.main.once('camerafadeoutcomplete', () => {
        eventBus.emit(UI_EVENTS.SCENE_DONE);
        done();
      });
    });
  }

  // ══════════════════════════════════════════════════════════════════════
  // Mão / jogadas
  // ══════════════════════════════════════════════════════════════════════

  private destroyHand() {
    this.handCards.forEach(c => c.destroy());
    this.handCards = [];
  }

  private dealRound(done?: () => void) {
    this.phase = 'dealing';
    this.destroyHand();

    const { height } = this.scale;
    const mk = (x: number, type: Choice, delay: number) => {
      const card = new CardSprite(this, x, height + 100, type);
      card.setInteractive({ useHandCursor: true });
      card.on('pointerdown', () => this.handleCardClick(type));
      card.on('pointerover', () => { if (this.phase === 'choosing' && !this.opponentGone) card.elevate(); });
      card.on('pointerout',  () => card.unelevate());
      card.dealIn(height + 100, this.handY, delay, this.ms(450));
      return card;
    };

    this.handCards = [
      mk(this.cx - 65, 'cooperate', 0),
      mk(this.cx + 65, 'defect', this.ms(110)),
    ];

    this.schedule(this.ms(640), () => {
      this.phase = 'choosing';
      this.setStatus(this.opponentGone
        ? 'O suspeito saiu da sala. Aguardando retorno...'
        : 'Faça sua escolha');
      done?.();
    });
  }

  private handleCardClick(choice: Choice) {
    if (this.phase !== 'choosing' || this.opponentGone) return;
    this.phase = 'committed';

    const clicked = this.handCards.find(c => c.cardType === choice);
    const other   = this.handCards.find(c => c.cardType !== choice);
    if (!clicked) return;

    this.handCards = [];
    clicked.disableInteractive();
    clicked.unelevate();
    this.myTableCard = clicked;

    if (other) {
      other.disableInteractive();
      this.tweens.add({
        targets: other,
        alpha: 0,
        duration: 200,
        onComplete: () => other.destroy(),
      });
    }

    clicked.flip('back', () => {
      clicked.moveToPos(this.myX, this.cy, 320);
    });

    this.setStatus('Aguardando o outro suspeito...');
    eventBus.emit(PLAYER_EVENTS.SUBMIT_CHOICE, choice, this.currentRound);
  }

  // ══════════════════════════════════════════════════════════════════════
  // Elementos de mesa (labels, selos, veredicto)
  // ══════════════════════════════════════════════════════════════════════

  private addTableLabels() {
    this.tableTexts.forEach(t => t.destroy());
    this.tableTexts = [];
    const mono = { fontFamily: 'monospace' };
    const labelY = this.cy + 90;

    this.tableTexts.push(
      this.add.text(this.myX, labelY, 'VOCÊ', {
        fontSize: '11px', color: '#5a9ac8', ...mono,
      }).setOrigin(0.5).setDepth(10),
      this.add.text(this.oppX, labelY, 'SUSPEITO', {
        fontSize: '11px', color: '#3a5a70', ...mono,
      }).setOrigin(0.5).setDepth(10),
    );
  }

  private addTimeoutTag(x: number) {
    const tag = this.add.text(x, this.cy - 62, 'TEMPO', {
      fontSize: '11px',
      color: '#e05040',
      fontFamily: 'monospace',
      fontStyle: 'bold',
    }).setOrigin(0.5).setAngle(-12).setDepth(12);
    tag.setStroke('#3a0d08', 3);
    this.tableTexts.push(tag);
  }

  private showVerdict(myChoice: Choice, oppChoice: Choice) {
    this.verdictText?.destroy();

    let text: string;
    let color: string;
    if (myChoice === 'cooperate' && oppChoice === 'cooperate') {
      text = 'AMBOS FICARAM EM SILÊNCIO';
      color = '#3ad898';
    } else if (myChoice === 'cooperate') {
      text = 'VOCÊ FOI DELATADO';
      color = '#e05040';
    } else if (oppChoice === 'cooperate') {
      text = 'VOCÊ DELATOU';
      color = '#d0a040';
    } else {
      text = 'AMBOS DELATARAM';
      color = '#c07040';
    }

    this.verdictText = this.add.text(this.cx, this.cy + 114, text, {
      fontSize: '13px',
      color,
      fontFamily: 'monospace',
      fontStyle: 'bold',
    }).setOrigin(0.5).setDepth(12).setAlpha(0);

    this.tweens.add({ targets: this.verdictText, alpha: 1, duration: this.ms(220) });
  }

  private sweepTable(immediate: boolean) {
    const cards = [this.myTableCard, this.oppTableCard].filter(Boolean) as CardSprite[];
    this.myTableCard = null;
    this.oppTableCard = null;

    if (immediate) {
      cards.forEach(c => { c.killAnims(); c.destroy(); });
    } else {
      cards.forEach(c => c.flyOut(() => c.destroy(), this.ms(400)));
    }

    this.tableTexts.forEach(t => t.destroy());
    this.tableTexts = [];

    if (this.verdictText) {
      const v = this.verdictText;
      this.verdictText = null;
      if (immediate) v.destroy();
      else this.tweens.add({ targets: v, alpha: 0, duration: this.ms(250), onComplete: () => v.destroy() });
    }
  }

  private floatPoints(pts: number, x: number, y: number) {
    const sign = pts > 0 ? '+' : '';
    const color = pts >= 3 ? '#44cc88' : pts === 0 ? '#cc4444' : '#c09040';
    const t = this.add.text(x, y, `${sign}${pts}`, {
      fontSize: '24px',
      color,
      fontStyle: 'bold',
      fontFamily: 'monospace',
    }).setOrigin(0.5).setDepth(12);

    this.tweens.add({
      targets: t,
      y: y - 60,
      alpha: 0,
      duration: this.ms(1200),
      ease: 'Cubic.Out',
      onComplete: () => t.destroy(),
    });
  }

  // ══════════════════════════════════════════════════════════════════════
  // HUD
  // ══════════════════════════════════════════════════════════════════════

  private buildHUD() {
    const { width } = this.scale;
    const mono = { fontFamily: 'monospace' };
    const depth = 10;

    this.add.text(20, 12, 'VOCÊ', {
      fontSize: '11px', color: '#4a8ab8', ...mono,
    }).setDepth(depth);
    this.myScoreText = this.add.text(20, 28, 'Pontos: 0', {
      fontSize: '14px', color: '#8ac4e8', fontStyle: 'bold', ...mono,
    }).setDepth(depth);

    this.roundText = this.add.text(this.cx, 10, 'RODADA — / —', {
      fontSize: '15px', color: '#c8d4e0', fontStyle: 'bold', ...mono,
    }).setOrigin(0.5, 0).setDepth(depth);

    this.pipsGfx = this.add.graphics().setDepth(depth);

    this.add.text(width - 20, 12, 'SUSPEITO', {
      fontSize: '11px', color: '#4a5a6a', ...mono,
    }).setOrigin(1, 0).setDepth(depth);
    this.oppScoreText = this.add.text(width - 20, 28, 'Pontos: —', {
      fontSize: '14px', color: '#5a7080', fontStyle: 'bold', ...mono,
    }).setOrigin(1, 0).setDepth(depth);

    this.timerBar = this.add.graphics().setDepth(depth);
    this.timerText = this.add.text(this.cx, 64, '', {
      fontSize: '12px', color: '#c04030', ...mono,
    }).setOrigin(0.5, 0).setDepth(depth);

    this.statusText = this.add.text(this.cx, this.cy + 138, '', {
      fontSize: '12px', color: '#a0b8c8', align: 'center', ...mono,
    }).setOrigin(0.5).setDepth(depth);

    this.flashRect = this.add.rectangle(this.cx, this.cy, this.scale.width, this.scale.height, 0xc03020, 1)
      .setDepth(25)
      .setAlpha(0);
  }

  private refreshRoundHud() {
    this.roundText.setText(`RODADA ${this.currentRound} / ${this.totalRounds}`);
    this.drawPips();
  }

  private drawPips() {
    this.pipsGfx.clear();
    if (this.totalRounds < 2 || this.totalRounds > 12) return;

    const spacing = 14;
    const total = this.totalRounds;
    const startX = this.cx - ((total - 1) * spacing) / 2;
    const y = 40;

    for (let i = 1; i <= total; i++) {
      const x = startX + (i - 1) * spacing;
      if (i < this.currentRound) {
        this.pipsGfx.fillStyle(0x4a8ab8, 1);
        this.pipsGfx.fillCircle(x, y, 3);
      } else if (i === this.currentRound) {
        this.pipsGfx.fillStyle(0xc8d4e0, 1);
        this.pipsGfx.fillCircle(x, y, 3.5);
      } else {
        this.pipsGfx.fillStyle(0x2a3a4a, 1);
        this.pipsGfx.fillCircle(x, y, 2.5);
      }
    }
  }

  private refreshScores(pop: boolean) {
    this.myScoreText.setText(`Pontos: ${this.myScore}`);
    this.oppScoreText.setText(this.oppScore === null ? 'Pontos: —' : `Pontos: ${this.oppScore}`);

    if (pop) {
      for (const t of [this.myScoreText, this.oppScoreText]) {
        this.tweens.add({
          targets: t,
          scaleX: { from: 1.25, to: 1 },
          scaleY: { from: 1.25, to: 1 },
          duration: this.ms(240),
          ease: 'Back.Out',
        });
      }
    }
  }

  private drawTimer() {
    const active =
      (this.phase === 'choosing' || this.phase === 'committed') &&
      this.roundEndsAt !== null &&
      this.roundTimeLimit !== null &&
      !this.opponentGone;

    if (!active) {
      if (this.timerVisible) {
        this.timerBar.clear();
        this.timerText.setText('');
        this.timerVisible = false;
      }
      return;
    }

    this.timerVisible = true;
    const totalMs = this.roundTimeLimit! * 1000;
    const remaining = Math.max(0, this.roundEndsAt! - (Date.now() + this.clockOffset));
    const shown = Math.min(remaining, totalMs);
    const pct = shown / totalMs;

    const { width } = this.scale;
    const color = pct > 0.5 ? 0x00ff88 : pct > 0.25 ? 0xffaa00 : 0xff4444;

    this.timerBar.clear();
    this.timerBar.fillStyle(0x000000, 0.35);
    this.timerBar.fillRect(0, 56, width, 4);
    this.timerBar.fillStyle(color, 1);
    this.timerBar.fillRect(0, 56, width * pct, 4);

    this.timerText.setText(remaining > 0 ? `${Math.ceil(shown / 1000)}s` : 'TEMPO!');
  }

  private setStatus(msg: string) {
    this.statusText.setText(msg);
  }

  // ══════════════════════════════════════════════════════════════════════
  // Cenário (sala de interrogatório — mesmo tema, com brilho pulsante)
  // ══════════════════════════════════════════════════════════════════════

  private buildTable() {
    const { width, height } = this.scale;
    const tableTop    = this.cy - 80;
    const tableBottom = this.cy + 80;

    this.add.rectangle(width / 2, height / 2, width, height, 0x07080b);

    const wallGfx = this.add.graphics();
    wallGfx.fillGradientStyle(0x0e0f14, 0x0e0f14, 0x0b0c10, 0x0b0c10, 1, 1, 1, 1);
    wallGfx.fillRect(0, 0, width, tableBottom);

    this.drawMirror(width);
    this.drawLampGlow();
    this.drawDeskLamp(width, tableTop);
    this.drawChairBack(width, tableTop);
    this.drawOpponentSilhouette(width, tableTop);
    this.drawWhiteTable(width, tableTop, tableBottom, height);

    const floorGfx = this.add.graphics();
    floorGfx.fillGradientStyle(0x080a0d, 0x080a0d, 0x040506, 0x040506, 1, 1, 1, 1);
    floorGfx.fillRect(0, tableBottom, width, height - tableBottom);

    this.drawVignette(width, height);
  }

  private drawMirror(width: number) {
    const mW = width * 0.72;
    const mH = 62;
    const mX = width / 2;
    const mY = 110;
    const g = this.add.graphics();

    g.fillStyle(0x191a22, 1);
    g.fillRect(mX - mW / 2 - 4, mY - mH / 2 - 4, mW + 8, mH + 8);

    g.fillStyle(0x0a0c12, 1);
    g.fillRect(mX - mW / 2, mY - mH / 2, mW, mH);

    g.fillStyle(0xffffff, 0.025);
    g.fillRect(mX - mW / 2, mY - mH / 2, mW, mH * 0.28);

    g.lineStyle(1, 0x252630, 1);
    g.strokeRect(mX - mW / 2, mY - mH / 2, mW, mH);
  }

  private drawLampGlow() {
    const g = this.add.graphics();
    const glows: Array<{ rx: number; ry: number; alpha: number; color: number }> = [
      { rx: 360, ry: 280, alpha: 0.05, color: 0xd8e8ff },
      { rx: 220, ry: 170, alpha: 0.09, color: 0xe8f2ff },
      { rx: 120, ry: 95,  alpha: 0.14, color: 0xf0f6ff },
      { rx: 55,  ry: 42,  alpha: 0.22, color: 0xffffff },
    ];
    for (const gl of glows) {
      g.fillStyle(gl.color, gl.alpha);
      g.fillEllipse(this.cx, this.cy, gl.rx * 2, gl.ry * 2);
    }

    this.tweens.add({
      targets: g,
      alpha: { from: 1, to: 0.86 },
      duration: 2600,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.InOut',
    });
  }

  private drawDeskLamp(width: number, tableTop: number) {
    const bx = width * 0.69;
    const by = tableTop;
    const g = this.add.graphics();

    g.fillStyle(0x8888a0, 1);
    g.fillEllipse(bx, by + 2, 32, 9);
    g.fillStyle(0x6a6a80, 1);
    g.fillRect(bx - 5, by - 4, 10, 6);

    g.lineStyle(4.5, 0x7a7a90, 1);
    g.lineBetween(bx, by - 4, bx - 4, by - 46);

    g.fillStyle(0x606075, 1);
    g.fillCircle(bx - 4, by - 46, 5);

    g.lineStyle(4, 0x7a7a90, 1);
    g.lineBetween(bx - 4, by - 46, bx - 26, by - 82);

    g.fillStyle(0x606075, 1);
    g.fillCircle(bx - 26, by - 82, 5);

    g.fillStyle(0x505060, 1);
    g.fillTriangle(bx - 36, by - 82, bx - 16, by - 82, bx - 26, by - 68);
    g.lineStyle(1, 0x707080, 1);
    g.beginPath();
    g.moveTo(bx - 36, by - 82);
    g.lineTo(bx - 16, by - 82);
    g.lineTo(bx - 26, by - 68);
    g.closePath();
    g.strokePath();

    g.fillStyle(0xeef4ff, 0.95);
    g.fillCircle(bx - 26, by - 85, 5);
  }

  private drawChairBack(width: number, tableTop: number) {
    const cx = width / 2;
    const backY = tableTop - 44;
    const g = this.add.graphics();
    g.fillStyle(0x18191f, 1);
    g.fillRoundedRect(cx - 28, backY - 7, 56, 10, 3);
    g.fillRect(cx - 24, backY + 3, 6, 28);
    g.fillRect(cx + 18, backY + 3, 6, 28);
  }

  private drawOpponentSilhouette(width: number, tableTop: number) {
    const cx = width / 2;
    const headY = tableTop - 72;
    const g = this.add.graphics();

    g.fillStyle(0x000000, 0.25);
    g.fillEllipse(cx, tableTop - 10, 70, 14);

    g.fillStyle(0x0a0b0e, 1);
    g.fillRect(cx - 20, headY + 20, 40, 52);
    g.fillTriangle(cx - 20, headY + 20, cx - 36, headY + 50, cx - 20, headY + 50);
    g.fillTriangle(cx + 20, headY + 20, cx + 36, headY + 50, cx + 20, headY + 50);
    g.fillCircle(cx, headY, 18);

    g.lineStyle(1, 0x2a2d3a, 0.5);
    g.strokeCircle(cx, headY, 18);
  }

  private drawWhiteTable(width: number, tableTop: number, tableBottom: number, height: number) {
    const tW  = width - 30;
    const tX  = width / 2;
    const tH  = tableBottom - tableTop;
    const g   = this.add.graphics();

    g.fillStyle(0xcecac2, 1);
    g.fillRect(tX - tW / 2, tableTop, tW, tH);

    g.fillStyle(0xe0dcd4, 1);
    g.fillRect(tX - tW / 2, tableTop, tW, 3);

    g.fillStyle(0xa8a49c, 1);
    g.fillRect(tX - tW / 2, tableBottom - 2, tW, 2);

    g.fillStyle(0x000000, 0.08);
    g.fillRect(tX - tW / 2, tableTop, 5, tH);
    g.fillRect(tX + tW / 2 - 5, tableTop, 5, tH);

    g.fillStyle(0xffffff, 0.12);
    g.fillEllipse(this.cx - 20, tableTop + tH * 0.55, 150, 40);

    const legW = 5;
    g.fillStyle(0x888898, 1);
    g.fillRect(tX - tW / 2 + 18, tableBottom, legW, height - tableBottom);
    g.fillRect(tX + tW / 2 - 23, tableBottom, legW, height - tableBottom);
  }

  private drawVignette(width: number, height: number) {
    const g = this.add.graphics();
    g.fillGradientStyle(0x000000, 0x000000, 0x000000, 0x000000, 0.85, 0, 0.85, 0);
    g.fillRect(0, 0, width * 0.25, height);
    g.fillGradientStyle(0x000000, 0x000000, 0x000000, 0x000000, 0, 0.85, 0, 0.85);
    g.fillRect(width * 0.75, 0, width * 0.25, height);
    g.fillGradientStyle(0x000000, 0x000000, 0x000000, 0x000000, 0.7, 0.7, 0, 0);
    g.fillRect(0, 0, width, height * 0.12);
    g.fillGradientStyle(0x000000, 0x000000, 0x000000, 0x000000, 0, 0, 0.75, 0.75);
    g.fillRect(0, height * 0.88, width, height * 0.12);
  }
}
