import type { CSSProperties } from 'react'
import { WHEEL_COLOR_META, WHEEL_SEQUENCE } from '../config/wheel'

interface RouletteWheelProps {
  rotation: number
  spinSeconds: number
}

export function RouletteWheel({ rotation, spinSeconds }: RouletteWheelProps) {
  const gradient = WHEEL_SEQUENCE.map((option, index) => {
    const meta = WHEEL_COLOR_META[option]
    return `${meta.hex} ${index * 60}deg ${(index + 1) * 60}deg`
  }).join(', ')

  const discStyle: CSSProperties = {
    transform: `rotate(${rotation}deg)`,
    transition: `transform ${spinSeconds}s cubic-bezier(0.14, 0.72, 0.02, 1)`,
    background: `conic-gradient(from 0deg, ${gradient})`,
  }

  return (
    <div className="relative flex flex-col items-center" style={{ width: 372, height: 396 }}>
      <div className="absolute top-0 left-1/2 z-10 flex -translate-x-1/2 flex-col items-center gap-1.5">
        <span className="heading-kicker">Leitor</span>
        <div
          style={{
            width: 0,
            height: 0,
            borderLeft: '9px solid transparent',
            borderRight: '9px solid transparent',
            borderTop: '18px solid var(--color-foreground)',
          }}
        />
      </div>

      <div className="relative" style={{ width: 344, height: 344, marginTop: 30 }}>
        <div className="absolute rounded-full border border-border/70" style={{ inset: -14 }} />

        <div className="absolute overflow-hidden rounded-full border border-border" style={{ inset: 0, ...discStyle }}>
          <div
            className="absolute inset-0"
            style={{
              background:
                'repeating-conic-gradient(from 0deg, rgba(6, 12, 26, 0.55) 0deg 0.35deg, transparent 0.35deg 60deg)',
            }}
          />

          {WHEEL_SEQUENCE.map((option, index) => {
            const meta = WHEEL_COLOR_META[option]
            const deg = index * 60 + 30
            const counterDeg = -(deg + rotation)

            return (
              <div
                key={`${option}-${index}`}
                className="absolute top-1/2 left-1/2 h-0 w-0"
                style={{ transform: `rotate(${deg}deg) translateY(-104px)` }}
              >
                <div
                  className="flex items-center justify-center text-[11px] font-semibold tracking-[0.2em] text-white uppercase"
                  style={{
                    width: 140,
                    height: 22,
                    margin: '-11px 0 0 -70px',
                    transform: `rotate(${counterDeg}deg)`,
                    transition: `transform ${spinSeconds}s cubic-bezier(0.14, 0.72, 0.02, 1)`,
                    textShadow: '0 1px 4px rgba(0, 0, 0, 0.45)',
                  }}
                >
                  {meta.label}
                </div>
              </div>
            )
          })}
        </div>

        <div
          className="absolute z-[3] flex items-center justify-center rounded-full border border-border bg-card font-data text-xs text-muted-foreground"
          style={{ width: 66, height: 66, top: '50%', left: '50%', margin: '-33px 0 0 -33px' }}
        >
          3x
        </div>
      </div>
    </div>
  )
}
