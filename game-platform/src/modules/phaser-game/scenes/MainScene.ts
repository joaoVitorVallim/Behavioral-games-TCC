import Phaser from 'phaser'
import type { BettingGameConfig } from '../types'

type BetColor = 'red' | 'black' | 'blue'

type UiButton = {
  container: Phaser.GameObjects.Container
  background: Phaser.GameObjects.Rectangle
  label: Phaser.GameObjects.Text
}

type PhaserSceneData = {
  config: BettingGameConfig
  onSpinComplete?: (number: number, color: BetColor, won: boolean) => void
}

export class MainScene extends Phaser.Scene {
  private readonly wheel_numbers = [
    0, 32, 15, 19, 4, 21, 2, 25, 17, 34, 6, 27, 13, 36, 11, 30, 8, 23, 10, 5, 24, 16, 33, 1, 20, 14, 31, 9, 22,
    18, 29, 7, 28, 12, 35, 3, 26,
  ]

  private readonly red_numbers = new Set([1, 3, 5, 7, 9, 12, 14, 16, 18, 19, 21, 23, 25, 27, 30, 32, 34, 36])

  private wheel_container?: Phaser.GameObjects.Container
  private balance_text?: Phaser.GameObjects.Text
  private score_text?: Phaser.GameObjects.Text
  private round_text?: Phaser.GameObjects.Text
  private selected_bet_text?: Phaser.GameObjects.Text
  private result_text?: Phaser.GameObjects.Text

  private config?: BettingGameConfig
  private sceneData?: PhaserSceneData
  private color_buttons: Record<BetColor, UiButton | undefined> = {
    red: undefined,
    black: undefined,
    blue: undefined,
  }

  private amount_buttons: Record<number, UiButton | undefined> = {
    10: undefined,
    25: undefined,
    50: undefined,
    100: undefined,
  }

  private selected_color: BetColor = 'red'
  private selected_amount = 10
  private balance = 0
  private score = 0
  private rounds = 0
  private is_spinning = false

  constructor() {
    super('main-scene')
  }

  init(data?: PhaserSceneData) {
    this.sceneData = data
    this.config = data?.config

    if (this.config) {
      this.balance = this.config.startingPoints
    }
  }

