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
  ApiBody,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { MatchService } from './match.service';
import { Match, MatchStatus } from './match.entity';

@ApiTags('Matches')
@ApiBearerAuth()
@Controller('matches')
export class MatchController {
  constructor(private readonly matchService: MatchService) {}

  @Post()
  @ApiOperation({
    summary: 'Create new match',
    description: 'Creates a new match with two players in a session',
  })
  @ApiBody({
    schema: {
      example: {
        sessionId: 'd7fb8887-9739-4aab-8934-df34707d8d98',
        player1Id: 'e7fb8887-9739-4aab-8934-df34707d8d98',
        player2Id: 'f7fb8887-9739-4aab-8934-df34707d8d98',
      },
    },
  })
  @ApiResponse({
    status: 201,
    description: 'Match created successfully',
  })
  async create(
    @Body()
    body: {
      sessionId: string;
      player1Id: string;
      player2Id: string;
    },
  ): Promise<Match> {
    return await this.matchService.create(body.sessionId, body.player1Id, body.player2Id);
  }

  @Get()
  @ApiOperation({
    summary: 'List all matches',
    description: 'Returns list of matches with optional filters',
  })
  @ApiQuery({
    name: 'sessionId',
    required: false,
    description: 'Filter by session ID',
  })
  @ApiQuery({
    name: 'status',
    required: false,
    enum: MatchStatus,
    description: 'Filter by match status',
  })
  @ApiResponse({
    status: 200,
    description: 'Matches list returned successfully',
    isArray: true,
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
    description: 'Changes the match status (waiting, in_progress, finished, cancelled)',
  })
  @ApiParam({
    name: 'id',
    description: 'Match ID',
  })
  @ApiBody({
    schema: {
      example: {
        status: 'in_progress',
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Status updated successfully',
  })
  async updateStatus(
    @Param('id') id: string,
    @Body() body: { status: MatchStatus },
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
