import { useEffect, useRef } from 'react'
import Phaser from 'phaser'
import { buildPhaserConfig } from '../config/phaserConfig'
import type { BettingGameConfig } from '../types'

type PhaserGameProps = {
  fullscreen?: boolean
  config?: BettingGameConfig
  onSpinComplete?: (number: number, color: 'red' | 'black' | 'blue', won: boolean) => void
}

export function PhaserGame({ fullscreen = false, config, onSpinComplete }: PhaserGameProps) {
  const container_ref = useRef<HTMLDivElement>(null)
  const game_ref = useRef<Phaser.Game | null>(null)
  const on_spin_complete_ref = useRef(onSpinComplete)

  useEffect(() => {
    on_spin_complete_ref.current = onSpinComplete
  }, [onSpinComplete])

  useEffect(() => {
    if (!container_ref.current || game_ref.current || !config) {
      return
    }

    const sceneData = {
      config,
      onSpinComplete: (number: number, color: 'red' | 'black' | 'blue', won: boolean) => {
        on_spin_complete_ref.current?.(number, color, won)
      },
    }

    const game = new Phaser.Game(buildPhaserConfig(container_ref.current))
    game_ref.current = game

    // Start the scene with data
    game.events.once(Phaser.Core.Events.READY, () => {
      if (game_ref.current === game) {
        game.scene.start('main-scene', sceneData)
      }
    })

    return () => {
      game_ref.current?.destroy(true)
      game_ref.current = null
    }
  }, [config])

  useEffect(() => {
    if (!container_ref.current) {
      return
    }

    const observer = new ResizeObserver(([entry]) => {
      const game = game_ref.current
      if (!game) {
        return
      }

      const next_width = Math.floor(entry.contentRect.width)
      const next_height = Math.floor(entry.contentRect.height)

      if (next_width > 0 && next_height > 0) {
        game.scale.resize(next_width, next_height)
      }
    })

    observer.observe(container_ref.current)

    return () => {
      observer.disconnect()
    }
  }, [])

  if (fullscreen) {
    return (
      <div className="h-screen w-screen bg-[#020617]">
        <div ref={container_ref} className="h-full w-full overflow-hidden" />
      </div>
    )
  }

  return (
    <div className="rounded-xl border border-border bg-card p-2 shadow-lg sm:rounded-2xl sm:p-3">
      <div
        ref={container_ref}
        className="aspect-[4/5] w-full overflow-hidden rounded-lg bg-[#020617] sm:aspect-video sm:rounded-xl"
      />
    </div>
  )
}