  create() {
    const { width, height } = this.scale
    const compact_layout = width < 1100 || height < 760
    const very_compact_layout = width < 700 || height < 560
    const title_font_size = compact_layout ? 30 : 42
    const score_font_size = compact_layout ? 15 : 20
    const info_font_size = compact_layout ? 15 : 24
    const section_font_size = compact_layout ? 16 : 20
    const wheel_radius = Phaser.Math.Clamp(
      Math.min(width * (compact_layout ? 0.3 : 0.2), height * (compact_layout ? 0.2 : 0.24)),
      very_compact_layout ? 74 : 96,
      compact_layout ? 170 : 210,
    )
    const wheel_center_y = Phaser.Math.Clamp(height * (compact_layout ? 0.36 : 0.42), 210, height * 0.48)
    const controls_top = wheel_center_y + wheel_radius + (very_compact_layout ? 12 : 20)
    const button_font_size = compact_layout ? 14 : 18
    const spin_font_size = compact_layout ? 16 : 18
    const content_padding = compact_layout ? 16 : 38

    this.cameras.main.setBackgroundColor('#020617')
    this.add.rectangle(width / 2, height / 2, width, height, 0x0b1220, 0.85)

    this.add
      .text(width / 2, 44, 'Roleta BehaviorLab', {
        fontFamily: 'Inter, sans-serif',
        fontSize: `${title_font_size}px`,
        color: '#f8fafc',
      })
      .setOrigin(0.5)

    this.balance_text = this.add.text(content_padding, 24, '', {
      fontFamily: 'Inter, sans-serif',
      fontSize: `${score_font_size}px`,
      color: '#38bdf8',
    })

    this.score_text = this.add.text(content_padding, 24 + score_font_size + 6, '', {
      fontFamily: 'Inter, sans-serif',
      fontSize: `${score_font_size}px`,
      color: '#86efac',
    })

    this.round_text = this.add.text(content_padding, 24 + score_font_size * 2 + 12, '', {
      fontFamily: 'Inter, sans-serif',
      fontSize: `${Math.max(13, score_font_size - 1)}px`,
      color: '#94a3b8',
    })

    this.result_text = this.add
      .text(width / 2, compact_layout ? 98 : 102, 'Escolha a aposta e gire a roleta', {
        fontFamily: 'Inter, sans-serif',
        fontSize: `${info_font_size}px`,
        color: '#e2e8f0',
      })
      .setOrigin(0.5)
      .setWordWrapWidth(width - content_padding * 2)

    this.createWheel(width / 2, wheel_center_y, wheel_radius, compact_layout)

    this.add
      .triangle(
        width / 2,
        wheel_center_y - wheel_radius - (compact_layout ? 10 : 18),
        0,
        0,
        compact_layout ? 12 : 18,
        0,
        compact_layout ? 6 : 9,
        compact_layout ? 14 : 20,
        0xfbbf24,
      )
      .setStrokeStyle(2, 0xf8fafc, 0.7)

    const color_button_width = Phaser.Math.Clamp((width - content_padding * 2 - 24) / 3, 76, 110)
    const color_gap = 12
    const color_row_width = color_button_width * 3 + color_gap * 2
    const color_start_x = width / 2 - color_row_width / 2 + color_button_width / 2
    const color_buttons_y = controls_top + (compact_layout ? 30 : 42)

    this.add
      .text(width / 2, controls_top, 'Cor da aposta', {
        fontFamily: 'Inter, sans-serif',
        fontSize: `${section_font_size}px`,
        color: '#e2e8f0',
      })
      .setOrigin(0.5)

    this.color_buttons.red = this.createButton(
      color_start_x,
      color_buttons_y,
      color_button_width,
      42,
      'Vermelho',
      () => {
        if (this.is_spinning) return
        this.selected_color = 'red'
        this.refreshSelectionUi()
      },
      0x1e293b,
      button_font_size,
    )

    this.color_buttons.black = this.createButton(
      color_start_x + color_button_width + color_gap,
      color_buttons_y,
      color_button_width,
      42,
      'Preto',
      () => {
        if (this.is_spinning) return
        this.selected_color = 'black'
        this.refreshSelectionUi()
      },
      0x1e293b,
      button_font_size,
    )

    this.color_buttons.blue = this.createButton(
      color_start_x + (color_button_width + color_gap) * 2,
      color_buttons_y,
      color_button_width,
      42,
      'Azul',
      () => {
        if (this.is_spinning) return
        this.selected_color = 'blue'
        this.refreshSelectionUi()
      },
      0x1e293b,
      button_font_size,
    )

    const amount_label_y = color_buttons_y + (compact_layout ? 46 : 56)
    const amount_buttons_y = amount_label_y + (compact_layout ? 32 : 42)
    const amount_button_width = Phaser.Math.Clamp((width - content_padding * 2 - 30) / 4, 64, 100)
    const amount_gap = 10
    const amount_row_width = amount_button_width * 4 + amount_gap * 3
    const amount_start_x = width / 2 - amount_row_width / 2 + amount_button_width / 2

    this.add
      .text(width / 2, amount_label_y, 'Valor da aposta', {
        fontFamily: 'Inter, sans-serif',
        fontSize: `${section_font_size}px`,
        color: '#e2e8f0',
      })
      .setOrigin(0.5)

    const amounts = [10, 25, 50, 100]
    amounts.forEach((amount, index) => {
      const button = this.createButton(
        amount_start_x + index * (amount_button_width + amount_gap),
        amount_buttons_y,
        amount_button_width,
        compact_layout ? 36 : 40,
        `$${amount}`,
        () => {
          if (this.is_spinning) return
          this.selected_amount = amount
          this.refreshSelectionUi()
        },
        0x1e293b,
        button_font_size,
      )
      this.amount_buttons[amount] = button
    })

    this.createButton(
      width / 2,
      amount_buttons_y + (compact_layout ? 50 : 58),
      Phaser.Math.Clamp(width * 0.44, 180, 260),
      compact_layout ? 44 : 58,
      'GIRAR ROLETA',
      () => this.spinWheel(),
      0x0891b2,
      spin_font_size,
    )

    this.selected_bet_text = this.add
      .text(width / 2, controls_top - (compact_layout ? 18 : 24), '', {
        fontFamily: 'Inter, sans-serif',
        fontSize: `${compact_layout ? 14 : 20}px`,
        color: '#e2e8f0',
      })
      .setOrigin(0.5)
      .setWordWrapWidth(width - content_padding * 2)

    this.refreshSelectionUi()
    this.refreshScoreUi()
  }

