import Phaser from 'phaser'
import { MainScene } from '../scenes/MainScene'
import type { BettingGameConfig } from '../types'

export type PhaserSceneData = {
  config: BettingGameConfig
  onSpinComplete?: (number: number, color: 'red' | 'black' | 'blue', won: boolean) => void
}

export function buildPhaserConfig(parent: HTMLElement): Phaser.Types.Core.GameConfig {
  return {
    type: Phaser.AUTO,
    parent,
    backgroundColor: '#020617',
    scene: [MainScene],
    scale: {
      mode: Phaser.Scale.RESIZE,
      autoCenter: Phaser.Scale.NO_CENTER,
      width: parent.clientWidth || 1280,
      height: parent.clientHeight || 720,
    },
    physics: {
      default: 'arcade',
      arcade: {
        gravity: { x: 0, y: 0 },
        debug: false,
      },
    },
  }
}
