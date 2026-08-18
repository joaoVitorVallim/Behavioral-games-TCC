import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Match, MatchStatus } from '../match/match.entity';
import {
  PrisonerMatchState,
  PrisonerChoice,
  PRISONER_PAYOFF,
} from './interfaces/prisoner-match.interface';
import { SettingsGamePrisoner } from '../settings/settings-game-prisoner.entity';

export type RoundTimeoutCallback = (matchId: string) => void;

@Injectable()
export class PrisonerService {
  private static readonly REVEAL_GRACE_MS = 4000;
  private static readonly BOOT_GRACE_MS = 1500;
  private readonly activeMatches = new Map<string, PrisonerMatchState>();
  private onRoundTimeout: RoundTimeoutCallback | null = null;

  constructor(
    @InjectRepository(Match)
    private matchRepository: Repository<Match>,
  ) {}

  setRoundTimeoutCallback(cb: RoundTimeoutCallback) {
    this.onRoundTimeout = cb;
  }

  async initMatch(matchId: string): Promise<PrisonerMatchState> {
    const existingBefore = this.activeMatches.get(matchId);
    if (existingBefore) return existingBefore;

    const match = await this.matchRepository.findOne({
      where: { id: matchId },
      relations: ['session', 'session.settings'],
    });

    // Re-check after await — concurrent call may have set state while DB query was running
    const existingAfter = this.activeMatches.get(matchId);
    if (existingAfter) return existingAfter;

    if (!match) {
      throw new NotFoundException(`Match ${matchId} not found`);
    }

    if (match.status === MatchStatus.FINALIZADA || match.status === MatchStatus.CANCELADA) {
      throw new BadRequestException(`Match ${matchId} is already ${match.status}`);
    }

    if (!match.player2_id) {
      throw new BadRequestException('Match needs 2 players to start');
    }

    const settings = match.session.settings as SettingsGamePrisoner;
    const totalRounds = settings?.limitRounds ?? 10;

    const state: PrisonerMatchState = {
      matchId,
      sessionId: match.session_id,
      player1Id: match.player1_id,
      player2Id: match.player2_id,
      currentRound: 1,
      totalRounds,
      player1TotalPoints: 0,
      player2TotalPoints: 0,
      player1SocketId: null,
      player2SocketId: null,
      pendingChoices: {},
      moves: {},
      status: 'waiting',
      userViewPoints: settings?.userViewPoints ?? false,
      roundTimeLimit: settings?.roundTimeLimit ?? null,
      roundTimer: null,
      roundDeadline: null,
      pausedRemainingMs: null,
      pausedRound: null,
    };

    this.activeMatches.set(matchId, state);
    return state;
  }

  connectPlayer(matchId: string, playerId: string, socketId: string): PrisonerMatchState {
    const state = this.getState(matchId);

    if (state.player1Id === playerId) {
      state.player1SocketId = socketId;
    } else if (state.player2Id === playerId) {
      state.player2SocketId = socketId;
    } else {
      throw new BadRequestException(`Player ${playerId} is not part of match ${matchId}`);
    }
    if (state.status === 'finished') return state;

    if (state.player1SocketId && state.player2SocketId) {
      state.status = 'in_progress';

      if (state.roundTimer === null && state.roundDeadline === null) {
        const resuming =
          state.pausedRemainingMs !== null && state.pausedRound === state.currentRound;
        if (resuming) {
          this.armRoundTimer(
            state,
            state.pausedRemainingMs! + PrisonerService.BOOT_GRACE_MS,
          );
        } else {
          this.startRoundTimer(state, PrisonerService.BOOT_GRACE_MS);
        }
      }
    }

    return state;
  }

  disconnectPlayer(socketId: string): PrisonerMatchState | null {
    for (const state of this.activeMatches.values()) {
      if (state.player1SocketId === socketId || state.player2SocketId === socketId) {
        if (state.player1SocketId === socketId) state.player1SocketId = null;
        if (state.player2SocketId === socketId) state.player2SocketId = null;
        if (state.status !== 'finished') {
          state.status = 'waiting';
          if (state.roundDeadline !== null) {
            state.pausedRemainingMs = Math.max(0, state.roundDeadline - Date.now());
            state.pausedRound = state.currentRound;
          }
          this.clearRoundTimer(state);
        }
        return state;
      }
    }
    return null;
  }

  submitChoice(
    matchId: string,
    playerId: string,
    choice: PrisonerChoice,
    round?: number,
  ): { state: PrisonerMatchState; roundResolved: boolean } {
    const state = this.getState(matchId);

    if (state.status !== 'in_progress') {
      throw new BadRequestException('Match is not in progress');
    }
    if (round !== undefined && round !== state.currentRound) {
      throw new BadRequestException(
        `Choice was for round ${round}, but the match is now on round ${state.currentRound}`,
      );
    }

    if (state.player1Id === playerId) {
      if (state.pendingChoices.player1 !== undefined) {
        throw new BadRequestException('Player 1 already submitted choice for this round');
      }
      state.pendingChoices.player1 = choice;
    } else if (state.player2Id === playerId) {
      if (state.pendingChoices.player2 !== undefined) {
        throw new BadRequestException('Player 2 already submitted choice for this round');
      }
      state.pendingChoices.player2 = choice;
    } else {
      throw new BadRequestException(`Player ${playerId} is not part of match ${matchId}`);
    }

    const bothChose =
      state.pendingChoices.player1 !== undefined &&
      state.pendingChoices.player2 !== undefined;

    if (bothChose) {
      this.clearRoundTimer(state);
      this.resolveRound(state);
      if (state.status === 'in_progress') {
        this.startRoundTimer(state, PrisonerService.REVEAL_GRACE_MS);
      }
      return { state, roundResolved: true };
    }

    return { state, roundResolved: false };
  }

