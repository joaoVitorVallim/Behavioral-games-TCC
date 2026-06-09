import Phaser from 'phaser';

export type CardType = 'cooperate' | 'defect' | 'back';

const CARD_W = 108;
const CARD_H = 154;
const R = 7;

const INSET = 8;

const IW = CARD_W / 2 - INSET;
const IH = CARD_H / 2 - INSET;

export class CardSprite extends Phaser.GameObjects.Container {
  private _cardType: CardType;
  private _elevated = false;
  private _handY = 0;

  constructor(scene: Phaser.Scene, x: number, y: number, type: CardType) {
    super(scene, x, y);
    this._cardType = type;
    this._handY = y;
    this.build(type);
    scene.add.existing(this);
  }

  private build(type: CardType) {
    this._cardType = type;
    this.removeAll(true);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const g = this.scene.make.graphics({ add: false } as any);

    if (type === 'back') {
      this.buildBack(g);
      this.add(g);
    } else {
      this.buildFace(g, type);
    }

    this.setSize(CARD_W, CARD_H);
  }

  private buildBack(g: Phaser.GameObjects.Graphics) {
    g.fillStyle(0x10102a, 1);
    g.fillRoundedRect(-CARD_W / 2, -CARD_H / 2, CARD_W, CARD_H, R);

    g.lineStyle(1.5, 0x28285a, 1);
    g.strokeRoundedRect(-CARD_W / 2, -CARD_H / 2, CARD_W, CARD_H, R);

    g.lineStyle(1, 0x22224a, 1);
    g.strokeRoundedRect(-IW, -IH, IW * 2, IH * 2, R - 2);

    this.drawDiagonalLines(g, 11, 0x1e1e44, 0.7);

    const dr = 16;
    const diamond = [
      { x: 0,          y: -dr },
      { x: dr * 0.65,  y: 0   },
      { x: 0,          y: dr  },
      { x: -dr * 0.65, y: 0   },
    ];
    g.fillStyle(0x14143a, 1);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    g.fillPoints(diamond as any, true);
    g.lineStyle(1, 0x2e2e68, 1);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    g.strokePoints(diamond as any, true);
  }

  private drawDiagonalLines(g: Phaser.GameObjects.Graphics, step: number, color: number, alpha: number) {
    g.lineStyle(0.8, color, alpha);
    for (let c = -(IW + IH + step); c < IW + IH + step; c += step) {
      let x1: number, y1: number, x2: number, y2: number;

      const yAtLeft = -IW + c;
      if (yAtLeft >= -IH && yAtLeft <= IH) {
        x1 = -IW; y1 = yAtLeft;
      } else if (yAtLeft < -IH) {
        x1 = -IH - c; y1 = -IH;
      } else {
        x1 = IH - c; y1 = IH;
      }

      const yAtRight = IW + c;
      if (yAtRight >= -IH && yAtRight <= IH) {
        x2 = IW; y2 = yAtRight;
      } else if (yAtRight < -IH) {
        x2 = -IH - c; y2 = -IH;
      } else {
        x2 = IH - c; y2 = IH;
      }

      if (x1 <= x2) g.lineBetween(x1, y1, x2, y2);
    }
  }

