import { RouletteMoveOption, RouletteRoundMove } from '../../match/match.entity';

export type RouletteMoves = Record<string, RouletteRoundMove>;

export interface RouletteMatchState {
  matchId: string;
  sessionId: string;
  playerId: string;
  coins: number;
  initMoney: number;
  pointsLimit: number;
  timeLimit: number | null;
  pityStreak: number;
  moves: RouletteMoves;
  status: 'in_progress' | 'finished';
}

export interface RouletteSpinResult {
  round: number;
  opcao: RouletteMoveOption;
  aposta: number;
  won: boolean;
  coinsAmount: number;
  winProbability: number;
  matchFinished: boolean;
}
