/**
 * Alguns campos numéricos são armazenados/enviados à API em segundos, mas o professor
 * digita e vê em minutos (mais natural para configurar uma partida). A conversão é só de
 * exibição: o valor que entra e sai do `CreateConfigPayload`/API continua em segundos.
 */
export const SECONDS_AS_MINUTES_FIELDS = new Set(['timeLimit'])

/** Segundos (valor armazenado) -> minutos (valor mostrado no input). */
export function seconds_to_minutes_input(value: unknown): number | '' {
  if (typeof value !== 'number' || value <= 0) return ''
  return Math.round(value / 60)
}

/** Minutos (texto digitado no input) -> segundos (valor armazenado). */
export function minutes_input_to_seconds(raw: string): number {
  if (raw === '') return 0
  return Math.round(Number(raw) * 60)
}
