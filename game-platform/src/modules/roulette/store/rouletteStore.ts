import type {
  RouletteGameOverSummary,
  RouletteGameState,
  RouletteJoinResponse,
  RouletteRoundHistory,
  RouletteSpinResponse,
} from '../types/roulette'

function parseJoinedMoves(moves: RouletteJoinResponse['moves']): RouletteRoundHistory[] {
  const ordered_entries = Object.entries(moves)
    .map(([round, move]) => ({ round: Number(round), move }))
    .filter((entry) => Number.isFinite(entry.round))
    .sort((a, b) => a.round - b.round)

  return ordered_entries.map(({ round, move }) => ({
    round,
    aposta: move.aposta,
    opcao: move.opcao,
    won: false,
    coinsAmount: move.coinsAmount,
  }))
}

export class RouletteStore {
  private state: RouletteGameState | null = null

  applyJoin(payload: RouletteJoinResponse): RouletteGameState {
    const history = parseJoinedMoves(payload.moves)

    this.state = {
      matchId: payload.matchId,
      sessionId: payload.sessionId,
      playerId: payload.playerId,
      coins: payload.coins,
      pointsLimit: payload.pointsLimit,
      timeLimit: payload.timeLimit,
      pityStreak: payload.pityStreak,
      status: payload.status,
      currentRound: history.length,
      moveHistory: history,
      telemetry: [],
    }

    return this.getState()
  }

  applySpin(payload: RouletteSpinResponse): RouletteGameState {
    if (!this.state) {
      throw new Error('RouletteStore não inicializado. Chame applyJoin antes de applySpin.')
    }

    this.state.currentRound = payload.round
    this.state.coins = payload.coinsAmount
    this.state.status = payload.matchFinished ? 'finished' : 'in_progress'
    this.state.moveHistory.push({
      round: payload.round,
      aposta: payload.aposta,
      opcao: payload.opcao,
      won: payload.won,
      coinsAmount: payload.coinsAmount,
    })
    this.state.telemetry.push({
      round: payload.round,
      winProbability: payload.winProbability,
    })

    return this.getState()
  }

  markFinished(): RouletteGameState {
    if (!this.state) {
      throw new Error('RouletteStore não inicializado.')
    }

    this.state.status = 'finished'
    return this.getState()
  }

  getState(): RouletteGameState {
    if (!this.state) {
      throw new Error('RouletteStore não inicializado.')
    }

    return {
      ...this.state,
      moveHistory: [...this.state.moveHistory],
      telemetry: [...this.state.telemetry],
    }
  }

  buildGameOverSummary(timedOut: boolean): RouletteGameOverSummary {
    const snapshot = this.getState()
    const final_coins = snapshot.coins

    return {
      matchId: snapshot.matchId,
      playerId: snapshot.playerId,
      finalCoins: final_coins,
      pointsLimit: snapshot.pointsLimit,
      roundsPlayed: snapshot.moveHistory.length,
      reachedTarget: final_coins >= snapshot.pointsLimit,
      depletedCoins: final_coins <= 0,
      timedOut,
    }
  }
}
