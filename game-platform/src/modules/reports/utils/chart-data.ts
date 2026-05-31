import type { MatchMoves } from '../types'
import { get_sorted_rounds } from './format'

export interface PointsChartPoint {
  round: number
  points: number
}

export interface CooperationChartPoint {
  round: number
  cooperacao: number
  competicao: number
}

type PlayerKey = 'player1' | 'player2'

const choice_field: Record<PlayerKey, 'player1Choice' | 'player2Choice'> = {
  player1: 'player1Choice',
  player2: 'player2Choice'
}

const points_field: Record<PlayerKey, 'player1Points' | 'player2Points'> = {
  player1: 'player1Points',
  player2: 'player2Points'
}

export const build_points_series = (
  moves: MatchMoves,
  player: PlayerKey
): PointsChartPoint[] => {
  const rounds = get_sorted_rounds(moves)
  let cumulative = 0
  return rounds.map((round) => {
    const move = moves[String(round)]
    cumulative += move?.[points_field[player]] ?? 0
    return { round, points: cumulative }
  })
}

export const build_cooperation_series = (
  moves: MatchMoves,
  player: PlayerKey
): CooperationChartPoint[] => {
  const rounds = get_sorted_rounds(moves)
  let cooperacao = 0
  let competicao = 0

  return rounds.map((round) => {
    const move = moves[String(round)]
    const choice = move?.[choice_field[player]]
    const points = move?.[points_field[player]] ?? 0

    if (choice === 'cooperate') {
      cooperacao += points
    } else if (choice === 'defect') {
      competicao += points
    }

    return { round, cooperacao, competicao }
  })
}
