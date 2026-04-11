import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Patch,
  Delete,
  Query,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiQuery,
  ApiParam,
  ApiBearerAuth,
  ApiBody,
} from '@nestjs/swagger';
import { MatchService } from './match.service';
import { Match, MatchStatus } from './match.entity';
import { CreateMatchDto } from './dto/create-match.dto';
import { UpdateMatchStatusDto } from './dto/update-match-status.dto';

@ApiTags('Matches')
@ApiBearerAuth()
@Controller('matches')
export class MatchController {
  constructor(private readonly matchService: MatchService) {}

  @Post()
  @ApiOperation({
    summary: 'Create new match',
    description: "Creates a new match for Prisoner's Dilemma (2 players) or roulette (single player)",
  })
  @ApiBody({
    description: "Prisoner's Dilemma and Roulette payload examples",
    examples: {
      prisoner: {
        summary: "Prisoner's Dilemma match creation",
        value: {
          sessionId: 'd7fb8887-9739-4aab-8934-df34707d8d98',
          player1Id: 'e7fb8887-9739-4aab-8934-df34707d8d98',
          player2Id: 'f7fb8887-9739-4aab-8934-df34707d8d98',
          moves: {
            '1': { player1Choice: 'cooperate', player2Choice: 'defect', player1Points: 0, player2Points: 5 },
            '2': { player1Choice: 'cooperate', player2Choice: 'cooperate', player1Points: 3, player2Points: 3 },
          },
          status: 'aguardando',
        },
      },
      roulette: {
        summary: 'Roulette match creation',
        value: {
          sessionId: 'd7fb8887-9739-4aab-8934-df34707d8d98',
          player1Id: 'e7fb8887-9739-4aab-8934-df34707d8d98',
          moves: {
            '1': { coinsAmount: 1000, aposta: 100, opcao: 'azul', winrate: true },
            '2': { coinsAmount: 900, aposta: 50, opcao: 'preto', winrate: false },
          },
          status: 'aguardando',
        },
      },
    },
  })
  @ApiResponse({
    status: 201,
    description: 'Match created successfully',
    schema: {
      examples: {
        prisoner: {
          summary: "Prisoner's Dilemma match response",
          value: {
            id: 'a7fb8887-9739-4aab-8934-df34707d8d98',
            session_id: 'd7fb8887-9739-4aab-8934-df34707d8d98',
            player1_id: 'e7fb8887-9739-4aab-8934-df34707d8d98',
            player2_id: 'f7fb8887-9739-4aab-8934-df34707d8d98',
            moves: {
              '1': { player1Choice: 'cooperate', player2Choice: 'defect', player1Points: 0, player2Points: 5 },
            },
            status: 'aguardando',
          },
        },
        roulette: {
          summary: 'Roulette match response',
          value: {
            id: 'b7fb8887-9739-4aab-8934-df34707d8d98',
            session_id: 'd7fb8887-9739-4aab-8934-df34707d8d98',
            player1_id: 'e7fb8887-9739-4aab-8934-df34707d8d98',
            player2_id: null,
            moves: {
              '1': { coinsAmount: 1000, aposta: 100, opcao: 'azul', winrate: true },
            },
            status: 'aguardando',
          },
        },
      },
    },
  })
  async create(@Body() body: CreateMatchDto): Promise<Match> {
    return await this.matchService.create(body);
  }