  private buildFace(g: Phaser.GameObjects.Graphics, type: 'cooperate' | 'defect') {
    const isCooperate = type === 'cooperate';
    const accentHex  = isCooperate ? 0x1a6a5a : 0x7a1818;
    const accentStr  = isCooperate ? '#1a6a5a' : '#7a1818';
    const labelText  = isCooperate ? 'COOPERAR' : 'DELATAR';
    const cornerChar = isCooperate ? 'C' : 'D';

    g.fillStyle(0xf0ebe0, 1);
    g.fillRoundedRect(-CARD_W / 2, -CARD_H / 2, CARD_W, CARD_H, R);

    g.lineStyle(2.5, accentHex, 1);
    g.strokeRoundedRect(-CARD_W / 2, -CARD_H / 2, CARD_W, CARD_H, R);

    g.fillStyle(accentHex, 0.10);
    g.fillRect(-CARD_W / 2 + 2, -CARD_H / 2 + 2, CARD_W - 4, 30);

    g.fillStyle(accentHex, 0.10);
    g.fillRect(-CARD_W / 2 + 2, CARD_H / 2 - 32, CARD_W - 4, 30);

    g.lineStyle(0.8, accentHex, 0.3);
    g.lineBetween(-CARD_W / 2 + 9, -CARD_H / 2 + 32, CARD_W / 2 - 9, -CARD_H / 2 + 32);
    g.lineBetween(-CARD_W / 2 + 9, CARD_H / 2 - 32, CARD_W / 2 - 9, CARD_H / 2 - 32);

    g.lineStyle(0.5, accentHex, 0.15);
    g.strokeRoundedRect(-CARD_W / 2 + INSET, -CARD_H / 2 + INSET, CARD_W - INSET * 2, CARD_H - INSET * 2, R - 2);

    this.add(g);

    const cornerStyle = {
      fontSize: '13px',
      color: accentStr,
      fontFamily: 'Georgia, Times New Roman, serif',
      fontStyle: 'bold',
    };

    const topCorner = this.scene.make.text({
      x: -CARD_W / 2 + 9, y: -CARD_H / 2 + 7,
      text: cornerChar,
      style: cornerStyle,
      add: false,
    }).setOrigin(0, 0);

    const botCorner = this.scene.make.text({
      x: CARD_W / 2 - 9, y: CARD_H / 2 - 7,
      text: cornerChar,
      style: cornerStyle,
      add: false,
    }).setOrigin(1, 1);

    const mainLabel = this.scene.make.text({
      x: 0, y: 0,
      text: labelText,
      style: {
        fontSize: '15px',
        color: accentStr,
        fontFamily: 'Georgia, Times New Roman, serif',
        fontStyle: 'bold',
        letterSpacing: 1,
      },
      add: false,
    }).setOrigin(0.5);

    this.add([topCorner, botCorner, mainLabel]);
  }

  get cardType() { return this._cardType; }

  rebuildAs(type: CardType) {
    this.build(type);
    this.scaleX = 1;
    this.scaleY = 1;
  }

  flip(toType: CardType, onComplete?: () => void) {
    this.scene.tweens.add({
      targets: this,
      scaleX: 0,
      duration: 140,
      ease: 'Linear',
      onComplete: () => {
        this.build(toType);
        this.scene.tweens.add({
          targets: this,
          scaleX: 1,
          duration: 140,
          ease: 'Linear',
          onComplete,
        });
      },
    });
  }

  elevate() {
    if (this._elevated) return;
    this._elevated = true;
    this.scene.tweens.add({
      targets: this,
      y: this._handY - 18,
      scaleX: 1.05, scaleY: 1.05,
      duration: 120,
      ease: 'Back.Out',
    });
  }

  unelevate() {
    if (!this._elevated) return;
    this._elevated = false;
    this.scene.tweens.add({
      targets: this,
      y: this._handY,
      scaleX: 1, scaleY: 1,
      duration: 120,
    });
  }

  moveToPos(tx: number, ty: number, duration = 400, onComplete?: () => void) {
    this.scene.tweens.add({
      targets: this,
      x: tx, y: ty,
      duration,
      ease: 'Back.Out',
      onComplete,
    });
  }

  flyOut(onComplete?: () => void) {
    this.scene.tweens.add({
      targets: this,
      y: this.y - 600,
      alpha: 0,
      duration: 400,
      ease: 'Cubic.In',
      onComplete,
    });
  }

  dealIn(fromY: number, toY: number, delay = 0) {
    this.scene.tweens.killTweensOf(this);
    this._elevated = false;
    this._handY = toY;
    this.y = fromY;
    this.alpha = 0;
    this.scene.tweens.add({
      targets: this,
      y: toY, alpha: 1,
      delay,
      duration: 500,
      ease: 'Back.Out',
    });
  }

  shake() {
    const origX = this.x;
    this.scene.tweens.add({
      targets: this,
      x: { from: origX - 8, to: origX + 8 },
      duration: 60,
      yoyo: true,
      repeat: 4,
      ease: 'Linear',
      onComplete: () => { this.x = origX; },
    });
  }
}
