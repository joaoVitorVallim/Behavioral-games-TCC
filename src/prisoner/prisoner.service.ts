import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Match, MatchStatus } from '../match/match.entity';
import {
  PrisonerMatchState,
  PrisonerChoice,
  PrisonerMoves,
  PRISONER_PAYOFF,
} from './interfaces/prisoner-match.interface';
import { SettingsGamePrisoner } from '../settings/settings-game-prisoner.entity';

@Injectable()
export class PrisonerService {
  /** Partidas em andamento: matchId → estado */
  private readonly activeMatches = new Map<string, PrisonerMatchState>();

  constructor(
    @InjectRepository(Match)
    private matchRepository: Repository<Match>,
    @InjectRepository(SettingsGamePrisoner)
    private settingsPrisonerRepository: Repository<SettingsGamePrisoner>,
  ) {}

  async initMatch(matchId: string): Promise<PrisonerMatchState> {
    const match = await this.matchRepository.findOne({
      where: { id: matchId },
      relations: ['session', 'session.settings'],
    });

    if (!match) {
      throw new NotFoundException(`Match ${matchId} not found`);
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

    if (state.player1SocketId && state.player2SocketId) {
      state.status = 'in_progress';
    }

    return state;
  }

  disconnectPlayer(socketId: string): PrisonerMatchState | null {
    for (const state of this.activeMatches.values()) {
      if (state.player1SocketId === socketId || state.player2SocketId === socketId) {
        if (state.player1SocketId === socketId) state.player1SocketId = null;
        if (state.player2SocketId === socketId) state.player2SocketId = null;
        state.status = 'waiting';
        return state;
      }
    }
    return null;
  }

  submitChoice(
    matchId: string,
    playerId: string,
    choice: PrisonerChoice,
  ): { state: PrisonerMatchState; roundResolved: boolean } {
    const state = this.getState(matchId);

    if (state.status !== 'in_progress') {
      throw new BadRequestException('Match is not in progress');
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
      this.resolveRound(state);
      return { state, roundResolved: true };
    }

    return { state, roundResolved: false };
  }

  private resolveRound(state: PrisonerMatchState): void {
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

    const match = await this.matchRepository.findOne({ where: { id: matchId } });
    if (!match) throw new NotFoundException(`Match ${matchId} not found`);

    match.moves = state.moves as any;
    match.status = MatchStatus.FINALIZADA;
    const saved = await this.matchRepository.save(match);

    this.activeMatches.delete(matchId);
    return saved;
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
