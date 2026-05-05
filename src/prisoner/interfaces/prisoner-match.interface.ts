export type PrisonerChoice = 'cooperate' | 'defect';

export interface PrisonerRoundResult {
  player1Choice: PrisonerChoice;
  player2Choice: PrisonerChoice;
  player1Points: number;
  player2Points: number;
}

export type PrisonerMoves = Record<string, PrisonerRoundResult>;

export interface PrisonerMatchState {
  matchId: string;
  sessionId: string;
  player1Id: string;
  player2Id: string;
  currentRound: number;
  totalRounds: number;
  player1TotalPoints: number;
  player2TotalPoints: number;
  player1SocketId: string | null;
  player2SocketId: string | null;
  pendingChoices: {
    player1?: PrisonerChoice;
    player2?: PrisonerChoice;
  };
  moves: PrisonerMoves;
  status: 'waiting' | 'in_progress' | 'finished';
  userViewPoints: boolean;
  roundTimeLimit: number | null;
  roundTimer: ReturnType<typeof setTimeout> | null;
}

export const PRISONER_PAYOFF = {
  cooperate: { cooperate: [3, 3], defect: [0, 5] },
  defect:    { cooperate: [5, 0], defect: [1, 1] },
} as const;
