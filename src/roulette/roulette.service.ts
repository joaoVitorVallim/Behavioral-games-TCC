import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Match, MatchStatus, RouletteMoveOption } from '../match/match.entity';
import { SettingsGameRoulette } from '../settings/settings-game-roulette.entity';
import { RouletteMatchState, RouletteSpinResult } from './interfaces/roulette-match.interface';

@Injectable()
export class RouletteService {
  // Chance base de acerto e coeficiente de aceleração quadrática aplicados a cada rodada
  // perdida seguida, até se tornar quase impossível perder (efeito de "pity" / near-miss).
  // A curva sobe pouco nas primeiras derrotas e dispara nas últimas — ver tabela no plano.
  private static readonly BASE_WIN_PROBABILITY = 0.1;
  private static readonly WIN_PROBABILITY_ACCELERATION = 0.02;
  private static readonly MAX_WIN_PROBABILITY = 0.97;
  private static readonly PAYOUT_MULTIPLIER = 2;

  private readonly activeMatches = new Map<string, RouletteMatchState>();

  constructor(
    @InjectRepository(Match)
    private matchRepository: Repository<Match>,
  ) {}

  async initMatch(matchId: string, playerId: string): Promise<RouletteMatchState> {
    const existing = this.activeMatches.get(matchId);
    if (existing) return existing;

    const match = await this.matchRepository.findOne({
      where: { id: matchId },
      relations: ['session', 'session.settings'],
    });

    if (!match) {
      throw new NotFoundException(`Match ${matchId} not found`);
    }

    if (match.player1_id !== playerId) {
      throw new BadRequestException(`Player ${playerId} is not part of match ${matchId}`);
    }

    if (match.status === MatchStatus.FINALIZADA || match.status === MatchStatus.CANCELADA) {
      throw new BadRequestException(`Match ${matchId} is already ${match.status}`);
    }

    const settings = match.session.settings as SettingsGameRoulette;
    const initMoney = settings?.initMoney ?? 1000;

    const state: RouletteMatchState = {
      matchId,
      sessionId: match.session_id,
      playerId,
      coins: initMoney,
      initMoney,
      pointsLimit: settings?.pointsLimit ?? 500,
      timeLimit: settings?.timeLimit ?? null,
      pityStreak: 0,
      moves: (match.moves as RouletteMatchState['moves']) ?? {},
      status: 'in_progress',
    };

    this.activeMatches.set(matchId, state);
    return state;
  }

  private winProbabilityFor(pityStreak: number): number {
    return Math.min(
      RouletteService.BASE_WIN_PROBABILITY +
        RouletteService.WIN_PROBABILITY_ACCELERATION * pityStreak ** 2,
      RouletteService.MAX_WIN_PROBABILITY,
    );
  }

  private otherColor(opcao: RouletteMoveOption): RouletteMoveOption {
    const rest = Object.values(RouletteMoveOption).filter((color) => color !== opcao);
    return rest[Math.floor(Math.random() * rest.length)];
  }

  async spin(
    matchId: string,
    playerId: string,
    opcao: RouletteMoveOption,
    aposta: number,
  ): Promise<RouletteSpinResult> {
    const state = this.getState(matchId);

    if (state.playerId !== playerId) {
      throw new BadRequestException(`Player ${playerId} is not part of match ${matchId}`);
    }
    if (state.status !== 'in_progress') {
      throw new BadRequestException('Match is not in progress');
    }
    if (aposta > state.coins) {
      throw new BadRequestException('Bet exceeds current coin balance');
    }

    const winProbability = this.winProbabilityFor(state.pityStreak);
    const won = Math.random() < winProbability;
    const resultColor = won ? opcao : this.otherColor(opcao);

    state.coins = state.coins - aposta + (won ? aposta * RouletteService.PAYOUT_MULTIPLIER : 0);
    const pityStreakAtSpin = state.pityStreak;
    state.pityStreak = won ? 0 : state.pityStreak + 1;

    const round = Object.keys(state.moves).length + 1;
    state.moves[String(round)] = {
      coinsAmount: state.coins,
      aposta,
      opcao: resultColor,
      winrate: won,
      winProbability,
      pityStreak: pityStreakAtSpin,
    };

    const matchFinished = state.coins <= 0 || state.coins >= state.initMoney + state.pointsLimit;
    if (matchFinished) {
      state.status = 'finished';
      await this.persistMatch(state);
    }

    return {
      round,
      opcao: resultColor,
      aposta,
      won,
      coinsAmount: state.coins,
      winProbability,
      matchFinished,
    };
  }

  private async persistMatch(state: RouletteMatchState): Promise<Match> {
    const match = await this.matchRepository.findOne({
      where: { id: state.matchId },
    });
    if (!match) throw new NotFoundException(`Match ${state.matchId} not found`);

    match.moves = state.moves;
    match.status = MatchStatus.FINALIZADA;
    const saved = await this.matchRepository.save(match);

    this.activeMatches.delete(state.matchId);
    return saved;
  }

  async finalizeMatch(matchId: string): Promise<Match> {
    const state = this.getState(matchId);
    return await this.persistMatch(state);
  }

  getState(matchId: string): RouletteMatchState {
    const state = this.activeMatches.get(matchId);
    if (!state) {
      throw new NotFoundException(`No active roulette match state for matchId ${matchId}`);
    }
    return state;
  }

  hasState(matchId: string): boolean {
    return this.activeMatches.has(matchId);
  }
}
