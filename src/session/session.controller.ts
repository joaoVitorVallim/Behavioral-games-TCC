import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  BadRequestException,
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
import { SessionService } from './session.service';
import { CreateSessionDto } from './dto/create-session.dto';
import { UpdateSessionDto } from './dto/update-session.dto';
import { GameType } from '../game/games.enum';

@ApiTags('Sessions')
@ApiBearerAuth()
@Controller('sessions')
export class SessionController {
  constructor(private readonly sessionService: SessionService) {}

  @Post()
  @ApiOperation({
    summary: 'Create new session',
    description: 'Creates a new session with game-specific configurations',
  })
  @ApiBody({ type: CreateSessionDto })
  @ApiResponse({
    status: 201,
    description: 'Session created successfully',
    schema: {
      example: {
        id: 'd7fb8887-9739-4aab-8934-df34707d8d98',
        game: 'cards',
        inputInfo: ['nickname', 'profession'],
        inviteCode: 'F4LVTX',
        isActive: true,
        created_at: '2026-03-07T17:05:59.734Z',
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Validation error or invalid data',
  })
  create(@Body() createSessionDto: CreateSessionDto) {
    return this.sessionService.create(createSessionDto);
  }

  @Get()
  @ApiOperation({
    summary: 'List all sessions',
    description: 'Returns list of sessions with optional filters',
  })
  @ApiQuery({
    name: 'game',
    required: false,
    enum: GameType,
    description: 'Filter by game type',
  })
  @ApiQuery({
    name: 'userId',
    required: false,
    description: 'Filter by creator user ID',
  })
  @ApiQuery({
    name: 'isActive',
    required: false,
    enum: ['true', 'false'],
    description: 'Filter by status (active/inactive)',
  })
  @ApiResponse({
    status: 200,
    description: 'Sessions list returned successfully',
    isArray: true,
  })
  findAll(
    @Query('game') game?: GameType,
    @Query('userId') userId?: string,
    @Query('isActive') isActive?: string,
  ) {
    return this.sessionService.findAll({
      game,
      userId,
      isActive: isActive !== undefined ? isActive === 'true' : undefined,
    });
  }

  @Get('codigo/:codigo')
  @ApiOperation({
    summary: 'Find session by invite code',
    description: 'Returns the session based on unique invite code',
  })
  @ApiParam({
    name: 'codigo',
    description: 'Session invite code (ex: EVRF4)',
  })
  @ApiResponse({
    status: 200,
    description: 'Session found',
  })
  @ApiResponse({
    status: 404,
    description: 'Session not found',
  })
  findByInviteCode(@Param('codigo') codigo: string) {
    return this.sessionService.findByInviteCode(codigo);
  }

  @Get('stats/:id')
  @ApiOperation({
    summary: 'Get session statistics',
    description: 'Returns complete information and statistics of the session',
  })
  @ApiParam({
    name: 'id',
    description: 'Session ID',
  })
  @ApiResponse({
    status: 200,
    description: 'Statistics returned successfully',
  })
  @ApiResponse({
    status: 404,
    description: 'Session not found',
  })
  getStats(@Param('id') id: string) {
    return this.sessionService.getSessionStats(id);
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Get session details',
    description: 'Returns complete information of a specific session',
  })
  @ApiParam({
    name: 'id',
    description: 'Session ID',
  })
  @ApiResponse({
    status: 200,
    description: 'Session found',
  })
  @ApiResponse({
    status: 404,
    description: 'Session not found',
  })
  findOne(@Param('id') id: string) {
    return this.sessionService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({
    summary: 'Update session',
    description: 'Updates session data (e.g., activate/deactivate)',
  })
  @ApiParam({
    name: 'id',
    description: 'Session ID',
  })
  @ApiBody({ type: UpdateSessionDto })
  @ApiResponse({
    status: 200,
    description: 'Session updated successfully',
  })
  @ApiResponse({
    status: 404,
    description: 'Session not found',
  })
  update(
    @Param('id') id: string,
    @Body() updateSessionDto: UpdateSessionDto,
  ) {
    return this.sessionService.update(id, updateSessionDto);
  }

  @Post(':id/finish')
  @ApiOperation({
    summary: 'Finish session',
    description: 'Marks the session as finished',
  })
  @ApiParam({
    name: 'id',
    description: 'Session ID',
  })
  @ApiResponse({
    status: 201,
    description: 'Session finished successfully',
  })
  @ApiResponse({
    status: 404,
    description: 'Session not found',
  })
  finish(@Param('id') id: string) {
    return this.sessionService.finish(id);
  }

  @Delete(':id')
  @ApiOperation({
    summary: 'Delete session',
    description: 'Removes a session from the system',
  })
  @ApiParam({
    name: 'id',
    description: 'Session ID',
  })
  @ApiResponse({
    status: 200,
    description: 'Session deleted successfully',
  })
  @ApiResponse({
    status: 404,
    description: 'Session not found',
  })
  remove(@Param('id') id: string) {
    return this.sessionService.remove(id);
  }
}