  forceResolveRound(matchId: string): { state: PrisonerMatchState; roundResolved: boolean } | null {
    const state = this.activeMatches.get(matchId);
    if (!state || state.status !== 'in_progress') return null;

    const p1TimedOut = state.pendingChoices.player1 === undefined;
    const p2TimedOut = state.pendingChoices.player2 === undefined;
    if (p1TimedOut) state.pendingChoices.player1 = 'defect';
    if (p2TimedOut) state.pendingChoices.player2 = 'defect';

    this.resolveRound(state, { player1: p1TimedOut, player2: p2TimedOut });
    if (state.status === 'in_progress') {
      this.startRoundTimer(state, PrisonerService.REVEAL_GRACE_MS);
    }
    return { state, roundResolved: true };
  }

  private startRoundTimer(state: PrisonerMatchState, graceMs = 0): void {
    if (!state.roundTimeLimit || state.roundTimeLimit <= 0) return;
    this.armRoundTimer(state, state.roundTimeLimit * 1000 + graceMs);
  }

  private armRoundTimer(state: PrisonerMatchState, durationMs: number): void {
    this.clearRoundTimer(state);

    if (!state.roundTimeLimit || state.roundTimeLimit <= 0) return;

    state.pausedRemainingMs = null;
    state.pausedRound = null;

    const scheduledRound = state.currentRound;

    state.roundDeadline = Date.now() + durationMs;

    state.roundTimer = setTimeout(() => {
      state.roundTimer = null;
      if (state.status !== 'in_progress' || state.currentRound !== scheduledRound) {
        return;
      }

      if (this.onRoundTimeout) {
        this.onRoundTimeout(state.matchId);
      }
    }, durationMs);
  }

  private clearRoundTimer(state: PrisonerMatchState): void {
    if (state.roundTimer) {
      clearTimeout(state.roundTimer);
      state.roundTimer = null;
    }
    state.roundDeadline = null;
  }

  private resolveRound(
    state: PrisonerMatchState,
    timedOut?: { player1: boolean; player2: boolean },
  ): void {
    const c1 = state.pendingChoices.player1!;
    const c2 = state.pendingChoices.player2!;
    const [points1, points2] = PRISONER_PAYOFF[c1][c2];

    state.player1TotalPoints += points1;
    state.player2TotalPoints += points2;

    state.moves[String(state.currentRound)] = {
      player1Choice: c1,
      player2Choice: c2,
      player1Points: points1,
      player2Points: points2,
      ...(timedOut?.player1 ? { player1TimedOut: true } : {}),
      ...(timedOut?.player2 ? { player2TimedOut: true } : {}),
    };

    state.pendingChoices = {};

    if (state.currentRound >= state.totalRounds) {
      state.status = 'finished';
    } else {
      state.currentRound++;
    }
  }

  async finalizeMatch(matchId: string): Promise<Match> {
    const state = this.getState(matchId);
    this.clearRoundTimer(state);

    const match = await this.matchRepository.findOne({ where: { id: matchId } });
    if (!match) throw new NotFoundException(`Match ${matchId} not found`);

    match.moves = state.moves as any;
    match.status = MatchStatus.FINALIZADA;
    const saved = await this.matchRepository.save(match);

    this.activeMatches.delete(matchId);
    return saved;
  }

  async getFinishedMatchPayload(matchId: string, playerId: string): Promise<{
    matchId: string;
    moves: Record<string, unknown>;
    finalScore: { player1: number; player2: number };
  } | null> {
    const match = await this.matchRepository.findOne({ where: { id: matchId } });
    if (!match || match.status !== MatchStatus.FINALIZADA) return null;
    if (match.player1_id !== playerId && match.player2_id !== playerId) return null;

    const moves = (match.moves ?? {}) as Record<
      string,
      { player1Points?: number; player2Points?: number }
    >;
    let player1 = 0;
    let player2 = 0;
    for (const move of Object.values(moves)) {
      player1 += move.player1Points ?? 0;
      player2 += move.player2Points ?? 0;
    }

    return { matchId, moves, finalScore: { player1, player2 } };
  }

  getState(matchId: string): PrisonerMatchState {
    const state = this.activeMatches.get(matchId);
    if (!state) {
      throw new NotFoundException(`No active prisoner match state for matchId ${matchId}`);
    }
    return state;
  }

  hasState(matchId: string): boolean {
    return this.activeMatches.has(matchId);
  }
}
