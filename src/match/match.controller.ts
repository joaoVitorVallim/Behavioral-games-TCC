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
    description: 'Creates a new match with two players in a session',
  })
  @ApiResponse({
    status: 201,
    description: 'Match created successfully',
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
    description: 'Changes the match status (aguardando, em_partida, finalizada, cancelada)',
  })
  @ApiParam({
    name: 'id',
    description: 'Match ID',
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
