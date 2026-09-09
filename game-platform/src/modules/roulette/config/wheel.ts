import type { RouletteMoveOption } from '../types/roulette'

export const WHEEL_SPIN_SECONDS = 2.6

// 6 setores de 60°, 2 por condição, alternados
export const WHEEL_SEQUENCE: RouletteMoveOption[] = ['azul', 'vermelho', 'preto', 'azul', 'vermelho', 'preto']

export const WHEEL_COLOR_META: Record<RouletteMoveOption, { label: string; hex: string; swatchClass: string }> = {
  azul: { label: 'Azul', hex: '#0ea5e9', swatchClass: 'bg-sky-500' },
  vermelho: { label: 'Vermelho', hex: '#ef4444', swatchClass: 'bg-red-500' },
  preto: { label: 'Preto', hex: '#1e293b', swatchClass: 'bg-slate-800' },
}

function pickSegmentIndex(option: RouletteMoveOption): number {
  const candidates = WHEEL_SEQUENCE.reduce<number[]>((acc, value, index) => {
    if (value === option) {
      acc.push(index)
    }
    return acc
  }, [])

  return candidates[Math.floor(Math.random() * candidates.length)]
}

export function computeTargetRotation(currentRotation: number, option: RouletteMoveOption): number {
  const index = pickSegmentIndex(option)
  const segmentCenter = index * 60 + 30
  const desired = (360 - segmentCenter + 360) % 360
  const delta = ((desired - currentRotation) % 360 + 360) % 360
  const extraSpins = 360 * (4 + Math.floor(Math.random() * 2))

  return currentRotation + extraSpins + delta
}
