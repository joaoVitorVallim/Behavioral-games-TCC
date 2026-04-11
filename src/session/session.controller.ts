import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
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
import { SessionService } from './session.service';
import { CreateSessionDto } from './dto/create-session.dto';
import { UpdateSessionDto } from './dto/update-session.dto';
import { GameType } from '../game/games.enum';
import { JoinSessionDto } from './dto/join-session.dto';

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
  @ApiBody({
    type: CreateSessionDto,
    examples: {
      prisoner: {
        summary: "Prisoner's Dilemma session creation",
        value: {
          game: 'prisoner',
          settings: {
            configName: "Prisoner's Config Level 1",
            userViewPoints: true,
            limitRounds: 10,
          },
          inputInfo: ['educationLevel', 'semester', 'profession'],
          user_id: 'ab5d10f7-8522-498c-a585-97cdc9d0956d',
        },
      },
      roulette: {
        summary: 'Roulette session creation',
        value: {
          game: 'roulette',
          settings: {
            configName: 'Roulette Config Beginner',
            timeLimit: 60,
            pointsLimit: 500,
            popup: { message: 'Aposte agora!', players: 2 },
            initMoney: 1000,
          },
          inputInfo: ['educationLevel'],
          user_id: 'ab5d10f7-8522-498c-a585-97cdc9d0956d',
        },
      },
    },
  })
  @ApiResponse({
    status: 201,
    description: 'Session created successfully',
    schema: {
      examples: {
        prisoner: {
          summary: "Prisoner's Dilemma session created",
          value: {
            id: 'd7fb8887-9739-4aab-8934-df34707d8d98',
            game: 'prisoner',
            inputInfo: ['educationLevel', 'semester', 'profession'],
            inviteCode: 'F4LVTX',
            isActive: true,
            created_at: '2026-03-07T17:05:59.734Z',
          },
        },
        roulette: {
          summary: 'Roulette session created',
          value: {
            id: 'e7fb8887-9739-4aab-8934-df34707d8d98',
            game: 'roulette',
            inputInfo: ['educationLevel'],
            inviteCode: 'R8K2MP',
            isActive: true,
            created_at: '2026-03-07T17:05:59.734Z',
          },
        },
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

  @Post('join')
  @ApiOperation({
    summary: 'Join session by invite code',
    description:
      "Registers a player in a session using invite code. Prisoner's Dilemma allows up to 2 players and roulette allows only 1 player. A match is auto-created when the room is full.",
  })
  @ApiBody({
    type: JoinSessionDto,
    examples: {
      prisoner: {
        summary: "Join Prisoner's Dilemma session",
        value: {
          inviteCode: 'F4LVTX',
          educationLevel: 'bachelor',
          semester: 6,
          profession: 'Student',
        },
      },
      roulette: {
        summary: 'Join roulette session',
        value: {
          inviteCode: 'R8K2MP',
          educationLevel: 'high_school',
        },
      },
    },
  })
  @ApiResponse({
    status: 201,
    description: 'Player joined session successfully',
    schema: {
      examples: {
        prisoner: {
          summary: "Prisoner's Dilemma join response",
          value: {
            playersCount: 2,
            maxPlayers: 2,
            match: {
              id: 'a7fb8887-9739-4aab-8934-df34707d8d98',
              status: 'aguardando',
            },
          },
        },
        roulette: {
          summary: 'Roulette join response',
          value: {
            playersCount: 1,
            maxPlayers: 1,
            match: {
              id: 'b7fb8887-9739-4aab-8934-df34707d8d98',
              status: 'aguardando',
            },
          },
        },
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Session full, inactive, or missing required player fields',
  })
  @ApiResponse({
    status: 404,
    description: 'Session invite code not found',
  })
  join(@Body() body: JoinSessionDto) {
    return this.sessionService.joinByInviteCode(body);
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
    description: 'Filter by game type (optional)',
  })
  @ApiQuery({
    name: 'userId',
    required: false,
    description: 'Filter by creator user ID (optional)',
  })
  @ApiQuery({
    name: 'isActive',
    required: false,
    enum: ['true', 'false'],
    description: 'Filter by status (active/inactive) (optional)',
  })
  @ApiResponse({
    status: 200,
    description: 'Sessions list returned successfully',
    isArray: true,
    schema: {
      example: [
        {
          id: 'd7fb8887-9739-4aab-8934-df34707d8d98',
          game: 'prisoner',
          inviteCode: 'F4LVTX',
          isActive: true,
        },
        {
          id: 'e7fb8887-9739-4aab-8934-df34707d8d98',
          game: 'roulette',
          inviteCode: 'R8K2MP',
          isActive: true,
        },
      ],
    },
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
    description: 'Session invite code (ex: F4LVTX)',
  })
  @ApiResponse({
    status: 200,
    description: 'Session found',
    schema: {
      examples: {
        prisoner: {
          summary: "Prisoner's Dilemma session by invite code",
          value: {
            id: 'd7fb8887-9739-4aab-8934-df34707d8d98',
            game: 'prisoner',
            inviteCode: 'F4LVTX',
            isActive: true,
          },
        },
        roulette: {
          summary: 'Roulette session by invite code',
          value: {
            id: 'e7fb8887-9739-4aab-8934-df34707d8d98',
            game: 'roulette',
            inviteCode: 'R8K2MP',
            isActive: true,
          },
        },
      },
    },
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
    schema: {
      examples: {
        prisoner: {
          summary: "Prisoner's Dilemma session stats",
          value: {
            sessionId: 'd7fb8887-9739-4aab-8934-df34707d8d98',
            game: 'prisoner',
            totalPlayers: 2,
            inviteCode: 'F4LVTX',
          },
        },
        roulette: {
          summary: 'Roulette session stats',
          value: {
            sessionId: 'e7fb8887-9739-4aab-8934-df34707d8d98',
            game: 'roulette',
            totalPlayers: 1,
            inviteCode: 'R8K2MP',
          },
        },
      },
    },
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
    schema: {
      examples: {
        prisoner: {
          summary: "Prisoner's Dilemma session details",
          value: {
            id: 'd7fb8887-9739-4aab-8934-df34707d8d98',
            game: 'prisoner',
            inviteCode: 'F4LVTX',
            isActive: true,
          },
        },
        roulette: {
          summary: 'Roulette session details',
          value: {
            id: 'e7fb8887-9739-4aab-8934-df34707d8d98',
            game: 'roulette',
            inviteCode: 'R8K2MP',
            isActive: true,
          },
        },
      },
    },
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
  @ApiBody({
    type: UpdateSessionDto,
    description: 'Partial payload. All fields are optional.',
    examples: {
      deactivate: {
        summary: 'Deactivate session',
        value: { isActive: false },
      },
      activate: {
        summary: 'Activate session',
        value: { isActive: true },
      },
    },
  })
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