  @Get()
  @ApiOperation({
    summary: 'List all matches',
    description: 'Returns list of matches with optional filters',
  })
  @ApiQuery({
    name: 'sessionId',
    required: false,
    description: 'Filter by session ID (optional)',
  })
  @ApiQuery({
    name: 'status',
    required: false,
    enum: MatchStatus,
    description: 'Filter by match status (optional)',
  })
  @ApiResponse({
    status: 200,
    description: 'Matches list returned successfully',
    isArray: true,
    schema: {
      example: [
        {
          id: 'a7fb8887-9739-4aab-8934-df34707d8d98',
          session_id: 'd7fb8887-9739-4aab-8934-df34707d8d98',
          player1_id: 'e7fb8887-9739-4aab-8934-df34707d8d98',
          player2_id: 'f7fb8887-9739-4aab-8934-df34707d8d98',
          moves: { '1': { player1Choice: 'cooperate', player2Choice: 'defect', player1Points: 0, player2Points: 5 } },
          status: 'aguardando',
        },
        {
          id: 'b7fb8887-9739-4aab-8934-df34707d8d98',
          session_id: 'c7fb8887-9739-4aab-8934-df34707d8d98',
          player1_id: 'e7fb8887-9739-4aab-8934-df34707d8d98',
          player2_id: null,
          moves: { '1': { coinsAmount: 1000, aposta: 100, opcao: 'azul', winrate: true } },
          status: 'aguardando',
        },
      ],
    },
  })
  async findAll(
    @Query('sessionId') sessionId?: string,
    @Query('status') status?: MatchStatus,
  ): Promise<Match[]> {
    return await this.matchService.findAll({ sessionId, status });
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Get match details',
    description: 'Returns complete information of a specific match',
  })
  @ApiParam({
    name: 'id',
    description: 'Match ID',
  })
  @ApiResponse({
    status: 200,
    description: 'Match found',
    schema: {
      examples: {
        prisoner: {
          summary: "Prisoner's Dilemma match",
          value: {
            id: 'a7fb8887-9739-4aab-8934-df34707d8d98',
            session_id: 'd7fb8887-9739-4aab-8934-df34707d8d98',
            player1_id: 'e7fb8887-9739-4aab-8934-df34707d8d98',
            player2_id: 'f7fb8887-9739-4aab-8934-df34707d8d98',
            moves: { '1': { player1Choice: 'cooperate', player2Choice: 'defect', player1Points: 0, player2Points: 5 } },
            status: 'aguardando',
          },
        },
        roulette: {
          summary: 'Roulette match',
          value: {
            id: 'b7fb8887-9739-4aab-8934-df34707d8d98',
            session_id: 'c7fb8887-9739-4aab-8934-df34707d8d98',
            player1_id: 'e7fb8887-9739-4aab-8934-df34707d8d98',
            player2_id: null,
            moves: { '1': { coinsAmount: 1000, aposta: 100, opcao: 'azul', winrate: true } },
            status: 'aguardando',
          },
        },
      },
    },
  })
  @ApiResponse({
    status: 404,
    description: 'Match not found',
  })
  async findOne(@Param('id') id: string): Promise<Match | null> {
    return await this.matchService.findOne(id);
  }

  @Patch(':id/status')
  @ApiOperation({
    summary: 'Update match status',
    description: 'Changes the match status (aguardando, em_partida, finalizada, cancelada)',
  })
  @ApiParam({
    name: 'id',
    description: 'Match ID',
  })
  @ApiBody({
    type: UpdateMatchStatusDto,
    description: 'Only status is accepted (required).',
    examples: {
      start: {
        summary: 'Start match',
        value: { status: 'em_partida' },
      },
      finish: {
        summary: 'Finish match',
        value: { status: 'finalizada' },
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Status updated successfully',
  })
  async updateStatus(
    @Param('id') id: string,
    @Body() body: UpdateMatchStatusDto,
  ): Promise<Match> {
    return await this.matchService.updateStatus(id, body.status);
  }

  @Delete(':id')
  @ApiOperation({
    summary: 'Delete match',
    description: 'Removes a match from the system',
  })
  @ApiParam({
    name: 'id',
    description: 'Match ID',
  })
  @ApiResponse({
    status: 200,
    description: 'Match deleted successfully',
  })
  async delete(@Param('id') id: string): Promise<void> {
    return await this.matchService.delete(id);
  }
}
