import type { Choice, MatchMoves, PlayerResult } from '../types'

export const format_date = (iso: string | null | undefined): string => {
  if (!iso) return '—'
  try {
    return new Date(iso).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    })
  } catch {
    return '—'
  }
}

export const format_datetime = (iso: string | null | undefined): string => {
  if (!iso) return '—'
  try {
    return new Date(iso).toLocaleString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  } catch {
    return '—'
  }
}

export const translate_choice = (choice: Choice): string => {
  if (choice === 'cooperate') return 'Cooperar'
  if (choice === 'defect') return 'Trair'
  return choice
}

export const get_sorted_rounds = (moves: MatchMoves): number[] => {
  return Object.keys(moves)
    .map((key) => Number(key))
    .filter((n) => !Number.isNaN(n))
    .sort((a, b) => a - b)
}

export const compute_totals = (moves: MatchMoves) => {
  let player1 = 0
  let player2 = 0

  for (const round of Object.values(moves)) {
    player1 += round.player1Points ?? 0
    player2 += round.player2Points ?? 0
  }

  return { player1, player2 }
}

export const format_player_summary = (player: PlayerResult | null | undefined): string => {
  if (!player) return '—'

  const parts: string[] = []
  if (player.educationLevel) parts.push(player.educationLevel)
  if (player.semester !== null && player.semester !== undefined) {
    parts.push(`${player.semester}º semestre`)
  }
  if (player.course) parts.push(player.course)
  if (player.profession) parts.push(player.profession)

  return parts.length > 0 ? parts.join(' · ') : '—'
}
