import { Controller, Post, Get, Param, Body, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiParam, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { RouletteService } from './roulette.service';
import { SpinRouletteDto } from './dto/spin-roulette.dto';
import type { RouletteMatchState, RouletteSpinResult } from './interfaces/roulette-match.interface';
import { Match } from '../match/match.entity';

@ApiTags('Roulette')
@ApiBearerAuth()
@Controller('roulette/matches')
export class RouletteController {
  constructor(private readonly rouletteService: RouletteService) {}

  @Post(':matchId/join')
  @ApiOperation({
    summary: 'Start/resume a roulette match',
    description: 'Initializes the in-memory roulette state for a match (idempotent).',
  })
  @ApiParam({ name: 'matchId', description: 'Match ID' })
  async join(
    @Param('matchId') matchId: string,
    @Query('playerId') playerId: string,
  ): Promise<RouletteMatchState> {
    return await this.rouletteService.initMatch(matchId, playerId);
  }

  @Post(':matchId/spin')
  @ApiOperation({
    summary: 'Spin the roulette',
    description:
      'Resolves one betting round. The winning color returned to the frontend.',
  })
  @ApiParam({ name: 'matchId', description: 'Match ID' })
  @ApiResponse({ status: 201, description: 'Spin resolved' })
  async spin(
    @Param('matchId') matchId: string,
    @Body() body: SpinRouletteDto,
  ): Promise<RouletteSpinResult> {
    return await this.rouletteService.spin(matchId, body.playerId, body.opcao, body.aposta);
  }

  @Get(':matchId/state')
  @ApiOperation({ summary: 'Get current roulette match state' })
  @ApiParam({ name: 'matchId', description: 'Match ID' })
  getState(@Param('matchId') matchId: string): RouletteMatchState {
    return this.rouletteService.getState(matchId);
  }

  @Post(':matchId/finish')
  @ApiOperation({
    summary: 'Finalize a roulette match',
    description: 'Persists the accumulated moves to the match and marks it as finalizada.',
  })
  @ApiParam({ name: 'matchId', description: 'Match ID' })
  async finish(@Param('matchId') matchId: string): Promise<Match> {
    return await this.rouletteService.finalizeMatch(matchId);
  }
}