  private createWheel(center_x: number, center_y: number, wheel_radius: number, compact_layout: boolean) {
    const number_ring_radius = wheel_radius * 0.83
    const center_radius = Math.max(24, wheel_radius * 0.24)
    const sector_angle = (Math.PI * 2) / this.wheel_numbers.length
    const start_angle = -Math.PI / 2

    const wheel_graphics = this.add.graphics()
    wheel_graphics.lineStyle(2, 0xf8fafc, 0.28)

    this.wheel_numbers.forEach((number, index) => {
      const color_key = this.getNumberColor(number)
      const fill_color =
        color_key === 'red' ? 0xdc2626 : color_key === 'black' ? 0x111827 : 0x06b6d4
      const from = start_angle + index * sector_angle
      const to = from + sector_angle

      wheel_graphics.fillStyle(fill_color, 0.95)
      wheel_graphics.beginPath()
      wheel_graphics.moveTo(0, 0)
      wheel_graphics.arc(0, 0, wheel_radius, from, to, false)
      wheel_graphics.closePath()
      wheel_graphics.fillPath()
      wheel_graphics.strokePath()
    })

    wheel_graphics.fillStyle(0x0f172a, 1)
    wheel_graphics.fillCircle(0, 0, center_radius)
    wheel_graphics.lineStyle(3, 0x38bdf8, 0.9)
    wheel_graphics.strokeCircle(0, 0, center_radius)

    const wheel_labels = this.wheel_numbers.map((number, index) => {
      const label_angle = start_angle + index * sector_angle + sector_angle / 2
      const x = Math.cos(label_angle) * number_ring_radius
      const y = Math.sin(label_angle) * number_ring_radius

      return this.add
        .text(x, y, String(number), {
          fontFamily: 'Inter, sans-serif',
          fontSize: `${compact_layout ? 12 : 17}px`,
          color: '#f8fafc',
        })
        .setOrigin(0.5)
    })

    const wheel_hub = this.add.circle(0, 0, 18, 0x38bdf8, 1)

    this.wheel_container = this.add.container(center_x, center_y, [
      wheel_graphics,
      ...wheel_labels,
      wheel_hub,
    ])
  }

  private createButton(
    x: number,
    y: number,
    width: number,
    height: number,
    label: string,
    on_click: () => void,
    base_color = 0x1e293b,
    label_font_size = 18,
  ): UiButton {
    const background = this.add
      .rectangle(0, 0, width, height, base_color, 0.96)
      .setStrokeStyle(2, 0x334155, 1)

    const text = this.add
      .text(0, 0, label, {
        fontFamily: 'Inter, sans-serif',
        fontSize: `${label_font_size}px`,
        color: '#f8fafc',
      })
      .setOrigin(0.5)

    const container = this.add.container(x, y, [background, text])
    container.setSize(width, height)
    container.setInteractive({ useHandCursor: true })

    container.on('pointerdown', on_click)

    container.on('pointerover', () => {
      if (this.is_spinning) return
      background.setAlpha(1)
      container.setScale(1.02)
    })

    container.on('pointerout', () => {
      background.setAlpha(0.96)
      container.setScale(1)
    })

    return { container, background, label: text }
  }

