/**
 * Eixo Y "bonito": teto arredondado para o próximo múltiplo de um passo redondo (1/2/5/10...),
 * com um tick a cada passo. Sem isto, dois gráficos com valores máximos diferentes (ex.: 11 e 16)
 * ganhavam escalas diferentes (passo 7 vs passo 5), dificultando comparar Jogador 1 com Jogador 2.
 */
export interface NiceYScale {
  domain: [number, number]
  ticks: number[]
}

const pick_step = (max_value: number): number => {
  const raw_step = max_value / 4
  const magnitude = Math.pow(10, Math.floor(Math.log10(raw_step)))
  const normalized = raw_step / magnitude

  if (normalized <= 1) return magnitude
  if (normalized <= 2) return 2 * magnitude
  if (normalized <= 5) return 5 * magnitude
  return 10 * magnitude
}

export function nice_y_scale(max_value: number): NiceYScale {
  if (max_value <= 0) return { domain: [0, 5], ticks: [0, 5] }

  const step = pick_step(max_value)
  const ceiling = Math.ceil(max_value / step) * step
  const ticks: number[] = []
  for (let tick = 0; tick <= ceiling; tick += step) ticks.push(tick)

  return { domain: [0, ceiling], ticks }
}
