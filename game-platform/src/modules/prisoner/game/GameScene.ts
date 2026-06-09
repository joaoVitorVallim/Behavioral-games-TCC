import Phaser from 'phaser';
import { CardSprite } from './CardSprite';
import type { CardType } from './CardSprite';
import { eventBus, GAME_EVENTS, PLAYER_EVENTS } from './events';

interface RoundResult {
  round: number;
  result: {
    player1Choice: CardType;
    player2Choice: CardType;
    player1Points: number;
    player2Points: number;
  };
  totalPoints: { player1: number; player2: number };
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
}

export class GameScene extends Phaser.Scene {
  private myCardCooperate!: CardSprite;
  private myCardDefect!: CardSprite;
  private myPlayedCard!: CardSprite | null;
  private oppPlayedCard!: CardSprite | null;

  private roundText!: Phaser.GameObjects.Text;
  private timerText!: Phaser.GameObjects.Text;
  private myScoreText!: Phaser.GameObjects.Text;
  private oppScoreText!: Phaser.GameObjects.Text;
  private statusText!: Phaser.GameObjects.Text;
  private timerBar!: Phaser.GameObjects.Graphics;
  private myCardLabel: Phaser.GameObjects.Text | null = null;
  private oppCardLabel: Phaser.GameObjects.Text | null = null;

  private isPlayer1 = false;
  private myScore = 0;
  private oppScore = 0;
  private totalRounds = 3;
  private roundTimeLimit: number | null = null;
  private userViewPoints = false;
  private waitingForOpponent = false;
  private canPlay = false;
  private timerTween: Phaser.Tweens.Tween | null = null;

  private busHandlers: Array<{ event: string; fn: (...args: unknown[]) => void }> = [];

  private cx = 0;
  private cy = 0;

  constructor() {
    super({ key: 'GameScene' });
  }

  private onBus(event: string, fn: (...args: unknown[]) => void) {
    this.busHandlers.push({ event, fn });
    eventBus.on(event, fn);
  }

  create() {
    this.cx = this.scale.width / 2;
    this.cy = this.scale.height / 2;

    this.isPlayer1 = sessionStorage.getItem('isPlayer1') === 'true';

    const doCleanup = () => {
      this.busHandlers.forEach(({ event, fn }) => eventBus.off(event, fn));
      this.busHandlers = [];
    };
    this.events.once('shutdown', doCleanup);
    this.events.once('destroy', doCleanup);

    this.buildTable();
    this.buildHUD();
    this.buildHand();
    this.registerEvents();

    const raw = sessionStorage.getItem('matchReadyData');
    if (raw) {
      this.time.delayedCall(50, () => {
        eventBus.emit(GAME_EVENTS.MATCH_READY, JSON.parse(raw));
      });
    }
  }