  private spinWheel() {
    if (!this.wheel_container || this.is_spinning) return

    if (this.balance < this.selected_amount) {
      this.result_text?.setText('Saldo insuficiente para essa aposta')
      return
    }

    this.is_spinning = true
    this.balance -= this.selected_amount
    this.result_text?.setText('Girando...')
    this.refreshScoreUi()
    this.refreshSelectionUi()

    const target_index = Phaser.Math.Between(0, this.wheel_numbers.length - 1)
    const target_number = this.wheel_numbers[target_index]
    const target_color = this.getNumberColor(target_number)
    const sector_angle = (Math.PI * 2) / this.wheel_numbers.length
    const final_alignment = -(target_index * sector_angle + sector_angle / 2)
    const current_rotation = this.wheel_container.rotation
    const current_mod = Phaser.Math.Angle.Wrap(current_rotation)
    const alignment_delta = final_alignment - current_mod
    const full_turns = Phaser.Math.Between(4, 7) * Math.PI * 2
    const final_rotation = current_rotation + full_turns + alignment_delta

    this.tweens.add({
      targets: this.wheel_container,
      rotation: final_rotation,
      duration: 3500,
      ease: 'Cubic.easeOut',
      onComplete: () => this.resolveSpin(target_number, target_color),
    })
  }

  private resolveSpin(number_result: number, color_result: BetColor) {
    const won = color_result === this.selected_color
    const multiplier = this.getMultiplierForColor(color_result)

    if (won) {
      const payout = this.selected_amount * multiplier
      const net_gain = payout - this.selected_amount
      this.balance += payout
      this.score += net_gain
      this.result_text?.setText(
        `Numero ${number_result} (${this.getColorLabel(color_result)}): voce ganhou $${net_gain}`,
      )
    } else {
      this.score -= this.selected_amount
      this.result_text?.setText(
        `Numero ${number_result} (${this.getColorLabel(color_result)}): voce perdeu $${this.selected_amount}`,
      )
    }

    if (this.balance <= 0) {
      this.result_text?.setText('Saldo zerado. Recarregue a pagina para jogar de novo.')
    }

    this.is_spinning = false
    this.refreshScoreUi()
    this.refreshSelectionUi()

    if (this.sceneData?.onSpinComplete) {
      this.sceneData.onSpinComplete(number_result, color_result, won)
    }
  }

  private refreshSelectionUi() {
    const color_entries: [BetColor, UiButton | undefined][] = [
      ['red', this.color_buttons.red],
      ['black', this.color_buttons.black],
      ['blue', this.color_buttons.blue],
    ]

    color_entries.forEach(([color, button]) => {
      if (!button) return

      const is_selected = color === this.selected_color
      const selected_color_value =
        color === 'red' ? 0xdc2626 : color === 'black' ? 0x020617 : 0x06b6d4

      button.background.setFillStyle(is_selected ? selected_color_value : 0x1e293b, 0.96)
      button.background.setStrokeStyle(2, is_selected ? 0xf8fafc : 0x334155, 1)
      button.label.setColor('#f8fafc')
      button.container.setAlpha(this.is_spinning ? 0.75 : 1)
    })

    Object.entries(this.amount_buttons).forEach(([amount, button]) => {
      if (!button) return

      const is_selected = Number(amount) === this.selected_amount
      button.background.setFillStyle(is_selected ? 0x0891b2 : 0x1e293b, 0.96)
      button.background.setStrokeStyle(2, is_selected ? 0x67e8f9 : 0x334155, 1)
      button.container.setAlpha(this.is_spinning ? 0.75 : 1)
    })

    this.selected_bet_text?.setText(
      `Aposta atual: ${this.getColorLabel(this.selected_color)} | Valor: $${this.selected_amount}`,
    )
  }

  private refreshScoreUi() {
    this.balance_text?.setText(`Saldo: $${this.balance}`)
    this.score_text?.setText(`Ganho: $${this.score}`)
    this.round_text?.setText(`Rodadas: ${this.rounds}`)
  }

  private getNumberColor(number: number): BetColor {
    if (number === 0) return 'blue'
    return this.red_numbers.has(number) ? 'red' : 'black'
  }

  private getColorLabel(color: BetColor): string {
    if (color === 'red') return 'vermelho'
    if (color === 'black') return 'preto'
    return 'azul'
  }

  private getMultiplierForColor(color: BetColor): number {
    if (!this.config) return color === 'blue' ? 5 : 2

    if (color === 'red') {
      return this.config.redMultiplier
    } else if (color === 'black') {
      return this.config.blackMultiplier
    } else {
      return this.config.blueMultiplier
    }
  }
}