  private buildTable() {
    const { width, height } = this.scale;
    const tableTop    = this.cy - 80;
    const tableBottom = this.cy + 80;

    this.add.rectangle(width / 2, height / 2, width, height, 0x07080b);

    const wallGfx = this.add.graphics();
    wallGfx.fillGradientStyle(0x0e0f14, 0x0e0f14, 0x0b0c10, 0x0b0c10, 1, 1, 1, 1);
    wallGfx.fillRect(0, 0, width, tableBottom);

    this.drawMirror(width);
    this.drawLampGlow(width);
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

  private drawLampGlow(_width: number) {
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

    this.roundText = this.add.text(this.cx, 10, 'RODADA 1 / ?', {
      fontSize: '15px', color: '#c8d4e0', fontStyle: 'bold', ...mono,
    }).setOrigin(0.5, 0).setDepth(depth);

    this.timerText = this.add.text(this.cx, 28, '', {
      fontSize: '13px', color: '#c04030', ...mono,
    }).setOrigin(0.5, 0).setDepth(depth);

    this.add.text(width - 20, 12, 'SUSPEITO', {
      fontSize: '11px', color: '#4a5a6a', ...mono,
    }).setOrigin(1, 0).setDepth(depth);
    this.oppScoreText = this.add.text(width - 20, 28, 'Pontos: 0', {
      fontSize: '14px', color: '#5a7080', fontStyle: 'bold', ...mono,
    }).setOrigin(1, 0).setDepth(depth);

    this.timerBar = this.add.graphics().setDepth(depth);

    this.statusText = this.add.text(this.cx, this.cy + 120, '', {
      fontSize: '13px', color: '#a0b8c8', align: 'center', ...mono,
    }).setOrigin(0.5).setDepth(depth);
  }

  private buildHand() {
    const { height } = this.scale;
    const handY = height - 90;

    this.myCardCooperate = new CardSprite(this, this.cx - 65, handY, 'cooperate');
    this.myCardDefect    = new CardSprite(this, this.cx + 65, handY, 'defect');

    this.myCardCooperate.setAlpha(0);
    this.myCardDefect.setAlpha(0);

    this.myCardCooperate.setInteractive({ useHandCursor: true });
    this.myCardDefect.setInteractive({ useHandCursor: true });

    this.myCardCooperate.on('pointerdown', () => this.handleCardClick('cooperate'));
    this.myCardDefect.on('pointerdown', () => this.handleCardClick('defect'));

    this.myCardCooperate.on('pointerover', () => { if (this.canPlay) this.myCardCooperate.elevate(); });
    this.myCardDefect.on('pointerover',    () => { if (this.canPlay) this.myCardDefect.elevate(); });
    this.myCardCooperate.on('pointerout',  () => this.myCardCooperate.unelevate());
    this.myCardDefect.on('pointerout',     () => this.myCardDefect.unelevate());
  }

  private registerEvents() {
    this.onBus(GAME_EVENTS.MATCH_READY, (data: unknown) => {
      const d = data as MatchReadyData;
      this.totalRounds = d.totalRounds;
      this.roundTimeLimit = d.roundTimeLimit;
      this.userViewPoints = d.userViewPoints;

      // Reseta o estado de animação/placar antes de iniciar um novo jogo
      this.myScore = 0;
      this.oppScore = 0;
      this.waitingForOpponent = false;
      this.myPlayedCard = null;
      this.oppPlayedCard = null;
      this.myCardLabel?.destroy();
      this.myCardLabel = null;
      this.oppCardLabel?.destroy();
      this.oppCardLabel = null;
      this.myScoreText.setText('Pontos: 0');
      this.oppScoreText.setText('Pontos: 0');

      this.roundText.setText(`RODADA ${d.currentRound} / ${d.totalRounds}`);
      this.dealCards();
    });

    this.onBus(GAME_EVENTS.CHOICE_RECEIVED, () => {
      this.waitingForOpponent = true;
      this.canPlay = false;
      this.setStatus('Aguardando oponente...');
    });

    this.onBus(GAME_EVENTS.ROUND_RESULT, (data: unknown) => {
      const d = data as RoundResult;
      this.handleRoundResult(d);
    });

    this.onBus(GAME_EVENTS.ROUND_TIMEOUT, () => {
      this.setStatus('Tempo esgotado!');
      if (this.timerTween) this.timerTween.stop();
      this.myCardCooperate.shake();
      this.myCardDefect.shake();
    });

    this.onBus(GAME_EVENTS.MATCH_FINISHED, () => {
      this.time.delayedCall(2000, () => {
        this.cameras.main.fadeOut(600, 0, 0, 0);
        this.cameras.main.once('camerafadeoutcomplete', () => {
          this.scene.stop();
        });
      });
    });

    this.onBus(GAME_EVENTS.PLAYER_DISCONNECTED, () => {
      this.setStatus('Oponente desconectou. Aguardando...');
      this.canPlay = false;
    });
  }

  setPlayerRole(isPlayer1: boolean) {
    this.isPlayer1 = isPlayer1;
  }

  private dealCards() {
    const { height } = this.scale;
    const handY = height - 90;

    this.myCardCooperate.dealIn(height + 100, handY, 0);
    this.myCardDefect.dealIn(height + 100, handY, 120);

    this.time.delayedCall(700, () => {
      this.canPlay = true;
      this.setStatus('Faça sua escolha');
      if (this.roundTimeLimit) this.startTimerBar(this.roundTimeLimit);
    });
  }

  private handleCardClick(choice: 'cooperate' | 'defect') {
    if (!this.canPlay || this.waitingForOpponent) return;
    this.canPlay = false;

    const card  = choice === 'cooperate' ? this.myCardCooperate : this.myCardDefect;
    const other = choice === 'cooperate' ? this.myCardDefect    : this.myCardCooperate;

    this.myPlayedCard = card;

    this.tweens.add({ targets: other, alpha: 0, duration: 200 });

    const tableY = this.cy;
    card.flip('back', () => {
      card.moveToPos(this.cx - 65, tableY, 320);
    });

    if (this.timerTween) { this.timerTween.stop(); this.timerBar.clear(); this.timerText.setText(''); }

    eventBus.emit(PLAYER_EVENTS.SUBMIT_CHOICE, choice);
  }

  private handleRoundResult(d: RoundResult) {
    if (this.timerTween) { this.timerTween.stop(); this.timerBar.clear(); this.timerText.setText(''); }

    const myChoice  = this.isPlayer1 ? d.result.player1Choice : d.result.player2Choice;
    const oppChoice = this.isPlayer1 ? d.result.player2Choice : d.result.player1Choice;
    const myPts     = this.isPlayer1 ? d.result.player1Points : d.result.player2Points;
    const oppPts    = this.isPlayer1 ? d.result.player2Points : d.result.player1Points;

    this.myScore  = this.isPlayer1 ? d.totalPoints.player1 : d.totalPoints.player2;
    this.oppScore = this.isPlayer1 ? d.totalPoints.player2 : d.totalPoints.player1;

    this.myScoreText.setText(`Você: ${this.myScore}`);
    if (this.userViewPoints) this.oppScoreText.setText(`Pts: ${this.oppScore}`);

    const tableY   = this.cy;
    const myCardX  = this.cx - 65;
    const oppCardX = this.cx + 65;
    const labelY   = tableY + 92;
    const mono     = { fontFamily: 'monospace' };

    if (!this.myPlayedCard) {
      this.myPlayedCard = new CardSprite(this, myCardX, tableY, 'back');
      this.myPlayedCard.dealIn(tableY + 170, tableY, 0);
    }

    if (!this.oppPlayedCard) {
      this.oppPlayedCard = new CardSprite(this, oppCardX, tableY, 'back');
      this.oppPlayedCard.dealIn(tableY - 170, tableY, 0);
    }

    this.myCardLabel?.destroy();
    this.oppCardLabel?.destroy();
    this.myCardLabel = this.add.text(myCardX, labelY, 'VOCÊ', {
      fontSize: '11px', color: '#5a9ac8', ...mono,
    }).setOrigin(0.5).setDepth(10);
    this.oppCardLabel = this.add.text(oppCardX, labelY, 'SUSPEITO', {
      fontSize: '11px', color: '#3a5a70', ...mono,
    }).setOrigin(0.5).setDepth(10);

    this.time.delayedCall(750, () => {
      this.myPlayedCard!.flip(myChoice);
      this.oppPlayedCard!.flip(oppChoice, () => {
        this.floatPoints(myPts, myCardX, tableY);
        this.floatPoints(oppPts, oppCardX, tableY);
        this.setStatus(d.timedOut ? 'Tempo esgotado!' : '');
      });
    });

    if (d.nextRound !== null) {
      this.time.delayedCall(2200, () => this.setupNextRound(d.nextRound!));
    }
  }

  private setupNextRound(round: number) {
    this.roundText.setText(`RODADA ${round} / ${this.totalRounds}`);
    this.waitingForOpponent = false;

    const toRemove = this.children.list.filter(
      c => c instanceof CardSprite && c !== this.myCardCooperate && c !== this.myCardDefect,
    ) as CardSprite[];
    toRemove.forEach(c => c.flyOut(() => c.destroy()));

    if (this.myPlayedCard === this.myCardCooperate) this.myCardCooperate.flyOut();
    else if (this.myPlayedCard === this.myCardDefect) this.myCardDefect.flyOut();

    this.myPlayedCard = null;
    this.oppPlayedCard = null;
    this.myCardLabel?.destroy();
    this.myCardLabel = null;
    this.oppCardLabel?.destroy();
    this.oppCardLabel = null;

    this.time.delayedCall(450, () => {
      const { height } = this.scale;
      const handY = height - 90;
      this.myCardCooperate.rebuildAs('cooperate');
      this.myCardDefect.rebuildAs('defect');
      this.myCardCooperate.setPosition(this.cx - 65, handY);
      this.myCardDefect.setPosition(this.cx + 65, handY);
      this.dealCards();
    });
  }

  private floatPoints(pts: number, x: number, y: number) {
    const sign = pts > 0 ? '+' : '';
    const color = pts >= 3 ? '#44cc88' : pts === 0 ? '#cc4444' : '#c09040';
    const t = this.add.text(x, y, `${sign}${pts}`, {
      fontSize: '24px',
      color,
      fontStyle: 'bold',
    }).setOrigin(0.5);

    this.tweens.add({
      targets: t,
      y: y - 60,
      alpha: 0,
      duration: 1200,
      ease: 'Cubic.Out',
      onComplete: () => t.destroy(),
    });
  }

  private startTimerBar(seconds: number) {
    const { width } = this.scale;

    const draw = (v: number) => {
      this.timerBar.clear();
      const pct = v / seconds;
      const color = pct > 0.5 ? 0x00ff88 : pct > 0.25 ? 0xffaa00 : 0xff4444;
      this.timerBar.fillStyle(color, 1);
      this.timerBar.fillRect(0, 60, width * pct, 4);
    };

    draw(seconds);
    this.timerText.setText(`${seconds}s`);

    const obj = { v: seconds };
    this.timerTween = this.tweens.add({
      targets: obj,
      v: 0,
      duration: seconds * 1000,
      ease: 'Linear',
      onUpdate: () => {
        draw(obj.v);
        this.timerText.setText(`${Math.ceil(obj.v)}s`);
      },
      onComplete: () => {
        this.timerBar.clear();
        this.timerText.setText('');
      },
    });
  }

  private setStatus(msg: string) {
    this.statusText.setText(msg);
  }
}
